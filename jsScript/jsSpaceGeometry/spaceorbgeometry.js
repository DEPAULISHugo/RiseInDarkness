// import Icosphere from 'jsScript/jsGeometry/icosphere.js'; 
// import {Coordinates2D, Coordinates3D} from 'jsScript/jsGeometry/coordiantes.js';
// import SimplexNoise from 'jsScript/jsGeometry/simplexnoise.js';

class SpaceOrbGeometry {

    constructor(){
        
        // ModelIco
        this.modelIco = new Icosphere(1, 0);

        // SimplexNoise
        this.simplexNoise1 = new SimplexNoise();
        this.simplexNoise2 = new SimplexNoise();
        this.simplexNoise3 = new SimplexNoise();
        this.simplexNoise4 = new SimplexNoise();
    }

    createTexture(width=2048, height=1024) {

        // Create a canvas element
        let canvas = document.createElement('canvas');
        canvas.height=height;
        canvas.width=width;
        const S = width/11;
        const T = height/3;

        // Get the context to manipulate the image
        let context = canvas.getContext("2d");

        // Create a new imageData.
        let imageData=context.createImageData(width, height);
        let data=imageData.data;

        let points = this.getTexCoordsAsPoints(width, height);

        for (var i=0; i<height*width; i++) {
            const pixel = new Coordinates2D(i % width, Math.floor(i/width));
            const color = this.getColor(pixel, points, S, T);
            data[i*4+0] = color.R; // Red
            data[i*4+1] = color.G; // Green
            data[i*4+2] = color.B; // Blue
            data[i*4+3] = color.A; // alpha (transparency)
        }
        
        // Put the image in the context
        context.putImageData(imageData, 0, 0); // at coords 0,0

        // Translate into dataRRL
        return canvas.toDataURL("image/png");
    }

    interPolatePosition(pointM, a, b, c, points, vertices){

        const pointA = points[a];
        const pointB = points[b];
        const pointC = points[c];
    
        const pointAp = Coordinates2D.getIntersection(pointM, pointA, pointB, pointC);
        const pointBp = Coordinates2D.getIntersection(pointM, pointB, pointA, pointC);
        const pointCp = Coordinates2D.getIntersection(pointM, pointC, pointA, pointB);
    
        const tA = pointA.distance(pointM)/pointA.distance(pointAp); // t = AM/AA'
        const tB = pointB.distance(pointM)/pointB.distance(pointBp); // t = BM/BB'
        const tC = pointC.distance(pointM)/pointC.distance(pointCp); // t = CM/CC'
    
        const X = (1 - tA) * vertices[3*a]   + (1 - tB) * vertices[3*b]   + (1 - tC) * vertices[3*c];
        const Y = (1 - tA) * vertices[3*a+1] + (1 - tB) * vertices[3*b+1] + (1 - tC) * vertices[3*c+1];
        const Z = (1 - tA) * vertices[3*a+2] + (1 - tB) * vertices[3*b+2] + (1 - tC) * vertices[3*c+2];
    
        return new Coordinates3D(X, Y, Z);
    }

    getTexCoordsAsPoints(width, height) {
        let points = [];
        for (let i = 0; i < this.modelIco.texCoords.length; i += 2){
            points.push(new Coordinates2D(this.modelIco.texCoords[i] * width, this.modelIco.texCoords[i+1] * height));
        }
        return points;
    }

    display(scene) {
        scene.add(this.mesh);
    }

}







