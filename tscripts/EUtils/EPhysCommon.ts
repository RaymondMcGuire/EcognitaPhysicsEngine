/* =========================================================================
 *
 *  EPhysCommon.ts
 *  
 * 
 * ========================================================================= */
module EPSE {
    export let parameter = {};

    export const g = 9.8;
    export const delta_t =  0.001;  
    export const skipRendering =  40; 

    export const frameID = "Cvs_EPSE";
    export const playButtonID = "play";        
    export const resetButtonID = "reset";      
    export const pictureID = "picture"; 

    export let CG:any = {};

    export let pauseFlag = true;
    export let initFlag = true; 
    export let resetFlag = false;
    export let makePictureFlag = true; 

    export let displayFPS = true;
	export let draggable = true;
    export let allowDrag = true;
    
    export let locusFlag = "true"; // (true | false | pause)
    export let velocityVectorFlag = "pause"; // (true | false | pause)
    export let boundingBoxFlag = "dragg";    // (true | false | dragg)

    export let overwriteTmpStr = "this"; 
    export function overwriteProperty( object:any, parameter:any ){

        for( let propertyName in parameter ){

            if( !( parameter[ propertyName ] instanceof Object )  || parameter[ propertyName ] instanceof Function ){
    
                object[ propertyName ] = parameter[ propertyName ];
    
            } else if( parameter[ propertyName ] instanceof Array ){
    
                object[ propertyName ] = [];
    
                for( let i = 0; i < parameter[ propertyName ].length; i++ ){
    
                    object[ propertyName ].push( parameter[ propertyName ][i] );
    
                }
    
            }  else if( parameter[ propertyName ] instanceof Object  ){
    
                overwriteTmpStr += "." + propertyName;
    
                object[ propertyName ] = object[ propertyName ] || {};
    
                overwriteProperty ( object[ propertyName ], parameter[ propertyName ] );
    
            } else {
    
                console.log("error！");
    
            }
        }
    
        overwriteTmpStr = "this";
    }
}