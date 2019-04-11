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
    declare let $: any;

    export class EEventListenerSystem extends ECS.System {

        stats: any;
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
                $("#" + playButtonID).button({
                    text: false,
                    label: "start",
                    icons: {
                        primary: "ui-icon-play"
                    }
                }).click(() => {
                    initFlag = false;
                    pauseFlag = !pauseFlag;
                    this.switchButton();
                });

            } else {

                initFlag = false;
                pauseFlag = false;

            }

            if (resetButtonID) {
                $("#" + resetButtonID).button({
                    text: false,
                    label: "reset",
                    icons: {
                        primary: "ui-icon-stop"
                    }

                }).click(() => {
                    resetFlag = true;
                    pauseFlag = true;
                    this.switchButton();
                });
            }

            if (pictureID) {

                $("#" + pictureID).button({
                    label: "capture",
                    text: false,
                    icons: {
                        primary: "ui-icon-image"
                    }

                }).click(() => {

                    makePictureFlag = true;

                });

            }

        }

        switchButton() {

            if (pauseFlag) {

                let label = (resetFlag) ? "start" : "restart";

                $("#" + playButtonID).button(
                    "option", {
                        label: label,
                        icons: { primary: "ui-icon-play" }
                    }
                );

                $("#" + pictureID).css('visibility', 'visible');

            } else {

                let label = "pause";

                $("#" + playButtonID).button(
                    "option", {
                        label: label,
                        icons: { primary: "ui-icon-pause" }
                    }
                );

                $("#" + pictureID).css('visibility', 'hidden');

            }

            makePictureFlag = true;
        }
    }
}