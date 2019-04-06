function Plot2D( frameID ) {

	this.initThree( frameID );
	this.initCamera( );

	//グラフ全体
	this.CG = new THREE.Group();
	this.stage = {
		width : this.graphFrame.clientWidth,
		height : this.graphFrame.clientHeight,
		color : 0xffffff,
	}
	this.axis = {
		x : {
			length : 0.85, //ステージ横幅に対する
			headLength : 0.015,
			headWidth : 0.015,
			color : 0x333333,
		},
		y : {
			length : 0.8, //ステージ横幅に対する
			headLength : 0.015,
			headWidth : 0.015,
			color : 0x333333
		}
	}
	this.offset ={
		x : this.stage.width * (1 - this.axis.x.length) /6 ,
		y : this.stage.height * (1 - this.axis.y.length) /5
	}

	this.grid = {
		CG : new THREE.Group(),
		frame : {
			CG : new THREE.Group(),
			w : 3,
			color : 0x888888,
 		},
 		xLabel : "x-axis",
 		yLabel : "y-axis",
		x: {
			lines : [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
			color : 0x888888,
			labels : []
		},
		y: {
			lines : [ -2.0, -1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5, 2.0 ],
			color : 0x888888,
			labels : []
		}
	}
	this.grid.CG.position.set( this.offset.x, this.offset.y, 0);
	this.CG.add( this.grid.CG );


	this.grid.frame.CG.position.set( this.offset.x, this.offset.y, 2);
	this.CG.add( this.grid.frame.CG );
	this.graph = {
		CG : new THREE.Group(),
		width : 5,
		colors : [ 0x4bb2c5, 0xEAA228, 0xc5b47f, 0x579575, 0x839557, 0x958c12, 0x953579, 0x4b5de4, 0xd8b83f, 0xff5800, 0x0085cc, 0xc747a3, 0xcddf54, 0xFBD178, 0x26B4E3, 0xbd70c7]

	}
	this.graph.CG.position.set(this.offset.x, this.offset.y,1);
	this.CG.add( this.graph.CG );
	this.graphs = [];

	this.label = {
		CG : new THREE.Group(),
		size : 50,
		color : 0x888888
	}

	this.label.CG.position.set(this.offset.x, this.offset.y,4);
	this.CG.add( this.label.CG );

	this.datas = [];
	this.tangents = [];
	this.normals = [];

}
Plot2D.prototype.setPlotDatas = function( datas ){

	var w = this.graph.width;

	//グラフ描画領域
	var width = this.stage.width * this.axis.x.length;
	var height = this.stage.height * this.axis.y.length;

	//データ値幅（x）
	var wx = this.grid.x.lines[ this.grid.x.lines.length - 1 ] - this.grid.x.lines[ 0 ];
	var wy = this.grid.y.lines[ this.grid.y.lines.length - 1 ] - this.grid.y.lines[ 0 ];
	var cx = (this.grid.x.lines[ this.grid.x.lines.length - 1 ] + this.grid.x.lines[ 0 ])/2;
	var cy = (this.grid.y.lines[ this.grid.y.lines.length - 1 ] + this.grid.y.lines[ 0 ])/2;
	//x値に対するグラフの幅
	var dx = width/wx;
	var dy = height/wy;

	//データ列数
	var n = datas.length;
	for( var i = 0; i < n; i++ ){

		//データ数
		var m = datas[ i ].length;
		this.datas[ i ] = [ ];
		for( var j = 0; j < m; j++ ){

			var x = dx * (datas[ i ][ j ][ 0 ]-cx);
			var y = dy * (datas[ i ][ j ][ 1 ]-cy);

			this.datas[ i ][ j ] = this.datas[ i ][ j ] || new THREE.Vector3();
			this.datas[ i ][ j ].set( x, y, 0 ) ;

		}

		this.tangents[ i ] = [];
		var p = new THREE.Vector3( 0, 0, 1);

		this.tangents[ i ][ 0 ] = this.tangents[ i ][ 0 ] || new THREE.Vector3();
		this.tangents[ i ][ 0 ].subVectors( this.datas[ i ][ 1 ], this.datas[ i ][ 0 ] ).normalize();
		for( var j = 1; j < m - 1; j++ ){
			this.tangents[ i ][ j ] = this.tangents[ i ][ j ] || new THREE.Vector3()
			this.tangents[ i ][ j ].subVectors( this.datas[ i ][ j + 1 ], this.datas[ i ][ j - 1 ]  ).normalize();
		}
		this.tangents[ i ][ m - 1 ] = this.tangents[ i ][ m - 1 ] || new THREE.Vector3();
		this.tangents[ i ][ m - 1 ].subVectors( this.datas[ i ][ m - 1 ], this.datas[ i ][ m - 2 ] ).normalize();

		this.normals[ i ] = [];
		for( var j = 0; j < m; j++ ){
			this.normals[ i ][ j ] = this.normals[ i ][ j ] || new THREE.Vector3();
			this.normals[ i ][ j ].crossVectors( p, this.tangents[ i ][ j ] );
		}

		this.graphs[ i ] = this.graphs[ i ] || {}
		if( !this.graphs[ i ].CG ){
			//形状オブジェクトの宣言と生成
			var geometry = new THREE.Geometry();
			for( var j = 0; j < m; j++ ){
				//頂点座標データの追加
				geometry.vertices[ j * 2 + 0 ] = new THREE.Vector3( this.datas[ i ][ j ].x - w/2 * this.normals[ i ][ j ].x, this.datas[ i ][ j ].y - w/2 * this.normals[ i ][ j ].y, 0 );
				geometry.vertices[ j * 2 + 1 ] = new THREE.Vector3( this.datas[ i ][ j ].x + w/2 * this.normals[ i ][ j ].x, this.datas[ i ][ j ].y + w/2 * this.normals[ i ][ j ].y, 0 );

			}
			for( var j =0; j<m-1; j++ ){
				//if(i%2==1) continue;
				geometry.faces[ j * 2 + 0 ] = new THREE.Face3( j*2,   (j+1)*2, (j+1)*2-1);
				geometry.faces[ j * 2 + 1 ] = new THREE.Face3( j*2+1, (j+1)*2, (j+1)*2+1);
			}

			this.graphs[ i ] = this.graphs[ i ] || {}
			this.graphs[ i ].CG = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: this.graph.colors[ i ] }));
			this.graph.CG.add( this.graphs[ i ].CG );


		} else {

			var v = this.graphs[ i ].CG.geometry.vertices

			for( var j = 0; j < v.length/2; j++ ){
				//頂点座標データの追加
				v[ j * 2 + 0 ].set( this.datas[ i ][ j ].x - w/2 * this.normals[ i ][ j ].x, this.datas[ i ][ j ].y - w/2 * this.normals[ i ][ j ].y, 0 );
				v[ j * 2 + 1 ].set( this.datas[ i ][ j ].x + w/2 * this.normals[ i ][ j ].x, this.datas[ i ][ j ].y + w/2 * this.normals[ i ][ j ].y, 0 );

			}
			//頂点座標の更新を通知
			this.graphs[ i ].CG.geometry.verticesNeedUpdate = true;

		}

	}

}
Plot2D.prototype.createGraphics = function(){

	this.scene.add( this.CG );

	//ステージの生成
	this.stage.CG = new THREE.Mesh(
		new THREE.PlaneGeometry( this.stage.width, this.stage.height ),
		new THREE.MeshBasicMaterial( { color:this.stage.color } )
	);
	this.CG.add( this.stage.CG );


	var width = this.stage.width * this.axis.x.length;
	var height = this.stage.height * this.axis.y.length;

	//ステージの生成
	this.grid.frame.CG.bottom = new THREE.Mesh(
		new THREE.PlaneGeometry( width + this.grid.frame.w, this.grid.frame.w ),
		new THREE.MeshBasicMaterial( { color: this.grid.frame.color } )
	)
	this.grid.frame.CG.top = new THREE.Mesh(
		new THREE.PlaneGeometry( width + this.grid.frame.w, this.grid.frame.w ),
		new THREE.MeshBasicMaterial( { color: this.grid.frame.color } )
	)
	this.grid.frame.CG.right = new THREE.Mesh(
		new THREE.PlaneGeometry( this.grid.frame.w, height + this.grid.frame.w ),
		new THREE.MeshBasicMaterial( { color: this.grid.frame.color } )
	)
	this.grid.frame.CG.left = new THREE.Mesh(
		new THREE.PlaneGeometry( this.grid.frame.w, height + this.grid.frame.w ),
		new THREE.MeshBasicMaterial( { color: this.grid.frame.color } )
	)
	this.grid.frame.CG.bottom.position.set( 0, -height/2, 0 );
	this.grid.frame.CG.top.position.set( 0, height/2, 0 );
	this.grid.frame.CG.right.position.set( width/2, 0, 0 );
	this.grid.frame.CG.left.position.set( -width/2, 0, 0 );
	this.grid.frame.CG.add ( this.grid.frame.CG.bottom );
	this.grid.frame.CG.add ( this.grid.frame.CG.top );
	this.grid.frame.CG.add ( this.grid.frame.CG.left );
	this.grid.frame.CG.add ( this.grid.frame.CG.right );


	this.grid.frame.CG.topMask = new THREE.Mesh(
		new THREE.PlaneGeometry( this.stage.width, (this.stage.height - height) ),
		new THREE.MeshBasicMaterial( { color: this.stage.color } )
	)
	this.grid.frame.CG.bottomMask = new THREE.Mesh(
		new THREE.PlaneGeometry( this.stage.width, (this.stage.height - height) ),
		new THREE.MeshBasicMaterial( { color: this.stage.color } )
	)
	this.grid.frame.CG.rightMask = new THREE.Mesh(
		new THREE.PlaneGeometry( (this.stage.width - width) , this.stage.height ),
		new THREE.MeshBasicMaterial( { color: this.stage.color } )
	)
	this.grid.frame.CG.leftMask = new THREE.Mesh(
		new THREE.PlaneGeometry( (this.stage.width - width), this.stage.height ),
		new THREE.MeshBasicMaterial( { color: this.stage.color } )
	)
	this.grid.frame.CG.topMask.position.set( 0, height/2 + this.grid.frame.w/2  + (this.stage.height - height)/2 , 0 );
	this.grid.frame.CG.bottomMask.position.set( 0, -height/2 - this.grid.frame.w/2  - (this.stage.height - height)/2 , 0 );
	this.grid.frame.CG.rightMask.position.set( width/2 + this.grid.frame.w/2 + (this.stage.width - width)/2, 0, 0 );
	this.grid.frame.CG.leftMask.position.set( -width/2 - this.grid.frame.w/2 - (this.stage.width - width)/2, 0, 0 );


	this.grid.frame.CG.add ( this.grid.frame.CG.topMask );
	this.grid.frame.CG.add ( this.grid.frame.CG.bottomMask );
	this.grid.frame.CG.add ( this.grid.frame.CG.leftMask );
	this.grid.frame.CG.add ( this.grid.frame.CG.rightMask );

	var nx = this.grid.x.lines.length - 2;
	var ny = this.grid.y.lines.length - 2;

	//形状オブジェクトの宣言と生成
	var geometry = new THREE.Geometry();
	//頂点座標データの追加
	for( var i = 1; i < this.grid.x.lines.length - 1; i++ ){
		geometry.vertices.push( new THREE.Vector3( i * width/( nx + 1 ) - width/2, -height/2, 0 ) );
		geometry.vertices.push( new THREE.Vector3( i * width/( nx + 1 ) - width/2, height/2, 0) );
	}
	//グリッド
	this.grid.x.CG = new THREE.LineSegments( geometry, new THREE.LineBasicMaterial({ color: this.grid.x.color }) );
	this.grid.CG.add( this.grid.x.CG );

	//形状オブジェクトの宣言と生成
	var geometry = new THREE.Geometry();
	//頂点座標データの追加
	for( var i = 1; i < this.grid.y.lines.length - 1; i++ ){
		geometry.vertices.push( new THREE.Vector3( -width/2, i * height/( ny + 1 ) - height/2 , 0 ) );
		geometry.vertices.push( new THREE.Vector3(  width/2, i * height/( ny + 1 ) - height/2 , 0 ) );
	}
	this.grid.y.CG = new THREE.LineSegments( geometry, new THREE.LineBasicMaterial({ color: this.grid.y.color }) );
	this.grid.CG.add( this.grid.y.CG );


	///////////////////////////////////////////
	// ラベル

	this.label._color = new THREE.Color( this.label.color );

	for( var i = 0; i < this.grid.x.lines.length; i++ ){
		//TextBoardCanvasクラスのオブジェクトの生成
		this.grid.x.labels[ i ] = new TextBoardObject({
			fontSize : 40, // [%]
			textColor : {r: this.label._color.r, g:this.label._color.g, b:this.label._color.b, a: 1 },//文字色
			backgroundColor : { r:1, g:1, b:1, a:0 },//背景色（RGBA値を0から１で指定）
			boardWidth : this.label.size,  //マッピング対象平面オブジェクトの横幅
			boardHeight : this.label.size/2, //マッピング対象平面オブジェクトの縦幅
			textAlign : "center",
			fontName :"Times New Roman"
		});
		this.grid.x.labels[ i ].clear();
		this.grid.x.labels[ i ].addTextLine( this.grid.x.lines[ i ].toString(), 50, 1 );
		this.grid.x.labels[ i ].update();
		this.grid.x.labels[ i ].CG = this.grid.x.labels[ i ].cleatePlaneObject();
		this.grid.x.labels[ i ].CG.position.set( i * width/( nx + 1 ) - width/2 , -height/2-this.label.size/5*1.5, 0 )
		this.label.CG.add( this.grid.x.labels[ i ].CG );
	}


	for( var i = 0; i < this.grid.y.lines.length; i++ ){
		//TextBoardCanvasクラスのオブジェクトの生成
		this.grid.y.labels[ i ] = new TextBoardObject({
			fontSize : 40, // [%]
			textColor : {r: this.label._color.r, g:this.label._color.g, b:this.label._color.b, a: 1 },//文字色
			backgroundColor : { r:1, g:1, b:1, a:0 },//背景色（RGBA値を0から１で指定）
			boardWidth : this.label.size,  //マッピング対象平面オブジェクトの横幅
			boardHeight : this.label.size/2, //マッピング対象平面オブジェクトの縦幅
			textAlign : "right",
			fontName :"Times New Roman"
		});
		this.grid.y.labels[ i ].clear();
		this.grid.y.labels[ i ].addTextLine( this.grid.y.lines[ i ].toString(), 90, 1 );
		this.grid.y.labels[ i ].update();
		this.grid.y.labels[ i ].CG = this.grid.y.labels[ i ].cleatePlaneObject();
		this.grid.y.labels[ i ].CG.position.set( -width/2-this.label.size/5*3, i * height/( ny + 1 ) - height/2, 0 )
		this.label.CG.add( this.grid.y.labels[ i ].CG );
	}


	//TextBoardCanvasクラスのオブジェクトの生成
	this.grid.x.label = new TextBoardObject({
		fontSize : 4, // [%]
		textColor : {r: this.label._color.r, g:this.label._color.g, b:this.label._color.b, a: 1 },//文字色
		backgroundColor : { r:1, g:1, b:0, a:0 },//背景色（RGBA値を0から１で指定）
		boardWidth : width,  //マッピング対象平面オブジェクトの横幅
		boardHeight : width/16, //マッピング対象平面オブジェクトの縦幅
		textAlign : "center",
		fontName :"Times New Roman"
	});
	this.grid.x.label.clear();
	this.grid.x.label.addTextLine( this.grid.xLabel, 50, 1 );
	this.grid.x.label.update();
	this.grid.x.label.CG = this.grid.x.label.cleatePlaneObject();
	this.grid.x.label.CG.position.set( 0 , -height/2 - width/14, 0 )
	this.label.CG.add( this.grid.x.label.CG );

	//TextBoardCanvasクラスのオブジェクトの生成
	this.grid.y.label = new TextBoardObject({
		fontSize : 4, // [%]
		textColor : {r: this.label._color.r, g:this.label._color.g, b:this.label._color.b, a: 1 },//文字色
		backgroundColor : { r:1, g:1, b:0, a:0 },//背景色（RGBA値を0から１で指定）
		boardWidth : width,  //マッピング対象平面オブジェクトの横幅
		boardHeight : width/16, //マッピング対象平面オブジェクトの縦幅
		textAlign : "center",
		fontName :"Times New Roman"
	});
	this.grid.y.label.clear();
	this.grid.y.label.addTextLine( this.grid.yLabel, 50, 1 );
	this.grid.y.label.update();
	this.grid.y.label.CG = this.grid.y.label.cleatePlaneObject();
	this.grid.y.label.CG.position.set( -width/2 - width/14, 0 , 0 );
	this.grid.y.label.CG.rotation.set( 0, 0, Math.PI/2 );
	this.label.CG.add( this.grid.y.label.CG );
}


Plot2D.prototype.initThree = function( frameID ) {
	//キャンバスフレームDOM要素の取得
	this.graphFrame = document.getElementById( frameID );

	//レンダラーオブジェクトの生成
	this.renderer = new THREE.WebGLRenderer({ antialias: true });

	//レンダラーのサイズの設定
	this.renderer.setSize( this.graphFrame.clientWidth, this.graphFrame.clientHeight );
	//キャンバスフレームDOM要素にcanvas要素を追加
	this.graphFrame.appendChild( this.renderer.domElement );

	//レンダラークリアーカラーの設定
	this.renderer.setClearColor( 0x000000, 1.0);

	//シーンオブジェクトの生成
	this.scene = new THREE.Scene();
}
Plot2D.prototype.initCamera = function() {

	var cameraWidth = this.graphFrame.clientWidth;
	var cameraHeight = this.graphFrame.clientHeight;

	//カメラオブジェクトの生成
	this.camera = new THREE.OrthographicCamera(-cameraWidth/2, cameraWidth/2, cameraHeight/2, -cameraHeight/2, -10, 50);
	//カメラの位置の設定
	this.camera.position.set(0, 0, 10);
	//カメラの上ベクトルの設定
	this.camera.up.set(0, 1, 0);
	//カメラの中心位置ベクトルの設定
	this.camera.lookAt({ x: 0, y: 0, z: 0 }); //トラック剛体球利用時は自動的に無効

}

Plot2D.prototype.plot = function(){

	//レンダリング
	this.renderer.render(this.scene, this.camera);

}
