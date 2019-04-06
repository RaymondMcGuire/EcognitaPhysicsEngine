var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* =========================================================================
 *
 *  math_utils.ts
 *  simple math functions
 * ========================================================================= */
var EMathLib;
(function (EMathLib) {
    function absMax(x, y) {
        return (x * x > y * y) ? x : y;
    }
    EMathLib.absMax = absMax;
    function absMin(x, y) {
        return (x * x < y * y) ? x : y;
    }
    EMathLib.absMin = absMin;
    function muldec(x, y) {
        return ((x * 10) * (y * 10)) / 100;
    }
    EMathLib.muldec = muldec;
})(EMathLib || (EMathLib = {}));
/* =========================================================================
 *
 *  vector.ts
 *  T-D vector data
 *  T:type,default setting is number
 *  D:dimension
 * ========================================================================= */
/// <reference path="./math_utils.ts" />
var EMathLib;
(function (EMathLib) {
    var Vector = /** @class */ (function () {
        //constructs vector with parameters or zero
        function Vector(dimension, params) {
            this._dimension = dimension;
            if (params == undefined) {
                //init n dimension vector data,setting all 0
                this._elements = new Array(dimension);
                for (var _i = 0; _i < dimension; _i++) {
                    this._elements[_i] = 0;
                }
            }
            else {
                this._elements = new Array(dimension);
                for (var _i = 0; _i < params.length; _i++) {
                    this._elements[_i] = params[_i];
                }
            }
        }
        Vector.prototype.clone = function () {
            return new Vector(this._dimension, this._elements);
        };
        Vector.prototype.set = function (params) {
            if (params.size() != this.size()) {
                console.log("dimension is not correct!");
                return undefined;
            }
            for (var _i = 0; _i < params.size(); _i++) {
                this._elements[_i] = params.data()[_i];
            }
        };
        Vector.prototype.setZero = function () {
            for (var _i = 0; _i < this._dimension; _i++) {
                this._elements[_i] = 0;
            }
        };
        Vector.prototype.setOne = function () {
            for (var _i = 0; _i < this._dimension; _i++) {
                this._elements[_i] = 1;
            }
        };
        Vector.prototype.data = function () { return this._elements; };
        Vector.prototype.at = function (idx) {
            if (idx < 0 || idx >= this.size()) {
                console.log("index is not correct!");
                return undefined;
            }
            return this._elements[idx];
        };
        Vector.prototype.dot = function (others) {
            if (others.size() != this.size()) {
                console.log("dimension is not correct!");
                return undefined;
            }
            var ret = 0;
            for (var _i = 0; _i < this.size(); _i++) {
                ret += this._elements[_i] * others.data()[_i];
            }
            return ret;
        };
        Vector.prototype.lengthSquared = function () { return this.dot(this); };
        Vector.prototype.length = function () { return Math.sqrt(this.lengthSquared()); };
        Vector.prototype.normalize = function () { this.idiv(this.length()); };
        Vector.prototype.sum = function () {
            var ret = 0;
            for (var _i = 0; _i < this._dimension; _i++) {
                ret += this._elements[_i];
            }
            return ret;
        };
        Vector.prototype.size = function () { return this._dimension; };
        Vector.prototype.avg = function () { return this.sum() / this.size(); };
        Vector.prototype.min = function () {
            var minVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                minVal = Math.min(minVal, this._elements[_i]);
            }
            return minVal;
        };
        Vector.prototype.max = function () {
            var maxVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                maxVal = Math.max(maxVal, this._elements[_i]);
            }
            return maxVal;
        };
        Vector.prototype.absmax = function () {
            var absMaxVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                absMaxVal = EMathLib.absMax(absMaxVal, this._elements[_i]);
            }
            return absMaxVal;
        };
        Vector.prototype.absmin = function () {
            var absMinVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                absMinVal = EMathLib.absMin(absMinVal, this._elements[_i]);
            }
            return absMinVal;
        };
        Vector.prototype.distanceSquaredTo = function (others) {
            if (others.size() != this.size()) {
                console.log("dimension is not correct!");
                return undefined;
            }
            var ret = 0;
            for (var _i = 0; _i < this.size(); _i++) {
                var diff = this._elements[_i] - others.data()[_i];
                ret += diff * diff;
            }
            return ret;
        };
        Vector.prototype.distanceTo = function (others) {
            return Math.sqrt(this.distanceSquaredTo(others));
        };
        Vector.prototype.isEqual = function (others) {
            if (this.size() != others.size())
                return false;
            for (var _i = 0; _i < this.size(); _i++) {
                if (this.at(_i) != others.at(_i))
                    return false;
            }
            return true;
        };
        Vector.prototype.isSimilar = function (others, epsilon) {
            if (this.size() != others.size())
                return false;
            for (var _i = 0; _i < this.size(); _i++) {
                if (Math.abs(this.at(_i) - others.at(_i)) > epsilon)
                    return false;
            }
            return true;
        };
        Vector.prototype.add = function (params) {
            if (typeof (params) == 'object') {
                var v = params;
                if (v.size() != this.size())
                    return undefined;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] += v.data()[_i];
                }
                return newV;
            }
            else if (typeof (params) == 'number') {
                var s = params;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] += s;
                }
                return newV;
            }
            return undefined;
        };
        Vector.prototype.sub = function (params) {
            if (typeof (params) == 'object') {
                var v = params;
                if (v.size() != this.size())
                    return undefined;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] -= v.data()[_i];
                }
                return newV;
            }
            else if (typeof (params) == 'number') {
                var s = params;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] -= s;
                }
                return newV;
            }
            return undefined;
        };
        Vector.prototype.mul = function (params) {
            if (typeof (params) == 'object') {
                var v = params;
                if (v.size() != this.size())
                    return undefined;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] *= v.data()[_i];
                }
                return newV;
            }
            else if (typeof (params) == 'number') {
                var s = params;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] *= s;
                }
                return newV;
            }
            return undefined;
        };
        Vector.prototype.div = function (params) {
            if (typeof (params) == 'object') {
                var v = params;
                if (v.size() != this.size())
                    return undefined;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] /= v.data()[_i];
                }
                return newV;
            }
            else if (typeof (params) == 'number') {
                var s = params;
                if (s == 0)
                    return undefined;
                var newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] /= s;
                }
                return newV;
            }
            return undefined;
        };
        Vector.prototype.idiv = function (params) { this.set(this.div(params)); };
        Vector.prototype.iadd = function (params) { this.set(this.add(params)); };
        Vector.prototype.isub = function (params) { this.set(this.sub(params)); };
        Vector.prototype.imul = function (params) { this.set(this.mul(params)); };
        Vector.prototype.setAt = function (idx, val) {
            if (idx < 0 || idx >= this.size()) {
                return undefined;
            }
            this._elements[idx] = val;
        };
        return Vector;
    }());
    EMathLib.Vector = Vector;
})(EMathLib || (EMathLib = {}));
/* =========================================================================
 *
 *  Euler_method.ts
 *
 *
 * ========================================================================= */
/// <reference path="../extlib/EMathLib/vector.ts" />
var EPSE;
(function (EPSE) {
    var Euler_method = /** @class */ (function () {
        function Euler_method(R, omega, T_MAX, DeltaT) {
            if (R === void 0) { R = 1.0; }
            if (omega === void 0) { omega = 2.0 * Math.PI / 10; }
            if (T_MAX === void 0) { T_MAX = 10; }
            if (DeltaT === void 0) { DeltaT = 1.0; }
            this._omega = omega;
            this._R = R;
            this._v0 = this._R * this._omega;
            this._deltaT = DeltaT;
            this._N = T_MAX / this._deltaT;
            this._data = [];
        }
        Euler_method.prototype._acceleration = function (r) {
            //Uniform Circular Motion
            //a(t) = -omega^2 * r(t)
            return r.mul(-this._omega * this._omega);
        };
        Euler_method.prototype.Calculate = function () {
            var r = new EMathLib.Vector(3, [this._R, 0, 0]);
            var v = new EMathLib.Vector(3, [0, this._v0, 0]);
            this._data.push([0, r.at(0)]);
            for (var index = 1; index < this._N; index++) {
                var t = this._deltaT * index;
                r = r.add(v.mul(this._deltaT));
                var a = this._acceleration(r);
                v = v.add(a.mul(this._deltaT));
                this._data.push([t, r.at(0)]);
            }
        };
        Euler_method.prototype.data = function () { return this._data; };
        return Euler_method;
    }());
    EPSE.Euler_method = Euler_method;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  Runge_Kutta_method.ts
 *
 *
 * ========================================================================= */
/// <reference path="../extlib/EMathLib/vector.ts" />
var EPSE;
(function (EPSE) {
    var Runge_Kutta_method = /** @class */ (function () {
        function Runge_Kutta_method(deltaT) {
            this._deltaT = deltaT;
        }
        Runge_Kutta_method.prototype.V = function (r, t, v) {
            return v.clone();
        };
        Runge_Kutta_method.prototype.A = function (r, t, v) {
            return new EMathLib.Vector(3);
        };
        Runge_Kutta_method.prototype.RK4 = function (r, t, v) {
            this._r = r;
            this._t = t;
            this._v = v;
            var v1 = this.V(this._r, this._t, this._v);
            var a1 = this.A(this._r, this._t, this._v);
            var _v1 = new EMathLib.Vector(3, [this._r.at(0) + v1.at(0) * this._deltaT / 2, this._r.at(1) + v1.at(1) * this._deltaT / 2, this._r.at(2) + v1.at(2) * this._deltaT / 2]);
            var _a1 = new EMathLib.Vector(3, [this._v.at(0) + a1.at(0) * this._deltaT / 2, this._v.at(1) + a1.at(1) * this._deltaT / 2, this._v.at(2) + a1.at(2) * this._deltaT / 2]);
            var v2 = this.V(_v1, this._t + this._deltaT / 2, _a1);
            var a2 = this.A(_v1, this._t + this._deltaT / 2, _a1);
            var _v2 = new EMathLib.Vector(3, [this._r.at(0) + v2.at(0) * this._deltaT / 2, this._r.at(1) + v2.at(1) * this._deltaT / 2, this._r.at(2) + v2.at(2) * this._deltaT / 2]);
            var _a2 = new EMathLib.Vector(3, [this._v.at(0) + a2.at(0) * this._deltaT / 2, this._v.at(1) + a2.at(1) * this._deltaT / 2, this._v.at(2) + a2.at(2) * this._deltaT / 2]);
            var v3 = this.V(_v2, this._t + this._deltaT / 2, _a2);
            var a3 = this.A(_v2, this._t + this._deltaT / 2, _a2);
            var _v3 = new EMathLib.Vector(3, [this._r.at(0) + v3.at(0) * this._deltaT, this._r.at(1) + v3.at(1) * this._deltaT, this._r.at(2) + v3.at(2) * this._deltaT]);
            var _a3 = new EMathLib.Vector(3, [this._v.at(0) + a3.at(0) * this._deltaT, this._v.at(1) + a3.at(1) * this._deltaT, this._v.at(2) + a3.at(2) * this._deltaT]);
            var v4 = this.V(_v3, this._t + this._deltaT, _a3);
            var a4 = this.A(_v3, this._t + this._deltaT, _a3);
            var out_r = new EMathLib.Vector(3, [
                this._deltaT / 6 * (v1.at(0) + 2 * v2.at(0) + 2 * v3.at(0) + v4.at(0)),
                this._deltaT / 6 * (v1.at(1) + 2 * v2.at(1) + 2 * v3.at(1) + v4.at(1)),
                this._deltaT / 6 * (v1.at(2) + 2 * v2.at(2) + 2 * v3.at(2) + v4.at(2))
            ]);
            var out_v = new EMathLib.Vector(3, [
                this._deltaT / 6 * (a1.at(0) + 2 * a2.at(0) + 2 * a3.at(0) + a4.at(0)),
                this._deltaT / 6 * (a1.at(1) + 2 * a2.at(1) + 2 * a3.at(1) + a4.at(1)),
                this._deltaT / 6 * (a1.at(2) + 2 * a2.at(2) + 2 * a3.at(2) + a4.at(2))
            ]);
            return { r: out_r, v: out_v };
        };
        return Runge_Kutta_method;
    }());
    EPSE.Runge_Kutta_method = Runge_Kutta_method;
})(EPSE || (EPSE = {}));
/* =========================================================================
 *
 *  RK4_UniformCircularMotion.ts
 *
 *
 * ========================================================================= */
/// <reference path="../extlib/EMathLib/vector.ts" />
/// <reference path="../lib/Runge_Kutta_method.ts" />
var EPSE;
(function (EPSE) {
    var RK4_UniformCircularMotion = /** @class */ (function (_super) {
        __extends(RK4_UniformCircularMotion, _super);
        function RK4_UniformCircularMotion(R, omega, T_MAX, deltaT) {
            if (R === void 0) { R = 1.0; }
            if (omega === void 0) { omega = 2.0 * Math.PI / 10; }
            if (T_MAX === void 0) { T_MAX = 10; }
            if (deltaT === void 0) { deltaT = 1.0; }
            var _this = _super.call(this, deltaT) || this;
            _this._omega = omega;
            _this._R = R;
            _this._v0 = _this._R * _this._omega;
            _this._N = T_MAX / _this._deltaT;
            _this._data = [];
            return _this;
        }
        RK4_UniformCircularMotion.prototype.A = function (r, t, v) {
            //console.log("debug child A...");
            var out = r.mul(-this._omega * this._omega);
            return out;
        };
        RK4_UniformCircularMotion.prototype.Calculate = function () {
            var r = new EMathLib.Vector(3, [this._R, 0, 0]);
            var v = new EMathLib.Vector(3, [0, this._v0, 0]);
            this._data.push([0, r.at(0)]);
            for (var index = 1; index < this._N; index++) {
                var t = this._deltaT * index;
                var result = this.RK4(r, t, v);
                r = r.add(result.r);
                v = v.add(result.v);
                this._data.push([t, r.at(0)]);
            }
        };
        RK4_UniformCircularMotion.prototype.data = function () { return this._data; };
        return RK4_UniformCircularMotion;
    }(EPSE.Runge_Kutta_method));
    EPSE.RK4_UniformCircularMotion = RK4_UniformCircularMotion;
})(EPSE || (EPSE = {}));
/// <reference path="./lib/Euler_method.ts" />
/// <reference path="./demo/RK4_UniformCircularMotion.ts" />
window.addEventListener("load", function () {
    //「Plot2D」クラスのインスタンスを生成
    var plot2D = new Plot2D("canvas-frame_graph");
    plot2D.options.axesDefaults.pad = 1;
    plot2D.options.axesDefaults.labelOptions.fontSize = "25pt";
    plot2D.options.axesDefaults.tickOptions.fontSize = "20pt";
    plot2D.options.axes.xaxis.label = '時刻 [t]';
    plot2D.options.axes.yaxis.label = 'x座標 [m]';
    plot2D.options.axes.yaxis.labelOptions = { angle: -90 }; //ラベル回転角
    //	plot2D.options.axes.yaxis.tickOptions = { formatString : '%.1e'}
    plot2D.options.seriesDefaults.lineWidth = 6.0;
    plot2D.options.seriesDefaults.markerOptions.show = true;
    plot2D.options.legend.show = true; //凡例の有無
    plot2D.options.legend.location = 'se'; //凡例の位置
    plot2D.options.axes.xaxis.min = 0;
    plot2D.options.axes.xaxis.max = 10;
    plot2D.options.axes.xaxis.tickInterval = 1;
    plot2D.options.axes.yaxis.min = -1.2;
    plot2D.options.axes.yaxis.max = 1.2;
    plot2D.options.axes.yaxis.tickInterval = 0.2;
    var series = []; //データ列オプション用配列
    series.push({
        showLine: true,
        label: "解析解",
        markerOptions: {
            show: false
        } //点描画の有無
    });
    var M = 200;
    var R = 1;
    var omega = 2.0 * Math.PI / 10;
    var t_min = 0;
    var t_max = 10;
    var DeltaTs = [1, 0.5, 0.1];
    //解析解
    var data_exact = [];
    for (var j = 0; j <= M; j++) {
        var t = t_min + (t_max - t_min) / M * j;
        var x = R * Math.cos(omega * t);
        data_exact.push([t, x]);
    }
    plot2D.pushData(data_exact);
    //Euler Method
    // let em = new EPSE.Euler_method(R, omega, t_max, dt);
    // em.Calculate();
    // let result = em.data();
    for (var m = 0; m < DeltaTs.length; m++) {
        var dt = DeltaTs[m];
        //RK4
        var rk4 = new EPSE.RK4_UniformCircularMotion(R, omega, t_max, dt);
        rk4.Calculate();
        var result = rk4.data();
        series.push({
            showLine: true,
            lineWidth: 2.0,
            label: "Δt = " + dt,
            markerOptions: {
                size: 14,
                show: true //点描画の有無
            }
        });
        plot2D.pushData(result);
    }
    //データ列オプションの代入
    plot2D.options.series = series;
    //線形プロット
    plot2D.plot();
    //グラフ画像データダウンロードイベントの登録
    plot2D.initGraphDownloadEvent();
});
