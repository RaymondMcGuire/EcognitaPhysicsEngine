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
                var _geometry = new THREE.SphereGeometry();
                if (type === "Sphere") {
                    //球オブジェクトの形状オブジェクト
                    _geometry = new THREE.SphereGeometry(parameter.radius || this.geometry.radius, //球の半径
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
                    _geometry = new THREE.PlaneGeometry(parameter.width || this.geometry.width, //平面の横幅（x軸方向）
                    parameter.height || this.geometry.height, //平面の縦軸（y軸方向）
                    parameter.widthSegments || this.geometry.widthSegments, //横方向分割数
                    parameter.heightSegments || this.geometry.heightSegments //縦方向分割数
                    );
                }
                else if (type === "Cube") {
                    //立方体オブジェクトの形状オブジェクト
                    _geometry = new THREE.CubeGeometry(parameter.width || this.geometry.width, //立方体の横幅  （x軸方向）
                    parameter.depth || this.geometry.depth, //立方体の奥行き （y軸方向）
                    parameter.height || this.geometry.height, //立方体の高さ   （z軸方向）
                    parameter.widthSegments || this.geometry.widthSegments, //横方向分割数  
                    parameter.heightSegments || this.geometry.heightSegments, //縦方向分割数
                    parameter.depthSegments || this.geometry.depthSegments //奥行き方向分割数
                    );
                }
                else if (type === "Circle") {
                    //円オブジェクトの形状オブジェクト
                    _geometry = new THREE.CircleGeometry(parameter.radius || this.geometry.radius, //円の半径
                    parameter.segments || this.geometry.segments, //円の分割数
                    parameter.thetaStart || this.geometry.thetaStart, //円弧の開始角度
                    parameter.thetaLength || this.geometry.thetaLength //円弧の終了角度
                    );
                }
                else if (type === "Cylinder") {
                    //円柱オブジェクトの形状オブジェクト
                    _geometry = new THREE.CylinderGeometry(parameter.radiusTop || this.geometry.radiusTop, //円柱の上の円の半径
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
 *  EPhysCommon.ts
 *
 *
 * ========================================================================= */
var EPSE;
(function (EPSE) {
    EPSE.parameter = {};
    EPSE.g = 9.8;
    EPSE.delta_t = 0.001;
    EPSE.skipRendering = 40;
    EPSE.frameID = "Cvs_EPSE";
    EPSE.playButtonID = "play";
    EPSE.resetButtonID = "reset";
    EPSE.pictureID = "picture";
    EPSE.CG = {};
    EPSE.pauseFlag = true;
    EPSE.initFlag = true;
    EPSE.resetFlag = false;
    EPSE.makePictureFlag = true;
    EPSE.displayFPS = true;
    EPSE.draggable = true;
    EPSE.allowDrag = true;
    EPSE.locusFlag = "true"; // (true | false | pause)
    EPSE.velocityVectorFlag = "pause"; // (true | false | pause)
    EPSE.boundingBoxFlag = "dragg"; // (true | false | dragg)
    EPSE.overwriteTmpStr = "this";
    function overwriteProperty(object, parameter) {
        for (var propertyName in parameter) {
            if (!(parameter[propertyName] instanceof Object) || parameter[propertyName] instanceof Function) {
                object[propertyName] = parameter[propertyName];
            }
            else if (parameter[propertyName] instanceof Array) {
                object[propertyName] = [];
                for (var i = 0; i < parameter[propertyName].length; i++) {
                    object[propertyName].push(parameter[propertyName][i]);
                }
            }
            else if (parameter[propertyName] instanceof Object) {
                EPSE.overwriteTmpStr += "." + propertyName;
                object[propertyName] = object[propertyName] || {};
                overwriteProperty(object[propertyName], parameter[propertyName]);
            }
            else {
                console.log("error！");
            }
        }
        EPSE.overwriteTmpStr = "this";
    }
    EPSE.overwriteProperty = overwriteProperty;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EMaterialComponent.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
/// <reference path="../EUtils/EPhysCommon.ts" />
var EPSE;
(function (EPSE) {
    var EMaterialComponent = /** @class */ (function (_super) {
        __extends(EMaterialComponent, _super);
        function EMaterialComponent() {
            var _this = _super.call(this, "material") || this;
            _this.material = {
                type: "Lambert",
                side: "Front",
                color: 0xFF0000,
                opacity: 1.0,
                transparent: false,
                emissive: 0x000000,
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
                transparent: this.material.transparent,
                opacity: this.material.opacity,
                emissive: this.material.emissive,
                side: this.material.side
            };
            EPSE.overwriteProperty(_parameter, parameter);
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
            var _material = new THREE.MeshLambertMaterial(_parameter);
            if (type === "Lambert") {
                //ランバート反射材質
                _material = new THREE.MeshLambertMaterial(_parameter);
            }
            else if (type === "Phong") {
                //フォン反射材質
                _material = new THREE.MeshPhongMaterial(_parameter);
            }
            else if (type === "Basic") {
                //発光材質
                _material = new THREE.MeshBasicMaterial(_parameter);
            }
            else if (type === "Normal") {
                //法線材質
                _material = new THREE.MeshNormalMaterial(_parameter);
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
            //console.log(this.r);
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
                var step = void 0, x = void 0, y = void 0, z = void 0;
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
            _this.draggable = false;
            //add physics object components'
            _this.c_physics = _this.addComponent(new EPSE.EPhysComponent());
            _this.c_boundingBox = _this.addComponent(new EPSE.EBoundingBoxComponent());
            _this.c_geometry = _this.addComponent(new EPSE.EGeometryComponent());
            _this.c_locus = _this.addComponent(new EPSE.ELocusComponent());
            _this.c_material = _this.addComponent(new EPSE.EMaterialComponent());
            _this.c_velocityVector = _this.addComponent(new EPSE.EVelocityVectorComponent());
            //user setting
            _this.visible = true;
            _this.allowDrag = false;
            _this.CG = {};
            return _this;
        }
        EPhysEntity.prototype.create3DCG = function () {
            var geometry = this.c_geometry.getGeometry();
            var material = this.c_material.getMaterial();
            var boundingBox = this.c_boundingBox.boundingBox;
            this.CG = new THREE.Mesh(geometry, material);
            this.CG.obj = this;
            //add boundingbox
            if (this.draggable) {
                this.CG.geometry.computeBoundingBox();
                boundingBox.width = new THREE.Vector3().subVectors(this.CG.geometry.boundingBox.max, this.CG.geometry.boundingBox.min);
                geometry = new THREE.CubeGeometry(boundingBox.width.x, boundingBox.width.y, boundingBox.width.z);
                boundingBox.color = material.color;
                material = new THREE.MeshBasicMaterial({
                    color: boundingBox.color,
                    transparent: boundingBox.transparent,
                    opacity: boundingBox.opacity
                });
                boundingBox.CG = new THREE.Mesh(geometry, material);
                boundingBox.center = new THREE.Vector3().addVectors(this.CG.geometry.boundingBox.max, this.CG.geometry.boundingBox.min).divideScalar(2);
                boundingBox.CG.position.copy(this.c_physics.r).add(boundingBox.center);
                boundingBox.CG.visible = boundingBox.visible;
                EPSE.CG.scene.add(boundingBox.CG);
            }
        };
        EPhysEntity.prototype.create = function () {
            //create 3D CG
            this.create3DCG();
            var material = this.c_material.material;
            var velocityVector = this.c_velocityVector.velocityVector;
            var locus = this.c_locus.locus;
            this.CG.castShadow = material.castShadow;
            this.CG.receiveShadow = material.receiveShadow;
            //add object' CG to scene
            EPSE.CG.scene.add(this.CG);
            //velocity vector
            if (velocityVector.enabled) {
                //矢印オブジェクトの生成
                velocityVector.CG = new THREE.ArrowHelper(this.c_physics.v.clone().normalize(), //direction vector
                this.c_physics.r.clone(), //start point coordinate
                1, velocityVector.color);
                EPSE.CG.scene.add(velocityVector.CG);
            }
            //locus visualization
            if (locus.enabled) {
                var geometry = new THREE.BufferGeometry();
                var vertices = new Float32Array(locus.maxNum * 3);
                var bufferAttributes = new THREE.BufferAttribute(vertices, 3);
                bufferAttributes.dynamic = true;
                geometry.addAttribute('position', bufferAttributes);
                var material_1 = new THREE.LineBasicMaterial({ color: locus.color });
                locus.CG = new THREE.Line(geometry, material_1);
                EPSE.CG.scene.add(locus.CG);
            }
            //プロットデータ配列に初期値を代入
            this.c_physics.recordDynamicData();
            //r_{-1}の値を取得する
            this.c_physics.computeInitialCondition();
        };
        EPhysEntity.prototype.update = function () {
            this.CG.position.copy(this.c_physics.r);
            this.CG.visible = this.visible;
            for (var i = 0; i < this.CG.children.length; i++) {
                this.CG.children[i].visible = this.visible;
            }
            //locus visualization
            this.updateLocus();
            //velocity vector update
            this.updateVelocityVector();
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
            velocityVector.CG.position.copy(this.c_physics.r);
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
            boundingBox.CG.position.copy(this.c_physics.r).add(boundingBox.center);
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
            boundingBox.CG.visible = flag && boundingBox.visible;
            if (!this.c_physics.dynamic) {
                this.c_physics.v = new THREE.Vector3().subVectors(this.c_physics.r, this.c_physics.r_1).divideScalar(EPSE.delta_t * EPSE.skipRendering);
                this.c_physics.r_1.copy(this.c_physics.r);
            }
        };
        EPhysEntity.prototype.resetParameter = function () {
            var physics = this.c_physics;
            physics.initDynamicData();
            EPSE.overwriteProperty(this, this.param);
            physics.recordDynamicData();
            physics.computeInitialCondition();
        };
        return EPhysEntity;
    }(ECS.Entity));
    EPSE.EPhysEntity = EPhysEntity;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EPhysFloor.ts
 *
 *
 * ========================================================================= */
/// <reference path="./EPhysEntity.ts" />
var EPSE;
(function (EPSE) {
    var EPhysFloor = /** @class */ (function (_super) {
        __extends(EPhysFloor, _super);
        function EPhysFloor() {
            var _this = _super.call(this) || this;
            _this.name = "floor";
            //床一辺あたりのタイルの個数
            _this.n = 20;
            //タイルの一辺の長さ
            _this.width = 1.0;
            //タイルの色
            _this.colors = [0x999999, 0x333333];
            //床面での跳ね返り（内部プロパティ）
            _this.collisionFloor = false;
            //衝突判定用平面の表示
            _this.collisionFloorVisible = false;
            //衝突検知の無効化
            _this.collision = false;
            return _this;
        }
        EPhysFloor.prototype.create3DCG = function () {
            //床オブジェクトの生成
            this.CG = new THREE.Object3D();
            for (var i = -this.n / 2; i < this.n / 2; i++) {
                for (var j = -this.n / 2; j < this.n / 2; j++) {
                    //位置ベクトル
                    var x = (j + 0.5) * this.width;
                    var y = (i + 0.5) * this.width;
                    //一辺の長さ「width」の正方形の形状オブジェクトの宣言と生成
                    var geometry = new THREE.PlaneGeometry(this.width, this.width);
                    var parameter_1 = {
                        color: this.colors[Math.abs(i + j) % this.colors.length]
                    };
                    //市松模様とするための材質オブジェクトを生成
                    var material = this.c_material.getMaterial(this.c_material.material.type, parameter_1);
                    //平面オブジェクトの宣言と生成
                    var plane = new THREE.Mesh(geometry, material);
                    //平面オブジェクトの位置の設定
                    plane.position.set(x, y, 0);
                    //平面オブジェクトに影を描画
                    plane.receiveShadow = this.c_material.material.receiveShadow;
                    //平面オブジェクトを床オブジェクトへ追加
                    this.CG.add(plane);
                }
            }
        };
        return EPhysFloor;
    }(EPSE.EPhysEntity));
    EPSE.EPhysFloor = EPhysFloor;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  EPhysSphere.ts
 *
 *
 * ========================================================================= */
/// <reference path="./EPhysEntity.ts" />
/// <reference path="../EUtils/EPhysCommon.ts" />
var EPSE;
(function (EPSE) {
    var EPhysSphere = /** @class */ (function (_super) {
        __extends(EPhysSphere, _super);
        function EPhysSphere(param) {
            var _this = _super.call(this) || this;
            //basic element setting
            _this.param = param;
            _this.name = "sphere";
            _this.radius = 1.0;
            _this.draggable = true;
            //overwrite param
            EPSE.overwriteProperty(_this, _this.param);
            var geometry = _this.c_geometry.geometry;
            var material = _this.c_material.material;
            //material setting
            material.shading = "Smooth";
            //geometry setting
            geometry.type = "Sphere";
            geometry.radius = _this.radius;
            geometry.widthSegments = 20;
            geometry.heightSegments = 20;
            geometry.phiStart = 0;
            geometry.phiLength = Math.PI * 2;
            geometry.thetaStart = 0;
            geometry.thetaLength = Math.PI;
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
/// <reference path="../EUtils/EPhysCommon.ts" />
var EPSE;
(function (EPSE) {
    var E3DSystem = /** @class */ (function (_super) {
        __extends(E3DSystem, _super);
        function E3DSystem() {
            var _this = _super.call(this, "three_system") || this;
            _this.draggableObjects = [];
            _this.renderer = {
                clearColor: 0xE1FCFF,
                clearAlpha: 1.0,
                parameters: {
                    antialias: true,
                    stencil: true
                }
            };
            //カメラパラメータ
            _this.camera = {
                type: "Perspective",
                position: { x: 20, y: 0, z: 10 },
                up: { x: 0, y: 0, z: 1 },
                target: { x: 0, y: 0, z: 2 },
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
                position: { x: 0, y: 0, z: 15 },
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
                enabled: true,
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
            EPSE.CG.canvasFrame = document.getElementById(EPSE.frameID);
            EPSE.CG.renderer = new THREE.WebGLRenderer(this.renderer.parameters);
            if (!EPSE.CG.renderer)
                alert('Three.js Error');
            EPSE.CG.renderer.setSize(EPSE.CG.canvasFrame.clientWidth, EPSE.CG.canvasFrame.clientHeight);
            EPSE.CG.canvasFrame.appendChild(EPSE.CG.renderer.domElement);
            EPSE.CG.renderer.setClearColor(this.renderer.clearColor, this.renderer.clearAlpha);
            EPSE.CG.renderer.shadowMap.enabled = this.shadow.shadowMapEnabled;
            EPSE.CG.scene = new THREE.Scene();
        };
        E3DSystem.prototype.initCamera = function () {
            //カメラのタイプが透視投影（Perspective）の場合
            if (this.camera.type == "Perspective") {
                //透視投影カメラオブジェクトの生成
                EPSE.CG.camera = new THREE.PerspectiveCamera(this.camera.fov, //視野角
                EPSE.CG.canvasFrame.clientWidth / EPSE.CG.canvasFrame.clientHeight, //アスペクト
                this.camera.near, //視体積手前までの距離
                this.camera.far //視体積の奥までの距離
                );
                //カメラのタイプが正投影（Orthographic）の場合
            }
            else if (this.camera.type == "Orthographic") {
                //正投影カメラオブジェクトの生成
                EPSE.CG.camera = new THREE.OrthographicCamera(this.camera.left, //視体積の左までの距離
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
            EPSE.CG.camera.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
            //カメラの上ベクトルの設定
            EPSE.CG.camera.up.set(this.camera.up.x, this.camera.up.y, this.camera.up.z);
            //カメラの中心位置ベクトルの設定（トラックボール利用時は自動的に無効）
            EPSE.CG.camera.lookAt({
                x: this.camera.target.x,
                y: this.camera.target.y,
                z: this.camera.target.z
            });
            //トラックボールオブジェクトの宣言
            EPSE.CG.trackball = new THREE.TrackballControls(EPSE.CG.camera, EPSE.CG.canvasFrame);
            //トラックボール動作範囲のサイズとオフセットの設定
            EPSE.CG.trackball.screen.width = EPSE.CG.canvasFrame.clientWidth; //横幅
            EPSE.CG.trackball.screen.height = EPSE.CG.canvasFrame.clientHeight; //縦幅
            EPSE.CG.trackball.screen.offsetLeft = EPSE.CG.canvasFrame.getBoundingClientRect().left; //左オフセット
            EPSE.CG.trackball.screen.offsetTop = EPSE.CG.canvasFrame.getBoundingClientRect().top; //上オフセット
            //トラックボールの回転無効化と回転速度の設定
            EPSE.CG.trackball.noRotate = this.trackball.noRotate;
            EPSE.CG.trackball.rotateSpeed = this.trackball.rotateSpeed;
            //トラックボールの拡大無効化と拡大速度の設定
            EPSE.CG.trackball.noZoom = this.trackball.noZoom;
            EPSE.CG.trackball.zoomSpeed = this.trackball.zoomSpeed;
            //トラックボールのカメラ中心移動の無効化と中心速度の設定
            EPSE.CG.trackball.noPan = this.trackball.noPan;
            EPSE.CG.trackball.panSpeed = this.trackball.panSpeed;
            EPSE.CG.trackball.target = new THREE.Vector3(this.camera.target.x, this.camera.target.y, this.camera.target.z);
            //トラックボールのスタティックムーブの有効化
            EPSE.CG.trackball.staticMoving = this.trackball.staticMoving;
            //トラックボールのダイナミックムーブ時の減衰定数
            EPSE.CG.trackball.dynamicDampingFactor = this.trackball.dynamicDampingFactor;
            //トラックボール利用の有無
            EPSE.CG.trackball.enabled = this.trackball.enabled;
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
                EPSE.CG.light = new THREE.DirectionalLight(this.light.color, //光源色
                this.light.intensity //光源強度
                );
                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {
                    setShadowCamera(EPSE.CG.light, this.shadow);
                }
            }
            else if (this.light.type == "Spot") {
                //スポットライトオブジェクトの生成
                EPSE.CG.light = new THREE.SpotLight(this.light.color, //光源色
                this.light.intensity, //光源強度
                this.light.distance, //距離減衰指数
                this.light.angle, //スポットライト光源の角度
                this.light.exponent //光軸からの減衰指数
                );
                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {
                    setShadowCamera(EPSE.CG.light, this.shadow);
                }
            }
            else if (this.light.type == "Point") {
                //点光源オブジェクトの生成
                EPSE.CG.light = new THREE.PointLight(this.light.color, //光源色
                this.light.intensity, //光源強度
                this.light.distance //距離減衰指数
                );
                //シャドーマッピングを行う場合
                if (this.shadow.shadowMapEnabled) {
                    //シャドーカメラ用スポットライトオブジェクトの生成
                    EPSE.CG.light.shadowCamera = new THREE.SpotLight();
                    //シャドーカメラ用の位置
                    EPSE.CG.light.shadowCamera.position.set(this.light.position.x, this.light.position.y, this.light.position.z);
                    //スポットライト光源オブジェクトをシャドーマップ作成用のみに利用する
                    EPSE.CG.light.shadowCamera.onlyShadow = true;
                    //シャドーカメラをシーンへ追加
                    EPSE.CG.scene.add(EPSE.CG.light.shadowCamera);
                    setShadowCamera(EPSE.CG.light.shadowCamera, this.shadow);
                }
            }
            else {
                alert("光源の設定ミス");
            }
            //光源オブジェクトの位置の設定
            EPSE.CG.light.position.set(this.light.position.x, this.light.position.y, this.light.position.z);
            //光源ターゲット用オブジェクトの生成
            EPSE.CG.light.target = new THREE.Object3D();
            EPSE.CG.light.target.position.set(this.light.target.x, this.light.target.y, this.light.target.z);
            //光源オブジェクトのシーンへの追加
            EPSE.CG.scene.add(EPSE.CG.light);
            if (this.light.ambient) {
                //環境光オブジェクトの生成
                EPSE.CG.ambientLight = new THREE.AmbientLight(this.light.ambient);
                //環境光オブジェクトのシーンへの追加
                EPSE.CG.scene.add(EPSE.CG.ambientLight);
            }
        };
        E3DSystem.prototype.initDragg = function () {
            var _this = this;
            if (!EPSE.draggable)
                return;
            var elementOffsetLeft = 0, elementOffsetTop = 0;
            var offset = new THREE.Vector3();
            var INTERSECTED = null;
            var SELECTED = null;
            //un-visible plane(for drag function)
            var geometry = new THREE.PlaneGeometry(200, 200, 8, 8);
            var material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
            var plane = new THREE.Mesh(geometry, material);
            plane.material.visible = false;
            EPSE.CG.scene.add(plane);
            EPSE.CG.canvasFrame.addEventListener('mousemove', function (event) {
                //hide bounding box
                for (var i = 0; i < _this.draggableObjects.length; i++) {
                    _this.draggableObjects[i].obj.c_boundingBox.boundingBox.draggFlag = false;
                }
                if (!EPSE.allowDrag)
                    return;
                elementOffsetLeft = EPSE.CG.canvasFrame.getBoundingClientRect().left;
                elementOffsetTop = EPSE.CG.canvasFrame.getBoundingClientRect().top;
                //get mouse coord in screen
                var mx = ((event.clientX - elementOffsetLeft) / EPSE.CG.canvasFrame.clientWidth) * 2 - 1;
                var my = -((event.clientY - elementOffsetTop) / EPSE.CG.canvasFrame.clientHeight) * 2 + 1;
                var vector = new THREE.Vector3(mx, my, 0.5);
                vector.unproject(EPSE.CG.camera);
                vector = vector.sub(EPSE.CG.camera.position).normalize();
                var raycaster = new THREE.Raycaster(EPSE.CG.camera.position, vector);
                if (SELECTED) {
                    var intersects = raycaster.intersectObject(plane);
                    var vec3 = intersects[0].point;
                    SELECTED.obj.c_boundingBox.boundingBox.CG.position.copy(vec3.sub(offset));
                    SELECTED.obj.c_physics.r.copy(SELECTED.obj.c_boundingBox.boundingBox.CG.position).sub(SELECTED.obj.c_boundingBox.boundingBox.center);
                    SELECTED.obj.c_boundingBox.boundingBox.draggFlag = true;
                    _this.mouseDraggEvent(SELECTED.obj);
                    return;
                }
                var intersects = raycaster.intersectObjects(_this.draggableObjects);
                if (intersects.length > 0) {
                    if (INTERSECTED != intersects[0].object) {
                        if (!intersects[0].object.obj.allowDrag)
                            return;
                        INTERSECTED = intersects[0].object;
                        plane.position.copy(INTERSECTED.position);
                        plane.lookAt(EPSE.CG.camera.position);
                    }
                    //show bounding box
                    INTERSECTED.obj.c_boundingBox.boundingBox.draggFlag = true;
                    EPSE.CG.canvasFrame.style.cursor = 'pointer';
                }
                else {
                    INTERSECTED = null;
                    EPSE.CG.canvasFrame.style.cursor = 'auto';
                }
            }, false);
            EPSE.CG.canvasFrame.addEventListener('mousedown', function (event) {
                if (!EPSE.allowDrag)
                    return;
                var mx = ((event.clientX - elementOffsetLeft) / EPSE.CG.canvasFrame.clientWidth) * 2 - 1;
                var my = -((event.clientY - elementOffsetTop) / EPSE.CG.canvasFrame.clientHeight) * 2 + 1;
                var vector = new THREE.Vector3(mx, my, 0.5);
                vector.unproject(EPSE.CG.camera);
                vector = vector.sub(EPSE.CG.camera.position).normalize();
                var raycaster = new THREE.Raycaster(EPSE.CG.camera.position, vector);
                var intersects = raycaster.intersectObjects(_this.draggableObjects);
                if (intersects.length > 0) {
                    if (!intersects[0].object.obj.allowDrag)
                        return;
                    EPSE.CG.trackball.enabled = false;
                    SELECTED = intersects[0].object;
                    //call select event 
                    _this.mouseDownEvent(SELECTED.obj);
                    var intersects = raycaster.intersectObject(plane);
                    var vec3 = intersects[0].point;
                    offset.copy(vec3).sub(plane.position);
                    EPSE.CG.canvasFrame.style.cursor = 'move';
                }
            }, false);
            EPSE.CG.canvasFrame.addEventListener('mouseup', function (event) {
                EPSE.CG.trackball.enabled = _this.trackball.enabled;
                EPSE.CG.canvasFrame.style.cursor = 'auto';
                if (!EPSE.allowDrag)
                    return;
                if (INTERSECTED && SELECTED) {
                    plane.position.copy(INTERSECTED.position);
                    //update new "r" for parameter
                    SELECTED.obj.param.c_physics.r = SELECTED.obj.c_physics.r;
                    if (SELECTED.obj.c_physics.dynamic)
                        SELECTED.obj.resetParameter();
                    _this.mouseUpEvent(SELECTED.obj);
                    EPSE.makePictureFlag = true;
                    SELECTED = null;
                }
            }, false);
        };
        E3DSystem.prototype.mouseDownEvent = function (physObject) {
        };
        //３次元オブジェクトがマウスドラックされた時に実行
        E3DSystem.prototype.mouseDraggEvent = function (physObject) {
        };
        //３次元オブジェクトがマウスアップされた時に実行
        E3DSystem.prototype.mouseUpEvent = function (physObject) {
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
/// <reference path="../EUtils/EPhysCommon.ts" />
var EPSE;
(function (EPSE) {
    var EEventListenerSystem = /** @class */ (function (_super) {
        __extends(EEventListenerSystem, _super);
        function EEventListenerSystem() {
            return _super.call(this, "event_listener") || this;
        }
        EEventListenerSystem.prototype.Execute = function () {
            var _this = this;
            _super.prototype.Execute.call(this);
            if (EPSE.displayFPS) {
                //FPS
                this.stats = new Stats();
                document.getElementById(EPSE.frameID).appendChild(this.stats.domElement);
            }
            if (EPSE.playButtonID) {
                $("#" + EPSE.playButtonID).button({
                    text: false,
                    label: "start",
                    icons: {
                        primary: "ui-icon-play"
                    }
                }).click(function () {
                    EPSE.initFlag = false;
                    EPSE.pauseFlag = !EPSE.pauseFlag;
                    _this.switchButton();
                });
            }
            else {
                EPSE.initFlag = false;
                EPSE.pauseFlag = false;
            }
            if (EPSE.resetButtonID) {
                $("#" + EPSE.resetButtonID).button({
                    text: false,
                    label: "reset",
                    icons: {
                        primary: "ui-icon-stop"
                    }
                }).click(function () {
                    EPSE.resetFlag = true;
                    EPSE.pauseFlag = true;
                    _this.switchButton();
                });
            }
            if (EPSE.pictureID) {
                $("#" + EPSE.pictureID).button({
                    label: "capture",
                    text: false,
                    icons: {
                        primary: "ui-icon-image"
                    }
                }).click(function () {
                    EPSE.makePictureFlag = true;
                });
            }
        };
        EEventListenerSystem.prototype.switchButton = function () {
            if (EPSE.pauseFlag) {
                var label = (EPSE.resetFlag) ? "start" : "restart";
                $("#" + EPSE.playButtonID).button("option", {
                    label: label,
                    icons: { primary: "ui-icon-play" }
                });
                $("#" + EPSE.pictureID).css('visibility', 'visible');
            }
            else {
                var label = "pause";
                $("#" + EPSE.playButtonID).button("option", {
                    label: label,
                    icons: { primary: "ui-icon-pause" }
                });
                $("#" + EPSE.pictureID).css('visibility', 'hidden');
            }
            EPSE.makePictureFlag = true;
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
/// <reference path="../EUtils/EPhysCommon.ts" />
/// <reference path="./E3DSystem.ts" />
/// <reference path="./EEventListenerSystem.ts" />
var EPSE;
(function (EPSE) {
    var EPhysCore = /** @class */ (function (_super) {
        __extends(EPhysCore, _super);
        function EPhysCore() {
            var _this = _super.call(this, "system_core") || this;
            _this.step = 0;
            _this.objects = [];
            _this.three_system = new EPSE.E3DSystem();
            _this.event_listener_system = new EPSE.EEventListenerSystem();
            return _this;
        }
        EPhysCore.prototype.Execute = function () {
            _super.prototype.Execute.call(this);
            this.event_listener_system.Execute();
            this.three_system.Execute();
            for (var i = 0; i < this.objects.length; i++) {
                this.createPhysObject(this.objects[i]);
            }
            this.loop();
        };
        EPhysCore.prototype.createPhysObject = function (physObject) {
            physObject.create();
            if (physObject.draggable) {
                this.three_system.draggableObjects.push(physObject.CG);
            }
        };
        EPhysCore.prototype.checkFlags = function () {
            if (EPSE.resetFlag) {
                for (var i = 0; i < this.objects.length; i++) {
                    if (this.objects[i].c_physics.data.x.length == 0)
                        continue;
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
                EPSE.resetFlag = false;
                EPSE.pauseFlag = true;
                EPSE.makePictureFlag = true;
                EPSE.initFlag = true;
                this.step = 0;
                EPSE.allowDrag = EPSE.draggable;
            }
        };
        EPhysCore.prototype.timeEvolution = function () {
            if (EPSE.pauseFlag)
                return;
            for (var i = 0; i < EPSE.skipRendering; i++) {
                this.step++;
                for (var j = 0; j < this.objects.length; j++) {
                    if (!this.objects[j].c_physics.dynamic)
                        continue;
                    this.objects[j].allowDrag = false;
                    for (var k = this.objects[j].c_physics.step; k <= this.step; k++) {
                        //console.log(this.objects[j].c_physics.dynamic);
                        this.objects[j].c_physics.timeEvolution();
                    }
                }
            }
        };
        EPhysCore.prototype.makePicture = function () {
            if (!EPSE.makePictureFlag)
                return;
            if (EPSE.pictureID) {
                //canvas->DataURL
                document.getElementById(EPSE.pictureID).href = EPSE.CG.renderer.domElement.toDataURL("image/png");
                var time = EPSE.delta_t * this.step;
                document.getElementById(EPSE.pictureID).download = time.toFixed(2) + ".png";
            }
            EPSE.makePictureFlag = false;
        };
        EPhysCore.prototype.loop = function () {
            EPSE.CG.trackball.update();
            //FPS
            if (this.event_listener_system.stats)
                this.event_listener_system.stats.update();
            this.checkFlags();
            this.timeEvolution();
            for (var i = 0; i < this.objects.length; i++) {
                this.objects[i].update();
            }
            EPSE.CG.renderer.render(EPSE.CG.scene, EPSE.CG.camera);
            this.makePicture();
            requestAnimationFrame(this.loop.bind(this));
        };
        return EPhysCore;
    }(ECS.System));
    EPSE.EPhysCore = EPhysCore;
})(EPSE || (EPSE = {}));
/// <reference path="./E3DSystem.ts" />
/// <reference path="./EEventListenerSystem.ts" />
/// <reference path="./EPhysCore.ts" />
/// <reference path="./EEntities/EPhysFloor.ts" />
/// <reference path="./EEntities/EPhysSphere.ts" />
/// <reference path="./ESystems/ESystems.ts" />
var floor = new EPSE.EPhysFloor();
var sphere = new EPSE.EPhysSphere({
    allowDrag: true,
    c_locus: {
        locus: {
            enabled: true,
            visible: true,
            color: 0xFF00FF,
            maxNum: 1000
        }
    },
    c_velocityVector: {
        velocityVector: {
            enabled: true,
            visible: true,
            color: new THREE.Color(0xFF00FF),
            scale: 0.5
        }
    },
    c_boundingBox: {
        boundingBox: {
            visible: true
        }
    },
    c_physics: {
        r: new THREE.Vector3(0, 0, 2),
        v: new THREE.Vector3(0, -5, 12),
        dynamic: true,
        recordData: true,
        skipRecord: 50
    }
});
var phys_system = new EPSE.EPhysCore();
phys_system.objects.push(floor);
phys_system.objects.push(sphere);
phys_system.Execute();
