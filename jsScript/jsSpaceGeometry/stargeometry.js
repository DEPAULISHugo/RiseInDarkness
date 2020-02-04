// import * as THREE from 'jsScript/jsLibrairies/three.js';
// import SpaceOrbGeometry from 'jsScript/jsSpaceGeometry/spaceorbgeometry.js'
// import Color from 'jsScript/jsGeometry/color.js'

class StarGeometry extends SpaceOrbGeometry{

    constructor () {        
        
        super();

        const icosphere = new Icosphere(1, 4);

        // Geometry
        this.geometry = new THREE.BufferGeometry();				
        this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( icosphere.vertices, 3 ) ); // itemSize = 3 because there are 3 values (components) per vertex
        this.geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( icosphere.normals, 3 ) );    // itemSize = 3 because there are 3 values (components) per normal
        this.geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( icosphere.texCoords, 2 ) );      // itemSize = 2 because there are 2 values (components) per uv
        this.geometry.setIndex(icosphere.indices);

        // Texture
        this.textureAsURL = this.createTexture();

        // Material
        const loadedTexture = new THREE.TextureLoader().load( this.textureAsURL );
        this.material = new THREE.MeshBasicMaterial({map: loadedTexture});

        // Mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    getColor(pixel, points, S, T) {

        const indices = this.modelIco.indices;
        const vertices = this.modelIco.vertices;

        let color = new Color();

        if ((pixel.x > 11*S + 1) || (pixel.y > 3*T + 1)){
            color.setRGBValue(255, 255, 255);
            return color;
        }

        for (let k = 0; k < indices.length; k += 3){

            if (pixel.isInTriagnle(points[indices[k]], points[indices[k+1]], points[indices[k+2]])){
                let position = this.interPolatePosition(pixel, indices[k], indices[k+1], indices[k+2], points, vertices);
                let dist = Math.sqrt(position.x*position.x + position.y*position.y + position.z*position.z);
                position.x = position.x/dist;
                position.y = position.y/dist;
                position.z = position.z/dist;
                const noiseValue0 = this.simplexNoise1.noise3D(position.x, position.y, position.z);
                const noiseValue1 = this.simplexNoise2.noise3D(position.x * 2, position.y * 2, position.z * 2);
                const noiseValue2 = this.simplexNoise3.noise3D(position.x * 3, position.y * 3, position.z * 3);
                const noiseValue3 = this.simplexNoise4.noise3D(position.x * 4, position.y * 4, position.z * 4);
                const totalNoiseValue = noiseValue0 + noiseValue1*0.5 + noiseValue2*0.25 + noiseValue3*0.125;
                let H = 200;
                let S = 1.0;
                let L = (60 + (40.0*totalNoiseValue)/1.5)/100.0;
                color.setHSLValue(H, S, L);
                return color;
            }
        }
        color.setRGBValue(255, 255, 255);
        return color;
    }

}