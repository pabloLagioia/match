M.registerBehaviour("fixViewsToEntity", function(e, a, v) {

	var rotation = a.get("rotation"),
		location = a.get("location"),
		offsetRotation = 0,
		offsetX = 0,
		offsetY = 0;

	if ( this.rotation == undefined ) {
		this.rotation = 0;
	}

	if ( rotation != this.rotation ) {
		offsetRotation = rotation - this.rotation;
		this.rotation = rotation;
	}

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
	
	v.eachValue(function(view) {

		if ( offsetRotation != 0 ) {

			view.offsetRotation(offsetRotation, location.x, location.y);

		} 

		if ( offsetX != 0 || offsetY != 0 ) {

			view.offset(offsetX, offsetY);

		}

	});

});