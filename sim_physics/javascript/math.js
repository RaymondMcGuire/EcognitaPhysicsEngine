//////////////////////////////////////////////////////////////////////////////////////////////////////////
// 計算用ライブラリ
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//名前空間
PHYSICS.Math = {};

PHYSICS.Math.getLength = function ( position1, position2 ){ //（Vector3, Vector3）
	return Math.sqrt( PHYSICS.Math.getLengthSq( position1, position2 ) );
}

PHYSICS.Math.getLengthSq = function ( position1, position2 ){ //（Vector3, Vector3）

	return (position1.x-position2.x)*(position1.x-position2.x) + (position1.y-position2.y)*(position1.y-position2.y) +(position1.z-position2.z)*(position1.z-position2.z);

}

//直線の方程式の係数の取得（直線の法線ベクトル, 直線の通過する点）
PHYSICS.Math.getLinearEquation =  function( normal, point ){  //（Vector2, Vector2）
	var a = normal.x;
	var b = normal.y;
	var c = - a * point.x - b * point.y;
	return {a:a, b:b, c:c}; //（ax+by+c=0）
}

//２次元平面の方程式の取得（平面の法線ベクトル, 平面の通過する点）
PHYSICS.Math.getPlaneEquation =  function( normal, point ){  //（Vector3, Vector3）
	var a = normal.x;
	var b = normal.y;
	var c = normal.z;
	var d = - a * point.x - b * point.y - c * point.z;
	return {a:a, b:b, c:c, d:d}; //（ax+by+cz+d=0）
}

//２次元平面の法線ベクトルを取得する（平面の法線ベクトル, 平面の通過する点）
PHYSICS.Math.getTangentVectors = function( normal, point ){  //（Vector3, Vector3）
	var term = PHYSICS.Math.getPlaneEquation( normal, point );
	var a = term.a;
	var b = term.b;
	var c = term.c;
	var d = term.d;

	var tx = new THREE.Vector3( -c, 0, a).normalize();
	var ty = new THREE.Vector3( 0, -c, b).normalize();
	var t1 = tx.clone();
	var t2 = new THREE.Vector3( a*b, -a*a-c*c, b*c ).normalize();

	return { tx:tx, ty:ty, t1:t1, t2:t2 };
}

//２次元空間中の任意の点から直線に下ろした垂線ベクトル（直線のパラメータ,任意の位置ベクトル）
PHYSICS.Math.getPerpendicularVectorFromLinearEquation2 =  function( term, position ){  //（{a,b,c}, Vector2）

	//(1)の方法
	var beta = ( term.a * position.x + term.b * position.y + term.c ) / Math.sqrt( term.a * term.a + term.b * term.b );

	var n = new THREE.Vector2( term.a, term.b ).normalize();

	var R = n.clone().multiplyScalar( beta ); 

	return R; 

/* /////////////////////////////////////////////////// 
	//(2)の方法
	var r0 = position;

	var P = new THREE.Vector3( 0, - term.c / term.b );
	var n = new THREE.Vector3( term.a, term.b ).normalize();

	var r0_m_P =  new THREE.Vector3().subVectors( r0, P );

	var beta = r0_m_P.dot(n);

	var R = n.clone().multiplyScalar( beta ); 

	return R;
/////////////////////////////////////////////////// */
}

//２次元空間中の任意の点から直線に下ろした垂線の足の位置ベクトル（直線のパラメータ,任意の位置ベクトル）
PHYSICS.Math.getFootVectorOfPerpendicularFromLinearEquation2 =  function( term, position ){  //（{a,b,c}, Vector2）
	var R = PHYSICS.Math.getPerpendicularVectorFromLinearEquation2( term, position );
	var A = position.clone().sub(R);
	return A;
}

//２次元空間中の任意の点と直線との距離（直線のパラメータ,任意の位置ベクトル）
PHYSICS.Math.getDistanceBetweenPointAndLinearEquation2 =  function( term, position ){  //（{a,b,c}, Vector2）
	var R = PHYSICS.Math.getPerpendicularVectorFromLinearEquation2( term, position );
	return R.length();
}


///////////////////////////////////////////////////////////////////////////////////////////
//３次元空間中の任意の点から直線に下ろした垂線ベクトル（直線のパラメータ,任意の位置ベクトル）
PHYSICS.Math.getPerpendicularVectorFromLinear3 =  function( vector1, vector2, position ){  //（Vector3, Vector3, position）

	var barR = new THREE.Vector3().subVectors( position, vector1 );
	var V = new THREE.Vector3().subVectors( vector2, vector1 );

	var barR_dot_V_p_Vsq = barR.dot( V ) / V.lengthSq();

	var R = barR.sub( V.multiplyScalar( barR_dot_V_p_Vsq ) );

	return R;
}

//３次元空間中の任意の点から直線に下ろした垂線の足の位置ベクトル（直線のパラメータ,任意の位置ベクトル）
PHYSICS.Math.getFootVectorOfPerpendicularFromLinear3 =  function( vector1, vector2, position ){ 
	var R = PHYSICS.Math.getPerpendicularVectorFromLinear3( vector1, vector2, position );
	var A = position.clone().sub(R);
	return A;
}

//３元空間中の任意の点と直線との距離（直線上の点１, 直線上の点２, 任意の位置ベクトル）
PHYSICS.Math.getDistanceBetweenPointAndLinear3 =  function( vector1, vector2, position ){ 
	var R = PHYSICS.Math.getPerpendicularVectorFromLinear3( vector1, vector2, position );
	return R.length();
}



///////////////////////////////////////////////////////////////////////////////////////////
//３次元空間中の任意の点から平面に下ろした垂線ベクトル（平面のパラメータ,任意の位置ベクトル）
PHYSICS.Math.getPerpendicularVectorFromPlaneEquation =  function( term, position ){  //（{a,b,c,d}, Vector3）
	//(1)の方法
	var gamma = ( term.a*position.x + term.b*position.y + term.c*position.z + term.d )/Math.sqrt(term.a*term.a + term.b*term.b + term.c*term.c );
	var n = new THREE.Vector3( term.a, term.b, term.c ).normalize();
	var R = n.clone().multiplyScalar( gamma ); 
	return R; 

/* //////////////////////////////
	//(2)の方法
	var r0 = position;

	var P = new THREE.Vector3( 0, 0, - term.d / term.c );
	var n = new THREE.Vector3( term.a, term.b, term.c ).normalize();

	var r0_m_P =  new THREE.Vector3().subVectors( r0, P );

	var gamma = r0_m_P.dot(n);

	var R = n.clone().multiplyScalar( gamma ); 

	return R;
///////////////////////////// */

}
//３次元空間中の任意の点から平面に下ろした垂線の足の位置ベクトル（平面のパラメータ,任意の位置ベクトル）
PHYSICS.Math.getFootVectorOfPerpendicularFromPlaneEquation =  function( term, position ){ 
	var R = PHYSICS.Math.getPerpendicularVectorFromPlaneEquation( term, position  );
	var A = position.clone().sub( R );
	return A;
}
//３次元空間中の任意の点と平面との距離（平面のパラメータ,任意の位置ベクトル）
PHYSICS.Math.getDistanceBetweenPointAndPlaneEquation =  function( term, position ){  //（{a,b,c,d}, Vector3）
	var R = PHYSICS.Math.getPerpendicularVectorFromPlaneEquation( term, position  );
	return R.length();
}


///////////////////////////////////////////////////////////////////////////////////////////
//３次元空間中の任意の点から平面に下ろした垂線ベクトル（面の法線ベクトル、面の通過点、任意の位置ベクトル）
PHYSICS.Math.getPerpendicularVectorFromPlane = function( normal, point, position ){
	//２次元平面の方程式の取得（ax+by+cz+d=0）
	var term = PHYSICS.Math.getPlaneEquation( normal, point );
	var R = PHYSICS.Math.getPerpendicularVectorFromPlaneEquation( term, position );
	return R;
}
//３次元空間中の任意の点から平面に下ろした垂線の足の位置ベクトル（面の法線ベクトル、面の通過点、任意の位置ベクトル）
PHYSICS.Math.getFootVectorOfPerpendicularFromPlane =  function( normal, point, position ){ 
	var R = PHYSICS.Math.getPerpendicularVectorFromPlane( normal, point, position );
	var A = position.clone().sub( R );
	return A;
}
//３次元空間中の任意の点から平面までの距離の計算（面の法線ベクトル、面の通過点、任意の位置ベクトル）
PHYSICS.Math.getDistanceBetweenPointAndPlane = function( normal, point, position ){
	var R = PHYSICS.Math.getPerpendicularVectorFromPlane( normal, point, position );
	return R.length();
}
//////////////////////////////////////////////////////////////////////////////////
//３次元空間中の直線との交点の位置ベクトル（平面の法線ベクトル, 平面の通過する点, 直線の方向ベクトル, 直線が通過する点）
PHYSICS.Math.getIntersectionVectorOfLineAndPlaneEquation = function( term, directionVector, linePoint  ){  //（Vector3, Vector3, Vector3, Vector3）
/* /////////////////////////////// 
	//(1)の方法
	var r0 =  linePoint;
	var t =  directionVector;
	var tangentVectors = PHYSICS.Math.getTangentVectors( normal, planePoint );
	var t1 = tangentVectors.t1;
	var t2 = tangentVectors.t2;

	var P = new THREE.Vector3( 0, 0, - term.d / term.c );
	var P_m_r0 =  new THREE.Vector3().subVectors( P, r0 );

	var t1_ = t1.clone().multiplyScalar( t.dot( t1 ) );
	var t2_ = t2.clone().multiplyScalar( t.dot( t2 ) );
	var T  = t.clone().sub( t1_ ).sub( t2_ );

	var gamma = P_m_r0.dot( T ) / T.lengthSq();
///////////////////////////// */

	//(2)の方法
	var r0 =  linePoint;
	var t =  directionVector;

	//法線ベクトルの取得
	var n = new THREE.Vector3( term.a, term.b, term.c).normalize();

	var P = new THREE.Vector3( 0, 0, - term.d / term.c );
	var P_m_r0 =  new THREE.Vector3().subVectors( P, r0 );

	var gamma = n.dot( P_m_r0 ) / n.dot( t );
	//垂線の足の位置ベクトル
	var A = r0.clone().add( t.clone().multiplyScalar( gamma ) );
	return A;
}

//３次元空間中の直線との交点の位置ベクトル（平面の法線ベクトル, 平面の通過する点, 直線の方向ベクトル, 直線が通過する点）
PHYSICS.Math.getIntersectionVectorOfLineAndPlane = function( normal, planePoint, directionVector, linePoint  ){  //（Vector3, Vector3, Vector3, Vector3）
	//２次元平面の方程式の取得（ax+by+cz+d=0）
	var term = PHYSICS.Math.getPlaneEquation( normal, planePoint );
	var A = PHYSICS.Math.getIntersectionVectorOfLineAndPlaneEquation ( term, directionVector, linePoint );
	return A;
}

///////////////////////////////////////////////////////////////////////////////////
//点対称のベクトルを計算（ベクトル, 点）
PHYSICS.Math.getPointSymmetryVector = function ( vector, point ){
	var r0 = point.clone(); 
	var P = vector;
	var Q = r0.multiplyScalar( 2 ).sub( P );
	return Q;
}

//線対称のベクトルを計算（ベクトル, 線方向ベクトル, 線上の点）
PHYSICS.Math.getLineSymmetryVector = function ( vector1, vector2,  vector ){
	var P =  vector;
	//垂線の足ベクトル
	var A = PHYSICS.Math.getFootVectorOfPerpendicularFromLinear3( vector1, vector2, P );
	var Q = A.multiplyScalar( 2 ).sub( P );
	return Q;
}

//面対称のベクトルを計算（ 面の法線ベクトル、面の通過点, ベクトル）
PHYSICS.Math.getPlaneSymmetryVector = function ( normal, point, vector ){
	var P = vector.clone();
	//垂線の足ベクトル
	var A = PHYSICS.Math.getFootVectorOfPerpendicularFromPlane ( normal, point, P);
	var Q = A.multiplyScalar( 2 ).sub( P );
	return Q;
}


/////////////////////////////////////////////////////////////////////
//ガウス法による連立方程式の解法

PHYSICS.Math.solveSimultaneousEquations = function( M ){

	// 連立数の取得
	var n = M.length;

	// 前進消去（ピボット操作あり）
	for( var k = 0; k < n-1; k++ ){

		var p = k;
		var max = Math.abs( M[k][k] );

		for( var i = k + 1; i < n; i++){  // ピボット選択
			if( Math.abs( M[i][k] ) > max){
				p = i;
				max = Math.abs( M[i][k] );
			}
		}
		if( Math.abs( max ) < 1E-12){
			var ans = [];
			for( var k = 0; k < n; k++ ) ans[k] = 0;
			console.log("前進消去時のピボットが小さすぎます（方程式の数が足りない可能性があります）");
			return ans;
		}
		if( p != k ){
			for(var i = k; i <= n; i++){
				var tmp = M[k][i];
				M[k][i] = M[p][i];
				M[p][i] = tmp;
			}
		}


		for( var i = k + 1; i < n; i++){
			for( var j = k + 1; j <= n; j++){
				M[i][j] = M[i][j] - M[k][j] * M[i][k] / M[k][k];
			}
		}
	}

	//連立方程式の解を格納する配列
	var ans = [];
	// 後退代入
	for( var k = n - 1; k >= 0; k--){
		for( var j = k + 1; j < n; j++){
			M[k][n] = M[k][n] - M[k][j] * ans[j];
		}
		if( Math.abs( M[k][k] ) < 1E-12){
			console.log("前進消去時のピボットが小さすぎます（方程式の数が多すぎる可能性があります）");
			ans[k] = 0;
		} else {
			ans[k] = M[k][n] / M[k][k];
		}

	}

	return ans;
}

/////////////////////////////////////////////////////////////////////
//倍精度行列
THREE.Matrix4d = function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

	this.elements = new Float64Array( 16 );

	var te = this.elements;

	te[0] = ( n11 !== undefined ) ? n11 : 1; te[4] = n12 || 0; te[8] = n13 || 0; te[12] = n14 || 0;
	te[1] = n21 || 0; te[5] = ( n22 !== undefined ) ? n22 : 1; te[9] = n23 || 0; te[13] = n24 || 0;
	te[2] = n31 || 0; te[6] = n32 || 0; te[10] = ( n33 !== undefined ) ? n33 : 1; te[14] = n34 || 0;
	te[3] = n41 || 0; te[7] = n42 || 0; te[11] = n43 || 0; te[15] = ( n44 !== undefined ) ? n44 : 1;

};
THREE.Matrix4d.prototype = THREE.Matrix4.prototype; //new THREE.Matrix4();


///////////////////////////////////
//////////////////////////////////
PHYSICS.temp = {};
PHYSICS.temp.omega = new THREE.Vector3();
PHYSICS.temp.m4 = new THREE.Matrix4d();
PHYSICS.temp.m4_i = new THREE.Matrix4d();
PHYSICS.temp.q = new THREE.Quaternion();

PHYSICS.temp.objects1 = [];
PHYSICS.temp.objects2 = [];
PHYSICS.temp.objects3 = [];
PHYSICS.temp.objects4 = [];

