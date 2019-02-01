/* =========================================================================
 *
 *  E3DSystem.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/System.ts" />
module EPSE {
    declare var THREE: any;

    export class E3DSystem extends ECS.System {

        CG: any;

        frameID: any;
        renderer: any;
        camera: any;
        light: any;
        shadow: any;
        trackball: any;

        constructor() {
            super("three_system");
            this.frameID = "Cvs_EPSE";
            this.CG = {};

            this.renderer = {
                clearColor: 0xFFFFFF, //クリアーカラー（背景色）
                clearAlpha: 1.0,      //クリアーアルファ値（背景色）
                parameters: {         //WebGLRendererクラスのコンストラクタに渡すパラメータ 
                    antialias: true,   //アンチエイリアス（デフォルト：false）
                    stencil: true,     //ステンシルバッファ（デフォルト：true）
                }
            }

            //カメラパラメータ
            this.camera = {
                type: "Perspective",          //カメラの種類（ "Perspective" | "Orthographic"）
                position: { x: 15, y: 0, z: 15 }, //カメラの位置座標
                up: { x: 0, y: 0, z: 1 },   //カメラの上ベクトル
                target: { x: 0, y: 0, z: 0 },   //カメラの向き中心座標
                fov: 45,                  //視野角
                near: 0.1,                 //視体積手前までの距離
                far: 500,                 //視体積の奥までの距離
                left: -10,                  //視体積の左までの距離（正投影）
                right: 10,                  //視体積の右までの距離（正投影）
                top: 10,                  //視体積の上までの距離（正投影）
                bottom: -10,                  //視体積の下までの距離（正投影）
            };

            //光源パラメータ
            this.light = {
                type: "Directional",         //光源の種類（ "Directional" | "Spot" | "Point"）
                position: { x: 0, y: 0, z: 10 }, //光源位置
                target: { x: 0, y: 0, z: 0 },     //光源の向き（平行光源, スポットライト光源）
                color: 0xFFFFFF,              //光源色
                intensity: 1,                 //光源強度
                distance: 0,                  //距離減衰指数（スポットライト光源, 点光源）
                angle: Math.PI / 4,             //角度（スポットライト光源）
                exponent: 20,                 //光軸からの減衰指数（スポットライト）
                ambient: null                 //環境光源色
            };
            this.shadow = {
                shadowMapEnabled: false,  //シャドーマップの利用
                shadowMapWidth: 512,    //シャドーマップの横幅
                shadowMapHeight: 512,    //シャドーマップの高さ
                shadowCameraVisible: false,  //シャドーマップの可視化
                shadowCameraNear: 0.1,    //シャドーカメラのサイズ（near）
                shadowCameraFar: 50,     //シャドーカメラのサイズ（far）
                shadowCameraFov: 120,    //シャドーカメラのサイズ（Fov）
                shadowCameraRight: 10,     //シャドーカメラのサイズ（right）
                shadowCameraLeft: -10,     //シャドーカメラのサイズ（left）
                shadowCameraTop: 10,     //シャドーカメラのサイズ（top）
                shadowCameraBottom: -10,     //シャドーカメラのサイズ（bottom）
                shadowDarkness: 0.5     //影の黒さ
            };

            //トラックボール
            this.trackball = {
                enabled: false,            //トラックボール利用の有無
                noRotate: false,           //トラックボールの回転無効化
                rotateSpeed: 2.0,          //トラックボールの回転速度の設定
                noZoom: false,             //トラックボールの拡大無効化
                zoomSpeed: 1.0,            //トラックボールの拡大速度の設定
                noPan: false,              //トラックボールのカメラ中心移動の無効化と中心速度の設定
                panSpeed: 1.0,             //中心速度の設定
                staticMoving: true,        //トラックボールのスタティックムーブの有効化
                dynamicDampingFactor: 0.3, //トラックボールのダイナミックムーブ時の減衰定数
            }
        }

        initThree() {
            //キャンバスフレームDOM要素の取得
            this.CG.canvasFrame = document.getElementById(this.frameID);

            //レンダラーオブジェクトの生成
            this.CG.renderer = new THREE.WebGLRenderer(this.renderer.parameters);

            if (!this.CG.renderer) alert('Three.js の初期化に失敗しました');

            //レンダラーのサイズの設定
            this.CG.renderer.setSize(
                this.CG.canvasFrame.clientWidth,
                this.CG.canvasFrame.clientHeight
            );

            //キャンバスフレームDOM要素にcanvas要素を追加
            this.CG.canvasFrame.appendChild(this.CG.renderer.domElement);

            //レンダラークリアーカラーの設定
            this.CG.renderer.setClearColor(
                this.renderer.clearColor,
                this.renderer.clearAlpha
            );

            //シャドーマップの利用
            this.CG.renderer.shadowMap.enabled = this.shadow.shadowMapEnabled;

            //シーンオブジェクトの生成
            this.CG.scene = new THREE.Scene();
        }

        initCamera() {
            //カメラのタイプが透視投影（Perspective）の場合
            if (this.camera.type == "Perspective") {

                //透視投影カメラオブジェクトの生成
                this.CG.camera = new THREE.PerspectiveCamera(
                    this.camera.fov,  //視野角
                    this.CG.canvasFrame.clientWidth / this.CG.canvasFrame.clientHeight, //アスペクト
                    this.camera.near, //視体積手前までの距離
                    this.camera.far   //視体積の奥までの距離
                );

                //カメラのタイプが正投影（Orthographic）の場合
            } else if (this.camera.type == "Orthographic") {

                //正投影カメラオブジェクトの生成
                this.CG.camera = new THREE.OrthographicCamera(
                    this.camera.left,   //視体積の左までの距離
                    this.camera.right,  //視体積の右までの距離
                    this.camera.top,    //視体積の上までの距離
                    this.camera.bottom, //視体積の下までの距離
                    this.camera.near,   //視体積手前までの距離
                    this.camera.far     //視体積の奥までの距離
                );

            } else {

                alert("カメラの設定ミス");

            }

            //カメラの位置の設定
            this.CG.camera.position.set(
                this.camera.position.x,
                this.camera.position.y,
                this.camera.position.z
            );
            //カメラの上ベクトルの設定
            this.CG.camera.up.set(
                this.camera.up.x,
                this.camera.up.y,
                this.camera.up.z
            );
            //カメラの中心位置ベクトルの設定（トラックボール利用時は自動的に無効）
            this.CG.camera.lookAt({
                x: this.camera.target.x,
                y: this.camera.target.y,
                z: this.camera.target.z
            });

            //トラックボールオブジェクトの宣言
            this.CG.trackball = new THREE.TrackballControls(
                this.CG.camera,
                this.CG.canvasFrame
            );

            //トラックボール動作範囲のサイズとオフセットの設定
            this.CG.trackball.screen.width = this.CG.canvasFrame.clientWidth;                        //横幅
            this.CG.trackball.screen.height = this.CG.canvasFrame.clientHeight;                      //縦幅
            this.CG.trackball.screen.offsetLeft = this.CG.canvasFrame.getBoundingClientRect().left;  //左オフセット
            this.CG.trackball.screen.offsetTop = this.CG.canvasFrame.getBoundingClientRect().top;    //上オフセット

            //トラックボールの回転無効化と回転速度の設定
            this.CG.trackball.noRotate = this.trackball.noRotate;
            this.CG.trackball.rotateSpeed = this.trackball.rotateSpeed;

            //トラックボールの拡大無効化と拡大速度の設定
            this.CG.trackball.noZoom = this.trackball.noZoom;
            this.CG.trackball.zoomSpeed = this.trackball.zoomSpeed;

            //トラックボールのカメラ中心移動の無効化と中心速度の設定
            this.CG.trackball.noPan = this.trackball.noPan;
            this.CG.trackball.panSpeed = this.trackball.panSpeed;
            this.CG.trackball.target = new THREE.Vector3(
                this.camera.target.x,
                this.camera.target.y,
                this.camera.target.z
            );

            //トラックボールのスタティックムーブの有効化
            this.CG.trackball.staticMoving = this.trackball.staticMoving;
            //トラックボールのダイナミックムーブ時の減衰定数
            this.CG.trackball.dynamicDampingFactor = this.trackball.dynamicDampingFactor;

            //トラックボール利用の有無
            this.CG.trackball.enabled = this.trackball.enabled;
        }

        initLight() {
            //シャドーカメラのパラメータを設定する関数
            function setShadowCamera(shadowCamera, parameter) {
                //光源オブジェクトの影の生成元
                shadowCamera.castShadow = parameter.shadowMapEnabled;
                //シャドウマップのサイズ
                shadowCamera.shadowMapWidth = parameter.shadowMapWidth;
                shadowCamera.shadowMapHeight = parameter.shadowMapHeight;
                //影の黒さ
                shadowCamera.shadowDarkness = parameter.shadowDarkness;
                //シャドーカメラの可視化
                shadowCamera.shadowCameraVisible = parameter.shadowCameraVisible;

                if (shadowCamera instanceof THREE.DirectionalLight) {

                    //平行光源の場合
                    shadowCamera.shadowCameraNear = parameter.shadowCameraNear;
                    shadowCamera.shadowCameraFar = parameter.shadowCameraFar;
                    shadowCamera.shadowCameraRight = parameter.shadowCameraRight;
                    shadowCamera.shadowCameraLeft = parameter.shadowCameraLeft;
                    shadowCamera.shadowCameraTop = parameter.shadowCameraTop;
                    shadowCamera.shadowCameraBottom = parameter.shadowCameraBottom;

                } else if (shadowCamera instanceof THREE.SpotLight) {

                    //点光源の場合
                    shadowCamera.shadowCameraNear = parameter.shadowCameraNear;
                    shadowCamera.shadowCameraFar = parameter.shadowCameraFar;
                    shadowCamera.shadowCameraFov = parameter.shadowCameraFov;

                } else {

                    alert("シャドーカメラの設定ミス");

                }

            }


            if (this.light.type == "Directional") {

                //平行光源オブジェクトの生成
                this.CG.light = new THREE.DirectionalLight(
                    this.light.color,     //光源色
                    this.light.intensity  //光源強度
                );

                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {

                    setShadowCamera(this.CG.light, this.shadow);

                }

            } else if (this.light.type == "Spot") {

                //スポットライトオブジェクトの生成
                this.CG.light = new THREE.SpotLight(
                    this.light.color,     //光源色
                    this.light.intensity, //光源強度
                    this.light.distance,  //距離減衰指数
                    this.light.angle,     //スポットライト光源の角度
                    this.light.exponent   //光軸からの減衰指数
                );

                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {

                    setShadowCamera(this.CG.light, this.shadow);

                }

            } else if (this.light.type == "Point") {
                //点光源オブジェクトの生成
                this.CG.light = new THREE.PointLight(
                    this.light.color,     //光源色
                    this.light.intensity, //光源強度
                    this.light.distance   //距離減衰指数
                );

                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {
                    //シャドーカメラ用スポットライトオブジェクトの生成
                    this.CG.light.shadowCamera = new THREE.SpotLight();
                    //シャドーカメラ用の位置
                    this.CG.light.shadowCamera.position.set(
                        this.light.position.x,
                        this.light.position.y,
                        this.light.position.z
                    );
                    //スポットライト光源オブジェクトをシャドーマップ作成用のみに利用する
                    this.CG.light.shadowCamera.onlyShadow = true;

                    //シャドーカメラをシーンへ追加
                    this.CG.scene.add(this.CG.light.shadowCamera);
                    setShadowCamera(this.CG.light.shadowCamera, this.shadow);
                }

            } else {

                alert("光源の設定ミス");

            }

            //光源オブジェクトの位置の設定
            this.CG.light.position.set(
                this.light.position.x,
                this.light.position.y,
                this.light.position.z
            );
            //光源ターゲット用オブジェクトの生成
            this.CG.light.target = new THREE.Object3D();
            this.CG.light.target.position.set(
                this.light.target.x,
                this.light.target.y,
                this.light.target.z
            );
            //光源オブジェクトのシーンへの追加
            this.CG.scene.add(this.CG.light);


            if (this.light.ambient) {
                //環境光オブジェクトの生成
                this.CG.ambientLight = new THREE.AmbientLight(this.light.ambient);

                //環境光オブジェクトのシーンへの追加
                this.CG.scene.add(this.CG.ambientLight);
            }
        }

        initDragg() {

        }

        Execute() {
            super.Execute();

            this.initThree();
            this.initCamera();
            this.initLight();
            this.initDragg();
        }
    }
}