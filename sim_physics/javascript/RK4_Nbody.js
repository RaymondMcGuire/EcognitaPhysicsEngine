////////////////////////////////////////////////////////////////////
// ルンゲクッタ法（多体系）
////////////////////////////////////////////////////////////////////
//ルンゲクッタ法による次ステップの計算
function RK4_Nbody ( dt, t, rs, vs ){
	var N = rs.length;
	//１段目
	var v1s = RK4_Nbody.V( t, rs, vs );
	var a1s = RK4_Nbody.A( t, rs, vs );

	//２段目
	var _v1s = [];
	var _a1s = [];
	for( var i = 0; i < N; i++ ){
		_v1s[ i ] = new Vector3( rs[ i ].x + v1s[ i ].x*dt/2, rs[ i ].y + v1s[ i ].y*dt/2, rs[ i ].z + v1s[ i ].z*dt/2 );
		_a1s[ i ] = new Vector3( vs[ i ].x + a1s[ i ].x*dt/2, vs[ i ].y + a1s[ i ].y*dt/2, vs[ i ].z + a1s[ i ].z*dt/2 );
	}
	var v2s = RK4_Nbody.V( t + dt/2, _v1s, _a1s );
	var a2s = RK4_Nbody.A( t + dt/2, _v1s, _a1s );

	//３段目
	var _v2s = [];
	var _a2s = [];
	for( var i = 0; i < N; i++ ){
		_v2s[ i ] = new Vector3( rs[ i ].x + v2s[ i ].x*dt/2, rs[ i ].y + v2s[ i ].y*dt/2, rs[ i ].z + v2s[ i ].z*dt/2 );
		_a2s[ i ] = new Vector3( vs[ i ].x + a2s[ i ].x*dt/2, vs[ i ].y + a2s[ i ].y*dt/2, vs[ i ].z + a2s[ i ].z*dt/2 );
	}
	var v3s = RK4_Nbody.V( t + dt/2, _v2s, _a2s );
	var a3s = RK4_Nbody.A( t + dt/2, _v2s, _a2s );

	//４段目
	var _v3s = [];
	var _a3s = [];
	for( var i = 0; i < N; i++ ){
		_v3s[ i ] = new Vector3( rs[ i ].x + v3s[ i ].x*dt, rs[ i ].y + v3s[ i ].y*dt, rs[ i ].z + v3s[ i ].z*dt );
		_a3s[ i ] = new Vector3( vs[ i ].x + a3s[ i ].x*dt, vs[ i ].y + a3s[ i ].y*dt, vs[ i ].z + a3s[ i ].z*dt );
	}
	var v4s = RK4_Nbody.V( t + dt, _v3s, _a3s );
	var a4s = RK4_Nbody.A( t + dt, _v3s, _a3s );

	//仕上げ
	var output_rs = [];
	var output_vs = [];

	for( var i = 0; i < N; i++ ){
		output_rs[ i ] = new Vector3();
		output_vs[ i ] = new Vector3();
		output_rs[ i ].x = dt / 6 *(  v1s[i].x + 2*v2s[i].x + 2*v3s[i].x + v4s[i].x );
		output_rs[ i ].y = dt / 6 *(  v1s[i].y + 2*v2s[i].y + 2*v3s[i].y + v4s[i].y );
		output_rs[ i ].z = dt / 6 *(  v1s[i].z + 2*v2s[i].z + 2*v3s[i].z + v4s[i].z );
		output_vs[ i ].x = dt / 6 *(  a1s[i].x + 2*a2s[i].x + 2*a3s[i].x + a4s[i].x );
		output_vs[ i ].y = dt / 6 *(  a1s[i].y + 2*a2s[i].y + 2*a3s[i].y + a4s[i].y );
		output_vs[ i ].z = dt / 6 *(  a1s[i].z + 2*a2s[i].z + 2*a3s[i].z + a4s[i].z );

	}

	return { rs : output_rs, vs : output_vs };
}
//加速度ベクトル
RK4_Nbody.A = function( t, rs, vs ){
	var N = rs.length;

	var outputs = [];
	for( var i = 0; i < N; i++ ){
		outputs[ i ] = new Vector3();
	}

	return outputs;
}
//速度ベクトル
RK4_Nbody.V = function( t, rs, vs ){
	var N = vs.length;

	var output_vs = [];
	for( var i = 0; i < N; i++ ){
		output_vs[ i ] = vs[ i ].clone();
	}

	return output_vs;
}