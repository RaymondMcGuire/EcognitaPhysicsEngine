/* =========================================================================
 *
 *  EPhysCore.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/System.ts" />
/// <reference path="../EUtils/EPhysCommon.ts" />
/// <reference path="./E3DSystem.ts" />
/// <reference path="./EEventListenerSystem.ts" />
module EPSE {

    export class EPhysCore extends ECS.System {

        step:number;
        objects:any;

        three_system: E3DSystem;
        event_listener_system:EEventListenerSystem;
        
        constructor() {
            super("system_core");
        
            this.step = 0;
            this.objects = [];

            this.three_system = new E3DSystem();
            this.event_listener_system = new EEventListenerSystem();
        }

        Execute() {
            super.Execute();       
            this.event_listener_system.Execute();
            this.three_system.Execute();
            for(var i=0; i < this.objects.length; i++){

                //３次元オブジェクトを生成
                this.createPhysObject( this.objects[i] );
        
            }
        
            //無限ループ関数の実行
            this.loop();
            
        }

        createPhysObject( physObject ) {

            //３次元オブジェクトの生成と表示
            physObject.create();
        
            //ドラック可能オブジェクトとして登録
            if( physObject.draggable ){
        
                this.three_system.draggableObjects.push( physObject.boundingBox.CG );
        
            }else{
                CG.scene.add(physObject.CG);
            }
        }

        checkFlags(){

            //リセットフラグ
            if ( resetFlag ) {
        
                for( var i=0; i < this.objects.length; i++ ){
        
                    if( this.objects[i].data.x.length == 0 ) continue;
        
                    this.objects[i].r.x = this.objects[i].data.x[0][1];
                    this.objects[i].r.y = this.objects[i].data.y[0][1];
                    this.objects[i].r.z = this.objects[i].data.z[0][1];
        
                    this.objects[i].v.x = this.objects[i].data.vx[0][1];
                    this.objects[i].v.y = this.objects[i].data.vy[0][1];
                    this.objects[i].v.z = this.objects[i].data.vz[0][1];
        
                    this.objects[i].allowDrag = this.objects[i].draggable;
                    this.objects[i].step = 0;
        
                    //内部データの初期化
                    this.objects[i].resetParameter();
                }
        
                //停止フラグの解除
                resetFlag = false;
                //一時停止フラグを立てる
                pauseFlag = true;
                //画面キャプチャの生成フラグ
                makePictureFlag = true;
                //初期フラグを立てる
                initFlag = true;
        
        
                //各種計算パラメータの初期化
                this.step = 0;
                //実験室のマウスドラックを規定値へ
                allowDrag = draggable;
        
            }
        
        }

        timeEvolution(){

            //一時停止中の場合
            if( pauseFlag ) return;
        
            //描画の間引回数だけ時間発展を進める
            for ( var i = 0; i < skipRendering; i++) {
                //実験室オブジェクトのステップ数のインクリメント
                this.step++;
        
                for( var j=0; j < this.objects.length; j++ ){
        
                    if( !this.objects[j].dynamic) continue;
        
                    //運動中はマウスドラックを禁止する
                    this.objects[j].allowDrag = false;
        
                    //内部時間の同期
                    for( var k = this.objects[j].step; k <= this.step; k++ ) {
        
                        //オブジェクトの時間発展
                        this.objects[j].timeEvolution();
        
                    }
                }
            }
        }

        makePicture(){
	
            //画面キャプチャ生成フラグのチェック
            if( !makePictureFlag ) return;
        
            if( pictureID ) {
                //canvas要素→DataURL形式
                (<any>document.getElementById( pictureID )).href = CG.renderer.domElement.toDataURL("image/png");
        
                var time = delta_t * this.step;
                //PNGファイル名の命名
                (<any>document.getElementById( pictureID )).download = time.toFixed(2) + ".png";
        
            }
            //画面キャプチャ生成フラグの解除
            makePictureFlag = false;			
        }

        loop() {

            //トラックボールによるカメラオブジェクトのプロパティの更新
            CG.trackball.update( );
        
            //FPT計測・表示
            if( this.event_listener_system.stats ) this.event_listener_system.stats.update();
        
            //フラグチェック
            this.checkFlags();
        
            //実験室の時間発展の計算
            this.timeEvolution();
        
            //３次元グラフィックスの更新
            for( var i = 0; i < this.objects.length; i++){
        
                this.objects[i].update();
        
            }
        
            //レンダリング
            CG.renderer.render( CG.scene, CG.camera );
        
            //画面キャプチャの生成
            this.makePicture();
        
            //「loop()」関数の呼び出し
            requestAnimationFrame(
                this.loop.bind( this )
            );
        
        }
    }
}