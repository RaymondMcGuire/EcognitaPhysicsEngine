/* =========================================================================
 *
 *  EGeometryComponent.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
module EPSE {
    declare let THREE: any;

    export class EGeometryComponent extends ECS.Component {
        geometry: any;
        constructor() {
            super("geometry");

            this.geometry = {
                type: null,
            };
        }

        getGeometry = function (type?: any, parameter?: any) {

            type = type || this.geometry.type;
            parameter = parameter || {};

            let _geometry = new THREE.SphereGeometry();
            if (type === "Sphere") {

                //球オブジェクトの形状オブジェクト
                _geometry = new THREE.SphereGeometry(
                    parameter.radius || this.geometry.radius, //球の半径
                    parameter.widthSegments || this.geometry.widthSegments, //y軸周りの分割数
                    parameter.heightSegments || this.geometry.heightSegments, //y軸上の正の頂点から負の頂点までの分割数
                    parameter.phiStart || this.geometry.phiStart, //y軸回転の開始角度
                    parameter.phiLength || this.geometry.phiLength, //y軸回転角度
                    parameter.thetaStart || this.geometry.thetaStart, //x軸回転の開始角度。
                    parameter.thetaLength || this.geometry.thetaLength //x軸回転角度
                );

            } else if (type === "Plane") {

                //平面オブジェクトの形状オブジェクト
                _geometry = new THREE.PlaneGeometry(
                    parameter.width || this.geometry.width, //平面の横幅（x軸方向）
                    parameter.height || this.geometry.height, //平面の縦軸（y軸方向）
                    parameter.widthSegments || this.geometry.widthSegments, //横方向分割数
                    parameter.heightSegments || this.geometry.heightSegments //縦方向分割数
                );

            } else if (type === "Cube") {

                //立方体オブジェクトの形状オブジェクト
                _geometry = new THREE.CubeGeometry(
                    parameter.width || this.geometry.width, //立方体の横幅  （x軸方向）
                    parameter.depth || this.geometry.depth, //立方体の奥行き （y軸方向）
                    parameter.height || this.geometry.height, //立方体の高さ   （z軸方向）
                    parameter.widthSegments || this.geometry.widthSegments, //横方向分割数  
                    parameter.heightSegments || this.geometry.heightSegments, //縦方向分割数
                    parameter.depthSegments || this.geometry.depthSegments //奥行き方向分割数
                );

            } else if (type === "Circle") {

                //円オブジェクトの形状オブジェクト
                _geometry = new THREE.CircleGeometry(
                    parameter.radius || this.geometry.radius, //円の半径
                    parameter.segments || this.geometry.segments, //円の分割数
                    parameter.thetaStart || this.geometry.thetaStart, //円弧の開始角度
                    parameter.thetaLength || this.geometry.thetaLength //円弧の終了角度
                );

            } else if (type === "Cylinder") {

                //円柱オブジェクトの形状オブジェクト
                _geometry = new THREE.CylinderGeometry(
                    parameter.radiusTop || this.geometry.radiusTop, //円柱の上の円の半径
                    parameter.radiusBottom || this.geometry.radiusBottom, //円柱の下の円の半径
                    parameter.height || this.geometry.height, //円柱の高さ
                    parameter.radialSegments || this.geometry.radialSegments, //円の分割数
                    parameter.heightSegments || this.geometry.heightSegments, //円の高さ方向の分割数
                    parameter.openEnded || this.geometry.openEnded //筒状
                );

            } else {

                alert("形状オブジェクトの設定ミス");

            }

            return _geometry;

        }
    }
}