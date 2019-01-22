/* =========================================================================
 *
 *  EPhysObject.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="./ECS/Entity.ts" />
module EPSE {
    declare var THREE: any;

    export class EPhysObject extends ECS.Entity {

        visible: boolean;
        recordData: boolean;
        step: number;
        skipRecord: number;
        draggable: boolean;
        allowDrag: boolean;
        dynamic: boolean;

        material:any;
        locus:any;
        velocityVector:any;
        boundingBox:any;
        data:any;
        geometry:any;
        CG:any;

        constructor() {

            super("physics_object");
            this.id = "0";

            //user setting
            this.visible = true;
            this.recordData = false;
            this.step = 0;
            this.skipRecord = 100;
            this.draggable = false;
            this.allowDrag = false;
            this.dynamic = false;


            //３次元グラフィックス材質関連パラメータ
            this.material = {
                type: "Lambert",      //材質の種類 （ "Basic" | "Lambert" | "Phong" | "Normal"）
                shading: "Flat",      //シェーディングの種類 （ "Flat" | "Smooth" ）
                side: "Front",        //描画する面 ( "Front" | "Back" | "Double")
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

            //軌跡の可視化関連パラメータ
            this.locus = {
                enabled: false,    //可視化の有無
                visible: false,    //表示・非表示の指定
                color: null,      //発光色
                maxNum: 1000,      //軌跡ベクトルの最大配列数
            };

            //速度ベクトルの可視化関連パラメータ
            this.velocityVector = {
                enabled: false,    //可視化の有無
                visible: false,    //表示・非表示の指定
                color: null,      //発光色
                scale: 0.5,         //矢印のスケール
            };

            //バウンディングボックスの可視化関連パラメータ
            this.boundingBox = {
                visible: false,    //表示・非表示の指定
                color: null,      //発光色
                opacity: 0.2,      //不透明度
                transparent: true, //透過処理
                draggFlag: false   //マウスドラック状態かを判定するフラグ（内部プロパティ）
            };

            //形状オブジェクト関連
            this.geometry = {
                type: null,     //形状の種類
            };

            this.CG = {};

            //運動の記録を格納するオブジェクト
            this.data = {};
            this.data.x = [];  //x座標
            this.data.y = [];  //y座標
            this.data.z = [];  //z座標
            this.data.vx = []; //速度のx成分
            this.data.vy = []; //速度のy成分
            this.data.vz = []; //速度のz成分
            this.data.kinetic = [];   //運動エネルギー   
            this.data.potential = []; //ポテンシャルエネルギー
            this.data.energy = [];    //力学的エネルギー

        }
    }
}