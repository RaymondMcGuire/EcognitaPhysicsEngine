/* =========================================================================
 *
 *  EBoundingBoxComponent.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
module EPSE {

    export class EBoundingBoxComponent extends ECS.Component {
        boundingBox: any;
        constructor() {
            super("boundingbox");

            this.boundingBox = {
                visible: false,
                color: null,
                opacity: 0.2,
                transparent: true,
                draggFlag: false
            };
        }
    }
}