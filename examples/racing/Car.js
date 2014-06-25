M.registerEntity("car", function () {

	var car = new M.Entity();

	//ATTRIBUTES
	
	car.has("location");
	car.has("direction").set(0, -1);
	car.has("acceleration", 0.02);
	car.has("deceleration", 0.03);
	car.has("speed", 0);
	car.has("maxSpeed", 6);
	car.has("minSpeed", -1);
	car.has("canGoReverse", false);
	
	car.has("rotation", 0);
	car.has("rotationSpeed", 0.025);
	car.has("rotationSpeedVariation", 0.1); // 10%

	car.has("keyboardMapping", {
		up: "up", left: "left", right: "right", down: "down"
	});

	car.has("collisionGroup", 0);
	car.has("preventMoveOnCollision", true);

	//VIEWS
	
	car.shows("base").as("rectangle").set({
		x: 0, y: 0, color: "brown", width: 35, height: 50
	});		
	car.shows("front").as("rectangle").set({
		x: 0, y: -20, color: "yellow", width: 20, height: 10
	});
	
	//BEHAVIOURS
	
	// car.does("compensateRotationSpeed", function(e,a) {
		
		// var rotationSpeed = a.get("rotationSpeed");
		
	// });
	
	car.does("accelerate");
	
	car.does("deccelerate");
	
	car.does("listenToKeyboard", function(e, a, v, input) {
	
		var keysDown = input.keyboard.keysDown,
			mappings = a.get("keyboardMapping");
			
		if ( keysDown[mappings.up] ) {
			a.set("isAccelerating", true);
			a.set("isDecelerating", false);
		} else if ( keysDown[mappings.down] ) {
			a.set("isDecelerating", true);
			a.set("isAccelerating", false);
		} else {
			a.set("isAccelerating", false);
			a.set("isDecelerating", false);
		}
		if ( keysDown[mappings.left] ) {
			var	rotationSpeed = a.get("rotationSpeed"),
				rotation = a.get("rotation") - rotationSpeed;
			a.set("rotation", rotation);
			a.set("direction", M.math2d.getRotatedVertex(a.get("direction"), -rotationSpeed));
		} else if ( keysDown[mappings.right] ) {
			var	rotationSpeed = a.get("rotationSpeed"),
				rotation = a.get("rotation") + rotationSpeed;
			a.set("rotation", rotation);
			a.set("direction", M.math2d.getRotatedVertex(a.get("direction"), rotationSpeed));
		}
	});
	
	car.does("collide");
	
	car.does("moveWithSpeedAndDirection");
	
	car.does("fixViewsToEntity");
	
	// car.does("followCamera");
	
	// car.does("updateHud", function(e, a) {
		// if ( this.tacometer == undefined ) {
			// this.tacometer = document.getElementById("tacometer");
		// } else {
			// this.tacometer.innerHTML = Math.floor(a.get("speed")) + "mph";
		// }
		// if ( this.camera == undefined ) {
			// this.camera = document.getElementById("camera");
		// } else {
			// this.camera.innerHTML = Math.round(M.renderer.camera._x) + ": " + Math.round(M.renderer.camera._y);
		// }
	// });

	return car;

});