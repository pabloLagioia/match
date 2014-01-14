M.registerBehaviour("moveWithSpeedAndDirection", function(entity, attributes, views) {
	
	var speed = attributes.get("speed"),
		direction = attributes.get("direction"),
		location = attributes.get("location");
	
	if ( speed != 0 ) {
	
		location.prevX = location.x;
		location.prevY = location.y;
	
		location.x += speed * direction.x;
		location.y += speed * direction.y;
		
	}
			
});