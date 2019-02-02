/* =========================================================================
 *
 *  EPhysEntity.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="../ECS/Entity.ts" />
/// <reference path="../EComponents/EComponents.ts" />
module EPSE {
    declare var THREE: any;

    export class EPhysEntity extends ECS.Entity {

        visible: boolean;
        draggable: boolean;
        allowDrag: boolean;
        
        c_physics:EPhysComponent;
        c_geometry:EGeometryComponent;
        c_material:EMaterialComponent;
        c_boundingBox:EBoundingBoxComponent;
        c_velocityVector:EVelocityVectorComponent;
        c_locus:ELocusComponent;
        CG:any;

        constructor() {

            super("physics_object");
            //add physics object components'
            this.c_physics = <EPhysComponent>this.addComponent(new EPhysComponent());
            this.c_boundingBox = <EBoundingBoxComponent>this.addComponent(new EBoundingBoxComponent());
            this.c_geometry = <EGeometryComponent>this.addComponent(new EGeometryComponent());
            this.c_locus = <ELocusComponent>this.addComponent(new ELocusComponent());
            this.c_material = <EMaterialComponent> this.addComponent(new EMaterialComponent());
            this.c_velocityVector = <EVelocityVectorComponent>this.addComponent(new EVelocityVectorComponent());

            //user setting
            this.visible = true;
            this.draggable = false;
            this.allowDrag = false;

            this.CG = {};

        }

        create3DCG() {

            var geometry = this.c_geometry.getGeometry();
        
            var material = this.c_material.getMaterial();

            var boundingBox = this.c_boundingBox.boundingBox;
        
            this.CG = new THREE.Mesh(geometry, material);
        
            //マウスドラックによる移動を行う場合
            if (this.draggable) {
        
                //バウンディングボックスの計算
                this.CG.geometry.computeBoundingBox();
        
                //バウンディングボックスの幅の取得
                boundingBox.width = new THREE.Vector3().subVectors(
                    this.CG.geometry.boundingBox.max,
                    this.CG.geometry.boundingBox.min
                );
        
                //形状オブジェクトの宣言と生成
                var geometry = new THREE.CubeGeometry(
                    boundingBox.width.x,
                    boundingBox.width.y,
                    boundingBox.width.z
                );
        
                //材質オブジェクトの宣言と生成
                var material = new THREE.MeshBasicMaterial({
                    color: boundingBox.color,
                    transparent: boundingBox.transparent,
                    opacity: boundingBox.opacity
                });
        
                //バウンディングボックスオブジェクトの生成
                boundingBox.CG = new THREE.Mesh(geometry, material);
        
                //バウンディングボックスオブジェクトのローカル座標系における中心座標を格納
                boundingBox.center = new THREE.Vector3().addVectors(
                    this.CG.geometry.boundingBox.max,
                    this.CG.geometry.boundingBox.min
                ).divideScalar(2);
        
                //バウンディングボックスオブジェクトの位置を指定
                boundingBox.CG.position.copy(this.c_physics.r).add(boundingBox.center);
        
                //バウンディングボックスオブジェクトの表示の有無を指定
                boundingBox.CG.visible = boundingBox.visible;
        
                //バウンディング球オブジェクトのシーンへの追加
                //physLab.CG.scene.add(boundingBox.CG);
        
                //バウンディングボックスオブジェクトに３次元オブジェクトを指定
                boundingBox.CG.physObject = this;
        
            }
        
        }


        create() {
            //３次元グラフィックスの生成
            this.create3DCG();
            
            var material = this.c_material.material;
            var velocityVector = this.c_velocityVector.velocityVector;
            var locus = this.c_locus.locus;

            //オブジェクトの影の生成元
            this.CG.castShadow = material.castShadow;
        
            //オブジェクトに影を描画
            this.CG.receiveShadow = material.receiveShadow;
        
            //オブジェクトのシーンへの追加
            //this.physLab.CG.scene.add(this.CG);
        
            //速度ベクトルの表示
            if (velocityVector.enabled) {
        
                //矢印オブジェクトの生成
                velocityVector.CG = new THREE.ArrowHelper(
                    this.c_physics.v.clone().normalize(), //方向ベクトル
                    this.c_physics.r.clone(), //起点座標
                    1, //長さ
                    velocityVector.color //色
                );
                //矢印オブジェクトのシーンへの追加
                //this.physLab.CG.scene.add(velocityVector.CG);
        
            }
            //軌跡オブジェクトの表示
            if (locus.enabled) {
        
                //形状オブジェクトの宣言
                var geometry = new THREE.BufferGeometry();
                //アトリビュート変数のサイズを指定
                geometry.attributes = {
                        position: { //頂点座標
                            itemSize: 3, //各頂点ごとの要素数（x,y,z）
                            array: new Float32Array(locus.maxNum * 3), //配列の宣言
                            numItems: locus.maxNum * 3, //配列の要素数
                            dynamic: true
                        }
                    }
                    //材質オブジェクトの生成
                var material = new THREE.LineBasicMaterial({ color: locus.color });
                //軌跡オブジェクトの作成
                locus.CG = new THREE.Line(geometry, material);
                //軌跡オブジェクトのシーンへの追加
                //this.physLab.CG.scene.add(this.locus.CG);
            }
        
            //プロットデータ配列に初期値を代入
            this.c_physics.recordDynamicData();
        
            //r_{-1}の値を取得する
            this.c_physics.computeInitialCondition();
        
        }


        update() {

            //位置ベクトルの指定
            this.CG.position = this.c_physics.r.clone();
        
            //オブジェクトの可視化
            this.CG.visible = this.visible;
        
            //３次元グラフィックス子要素の可視化も指定
            for (var i = 0; i < this.CG.children.length; i++) {
        
                this.CG.children[i].visible = this.visible;
        
            }
        
            //軌跡オブジェクトの更新
            this.updateLocus();
        
            //速度ベクトルの更新
            this.updateVelocityVector();
        
            //バウンディングボックスの位置と姿勢の更新
            this.updateBoundingBox();
        
        }


        updateLocus(color?:any) {

            var locus = this.c_locus.locus;
            if (!locus.enabled) return;
        
            color = (color !== undefined) ? color : locus.color;
        
            var start = this.c_physics.data.x.length - 1;
            var end = locus.CG.geometry.attributes.position.array.length / 3;
        
            for (var n = start; n < end; n++) {
                //頂点の位置座標の設定
                locus.CG.geometry.attributes.position.array[n * 3] = this.c_physics.r.x;
                locus.CG.geometry.attributes.position.array[n * 3 + 1] = this.c_physics.r.y;
                locus.CG.geometry.attributes.position.array[n * 3 + 2] = this.c_physics.r.z;
            }
        
            //頂点座標の更新を通知
            locus.CG.geometry.attributes.position.needsUpdate = true;
        
            //色の指定
            locus.CG.material.color.setHex(color);
        
        
            //表示フラグ
            var flag = false;
        
            if (locusFlag == "true") {
        
                flag = true;
        
            } else if (locusFlag == "false") {
        
                flag = false;
        
            } else if (locusFlag == "pause") {
        
                flag = (pauseFlag) ? true : false;
        
            }
        
            //軌跡の表示
            locus.CG.visible = flag && locus.visible;
        
        }

        updateVelocityVector(color?:any, scale?:any) {

            var velocityVector = this.c_velocityVector.velocityVector;
            if (!velocityVector.enabled) return;
            
            color = (color !== undefined) ? color : velocityVector.color;
            scale = (scale !== undefined) ? scale : velocityVector.scale;
    
            //速度の大きさ
            var v = this.c_physics.v.length() * scale;
    
            if (v < 0.01) {
                v = 0.01;
                scale = 0.01;
            }
    
            velocityVector.CG.setDirection(this.c_physics.v.clone().normalize());
            velocityVector.CG.setLength(v, scale, scale);
            velocityVector.CG.position = this.c_physics.r.clone();
            velocityVector.CG.setColor(color);
    
            //表示フラグ
            var flag = false;
    
            //速度ベクトルの表示
            if (velocityVectorFlag == "true") {
    
                flag = true;
    
            } else if (velocityVectorFlag == "false") {
    
                flag = false;
    
            } else if (velocityVectorFlag == "pause") {
    
                flag = (pauseFlag) ? true : false;
    
            }
    
            //子要素の可視化も指定
            for (var i = 0; i < velocityVector.CG.children.length; i++) {
                velocityVector.CG.children[i].visible = flag && velocityVector.visible;
            }
    
        }

        updateBoundingBox() {

            if (!this.draggable) return;

            var boundingBox = this.c_boundingBox.boundingBox;
        
            //バウンディングボックスの位置と姿勢の更新
            boundingBox.CG.position.copy(this.c_physics.r).add(boundingBox.center);
        
            //表示フラグ
            var flag = false;
        
            if (boundingBoxFlag == "true") {
        
                flag = true;
        
            } else if (boundingBoxFlag == "false") {
        
                flag = false;
        
            } else if (boundingBoxFlag == "dragg") {
        
                flag = (boundingBox.draggFlag) ? true : false;
        
            }
            //バウンディングボックスの表示
            boundingBox.CG.visible = flag && boundingBox.visible;
        
            if (!this.c_physics.dynamic) {
                //マウスドラックによる３次元オブジェクトの移動速度
                this.c_physics.v = new THREE.Vector3().subVectors(this.c_physics.r, this.c_physics.r_1).divideScalar(delta_t * skipRendering);
                //過去の位置を格納
                this.c_physics.r_1.copy(this.c_physics.r);
            }
        
        }
    }
}