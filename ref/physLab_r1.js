////////////////////////////////////////////////////
// 仮想物理実験 r1
////////////////////////////////////////////////////
//名前空間
var PHYSICS = { REVISION: 'r1' };
///////////////////////////////////
// 物理実験室の基底クラス
///////////////////////////////////
PHYSICS.PhysLab = function ( parameter ) {
	parameter = parameter || {};

	//HTML要素のid名関連

	//額縁ID
	this.frameID = null;

	//スタートボタンID
	this.playButtonID = null;

	//リセットボタンID
	this.resetButtonID = null;

	//画面キャプチャID
	this.pictureID = null;

	//重力定数
	this.g = 9.8; 

	//1ステップあたりの時間間隔
	this.dt =  0.001;  

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
	this.locusFlag = true;             // (true | false | "pause")

	//速度ベクトルの表示
	this.velocityVectorFlag = "pause"; // (true | false | "pause")

	//バウンディングボックスの表示
	this.boundingBoxFlag = "dragg";    // (true | false | "dragg")

	//レンダラ関連パラメータ
	this.renderer = {
		clearColor : 0xFFFFFF, //クリアーカラー（背景色）
		clearAlpha : 1.0,      //クリアーアルファ値（背景色）
		parameters : {         //WebGLRendererクラスのコンストラクタに渡すパラメータ 
			antialias: true,   //アンチエイリアス（デフォルト：false）
			stencil: true,     //ステンシルバッファ（デフォルト：true）
		}
	}

	//カメラパラメータ
	this.camera = { 
		type : "Perspective",          //カメラの種類（ "Perspective" | "Orthographic"）
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
		angle: Math.PI/4,             //角度（スポットライト光源）
		exponent: 20,                 //光軸からの減衰指数（スポットライト）
		ambient: null                 //環境光源色
	}; 

	//シャドーマップ
	this.shadow = {
		shadowMapEnabled:    false,  //シャドーマップの利用
		shadowMapWidth:      512,    //シャドーマップの横幅
		shadowMapHeight:     512,    //シャドーマップの高さ
		shadowCameraVisible: false,  //シャドーマップの可視化
		shadowCameraNear:    0.1,    //シャドーカメラのサイズ（near）
		shadowCameraFar:     50,     //シャドーカメラのサイズ（far）
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
		rotateSpeed : 2.0,          //トラックボールの回転速度の設定
		noZoom : false,             //トラックボールの拡大無効化
		zoomSpeed : 1.0,            //トラックボールの拡大速度の設定
		noPan : false,              //トラックボールのカメラ中心移動の無効化と中心速度の設定
		panSpeed : 1.0,             //中心速度の設定
		staticMoving : true,        //トラックボールのスタティックムーブの有効化
		dynamicDampingFactor : 0.3, //トラックボールのダイナミックムーブ時の減衰定数
	}


	//物理空間に空間配置するオブジェクト
	this.objects = [];

	/////////////////////////////////////////////
	//内部パラメータ
	/////////////////////////////////////////////
	//実験室番号
	this.id = 0;

	//各種フラグ
	this.initFlag = true;   //初期フラグ
	this.pauseFlag = true;  //一時停止フラグ
	this.resetFlag = false;  //リセットフラグ
	
	this.makePictureFlag = true;//画面キャプチャの生成フラグ

	//マウスドラック対象オブジェクト
	this.draggableObjects = [];

	//FPS計測
	this.stats = null;

	//３次元グラフィックス関連
	this.CG = {};

	//パラメータの設定
	this.setParameter( parameter );
}
////////////////////////////////////////////////////////////////////
// クラスプロパティ
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.id = 0;

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


/*
var object1 = { a : "あ", b : [1, 2, 3, 4], c : { c1 : true, c2 : 6 }, f : function(str){ console.log( "a" + str )} };
var object2 = { a : "い", c : { c1: false}, d : 2.3 };
*/

/*
object2.b = object1.b;

object1.b[0] = 10;
console.log( object2.b );
*/

/*
PHYSICS.setProperty (object2, object1);

console.log(object2);
object2.f("テスト");

object1.f = function(str){ console.log( "b" + str )} ;
object1.f("テスト");
object2.f("テスト");
*/


/*
	console.log( "" instanceof Object ); 
	console.log( 10 instanceof Object ); 
	console.log( true instanceof Object ); 
	console.log( [] instanceof Object ); 
	console.log( function(){} instanceof Object ); 
	console.log( {} instanceof Object );
	console.log( [] instanceof Array );  
	console.log( function(){} instanceof Function );  
*/

////////////////////////////////////////////////////////////////////
// 仮想物理実験のスタート関数
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.startLab = function (){
	//実験室番号
	PHYSICS.PhysLab.id ++;
	this.id = PHYSICS.PhysLab.id;

	//イベント初期化メソッドの実行
	this.initEvent();

	//仮想物理実験室の初期化メソッドの実行
	this.init3DCG(); 

	//オブジェクトの生成と表示
	for(var i=0; i < this.objects.length; i++){

		//３次元オブジェクトを生成
		this.createPhysObject( this.objects[i] );

	}

	//無限ループ関数の実行
	this.loop();       
}
PHYSICS.PhysLab.prototype.createPhysObject = function( physObject ) {

	//３次元オブジェクトに所属する仮想物理実験オブジェクトを格納
	physObject.physLab = this;

	//３次元オブジェクトの生成と表示
	physObject.create();

	//ドラック可能オブジェクトとして登録
	if( physObject.draggable ){

		this.draggableObjects.push( physObject.boundingBox.CG );

	}

}





////////////////////////////////////////////////////////////////////
// イベント準備関数
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.initEvent = function ( ) {

	var scope = this;

	//FPS計測結果を表示するHTML要素を追加
	if( this.displayFPS ) {

		//FPS計測
		this.stats = new Stats();

		//HTML要素の追加
		document.getElementById( scope.frameID ).appendChild( this.stats.domElement );

	}

	//計算開始ボタン・一時停止ボタンのクリックイベントの追加
	if( scope.playButtonID ){

		//ボタンの表示内容を指定
		document.getElementById( scope.playButtonID ).innerHTML = "計算開始";
		//マウスクリックイベントの追加
		document.getElementById( scope.playButtonID ).addEventListener( 'mousedown', function(){

			//初期状態フラグの解除
			scope.initFlag = false;
			//一時停止フラグの反転
			scope.pauseFlag = !scope.pauseFlag;
			//ボタンの表示内容の変更
			scope.switchButton();

		}, false);

	} else {

		//初期状態フラグの解除
		scope.initFlag = false;
		//一時停止の解除
		scope.pauseFlag = false;

	}


	//リセットボタンのクリックイベントの追加
	if( scope.resetButtonID ){
		document.getElementById( scope.resetButtonID ).innerHTML = "初期状態へ戻る";

		document.getElementById( scope.resetButtonID ).addEventListener('mousedown', function(){

			//再計算用フラグを立てる
			scope.resetFlag = true;
			//一時停止を立てる
			scope.pauseFlag = true;
			//表示するボタンの変更
			scope.switchButton();

		}, false);

	} 

	//画面キャプチャ
	if( scope.pictureID ){

		document.getElementById( scope.pictureID ).innerHTML = "画面キャプチャ";

	}

}
////////////////////////////////////////////////////////////////////
// ボタン表示の変更関数
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.switchButton = function( ){

	//一時停止フラグによる分岐
	if ( this.pauseFlag ) {

		var label = ( this.resetFlag )? "計算開始" : "計算再開";

		document.getElementById( this.playButtonID ).innerHTML = label;
		document.getElementById( this.pictureID ).style.visibility = "visible";

	} else {
		
		var label = "一時停止";

		document.getElementById( this.playButtonID ).innerHTML = label;
		document.getElementById( this.pictureID ).style.visibility = "hidden";

	}
	//画面キャプチャの生成フラグ
	this.makePictureFlag = true;
}


////////////////////////////////////////////////////////////////////
// 仮想物理実験室の初期化
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.init3DCG = function() {

	this.initThree();  //three.js初期化関数の実行
	this.initCamera(); //カメラ初期化関数の実行
	this.initLight();  //光源初期化関数の実行
	this.initDragg();  //マウスドラック準備関数の実行

}

////////////////////////////////////////////////////////////////////
// Three.js初期化関数の定義
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.initThree = function() {

	//キャンバスフレームDOM要素の取得
	this.CG.canvasFrame = document.getElementById( this.frameID );

	//レンダラーオブジェクトの生成
	this.CG.renderer = new THREE.WebGLRenderer( this.renderer.parameters );

	if ( !this.CG.renderer ) alert( 'Three.js の初期化に失敗しました' );

	//レンダラーのサイズの設定
	this.CG.renderer.setSize( 
		this.CG.canvasFrame.clientWidth, 
		this.CG.canvasFrame.clientHeight
	);

	//キャンバスフレームDOM要素にcanvas要素を追加
	this.CG.canvasFrame.appendChild( this.CG.renderer.domElement );

	//レンダラークリアーカラーの設定
	this.CG.renderer.setClearColor( 
		this.renderer.clearColor,
		this.renderer.clearAlpha
	);

	//シャドーマップの利用
	this.CG.renderer.shadowMapEnabled = this.shadow.shadowMapEnabled;

	//シーンオブジェクトの生成
	this.CG.scene = new THREE.Scene();

}
////////////////////////////////////////////////////////////////////
// カメラ初期化関数の定義
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.initCamera = function() {

	//カメラのタイプが透視投影（Perspective）の場合
	if( this.camera.type == "Perspective" ){ 

		//透視投影カメラオブジェクトの生成
		this.CG.camera = new THREE.PerspectiveCamera ( 
			this.camera.fov,  //視野角
			this.CG.canvasFrame.clientWidth / this.CG.canvasFrame.clientHeight, //アスペクト
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
		this.CG.canvasFrame 
	);

	//トラックボール動作範囲のサイズとオフセットの設定
	this.CG.trackball.screen.width = this.CG.canvasFrame.clientWidth;                        //横幅
	this.CG.trackball.screen.height = this.CG.canvasFrame.clientHeight;                      //縦幅
	this.CG.trackball.screen.offsetLeft = this.CG.canvasFrame.getBoundingClientRect().left;  //左オフセット
	this.CG.trackball.screen.offsetTop = this.CG.canvasFrame.getBoundingClientRect().top;    //上オフセット

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
PHYSICS.PhysLab.prototype.initLight = function() {

	//シャドーカメラのパラメータを設定する関数
	function setShadowCamera ( shadowCamera , parameter ){
		//光源オブジェクトの影の生成元
		shadowCamera.castShadow = parameter.shadowMapEnabled;
		//シャドウマップのサイズ
		shadowCamera.shadowMapWidth = parameter.shadowMapWidth;
		shadowCamera.shadowMapHeight = parameter.shadowMapHeight; 
		//影の黒さ
		shadowCamera.shadowDarkness  = parameter.shadowDarkness;
		//シャドーカメラの可視化
		shadowCamera.shadowCameraVisible = parameter.shadowCameraVisible;

		if( shadowCamera instanceof THREE.DirectionalLight ){

			//平行光源の場合
			shadowCamera.shadowCameraNear    = parameter.shadowCameraNear;
			shadowCamera.shadowCameraFar     = parameter.shadowCameraFar;
			shadowCamera.shadowCameraRight   = parameter.shadowCameraRight;
			shadowCamera.shadowCameraLeft    = parameter.shadowCameraLeft ;
			shadowCamera.shadowCameraTop     = parameter.shadowCameraTop ;
			shadowCamera.shadowCameraBottom  = parameter.shadowCameraBottom;

		} else if( shadowCamera instanceof THREE.SpotLight ){

			//点光源の場合
			shadowCamera.shadowCameraNear    = parameter.shadowCameraNear;
			shadowCamera.shadowCameraFar     = parameter.shadowCameraFar;
			shadowCamera.shadowCameraFov     = parameter.shadowCameraFov;

		} else {

			alert("シャドーカメラの設定ミス");

		}

	} 


	if( this.light.type == "Directional"){ 

		//平行光源オブジェクトの生成
		this.CG.light = new THREE.DirectionalLight( 
			this.light.color,     //光源色
			this.light.intensity  //光源強度
		);

		//シャドーマッピングを行う場合
		if( this.shadow.shadowMapEnabled ){

			setShadowCamera ( this.CG.light , this.shadow);

		}

	} else if( this.light.type == "Spot" ){

		//スポットライトオブジェクトの生成
		this.CG.light = new THREE.SpotLight( 
			this.light.color,     //光源色
			this.light.intensity, //光源強度
		 	this.light.distance,  //距離減衰指数
		 	this.light.angle,     //スポットライト光源の角度
		 	this.light.exponent   //光軸からの減衰指数
		);

		//シャドーマッピングを行う場合
		if( this.shadow.shadowMapEnabled ){

			setShadowCamera ( this.CG.light , this.shadow );

		}

	} else if( this.light.type == "Point" ){
		//点光源オブジェクトの生成
		this.CG.light = new THREE.PointLight( 
			this.light.color,     //光源色
			this.light.intensity, //光源強度
		 	this.light.distance   //距離減衰指数
		);

		//シャドーマッピングを行う場合
		if( this.shadow.shadowMapEnabled ){
			//シャドーカメラ用スポットライトオブジェクトの生成
			this.CG.light.shadowCamera = new THREE.SpotLight( );
			//シャドーカメラ用の位置
			this.CG.light.shadowCamera.position.set( 
				this.light.position.x,
				this.light.position.y, 
				this.light.position.z 
			);
			//スポットライト光源オブジェクトをシャドーマップ作成用のみに利用する
			this.CG.light.shadowCamera.onlyShadow = true;

			//シャドーカメラをシーンへ追加
			this.CG.scene.add( this.CG.light.shadowCamera );
			setShadowCamera ( this.CG.light.shadowCamera , this.shadow );
		}

	} else {

		alert ("光源の設定ミス");

	}

	//光源オブジェクトの位置の設定
	this.CG.light.position.set ( 
		this.light.position.x, 
		this.light.position.y, 
		this.light.position.z
	);
	//光源ターゲット用オブジェクトの生成
	this.CG.light.target = new THREE.Object3D();
	this.CG.light.target.position.set ( 
		this.light.target.x, 
		this.light.target.y, 
		this.light.target.z
	);
	//光源オブジェクトのシーンへの追加
	this.CG.scene.add( this.CG.light );


	if( this.light.ambient ){ 
		//環境光オブジェクトの生成
		this.CG.ambientLight = new THREE.AmbientLight(this.light.ambient);

		//環境光オブジェクトのシーンへの追加
		this.CG.scene.add( this.CG.ambientLight );
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
	var geometry = new THREE.PlaneGeometry(200, 200, 8, 8);
	//材質オブジェクトの宣言と生成
	var material = new THREE.MeshBasicMaterial({ color: 0x000000,  wireframe: true });
	//平面オブジェクトの生成
	var plane = new THREE.Mesh( geometry, material );
	//平面オブジェクトの可視化
	plane.visible = false;
	//平面オブジェクトのシーンへの追加
	this.CG.scene.add( plane );

	this.CG.canvasFrame.addEventListener('mousemove', onDocumentMouseMove, false);
	this.CG.canvasFrame.addEventListener('mousedown', onDocumentMouseDown, false);
	this.CG.canvasFrame.addEventListener('mouseup'  , onDocumentMouseUp,   false);

	//マウスクリック時のバウンディングボックスオブジェクト中心からの相対座標
	var offset = new THREE.Vector3();
	var INTERSECTED;  //マウスポインタが指しているオブジェクト 
	var SELECTED;     //マウスドラック中のオブジェクト
	var scope = this; //イベント中の実験室オブジェクトを指す変数

	//HTML要素の位置による補正量の取得
	var elementOffsetLeft, elementOffsetTop; 

	//マウスムーヴイベント	
	function onDocumentMouseMove ( event ) {

		//マウスドラックフラグを解除
		for(var i = 0; i < scope.draggableObjects.length; i++){
			scope.draggableObjects[i].physObject.boundingBox.draggFlag = false;
		}

		//マウスドラックが許可されていない場合は処理を終了
		if( !scope.allowDrag ) return;

		elementOffsetLeft = scope.CG.canvasFrame.getBoundingClientRect().left; 
		elementOffsetTop = scope.CG.canvasFrame.getBoundingClientRect().top; 

		//マウスポインタの位置座標の取得
		var mx = ( (event.clientX-elementOffsetLeft) / scope.CG.canvasFrame.clientWidth) * 2 - 1;
		var my = -( (event.clientY-elementOffsetTop) / scope.CG.canvasFrame.clientHeight) * 2 + 1;
		var vector = new THREE.Vector3(mx, my, 0.5);
		//プロジェクターオブジェクトの生成
		var projector = new THREE.Projector();
		//逆投影変換を行うことで仮想空間内のベクトルへと変換する
		vector = projector.unprojectVector( vector, scope.CG.camera );
		//カメラ位置座標を起点として規格化を行う
		vector = vector.sub( scope.CG.camera.position ).normalize();
		//カメラ位置座標から光線を発射
		var raycaster = new THREE.Raycaster( scope.CG.camera.position, vector );

		//オブジェクトがマウスドラックされている時
		if ( SELECTED ) {

			//光線と交わる平面オブジェクトオブジェクトを収集
			var intersects = raycaster.intersectObject( plane );
			//マウスドラック時のマウスポインタの指している平面オブジェクトの３次元空間中の位置座標
			var vec3 = intersects[0].point;

			//マウスドラックされているオブジェクトのバウンディングボックスを移動
			SELECTED.physObject.boundingBox.CG.position.copy( 
				vec3.sub( offset )
			);

			//マウスドラックされているオブジェクトを移動
			SELECTED.physObject.r.copy( 
				SELECTED.physObject.boundingBox.CG.position
			).sub( SELECTED.physObject.boundingBox.center );

			//マウスドラックフラグの設定
			SELECTED.physObject.boundingBox.draggFlag = true;

			//マウスドラックイベントの実行
			scope.mouseDraggEvent( SELECTED.physObject );//<------------------------------------------------------------イベント実行

			return;
		}
		//光線と交わるオブジェクトを収集
		var intersects = raycaster.intersectObjects( scope.draggableObjects );

		//マウスポインタがオブジェクト上にある場合
		if ( intersects.length > 0) {

			if (INTERSECTED != intersects[0].object) {

				//マウスドラックが許可されていない場合は処理を終了
				if( !intersects[0].object.physObject.allowDrag ) return;

				//マウスポインタが指しているオブジェクトが登録されていなければ、一番手前のオブジェクトを「INTERSECTED」に登録
				INTERSECTED = intersects[0].object;

				//平面オブジェクトの位置座標を「INTERSECTED」に登録されたオブジェクトと同じ位置座標とする
				plane.position.copy( INTERSECTED.position );

				//平面オブジェクトの上ベクトルをカメラの位置座標の方向へ向ける
				plane.lookAt( scope.CG.camera.position );

			}
			//バウンディングボックスの可視化
			INTERSECTED.physObject.boundingBox.draggFlag = true;

			//マウスポインタのカーソルを変更
			scope.CG.canvasFrame.style.cursor = 'pointer';

		} else {

			//マウスポインタがオブジェクトから離れている場合
			INTERSECTED = null;

			//マウスポインタのカーソルを変更
			scope.CG.canvasFrame.style.cursor = 'auto';

		}
	}
	//マウスダウンイベント	
	function onDocumentMouseDown( event ) {
		//マウスドラックが許可されていない場合は処理を終了
		if( !scope.allowDrag ) return;

		//マウスポインタの位置座標の取得
		var mx = ( (event.clientX-elementOffsetLeft) / scope.CG.canvasFrame.clientWidth) * 2 - 1;
		var my = -( (event.clientY-elementOffsetTop) / scope.CG.canvasFrame.clientHeight) * 2 + 1;
		var vector = new THREE.Vector3(mx, my, 0.5);

		//プロジェクターオブジェクトの生成
		var projector = new THREE.Projector();
		//逆投影変換を行うことで仮想空間内のベクトルへと変換する
		vector = projector.unprojectVector( vector, scope.CG.camera );
		//カメラ位置座標を起点として規格化を行う
		vector = vector.sub( scope.CG.camera.position ).normalize();
		//カメラ位置座標から光線を発射
		var raycaster = new THREE.Raycaster( scope.CG.camera.position, vector );
		//光線と交わるオブジェクトを収集
		var intersects = raycaster.intersectObjects( scope.draggableObjects );
		//交わるオブジェクトが１個以上の場合
		if (intersects.length > 0) {

			//マウスドラックが許可されていない場合は処理を終了
			if( !intersects[0].object.physObject.allowDrag ) return;

			//トラックボールを無効化
			scope.CG.trackball.enabled = false;
			//クリックされたオブジェクトを「SELECTED」に登録
			SELECTED = intersects[0].object;

			//マウスダウンイベントの実行
			scope.mouseDownEvent( SELECTED.physObject );//<------------------------------------------------------------イベント実行

			//光線と交わる平面オブジェクトオブジェクトを収集
			var intersects = raycaster.intersectObject( plane );
			//クリック時のマウスポインタの指した平面オブジェクトの３次元空間中の位置座標
			var vec3 = intersects[0].point;
			//平面オブジェクトの中心から見た相対的な位置座標
			offset.copy(vec3).sub( plane.position );
			//マウスポインタのカーソルを変更
			scope.CG.canvasFrame.style.cursor = 'move';
		}
	}
	//マウスアップイベント	
	function onDocumentMouseUp(event) {

		//トラックボールを有効化
		scope.CG.trackball.enabled = scope.trackball.enabled;

		//マウスポインタのカーソルを変更
		scope.CG.canvasFrame.style.cursor = 'auto';

		//マウスドラックが許可されていない場合は処理を終了
		if( !scope.allowDrag ) return;

		//マウスアップ時にマウスポインタがオブジェクト上にある場合
		if ( INTERSECTED && SELECTED ) {

			//平面オブジェクトの位置座標をオブジェクトの位置座標に合わせる
			plane.position.copy( INTERSECTED.position );

			//内部パラメータのリセット
			if( SELECTED.physObject.dynamic ) SELECTED.physObject.resetParameter();

			//マウスアップイベントの実行
			scope.mouseUpEvent( SELECTED.physObject );//<------------------------------------------------------------イベント実行

			//画面キャプチャの生成フラグ
			scope.makePictureFlag = true;

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
PHYSICS.PhysLab.prototype.loop = function () {

	//トラックボールによるカメラオブジェクトのプロパティの更新
	this.CG.trackball.update( );

	//FPT計測・表示
	if( this.stats ) this.stats.update();

	//フラグチェック
	this.checkFlags();

	//実験室の時間発展の計算
	this.timeEvolution();

	//３次元グラフィックスの更新
	for( var i = 0; i < this.objects.length; i++){

		this.objects[i].update();

	}

	//レンダリング
	this.CG.renderer.render( this.CG.scene, this.CG.camera );

	//画面キャプチャの生成
	this.makePicture();

	//「loop()」関数の呼び出し
	requestAnimationFrame(
		this.loop.bind( this )
	);

}


////////////////////////////////////////////////////////////////////
// 停止フラグのチェック
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.checkFlags = function (){

	//リセットフラグ
	if ( this.resetFlag ) {

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
		this.resetFlag = false;
		//一時停止フラグを立てる
		this.pauseFlag = true;
		//画面キャプチャの生成フラグ
		this.makePictureFlag = true;
		//初期フラグを立てる
		this.initFlag = true;


		//各種計算パラメータの初期化
		this.step = 0;
		//実験室のマウスドラックを規定値へ
		this.allowDrag = this.draggable;

	}

}


////////////////////////////////////////////////////////////////////
// 実験室の時間発展
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.timeEvolution = function (){

	//一時停止中の場合
	if( this.pauseFlag ) return;

	//描画の間引回数だけ時間発展を進める
	for ( var i = 0; i < this.skipRendering; i++) {
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


////////////////////////////////////////////////////////////////////
// 画面キャプチャの生成
////////////////////////////////////////////////////////////////////
PHYSICS.PhysLab.prototype.makePicture = function (){
	
	//画面キャプチャ生成フラグのチェック
	if( !this.makePictureFlag ) return;

	if( this.pictureID ) {
		//canvas要素→DataURL形式
		document.getElementById( this.pictureID ).href = this.CG.renderer.domElement.toDataURL("image/png");

		var time = this.dt * this.step;
		//PNGファイル名の命名
		document.getElementById( this.pictureID ).download = time.toFixed(2) + ".png";

	}
	//画面キャプチャ生成フラグの解除
	this.makePictureFlag = false;			
}











