class Gradient {
    constructor(x=0, y=0, z=0, w=0){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

class SimplexNoise {
    constructor (){
        this.grad3 = [new Gradient(1,1,0), new Gradient(-1,1,0), new Gradient(1,-1,0), new Gradient(-1,-1,0),
                      new Gradient(1,0,1), new Gradient(-1,0,1), new Gradient(1,0,-1), new Gradient(-1,0,-1),
                      new Gradient(0,1,1), new Gradient(0,-1,1), new Gradient(0,1,-1), new Gradient(0,-1,-1)];
        
        this.grad4 = [new Gradient(0,1,1,1), new Gradient(0,1,1,-1), new Gradient(0,1,-1,1), new Gradient(0,1,-1,-1),
                      new Gradient(0,-1,1,1), new Gradient(0,-1,1,-1), new Gradient(0,-1,-1,1), new Gradient(0,-1,-1,-1),
                      new Gradient(1,0,1,1), new Gradient(1,0,1,-1), new Gradient(1,0,-1,1), new Gradient(1,0,-1,-1),
                      new Gradient(-1,0,1,1), new Gradient(-1,0,1,-1), new Gradient(-1,0,-1,1), new Gradient(-1,0,-1,-1),
                      new Gradient(1,1,0,1), new Gradient(1,1,0,-1), new Gradient(1,-1,0,1), new Gradient(1,-1,0,-1),
                      new Gradient(-1,1,0,1), new Gradient(-1,1,0,-1), new Gradient(-1,-1,0,1), new Gradient(-1,-1,0,-1),
                      new Gradient(1,1,1,0), new Gradient(1,1,-1,0), new Gradient(1,-1,1,0), new Gradient(1,-1,-1,0),
                      new Gradient(-1,1,1,0), new Gradient(-1,1,-1,0), new Gradient(-1,-1,1,0), new Gradient(-1,-1,-1,0)];
        
        this.p = [...Array(256).keys()];
        this.p = this.shuffle(this.p);
        
        // To remove the need for index wrapping, GLfloat the permutation table length
        this.perm = [];
        this.permMod12 = [];
        for(let i=0; i<512; i++)
        {
            this.perm[i] = this.p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }

        // Skewing and unskewing factors for 2, 3, and 4 dimensions
        this.F2 = 0.5*(Math.sqrt(3.0)-1.0);
        this.G2 = (3.0-Math.sqrt(3.0))/6.0;
        this.F3 = 1.0/3.0;
        this.G3 = 1.0/6.0;
        this.F4 = (Math.sqrt(5.0)-1.0)/4.0;
        this.G4 = (5.0-Math.sqrt(5.0))/20.0;
    }

    dot(grad, x, y, z=0, w=0) {
        return grad.x*x + grad.y*y + grad.z*z + grad.w*w;
    }

    noise2D(x, y) {
        let n0, n1, n2; // Noise contributions from the three corners

        // Skew the input space to determine which simplex cell we're in
        const s = (x + y) * this.F2; // Hairy factor for 2D
        const i = Math.floor(x+s);
        const j = Math.floor(y+s);
        const t = (i + j) * this.G2;
        const X0 = i-t; // Unskew the cell origin back to (x,y) space
        const Y0 = j-t;
        const x0 = x-X0; // The x,y distances from the cell origin
        const y0 = y-Y0;

        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if ( x0>y0 ) {
            // lower triangle, XY order: (0,0)->(1,0)->(1,1)
            i1=1;
            j1=0;}
        else {
            // upper triangle, YX order: (0,0)->(0,1)->(1,1)
            i1=0;
            j1=1;}

        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        let x1 = x0 - i1 + this.G2; // Offsets for middle corner in (x,y) unskewed coords
        let y1 = y0 - j1 + this.G2;
        let x2 = x0 - 1.0 + 2.0 * this.G2; // Offsets for last corner in (x,y) unskewed coords
        let y2 = y0 - 1.0 + 2.0 * this.G2;
        // Work out the hashed gradient indices of the three simplex corners
        let ii = i & 255;
        let jj = j & 255;
        let gi0 = this.permMod12[ii+this.perm[jj]];
        let gi1 = this.permMod12[ii+i1+this.perm[jj+j1]];
        let gi2 = this.permMod12[ii+1+this.perm[jj+1]];
        // Calculate the contribution from the three corners
        let t0 = 0.5 - x0*x0-y0*y0;
        if (t0 < 0) {
            n0 = 0.0;
        }
        else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient
        }
        let t1 = 0.5 - x1*x1-y1*y1;
        if(t1 < 0) {
            n1 = 0.0;
        }
        else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }
        let t2 = 0.5 - x2*x2-y2*y2;
        if(t2<0) {
            n2 = 0.0;
        }
        else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }

        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70.0 * (n0 + n1 + n2);
    }

    noise3D(x, y, z) {
        let n0, n1, n2, n3; // Noise contributions from the four corners
    
        // Skew the input space to determine which simplex cell we're in
        const s = (x + y + z) * this.F3; // Very nice and simple skew factor for 3D
        const i = Math.floor(x+s);
        const j = Math.floor(y+s);
        const k = Math.floor(z+s);
        const t = (i+j+k)*this.G3;
        const X0 = i-t; // Unskew the cell origin back to (x,y,z) space
        const Y0 = j-t;
        const Z0 = k-t;
        const x0 = x-X0; // The x,y,z distances from the cell origin
        const y0 = y-Y0;
        const z0 = z-Z0;
    
        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        let i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        let i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) {
                // X Y Z order
                i1=1;
                j1=0;
                k1=0;
                i2=1;
                j2=1;
                k2=0;
          }
            else if (x0 >= z0) {
                // X Z Y order
                i1=1;
                j1=0;
                k1=0;
                i2=1;
                j2=0;
                k2=1;
            }
            else {
                // Z X Y order
                i1=0;
                j1=0;
                k1=1;
                i2=1;
                j2=0;
                k2=1;
            }
        }
        else { // x0 < y0
            if (y0<z0) {
                // Z Y X order
                i1=0;
                j1=0;
                k1=1;
                i2=0;
                j2=1;
                k2=1;
            }
            else if (x0<z0) {
                // Y Z X order
                i1=0;
                j1=1;
                k1=0;
                i2=0;
                j2=1;
                k2=1;
            }
            else {
                // Y X Z order
                i1=0;
                j1=1;
                k1=0;
                i2=1;
                j2=1;
                k2=0;
            }
        }
    
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        let x1 = x0 - i1 + this.G3; // Offsets for second corner in (x,y,z) coords
        let y1 = y0 - j1 + this.G3;
        let z1 = z0 - k1 + this.G3;
        let x2 = x0 - i2 + 2.0*this.G3; // Offsets for third corner in (x,y,z) coords
        let y2 = y0 - j2 + 2.0*this.G3;
        let z2 = z0 - k2 + 2.0*this.G3;
        let x3 = x0 - 1.0 + 3.0*this.G3; // Offsets for last corner in (x,y,z) coords
        let y3 = y0 - 1.0 + 3.0*this.G3;
        let z3 = z0 - 1.0 + 3.0*this.G3;
        // Work out the hashed gradient indices of the four simplex corners
        let ii = i & 255;
        let jj = j & 255;
        let kk = k & 255;
        let gi0 = this.permMod12[ii+this.perm[jj+this.perm[kk]]];
        let gi1 = this.permMod12[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]];
        let gi2 = this.permMod12[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]];
        let gi3 = this.permMod12[ii+1+this.perm[jj+1+this.perm[kk+1]]];
        // Calculate the contribution from the four corners
        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
        if (t0<0) {
            n0 = 0.0;
        }
        else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
        }
        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
        if(t1<0) {
            n1 = 0.0;
        }
        else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
        }
        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
        if(t2<0){
            n2 = 0.0;
        }
        else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
        }
        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
        if(t3<0){
            n3 = 0.0;
        }
        else {
            t3 *= t3;
            n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
        }
    
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to stay just inside [-1,1]
        return 32.0*(n0 + n1 + n2 + n3);
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}