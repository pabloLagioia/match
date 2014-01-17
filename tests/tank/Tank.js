(function (M) {

	M.game.entities.createTank = function () {

		var tank = new M.Entity();

		//ATTRIBUTES
		
		tank.has("location").set(350, 200);
		tank.has("direction").set(0, -1);
		tank.has("acceleration", 0.01);
		tank.has("deceleration", 0.03);
		tank.has("speed", 0);
		tank.has("maxSpeed", 2);
		tank.has("minSpeed", -1);
		tank.has("canGoReverse", false);
		
		tank.has("rotation", 0);
		tank.has("rotationSpeed", 0.025);
		tank.has("turretRotation", 0);
		tank.has("turretRotationSpeed", 0.05);
		tank.has("turretDirection", 0);

		tank.has("keyboardMapping", {
			up: "up", left: "left", right: "right", down: "down",
			rotateTurretLeft: "a", rotateTurretRight: "s"
		});

		tank.has("damageTaken", 0);
		tank.has("health", 100);

		tank.has("collisionGroup", 0);

		//VIEWS
		
		tank.shows("base").as("rectangle").set({
			x: 0, y: 0, color: "brown", width: 65, height: 100
		});
		tank.shows("leftFuelTank").as("rectangle").set({
			x: -15, y: 40, color: "orange", width: 25, height: 10
		});
		tank.shows("rightfuelTank").as("rectangle").set({
			x: 15, y: 40, color: "orange", width: 25, height: 10
		});
		tank.shows("turretBase").as("rectangle").set({
			x: 0, y: -10, color: "yellow", width: 40, height: 55
		});
		tank.shows("cannon").as("rectangle").set({
			x: 0, y: -72, color: "gray", width: 10, height: 70
		});
		
		//BEHAVIOURS
		
		tank.does("takeDamage", function (e, a) {
			a.set("health", a.get("health") - a.get("damageTaken"));
		});
		
		tank.does("resetDamageTaken", function (e, a) {
			a.set("damageTaken", 0);
		});
		
		tank.does("rotateTurret", function(entity, attributes, views) {

			var turretRotation = attributes.get("turretRotation"),
				turretRotationSpeed = attributes.get("turretRotationSpeed") * attributes.get("turretDirection"),
				turretBase = views.get("turretBase"),
				cannon = views.get("cannon");

			if ( turretRotation != this.previousTurretRotation ) {

				turretBase.offsetRotation(turretRotationSpeed);
				cannon.offsetRotation(turretRotationSpeed, turretBase._x, turretBase._y);

				this.previousTurretRotation = turretRotation;

			}		

		});
		
		tank.does("fixViewsToEntity");
		
		tank.does("accelerate");
		
		tank.does("deccelerate");
		
		tank.does("listenToKeyboard", function(e, a, v, input) {
		
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
			if ( keysDown[mappings.rotateTurretRight] ) {

				var	rotationSpeed = a.get("turretRotationSpeed"),
					rotation = a.get("turretRotation") + rotationSpeed;

				a.set("turretRotation", rotation);
				a.set("turretDirection", 1);

			} else if ( keysDown[mappings.rotateTurretLeft] ) {
			
				var	rotationSpeed = a.get("turretRotationSpeed"),
					rotation = a.get("turretRotation") - rotationSpeed;

				a.set("turretRotation", rotation);
				a.set("turretDirection", -1);

			}

		});
		
		tank.does("collide");
		
		tank.does("moveWithSpeedAndDirection");
		
		// tank.does("followCamera");

		return tank;

	}
	
})(M);