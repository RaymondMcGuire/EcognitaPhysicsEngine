////////////////////////////////////////////////////////////////////
// windowイベントの定義
////////////////////////////////////////////////////////////////////
window.addEventListener("load", function () {

	var anchers = document.querySelectorAll(".open");
	for( var i = 0; i < anchers.length; i++){

		anchers[i].addEventListener("click", function(event){
			var href = this.href;
			var w = window.open( href,'','scrollbars=yes,Width=1280,Height=720');
			w.focus();
			this.href = "";
			event.preventDefault();
			this.href = href;
		})
	}

	var anchers = document.querySelectorAll(".open_graph");
	for( var i = 0; i < anchers.length; i++){

		anchers[i].addEventListener("click", function(event){
			var href = this.href;
			var w = window.open( href,'','scrollbars=yes,Width=1500,Height=900');
			w.focus();
			this.href = "";
			event.preventDefault();
			this.href = href;
		})
	}
});