class Icosphere {

    constructor(radius, subdivision){
        this.radius = radius;
        this.subdivision = subdivision;
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];
        this.lineIndices = [];
        this.interleavedVertices = [];
        this.buildVertices();
    }

    buildVertices(){
        const S_STEP = 186 / 2048.0;     // horizontal texture step
        const T_STEP = 322 / 1024.0;     // vertical texture step

        // compute 12 vertices of icosahedron
        let tmpVertices = this.computeIcosahedronVertices();

        // clear memory of prev arrays
        this.vertices.length = 0;
        this.normals.length = 0;
        this.texCoords.length = 0;
        this.indices.length = 0;
        this.lineIndices.length = 0;

        let v0 = []; let v1 = []; let v2 = []; let v3 = []; let v4 = []; let v11 = [];    // vertex positions [3]
        let n = [0, 0, 0]                     // face normal                                      
        let t0 = []; let t1 = []; let t2 = []; let t3 = []; let t4 = []; let t11 = [];    // texCoords [2]
        let index = 0;

        // compute and add 20 tiangles of icosahedron first
        v0 = tmpVertices.slice(0, 3);       // 1st vertex
        v11 = tmpVertices.slice(11 * 3, 12 * 3); // 12th vertex
        for(let i = 1; i <= 5; ++i) {

            // 4 vertices in the 2nd row
            v1 = tmpVertices.slice(i * 3, (i+1) * 3);

            if (i < 5) {v2 = tmpVertices.slice((i+1) * 3, (i+2) * 3);}                
            else {v2 = tmpVertices.slice(3, 6);}
                
            v3 = tmpVertices.slice((i + 5) * 3, (i + 6) * 3);

            if ((i + 5) < 10) {v4 = tmpVertices.slice((i + 6) * 3, (i + 7) * 3);}
            else {v4 = tmpVertices.slice(6 * 3, 7 * 3);}
                
            // texture coords
            t0[0] = (2 * i - 1) * S_STEP;   t0[1] = 0;
            t1[0] = (2 * i - 2) * S_STEP;   t1[1] = T_STEP;
            t2[0] = (2 * i - 0) * S_STEP;   t2[1] = T_STEP;
            t3[0] = (2 * i - 1) * S_STEP;   t3[1] = T_STEP * 2;
            t4[0] = (2 * i + 1) * S_STEP;   t4[1] = T_STEP * 2;
            t11[0]= 2 * i * S_STEP;         t11[1]= T_STEP * 3;

            // add a triangle in 1st row
            n = this.computeFaceNormal(v0, v1, v2);   
            this.addVertices(v0, v1, v2);
            this.addNormals(n, n, n);
            this.addTexCoords(t0, t1, t2);
            this.addIndices(index, index+1, index+2);

            // add 2 triangles in 2nd row
            n = this.computeFaceNormal(v1, v3, v2);
            this.addVertices(v1, v3, v2);
            this.addNormals(n, n, n);
            this.addTexCoords(t1, t3, t2);
            this.addIndices(index+3, index+4, index+5);

            n = this.computeFaceNormal(v2, v3, v4);
            this.addVertices(v2, v3, v4);
            this.addNormals(n, n, n);
            this.addTexCoords(t2, t3, t4);
            this.addIndices(index+6, index+7, index+8);

            // add a triangle in 3rd row
            n = this.computeFaceNormal(v3, v11, v4);
            this.addVertices(v3, v11, v4);
            this.addNormals(n, n, n);
            this.addTexCoords(t3, t11, t4);
            this.addIndices(index+9, index+10, index+11);

            // add 6 edge lines per iteration
            //  i
            //  /   /   /   /   /       : (i, i+1)                              //
            // /__ /__ /__ /__ /__                                              //
            // \  /\  /\  /\  /\  /     : (i+3, i+4), (i+3, i+5), (i+4, i+5)    //
            //  \/__\/__\/__\/__\/__                                            //
            //   \   \   \   \   \      : (i+9,i+10), (i+9, i+11)               //
            //    \   \   \   \   \                                             //
            this.lineIndices.push(index);       // (i, i+1)
            this.lineIndices.push(index+1);       // (i, i+1)
            this.lineIndices.push(index+3);     // (i+3, i+4)
            this.lineIndices.push(index+4);
            this.lineIndices.push(index+3);     // (i+3, i+5)
            this.lineIndices.push(index+5);
            this.lineIndices.push(index+4);     // (i+4, i+5)
            this.lineIndices.push(index+5);
            this.lineIndices.push(index+9);     // (i+9, i+10)
            this.lineIndices.push(index+10);
            this.lineIndices.push(index+9);     // (i+9, i+11)
            this.lineIndices.push(index+11);

            // next index
            index += 12;
        }

        console.log("Init stage: " + this.vertices.length/3 + " vertices");

        // subdivide icosahedron
        this.subdivideVerticesFlat();

        // generate interleaved vertex array as well
        this.buildInterleavedVertices();
    }

    computeIcosahedronVertices(){

        const H_ANGLE = Math.PI / 180 * 72;    // 72 degree = 360 / 5
        const V_ANGLE = Math.atan(1.0 / 2);    // elevation = 26.565 degree
    
        let vertices = [];    // 12 vertices
        let i1, i2;                             // indices
        let z, xy;                              // coords
        let hAngle1 = -Math.PI / 2 - H_ANGLE / 2;  // start from -126 deg at 2nd row
        let hAngle2 = -Math.PI / 2;                // start from -90 deg at 3rd row
    
        // the first top vertex (0, 0, r)
        vertices[0] = 0;
        vertices[1] = 0;
        vertices[2] = this.radius;
    
        // 10 vertices at 2nd and 3rd rows
        for (let i = 1; i <= 5; ++i) {
            i1 = i * 3;         // for 2nd row
            i2 = (i + 5) * 3;   // for 3rd row
    
            z = this.radius * Math.sin(V_ANGLE);             // elevaton
            xy = this.radius * Math.cos(V_ANGLE);
    
            vertices[i1] = xy * Math.cos(hAngle1);      // x
            vertices[i2] = xy * Math.cos(hAngle2);
            vertices[i1 + 1] = xy * Math.sin(hAngle1);  // y
            vertices[i2 + 1] = xy * Math.sin(hAngle2);
            vertices[i1 + 2] = z;                       // z
            vertices[i2 + 2] = -z;
    
            // next horizontal angles
            hAngle1 += H_ANGLE;
            hAngle2 += H_ANGLE;
        }
    
        // the last bottom vertex (0, 0, -r)
        i1 = 11 * 3;
        vertices[i1] = 0;
        vertices[i1 + 1] = 0;
        vertices[i1 + 2] = -this.radius;
    
        return vertices;
    }

    computeFaceNormal(v1, v2, v3){
        const EPSILON = 0.000001;

        // default return value (0, 0, 0)
        let n = [0, 0, 0];

        // find 2 edge vectors: v1-v2, v1-v3
        let ex1 = v2[0] - v1[0];
        let ey1 = v2[1] - v1[1];
        let ez1 = v2[2] - v1[2];
        let ex2 = v3[0] - v1[0];
        let ey2 = v3[1] - v1[1];
        let ez2 = v3[2] - v1[2];

        // cross product: e1 x e2
        let nx, ny, nz;
        nx = ey1 * ez2 - ez1 * ey2;
        ny = ez1 * ex2 - ex1 * ez2;
        nz = ex1 * ey2 - ey1 * ex2;

        // normalize only if the length is > 0
        const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if(length > EPSILON)
        {
            // normalize
            const lengthInv = 1.0 / length;
            n[0] = nx * lengthInv;
            n[1] = ny * lengthInv;
            n[2] = nz * lengthInv;
        }
        return n;
    }

    addVertices(v1, v2, v3) {
        this.vertices.push(v1[0]);  // x
        this.vertices.push(v1[1]);  // y
        this.vertices.push(v1[2]);  // z
        this.vertices.push(v2[0]);
        this.vertices.push(v2[1]);
        this.vertices.push(v2[2]);
        this.vertices.push(v3[0]);
        this.vertices.push(v3[1]);
        this.vertices.push(v3[2]);
    }

    addNormals(n1, n2, n3){
        this.normals.push(n1[0]);  // nx
        this.normals.push(n1[1]);  // ny
        this.normals.push(n1[2]);  // nz
        this.normals.push(n2[0]);
        this.normals.push(n2[1]);
        this.normals.push(n2[2]);
        this.normals.push(n3[0]);
        this.normals.push(n3[1]);
        this.normals.push(n3[2]);
    }

    addTexCoords(t1, t2, t3){
        this.texCoords.push(t1[0]); // s
        this.texCoords.push(t1[1]); // t
        this.texCoords.push(t2[0]);
        this.texCoords.push(t2[1]);
        this.texCoords.push(t3[0]);
        this.texCoords.push(t3[1]);
    }

    addIndices(i1, i2, i3) {
        this.indices.push(i1);
        this.indices.push(i2);
        this.indices.push(i3);
    }

    subdivideVerticesFlat() {
        let tmpVertices = [];
        let tmpTexCoords = [];
        let tmpIndices = [];
        let indexCount;
        let v1 = []; let v2 = []; let v3 = [];          // ptr to original vertices of a triangle [3]
        let t1 = []; let t2 = []; let t3 = [];          // ptr to original texcoords of a triangle [2]
        let newV1 = []; let newV2 = []; let newV3 = []; // new vertex positions
        let newT1 = []; let newT2 = []; let newT3 = []; // new texture coords
        let normal = [];                    // new face normal
        let index = 0;             // new index value
        let i, j;

        // iteration
        for (i = 1; i <= this.subdivision; ++i) {

            // copy prev arrays
            tmpVertices = [...this.vertices];
            tmpTexCoords = [...this.texCoords];
            tmpIndices = [...this.indices];

            // clear prev arrays
            this.vertices.length = 0;
            this.normals.length = 0;
            this.texCoords.length = 0;
            this.indices.length = 0;
            this.lineIndices.length = 0;

            index = 0;
            indexCount = tmpIndices.length;
            for (j = 0; j < indexCount; j += 3) {
                // get 3 vertice and texcoords of a triangle
                v1 = tmpVertices.slice(tmpIndices[j] * 3, (tmpIndices[j]+1) * 3);
                v2 = tmpVertices.slice(tmpIndices[j + 1] * 3, (tmpIndices[j + 1]+1) * 3);
                v3 = tmpVertices.slice(tmpIndices[j + 2] * 3, (tmpIndices[j + 2]+1) * 3);
                t1 = tmpTexCoords.slice(tmpIndices[j] * 2, (tmpIndices[j]+1) * 2);
                t2 = tmpTexCoords.slice(tmpIndices[j + 1] * 2, (tmpIndices[j + 1]+1) * 2);
                t3 = tmpTexCoords.slice(tmpIndices[j + 2] * 2, (tmpIndices[j + 2]+1) * 2);

                // get 3 new vertices by spliting half on each edge
                newV1 = this.computeHalfVertex(v1, v2);
                newV2 = this.computeHalfVertex(v2, v3);
                newV3 = this.computeHalfVertex(v1, v3);
                newT1 = this.computeHalfTexCoord(t1, t2);
                newT2 = this.computeHalfTexCoord(t2, t3);
                newT3 = this.computeHalfTexCoord(t1, t3);

                // add 4 new triangles
                this.addVertices(v1, newV1, newV3);
                this.addTexCoords(t1, newT1, newT3);
                normal = this.computeFaceNormal(v1, newV1, newV3);
                this.addNormals(normal, normal, normal);
                this.addIndices(index, index+1, index+2);

                this.addVertices(newV1, v2, newV2);
                this.addTexCoords(newT1, t2, newT2);
                normal = this.computeFaceNormal(newV1, v2, newV2);
                this.addNormals(normal, normal, normal);
                this.addIndices(index+3, index+4, index+5);

                this.addVertices(newV1, newV2, newV3);
                this.addTexCoords(newT1, newT2, newT3);
                normal = this.computeFaceNormal(newV1, newV2, newV3);
                this.addNormals(normal, normal, normal);
                this.addIndices(index+6, index+7, index+8);

                this.addVertices(newV3, newV2, v3);
                this.addTexCoords(newT3, newT2, t3);
                normal = this.computeFaceNormal(newV3, newV2, v3);
                this.addNormals(normal, normal, normal);
                this.addIndices(index+9, index+10, index+11);

                // add new line indices per iteration
                this.addSubLineIndices(index, index+1, index+4, index+5, index+11, index+9); //CCW

                // next index
                index += 12;

            }
            console.log("Subdivision " + i + ": " + this.vertices.length/3 + " vertices");
        }
    }

    computeHalfVertex(v1, v2) {

        let newV = [0, 0, 0];

        newV[0] = v1[0] + v2[0];
        newV[1] = v1[1] + v2[1];
        newV[2] = v1[2] + v2[2];
        
        let scale = this.computeScaleForLength(newV);
        
        newV[0] *= scale;
        newV[1] *= scale;
        newV[2] *= scale;

        return newV;
    }

    computeScaleForLength(v) {
        // and normalize the vector then re-scale to new radius
        return this.radius / Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    }

    computeHalfTexCoord(t1, t2) {
        let newT0 = (t1[0] + t2[0]) * 0.5;
        let newT1 = (t1[1] + t2[1]) * 0.5;
        return [newT0, newT1];
    }

    addSubLineIndices(i1, i2, i3, i4, i5, i6) {
        this.lineIndices.push(i1);      // i1 - i2
        this.lineIndices.push(i2);
        this.lineIndices.push(i2);      // i2 - i6
        this.lineIndices.push(i6);
        this.lineIndices.push(i2);      // i2 - i3
        this.lineIndices.push(i3);
        this.lineIndices.push(i2);      // i2 - i4
        this.lineIndices.push(i4);
        this.lineIndices.push(i6);      // i6 - i4
        this.lineIndices.push(i4);
        this.lineIndices.push(i3);      // i3 - i4
        this.lineIndices.push(i4);
        this.lineIndices.push(i4);      // i4 - i5
        this.lineIndices.push(i5);
    }

    buildInterleavedVertices() {
        this.interleavedVertices.length = 0;

        let i, j;
        const count = this.vertices.length;
        for(i = 0, j = 0; i < count; i += 3, j += 2) {

            this.interleavedVertices.push(this.vertices[i]);
            this.interleavedVertices.push(this.vertices[i+1]);
            this.interleavedVertices.push(this.vertices[i+2]);

            this.interleavedVertices.push(this.normals[i]);
            this.interleavedVertices.push(this.normals[i+1]);
            this.interleavedVertices.push(this.normals[i+2]);

            this.interleavedVertices.push(this.texCoords[j]);
            this.interleavedVertices.push(this.texCoords[j+1]);
        }
    }
}
   