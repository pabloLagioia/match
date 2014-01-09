(function (M) {

	M.game.entities.createTank = function () {

		var tank = new M.Entity();

		tank.has("location").set(100, 100);
		tank.has("acceleration", 0.01);
		tank.has("decceleration", 0.01);
		tank.has("speed", 0);
		tank.has("rotation", 0);
		tank.has("rotationSpeed", 0.025);
		tank.has("turretRotation", 0);
		tank.has("turretRotationSpeed", 0.05);
		tank.has("direction").set(0, -1);
		tank.has("turretDirection").as("direction").set(0, -1);
		tank.has("keyboardMapping", {
			up: "up", left: "left", right: "right", down: "down",
			rotateTurretLeft: "a", rotateTurretRight: "s"
		});
		tank.has("collisionGroup", 0);	

		tank.shows("base").as("rectangle").set({
			x: 0, y: 0, color: "brown", width: 65, height: 100
		});
		tank.shows("leftFuelTank").as("rectangle").set({
			x: 0, y: 0, color: "orange", width: 25, height: 10,	pivotX: -28, pivotY: 40
		});
		tank.shows("rightfuelTank", new M.renderers.Rectangle({
			x: 0, y: 0, color: "orange", width: 25, height: 10,
			pivotX: 3, pivotY: 40
		}));
		tank.shows("turretBase", new M.renderers.Rectangle({
			x: 0, y: 0, color: "yellow", width: 40, height: 55,
			pivotX: 0, pivotY: -20
		}));
		tank.shows("cannon", new M.renderers.Rectangle({
			x: 0, y: 0, color: "gray", width: 10, height: 70,
			pivotX: 0, pivotY: -90
		}));
		
		// tank.does("monitorAttributes");
		tank.does("fixViews");
		tank.does("rotateTurret", function(entity, attributes, views) {
		
			var rotation = attributes.get("turretRotation"),
				turretBase = views.get("turretBase"),
				cannon = views.get("cannon");

			turretBase.offsetRotation(rotation);
			cannon.offsetRotation(rotation);
			
		});
		tank.does("accelerate", function(e, a, v, input) {
			if ( a.get("accelerating") ) {
				a.push("speed", a.get("speed") + a.get("acceleration"));
			}
		});
		tank.does("deccelerate", function(e, a, v, input) {
			if ( a.get("deccelerating") ) {
				a.push("speed", a.get("speed") - a.get("decceleration"));
			}
		});
		tank.does("listenToKeyboard", function(e, a, v, input) {
		
			var keysDown = input.keyboard.keysDown,
				mappings = a.get("keyboardMapping");
				
			if ( keysDown[mappings.up] ) {
				a.push("accelerating", true);
				a.push("deccelerating", false);
			} else if ( keysDown[mappings.down] ) {
				a.push("deccelerating", true);
				a.push("accelerating", false);
			} else {
				a.push("accelerating", false);
				a.push("deccelerating", false);
			}
			if ( keysDown[mappings.left] ) {
				var	rotationSpeed = a.get("rotationSpeed"),
					rotation = a.get("rotation") - rotationSpeed;
				a.push("rotation", rotation);
				a.push("direction", M.math2d.getRotatedVertex(a.get("direction"), -rotationSpeed));
			} else if ( keysDown[mappings.right] ) {
				var	rotationSpeed = a.get("rotationSpeed"),
					rotation = a.get("rotation") + rotationSpeed;
				a.push("rotation", rotation);
				a.push("direction", M.math2d.getRotatedVertex(a.get("direction"), rotationSpeed));
			}
			if ( keysDown[mappings.rotateTurretRight] ) {
				var	rotationSpeed = a.get("turretRotationSpeed"),
					rotation = a.get("turretRotation") - rotationSpeed;
				a.push("turretRotation", rotation);
				a.push("turretDirection", M.math2d.getRotatedVertex(a.get("turretDirection"), -rotationSpeed));
			} else if ( keysDown[mappings.rotateTurretLeft] ) {
				var	rotationSpeed = a.get("turretRotationSpeed"),
					rotation = a.get("turretRotation") + rotationSpeed;
				a.push("turretRotation", rotation);
				a.push("turretDirection", M.math2d.getRotatedVertex(a.get("turretDirection"), rotationSpeed));
			}

		});
		
		tank.does("collide");
		
		tank.does("moveWithSpeedAndDirection");
		
		
		return tank;

	}
	
})(M);