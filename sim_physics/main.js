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
        function Euler_method(R, omega, T_MAX) {
            if (R === void 0) { R = 1.0; }
            if (omega === void 0) { omega = 2.0 * Math.PI / 10; }
            if (T_MAX === void 0) { T_MAX = 10; }
            this._omega = omega;
            this._R = R;
            this._v0 = this._R * this._omega;
            this._deltaT = 1.0;
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
/// <reference path="./lib/Euler_method.ts" />
var em = new EPSE.Euler_method();
em.Calculate();
var result = em.data();
console.log(result);
