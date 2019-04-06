/// <reference path="./lib/Euler_method.ts" />
/// <reference path="./demo/RK4_UniformCircularMotion.ts" />

declare var Chart: any;
declare var Plot2D: any;

window.addEventListener("load", () => {
    	//「Plot2D」クラスのインスタンスを生成
        let plot2D = new Plot2D( "canvas-frame_graph" );
	plot2D.options.axesDefaults.pad = 1;
	plot2D.options.axesDefaults.labelOptions.fontSize = "25pt";
	plot2D.options.axesDefaults.tickOptions.fontSize = "20pt";
	plot2D.options.axes.xaxis.label = '時刻 [t]';
	plot2D.options.axes.yaxis.label = 'x座標 [m]';
	plot2D.options.axes.yaxis.labelOptions = { angle: -90 };   //ラベル回転角
//	plot2D.options.axes.yaxis.tickOptions = { formatString : '%.1e'}
	plot2D.options.seriesDefaults.lineWidth = 6.0;
	plot2D.options.seriesDefaults.markerOptions.show = true;
	plot2D.options.legend.show = true;     //凡例の有無
	plot2D.options.legend.location = 'se'; //凡例の位置

	plot2D.options.axes.xaxis.min = 0;
	plot2D.options.axes.xaxis.max = 10;
	plot2D.options.axes.xaxis.tickInterval = 1;

	plot2D.options.axes.yaxis.min = -1.2;
	plot2D.options.axes.yaxis.max = 1.2;
	plot2D.options.axes.yaxis.tickInterval = 0.2;
    

    var series = []; //データ列オプション用配列
    series.push({
        showLine: true, //線描画の有無
        label: "解析解", //凡例の設定
        markerOptions: {
            show: false
        } //点描画の有無
    });

    let M = 200;

    let R = 1;
    let omega = 2.0 * Math.PI / 10;
    let t_min = 0;
    let t_max = 10;
    var DeltaTs = [1, 0.5, 0.1];

    //解析解
    var data_exact = [];
    for (var j = 0; j <= M; j++) {
        var t = t_min + (t_max - t_min) / M * j;
        var x = R * Math.cos(omega * t);
        data_exact.push([t, x]);
    }
    plot2D.pushData(data_exact);

    //Euler Method
    // let em = new EPSE.Euler_method(R, omega, t_max, dt);
    // em.Calculate();
    // let result = em.data();


    for (var m = 0; m < DeltaTs.length; m++) {
        var dt = DeltaTs[m];
        //RK4
        let rk4 = new EPSE.RK4_UniformCircularMotion(R, omega, t_max, dt);
        rk4.Calculate();
        let result = rk4.data();

        series.push({
            showLine: true, //線描画の有無
            lineWidth: 2.0,
            label: "Δt = " + dt, //凡例の設定
            markerOptions: {
                size: 14,
                show: true //点描画の有無
            }
        });

        plot2D.pushData(result);
    }
    //データ列オプションの代入
    plot2D.options.series = series;
    //線形プロット
    plot2D.plot();

    //グラフ画像データダウンロードイベントの登録
    plot2D.initGraphDownloadEvent();

});