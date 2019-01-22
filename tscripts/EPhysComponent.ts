/* =========================================================================
 *
 *  EPhysComponent.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="./ECS/Component.ts" />
/// <reference path="./EPhysCommon.ts" />
module EPSE {
    declare var THREE: any;

    export class EPhysComponent extends ECS.Component {

        r: any;
        v: any;
        a: any;
        e: number;
        mass: number;
        r_1: any;
        r_2: any;

        constructor() {

            super("physics_component");

            //coefficient
            this.r = new THREE.Vector3();
            this.v = new THREE.Vector3();
            this.a = new THREE.Vector3();
            this.e = 1.0; //coefficient of restitution
            this.mass = 1.0;
            this.r_1 = new THREE.Vector3();
            this.r_2 = new THREE.Vector3();
        }

        //mechanical energy calculation
        getEnergy() {

            var v2 = this.v.lengthSq();

            var kinetic = 1 / 2 * this.mass * v2;

            var z = ( this.step === 0 )? this.r.z : this.r_1.z;

            var potential = this.mass * g * z;

            return { kinetic: kinetic, potential: potential };
        }

        //time evolution based on Verlet algorithm
        computeTimeEvolution( dt:number ) {

            var x_ = this.r.x;
            var y_ = this.r.y;
            var z_ = this.r.z;
        
            //（ x_{n+1} = 2x_n - x_{n_1} + a_{n}\Delta t^2 ）
            this.r.x  = 2 * this.r.x - this.r_1.x + this.a.x * dt * dt;
            this.r.y  = 2 * this.r.y - this.r_1.y + this.a.y * dt * dt;
            this.r.z  = 2 * this.r.z - this.r_1.z + this.a.z * dt * dt;
        
            this.v.x = (this.r.x - this.r_1.x) / (2 * dt);
            this.v.y = (this.r.y - this.r_1.y) / (2 * dt);
            this.v.z = (this.r.z - this.r_1.z) / (2 * dt);
        
            this.r_2.x = this.r_1.x;
            this.r_2.y = this.r_1.y;
            this.r_2.z = this.r_1.z;
        
            this.r_1.x = x_;
            this.r_1.y = y_;
            this.r_1.z = z_;
        }

        getForce() {
            var  f = new THREE.Vector3( 0, 0, - this.mass * g );
            return f;
        }
    }
}