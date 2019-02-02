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
	export let draggable = false;
    export let allowDrag = false;
    
    export let locusFlag = "true"; // (true | false | pause)
    export let velocityVectorFlag = "pause"; // (true | false | pause)
    export let boundingBoxFlag = "dragg";    // (true | false | dragg)

    export let overwriteTmpStr = "this"; 
    export function overwriteProperty( object:any, parameter:any ){

        //parameter内の全てのプロパティを走査
        for( var propertyName in parameter ){
    
            //propertyNameのプロパティのクラスによって実行内容を分ける
            if( !( parameter[ propertyName ] instanceof Object )  || parameter[ propertyName ] instanceof Function ){
    
                //parameterのpropertyNameが通常の値（ 文字列, bool値, 数値 など）の場合、値をそのまま代入
                object[ propertyName ] = parameter[ propertyName ];
    
                //コピー内容をコンソールへ出力
                //console.log( PHYSICS.overwriteProperty.s + "." + propertyName + " = " + parameter[ propertyName ] );
    
    
            } else if( parameter[ propertyName ] instanceof Array ){
    
                //配列の宣言
                object[ propertyName ] = [];
    
                //配列をコピー
                for( var i = 0; i < parameter[ propertyName ].length; i++ ){
    
                    object[ propertyName ].push( parameter[ propertyName ][i] );
    
                }
                //コピー内容をコンソールへ出力
                //console.log( PHYSICS.overwriteProperty.s + "." + propertyName+ " = [" + object[ propertyName ] + "]" );
    
            }  else if( parameter[ propertyName ] instanceof Object  ){
    
                //ドットシンタックスでオブジェクトの構造を表す
                overwriteTmpStr += "." + propertyName;
    
                //未定義の場合の処理
                object[ propertyName ] = object[ propertyName ] || {};
    
                //parameterのpropertyNameのプロパティがオブジェクトの場合、再帰的に本関数を呼び出す
                overwriteProperty ( object[ propertyName ], parameter[ propertyName ] );
    
            } else {
    
                console.log("想定外のクラスのプロパティが存在します！");
    
            }
        }
    
        overwriteTmpStr = "this";
    }
}