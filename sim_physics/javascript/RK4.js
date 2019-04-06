////////////////////////////////////////////////////////////////////
// ルンゲクッタ法
////////////////////////////////////////////////////////////////////
//ルンゲクッタ法による次ステップの計算
function RK4 ( dt, t, r, v ){

	var v1 = RK4.V( t, r, v );
	var a1 = RK4.A( t, r, v );

	var _v1 = new Vector3( r.x + v1.x*dt/2, r.y + v1.y*dt/2, r.z + v1.z*dt/2 );
	var _a1 = new Vector3( v.x + a1.x*dt/2, v.y + a1.y*dt/2, v.z + a1.z*dt/2 );
	var v2 = RK4.V( t + dt/2, _v1, _a1 );
	var a2 = RK4.A( t + dt/2, _v1, _a1 );

	var _v2 = new Vector3( r.x + v2.x*dt/2, r.y + v2.y*dt/2, r.z + v2.z*dt/2 );
	var _a2 = new Vector3( v.x + a2.x*dt/2, v.y + a2.y*dt/2, v.z + a2.z*dt/2 );
	var v3 = RK4.V( t + dt/2, _v2, _a2 );
	var a3 = RK4.A( t + dt/2, _v2, _a2 );

	var _v3 = new Vector3( r.x + v3.x*dt, r.y + v3.y*dt, r.z + v3.z*dt );
	var _a3 = new Vector3( v.x + a3.x*dt, v.y + a3.y*dt, v.z + a3.z*dt );
	var v4 = RK4.V( t + dt, _v3, _a3 );
	var a4 = RK4.A( t + dt, _v3, _a3 );

	var output_r = new Vector3();
	var output_v = new Vector3();

	output_r.x = dt / 6 *(  v1.x + 2*v2.x + 2*v3.x + v4.x );
	output_r.y = dt / 6 *(  v1.y + 2*v2.y + 2*v3.y + v4.y );
	output_r.z = dt / 6 *(  v1.z + 2*v2.z + 2*v3.z + v4.z );
	output_v.x = dt / 6 *(  a1.x + 2*a2.x + 2*a3.x + a4.x );
	output_v.y = dt / 6 *(  a1.y + 2*a2.y + 2*a3.y + a4.y );
	output_v.z = dt / 6 *(  a1.z + 2*a2.z + 2*a3.z + a4.z );

	return { r : output_r, v : output_v };
}
//加速度ベクトル
RK4.A = function( t, r, v ){
	return new Vector3();
}
//速度ベクトル
RK4.V = function( t, r, v ){
	return v.clone();
}