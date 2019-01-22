/* =========================================================================
 *
 *  EPhysComponent.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
/// <reference path="../EPhysCommon.ts" />
module EPSE {
    declare var THREE: any;

    export class EPhysComponent extends ECS.Component {

        step: number;

        r: any;
        v: any;
        a: any;
        e: number;
        mass: number;
        r_1: any;
        r_2: any;

        data:any;
        dynamic: boolean;
        recordData: boolean;
        skipRecord: number;

        constructor() {

            super("physics");

            this.step = 0;

            //coefficient
            this.r = new THREE.Vector3();
            this.v = new THREE.Vector3();
            this.a = new THREE.Vector3();
            this.e = 1.0; //coefficient of restitution
            this.mass = 1.0;
            this.r_1 = new THREE.Vector3();
            this.r_2 = new THREE.Vector3();

            //record data
            this.recordData = false;
            this.dynamic = false;
            this.skipRecord = 100;

            this.data = {};
            this.data.x = [];  
            this.data.y = [];  
            this.data.z = [];  
            this.data.vx = []; 
            this.data.vy = []; 
            this.data.vz = []; 
            this.data.kinetic = [];   
            this.data.potential = []; 
            this.data.energy = [];   
        }

        getForce() {
            var  f = new THREE.Vector3( 0, 0, - this.mass * g );
            return f;
        }

        //mechanical energy calculation
        getEnergy() {

            var v2 = this.v.lengthSq();

            var kinetic = 1 / 2 * this.mass * v2;

            var z = ( this.step === 0 )? this.r.z : this.r_1.z;

            var potential = this.mass * g * z;

            return { kinetic: kinetic, potential: potential };
        }

        timeEvolution() {

            this.step++;
            //time interval
            var dt = delta_t;
            var f = this.getForce();
    
            //update acceration
            this.a.x = f.x / this.mass;
            this.a.y = f.y / this.mass;
            this.a.z = f.z / this.mass;
    
            //Verlet algorithm
            this.computeTimeEvolution(dt);
    
            //record data
            this.recordDynamicData();
        }

        //Verlet algorithm(initial condition)
        computeInitialCondition() {
            var dt = delta_t;

            var f = this.getForce();

            this.a = f.clone().divideScalar(this.mass);
        
            //「x_{-1}」
            this.r_1.x = this.r.x - this.v.x * dt + 1 / 2 * this.a.x * dt * dt;
            this.r_1.y = this.r.y - this.v.y * dt + 1 / 2 * this.a.y * dt * dt;
            this.r_1.z = this.r.z - this.v.z * dt + 1 / 2 * this.a.z * dt * dt;
        
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

        initDynamicData() {

            this.data.x = []; 
            this.data.y = []; 
            this.data.z = []; 
            this.data.vx = []; 
            this.data.vy = []; 
            this.data.vz = []; 
            this.data.kinetic = []; 
            this.data.potential = []; 
            this.data.energy = []; 
        }
        
        recordDynamicData() {
        
                if (!this.recordData) return
        
                if ((this.step == 0) || (this.step / this.skipRecord > this.data.x.length)) {
                    var step, x, y, z;
                    
                    if (this.step == 0 || (!this.dynamic)) {
                        step = this.step;
                        x = this.r.x;
                        y = this.r.y;
                        z = this.r.z;
                    } else {
                        step = this.step - 1;
                        x = this.r_1.x;
                        y = this.r_1.y;
                        z = this.r_1.z;
                    }

                    var time = step * delta_t;
        
                    this.data.x.push([time, x]); 
                    this.data.y.push([time, y]); 
                    this.data.z.push([time, z]); 
        
                    this.data.vx.push([time, this.v.x]); //vx
                    this.data.vy.push([time, this.v.y]); //vy
                    this.data.vz.push([time, this.v.z]); //vz
        
                    var energy = this.getEnergy();
                    this.data.kinetic.push([time, energy.kinetic]);
                    this.data.potential.push([time, energy.potential]);
                    this.data.energy.push([time, energy.kinetic + energy.potential]);
                }
        
            }
    }
}