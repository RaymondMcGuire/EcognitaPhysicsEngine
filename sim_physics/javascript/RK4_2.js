////////////////////////////////////////////////////////////////////
// ルンゲクッタ法
////////////////////////////////////////////////////////////////////
//加速度ベクトル成分
function Ax( t, r, v ){
	return 0;
}
function Ay( t, r, v ){
	return 0;
}
function Az( t, r, v ){
	return 0;
}
//速度ベクトル成分
function Vx( t, r, v ){
	return v.x;
}
function Vy( t, r, v ){
	return v.y;
}
function Vz( t, r, v ){
	return v.z;
}
//ルンゲクッタ法による次ステップの計算
function RK4 ( dt, t, r, v ){
	var vx_1 = Vx( t, r, v );
	var vy_1 = Vy( t, r, v );
	var vz_1 = Vz( t, r, v );
	var ax_1 = Ax( t, r, v );
	var ay_1 = Ay( t, r, v );
	var az_1 = Az( t, r, v );

	var v1 = { x: r.x + vx_1*dt/2, y: r.y + vy_1*dt/2, z: r.z + vz_1*dt/2 };
	var a1 = { x: v.x + ax_1*dt/2, y: v.y + ay_1*dt/2, z: v.z + az_1*dt/2 };
	var vx_2 = Vx( t + dt/2, v1, a1 );
	var vy_2 = Vy( t + dt/2, v1, a1 );
	var vz_2 = Vz( t + dt/2, v1, a1 );
	var ax_2 = Ax( t + dt/2, v1, a1 );
	var ay_2 = Ay( t + dt/2, v1, a1 );
	var az_2 = Az( t + dt/2, v1, a1 );

	var v2 = { x: r.x + vx_2*dt/2, y: r.y + vy_2*dt/2, z: r.z + vz_2*dt/2 };
	var a2 = { x: v.x + ax_2*dt/2, y: v.y + ay_2*dt/2, z: v.z + az_2*dt/2 };
	var vx_3 = Vx( t + dt/2, v2, a2 );
	var vy_3 = Vy( t + dt/2, v2, a2 );
	var vz_3 = Vz( t + dt/2, v2, a2 );
	var ax_3 = Ax( t + dt/2, v2, a2 );
	var ay_3 = Ay( t + dt/2, v2, a2 );
	var az_3 = Az( t + dt/2, v2, a2 );

	var v3 = { x: r.x + vx_3*dt, y: r.y + vy_3*dt, z: r.z + vz_3*dt };
	var a3 = { x: v.x + ax_3*dt, y: v.y + ay_3*dt, z: v.z + az_3*dt };
	var vx_4 = Vx( t + dt, v3, a3 );
	var vy_4 = Vy( t + dt, v3, a3 );
	var vz_4 = Vz( t + dt, v3, a3 );
	var ax_4 = Ax( t + dt, v3, a3 );
	var ay_4 = Ay( t + dt, v3, a3 );
	var az_4 = Az( t + dt, v3, a3 );

	var x  = dt / 6 *(  vx_1 + 2*vx_2 + 2*vx_3 + vx_4 );
	var y  = dt / 6 *(  vy_1 + 2*vy_2 + 2*vy_3 + vy_4 );
	var z  = dt / 6 *(  vz_1 + 2*vz_2 + 2*vz_3 + vz_4 );
	var vx = dt / 6 *(  ax_1 + 2*ax_2 + 2*ax_3 + ax_4 );
	var vy = dt / 6 *(  ay_1 + 2*ay_2 + 2*ay_3 + ay_4 );
	var vz = dt / 6 *(  az_1 + 2*az_2 + 2*az_3 + az_4 );

	return {
		r : { x:x,  y:y,  z:z },
		v : { x:vx, y:vy, z:vz }
	};
}