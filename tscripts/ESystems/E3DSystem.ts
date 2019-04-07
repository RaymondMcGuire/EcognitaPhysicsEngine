/* =========================================================================
 *
 *  E3DSystem.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/System.ts" />
/// <reference path="../EUtils/EPhysCommon.ts" />
module EPSE {
    declare var THREE: any;

    export class E3DSystem extends ECS.System {

        draggableObjects: any;

        renderer: any;
        camera: any;
        light: any;
        shadow: any;
        trackball: any;

        constructor() {
            super("three_system");
            this.draggableObjects = [];

            this.renderer = {
                clearColor: 0xE1FCFF, //クリアーカラー（背景色）
                clearAlpha: 1.0,      //クリアーアルファ値（背景色）
                parameters: {         //WebGLRendererクラスのコンストラクタに渡すパラメータ 
                    antialias: true,   //アンチエイリアス（デフォルト：false）
                    stencil: true,     //ステンシルバッファ（デフォルト：true）
                }
            }

            //カメラパラメータ
            this.camera = {
                type: "Perspective",          //カメラの種類（ "Perspective" | "Orthographic"）
                position: { x: 20, y: 0, z: 10 }, //カメラの位置座標
                up: { x: 0, y: 0, z: 1 },   //カメラの上ベクトル
                target: { x: 0, y: 0, z: 2 },   //カメラの向き中心座標
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
                position: { x: 0, y: 0, z: 15 }, //光源位置
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
                enabled: true,            //トラックボール利用の有無
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
            CG.canvasFrame = document.getElementById(frameID);

            //レンダラーオブジェクトの生成
            CG.renderer = new THREE.WebGLRenderer(this.renderer.parameters);

            if (!CG.renderer) alert('Three.js の初期化に失敗しました');

            //レンダラーのサイズの設定
            CG.renderer.setSize(
                CG.canvasFrame.clientWidth,
                CG.canvasFrame.clientHeight
            );

            //キャンバスフレームDOM要素にcanvas要素を追加
            CG.canvasFrame.appendChild(CG.renderer.domElement);

            //レンダラークリアーカラーの設定
            CG.renderer.setClearColor(
                this.renderer.clearColor,
                this.renderer.clearAlpha
            );

            //シャドーマップの利用
            CG.renderer.shadowMap.enabled = this.shadow.shadowMapEnabled;

            //シーンオブジェクトの生成
            CG.scene = new THREE.Scene();
        }

        initCamera() {
            //カメラのタイプが透視投影（Perspective）の場合
            if (this.camera.type == "Perspective") {

                //透視投影カメラオブジェクトの生成
                CG.camera = new THREE.PerspectiveCamera(
                    this.camera.fov,  //視野角
                    CG.canvasFrame.clientWidth / CG.canvasFrame.clientHeight, //アスペクト
                    this.camera.near, //視体積手前までの距離
                    this.camera.far   //視体積の奥までの距離
                );

                //カメラのタイプが正投影（Orthographic）の場合
            } else if (this.camera.type == "Orthographic") {

                //正投影カメラオブジェクトの生成
                CG.camera = new THREE.OrthographicCamera(
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
            CG.camera.position.set(
                this.camera.position.x,
                this.camera.position.y,
                this.camera.position.z
            );
            //カメラの上ベクトルの設定
            CG.camera.up.set(
                this.camera.up.x,
                this.camera.up.y,
                this.camera.up.z
            );
            //カメラの中心位置ベクトルの設定（トラックボール利用時は自動的に無効）
            CG.camera.lookAt({
                x: this.camera.target.x,
                y: this.camera.target.y,
                z: this.camera.target.z
            });

            //トラックボールオブジェクトの宣言
            CG.trackball = new THREE.TrackballControls(
                CG.camera,
                CG.canvasFrame
            );

            //トラックボール動作範囲のサイズとオフセットの設定
            CG.trackball.screen.width = CG.canvasFrame.clientWidth;                        //横幅
            CG.trackball.screen.height = CG.canvasFrame.clientHeight;                      //縦幅
            CG.trackball.screen.offsetLeft = CG.canvasFrame.getBoundingClientRect().left;  //左オフセット
            CG.trackball.screen.offsetTop = CG.canvasFrame.getBoundingClientRect().top;    //上オフセット

            //トラックボールの回転無効化と回転速度の設定
            CG.trackball.noRotate = this.trackball.noRotate;
            CG.trackball.rotateSpeed = this.trackball.rotateSpeed;

            //トラックボールの拡大無効化と拡大速度の設定
            CG.trackball.noZoom = this.trackball.noZoom;
            CG.trackball.zoomSpeed = this.trackball.zoomSpeed;

            //トラックボールのカメラ中心移動の無効化と中心速度の設定
            CG.trackball.noPan = this.trackball.noPan;
            CG.trackball.panSpeed = this.trackball.panSpeed;
            CG.trackball.target = new THREE.Vector3(
                this.camera.target.x,
                this.camera.target.y,
                this.camera.target.z
            );

            //トラックボールのスタティックムーブの有効化
            CG.trackball.staticMoving = this.trackball.staticMoving;
            //トラックボールのダイナミックムーブ時の減衰定数
            CG.trackball.dynamicDampingFactor = this.trackball.dynamicDampingFactor;

            //トラックボール利用の有無
            CG.trackball.enabled = this.trackball.enabled;
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
                CG.light = new THREE.DirectionalLight(
                    this.light.color,     //光源色
                    this.light.intensity  //光源強度
                );

                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {

                    setShadowCamera(CG.light, this.shadow);

                }

            } else if (this.light.type == "Spot") {

                //スポットライトオブジェクトの生成
                CG.light = new THREE.SpotLight(
                    this.light.color,     //光源色
                    this.light.intensity, //光源強度
                    this.light.distance,  //距離減衰指数
                    this.light.angle,     //スポットライト光源の角度
                    this.light.exponent   //光軸からの減衰指数
                );

                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {

                    setShadowCamera(CG.light, this.shadow);

                }

            } else if (this.light.type == "Point") {
                //点光源オブジェクトの生成
                CG.light = new THREE.PointLight(
                    this.light.color,     //光源色
                    this.light.intensity, //光源強度
                    this.light.distance   //距離減衰指数
                );

                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {
                    //シャドーカメラ用スポットライトオブジェクトの生成
                    CG.light.shadowCamera = new THREE.SpotLight();
                    //シャドーカメラ用の位置
                    CG.light.shadowCamera.position.set(
                        this.light.position.x,
                        this.light.position.y,
                        this.light.position.z
                    );
                    //スポットライト光源オブジェクトをシャドーマップ作成用のみに利用する
                    CG.light.shadowCamera.onlyShadow = true;

                    //シャドーカメラをシーンへ追加
                    CG.scene.add(CG.light.shadowCamera);
                    setShadowCamera(CG.light.shadowCamera, this.shadow);
                }

            } else {

                alert("光源の設定ミス");

            }

            //光源オブジェクトの位置の設定
            CG.light.position.set(
                this.light.position.x,
                this.light.position.y,
                this.light.position.z
            );
            //光源ターゲット用オブジェクトの生成
            CG.light.target = new THREE.Object3D();
            CG.light.target.position.set(
                this.light.target.x,
                this.light.target.y,
                this.light.target.z
            );
            //光源オブジェクトのシーンへの追加
            CG.scene.add(CG.light);


            if (this.light.ambient) {
                //環境光オブジェクトの生成
                CG.ambientLight = new THREE.AmbientLight(this.light.ambient);

                //環境光オブジェクトのシーンへの追加
                CG.scene.add(CG.ambientLight);
            }
        }

        initDragg() {
            //仮想物理実験室全体でのマウスドラック無しの場合
            if (!draggable) return;

            ///////////////光線受信用平面オブジェクトの定義//////////////////
            //形状オブジェクトの宣言と生成
            var geometry = new THREE.PlaneGeometry(200, 200, 8, 8);
            //材質オブジェクトの宣言と生成
            var material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
            //平面オブジェクトの生成
            var plane = new THREE.Mesh(geometry, material);
            //平面オブジェクトの可視化
            plane.visible = false;
            //平面オブジェクトのシーンへの追加
            CG.scene.add(plane);

            CG.canvasFrame.addEventListener('mousemove', (event) => {

                //マウスドラックフラグを解除
                for (var i = 0; i < this.draggableObjects.length; i++) {
                    this.draggableObjects[i].physObject.c_boundingBox.boundingBox.draggFlag = false;
                }

                //マウスドラックが許可されていない場合は処理を終了
                if (!allowDrag) return;

                elementOffsetLeft = CG.canvasFrame.getBoundingClientRect().left;
                elementOffsetTop = CG.canvasFrame.getBoundingClientRect().top;

                //マウスポインタの位置座標の取得
                var mx = ((event.clientX - elementOffsetLeft) / CG.canvasFrame.clientWidth) * 2 - 1;
                var my = -((event.clientY - elementOffsetTop) / CG.canvasFrame.clientHeight) * 2 + 1;
                var vector = new THREE.Vector3(mx, my, 0.5);
                //プロジェクターオブジェクトの生成
                //var projector = new THREE.Projector();
                //逆投影変換を行うことで仮想空間内のベクトルへと変換する
                //vector = projector.unprojectVector(vector, CG.camera);
                vector.unproject(CG.camera);
                //カメラ位置座標を起点として規格化を行う
                vector = vector.sub(CG.camera.position).normalize();
                //カメラ位置座標から光線を発射
                var raycaster = new THREE.Raycaster(CG.camera.position, vector);

                //オブジェクトがマウスドラックされている時
                if (SELECTED) {

                    //光線と交わる平面オブジェクトオブジェクトを収集
                    var intersects = raycaster.intersectObject(plane);
                    //マウスドラック時のマウスポインタの指している平面オブジェクトの３次元空間中の位置座標
                    var vec3 = intersects[0].point;

                    //マウスドラックされているオブジェクトのバウンディングボックスを移動
                    SELECTED.physObject.boundingBox.CG.position.copy(
                        vec3.sub(offset)
                    );

                    //マウスドラックされているオブジェクトを移動
                    SELECTED.physObject.r.copy(
                        SELECTED.physObject.boundingBox.CG.position
                    ).sub(SELECTED.physObject.boundingBox.center);

                    //マウスドラックフラグの設定
                    SELECTED.physObject.boundingBox.draggFlag = true;

                    //マウスドラックイベントの実行
                    this.mouseDraggEvent(SELECTED.physObject);//<------------------------------------------------------------イベント実行

                    return;
                }
                //光線と交わるオブジェクトを収集
                var intersects = raycaster.intersectObjects(this.draggableObjects);
         
                //マウスポインタがオブジェクト上にある場合
                if (intersects.length > 0) {

                    if (INTERSECTED != intersects[0].object) {

                        //マウスドラックが許可されていない場合は処理を終了
                        if (!intersects[0].object.physObject.allowDrag) return;

                        //マウスポインタが指しているオブジェクトが登録されていなければ、一番手前のオブジェクトを「INTERSECTED」に登録
                        INTERSECTED = intersects[0].object;

                        //平面オブジェクトの位置座標を「INTERSECTED」に登録されたオブジェクトと同じ位置座標とする
                        plane.position.copy(INTERSECTED.position);

                        //平面オブジェクトの上ベクトルをカメラの位置座標の方向へ向ける
                        plane.lookAt(CG.camera.position);

                    }
                    //バウンディングボックスの可視化
                    INTERSECTED.physObject.boundingBox.draggFlag = true;

                    //マウスポインタのカーソルを変更
                    CG.canvasFrame.style.cursor = 'pointer';

                } else {

                    //マウスポインタがオブジェクトから離れている場合
                    INTERSECTED = null;

                    //マウスポインタのカーソルを変更
                    CG.canvasFrame.style.cursor = 'auto';

                }
            }, false);


            CG.canvasFrame.addEventListener('mousedown', (event) => {
                //マウスドラックが許可されていない場合は処理を終了
                if (!allowDrag) return;

                //マウスポインタの位置座標の取得
                var mx = ((event.clientX - elementOffsetLeft) / CG.canvasFrame.clientWidth) * 2 - 1;
                var my = -((event.clientY - elementOffsetTop) / CG.canvasFrame.clientHeight) * 2 + 1;
                var vector = new THREE.Vector3(mx, my, 0.5);

                //プロジェクターオブジェクトの生成
                //var projector = new THREE.Projector();
                //逆投影変換を行うことで仮想空間内のベクトルへと変換する
                //vector = projector.unprojectVector(vector, CG.camera);
                vector.unproject(CG.camera);
                //カメラ位置座標を起点として規格化を行う
                vector = vector.sub(CG.camera.position).normalize();
                //カメラ位置座標から光線を発射
                var raycaster = new THREE.Raycaster(CG.camera.position, vector);
                //光線と交わるオブジェクトを収集
                var intersects = raycaster.intersectObjects(this.draggableObjects);

                //交わるオブジェクトが１個以上の場合
                if (intersects.length > 0) {
                    
                    //マウスドラックが許可されていない場合は処理を終了
                    if (!intersects[0].object.physObject.allowDrag) return;

                    //トラックボールを無効化
                    CG.trackball.enabled = false;
                    //クリックされたオブジェクトを「SELECTED」に登録
                    SELECTED = intersects[0].object;

                    //マウスダウンイベントの実行
                    this.mouseDownEvent(SELECTED.physObject);//<------------------------------------------------------------イベント実行

                    //光線と交わる平面オブジェクトオブジェクトを収集
                    var intersects = raycaster.intersectObject(plane);
                    //クリック時のマウスポインタの指した平面オブジェクトの３次元空間中の位置座標
                    var vec3 = intersects[0].point;
                    //平面オブジェクトの中心から見た相対的な位置座標
                    offset.copy(vec3).sub(plane.position);
                    //マウスポインタのカーソルを変更
                    CG.canvasFrame.style.cursor = 'move';
                }
            }, false);
            CG.canvasFrame.addEventListener('mouseup', (event) => {

                //トラックボールを有効化
                CG.trackball.enabled = this.trackball.enabled;

                //マウスポインタのカーソルを変更
                CG.canvasFrame.style.cursor = 'auto';

                //マウスドラックが許可されていない場合は処理を終了
                if (!allowDrag) return;

                //マウスアップ時にマウスポインタがオブジェクト上にある場合
                if (INTERSECTED && SELECTED) {

                    //平面オブジェクトの位置座標をオブジェクトの位置座標に合わせる
                    plane.position.copy(INTERSECTED.position);

                    //内部パラメータのリセット
                    if (SELECTED.physObject.dynamic) SELECTED.physObject.resetParameter();

                    //マウスアップイベントの実行
                    this.mouseUpEvent(SELECTED.physObject);//<------------------------------------------------------------イベント実行

                    //画面キャプチャの生成フラグ
                    makePictureFlag = true;

                    //マウスドラックの解除
                    SELECTED = null;

                }

            }, false);

            //マウスクリック時のバウンディングボックスオブジェクト中心からの相対座標
            var offset = new THREE.Vector3();
            var INTERSECTED;  //マウスポインタが指しているオブジェクト 
            var SELECTED;     //マウスドラック中のオブジェクト

            //HTML要素の位置による補正量の取得
            var elementOffsetLeft, elementOffsetTop;

        }

        mouseDownEvent(physObject) {

        }
        //３次元オブジェクトがマウスドラックされた時に実行
        mouseDraggEvent(physObject) {

        }
        //３次元オブジェクトがマウスアップされた時に実行
        mouseUpEvent(physObject) {

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