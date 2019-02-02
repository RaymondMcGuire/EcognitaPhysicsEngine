/* =========================================================================
 *
 *  EEventListenerSystem.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/System.ts" />
/// <reference path="../EUtils/EPhysCommon.ts" />
module EPSE {

    declare var Stats: any;


    export class EEventListenerSystem extends ECS.System {

        stats:any;
        constructor() {
            super("event_listener");
        }


        Execute() {
            super.Execute();
            //FPS計測結果を表示するHTML要素を追加
            if (displayFPS) {

                //FPS計測
                this.stats = new Stats();

                //HTML要素の追加
                document.getElementById(frameID).appendChild(this.stats.domElement);

            }

            //計算開始ボタン・一時停止ボタンのクリックイベントの追加
            if (playButtonID) {

                //ボタンの表示内容を指定
                document.getElementById(playButtonID).innerHTML = "計算開始";
                //マウスクリックイベントの追加
                document.getElementById(playButtonID).addEventListener('mousedown', () => {

                    //初期状態フラグの解除
                    initFlag = false;
                    //一時停止フラグの反転
                    pauseFlag = !pauseFlag;
                    //ボタンの表示内容の変更
                    this.switchButton();

                }, false);

            } else {

                //初期状態フラグの解除
                initFlag = false;
                //一時停止の解除
                pauseFlag = false;

            }


            //リセットボタンのクリックイベントの追加
            if (resetButtonID) {
                document.getElementById(resetButtonID).innerHTML = "初期状態へ戻る";

                document.getElementById(resetButtonID).addEventListener('mousedown',() => {

                    //再計算用フラグを立てる
                    resetFlag = true;
                    //一時停止を立てる
                    pauseFlag = true;
                    //表示するボタンの変更
                    this.switchButton();

                }, false);

            }

            //画面キャプチャ
            if (pictureID) {

                document.getElementById(pictureID).innerHTML = "画面キャプチャ";

            }

        }

        switchButton() {

            //一時停止フラグによる分岐
            if (pauseFlag) {

                var label = (resetFlag) ? "計算開始" : "計算再開";

                document.getElementById(playButtonID).innerHTML = label;
                document.getElementById(pictureID).style.visibility = "visible";

            } else {

                var label = "一時停止";

                document.getElementById(playButtonID).innerHTML = label;
                document.getElementById(pictureID).style.visibility = "hidden";

            }
            //画面キャプチャの生成フラグ
            makePictureFlag = true;
        }
    }
}