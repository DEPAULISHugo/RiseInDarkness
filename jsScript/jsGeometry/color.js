class Color {
    constructor() {
    }

    setHSLValue(H, S, L, A=255){
        this.H = H;
        this.S = S;
        this.L = L;
        this.A = A;
        this.convertHSL2RGB();
    }

    setRGBValue(R, G, B, A=255){
        this.R = R;
        this.G = G;
        this.B = B;
        this.A = A;
        this.convertRGB2HSL();
    }

    convertHSL2RGB(){
        const C = (1 - Math.abs(2.0*this.L - 1)) * this.S;
        const X = C * (1 - Math.abs(((this.H / 60.0) % 2) - 1));
        const m = this.L - C/2;
    
        let Rp;
        let Gp;
        let Bp;
    
        if ( this.H < 60 ){
            Rp = C;
            Gp = X;
            Bp = 0;
        }
        else if ( this.H < 120 ){
            Rp = X;
            Gp = C;
            Bp = 0;
        }
        else if ( this.H < 180 ){
            Rp = 0;
            Gp = C;
            Bp = X;
        }
        else if ( this.H < 240 ){
            Rp = 0;
            Gp = X;
            Bp = C;
        }
        else if ( this.H < 300 ){
            Rp = X;
            Gp = 0;
            Bp = C;
        }
        else{
            Rp = C;
            Gp = 0;
            Bp = X;
        }
    
        this.R = Math.floor((Rp + m)*255);
        this.G = Math.floor((Gp + m)*255);
        this.B = Math.floor((Bp + m)*255);
    }

    convertRGB2HSL(){}
}


//void Color::convertRGB2HSL(){
//    float Rp = R/255;
//    float Gp = G/255;
//    float Bp = B/255;

//    float Cmax = max(Rg, Gp, Bp);
//    float Cmin = min(Rg, Gp, Bp);
//    float delta = Cmax - Cmin;

//    if ( delta == 0.0){
//        H = 0;
//    }
//    else if ( Cmax == Rp ){
//        H = round(60*(((Gp-Bp)/delta)%6));
//    }
//    else if ( Cmax == Gp ){
//        H = round(60*(((Bp-Rp)/delta)+2));
//    }
//    else{
//        H = round(60*(((Rp-Gp)/delta)+4));
//    }

//    if ( delta = 0){
//        S = 0;
//    }
//    else{
//        S = round(delta/(1 - abs(2*L - 1)));
//    }

//    L = round((Cmax + Cmin)/2)

