/* =========================================================================
 *
 *  Runge_Kutta_method.ts
 *  
 *
 * ========================================================================= */
/// <reference path="../extlib/EMathLib/vector.ts" />
module EPSE {
    export class Runge_Kutta_method {

        protected _deltaT: number;
        protected _r: EMathLib.Vector;
        protected _t: number;
        protected _v: EMathLib.Vector;

        constructor(deltaT: number) {this._deltaT = deltaT;}

        protected V(r: EMathLib.Vector, t: number, v: EMathLib.Vector){
            return v.clone();
        }

        protected A(r: EMathLib.Vector, t: number, v: EMathLib.Vector){
            return new EMathLib.Vector(3);
        }

        protected RK4(r: EMathLib.Vector, t: number, v: EMathLib.Vector) {
            this._r = r;
            this._t = t;
            this._v = v;

            let v1 = this.V(this._r,this._t,this._v);
            let a1 = this.A(this._r,this._t,this._v);

            let _v1 = new EMathLib.Vector(3, [this._r.at(0) + v1.at(0) * this._deltaT / 2, this._r.at(1) + v1.at(1) * this._deltaT / 2, this._r.at(2) + v1.at(2) * this._deltaT / 2]);
            let _a1 = new EMathLib.Vector(3, [this._v.at(0) + a1.at(0) * this._deltaT / 2, this._v.at(1) + a1.at(1) * this._deltaT / 2, this._v.at(2) + a1.at(2) * this._deltaT / 2]);

            let v2 = this.V(_v1,this._t+this._deltaT/2,_a1);
            let a2 = this.A(_v1,this._t+this._deltaT/2,_a1);

            let _v2 = new EMathLib.Vector(3, [this._r.at(0) + v2.at(0) * this._deltaT / 2, this._r.at(1) + v2.at(1) * this._deltaT / 2, this._r.at(2) + v2.at(2) * this._deltaT / 2]);
            let _a2 = new EMathLib.Vector(3, [this._v.at(0) + a2.at(0) * this._deltaT / 2, this._v.at(1) + a2.at(1) * this._deltaT / 2, this._v.at(2) + a2.at(2) * this._deltaT / 2]);

            let v3 = this.V(_v2,this._t+this._deltaT/2,_a2);
            let a3 = this.A(_v2,this._t+this._deltaT/2,_a2);

            let _v3 = new EMathLib.Vector(3, [this._r.at(0) + v3.at(0) * this._deltaT, this._r.at(1) + v3.at(1) * this._deltaT, this._r.at(2) + v3.at(2) * this._deltaT]);
            let _a3 = new EMathLib.Vector(3, [this._v.at(0) + a3.at(0) * this._deltaT, this._v.at(1) + a3.at(1) * this._deltaT, this._v.at(2) + a3.at(2) * this._deltaT]);

            let v4 = this.V(_v3,this._t+this._deltaT,_a3);
            let a4 = this.A(_v3,this._t+this._deltaT,_a3);

            let out_r = new EMathLib.Vector(3, [
                this._deltaT / 6 * (v1.at(0) + 2 * v2.at(0) + 2 * v3.at(0) + v4.at(0)),
                this._deltaT / 6 * (v1.at(1) + 2 * v2.at(1) + 2 * v3.at(1) + v4.at(1)),
                this._deltaT / 6 * (v1.at(2) + 2 * v2.at(2) + 2 * v3.at(2) + v4.at(2))
            ]);
            let out_v = new EMathLib.Vector(3, [
                this._deltaT / 6 * (a1.at(0) + 2 * a2.at(0) + 2 * a3.at(0) + a4.at(0)),
                this._deltaT / 6 * (a1.at(1) + 2 * a2.at(1) + 2 * a3.at(1) + a4.at(1)),
                this._deltaT / 6 * (a1.at(2) + 2 * a2.at(2) + 2 * a3.at(2) + a4.at(2))
            ]);

            return { r: out_r, v: out_v };
        }
    }
}

