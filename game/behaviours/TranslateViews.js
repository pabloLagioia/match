M.registerBehaviour("translateViews", function(e, a, v) {

		var location = a.get("location"),
			offsetX = 0,
			offsetY = 0;

		if ( this.location == undefined ) {
			this.location = new Object();
			this.location.x = 0;
			this.location.y = 0;
		}

		if ( location.x != this.location.x ) {
			offsetX = location.x - this.location.x;
			this.location.x = location.x;
		}
		if ( location.y != this.location.y ) {
			offsetY = location.y - this.location.y;
			this.location.y = location.y;
		}

		if ( offsetX != 0 || offsetY != 0 ) {

			v.eachValue(function(view) {

				view.offset(offsetX, offsetY);

			});

		}

});