/* =========================================================================
 *
 *  EMaterialComponent.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
/// <reference path="../EUtils/EPhysCommon.ts" />
module EPSE {
    declare var THREE: any;

    export class EMaterialComponent extends ECS.Component {
        material:any;
        constructor() {
            super("material");

            this.material = {
                type: "Lambert",      //material type （ "Basic" | "Lambert" | "Phong" | "Normal"）
                side: "Front",        //render side ( "Front" | "Back" | "Double")
                color: 0xFF0000,     //反射色（発光材質の場合：発光色）
                opacity: 1.0,         //不透明度
                transparent: false,   //透過処理
                emissive: 0x000000,   //反射材質における発光色
                castShadow: false,    //影の生成
                receiveShadow: false, //影の映り込み
            };
        }

       getMaterial(type?:any, parameter?:any) {

            //材質の種類
            type = type || this.material.type;
        
            //材質パラメータ
            var _parameter = {
                color: this.material.color,
                transparent: this.material.transparent,
                opacity: this.material.opacity,
                emissive: this.material.emissive,
                side: this.material.side
            };

            overwriteProperty(_parameter,parameter);
          
            //カリングの指定
            if (_parameter.side === "Front") {
        
                //表面
                _parameter.side = THREE.FrontSide;
        
            } else if (_parameter.side === "Double") {
        
                //両面
                _parameter.side = THREE.DoubleSide;
        
            } else if (_parameter.side === "Back") {
        
                //背面
                _parameter.side = THREE.BackSide;
        
            } else {
        
                alert("描画面指定ミス");
        
            }
        
            //材質オブジェクトの宣言と生成
            if (type === "Lambert") {
        
                //ランバート反射材質
                var _material = new THREE.MeshLambertMaterial(_parameter);
        
            } else if (type === "Phong") {
        
                //フォン反射材質
                var _material = new THREE.MeshPhongMaterial(_parameter);
        
            } else if (type === "Basic") {
        
                //発光材質
                var _material = new THREE.MeshBasicMaterial(_parameter);
        
            } else if (type === "Normal") {
        
                //法線材質
                var _material = new THREE.MeshNormalMaterial(_parameter);
        
            } else {
        
                alert("材質オブジェクト指定ミス");
        
            }
        
            return _material;
        }
    }
}