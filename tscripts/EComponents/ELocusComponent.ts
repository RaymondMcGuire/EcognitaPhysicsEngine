/* =========================================================================
 *
 *  ELocusComponent.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
module EPSE {
    declare var THREE: any;

    export class ELocusComponent extends ECS.Component {
        locus:any;
        constructor() {
            super("locus");
            
            this.locus = {
                enabled: false,    
                visible: false,    
                color: null,      
                maxNum: 1000,      
            };
        }
    }
}