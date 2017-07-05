M.registerEntity("car", function (fillStyle) {

	var car = new M.Entity();

	function onKeyboard(e, a, v, input) {

		var keysDown = input.keyboard.keysDown;
	  var mappings = a.get("keyboardMapping");
			
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

			var	rotationSpeed = a.get("rotationSpeed");
			var rotation = a.get("rotation") - rotationSpeed;

			a.set("rotation", rotation);
			a.set("direction", M.math2d.getRotatedVertex(a.get("direction"), -rotationSpeed));

		} else if ( keysDown[mappings.right] ) {

			var	rotationSpeed = a.get("rotationSpeed");
			var rotation = a.get("rotation") + rotationSpeed;

			a.set("rotation", rotation);
			a.set("direction", M.math2d.getRotatedVertex(a.get("direction"), rotationSpeed));

		}

	}

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

	//VIEWS	
  car.shows("base").as("sprite").set({
    "fill": fillStyle
  });
  
	//BEHAVIOURS	
	car.does("accelerate");
	
	car.does("decelerate");
	
	car.does("listenToKeyboard", onKeyboard);
	
	car.does("moveWithSpeedAndDirection");
	
	car.does("fixViewsToEntity");
	
  car.does("collide");
    
  car.does("cutSpeedToHalfOnCollision", function(e, a,b ) {
	
		if (a.get("manifold")) {
			a.set("speed", a.get("speed") / 2);
		}
	
  });
  
  car.does("bounceOnCollision");

  // car.does("stopOnCollision");
	
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