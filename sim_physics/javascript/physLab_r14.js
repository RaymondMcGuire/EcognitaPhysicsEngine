////////////////////////////////////////////////////
// 仮想物理実験 r14
////////////////////////////////////////////////////
/*
【r13からの変更点】
・剛体球の２点間距離固定拘束力と同時衝突力の融合（ただし、偶力計算アルゴリズムに再考の必要あり。）
・計算誤差表示ボードの導入
・高精度計算モードの導入
・接触状態の導入
・経路拘束力の導入
・ポテンシャル表示モードの導入
・

メモ：今後、全てのHTML要素を動的生成させる（手動と自動が混在している）
*/
//名前空間
var PHYSICS = { REVISION: 'r14' };
//真空の誘電率
PHYSICS.PermittivityOfVacuum = 8.85418782E-12;
//電気素量
PHYSICS.ElementaryCharge = 1.60217657E-19;
//陽子質量
PHYSICS.ProtonMass = 1.67262158E-27;
//電子質量
PHYSICS.ElectronMass = 9.1093897E-31;
//電子ボルト
PHYSICS.ElectronVolt = 0.1602E-18; //[J]
//重力定数
PHYSICS.ConstantOfGravitation = 6.67408E-11; //[Nm^2/kg^2]

//オブジェクト同士の結合
PHYSICS.SolidCollision = 1001;          //剛体同士の衝突
PHYSICS.SolidConnection = 1002;         //剛体棒による結合
PHYSICS.LinearSpringConnection = 1003;  //線形ばねによる結合
PHYSICS.CoulombInteraction = 1004;      //クーロン相互作用
PHYSICS.UniversalGravitation = 1005;    //万有引力相互作用
PHYSICS.LennardJonesPotential = 1006;   //レナード・ジョーンズポテンシャル
PHYSICS.FixedDistanceConnection = 1007; //２点間距離固定拘束
PHYSICS.PathBinding = 1008;             //指定した経路に拘束

//実験室との結合
PHYSICS.ConstantForce = 1100; //一定力
PHYSICS.AirResistanceForce = 1101; //空気抵抗力

//実験室内のスケール
PHYSICS.DistanceScale = 1.0; //1E-9; //ナノメートル
PHYSICS.TimeScale =     1.0; //1E-15; //アト秒
PHYSICS.EnergyScale =   1.0; //PHYSLAB.eV; //電子ボルト

//数値計算モードの指定
PHYSICS.RealTimeMode = 11;
PHYSICS.PreMode = 12;

///////////////////////////////////
// 物理実験室の基底クラス
///////////////////////////////////
PHYSICS.PhysLab = function ( parameter ) {
    parameter = parameter || {};

    //３次元グラフィックスを表示する領域
    this.stage = {
        id : null,
        div : null,
        width : 100,  //[%]
        height :100,  //[%]
    }

    //数値計算モードの指定
    this.calculateMode = PHYSICS.RealTimeMode; // PHYSICS.PreMode

    //プレ計算モード時のパラメータ
    this.preCalculationMode = {
        autoStart : true,            //自動再生開始フラグ
        displayStageButtonID : null, //再計算用ボタンID
        endStep : 10000,             //プレ計算の終了計算ステップ数
        skipRendering : 500,         //レンダリングの間引き数
        stage : {
            enabled : true,
            opacity :0.7
        }
    }

    //スタートボタンID（再生開始）
    this.playButtonID = null;

    //リセットボタンID
    this.resetButtonID = null;

    //画面キャプチャID
    this.pictureID = null;

    //時間表示用要素ID
    this.timeID = null;

    //jQueryの利用の有無
    this.useJQuery = false;

    //1ステップあたりの時間間隔
    this.dt =  0.001;

    //高精度計算モード
    this.hightPrecisionMode = {
        enabled : false,
        on : false,
        N : 100
    }

    //ステップ数
    this.step = 0;

    //描画間引回数
    this.skipRendering =  40;

    //FPS計測の有無
    this.displayFPS = true;

    //マウスドラックの有無
    this.draggable = false;

    //マウスドラックの許可
    this.allowDrag = false;

    //軌跡の表示
    this.locusFlag = true;             // (true | false | "pause" | "disabled")

    //速度ベクトルの表示
    this.velocityVectorFlag = "pause"; // (true | false | "pause" | "disabled")

    //力ベクトルの表示
    this.accelerationVectorFlag = "pause"; // (true | false | "pause" | "disabled")

    //バウンディングボックスの表示
    this.boundingBoxFlag = "dragg";    // (true | false | "dragg" | "disabled")

    //ストロボオブジェクトの表示
    this.strobeFlag = true;            // (true | false | "pause" | "disabled")

    //軌跡の表示ID
    this.locusButtonID = null;

    //速度ベクトルの表示ID
    this.velocityVectorButtonID = null;

    //加速度ベクトルの表示ID
    this.accelerationVectorButtonID = null;
    
    //ストロボ表示ID
    this.strobeButtonID = null;

    //復元用実験室データファイル名
    this.loadFilePath = null;

    //保存データダウンロードボタンID
    this.saveDataDownloadButtonID = null;

    //計算データのダウンロードボタンID
    this.downloadCalculationDataID = null;


    //時間発展を一時停止させる時間の配列
    this.pauseStepList = [];

    //レンダラ関連パラメータ
    this.renderer = {
        clearColor : 0xFFFFFF, //クリアーカラー（背景色）
        clearAlpha : 1.0,      //クリアーアルファ値（背景色）
        parameters : {         //WebGLRendererクラスのコンストラクタに渡すパラメータ
            antialias: true,   //アンチエイリアス（デフォルト：false）
            stencil: true,     //ステンシルバッファ（デフォルト：true）
            alpha: true        //アルファテスト（デフォルト：false）
        }
    }

    //カメラパラメータ
    this.camera = {
        type : "Perspective",          //カメラの種類（ "Perspective" | "Orthographic" ）
        position: { x:15, y:0, z:15 }, //カメラの位置座標
        up :      { x:0, y:0, z:1 },   //カメラの上ベクトル
        target:   { x:0, y:0, z:0 },   //カメラの向き中心座標
        fov :     45,                  //視野角
        near :    0.1,                 //視体積手前までの距離
        far :     500,                 //視体積の奥までの距離
        left :   -10,                  //視体積の左までの距離（正投影）
        right:    10,                  //視体積の右までの距離（正投影）
        top:      10,                  //視体積の上までの距離（正投影）
        bottom:  -10,                  //視体積の下までの距離（正投影）
    };

    //光源パラメータ
    this.light = {
        type : "Directional",         //光源の種類（ "Directional" | "Spot" | "Point"）
        position: { x:0, y:0, z:10 }, //光源位置
        target :{ x:0, y:0, z:0},     //光源の向き（平行光源, スポットライト光源）
        color: 0xFFFFFF,              //光源色
        intensity: 1,                 //光源強度
        distance: 0,                  //距離減衰指数（スポットライト光源, 点光源）
        angle: Math.PI/5,             //角度（スポットライト光源）
        exponent: 20,                 //光軸からの減衰指数（スポットライト）
        ambient: null                 //環境光源色
    };

    //シャドーマップ
    this.shadow = {
        shadowMapEnabled:    false,  //シャドーマップの利用
        shadowMapWidth:      2048,    //シャドーマップの横幅
        shadowMapHeight:     2048,    //シャドーマップの高さ
        shadowCameraVisible: false,  //シャドーマップの可視化
        shadowCameraNear:    0.1,    //シャドーカメラのサイズ（near）
        shadowCameraFar:     100,     //シャドーカメラのサイズ（far）
        shadowCameraFov:     120,    //シャドーカメラのサイズ（Fov）
        shadowCameraRight:   10,     //シャドーカメラのサイズ（right）
        shadowCameraLeft:   -10,     //シャドーカメラのサイズ（left）
        shadowCameraTop:     10,     //シャドーカメラのサイズ（top）
        shadowCameraBottom: -10,     //シャドーカメラのサイズ（bottom）
        shadowDarkness:      0.5     //影の黒さ
    };

    //トラックボール
    this.trackball = {
        enabled : false,            //トラックボール利用の有無
        noRotate : false,           //トラックボールの回転無効化
        rotateSpeed : 6.0,          //トラックボールの回転速度の設定
        noZoom : false,             //トラックボールの拡大無効化
        zoomSpeed : 1.0,            //トラックボールの拡大速度の設定
        noPan : false,              //トラックボールのカメラ中心移動の無効化と中心速度の設定
        panSpeed : 1.0,             //中心速度の設定
        staticMoving : true,        //トラックボールのスタティックムーブの有効化
        dynamicDampingFactor : 0.3, //トラックボールのダイナミックムーブ時の減衰定数
    }

    //時間制御スライダー
    this.timeslider = {
        enabled : false,  //時間制御スライダー利用の有無
        skipRecord : 50,  //運動記録の間引回数
        domID : null,     //時間制御スライダーの要素のID名
        save : {          //内部プロパティ
            flag : false,   //最新データの保持フラグ
            objects :[]     //３次元オブジェクトの最新情報が格納された配列
        }
    };

    //再生モード
    this.playback = {
        enabled : false,               //再生モード利用の有無
        checkID : null,                //checkボックスのID
        locusVisible : true,           //軌跡の表示
        velocityVectorVisible : false, //速度ベクトルの表示
        accelerationVectorVisible : false, //加速度ベクトルの表示
        strobeVisible : false          //ストロボオブジェクトの表示
    }
    //時刻表示ボード
    this.timeBoard = {
        enabled : false, //時刻表示ボード表示の有無
        size: 10,        //時刻表示ボードの大きさ（単位はステージに対する[%]）
        top : 0,         //上端からの位置（単位はステージに対する[%]）
        left : 0,        //左端からの位置（単位はステージに対する[%]）
        rotation : 0,    //ボードの回転角度
        fontSize : 20,   //フォントサイズ（単位はボードに対する[%]）
        fontName :"Times New Roman", //フォント名（CSSで指定可能な文字列）
        textAlign : "left",          //行揃え（CSSで指定可能な文字列）
        textColor : {r: 0, g:0, b:0, a: 1 },      //文字色
        backgroundColor : { r:1, g:1, b:1, a:0 }, //背景色（RGBA値を0から１で指定）
        resolution : 6,  //テクスチャサイズ（２の乗数）
    }
    //テキスト表示
    this.textDisplay = {
        enabled : false, //テキストボード表示の有無
        keta : 10,       //小数点以下の桁
        size: 10,        //テキストボードの大きさ（単位はステージに対する[%]）
        top : 20,         //上端からの位置（単位はステージに対する[%]）
        left : 0,        //左端からの位置（単位はステージに対する[%]）
        rotation : 0,    //ボードの回転角度
        fontSize : 10,   //フォントサイズ（単位はボードに対する[%]）
        fontName :"Times New Roman", //フォント名（CSSで指定可能な文字列）
        textAlign : "left",          //行揃え（CSSで指定可能な文字列）
        textColor : {r: 0, g:0, b:0, a: 1 },      //文字色
        backgroundColor : { r:1, g:1, b:1, a:0 }, //背景色（RGBA値を0から１で指定）
        resolution : 6,  //テクスチャサイズ（２の乗数）,
        texts : []
    }
    //動画生成
    this.video = {
        enabled : false,         //動画生成利用の有無
        downloadButtonID : null, //動画ダウンロードボタンID
        makeButtonID : null,     //動画生成ボタンID
        speed : 30,              //動画のフレームレート
        quality :0.8,            //動画の画質
        fileName : "video.webm", //動画のファイル名
        makeStartFlag : false,   //動画生成開始フラグ（内部）
        makingFlag : false,      //動画生成中フラグ（内部）
        finishedFlag : false,    //動画生成完了フラグ（内部）
        readyFlag : false        //動画生成完了フラグ（内部）
    }
    //GIFアニメーション
    this.gifAnimation = {
        enabled : false,         //GIFアニメーション生成利用の有無
        downloadButtonID : null, //GIFアニメーションダウンロードボタンID
        makeButtonID : null,     //GIFアニメーション生成ボタンID
        skip : 10,               //GIFアニメーションの飛ばし数
        repeat : 0,              //GIFアニメーション繰り返し実行回数（0は無限）
        delay : 0,               //GIFアニメーション繰り返し実行時の遅延
        quality : 1,             //GIFアニメーションのクオリティ
        fileName : "animation.gif", //GIFアニメーションのファイル名
        step : 0,   //動画生成開始フラグ（内部）
        makeStartFlag : false,   //動画生成開始フラグ（内部）
        makingFlag : false,      //動画生成中フラグ（内部）
        finishedFlag : false,    //動画生成完了フラグ（内部）
        readyFlag : false        //動画生成完了フラグ（内部）
    }



    //スカイボックスの利用
    this.skybox = {
        enabled : false,        //スカイボックス利用の有無
        cubeMapTexture : null,  //テクスチャ
        size: 400,              //スカイボックスのサイズ
        r:{ x:0, y:0, z:0 }     //スカイボックスの位置
    }

    //スカイドームの利用
    this.skydome = {
        enabled : false,         //スカイドーム利用の有無
        radius  : 200,           //スカイドームの半径
        topColor : 0x2E52FF,     //ドーム天頂色
        bottomColor : 0xFFFFFF,  //ドーム底面色
        exp : 0.8,               //混合指数
        offset : 5               //高さ基準点
    };
    //フォグの利用
    this.fog = {
        enabled : false, //フォグ利用の有無
        type: "linear",  //フォグの種類（ "linear" | "exp" ）
        color: null,     //フォグ色
        near: 0.1,       //フォグ開始距離（線形フォグ）
        far: 30,         //フォグ終了距離（線形フォグ）
        density : 1/20   //フォグの濃度（指数フォグ）
    }
    //レンズフレア関連
    this.lensFlare = {
        enabled: false,         //レンズフレア利用の有無
        flareColor: 0xFFFFFF,   //フレアテクスチャの発光色
        flareSize: 300,         //フレアのサイズ
        flareTexture: null,     //フレアテクスチャ
        ghostTexture: null,     //ゴーストテクスチャ
        ghostList : [           //レンズフレアのリスト
            { size: 60,  distance:0.6 },  //サイズと距離
            { size: 70,  distance:0.7 },
            { size: 120, distance:0.9 },
            { size: 70,  distance:1.0 },
        ]
    }

    //通信メソッドで実行する関数を格納する配列
    this.beforeInitEventFunctions = [];
    this.afterInitEventFunctions = [];
    this.beforeInit3DCGFunctions = [];
    this.afterInit3DCGFunctions = [];
    this.afterStartLabFunctions = [];
    this.beforeTimeControlFunctions = [];
    this.centerTimeEvolutionFunctions = [];
    this.breforeRecordDynamicDataFunctions = [];
    this.afterTimeControlFunctions = [];
    this.beforeCheckFlagsFunctions = [];
    this.afterCheckFlagsFunctions = [];
    this.breforeTimeEvolutionFunctions = [];
    this.afterTimeEvolutionFunctions = [];
    this.breforeMakePictureFunctions = [];
    this.afterMakePictureFunctions = [];
    this.breforeMakeJSONSaveDataFunctions = [];
    this.afterMakeJSONSaveDataFunctions = [];
    this.beforeLoopFunctions = [];
    this.afterLoopFunctions = [];

    this.finishPreCalculationFunctions = [];

    var list = [];

    for( var propertyName in this ){

        if( this.hasOwnProperty( propertyName ) ) {

            list.push( propertyName );

        }

    }
    //コピー対象プロパティリスト
    this.copyPropertyList = list;

    //物理空間に空間配置するオブジェクト
    this.objects = [];

    //フロントスクリーン
    this.frontScreen = {
        enabled : false,
        camera : null,
        sceen : null,
        objects : []
    }


    /////////////////////////////////////////////
    //内部パラメータ
    /////////////////////////////////////////////
    //実験室番号
    this.id = 1000;

    //各種フラグ
    this.initFlag = true;   //初期フラグ
    this.pauseFlag = true;  //一時停止フラグ
    this.resetFlag = false;  //リセットフラグ

    this.makePictureFlag = true;  //画面キャプチャの生成フラグ
    this.makeSaveDataFlag = true; // セーブデータ生成フラグ
    this.makeCalculationDataFlag = true; // 計算データ生成フラグ

    //マウスドラック対象オブジェクト
    this.draggableObjects = [];

    //FPS計測
    this.stats = null;

    //３次元グラフィックス関連
    this.CG = {};

    //読み込み後のデータ
    this.loadData = null;

    //復元データが与えられている場合
    if( parameter.loadFilePath ) {

        //JSON形式の復元データを読み込む
        this.loadJSONSaveData( parameter.loadFilePath );

        //コンストラクタで指定したパラメータを優先
        PHYSICS.overwriteProperty ( this.loadData.physLab, parameter );

        parameter = this.loadData.physLab;

        //初期状態ではない場合
        if( parameter.step > 0) {

            //初期状態フラグ（内部フラグ）を解除
            this.initFlag = false;

        }

    }

    //パラメータの設定
    this.setParameter( parameter );

    //
    this.restorePhysObjectsFromLoadData( );


    //画像データの読み込みとテクスチャオブジェクトの生成
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();

    //結合を格納する配列
    this.interacts = [];
    //衝突ペア
    this.collisionPairs = [];
    this._collisionPairs = [];
    //接触ペア
    this.contactPairs = [];
    this._contactPairs = [];

    //２点間距離固定結合拘束力ペア
    this.fixedDistanceInteractionPairs = [];

}
////////////////////////////////////////////////////////////////////
// クラスプロパティ
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.id = 1000;

////////////////////////////////////////////////////////////////////
// パラメータ設定関数
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.setParameter = function( parameter ){
    parameter = parameter || {};

    //仮想物理実験室オブジェクト（this）に parameter に存在する全てのプロパティを設定する
    PHYSICS.overwriteProperty ( this, parameter );

}
//引数で指定したオブジェクトリテラルのparameterに存在するプロパティを設定する関数
PHYSICS.overwriteProperty = function ( object, parameter ){

    //parameter内の全てのプロパティを走査
    for( var propertyName in parameter ){

        //propertyNameのプロパティのクラスによって実行内容を分ける
        if( !( parameter[ propertyName ] instanceof Object ) || parameter[ propertyName ] instanceof Function ){

            //parameterのpropertyNameが通常の値（ 文字列, bool値, 数値 など）の場合、値をそのまま代入
            object[ propertyName ] = parameter[ propertyName ];

            //コピー内容をコンソールへ出力
            //console.log( PHYSICS.overwriteProperty.s + "." + propertyName + " = " + parameter[ propertyName ] );

        } else if( parameter[ propertyName ] instanceof Array ){

            //配列の宣言
            object[ propertyName ] = [];

            //配列をコピー
            for( var i = 0; i < parameter[ propertyName ].length; i++ ){

                object[ propertyName ].push( parameter[ propertyName ][ i ] );

            }

            //コピー内容をコンソールへ出力
            //console.log( PHYSICS.overwriteProperty.s + "." + propertyName+ " = [" + object[ propertyName ] + "]" );

        }  else if( parameter[ propertyName ] instanceof Object  ){

            //ドットシンタックスでオブジェクトの構造を表す
            PHYSICS.overwriteProperty.s += "." + propertyName;

            //未定義の場合の処理
            object[ propertyName ] = object[ propertyName ] || {};

            //parameterのpropertyNameのプロパティがオブジェクトの場合、再帰的に本関数を呼び出す
            PHYSICS.overwriteProperty ( object[ propertyName ], parameter[ propertyName ] );

        } else {

            console.log("想定外のクラスのプロパティが存在します！");

        }
    }

    PHYSICS.overwriteProperty.s = "this";
}
//コンソール出力用のプロパティの構造を表す文字列
PHYSICS.overwriteProperty.s = "this";

////////////////////////////////////////////////////////////////////
// オブジェクトのコピー
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.getProperty = function( object ){

    //プロパティ取得対象オブジェクト
    object = object || this;

    //プロパティ取得対象プロパティ
    var list = object.copyPropertyList;

    //コピー後のプロパティを格納するオブジェクト
    var newProperty  = {};

    for( var i = 0; i < list.length; i++ ){

        var propertyName = list[i];

        newProperty[ propertyName ] = PHYSICS.cloneObject (
            object[ propertyName ], {
                Rwords : null,               //参照コピーを行うプロパティ名を格納した配列
                Iwords : ["CG", "objects"],             //無視するプロパティ名を格納した配列
                classFlag: false,            //自作クラスのコピーまで考慮
                onlyOwnPropertyFlag : true,  //自身のプロパティのみをコピー対象とするフラグ
                layerNumber : null           //コピー階層数
            }
        );

    }

    return newProperty;

}

//引数で与えられた実験室オブジェクトあるいは３次元オブジェクトの完全コピー
PHYSICS.PhysLab.prototype.clone = function( object ){

    //コピー対象オブジェクト
    object = object || this;

    //実験室オブジェクト（３次元オブジェクト）のプロパティの取得
    var property = object.getProperty();

    //実験室オブジェクト（３次元オブジェクト）の生成
    return new object.constructor ( property );

}

//第一引数で指定した任意のオブジェクトのコピーを返す
PHYSICS.cloneObject = function( oldObject, parameters ){

    parameters = parameters || {};

    //参照コピーを行うプロパティ名を格納した配列
    var Rwords = parameters.Rwords || [];
    //無視するプロパティ名を格納した配列
    var Iwords = parameters.Iwords || [];
    //自作クラスのコピーまで考慮
    var classFlag =  parameters.classFlag || false;
    //自身のプロパティのみをコピー対象とするフラグ
    var onlyOwnPropertyFlag = parameters.onlyOwnPropertyFlag || false;
    //コピー階層数
    var layerNumber =  parameters.layerNumber || null; 
    //関数を文字列関数へ変更（JSON化）するフラグ
    var functionToStrignFlag = parameters.functionToStrignFlag || false;
    //文字列関数を関数へ変更するフラグ
    var stringToFunctionFlag = parameters.stringToFunctionFlag || false;

    if ( !( oldObject ) || layerNumber === 0 ||
         oldObject.constructor === Number ||
         oldObject.constructor === Boolean ||
         oldObject.constructor === String ||
         oldObject.constructor === RegExp ||
         oldObject.constructor === Function ) {

        if( oldObject && oldObject.constructor === Function && functionToStrignFlag ){

            //関数を文字列関数へ変更（JSON化）
            oldObject = oldObject.toString();

        }

        return oldObject;

    }

    //コピー階層数をデクリメント
    if( layerNumber && layerNumber.constructor === Number ) {

        layerNumber--;

    } else {

        layerNumber = null;

    }

    //参照コピー→実体コピー
    if( oldObject.constructor === Array ){

        var array = [];

        for( var i = 0; i < oldObject.length; i++  ){

            array[ i ] = PHYSICS.cloneObject( oldObject[ i ], parameters );

        }

        return array;

    } else if( oldObject.constructor === Date ){

        return new Date( oldObject.getDate() );

    } else {

        if( classFlag ) var newObject = new oldObject.constructor();
        else            var newObject = {};

        for( var propertyName in oldObject ){

            var ownPropertyFlag = oldObject.hasOwnProperty( propertyName ) ;

            if( ( classFlag && ownPropertyFlag ) ||
                (!classFlag && onlyOwnPropertyFlag && ownPropertyFlag ) ||
                (!classFlag &&!onlyOwnPropertyFlag ) ){

                if( propertyName === "constructor" ) continue;
                if( Iwords.indexOf( propertyName ) > -1 ) continue;
                if( Rwords.indexOf( propertyName ) > -1 ) {

                    newObject[ propertyName ] = oldObject[ propertyName ];
                } else {

                    //文字列関数を関数へ変換
                    if( oldObject[ propertyName ] && oldObject[ propertyName ].constructor === String && stringToFunctionFlag && oldObject[ propertyName ].search( /function/ ) === 0 ){

                        //文字列関数を関数へ変更
                        eval( "newObject[ propertyName ] = " +  oldObject[ propertyName ] );

                    } else {

                        if( oldObject[ propertyName ] instanceof PHYSICS.PhysObject || oldObject[ propertyName ] instanceof PHYSICS.PhysLab ) continue;

                        newObject[ propertyName ] = PHYSICS.cloneObject( oldObject[ propertyName ], parameters );

                    }

                }

            }

        }

        return newObject;

    }

}

//オブジェクトをJSON形式文字列に変換する
PHYSICS.objectToJSON = function ( object ){

    return JSON.stringify(
        PHYSICS.cloneObject(
            object,
            {
                Rwords : null,               //参照コピーを行うプロパティ名を格納した配列
                Iwords : null,               //無視するプロパティ名を格納した配列
                classFlag: false,            //自作クラスのコピーまで考慮
                onlyOwnPropertyFlag : true,  //自身のプロパティのみをコピー対象とするフラグ
                layerNumber : null,          //コピー階層数
                functionToStrignFlag : true, //関数を文字列に変更
            }
        )
    );

}

//JSON形式文字列をオブジェクトに変換する
PHYSICS.JSONToObject = function ( json ){

    return PHYSICS.cloneObject (
        JSON.parse( json ),
        {
            Rwords : null,               //参照コピーを行うプロパティ名を格納した配列
            Iwords : null,               //無視するプロパティ名を格納した配列
            classFlag : false,           //自作クラスのコピーまで考慮
            onlyOwnPropertyFlag : true,  //自身のプロパティのみをコピー対象とするフラグ
            layerNumber : null,          //コピー階層数
            stringToFunctionFlag : true, //文字列関数を文字列に変更
        }
    );

}

////////////////////////////////////////////////////////////////////
// 仮想実験室の保存
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.getSaveData = function ( ){

    var data = {};

    //コピーに必要な実験室オブジェクトの全プロパティを取得
    data.physLab = this.getProperty();
    //３次元オブジェクトのプロパティを格納する配列
    data.objects = [];

    for( var i = 0; i < this.objects.length; i++ ){

        //親要素が存在する場合はスルー
        if( this.objects[ i ].parent ) continue;

        //コピーに必要な３次元オブジェクトの全プロパティを取得
        var property = this.objects[ i ].getProperty();

        //３次元オブジェクトのクラス名を取得
        property.className = this.objects[ i ].getClassName();

        //３次元オブジェクトのプロパティ配列に格納
        data.objects.push( property );

    }

    return data;
}

//JSON形式の保存データを準備
PHYSICS.PhysLab.prototype.makeJSONSaveData = function ( ){

    if( !this.makeSaveDataFlag ) return;
    if( !this.saveDataDownloadButtonID ) return;

    this.breforeMakeJSONSaveData( );

    //保存用データ取得
    var object = this.getSaveData();

    // Blobオブジェクトの生成
    var blob = new Blob(
        [ PHYSICS.objectToJSON( object ) ],
        { "type" : "text/plain" }
    );

    document.getElementById( this.saveDataDownloadButtonID ).href = window.URL.createObjectURL( blob );
    document.getElementById( this.saveDataDownloadButtonID ).download = "saveData.data";

    this.makeSaveDataFlag = false;

    this.afterMakeJSONSaveData( );

}

//保存用計算データを準備
PHYSICS.PhysLab.prototype.makeCalculationData = function ( ){

    if( !this.makeCalculationDataFlag ) return;
    if( !this.downloadCalculationDataID ) return;

    if( this.createCalculationData ){
        var data = this.createCalculationData( );
    } else {
        data = "null";
    }
    // Blobオブジェクトの生成
    var blob = new Blob(
        [ data ],
        { "type" : "text/plain" }
    );
    document.getElementById( this.downloadCalculationDataID ).href = window.URL.createObjectURL( blob );
    document.getElementById( this.downloadCalculationDataID ).download = "CalculationData.data";
    this.makeCalculationDataFlag = false;
}



////////////////////////////////////////////////////////////////////
// 復元データの読み込み
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.loadJSONSaveData = function ( filePath ){

    //復元ファイルのパス
    this.loadFilePath = filePath;

    // XMLHttpRequestオブジェクトの生成
    var xmlHttp = new XMLHttpRequest();

    //同期通信によるデータの読み込み
    xmlHttp.open("GET", this.loadFilePath, false);
    xmlHttp.send( null );

    //読み込み後のデータ
    this.loadData = PHYSICS.JSONToObject( xmlHttp.responseText );

}

PHYSICS.PhysLab.prototype.restorePhysObjectsFromLoadData = function (){

    //読み込みデータがある場合
    if( this.loadData ){

        for( var i = 0; i< this.loadData.objects.length; i++ ){

            var property = this.loadData.objects[ i ];
            var className = property.className;

            this.objects.push( new PHYSICS[ className ]( property ) );

        }

    }

}


////////////////////////////////////////////////////////////////////
// 仮想物理実験のスタート関数
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.startLab = function ( ){
    //実験室番号
    PHYSICS.PhysLab.id ++;
    this.id = PHYSICS.PhysLab.id;

    //ステージの初期化メソッドの実行
    this.initStage( );

    //イベント初期化メソッドの実行
    this.initEvent( );

    //仮想物理実験室の初期化メソッドの実行
    this.init3DCG( );

    //タイムボードの準備
    this.initTimeBoard();
    //計算誤差表示ボード
    this.initTextDisplay();

    //スクリーンオブジェクトの生成と表示
    for( var i = 0; i < this.frontScreen.objects.length; i++){

        this.createFrontScreenObject( this.frontScreen.objects[ i ] );
        this.setScaleAndPositionOfFrontScreenObject( this.frontScreen.objects[ i ] );

    }

    //オブジェクトの生成と表示
    for( var i=0; i < this.interacts.length; i++ ){

        this.interacts[ i ].createObject();

    }

    //オブジェクトの生成と表示
    for( var i=0; i < this.objects.length; i++ ){

        //３次元オブジェクトを生成
        this.createPhysObject( this.objects[ i ] );

    }

    //２点間距離固定結合拘束力ペア配列の生成
    this.createFixedDistanceConnectionPairsArray();



    //時間制御スライダー利用時
    if( this.timeslider.enabled ){

        //全てのオブジェクトの時系列データを取得
        this.recordData = true;

    }


    //一時変数の準備
    for( var i=0; i < this.objects.length; i++ ){

        PHYSICS.temp.objects1[ i ] = {};
        PHYSICS.temp.objects1[ i ].position = new THREE.Vector3();
        PHYSICS.temp.objects1[ i ].velocity = new THREE.Vector3();
        PHYSICS.temp.objects1[ i ].omega = new THREE.Vector3();
        PHYSICS.temp.objects2[ i ] = {};
        PHYSICS.temp.objects2[ i ].position = new THREE.Vector3();
        PHYSICS.temp.objects2[ i ].velocity = new THREE.Vector3();
        PHYSICS.temp.objects2[ i ].omega = new THREE.Vector3();
        PHYSICS.temp.objects3[ i ] = {};
        PHYSICS.temp.objects3[ i ].position = new THREE.Vector3();
        PHYSICS.temp.objects3[ i ].velocity = new THREE.Vector3();
        PHYSICS.temp.objects3[ i ].omega = new THREE.Vector3();
        PHYSICS.temp.objects4[ i ] = {};
        PHYSICS.temp.objects4[ i ].position = new THREE.Vector3();
        PHYSICS.temp.objects4[ i ].velocity = new THREE.Vector3();
        PHYSICS.temp.objects4[ i ].omega = new THREE.Vector3();

    }

    this.afterStartLab();

    //無限ループ関数の実行
    this.loop( );
}

PHYSICS.PhysLab.prototype.initStage = function( ) {

    //３次元グラフィックスを表示するステージの準備
    if( this.stage.id ){

        this.stage.div = document.querySelector( "#" + this.stage.id );

    } else {

        this.stage.div = document.createElement( 'div' );
        document.querySelector( "body" ).appendChild( this.stage.div );
        this.stage.div.style.overflow = "hidden";
        this.stage.div.style.position = "relative";

        this.stage.div.style.width = ( typeof this.stage.width == "string" )? this.stage.width : (window.innerWidth * this.stage.width/100) + "px";
        this.stage.div.style.height = ( typeof this.stage.height == "string" )? this.stage.height : (window.innerHeight * this.stage.height/100) + "px";

        //ウィンドウリサイズ時のイベント
        if( ( typeof this.stage.width != "string" ) && ( typeof this.stage.height != "string" ) ){
            window.addEventListener( 'resize', function(){
                var width = (window.innerWidth) * this.stage.width/100;
                var height = (window.innerHeight) * this.stage.height/100;
                this.CG.camera.aspect = width / height;
                this.CG.camera.updateProjectionMatrix();
                this.CG.renderer.setSize( width, height );
                this.stage.div.style.width = width + "px";
                this.stage.div.style.height =height + "px";

                //フロントスクリーンのカメラとオブジェクトの更新
                if( this.frontScreen.enabled ){

                    this.frontScreen.camera.left = -width/2;
                    this.frontScreen.camera.right = width/2;
                    this.frontScreen.camera.top = height/2;
                    this.frontScreen.camera.bottom = -height/2;
                    this.frontScreen.camera.updateProjectionMatrix();

                    for( var i = 0; i < this.frontScreen.objects.length; i++){

                        this.setScaleAndPositionOfFrontScreenObject( this.frontScreen.objects[ i ] );

                    }

                }
                //gifアニメーション用のcanvas要素
                if( this.gifAnimation.enabled ){

                    this.gifAnimation.canvas.width = this.gifAnimation.canvas.clientWidth = this.stage.div.clientWidth;
                    this.gifAnimation.canvas.height = this.gifAnimation.canvas.clientHeight = this.stage.div.clientHeight;

                }

            }.bind( this ), false );
        }

    }

    //プレ計算時に表示するdiv要素
    if( this.calculateMode == PHYSICS.PreMode ){

        //プレ計算時のステージを生成
        if( this.preCalculationMode.stage.enabled ){

            this.preCalculationMode.stage.div = document.createElement( 'div' );
            this.preCalculationMode.stage.div.id = "preCalculationStage";
            document.querySelector( "body" ).appendChild( this.preCalculationMode.stage.div );
            this.preCalculationMode.stage.div.style.position = "fixed";
            this.preCalculationMode.stage.div.style.top = "0px";
            this.preCalculationMode.stage.div.style.left = "0px";

            this.preCalculationMode.stage.div.style.width = (window.innerWidth * this.stage.width/100) + "px";
            this.preCalculationMode.stage.div.style.height = (window.innerHeight * this.stage.height/100) + "px";
            this.preCalculationMode.stage.div.style.backgroundColor = "black";
            this.preCalculationMode.stage.div.style.opacity = this.preCalculationMode.stage.opacity;
            this.preCalculationMode.stage.div.style.zIndex = 6000;

            window.addEventListener( 'resize', function(){
                var width = (window.innerWidth) * this.stage.width/100;
                var height = (window.innerHeight) * this.stage.height/100;
                this.preCalculationMode.stage.div.style.width = width + "px";
                this.preCalculationMode.stage.div.style.height =height + "px";
            }.bind( this ), false );

            //コントローラー全体
            this.preCalculationMode.stage.controler = document.createElement( 'div' );
            this.preCalculationMode.stage.controler.style.position = "fixed";
            this.preCalculationMode.stage.controler.style.width = "240px";
            this.preCalculationMode.stage.controler.style.top = (window.innerHeight * this.stage.height/100)/2 - 150 + "px";
            this.preCalculationMode.stage.controler.style.left = (window.innerWidth * this.stage.width/100)/2- 90 + "px";
            this.preCalculationMode.stage.controler.id = "preCalculationStageControler";
            this.preCalculationMode.stage.div.appendChild( this.preCalculationMode.stage.controler );

            //表示
            this.preCalculationMode.stage.h2 = document.createElement( 'h2' );
            this.preCalculationMode.stage.h2.innerHTML = "プレ計算モード";
            this.preCalculationMode.stage.h2.style.fontWeight = "bold";
            this.preCalculationMode.stage.h2.style.color = "white";
            this.preCalculationMode.stage.h2.style.fontSize = "24pt";
            this.preCalculationMode.stage.controler.appendChild( this.preCalculationMode.stage.h2 );

            //計算開始ボタンの生成
            this.preCalculationMode.stage.button = document.createElement( 'button' );
            this.preCalculationMode.stage.button.style.width = "240px";
            this.preCalculationMode.stage.button.style.height = "50px";
            this.preCalculationMode.stage.button.id = "preCalculationStartButton";
            this.preCalculationMode.stage.controler.appendChild( this.preCalculationMode.stage.button );

            //計算終了時間
            this.preCalculationMode.stage.endTimeSpan = document.createElement( 'span' );
            this.preCalculationMode.stage.endTimeSpan.innerHTML = "計算終了時刻：";
            this.preCalculationMode.stage.endTimeSpan.style.fontWeight = "bold";
            this.preCalculationMode.stage.endTimeSpan.style.color = "white";
            this.preCalculationMode.stage.endTimeSpan.style.fontSize = "16pt";
            this.preCalculationMode.stage.controler.appendChild( this.preCalculationMode.stage.endTimeSpan );
            //計算終了時間
            this.preCalculationMode.stage.endTimeInput = document.createElement( 'input' );
            this.preCalculationMode.stage.endTimeInput.id = "endTime";
            this.preCalculationMode.stage.endTimeInput.type = "text";
            this.preCalculationMode.stage.endTimeInput.value = this.preCalculationMode.endStep * this.dt;
            this.preCalculationMode.stage.endTimeInput.style.width = "50px";
            this.preCalculationMode.stage.endTimeInput.style.fontSize = "16pt";
            this.preCalculationMode.stage.controler.appendChild( this.preCalculationMode.stage.endTimeInput );

            this.preCalculationMode.stage.endTimeSpan2 = document.createElement( 'span' );
            this.preCalculationMode.stage.endTimeSpan2.innerHTML = " [s]";
            this.preCalculationMode.stage.endTimeSpan2.style.fontWeight = "bold";
            this.preCalculationMode.stage.endTimeSpan2.style.color = "white";
            this.preCalculationMode.stage.controler.appendChild( this.preCalculationMode.stage.endTimeSpan2 );

            //計算終了時間
            this.preCalculationMode.stage.endTimeDiv = document.createElement( 'div' );
            this.preCalculationMode.stage.endTimeDiv.style.fontWeight = "bold";
            this.preCalculationMode.stage.endTimeDiv.style.color = "white";
            this.preCalculationMode.stage.endTimeDiv.style.fontSize = "100pt";
            this.preCalculationMode.stage.endTimeDiv.innerHTML = "";
            this.preCalculationMode.stage.endTimeDiv.style.position = "fixed";
            this.preCalculationMode.stage.endTimeDiv.style.width = "200px";
            this.preCalculationMode.stage.endTimeDiv.style.top = (window.innerHeight * this.stage.height/100)/2 -150+ "px";
            this.preCalculationMode.stage.endTimeDiv.style.left = (window.innerWidth * this.stage.width/100)/2- 100 + "px";

            this.preCalculationMode.stage.div.appendChild( this.preCalculationMode.stage.endTimeDiv );

            //自動スタート
            if( this.preCalculationMode.autoStart ){

                //初期状態フラグの解除
                this.initFlag = false;
                //一時停止の解除
                this.pauseFlag = false;

                this.preCalculationMode.stage.controler.style.display = "none";

            } else {

                //初期状態フラグの解除
                this.initFlag = true;
                //一時停止の解除
                this.pauseFlag = true;

                var scope = this;

                //jQueryの利用
                if( this.useJQuery ){

                    $( "#" + this.preCalculationMode.stage.button.id ).button({
                        text: false,
                        label: "計算開始",
                        icons: {
                            primary: "ui-icon-play"
                        }
                    }).click( function( ) {

                        scope.preCalculationMode.endStep = parseInt( parseFloat( scope.preCalculationMode.stage.endTimeInput.value ) / scope.dt);
                        scope.preCalculationMode.skipRendering = scope.preCalculationMode.endStep/100;

                        scope.preCalculationMode.stage.controler.style.display = "none";
                        scope.preCalculationMode.stage.endTimeDiv.style.display = "block";

                        //初期状態フラグの解除
                        scope.initFlag = false;
                        //一時停止フラグの反転
                        scope.pauseFlag = false;
                        //動画準備完了フラグの解除
                        scope.video.readyFlag = false;
                        scope.gifAnimation.readyFlag = false;

                        //ボタンの表示内容の変更
                        scope.switchButton( );

                    });
                }

            }



        } else {

            //初期状態フラグの解除
            this.initFlag = false;
            //一時停止の解除
            this.pauseFlag = false;

        }

    }

}

PHYSICS.PhysLab.prototype.createPhysObject = function( physObject ) {

    //３次元オブジェクトに所属する仮想物理実験オブジェクトを格納
    physObject.physLab = this;

    //非同期生成中の場合はスキップ
    if( physObject.asynchronous ) return;

    //３次元オブジェクトの生成と表示
    physObject.create( );

    //各３次元オブジェクトのobjects配列要素番号を取得
    physObject.objectsIndex = this.getObjectsArrayIndex( physObject );


    //ドラック可能オブジェクトとして登録
    if( physObject.draggable ){

        this.draggableObjects.push( physObject.boundingBox.CG );

    }

}

////////////////////////////////////////////////////////////////////
// イベント準備関数
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.initEvent = function ( ) {

    this.beforeInitEvent( );

    var scope = this;

    //FPS計測結果を表示するHTML要素を追加
    if( this.displayFPS ) {

        //FPS計測
        this.stats = new Stats( );

        this.stats.domElement.style.userSelect = "none";

        //HTML要素の追加
        this.stage.div.appendChild( this.stats.domElement );

    }

    //計算開始ボタン・一時停止ボタンのクリックイベントの追加
    if( this.playButtonID ){

        //jQueryの利用
        if( this.useJQuery ){

            //リアルタイム計算モード
            if( this.calculateMode == PHYSICS.RealTimeMode ){

                $( "#" + this.playButtonID ).button({
                    text: false,
                    label: "計算開始",
                    icons: {
                        primary: "ui-icon-play"
                    }
                }).click( function( ) {

                    //初期状態フラグの解除
                    scope.initFlag = false;
                    //一時停止フラグの反転
                    scope.pauseFlag = !scope.pauseFlag;

                    //動画準備完了フラグの解除
                    scope.video.readyFlag = false;
                    scope.gifAnimation.readyFlag = false;

                    //ボタンの表示内容の変更
                    scope.switchButton( );

                });

            } else if( this.calculateMode == PHYSICS.PreMode ){ //プレ計算モード

                $( "#" + this.playButtonID ).button({
                    text: false,
                    label: "再生開始",
                    icons: {
                        primary: "ui-icon-play"
                    }
                }).click( function( ) {

                    //初期状態フラグの解除
                    scope.initFlag = false;
                    //計算は絶えず停止
                    scope.pauseFlag = true;
                    //動画準備完了フラグの解除
                    scope.video.readyFlag = false;
                    scope.gifAnimation.readyFlag = false;
                    //再生／停止の切り替え
                    scope.playback.on = !scope.playback.on;

                    //ボタンの表示内容の変更
                    scope.switchButton( );

                });

            }

        } else {

            //リアルタイム計算モード
            if( this.calculateMode == PHYSICS.RealTimeMode ){

                //ボタンの表示内容を指定
                document.getElementById( scope.playButtonID ).innerHTML = "計算開始";
                //マウスクリックイベントの追加
                document.getElementById( scope.playButtonID ).addEventListener( 'mousedown', function( ){


                    //初期状態フラグの解除
                    scope.initFlag = false;
                    //一時停止フラグの反転
                    scope.pauseFlag = !scope.pauseFlag;

                    //動画準備完了フラグの解除
                    scope.video.readyFlag = false;
                    scope.gifAnimation.readyFlag = false;

                    //ボタンの表示内容の変更
                    scope.switchButton( );


                }, false);

            } else if( this.calculateMode == PHYSICS.PreMode ){

                //ボタンの表示内容を指定
                document.getElementById( scope.playButtonID ).innerHTML = "再生開始";
                //マウスクリックイベントの追加
                document.getElementById( scope.playButtonID ).addEventListener( 'mousedown', function( ){

                    //初期状態フラグの解除
                    scope.initFlag = false;
                    //計算は絶えず停止
                    scope.pauseFlag = true;
                    //再生／停止の切り替え
                    scope.playback.on = !scope.playback.on;
                    //動画準備完了フラグの解除
                    scope.video.readyFlag = false;
                    scope.gifAnimation.readyFlag = false;

                    //ボタンの表示内容の変更
                    scope.switchButton( );

                }, false);

            }

        }

    } else {

        //初期状態フラグの解除
        this.initFlag = false;
        //一時停止の解除
        this.pauseFlag = false;

    }


    //リセットボタンのクリックイベントの追加
    if( this.resetButtonID ){

        //jQueryの利用
        if( this.useJQuery ){

            //リアルタイム計算モード
            if( this.calculateMode == PHYSICS.RealTimeMode ){

                $( "#" + this.resetButtonID ).button({
                    text: false,
                    label : "初期状態へ戻る",
                    icons: {
                        primary: "ui-icon-stop"
                    }

                }).click( function( ) {

                    if( scope.video.makingFlag ){

                        scope.video.makingFlag = false;
                        scope.video.finishedFlag = true;

                    } else {

                        //再計算用フラグを設定
                        scope.resetFlag = true;
                        //一時停止
                        scope.pauseFlag = true;
                        //動画準備完了フラグの解除
                        scope.video.readyFlag = false;

                    }

                    if( scope.gifAnimation.makingFlag ){

                        scope.gifAnimation.makingFlag = false;
                        scope.gifAnimation.finishedFlag = true;

                    } else {

                        //再計算用フラグを設定
                        scope.resetFlag = true;
                        //一時停止
                        scope.pauseFlag = true;
                        //動画準備完了フラグの解除
                        scope.gifAnimation.readyFlag = false;

                    }

                    //表示するボタンの変更
                    scope.switchButton( );

                });

            } else if( this.calculateMode == PHYSICS.PreMode ){


                $( "#" + this.resetButtonID ).button({
                    text: false,
                    label : "初期状態へ戻る",
                    icons: {
                        primary: "ui-icon-stop"
                    }

                }).click( function( ) {

                    if( scope.video.makingFlag || scope.gifAnimation.makingFlag ){

                        if( scope.video.makingFlag ){
                            scope.video.makingFlag = false;
                            scope.video.finishedFlag = true;
                        }
                        if( scope.gifAnimation.makingFlag ){
                            scope.gifAnimation.makingFlag = false;
                            scope.gifAnimation.finishedFlag = true;
                        }

                    } else {

                        //再計算用フラグなし
                        scope.resetFlag = false;
                        //一時停止
                        scope.pauseFlag = true;
                        //再生停止
                        scope.playback.on = false;
                        document.getElementById( scope.timeslider.domID ).value = 0;
                        //動画準備完了フラグの解除
                        scope.video.readyFlag = false;
                        scope.gifAnimation.readyFlag = false;
                    }
                    //表示するボタンの変更
                    scope.switchButton( );

                });
            }

        } else {

            //リアルタイム計算モード
            if( this.calculateMode == PHYSICS.RealTimeMode ){

                document.getElementById( scope.resetButtonID ).innerHTML = "初期状態へ戻る";

                document.getElementById( scope.resetButtonID ).addEventListener( 'mousedown' , function( ){

                    if( scope.video.makingFlag || scope.gifAnimation.makingFlag){

                        if( scope.video.makingFlag ){
                            scope.video.makingFlag = false;
                            scope.video.finishedFlag = true;
                        }
                        if( scope.gifAnimation.makingFlag ){
                            scope.gifAnimation.makingFlag = false;
                            scope.gifAnimation.finishedFlag = true;
                        }

                    } else {
                        //再計算用フラグを立てる
                        scope.resetFlag = true;
                        //一時停止を立てる
                        scope.pauseFlag = true;

                        //動画準備完了フラグの開所
                        scope.video.readyFlag = false;
                        scope.gifAnimation.readyFlag = false;
                    }
                    //表示するボタンの変更
                    scope.switchButton( );


                }, false);

            } else if( this.calculateMode == PHYSICS.PreMode ){

                document.getElementById( scope.resetButtonID ).innerHTML = "初期状態へ戻る";

                document.getElementById( scope.resetButtonID ).addEventListener( 'mousedown' , function( ){

                    if( scope.video.makingFlag || scope.gifAnimation.makingFlag){

                        if( scope.video.makingFlag ){
                            scope.video.makingFlag = false;
                            scope.video.finishedFlag = true;
                        }
                        if( scope.gifAnimation.makingFlag ){
                            scope.gifAnimation.makingFlag = false;
                            scope.gifAnimation.finishedFlag = true;
                        }

                    } else {
                        //再計算用フラグなし
                        scope.resetFlag = false;
                        //一時停止
                        scope.pauseFlag = true;
                        //再生停止
                        scope.playback.on = false;
                        //動画準備完了フラグの開所
                        scope.video.readyFlag = false;
                        scope.gifAnimation.readyFlag = false;
                    }
                    //表示するボタンの変更
                    scope.switchButton( );

                }, false);

            }

        }

    }

    //保存データダウンロードボタン
    if( scope.saveDataDownloadButtonID ){

        //jQueryの利用
        if( this.useJQuery ){

            $( "#" + scope.saveDataDownloadButtonID ).button({
                label: "実験室データのダウンロード",
                text: false,
                icons: {
                    primary: "ui-icon-disk"
                }

            })


        } else {

            document.getElementById( scope.saveDataDownloadButtonID ).innerHTML = "実験室データのダウンロード";

        }

    }

    //計算データのダウンロード
    if( scope.downloadCalculationDataID ){

        //jQueryの利用
        if( this.useJQuery ){

            $( "#" + scope.downloadCalculationDataID ).button({
                label: "計算データのダウンロード",
                text: false,
                icons: {
                    primary: "ui-icon-disk"
                }

            })


        } else {

            document.getElementById( scope.downloadCalculationDataID ).innerHTML = "計算データのダウンロード";

        }

    }


    //動画生成
    if( this.video.enabled ){

        //jQueryの利用
        if( this.useJQuery ){

            $( "#" + scope.video.makeButtonID ).button({
                label: "動画の生成",
                text: false,
                icons: {
                    primary: "ui-icon-video"
                }
            }).click( function( ) {

                //再生停止
                scope.playback.on = false;

                //動画生成開始フラグを設定
                scope.video.makeStartFlag = true;

                if( scope.gifAnimation.enabled ){

                    scope.gifAnimation.makeStartFlag = true;

                }

                //ボタンの表示内容の変更
                scope.switchButton( );

            });

            $( "#" + scope.video.downloadButtonID ).button({
                label: "動画のダウンロード",
                text: false,
                icons: {
                    primary: "ui-icon-arrowthick-1-s"
                }
            })


        } else {

            document.getElementById( scope.video.makeButtonID ).innerHTML = "動画の生成";
            document.getElementById( scope.video.makeButtonID ).addEventListener( 'mousedown' , function( ){

                //再生停止
                scope.playback.on = false;

                //動画生成開始フラグを設定
                scope.video.makeStartFlag = true;
                if( scope.gifAnimation.enabled ){
                    scope.gifAnimation.makeStartFlag = true;
                }
                //ボタンの表示内容の変更
                scope.switchButton( );

            });

            document.getElementById( scope.video.downloadButtonID ).innerHTML = "動画のダウンロード";

        }

        //動画オブジェクトの生成
        this.video.CG = new Whammy.Video( scope.video.speed, scope.video.quality );

    }

    //GIFアニメーション
    if( this.gifAnimation.enabled ){

        //jQueryの利用
        if( this.useJQuery ){

            $( "#" + this.gifAnimation.makeButtonID ).button({
                label: "GIFアニメーションの生成",
                text: false,
                icons: {
                    primary: "ui-icon-video"
                }
            }).click( function( ) {

                //再生停止
                scope.playback.on = false;

                //動画生成開始フラグを設定
                scope.gifAnimation.makeStartFlag = true;
                //ボタンの表示内容の変更
                scope.switchButton( );

            });

            $( "#" + scope.gifAnimation.downloadButtonID ).button({
                label: "GIFアニメーションのダウンロード",
                text: false,
                icons: {
                    primary: "ui-icon-arrowthick-1-s"
                }
            })


        } else {

            document.getElementById( scope.gifAnimation.makeButtonID ).innerHTML = "GIFアニメーションの生成";
            document.getElementById( scope.gifAnimation.makeButtonID ).addEventListener( 'mousedown' , function( ){

                //再生停止
                scope.playback.on = false;

                //動画生成開始フラグを設定
                scope.video.makeStartFlag = true;
                //ボタンの表示内容の変更
                scope.switchButton( );

            });

            document.getElementById( scope.video.downloadButtonID ).innerHTML = "GIFアニメーションのダウンロード";

        }

        //canvas要素の生成
        this.gifAnimation.canvas = document.createElement("canvas");
        //Canvas2D コンテキストの取得
        this.gifAnimation.canvas.context = scope.gifAnimation.canvas.getContext("2d");

        this.gifAnimation.canvas.width = this.gifAnimation.canvas.clientWidth = this.stage.div.clientWidth;
        this.gifAnimation.canvas.height = this.gifAnimation.canvas.clientHeight = this.stage.div.clientHeight;

         document.querySelector( "body" ).appendChild( this.gifAnimation.canvas );
         this.gifAnimation.canvas.style.position = "absolute";
         this.gifAnimation.canvas.style.left = "-5000px";
         this.gifAnimation.canvas.style.top = "0px";
         this.gifAnimation.canvas.style.visibility = "hidden";

        this.gifAnimation.CG = new GIFEncoder();
        this.gifAnimation.CG.setQuality( this.gifAnimation.quality );
        this.gifAnimation.CG.setRepeat( this.gifAnimation.repeat );
        this.gifAnimation.CG.setDelay( this.gifAnimation.delay );
        this.gifAnimation.CG.start();

    }

    //画面キャプチャ
    if( this.pictureID ){

        //jQueryの利用
        if( this.useJQuery ){

            $( "#" + scope.pictureID ).button({
                label: "画面キャプチャ",
                text: false,
                icons: {
                    primary: "ui-icon-image"
                }

            });


        } else {

            document.getElementById( scope.pictureID ).innerHTML = "画面キャプチャ";

        }

    }

    //プレ計算モードのステージ表示
    if( this.calculateMode == PHYSICS.PreMode  && this.preCalculationMode.displayStageButtonID ){

        //jQueryの利用
        if( this.useJQuery ){

            $( "#" + this.preCalculationMode.displayStageButtonID ).button({
                label: "計算再開",
                text: false,
                icons: {
                    primary: "ui-icon-calculator"
                }

            }).click( function( ) {

                //初期状態フラグの解除
                scope.initFlag = false;
                //計算は絶えず停止
                scope.pauseFlag = true;
                //動画準備完了フラグの解除
                scope.video.readyFlag = false;
                //再生／停止の切り替え
                scope.playback.on = false;

                scope.preCalculationMode.stage.div.style.display = "block";
                scope.preCalculationMode.stage.controler.style.display = "block";
                scope.preCalculationMode.stage.endTimeDiv.style.display = "none";
                scope.preCalculationMode.stage.endTimeInput.value = 2 * scope.preCalculationMode.endStep * scope.dt;

                //ボタンの表示内容の変更
                scope.switchButton( );

            });


        } else {

            document.getElementById( this.preCalculationMode.displayStageButtonID ).innerHTML = "計算再開";

        }

    }



    //時間制御スライダー
    if( this.timeslider.enabled ){

        document.getElementById( this.timeslider.domID ).min = 0;
        document.getElementById( this.timeslider.domID ).max = parseInt( this.step / this.timeslider.skipRecord  );
        document.getElementById( this.timeslider.domID ).value = ( this.timeslider.m !== undefined )? this.timeslider.m : parseInt( this.step / this.timeslider.skipRecord  );
        document.getElementById( this.timeslider.domID ).step = 1;

        document.getElementById( this.timeslider.domID ).addEventListener('change', function( ){
            //画面キャプチャの生成
            scope.makePictureFlag = true;
            scope.makeSaveDataFlag = true;
            scope.makeCalculationDataFlag = true;

        }, false);

    }

    function setRadioButton( scope, name ){

        //id名
        var idName = name + "ButtonID";
        //フラグ名
        var flagName = name + "Flag";

        var domlist = document.getElementsByName( scope[idName] );

        /////////////////////////////////////////
        //初期値の設定

        var flag_str;
        if( scope[flagName] == true ) {

            flag_str = "true";

        } else if( scope[flagName] == false ){

            flag_str = "false";

        } else {

            flag_str = scope[flagName];
        }

        //初期状態と同じvalue値のinputをチェック状態にする
        for( var i = 0; i < domlist.length; i++ ){

            if( domlist[ i ].value == flag_str ) domlist[ i ].checked = true;

        }

        //jQuery利用の有無
        if( scope.useJQuery ){

            $( "#" + scope[idName] ).buttonset( ).click( function( ) {

                //ラジオボタンのvalue値の取得
                scope[ flagName ] = $("#" + scope[idName] + " input:radio[name=" + scope[idName] + "]:checked").val( );

                if( scope[ flagName ] == "true" ) scope[ flagName ] = true;
                else if( scope[ flagName ] == "false" )  scope[ flagName ] = false;

                scope.makePictureFlag = true;
                scope.makeSaveDataFlag = true;
                scope.makeCalculationDataFlag = true;

            });

        } else {

            document.getElementById( scope[idName] ).addEventListener('click', function( ){

                for( var i = 0; i < domlist.length; i++ ){

                    if ( domlist[ i ].checked ) {

                        scope[flagName] = domlist[ i ].value;

                        if( scope[ flagName ] == "true" ) scope[flagName] = true;
                        else if( scope[ flagName ] == "false" ) scope[flagName] = false;

                        break;
                    }

                }

                scope.makePictureFlag = true;
                scope.makeSaveDataFlag = true;
                scope.makeCalculationDataFlag = true;

            }, false);

        }

    }

    //速度ベクトル
    if( scope.velocityVectorButtonID ){
        setRadioButton( scope, "velocityVector");
    }
    //加速度ベクトル
    if( scope.accelerationVectorButtonID ){
        setRadioButton( scope, "accelerationVector");
    }
    //軌跡の描画
    if( scope.locusButtonID ){
        setRadioButton( scope, "locus");
    }

    //ストロボオブジェクトの表示
    if( scope.strobeButtonID ){
        setRadioButton( scope, "strobe");

    }

    this.switchButton( );

    this.afterInitEvent( );

}
////////////////////////////////////////////////////////////////////
// ボタン表示の変更関数
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.switchButton = function( ){

    //一時停止フラグによる分岐
    if ( this.pauseFlag ) {

        //リアルタイム計算モード
        if( this.calculateMode == PHYSICS.RealTimeMode ){

            var label = ( this.resetFlag )? "計算開始" : "計算再開";
            var icons = { primary: "ui-icon-play" };

        } else if( this.calculateMode == PHYSICS.PreMode ){

            var label = ( this.resetFlag )? "再生開始" : "再生再開";

            var icons = ( this.playback.on )? { primary: "ui-icon-pause" } :{ primary: "ui-icon-play" }

        }

        //jQueryの利用
        if( this.useJQuery ){

            $( "#" + this.playButtonID  ).button(
                "option", {
                    label:label ,
                    icons: icons
                }
            );

            $( "#" + this.resetButtonID ).css( 'display', 'inline-block' );
            $( "#" + this.pictureID ).css( 'display', 'inline-block' );
            $( "#" + this.saveDataDownloadButtonID ).css( 'display', 'inline-block' );
            $( "#" + this.downloadCalculationDataID ).css( 'display', 'inline-block' );

            $( "#" + this.preCalculationMode.displayStageButtonID ).css( 'display', 'inline-block' );

            //動画生成ボタンの表示・非表示
            var flag = false;
            if( (!this.initFlag || this.calculateMode == PHYSICS.PreMode) && !this.video.readyFlag && this.video.enabled ) flag = true;
            if( this.resetFlag )  flag = false; //リセットボタンが押されたら非表示
            if( ( this.calculateMode == PHYSICS.PreMode && this.playback.on) || this.video.makeStartFlag ) flag = false; //再生時は非表示

            if( flag ) $( "#" + this.video.makeButtonID ).css( 'display', 'inline-block' );
            else $( "#" + this.video.makeButtonID ).css( 'display', 'none' );

            //GIFアニメーション生成ボタンの表示・非表示
            var flag = false;
            if( (!this.initFlag || this.calculateMode == PHYSICS.PreMode) && !this.gifAnimation.readyFlag && this.gifAnimation.enabled && !this.video.enabled) flag = true;
            if( this.resetFlag )  flag = false; //リセットボタンが押されたら非表示
            if( ( this.calculateMode == PHYSICS.PreMode && this.playback.on) || this.gifAnimation.makeStartFlag ) flag = false; //再生時は非表示

            if( flag ) $( "#" + this.gifAnimation.makeButtonID ).css( 'display', 'inline-block' );
            else $( "#" + this.gifAnimation.makeButtonID ).css( 'display', 'none' );


            //再生時は非表示
            if( (this.calculateMode == PHYSICS.PreMode && this.playback.on) || this.video.makeStartFlag || this.gifAnimation.makeStartFlag){
                $( "#" + this.pictureID ).css( 'display', 'none' );
                $( "#" + this.saveDataDownloadButtonID ).css( 'display', 'none' );
                $( "#" + this.downloadCalculationDataID ).css( 'display', 'none' );
                $( "#" + this.preCalculationMode.displayStageButtonID ).css( 'display', 'none' );
            }

            if( this.video.makeStartFlag || this.gifAnimation.makeStartFlag){

                $( "#" + this.playButtonID  ).css( 'display', 'none' );

            } else {

                $( "#" + this.playButtonID  ).css( 'display', 'inline-block' );

            }

            //動画ダウンロードボタンの表示・非表示
            if( this.video.readyFlag ) $( "#" + this.video.downloadButtonID ).css( 'display', 'inline-block' );
            else $( "#" + this.video.downloadButtonID ).css( 'display', 'none' );

            //GIFアニメーションダウンロードボタンの表示・非表示
            if( this.gifAnimation.readyFlag ) $( "#" + this.gifAnimation.downloadButtonID ).css( 'display', 'inline-block' );
            else $( "#" + this.gifAnimation.downloadButtonID ).css( 'display', 'none' );


        } else {

            if( this.playButtonID )             document.getElementById( this.playButtonID ).innerHTML = label;
            if( this.pictureID )                document.getElementById( this.pictureID ).style.display = 'inline-block';
            if( this.saveDataDownloadButtonID ) document.getElementById( this.saveDataDownloadButtonID ).style.display = 'inline-block';
            if( this.downloadCalculationDataID ) document.getElementById( this.downloadCalculationDataID ).style.display = 'inline-block';
            //動画生成ボタンの表示
            if ( ( (!this.initFlag || this.calculateMode == PHYSICS.PreMode ) && !this.video.readyFlag ) && this.video.makeButtonID ) document.getElementById( this.video.makeButtonID ).style.display = 'inline-block';
            else if( this.video.makeButtonID ) document.getElementById( this.video.makeButtonID ).style.display = 'inline-block';

            //動画生成ボタンの表示
            if( this.video.readyFlag && this.video.downloadButtonID) document.getElementById( this.video.downloadButtonID ).style.display = 'inline-block';
            else if( this.video.downloadButtonID ) document.getElementById( this.video.downloadButtonID ).style.display = 'inline-block';

        }

    } else {

        var label = "一時停止";

        //jQueryの利用
        if( this.useJQuery ){
            $( "#" + this.playButtonID  ).button(
                "option", {
                    label: label,
                    icons: { primary: "ui-icon-pause" }
                }
            );
            $( "#" + this.resetButtonID ).css( 'display', 'none');
            $( "#" + this.pictureID ).css( 'display', 'none');
            $( "#" + this.preCalculationMode.displayStageButtonID ).css( 'display', 'none');
            $( "#" + this.saveDataDownloadButtonID ).css( 'display', 'none');
            $( "#" + this.downloadCalculationDataID ).css( 'display', 'none');



            //動画生成ボタンの表示・非表示
            if ( this.video.makingFlag ) $( "#" + this.video.makeButtonID ).css( 'display', 'inline-block' );
            else $( "#" + this.video.makeButtonID ).css( 'display', 'none' );

            //動画ダウンロードボタンの表示・非表示
            $( "#" + this.video.downloadButtonID ).css( 'display', 'none' );

            //GIFアニメーション生成ボタンの表示・非表示
            if ( this.gifAnimation.makingFlag ) $( "#" + this.gifAnimation.makeButtonID ).css( 'display', 'inline-block' );
            else $( "#" + this.gifAnimation.makeButtonID ).css( 'display', 'none' );

            //GIFアニメーションダウンロードボタンの表示・非表示
            $( "#" + this.gifAnimation.downloadButtonID ).css( 'display', 'none' );

        } else {

            if( this.playButtonID )             document.getElementById( this.playButtonID ).innerHTML = label;
            if( this.pictureID )                document.getElementById( this.pictureID ).style.display = "none";
            if( this.saveDataDownloadButtonID ) document.getElementById( this.saveDataDownloadButtonID ).style.display = "none";
            if( this.downloadCalculationDataID ) document.getElementById( this.downloadCalculationDataID ).style.display = "none";



            //動画生成ボタンの表示
            if ( this.video.makingFlag && this.video.makeButtonID ) document.getElementById( this.video.makeButtonID ).style.display = "inline-block";
            else if( this.video.makeButtonID ) document.getElementById( this.video.makeButtonID ).style.display = "none";

            //動画生成ボタンの表示
            if( this.video.downloadButtonID ) document.getElementById( this.video.downloadButtonID ).style.display = "none";

            //GIFアニメーション生成ボタンの表示
            if ( this.gifAnimation.makingFlag && this.gifAnimation.makeButtonID ) document.getElementById( this.gifAnimation.makeButtonID ).style.display = "inline-block";
            else if( this.gifAnimation.makeButtonID ) document.getElementById( this.gifAnimation.makeButtonID ).style.display = "none";

            //GIFアニメーション生成ボタンの表示
            if( this.gifAnimation.downloadButtonID ) document.getElementById( this.gifAnimation.downloadButtonID ).style.display = "none";
        }

        if( this.playback.checkID ) {

            //チェックボックスを解除
            document.getElementById( this.playback.checkID ).checked = false;

        }

    }

    //画面キャプチャの生成フラグ
    this.makePictureFlag = true;
    this.makeSaveDataFlag = true;
    this.makeCalculationDataFlag = true;
}


////////////////////////////////////////////////////////////////////
// 仮想物理実験室の初期化
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.init3DCG = function( ) {

    this.beforeInit3DCG( );

    this.initThree( );  //three.js初期化関数の実行
    this.initCamera( ); //カメラ初期化関数の実行
    this.initLight( );  //光源初期化関数の実行
    this.initDragg( );  //マウスドラック準備関数の実行

    this.afterInit3DCG( );
}



////////////////////////////////////////////////////////////////////
// Three.js初期化関数の定義
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.initThree = function( ) {

    //レンダラーオブジェクトの生成
    this.CG.renderer = new THREE.WebGLRenderer( this.renderer.parameters );

    if ( !this.CG.renderer ) alert( 'Three.js の初期化に失敗しました' );

    //レンダラーのサイズの設定
    this.CG.renderer.setSize(
        this.stage.div.clientWidth,
        this.stage.div.clientHeight
    );

    //キャンバスフレームDOM要素にcanvas要素を追加
    this.stage.div.appendChild( this.CG.renderer.domElement );

    //レンダラークリアーカラーの設定
    this.CG.renderer.setClearColor(
        this.renderer.clearColor,
        this.renderer.clearAlpha
    );

    //フロントスクリーンモードの実行
    this.frontScreen.enabled = this.frontScreen.enabled || this.timeBoard.enabled || this.textDisplay.enabled;

    //フロントスクリーンレンダリングの実行
    if( this.frontScreen.enabled ){

        this.CG.renderer.autoClear = false;

        this.frontScreen.scene = new THREE.Scene();
        this.frontScreen.camera = new THREE.OrthographicCamera(
            -this.stage.div.clientWidth/2,
             this.stage.div.clientWidth/2,
             this.stage.div.clientHeight/2,
            -this.stage.div.clientHeight/2,
            -100,
            100
        );
        //カメラの位置の設定
        this.frontScreen.camera.position.set(0, 0, 50);
        //カメラの上ベクトルの設定
        this.frontScreen.camera.up.set(0, 1, 0);
        //カメラの中心位置ベクトルの設定
        this.frontScreen.camera.lookAt({ x: 0, y: 0, z: 0 }); //トラック剛体球利用時は自動的に無効

    }

    //シーンオブジェクトの生成
    screen.scene = new THREE.Scene();
    //カメラオブジェクトの生成
    screen.camera
    //シャドーマップの利用
    this.CG.renderer.shadowMap.enabled = this.shadow.shadowMapEnabled;
    //シーンオブジェクトの生成
    this.CG.scene = new THREE.Scene( );

    //スカイボックスの設定
    if( this.skybox.enabled ){
        //形状オブジェクトの宣言と生成
        var geometry = new THREE.BoxGeometry( this.skybox.size, this.skybox.size, this.skybox.size );
        //テクスチャの読み込み
        var textureCube = THREE.ImageUtils.loadTextureCube( this.skybox.cubeMapTexture , new THREE.CubeReflectionMapping( ) );
        //画像データのフォーマットの指定
        textureCube.format = THREE.RGBFormat;
        //スカイボックス用シェーダー
        var shader = THREE.ShaderLib[ "cube" ];
        shader.uniforms[ "tCube" ].value = textureCube;
        //材質オブジェクト
        var material = new THREE.ShaderMaterial( {
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            side: THREE.BackSide,
            depthWrite: false
        } );
        //スカイボックスの生成
        this.CG.skybox = new THREE.Mesh(geometry , material );
        this.CG.skybox.position.set( this.skybox.position.x, this.skybox.position.y, this.skybox.position.z );
        this.CG.scene.add( this.CG.skybox );
    }

    //スカイドームの利用
    if( this.skydome.enabled ){

        var vertexShader = "//バーテックスシェーダー\n" +
        "//頂点シェーダーからフラグメントシェーダーへの転送する変数\n" +
        "varying vec3 vWorldPosition;\n" +
        "void main( ) {\n" +
        "    //ワールド座標系における頂点座標\n" +
        "    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );\n" +
        "    vWorldPosition = worldPosition.xyz;\n" +
        "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n" +
        "}\n";

        var fragmentShader = "//フラグメントシェーダ―\n" +
        "//カスタムuniform変数の取得\n" +
        "uniform vec3 topColor;     //ドーム頂点色\n" +
        "uniform vec3 bottomColor;  //ドーム底辺色\n" +
        "uniform    float exp;         //減衰指数\n" +
        "uniform    float offset;      //高さ基準点\n" +
        "//バーテックスシェーダーから転送された変数\n" +
        "varying vec3 vWorldPosition;\n" +
        "void main( ) {\n" +
        "    //高さの取得\n" +
        "    float h = normalize( vWorldPosition + vec3(0, 0, offset) ).z;\n" +
        "    if( h < 0.0) h = 0.0;\n" +
        "    gl_FragColor = vec4( mix( bottomColor, topColor, pow(h, exp) ), 1.0 );\n" +
        "}\n";


        //形状オブジェクトの宣言と生成
        var geometry = new THREE.SphereGeometry( this.skydome.radius, 100, 100);
        var uniforms = {
            topColor:  { type: "c", value: new THREE.Color( ).setHex( this.skydome.topColor ) },
            bottomColor:  { type: "c", value: new THREE.Color( ).setHex( this.skydome.bottomColor )},
            exp:{ type: "f", value : this.skydome.exp },
            offset:{ type: "f", value : this.skydome.offset }
        };
        //材質オブジェクトの宣言と生成
        var material = new THREE.ShaderMaterial( {
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms : uniforms,
            side: THREE.BackSide,
            depthWrite: false
        } );

        //スカイドームの生成
        this.skydome.CG = new THREE.Mesh( geometry, material);
        this.CG.scene.add( this.skydome.CG );

    }

    //フォグの利用
    if( this.fog.enabled ){

        if( !this.fog.color ) this.fog.color = this.renderer.clearColor;

        if( this.fog.type === "linear" ){
            //線形フォグオブジェクトの生成
            this.CG.scene.fog = new THREE.Fog (
                this.fog.color, //フォグ色
                this.fog.near,  //フォグ開始距離
                this.fog.far    //フォグ終了距離
            );

        } else if( this.fog.type === "exp" ) {
            //指数フォグオブジェクトの生成
            this.CG.scene.fog =  new THREE.FogExp2(
                this.fog.color,  //フォグ色
                this.fog.density //フォグの濃度（指数）
            );

        }
    }

}
////////////////////////////////////////////////////////////////////
// カメラ初期化関数の定義
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.initCamera = function( ) {

    //カメラのタイプが透視投影（Perspective）の場合
    if( this.camera.type == "Perspective" ){

        //透視投影カメラオブジェクトの生成
        this.CG.camera = new THREE.PerspectiveCamera (
            this.camera.fov,  //視野角
            this.stage.div.clientWidth / this.stage.div.clientHeight, //アスペクト
            this.camera.near, //視体積手前までの距離
            this.camera.far   //視体積の奥までの距離
        );

    //カメラのタイプが正投影（Orthographic）の場合
    } else if( this.camera.type == "Orthographic" ) {

        //正投影カメラオブジェクトの生成
        this.CG.camera = new THREE.OrthographicCamera (
            this.camera.left,   //視体積の左までの距離
            this.camera.right,  //視体積の右までの距離
            this.camera.top,    //視体積の上までの距離
            this.camera.bottom, //視体積の下までの距離
            this.camera.near,   //視体積手前までの距離
            this.camera.far     //視体積の奥までの距離
        );

    } else {

        alert("カメラの設定ミス");

    }

    //カメラの位置の設定
    this.CG.camera.position.set(
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z
    );
    //カメラの上ベクトルの設定
    this.CG.camera.up.set(
        this.camera.up.x,
        this.camera.up.y,
        this.camera.up.z
    );
    //カメラの中心位置ベクトルの設定（トラックボール利用時は自動的に無効）
    this.CG.camera.lookAt({
        x: this.camera.target.x,
        y: this.camera.target.y,
        z: this.camera.target.z
    });

    //トラックボールオブジェクトの宣言
    this.CG.trackball = new THREE.TrackballControls(
        this.CG.camera,
        this.stage.div
    );

    //トラックボール動作範囲のサイズとオフセットの設定
    this.CG.trackball.screen.width = this.stage.div.clientWidth;                        //横幅
    this.CG.trackball.screen.height = this.stage.div.clientHeight;                      //縦幅
    this.CG.trackball.screen.offsetLeft = this.stage.div.getBoundingClientRect( ).left;  //左オフセット
    this.CG.trackball.screen.offsetTop = this.stage.div.getBoundingClientRect( ).top;    //上オフセット

    //トラックボールの回転無効化と回転速度の設定
    this.CG.trackball.noRotate = this.trackball.noRotate;
    this.CG.trackball.rotateSpeed = this.trackball.rotateSpeed;

    //トラックボールの拡大無効化と拡大速度の設定
    this.CG.trackball.noZoom = this.trackball.noZoom;
    this.CG.trackball.zoomSpeed = this.trackball.zoomSpeed;

    //トラックボールのカメラ中心移動の無効化と中心速度の設定
    this.CG.trackball.noPan = this.trackball.noPan;
    this.CG.trackball.panSpeed = this.trackball.panSpeed;
    this.CG.trackball.target = new THREE.Vector3(
        this.camera.target.x,
        this.camera.target.y,
        this.camera.target.z
    );

    //トラックボールのスタティックムーブの有効化
    this.CG.trackball.staticMoving = this.trackball.staticMoving;
    //トラックボールのダイナミックムーブ時の減衰定数
    this.CG.trackball.dynamicDampingFactor = this.trackball.dynamicDampingFactor;

    //トラックボール利用の有無
    this.CG.trackball.enabled = this.trackball.enabled;
}
////////////////////////////////////////////////////////////////////
// 光源初期化関数の定義
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.initLight = function( ) {

    //シャドーカメラのパラメータを設定する関数
    function setShadowCamera ( light , parameter ){
        //光源オブジェクトの影の生成元
        light.castShadow = parameter.shadowMapEnabled;
        //シャドウマップのサイズ
        light.shadow.mapSize.x = parameter.shadowMapWidth;
        light.shadow.mapSize.y = parameter.shadowMapHeight;

        //影の黒さ
        light.shadow.darkness  = parameter.shadowDarkness;


        if( light instanceof THREE.DirectionalLight ){

            //平行光源の場合
            light.shadow.camera.near  = parameter.shadowCameraNear;
            light.shadow.camera.far   = parameter.shadowCameraFar;
            light.shadow.camera.right   = parameter.shadowCameraRight;
            light.shadow.camera.left    = parameter.shadowCameraLeft ;
            light.shadow.camera.top    = parameter.shadowCameraTop ;
            light.shadow.camera.bottom  = parameter.shadowCameraBottom;


        } else if( light instanceof THREE.SpotLight ){

            //点光源の場合
            light.shadow.camera.near    = parameter.shadowCameraNear;
            light.shadow.camera.far     = parameter.shadowCameraFar;
            light.shadow.camera.fov     = parameter.shadowCameraFov;

        } else if( light instanceof THREE.PointLight ){


        }

    }


    if( this.light.type == "Directional"){

        //平行光源オブジェクトの生成
        this.CG.light = new THREE.DirectionalLight(
            this.light.color,     //光源色
            this.light.intensity  //光源強度
        );


    } else if( this.light.type == "Spot" ){

        //スポットライトオブジェクトの生成
        this.CG.light = new THREE.SpotLight(
            this.light.color,     //光源色
            this.light.intensity, //光源強度
            this.light.distance,  //距離減衰指数
            this.light.angle,     //スポットライト光源の角度
            this.light.exponent   //光軸からの減衰指数
        );


    } else if( this.light.type == "Point" ){
        //点光源オブジェクトの生成
        this.CG.light = new THREE.PointLight(
            this.light.color,     //光源色
            this.light.intensity, //光源強度
            this.light.distance   //距離減衰指数
        );

    } else {

        alert ("光源の設定ミス");

    }

    //シャドーマッピングを行う場合
    if( this.shadow.shadowMapEnabled ){

        setShadowCamera ( this.CG.light , this.shadow );

        if( this.shadow.shadowCameraVisible ){

            //シャドーカメラ可視化オブジェクトの生成
            this.shadow.cameraHelper = new THREE.CameraHelper( this.CG.light.shadow.camera );

            this.CG.scene.add( this.shadow.cameraHelper);

        }


    }

    //光源オブジェクトの位置の設定
    this.CG.light.position.set (
        this.light.position.x,
        this.light.position.y,
        this.light.position.z
    );
    //光源オブジェクトのシーンへの追加
    this.CG.scene.add( this.CG.light );

    //光源ターゲット用オブジェクトの生成
    this.CG.light.target = new THREE.Mesh( new THREE.SphereGeometry(1), new THREE.MeshNormalMaterial() );
    this.CG.light.target.position.set (
        this.light.target.x,
        this.light.target.y,
        this.light.target.z
    );
    this.CG.scene.add( this.CG.light.target );
    this.CG.light.target.visible = false;

    if( this.light.ambient ){
        //環境光オブジェクトの生成
        this.CG.ambientLight = new THREE.AmbientLight(this.light.ambient);

        //環境光オブジェクトのシーンへの追加
        this.CG.scene.add( this.CG.ambientLight );
    }


    //レンズフレアの利用
    if( this.lensFlare.enabled ){
        //レンズフレアテクスチャ用画像の読み込み
        var flareTexture = THREE.ImageUtils.loadTexture( this.lensFlare.flareTexture );
        var ghostTexture = THREE.ImageUtils.loadTexture( this.lensFlare.ghostTexture );
        //フレアテクスチャの発光色
        var flareColor = new THREE.Color( this.lensFlare.flareColor );
        //レンズフレアオブジェクトの生成
        this.lensFlare.CG = new THREE.LensFlare (
            flareTexture,              //フレアテクスチャ
            this.lensFlare.flareSize,  //フレアサイズ
            0,                         //フレア距離
            THREE.AdditiveBlending,    //加算ブレンディングの指定
            flareColor                 //フレア発光色
        );
        //フレア位置の指定
        this.lensFlare.CG.position.copy( this.CG.light.position );

        //フレアの追加
        for( var i = 0; i < this.lensFlare.ghostList.length; i++ ){
            this.lensFlare.CG.add(
                ghostTexture,                          //ゴーストテクスチャオブジェクト
                this.lensFlare.ghostList[ i ].size,      //ゴーストのサイズ
                this.lensFlare.ghostList[ i ].distance,  //ゴーストの発生距離
                THREE.AdditiveBlending                 //加算ブレンディングの指定
            );
        }

        //レンズフレアオブジェクトのシーンへの追加
        this.CG.scene.add( this.lensFlare.CG );

    }

}

////////////////////////////////////////////////////////////////////
// マウスドラック準備関数の定義
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.initDragg = function ( ) {
    //仮想物理実験室全体でのマウスドラック無しの場合
    if( !this.draggable ) return;

    ///////////////光線受信用平面オブジェクトの定義//////////////////
    //形状オブジェクトの宣言と生成
    var geometry = new THREE.PlaneBufferGeometry(200, 200, 8, 8);
    //材質オブジェクトの宣言と生成
    var material = new THREE.MeshBasicMaterial({  /*color: 0xFFFFFF,  wireframe: true ,*/
        transparent: true, opacity:0, depthWrite:false, depthTest:false })
    //平面オブジェクトの生成
    var plane = new THREE.Mesh( geometry, material );

    //平面オブジェクトのシーンへの追加
    this.CG.scene.add(plane);

    this.stage.div.addEventListener('mousemove', onDocumentMouseMove, false);//
    this.stage.div.addEventListener('mousedown', onDocumentMouseDown, true); //
    this.stage.div.addEventListener('mouseup'  , onDocumentMouseUp,   false);//
    this.stage.div.addEventListener('mouseout' , onDocumentMouseUp, false);  //

    //マウスクリック時の選択したオブジェクト中心からのマウスポインタのズレ
    var offset = new THREE.Vector3();
    var INTERSECTED; //マウスポインタが指しているオブジェクト
    var SELECTED;    //マウスドラック中のオブジェクト

    //HTML要素の位置による補正量の取得
    var elementOffsetLeft, elementOffsetTop;
    //マウスポインタの位置
    var mouse = new THREE.Vector2();
    //光線発射オブジェクト
    var raycaster = new THREE.Raycaster();

    var scope = this;

    //マウスムーヴイベント
    function onDocumentMouseMove(event) {

        //マウスドラックフラグを解除
        for( var i = 0; i < scope.draggableObjects.length; i++ ){
            scope.draggableObjects[ i ].physObject.boundingBox.draggFlag = false;
        }

        //マウスドラックが許可されていない場合は処理を終了
        if( !scope.allowDrag ) return;

        //canvas要素の絶対座標の取得
        elementOffsetLeft = scope.stage.div.getBoundingClientRect( ).left;
        elementOffsetTop = scope.stage.div.getBoundingClientRect( ).top;

        //クリップ座標系におけるマウスポインタの位置座標の取得
        mouse.x = ( (event.clientX-elementOffsetLeft) / scope.stage.div.clientWidth) * 2 - 1;
        mouse.y = -( (event.clientY-elementOffsetTop) / scope.stage.div.clientHeight) * 2 + 1;

        //マウスポインタの位置をと現時点のカメラ関連パラメータを設定
        raycaster.setFromCamera( mouse, scope.CG.camera );

        //オブジェクトがマウスドラックされている時
        if (SELECTED) {
            //光線と交わる平面オブジェクトオブジェクトを収集
            var intersects = raycaster.intersectObject( plane );
            //マウスドラック時のマウスポインタの指している平面オブジェクトの３次元空間中の位置座標
            var vec3 = intersects[ 0 ].point;

            //マウスドラックされているオブジェクトのバウンディングボックスを移動
            SELECTED.physObject.boundingBox.CG.position.copy(
                vec3.sub( offset )
            );

            //マウスドラックされているオブジェクトを移動
            SELECTED.physObject.position.copy(
                SELECTED.physObject.boundingBox.CG.position
            ).sub( SELECTED.physObject.boundingBox.center );

            //マウスドラックフラグの設定
            SELECTED.physObject.boundingBox.draggFlag = true;

            //衝突計算に必要な各種ベクトル量の更新を通知
            SELECTED.physObject.vectorsNeedsUpdate = true;

            //マウスドラックイベントの実行
            scope.mouseDraggEvent( SELECTED.physObject );

            return;
        }

        //光線と交わるオブジェクトを収集
        var intersects = raycaster.intersectObjects( scope.draggableObjects );

        //マウスポインタがオブジェクト上にある場合
        if ( intersects.length > 0) {

            if (INTERSECTED != intersects[ 0 ].object) {

                //マウスドラックが許可されていない場合は処理を終了
                if( !intersects[ 0 ].object.physObject.allowDrag ) return;

                //マウスポインタが指しているオブジェクトが登録されていなければ、一番手前のオブジェクトを「INTERSECTED」に登録
                INTERSECTED = intersects[ 0 ].object;

                //平面オブジェクトの位置座標を「INTERSECTED」に登録されたオブジェクトと同じ位置座標とする
                plane.position.copy( INTERSECTED.position );

                //平面オブジェクトの上ベクトルをカメラの位置座標の方向へ向ける
                plane.lookAt( scope.CG.camera.position );

            }
            //バウンディングボックスの可視化
            INTERSECTED.physObject.boundingBox.draggFlag = true;

            //マウスポインタのカーソルを変更
            scope.stage.div.style.cursor = 'pointer';

        } else {

            //マウスポインタがオブジェクトから離れている場合
            INTERSECTED = null;

            //マウスポインタのカーソルを変更
            scope.stage.div.style.cursor = 'auto';

        }
    }
    //マウスダウンイベント
    function onDocumentMouseDown(event) {
        //マウスドラックが許可されていない場合は処理を終了
        if( !scope.allowDrag ) return;
        //光線と交わるオブジェクトを収集
        var intersects = raycaster.intersectObjects( scope.draggableObjects );

        //交わるオブジェクトが１個以上の場合
        if (intersects.length > 0) {
            //マウスドラックが許可されていない場合は処理を終了
            if( !intersects[ 0 ].object.physObject.allowDrag ) return;

            //トラックボールを無効化
            scope.CG.trackball.enabled = false;
            //クリックされたオブジェクトを「SELECTED」に登録
            SELECTED = intersects[ 0 ].object;

            //マウスダウンイベントの実行
            scope.mouseDownEvent( SELECTED.physObject );

            //光線と交わる平面オブジェクトオブジェクトを収集
            var intersects = raycaster.intersectObject( plane );
            //クリック時のマウスポインタの指した平面オブジェクトの３次元空間中の位置座標
            var vec3 = intersects[ 0 ].point;
            //平面オブジェクトの中心から見た相対的な位置座標
            offset.copy( vec3 ).sub( plane.position );
            //マウスポインタのカーソルを変更
            scope.stage.div.style.cursor = 'move';
        }
    }

    function onDocumentMouseUp(event) {
        //マウスドラックフラグを解除
        for( var i = 0; i < scope.draggableObjects.length; i++ ){
            scope.draggableObjects[ i ].physObject.boundingBox.draggFlag = false;
        }

        //トラックボールを有効化
        scope.CG.trackball.enabled = scope.trackball.enabled;

        //マウスポインタのカーソルを変更
        scope.stage.div.style.cursor = 'auto';

        //画面キャプチャの生成フラグ
        scope.makePictureFlag = true;
        scope.makeSaveDataFlag = true;
        scope.makeCalculationDataFlag = true;

        //マウスドラックが許可されていない場合は処理を終了
        if( !scope.allowDrag ) return;

        //マウスアップ時にマウスポインタがオブジェクト上にある場合
        if (INTERSECTED && SELECTED) {

            //平面オブジェクトの位置座標をオブジェクトの位置座標に合わせる
            plane.position.copy( INTERSECTED.position );

            //内部パラメータのリセット
            if( SELECTED.physObject.dynamic || scope.initFlag ) SELECTED.physObject.resetParameter( );

            //マウスアップイベントの実行
            scope.mouseUpEvent( SELECTED.physObject );

            //マウスドラックの解除
            SELECTED = null;

        }

    }

}

////////////////////////////////////////////////////////////////////
// マウスドラック関連イベント
////////////////////////////////////////////////////////////////////
//３次元オブジェクトがマウスダウンされた時に実行
PHYSICS.PhysLab.prototype.mouseDownEvent = function ( physObject ) {

}
//３次元オブジェクトがマウスドラックされた時に実行
PHYSICS.PhysLab.prototype.mouseDraggEvent = function ( physObject ) {

}
//３次元オブジェクトがマウスアップされた時に実行
PHYSICS.PhysLab.prototype.mouseUpEvent = function ( physObject ) {

}

////////////////////////////////////////////////////////////////////
// 無限ループ関数の定義
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.loop = function ( ) {

    this.beforeLoop( );

    //トラックボールによるカメラオブジェクトのプロパティの更新
    this.CG.trackball.update( );

    //FPT計測・表示
    if( this.stats ) this.stats.update( );

    //フラグチェック
    this.checkFlags( );

    //実験室の時間発展の計算
    this.timeEvolution( );

    //時間のコントロール
    this.timeControl( );


    //オブジェクトの生成と表示
    for( var i=0; i < this.interacts.length; i++ ){

        this.interacts[ i ].update();

    }

    //３次元グラフィックスの更新
    for( var i = 0; i < this.objects.length; i++ ){

        this.objects[ i ].update( );

    }

    if( this.frontScreen.enabled ) this.CG.renderer.clear();

    //レンダリング
    this.CG.renderer.render( this.CG.scene, this.CG.camera );

    //フロントスクリーンレンダリングの実行
    if( this.frontScreen.enabled ){

        //レンダリング
        this.CG.renderer.render( this.frontScreen.scene, this.frontScreen.camera);

    }


    //画面キャプチャの生成
    this.makePicture( );

    //JSON型実験室データの生成
    this.makeJSONSaveData( );

    //計算データの生成
    this.makeCalculationData( );

    //動画の生成
    this.makeVideo( );
    this.makeGIFanimation( );

    this.afterLoop( );

    //「loop( )」関数の呼び出し
    requestAnimationFrame(
        this.loop.bind( this )
    );
}


////////////////////////////////////////////////////////////////////
// 時間制御スライダーの実行
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.timeControl = function ( ){

    this.beforeTimeControl ( );

    //時刻の表示
    if( this.timeID ) {
        var time = this.dt * this.step;
        document.getElementById( this.timeID ).innerHTML = time.toFixed( 2 );
    }


    //時間制御スライダーの利用時
    if( this.timeslider.enabled ) {

        if( this.pauseFlag && !this.initFlag ){

            //再生モード || 動画生成モード || プレ計算モード時
            if( this.playback.enabled || this.video.enabled ||  this.gifAnimation.enabled || this.calculateMode == PHYSICS.PreMode ) {
                document.getElementById( this.timeslider.domID ).style.visibility = "visible";

                if( this.playback.enabled ){

                    if( this.playback.checkID ) {

                        this.playback.on = document.getElementById( this.playback.checkID ).checked;

                    } else {

                        this.playback.on = true;

                    }

                }


                if( this.video.makeStartFlag || this.gifAnimation.makeStartFlag ){
                    if ( this.video.makeStartFlag ){
                        //動画再生開始
                        document.getElementById( this.timeslider.domID ).value = 0;
                        //動画生成フラグの設定
                        this.video.makingFlag = true;
                        //動画生成開始フラグを解除
                        this.video.makeStartFlag = false;

                    }
                    if( this.gifAnimation.makeStartFlag ){

                        //GIFアニメーション再生開始
                        document.getElementById( this.timeslider.domID ).value = 0;
                        //GIFアニメーション生成フラグの設定
                        this.gifAnimation.makingFlag = true;
                        //GIFアニメーション生成開始フラグを解除
                        this.gifAnimation.makeStartFlag = false;

                    }
                } else if( this.playback.on || this.video.makingFlag || this.gifAnimation.makingFlag ){ //再生実行時あるいは動画生成状態

                    this.timeslider.m++;

                    var max = document.getElementById( this.timeslider.domID ).max;

                    if( this.timeslider.m > max ) {

                        if ( this.playback.on ) this.timeslider.m = 0;
                        else if( this.video.makingFlag || this.gifAnimation.makingFlag ) {

                            this.timeslider.m = max;

                            if( this.video.enabled ){
                                //動画生成中フラグの解除
                                this.video.makingFlag = false;

                                //動画生成完了フラグの設定
                                this.video.finishedFlag = true;
                            }

                            if( this.gifAnimation.enabled ){
                                //GIFアニメーション生成中フラグの解除
                                this.gifAnimation.makingFlag = false;

                                //GIFアニメーション生成完了フラグの設定
                                this.gifAnimation.finishedFlag = true;
                            }

                        }

                    }

                    document.getElementById( this.timeslider.domID ).value = this.timeslider.m;

                }

            }

            //スライダー値の取得
            var m = this.timeslider.m = parseInt( document.getElementById( this.timeslider.domID ).value ) ;

            var time =  m * this.timeslider.skipRecord * this.dt;

            //時刻の表示
            if( this.timeID ) {
                document.getElementById( this.timeID ).innerHTML = time.toFixed( 2 );
            }

            //時間発展状態から一時停止状態の場合
            if( !this.timeslider.save.flag ){
                for( var i = 0; i < this.objects.length; i++ ){
                    this.timeslider.save.objects[ i ] = this.timeslider.save.objects[ i ] || {};
                    this.timeslider.save.objects[ i ].position = this.timeslider.save.objects[ i ].position || new THREE.Vector3();
                    this.timeslider.save.objects[ i ].velocity =  this.timeslider.save.objects[ i ].velocity || new THREE.Vector3();
                    this.timeslider.save.objects[ i ].omega =  this.timeslider.save.objects[ i ].omega || new THREE.Vector3();
                    this.timeslider.save.objects[ i ].quaternion =  this.timeslider.save.objects[ i ].quaternion || new THREE.Quaternion();

                    this.timeslider.save.objects[ i ].position.copy( this.objects[ i ].position );
                    this.timeslider.save.objects[ i ].velocity.copy( this.objects[ i ].velocity );
                    this.timeslider.save.objects[ i ].omega.copy( this.objects[ i ].omega );
                    this.timeslider.save.objects[ i ].quaternion.copy( this.objects[ i ].quaternion );
                }
                //最新データの保持フラグを設定
                this.timeslider.save.flag = true;
            }

            //全ての３次元オブジェクト位置と速度を与える
            for( var i = 0; i < this.objects.length; i++ ){

                if( this.objects[ i ].dynamic || this.objects[ i ].draggable ) {

                    this.objects[ i ].position.copy( this.objects[ i ].records[ m ].position );
                    this.objects[ i ].velocity.copy( this.objects[ i ].records[ m ].velocity );
                    this.objects[ i ].force.copy( this.objects[ i ].records[ m ].force );
                    this.objects[ i ].omega.copy( this.objects[ i ].records[ m ].omega );
                    this.objects[ i ].quaternion.copy( this.objects[ i ].records[ m ].quaternion );

                } else if( this.objects[ i ].hasOwnProperty( "dynamicFunction" ) ){

                    this.objects[ i ].dynamicFunction( time );

                }

            }


        } else {


            document.getElementById( this.timeslider.domID ).style.visibility = "hidden";
            document.getElementById( this.timeslider.domID ).max = parseInt( this.step / this.timeslider.skipRecord );
            document.getElementById( this.timeslider.domID ).value = parseInt( this.step / this.timeslider.skipRecord );

        }

    }

    //一時停止リストのチェック
    if( this.pauseStepList.indexOf( this.step ) >= 0 ){

        if( !this.pauseFlag ){
            //一時停止フラグ
            this.pauseFlag = true;

            this.switchButton( );
        }

    }

    if( this.calculateMode == PHYSICS.PreMode ){

        //プレ計算モードの計算終了

        if( this.step >= this.preCalculationMode.endStep )  {

            if( !this.pauseFlag ){
                //一時停止フラグ
                this.pauseFlag = true;
                document.getElementById( this.timeslider.domID ).value = 0;
                this.preCalculationMode.stage.div.style.display = "none";

                this.finishPreCalculation();

                this.switchButton( );
            }

        } else {

            if( !this.pauseFlag ){

                if( this.preCalculationMode.stage.enabled ){
                    var sinntyoku =  parseInt( (this.step+1) / this.preCalculationMode.endStep * 100 ) ;
                    this.preCalculationMode.stage.endTimeDiv.innerHTML = sinntyoku + "%";
                }

            }

        }

    }

    //時刻表示ボードの更新
    if( this.timeBoard.enabled ){
        this.timeBoard.textBoard.clearText();
        this.timeBoard.textBoard.addTextLine( time.toFixed(2) + " [s]", 0, 1 );
        this.timeBoard.textBoard.updateText();
    }

    //テキスト表示の更新
    if( this.textDisplay.enabled ){

        this.textDisplay.textBoard.clearText();

        for( var i=0; i< this.textDisplay.texts.length; i++ ){
            this.textDisplay.textBoard.addTextLine( this.textDisplay.texts[ i ], 0, 1 );
        }

        this.textDisplay.textBoard.updateText();

    }
    this.afterTimeControl ( );

}

//動画生成
PHYSICS.PhysLab.prototype.makeVideo = function ( ){

    if( !this.video.enabled ) return;

    //動画生成中
    if( this.video.makingFlag ) {

        //動画フレームの追加
        this.video.CG.add( this.CG.renderer.domElement );

    } else if( this.video.finishedFlag ) {

        //BlobURLの生成
        document.getElementById( this.video.downloadButtonID ).href = window.URL.createObjectURL(
            //動画Blobオブジェクトの生成
            this.video.CG.compile()
        );

        //動画ファイル名の指定
        document.getElementById( this.video.downloadButtonID ).download = this.video.fileName;

        //動画生成完了フラグの解除
        this.video.finishedFlag = false;
        //動画準備完了フラグの設定
        this.video.readyFlag = true;

        this.switchButton();

        //動画フレームの初期化
        this.video.CG.frames = [];

    }

}


//GIFアニメーション生成
PHYSICS.PhysLab.prototype.makeGIFanimation = function ( ){

    if( !this.gifAnimation.enabled ) return;

    //動画生成中
    if( this.gifAnimation.makingFlag ) {


        if( this.gifAnimation.step % this.gifAnimation.skip == 0 ){
            //現時点で描画されているvideo要素の画像をcanvas要素に出力
            this.gifAnimation.canvas.context.drawImage( this.CG.renderer.domElement, 0, 0, this.gifAnimation.canvas.width, this.gifAnimation.canvas.height );
            this.gifAnimation.CG.addFrame( this.gifAnimation.canvas.context );

        }
        this.gifAnimation.step++;

    } else if( this.gifAnimation.finishedFlag ) {

        //GIFアニメーションの生成
        this.gifAnimation.CG.finish();
        var byteString = this.gifAnimation.CG.stream().getData() ;

        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        //BlobURLの生成
        document.getElementById( this.gifAnimation.downloadButtonID ).href = window.URL.createObjectURL(
            //動画Blobオブジェクトの生成
            new Blob([ab], {type: "image/gif" })
        );

        //動画ファイル名の指定
        document.getElementById( this.gifAnimation.downloadButtonID ).download = this.gifAnimation.fileName;

        //動画生成完了フラグの解除
        this.gifAnimation.finishedFlag = false;
        //動画準備完了フラグの設定
        this.gifAnimation.readyFlag = true;

        this.switchButton();

        //動画フレームの初期化
        this.gifAnimation.CG = new GIFEncoder();
        this.gifAnimation.CG.setRepeat( this.gifAnimation.repeat );
        this.gifAnimation.CG.setDelay( this.gifAnimation.delay );
        this.gifAnimation.CG.start();

    }

}

////////////////////////////////////////////////////////////////////
// 停止フラグのチェック
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.checkFlags = function ( ){

    this.beforeCheckFlags( );

    //リセットフラグ
    if ( this.resetFlag ) {

        for( var i=0; i < this.objects.length; i++ ){

            if( this.objects[ i ].records.length == 0 ) continue;

            this.objects[ i ].position.copy( this.objects[ i ].records[ 0 ].position );
            this.objects[ i ].velocity.copy( this.objects[ i ].records[ 0 ].velocity );
            this.objects[ i ].force.copy( this.objects[ i ].records[ 0 ].force );
            this.objects[ i ].omega.copy( this.objects[ i ].records[ 0 ].omega );
            this.objects[ i ].quaternion.copy( this.objects[ i ].records[ 0 ].quaternion );

            this.objects[ i ].allowDrag = this.objects[ i ].draggable;
            this.objects[ i ].vectorsNeedsUpdate = true;

        }

        for( var i=0; i < this.objects.length; i++ ){
            //内部データの初期化
            this.objects[ i ].resetParameter( );
        }

        //停止フラグの解除
        this.resetFlag = false;
        //一時停止フラグを立てる
        this.pauseFlag = true;
        //画面キャプチャの生成フラグ
        this.makePictureFlag = true;
        this.makeSaveDataFlag = true;
        this.makeCalculationDataFlag = true;

        //初期フラグを立てる
        this.initFlag = true;

        //各種計算パラメータの初期化
        this.step = 0;
        //実験室のマウスドラックを規定値へ
        this.allowDrag = this.draggable;

        //時間制御スライダー利用時
        if( this.timeslider.enabled ){
            //最新データフラグの解除
            this.timeslider.save.flag = false;
            this.timeslider.m = 0;
        }

    }

    //一時停止解除（最新データへ復帰）
    if( !this.pauseFlag && this.timeslider.save.flag ){

        //全ての３次元オブジェクトを最新データを再設定
        for( var i = 0; i < this.objects.length; i++ ){

            this.objects[ i ].position.copy( this.timeslider.save.objects[ i ].position );
            this.objects[ i ].velocity.copy( this.timeslider.save.objects[ i ].velocity );

        }

        //最新データフラグの解除
        this.timeslider.save.flag = false;
    }

    this.afterCheckFlags( );
}


////////////////////////////////////////////////////////////////////
// 実験室の時間発展
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.timeEvolution = function ( ){
    this.breforeTimeEvolution( );
    //一時停止中の場合
    if( this.pauseFlag ) return;


    var skipRendering = (this.calculateMode == PHYSICS.RealTimeMode)? this.skipRendering : this.preCalculationMode.skipRendering;

    //描画の間引回数だけ時間発展を進める
    for ( var i = 0; i < skipRendering; i++ ) {

        //剛体球同士の衝突判定
        this.checkCollision( this.dt );

        //１ステップ過去データを格納
        this._storeData();
        this.centerTimeEvolution( );

        //高精度計算モード
        if( this.hightPrecisionMode.on ){

            //時間発展の計算
            for( var j = 0; j < this.hightPrecisionMode.N; j++ ) {
                var time = this.dt * this.step + this.dt/this.hightPrecisionMode.N * j;

                this.checkCollision( this.dt/this.hightPrecisionMode.N, time );
                //１ステップ過去データを格納
                this._storeData();
                this._timeEvolution( this.dt/this.hightPrecisionMode.N, time );
            }

            this.hightPrecisionMode.on = false;

        } else {

            //時間発展の計算
            this._timeEvolution( this.dt );

            if( this.hightPrecisionMode.enabled === true ) this.hightPrecisionMode.on = false;

        }
        //実験室オブジェクトのステップ数のインクリメント
        this.step++;

        this.breforeRecordDynamicData( );

        //運動データの保存
        for( var j = 0; j < this.objects.length; j++ ) this.objects[ j ].recordDynamicData( );

    }

    this.afterTimeEvolution( );
}

//１ステップ過去データを格納
PHYSICS.PhysLab.prototype._storeData =  function ( ) {
    for( var j = 0; j < this.objects.length; j++ ){
        //過去データへ現在データを格納
        this.objects[ j ].position_1.copy( this.objects[ j ].position );
        this.objects[ j ].velocity_1.copy( this.objects[ j ].velocity );
        this.objects[ j ].omega_1.copy( this.objects[ j ].omega );
        this.objects[ j ].quaternion_1.copy( this.objects[ j ].quaternion );

        //各種ベクトルの計算
        this.objects[ j ].computeVectors( );

        //動かない場合
        if( !this.objects[ j ].dynamic ) {

            //運動の記録
            this.objects[ j ].recordDynamicData( );

            continue;
        }

        //運動中はマウスドラックを禁止する
        this.objects[ j ].allowDrag = false;

    }
}




//RK4法アルゴリズムによる時間発展
PHYSICS.PhysLab.prototype._timeEvolution =  function ( dt, time ) {
    time = (time !== undefined)? time : dt * this.step;

    //方程式の取得
    var P = this._P.bind( this );
    var V = this._V.bind( this );
    var O = this._O.bind( this );

    //ルンゲ・クッタ法
    for( var i=0; i < this.objects.length; i++ ){
        PHYSICS.temp.objects1[ i ].position.copy( this.objects[ i ].position );
        PHYSICS.temp.objects1[ i ].velocity.copy( this.objects[ i ].velocity );
        PHYSICS.temp.objects1[ i ].omega.copy( this.objects[ i ].omega );
    }
    //第一ステップの力の計算
    this.calculateForce( PHYSICS.temp.objects1 , 0, time );
    this.calculateTorque( PHYSICS.temp.objects1 , 0, time );
    for( var i=0; i < this.objects.length; i++ ){

        this._P( i, PHYSICS.temp.objects1, this.objects[ i ]._k1_r );
        this._V( i, PHYSICS.temp.objects1, this.objects[ i ]._k1_v );
        this._O( i, PHYSICS.temp.objects1, this.objects[ i ]._k1_o );
    }

    for( var i=0; i<this.objects.length; i++ ){
        PHYSICS.temp.objects2[ i ].position.copy( this.objects[ i ].position.clone().add( this.objects[ i ]._k1_r.clone().multiplyScalar(dt/2)) );
        PHYSICS.temp.objects2[ i ].velocity.copy( this.objects[ i ].velocity.clone().add( this.objects[ i ]._k1_v.clone().multiplyScalar(dt/2)) );
        PHYSICS.temp.objects2[ i ].omega.copy( this.objects[ i ].omega.clone(      ).add( this.objects[ i ]._k1_o.clone().multiplyScalar(dt/2)) );
    }
    //第二ステップの力の計算
    this.calculateForce( PHYSICS.temp.objects2, dt/2, time + dt/2);
    this.calculateTorque( PHYSICS.temp.objects2 , dt/2, time + dt/2 );
    for( var i=0; i < this.objects.length; i++ ){
        this._P( i, PHYSICS.temp.objects2, this.objects[ i ]._k2_r );
        this._V( i, PHYSICS.temp.objects2, this.objects[ i ]._k2_v );
        this._O( i, PHYSICS.temp.objects2, this.objects[ i ]._k2_o );
    }

    for( var i=0; i<this.objects.length; i++ ){
        PHYSICS.temp.objects3[ i ].position.copy( this.objects[ i ].position.clone().add( this.objects[ i ]._k2_r.clone().multiplyScalar(dt/2)) );
        PHYSICS.temp.objects3[ i ].velocity.copy( this.objects[ i ].velocity.clone().add( this.objects[ i ]._k2_v.clone().multiplyScalar(dt/2)) );
        PHYSICS.temp.objects3[ i ].omega.copy( this.objects[ i ].omega.clone(   ).add( this.objects[ i ]._k2_o.clone().multiplyScalar(dt/2)) );
    }
    //第三ステップの力の計算
    this.calculateForce( PHYSICS.temp.objects3, dt/2, time + dt/2 );
    this.calculateTorque( PHYSICS.temp.objects3 , dt/2, time + dt/2 );
    for( var i=0; i < this.objects.length; i++ ){
        this._P( i, PHYSICS.temp.objects3, this.objects[ i ]._k3_r );
        this._V( i, PHYSICS.temp.objects3, this.objects[ i ]._k3_v );
        this._O( i, PHYSICS.temp.objects3, this.objects[ i ]._k3_o );
    }

    for( var i=0; i<this.objects.length; i++ ){
        PHYSICS.temp.objects4[ i ].position.copy( this.objects[ i ].position.clone().add( this.objects[ i ]._k3_r.clone().multiplyScalar(dt)) );
        PHYSICS.temp.objects4[ i ].velocity.copy( this.objects[ i ].velocity.clone().add( this.objects[ i ]._k3_v.clone().multiplyScalar(dt)) );
        PHYSICS.temp.objects4[ i ].omega.copy(  this.objects[ i ].omega.clone(   ).add( this.objects[ i ]._k3_o.clone().multiplyScalar(dt)) );
    }

    //第四ステップの力の計算
    this.calculateForce( PHYSICS.temp.objects4, dt, time + dt );
    this.calculateTorque( PHYSICS.temp.objects4 , dt, time + dt );
    for( var i=0; i < this.objects.length; i++ ){
        this._P( i, PHYSICS.temp.objects4, this.objects[ i ]._k4_r );
        this._V( i, PHYSICS.temp.objects4, this.objects[ i ]._k4_v );
        this._O( i, PHYSICS.temp.objects4, this.objects[ i ]._k4_o );
    }

    for( var i=0; i<this.objects.length; i++ ){
        var dr = this.objects[ i ]._k1_r.add( this.objects[ i ]._k2_r.multiplyScalar(2) ).add( this.objects[ i ]._k3_r.multiplyScalar(2) ).add( this.objects[ i ]._k4_r ).multiplyScalar( dt/6 );
        var dv = this.objects[ i ]._k1_v.add( this.objects[ i ]._k2_v.multiplyScalar(2) ).add( this.objects[ i ]._k3_v.multiplyScalar(2) ).add( this.objects[ i ]._k4_v ).multiplyScalar( dt/6 );
        var do_= this.objects[ i ]._k1_o.add( this.objects[ i ]._k2_o.multiplyScalar(2) ).add( this.objects[ i ]._k3_o.multiplyScalar(2) ).add( this.objects[ i ]._k4_o ).multiplyScalar( dt/6 );

        this.objects[ i ].position.add( dr );
        this.objects[ i ].velocity.add( dv );
        this.objects[ i ].omega.add( do_ );
    }

    for( var i=0; i < this.objects.length; i++ ){

        if( !this.objects[ i ].noRotation ){
            PHYSICS.temp.omega.copy( this.objects[ i ].omega );
            var omega_abs = this.objects[ i ].omega.length();
            //球の回転
            PHYSICS.temp.q.setFromAxisAngle( PHYSICS.temp.omega.normalize(), omega_abs * dt );
            this.objects[ i ].quaternion.multiply( PHYSICS.temp.q );
        }

    }

}
//剛体に加わる力の計算
PHYSICS.PhysLab.prototype.calculateForce = function ( objects, dt, time ) {

    for( var i = 0; i < this.objects.length; i++ ) {
        this.objects[ i ].force.set( 0, 0, 0 );
        this.objects[ i ].torque.set( 0, 0, 0 );

        if( !this.objects[ i ].dynamic ) {
            this.objects[ i ].dynamicFunction( time, objects[ i ] );
        }

        //個別の物体に生じる力を加算
        this.objects[ i ].calculateAddForces( objects[ i ] );
    }

    //結合力
    for( var i = 0; i < this.interacts.length; i++ ){
        var interaction = this.interacts[ i ];

        var object1 = interaction.object1;
        var object2 = interaction.object2;

        //重力場、空気抵抗力などの場との相互作用
        if( object1.constructor == PHYSICS.PhysLab ){

            if( interaction.type == PHYSICS.ConstantForce ){

                object2.force.add( interaction.force );

            } else if( interaction.type == PHYSICS.AirResistanceForce ){

                var beta = interaction.beta;
                var gamma = interaction.gamma;

                var v = objects[ object2.objectsIndex ].velocity;
                var v_abs2 = v.lengthSq();
                var v_abs = Math.sqrt( v_abs2 );

                //空気抵抗力
                var f = v_abs * gamma + v_abs2 * beta;
                object2.force.add( v.clone().normalize().multiplyScalar( - f ) );

                var rollingResistance = interaction.rollingResistance;
                //転がり摩擦力
                var f_rr = objects[ object2.objectsIndex ].omega.clone().multiplyScalar( -rollingResistance );
                object2.torque.add( f_rr );

            }

        } else {
            //その他の２点間相互作用

            var r12 = new THREE.Vector3().subVectors( objects[ object1.objectsIndex ].position, objects[ object2.objectsIndex ].position );
            var r12_abs = r12.length();
            var r12_absSq = r12_abs * r12_abs;
            var n12 = r12.clone().normalize();
            var n21 = n12.clone().negate();

            if( interaction.type == PHYSICS.LinearSpringConnection) {

                //ばね弾性力
                var f12 = -interaction.k * ( r12_abs - interaction.L0 );

            } else if(  interaction.type == PHYSICS.CoulombInteraction ){

                //クーロン力
                var f12 = object1.charge * object2.charge / ( 4 * Math.PI * interaction.epsilon ) / r12_absSq;

            } else if( interaction.type == PHYSICS.UniversalGravitation ){

                //万有引力
                var f12 = -interaction.G * object1.mass * object2.mass / r12_absSq;

            } else if( interaction.type == PHYSICS.LennardJonesPotential ){

                var a = ( interaction.sigma / r12_abs );

                //レナード・ジョーンズ相互作用
                var f12 = 24 * interaction.epsilon / interaction.sigma * ( 2 * Math.pow( a, 13 ) - Math.pow( a, 7 ) ) ;

            } else {

                var f12 = false;
            }

            if( f12 ) {
                object1.force.add ( n12.clone().multiplyScalar( f12 ));
                object2.force.add ( n21.clone().multiplyScalar( f12 ));
            }

        }

    }

    //経路拘束力の計算
    for( var i = 0; i < this.interacts.length; i++ ){
        var interaction = this.interacts[ i ];

        var object1 = interaction.object1;
        var object2 = interaction.object2;

        if( interaction.type === PHYSICS.PathBinding ){

            var position = objects[ object2.objectsIndex ].position;
            var velocity = objects[ object2.objectsIndex ].velocity;

            var force = object2.force;
            var mass = object2.mass;

            //parametricFunctionプロパティ参照用変数
            var _this = interaction.parametricFunction;


            //経路そのものが運動する場合
            if( interaction.dynamicFunction ){

                var r0 = interaction.interactionObject.position.clone();
                var v0 = interaction.interactionObject.velocity.clone();
                var a0 = interaction.interactionObject.acceleration.clone();

            } else {

                var r0 = new THREE.Vector3( );
                var v0 = new THREE.Vector3( );
                var a0 = new THREE.Vector3( );

            }

            //３次元オブジェクトの相対速度
            var bar_r = new THREE.Vector3( ).subVectors( position, r0 );
            var bar_v = new THREE.Vector3( ).subVectors( velocity, v0 );

            //媒介変数の取得
            var theta = _this.getTheta ( _this, bar_r, bar_v);

            //媒介変数に対する位置ベクトル、接線ベクトル、曲率ベクトルの計算
            var r = _this.position( _this, theta );
            var t = _this.tangent( _this, theta );
            var c = _this.curvature( _this, theta);
            //３次元ベクトルオブジェクトの宣言
            var path_position = new THREE.Vector3 ( r.x, r.y, r.z );
            var tangent = new THREE.Vector3 ( t.x, t.y, t.z );
            var curvature = new THREE.Vector3 ( c.x, c.y, c.z );


            //微係数dl/dtとd^2l/dt^2を計算
            var dl_dt = bar_v.dot( tangent );
            var d2l_dt2 = force.dot( tangent )/mass - a0.dot( tangent );

            //３次元オブジェクトに加わる力を計算
            var f = a0.clone( );
            f.add( tangent.clone( ).multiplyScalar( d2l_dt2 ) );
            f.add( curvature.clone( ).multiplyScalar( dl_dt * dl_dt ));
            f.multiplyScalar( mass );

            //復元力の有無のチェック
            if( interaction.restoringForce.enabled ){


                var ratio = f.length() * interaction.restoringForce.factor;

                //ばね定数と減衰係数
                var k_b = interaction.restoringForce.k * ratio;
                var gamma_b = interaction.restoringForce.gamma * ratio;

                //復元力の方向ベクトル
                var c1 = curvature.clone( ).normalize( );
                var c2 = new THREE.Vector3( ).crossVectors( tangent, c1 );

                //経路上の位置を平行移動
                path_position.add( r0 );

                //ずれベクトル
                var DeltaL = new THREE.Vector3( ).subVectors( position, path_position );

                //復元力
                f.add( c1.clone( ).multiplyScalar(  -k_b * c1.dot(  DeltaL ) ) );
                f.add( c2.clone( ).multiplyScalar(  -k_b * c2.dot(  DeltaL ) ) );

                //復元速度抵抗力
                f.add( c1.clone( ).multiplyScalar( - gamma_b * c1.dot( bar_v )) );
                f.add( c2.clone( ).multiplyScalar( - gamma_b * c2.dot( bar_v )) );

            }

            f.sub( force );
            object2.force.add( f );
        }

    }


    //２点間距離固定拘束力の計算
    var pairs = this.fixedDistanceInteractionPairs;
    for(var i = 0; i < pairs.length; i++){
        //結合数
        var length = pairs[ i ].length;

        if( length >= 2 ){

            var ns = [];    //結合力の方向単位ベクトルを格納する配列
            var lines = []; //

            for( var i2 = 0; i2 < length; i2++ ){

                //２重配列の準備
                ns[ i2 ] = [];
                for( var j2 = 0; j2 < length; j2++ ){

                    var id1 = pairs[ i ][ i2 ];
                    var id2 = pairs[ i ][ j2 ];

                    var interactsIndex = this.getConnectsIndex(id1, id2);

                    if( interactsIndex !== false ){

                        if( this.interacts[ interactsIndex ].type === PHYSICS.FixedDistanceConnection ){

                            var o1 = this.interacts[ interactsIndex ].object1.objectsIndex;
                            var o2 = this.interacts[ interactsIndex ].object2.objectsIndex;

                            if( this.interacts[ interactsIndex ].object1.id == id1 ){
                                ns[ i2 ][ j2 ] = new THREE.Vector3().subVectors(
                                    objects[ o1 ].position,
                                    objects[ o2 ].position
                                ).normalize();
                            } else {
                                ns[ i2 ][ j2 ] = new THREE.Vector3().subVectors(
                                    objects[ o1 ].position,
                                    objects[ o2 ].position
                                ).normalize().negate();
                            }

                        } else {

                            ns[ i2 ][ j2 ] = new THREE.Vector3();

                        }

                    } else {
                        var object1 = this.getObjectByID( id1 );
                        var object2 = this.getObjectByID( id2 );

                        //もし両者とも固定されている場合は連立方程式に入れない
                        if( !object1.dynamic && !object2.dynamic ) {
                            continue;
                        }
                        ns[ i2 ][ j2 ] = new THREE.Vector3();

                    }



                    if( i2 < j2 ) lines.push( [ i2, j2 ] );
                }
            }

            //連立方程式を保持する配列
            var M = [];
            for( var k = 0; k < lines.length; k++ )    M[ k ] = [];

            for( var line = 0; line < lines.length; line++ ){
                //剛体球番号の取得
                var id1 = pairs[ i ][ lines[ line ][ 0 ] ];
                var id2 = pairs[ i ][ lines[ line ][ 1 ] ];
                var object1 = this.getObjectByID( id1 );
                var object2 = this.getObjectByID( id2 );

                //相対位置ベクトル
                var r12 = new THREE.Vector3().subVectors(
                    objects[ object1.objectsIndex ].position,
                    objects[ object2.objectsIndex ].position
                )
                //相対速度ベクトル
                var v12 = new THREE.Vector3().subVectors(
                    objects[ object1.objectsIndex ].velocity,
                    objects[ object2.objectsIndex ].velocity
                );
                var A1 = object1.force.clone().divideScalar( object1.mass );
                var A2 = object2.force.clone().divideScalar( object2.mass );

                if( !object1.dynamic ) A1.copy( object1.acceleration );
                if( !object2.dynamic ) A2.copy( object2.acceleration );


                for( var _line = 0; _line < lines.length; _line++ ){

                    if( line == _line ){

                        M[ line ][ _line ] = r12.length() * ( 1.0 / object1.mass + 1.0 / object2.mass );

                    } else {

                        var id1_ =  pairs[ i ][ lines[ _line ][ 0 ] ];
                        var id2_ =  pairs[ i ][ lines[ _line ][ 1 ] ];
                        var object1_ = this.getObjectByID( id1_ );
                        var object2_ = this.getObjectByID( id2_ );


                        M[ line ][ _line ] = r12.length() * ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ns[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        );

                        if( lines[ _line ][ 0 ] == lines[ line ][ 0 ] ) M[ line ][ _line ] /=  object1_.mass;
                        if( lines[ _line ][ 1 ] == lines[ line ][ 1 ] ) M[ line ][ _line ] /=  object2_.mass;
                        if( lines[ _line ][ 0 ] == lines[ line ][ 1 ] ) M[ line ][ _line ] /= -object1_.mass;
                        if( lines[ _line ][ 1 ] == lines[ line ][ 0 ] ) M[ line ][ _line ] /= -object2_.mass;

                        if( (lines[ _line ][ 0 ] != lines[ line ][ 0 ]) && (lines[ _line ][ 0 ] != lines[ line ][ 1 ]) && (lines[ _line ][ 1 ] != lines[ line ][ 0 ]) && (lines[ _line ][ 1 ] != lines[ line ][ 1 ]) ) M[ line ][ _line ] = 0;

                    }

                }

                M[ line ][ lines.length ] = v12.lengthSq() + new THREE.Vector3().subVectors( A1, A2 ).dot( r12 );

            }

//            console.log( M );


            //連立方程式を解く
            var A = PHYSICS.Math.solveSimultaneousEquations( M );

            for( var line = 0; line < lines.length; line++ ){
                //剛体球番号の取得
                var id1 = pairs[ i ][ lines[ line ][ 0 ] ];
                var id2 = pairs[ i ][ lines[ line ][ 1 ] ];
                var object1 = this.getObjectByID( id1 );
                var object2 = this.getObjectByID( id2 );
                object1.force.add( ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].clone().multiplyScalar( -A[ line ] ) );
                object2.force.add( ns[ lines[ line ][ 1 ] ][ lines[ line ][ 0 ] ].clone().multiplyScalar( -A[ line ] ) );

            }

        }

    }

    //２点間距離固定結合の距離補正
    for( var i = 0; i < this.interacts.length; i++ ){
        //結合タイプが剛体棒結合ではない場合はスキップ
        if( this.interacts[ i ].type != PHYSICS.FixedDistanceConnection ) continue;

        //相対位置ベクトル
        var r12 = new THREE.Vector3().subVectors(
            objects[ this.interacts[ i ].object1.objectsIndex ].position,
            objects[ this.interacts[ i ].object2.objectsIndex ].position
        )
        //相対速度ベクトル
        var v12 = new THREE.Vector3().subVectors(
            objects[ this.interacts[ i ].object1.objectsIndex ].velocity,
            objects[ this.interacts[ i ].object2.objectsIndex ].velocity
        );


        //補正倍率
        var ratio = ( this.interacts[ i ].object1.force.length() + this.interacts[ i ].object2.force.length() ) * this.interacts[ i ].compensationFactor

        //ズレに比例した弾性力を加算
        var fk = this.interacts[ i ].compensationK * ( r12.length() - this.interacts[ i ].L ) * ratio;
        //剛体棒方向速度の減衰
        var fb = this.interacts[ i ].compensationGamma * v12.dot( r12 ) * ratio;

        this.interacts[ i ].object1.force.add( r12.clone().normalize().multiplyScalar( -fk - fb ));
        this.interacts[ i ].object2.force.add( r12.clone().normalize().multiplyScalar(  fk + fb ));
    }

    //接触力の計算
    this.calculateContactForce( objects, dt, time );

    //衝突力の加算
    for( var i = 0; i < this.objects.length; i++ ){

        this.objects[ i ].force.add( this.objects[ i ].collisionForce );

    }

}

//剛体に加わる力の計算
PHYSICS.PhysLab.prototype.calculateTorque = function ( objects, dt ) {

    var time = dt * this.step;

    //トルクの初期化
    for( var i = 0; i < this.objects.length; i++ ) {
        //個別の物体に生じるトルクを加算
//        this.objects[ i ].calculateAddTorques( );
    }

    for( var i = 0; i < this.objects.length; i++ ){

        this.objects[ i ].torque.add( this.objects[ i ].collisionTorque );
        //接触時の偶力はcalculateContactForceメソッド内で加算
    }


}


//
PHYSICS.PhysLab.prototype._V = function ( n, objects, vector3 ) {

    if( this.objects[ n ].dynamic ){

        vector3.copy( this.objects[ n ].force.clone().divideScalar( this.objects[ n ].mass ) );

    } else {

        vector3.set(0, 0, 0);

    }

}
PHYSICS.PhysLab.prototype._P = function ( n, objects, vector3 ) {

    if( this.objects[ n ].dynamic ){

        vector3.copy( objects[ n ].velocity );

    } else {

        vector3.set(0, 0, 0);
    }

}
PHYSICS.PhysLab.prototype._O = function ( n, objects, vector3 ) {

    if( this.objects[ n ].dynamic ){

        var object = this.objects[ n ];
        var omega = objects[ n ].omega;

        vector3.x = ( object.torque.x - ( object.moments[1] - object.moments[2] ) * omega.y * omega.z ) / object.moments[0];
        vector3.y = ( object.torque.y - ( object.moments[2] - object.moments[0] ) * omega.z * omega.x ) / object.moments[1];
        vector3.z = ( object.torque.z - ( object.moments[0] - object.moments[1] ) * omega.x * omega.y ) / object.moments[2];


    } else {

        vector3.set(0, 0, 0);
    }

}

////////////////////////////////////////////////////////////////////
// 画面キャプチャの生成
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.makePicture = function ( ){
    //画面キャプチャ生成フラグのチェック
    if( !this.makePictureFlag ) return;
    if( this.playback.on ) return;

    this.breforeMakePicture( );

    if( this.pictureID ) {

        //canvas要素→DataURL形式
        document.getElementById( this.pictureID ).href = this.CG.renderer.domElement.toDataURL("image/png");

        var time = ( this.timeslider.m !== undefined )? this.timeslider.m * this.timeslider.skipRecord * this.dt : this.step * this.dt;

        //PNGファイル名の命名
        document.getElementById( this.pictureID ).download = time.toFixed(2) + ".png";

    }
    //画面キャプチャ生成フラグの解除
    this.makePictureFlag = false;

    this.afterMakePicture( );

}

////////////////////////////////////////////////////////////////////
// ダウンロードデータの生成
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.makeDownloadData = function ( column, ID ,fileName ){
    //データ列
    column = column || [];

    //出力内容の用意
    var outputs = [];
    for( var i = 0; i < column[ 0 ].length; i++ ){

        var data = column[ 0 ][ i ][ 0 ]; //時刻

        for( var j = 0; j < column.length; j++ ){
            data += "\t" + column[ j ][ i ][ 1 ];
        }

        data += "\n";

        outputs.push( data );
    }

    // Blobオブジェクトの生成
    var blob = new Blob( outputs, { "type" : "text/plain" } );

    document.getElementById( ID ).href = window.URL.createObjectURL( blob );
    document.getElementById( ID ).download = fileName;

}



////////////////////////////////////////////////////////////////////
// 通信メソッドの定義
////////////////////////////////////////////////////////////////////
//initEventメソッド
PHYSICS.PhysLab.prototype.beforeInitEvent = function ( ){
    for( var i = 0; i < this.beforeInitEventFunctions.length; i++ ){
        this.beforeInitEventFunctions[ i ]( );
    }
}
PHYSICS.PhysLab.prototype.afterInitEvent = function ( ){
    for( var i = 0; i < this.afterInitEventFunctions.length; i++ ){
        this.afterInitEventFunctions[ i ]( );
    }
}
//init3DCGメソッド
PHYSICS.PhysLab.prototype.beforeInit3DCG = function ( ){
    for( var i = 0; i < this.beforeInit3DCGFunctions.length; i++ ){
        this.beforeInit3DCGFunctions[ i ]( );
    }
}
PHYSICS.PhysLab.prototype.afterInit3DCG = function ( ){
    for( var i = 0; i < this.afterInit3DCGFunctions.length; i++ ){
        this.afterInit3DCGFunctions[ i ]( );
    }
}

PHYSICS.PhysLab.prototype.afterStartLab = function ( ){
    for( var i = 0; i < this.afterStartLabFunctions.length; i++ ){
        this.afterStartLabFunctions[ i ]( );
    }
}



//timeControlメソッド
PHYSICS.PhysLab.prototype.beforeTimeControl = function ( ){
    for( var i = 0; i < this.beforeTimeControlFunctions.length; i++ ){
        this.beforeTimeControlFunctions[ i ]( );
    }
}
PHYSICS.PhysLab.prototype.centerTimeEvolution = function ( ){
    for( var i = 0; i < this.centerTimeEvolutionFunctions.length; i++ ){
        this.centerTimeEvolutionFunctions[ i ]( );
    }
}
PHYSICS.PhysLab.prototype.breforeRecordDynamicData = function ( ){
    for( var i = 0; i < this.breforeRecordDynamicDataFunctions.length; i++ ){
        this.breforeRecordDynamicDataFunctions[ i ]( );
    }
}


PHYSICS.PhysLab.prototype.afterTimeControl = function ( ){
    for( var i = 0; i < this.afterTimeControlFunctions.length; i++ ){
        this.afterTimeControlFunctions[ i ]( );
    }
}
//checkFlagsメソッド
PHYSICS.PhysLab.prototype.beforeCheckFlags = function ( ){
    for( var i = 0; i < this.beforeCheckFlagsFunctions.length; i++ ){
        this.beforeCheckFlagsFunctions[ i ]( );
    }
}
PHYSICS.PhysLab.prototype.afterCheckFlags = function ( ){
    for( var i = 0; i < this.afterCheckFlagsFunctions.length; i++ ){
        this.afterCheckFlagsFunctions[ i ]( );
    }
}
//timeEvolutionメソッド
PHYSICS.PhysLab.prototype.breforeTimeEvolution = function ( ){
    for( var i = 0; i < this.breforeTimeEvolutionFunctions.length; i++ ){
        this.breforeTimeEvolutionFunctions[ i ]( );
    }
}
PHYSICS.PhysLab.prototype.afterTimeEvolution = function ( ){
    for( var i = 0; i < this.afterTimeEvolutionFunctions.length; i++ ){
        this.afterTimeEvolutionFunctions[ i ]( );
    }
}
//makePictureメソッド
PHYSICS.PhysLab.prototype.breforeMakePicture = function ( ){
    for( var i = 0; i < this.breforeMakePictureFunctions.length; i++ ){
        this.breforeMakePictureFunctions[ i ]( );
    }
}
PHYSICS.PhysLab.prototype.afterMakePicture = function ( ){
    for( var i = 0; i < this.afterMakePictureFunctions.length; i++ ){
        this.afterMakePictureFunctions[ i ]( );
    }
}
//makeJSONSaveDataメソッド
PHYSICS.PhysLab.prototype.breforeMakeJSONSaveData = function ( ){
    if( this.breforeMakeJSONSaveDataFunctions === undefined ) return;
    for( var i = 0; i < this.breforeMakeJSONSaveDataFunctions.length; i++ ){
        this.breforeMakeJSONSaveDataFunctions[ i ]( );
    }
}
PHYSICS.PhysLab.prototype.afterMakeJSONSaveData = function ( ){
    for( var i = 0; i < this.afterMakeJSONSaveDataFunctions.length; i++ ){
        this.afterMakeJSONSaveDataFunctions[ i ]( );
    }
}

//loopメソッド
PHYSICS.PhysLab.prototype.beforeLoop = function ( ){
    for( var i = 0; i < this.beforeLoopFunctions.length; i++ ){
        this.beforeLoopFunctions[ i ]( );
    }
}
PHYSICS.PhysLab.prototype.afterLoop = function ( ){
    for( var i = 0; i < this.afterLoopFunctions.length; i++ ){
        this.afterLoopFunctions[ i ]( );
    }
}
PHYSICS.PhysLab.prototype.finishPreCalculation = function ( ){
    for( var i = 0; i < this.finishPreCalculationFunctions.length; i++ ){
        this.finishPreCalculationFunctions[ i ]( );
    }
}

////////////////////////////////////////////////////////////////////
// オブジェクト同士の衝突検知（接触判定も含む）
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.checkCollision = function( dt ){
// ※ ２回連続の衝突を接触と見なす！！

    //衝突力／接触力の初期化
    for( var j = 0; j < this.objects.length; j++ ){
        this.objects[ j ].collisionForce.set( 0, 0, 0 );
        this.objects[ j ].collisionTorque.set( 0, 0, 0 );
        this.objects[ j ].contactForce.set( 0, 0, 0 );
        this.objects[ j ].contactTorque.set( 0, 0, 0 );
    }

    //衝突ペアを一時保管（接触判定に利用）
    this._collisionPairs = [];
    for( var i = 0; i < this.collisionPairs.length; i++ ){

        this._collisionPairs[ i ] = this.collisionPairs[ i ];

    }
    //接触ペアを一時保管（時間の巻き戻しに備えて）
    this._contactPairs = [];
    for( var i = 0; i < this.contactPairs.length; i++ ){

        this._contactPairs[ i ] = this.contactPairs[ i ];

    }

    //衝突ペアを格納する配列の初期化
    this.collisionPairs = [];

    //衝突判定を行うオブジェクト数の取
    for( var i = 0; i < this.interacts.length; i++ ){
        if( this.interacts[ i ].type != PHYSICS.SolidCollision ) continue;

        //結合番号
        var interactsIndex = i;
        //オブジェクトの取得
        var object1 = this.interacts[ i ].object1;
        var object2 = this.interacts[ i ].object2;

        //バウンディング球による衝突可能性の判定
        if(    this.checkPossibilityOfCollision( object1 , object2 ) ){

            //運動する球オブジェクトと衝突対象のオブジェクトの判別
            if( object1 instanceof PHYSICS.Sphere && object2 instanceof PHYSICS.Sphere){
                //球オブジェクト vs 球オブジェクト
                this.checkCollisionSphereVsSphere( object1, object2, interactsIndex, dt );
            }else if( object1 instanceof PHYSICS.Sphere && object2 instanceof PHYSICS.Plane )
                //球オブジェクト vs 平面オブジェクト
                this.checkCollisionSphereVsPlane( object1, object2, interactsIndex, dt );
            else if( object2 instanceof PHYSICS.Sphere && object1 instanceof PHYSICS.Plane )
                //球オブジェクト vs 平面オブジェクト
                this.checkCollisionSphereVsPlane( object2, object1, interactsIndex, dt );
            else if( object1 instanceof PHYSICS.Sphere && object2 instanceof PHYSICS.Cylinder )
                //球オブジェクト vs 円柱オブジェクト
                this.checkCollisionSphereVsCylinder( object1, object2, interactsIndex );
            else if( object2 instanceof PHYSICS.Sphere && object1 instanceof PHYSICS.Cylinder )
                //球オブジェクト vs 円柱オブジェクト
                this.checkCollisionSphereVsCylinder( object2, object1, interactsIndex );
            else if( object1 instanceof PHYSICS.Sphere && object2 instanceof PHYSICS.Line )
                //球オブジェクト vs 線オブジェクト
                this.checkCollisionSphereVsLine( object1, object2, interactsIndex );
            else if( object2 instanceof PHYSICS.Sphere && object1 instanceof PHYSICS.Line )
                //球オブジェクト vs 線オブジェクト
                this.checkCollisionSphereVsLine( object2, object1, interactsIndex );

        }

    }

    //接触状態の解除判定
    if( this.contactPairs.length > 0 ){
        var slicesFlag = [];

        for( var i = 0; i < this.contactPairs.length; i++ ){

            var contactFlag = true;
            for( var j = 0; j < this.collisionPairs.length; j++ ){
                if( ( this.collisionPairs[ j ].object1.id === this.contactPairs[ i ].object1.id && this.collisionPairs[ j ].object2.id === this.contactPairs[ i ].object2.id ) ||
                    ( this.collisionPairs[ j ].object2.id === this.contactPairs[ i ].object1.id && this.collisionPairs[ j ].object1.id === this.contactPairs[ i ].object2.id ) ){
                    contactFlag = false;

                    //衝突点の更新
                    this.contactPairs[ i ].collisionPoint.copy(this.collisionPairs[ j ].collisionPoint);
                    continue;
                }

            }
            //接触状態の継続判定の結果を格納
            slicesFlag[ i ] = contactFlag;
        }

        for( var i = slicesFlag.length - 1; i >= 0 ; i-- ){

            if( slicesFlag[ i ] ) {

                //衝突ペアから接触ペアを削除
                this.contactPairs.splice( i, 1 );
            }

        }

    }


    //接触判定（２回連続の衝突を接触と見なす！！）
    if( this._collisionPairs.length > 0 && this.collisionPairs.length > 0 ){
        var slicesFlag = [];

        //接触ペア
        this.contactPairs = [];
        for( var i = 0; i < this.collisionPairs.length; i++ ){

            var contactFlag = false;
            for( var j = 0; j < this._collisionPairs.length; j++ ){
                if( ( this.collisionPairs[ i ].object1.id === this._collisionPairs[ j ].object1.id && this.collisionPairs[ i ].object2.id === this._collisionPairs[ j ].object2.id ) ||
                    ( this.collisionPairs[ i ].object2.id === this._collisionPairs[ j ].object1.id && this.collisionPairs[ i ].object1.id === this._collisionPairs[ j ].object2.id ) ){
                    contactFlag = true;
                    continue;
                }

            }
            //接触判定の結果を格納
            if( contactFlag ){
                slicesFlag[ i ] = true;
                this.contactPairs.push( this.collisionPairs[ i ] );
            } else {
                slicesFlag[ i ] = false;
            }

        }

        //接触ペアを衝突ペアから削除
        for( var i = slicesFlag.length - 1; i >= 0 ; i-- ){

            if( slicesFlag[ i ] ) {

                this.collisionPairs.splice( i, 1 );

            }

        }

    }

    //接触状態の継続判定
    if( this.contactPairs.length > 0 && this.collisionPairs.length > 0 ){
        var slicesFlag = [];

        for( var i = 0; i < this.collisionPairs.length; i++ ){

            var contactFlag = false;
            for( var j = 0; j < this.contactPairs.length; j++ ){
                if( ( this.collisionPairs[ i ].object1.id === this.contactPairs[ j ].object1.id && this.collisionPairs[ i ].object2.id === this.contactPairs[ j ].object2.id ) ||
                    ( this.collisionPairs[ i ].object2.id === this.contactPairs[ j ].object1.id && this.collisionPairs[ i ].object1.id === this.contactPairs[ j ].object2.id ) ){
                    contactFlag = true;
                    continue;
                }

            }
            //接触状態の継続判定の結果を格納
            slicesFlag[ i ] = contactFlag;
        }

        for( var i = slicesFlag.length - 1; i >= 0 ; i-- ){

            if( slicesFlag[ i ] ) {

                //衝突ペアから接触ペアを削除
                this.collisionPairs.splice( i, 1 );

            }

        }

    }


    //衝突力の計算
    if( this.collisionPairs.length > 0 ){

        for( var i = 0; i < this.objects.length; i++ ) {

            //時間を巻き戻す
            this.objects[ i ].position.copy( this.objects[ i ].position_1 );
            this.objects[ i ].velocity.copy( this.objects[ i ].velocity_1 );
            this.objects[ i ].omega.copy( this.objects[ i ].omega_1 );
            this.objects[ i ].quaternion.copy( this.objects[ i ].quaternion_1 );

        }

        if( this.hightPrecisionMode.on === false ) this.step--;

        //新規衝突ペアによる同時衝突力の計算を行う
        this.calculateCollisionForce( dt );

        if( this._collisionPairs.length > 0 ){
            //衝突ペアを巻き戻す（次回接触判定で利用するため）
            this.collisionPairs = [];
            for( var i = 0; i < this._collisionPairs.length; i++ ){

                this.collisionPairs[ i ] = this._collisionPairs[ i ];

            }
        }

        //接触ペアを巻き戻す（改めて接触力を計算するため）
        this.contactPairs = [];
        for( var i = 0; i < this._contactPairs.length; i++ ){

            this.contactPairs[ i ] = this._contactPairs[ i ];

        }

    }

}


//力学的エネルギーの計算
PHYSICS.PhysLab.prototype.calculateEnergy = function () {
    var kinetic = 0;
    var rotation = 0;
    var potential = 0;

    for( var i = 0; i < this.objects.length; i++ ){

        //速度の大きさの２乗の計算
        var v2 = this.objects[ i ].velocity.lengthSq();
        var o2 = this.objects[ i ].omega.lengthSq();

        //運動エネルギーの計算
        if( this.objects[ i ].dynamic && this.objects[i].mass != Infinity){
            this.objects[ i ].energy.kinetic =  1.0 / 2.0 * this.objects[ i ].mass * v2;
            kinetic += this.objects[ i ].energy.kinetic;

        }
        //回転運動エネルギーの計算
        if( this.objects[ i ].dynamic && this.objects[i].moment != Infinity ){

            this.objects[ i ].energy.rotation
            = 1.0 / 2.0 * this.objects[ i ].moments[0] * this.objects[ i ].omega.x * this.objects[ i ].omega.x
            + 1.0 / 2.0 * this.objects[ i ].moments[1] * this.objects[ i ].omega.y * this.objects[ i ].omega.y
            + 1.0 / 2.0 * this.objects[ i ].moments[2] * this.objects[ i ].omega.z * this.objects[ i ].omega.z

            rotation += this.objects[ i ].energy.rotation;
        }

    }

    for( var i = 0; i < this.interacts.length; i++ ){
        var interaction = this.interacts[ i ];
        var object1 = interaction.object1;
        var object2 = interaction.object2;

        if( object1.constructor == PHYSICS.PhysLab ){

            if( interaction.type == PHYSICS.ConstantForce ){

                object2.energy.potential = -object2.position.dot( interaction.force );
                interaction.potential = object2.energy.potential;

            } else {

                interaction.potential = 0;

            }

        } else {

            var r12 = new THREE.Vector3().subVectors( object1.position, object2.position );
            var r12_abs = r12.length();
            var r12_absSq = r12_abs * r12_abs;
            var n12 = r12.clone().normalize();
            var n21 = n12.clone().negate();

            interaction.potential = 0;
            if( interaction.type == PHYSICS.LinearSpringConnection ){

                //ばね弾性エネルギー
                interaction.potential = 1/2 *interaction.k * ( r12_abs - interaction.L0 ) * ( r12_abs - interaction.L0 ) ;

            } else if( interaction.type == PHYSICS.CoulombInteraction ){

                 //クーロン相互作用
                interaction.potential = object1.charge * object2.charge / ( 4 * Math.PI * interaction.epsilon ) / r12_abs;

            } else if( interaction.type == PHYSICS.UniversalGravitation ){

                //ポテンシャルエネルギーの計算
                interaction.potential = - interaction.G * object1.mass * object2.mass / r12_abs;

            } else if( interaction.type == PHYSICS.LennardJonesPotential ){

                var a = ( interaction.sigma / r12_abs );

                //ポテンシャルエネルギーの計算
                interaction.potential = 4 * interaction.epsilon * ( Math.pow( a, 12 ) - Math.pow( a, 6 ) );

            }

        }

        potential += interaction.potential;

    }

    //力学的エネルギーをオブジェクトで返す
    return { kinetic: kinetic, rotation: rotation, potential: potential };

}

////////////////////////////////////////////////////////////////////
// バウンディング球による衝突可能性の判定
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.checkPossibilityOfCollision = function( object1, object2 ){
    //バウンディング球の半径の取得
    var l1 = object1.boundingSphere.radius;//
    var l2 = object2.boundingSphere.radius;//
    //グローバル座標系におけるバウンディング球の中心座標
    var r1 = new THREE.Vector3( ).copy( object1.position ).add( object1.boundingSphere.center );
    var r2 = new THREE.Vector3( ).copy( object2.position ).add( object2.boundingSphere.center );
    //中心座標間の距離の２乗
    var l = new THREE.Vector3( ).subVectors(r1, r2).lengthSq( );
    return (l < (l1+l2) * (l1+l2) )? true : false;
}

////////////////////////////////////////////////////////////////////
// 球と平面領域の衝突
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.checkCollisionSphereVsPlane = function( sphere, object, interactsIndex, dt, noSide ){
    //端での衝突計算を無効化
    noSide = noSide || false;

    //衝突有無フラグ
    var flag = false;

    //平面との衝突
    for( var i=0; i < object.faces.length; i++ ){

        if( object instanceof PHYSICS.Polygon ){
            //バウンディング球の半径の取得
            var l1 = sphere.boundingSphere.radius;//
            var l2 = object.facesBoundingSphereRadius[ i ];//
            //グローバル座標系におけるバウンディング球の中心座標
            var r1 = new THREE.Vector3( ).copy( sphere.position ).add( sphere.boundingSphere.center );
            var r2 = object.centerPosition[ i ];

            //中心座標間の距離の２乗
            var l = new THREE.Vector3( ).subVectors(r1, r2).lengthSq( );

            if (l > (l1+l2) * (l1+l2) ) continue;
        }

        //平面と点の距離
        var R = PHYSICS.Math.getDistanceBetweenPointAndPlane (
            object.normals[ i ],                       //面の法線ベクトル
            object.vertices[ object.faces[ i ][ 0 ] ], //面が通過する点
            sphere.position                            //距離を計算する位置座標
        );

        //平面との距離が球オブジェクトの半径未満の場合
        if( R < sphere.radius ){

            //Circleクラスを基底とするオブジェクト
            if( object.constructor === PHYSICS.Circle || object.constructor === PHYSICS.Cylinder ) {

                //円オブジェクトとの衝突による衝突力の向き
                var results = this.getCollisionCircle( sphere, object, i , noSide);

            } else {
                //平面との衝突
                if( noSide ){
                    //平面領域のみ
                    var results = this.getCollisionSphereVsPlane ( sphere, object, i );  //平面領域での衝突（2.7節）
                } else {

                     //平面を構成する全ての可能性を検証
                    var results = this.getCollisionSphereVsPlane ( sphere, object, i )  //平面領域での衝突（2.7節）
                           || this.getCollisionSphereVsPlaneSide ( sphere, object, i )   //平面の辺での衝突（2.9.2項）
                           || this.getCollisionSphereVsPlaneEdge ( sphere, object, i );  //平面の角での衝突（2.9.3項）

                }
            }

            if( results ) {

                var velocity = new THREE.Vector3().addVectors( sphere.velocity, sphere.velocity_1 ).multiplyScalar(0.5);
                var velocity2 = new THREE.Vector3().addVectors( object.velocity, object.velocity_1 ).multiplyScalar(0.5);

                var v12 = new THREE.Vector3().subVectors(velocity, velocity2);

                //衝突力の方向ベクトル（グローバル座標系）
                var normal = results.dir;

                var beta = - ( 1.0 + this.interacts[ interactsIndex ].Er ) * v12.dot( normal ) / ( 1.0 / sphere.mass + 1.0 / object.mass ) / dt;

                //衝突力（グローバル座標系）
                var S = sphere.collisionForce.copy( normal ).multiplyScalar( beta );
                var Sobject = object.collisionForce.copy( normal ).multiplyScalar( -beta );

                //衝突点（グローバル座標系）
                var point = results.point;

                //衝突ペア配列
                this.collisionPairs.push( { object1:sphere, object2:object, normal12 : normal, collisionPoint:point, interactsIndex:interactsIndex } );

                //球体が回転運動を行わない場合
                if( sphere.noRotation === false ){

                    //回転行列の生成（ローカル座標系→グローバル座標系）
                    PHYSICS.temp.m4.makeRotationFromQuaternion( sphere.quaternion );
                    //回転行列の生成（グローバル座標系→ローカル座標系）
                    PHYSICS.temp.m4_i.getInverse( PHYSICS.temp.m4 );

                    //ローカル座標系の衝突点と衝突方向ベクトル
                    var pointL = point.clone().sub( sphere.position ).applyMatrix4( PHYSICS.temp.m4_i );
                    var SL = S.clone().applyMatrix4( PHYSICS.temp.m4_i );

                    //グローバル座標系の角速度
                    var omegaG = sphere.omega.clone().applyMatrix4( PHYSICS.temp.m4 );

                    //衝突に伴う摩擦力の計算
                    var v_omega = omegaG.clone().cross( normal ).multiplyScalar( sphere.radius );
                    var vt = velocity.clone().sub( normal.clone().multiplyScalar( velocity.clone().dot( normal ) ) );
                    //滑り判定式（速度方向）
                    var D = sphere._D.copy( vt ).sub( v_omega );


                    //エネルギー保存則を満たす偶力
                    sphere._f2.copy( D ).multiplyScalar( -( 2 * this.interacts[ interactsIndex ].Et ) * sphere.mass / ( 1 + sphere.mass * sphere.radius * sphere.radius / sphere.moment) / dt );

                    var F = sphere._f2.clone();

                    //衝突力
                    sphere.collisionForce.add( F );
                    sphere.collisionTorque.add( F.cross( normal ).multiplyScalar( sphere.radius ).applyMatrix4( PHYSICS.temp.m4_i ) );


                    //以下、接触力の計算

                    //滑らないで転がるために必要な偶力
                    sphere._f.copy( v_omega ).multiplyScalar( sphere.moment / ( sphere.radius * dt ) / sphere.radius );

                    //静止摩擦力
                    sphere._f_mu.copy( sphere._f ).normalize().multiplyScalar( this.interacts[ interactsIndex ].mu * S.length() );

                    //動摩擦力
                    sphere._f_star = D.clone().normalize().multiplyScalar( -this.interacts[ interactsIndex ].mu_star * S.length() );

                    //動摩擦力の最大値
                    sphere._f_star_ =  D.clone().multiplyScalar( -sphere.moment / ( sphere.radius * dt ) / sphere.radius * 0.8 );
                    //※0.8よりも大きいと発散（再検証の必要あり）
                    //接触状態にも関わらず

                    if( sphere._f_star.lengthSq() > sphere._f_star_.lengthSq() ){

                        //console.log( "最大摩擦力で置き換え" )
                        sphere._f_star.copy( sphere._f_star_ );

                    }

                    F.set(0,0,0);

                    var delta = 0.01;

                    //滑り無しの条件
                    if( D.lengthSq() < delta * delta ) {

                        //滑らないで転がるための条件
                        if( sphere._f.lengthSq() <= sphere._f_mu.lengthSq() ) {

                            F.copy( sphere._f );
                            //console.log( true, this.step, F );

                        } else {

                            F.copy( sphere._f_star );
                            //console.log( false, this.step, F );

                        }

                    } else {

                        //接触時の動摩擦力
                        F.copy( sphere._f_star );

                        //console.log( this.step, F );
                    }

                    //接触力
                    sphere.contactForce.add( F );
                    sphere.contactTorque.add( F.cross( normal ).multiplyScalar( sphere.radius ).applyMatrix4( PHYSICS.temp.m4_i ) );

                }

                return true;
            }
        }
    }
    return flag;
}

////////////////////////////////////////////////////////////////////
//任意の点から平面に下ろした垂線の位置ベクトルが平面内にあるかを判定
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.getCollisionSphereVsPlane = function( sphere, object, i ){

    //垂線の足ベクトル（位置ベクトル）
    var A = PHYSICS.Math.getFootVectorOfPerpendicularFromPlane(
        object.normals[ i ],                        //面の法線ベクトル
        object.vertices[object.faces[ i ][ 0 ]],      //面が通過する点
        sphere.position                                  //距離を計算する位置座標
    );


    //平面内ベクトル
    var Q = new THREE.Vector3( ).subVectors( A, object.vertices[object.faces[ i ][ 0 ]] );

    //三角形の接線ベクトル
    var t1 = object.tangents[ i ][ 0 ];
    var t2 = object.tangents[ i ][ 1 ];

    //三角形の辺の長さの２乗
    var t1_lengthSq = t1.lengthSq( );
    var t2_lengthSq = t2.lengthSq( );

    //三角形の接線ベクトルとQとの内積
    var dot1 = Q.dot( t1 );
    var dot2 = Q.dot( t2 );

    //三角形の接線ベクトル同士の内積
    var dotT = t1.dot( t2 );

    //係数の計算
    var a = ( dot1 * t2_lengthSq - dotT * dot2 ) / ( t1_lengthSq * t2_lengthSq - dotT * dotT );
    var b = ( dot2 * t1_lengthSq - dotT * dot1 ) / ( t1_lengthSq * t2_lengthSq - dotT * dotT );

    //平行四辺形との衝突条件
    if( a > 0 && b > 0 && a < 1 && b < 1 ) {

        //ポリゴンオブジェクトの場合
        if( object instanceof PHYSICS.Polygon ) {

            if( a + b < 1 ) return false;

        }

        //衝突力の方向ベクトル
        var dir = new THREE.Vector3( ).subVectors( sphere.position, A).normalize();

        return { dir : dir, point : A };

    } else {

        return false;

    }

}
////////////////////////////////////////////////////////////////////
//平面の辺での衝突を判定
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.getCollisionSphereVsPlaneSide = function( sphere, object, i ){

    //２つの頂点の線分と球オブジェクトとの衝突計算
    function getCollisionForceDirectionVector ( sphere, V1, V2 ) {

        //垂線の足から頂点までのベクトル
        var R = PHYSICS.Math.getPerpendicularVectorFromLinear3( V1, V2, sphere.position );

        //点と線分までの距離の２乗
        var Rsq = R.lengthSq( );
        if( Rsq < sphere.radius * sphere.radius ) {

            //頂点間をつなぐベクトル
            var V = new THREE.Vector3( ).subVectors( V2, V1 );
            //頂点間をつなぐベクトル
            var hatV = V.clone( ).normalize( );
            //頂点間をつなぐベクトル
            var barR = new THREE.Vector3( ).subVectors(sphere.position, V1);

            //直線に下ろした垂線の足が線分の内側かを判定
            if( barR.dot( hatV ) > 0 && barR.dot( hatV ) < V.length( ) ){
                return R.normalize( );
            }
        }

    }

    //平面との衝突
    if( object.faces.length ){

        //i番目の面を構成する全ての辺について評価する
        for( var j = 0; j < object.faces[ i ].length; j++ ){
            var k = ( j < object.faces[ i ].length - 1 )? j + 1 : 0;

            //i番目の面を構成するj番目の頂点の頂点番号
            var n1 = object.faces[ i ][ j ];
            //i番目の面を構成するk番目の頂点の頂点番号
            var n2 = object.faces[ i ][ k ];

            //n1番目の頂点座標
            var V1 = object.vertices[ n1 ];
            var V2 = object.vertices[ n2 ];

            //衝突力方向
            var dir = getCollisionForceDirectionVector (sphere, V1, V2);
            if( dir ) {

                var point = new THREE.Vector3().subVectors( sphere.position, dir );

                return { dir: dir, point: point };

            }

        }

    } else {
        //Lineクラスの線分領域での衝突を想定

        //頂点数
        var vN = object.vertices.length;

        //線オブジェクトの線分での衝突計算
        for( var n = 0; n < vN-1 ; n++ ){

            //２点の頂点座標
            var V1 = object.vertices[ n ];
            var V2 = object.vertices[ n + 1 ];

            //衝突力方向
            var dir = getCollisionForceDirectionVector (sphere, V1, V2);
            if( dir ) {

                var point = new THREE.Vector3().subVectors( sphere.position, dir );

                return { dir: dir, point: point };

            }

        }

    }

    return false;
};

////////////////////////////////////////////////////////////////////
//平面の角での衝突を判定
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.getCollisionSphereVsPlaneEdge = function( sphere, object, i ){

    //２つの頂点と球オブジェクトとの衝突計算
    function getCollisionForceDirectionVector (sphere, V) {

        //平面の角から球体中心に向かうベクトル
        var R = new THREE.Vector3( ).subVectors (
            sphere.position, //球の中心座標
            V  //角の座標
        );
        if( R.lengthSq( ) < sphere.radius * sphere.radius ){
            return R.normalize( );
        }

    }

    //平面との衝突
    if( object.faces.length ){

        //i番目の面を構成する全ての角ついて評価する
        for( var j=0; j < object.faces[ i ].length; j++ ){

            var dir = getCollisionForceDirectionVector (
                sphere,                               //球オブジェクト
                object.vertices[ object.faces[ i ][ j ] ] //頂点座標
            )
            if( dir ) {

                return { dir: dir, point: object.vertices[ object.faces[ i ][ j ] ] };

            }
        }

    } else {
        //Lineクラスの線分の角領域での衝突を想定

        //頂点数
        var vN = object.vertices.length;

        //頂点との衝突計算
        for( var n = 0; n < vN ; n++ ){

            var dir = getCollisionForceDirectionVector (
                sphere,                               //球オブジェクト
                object.vertices[ n ] //角の座標
            )
            if( dir ) {

                return { dir: dir, point: object.vertices[ object.faces[ i ][ j ] ] };

            }

        }

    }

    return false;
}

////////////////////////////////////////////////////////////////////
// 球と線の衝突
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.checkCollisionSphereVsLine = function( sphere , object ){

     //線分と角との衝突を検証
    var dirR = this.getCollisionSphereVsPlaneSide ( sphere, object )  //線分の衝突（9.1.10項）
            || this.getCollisionSphereVsPlaneEdge ( sphere, object ); //線の角での衝突（9.1.10項）

    if( dirR ) {
        sphere.collisionObjects.push( { object:object, dirR:dirR } );
        return true;
    }

    return false;

}
////////////////////////////////////////////////////////////////////////////////////////////
//球と球の衝突
////////////////////////////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.checkCollisionSphereVsSphere = function ( sphere1 , sphere2, interactsIndex, dt ){

    var radius1 = ( sphere1.constructor === PHYSICS.Point )? 0 : sphere1.radius;
    var radius2 = ( sphere2.constructor === PHYSICS.Point )? 0 : sphere2.radius;

    //衝突有無フラグ
    var flag = false;

    var R12 = PHYSICS.Math.getLengthSq( sphere1.position , sphere2.position );

    //球と球の衝突判定
    if( R12 < ( radius1 + radius2 ) * ( radius1 + radius2 ) ){

        //衝突計算に必要なベクトル量の取得
        var collisionSphereVsSphereVectors = this.getCollisionSphereVsSphereVectors( sphere1, sphere2 );
        //球オブジェクトの相対ベクトル（2→1）
        var r12 = collisionSphereVsSphereVectors.r12;
        //衝突面の法線ベクトル
        var n12 = collisionSphereVsSphereVectors.n12;
        var collisionPoint = new THREE.Vector3( ).addVectors( sphere1.position, sphere2.position ).divideScalar(2.0);
        flag = true;

        /////////////////////////////////////////////////////////////////////////////////////////////////
        //２つの剛体球の衝突力の計算
        var n12 = collisionSphereVsSphereVectors.n12;
        var v12 = collisionSphereVsSphereVectors.v12;

        //衝突力の大きさ
        var F12 = ( 1 + this.interacts[ interactsIndex ].Er ) * v12.dot( n12 ) / ( 1.0 / sphere1.mass + 1.0 / sphere2.mass ) / dt;

        sphere1.collisionForce.copy( n12.clone().multiplyScalar( -F12 ) );
        sphere2.collisionForce.copy( n12.clone().multiplyScalar( F12 ) );


        /////////////////////////////////////////
        //並進運動量と角運動量の交換を

        //回転判別ベクトル
        var D12 = collisionSphereVsSphereVectors.D12;

        //接平面ベクトル（回転力の加わる方向ベクトル）
        var t12 = collisionSphereVsSphereVectors.t12;

        var munbo = 1 / sphere1.mass + 1/ sphere2.mass + sphere1.radius * sphere1.radius / sphere1.moment + sphere2.radius * sphere2.radius / sphere2.moment;
        var fd12 = - ( 2 * this.interacts[ interactsIndex ].Et ) / munbo / dt;

        var fd = D12.clone().multiplyScalar( fd12 );

        var N1 = fd.clone().cross( n12 ).multiplyScalar( sphere1.radius );
        var N2 = fd.clone().cross( n12 ).multiplyScalar( sphere2.radius );


        //回転行列の生成（ローカル座標系→グローバル座標系）
        PHYSICS.temp.m4.makeRotationFromQuaternion( sphere1.quaternion );
        //回転行列の生成（グローバル座標系→ローカル座標系）
        PHYSICS.temp.m4_i.getInverse( PHYSICS.temp.m4 );
        sphere1.collisionTorque.copy( N1.applyMatrix4( PHYSICS.temp.m4_i ) );

        //回転行列の生成（ローカル座標系→グローバル座標系）
        PHYSICS.temp.m4.makeRotationFromQuaternion( sphere2.quaternion );
        //回転行列の生成（グローバル座標系→ローカル座標系）
        PHYSICS.temp.m4_i.getInverse( PHYSICS.temp.m4 );
        sphere2.collisionTorque.copy( N2.applyMatrix4( PHYSICS.temp.m4_i ) );


        sphere1.collisionForce.add( fd.clone().multiplyScalar( 1 ) );
        sphere2.collisionForce.add( fd.clone().multiplyScalar( -1 ) );



        this.collisionPairs.push({
            object1:sphere1,
            object2:sphere2,
            normal12 : n12,
            tangent12 : t12,
            D12 : D12,
            collisionPoint:collisionPoint,
            interactsIndex:interactsIndex
        });

    }

    return flag;
}


//剛体に加わる衝突力の計算
PHYSICS.PhysLab.prototype.calculateCollisionForce = function ( dt ) {
    //同時衝突ペアの検証
    var pairs = [];
    pairs[0] = [];

    for( var i = 0; i < this.collisionPairs.length + this.contactPairs.length; i++ ){

        if( i < this.collisionPairs.length ){
            var id1 = this.collisionPairs[ i ].object1.id;
            var id2 = this.collisionPairs[ i ].object2.id;
        } else {
            var id1 = this.contactPairs[ i - this.collisionPairs.length ].object1.id;
            var id2 = this.contactPairs[ i - this.collisionPairs.length ].object2.id;
        }

        for( var k = 0; k < pairs.length; k++ ){

            if( pairs[ k ].indexOf( id1 ) >= 0 ){

                if( pairs[ k ].indexOf( id2 ) == -1 ) pairs[ k ].push( id2 );
                else break;

            }else if( pairs[ k ].indexOf( id2 ) >= 0 ){

                if( pairs[ k ].indexOf( id1 ) == -1 ) pairs[ k ].push( id1 );
                else break;

            }else if( k == pairs.length - 1 ){

                pairs.push( [ id1, id2 ] );

            }

        }
    }
    pairs.splice( 0, 1 );






    var hightPrecisionFlag = false;
    //衝突ペアに２点間距離固定ペアが存在する場合にpairsに追加
    for( var i = 0; i < pairs.length; i++ ){

        for( var j = 0; j < pairs[ i ].length; j++ ){

            var id = pairs[ i ][ j ];

            for ( var k = 0; k < this.fixedDistanceInteractionPairs.length; k++ ){

                //衝突オブジェクトが拘束されている場合
                if( this.fixedDistanceInteractionPairs[ k ].indexOf( id ) >= 0 ){

                    for( var k2 = 0; k2 < this.fixedDistanceInteractionPairs[ k ].length; k2++ ){

                        var id_ = this.fixedDistanceInteractionPairs[ k ][ k2 ];

                        //直接衝突していない拘束されたオブジェクトを追加
                        if( pairs[ i ].indexOf( id_ ) === -1 )  {
                            pairs[ i ].push( id_ );

                            if( this.hightPrecisionMode.enabled === true && this.hightPrecisionMode.on === false ) {
                                //拘束と衝突が同時に生じる場合
                                this.hightPrecisionMode.on = true;
                                hightPrecisionFlag = true;
                            }
                        }
                    }
                }
            }
        }
    }

    if( hightPrecisionFlag ){
        console.log( this.step, "高精度計算モード", pairs );
        return;
    }


    for(var i = 0; i < pairs.length; i++){

        if( pairs[ i ].length >= 3 ){

            var length = pairs[ i ].length;
            console.log( this.step, "同時衝突数:", length);

            var ns = [];
            var ts = [];
            var ls = [];
            var lines = [];
            for( var i2 = 0; i2 < length; i2++ ){
                //２重配列の準備
                ns[ i2 ] = [];
                ts[ i2 ] = [];
                ls[ i2 ] = [];
                for( var j2 = 0; j2 < length; j2++ ){

                    var id1 = pairs[ i ][ i2 ];
                    var id2 = pairs[ i ][ j2 ];
                    var object1 = this.getObjectByID( id1 );
                    var object2 = this.getObjectByID( id2 );
                    object1.collisionForce.set(0,0,0);
                    object1.collisionTorque.set(0,0,0);
                    object2.collisionForce.set(0,0,0);
                    object2.collisionTorque.set(0,0,0);

                    var interactsIndex = this.getConnectsIndex(id1, id2);
                    var pairsIndex = this.getCollisionPairsIndex( id1, id2 );

                    if( interactsIndex !== false ){

                        if( this.interacts[ interactsIndex ].type === PHYSICS.SolidCollision ){

                            if( this.collisionPairs[ pairsIndex ].object1.id == id1 ){
                                //法線ベクトル（衝突力が加わる方向ベクトル）
                                ns[ i2 ][ j2 ] = this.collisionPairs[ pairsIndex ].normal12.clone();
                            } else {
                                ns[ i2 ][ j2 ] = this.collisionPairs[ pairsIndex ].normal12.clone().negate();
                            }

                            var delta = 0.01;

                            //接点の相対速度が小さい場合は接線ベクトルを与えない
                            if( this.collisionPairs[ pairsIndex ].D12 ){
                                if( this.collisionPairs[ pairsIndex ].D12.length() > delta) {

                                    if( this.collisionPairs[ pairsIndex ].object1.id == id1 ){
                                        //接平面ベクトル（回転力が加わる方向ベクトル）
                                        ts[ i2 ][ j2 ] = this.collisionPairs[ pairsIndex ].tangent12.clone();
                                    } else {
                                        ts[ i2 ][ j2 ] = this.collisionPairs[ pairsIndex ].tangent12.clone().negate();
                                    }
                                }else{
                                    //接平面ベクトル（回転力が加わる方向ベクトル）
                                    ts[ i2 ][ j2 ] = new THREE.Vector3();
                                }
                            } else {

                                //接平面ベクトル（回転力が加わる方向ベクトル）
                                ts[ i2 ][ j2 ] = new THREE.Vector3();

                            }

                            ls[ i2 ][ j2 ] = new THREE.Vector3();

                        } else if( this.interacts[ interactsIndex ].type === PHYSICS.FixedDistanceConnection ){

                            ns[ i2 ][ j2 ] = new THREE.Vector3();
                            ts[ i2 ][ j2 ] = new THREE.Vector3();

                            //拘束力の方向ベクトル
                            ls[ i2 ][ j2 ] = new THREE.Vector3().subVectors( object1.position, object2.position ).normalize();


                        }

                    } else {

                        //もし両者とも固定されている場合は連立方程式に入れない
                        if( !object1.dynamic && !object2.dynamic ) {
                            continue;
                        }

                        ns[ i2 ][ j2 ] = new THREE.Vector3();
                        ts[ i2 ][ j2 ] = new THREE.Vector3();
                        ls[ i2 ][ j2 ] = new THREE.Vector3();

                    }


                    if( i2 < j2 ) lines.push( [ i2, j2 ] );
                }
            }

            //連立方程式を保持する配列
            var M = [];
            var NL = lines.length;
            for( var  k= 0; k < 3 * lines.length; k++ )    M[k] = [];

            for( var line = 0; line < lines.length; line++ ){
                //剛体球番号の取得
                var id1 = pairs[ i ][ lines[ line ][ 0 ] ];
                var id2 = pairs[ i ][ lines[ line ][ 1 ] ];
                var object1 = this.getObjectByID( id1 );
                var object2 = this.getObjectByID( id2 );

                for( var _line = 0; _line < lines.length; _line++ ){

                    if( line === _line ){

                        //衝突力条件
                        M[ line ][ _line ] = dt * ( 1.0 / object1.mass + 1.0 / object2.mass );

                        M[ line ][ NL + _line ] = dt * ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        ) * ( 1.0 / object1.mass + 1.0 / object2.mass );

                        M[ line ][ 2 * NL + _line ] = dt * ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ls[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        ) * ( 1.0 / object1.mass + 1.0 / object2.mass );

                        //回転力条件
                        M[ NL + line ][ _line ] = dt * ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ns[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        ) * ( 1.0 / object1.mass + 1.0 / object2.mass );

                        M[ NL + line ][ NL + _line ] = dt * ( 1.0 / object1.mass + 1.0 / object2.mass
                            + object1.radius * object1.radius / object1.moment
                            + object2.radius * object2.radius / object2.moment
                        );

                        M[ NL + line ][ 2 * NL + _line ] = dt * ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ls[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        ) * ( 1.0 / object1.mass + 1.0 / object2.mass );

                        //拘束力条件
                        M[ 2 * NL + line ][ _line ] = dt * ls[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ns[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        ) * ( 1.0 / object1.mass + 1.0 / object2.mass );

                        M[ 2 * NL + line ][ NL + _line ] = dt * ls[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        ) * ( 1.0 / object1.mass + 1.0 / object2.mass );

                        M[ 2 * NL + line ][ 2* NL + _line ] = dt * ( 1.0 / object1.mass + 1.0 / object2.mass );


                    } else {

                        var id1_ =  pairs[ i ][ lines[ _line ][ 0 ] ];
                        var id2_ =  pairs[ i ][ lines[ _line ][ 1 ] ];
                        var object1_ = this.getObjectByID( id1_ );
                        var object2_ = this.getObjectByID( id2_ );

                        M[ line ][ _line ] = dt * ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ns[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        );

                        M[ line ][ NL + _line ] = dt * ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        );

                        M[ line ][ 2 * NL + _line ] = dt * ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ls[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        );


                        M[ NL + line ][ _line ] = dt * ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ns[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        );

                        M[ NL + line ][ NL + _line ] = dt;

                        M[ NL + line ][ 2 * NL + _line ] = dt * ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ls[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        );


                        M[ 2 * NL + line ][ _line ] = dt * ls[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ns[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        );

                        M[ 2 * NL + line ][ NL + _line ] = dt * ls[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        );

                        M[ 2 * NL + line ][ 2 * NL + _line ] = dt * ls[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                            ls[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ]
                        );

                        if( lines[ _line ][ 0 ] === lines[ line ][ 0 ] ) {

                            M[ line ][ _line ] /= object1_.mass;
                            M[ line ][ NL + _line ] /= object1_.mass;
                            M[ line ][ 2 * NL + _line ] /= object1_.mass;

                            M[ NL + line ][ _line ] /= object1_.mass;
                            M[ NL + line ][ NL + _line ] *= ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(  ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ] ) / object1_.mass + ns[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ].clone().cross( ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ] ).cross( ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ] ).dot( ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ] ) * object1_.radius * object1_.radius / object1_.moment;
                            M[ NL + line ][ 2 * NL + _line ] /= object1_.mass;


                            M[ 2 * NL + line ][ _line ] /= object1_.mass;
                            M[ 2 * NL + line ][ NL + _line ] /= object1_.mass;
                            M[ 2 * NL + line ][ 2 * NL + _line ] /= object1_.mass;

                        }

                        if( lines[ _line ][ 1 ] === lines[ line ][ 1 ] ){

                            M[ line ][ _line ] /= object2_.mass;
                            M[ line ][ NL + _line ] /= object2_.mass;
                            M[ line ][ 2 * NL + _line ] /= object2_.mass;

                            M[ NL + line ][ _line ] /= object2_.mass;

                            M[ NL + line ][ NL + _line ] *= ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(  ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ] ) / object2_.mass + ns[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ].clone().cross( ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ] ).cross( ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ] ).dot( ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ] ) * object2_.radius * object2_.radius / object2_.moment;
                            M[ NL + line ][ 2 * NL + _line ] /= object2_.mass;

                            M[ 2 * NL + line ][ _line ] /= object2_.mass;
                            M[ 2 * NL + line ][ NL + _line ] /= object2_.mass;
                            M[ 2 * NL + line ][ 2 * NL + _line ] /= object2_.mass;

                        }
                        if( lines[ _line ][ 0 ] == lines[ line ][ 1 ] ){

                            M[ line ][ _line ] /= -object1_.mass;
                            M[ line ][ NL + _line ] /= -object1_.mass;
                            M[ line ][ 2 * NL + _line ] /= -object1_.mass;

                            M[ NL + line ][ _line ] /= -object1_.mass;
                            M[ NL + line ][ NL + _line ] *= ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(
                                ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ] ) / object1_.mass + ns[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ].clone().cross( ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ] ).cross( ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ] ).dot( ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ] ) * object1_.radius * object1_.radius / object1_.moment;
                            M[ NL + line ][ 2 * NL + _line ] /= -object1_.mass;


                            M[ 2 * NL + line ][ _line ] /= -object1_.mass;
                            M[ 2 * NL + line ][ NL + _line ] /= -object1_.mass;
                            M[ 2 * NL + line ][ 2 * NL + _line ] /= -object1_.mass;

                        }
                        if( lines[ _line ][ 1 ] == lines[ line ][ 0 ] ){

                            M[ line ][ _line ] /= -object2_.mass;
                            M[ line ][ NL + _line ] /= -object2_.mass;
                            M[ line ][ 2 * NL + _line ] /= -object2_.mass;

                            M[ NL + line ][ _line ] /= -object2_.mass;
                            M[ NL + line ][ NL + _line ] *= ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].dot(  ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ] ) / object2_.mass + ns[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ].clone().cross( ts[ lines[ _line ][ 0 ] ][ lines[ _line ][ 1 ] ] ).cross( ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ] ).dot( ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ] ) * object2_.radius * object2_.radius / object2_.moment;

                            M[ NL + line ][ 2 * NL + _line ] /= -object2_.mass;

                            M[ 2 * NL + line ][ _line ] /= -object2_.mass;
                            M[ 2 * NL + line ][ NL + _line ] /= -object2_.mass;
                            M[ 2 * NL + line ][ 2 * NL + _line ] /= -object2_.mass;
                        }

                        if( (lines[ _line ][ 0 ] != lines[ line ][ 0 ]) && (lines[ _line ][ 0 ] != lines[ line ][ 1 ]) && (lines[ _line ][ 1 ] != lines[ line ][ 0 ]) && (lines[ _line ][ 1 ] != lines[ line ][ 1 ]) ) {

                            M[ line ][ _line ] = 0
                            M[ line ][ NL + _line ] = 0
                            M[ line ][ 2 * NL + _line ] = 0
                            M[ NL + line ][ _line ] = 0
                            M[ NL + line ][ NL + _line ] = 0
                            M[ NL + line ][ 2 * NL + _line ] = 0
                            M[ 2 * NL + line ][ _line ] = 0
                            M[ 2 * NL + line ][ NL + _line ] = 0
                            M[ 2 * NL + line ][ 2 * NL + _line ] = 0

                        }

                    }

                }

                var interactsIndex = this.getConnectsIndex(id1, id2);
                var pairsIndex = this.getCollisionPairsIndex( id1, id2 );


                if( interactsIndex !== false ){

                    if( this.interacts[ interactsIndex ].type === PHYSICS.SolidCollision ){

                        var Er = this.interacts[ interactsIndex ].Er;
                        var Et = this.interacts[ interactsIndex ].Et;

                        M[ line ][ 3 * NL ] = - ( 1 + Er ) * new THREE.Vector3().subVectors(
                            object1.velocity, object2.velocity
                        ).dot( ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ] ) ;


                        var pairsIndex = this.getCollisionPairsIndex( id1, id2 );
                        var D12 = this.collisionPairs[ pairsIndex ].D12.clone();

                        M[ NL + line ][ 3 * NL ] = - ( 2 * Et ) * D12.dot( ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ]  );

                    } else {

                        M[ line ][ 3 * NL ] = 0;
                        M[ NL + line ][ 3 * NL ] = 0;

                    }


                } else {

                    M[ line ][ 3 * NL ] = 0;
                    M[ NL + line ][ 3 * NL ] = 0;

                }

                M[ 2 * NL + line ][ 3 * NL ] = 0;


            }
//            console.log( ns );
//            console.log( ts );
//            console.log( ls );
//            console.log( M );


            //連立方程式を解く
            var A = PHYSICS.Math.solveSimultaneousEquations( M );

            for( var line = 0; line < lines.length; line++ ){
                //剛体球番号の取得
                var id1 = pairs[ i ][ lines[ line ][ 0 ] ];
                var id2 = pairs[ i ][ lines[ line ][ 1 ] ];
                var object1 = this.getObjectByID( id1 );
                var object2 = this.getObjectByID( id2 );

                //衝突力の加算
                object1.collisionForce.add( ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].clone().multiplyScalar( A[ line ] ) );
                object2.collisionForce.add( ns[ lines[ line ][ 1 ] ][ lines[ line ][ 0 ] ].clone().multiplyScalar( A[ line ] ));

                //接線方向の力の加算
                object1.collisionForce.add( ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].clone().multiplyScalar( A[ NL + line ] ) );
                object2.collisionForce.add( ts[ lines[ line ][ 1 ] ][ lines[ line ][ 0 ] ].clone().multiplyScalar( A[ NL + line ] ) );

                var N1 = ts[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].clone().cross( ns[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ] ).multiplyScalar( object1.radius * A[ NL + line ]);
                var N2 = ts[ lines[ line ][ 1 ] ][ lines[ line ][ 0 ] ].clone().cross( ns[ lines[ line ][ 1 ] ][ lines[ line ][ 0 ] ] ).multiplyScalar( object2.radius * A[ NL + line ]);

                //トルクの設定
                object1.collisionTorque.add( N1 );
                object2.collisionTorque.add( N2 );

                //拘束力の加算
                object1.collisionForce.add( ls[ lines[ line ][ 0 ] ][ lines[ line ][ 1 ] ].clone().multiplyScalar( A[ 2 * NL + line ] ) );
                object2.collisionForce.add( ls[ lines[ line ][ 1 ] ][ lines[ line ][ 0 ] ].clone().multiplyScalar( A[ 2 * NL + line ] ) );

            }

        }

    }

}

//剛体に加わる接触力の計算
PHYSICS.PhysLab.prototype.calculateContactForce = function ( objects, dt, time ) {


    for( var i = 0; i < this.contactPairs.length; i++ ){


        var mainObject, subObject;
        if( this.contactPairs[ i ].object1.dynamic && !this.contactPairs[ i ].object2.dynamic ){

            mainObject = this.contactPairs[ i ].object1;
            subObject = this.contactPairs[ i ].object2;

        } else if( !this.contactPairs[ i ].object1.dynamic && this.contactPairs[ i ].object2.dynamic ){

            mainObject = this.contactPairs[ i ].object2;
            subObject = this.contactPairs[ i ].object1;


        } else {

            console.log( "運動中の物体同士の接触" );
            continue;

        }


        this.contactPairs[ i ].object1.collisionForce.set(0,0,0);
        this.contactPairs[ i ].object2.collisionForce.set(0,0,0);

        var normal12 = this.contactPairs[ i ].normal12.clone();
        var force12 = this.contactPairs[ i ].object1.force.clone();
        var contactForce = normal12.multiplyScalar( -normal12.dot( force12 ) );

        if( mainObject.id !== this.contactPairs[ i ].object1.id ) contactForce.negate();

        //接触力を加算
        mainObject.force.add( contactForce );


        //めり込み補正
        if( mainObject.constructor === PHYSICS.Sphere ){

            //相対位置ベクトル
            var r12 = new THREE.Vector3().subVectors(
                objects[ mainObject.objectsIndex ].position,
                this.contactPairs[ i ].collisionPoint
            );
            //相対速度ベクトル
            var v12 = new THREE.Vector3().subVectors(
                objects[ mainObject.objectsIndex ].velocity,
                objects[ subObject.objectsIndex ].velocity
            );

            //ズレに比例した弾性力を加算
            var fk = 1 * ( mainObject.radius - r12.length() );
            var fb = 1 * v12.dot( r12 );
            var addForce = normal12.clone().multiplyScalar( fk - fb);

            if( mainObject.id !== this.contactPairs[ i ].object1.id ) addForce.negate();


            //接触力に加算
            mainObject.force.add( addForce );

        //    console.log( this.step, mainObject.position, mainObject.contactForce, mainObject.contactTorque );


            if( !mainObject.noRotation ){
                //回転に関する力を加算
                mainObject.force.add( mainObject.contactForce );
                mainObject.torque.add( mainObject.contactTorque );
            }

        }
    }


}

//剛体球同士の衝突時に必要なベクトル
PHYSICS.PhysLab.prototype.getCollisionSphereVsSphereVectors = function( object1, object2, results ){

    results = results || {};

    //衝突時の位置と速度の補正
    var r1 = new THREE.Vector3().addVectors( object1.position, object1.position_1 ).multiplyScalar(0.5);
    var r2 = new THREE.Vector3().addVectors( object2.position, object2.position_1 ).multiplyScalar(0.5);
    var r12 = new THREE.Vector3().subVectors( r1, r2 );
    var v1 = new THREE.Vector3().addVectors( object1.velocity, object1.velocity_1 ).multiplyScalar(0.5);
    var v2 = new THREE.Vector3().addVectors( object2.velocity, object2.velocity_1 ).multiplyScalar(0.5);
    var v12 = new THREE.Vector3().subVectors( v1, v2 );

    results.r12 = r12;
    results.v12 = v12;

    var n12 = r12.clone().normalize();
    results.n12 = n12;

    //回転行列の生成（ローカル座標系→グローバル座標系）
    PHYSICS.temp.m4.makeRotationFromQuaternion( object1.quaternion );
    var omega1G = object1.omega.clone().applyMatrix4( PHYSICS.temp.m4 );

    //回転行列の生成（ローカル座標系→グローバル座標系）
    PHYSICS.temp.m4.makeRotationFromQuaternion( object2.quaternion );
    var omega2G = object2.omega.clone().applyMatrix4( PHYSICS.temp.m4 );

    //角加速度ベクトルの差
    var omega12  = new THREE.Vector3().addVectors( omega1G, omega2G );
    var omega1_a = omega1G.clone().multiplyScalar( object1.radius );
    var omega2_a = omega2G.clone().multiplyScalar( object2.radius );
    var omega_a  = omega1_a.clone().add( omega2_a );
    var omega1_v = omega1_a.clone().cross( n12 );
    var omega2_v = omega2_a.clone().cross( n12 );
    var omega_v  = omega1_v.clone().add( omega2_v );

    var v12_t = v12.clone().sub( n12.clone().multiplyScalar( v12.dot( n12 ) ) );
    var D12 = v12_t.sub( omega_v );

    results.D12 = D12;

    //接平面ベクトル（回転力の加わる方向ベクトル）
    var t12 = D12.clone().normalize();

    results.t12 = t12;

    return results;
}

//剛体球vs平面同士の衝突時に必要なベクトル
PHYSICS.PhysLab.prototype.getCollisionSphereVsPlaneVectors = function( sphere, plane, results ){


}

//円オブジェクトの衝突判定を行う
PHYSICS.PhysLab.prototype.getCollisionCircle = function ( sphere, circle, i , noSide ){
    //円の端の衝突を考慮しない
    noSide = noSide || false;

    //円柱オブジェクトの場合radiusを上書きする
    if( circle.constructor === PHYSICS.Cylinder ) circle.radius = (i==0)? circle.radiusTop : circle.radiusBottom;

    var r = sphere.r;
    var P = circle.centerPosition[ i ];

    //垂線の足の位置ベクトル
    var A = PHYSICS.Math.getFootVectorOfPerpendicularFromPlane(
        circle.normals[ i ], //面の法線ベクトル
        P,                 //面の通過する点
        r                  //球の位置ベクトル
    );
    //円の中心から垂線の足までのベクトル
    var Q = A.clone( ).sub( P );

    //円と球体との衝突判定による分岐
    if( Q.lengthSq( ) < circle.radius * circle.radius ) { //円の平面領域での衝突条件

        //衝突力の方向ベクトル
        var R =  new THREE.Vector3( ).subVectors( r, A );

        return R.normalize( );

    } else if( !noSide && Q.lengthSq( ) < ( circle.radius + sphere.radius ) * ( circle.radius + sphere.radius ) ) {  //円の外周との衝突条件

        //円の中心から衝突点までのベクトル
        var V = Q.clone( ).multiplyScalar( circle.radius / Q.length( ) );

        //衝突点から球の中心までのベクトル
        var S = r.clone( ).sub( P ).sub( V );

        return S.normalize( );

    }

    return false;
}
//球と円柱の衝突
PHYSICS.PhysLab.prototype.checkCollisionSphereVsCylinder = function ( sphere , cylinder ){
    //衝突有無フラグ
    var flag = false;

    if( !cylinder.openEnded ){
        //円柱の上部・下部の円との衝突の検知
        flag = this.checkCollisionSphereVsPlane ( sphere , cylinder, true );
        if( flag ) return true;

    }

    //円柱オブジェクトの側面での反射を検討
    var dirR = this.getCollisionCylinderSide( sphere, cylinder );

    if( dirR ) {

        sphere.collisionObjects.push( {object:cylinder, dirR:dirR } );

        return true;
    }
    return false;
}
//円柱の辺での衝突の判定
PHYSICS.PhysLab.prototype.getCollisionCylinderSide = function ( sphere, cylinder ){

    var V1 = cylinder.centerPosition[ 0 ]; //上円の中心座標
    var V2 = cylinder.centerPosition[ 1 ]; //下円の中心座標

    //下円から上円の中心軸ベクトル
    var V = new THREE.Vector3( ).subVectors( V2, V1 ) ;

    //垂線の足から球の中心へのベクトル
    var R = PHYSICS.Math.getPerpendicularVectorFromLinear3 (
        V1, //直線の通過する点1
        V2, //直線の通過する点2
        sphere.position //球の位置ベクトル
    );

    //円の接線ベクトル
    var t = R.clone( ).normalize( );
    //円柱の上円と下円の外周上の位置ベクトル
    var A1 = new THREE.Vector3( ).addVectors( V1, t.clone( ).multiplyScalar( cylinder.radiusTop ) );
    var A2 = new THREE.Vector3( ).addVectors( V2, t.clone( ).multiplyScalar( cylinder.radiusBottom ) );
    var A = new THREE.Vector3( ).subVectors(A2, A1);

    //上円の中心座標を基準とした球の位置ベクトル
    var rbar = new THREE.Vector3( ).subVectors( sphere.position, A1 );
    var A_dot_rbar = A.dot( rbar );

    //垂線の足から球の中心へのベクトル
    var S = PHYSICS.Math.getPerpendicularVectorFromLinear3 (
        A1,      //直線の通過する点1
        A2,      //直線の通過する点2
        sphere.position //球の位置ベクトル
    );

    //円柱の側面での衝突判定
    if( S.lengthSq( ) < sphere.radius * sphere.radius ) {

        //有限長の円柱との衝突
        if( A_dot_rbar>0 && A_dot_rbar< A.lengthSq( )) {

            //衝突力の方向
            return S.normalize( );

        } else {
            //線分の外の場合、円柱の端での衝突を検証する

            var S1 = new THREE.Vector3( ).subVectors( sphere.position ,A1 );
            var S2 = new THREE.Vector3( ).subVectors( sphere.position ,A2 );

            if( S1.lengthSq( ) < sphere.radius * sphere.radius ){

                //円柱の上円側との衝突
                return S1.normalize( );

            } else if( S2.lengthSq( ) < sphere.radius * sphere.radius ){

                //円柱の上円側との衝突
                return S2.normalize( );

            }
        }
    }
    return false;
}
////////////////////////////////////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.setInteraction = function ( object1, object2, type, parameter ){

    var c = new PHYSICS.Interaction( this, object1, object2, type, parameter );
    if( c ) this.interacts.push( c );

}
PHYSICS.PhysLab.prototype.getConnectsIndex = function( id1, id2 ){

    for( var k = 0; k < this.interacts.length; k++ ){

        if( (this.interacts[ k ].object1.id == id1 && this.interacts[ k ].object2.id == id2) ||
            (this.interacts[ k ].object1.id == id2 && this.interacts[ k ].object2.id == id1) ) return k;
    }

    return false;
}

PHYSICS.PhysLab.prototype.getObjectByID = function ( id ){
    for( var i = 0; i < this.objects.length; i++ ){
        if( this.objects[ i ].id == id ) return this.objects[ i ];
    }
    return null;
}
PHYSICS.PhysLab.prototype.getObjectsArrayIndex = function ( object ){
    for( var i = 0; i < this.objects.length; i++ ){
        if( this.objects[ i ].id == object.id ) return i;
    }
    return null;
}

PHYSICS.PhysLab.prototype.getCollisionPairsIndex = function ( id1, id2 ){

    for( var i = 0; i < this.collisionPairs.length; i++ ){

        if( ( id1 == this.collisionPairs[ i ].object1.id && id2 == this.collisionPairs[ i ].object2.id) || (id2 == this.collisionPairs[ i ].object1.id && id1 == this.collisionPairs[ i ].object2.id )){

            return i;
        }

    }

    return false;
}

//フロントスクリーンオブジェクトの生成
PHYSICS.PhysLab.prototype.createFrontScreenObject = function ( object ){

    //３次元グラフィックスの生成
    object.create3DCG( );
    //フロントスクリーン用シーンへ追加
    this.frontScreen.scene.add( object.CG );

    //スクリーン上の大きさ[%]
    object.scale = (object.scale != undefined)? object.scale : 10;
    //スクリーン上の位置[%]
    object.top = (object.top != undefined)? object.top : 10;
    object.left = (object.left != undefined)? object.left : 10;

}
PHYSICS.PhysLab.prototype.setScaleAndPositionOfFrontScreenObject = function( object ){

    var scale =  this.stage.div.clientWidth * object.scale/100;
    object.CG.scale.set( scale, scale, scale );

    var x = this.stage.div.clientWidth * (object.left/100 - 0.5) + scale/2;
    var y = this.stage.div.clientHeight * (0.5 - object.top/100) - scale/2;
    object.CG.position.set( x, y, 0 );

}
//タイムボードオブジェクトの生成
PHYSICS.PhysLab.prototype.initTimeBoard = function(  ){

    if( !this.timeBoard.enabled ) return;

    this.timeBoard.textBoard = new PHYSICS.TextBoard({
        material : {
            color : 0xFFFFFF,
            transparent : true,
        },
        rotation : this.timeBoard.rotation,
        fontSize : this.timeBoard.fontSize, // [%]
        textColor : this.timeBoard.textColor,//文字色
        backgroundColor : this.timeBoard.backgroundColor,//背景色（RGBA値を0から１で指定）
        fontName :this.timeBoard.fontName,
        resolution : this.timeBoard.resolution,
        textAlign : this.timeBoard.resolution,
        scale : this.timeBoard.size,
        top : this.timeBoard.top,    //上からの距離単位は[%]
        left: this.timeBoard.left,   //

     });
     this.frontScreen.objects.push( this.timeBoard.textBoard );

}
//計算誤差表示ボードオブジェクトの生成
PHYSICS.PhysLab.prototype.initTextDisplay = function(  ){

    if( !this.textDisplay.enabled ) return;

    this.textDisplay.textBoard = new PHYSICS.TextBoard({
        material : {
            color : 0xFFFFFF,
            transparent : true,
        },
        rotation : this.textDisplay.rotation,
        fontSize : this.textDisplay.fontSize, // [%]
        textColor : this.textDisplay.textColor,//文字色
        backgroundColor : this.textDisplay.backgroundColor,//背景色（RGBA値を0から１で指定）
        fontName :this.textDisplay.fontName,
        resolution : this.textDisplay.resolution,
        textAlign : this.textDisplay.resolution,
        scale : this.textDisplay.size,
        top : this.textDisplay.top,    //上からの距離単位は[%]
        left: this.textDisplay.left,   //

     });
     this.frontScreen.objects.push( this.textDisplay.textBoard );

}


//２点間距離固定結合ペア配列の生成
PHYSICS.PhysLab.prototype.createFixedDistanceConnectionPairsArray = function(  ){

    var pairs = this.fixedDistanceInteractionPairs;
    pairs[ 0 ] = [];
    for( var i = 0; i < this.interacts.length; i++ ){
        var interaction = this.interacts[ i ];
        //結合タイプが２点間距離固定結合ではない場合はスキップ
        if( interaction.type != PHYSICS.FixedDistanceConnection ) continue;

        var object1 = interaction.object1;
        var object2 = interaction.object2;

        var id1 = interaction.object1.id;
        var id2 = interaction.object2.id;

        for( var k = 0; k < pairs.length; k++ ){

            if( pairs[ k ].indexOf( id1 ) >= 0 ){

                if( pairs[ k ].indexOf( id2 ) == -1 ) pairs[ k ].push( id2 );
                else break;

            }else if( pairs[ k ].indexOf( id2 ) >= 0 ){

                if( pairs[ k ].indexOf( id1 ) == -1 ) pairs[ k ].push( id1 );
                else break;

            }else if( k == pairs.length - 1 ){

                pairs.push( [ id1, id2 ] );

            }

        }

    }
    pairs.splice( 0, 1 );

}
/////////////////////////////////////////////////////////////////////////////////////////////
// 結合定義クラス
/////////////////////////////////////////////////////////////////////////////////////////////
PHYSICS.Interaction = function ( physLab, object1, object2, type, parameter ) {
    this.physLab = physLab;
    this.object1 = object1;
    this.object2 = object2;
    this.type  = type;

    if( !this.type ) {
        console.warn("結合生成失敗！");
        return;
    }

    parameter = parameter || {}
    this.visible = ( parameter.visible  != undefined )? parameter.visible : true;
    this.color  = ( parameter.color  != undefined )? parameter.color : 0x3e8987; //描画色

    //一定力
    if( this.type == PHYSICS.ConstantForce ){
        this.force = ( parameter.force != undefined )? parameter.force : new THREE.Vector3(); //一定力
    }

    //空気抵抗力
    if( this.type == PHYSICS.AirResistanceForce ){
        this.gamma = ( parameter.gamma != undefined )? parameter.gamma : 0; //速度の１乗に比例する空気抵抗力の係数
        this.beta = ( parameter.beta != undefined )? parameter.beta : 0; //速度の２乗に比例する空気抵抗力の係数
        this.rollingResistance = ( parameter.rollingResistance != undefined )? parameter.rollingResistance : 0; //転がり抵抗力の係数
    }

    //剛体同士の衝突
    if( this.type == PHYSICS.SolidCollision ){
        object1.collision = true;
        object2.collision = true;
        this.Er = ( parameter.Er != undefined )? parameter.Er : 1.0; //並進反発係数
        this.Et = ( parameter.Et != undefined )? parameter.Et : 1.0; //回転反発係数
        this.mu = ( parameter.mu != undefined )? parameter.mu : 1.0; //静止摩擦係数
        this.mu_star = ( parameter.mu_star != undefined )? parameter.mu_star : 0.5; //動摩擦係数
    }

    //ばね弾性力
    if( this.type == PHYSICS.LinearSpringConnection ){
        this.k  = ( parameter.k  != undefined )? parameter.k  : 1.0; //ばね弾性力
        this.L0 = ( parameter.L0 != undefined )? parameter.L0 : 0.0; //ばねの自然長
        this.radius = ( parameter.radius  != undefined )? parameter.radius : 0.2;  //ばねの半径
        this.tube = ( parameter.tube  != undefined )? parameter.tube : 0.1; //管の半径
        this.windingNumber = ( parameter.windingNumber  != undefined )? parameter.windingNumber : 10; //ばねの巻数
    }
    //クーロン相互作用
    if( this.type == PHYSICS.CoulombInteraction ){

        //誘電率
        this.epsilon = ( parameter.epsilon != undefined )? parameter.epsilon : PHYSICS.PermittivityOfVacuum;

    }
    //万有引力相互作用
    if( this.type == PHYSICS.UniversalGravitation ){

        //重力定数
        this.G = ( parameter.G != undefined )? parameter.G : PHYSICS.ConstantOfGravitation;
    }

    //レナード・ジョーンズポテンシャル
    if( this.type == PHYSICS.LennardJonesPotential ){

        //力の強さ
        this.epsilon = ( parameter.epsilon != undefined )? parameter.epsilon : 1.0;
        //ポテンシャルの最下点の距離
        this.sigma = ( parameter.sigma != undefined )? parameter.sigma : 1.0;

    }
    //２点間距離固定拘束力
    if( this.type == PHYSICS.FixedDistanceConnection ){

        var r12 = new THREE.Vector3().subVectors(
            this.object1.position,
            this.object2.position
        );

        this.L = r12.length();
        //ズレに比例した弾性力を発生させるばね定数
        this.compensationK = ( parameter.compensationK != undefined )? parameter.compensationK : 0.2;
        //固定方向方向速度の減衰
        this.compensationGamma = ( parameter.compensationGamma != undefined )? parameter.compensationGamma : 1.0;
        //補正倍率因子
        this.compensationFactor = ( parameter.compensationFactor != undefined )? parameter.compensationFactor :1/10;
        //結合を表す円柱の半径
        this.radius = ( parameter.radius != undefined )? parameter.radius : 0.05
    }


    //経路の固定
    if( this.type === PHYSICS.PathBinding ){

        this.visible = ( parameter.visible != undefined )? parameter.visible: true;    //表示・非表示の指定
        this.color = ( parameter.color != undefined )? parameter.color : 0xFFFFFF;     //描画色
        this.lineType = ( parameter.type != undefined )? parameter.type :  "LineBasic";    //線の種類（ "LineBasic" || "LineDashed"）
        this.dashSize = ( parameter.dashSize != undefined )? parameter.dashSize : 0.2; //破線の実線部分の長さ
        this.gapSize = ( parameter.gapSize != undefined )? parameter.gapSize : 0.2;    //破線の空白部分の長さ

        this.parametricFunction = parameter.parametricFunction || {};
        this.dynamicFunction = parameter.dynamicFunction || function (){};

        //媒介変数関数の必須プロパティの指定
        this.parametricFunction.enabled =  true;    //媒介変数関数設定の有無
        this.parametricFunction.pointNum = ( parameter.parametricFunction.pointNum != undefined )? parameter.parametricFunction.pointNum :  100;     //経路の描画点の数
        this.parametricFunction.theta = ( parameter.parametricFunction.theta != undefined )? parameter.parametricFunction.theta :  { min : 0, max : 1 }; //媒介変数の範囲
        this.parametricFunction.position = ( parameter.parametricFunction.position != undefined )? parameter.parametricFunction.position :  null;    //頂点座標を指定する媒介変数関数
        this.parametricFunction.tangent = ( parameter.parametricFunction.tangent != undefined )? parameter.parametricFunction.tangent :  null;     //接線ベクトルを指定する媒介変数関数
        this.parametricFunction.curvature = ( parameter.parametricFunction.curvature != undefined )? parameter.parametricFunction.curvature :  null;   //曲率ベクトルを指定する媒介変数関数
        this.parametricFunction.getTheta = ( parameter.parametricFunction.getTheta != undefined )? parameter.parametricFunction.getTheta :  null;     //媒介変数の取得

        this.restoringForce = parameter.restoringForce = parameter.restoringForce || {};
        this.restoringForce.enabled = ( parameter.restoringForce.enabled != undefined )? parameter.restoringForce.enabled  : false, //拘束状態への復元の有無
        this.restoringForce.k = ( parameter.restoringForce.k != undefined )? parameter.restoringForce.k  :  0.2,         //復元力のばね定数
        this.restoringForce.gamma = ( parameter.restoringForce.gamma != undefined )? parameter.restoringForce.gamma  :  1.0     //復元力の減衰係数
        this.restoringForce.factor = ( parameter.restoringForce.factor != undefined )? parameter.restoringForce.factor  :  1.0     //復元力の減衰係数

    }

    //結合用オブジェクト
    this.object = null;

}
PHYSICS.Interaction.prototype.createObject = function(){

    if( !this.visible ) return;

    //剛体同士の衝突
    if( this.type === PHYSICS.SolidCollision ){
    }

    //経路の固定
    if( this.type === PHYSICS.PathBinding ){

        this.interactionObject = new PHYSICS.Line({
            draggable : false,         //マウスドラックの有無
            allowDrag : false,         //マウスドラックの可否
            resetVertices : false,     //３次元グラフィックス中心座標の再計算
            spline : {
                enabled : false,       //スプライン補間の有無
                pointNum : 100         //スプライン補間時の補間点数
            },
            //材質オブジェクト関連パラメータ
            material : {
                type : this.lineType,   //発光材質 ("LineBasic" || "LineDashedMaterial")
                color : this.color,     //発光色
                vertexColors : false,
            },
            parametricFunction : this.parametricFunction,
            dynamicFunction : this.dynamicFunction, //動的関数
        })

        this.physLab.objects.push( this.interactionObject );

    }


    //ばね弾性力
    if( this.type === PHYSICS.LinearSpringConnection ){

        //結合可視化用物理オブジェクト
        this.interactionObject = new PHYSICS.Spring({
            draggable: false,      //マウスドラックの有無
            allowDrag : false,     //マウスドラックの可否
            r: {x: 0, y: 0, z: 0}, //位置ベクトル
            collision: false,      //衝突判定の有無
            axis: {x:0, y:0, z:1}, //姿勢軸ベクトル

            radius: this.radius,  //バネの半径
            tube: this.tube,  //管の半径
            length: 1, //バネの長さ
            windingNumber: this.windingNumber, //巻き数
            radialSegments: 15, //外周の分割数
            tubularSegments:6,  //管の分割数

            //材質オブジェクト関連パラメータ
            material : {
                type : "Phong",
                color: this.color,
                castShadow : true,    //影の描画
                receiveShadow : false, //影の描画
                shading :"Smooth",
            },
            boundingBox : {
                visible : false,     //バウンディングボックスの可視化
            },
        })

        this.physLab.objects.push( this.interactionObject );

    }
    //２点間距離固定
    if( this.type === PHYSICS.FixedDistanceConnection ){

        //結合可視化用物理オブジェクト
        this.interactionObject = new PHYSICS.Cylinder({
            draggable : false,        //マウスドラックの有無
            allowDrag : false,        //マウスドラックの可否
            collision: false,         //衝突判定の有無
            position: {x:0, y:0, z: 0},
            height:this.L,              //円柱の長さ
            radiusTop: this.radius,            //円柱の上円の半径
            radiusBottom: this.radius,         //円柱の下円の半径
            openEnded : false,       //上下の円を開ける
            rotationXYZ : true,
            material : {
                type : "Phong",
                color: this.color,
                castShadow : true,    //影の描画
                receiveShadow : true, //影の映り込み描画
            },
            //バウンディングボックス関連パラメータ
            boundingBox : {
                visible : false,     //バウンディングボックスの表示
            }
        })

        this.physLab.objects.push( this.interactionObject );

    }

    //クーロン相互作用
    if( this.type === PHYSICS.CoulombInteraction ){


    }
    //万有引力相互作用
    if( this.type === PHYSICS.UniversalGravitation ){


    }
    //レナード・ジョーンズポテンシャル
    if( this.type === PHYSICS.LennardJonesPotential ){


    }


}

PHYSICS.Interaction.prototype.update = function(){

    if( !this.visible ) return;

    //ばね弾性力
    if( this.type === PHYSICS.LinearSpringConnection ){
        //ばねの向きを指定
        this.interactionObject.setSpringBottomToTop(
            this.object1.position,
            this.object2.position
        );

    } else if( this.type === PHYSICS.FixedDistanceConnection ){
        //２点間距離固定拘束可視化
        this.interactionObject.setBottomToTop(
            this.object1.position,
            this.object2.position
        );

    } else if( this.type === PHYSICS.UniversalGravitation ){


    }
}

