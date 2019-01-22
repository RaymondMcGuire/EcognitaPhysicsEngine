/* =========================================================================
 *
 *  EPhysSphere.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="./EPhysEntity.ts" />
module EPSE {
    declare var THREE: any;

    export class EPhysSphere extends EPhysEntity {

        radius:number;
        constructor() {
            super();
            this.name = "sphere";
            this.radius =  1.0;

            var geometry = this.c_geometry.geometry;
            var material = this.c_material.material;

            material.shading =  "Smooth";
        
            //形状オブジェクト
            geometry.type = "Sphere";
        
            //３次元グラフィックスパラメータ
            geometry.radius = this.radius; //球の半径
            geometry.widthSegments = 20; //y軸周りの分割数
            geometry.heightSegments = 20; //y軸上の正の頂点から負の頂点までの分割数
            geometry.phiStart =  0; //y軸回転の開始角度
            geometry.phiLength =  Math.PI * 2; //y軸回転角度
            geometry.thetaStart =  0; //x軸回転の開始角度
            geometry.thetaLength = Math.PI; //x軸回転角度
        }
    }
}