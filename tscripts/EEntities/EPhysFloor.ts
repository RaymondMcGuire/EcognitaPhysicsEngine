/* =========================================================================
 *
 *  EPhysFloor.ts
 *  
 * 
 * ========================================================================= */
/// <reference path="./EPhysEntity.ts" />
module EPSE {

    declare let THREE: any;

    export class EPhysFloor extends EPhysEntity {

        n:number;
        width:number;
        colors:any;
        collisionFloor:boolean;
        collisionFloorVisible:boolean;
        collision:boolean;
        constructor() {
            super();
            this.name = "floor";

            //床一辺あたりのタイルの個数
            this.n =  20;
        
            //タイルの一辺の長さ
            this.width = 1.0;
        
            //タイルの色
            this.colors =  [0x999999, 0x333333];
        
            //床面での跳ね返り（内部プロパティ）
            this.collisionFloor =  false;
        
            //衝突判定用平面の表示
            this.collisionFloorVisible =  false;
        
            //衝突検知の無効化
            this.collision = false;
        }

        create3DCG() {
            //床オブジェクトの生成
            this.CG = new THREE.Object3D();
            for (let i = -this.n / 2; i < this.n / 2; i++) {
                for (let j = -this.n / 2; j < this.n / 2; j++) {
                    //位置ベクトル
                    let x = (j + 0.5) * this.width;
                    let y = (i + 0.5) * this.width;
                    //一辺の長さ「width」の正方形の形状オブジェクトの宣言と生成
                    let geometry = new THREE.PlaneGeometry(this.width, this.width);
        
                    let parameter = {
                            color: this.colors[Math.abs(i + j) % this.colors.length]
                        }
                        //市松模様とするための材質オブジェクトを生成
                    let material = this.c_material.getMaterial(this.c_material.material.type, parameter);
        
                    //平面オブジェクトの宣言と生成
                    let plane = new THREE.Mesh(geometry, material);
                    //平面オブジェクトの位置の設定
                    plane.position.set(x, y, 0);
                    //平面オブジェクトに影を描画
                    plane.receiveShadow = this.c_material.material.receiveShadow;
                    //平面オブジェクトを床オブジェクトへ追加
                    this.CG.add(plane);
                }
            }
        }
    }
}