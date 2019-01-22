////////////////////////////////////////////////////
// 仮想物理実験 r1
////////////////////////////////////////////////////

//名前空間のチェック
if (typeof PHYSICS === "undefined") alert("名前空間「PHYSICS」が未定義です");

//物理系に存在するオブジェクトの基底クラス
PHYSICS.PhysObject = function(parameter) {

        //位置ベクトル
        this.r = new THREE.Vector3();
        //速度ベクトル
        this.v = new THREE.Vector3();
        //加速度ベクトル
        this.a = new THREE.Vector3();

        //r_{n-1}
        this.r_1 = new THREE.Vector3();
        //r_{n-1}
        this.r_2 = new THREE.Vector3();

        //反発係数
        this.e = 1.0;

        //時間発展の有無
        this.dynamic = false;

        //オブジェクト表示の有無
        this.visible = true;

        //質量
        this.mass = 1.0;

        //運動の記録を行う
        this.recordData = false;

        //オブジェクトの内部時間
        this.step = 0;

        //運動記録の間引回数
        this.skipRecord = 100;

        //マウスドラックの有無
        this.draggable = false;

        //マウスドラックの許可
        this.allowDrag = false;

        //３次元グラフィックス材質関連パラメータ
        this.material = {
            type: "Lambert", //材質の種類 （ "Basic" | "Lambert" | "Phong" | "Normal"）
            shading: "Flat", //シェーディングの種類 （ "Flat" | "Smooth" ）
            side: "Front", //描画する面 ( "Front" | "Back" | "Double")
            color: 0xFF0000, //反射色（発光材質の場合：発光色）
            ambient: 0x990000, //環境色
            opacity: 1.0, //不透明度
            transparent: false, //透過処理
            emissive: 0x000000, //反射材質における発光色
            specular: 0x111111, //鏡面色
            shininess: 30, //鏡面指数
            castShadow: false, //影の生成
            receiveShadow: false, //影の映り込み
        };

        //軌跡の可視化関連パラメータ
        this.locus = {
            enabled: false, //可視化の有無
            visible: false, //表示・非表示の指定
            color: null, //発光色
            maxNum: 1000, //軌跡ベクトルの最大配列数
        };

        //速度ベクトルの可視化関連パラメータ
        this.velocityVector = {
            enabled: false, //可視化の有無
            visible: false, //表示・非表示の指定
            color: null, //発光色
            scale: 0.5, //矢印のスケール
        };

        //バウンディングボックスの可視化関連パラメータ
        this.boundingBox = {
            visible: false, //表示・非表示の指定
            color: null, //発光色
            opacity: 0.2, //不透明度
            transparent: true, //透過処理
            draggFlag: false //マウスドラック状態かを判定するフラグ（内部プロパティ）
        };

        //形状オブジェクト関連
        this.geometry = {
            type: null, //形状の種類
        };

        ///////////////////////
        //内部プロパティ
        //////////////////////
        //３次元オブジェクト番号
        this.id = 0;
        //３次元グラフィックス用オブジェクト
        this.CG = {};

        //物理実験室
        this.physLab = null;

        //運動の記録を格納するオブジェクト
        this.data = {};
        this.data.x = []; //x座標
        this.data.y = []; //y座標
        this.data.z = []; //z座標
        this.data.vx = []; //速度のx成分
        this.data.vy = []; //速度のy成分
        this.data.vz = []; //速度のz成分
        this.data.kinetic = []; //運動エネルギー   
        this.data.potential = []; //ポテンシャルエネルギー
        this.data.energy = []; //力学的エネルギー

        //パラメータ設定
        this.setParameter(parameter);
    }
    ////////////////////////////////////////////////////////////////////
    // クラスプロパティ
    ////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.id = 0;

////////////////////////////////////////////////////////////////////
// パラメータの設定
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.setParameter = function(parameter) {
    parameter = parameter || {};

    //パラメータの指定
    PHYSICS.overwriteProperty(this, parameter);

    /*
    	//位置ベクトル
    	this.r.x = ( parameter.x !== undefined )? parameter.x : this.r.x;
    	this.r.y = ( parameter.y !== undefined )? parameter.y : this.r.y;
    	this.r.z = ( parameter.z !== undefined )? parameter.z : this.r.z;

    	//速度ベクトル
    	this.v.x = ( parameter.vx !== undefined )? parameter.vx : this.v.x;
    	this.v.y = ( parameter.vy !== undefined )? parameter.vy : this.v.y;
    	this.v.z = ( parameter.vz !== undefined )? parameter.vz : this.v.z;
    */
    //軌跡の色
    this.locus.color = this.locus.color || this.material.color;
    //速度ベクトルの色
    this.velocityVector.color = this.velocityVector.color || this.material.color;
    //バウンディングボックスの色
    this.boundingBox.color = this.boundingBox.color || this.material.color;

}

////////////////////////////////////////////////////////////////////
// パラメータの再設定
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.resetParameter = function(parameter) {
        //運動データの初期化
        this.initDynamicData();

        //パラメータの設定
        this.setParameter(parameter);

        //プロットデータ配列に初期値を代入
        this.recordDynamicData();

        //r_{-1}の値を取得する
        this.computeInitialCondition();
    }
    ////////////////////////////////////////////////////////////////////
    // ３次元グラフィックスの生成
    ////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.create3DCG = function() {
    //形状オブジェクト
    var geometry = this.getGeometry();

    //材質オブジェクトの取得
    var material = this.getMaterial();

    //３次元グラフィックス用オブジェクトの生成
    this.CG = new THREE.Mesh(geometry, material);

    //マウスドラックによる移動を行う場合
    if (this.draggable) {

        //バウンディングボックスの計算
        this.CG.geometry.computeBoundingBox();

        //バウンディングボックスの幅の取得
        this.boundingBox.width = new THREE.Vector3().subVectors(
            this.CG.geometry.boundingBox.max,
            this.CG.geometry.boundingBox.min
        );

        //形状オブジェクトの宣言と生成
        var geometry = new THREE.CubeGeometry(
            this.boundingBox.width.x,
            this.boundingBox.width.y,
            this.boundingBox.width.z
        );

        //材質オブジェクトの宣言と生成
        var material = new THREE.MeshBasicMaterial({
            color: this.boundingBox.color,
            transparent: this.boundingBox.transparent,
            opacity: this.boundingBox.opacity
        });

        //バウンディングボックスオブジェクトの生成
        this.boundingBox.CG = new THREE.Mesh(geometry, material);

        //バウンディングボックスオブジェクトのローカル座標系における中心座標を格納
        this.boundingBox.center = new THREE.Vector3().addVectors(
            this.CG.geometry.boundingBox.max,
            this.CG.geometry.boundingBox.min
        ).divideScalar(2);

        //バウンディングボックスオブジェクトの位置を指定
        this.boundingBox.CG.position.copy(this.r).add(this.boundingBox.center);

        //バウンディングボックスオブジェクトの表示の有無を指定
        this.boundingBox.CG.visible = this.boundingBox.visible;

        //バウンディング球オブジェクトのシーンへの追加
        this.physLab.CG.scene.add(this.boundingBox.CG);

        //バウンディングボックスオブジェクトに３次元オブジェクトを指定
        this.boundingBox.CG.physObject = this;

    }

}

////////////////////////////////////////////////////////////////////
// 形状オブジェクトの生成
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.getGeometry = function(type, parameter) {

    //材質の種類
    type = type || this.geometry.type;
    parameter = parameter || {};

    if (type === "Sphere") {

        //球オブジェクトの形状オブジェクト
        var _geometry = new THREE.SphereGeometry(
            parameter.radius || this.geometry.radius, //球の半径
            parameter.widthSegments || this.geometry.widthSegments, //y軸周りの分割数
            parameter.heightSegments || this.geometry.heightSegments, //y軸上の正の頂点から負の頂点までの分割数
            parameter.phiStart || this.geometry.phiStart, //y軸回転の開始角度
            parameter.phiLength || this.geometry.phiLength, //y軸回転角度
            parameter.thetaStart || this.geometry.thetaStart, //x軸回転の開始角度。
            parameter.thetaLength || this.geometry.thetaLength //x軸回転角度
        );

    } else if (type === "Plane") {

        //平面オブジェクトの形状オブジェクト
        var _geometry = new THREE.PlaneGeometry(
            parameter.width || this.geometry.width, //平面の横幅（x軸方向）
            parameter.height || this.geometry.height, //平面の縦軸（y軸方向）
            parameter.widthSegments || this.geometry.widthSegments, //横方向分割数
            parameter.heightSegments || this.geometry.heightSegments //縦方向分割数
        );

    } else if (type === "Cube") {

        //立方体オブジェクトの形状オブジェクト
        var _geometry = new THREE.CubeGeometry(
            parameter.width || this.geometry.width, //立方体の横幅  （x軸方向）
            parameter.depth || this.geometry.depth, //立方体の奥行き （y軸方向）
            parameter.height || this.geometry.height, //立方体の高さ   （z軸方向）
            parameter.widthSegments || this.geometry.widthSegments, //横方向分割数  
            parameter.heightSegments || this.geometry.heightSegments, //縦方向分割数
            parameter.depthSegments || this.geometry.depthSegments //奥行き方向分割数
        );

    } else if (type === "Circle") {

        //円オブジェクトの形状オブジェクト
        var _geometry = new THREE.CircleGeometry(
            parameter.radius || this.geometry.radius, //円の半径
            parameter.segments || this.geometry.segments, //円の分割数
            parameter.thetaStart || this.geometry.thetaStart, //円弧の開始角度
            parameter.thetaLength || this.geometry.thetaLength //円弧の終了角度
        );

    } else if (type === "Cylinder") {

        //円柱オブジェクトの形状オブジェクト
        var _geometry = new THREE.CylinderGeometry(
            parameter.radiusTop || this.geometry.radiusTop, //円柱の上の円の半径
            parameter.radiusBottom || this.geometry.radiusBottom, //円柱の下の円の半径
            parameter.height || this.geometry.height, //円柱の高さ
            parameter.radialSegments || this.geometry.radialSegments, //円の分割数
            parameter.heightSegments || this.geometry.heightSegments, //円の高さ方向の分割数
            parameter.openEnded || this.geometry.openEnded //筒状
        );

    } else {

        alert("形状オブジェクトの設定ミス");

    }

    return _geometry;

}

////////////////////////////////////////////////////////////////////
// 材質オブジェクトの生成
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.getMaterial = function(type, parameter) {

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
    PHYSICS.overwriteProperty(_parameter, parameter);

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

////////////////////////////////////////////////////////////////////
// オブジェクトの生成
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.create = function() {

    //３次元オブジェクト通し番号
    PHYSICS.PhysObject.id++;
    this.id = PHYSICS.PhysObject.id;

    //３次元グラフィックスの生成
    this.create3DCG();

    //オブジェクトの影の生成元
    this.CG.castShadow = this.material.castShadow;

    //オブジェクトに影を描画
    this.CG.receiveShadow = this.material.receiveShadow;

    //オブジェクトのシーンへの追加
    this.physLab.CG.scene.add(this.CG);

    //速度ベクトルの表示
    if (this.velocityVector.enabled) {

        //矢印オブジェクトの生成
        this.velocityVector.CG = new THREE.ArrowHelper(
            this.v.clone().normalize(), //方向ベクトル
            this.r.clone(), //起点座標
            1, //長さ
            this.velocityVector.color //色
        );
        //矢印オブジェクトのシーンへの追加
        this.physLab.CG.scene.add(this.velocityVector.CG);

    }
    //軌跡オブジェクトの表示
    if (this.locus.enabled) {

        //形状オブジェクトの宣言
        var geometry = new THREE.BufferGeometry();
        //アトリビュート変数のサイズを指定
        geometry.attributes = {
                position: { //頂点座標
                    itemSize: 3, //各頂点ごとの要素数（x,y,z）
                    array: new Float32Array(this.locus.maxNum * 3), //配列の宣言
                    numItems: this.locus.maxNum * 3, //配列の要素数
                    dynamic: true
                }
            }
            //材質オブジェクトの生成
        var material = new THREE.LineBasicMaterial({ color: this.locus.color });
        //軌跡オブジェクトの作成
        this.locus.CG = new THREE.Line(geometry, material);
        //軌跡オブジェクトのシーンへの追加
        this.physLab.CG.scene.add(this.locus.CG);
    }

    //プロットデータ配列に初期値を代入
    this.recordDynamicData();

    //r_{-1}の値を取得する
    this.computeInitialCondition();

}

////////////////////////////////////////////////////////////////////
// ３次元グラフィックスの更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.update = function() {

    //位置ベクトルの指定
    this.CG.position = this.r.clone();

    //オブジェクトの可視化
    this.CG.visible = this.visible;

    //３次元グラフィックス子要素の可視化も指定
    for (var i = 0; i < this.CG.children.length; i++) {

        this.CG.children[i].visible = this.visible;

    }

    //軌跡オブジェクトの更新
    this.updateLocus();

    //速度ベクトルの更新
    this.updateVelocityVector();

    //バウンディングボックスの位置と姿勢の更新
    this.updateBoundingBox();

}


////////////////////////////////////////////////////////////////////
// 軌跡オブジェクトの更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateLocus = function(color) {

    if (!this.locus.enabled) return;

    color = (color !== undefined) ? color : this.locus.color;

    var start = this.data.x.length - 1;
    var end = this.locus.CG.geometry.attributes.position.array.length / 3;

    for (var n = start; n < end; n++) {
        //頂点の位置座標の設定
        this.locus.CG.geometry.attributes.position.array[n * 3] = this.r.x;
        this.locus.CG.geometry.attributes.position.array[n * 3 + 1] = this.r.y;
        this.locus.CG.geometry.attributes.position.array[n * 3 + 2] = this.r.z;
    }

    //頂点座標の更新を通知
    this.locus.CG.geometry.attributes.position.needsUpdate = true;

    //色の指定
    this.locus.CG.material.color.setHex(color);


    //表示フラグ
    var flag = false;

    if (this.physLab.locusFlag == true) {

        flag = true;

    } else if (this.physLab.locusFlag == false) {

        flag = false;

    } else if (this.physLab.locusFlag == "pause") {

        flag = (this.physLab.pauseFlag) ? true : false;

    }

    //軌跡の表示
    this.locus.CG.visible = flag && this.locus.visible;

}

////////////////////////////////////////////////////////////////////
// 速度ベクトルの更新
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateVelocityVector = function(color, scale) {

        if (!this.velocityVector.enabled) return;

        color = (color !== undefined) ? color : this.velocityVector.color;
        scale = (scale !== undefined) ? scale : this.velocityVector.scale;

        //速度の大きさ
        var v = this.v.length() * scale;

        if (v < 0.01) {
            v = 0.01;
            scale = 0.01;
        }

        this.velocityVector.CG.setDirection(this.v.clone().normalize());
        this.velocityVector.CG.setLength(v, scale, scale);
        this.velocityVector.CG.position = this.r.clone();
        this.velocityVector.CG.setColor(color);

        //表示フラグ
        var flag = false;

        //速度ベクトルの表示
        if (this.physLab.velocityVectorFlag == true) {

            flag = true;

        } else if (this.physLab.velocityVectorFlag == false) {

            flag = false;

        } else if (this.physLab.velocityVectorFlag == "pause") {

            flag = (this.physLab.pauseFlag) ? true : false;

        }

        //子要素の可視化も指定
        for (var i = 0; i < this.velocityVector.CG.children.length; i++) {
            this.velocityVector.CG.children[i].visible = flag && this.velocityVector.visible;
        }

    }
    ////////////////////////////////////////////////////////////////////
    // バウンディングボックスのの更新
    ////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.updateBoundingBox = function() {

    if (!this.draggable) return;

    //バウンディングボックスの位置と姿勢の更新
    this.boundingBox.CG.position.copy(this.r).add(this.boundingBox.center);

    //表示フラグ
    var flag = false;

    if (this.physLab.boundingBoxFlag == true) {

        flag = true;

    } else if (this.physLab.boundingBoxFlag == false) {

        flag = false;

    } else if (this.physLab.boundingBoxFlag == "dragg") {

        flag = (this.boundingBox.draggFlag) ? true : false;

    }
    //バウンディングボックスの表示
    this.boundingBox.CG.visible = flag && this.boundingBox.visible;

    if (!this.dynamic) {
        //マウスドラックによる３次元オブジェクトの移動速度
        this.v = new THREE.Vector3().subVectors(this.r, this.r_1).divideScalar(this.physLab.dt * this.physLab.skipRendering);
        //過去の位置を格納
        this.r_1.copy(this.r);
    }

}


////////////////////////////////////////////////////////////////////
// 時間発展の計算
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.timeEvolution = function() {

        //内部時間ステップのインクリメント
        this.step++;
        //時間間隔の取得
        var dt = this.physLab.dt;
        //力の取得
        var f = this.getForce();

        //加速度ベクトルの更新
        //this.a = new THREE.Vector3().copy( f ).divideScalar( this.mass );
        this.a.x = f.x / this.mass;
        this.a.y = f.y / this.mass;
        this.a.z = f.z / this.mass;

        //ベルレ法アルゴリズムによる時間発展
        this.computeTimeEvolution(dt);

        //運動の記録
        this.recordDynamicData();
    }
    ////////////////////////////////////////////////////////////////////
    // ベルレ法アルゴリズムによる時間発展
    ////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.computeTimeEvolution = function(dt) {
    //現時刻の位置ベクトルを一時保存
    //var r_ = new THREE.Vector3().copy( this.r );
    var x_ = this.r.x;
    var y_ = this.r.y;
    var z_ = this.r.z;

    //次時刻の位置の計算（ x_{n+1} = 2x_n - x_{n_1} + a_{n}\Delta t^2 ）
    //this.r = this.r.clone().multiplyScalar( 2.0 ).sub( this.r_1 ).add( this.a.clone().multiplyScalar( dt * dt ) ); 
    this.r.x = 2 * this.r.x - this.r_1.x + this.a.x * dt * dt;
    this.r.y = 2 * this.r.y - this.r_1.y + this.a.y * dt * dt;
    this.r.z = 2 * this.r.z - this.r_1.z + this.a.z * dt * dt;

    //速度ベクトルの計算（v_）  
    //this.v.subVectors( this.r, this.r_1 ).divideScalar( 2 * dt ); 
    this.v.x = (this.r.x - this.r_1.x) / (2 * dt);
    this.v.y = (this.r.y - this.r_1.y) / (2 * dt);
    this.v.z = (this.r.z - this.r_1.z) / (2 * dt);

    //衝突時に時間を巻き戻す時に利用する
    this.r_2.x = this.r_1.x;
    this.r_2.y = this.r_1.y;
    this.r_2.z = this.r_1.z;

    //次時刻の計算時に利用する「x_{n_1}」の保存  this.x_1 = x_;
    //this.r_1.copy( r_ );
    this.r_1.x = x_;
    this.r_1.y = y_;
    this.r_1.z = z_;
}

////////////////////////////////////////////////////////////////////
// 力の計算
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.getForce = function() {

    //重力の定義
    var f = new THREE.Vector3(0, 0, -this.mass * this.physLab.g);

    return f;

}

////////////////////////////////////////////////////////////////////
// ベルレ法による必要な初期値の計算
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.computeInitialCondition = function() {
    var dt = this.physLab.dt;
    //力の取得
    f = this.getForce();
    //加速度ベクトルの取得
    this.a = f.clone().divideScalar(this.mass);

    //「x_{-1}」の計算	 this.x_1 = this.x - this.vx * dt + 1 / 2 * this.ax * dt * dt;
    //this.r_1 = new THREE.Vector3().copy( this.r ).sub( this.v.clone().multiplyScalar( dt ) ).add(  this.a.clone().multiplyScalar( 1/2 * dt * dt ) );
    this.r_1.x = this.r.x - this.v.x * dt + 1 / 2 * this.a.x * dt * dt;
    this.r_1.y = this.r.y - this.v.y * dt + 1 / 2 * this.a.y * dt * dt;
    this.r_1.z = this.r.z - this.v.z * dt + 1 / 2 * this.a.z * dt * dt;

}


////////////////////////////////////////////////////////////////////
// 力学的エネルギーの計算
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.getEnergy = function() {

    //速度の大きさの２乗の計算
    var v2 = this.v.lengthSq();

    //運動エネルギーの計算
    var kinetic = 1 / 2 * this.mass * v2;

    var z = (this.step === 0) ? this.r.z : this.r_1.z;

    //ポテンシャルエネルギーの計算
    var potential = this.mass * this.physLab.g * z;

    //力学的エネルギーをオブジェクトで返す
    return { kinetic: kinetic, potential: potential };

}

////////////////////////////////////////////////////////////////////
// 位置・速度・エネルギーの時系列データの初期化
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.initDynamicData = function() {
    //配列の初期化
    this.data.x = []; //x座標
    this.data.y = []; //y座標
    this.data.z = []; //z座標
    this.data.vx = []; //速度のx成分
    this.data.vy = []; //速度のy成分
    this.data.vz = []; //速度のz成分
    this.data.kinetic = []; //運動エネルギー   
    this.data.potential = []; //ポテンシャルエネルギー
    this.data.energy = []; //力学的エネルギー
}

////////////////////////////////////////////////////////////////////
// 位置・速度・エネルギーの時系列データの蓄積
////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.recordDynamicData = function() {

        if (!this.recordData) return

        if ((this.step == 0) || (this.step / this.skipRecord > this.data.x.length)) {
            var step, x, y, z;

            //初期状態のみ
            if (this.step == 0 || (!this.dynamic)) {
                step = this.step;
                x = this.r.x;
                y = this.r.y;
                z = this.r.z;
            } else {
                step = this.step - 1;
                x = this.r_1.x;
                y = this.r_1.y;
                z = this.r_1.z;
            }
            //実時刻
            var time = step * this.physLab.dt;

            //位置
            this.data.x.push([time, x]); //x座標
            this.data.y.push([time, y]); //y座標
            this.data.z.push([time, z]); //z座標

            //速度
            this.data.vx.push([time, this.v.x]); //vx
            this.data.vy.push([time, this.v.y]); //vy
            this.data.vz.push([time, this.v.z]); //vz

            //エネルギー
            var energy = this.getEnergy();
            this.data.kinetic.push([time, energy.kinetic]);
            this.data.potential.push([time, energy.potential]);
            this.data.energy.push([time, energy.kinetic + energy.potential]);
        }

    }
    /////////////////////////////////////////////////////////////////////
    //共通プロパティの取得
    /////////////////////////////////////////////////////////////////////
PHYSICS.PhysObject.prototype.getCommonProperty = function() {

    //運動の記録を格納するオブジェクト
    var data = {};
    data.x = []; //x座標
    data.y = []; //y座標
    data.z = []; //z座標
    data.vx = []; //速度のx成分
    data.vy = []; //速度のy成分
    data.vz = []; //速度のz成分
    data.kinetic = []; //運動エネルギー   
    data.potential = []; //ポテンシャルエネルギー
    data.energy = []; //力学的エネルギー

    for (var i = 0; i < this.data.x.length; i++) {
        data.x[i] = data.x[i];
        data.y[i] = data.y[i];
        data.z[i] = data.z[i];
        data.vx[i] = data.vx[i];
        data.vy[i] = data.vy[i];
        data.vz[i] = data.vz[i];
        data.kinetic[i] = data.kinetic[i];
        data.potential[i] = data.potential[i];
        data.energy[i] = data.energy[i];
    }

    return {
        physLab: this.physLab, //所属実験室オブジェクト
        dynamic: this.dynamic, //運動の有無
        draggable: this.draggable, //マウスドラックの有無
        allowDrag: this.allowDrag, //マウスドラックの可否
        visible: this.visible, //オブジェクト表示の有無
        mass: this.mass, //質量
        e: this.e, //反発係数
        r: { //位置ベクトル
            x: this.r.x,
            y: this.r.y,
            z: this.r.z,
        },
        v: { //速度ベクトル
            x: this.v.x,
            y: this.v.y,
            z: this.v.z,
        },
        recordData: this.recordData, //運動記録の有無
        skipRecord: this.skipRecord, //運動記録の間引回数
        data: data, //運動の記録を格納するオブジェクト
        material: {
            type: this.material.type, //材質の種類 （ "Basic" | "Lambert" | "Phong" | "Normal"）
            shading: this.material.shading, //シェーディングの種類 （ "Flat" | "Smooth" ）
            side: this.material.side, //描画する面 ( "Front" | "Back" | "Double")
            color: this.material.color, //反射色（発光材質の場合：発光色）
            ambient: this.material.ambient, //環境色
            opacity: this.material.opacity, //不透明度
            transparent: this.material.transparent, //透過処理
            emissive: this.material.emissive, //反射材質における発光色
            specular: this.material.specular, //鏡面色
            shininess: this.material.shininess, //鏡面指数
            castShadow: this.material.castShadow, //影の生成
            receiveShadow: this.material.receiveShadow, //影の映り込み
        },
        locus: { //軌跡の可視化関連パラメータ
            enabled: this.strobe.enabled, //利用の有無
            visible: this.locus.visible, //表示の有無
            color: this.locus.color, //発光色
            maxNum: this.locus.maxNum, //軌跡ベクトルの最大配列数
        },
        velocityVector: { //速度ベクトルの可視化関連パラメータ
            enabled: this.strobe.enabled, //利用の有無
            visible: this.velocityVector.visible, //表示の有無
            color: this.velocityVector.color, //発光色
            scale: this.velocityVector.scale, //矢印のスケール
        },
        boundingBox: { //バウンディングボックスの可視化関連パラメータ
            visible: this.boundingBox.visible, //表示の有無
            color: this.boundingBox.color, //発光色
            opacity: this.boundingBox.opacity, //不透明度
            transparent: this.boundingBox.transparent, //透過処理
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////
// 派生クラス
////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////
// 球クラスの定義
///////////////////////////////////
PHYSICS.Sphere = function(parameter) {
    //基底クラスの継承
    PHYSICS.PhysObject.call(this, parameter);
    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //球の半径
    this.radius = parameter.radius || 1.0;

    //シェーディング
    this.material.shading = parameter.material.shading || "Smooth";

    //形状オブジェクト
    this.geometry.type = "Sphere";

    //３次元グラフィックスパラメータ
    this.geometry.radius = this.radius; //球の半径
    this.geometry.widthSegments = parameter.geometry.widthSegments || 20; //y軸周りの分割数
    this.geometry.heightSegments = parameter.geometry.heightSegments || 20; //y軸上の正の頂点から負の頂点までの分割数
    this.geometry.phiStart = parameter.geometry.phiStart || 0; //y軸回転の開始角度
    this.geometry.phiLength = parameter.geometry.phiLength || Math.PI * 2; //y軸回転角度
    this.geometry.thetaStart = parameter.geometry.thetaStart || 0; //x軸回転の開始角度
    this.geometry.thetaLength = parameter.geometry.thetaLength || Math.PI; //x軸回転角度

};
PHYSICS.Sphere.prototype = Object.create(PHYSICS.PhysObject.prototype);
PHYSICS.Sphere.prototype.constructor = PHYSICS.Sphere;

//クローン生成
PHYSICS.Sphere.prototype.clone = function() {

    //共通プロパティの取得
    var parameter = this.getCommonProperty();

    //球オブジェクト固有パラメータの取得
    parameter.radius = this.radius; //球の半径
    parameter.geometry = {};
    parameter.geometry.widthSegments = this.geometry.widthSegments; //y軸周りの分割数
    parameter.geometry.heightSegments = this.geometry.heightSegments; //y軸上の正の頂点から負の頂点までの分割数
    parameter.geometry.phiStart = this.geometry.phiStart; //y軸回転の開始角度
    parameter.geometry.phiLength = this.geometry.phiLength; //y軸回転角度
    parameter.geometry.thetaStart = this.geometry.thetaStart; //x軸回転の開始角度
    parameter.geometry.thetaLength = this.geometry.thetaLength; //x軸回転角度

    return new PHYSICS.Sphere(parameter);

}







///////////////////////////////////
// 床クラスの定義
///////////////////////////////////
PHYSICS.Floor = function(parameter) {
    //基底クラスの継承
    PHYSICS.PhysObject.call(this, parameter);
    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {};
    parameter.material = parameter.material || {};

    //床一辺あたりのタイルの個数
    this.n = parameter.n || 20;

    //タイルの一辺の長さ
    this.width = parameter.width || 1.0;

    //タイルの色
    this.colors = parameter.colors || [0x999999, 0x333333];

    //床面での跳ね返り（内部プロパティ）
    this.collisionFloor = parameter.collision || false;

    //衝突判定用平面の表示
    this.collisionFloorVisible = parameter.collisionFloorVisible || false;

    //衝突検知の無効化
    this.collision = false;
}
PHYSICS.Floor.prototype = Object.create(PHYSICS.PhysObject.prototype);
PHYSICS.Floor.prototype.constructor = PHYSICS.Floor;

//３次元グラフィックスの生成（オーバーライド）
PHYSICS.Floor.prototype.create3DCG = function() {
    //床オブジェクトの生成
    this.CG = new THREE.Object3D();
    for (var i = -this.n / 2; i < this.n / 2; i++) {
        for (var j = -this.n / 2; j < this.n / 2; j++) {
            //位置ベクトル
            var x = (j + 0.5) * this.width;
            var y = (i + 0.5) * this.width;
            //一辺の長さ「width」の正方形の形状オブジェクトの宣言と生成
            var geometry = new THREE.PlaneGeometry(this.width, this.width);

            var parameter = {
                    color: this.colors[Math.abs(i + j) % this.colors.length],
                    ambient: this.colors[Math.abs(i + j) % this.colors.length]
                }
                //市松模様とするための材質オブジェクトを生成
            var material = this.getMaterial(this.material.type, parameter);

            //平面オブジェクトの宣言と生成
            var plane = new THREE.Mesh(geometry, material);
            //平面オブジェクトの位置の設定
            plane.position.set(x, y, 0);
            //平面オブジェクトに影を描画
            plane.receiveShadow = this.material.receiveShadow;
            //平面オブジェクトを床オブジェクトへ追加
            this.CG.add(plane);
        }
    }
}

///////////////////////////////////
// 軸クラスの定義
///////////////////////////////////
PHYSICS.Axis = function(parameter) {
    PHYSICS.PhysObject.call(this, parameter);
    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //矢印のサイズ
    this.size = parameter.size || {};
    if (this.size.length === undefined) this.size.length = 3;
    if (this.size.headLength === undefined) this.size.headLength = 1;
    if (this.size.headWidth === undefined) this.size.headWidth = 0.5;

    //矢印の色
    this.colors = parameter.colors || [0xFF0000, 0x00FF00, 0x0000FF];

}
PHYSICS.Axis.prototype = Object.create(PHYSICS.PhysObject.prototype);
PHYSICS.Axis.prototype.constructor = PHYSICS.Axis;

PHYSICS.Axis.prototype.create3DCG = function() {
        //矢印オブジェクトの親オブジェクトの生成
        this.CG = new THREE.Object3D();
        //x軸方向矢印オブジェクトの生成と追加
        this.CG.add(
            new THREE.ArrowHelper(
                new THREE.Vector3(1, 0, 0), //方向
                new THREE.Vector3(0, 0, 0), //原点
                this.size.length, //長さ
                this.colors[0], //色
                this.size.headLength, //矢頭の長さ
                this.size.headWidth //矢頭の幅
            )
        );
        //y軸方向矢印オブジェクトの生成と追加
        this.CG.add(
            new THREE.ArrowHelper(
                new THREE.Vector3(0, 1, 0), //方向
                new THREE.Vector3(0, 0, 0), //原点
                this.size.length, //長さ
                this.colors[1], //色
                this.size.headLength, //矢頭の長さ
                this.size.headWidth //矢頭の幅
            )
        );
        //z軸方向矢印オブジェクトの生成と追加
        this.CG.add(
            new THREE.ArrowHelper(
                new THREE.Vector3(0, 0, 1), //方向
                new THREE.Vector3(0, 0, 0), //原点
                this.size.length, //長さ
                this.colors[2], //色
                this.size.headLength, //矢頭の長さ
                this.size.headWidth //矢頭の幅
            )
        );

        //３次元オブジェクトのマウスドラック
        if (this.draggable) {

            //形状オブジェクトの宣言と生成
            var geometry = new THREE.CubeGeometry(
                this.size.length,
                this.size.length,
                this.size.length
            );

            //材質オブジェクトの宣言と生成
            var material = new THREE.MeshBasicMaterial({
                color: this.boundingBox.color,
                transparent: this.boundingBox.transparent,
                opacity: this.boundingBox.opacity
            });

            //バウンディング球オブジェクトの生成
            this.boundingBox.CG = new THREE.Mesh(geometry, material);

            this.boundingBox.center = new THREE.Vector3(
                this.size.length / 2,
                this.size.length / 2,
                this.size.length / 2
            );

            this.boundingBox.CG.position.copy(this.r).add(this.boundingBox.center);

            this.boundingBox.CG.visible = this.boundingBox.visible;

            //バウンディング球オブジェクトのシーンへの追加
            this.physLab.CG.scene.add(this.boundingBox.CG);
            this.boundingBox.CG.physObject = this;
        }
    }
    ///////////////////////////////////
    // 平面クラスの定義
    ///////////////////////////////////
PHYSICS.Plane = function(parameter) {
    PHYSICS.PhysObject.call(this, parameter);
    parameter = parameter || {};
    parameter.geometry = parameter.geometry || {}
    parameter.material = parameter.material || {}

    //横幅と縦幅
    this.width = parameter.width || 1.0;
    this.height = parameter.height || 1.0;

    //初期頂点座標
    this._vertices[0] = new THREE.Vector3(-this.width / 2, -this.height / 2, 0);
    this._vertices[1] = new THREE.Vector3(this.width / 2, -this.height / 2, 0);
    this._vertices[2] = new THREE.Vector3(this.width / 2, this.height / 2, 0);
    this._vertices[3] = new THREE.Vector3(-this.width / 2, this.height / 2, 0);

    //面指定インデックス
    this.faces[0] = [0, 1, 2, 3];

    //３次元グラフィックスパラメータ
    this.geometry.width = this.width;
    this.geometry.height = this.height;
    //形状オブジェクト
    this.geometry.type = "Plane";

    //各種ベクトルの初期化
    this.initVectors();
}
PHYSICS.Plane.prototype = Object.create(PHYSICS.PhysObject.prototype);
PHYSICS.Plane.prototype.constructor = PHYSICS.Plane;