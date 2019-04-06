////////////////////////////////////////////////////
// 仮想物理実験 r14
////////////////////////////////////////////////////

//Surfaceクラスの追加
//Latticeクラスの追加
//VectorFieldクラスの追加

//加速度ベクトルの可視化

//名前空間のチェック
if( typeof PHYSICS === "undefined" ) alert( "名前空間「PHYSICS」が未定義です" );

//物理系に存在するオブジェクトの基底クラス
PHYSICS.PhysObject = function( parameter ) {

    //位置ベクトル
    this.position = new THREE.Vector3( );
    //速度ベクトル
    this.velocity = new THREE.Vector3( );
    //加速度ベクトル
    this.acceleration = new THREE.Vector3( );
    //角速度ベクトル
    this.omega = new THREE.Vector3( );

    this.position_1 = new THREE.Vector3( );
    this.velocity_1 = new THREE.Vector3( );
    this.omega_1 = new THREE.Vector3( );

    this.force = new THREE.Vector3( );
    this.torque = new THREE.Vector3( );

    this.accelerationVector = new THREE.Vector3( );

    //個別の物体に生じる力を格納
    this.addForces =[];

    //時間発展の有無
    this.dynamic = false;

    //回転運動の有無指定
    this.noRotation = false;

    //オブジェクト表示の有無
    this.visible = true;

    //質量
    this.mass = 1.0;

    //電荷
    this.charge = 1.0;


    //慣性モーメント
    this.moment = null;
    this.moments = [];

    //運動の記録を行う
    this.recordData = false;

    //運動記録の間引回数
    this.skipRecord = 100;

    //マウスドラックの有無
    this.draggable = false;

    //マウスドラックの許可
    this.allowDrag = false;

    //頂点座標のローテンション
    this.rotationXYZ = false;

    //姿勢軸ベクトルと姿勢軸周りの回転角の初期値
    this.axis = new THREE.Vector3(0, 0, 1);
    this.angle = 0;

    //姿勢を表すクォータニオン
    this.quaternion = new THREE.Quaternion( );
    this.quaternion_1 = new THREE.Quaternion( );

    //３次元グラフィックス材質関連パラメータ
    this.material = {
        type : "Lambert",      //材質の種類 （ "Basic" | "Lambert" | "Phong" | "Normal"）
        shading : "Flat",      //シェーディングの種類 （ "Flat" | "Smooth" ）
        side : "Front",        //描画する面 ( "Front" | "Back" | "Double")
        color :  0xFF0000,     //反射色（発光材質の場合：発光色）
        ambient : 0x990000,    //環境色
        opacity : 1.0,         //不透明度
        transparent : false,   //透過処理
        wireframe : false,     //ワイヤーフレーム
        emissive : 0x000000,   //反射材質における発光色
        specular : 0x111111,   //鏡面色
        shininess : 30,        //鏡面指数
        castShadow : false,    //影の生成
        receiveShadow : false, //影の映り込み
        depthWrite : true,     //デプスバッファ書き込みの可否
        depthTest  : true,     //デプステスト実施の有無
        textureWidth : 256,    //動的テクスチャ生成時の横幅
        textureHeight : 256,   //動的テクスチャ生成時の縦幅
        blending : null,       //ブレンディングの種類 （ "No" | "Normal" | "Additive" | "Subtractive" | "Multiply" | "Custo" ）
        bumpScale : 0.05,      //バンプの大きさ
        vertexColors: false    //頂点色利用の有無
    };

    //軌跡の可視化関連パラメータ
    this.locus = {
        enabled : false,    //可視化の有無
        visible : false,    //表示・非表示の指定
        color :  null,      //発光色
        maxNum : 10000,      //軌跡頂点の最大配列数
    };

    //速度ベクトルの可視化関連パラメータ
    this.velocityVector = {
        enabled : false,    //可視化の有無
        visible : false,    //表示・非表示の指定
        color : null,
        _color : new THREE.Color(),      //発光色
        scale: 0.5,         //矢印のスケール
        startPointOffset : false, //ベクトル始点のオフセット
        headLength: 0.2, //矢印頭の長さ
        headWidth:0.3 //矢印頭の長さ
    };
    //加速度ベクトルの可視化関連パラメータ
    this.accelerationVector = {
        enabled : false,    //可視化の有無
        visible : false,    //表示・非表示の指定
        color : null,
        _color : new THREE.Color(),      //発光色
        scale: 0.5,         //矢印のスケール
        startPointOffset : false, //ベクトル始点のオフセット
        headLength: 0.2, //矢印頭の長さ
        headWidth:0.3 //矢印頭の長さ
    };
    //バウンディングボックスの可視化関連パラメータ
    this.boundingBox = {
        visible : false,    //表示・非表示の指定
        color :  null,      //発光色
        opacity : 0.2,      //不透明度
        transparent : true, //透過処理
        draggFlag : false   //マウスドラック状態かを判定するフラグ（内部プロパティ）
    };

    //バウンディング球の可視化関連パラメータ
    this.boundingSphere = {
        enabled : false,    //可視化の有無
        visible : false,    //表示・非表示の指定
        color :  null,      //発光色
        opacity : 0.2,      //不透明度
        transparent : true, //透過処理
        widthSegments : 40, //y軸周りの分割数
        heightSegments :40  //y軸上の正の頂点から負の頂点までの分割数
    };


    //ストロボ撮影の関連パラメータ
    this.strobe = {
        enabled : false,    //ストロボ撮影の有無
        visible : false,    //表示・非表示の指定
        color : null,       //描画色
        transparent : true, //透明化
        opacity : 0.5,      //透明度
        maxNum : 20,        //ストロボオブジェクトの数
        skip : 10,          //ストロボの間隔
        velocityVectorEnabled : false, //速度ベクトルの利用
        velocityVectorVisible : false, //速度ベクトルの表示
        accelerationVectorEnabled : false, //力ベクトルの利用
        accelerationVectorVisible : false, //力ベクトルの表示
    };

    //ポテンシャルエネルギー表示モード
    this.potential3DMode = {
        enabled : false,    //利用の有無
        noGraphics : false, //グラフィックスは生成しない
        visible : false,    //表示の有無
        positionFunction : null,//ポテンシャル表位置示座標
        potentialFunction : null, //ポテンシャルの関数形
        colorFunction : null, //ポテンシャルの頂点色
        n : 100,       //一辺あたりの格子数
        width : 1,     //格子の一辺の長さ
        color: 0xFFFFFF, //描画色
        opacity : 1.0, //透明度
    }

    //ローカル座標系可視化関連パラメータ
    this.localAxis = {
        enabled : false, //ローカル座標系可視化の有無
        visible : false, //表示・非表示の指定
        size : 10,       //軸の長さ
        dashSize : 0.2,  //点線の線の長さ
        gapSize : 0.1,   //点線の空白の長さ
        colors : [ 0xFF0000, 0x00FF00, 0x0000FF] //軸の配色
    }

    this.beforeCreateFunctions = [];
    this.afterCreateFunctions = [];
    this.beforeUpdateFunctions = [];
    this.afterUpdateFunctions = [];
    this.beforeTimeEvolutionFunctions = [];
    this.afterTimeEvolutionFunctions = [];
    this.dynamicFunctions = [];

    //////////////////////////////////////////////////////////////////////////
    // 内部プロパティ
    //////////////////////////////////////////////////////////////////////////
    //運動の記録を格納するオブジェクト
    this.records = [];
    this.data = {};
    this.data.collisionHistory = []; //衝突履歴

/////////////////////////////////////////////////////////////////
    var list = [];

    for( var propertyName in this ){
        if( this.hasOwnProperty( propertyName ) ) {

            list.push( propertyName );

        }

    }
    //コピー対象プロパティリスト
    this.copyPropertyList = list;
/////////////////////////////////////////////////////////////////

    //形状オブジェクト関連
    this.geometry = {
        type : null,     //形状の種類
    };

    //３次元オブジェクト番号
    this.id = 0;
    //３次元グラフィックス用オブジェクト
    this.CG = {};

    //物理実験室
    this.physLab = null;

    //子要素として格納する本クラス（派生クラス）のオブジェクト
    this.children = [];

    //親オブジェクトを格納
    this.parent = null;

    //頂点ベクトルの初期値
    this._vertices = [];

    //現在の頂点座標
    this.vertices = [];

    //頂点色
    this.colors = [];

    //面を構成する頂点番号
    this.faces = [];

    //テクスチャ座標
    this.uvs = [];

    //接線ベクトル
    this.tangents = [];

    //法線ベクトル
    this.normals  = [];

    //衝突計算の必要性
    this.collision = false;

    //衝突力
    this.collisionForce = new THREE.Vector3();
    this.collisionTorque = new THREE.Vector3();

    this.energy = {};

    //接触力
    this.contactForce = new THREE.Vector3();
    this.contactTorque = new THREE.Vector3();


    //各種ベクトル量の更新の必要性
    this.vectorsNeedsUpdate = true;

    //非同期フラグ
    this.asynchronous = false;

    //実験室クラスのobjects配列の要素番号
    this.objectsIndex = null;

    this._k1_r = new THREE.Vector3();
    this._k1_v = new THREE.Vector3();
    this._k1_o = new THREE.Vector3();
    this._k2_r = new THREE.Vector3();
    this._k2_v = new THREE.Vector3();
    this._k2_o = new THREE.Vector3();
    this._k3_r = new THREE.Vector3();
    this._k3_v = new THREE.Vector3();
    this._k3_o = new THREE.Vector3();
    this._k4_r = new THREE.Vector3();
    this._k4_v = new THREE.Vector3();
    this._k4_o = new THREE.Vector3();

    this._mass = null;
    this._moment = null;
    this._moments = [];

    this._f  = new THREE.Vector3();
    this._D  = new THREE.Vector3();
    this._f2  = new THREE.Vector3();
    this._f_star  = new THREE.Vector3();
    this._f_mu  = new THREE.Vector3();

    //パラメータ設定
    this.setParameter( parameter );
}
////////////////////////////////////////////////////////////////////
// クラスプロパティ
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.id = 0;

////////////////////////////////////////////////////////////////////
// パラメータの設定
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.setParameter = function( parameter ){
    parameter = parameter || {};

    //パラメータの指定
    PHYSICS.overwriteProperty( this, parameter );

    //姿勢軸ベクトルの初期値
    if( parameter.axis ){
        this.axis.set( parameter.axis.x, parameter.axis.y, parameter.axis.z ).normalize( );
    }

    if( !this.dynamic ){

        this._mass = this.mass;
        this.mass = Infinity;
        this._moment = this.moment;
        this.moment = Infinity;
        for( var i=0; i<this.moments.length; i++ ) {
            this._moments[ i ] = this.moments[ i ];
            this.moments[ i ] = Infinity;
        }

    } else if( this.noRotation ){

        this._moment = this.moment;
        this.moment = Infinity;
        for( var i=0; i<this.moments.length; i++ ) {
            this._moments[ i ] = this.moments[ i ];
            this.moments[ i ] = Infinity;
        }

    }



    //クォータニオンの初期化
    this.initQuaternion( );

    //軌跡の色
    this.locus.color = this.locus.color || this.material.color;
    //速度ベクトルの色
    this.velocityVector.color = this.velocityVector.color || this.material.color ;
    //加速度ベクトルの色
    this.accelerationVector.color = this.accelerationVector.color || this.material.color ;
    //バウンディングボックスの色
    this.boundingBox.color = this.boundingBox.color || this.material.color;
    //バウンディング球の色
    this.boundingSphere.color = this.boundingSphere.color || this.material.color;
    //ストロボオブジェクトの色
    this.strobe.color = this.strobe.color || this.material.color;


}

////////////////////////////////////////////////////////////////////
// パラメータの再設定
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.resetParameter = function( parameter ){
    //運動データの初期化
    this.initDynamicData( );

    //パラメータの設定
    this.setParameter( parameter );

    //プロットデータ配列に初期値を代入
    this.recordDynamicData( );

    this.locus.count = 0;
}


////////////////////////////////////////////////////////////////////
// オブジェクトのコピー
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.getProperty = function( ){

    return this.physLab.getProperty( this );

}
//３次元オブジェクトの完全コピー
PHYSICS.PhysObject.prototype.clone = function (){

    return this.physLab.clone( this );

}
//３次元オブジェクトのクラス名を取得
PHYSICS.PhysObject.prototype.getClassName = function ( ){

    //名前空間に存在する全てのクラスを走査
    for(var className in PHYSICS ){

        //コンストラクタが一致した時のプロパティ名がクラス名
        if( this.constructor === PHYSICS[ className ] ) {

            return className;

        }

    }

}

////////////////////////////////////////////////////////////////////
// ３次元グラフィックスの生成
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.create3DCG = function( ){
    //形状オブジェクト
    var geometry = this.getGeometry( );

    //材質オブジェクトの取得
    var material = this.getMaterial( );

    //３次元グラフィックス用オブジェクトの生成
    if( this instanceof PHYSICS.Line ){

        if( this.segments ){

            //線オブジェクト
            this.CG = new THREE.LineSegments( geometry, material );


        } else{

            //線オブジェクト
            this.CG = new THREE.Line( geometry, material );

        }

    } else {

        //その他のオブジェクト
        this.CG = new THREE.Mesh( geometry, material );

    }


    //マウスドラックによる移動を行う場合
    if( this.draggable ){

        //バウンディングボックスの計算
        this.CG.geometry.computeBoundingBox( );

        //バウンディングボックスの幅の取得
        this.boundingBox.width  = new THREE.Vector3( ).subVectors(
            this.CG.geometry.boundingBox.max,
            this.CG.geometry.boundingBox.min
        );

        //形状オブジェクトの宣言と生成
        var geometry = new THREE.BoxGeometry(
            this.boundingBox.width.x,
            this.boundingBox.width.y,
            this.boundingBox.width.z
        );

        //材質オブジェクトの宣言と生成
        var material = new THREE.MeshBasicMaterial({
            color: this.boundingBox.color,
            transparent: this.boundingBox.transparent,
            opacity: this.boundingBox.opacity,
            depthWrite : false,
            depthTest : false
        });

        //バウンディングボックスオブジェクトの生成
        this.boundingBox.CG = new THREE.Mesh( geometry, material );

        //バウンディングボックスオブジェクトのローカル座標系における中心座標を格納（回転前）
        this.boundingBox._center  = new THREE.Vector3( ).addVectors(
            this.CG.geometry.boundingBox.max,
            this.CG.geometry.boundingBox.min
        ).divideScalar( 2 );

        //回転後のバウンディングボックスの中心座標
        this.boundingBox.center = new THREE.Vector3( );

        //バウンディングボックスオブジェクトの位置を指定
        this.boundingBox.CG.position.copy( this.position ).add( this.boundingBox._center ) ;

        //バウンディングボックスオブジェクトの表示の有無を指定
        this.boundingBox.CG.visible = true;

        //バウンディング球オブジェクトのシーンへの追加
        this.physLab.CG.scene.add( this.boundingBox.CG );

        //バウンディングボックスオブジェクトに３次元オブジェクトを指定
        this.boundingBox.CG.physObject = this;

    }

    //バウンディング球の計算
    this.CG.geometry.computeBoundingSphere( );
    this.boundingSphere.radius = this.CG.geometry.boundingSphere.radius;
    this.boundingSphere.center = this.CG.geometry.boundingSphere.center;

    //バウンディング球オブジェクトの表示
    if( this.boundingSphere.visible ){
        //形状オブジェクトの宣言と生成
        var geometry = new THREE.SphereGeometry(
            this.boundingSphere.radius,
            this.boundingSphere.widthSegments,
            this.boundingSphere.heightSegments
        );
        //材質オブジェクトの宣言と生成
        var material = new THREE.MeshBasicMaterial({
            color: this.boundingSphere.color,
            transparent: this.boundingSphere.transparent,
            opacity: this.boundingSphere.opacity
        });
        //バウンディング球オブジェクトの生成
        this.boundingSphere.CG = new THREE.Mesh( geometry, material );
        this.boundingSphere.CG.position.copy( this.position ).add( this.boundingSphere.center );
        //バウンディング球オブジェクトのシーンへの追加
        this.physLab.CG.scene.add( this.boundingSphere.CG );
    }

}

////////////////////////////////////////////////////////////////////
// 形状オブジェクトの生成
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.getGeometry = function( type, parameter ) {

    //材質の種類
    type = type || this.geometry.type;
    parameter = parameter || {};

    if( type === "Polygon" || type === "Line" || type === "Surface" || type === "Lattice" ){

        //頂点の再設定
        if(  this.resetVertices ){
            for( var i = 0; i < this._vertices.length; i++ ){
                this._vertices[i].sub( this.centerOfGeometry );
            }
        }

        //形状オブジェクトの宣言と生成
        var _geometry = new THREE.Geometry( );

        //形状オブジェクトに頂点座標の設定
        for( var i = 0; i < this._vertices.length; i++ ){
            _geometry.vertices.push( this._vertices[i] );
        }


        if( type === "Polygon" || type === "Surface" ){

            //全てのポリゴン面を指定する
            for( var i = 0; i < this.faces.length; i++ ){

                if( this.material.vertexColors === "Vertex" ){

                    var colors = [
                        this.colors[this.faces[i][0]],
                        this.colors[this.faces[i][1]],
                        this.colors[this.faces[i][2]]
                    ]

                } else {

                    var colors = null;

                }

                _geometry.faces.push( new THREE.Face3( this.faces[i][0], this.faces[i][1], this.faces[i][2] , null , colors) );

            }

            //テクスチャ座標配列の設定
            for( var i = 0; i < this.uvs.length; i++ ){
                _geometry.faceVertexUvs[ 0 ].push( this.uvs[ i ] );
            }

            //面の法線ベクトルを計算
            _geometry.computeFaceNormals( );
            //面の法線ベクトルから頂点法線ベクトルの計算
            _geometry.computeVertexNormals( );



        } else if( type === "Line" || type === "Lattice"){

            for( var i = 0; i < this.colors.length; i++ ){

                _geometry.colors.push( this.colors[i] );

            }

            //頂点間距離の累積距離を計算
            _geometry.computeLineDistances( );

        }


    } else if( type === "Sphere" ) {

        //球オブジェクトの形状オブジェクト
        var _geometry = new THREE.SphereGeometry (
            parameter.radius         || this.geometry.radius,         //球の半径
            parameter.widthSegments  || this.geometry.widthSegments,  //y軸周りの分割数
            parameter.heightSegments || this.geometry.heightSegments, //y軸上の正の頂点から負の頂点までの分割数
            parameter.phiStart       || this.geometry.phiStart,       //y軸回転の開始角度
            parameter.phiLength      || this.geometry.phiLength,      //y軸回転角度
            parameter.thetaStart     || this.geometry.thetaStart,     //x軸回転の開始角度。
            parameter.thetaLength    || this.geometry.thetaLength     //x軸回転角度
        );

    } else if( type === "Plane" ) {

        //平面オブジェクトの形状オブジェクト
        var _geometry = new THREE.PlaneGeometry(
            parameter.width  || this.geometry.width,    //平面の横幅（x軸方向）
            parameter.height || this.geometry.height,   //平面の縦軸（y軸方向）
            parameter.widthSegments  || this.geometry.widthSegments,  //横方向分割数
            parameter.heightSegments || this.geometry.heightSegments  //縦方向分割数
        );

    } else if( type === "Cube" || type === "Box" ) {

        //立方体オブジェクトの形状オブジェクト
        var _geometry = new THREE.BoxGeometry(
            parameter.width  || this.geometry.width,  //立方体の横幅  （x軸方向）
            parameter.depth  || this.geometry.depth,  //立方体の奥行き （y軸方向）
            parameter.height || this.geometry.height,  //立方体の高さ   （z軸方向）
            parameter.widthSegments  || this.geometry.widthSegments,   //横方向分割数
            parameter.heightSegments || this.geometry.heightSegments,  //縦方向分割数
            parameter.depthSegments  || this.geometry.depthSegments    //奥行き方向分割数
        );

    } else if( type === "Circle" ) {

        //円オブジェクトの形状オブジェクト
        var _geometry = new THREE.CircleGeometry (
            parameter.radius || this.geometry.radius,          //円の半径
            parameter.segments || this.geometry.segments,      //円の分割数
            parameter.thetaStart || this.geometry.thetaStart,  //円弧の開始角度
            parameter.thetaLength || this.geometry.thetaLength //円弧の終了角度
        );

    } else if( type === "Cylinder" ) {

        //円柱オブジェクトの形状オブジェクト
        var _geometry = new THREE.CylinderGeometry(
            parameter.radiusTop || this.geometry.radiusTop,           //円柱の上の円の半径
            parameter.radiusBottom || this.geometry.radiusBottom,     //円柱の下の円の半径
            parameter.height || this.geometry.height,                 //円柱の高さ
            parameter.radialSegments || this.geometry.radialSegments, //円の分割数
            parameter.heightSegments || this.geometry.heightSegments, //円の高さ方向の分割数
            parameter.openEnded || this.geometry.openEnded            //筒状
        );

    } else if( type === "Spring" ) {

        //ばねオブジェクトの形状オブジェクト
        var _geometry =  new THREE.SpringGeometry (
            this.radius,  //バネの半径
            this.tube,  //管の半径
            this.length, //バネの長さ
            this.windingNumber, //巻き数
            this.radialSegments, //外周の分割数
            this.tubularSegments  //管の分割数
        );

    } else {

        alert("形状オブジェクトの設定ミス");

    }

    //頂点座標を（x,y,z）→（z,x,y）へローテーション
    if( type !== "Polygon" && this.rotationXYZ ){

        for( var i = 0; i < _geometry.vertices.length; i++ ){
            var r = _geometry.vertices[ i ].clone( );
            _geometry.vertices[ i ].x = r.z;
            _geometry.vertices[ i ].y = r.x;
            _geometry.vertices[ i ].z = r.y;
        }

        for( var i = 0; i < _geometry.faces.length; i++ ){
            var r = _geometry.faces[ i ].normal.clone( );
            _geometry.faces[ i ].normal.x = r.z;
            _geometry.faces[ i ].normal.y = r.x;
            _geometry.faces[ i ].normal.z = r.y;
        }

        for( var i = 0; i < _geometry.faces.length; i++ ){
            for( var j = 0; j < _geometry.faces[ i ].vertexNormals.length; j++ ) {
                var r = _geometry.faces[ i ].vertexNormals[ j ].clone( );
                _geometry.faces[ i ].vertexNormals[ j ].x = r.z;
                _geometry.faces[ i ].vertexNormals[ j ].y = r.x;
                _geometry.faces[ i ].vertexNormals[ j ].z = r.y;
            }
        }
    }

    return _geometry;

}

////////////////////////////////////////////////////////////////////
// 材質オブジェクトの生成
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.getMaterial = function( type, parameter ) {

    //材質の種類
    type = type || this.material.type;

    parameter = parameter || {};

    //材質パラメータ
    var _parameter = {
        color:        ( parameter.color !== undefined )?       parameter.color : this.material.color,
        wireframe :   ( parameter.wireframe !== undefined )?   parameter.wireframe : this.material.wireframe,
        transparent:  ( parameter.transparent !== undefined )? parameter.transparent : this.material.transparent,
        opacity:      ( parameter.opacity !== undefined )?     parameter.opacity : this.material.opacity,
        emissive:     ( parameter.emissive !== undefined )?    parameter.emissive : this.material.emissive,
        specular:     ( parameter.specular !== undefined )?    parameter.specular : this.material.specular,
        shininess:    ( parameter.shininess !== undefined )?   parameter.shininess : this.material.shininess,
        side:         ( parameter.side !== undefined )?        parameter.side : this.material.side,
        shading:      ( parameter.shading !== undefined )?     parameter.shading : this.material.shading,
        depthWrite:   ( parameter.depthWrite !== undefined )?  parameter.depthWrite :  this.material.depthWrite,
        blending:     ( parameter.blending !== undefined )?    parameter.blending : this.material.blending,
        bumpScale:    ( parameter.bumpScale !== undefined )?   parameter.bumpScale : this.material.bumpScale,
        vertexColors: ( parameter.vertexColors !== undefined )?   parameter.vertexColors : this.material.vertexColors,
    };

    function setMapParameter ( texture , scope ){
        //テクスチャラッピングの指定（デフォルト値）
        texture.wrapS = THREE.ClampToEdgeWrapping; //s軸方向
        texture.wrapT = THREE.ClampToEdgeWrapping; //t軸方向
        texture.anisotropy = scope.physLab.CG.renderer.getMaxAnisotropy();

        if( scope.material.mapWrapS == "RepeatWrapping")
            texture.wrapS = THREE.RepeatWrapping;
        else if ( scope.material.mapWrapS == "MirroredRepeatWrapping")
            texture.wrapS = THREE.MirroredRepeatWrapping;

        if( scope.material.mapWrapT == "RepeatWrapping")
            texture.wrapT = THREE.RepeatWrapping;
        else if ( scope.material.mapWrapT == "MirroredRepeatWrapping")
            texture.wrapT = THREE.MirroredRepeatWrapping;
        //リピート数の指定
        texture.repeat.set(1, 1);
        if( scope.material.mapRepeat ){
            texture.repeat.set ( scope.material.mapRepeat.s, scope.material.mapRepeat.t);
        }

        //上下反転
        texture.flipY = ( scope.material.flipY !== undefined )? scope.material.flipY : true;
    }
    var texture;
    //テクスチャマッピング
    if( texture = parameter.mapTexture || this.material.mapTexture ){

        _parameter.map = this.physLab.textureLoader.load( texture );
        setMapParameter( _parameter.map, this );

    }
    //法線マッピング
    if( texture = parameter.normalMapTexture || this.material.normalMapTexture ) {
        //テクスチャの読み込み
        _parameter.normalMap   = this.physLab.textureLoader.load( texture );
        setMapParameter( _parameter.normalMap, this );
    }
    //鏡面マッピング
    if( texture = parameter.specularMapTexture || this.material.specularMapTexture ) {
        //テクスチャの読み込み
        _parameter.specularMap = this.physLab.textureLoader.load( texture );
        setMapParameter( _parameter.specularMap, this );
    }
    //バンプマッピング
    if( texture = parameter.bumpMapTexture || this.material.bumpMapTexture ){
        //テクスチャの読み込み
        _parameter.bumpMap = this.physLab.textureLoader.load( texture );
        setMapParameter( _parameter.bumpMap, this );
    }

    //環境マッピング
    if( texture = parameter.envMapTexture || this.material.envMapTexture ){
        //テクスチャの読み込み
        _parameter.envMap = this.physLab.cubeTextureLoader.load( texture , new THREE.CubeReflectionMapping( ) );
        //画像データのフォーマットの指定
        _parameter.envMap.format = THREE.RGBFormat;
    }

    function generateCanvas( textureFunction, width, height ) {
        //canvas要素の生成
        var canvas = document.createElement('canvas');
        //canvas要素のサイズ
        canvas.width = width;   //横幅
        canvas.height = height; //縦幅
        //コンテキストの取得
        var context = canvas.getContext('2d');

        //ビットマップデータのRGBAデータ格納配列
        var bitmapData = [];
        //RGBAデータ格納配列への値の代入
        for ( var t = 0; t < canvas.height; t++ ) {
            for ( var s = 0; s < canvas.width; s++ ) {
                var index = ( t * canvas.width + s) * 4; //各ピクセルの先頭を与えるインデクス番号

                var color = textureFunction (s, t);
                //ビットマップデータのRGBAデータ
                bitmapData[index + 0] = 255 * color.r; //R値
                bitmapData[index + 1] = 255 * color.g; //G値
                bitmapData[index + 2] = 255 * color.b; //B値
                bitmapData[index + 3] = 255 * color.a; //A値
            }
        }
        //イメージデータオブジェクトの生成
        var imageData = context.createImageData(canvas.width, canvas.height);
        for ( var i = 0; i < canvas.width * canvas.height * 4; i++ ) {
            imageData.data[i] = bitmapData[i]; //配列のコピー
        }
        //イメージデータオブジェクトからcanvasに描画する
        context.putImageData(imageData, 0, 0);
        return canvas;
    }

    var textureFunction;
    //テクスチャマッピング
    if( textureFunction = parameter.mapTextureFunction || this.material.mapTextureFunction ){

        //テクスチャ画像用のcanvas要素の取得
        var canvas = generateCanvas( textureFunction, this.material.textureWidth, this.material.textureHeight );
        //テクスチャオブジェクトの生成
        _parameter.map = new THREE.Texture( canvas );
        //テクスチャ画像の更新
        _parameter.map.needsUpdate = true;
        _parameter.map.anisotropy = this.physLab.CG.renderer.getMaxAnisotropy();

        setMapParameter( _parameter.map, this );
    }

    //法線マッピング
    if( textureFunction = parameter.normalMapTextureFunction || this.material.normalMapTextureFunction ){

        //テクスチャ画像用のcanvas要素の取得
        var canvas = generateCanvas( textureFunction, this.material.textureWidth, this.material.textureHeight );
        //テクスチャオブジェクトの生成
        _parameter.normalMap = new THREE.Texture( canvas );
        //テクスチャ画像の更新
        _parameter.normalMap.needsUpdate = true;
        _parameter.map.anisotropy = this.physLab.CG.renderer.getMaxAnisotropy();

        setMapParameter( _parameter.normalMap, this );
    }

    //鏡面マッピング
    if( textureFunction = parameter.specularMapTextureFunction || this.material.specularMapTextureFunction ) {

        //テクスチャ画像用のcanvas要素の取得
        var canvas = generateCanvas( textureFunction, this.material.textureWidth, this.material.textureHeight );
        //テクスチャオブジェクトの生成
        _parameter.specularMap = new THREE.Texture( canvas );
        //テクスチャ画像の更新
        _parameter.specularMap.needsUpdate = true;
        _parameter.map.anisotropy = this.physLab.CG.renderer.getMaxAnisotropy();

        setMapParameter( _parameter.specularMap, this );
    }

    //バンプマッピング
    if( textureFunction = parameter.bumpMapTextureFunction || this.material.bumpMapTextureFunction ){

        //テクスチャ画像用のcanvas要素の取得
        var canvas = generateCanvas( textureFunction, this.material.textureWidth, this.material.textureHeight );
        //テクスチャオブジェクトの生成
        _parameter.bumpMap = new THREE.Texture( canvas );
        //テクスチャ画像の更新
        _parameter.bumpMap.needsUpdate = true;
        _parameter.map.anisotropy = this.physLab.CG.renderer.getMaxAnisotropy();

        setMapParameter( _parameter.bumpMap, this );
    }

    //Surfaceクラスのテクスチャマッピングを想定
    if( this.transparentMode ){
        if( this.transparentMode.enabled ){
            _parameter.transparent = true;
            _parameter.map = new THREE.Texture( this.generateTexture() );
            _parameter.map.needsUpdate = true;
            _parameter.map.anisotropy = this.physLab.CG.renderer.getMaxAnisotropy();
        }
    }

    //材質パラメータの更新
    PHYSICS.overwriteProperty( _parameter, parameter );

    //カリングの指定
    if( _parameter.side === "Front" ) {

        //表面
        _parameter.side = THREE.FrontSide;

    } else if( _parameter.side === "Double" ) {

        //両面
        _parameter.side = THREE.DoubleSide;

    } else if( _parameter.side === "Back" ) {

        //背面
        _parameter.side = THREE.BackSide;

    } else {

        alert( "描画面指定ミス" );

    }

    //シェーディングの指定
    if( _parameter.shading === "Flat" ){

        //フラットシェーディング
        _parameter.shading = THREE.FlatShading;

    } else if( _parameter.shading === "Smooth" ) {

        //スムースシェーディング
        _parameter.shading = THREE.SmoothShading;

    } else {

        alert( "シェーディング指定ミス" );

    }

    //ブレンディングの指定
    if( _parameter.blending === "No" ){

        _parameter.blending = THREE.NoBlending;

    } else if( _parameter.blending === "Normal" ) {

        _parameter.blending = THREE.NormalBlending;

    } else if( _parameter.blending === "Additive" ) {

        _parameter.blending = THREE.AdditiveBlending;

    } else if( _parameter.blending === "Subtractive" ) {

        _parameter.blending = THREE.SubtractiveBlending;

    } else if( _parameter.blending === "Multiply" ) {

        _parameter.blending = THREE.MultiplyBlending;

    } else if( _parameter.blending === "Custom" ) {

        _parameter.blending = THREE.CustomBlending;

    }

    //頂点色の指定
    if( _parameter.vertexColors === "No" ){

        _parameter.vertexColors = THREE.NoColors;

    } else if( _parameter.vertexColors === "Vertex" ) {

        _parameter.vertexColors = THREE.VertexColors;

    } else if( _parameter.vertexColors === "Face" ) {

        _parameter.vertexColors = THREE.FaceColors;

    }

    //材質オブジェクトの宣言と生成
    if( type === "Lambert" ) {

        delete _parameter.specular;
        delete _parameter.shininess;
        delete _parameter.bumpScale;

        //ランバート反射材質
        var _material = new THREE.MeshLambertMaterial( _parameter );

    } else if( type === "Phong" ){

        //フォン反射材質
        var _material = new THREE.MeshPhongMaterial( _parameter );

    } else if( type === "Basic" ){

        delete _parameter.emissive;
        delete _parameter.specular;
        delete _parameter.shininess;
        delete _parameter.bumpScale;

        //発光材質
        var _material = new THREE.MeshBasicMaterial( _parameter );

    } else if( type === "Normal" ){

        delete _parameter.color;
        delete _parameter.emissive;
        delete _parameter.specular;
        delete _parameter.shininess;
        delete _parameter.bumpScale;

        //法線材質
        var _material = new THREE.MeshNormalMaterial( _parameter );

    } else if( type === "LineBasic" ){

        delete  _parameter.emissive;
        delete  _parameter.specular;
        delete  _parameter.shininess;
        delete  _parameter.bumpScale;
        delete  _parameter.wireframe;

        //実線発光材質
        var _material = new THREE.LineBasicMaterial( _parameter );

    } else if( type === "LineDashed" ){

        delete  _parameter.emissive;
        delete  _parameter.specular;
        delete  _parameter.shininess;
        delete  _parameter.bumpScale;
        delete  _parameter.wireframe;

        //破線発光材質専用のパラメータ
        _parameter.dashSize = ( parameter.dashSize !== undefined )?  parameter.dashSize : this.material.dashSize;
        _parameter.gapSize  = ( parameter.gapSize !== undefined )?  parameter.gapSize : this.material.gapSize;

        //破線発光材質
        var _material = new THREE.LineDashedMaterial( _parameter );


    } else {

        alert( "材質オブジェクト指定ミス" );

    }

    return _material;

}

////////////////////////////////////////////////////////////////////
// オブジェクトの生成
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.create = function( ){

    this.beforeCreate( );

    //３次元オブジェクト通し番号
    PHYSICS.PhysObject.id ++ ;
    this.id = PHYSICS.PhysObject.id;

    //３次元グラフィックスの生成
    this.create3DCG( );

    //オブジェクトの影の生成元
    this.CG.castShadow = this.material.castShadow;

    //オブジェクトに影を描画
    this.CG.receiveShadow = this.material.receiveShadow;

    //オブジェクトのシーンへの追加
    this.physLab.CG.scene.add( this.CG );

    //速度ベクトルの表示
    if( this.velocityVector.enabled ){

        //速度の大きさ
        var v = this.velocity.length( );

        if( v < 0.001 ){
            var dir = new THREE.Vector3(0,0,1);
        } else {
            var dir = this.velocity.clone( ).normalize( );
        }
        //矢印オブジェクトの生成
        this.velocityVector.CG = new THREE.ArrowHelper(
            new THREE.Vector3(0,0,1), //方向ベクトル
            this.position.clone( ),             //起点座標
            0.01,                          //長さ
            this.velocityVector.color   //色
        );
        //矢印オブジェクトのシーンへの追加
        this.physLab.CG.scene.add( this.velocityVector.CG );

    }
    //力ベクトルの表示
    if( this.accelerationVector.enabled ){

        //加速度の大きさ
        var v = this.force.length( );

        if( v < 0.001 ){
            var dir = new THREE.Vector3(0,0,1);
        } else {
            var dir = this.force.clone( ).normalize( );
        }
        //矢印オブジェクトの生成
        this.accelerationVector.CG = new THREE.ArrowHelper(
            new THREE.Vector3(0,0,1), //方向ベクトル
            this.position.clone( ),             //起点座標
            0.01,                          //長さ
            this.accelerationVector.color   //色
        );
        //矢印オブジェクトのシーンへの追加
        this.physLab.CG.scene.add( this.accelerationVector.CG );

    }
    //軌跡オブジェクトの表示
    if( this.locus.enabled ){

        //形状オブジェクトの宣言
        var geometry = new THREE.BufferGeometry();
        //アトリビュート変数の宣言
        var indexes = new Uint16Array( this.locus.maxNum ); //インデックス配列
        var positions = new Float32Array( this.locus.maxNum * 3 ); //頂点座標
        //配列の初期化
        for (var j = 0; j < indexes.length; j++ ) {
            indexes[ j ] = j;
            var k = j * 3;
            //頂点の位置座標の設定
            positions[ k ] = 0;     //x値
            positions[ k + 1 ] = 0; //y値
            positions[ k + 2 ] = 0; //z値
        }
        //アトリビュート変数の設定
        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        //頂点インデックス配列を設定
        geometry.setIndex( new THREE.BufferAttribute( indexes, 1 ) );

        //材質オブジェクトの宣言と生成
        var material = new THREE.LineBasicMaterial({ color: this.locus.color});

        //軌跡オブジェクトの作成
        this.locus.CG = new THREE.Line( geometry, material );
        //軌跡オブジェクトのシーンへの追加
        this.physLab.CG.scene.add( this.locus.CG );

        this.locus.count = 0;

    }

    //ローカル座標系の可視化
    if( this.localAxis.enabled ){

        //ローカル座標系可視化オブジェクトの作成
        this.localAxis.CG = PHYSICS.DashedAxis( this.localAxis.size, this.localAxis.dashSize, this.localAxis.gapSize, this.localAxis.colors);

        //ローカル座標系可視化オブジェクトのシーンへの追加
        this.CG.add( this.localAxis.CG );

    }

    //時間制御スライダー利用時
    if( this.physLab.timeslider.enabled ){

        //運動するオブジェクトの時系列データを取得
        if( this.dynamic || this.draggable ) {

            this.recordData = true;

            //時系列データ間引数を共通化
            this.skipRecord = this.physLab.timeslider.skipRecord;


        } else {

            this.recordData = false;

        }
    }

    //ストロボ利用時
    if( this.strobe.enabled ){

        //全てのオブジェクトの時系列データを取得
        this.recordData = true;

        this.strobe.objects = [];

        for( var j=0; j < this.strobe.maxNum; j++ ){
            this.strobe.objects[ j ] = this.clone( );

            this.strobe.objects[ j ].dynamic = false;
            this.strobe.objects[ j ].draggable = false;
            this.strobe.objects[ j ].allowDrag = false;
            this.strobe.objects[ j ].collision = false;

            this.strobe.objects[ j ].locus.enabled = false;
            this.strobe.objects[ j ].strobe.enabled = false;

            this.strobe.objects[ j ].velocityVector.enabled = this.strobe.velocityVectorEnabled;
            this.strobe.objects[ j ].velocityVector.visible = this.strobe.velocityVectorVisible;
            this.strobe.objects[ j ].accelerationVector.enabled = this.strobe.accelerationVectorEnabled;
            this.strobe.objects[ j ].accelerationVector.visible = this.strobe.accelerationVectorVisible;

            this.strobe.objects[ j ].material.transparent = this.strobe.transparent;
            this.strobe.objects[ j ].material.opacity = this.strobe.opacity;
            this.strobe.objects[ j ].material.castShadow = false;
            this.strobe.objects[ j ].material.receiveShadow = false;
            this.strobe.objects[ j ].material.depthTest = false;
            this.strobe.objects[ j ].material.depthWrite = false;

            this.strobe.objects[ j ].parent = this;

            this.physLab.objects.push( this.strobe.objects[ j ] );
        }

    }



    //ポテンシャルエネルギー３次元表示モード
    if( this.potential3DMode.enabled ){

        if( !this.potential3DMode.noGraphics ){

            this.potential3DMode.CG = new PHYSICS.Lattice({
                position: {x: 0, y: 0, z: 0},  //位置ベクトル

                n :this.potential3DMode.n,           //一辺あたりの格子数
                width : this.potential3DMode.width,  //格子の一辺の長さ
                specifyZ : {  //z値の指定
                    enabled : true,
                    function : this.potential3DMode.potentialFunction
                },
                specifyColor : {  //color値の指定
                    enabled : (this.potential3DMode.colorFunction)? true : false,
                    function : this.potential3DMode.colorFunction
                },
                resetVertices : false,     //頂点再設定の有無
                //材質オブジェクト関連パラメータ
                material : {
                    type : "LineBasic",   //発光材質 ("LineBasic" || "LineDashedMaterial")
                    color : this.potential3DMode.color,     //発光色
                    transparent :(this.potential3DMode.opacity<1)? true : false,
                    opacity: this.potential3DMode.opacity
                },
            });

            this.physLab.objects.push( this.potential3DMode.CG );

        }

    }

    //配列に初期値を代入
    this.recordDynamicData( );


    this.afterCreate( );
}

////////////////////////////////////////////////////////////////////
// ３次元グラフィックスの更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.update = function( ){

    this.beforeUpdate( );

    //非同期生成中の場合はスキップ
    if( this.asynchronous ) return;

    //位置ベクトルの指定
    this.CG.position.copy( this.position );

    if( this.offsetZ ){

        this.CG.position.z += this.offsetZ;

    }

    if( !this.noRotation ){
        //姿勢ベクトルによる回転
        this.CG.setRotationFromQuaternion( this.quaternion );
    }

    //オブジェクトの可視化
    this.CG.visible = this.visible;

    //３次元グラフィックス子要素の可視化も指定
    for( var i = 0; i < this.CG.children.length; i++ ){

        this.CG.children[i].visible = this.visible;

    }

    //ローカル座標系オブジェクト
    if( this.localAxis.enabled ){
        this.localAxis.CG.visible = this.localAxis.visible;
    }

    // ポテンシャルエネルギーオブジェクトの更新
    this.updatePotential3D( );

    //軌跡オブジェクトの更新
    this.updateLocus( );

    //速度ベクトルの更新
    this.updateVelocityVector( );

    //加速度ベクトルの更新
    this.updateAccelerationVector( );

    //バウンディングボックスの位置と姿勢の更新
    this.updateBoundingBox( );

    //ストロボ撮影の更新
    this.updateStrobe( );

    //バウンディング球の更新
    this.updateBoundingSphere( );

    this.afterUpdate( );

}

////////////////////////////////////////////////////////////////////
// ポテンシャルエネルギーオブジェクトの更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updatePotential3D = function(  ){

    if( !this.potential3DMode.enabled ) return;

    //ポテンシャルオブジェクトの位置
    var potentialPosition = this.potential3DMode.positionFunction();

    if( !this.potential3DMode.noGraphics ){

        this.potential3DMode.CG.position.copy( potentialPosition );
        this.potential3DMode.CG.visible = this.potential3DMode.visible;
    }

    //z値の更新
    this.potentialZ = this.potential3DMode.potentialFunction( this.position.x, this.position.y ) + potentialPosition.z;
    this.CG.position.z = this.potentialZ;

}


////////////////////////////////////////////////////////////////////
// 軌跡オブジェクトの更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateLocus = function( color ){

    if( !this.locus.enabled ) return ;

    color = ( color !== undefined )? color : this.locus.color;


    for( var i = this.locus.count; i < this.records.length; i++ ){

        //頂点の位置座標の設定
        this.locus.CG.geometry.attributes.position.array[ 3 * i ] =     this.records[ i ].position.x;
        this.locus.CG.geometry.attributes.position.array[ 3 * i + 1 ] = this.records[ i ].position.y;
        this.locus.CG.geometry.attributes.position.array[ 3 * i + 2 ] = this.records[ i ].position.z;


        //ポテンシャルエネルギー３次元表示時
        if( this.potential3DMode.enabled ) {

            var potentialPosition = this.potential3DMode.positionFunction();

            this.potentialZ = this.potential3DMode.potentialFunction(
                this.records[ i ].position.x,
                this.records[ i ].position.y
            );

            this.potentialZ += potentialPosition.z;
            this.locus.CG.geometry.attributes.position.array[ 3 * i + 2 ] += this.potentialZ;
        }

        //更新を実行するフラグ
        this.locus.CG.geometry.attributes.position.needsUpdate = true;
        this.locus.count++;
    }

    var end = this.locus.count;
    //時間制御スライダーの利用時
    if( this.physLab.timeslider.enabled && this.physLab.pauseFlag ) end = ( this.physLab.timeslider.m ) + 1;


    this.locus.CG.geometry.setDrawRange( 0, end );

    //色の指定
    this.locus.CG.material.color.setHex( color );


    //表示フラグ
    var flag = false;

    if( this.physLab.locusFlag == true ){

        flag = true;

    } else if(  this.physLab.locusFlag == false ){

        flag = false;

    } else if( this.physLab.locusFlag == "pause" ){

        flag = ( (this.physLab.pauseFlag && this.physLab.calculateMode == PHYSICS.RealTimeMode) || (!this.physLab.playback.on && this.physLab.calculateMode == PHYSICS.PreMode) )? true : false;

    }

    if( this.physLab.playback.enabled && this.physLab.playback.on ) {

        flag = this.physLab.playback.locusVisible;

    }

    //軌跡の表示
    this.locus.CG.visible = flag && this.locus.visible;

}

////////////////////////////////////////////////////////////////////
// 速度ベクトルの更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateVelocityVector = function( color, scale ){

    if( !this.velocityVector.enabled ) return ;

    color = ( color !== undefined )? color : this.velocityVector.color;
    scale = ( scale !== undefined )? scale : this.velocityVector.scale;

    this.velocityVector._color.set( color );

    //速度の大きさ
    var v = this.velocity.length( ) * scale;

    if( v < 0.01 ){
        v = 0.01;
        var dir = new THREE.Vector3(0,0,1);
    } else {
        var dir =this.velocity.clone( ).normalize( );
    }
    this.velocityVector.CG.setDirection( dir );

    if( v*scale < scale){
        this.velocityVector.CG.setLength( v*scale, v*scale*0.99, v*scale*0.99 );
     } else {
        this.velocityVector.CG.setLength( v*scale, this.velocityVector.headLength, this.velocityVector.headWidth );
    }

    this.velocityVector.CG.position.copy( this.CG.position );


    this.velocityVector.CG.setColor( this.velocityVector._color );


    if( this.velocityVector.startPointOffset ) this.velocityVector.CG.position.add( dir.multiplyScalar( this.radius ) );


    //表示フラグ
    var flag = false;

    //速度ベクトルの表示
    if( this.physLab.velocityVectorFlag === true ){

        flag = true;

    } else if( this.physLab.velocityVectorFlag === false ){

        flag = false;

    } else if( this.physLab.velocityVectorFlag === "pause" ){

        flag = ( (this.physLab.pauseFlag && this.physLab.calculateMode == PHYSICS.RealTimeMode) || (!this.physLab.playback.on && this.physLab.calculateMode == PHYSICS.PreMode) )? true : false;

    }

    if( this.physLab.playback.enabled && this.physLab.playback.on ) {

        flag = this.physLab.playback.velocityVectorVisible;

    }

    //子要素の可視化も指定
    for( var i = 0; i < this.velocityVector.CG.children.length; i++ ){
        this.velocityVector.CG.children[ i ].visible = flag && this.velocityVector.visible;
    }

}
////////////////////////////////////////////////////////////////////
// 加速度ベクトルの更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateAccelerationVector = function( color, scale ){

    if( !this.accelerationVector.enabled ) return ;

    color = ( color !== undefined )? color : this.accelerationVector.color;
    scale = ( scale !== undefined )? scale : this.accelerationVector.scale;

    this.accelerationVector._color.set( color );

    //速度の大きさ
    var v = this.velocity.length( ) * scale;

    if( v < 0.01 ){
        v = 0.01;
        var dir = new THREE.Vector3(0,0,1);
    } else {
        var dir =this.force.clone( ).normalize( );
    }
    this.accelerationVector.CG.setDirection( dir );

    if( v*scale < scale){
        this.accelerationVector.CG.setLength( v*scale, v*scale*0.99, v*scale*0.99 );
     } else {
        this.accelerationVector.CG.setLength( v*scale, this.accelerationVector.headLength, this.accelerationVector.headWidth );
    }

    this.accelerationVector.CG.position.copy( this.CG.position );


    this.accelerationVector.CG.setColor( this.accelerationVector._color );


    if( this.accelerationVector.startPointOffset ) this.accelerationVector.CG.position.add( dir.multiplyScalar( this.radius ) );


    //表示フラグ
    var flag = false;

    //速度ベクトルの表示
    if( this.physLab.accelerationVectorFlag === true ){

        flag = true;

    } else if( this.physLab.accelerationVectorFlag === false ){

        flag = false;

    } else if( this.physLab.accelerationVectorFlag === "pause" ){

        flag = ( (this.physLab.pauseFlag && this.physLab.calculateMode == PHYSICS.RealTimeMode) || (!this.physLab.playback.on && this.physLab.calculateMode == PHYSICS.PreMode) )? true : false;

    }

    if( this.physLab.playback.enabled && this.physLab.playback.on ) {

        flag = this.physLab.playback.accelerationVectorVisible;

    }

    if( this.physLab.step == 0 ) flag = false;

    //子要素の可視化も指定
    for( var i = 0; i < this.accelerationVector.CG.children.length; i++ ){
        this.accelerationVector.CG.children[ i ].visible = flag && this.accelerationVector.visible;
    }

}
////////////////////////////////////////////////////////////////////
// バウンディングボックスのの更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateBoundingBox = function( ){

    if( !this.draggable ) return;

    //回転前のバウンディングの中心座標をコピー
    this.boundingBox.center.copy( this.boundingBox._center );

    //行列要素の生成
    var mv = new THREE.Matrix4( ).compose(
        new THREE.Vector3( ),      //平行移動（Vector3クラス）
        this.quaternion,          //回転量（Quaternionクラス）
        new THREE.Vector3(1,1,1)  //拡大量（Vector3クラス）
    );
    //回転後の中心座標の位置ベクトル
    this.boundingBox.center.applyMatrix4( mv );


    //バウンディングボックスの位置と姿勢の更新
    this.boundingBox.CG.position.copy( this.position ).add( this.boundingBox.center ) ;
    this.boundingBox.CG.setRotationFromQuaternion( this.quaternion );

    //表示フラグ
    var flag = false;

    if( this.physLab.boundingBoxFlag == true ){

        flag = true;

    } else if( this.physLab.boundingBoxFlag == false ){

        flag = false;

    } else if( this.physLab.boundingBoxFlag == "dragg" ){

        flag = ( this.boundingBox.draggFlag )? true : false;

    }

    //バウンディングボックスの表示
    //this.boundingBox.CG.visible = flag && this.boundingBox.visible;

    if( flag && this.boundingBox.visible  ){

        this.boundingBox.CG.material.opacity = this.boundingBox.opacity;

    } else {

        this.boundingBox.CG.material.opacity = 0;
    }

    //マウスドラックに応じた速度ベクトル、加速度ベクトルの計算
    if( !this.dynamic ){

        //過去の時刻を格納
        this.velocity_1.copy( this.velocity ) ;
        //マウスドラックによる３次元オブジェクトの移動速度
        this.velocity = new THREE.Vector3( ).subVectors( this.position, this.position_1 ).divideScalar( this.physLab.dt * this.physLab.skipRendering ) ;

        //マウスドラックによる３次元オブジェクトの移動加速度
        this.a = new THREE.Vector3( ).subVectors( this.velocity, this.velocity_1 ).divideScalar( this.physLab.dt * this.physLab.skipRendering ) ;

        //過去の位置を格納
        this.position_1.copy( this.position );

    }

}

////////////////////////////////////////////////////////////////////
//ストロボ撮影の更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateStrobe = function( ){

    if( !this.strobe.enabled ) return;

    for ( var j = 0; j < this.strobe.maxNum ; j++ ){
        this.strobe.objects[ j ].visible = false;
        this.strobe.objects[ j ].velocityVector.visible = false;
        this.strobe.objects[ j ].accelerationVector.visible = false;
    }

    //表示フラグ
    var flag = false;

    if( this.physLab.strobeFlag == true ){

        flag = true;

    } else if( this.physLab.strobeFlag == false ){

        flag = false;

    } else if( this.physLab.strobeFlag == "pause" ){

        flag = ( (this.physLab.pauseFlag && this.physLab.calculateMode == PHYSICS.RealTimeMode) || (!this.physLab.playback.on && this.physLab.calculateMode == PHYSICS.PreMode) )? true : false;

    }

    if( this.physLab.playback.enabled && this.physLab.playback.on ) {

        flag = this.physLab.playback.strobeVisible;

    }

    for ( var j = 0; j < this.strobe.maxNum; j++ ){

        var m = j * this.strobe.skip;

        if( m >= this.records.length ) break;

        if( this.physLab.pauseFlag && m > this.physLab.timeslider.m ) break;

        this.strobe.objects[ j ].position.copy( this.records[ m ].position );
        this.strobe.objects[ j ].velocity.copy( this.records[ m ].velocity );
        this.strobe.objects[ j ].force.copy( this.records[ m ].force );
        this.strobe.objects[ j ].visible = flag && this.strobe.visible ;
        this.strobe.objects[ j ].velocityVector.visible = this.strobe.velocityVectorVisible;
        this.strobe.objects[ j ].accelerationVector.visible = this.strobe.accelerationVectorVisible;
    }

}


////////////////////////////////////////////////////////////////////
//バウンディング球の３次元グラフィックス更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateBoundingSphere = function( ){

    if( !this.boundingSphere.enabled ) return;

    //バウンディング球の位置の更新
    this.boundingSphere.CG.position.copy( this.position ).add( this.boundingSphere.center );
    this.boundingSphere.CG.visible = this.boundingSphere.visible;
}

////////////////////////////////////////////////////////////////////
// 位置・速度・エネルギーの時系列データの初期化
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.initDynamicData = function( ){
    //配列の初期化
    this.records.length = 0;
}

////////////////////////////////////////////////////////////////////
// 位置・速度・エネルギーの時系列データの蓄積
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.recordDynamicData = function( ){

    var flag = this.recordData;
    if( !this.recordData && this.physLab.step == 0 ) flag = true;
    if( !flag ) return;


    if( ( this.physLab.step == 0 ) || ( this.physLab.step / this.skipRecord >= this.records.length ) ){
        var step, x, y, z;

        //実時刻
        var time = this.physLab.step * this.physLab.dt;

        this.records.push({
            time : time,
            position : this.position.clone(),
            velocity : this.velocity.clone(),
            force : this.force.clone(),
            omega : this.omega.clone(),
            quaternion : this.quaternion.clone()
        });

    } else if(this.physLab.step == 1){

         this.records[0].force.copy(this.force);
    }

}

//運動データの取得
PHYSICS.PhysObject.prototype.getDynamicData = function( ){

    if( !this.recordData ) return

    var data = {};
    data.x = [];
    data.y = [];
    data.z = [];
    data.vx = [];
    data.vy = [];
    data.vz = [];


    for( var i = 0; i < this.data.x.length; i++ ){

        var time = this.data.x[ i ][ 0 ];

        data.x.push( [ time , this.data.x[ i ][ 1 ] ] );
        data.y.push( [ time , this.data.y[ i ][ 1 ] ] );
        data.z.push( [ time , this.data.z[ i ][ 1 ] ] );
        data.vx.push( [ time , this.data.vx[ i ][ 1 ] ] );
        data.vy.push( [ time , this.data.vy[ i ][ 1 ] ] );
        data.vz.push( [ time , this.data.vz[ i ][ 1 ] ] );


    }

    return data;
}


////////////////////////////////////////////////////////////////////
// 通信メソッドの定義
////////////////////////////////////////////////////////////////////

// createメソッド
PHYSICS.PhysObject.prototype.beforeCreate = function( ){
    for( var i = 0; i < this.beforeCreateFunctions.length; i++ ){
        this.beforeCreateFunctions[ i ]( this );
    }
}
PHYSICS.PhysObject.prototype.afterCreate = function( ){
    for( var i = 0; i < this.afterCreateFunctions.length; i++ ){
        this.afterCreateFunctions[ i ]( this );
    }
}
// updateメソッド
PHYSICS.PhysObject.prototype.beforeUpdate = function( ){
    for( var i = 0; i < this.beforeUpdateFunctions.length; i++ ){
        this.beforeUpdateFunctions[ i ]( this );
    }
}
PHYSICS.PhysObject.prototype.afterUpdate = function( ){
    for( var i = 0; i < this.afterUpdateFunctions.length; i++ ){
        this.afterUpdateFunctions[ i ]( this );
    }
}
// timeEvolutionメソッド
PHYSICS.PhysObject.prototype.beforeTimeEvolution = function( ){
    for( var i = 0; i < this.beforeTimeEvolutionFunctions.length; i++ ){
        this.beforeTimeEvolutionFunctions[ i ]( this );
    }
}
PHYSICS.PhysObject.prototype.afterTimeEvolution = function( ){
    for( var i = 0; i < this.afterTimeEvolutionFunctions.length; i++ ){
        this.afterTimeEvolutionFunctions[ i ]( this );
    }
}

//外部から動きを指定する関数
PHYSICS.PhysObject.prototype.dynamicFunction = function( ){
/*
    for( var i = 0; i < this.dynamicFunctions.length; i++ ){
        this.dynamicFunctions[ i ]( );
    }
*/
}

//個別に加わる力を定義
PHYSICS.PhysObject.prototype.calculateAddForces = function ( object ){
    //メモ：位置と速度に依存した力を与える場合、引数で指定したオブジェクト利用する必要がある。
    for( var i = 0; i < this.addForces.length; i++ ){
        this.force.add( this.addForces[ i ]( this, object ) );
    }
}


////////////////////////////////////////////////////////////////////
// 姿勢を表すクォータニオンを計算
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.initQuaternion = function( ){

    //デフォルトの姿勢軸ベクトル
    var hatZ = new THREE.Vector3( 0, 0, 1 );
    //デフォルトの姿勢軸からの回転角度
    var theta = Math.acos( hatZ.dot( this.axis ) );
    //姿勢軸回転用の回転軸ベクトルの生成
    var A = new THREE.Vector3( ).crossVectors( hatZ, this.axis ).normalize( );
    //姿勢軸回転用のクォータニオンの生成
    var q1 = new THREE.Quaternion( ).setFromAxisAngle( A, theta );
    //姿勢軸における回転用のクォータニオンの生成
    var q2 = new THREE.Quaternion( ).setFromAxisAngle( hatZ, this.angle );

    //姿勢を表すクォータニオン
    this.quaternion.multiplyQuaternions( q1, q2 );
}

PHYSICS.PhysObject.prototype.resetAttitude = function ( axis, angle ){

    //内部プロパティの更新
    this.axis.copy( axis ); //姿勢軸ベクトル（Vector3クラス）
    this.angle = angle;     //回転角度

     //クォータニオンの初期化
     this.initQuaternion( );
}

////////////////////////////////////////////////////////////////////
// 回転後の姿勢を表すクォータニオンを計算
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.rotation = function( axis, theta ){
    // axis : THREE.Vector3
    // theta : float

    //姿勢軸回転用のクォータニオンの生成
    var q = new THREE.Quaternion( ).setFromAxisAngle( axis, theta );

    //姿勢を表すクォータニオン
    this.quaternion.multiply( q );

}

////////////////////////////////////////////////////////////////////
// 各種ベクトルの初期化
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.initVectors = function( ){
    //配列の初期化
    this.tangents = [];
    this.vertices = [];
    this.normals  = [];

    //各平面に対するベクトルの準備
    for( var i=0; i< this.faces.length; i++ ) {
        this.tangents[i] = [];
        this.tangents[i][0] = new THREE.Vector3( );
        this.tangents[i][1] = new THREE.Vector3( );
        this.normals[i] = new THREE.Vector3( );
    }
    //頂点座標をコピー
    for( var i=0; i< this._vertices.length; i++ ) {
        this.vertices[i] = new THREE.Vector3( ).copy( this._vertices[i] );
    }
}

////////////////////////////////////////////////////////////////////
// 頂点座標の再設定
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateGeometryVertices = function(){


    for( var i=0; i<this.CG.geometry.vertices.length; i++ ){

        this.CG.geometry.vertices[ i ].copy( this._vertices[ i ] );

    }


    //面の法線ベクトルを計算
    this.CG.geometry.computeFaceNormals( );
    //面の法線ベクトルから頂点法線ベクトルの計算
    this.CG.geometry.computeVertexNormals( );

    this.CG.geometry.verticesNeedUpdate = true;
    this.CG.geometry.normalsNeedUpdate = true;


    //衝突計算用ベクトル量の更新
    this.vectorsNeedsUpdate = true;

}

////////////////////////////////////////////////////////////////////
// 頂点色の再設定
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateGeometryfacesVertexColors = function(){

    for( var i=0; i<this.CG.geometry.faces.length; i++ ){

        this.CG.geometry.faces[ i ].vertexColors[ 0 ].copy( this.colors[this.faces[i][0]] );
        this.CG.geometry.faces[ i ].vertexColors[ 1 ].copy( this.colors[this.faces[i][1]] );
        this.CG.geometry.faces[ i ].vertexColors[ 2 ].copy( this.colors[this.faces[i][2]] );

    }

    this.CG.geometry.colorsNeedUpdate = true;

}
////////////////////////////////////////////////////////////////////
// 移動・回転後の法線ベクトルと接線ベクトルを計算
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.computeVectors = function( ){

    //衝突計算を行わない３次元オブジェクトはスキップ
    if( !this.collision ) return;

    //各種ベクトル量の更新の必要性が無い場合はスキップ
    if( !this.dynamic && !this.vectorsNeedsUpdate ) return;

    //倍精度の行列要素の生成
    var mv = new THREE.Matrix4d( ).compose(
        this.position,            //平行移動（Vector3クラス）
        this.quaternion,          //回転量（Quaternionクラス）
        new THREE.Vector3(1,1,1)  //拡大量（Vector3クラス）
    );

    //移動・回転後の頂点ベクトル
    for( var i=0; i < this.vertices.length; i++ ) {

        this.vertices[i].copy( this._vertices[i] ).applyMatrix4( mv );

    }

    //各面に対する法線ベクトル接線ベクトルを計算
    for( var i=0; i < this.faces.length; i++ ){

        this.tangents[i][0].subVectors( this.vertices[ this.faces[i][1] ], this.vertices[ this.faces[i][0] ]);

        if( this instanceof PHYSICS.Polygon ) {

            this.tangents[i][1].subVectors( this.vertices[ this.faces[i][2] ], this.vertices[ this.faces[i][0] ]);

        } else  {//平面の場合（頂点数４）

            this.tangents[i][1].subVectors( this.vertices[ this.faces[i][3] ], this.vertices[ this.faces[i][0] ]);

        }

        this.normals[i].crossVectors( this.tangents[i][0], this.tangents[i][1] ).normalize( );

    }

    //円オブジェクト、円柱オブジェクトの円の中心座標、ポリゴンオブジェクトの各三角形中心座標の計算
    if( this instanceof PHYSICS.Circle || this instanceof PHYSICS.Cylinder || this instanceof PHYSICS.Polygon ){ 

        this.computeCenterPosition( );

    }

    //各種ベクトル量の更新の必要性を解除
    this.vectorsNeedsUpdate = false;
}

///////////////////////////////////////////////////////////////////////////////////////////////
//各平面の中心座標を計算
PHYSICS.PhysObject.prototype.computeCenterPosition = function( ){

    //各平面に対する中心座標を計算
    for( var i = 0; i < this.faces.length; i++ ) {

        //i番目の面の中心を保持
        this.centerPosition[i] = new THREE.Vector3( );

        //全ての座標の平均で中心を取得
        for( var j = 0; j < this.faces[i].length; j++ ){

            this.centerPosition[i].add( this.vertices[ this.faces[i][j] ] );

        }

        this.centerPosition[i].divideScalar( this.faces[i].length );

    }

}

///////////////////////////////////////////////////////////////////////////////////////////////
//各平面のバウンディング球の半径を計算
PHYSICS.PhysObject.prototype.computeFacesBoundingSphereRadius = function( ){

    //衝突計算を行わない３次元オブジェクトはスキップ
    if( !this.collision ) return;

    for( var i = 0; i < this.faces.length; i++ ) {

        var max = 0;
        for( var j = 0; j < this.faces[i].length; j++ ){

            var v = this._vertices[ this.faces[i][j] ];
            var l2 = v.distanceToSquared( this.centerPosition[i] );

            if( max < l2 ) max = l2;
        }

        this.facesBoundingSphereRadius[i] = Math.sqrt( max );
    }

}


///////////////////////////////////////////////////////////////////////////////////////////////
//形状中心座標を計算
PHYSICS.PhysObject.prototype.computeCenterOfGeometry = function( ){

    //形状中心座標の初期化
    this.centerOfGeometry = new THREE.Vector3( );

    if( this.faces.length > 0 ){

        //全表面積
        var S = 0;

        for( var i = 0; i < this.faces.length; i++ ) {

            var t1 = new THREE.Vector3( ).subVectors(
                this._vertices[ this.faces[ i ][ 1 ] ],
                this._vertices[ this.faces[ i ][ 0 ] ]
            );

            var t2 = new THREE.Vector3( ).subVectors(
                this._vertices[ this.faces[ i ][ 2 ] ],
                this._vertices[ this.faces[ i ][ 0 ] ]
            );

            //各面の面積
            var s = new THREE.Vector3( ).crossVectors( t1, t2 ).length( );

            //三角形の場合
            if( this.faces[ i ].length == 3 ) s = s / 2;

            var center = this.centerPosition[ i ].clone( );

            this.centerOfGeometry.add( center.multiplyScalar( s ) );

            S += s;

        }

        this.centerOfGeometry.divideScalar( S );

    } else {

        for( var i = 0; i < this._vertices.length; i++ ){
            this.centerOfGeometry.add( this._vertices[i] );
        }

        this.centerOfGeometry.divideScalar( this._vertices.length );

    }

}

///////////////////////////////////////////////////////////////////////////////////////////////
//頂点座標を設定
PHYSICS.PhysObject.prototype.setVertices = function( vertices ){

    //初期頂点座標の初期化
    this._vertices = [];

    if( vertices.length > 0 ){

        for( var i = 0; i < vertices.length; i++ ){
            this._vertices[i] = new THREE.Vector3( vertices[i].x, vertices[i].y, vertices[i].z );
        }

    }

}
///////////////////////////////////////////////////////////////////////////////////////////////
//面指定配列を設定
PHYSICS.PhysObject.prototype.setFaces = function( faces ){

    //面指定配列の初期化
    this.faces = [];

    if( faces.length > 0 ){

        for( var i = 0; i < faces.length; i++ ){
            //面指定インデックス
            this.faces[i] = [];

            for( var j = 0; j < faces[i].length; j++ ){
                this.faces[i][j] = faces[i][j];
            }

        }

    }

}

///////////////////////////////////////////////////////////////////////////////////////////////
//テクスチャ座標を設定
PHYSICS.PhysObject.prototype.setUvs = function( uvs ){

    if( uvs === undefined ) return;

    //テクスチャ座標配列の初期化
    this.uvs = [];

    if( uvs.length > 0 ){

        for( var i = 0; i < uvs.length; i++ ){
            this.uvs[i] = [];

            for( var j = 0; j < uvs[i].length; j++ ){
                this.uvs[i][j] = uvs[i][j];
            }

        }

    }

}


///////////////////////////////////////////////////////////////////////////////////////////////
//頂点色を設定
PHYSICS.PhysObject.prototype.setColors = function( colors ){

    //初期頂点色の初期化
    this.colors = [];

    if( colors.length > 0 ){

        for( var i = 0; i < colors.length; i++ ){

            if( colors[i].type === "RGB" || colors[i].type === undefined ){
                this.colors.push(
                    new THREE.Color( ).setRGB( colors[i].r,colors[i].g, colors[i].b )
                );
            } else if( colors[i].type === "HSL" ){
                this.colors.push(
                    new THREE.Color( ).setHSL( colors[i].h, colors[i].s, colors[i].l )
                );
            } else if( colors[i].type === "HEX" ){
                this.colors.push(
                    new THREE.Color( ).setHex( colors[i].hex )
                );
            }

        }

    }

}
///////////////////////////////////////////////////////////////////////////////////////////////
//JSONファイルの読み込み
PHYSICS.PhysObject.prototype.loadJSON = function( filePath ){
    var scope = this;

    //ローダーオブジェクト
    var loader = new THREE.JSONLoader( false );
    //データロードを実行
    loader.load(
        filePath , //ファイルパス
        function( geometry ) { //コールバック関数

            //形状オブジェクトから_verticesプロパティとfacesプロパティを与える
            scope.setVerticesAndFacesFromGeometry( geometry );
            //非同期処理の終了
            scope.asynchronous = false ;
            //３次元オブジェクトの生成
            scope.physLab.createPhysObject( scope );

        }
    );

}
///////////////////////////////////////////////////////////////////////////////////////////////
//形状オブジェクトから_verticesプロパティとfacesプロパティを与える
PHYSICS.PhysObject.prototype.setVerticesAndFacesFromGeometry = function( geometry ){
    var vertices = [];
    var faces = [];

    for( var i = 0; i < geometry.vertices.length; i++ ){

        //頂点座標を（x,y,z）→（z,x,y）へローテーション
        if( this.rotationXYZ ){

            vertices[ i ] = {
                x: geometry.vertices[ i ].z * this.polygonScale,
                y: geometry.vertices[ i ].x * this.polygonScale,
                z: geometry.vertices[ i ].y * this.polygonScale
            }

        } else {

            vertices[ i ] = {
                x: geometry.vertices[ i ].x * this.polygonScale,
                y: geometry.vertices[ i ].y * this.polygonScale,
                z: geometry.vertices[ i ].z * this.polygonScale
            }

        }

    }

    for( var i = 0; i < geometry.faces.length; i++ ){
        faces[ i ] = [
            geometry.faces[ i ].a,
            geometry.faces[ i ].b,
            geometry.faces[ i ].c
        ];
    }

    //頂点座標の指定
    this.setVertices( vertices );
    //面指定配列の指定
    this.setFaces( faces );

    //各種ベクトルの初期化
    this.initVectors( );

    //各三角形の中心座標
    this.centerPosition = [];
    //各三角形の中心座標を計算
    this.computeCenterPosition( );

    //形状中心座標
    this.centerOfGeometry = new THREE.Vector3( );
    //形状中心座標の計算
    this.computeCenterOfGeometry( );

    //各三角形のバウンディング球の半径
    this.facesBoundingSphereRadius = [];
    //各三角形のバウンディング球の半径を計算
    this.computeFacesBoundingSphereRadius( );
}


///////////////////////////////////////////////////////////////////////////////////////////////
//
PHYSICS.PhysObject.prototype.setTextureFromCanvas = function( canvas ){

    if( this.CG.material.map ) this.CG.material.map.dispose();
    this.CG.material.map = new THREE.Texture( canvas );
    this.CG.material.map.anisotropy = this.physLab.CG.renderer.getMaxAnisotropy();
    this.CG.material.map.needsUpdate = true;

}
PHYSICS.PhysObject.prototype.updateMaterialMap = function( ){
    //Surfaceクラスのテクスチャマッピングを想定
    if( this.transparentMode ){
        if( this.transparentMode.enabled ){
            this.CG.material.map.image = this.generateTexture() ;
            this.CG.material.map.needsUpdate = true;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////
// 派生クラス
////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////
// 球クラスの定義
///////////////////////////////////
PHYSICS.Sphere = function ( parameter ) {
    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //球の半径
    this.radius = parameter.radius || 1.0;

    //基底クラスのコンストラクタの実行
    PHYSICS.PhysObject.call( this, parameter );

    this.moment = parameter.moment || 2.0/5.0 * this.mass * this.radius * this.radius;
    this.moments[ 0 ] = this.moment;
    this.moments[ 1 ] = this.moment;
    this.moments[ 2 ] = this.moment;

    //シェーディング
    this.material.shading = parameter.material.shading || "Smooth";

    //形状オブジェクト
    this.geometry.type = "Sphere";

    //３次元グラフィックスパラメータ
    this.geometry.radius         = this.radius;                              //球の半径
    this.geometry.widthSegments  = parameter.geometry.widthSegments  || 20;  //y軸周りの分割数
    this.geometry.heightSegments = parameter.geometry.heightSegments || 20;  //y軸上の正の頂点から負の頂点までの分割数
    this.geometry.phiStart       = parameter.geometry.phiStart       || 0;   //y軸回転の開始角度
    this.geometry.phiLength      = parameter.geometry.phiLength      || Math.PI * 2;//y軸回転角度
    this.geometry.thetaStart     = parameter.geometry.thetaStart     || 0;    //x軸回転の開始角度
    this.geometry.thetaLength    = parameter.geometry.thetaLength    || Math.PI;    //x軸回転角度

};
PHYSICS.Sphere.prototype = Object.create( PHYSICS.PhysObject.prototype );
PHYSICS.Sphere.prototype.constructor = PHYSICS.Sphere;


///////////////////////////////////
// 軸クラスの定義
///////////////////////////////////
PHYSICS.Axis = function( parameter ){
    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //矢印のサイズ
    this.size = parameter.size || {};
    if( this.size.length === undefined ) this.size.length = 3;
    if( this.size.headLength === undefined ) this.size.headLength = 1;
    if( this.size.headWidth === undefined ) this.size.headWidth = 0.5;

    //矢印の色
    this.axisColors =  parameter.axisColors || [0xFF0000, 0x00FF00, 0x0000FF];

    //基底クラスのコンストラクタの実行
    PHYSICS.PhysObject.call( this, parameter);
}
PHYSICS.Axis.prototype = Object.create( PHYSICS.PhysObject.prototype );
PHYSICS.Axis.prototype.constructor = PHYSICS.Axis;

PHYSICS.Axis.prototype.create3DCG = function( ){
    //矢印オブジェクトの親オブジェクトの生成
    this.CG = new THREE.Object3D( );
    //x軸方向矢印オブジェクトの生成と追加
    this.CG.add(
        new THREE.ArrowHelper(
            new THREE.Vector3( 1, 0, 0 ), //方向
            new THREE.Vector3( 0, 0, 0 ), //原点
            this.size.length,             //長さ
            this.axisColors[ 0 ],         //色
            this.size.headLength,         //矢頭の長さ
            this.size.headWidth           //矢頭の幅
        )
    );
    //y軸方向矢印オブジェクトの生成と追加
    this.CG.add(
        new THREE.ArrowHelper(
            new THREE.Vector3( 0, 1, 0 ), //方向
            new THREE.Vector3( 0, 0, 0 ), //原点
            this.size.length,             //長さ
            this.axisColors[ 1 ],         //色
            this.size.headLength,         //矢頭の長さ
            this.size.headWidth           //矢頭の幅
        )
    );
    //z軸方向矢印オブジェクトの生成と追加
    this.CG.add(
        new THREE.ArrowHelper(
            new THREE.Vector3( 0, 0, 1 ), //方向
            new THREE.Vector3( 0, 0, 0 ), //原点
            this.size.length,             //長さ
            this.axisColors[ 2 ],         //色
            this.size.headLength,         //矢頭の長さ
            this.size.headWidth           //矢頭の幅
        )
    );

    //３次元オブジェクトのマウスドラック
    if( this.draggable ){

        //形状オブジェクトの宣言と生成
        var geometry = new THREE.BoxGeometry(
            this.size.length,
            this.size.length,
            this.size.length
        );

        //材質オブジェクトの宣言と生成
        var material = new THREE.MeshBasicMaterial({
            color: this.boundingBox.color,
            transparent: this.boundingBox.transparent,
            opacity: this.boundingBox.opacity,
            depthTest: false,
            depthWrite: false
        });

        //バウンディングボックスオブジェクトの生成
        this.boundingBox.CG = new THREE.Mesh( geometry, material );

        this.boundingBox._center = new THREE.Vector3(
            this.size.length/2,
            this.size.length/2,
            this.size.length/2
        );
        this.boundingBox.center = new THREE.Vector3( );


        this.boundingBox.CG.position.copy( this.position ).add( this.boundingBox._center );

        this.boundingBox.CG.visible = true;

        //バウンディングボックスオブジェクトのシーンへの追加
        this.physLab.CG.scene.add( this.boundingBox.CG );
        this.boundingBox.CG.physObject = this;
    }
}

////////////////////////////////////////////////////////////////////
// ベクトル場クラスの定義
////////////////////////////////////////////////////////////////////
PHYSICS.VectorField = function( parameter ){
    parameter = parameter || {};

    //格子点数
    this.N = parameter.N || 20;
    //格子間隔
    this.l = parameter.l || 1.0;
    //ベクトル量の大きさの最大値
    this.max = parameter.max || 1.0;

    //矢印関連パラメータ
    var ap = parameter.arrowParameter || {};
    this.arrowParameter = {
        variable : ap.variable || false,      //矢印の変化の有無
        maxLength : ( ap.maxLength !== undefined )? ap.maxLength : 1, //矢印の長さ最大値
        maxHeadLength : ( ap.maxHeadLength !== undefined )? ap.maxHeadLength : 0.3, //矢印頭部の長さの最大値
        maxHeadWidth : ( ap.maxHeadWidth !== undefined )? ap.maxHeadWidth : 0.3,    //矢印頭部の横幅の最大値
    };

    //矢印の色関連パラメータ
    var cp = parameter.colorParameter || {};
    this.colorParameter = {
        color : cp.color || 0xFFFFFF,   //矢印の色
        variable : ( cp.variable !== undefined )? cp.variable : true, //矢印の色の変化の有無
        gradation : parameter.gradation || "White", //矢印色のグラデーション 「"White", "Black", "Red", "Blue", "Green"」
        backWhite : cp.backWhite || false //背景を白色を想定するフラグ
    };

    //２次元ベクトル場（２重配列）
    this.fieldVectors = parameter.fieldVectors || [];


    //基底クラスのコンストラクタの実行
    PHYSICS.PhysObject.call( this, parameter);

    //２次元ベクトル場の初期化
    this.initVectorField();
}
PHYSICS.VectorField.prototype = Object.create( PHYSICS.PhysObject.prototype );
PHYSICS.VectorField.prototype.constructor = PHYSICS.VectorField;

PHYSICS.VectorField.prototype.create3DCG = function( ){
    //矢印オブジェクトの親オブジェクトの生成
    this.CG = new THREE.Object3D( );

    //２次元格子点上に矢印オブジェクトを配置する
    for (var i = 0; i <= this.N; i++) {
        for (var j = 0; j <= this.N; j++) {

            var nx = (-this.N / 2 + i) * this.l;
            var ny = (-this.N / 2 + j) * this.l;
            var nz = 0;

            this.CG.add(
                new THREE.ArrowHelper(
                    new THREE.Vector3( 0, 0, 1 ),    //方向
                    new THREE.Vector3( nx, ny, nz ), //原点
                    this.arrowParameter.maxLength * this.l,     //長さ
                    this.colorParameter.color,                  //色
                    this.arrowParameter.maxHeadLength * this.l, //矢頭の長さ
                    this.arrowParameter.maxHeadWidth * this.l   //矢頭の幅
                )
            );
        }
    }
}
//２次元ベクトル場を実現するために必要な初期設定を行う
PHYSICS.VectorField.prototype.initVectorField = function(){

    //ベクトル場の量の設定
    if( this.fieldVectors.length > 0 ){

        //ベクトル場を更新
        this.updateVectorField();

    } else {

        //２重配列の初期化
        for (var i = 0; i <= this.N; i++) {

            this.fieldVectors[ i ] = [];

            for (var j = 0; j <= this.N; j++) {

                this.fieldVectors[ i ][ j ] = new THREE.Vector3();

            }

        }

    }

}

//場ベクトル場の量に対する矢印オブジェクトの更新を行う
PHYSICS.VectorField.prototype.updateVectorField = function( ){

    //頂点番号
    var n = 0;
    for (var i = 0; i <= this.N; i++) {
        for (var j = 0; j <= this.N; j++) {

            //矢印オブジェクトの向きの指定
            this.CG.children[n].setDirection(
                this.fieldVectors[i][j].clone().normalize()
            );

            //矢印のサイズを変更する場合
            if( this.arrowParameter.variable ){

                //ベクトル場の量に対する矢印サイズのパラメータを取得
                var arrowParameter = this.getArrowParameter(i, j);

                //矢印オブジェクトのサイズを設定
                this.CG.children[n].setLength(
                    arrowParameter.lenght,
                    arrowParameter.headLength,
                    arrowParameter.headWidth
                );

            }

            //矢印の色を変更する場合
            if( this.colorParameter.variable ){

                //ベクトル場の量に対する矢印の色のパラメータを取得
                var color = this.getColor(i ,j);

                //矢印オブジェクトの色を設定
                this.CG.children[n].setColor( color );

            }

            n++;
        }

    }

}

//矢印オブジェクトのサイズを取得
PHYSICS.VectorField.prototype.getArrowParameter = function( i, j ){

    //ベクトル場の大きさの取得
    var strength = this.fieldVectors[i][j].length();
    //ベクトル場の大きさの最大値との比較
    if( strength > this.max ) strength = this.max;
    //ベクトル場の大きさの規格化
    strength = strength / this.max;

    //矢印オブジェクトのサイズを格納するオブジェクトの宣言
    var arrowParameter = {};
    arrowParameter.lenght     = strength * this.arrowParameter.maxLength * this.l,
    arrowParameter.headLength = strength * this.arrowParameter.maxHeadLength * this.l,
    arrowParameter.headWidth  = strength * this.arrowParameter.maxHeadWidth * this.l

    return arrowParameter;
}

//矢印オブジェクトの色を取得
PHYSICS.VectorField.prototype.getColor = function( i, j ){

    //ベクトル場の大きさの取得
    var strength = this.fieldVectors[i][j].length();
    //ベクトル場の大きさの最大値との比較
    if( strength > this.max ) strength = this.max;
    //ベクトル場の大きさの規格化
    strength = strength / this.max;

    //RGB値とする変数の宣言
    var R = 0;
    var G = 0;
    var B = 0;

    //グラデーション色に合わせてRGB値を指定
    if( this.colorParameter.gradation === "Red" ) R = strength;
    if( this.colorParameter.gradation === "Green" ) G = strength;
    if( this.colorParameter.gradation === "Blue" ) B = strength;

    //ゼロベクトルで白とする
    if( this.colorParameter.backWhite ){
        G = 1 - ( R + B );
        R = R + G;
        B = B + G;
    }

    //グラデーション色に合わせてRGB値を指定
    if( this.colorParameter.gradation === "White" ) R = G = B = strength;
    if( this.colorParameter.gradation === "Black" ) R = G = B = 1 - strength;

    return new THREE.Color(R, G, B);
}


//ベクトル場の量を設定
PHYSICS.VectorField.prototype.setVector = function( i, j, vector ){

    this.fieldVectors[i][j].x = vector.x || 0;
    this.fieldVectors[i][j].y = vector.y || 0;
    this.fieldVectors[i][j].z = vector.z || 0;

}










///////////////////////////////////
// 平面クラスの定義
///////////////////////////////////
PHYSICS.Plane = function( parameter ){

    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //横幅と縦幅
    this.width = parameter.width || 1.0;
    this.height = parameter.height || 1.0;

    //基底クラスのコンストラクタの実行
    PHYSICS.PhysObject.call( this, parameter);

    //初期頂点座標
    this._vertices[0] = new THREE.Vector3( -this.width/2, -this.height/2, 0);
    this._vertices[1] = new THREE.Vector3(  this.width/2, -this.height/2, 0);
    this._vertices[2] = new THREE.Vector3(  this.width/2,  this.height/2, 0);
    this._vertices[3] = new THREE.Vector3( -this.width/2,  this.height/2, 0);

    //面指定インデックス
    this.faces[0] = [0, 1, 2, 3];


    //３次元グラフィックスパラメータ
    this.geometry.width  = this.width;
    this.geometry.height = this.height;
    this.geometry.widthSegments  = parameter.geometry.widthSegments  || 1;  //横方向分割数
    this.geometry.heightSegments = parameter.geometry.heightSegments || 1;  //縦方向分割数

    //形状オブジェクト
    this.geometry.type = "Plane";

    //各種ベクトルの初期化
    this.initVectors( );
}
PHYSICS.Plane.prototype = Object.create( PHYSICS.PhysObject.prototype );
PHYSICS.Plane.prototype.constructor = PHYSICS.Plane;



///////////////////////////////////
// 床クラスの定義
///////////////////////////////////
PHYSICS.Floor = function( parameter ){

    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {};
    parameter.material = parameter.material || {};

    //床一辺あたりのタイルの個数
    this.n =  parameter.n || 20;

    //タイルの一辺の長さ
    this.width = parameter.width || 1.0;

    //タイルの色
    this.tileColors = parameter.tileColors || [0xCCCCCC, 0x333333];

    parameter.material.color = 0xffffff;
    parameter.material.mapTexture = this.generateFloorTextureDataURL(),
    parameter.material.mapWrapT = "RepeatWrapping",
    parameter.material.mapWrapS = "RepeatWrapping",
    parameter.material.mapRepeat = {s:this.n/2, t:this.n/2},

    //基底クラスの継承
    PHYSICS.Plane.call( this, parameter );

}
PHYSICS.Floor.prototype = Object.create( PHYSICS.Plane.prototype );
PHYSICS.Floor.prototype.constructor = PHYSICS.Floor;



////////////////////////////////////////////////////////////////
// 床テクスチャ生成用のcanvas要素生成関数
////////////////////////////////////////////////////////////////
PHYSICS.Floor.prototype.generateFloorTextureDataURL = function() {
    //canvas要素の生成
    var canvas = document.createElement('canvas');
    //canvas要素のサイズ
    canvas.width = 256;  //横幅
    canvas.height = 256; //縦幅
    //コンテキストの取得
    var context = canvas.getContext('2d');

    var n = 2;
    var colors = [];
    colors[0] = "#" + this.tileColors[0].toString(16);
    colors[1] = "#" + this.tileColors[1].toString(16);

    colors[0].replace("0x" , "");
    colors[1].replace("0x" , "");

    for ( var i = 0; i < n; i++ ) {
        for ( var j = 0; j < n; j++ ) {

            context.beginPath();
            context.rect( i*canvas.width/n, j*canvas.height/n, canvas.width/n, canvas.height/n );
            context.closePath();
            var m = Math.abs( i + j ) % colors.length;
            //塗りの設定
            context.fillStyle = colors[m]; //塗りつぶし色の指定
            context.fill();                //塗りつぶしの実行

        }
    }
    var dataUrl = canvas.toDataURL("image/png");
    return dataUrl;
}

///////////////////////////////////
// 立方体クラスの定義
///////////////////////////////////
PHYSICS.Cube = function( parameter ){

    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //横幅と縦幅と奥行き
    this.width  = parameter.width || 1;  //x方向
    this.depth  = parameter.depth || 1;  //y方向
    this.height = parameter.height || 1; //z方向

    //Planeクラスのコンストラクタの実行
    PHYSICS.Plane.call( this, parameter);

    this.moments[ 0 ] = 1/12 * ( this.depth * this.depth + this.height * this.height ) * this.mass;
    this.moments[ 1 ] = 1/12 * ( this.width * this.width + this.height * this.height ) * this.mass;
    this.moments[ 2 ] = 1/12 * ( this.width * this.width + this.depth  * this.depth )  * this.mass;

    //初期頂点座標
    this._vertices[0] = new THREE.Vector3(-this.width/2, -this.depth/2,  this.height/2);
    this._vertices[1] = new THREE.Vector3( this.width/2, -this.depth/2,  this.height/2);
    this._vertices[2] = new THREE.Vector3( this.width/2,  this.depth/2,  this.height/2);
    this._vertices[3] = new THREE.Vector3(-this.width/2,  this.depth/2,  this.height/2);

    this._vertices[4] = new THREE.Vector3(-this.width/2, -this.depth/2, -this.height/2);
    this._vertices[5] = new THREE.Vector3( this.width/2, -this.depth/2, -this.height/2);
    this._vertices[6] = new THREE.Vector3( this.width/2,  this.depth/2, -this.height/2);
    this._vertices[7] = new THREE.Vector3(-this.width/2,  this.depth/2, -this.height/2);

    //面指定インデックス
    this.faces[0] = [0,1,2,3];
    this.faces[1] = [4,7,6,5];
    this.faces[2] = [3,7,4,0];
    this.faces[3] = [1,5,6,2];
    this.faces[4] = [0,4,5,1];
    this.faces[5] = [2,6,7,3];

    //形状オブジェクト
    this.geometry.type =  "Cube";

    //３次元グラフィックスパラメータ
    this.geometry.width = this.width;    //立方体の横幅  （x軸方向）
    this.geometry.depth = this.depth;    //立方体の奥行き （y軸方向）
    this.geometry.height = this.height;  //立方体の高さ   （z軸方向）
    this.geometry.widthSegments  =  parameter.geometry.widthSegments  || 1; //横方向分割数
    this.geometry.heightSegments =  parameter.geometry.heightSegments || 1; //縦方向分割数
    this.geometry.depthSegments  =  parameter.geometry.depthSegments  || 1; //奥行き方向分割数

//以下結合された衝突力を計算する際にとりあえず利用する
    this.moment = 1;
    this.radius = 1;

    //各種ベクトルの初期化
    this.initVectors( );
}
PHYSICS.Cube.prototype = Object.create( PHYSICS.Plane.prototype );
PHYSICS.Cube.prototype.constructor = PHYSICS.Cube;

PHYSICS.Box = PHYSICS.Cube;

///////////////////////////////////
// 点クラスの定義
///////////////////////////////////
PHYSICS.Point = function( parameter ){

    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //球の半径
    this.radius = parameter.radius = ( parameter.radius !== undefined )? parameter.radius : 0.01;


    //Sphereクラスのコンストラクタの実行
    PHYSICS.Sphere.call( this, parameter);

    //材質オブジェクト
    this.material.type = ( parameter.material.type  !== undefined )? parameter.material.type  : "Basic";

    //形状オブジェクト
    this.geometry.type = "Sphere";
    //３次元グラフィックスパラメータ
    this.geometry.radius         = this.radius;                                       //球の半径
    this.geometry.widthSegments  = parameter.geometry.widthSegments  || 20;           //y軸周りの分割数
    this.geometry.heightSegments = parameter.geometry.heightSegments || 20;           //y軸上の正の頂点から負の頂点までの分割数
    this.geometry.phiStart       = parameter.geometry.phiStart       || 0;            //y軸回転の開始角度
    this.geometry.phiLength      = parameter.geometry.phiLength      || Math.PI * 2;  //y軸回転角度
    this.geometry.thetaStart     = parameter.geometry.thetaStart     || 0;            //x軸回転の開始角度
    this.geometry.thetaLength    = parameter.geometry.thetaLength    || Math.PI;      //x軸回転角度

}
PHYSICS.Point.prototype = Object.create( PHYSICS.Sphere.prototype );
PHYSICS.Point.prototype.constructor = PHYSICS.Point;

///////////////////////////////////
// 円クラスの定義
///////////////////////////////////
PHYSICS.Circle = function( parameter ){

    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //円の半径
    this.radius = ( parameter.radius !== undefined )? parameter.radius : 1.0;
    //３次元グラフィックスパラメータ
    this.segments  = ( parameter.segments !== undefined )? parameter.segments : 40;

    //Planeクラスのコンストラクタの実行
    PHYSICS.Plane.call( this, parameter);

    //初期頂点座標
    this._vertices[0] = new THREE.Vector3( -this.radius, -this.radius, 0);
    this._vertices[1] = new THREE.Vector3(  this.radius, -this.radius, 0);
    this._vertices[2] = new THREE.Vector3(  this.radius,  this.radius, 0);
    this._vertices[3] = new THREE.Vector3( -this.radius,  this.radius, 0);

    //面指定インデックス
    this.faces[0] = [0, 1, 2, 3];

    //形状オブジェクト
    this.geometry.type = "Circle"
    //３次元グラフィックスパラメータ
    this.geometry.radius = this.radius;      //円の半径
    this.geometry.segments = this.segments;  //円の分割数
    this.geometry.thetaStart = 0;            //円弧の開始角度
    this.geometry.thetaLength = 2* Math.PI;  //円弧の終了角度

    //各種ベクトルの初期化
    this.initVectors( );

    //円の中心座標
    this.centerPosition = [];
    //円の中心座標を計算
    this.computeCenterPosition( );

}
PHYSICS.Circle.prototype = Object.create( PHYSICS.Plane.prototype );
PHYSICS.Circle.prototype.constructor = PHYSICS.Circle;


///////////////////////////////////
// 円柱クラスの定義
///////////////////////////////////
PHYSICS.Cylinder = function( parameter ){

    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //円柱の高さ
    this.height = ( parameter.height !== undefined)? parameter.height : 1.0;
    //上円の半径
    this.radiusTop = ( parameter.radiusTop !== undefined )? parameter.radiusTop : 1.0;
    //下円の半径
    this.radiusBottom = ( parameter.radiusBottom !== undefined )? parameter.radiusBottom : 1.0;
    //上下円の開閉
    this.openEnded = ( parameter.openEnded !== undefined )? parameter.openEnded : false;

    //円柱の上向きを変更
    this.rotationXYZ = ( parameter.rotationXYZ !== undefined )? parameter.rotationXYZ : false;

    //基底クラスのコンストラクタの実行
    PHYSICS.PhysObject.call( this, parameter);

    //３次元グラフィックスパラメータ
    this.material.shading = parameter.material.shading || "Smooth";


    if( !this.rotationXYZ ){

        //初期頂点座標
        this._vertices[0] = new THREE.Vector3(-this.radiusTop, this.height/2, -this.radiusTop);
        this._vertices[1] = new THREE.Vector3( this.radiusTop, this.height/2, -this.radiusTop);
        this._vertices[2] = new THREE.Vector3( this.radiusTop, this.height/2,  this.radiusTop);
        this._vertices[3] = new THREE.Vector3(-this.radiusTop, this.height/2,  this.radiusTop);    
        this._vertices[4] = new THREE.Vector3(-this.radiusBottom, -this.height/2, -this.radiusBottom);
        this._vertices[5] = new THREE.Vector3( this.radiusBottom, -this.height/2, -this.radiusBottom);
        this._vertices[6] = new THREE.Vector3( this.radiusBottom, -this.height/2,  this.radiusBottom);
        this._vertices[7] = new THREE.Vector3(-this.radiusBottom, -this.height/2,  this.radiusBottom);

    } else {
//メモ
//geometry.rotateX(Math.PI/2);等で初期姿勢変更可能

        //初期頂点座標
        this._vertices[0] = new THREE.Vector3(-this.radiusTop, -this.radiusTop, this.height/2);
        this._vertices[1] = new THREE.Vector3( this.radiusTop, -this.radiusTop, this.height/2);
        this._vertices[2] = new THREE.Vector3( this.radiusTop,  this.radiusTop, this.height/2);
        this._vertices[3] = new THREE.Vector3(-this.radiusTop,  this.radiusTop, this.height/2);    
        this._vertices[4] = new THREE.Vector3(-this.radiusBottom, -this.radiusBottom, -this.height/2);
        this._vertices[5] = new THREE.Vector3( this.radiusBottom, -this.radiusBottom, -this.height/2);
        this._vertices[6] = new THREE.Vector3( this.radiusBottom,  this.radiusBottom, -this.height/2);
        this._vertices[7] = new THREE.Vector3(-this.radiusBottom,  this.radiusBottom, -this.height/2);

    }


    //面指定インデックス
    this.faces[0] = [0,1,2,3];
    this.faces[1] = [4,7,6,5];

    //形状オブジェクト
    this.geometry.type = "Cylinder"; 
    //３次元グラフィックスパラメータ
    this.geometry.radiusTop = this.radiusTop ;      //円柱の上の円の半径
    this.geometry.radiusBottom = this.radiusBottom; //円柱の下の円の半径
    this.geometry.height = this.height;             //円柱の高さ
    this.geometry.openEnded      = this.openEnded;  //筒状
    this.geometry.radialSegments = parameter.radialSegments || 40; //円の分割数
    this.geometry.heightSegments = parameter.heightSegments || 1,  //円の高さ方向の分割数

    //各種ベクトルの初期化
    this.initVectors( );

    //円の中心座標（要素番号：0→上円,1→下円）
    this.centerPosition = [];
    //円の中心座標を計算
    this.computeCenterPosition( );
}
PHYSICS.Cylinder.prototype = Object.create( PHYSICS.PhysObject.prototype );
PHYSICS.Cylinder.prototype.constructor = PHYSICS.Cylinder;


//円柱の形状と姿勢を設定するメソッド
PHYSICS.Cylinder.prototype.setBottomToTop = function ( bottom, top ){

    //円柱オブジェクトの位置ベクトル
    this.position.copy(
        new THREE.Vector3( ).addVectors( bottom, top ).divideScalar( 2 )
    );

    //円柱オブジェクトの底面中心から上面中心へ向かうベクトル
    var L = new THREE.Vector3( ).subVectors( top, bottom );

    //ばねオブジェクトの姿勢を指定
    this.resetAttitude(
        L.normalize( ), //姿勢軸ベクトル
        0               //回転角度
    );
}

///////////////////////////////////
// ポリゴンクラスの定義
///////////////////////////////////
PHYSICS.Polygon = function( parameter ){
    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {};
    parameter.material = parameter.material || {};

    //3次元オブジェクトの形状中心と基準点とを一致させるための頂点座標の再計算実行の有無
    this.resetVertices = parameter.resetVertices || false;

    //JSONファイルパス
    this.loadJSONFilePath = parameter.loadJSONFilePath;
    //頂点座標のスケール
    this.polygonScale = parameter.polygonScale || 1;
    //頂点座標を（x,y,z）→（z,x,y）へローテーション
    this.rotationXYZ = ( parameter.rotationXYZ !== undefined )? parameter.rotationXYZ: false;

    //Planeクラスのコンストラクタを継承
    PHYSICS.Plane.call( this, parameter );

    parameter.vertices = parameter.vertices || [
        { x : -5, y :  0, z : 0 },
        { x :  0, y : -5, z : 0 },
        { x :  0, y :  5, z : 0 }
    ];
    parameter.faces = parameter.faces || [
        [ 0, 1, 2 ]
    ];

    //頂点座標の指定
    this.setVertices( parameter.vertices );
    //面指定配列の指定
    this.setFaces( parameter.faces );
    //テクスチャ座標の指定
    this.setUvs( parameter.uvs );


    //形状オブジェクト
    this.geometry.type = "Polygon";

    //JSONファイルが指定されている場合
    if( parameter.loadJSONFilePath ){
        //非同期フラグ
        this.asynchronous = true;
        //JSONファイルの読み込み
        this.loadJSON( this.loadJSONFilePath );
    }

    //移動・回転後の頂点座標
    this.vertices = [];
    //各種ベクトルの初期化
    this.initVectors( );

    //頂点色の指定
    if( this.material.vertexColors ){

        this.setColors( parameter.colors );

    }

    //各面の中心座標
    this.centerPosition = [];
    //三角形の中心座標を計算
    this.computeCenterPosition( );

    //形状中心座標
    this.centerOfGeometry = new THREE.Vector3( );
    //形状中心座標の計算
    this.computeCenterOfGeometry( );

    //各面のバウンディング球の半径
    this.facesBoundingSphereRadius = [];
    this.computeFacesBoundingSphereRadius( );

}
PHYSICS.Polygon.prototype = Object.create( PHYSICS.Plane.prototype );
PHYSICS.Polygon.prototype.constructor = PHYSICS.Polygon;

///////////////////////////////////
// Surfaceクラスの定義
///////////////////////////////////
PHYSICS.Surface = function( parameter ){
    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {};
    parameter.material = parameter.material || {};
    parameter.specifyZ = parameter.specifyZ || {};
    parameter.specifyColor = parameter.specifyColor || {};
    parameter.transparentMode = parameter.transparentMode || {};

    //一辺あたりの格子数
    this.n =  parameter.n || 100;

    //格子の一辺の長さ
    this.width = parameter.width || 0.5;

    //透明モードの設定（テクスチャマッピングを利用）
    this.transparentMode = {
        enabled : parameter.transparentMode.enabled || false,
        canvasWidth : parameter.transparentMode.canvasWidth || 256,
        canvasHeight : parameter.transparentMode.canvasWidth || 256
    }

    //z値の指定
    this.specifyZ = {
        enabled : parameter.specifyZ.enabled || false,
        function : parameter.specifyZ.function,
    };
    //color値の指定
    this.specifyColor = {
        enabled : parameter.specifyColor.enabled || false,
        function : parameter.specifyColor.function,
    };


    //初期頂点座標と面指定配列の初期化
    parameter.vertices = [];
    parameter.faces = [];
    parameter.colors = [];

    for ( var i = 0; i <= this.n; i++ ) {
        for ( var j = 0; j <= this.n; j++ ) {
            var x = ( -this.n / 2 + i ) * this.width;
            var y = ( -this.n / 2 + j ) * this.width;
            //初期条件を与える
            var z = 0;

            if( this.specifyZ.enabled ){
                z = this.specifyZ.function( x, y );
            } else {
                z = 0;
            }

            //頂点座標データの追加
            parameter.vertices.push( new THREE.Vector3( x, y, z ) );

            //頂点色の指定
            if( this.specifyColor.enabled && !this.transparentMode.enabled ) {
                parameter.material.vertexColors = "Vertex";
                parameter.colors.push( this.specifyColor.function( x, y, z ) );
            }
        }
    }

    for ( var i = 0; i < this.n; i++ ) {
        for ( var j = 0; j < this.n; j++ ) {
            var ii = ( this.n + 1 ) * i + j;
            //面指定用頂点インデックスを追加
            parameter.faces.push( [ ii, ii + ( this.n + 1 ), ii + ( this.n + 1 ) + 1 ] );
            parameter.faces.push( [ ii, ii + ( this.n + 1 ) + 1, ii + 1 ] );

        }
    }

    //テクスチャマッピング用のテクスチャ座標の設定
    if( this.transparentMode.enabled ){
        parameter.uvs = [];
        parameter.material.vertexColors = false;
        var L = this.n * this.width;
        for ( var i = 0; i < parameter.faces.length; i++ ) {
            var v1 = parameter.vertices[ parameter.faces[i][0] ];
            var v2 = parameter.vertices[ parameter.faces[i][1] ];
            var v3 = parameter.vertices[ parameter.faces[i][2] ];

            parameter.uvs.push( [
                new THREE.Vector2( (v1.x + L/2)/L , (v1.y + L/2)/L ),
                new THREE.Vector2( (v2.x + L/2)/L , (v2.y + L/2)/L ),
                new THREE.Vector2( (v3.x + L/2)/L , (v3.y + L/2)/L )
            ] )
        }

        //以下、テクスチャマッピング用canvas要素の準備

        //canvas要素の生成
        this.canvas = document.createElement('canvas');
        //canvas要素のサイズ
        this.canvas.width = this.transparentMode.canvasWidth;   //横幅
        this.canvas.height = this.transparentMode.canvasHeight; //縦幅
        //コンテキストの取得
        this.canvas.context = this.canvas.getContext('2d');

        //ビットマップデータのRGBAデータ格納配列
        this.bitmapData = [];

    }

    //シェーディング
    parameter.material.shading = parameter.material.shading || "Smooth";


    //Polygonクラスのコンストラクタを実行
    PHYSICS.Polygon.call( this, parameter );

    //形状オブジェクト
    this.geometry.type = "Surface";

    //各種ベクトルの初期化
    this.initVectors( );

    //三角形の中心座標を計算
    this.computeCenterPosition( );

}
PHYSICS.Surface.prototype = Object.create( PHYSICS.Polygon.prototype );
PHYSICS.Surface.prototype.constructor = PHYSICS.Surface;

//頂点座標の更新
PHYSICS.Surface.prototype.updateVertices = function( parameter ){

    var n = 0;
    for ( var i = 0; i <= this.n; i++ ) {
        for ( var j = 0; j <= this.n; j++ ) {
            var x = ( -this.n / 2 + i ) * this.width;
            var y = ( -this.n / 2 + j ) * this.width;
            //初期条件を与える
            var z = 0;

            if( this.specifyZ.enabled ){
                z = this.specifyZ.function( x, y, parameter );
            } else {
                z = 0;
            }

            //頂点座標データの追加
            this._vertices[ n ].set( x, y, z );


            //頂点色の指定
            if( this.specifyColor.enabled && !this.transparentMode.enabled ) {
                var rgb = this.specifyColor.function( x, y, z, parameter );
                this.colors[ n ].setRGB( rgb.r, rgb.g, rgb.b );
            }

            n++;
        }
    }

    this.updateGeometryVertices();

    if( this.transparentMode.enabled ){

        this.updateMaterialMap();

    } else {

        if( this.material.vertexColors == "Vertex"){
            this.updateGeometryfacesVertexColors();
        }

    }

}
PHYSICS.Surface.prototype.generateTexture = function( parameter ) {
    //RGBAデータ格納配列への値の代入
    for ( var t = 0; t < this.canvas.height; t++ ) {
        for ( var s = 0; s < this.canvas.width; s++ ) {

            var index = ( t * this.canvas.width + s ) * 4; //各ピクセルの先頭を与えるインデクス番号

            var x = (s - this.canvas.width / 2 ) / this.canvas.width * this.n * this.width;
            var y = (t - this.canvas.height / 2 ) / this.canvas.height * this.n * this.width;

            var color = this.specifyColor.function( x, y, 0, parameter );

            //ビットマップデータのRGBAデータ
            this.bitmapData[index + 0] = 255 * color.r; //R値
            this.bitmapData[index + 1] = 255 * color.g; //G値
            this.bitmapData[index + 2] = 255 * color.b; //B値
            this.bitmapData[index + 3] = 255 * color.a; //A値
        }
    }

    //イメージデータオブジェクトの生成
    var imageData = this.canvas.context.createImageData(this.canvas.width, this.canvas.height);
    for ( var i = 0; i < this.canvas.width * this.canvas.height * 4; i++ ) {
        imageData.data[i] = this.bitmapData[i]; //配列のコピー
    }
    //イメージデータオブジェクトからcanvasに描画する
    this.canvas.context.putImageData(imageData, 0, 0);
    return this.canvas ;
}








///////////////////////////////////
// 地球クラスの定義
///////////////////////////////////
PHYSICS.Earth = function ( parameter ) {

    parameter.cloud = parameter.cloud || {};

    this.cloud = {
        mapTexture : parameter.cloud.mapTexture,
        angularVelocity : parameter.cloud.angularVelocity || Math.PI/5000,
    }

    //Sphereクラスのコンストラクタを実行
    PHYSICS.Sphere.call( this, parameter );

    //外部通信関数へ２つのメソッドを追加
    this.afterCreateFunctions.push( this.createCloud.bind( this ) );
    this.afterUpdateFunctions.push( this.cloudRotation.bind( this ) );

};
PHYSICS.Earth.prototype = Object.create( PHYSICS.Sphere.prototype );
PHYSICS.Earth.prototype.constructor = PHYSICS.Earth;

//雲オブジェクトの生成
PHYSICS.Earth.prototype.createCloud = function (  ){

    //雲テクスチャが適用されていない場合は終了
    if( !this.cloud.mapTexture ) return;

    //地球本体の大きさを縮める
    this.CG.scale.set( 0.95, 0.95, 0.95 );

    //形状オブジェクトの生成
    var geometry = this.getGeometry( );

    //材質オブジェクトのパラメータ
    var parameter = {
        mapTexture : this.cloud.mapTexture,
        normalMapTexture : null,
        specularMapTexture : null,
        transparent: true,
        normalMap: null,
        specularMap : null,
    }; 
    //材質オブジェクトの生成
    var material = this.getMaterial ( "Lambert",  parameter );
    //雲オブジェクトの生成
    this.cloud.CG = new THREE.Mesh( geometry, material );
    //雲オブジェクトの大きさを若干大きく（干渉を防ぐため）
    this.cloud.CG.scale.set( 1.01, 1.01, 1.01 );
    //地球オブジェクトへ追加
    this.CG.add( this.cloud.CG );

};
//雲の回転
PHYSICS.Earth.prototype.cloudRotation = function ( ){

    //雲テクスチャが適用されていない場合は終了
    if( !this.cloud.mapTexture ) return;

    //雲の回転
    this.cloud.CG.rotation.z += this.cloud.angularVelocity;

};




///////////////////////////////////
// ばねクラスの定義
///////////////////////////////////
PHYSICS.Spring = function( parameter ){
    parameter = parameter || {};

    this.radius          = parameter.radius          || 1;   //ばねの半径
    this.tube            = parameter.tube            || 0.2; //管の半径
    this.length          = parameter.length          || 5;   //ばねの長さ
    this.windingNumber   = parameter.windingNumber   || 10;  //ばねの巻き数
    this.radialSegments  = parameter.radialSegments  || 10;  //外周の分割数
    this.tubularSegments = parameter.tubularSegments || 10;  //管周の分割数

    ///////////////////////////////////
    //円柱オブジェクトのパラメータ
    ///////////////////////////////////

    //円柱の高さ
    parameter.height = this.length + this.tube * 2 ;
    //上円の半径
    parameter.radiusTop = this.radius + this.tube;
    //下円の半径
    parameter.radiusBottom = this.radius + this.tube;
    //上下円の開閉
    parameter.openEnded = false;

    //上向き
    parameter.rotationXYZ = true;

    //Cylinderクラスを継承
    PHYSICS.Cylinder.call( this, parameter );

    //ばねオブジェクト用にプロパティの上書き
    this.geometry.type = "Spring";
    this.rotationXYZ = false;

}
PHYSICS.Spring.prototype = Object.create( PHYSICS.Cylinder.prototype );
PHYSICS.Spring.prototype.constructor = PHYSICS.Spring;


//ばねの形状と姿勢を設定するメソッド
PHYSICS.Spring.prototype.setSpringBottomToTop = function ( bottom, top ){

    //ばねオブジェクトの位置ベクトル
    this.position.copy(
        new THREE.Vector3( ).addVectors( bottom, top ).divideScalar( 2 )
    );

    //ばねオブジェクトの底面中心から上面中心へ向かうベクトル
    var L = new THREE.Vector3( ).subVectors( top, bottom );

    //ばねオブジェクトの長さを再設定
    this.length = L.length( );

    //ばねオブジェクトの姿勢を指定
    this.resetAttitude(
        L.normalize( ), //姿勢軸ベクトル
        0              //回転角度
    );

    //ばねの形状オブジェクトの更新
    this.CG.geometry.setSpringBottomToTop( bottom, top );

    /////////////////////////////
    //以下衝突判定に必要なパラメータの再設定

    //円柱の高さ
    this.height = this.length + this.tube * 2 ;
    //上円の半径
    this.radiusTop = this.radius + this.tube;
    //下円の半径
    this.radiusBottom = this.radius + this.tube;
    //初期頂点座標の設定
    this._vertices[0] = new THREE.Vector3(-this.radiusTop, -this.radiusTop, this.height/2);
    this._vertices[1] = new THREE.Vector3( this.radiusTop, -this.radiusTop, this.height/2);
    this._vertices[2] = new THREE.Vector3( this.radiusTop,  this.radiusTop, this.height/2);
    this._vertices[3] = new THREE.Vector3(-this.radiusTop,  this.radiusTop, this.height/2);
    this._vertices[4] = new THREE.Vector3(-this.radiusBottom, -this.radiusBottom, -this.height/2);
    this._vertices[5] = new THREE.Vector3( this.radiusBottom, -this.radiusBottom, -this.height/2);
    this._vertices[6] = new THREE.Vector3( this.radiusBottom,  this.radiusBottom, -this.height/2);
    this._vertices[7] = new THREE.Vector3(-this.radiusBottom,  this.radiusBottom, -this.height/2);

    //衝突計算に必要な各種ベクトル量の再計算
    this.vectorsNeedsUpdate = true;

}



///////////////////////////////////
// 線クラスの定義
///////////////////////////////////
PHYSICS.Line = function( parameter ){

    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}
    parameter.vertices = parameter.vertices || [
        { x : 0, y :  0, z : 0 },
        { x : 0, y : -3, z : 5 },
        { x : 0, y :  3, z : 5 },
        { x : 0, y :  0, z : 0 }
    ];
    parameter.colors = parameter.colors || [];
    parameter.spline = parameter.spline || {};
    parameter.parametricFunction = parameter.parametricFunction || {};

    //線分プロパティ
    this.segments = parameter.segments || false;

    //スプライン補間のプロパティ
    this.spline = {
        enabled : parameter.spline.enabled || false,  //利用の有無
        pointNum : parameter.spline.pointNum || 0,    //補間点数
    };

    //媒介変数関数のプロパティ
    this.parametricFunction = parameter.parametricFunction || {};

    //頂点座標を格納する配列をcopyPropertyListプロパティに追加するためにここで宣言。
    this.vertices = [];
    this.colors = [];

    //3次元オブジェクトの形状中心と基準点とを一致させるための頂点座標の再計算実行の有無
    this.resetVertices = parameter.resetVertices || false;

    //基底クラスのコンストラクタを実行
    PHYSICS.PhysObject.call( this, parameter);

    //媒介変数関数の必須プロパティの指定
    PHYSICS.overwriteProperty ( this.parametricFunction , {
        enabled : parameter.parametricFunction.enabled || false,            //利用の有無
        pointNum : parameter.parametricFunction.pointNum || 100,            //頂点数
        theta : parameter.parametricFunction.theta || { min : 0, max : 1 }, //媒介変数の区間
        position : parameter.parametricFunction.position || function( _this, theta ){ return {x:0, y:0, z:0} },        //頂点座標を指定する媒介変数関数
        color : parameter.parametricFunction.color || function( _this, theta ){ return { type:"RGB", r:0, g:0, b:0} }, //頂点色を指定する媒介変数関数
    });

    //媒介変数関数利用の有無を検証
    if( this.parametricFunction.enabled ){

        //媒介変数関数を用いて頂点座標・頂点色を計算
        this.computeVerticesFromParametricFunction( );

    } else {

        //スプライン補間の有無を検証
        if( this.spline.enabled ){

            //スプライン補間を用いて頂点座標・頂点色を計算
            this.computeVerticesFromSpline( parameter.vertices, parameter.colors );

        } else {

            //頂点座標の設定
            this.setVertices( parameter.vertices );

            //頂点色の利用時
            if( this.material.vertexColors ){

                //頂点色の設定
                this.setColors( parameter.colors );

            }

        }

    }


    //形状中心座標を計算
    this.computeCenterOfGeometry( );


    //形状オブジェクト
    this.geometry.type = "Line";
    //３次元グラフィックスパラメータ
    this.material.type =  parameter.material.type || "LineBasic"; //("LineBasic" || "LineDashedMaterial")
    this.material.dashSize =  parameter.material.dashSize || 0.2; //破線の実線部分の長さ
    this.material.gapSize =  parameter.material.gapSize || 0.2;   //破線の空白部分の長さ

    //各種ベクトルの初期化
    this.initVectors( );

}
PHYSICS.Line.prototype = Object.create( PHYSICS.PhysObject.prototype );
PHYSICS.Line.prototype.constructor = PHYSICS.Line;

//媒介変数関数による頂点座標の計算
PHYSICS.Line.prototype.computeVerticesFromParametricFunction = function( ){

    var vertices = [];
    var N = this.parametricFunction.pointNum;
    var min = this.parametricFunction.theta.min;
    var max = this.parametricFunction.theta.max;
    for ( var i = 0; i <= N; i++ ) {
        var theta = min + ( max - min ) * i/N;
        vertices.push( this.parametricFunction.position( this.parametricFunction, theta ) );
    }

    //頂点座標の指定
    this.setVertices( vertices );

    //頂点色の利用時
    if( this.material.vertexColors ){

        var colors = []
        for ( var i = 0; i <= N; i++ ) {
            var theta = min + ( max - min ) * i/N;
            colors.push( this.parametricFunction.color( this.parametricFunction, theta ) );
        }

        //頂点色の設定
        this.setColors( colors );

    }

}

//スプライン補間による頂点座標の計算
PHYSICS.Line.prototype.computeVerticesFromSpline = function( _vertices, _colors ){

    //スプラインオブジェクトの生成
    this.spline.object = new THREE.Spline( _vertices );

    var vertices = [];
    var N = this.spline.pointNum + _vertices.length - 1;
    for ( var i = 0; i <= N; i++ ) {
        //規格化距離
        var l = i / N;
        //補完点の取得
        var position = this.spline.object.getPoint(l);

        //補完点を頂点座標データとして追加
        vertices.push( { x : position.x, y : position.y, z : position.z } );
    }
    //頂点座標の指定
    this.setVertices( vertices );


    //頂点色の指定
    if( this.material.vertexColors ){

        var color2vertex = [];
        for( var i = 0; i < _colors.length; i++ ){

            if( _colors[i].type === "RGB" || _colors[i].type === undefined ){
                var c = new THREE.Color( ).setRGB( _colors[i].r, _colors[i].g, _colors[i].b );
            } else if( _colors[i].type === "HSL" ){
                var c = new THREE.Color( ).setHSL( _colors[i].h, _colors[i].s, _colors[i].l );
            } else if( _colors[i].type === "HEX" ){
                var c = new THREE.Color( ).setHex( _colors[i].hex );
            }
            color2vertex.push( { x: c.r, y: c.g, z:c.b } );
        }

        //スプラインオブジェクトの生成
        var colorSpline = new THREE.Spline( color2vertex );

        var colors = [];
        for ( var i = 0; i <= N; i++ ) {
            //規格化距離
            var l = i / N;
            //補完点の取得
            var color = colorSpline.getPoint( l );

            colors.push( { type:"RGB", r: color.x, g: color.y, b: color.z } );

        }

        this.setColors( colors );
    }
}

///////////////////////////////////
// Latticeクラスの定義
///////////////////////////////////
PHYSICS.Lattice = function( parameter ){
    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {};
    parameter.material = parameter.material || {};
    parameter.specifyZ = parameter.specifyZ || {};
    parameter.specifyColor = parameter.specifyColor || {};

    //一辺あたりの格子数
    this.n =  parameter.n || 100;

    //格子の一辺の長さ
    this.width = parameter.width || 0.5;

    //z値の指定
    this.specifyZ = {
        enabled : parameter.specifyZ.enabled || false,
        function : parameter.specifyZ.function,
    };
    //color値の指定
    this.specifyColor = {
        enabled : parameter.specifyColor.enabled || false,
        function : parameter.specifyColor.function,
    };

    //初期頂点座標と面指定配列の初期化
    parameter.vertices = [];
    parameter.colors = [];

    //x軸方向
    for( var i=0; i<this.n; i++){

        for( var j=0; j<=this.n; j++){

            var x0 = ( i - this.n/2 ) * this.width;
            var y0 = ( j - this.n/2 ) * this.width;
            var z0 = this.specifyZ.function( x0, y0 );
            var x1 = ( ( i + 1 ) - this.n/2 ) * this.width;
            var y1 = ( j - this.n/2 ) * this.width;
            var z1 = this.specifyZ.function( x1, y1 );

            //頂点座標データの追加
            parameter.vertices.push( new THREE.Vector3(x0, y0, z0) );
            parameter.vertices.push( new THREE.Vector3(x1, y1, z1) );

            //頂点色の指定
            if( this.specifyColor.enabled  ) {
                parameter.material.vertexColors = true;
                parameter.colors.push( this.specifyColor.function( x0, y0, z0 ) );
                parameter.colors.push( this.specifyColor.function( x1, y1, z1 ) );
            }
        }

        for( var j=0; j<=this.n; j++){

            var x0 = ( j - this.n/2 ) * this.width;
            var y0 = ( i - this.n/2 ) * this.width;
            var z0 = this.specifyZ.function( x0, y0 );
            var x1 = ( j - this.n/2 ) * this.width;
            var y1 = ( (i+1) - this.n/2 ) * this.width;
            var z1 = this.specifyZ.function(x1, y1 );

            //頂点座標データの追加
            parameter.vertices.push( new THREE.Vector3(x0, y0, z0) );
            parameter.vertices.push( new THREE.Vector3(x1, y1, z1) );
            //頂点色の指定
            if( this.specifyColor.enabled  ) {
                parameter.material.vertexColors = true;
                parameter.colors.push( this.specifyColor.function( x0, y0, z0 ) );
                parameter.colors.push( this.specifyColor.function( x1, y1, z1 ) );
            }
        }

    }

    //線分
    parameter.segments = true;

    //Lineクラスのコンストラクタを実行
    PHYSICS.Line.call( this, parameter );

    //形状オブジェクト
    this.geometry.type = "Lattice";

    //各種ベクトルの初期化
    this.initVectors( );

    //三角形の中心座標を計算
    this.computeCenterPosition( );

}
PHYSICS.Lattice.prototype = Object.create( PHYSICS.Line.prototype );
PHYSICS.Lattice.prototype.constructor = PHYSICS.Lattice;

//頂点座標の更新
PHYSICS.Lattice.prototype.updateVertices = function( parameter ){

    var n = 0;
    for ( var i = 0; i < this.n; i++ ) {
        for ( var j = 0; j <= this.n; j++ ) {
            var x0 = ( i - this.n/2 ) * this.width;
            var y0 = ( j - this.n/2 ) * this.width;
            var z0 = this.specifyZ.function( x0, y0, parameter);
            var x1 = ( ( i + 1 ) - this.n/2 ) * this.width;
            var y1 = ( j - this.n/2 ) * this.width;
            var z1 = this.specifyZ.function( x1, y1, parameter );

            //頂点座標データの更新
            this._vertices[ n ].set( x0, y0, z0 );
            if( this.specifyColor.enabled  ) {
                var rgb = this.specifyColor.function( x0, y0, z0, parameter );
                this.colors[ n ].setRGB( rgb.r, rgb.g, rgb.b );
            }
            n++;

            this._vertices[ n ].set( x1, y1, z1 );
            if( this.specifyColor.enabled  ) {
                var rgb = this.specifyColor.function( x1, y1, z1, parameter );
                this.colors[ n ].setRGB( rgb.r, rgb.g, rgb.b );
            }
            n++;

        }

        for( var j=0; j<=this.n; j++){

            var x0 = ( j - this.n/2 ) * this.width;
            var y0 = ( i - this.n/2 ) * this.width;
            var z0 = this.specifyZ.function( x0, y0, parameter );
            var x1 = ( j - this.n/2 ) * this.width;
            var y1 = ( (i+1) - this.n/2 ) * this.width;
            var z1 = this.specifyZ.function(x1, y1, parameter );

            //頂点座標データの更新
            this._vertices[ n ].set( x0, y0, z0 );
            if( this.specifyColor.enabled  ) {
                var rgb = this.specifyColor.function( x0, y0, z0, parameter );
                this.colors[ n ].setRGB( rgb.r, rgb.g, rgb.b );
            }
            n++;

            this._vertices[ n ].set( x1, y1, z1 );
            if( this.specifyColor.enabled  ) {
                var rgb = this.specifyColor.function( x1, y1, z1, parameter );
                this.colors[ n ].setRGB( rgb.r, rgb.g, rgb.b );
            }
            n++;

        }


    }

    this.updateGeometryVertices();

}

//オーバーライド
PHYSICS.Lattice.prototype.updateGeometryVertices = function(){

    for( var i=0; i<this.CG.geometry.vertices.length; i++ ){

        this.CG.geometry.vertices[ i ].copy( this._vertices[ i ] );

    }
    //頂点間距離の累積距離を計算
    this.CG.geometry.computeLineDistances( );
    this.CG.geometry.verticesNeedUpdate = true;

    //衝突計算用ベクトル量の更新
    this.vectorsNeedsUpdate = true;

}


///////////////////////////////////
// ばね形状オブジェクトの定義
///////////////////////////////////
THREE.SpringGeometry = function( radius, tube, length, windingNumber, radialSegments, tubularSegments ){

    //Geometryクラスを継承
    THREE.Geometry.call( this );

    this.radius          = radius          || 10;   //ばねの半径
    this.tube            = tube            || 2; //管の半径
    this.length          = length          || 50;   //ばねの長さ
    this.windingNumber   = windingNumber   || 10;  //ばねの巻き数
    this.radialSegments  = radialSegments  || 20;  //外周の分割数
    this.tubularSegments = tubularSegments || 20;  //管周の分割数

    this.setSpringVertices( this.radius, this.tube, this.length, this.windingNumber, this.radialSegments, this.tubularSegments  );
    this.setSpringFaces( this.radius, this.tube, this.length, this.windingNumber, this.radialSegments, this.tubularSegments  );

    //面の法線ベクトルを計算
    this.computeFaceNormals( );
    //面の法線ベクトルから頂点法線ベクトルの計算
    this.computeVertexNormals( );

}
THREE.SpringGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.SpringGeometry.prototype.constructor = THREE.SpringGeometry;
//頂点座標の設定
THREE.SpringGeometry.prototype.setSpringVertices = function ( radius, tube, length, windingNumber, radialSegments, tubularSegments ){

    var geometry = this;

    ///////////////////////////////////////////////////////////////////////////
    //（０）必要な変数の準備
    ///////////////////////////////////////////////////////////////////////////
    radius = radius || 1;   //ばねの半径
    tube   = tube   || 0.2; //管の半径
    length = length || 5;   //ばねの高さ

    var Nw = windingNumber   || 10; //巻き数
    var Nr = radialSegments  || 10; //外周分割数
    var Nt = tubularSegments || 10; //管周分割数

    //管断面作成当たりの高さの増分
    var deltaH = length / Nw / Nr;

    var n = 0;
    var v = new THREE.Vector3();
    ///////////////////////////////////////////////////////////////////////////
    //（１）ばねオブジェクトを構成する頂点座標の取得
    ///////////////////////////////////////////////////////////////////////////

    for( var w = 0; w < Nw; w++ ){ //巻き番号

        for( var r = 0; r < Nr; r++ ){ //外周の分割番号

            var phi = 2.0 * Math.PI * r/Nr; //外周の分割番号

            //管断面の中心座標のz成分
            var h = deltaH * ( Nr * w + r);

            for( var t = 0; t < Nt; t++ ){ //管の分割

                var theta = 2.0 * Math.PI * t / Nt; //管の分割角

                v.set(
                    ( radius + tube * Math.cos( theta) ) * Math.cos(phi), //x座標
                    ( radius + tube * Math.cos( theta) ) * Math.sin(phi), //y座標
                               tube * Math.sin( theta) + h - length / 2   //z座標
                );

                if( geometry.vertices[ n ] ) geometry.vertices[ n ].copy( v );
                else geometry.vertices[ n ] = v.clone()
                n++;
            }
        }
    }
    ///////////////////////////////////////////////////////////////////////
    //最後の管断面の頂点座標
    var w = Nw;
    var r = 0;
    //管断面の中心座標のz成分
    var h = deltaH * ( Nr * w + r);
    for( var t = 0; t < Nt; t++ ){
        var phi = 0.0;
        var theta =  2.0 * Math.PI * t / Nt; //管の分割角

        v.set(
            ( radius + tube * Math.cos( theta) ) * Math.cos(phi), //x座標
            ( radius + tube * Math.cos( theta) ) * Math.sin(phi), //y座標
                       tube * Math.sin( theta) + h - length / 2   //z座標
        );
        if( geometry.vertices[ n ] ) geometry.vertices[ n ].copy( v );
        else geometry.vertices[ n ] = v.clone()
        n++;

    }
    //最初の管断面の中心座標
    v.set( radius, 0,  - length / 2);
    if( geometry.vertices[ n ] ) geometry.vertices[ n ].copy( v );
    else geometry.vertices[ n ] = v.clone()
    n++;

    //最後の管断面の中心座標
    v.set( radius, 0, length / 2);
    if( geometry.vertices[ n ] ) geometry.vertices[ n ].copy( v );
    else geometry.vertices[ n ] = v.clone()
    n++;

}
//ポリゴン面の設定
THREE.SpringGeometry.prototype.setSpringFaces = function ( radius, tube, length, windingNumber, radialSegments, tubularSegments ){

    var geometry = this;

    var Nw = windingNumber   || 10; //巻き数
    var Nr = radialSegments  || 10; //外周分割数
    var Nt = tubularSegments || 10; //管周分割数

    ///////////////////////////////////////////////////////////////////////////
    //（２）ばねオブジェクトを構成する面指定配列の設定
    ///////////////////////////////////////////////////////////////////////////
    for( var w = 0; w < Nw; w++ ){ //巻き番号

        for( var r = 0; r < Nr; r++ ){ //外周分割数
            //巻き番号の指定
            var w1 = w;
            var w2 = ( r !== Nr -1 )? w : w + 1;
            //外周分割番号の指定
            var r1 = r;
            var r2 = ( r !== Nr -1 )? r + 1 : 0;

            for( var t = 0; t < Nt; t++ ){  //管分割数
                //管分割番号
                var t1 = t;
                var t2 = ( t !== Nt -1 )? t + 1 : 0;

                //平面を構成する４点の頂点番号の算出
                var v1 = (Nr * Nt) * w1 + Nt * r1 + t1;
                var v2 = (Nr * Nt) * w1 + Nt * r1 + t2;
                var v3 = (Nr * Nt) * w2 + Nt * r2 + t1;
                var v4 = (Nr * Nt) * w2 + Nt * r2 + t2;

                //頂点番号v1,v3,v4を面として指定
                geometry.faces.push ( new THREE.Face3( v1, v3, v4) );
                //頂点番号v4,v2,v1を面として指定
                geometry.faces.push ( new THREE.Face3( v4, v2, v1) );
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////
    //最初の管断面の面を指定
    var w = 0
    var r = 0
    for( var t = 0; t < Nt ; t++ ) { //管分割数
        //管分割番号
        var t1 = t;
        var t2 = ( t !== Nt -1 )? t + 1 : 0;

        //管断面の中心座標とその他の２点の頂点番号
        var v1 = (Nr * Nt) * Nw + Nt;
        var v2 = (Nr * Nt) * w + Nt * r + t1;
        var v3 = (Nr * Nt) * w + Nt * r + t2;

        geometry.faces.push(
            new THREE.Face3( v1, v2, v3 )
        );
    }

    //最後の管断面の面を指定
    var w = Nw;
    var r = 0;
    for( var t = 0; t < Nt ; t++ ) { //管分割数

        //管分割番号
        var t1 = t;
        var t2 = ( t !== Nt -1 )? t + 1 : 0;

        //管断面の中心座標とその他の２点の頂点番号
        var v1 =  Nw * Nr * Nt + Nt + 1;
        var v2 = (Nr * Nt) * w + Nt * r + t1;
        var v3 = (Nr * Nt) * w + Nt * r + t2;

        geometry.faces.push(
            new THREE.Face3( v1, v3, v2 )
        );
    }

}
//頂点座標の再設定
THREE.SpringGeometry.prototype.updateSpringGeometry = function( radius, tube, length ){

    this.radius = radius || this.radius;
    this.tube   = tube || this.tube;
    this.length = length || this.length;

    this.setSpringVertices( this.radius, this.tube, this.length, this.windingNumber, this.radialSegments, this.tubularSegments  );

    //面の法線ベクトルを計算
    this.computeFaceNormals( );
    //面の法線ベクトルから頂点法線ベクトルの計算
    this.computeVertexNormals( );

    this.verticesNeedUpdate = true;
    this.normalsNeedUpdate = true;

}
THREE.SpringGeometry.prototype.setSpringBottomToTop = function ( bottom, top, lookAtFlag ){
    //ばねオブジェクトの底面中心から上面中心へ向かうベクトル
    var L = new THREE.Vector3( ).subVectors( top, bottom );

    //ばねの形状オブジェクトの更新
    this.updateSpringGeometry (
        this.radius,         //外円の半径
        this.tube,           //管円の半径
        L.length()           //バネの長さ
    );

    //ばねの向きを指定
    if( lookAtFlag ){
        this.lookAt( L );
    }
}






///////////////////////////////////
// 点線軸オブジェクトの生成
///////////////////////////////////
PHYSICS.DashedAxis = function( size, dashSize, gapSize, colors) {

    size = ( size != undefined )? size : 1.0;
    dashSize = ( dashSize != undefined )? dashSize : 0.01;
    gapSize = ( gapSize != undefined )? gapSize : 0.005;
    colors = (colors != undefined)? colors : [ 0xFF0000, 0x00FF00, 0x0000FF]

    //形状オブジェクトの宣言と生成
    var geometry = new THREE.Geometry();
    //頂点座標データの追加
    geometry.vertices[0] = new THREE.Vector3(0,    0,    0);
    geometry.vertices[1] = new THREE.Vector3(size, 0,    0);
    geometry.vertices[2] = new THREE.Vector3(0,    0,    0);
    geometry.vertices[3] = new THREE.Vector3(0,    size, 0);
    geometry.vertices[4] = new THREE.Vector3(0,    0,    0);
    geometry.vertices[5] = new THREE.Vector3(0,    0,    size);

    //頂点色データの追加
    geometry.colors[0] = new THREE.Color( colors[0] );
    geometry.colors[1] = new THREE.Color( colors[0] );
    geometry.colors[2] = new THREE.Color( colors[1] );
    geometry.colors[3] = new THREE.Color( colors[1] );
    geometry.colors[4] = new THREE.Color( colors[2] );
    geometry.colors[5] = new THREE.Color( colors[2] );

    //頂点間距離の累積距離を計算
    geometry.computeLineDistances();

    //材質オブジェクトの宣言と生成
    var material = new THREE.LineDashedMaterial({ color: 0xFFFFFF, dashSize: dashSize, gapSize: gapSize, vertexColors: true });
    //線オブジェクトの生成
    return new THREE.LineSegments(geometry, material);

};





///////////////////////////////////
// スプライトクラスの定義
///////////////////////////////////
PHYSICS.Sprite = function( parameter ){

    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //基底クラスのコンストラクタの実行
    PHYSICS.PhysObject.call( this, parameter);

    parameter.draggable = false;

    //スプライトの大きさ
    this.scale = parameter.scale || 1.0;
    this.rotation = parameter.rotation || 0;

    //各種ベクトルの初期化
    this.initVectors( );
}
PHYSICS.Sprite.prototype = Object.create( PHYSICS.PhysObject.prototype );
PHYSICS.Sprite.prototype.constructor = PHYSICS.Sprite;

PHYSICS.Sprite.prototype.create3DCG = function( ){

    this.material.rotation = this.rotation;

    delete this.material.emissive;
    delete this.material.specular;
    delete this.material.shininess;
    delete this.material.ambient;
    delete this.material.castShadow;
    delete this.material.receiveShadow;
    delete this.material.textureWidth;
    delete this.material.textureHeight;
    delete this.material.bumpScale;
    delete this.material.wireframe;


    //材質オブジェクトの宣言と生成
    var _material = new THREE.SpriteMaterial( this.material );

    //スプライトオブジェクト
    this.CG = new THREE.Sprite( _material );
    this.CG.scale.multiplyScalar( this.scale );

}

///////////////////////////////////
// テキストボードオブジェクト
///////////////////////////////////
PHYSICS.TextBoard = function( parameter ){
    parameter = parameter || {};

    var textBoadParameter = {};

    //背景色（RGBA値を0から１で指定）
    textBoadParameter.backgroundColor = parameter.backgroundColor || {r:1, g:1, b:1, a:1};
    //文字色（RGBA値を0から１で指定）
    textBoadParameter.textColor = parameter.textColor || {r:0, g:0, b:0, a:1};

    //マッピング対象オブジェクトのサイズ（縦横比は２のべき乗を推奨）
    textBoadParameter.boardWidth = parameter.boardWidth || parameter.scale || 100;
    textBoadParameter.boardHeight = parameter.boardHeight || parameter.scale || 100;

    //フォントサイズと行間（canvas要素の横幅に対する[%]で指定）
    textBoadParameter.fontSize = parameter.fontSize || 10;      //フォントサイズ
    textBoadParameter.lineHeight = parameter.lineHeight || 1.1; //行間
    textBoadParameter.textAlign = parameter.textAlign || "right";

    //フォント名（CSSで指定可能な形式）
    textBoadParameter.fontName = parameter.fontName || "serif"; //フォント名
     //解像度
    textBoadParameter.resolution = parameter.resolution || 8;

    //テキストボード用キャンバス
    this.textBoardCanvas = new PHYSICS.TextBoardCanvas( textBoadParameter );

    //基底クラスのコンストラクタの実行
    PHYSICS.Sprite.call( this, parameter );

}
PHYSICS.TextBoard.prototype = Object.create( PHYSICS.Sprite.prototype );
PHYSICS.TextBoard.prototype.constructor = PHYSICS.TextBoard;

PHYSICS.TextBoard.prototype.clearText = function(){

    this.textBoardCanvas.clear();

}

PHYSICS.TextBoard.prototype.addTextLine = function( text, indent, lineHeight, textAlign ){

    this.textBoardCanvas.addTextLine( text, indent, lineHeight, textAlign );

}

PHYSICS.TextBoard.prototype.updateText = function(){

    if( this.CG.material.map ) this.CG.material.map.dispose();
    this.CG.material.map = new THREE.Texture( this.textBoardCanvas.canvas );
    this.CG.material.map.anisotropy = PHYSICS.physLab.CG.renderer.getMaxAnisotropy();
    this.CG.material.map.needsUpdate = true;

}




/////////////////////////////////////////////////////////////////////////////////////////////
// 文字列表示のためのcanvas要素を管理するクラス
/////////////////////////////////////////////////////////////////////////////////////////////
PHYSICS.TextBoardCanvas = function( parameter ){
    parameter = parameter || {};

    //背景色（RGBA値を0から１で指定）
    this.backgroundColor = parameter.backgroundColor || {r:1, g:1, b:1, a:1};
    //文字色（RGBA値を0から１で指定）
    this.textColor = parameter.textColor || {r:0, g:0, b:0, a:1};

    //マッピング対象オブジェクトのサイズ（縦横比は２のべき乗を推奨）
    this.boardWidth = parameter.boardWidth || 100;
    this.boardHeight = parameter.boardHeight || 100;

    //フォントサイズと行間（canvas要素の横幅に対する[%]で指定）
    this.fontSize = parameter.fontSize || 10;      //フォントサイズ
    this.lineHeight = parameter.lineHeight || 1.1; //行間
    this.textAlign = parameter.textAlign || "right";

    //フォント名（CSSで指定可能な形式）
    this.fontName = parameter.fontName || "serif"; //フォント名
     //解像度
    this.resolution = parameter.resolution || 4;

    this._lineHeight = 0;
    this.textLines = [];

    this.init();

}
//初期化
PHYSICS.TextBoardCanvas.prototype.init = function(){

    //canvas要素の生成
    this.canvas = document.createElement('canvas');
    //canvas要素のサイズ
    this.canvas.width = Math.pow( 2, this.resolution);  //横幅
    this.canvas.height = Math.pow( 2, this.resolution); //縦幅

    console.log( "canvas要素のサイズ：", this.canvas.width, "×", this.canvas.height  );

    //コンテキストの取得
    this.canvas.context = this.canvas.getContext('2d');

    this.setBackGroundColor( this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a );
    this.setTextColor( this.textColor.r, this.textColor.g, this.textColor.b, this.textColor.a);
    this.setFontSize( this.fontSize );
    this.setFontName( this.fontName );
    this.setLineHeight( this.lineHeight )

}
//背景色の設定
PHYSICS.TextBoardCanvas.prototype.setBackGroundColor = function( r, g, b, a ){

    this.backgroundColor.r = r || 0;
    this.backgroundColor.g = g || 0;
    this.backgroundColor.b = b || 0;
    this.backgroundColor.a = a || 0;

    this.canvas.context.fillStyle = "rgba(" + 255 * this.backgroundColor.r + " ," + 255 * this.backgroundColor.g + " ," + 255 * this.backgroundColor.b + " ," +  this.backgroundColor.a + ")";
    this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

}
//全消し
PHYSICS.TextBoardCanvas.prototype.clear = function( ){

    this.canvas.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.context.fillStyle = "rgba(" + 255 * this.backgroundColor.r + " ," + 255 * this.backgroundColor.g + " ," + 255 * this.backgroundColor.b + " ," +  this.backgroundColor.a + ")";
    this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.context.fillStyle = "rgba(" + 255 * this.textColor.r + " ," + 255 * this.textColor.g + " ," + 255 * this.textColor.b + " ," +  this.textColor.a + ")";
    this._lineHeight = 0;

}
//文字色の設定
PHYSICS.TextBoardCanvas.prototype.setTextColor = function( r, g, b, a ){

    this.textColor.r = r || 0;
    this.textColor.g = g || 0;
    this.textColor.b = b || 0;
    this.textColor.a = a || 0;

    this.canvas.context.fillStyle = "rgba(" + 255 * this.textColor.r + " ," + 255 * this.textColor.g + " ," + 255 * this.textColor.b + " ," +  this.textColor.a + ")";

}
//文字サイズの設定
PHYSICS.TextBoardCanvas.prototype.setFontSize = function( size ){

    this.fontSize = size || 10;

    this.canvas.context.font = this.fontSize /100 * this.canvas.width + "px " + this.fontName;
}
//フォントの設定
PHYSICS.TextBoardCanvas.prototype.setFontName = function( name ){

    this.fontName = name || "serif";

    this.canvas.context.font = this.fontSize /100 * this.canvas.width + "px " + this.fontName;

}
//行間の設定
PHYSICS.TextBoardCanvas.prototype.setLineHeight = function( height ){

    this.lineHeight = height || 1.1;

}
//文字列の追加
PHYSICS.TextBoardCanvas.prototype.addTextLine = function( text, indent, lineHeight, textAlign ){
    text = text || "";
    indent = indent || 0;
    lineHeight = lineHeight || this.lineHeight;

    this.textLines.push( {text : text, indent : indent, lineHeight : lineHeight} );
    this._lineHeight += lineHeight * this.fontSize /100 * this.canvas.width;

    this.canvas.context.textAlign = this.textAlign || "left";
    this.canvas.context.fillText(
        text,
        indent /100 * this.canvas.width,
        this._lineHeight
    );

}
//canvas要素を取得
PHYSICS.TextBoardCanvas.prototype.getTextCanvas = function(){

    return this.canvas;
}

/*
/////////////////////////////////////////////////////////////////////////////////////////////
// 文字列表示のための３次元オブジェクトを管理するクラス
/////////////////////////////////////////////////////////////////////////////////////////////

PHYSICS.TextBoardObject = function( parameter ){
     parameter = parameter || {};

    TextBoardCanvas.call( this,  parameter );

    this.plane = null;
    this.sprite = null;

}
PHYSICS.TextBoardObject.prototype = Object.create( PHYSICS.TextBoardCanvas.prototype );
PHYSICS.TextBoardObject.constructor = PHYSICS.TextBoardObject;

PHYSICS.TextBoardObject.prototype.cleatePlaneObject = function(){

    //テクスチャ画像用のcanvas要素の取得
    var canvas = this.getTextCanvas();
    //テクスチャオブジェクトの生成
    this.texture = new THREE.Texture( canvas );
    //テクスチャ画像の更新
    this.texture.needsUpdate = true;

    //形状オブジェクトの宣言と生成
    var geometry = new THREE.PlaneGeometry( this.boardWidth, this.boardHeight );
    //材質オブジェクトの宣言と生成
    var material = new THREE.MeshBasicMaterial( { map : this.texture, transparent : true } );
    //平面オブジェクトの生成
    this.plane = new THREE.Mesh( geometry, material );

    return this.plane;
}
PHYSICS.TextBoardObject.prototype.cleateSpriteObject = function(){

    //テクスチャ画像用のcanvas要素の取得
    var canvas = this.getTextCanvas();
    //テクスチャオブジェクトの生成
    this.texture = new THREE.Texture( canvas );
    //テクスチャ画像の更新
    this.texture.needsUpdate = true;

    //材質オブジェクトの宣言と生成
    var material = new THREE.SpriteMaterial({ map: this.texture });
    //スプライトオブジェクトの生成
    this.sprite = new THREE.Sprite( material );

    this.sprite.scale.set( this.boardWidth, this.boardHeight, 1);

    return this.sprite;
}
PHYSICS.TextBoardObject.prototype.cleateTextScreen = function(){

    this.textScene = new THREE.Scene();
    if( this.sprite ){

        this.textScene.add( this.sprite );

    } else {

        this.textScene.add( this.cleateSpriteObject() );
    }

    this.textCamera = new THREE.OrthographicCamera(-this.boardWidth/2, this.boardWidth/2, this.boardHeight/2, -this.boardHeight/2, -10, 10);

}
PHYSICS.TextBoardObject.prototype.update = function(){

    if( this.plane ) this.plane.material.map.needsUpdate = true;
    if( this.sprite ) this.sprite.material.map.needsUpdate = true;

}
PHYSICS.TextBoardObject.prototype.getPlaneObject = function(){

    return this.plane;

}
PHYSICS.TextBoardObject.prototype.getSpriteObject = function(){

    return this.sprite;

}
*/