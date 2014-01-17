M.registerBehaviour("accelerate", function(e, a) {
	if ( a.get("isAccelerating") ) {
	
		var speed = a.get("speed") + a.get("acceleration"),
			maxSpeed = a.get("maxSpeed");
		
		if ( speed > maxSpeed ) {
			speed = maxSpeed;
		}
	
		a.set("speed", speed);
		
	}
});