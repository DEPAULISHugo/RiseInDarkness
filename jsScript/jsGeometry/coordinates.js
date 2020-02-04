class Coordinates2D {

    constructor(X, Y) {
        this.x = X;
        this.y = Y;
    }

    distance(otherPosition) {
        const dX = this.x - otherPosition.x;
        const dY = this.y - otherPosition.y;
        return Math.sqrt(dX*dX + dY*dY);
    }

    isInTriagnle(a, b, c) {
        const as_x = Math.floor(this.x - a.x);
        const as_y = Math.floor(this.y - a.y);

        const s_ab = (b.x - a.x)*as_y - (b.y - a.y)*as_x > 0;

        if ((c.x - a.x)*as_y - (c.y - a.y)*as_x > 0 == s_ab){
            return false;
        }

        if ((c.x - b.x)*(this.y - b.y) - (c.y - b.y)*(this.x - b.x) > 0 != s_ab){
            return false;
        }

        return true;
    }

    getKNearestPoints(k, points) {
        let nearestPointsIndices = [];
        let distances = [];
        for (let i = 0; i < k; i++) {
            nearestPointsIndices.push(i);
            distances.push(this.distance(points[i]));
        }
        for (let i = k; i < points.length; i++){
            for (let j = 0; j < k; j++){
                if (this.distance(points[i]) < distances[j]){
                    nearestPointsIndices[j] = i;
                    distances[j] = this.distance(points[i]);
                    break;
                }
            }
        }
        return nearestPointsIndices;
    }

    getSlope(otherPoint){
        return (otherPoint.y - this.y) / (otherPoint.x - this.x);
    }

    getIntercept(otherPoint){
        const slope = this.getSlope(otherPoint);
        return this.y - slope * this.x;
    }

    static getIntersection(pointA, pointB, pointC, pointD){
        if (pointA.x != pointB.x && pointC.x != pointD.x){
            const a1 = pointA.getSlope(pointB);
            const b1 = pointA.getIntercept(pointB);
            const a2 = pointC.getSlope(pointD);
            const b2 = pointC.getIntercept(pointD);
    
            const xIntersection = (b2 - b1)/(a1 - a2);
            const yIntersection = a1 * xIntersection + b1;
    
            return new Coordinates2D(xIntersection, yIntersection);
        }
        else{
            return new Coordinates2D((pointC.x + pointD.x)/2, (pointC.y + pointD.y)/2);
        }
    }

}

class Coordinates3D {

    constructor(X, Y, Z) {
        this.x = X;
        this.y = Y;
        this.z = Z;
    }

    distance(otherPosition){
        const dX = this.x - otherPosition.x;
        const dY = this.y - otherPosition.y;
        const dZ = this.z - otherPosition.z;
        return Math.sqrt(dX*dX + dY*dY + dZ*dZ);
    }
}









