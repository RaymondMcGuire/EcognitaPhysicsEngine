/* =========================================================================
 *
 *  Euler_method.ts
 *  
 *
 * ========================================================================= */
/// <reference path="../extlib/EMathLib/vector.ts" />
module EPSE {
    export class Euler_method {

        private _deltaT:number;
        private _v0:number;
        private _omega:number;
        private _R:number;
        private _N:number;
        private _data:Array<[number,number]>;
        constructor(R: number = 1.0, omega:number = 2.0*Math.PI/10, T_MAX:number=10, DeltaT:number=1.0) {
            this._omega = omega;
            this._R = R;

            this._v0 = this._R * this._omega;
            this._deltaT = DeltaT;
            this._N = T_MAX / this._deltaT;

            this._data = [];
        }

        private _acceleration(r:EMathLib.Vector){
            //Uniform Circular Motion
            //a(t) = -omega^2 * r(t)
            return r.mul(-this._omega*this._omega);
        }

        Calculate(){
            let r = new EMathLib.Vector(3,[this._R,0,0]);
            let v = new EMathLib.Vector(3,[0,this._v0,0]);
            this._data.push([0,r.at(0)]);

            for (let index = 1; index < this._N; index++) {
                let t = this._deltaT * index;
                r = r.add(v.mul(this._deltaT));
                let a = this._acceleration(r);
                v = v.add(a.mul(this._deltaT));

                this._data.push([t,r.at(0)]);
            }
        }

        data(){return this._data;}

    }
}

