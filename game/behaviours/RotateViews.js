M.registerBehaviour.does("rotateViews", function(e, a, v) {

	var rotation = a.get("rotation"),
		offsetRotation = 0;

	if ( this.rotation == undefined ) {
		this.rotation = 0;
	}

	if ( rotation != this.rotation ) {
		offsetRotation = rotation - this.rotation;
		this.rotation = rotation;
	}

	if ( offsetRotation != 0 ) {

		//Rotar todos los vertices de las vistas usando el centro "location" como pivote y su propia rotacion
		var location = a.get("location");
		
		v.eachValue(function(view) {

			view.offsetRotation(offsetRotation);

		var x = view._x - location.x,
			y = view._y - location.y,
			rotatedX = M.math2d.getRotatedVertexCoordsX(x, y, offsetRotation),
			rotatedY = M.math2d.getRotatedVertexCoordsY(x, y, offsetRotation);

			view.setLocation(rotatedX + location.x, rotatedY + location.y);

		});

	}

});