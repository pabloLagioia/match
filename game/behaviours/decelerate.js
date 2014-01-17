M.registerBehaviour("deccelerate", function(e, a) {
	if ( a.get("isDecelerating") ) {
	
		var speed = a.get("speed") - a.get("deceleration"),
			minSpeed = a.get("minSpeed");
		
		if ( !a.get("canGoReverse") && speed < 0 ) {
			speed = 0;
		}
		
		if ( speed < minSpeed ) {
			speed = minSpeed;
		}
		
		a.set("speed", speed);
	
	}
});