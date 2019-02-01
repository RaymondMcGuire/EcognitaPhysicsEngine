var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* =========================================================================
 *
 *  Component.ts
 *  one entity → multi-component
 *
 * ========================================================================= */
var ECS;
(function (ECS) {
    var Component = /** @class */ (function () {
        function Component(name) {
            this.name = name;
        }
        return Component;
    }());
    ECS.Component = Component;
})(ECS || (ECS = {}));
var Utils;
(function (Utils) {
    ;
    var HashSet = /** @class */ (function () {
        function HashSet() {
            this.items = {};
        }
        HashSet.prototype.set = function (key, value) {
            this.items[key] = value;
        };
        HashSet.prototype["delete"] = function (key) {
            return delete this.items[key];
        };
        HashSet.prototype.has = function (key) {
            return key in this.items;
        };
        HashSet.prototype.get = function (key) {
            return this.items[key];
        };
        HashSet.prototype.len = function () {
            return Object.keys(this.items).length;
        };
        HashSet.prototype.forEach = function (f) {
            for (var k in this.items) {
                f(k, this.items[k]);
            }
        };
        HashSet.prototype.forEach2 = function (f) {
            for (var k in this.items) {
                f(k, this.items[k]);
                return this.items[k];
            }
        };
        return HashSet;
    }());
    Utils.HashSet = HashSet;
})(Utils || (Utils = {}));
/* =========================================================================
 *
 *  Entity.js
 *  each entity has an unique ID
 *
 * ========================================================================= */
/// <reference path="./Component.ts" />
/// <reference path="../EUtils/HashSet.ts" />
var ECS;
(function (ECS) {
    var Entity = /** @class */ (function () {
        function Entity(name) {
            this.count = 0;
            this.name = name;
            this.id = (+new Date()).toString(16) +
                (Math.random() * 100000000 | 0).toString(16) +
                this.count;
            this.count++;
            this.components = new Utils.HashSet();
        }
        Entity.prototype.addComponent = function (component) {
            this.components.set(component.name, component);
            return component;
            //console.log("add ["+component.name+"] component");
        };
        Entity.prototype.removeComponent = function (component) {
            var name = component.name;
            var deletOrNot = this.components["delete"](name);
            if (deletOrNot) {
                //console.log("delete [" + name + "] success!");
                return true;
            }
            else {
                //console.log("delete [" + name + "] fail! not exist!");
                return false;
            }
        };
        return Entity;
    }());
    ECS.Entity = Entity;
})(ECS || (ECS = {}));
/* =========================================================================
 *
 *  EBoundingBoxComponent.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
var EPSE;
(function (EPSE) {
    var EBoundingBoxComponent = /** @class */ (function (_super) {
        __extends(EBoundingBoxComponent, _super);
        function EBoundingBoxComponent() {
            var _this = _super.call(this, "boundingbox") || this;
            _this.boundingBox = {
                visible: false,
                color: null,
                opacity: 0.2,
                transparent: true,
                draggFlag: false
            };
            return _this;
        }
        return EBoundingBoxComponent;
    }(ECS.Component));
    EPSE.EBoundingBoxComponent = EBoundingBoxComponent;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EGeometryComponent.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
var EPSE;
(function (EPSE) {
    var EGeometryComponent = /** @class */ (function (_super) {
        __extends(EGeometryComponent, _super);
        function EGeometryComponent() {
            var _this = _super.call(this, "geometry") || this;
            _this.getGeometry = function (type, parameter) {
                type = type || this.geometry.type;
                parameter = parameter || {};
                if (type === "Sphere") {
                    //球オブジェクトの形状オブジェクト
                    var _geometry = new THREE.SphereGeometry(parameter.radius || this.geometry.radius, //球の半径
                    parameter.widthSegments || this.geometry.widthSegments, //y軸周りの分割数
                    parameter.heightSegments || this.geometry.heightSegments, //y軸上の正の頂点から負の頂点までの分割数
                    parameter.phiStart || this.geometry.phiStart, //y軸回転の開始角度
                    parameter.phiLength || this.geometry.phiLength, //y軸回転角度
                    parameter.thetaStart || this.geometry.thetaStart, //x軸回転の開始角度。
                    parameter.thetaLength || this.geometry.thetaLength //x軸回転角度
                    );
                }
                else if (type === "Plane") {
                    //平面オブジェクトの形状オブジェクト
                    var _geometry = new THREE.PlaneGeometry(parameter.width || this.geometry.width, //平面の横幅（x軸方向）
                    parameter.height || this.geometry.height, //平面の縦軸（y軸方向）
                    parameter.widthSegments || this.geometry.widthSegments, //横方向分割数
                    parameter.heightSegments || this.geometry.heightSegments //縦方向分割数
                    );
                }
                else if (type === "Cube") {
                    //立方体オブジェクトの形状オブジェクト
                    var _geometry = new THREE.CubeGeometry(parameter.width || this.geometry.width, //立方体の横幅  （x軸方向）
                    parameter.depth || this.geometry.depth, //立方体の奥行き （y軸方向）
                    parameter.height || this.geometry.height, //立方体の高さ   （z軸方向）
                    parameter.widthSegments || this.geometry.widthSegments, //横方向分割数  
                    parameter.heightSegments || this.geometry.heightSegments, //縦方向分割数
                    parameter.depthSegments || this.geometry.depthSegments //奥行き方向分割数
                    );
                }
                else if (type === "Circle") {
                    //円オブジェクトの形状オブジェクト
                    var _geometry = new THREE.CircleGeometry(parameter.radius || this.geometry.radius, //円の半径
                    parameter.segments || this.geometry.segments, //円の分割数
                    parameter.thetaStart || this.geometry.thetaStart, //円弧の開始角度
                    parameter.thetaLength || this.geometry.thetaLength //円弧の終了角度
                    );
                }
                else if (type === "Cylinder") {
                    //円柱オブジェクトの形状オブジェクト
                    var _geometry = new THREE.CylinderGeometry(parameter.radiusTop || this.geometry.radiusTop, //円柱の上の円の半径
                    parameter.radiusBottom || this.geometry.radiusBottom, //円柱の下の円の半径
                    parameter.height || this.geometry.height, //円柱の高さ
                    parameter.radialSegments || this.geometry.radialSegments, //円の分割数
                    parameter.heightSegments || this.geometry.heightSegments, //円の高さ方向の分割数
                    parameter.openEnded || this.geometry.openEnded //筒状
                    );
                }
                else {
                    alert("形状オブジェクトの設定ミス");
                }
                return _geometry;
            };
            _this.geometry = {
                type: null
            };
            return _this;
        }
        return EGeometryComponent;
    }(ECS.Component));
    EPSE.EGeometryComponent = EGeometryComponent;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  ELocusComponent.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
var EPSE;
(function (EPSE) {
    var ELocusComponent = /** @class */ (function (_super) {
        __extends(ELocusComponent, _super);
        function ELocusComponent() {
            var _this = _super.call(this, "locus") || this;
            _this.locus = {
                enabled: false,
                visible: false,
                color: null,
                maxNum: 1000
            };
            return _this;
        }
        return ELocusComponent;
    }(ECS.Component));
    EPSE.ELocusComponent = ELocusComponent;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EMaterialComponent.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
var EPSE;
(function (EPSE) {
    var EMaterialComponent = /** @class */ (function (_super) {
        __extends(EMaterialComponent, _super);
        function EMaterialComponent() {
            var _this = _super.call(this, "material") || this;
            _this.material = {
                type: "Lambert",
                shading: "Flat",
                side: "Front",
                color: 0xFF0000,
                ambient: 0x990000,
                opacity: 1.0,
                transparent: false,
                emissive: 0x000000,
                specular: 0x111111,
                shininess: 30,
                castShadow: false,
                receiveShadow: false
            };
            return _this;
        }
        EMaterialComponent.prototype.getMaterial = function (type, parameter) {
            //材質の種類
            type = type || this.material.type;
            //材質パラメータ
            var _parameter = {
                color: this.material.color,
                ambient: this.material.ambient,
                transparent: this.material.transparent,
                opacity: this.material.opacity,
                emissive: this.material.emissive,
                specular: this.material.specular,
                shininess: this.material.shininess,
                side: this.material.side,
                shading: this.material.shading
            };
            //材質パラメータの更新
            //PHYSICS.overwriteProperty(_parameter, parameter);
            //カリングの指定
            if (_parameter.side === "Front") {
                //表面
                _parameter.side = THREE.FrontSide;
            }
            else if (_parameter.side === "Double") {
                //両面
                _parameter.side = THREE.DoubleSide;
            }
            else if (_parameter.side === "Back") {
                //背面
                _parameter.side = THREE.BackSide;
            }
            else {
                alert("描画面指定ミス");
            }
            //シェーディングの指定
            if (_parameter.shading === "Flat") {
                //フラットシェーディング
                _parameter.shading = THREE.FlatShading;
            }
            else if (_parameter.shading === "Smooth") {
                //スムースシェーディング
                _parameter.shading = THREE.SmoothShading;
            }
            else {
                alert("シェーディング指定ミス");
            }
            //材質オブジェクトの宣言と生成
            if (type === "Lambert") {
                //ランバート反射材質
                var _material = new THREE.MeshLambertMaterial(_parameter);
            }
            else if (type === "Phong") {
                //フォン反射材質
                var _material = new THREE.MeshPhongMaterial(_parameter);
            }
            else if (type === "Basic") {
                //発光材質
                var _material = new THREE.MeshBasicMaterial(_parameter);
            }
            else if (type === "Normal") {
                //法線材質
                var _material = new THREE.MeshNormalMaterial(_parameter);
            }
            else {
                alert("材質オブジェクト指定ミス");
            }
            return _material;
        };
        return EMaterialComponent;
    }(ECS.Component));
    EPSE.EMaterialComponent = EMaterialComponent;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EVelocityVectorComponent.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
var EPSE;
(function (EPSE) {
    var EVelocityVectorComponent = /** @class */ (function (_super) {
        __extends(EVelocityVectorComponent, _super);
        function EVelocityVectorComponent() {
            var _this = _super.call(this, "velocityvector") || this;
            _this.velocityVector = {
                enabled: false,
                visible: false,
                color: null,
                scale: 0.5
            };
            return _this;
        }
        return EVelocityVectorComponent;
    }(ECS.Component));
    EPSE.EVelocityVectorComponent = EVelocityVectorComponent;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EPhysCommon.ts
 *
 *
 * ========================================================================= */
var EPSE;
(function (EPSE) {
    EPSE.g = 9.8;
    EPSE.delta_t = 0.001;
    EPSE.skipRendering = 40;
    EPSE.pauseFlag = true;
    EPSE.locusFlag = "true"; // (true | false | pause)
    EPSE.velocityVectorFlag = "pause"; // (true | false | pause)
    EPSE.boundingBoxFlag = "dragg"; // (true | false | dragg)
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EPhysComponent.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
/// <reference path="../EUtils/EPhysCommon.ts" />
var EPSE;
(function (EPSE) {
    var EPhysComponent = /** @class */ (function (_super) {
        __extends(EPhysComponent, _super);
        function EPhysComponent() {
            var _this = _super.call(this, "physics") || this;
            _this.step = 0;
            //coefficient
            _this.r = new THREE.Vector3();
            _this.v = new THREE.Vector3();
            _this.a = new THREE.Vector3();
            _this.e = 1.0; //coefficient of restitution
            _this.mass = 1.0;
            _this.r_1 = new THREE.Vector3();
            _this.r_2 = new THREE.Vector3();
            //record data
            _this.recordData = false;
            _this.dynamic = false;
            _this.skipRecord = 100;
            _this.data = {};
            _this.data.x = [];
            _this.data.y = [];
            _this.data.z = [];
            _this.data.vx = [];
            _this.data.vy = [];
            _this.data.vz = [];
            _this.data.kinetic = [];
            _this.data.potential = [];
            _this.data.energy = [];
            return _this;
        }
        EPhysComponent.prototype.getForce = function () {
            var f = new THREE.Vector3(0, 0, -this.mass * EPSE.g);
            return f;
        };
        //mechanical energy calculation
        EPhysComponent.prototype.getEnergy = function () {
            var v2 = this.v.lengthSq();
            var kinetic = 1 / 2 * this.mass * v2;
            var z = (this.step === 0) ? this.r.z : this.r_1.z;
            var potential = this.mass * EPSE.g * z;
            return { kinetic: kinetic, potential: potential };
        };
        EPhysComponent.prototype.timeEvolution = function () {
            this.step++;
            //time interval
            var dt = EPSE.delta_t;
            var f = this.getForce();
            //update acceration
            this.a.x = f.x / this.mass;
            this.a.y = f.y / this.mass;
            this.a.z = f.z / this.mass;
            //Verlet algorithm
            this.computeTimeEvolution(dt);
            //record data
            this.recordDynamicData();
        };
        //Verlet algorithm(initial condition)
        EPhysComponent.prototype.computeInitialCondition = function () {
            var dt = EPSE.delta_t;
            var f = this.getForce();
            this.a = f.clone().divideScalar(this.mass);
            //「x_{-1}」
            this.r_1.x = this.r.x - this.v.x * dt + 1 / 2 * this.a.x * dt * dt;
            this.r_1.y = this.r.y - this.v.y * dt + 1 / 2 * this.a.y * dt * dt;
            this.r_1.z = this.r.z - this.v.z * dt + 1 / 2 * this.a.z * dt * dt;
        };
        //time evolution based on Verlet algorithm
        EPhysComponent.prototype.computeTimeEvolution = function (dt) {
            var x_ = this.r.x;
            var y_ = this.r.y;
            var z_ = this.r.z;
            //（ x_{n+1} = 2x_n - x_{n_1} + a_{n}\Delta t^2 ）
            this.r.x = 2 * this.r.x - this.r_1.x + this.a.x * dt * dt;
            this.r.y = 2 * this.r.y - this.r_1.y + this.a.y * dt * dt;
            this.r.z = 2 * this.r.z - this.r_1.z + this.a.z * dt * dt;
            this.v.x = (this.r.x - this.r_1.x) / (2 * dt);
            this.v.y = (this.r.y - this.r_1.y) / (2 * dt);
            this.v.z = (this.r.z - this.r_1.z) / (2 * dt);
            this.r_2.x = this.r_1.x;
            this.r_2.y = this.r_1.y;
            this.r_2.z = this.r_1.z;
            this.r_1.x = x_;
            this.r_1.y = y_;
            this.r_1.z = z_;
        };
        EPhysComponent.prototype.initDynamicData = function () {
            this.data.x = [];
            this.data.y = [];
            this.data.z = [];
            this.data.vx = [];
            this.data.vy = [];
            this.data.vz = [];
            this.data.kinetic = [];
            this.data.potential = [];
            this.data.energy = [];
        };
        EPhysComponent.prototype.recordDynamicData = function () {
            if (!this.recordData)
                return;
            if ((this.step == 0) || (this.step / this.skipRecord > this.data.x.length)) {
                var step, x, y, z;
                if (this.step == 0 || (!this.dynamic)) {
                    step = this.step;
                    x = this.r.x;
                    y = this.r.y;
                    z = this.r.z;
                }
                else {
                    step = this.step - 1;
                    x = this.r_1.x;
                    y = this.r_1.y;
                    z = this.r_1.z;
                }
                var time = step * EPSE.delta_t;
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
        };
        return EPhysComponent;
    }(ECS.Component));
    EPSE.EPhysComponent = EPhysComponent;
})(EPSE || (EPSE = {}));
/// <reference path="./EBoundingBoxComponent.ts" />
/// <reference path="./EGeometryComponent.ts" />
/// <reference path="./ELocusComponent.ts" />
/// <reference path="./EMaterialComponent.ts" />
/// <reference path="./EVelocityVectorComponent.ts" />
/// <reference path="./EPhysComponent.ts" />
/* =========================================================================
 *
 *  EPhysEntity.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/Entity.ts" />
/// <reference path="../EComponents/EComponents.ts" />
var EPSE;
(function (EPSE) {
    var EPhysEntity = /** @class */ (function (_super) {
        __extends(EPhysEntity, _super);
        function EPhysEntity() {
            var _this = _super.call(this, "physics_object") || this;
            //add physics object components'
            _this.c_physics = _this.addComponent(new EPSE.EPhysComponent());
            _this.c_boundingBox = _this.addComponent(new EPSE.EBoundingBoxComponent());
            _this.c_geometry = _this.addComponent(new EPSE.EGeometryComponent());
            _this.c_locus = _this.addComponent(new EPSE.ELocusComponent());
            _this.c_material = _this.addComponent(new EPSE.EMaterialComponent());
            _this.c_velocityVector = _this.addComponent(new EPSE.EVelocityVectorComponent());
            //user setting
            _this.visible = true;
            _this.draggable = false;
            _this.allowDrag = false;
            _this.CG = {};
            return _this;
        }
        EPhysEntity.prototype.create3DCG = function () {
            var geometry = this.c_geometry.getGeometry();
            var material = this.c_material.getMaterial();
            var boundingBox = this.c_boundingBox.boundingBox;
            this.CG = new THREE.Mesh(geometry, material);
            //マウスドラックによる移動を行う場合
            if (this.draggable) {
                //バウンディングボックスの計算
                this.CG.geometry.computeBoundingBox();
                //バウンディングボックスの幅の取得
                boundingBox.width = new THREE.Vector3().subVectors(this.CG.geometry.boundingBox.max, this.CG.geometry.boundingBox.min);
                //形状オブジェクトの宣言と生成
                var geometry = new THREE.CubeGeometry(boundingBox.width.x, boundingBox.width.y, boundingBox.width.z);
                //材質オブジェクトの宣言と生成
                var material = new THREE.MeshBasicMaterial({
                    color: boundingBox.color,
                    transparent: boundingBox.transparent,
                    opacity: boundingBox.opacity
                });
                //バウンディングボックスオブジェクトの生成
                boundingBox.CG = new THREE.Mesh(geometry, material);
                //バウンディングボックスオブジェクトのローカル座標系における中心座標を格納
                boundingBox.center = new THREE.Vector3().addVectors(this.CG.geometry.boundingBox.max, this.CG.geometry.boundingBox.min).divideScalar(2);
                //バウンディングボックスオブジェクトの位置を指定
                boundingBox.CG.position.copy(this.c_physics.r).add(boundingBox.center);
                //バウンディングボックスオブジェクトの表示の有無を指定
                boundingBox.CG.visible = boundingBox.visible;
                //バウンディング球オブジェクトのシーンへの追加
                //physLab.CG.scene.add(boundingBox.CG);
                //バウンディングボックスオブジェクトに３次元オブジェクトを指定
                boundingBox.CG.physObject = this;
            }
        };
        EPhysEntity.prototype.create = function () {
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
                velocityVector.CG = new THREE.ArrowHelper(this.c_physics.v.clone().normalize(), //方向ベクトル
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
                    position: {
                        itemSize: 3,
                        array: new Float32Array(locus.maxNum * 3),
                        numItems: locus.maxNum * 3,
                        dynamic: true
                    }
                };
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
        };
        EPhysEntity.prototype.update = function () {
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
        };
        EPhysEntity.prototype.updateLocus = function (color) {
            var locus = this.c_locus.locus;
            if (!locus.enabled)
                return;
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
            if (EPSE.locusFlag == "true") {
                flag = true;
            }
            else if (EPSE.locusFlag == "false") {
                flag = false;
            }
            else if (EPSE.locusFlag == "pause") {
                flag = (EPSE.pauseFlag) ? true : false;
            }
            //軌跡の表示
            locus.CG.visible = flag && locus.visible;
        };
        EPhysEntity.prototype.updateVelocityVector = function (color, scale) {
            var velocityVector = this.c_velocityVector.velocityVector;
            if (!velocityVector.enabled)
                return;
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
            if (EPSE.velocityVectorFlag == "true") {
                flag = true;
            }
            else if (EPSE.velocityVectorFlag == "false") {
                flag = false;
            }
            else if (EPSE.velocityVectorFlag == "pause") {
                flag = (EPSE.pauseFlag) ? true : false;
            }
            //子要素の可視化も指定
            for (var i = 0; i < velocityVector.CG.children.length; i++) {
                velocityVector.CG.children[i].visible = flag && velocityVector.visible;
            }
        };
        EPhysEntity.prototype.updateBoundingBox = function () {
            if (!this.draggable)
                return;
            var boundingBox = this.c_boundingBox.boundingBox;
            //バウンディングボックスの位置と姿勢の更新
            boundingBox.CG.position.copy(this.c_physics.r).add(boundingBox.center);
            //表示フラグ
            var flag = false;
            if (EPSE.boundingBoxFlag == "true") {
                flag = true;
            }
            else if (EPSE.boundingBoxFlag == "false") {
                flag = false;
            }
            else if (EPSE.boundingBoxFlag == "dragg") {
                flag = (boundingBox.draggFlag) ? true : false;
            }
            //バウンディングボックスの表示
            boundingBox.CG.visible = flag && boundingBox.visible;
            if (!this.c_physics.dynamic) {
                //マウスドラックによる３次元オブジェクトの移動速度
                this.c_physics.v = new THREE.Vector3().subVectors(this.c_physics.r, this.c_physics.r_1).divideScalar(EPSE.delta_t * EPSE.skipRendering);
                //過去の位置を格納
                this.c_physics.r_1.copy(this.c_physics.r);
            }
        };
        return EPhysEntity;
    }(ECS.Entity));
    EPSE.EPhysEntity = EPhysEntity;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EPhysSphere.ts
 *
 *
 * ========================================================================= */
/// <reference path="./EPhysEntity.ts" />
var EPSE;
(function (EPSE) {
    var EPhysSphere = /** @class */ (function (_super) {
        __extends(EPhysSphere, _super);
        function EPhysSphere() {
            var _this = _super.call(this) || this;
            _this.name = "sphere";
            _this.radius = 1.0;
            var geometry = _this.c_geometry.geometry;
            var material = _this.c_material.material;
            material.shading = "Smooth";
            //形状オブジェクト
            geometry.type = "Sphere";
            //３次元グラフィックスパラメータ
            geometry.radius = _this.radius; //球の半径
            geometry.widthSegments = 20; //y軸周りの分割数
            geometry.heightSegments = 20; //y軸上の正の頂点から負の頂点までの分割数
            geometry.phiStart = 0; //y軸回転の開始角度
            geometry.phiLength = Math.PI * 2; //y軸回転角度
            geometry.thetaStart = 0; //x軸回転の開始角度
            geometry.thetaLength = Math.PI; //x軸回転角度
            return _this;
        }
        return EPhysSphere;
    }(EPSE.EPhysEntity));
    EPSE.EPhysSphere = EPhysSphere;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  System.ts
 *  game execute logical
 *
 * ========================================================================= */
/// <reference path="./Entity.ts" />
var ECS;
(function (ECS) {
    var System = /** @class */ (function () {
        function System(name) {
            this.name = name;
        }
        System.prototype.Execute = function () {
            console.log("[" + this.name + "]System Execute!");
        };
        return System;
    }());
    ECS.System = System;
})(ECS || (ECS = {}));
/* =========================================================================
 *
 *  E3DSystem.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/System.ts" />
var EPSE;
(function (EPSE) {
    var E3DSystem = /** @class */ (function (_super) {
        __extends(E3DSystem, _super);
        function E3DSystem() {
            var _this = _super.call(this, "three_system") || this;
            _this.frameID = "Cvs_EPSE";
            _this.CG = {};
            _this.renderer = {
                clearColor: 0xFFFFFF,
                clearAlpha: 1.0,
                parameters: {
                    antialias: true,
                    stencil: true
                }
            };
            //カメラパラメータ
            _this.camera = {
                type: "Perspective",
                position: { x: 15, y: 0, z: 15 },
                up: { x: 0, y: 0, z: 1 },
                target: { x: 0, y: 0, z: 0 },
                fov: 45,
                near: 0.1,
                far: 500,
                left: -10,
                right: 10,
                top: 10,
                bottom: -10
            };
            //光源パラメータ
            _this.light = {
                type: "Directional",
                position: { x: 0, y: 0, z: 10 },
                target: { x: 0, y: 0, z: 0 },
                color: 0xFFFFFF,
                intensity: 1,
                distance: 0,
                angle: Math.PI / 4,
                exponent: 20,
                ambient: null //環境光源色
            };
            _this.shadow = {
                shadowMapEnabled: false,
                shadowMapWidth: 512,
                shadowMapHeight: 512,
                shadowCameraVisible: false,
                shadowCameraNear: 0.1,
                shadowCameraFar: 50,
                shadowCameraFov: 120,
                shadowCameraRight: 10,
                shadowCameraLeft: -10,
                shadowCameraTop: 10,
                shadowCameraBottom: -10,
                shadowDarkness: 0.5 //影の黒さ
            };
            //トラックボール
            _this.trackball = {
                enabled: false,
                noRotate: false,
                rotateSpeed: 2.0,
                noZoom: false,
                zoomSpeed: 1.0,
                noPan: false,
                panSpeed: 1.0,
                staticMoving: true,
                dynamicDampingFactor: 0.3
            };
            return _this;
        }
        E3DSystem.prototype.initThree = function () {
            //キャンバスフレームDOM要素の取得
            this.CG.canvasFrame = document.getElementById(this.frameID);
            //レンダラーオブジェクトの生成
            this.CG.renderer = new THREE.WebGLRenderer(this.renderer.parameters);
            if (!this.CG.renderer)
                alert('Three.js の初期化に失敗しました');
            //レンダラーのサイズの設定
            this.CG.renderer.setSize(this.CG.canvasFrame.clientWidth, this.CG.canvasFrame.clientHeight);
            //キャンバスフレームDOM要素にcanvas要素を追加
            this.CG.canvasFrame.appendChild(this.CG.renderer.domElement);
            //レンダラークリアーカラーの設定
            this.CG.renderer.setClearColor(this.renderer.clearColor, this.renderer.clearAlpha);
            //シャドーマップの利用
            this.CG.renderer.shadowMap.enabled = this.shadow.shadowMapEnabled;
            //シーンオブジェクトの生成
            this.CG.scene = new THREE.Scene();
        };
        E3DSystem.prototype.initCamera = function () {
            //カメラのタイプが透視投影（Perspective）の場合
            if (this.camera.type == "Perspective") {
                //透視投影カメラオブジェクトの生成
                this.CG.camera = new THREE.PerspectiveCamera(this.camera.fov, //視野角
                this.CG.canvasFrame.clientWidth / this.CG.canvasFrame.clientHeight, //アスペクト
                this.camera.near, //視体積手前までの距離
                this.camera.far //視体積の奥までの距離
                );
                //カメラのタイプが正投影（Orthographic）の場合
            }
            else if (this.camera.type == "Orthographic") {
                //正投影カメラオブジェクトの生成
                this.CG.camera = new THREE.OrthographicCamera(this.camera.left, //視体積の左までの距離
                this.camera.right, //視体積の右までの距離
                this.camera.top, //視体積の上までの距離
                this.camera.bottom, //視体積の下までの距離
                this.camera.near, //視体積手前までの距離
                this.camera.far //視体積の奥までの距離
                );
            }
            else {
                alert("カメラの設定ミス");
            }
            //カメラの位置の設定
            this.CG.camera.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
            //カメラの上ベクトルの設定
            this.CG.camera.up.set(this.camera.up.x, this.camera.up.y, this.camera.up.z);
            //カメラの中心位置ベクトルの設定（トラックボール利用時は自動的に無効）
            this.CG.camera.lookAt({
                x: this.camera.target.x,
                y: this.camera.target.y,
                z: this.camera.target.z
            });
            //トラックボールオブジェクトの宣言
            this.CG.trackball = new THREE.TrackballControls(this.CG.camera, this.CG.canvasFrame);
            //トラックボール動作範囲のサイズとオフセットの設定
            this.CG.trackball.screen.width = this.CG.canvasFrame.clientWidth; //横幅
            this.CG.trackball.screen.height = this.CG.canvasFrame.clientHeight; //縦幅
            this.CG.trackball.screen.offsetLeft = this.CG.canvasFrame.getBoundingClientRect().left; //左オフセット
            this.CG.trackball.screen.offsetTop = this.CG.canvasFrame.getBoundingClientRect().top; //上オフセット
            //トラックボールの回転無効化と回転速度の設定
            this.CG.trackball.noRotate = this.trackball.noRotate;
            this.CG.trackball.rotateSpeed = this.trackball.rotateSpeed;
            //トラックボールの拡大無効化と拡大速度の設定
            this.CG.trackball.noZoom = this.trackball.noZoom;
            this.CG.trackball.zoomSpeed = this.trackball.zoomSpeed;
            //トラックボールのカメラ中心移動の無効化と中心速度の設定
            this.CG.trackball.noPan = this.trackball.noPan;
            this.CG.trackball.panSpeed = this.trackball.panSpeed;
            this.CG.trackball.target = new THREE.Vector3(this.camera.target.x, this.camera.target.y, this.camera.target.z);
            //トラックボールのスタティックムーブの有効化
            this.CG.trackball.staticMoving = this.trackball.staticMoving;
            //トラックボールのダイナミックムーブ時の減衰定数
            this.CG.trackball.dynamicDampingFactor = this.trackball.dynamicDampingFactor;
            //トラックボール利用の有無
            this.CG.trackball.enabled = this.trackball.enabled;
        };
        E3DSystem.prototype.initLight = function () {
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
                }
                else if (shadowCamera instanceof THREE.SpotLight) {
                    //点光源の場合
                    shadowCamera.shadowCameraNear = parameter.shadowCameraNear;
                    shadowCamera.shadowCameraFar = parameter.shadowCameraFar;
                    shadowCamera.shadowCameraFov = parameter.shadowCameraFov;
                }
                else {
                    alert("シャドーカメラの設定ミス");
                }
            }
            if (this.light.type == "Directional") {
                //平行光源オブジェクトの生成
                this.CG.light = new THREE.DirectionalLight(this.light.color, //光源色
                this.light.intensity //光源強度
                );
                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {
                    setShadowCamera(this.CG.light, this.shadow);
                }
            }
            else if (this.light.type == "Spot") {
                //スポットライトオブジェクトの生成
                this.CG.light = new THREE.SpotLight(this.light.color, //光源色
                this.light.intensity, //光源強度
                this.light.distance, //距離減衰指数
                this.light.angle, //スポットライト光源の角度
                this.light.exponent //光軸からの減衰指数
                );
                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {
                    setShadowCamera(this.CG.light, this.shadow);
                }
            }
            else if (this.light.type == "Point") {
                //点光源オブジェクトの生成
                this.CG.light = new THREE.PointLight(this.light.color, //光源色
                this.light.intensity, //光源強度
                this.light.distance //距離減衰指数
                );
                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {
                    //シャドーカメラ用スポットライトオブジェクトの生成
                    this.CG.light.shadowCamera = new THREE.SpotLight();
                    //シャドーカメラ用の位置
                    this.CG.light.shadowCamera.position.set(this.light.position.x, this.light.position.y, this.light.position.z);
                    //スポットライト光源オブジェクトをシャドーマップ作成用のみに利用する
                    this.CG.light.shadowCamera.onlyShadow = true;
                    //シャドーカメラをシーンへ追加
                    this.CG.scene.add(this.CG.light.shadowCamera);
                    setShadowCamera(this.CG.light.shadowCamera, this.shadow);
                }
            }
            else {
                alert("光源の設定ミス");
            }
            //光源オブジェクトの位置の設定
            this.CG.light.position.set(this.light.position.x, this.light.position.y, this.light.position.z);
            //光源ターゲット用オブジェクトの生成
            this.CG.light.target = new THREE.Object3D();
            this.CG.light.target.position.set(this.light.target.x, this.light.target.y, this.light.target.z);
            //光源オブジェクトのシーンへの追加
            this.CG.scene.add(this.CG.light);
            if (this.light.ambient) {
                //環境光オブジェクトの生成
                this.CG.ambientLight = new THREE.AmbientLight(this.light.ambient);
                //環境光オブジェクトのシーンへの追加
                this.CG.scene.add(this.CG.ambientLight);
            }
        };
        E3DSystem.prototype.initDragg = function () {
        };
        E3DSystem.prototype.Execute = function () {
            _super.prototype.Execute.call(this);
            this.initThree();
            this.initCamera();
            this.initLight();
            this.initDragg();
        };
        return E3DSystem;
    }(ECS.System));
    EPSE.E3DSystem = E3DSystem;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EEventListenerSystem.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/System.ts" />
var EPSE;
(function (EPSE) {
    var EEventListenerSystem = /** @class */ (function (_super) {
        __extends(EEventListenerSystem, _super);
        function EEventListenerSystem() {
            return _super.call(this, "event_listener") || this;
        }
        EEventListenerSystem.prototype.init = function () {
        };
        return EEventListenerSystem;
    }(ECS.System));
    EPSE.EEventListenerSystem = EEventListenerSystem;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EPhysCore.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/System.ts" />
/// <reference path="./E3DSystem.ts" />
var EPSE;
(function (EPSE) {
    var EPhysCore = /** @class */ (function (_super) {
        __extends(EPhysCore, _super);
        function EPhysCore() {
            var _this = _super.call(this, "system_core") || this;
            _this.three_system = new EPSE.E3DSystem();
            return _this;
        }
        EPhysCore.prototype.Execute = function () {
            _super.prototype.Execute.call(this);
            this.three_system.Execute();
        };
        return EPhysCore;
    }(ECS.System));
    EPSE.EPhysCore = EPhysCore;
})(EPSE || (EPSE = {}));
/// <reference path="./E3DSystem.ts" />
/// <reference path="./EEventListenerSystem.ts" />
/// <reference path="./EPhysCore.ts" />
/// <reference path="./EEntities/EPhysSphere.ts" />
/// <reference path="./ESystems/ESystems.ts" />
var sphere = new EPSE.EPhysSphere();
console.log(sphere);
var phys_system = new EPSE.EPhysCore();
phys_system.Execute();
