/* =========================================================================
 *
 *  EPhysSphere.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="./EPhysEntity.ts" />
/// <reference path="../EUtils/EPhysCommon.ts" />
module EPSE {

    export class EPhysSphere extends EPhysEntity {

        radius: number;
        constructor(param: any) {
            super();
            //basic element setting
            this.param = param;
            this.name = "sphere";
            this.radius = 1.0;
            this.draggable = true;

            //overwrite param
            overwriteProperty(this, this.param);

            let geometry = this.c_geometry.geometry;
            let material = this.c_material.material;
            //material setting
            material.shading = "Smooth";

            //geometry setting
            geometry.type = "Sphere";

            geometry.radius = this.radius;
            geometry.widthSegments = 20;
            geometry.heightSegments = 20;
            geometry.phiStart = 0;
            geometry.phiLength = Math.PI * 2;
            geometry.thetaStart = 0;
            geometry.thetaLength = Math.PI;
        }
    }
}