/* =========================================================================
 *
 *  EPhysCommon.ts
 *  
 * 
 * ========================================================================= */
module EPSE {
    export const g = 9.8;
    export const delta_t =  0.001;  
    export const skipRendering =  40; 

    export let pauseFlag = true;

    export let locusFlag = "true"; // (true | false | pause)
    export let velocityVectorFlag = "pause"; // (true | false | pause)
    export let boundingBoxFlag = "dragg";    // (true | false | dragg)
}