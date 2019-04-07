/* =========================================================================
 *
 *  EEventListenerSystem.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/System.ts" />
/// <reference path="../EUtils/EPhysCommon.ts" />
module EPSE {

    declare let Stats: any;

    export class EEventListenerSystem extends ECS.System {

        stats:any;
        constructor() {
            super("event_listener");
        }

        Execute() {
            super.Execute();
            if (displayFPS) {
                //FPS
                this.stats = new Stats();

                document.getElementById(frameID).appendChild(this.stats.domElement);
            }

            if (playButtonID) {

                document.getElementById(playButtonID).innerHTML = "start";
                document.getElementById(playButtonID).addEventListener('mousedown', () => {
                    initFlag = false;
                    pauseFlag = !pauseFlag;
                    
                    //change button text
                    this.switchButton();
                }, false);

            } else {

                initFlag = false;
                pauseFlag = false;

            }

            if (resetButtonID) {
                document.getElementById(resetButtonID).innerHTML = "initial condition";

                document.getElementById(resetButtonID).addEventListener('mousedown',() => {

                    resetFlag = true;
                    pauseFlag = true;
                    this.switchButton();

                }, false);

            }

            if (pictureID) {

                document.getElementById(pictureID).innerHTML = "capture";

            }

        }

        switchButton() {

            if (pauseFlag) {

                let label = (resetFlag) ? "start" : "restart";

                document.getElementById(playButtonID).innerHTML = label;
                document.getElementById(pictureID).style.visibility = "visible";

            } else {

                let label = "pause";

                document.getElementById(playButtonID).innerHTML = label;
                document.getElementById(pictureID).style.visibility = "hidden";

            }

            makePictureFlag = true;
        }
    }
}