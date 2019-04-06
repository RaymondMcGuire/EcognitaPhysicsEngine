/* =========================================================================
 *
 *  RK4_UniformCircularMotion.ts
 *  
 *
 * ========================================================================= */
/// <reference path="../extlib/EMathLib/vector.ts" />
/// <reference path="../lib/Runge_Kutta_method.ts" />
module EPSE {
    export class RK4_UniformCircularMotion extends Runge_Kutta_method {

        private _v0:number;
        private _omega:number;
        private _R:number;
        private _N:number;
        private _data:Array<[number,number]>;
        constructor(R: number = 1.0, omega:number = 2.0*Math.PI/10, T_MAX:number=10, deltaT:number=1.0) {
            super(deltaT);

            this._omega = omega;
            this._R = R;

            this._v0 = this._R * this._omega;
            this._N = T_MAX / this._deltaT;

            this._data = [];
        }

        protected A(r: EMathLib.Vector, t: number, v: EMathLib.Vector){
            //console.log("debug child A...");
            let out = r.mul( - this._omega * this._omega );
            return out;
        }

        Calculate(){
            let r = new EMathLib.Vector(3,[this._R,0,0]);
            let v = new EMathLib.Vector(3,[0,this._v0,0]);
            this._data.push([0,r.at(0)]);

            for (let index = 1; index < this._N; index++) {
                let t = this._deltaT * index;
                let result = this.RK4( r, t, v );
                r = r.add( result.r );
                v = v.add( result.v );
                this._data.push([t, r.at(0)]);
            }
        }

        data(){return this._data;}

    }
}

