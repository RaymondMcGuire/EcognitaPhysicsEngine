var Plot2D = function ( canvasDom ) {
	//ローカル変数
	var plot;
	var plotDatas = [];  //描画用データ
	//デフォルトのオプション
	this.options = {
		title: {
			fontSize: '22pt',               //ラベルフォントサイズ（デフォルト：'11pt'）
			fontFamily: 'Times New Roman',
			textAlign: 'center',
			textColor: '#000000',
		},
		//デフォルト軸オプション
		axesDefaults: {
			pad: 1.02,                        //軸の描画範囲のパッディング
			labelRenderer: $.jqplot.CanvasAxisLabelRenderer, //ラベルレンダラーの指定
			labelOptions: {
				show: true,                     //ラベル描画の有無
				angle: 0,                       //ラベル描画角度
				fontFamily: 'Times New Roman',  //ラベルフォント（デフォルト：'"Trebuchet MS", Arial, Helvetica, sans-serif'）
				fontSize: '20px',               //ラベルフォントサイズ（デフォルト：'11pt'）
				fontWeight: 'bold',             //ラベルウェイト（デフォルト：'nomal'）
				textColor: '#666666'            //ラベルカラー
			},
			tickRenderer: $.jqplot.CanvasAxisTickRenderer,
			tickOptions: {
				show: true,           //目盛マークと目盛ラベル描画の有無
				showLabel: true,      //目盛ラベル描画の有無
				showMark: true,       //目盛マーク描画の有無
				showGridline: true,   //グリッドラインの描画
				mark: 'outside',      //目盛マークの描画位置の指定（'outside', 'inside' or 'cross'）
				markSize: 4,          //目盛マークのサイズ
				formatString: '',     //フォーマット指定子の設定（例「%.2f」）
				fontSize: '10pt',     //目盛ラベルフォントサイズ
				fontWeight: 'bold',   //目盛ラベルウェイト
				textColor: '#666666', //目盛ラベルカラー
				fontFamily: 'Times New Roman',  //目盛ラベルフォント
				angle: 0,             //目盛ラベル描画角度
				prefix: ''            //目盛ラベルのプレフィックス
			}
		},
		//軸オプション
		axes: {                           //軸のオプション
			xaxis: {                      //x軸のオプション
				label: 'x',               //x軸のラベル
				min: null,                //x軸の最小値
				max: null,                //x軸の最大値
				tickInterval: null,       //x軸の目盛間隔
				labelOptions: { angle: 0} //ラベルレンダラオプション
			},
			yaxis: {                      //y軸のオプション
				label: 'y',               //y軸のラベル
				min: null,                //y軸の最小値
				max: null,                //y軸の最大値
				tickInterval: null,       //y軸の目盛間隔
				renderer: $.jqplot.LinerAxisRenderer,
				labelOptions: { angle: 0} //ラベルレンダラオプション
			},
			y2axis: {                     //y軸のオプション
				label: 'y2',              //y軸のラベル
				min: null,                //y軸の最小値
				max: null,                //y軸の最大値
				tickInterval: null,       //y軸の目盛間隔
				renderer: $.jqplot.LinerAxisRenderer,
				labelOptions: { angle: 0} //ラベルレンダラオプション
			}
		},
		//グリッドオプション
		grid: {
			background: '#FFFFFF'  //背景色（デフォルト：'#fffdf6'）
		},
		//凡例オプション
		legend: {
			show: true,              //凡例の有無
			location: 'ne',          //凡例の設置場所 'nw'：左上, 'n'：上, 'ne'：右上, 'e'：右, 'se'：右下, 's'：下, 'sw'：左下, 'w'：左
			placement: 'insideGrid'  //凡例の設置場所（デフォルト：'insideGrid'）（'insideGrid', 'outsideGrid'）
		},
		//カーソルオプション
		cursor: {
			show: true,                  //カーソルの描画
			style: 'crosshair',          //カーソルの種類
			zoom: true,                  //ズームの可否（デフォルト：false）
			looseZoom: true,             //あいまい値利用の有無
			clickReset: true,            //クリックによるズームのリセット有無（デフォルト：false）
			dblClickReset: false,        //ダブルクリックによるズームのリセット有無（デフォルト：true）
			constrainOutsideZoom: false, //グラフ描画の外側もズーム対象としない（デフォルト：true）
			showTooltipOutsideZoom: true //「constrainOutsideZoom: false」の場合に、ツールチップに外側の値を描画
		},
		//ハイライトオプション
		highlighter: {
			show: true,               //ハイライト描画の有無
			showTooltip: true,        //ツールチップ描画の有無
			tooltipLocation: 'ne',    //ツールチップ描画の方向
			fadeTooltip: true,        //ツールチップフェード描画の有無
			tooltipFadeSpeed: 'def',  //ツールチップフェードの速度（デフォルト：'fast'）（'slow','def','fast', ミリ秒）
			tooltipAxes: 'xy',        //ツールチップに描画うする軸（'x', 'y' , 'xy', 'yx'）
			sizeAdjust: 7.5           //マーカーのサイズ
		},
		seriesDefaults :{
			show: true,     //グラフ描画の有無
			xaxis: 'xaxis', //利用するx軸（ 'xaxis', 'x2axis' ）
			yaxis: 'yaxis', //利用するy軸（ 'yaxis', 'y2axis' )
			label: '',      //凡例で表示する文字列
			color: '',      //線や点の描画色
			lineWidth: 2.5, //線の太さ
			linePattern: 'solid', //線の種類（ 'dashed', 'dotted', [4, 3, 1, 3, 1, 3] ）

			shadow: true,   //線や点の影描画
			shadowAngle: 45,    //影を落とす角度（x軸から時計回り）
			shadowOffset: 1.25, //影を離す長さ
			shadowDepth: 3,     //影の段数
			shadowAlpha: 0.1,   //影の透明度.
			showLine: true,     //線描画の有無.
			showMarker: true,   //点描画の有無
			fill: false,        //描画線とx軸を囲む領域を塗りつぶす
			fillAndStroke: false, //塗りつぶし時に線も描画
			fillColor: undefined, //塗りつぶし色
			fillAlpha: undefined, //塗りつぶし領域の透明度
			renderer: $.jqplot.LineRenderer, //線描画レンダラーの指定
			rendererOptions: {}, //レンダラーのオプション
			markerRenderer: $.jqplot.MarkerRenderer, //点描画レンダラーの指定
			//点描画のオプション
			markerOptions: {
				show: true,         //点描画の有無
				style: 'filledCircle', //点描画の種類（ 'circle', 'diamond', 'square', 'filledCircle', 'filledDiamond', 'filledSquare'）
				lineWidth: 2,       //点の外枠線の幅
				size: 9,            //点描画のサイズ.
				color: undefined,   //点描画の色
				shadow: true,       //影描画の有無
				shadowAngle: 45,    //影を落とす角度（x軸から時計回り）.
				shadowOffset: 1,    //影を離す長さ
				shadowDepth: 3,     //影の段数
				shadowAlpha: 0.07   //影の透明度
			}
		}
	};


	//メソッド１：データ列追加メソッド
	this.pushData = function (data) {
		plotDatas.push( data );  //pushメソッドによる要素の追加
	};

	//メソッド２：グラフ描画メソッド
	this.plot = function () {
		this.linearPlot();
	};

	//グラフ描画メソッド１：線形線形グラフ
	this.linearPlot = function () {
		//描画前にCanvas要素の消去
		this.clearCanvas();

		//線形グラフ描画レンダラーの設定
		this.options.axes.xaxis.renderer = $.jqplot.LinerAxisRenderer;
		this.options.axes.yaxis.renderer = $.jqplot.LinerAxisRenderer;

		//グラフ描画
		plot = $.jqplot(canvasDom, plotDatas, this.options);
	};

	this.linerPlot = function(){
		console.warn( "linerはスペルミスです。正しくはlinearです。" );
		this.linearPlot();
	}

	//グラフ描画メソッド２：線形対数グラフ
	this.logPlot = function (base) {
		var base = base || 10; //対数の底（10, 2 or Math.E）

		//描画前の描画データチェック
		this.logPlotDataCheck( false, true );

		//描画前にCanvas要素の消去
		this.clearCanvas();

		//対数グラフ描画レンダラーの設定
		this.options.axes.xaxis.renderer = $.jqplot.LinerAxisRenderer;
		this.options.axes.yaxis.renderer = $.jqplot.LogAxisRenderer;
		this.options.axes.yaxis.tickInterval = null;

		//対数の底の設定
		this.options.axes.yaxis.rendererOptions = { base: base };

		//グラフ描画
		plot = $.jqplot(canvasDom, plotDatas, this.options);
	};

	this.linearlogPlot = function (base) {
		this.logPlot( base );
	}

	//グラフ描画メソッド３：対数線形グラフ
	this.loglinearPlot = function (base) {
		var base = base || 10; //対数の底（10, 2 or Math.E）

		//描画前の描画データチェック
		this.logPlotDataCheck( true, false );

		//描画前にCanvas要素の消去
		this.clearCanvas();

		//対数グラフ描画レンダラーの設定
		this.options.axes.xaxis.renderer = $.jqplot.LogAxisRenderer;
		this.options.axes.yaxis.renderer = $.jqplot.LinerAxisRenderer;
		this.options.axes.xaxis.tickInterval = null;

		//対数の底の設定
		this.options.axes.xaxis.rendererOptions = { base: base };

		//グラフ描画
		plot = $.jqplot(canvasDom, plotDatas, this.options);

	};

	this.loglinerPlot = function( base ){
		console.warn( "linerはスペルミスです。正しくはlinearです。" );
		this.loglinearPlot( base );
	}


	//グラフ描画メソッド４：対数対数グラフ
	this.loglogPlot = function (baseX, baseY) {
		var baseX = baseX || 10; //対数の底（10, 2 or Math.E）
		var baseY = baseY || 10; //対数の底（10, 2 or Math.E）

		//描画前の描画データチェック
		this.logPlotDataCheck(true, true);

		//描画前にCanvas要素の消去
		this.clearCanvas();

		//対数グラフ描画レンダラーの設定
		this.options.axes.xaxis.renderer = $.jqplot.LogAxisRenderer;
		this.options.axes.yaxis.renderer = $.jqplot.LogAxisRenderer;
		this.options.axes.xaxis.tickInterval = null;
		this.options.axes.yaxis.tickInterval = null;

		//対数の底の設定
		this.options.axes.xaxis.rendererOptions = { base: baseX };
		this.options.axes.yaxis.rendererOptions = { base: baseY };

		//グラフ描画
		plot = $.jqplot(canvasDom, plotDatas, this.options);

	};

	//メソッド４：Canvas要素消去メソッド
	this.clearCanvas = function () {
		$("#" + canvasDom).empty();
		//document.getElementById(canvasDom).innerHTML = null;
	};

	//メソッド５：グラフ再描画メソッド
	this.replot = function ( resetXaxes, resetYaxes ) {
		this.clearCanvas();                       //描画前にCanvas要素の消去

		if(plot.title){
			plot.title.text = this.options.title;
		}
		//描画前の描画データチェック
		var flagX = false, flagY = false;
		if( this.options.axes.xaxis.renderer == $.jqplot.LogAxisRenderer ) flagX = true;
		if( this.options.axes.yaxis.renderer == $.jqplot.LogAxisRenderer ) flagY = true;
		if( flagX || flagY ) this.logPlotDataCheck( flagX, flagY );

		//描画点データの再設定
		for (var i = 0; i < plotDatas.length; i++) plot.series[i].data = plotDatas[i];

		if( !flagX && !flagY ){
			if( resetXaxes == true ) plot.axes.xaxis.resetScale( this.options.axes.xaxis );
			if( resetYaxes == true ) plot.axes.yaxis.resetScale( this.options.axes.yaxis );
			plot.replot(); //再描画

		} else {
			//logPlot
			plot.replot(); //内部変数調整用
			if( resetYaxes == true ) plot.resetAxesScale();
			if( resetXaxes == true ) plot.axes.xaxis.resetScale( this.options.axes.xaxis );
			plot.replot(); //再描画

		}

	};

	//メソッド６：グラフ描画点データの消去
	this.clearData = function () {
		delete plotDatas;
		plotDatas = [];  //配列の初期化
	};

	//メソッド７：描画前の描画データチェック
	this.logPlotDataCheck = function (flagX, flagY) {
		flagX = ( flagX === null )? false : flagX;
		flagY = ( flagY === null )? true : flagY;

		//対数グラフ時の「y<0」となる描画点データの削除
		for (var i = 0; i < plotDatas.length; i++) {  //i番目の描画点データ列
			var _data = []; //一時変数

			//「y>0」の値だけ描画点データを残す
			for (var j = 0; j < plotDatas[i].length; j++) { //i番目の描画点データ列に対するj番目の点
				//plotDatas[i][j][0]とplotDatas[i][j][1]は、i番目の描画点データ列に対するj番目の点のx座標とy座標

				var flag = false;
				if ( flagX && flagY ) {

					if( plotDatas[i][j][0] > 0 && plotDatas[i][j][1] > 0 )  flag = true;

				} else 	if ( flagX && !flagY ) {

					if( plotDatas[i][j][0] > 0 )  flag = true;

				} else 	if ( !flagX && flagY ) {

					if( plotDatas[i][j][1] > 0 )  flag = true;

				} else 	if ( !flagX && !flagY ) {

					flag = true;

				}

				if ( flag ) _data.push(plotDatas[i][j]);

			}

			//i番目の描画点データ列の再設定（これですべての点は「y>0」となる）
			plotDatas[i] = _data;
		}
	};

	//メソッド８：画像データの出力
	this.makeImage = function ( ) {

		//img要素の取得
		var img = $( "#" + canvasDom ).jqplotToImageElem();

		return img;
	}
	//メソッド９：画像データの出力
	this.makeCanvas = function ( ) {

		//canvas要素の取得
		var canvas = $( "#" + canvasDom ).jqplotToImageCanvas();

		return canvas;
	}

	//メソッド10：数値データの出力
	this.makeBlob = function ( ){

		var spacer = "\t";
		var enter  = "\n";

		//出力内容の用意
		var outputs = [];
		for( var i = 0; i < plotDatas[0].length; i++ ){

			var data = plotDatas[0][i][0]; //時刻

			for(var j = 0; j < plotDatas.length; j++ ){
				data += spacer + plotDatas[j][i][1];
			}

			data += enter;

			outputs.push( data );
		}

		// Blobオブジェクトの生成
		var blob = new Blob( outputs, { "type" : "text/plain" } );

		return blob;
	}

	//画像作成用イベント
	this.initGraphDownloadEvent = function( key, id ){
		if( key === undefined ) key = "s";

		window.addEventListener('keydown', function (e) {

			//キーボードイベント時のキー取得
			var keyChar = String.fromCharCode( e.keyCode ).toLowerCase();

			//キーボードの「s」が押された場合
			if(keyChar == key) {

				//グラフィックスが描画されたcanvas要素
				var img = plot2D.makeImage();

				//a要素の生成
				var a = document.createElement("a");
				//canvas要素→DataURL形式
				a.href = img.src;
				//PNGファイル名の命名
				a.download = "picture";
				a.innerHTML = "ダウンロード";

				if( id === undefined ){
					//id="thumbnails"のdiv要素の子要素にa要素を追加
					document.getElementsByTagName( "body" )[0].appendChild(a);
				} else {

					document.getElementsByID( id ).appendChild(a);

				}

			}

		});

	}

}












///////////////////////////////////////////////////
//Mathクラスのプロパティ・メソッドを単独定義
//////////////////////////////////////////////////
var E = Math.E;
var LN10 = Math.LN10;
var LN2 = Math.LN2;
var LOG10E = Math.LOG10E;
var LOG2E = Math.LOG2E;
var PI = Math.PI;
var SQRT1_2 = Math.SQRT1_2;
var SQRT2 = Math.SQRT2;

function abs(x){
	return Math.abs(x);
}
function pow(x, n){
	return Math.pow(x , n);
}
function acos(x){
	return Math.acos(x);
}
function asin(x){
	return Math.asin(x);
}
function atan(x){
	return Math.atan(x);
}
function atan2(x){
	return Math.atan2(x);
}
function cos(theta){
	return Math.cos(theta);
}
function sin(theta){
	return Math.sin(theta);
}
function tan(theta){
	return Math.tan(theta);
}
function exp(x){
	return Math.exp(x);
}
function sqrt(x){
	return Math.sqrt(x);
}
function exp(x){
	return Math.exp(x);
}
function exp(x){
	return Math.exp(x);
}
function log(x){
	return Math.log(x);
}
