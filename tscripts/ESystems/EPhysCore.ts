/* =========================================================================
 *
 *  EPhysCore.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/System.ts" />
/// <reference path="../EUtils/EPhysCommon.ts" />
/// <reference path="./E3DSystem.ts" />
/// <reference path="./EEventListenerSystem.ts" />
module EPSE {

    export class EPhysCore extends ECS.System {

        step: number;
        objects: any;

        three_system: E3DSystem;
        event_listener_system: EEventListenerSystem;

        constructor() {
            super("system_core");

            this.step = 0;
            this.objects = [];

            this.three_system = new E3DSystem();
            this.event_listener_system = new EEventListenerSystem();
        }

        Execute() {
            super.Execute();
            this.event_listener_system.Execute();
            this.three_system.Execute();
            for (let i = 0; i < this.objects.length; i++) {
                this.createPhysObject(this.objects[i]);
            }
            this.loop();
        }

        createPhysObject(physObject: any) {

            physObject.create();

            if (physObject.draggable) {
                this.three_system.draggableObjects.push(physObject.CG);
            }
        }

        checkFlags() {

            if (resetFlag) {

                for (let i = 0; i < this.objects.length; i++) {

                    if (this.objects[i].c_physics.data.x.length == 0) continue;

                    this.objects[i].c_physics.r.x = this.objects[i].c_physics.data.x[0][1];
                    this.objects[i].c_physics.r.y = this.objects[i].c_physics.data.y[0][1];
                    this.objects[i].c_physics.r.z = this.objects[i].c_physics.data.z[0][1];

                    this.objects[i].c_physics.v.x = this.objects[i].c_physics.data.vx[0][1];
                    this.objects[i].c_physics.v.y = this.objects[i].c_physics.data.vy[0][1];
                    this.objects[i].c_physics.v.z = this.objects[i].c_physics.data.vz[0][1];

                    this.objects[i].allowDrag = this.objects[i].draggable;
                    this.objects[i].c_physics.step = 0;

                    this.objects[i].resetParameter();
                }


                resetFlag = false;
                pauseFlag = true;
                makePictureFlag = true;
                initFlag = true;

                this.step = 0;
                allowDrag = draggable;

            }

        }

        timeEvolution() {
            if (pauseFlag) return;

            for (let i = 0; i < skipRendering; i++) {
                this.step++;

                for (let j = 0; j < this.objects.length; j++) {
                    if (!this.objects[j].c_physics.dynamic) continue;
                    this.objects[j].allowDrag = false;
                    for (let k = this.objects[j].c_physics.step; k <= this.step; k++) {
                        //console.log(this.objects[j].c_physics.dynamic);
                        this.objects[j].c_physics.timeEvolution();
                    }
                }
            }
        }

        makePicture() {

            if (!makePictureFlag) return;
            if (pictureID) {
                //canvas->DataURL
                (<any>document.getElementById(pictureID)).href = CG.renderer.domElement.toDataURL("image/png");

                let time = delta_t * this.step;
                (<any>document.getElementById(pictureID)).download = time.toFixed(2) + ".png";

            }
            makePictureFlag = false;
        }

        loop() {

            CG.trackball.update();

            //FPS
            if (this.event_listener_system.stats) this.event_listener_system.stats.update();

            this.checkFlags();

            this.timeEvolution();

            for (let i = 0; i < this.objects.length; i++) {

                this.objects[i].update();

            }

            CG.renderer.render(CG.scene, CG.camera);

            this.makePicture();

            requestAnimationFrame(
                this.loop.bind(this)
            );
        }
    }
}