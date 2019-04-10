/* =========================================================================
 *
 *  EPhysEntity.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="../ECS/Entity.ts" />
/// <reference path="../EComponents/EComponents.ts" />
module EPSE {
    declare let THREE: any;

    export class EPhysEntity extends ECS.Entity {
        param: any;

        visible: boolean;
        draggable: boolean = false;
        allowDrag: boolean;

        c_physics: EPhysComponent;
        c_geometry: EGeometryComponent;
        c_material: EMaterialComponent;
        c_boundingBox: EBoundingBoxComponent;
        c_velocityVector: EVelocityVectorComponent;
        c_locus: ELocusComponent;
        CG: any;

        constructor() {

            super("physics_object");
            //add physics object components'
            this.c_physics = <EPhysComponent>this.addComponent(new EPhysComponent());
            this.c_boundingBox = <EBoundingBoxComponent>this.addComponent(new EBoundingBoxComponent());
            this.c_geometry = <EGeometryComponent>this.addComponent(new EGeometryComponent());
            this.c_locus = <ELocusComponent>this.addComponent(new ELocusComponent());
            this.c_material = <EMaterialComponent>this.addComponent(new EMaterialComponent());
            this.c_velocityVector = <EVelocityVectorComponent>this.addComponent(new EVelocityVectorComponent());

            //user setting
            this.visible = true;
            this.allowDrag = false;

            this.CG = {};
        }

        create3DCG() {

            let geometry = this.c_geometry.getGeometry();

            let material = this.c_material.getMaterial();

            let boundingBox = this.c_boundingBox.boundingBox;

            this.CG = new THREE.Mesh(geometry, material);
            this.CG.obj = this;
            //add boundingbox
            if (this.draggable) {

                this.CG.geometry.computeBoundingBox();

                boundingBox.width = new THREE.Vector3().subVectors(
                    this.CG.geometry.boundingBox.max,
                    this.CG.geometry.boundingBox.min
                );

                geometry = new THREE.CubeGeometry(
                    boundingBox.width.x,
                    boundingBox.width.y,
                    boundingBox.width.z
                );
                boundingBox.color = material.color;

                material = new THREE.MeshBasicMaterial({
                    color: boundingBox.color,
                    transparent: boundingBox.transparent,
                    opacity: boundingBox.opacity
                });

                boundingBox.CG = new THREE.Mesh(geometry, material);
                boundingBox.center = new THREE.Vector3().addVectors(
                    this.CG.geometry.boundingBox.max,
                    this.CG.geometry.boundingBox.min
                ).divideScalar(2);
                boundingBox.CG.position.copy(this.c_physics.r).add(boundingBox.center);
                boundingBox.CG.visible = boundingBox.visible;
                CG.scene.add(boundingBox.CG);
            }
        }


        create() {
            //create 3D CG
            this.create3DCG();

            let material = this.c_material.material;
            let velocityVector = this.c_velocityVector.velocityVector;
            let locus = this.c_locus.locus;

            this.CG.castShadow = material.castShadow;
            this.CG.receiveShadow = material.receiveShadow;

            //add object' CG to scene
            CG.scene.add(this.CG);

            //velocity vector
            if (velocityVector.enabled) {

                //矢印オブジェクトの生成
                velocityVector.CG = new THREE.ArrowHelper(
                    this.c_physics.v.clone().normalize(), //direction vector
                    this.c_physics.r.clone(), //start point coordinate
                    1,
                    velocityVector.color
                );
                CG.scene.add(velocityVector.CG);

            }

            //locus visualization
            if (locus.enabled) {


                let geometry = new THREE.BufferGeometry();
                let vertices = new Float32Array(locus.maxNum * 3);
                let bufferAttributes = new THREE.BufferAttribute(vertices, 3);
                bufferAttributes.dynamic = true;
                geometry.addAttribute('position', bufferAttributes);

                let material = new THREE.LineBasicMaterial({ color: locus.color });

                locus.CG = new THREE.Line(geometry, material);
                CG.scene.add(locus.CG);
            }

            //プロットデータ配列に初期値を代入
            this.c_physics.recordDynamicData();

            //r_{-1}の値を取得する
            this.c_physics.computeInitialCondition();

        }


        update() {

            this.CG.position.copy(this.c_physics.r);

            this.CG.visible = this.visible;

            for (let i = 0; i < this.CG.children.length; i++) {

                this.CG.children[i].visible = this.visible;

            }

            //locus visualization
            this.updateLocus();

            //velocity vector update
            this.updateVelocityVector();

            this.updateBoundingBox();
        }


        updateLocus(color?: any) {

            let locus = this.c_locus.locus;
            if (!locus.enabled) return;

            color = (color !== undefined) ? color : locus.color;

            let start = this.c_physics.data.x.length - 1;
            let end = locus.CG.geometry.attributes.position.array.length / 3;

            for (let n = start; n < end; n++) {
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
            let flag = false;

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

        updateVelocityVector(color?: any, scale?: any) {

            let velocityVector = this.c_velocityVector.velocityVector;
            if (!velocityVector.enabled) return;

            color = (color !== undefined) ? color : velocityVector.color;
            scale = (scale !== undefined) ? scale : velocityVector.scale;

            //速度の大きさ
            let v = this.c_physics.v.length() * scale;

            if (v < 0.01) {
                v = 0.01;
                scale = 0.01;
            }

            velocityVector.CG.setDirection(this.c_physics.v.clone().normalize());
            velocityVector.CG.setLength(v, scale, scale);
            velocityVector.CG.position.copy(this.c_physics.r);
            velocityVector.CG.setColor(color);

            //表示フラグ
            let flag = false;

            //速度ベクトルの表示
            if (velocityVectorFlag == "true") {

                flag = true;

            } else if (velocityVectorFlag == "false") {

                flag = false;

            } else if (velocityVectorFlag == "pause") {

                flag = (pauseFlag) ? true : false;

            }

            //子要素の可視化も指定
            for (let i = 0; i < velocityVector.CG.children.length; i++) {
                velocityVector.CG.children[i].visible = flag && velocityVector.visible;
            }

        }

        updateBoundingBox() {

            if (!this.draggable) return;

            let boundingBox = this.c_boundingBox.boundingBox;

            boundingBox.CG.position.copy(this.c_physics.r).add(boundingBox.center);

            let flag = false;

            if (boundingBoxFlag == "true") {

                flag = true;

            } else if (boundingBoxFlag == "false") {

                flag = false;

            } else if (boundingBoxFlag == "dragg") {

                flag = (boundingBox.draggFlag) ? true : false;

            }

            boundingBox.CG.visible = flag && boundingBox.visible;

            if (!this.c_physics.dynamic) {
                this.c_physics.v = new THREE.Vector3().subVectors(this.c_physics.r, this.c_physics.r_1).divideScalar(delta_t * skipRendering);
                this.c_physics.r_1.copy(this.c_physics.r);
            }

        }

        resetParameter() {

            let physics = this.c_physics;
            physics.initDynamicData();

            overwriteProperty(this, this.param);

            physics.recordDynamicData();

            physics.computeInitialCondition();
        }
    }
}