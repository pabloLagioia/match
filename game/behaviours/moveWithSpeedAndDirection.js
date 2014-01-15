M.registerBehaviour("moveWithSpeedAndDirection", function(entity, attributes, views) {
	
	var speed = attributes.get("speed"),
		direction = attributes.get("direction"),
		location = attributes.get("location");
	
	if ( speed != 0 ) {
		location.offset(speed * direction.x, speed * direction.y);
	}
			
});