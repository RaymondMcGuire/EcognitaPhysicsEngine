/* =========================================================================
 *
 *  EMaterialComponent.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="../ECS/Component.ts" />
module EPSE {
    declare var THREE: any;

    export class EMaterialComponent extends ECS.Component {
        material:any;
        constructor() {
            super("material");

            this.material = {
                type: "Lambert",      //material type （ "Basic" | "Lambert" | "Phong" | "Normal"）
                shading: "Flat",      //shading type （ "Flat" | "Smooth" ）
                side: "Front",        //render side ( "Front" | "Back" | "Double")
                color: 0xFF0000,     //反射色（発光材質の場合：発光色）
                ambient: 0x990000,    //環境色
                opacity: 1.0,         //不透明度
                transparent: false,   //透過処理
                emissive: 0x000000,   //反射材質における発光色
                specular: 0x111111,   //鏡面色
                shininess: 30,        //鏡面指数
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
                ambient: this.material.ambient,
                transparent: this.material.transparent,
                opacity: this.material.opacity,
                emissive: this.material.emissive,
                specular: this.material.specular,
                shininess: this.material.shininess,
                side: this.material.side,
                shading: this.material.shading,
            };
        
            //材質パラメータの更新
            //PHYSICS.overwriteProperty(_parameter, parameter);
        
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
        
            //シェーディングの指定
            if (_parameter.shading === "Flat") {
        
                //フラットシェーディング
                _parameter.shading = THREE.FlatShading;
        
            } else if (_parameter.shading === "Smooth") {
        
                //スムースシェーディング
                _parameter.shading = THREE.SmoothShading;
        
            } else {
        
                alert("シェーディング指定ミス");
        
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