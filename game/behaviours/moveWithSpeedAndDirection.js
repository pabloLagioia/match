M.registerBehaviour("moveWithSpeedAndDirection", function(entity, attributes, views) {
	
	var speed = attributes.get("speed"),
		direction = attributes.get("direction"),
		location = attributes.get("location");
	
	if ( speed != 0 ) {
		if ( attributes.get("manifold") && !attributes.get("preventMoveOnCollision") ) {
			location.offset(speed * direction.x, speed * direction.y);
		} else {
			location.offset(speed * direction.x, speed * direction.y);
		}
	}
			
});