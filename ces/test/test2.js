var car = M.create("Car"),
	spaceShip = M.create("SpaceShip"),
	spaceShip2 = M.create("SpaceShip");

function main() {

	var engine1 = {
		maxSpeed: 100,
		acceleration: 6,
		deceleration: 4
	}

	// var car = new M.renderers.Sprite("car");

	// car.addAttribute("maxSpeed", engine1.maxSpeed);
	// car.addAttribute("acceleration", engine1.acceleration);
	// car.addAttribute("deceleration", engine1.deceleration);
	// car.addAttribute("speed", 0);
	
	// car.addAttributes(engine1);

	// car.addBehaviour(increaseSpeedKeyBinding);
	// car.addBehaviour(fixObjectToBoundsInX);
	// car.addBehaviour(fixObjectToBoundsInY);

	M.define("attribute", "spacial.velocity", function() {
		return {
			x: 0, y: 0
		}
	});
	M.define("behaviour", "spacial.move.up", function(obj, attributes) {
		return obj.offsetY(attributes.velocity.y);
	});
	M.define("behaviour", "spacial.move.down", function(obj, attributes) {
		return obj.offsetY(-attributes.velocity.y);
	});
	M.define("entity", "Tank", function(M, game, attributes, behaviours) {
		var car = new M.renderers.Sprite("mustang");

		car.addAttribute("maxSpeed", engine1.maxSpeed);
		car.addAttribute("acceleration", engine1.acceleration);
		car.addAttribute("deceleration", engine1.deceleration);
		car.addAttribute("speed", 0);
		
		car.addAttributes(engine1);

		car.addBehaviour(increaseSpeedKeyBinding);
		car.addBehaviour(fixObjectToBoundsInX);
		car.addBehaviour(fixObjectToBoundsInY);		

		return car;
	});

	M.create("Tank");




	function increaseSpeedOnKeyDown(obj) {
		if ( M.keyboard.keysDown[obj.increaseSpeedKeyBinding] ) {
			obj.addBehaviour(increaseSpeedBasedOnAccelerationAndMaxSpeed);
			obj.removeBehaviour(decreaseSpeedBasedOnAccelerationAndMaxSpeed);
		} else if (M.keyboard.keysDown[obj.decreaseSpeedKeyBinding]) {
			obj.removeBehaviour(increaseSpeedBasedOnAccelerationAndMaxSpeed);
			obj.addBehaviour(decreaseSpeedBasedOnAccelerationAndMaxSpeed);
		}
	}
	function increaseSpeedBasedOnAccelerationAndMaxSpeed(obj) {
		obj.speed += obj.acceleration;
		if ( obj.speed > obj.maxSpeed ) {
			obj.speed = obj.maxSpeed;
		}
	}
	function fixObjectToBoundsInX(obj) {
		if ( obj._x > obj.bounds.maxX ) {
			obj.setX(obj.bound.maxX);
		}
		if ( obj.location.x < obj.bounds.minX ) {
			obj.location.x = obj.bound.minX;
		}
	}
	function fixObjectToBoundsInY(obj) {
		if ( obj.location.y > obj.bounds.maxY ) {
			obj.location.y = obj.bound.maxY;
		}
		if ( obj.location.y < obj.bounds.minY ) {
			obj.location.y = obj.bound.minY;
		}
	}
	function rotateObject(obj) {

	}


	M.registerGameAttributes({
		Location: function(x, y) {
			this.x = x || 0;
			this.y = y || 0;
		},
		Speed: function (x, y) {
			this.x = x || 0;
			this.y = y || 0;
		},
		Deceleration: function () {
			this.x = 1;
			this.y = 1;
		},
		Acceleration: function () {
			this.x = 0;
			this.y = 0;
		},
		MaxSpeed: function () {
			this.x = 4;
			this.y = 4;
		}
	});

	M.registerGameBehaviours({
		moveWithKeyboard: function(attr) {
			if ( M.keyboard.keysDown.left ) {
				attr.acceleration.x = -1;
			} else if ( M.keyboard.keysDown.right ) {
				attr.acceleration.x = 1;
			} else {
				attr.acceleration.x = 0;
			}
			if ( M.keyboard.keysDown.up ) {
				attr.acceleration.y = -1;
			} else if ( M.keyboard.keysDown.down ) {
				attr.acceleration.y = 1;				
			} else {
				attr.acceleration.y = 0;
			}
		},
		moveSideWards: function(attr) {
			attr.location.x += attr.speed.x;
			attr.layer.needsRedraw = true;
		},
		accelerate: function(attr) {
			if ( attr.speed.y < attr.maxSpeed.y ) {
				attr.speed.y += attr.acceleration.y;
			}
			if ( attr.speed.x < attr.maxSpeed.x ) {
				attr.speed.x += attr.acceleration.x;
			}
		},
		decelerate: function(attr) {
			if ( attr.speed.y > 0 ) {
				attr.speed.y -= attr.deceleration.y;
			} else {
				attr.speed.y = 0;
			}
			if ( attr.speed.x > 0 ) {
				attr.speed.x -= attr.deceleration.x;
			} else {
				attr.speed.x = 0;
			}
		},
		moveUpDown: function(attr) {
			attr.location.y += attr.speed.y;
		}
	});

	var behaviours = M.game.behaviours,
		attributes = M.game.attributes;

	// M.registerGameEntity("Car", function() {
	// 	this.addAttribute("location", new attributes.Location(0, 0));
	// 	this.addAttribute("speed", new attributes.Speed);
	// 	this.addAttribute("maxSpeed", new attributes.MaxSpeed);
	// 	this.addAttribute("acceleration", new attributes.Acceleration);
	// 	this.addAttribute("deceleration", new attributes.Deceleration);
	// 	this.addBehaviours(behaviours.moveWithKeyboard);
	// 	this.addBehaviours(behaviours.moveUpDown);
	// 	this.addBehaviours(behaviours.accelerate);
	// });

	// M.registerGameEntity("SpaceShip", function() {
	// 	this.addAttribute("location", new attributes.Location(0, 0));
	// 	this.addAttribute("speed", new attributes.Speed);
	// 	this.addAttribute("maxSpeed", new attributes.MaxSpeed);
	// 	this.addAttribute("acceleration", new attributes.Acceleration);
	// 	this.addAttribute("deceleration", new attributes.Deceleration);
	// 	this.addBehaviours(behaviours.moveWithKeyboard);
	// 	this.addBehaviours(behaviours.moveUpDown);
	// 	this.addBehaviours(behaviours.accelerate);
	// });

	M.defineEntity("Car", {
		attributes: {
			location: new attributes.Location(0, 0),
			speed: new attributes.Location(0, 0),
			maxSpeed: new attributes.Location(0, 0),
			acceleration: new attributes.Location(0, 0),
			deceleration: new attributes.Location(0, 0)
		}
	});
	M.defineEntity("SpaceShip");

	car = M.create("Car"),
	spaceShip = M.create("SpaceShip");
	spaceShip2 = M.create("SpaceShip");

	spaceShip.addAttribute("location", new attributes.Location(10, 10));
	spaceShip2.addAttribute("location", new attributes.Location(4, 4));


	car.addAttribute("shadow", new M.rendering.attributes.Shadow());
	car.addAttribute("fillStyle", new M.rendering.attributes.FillStyle("Car"));
	car.addBehaviour(M.getRenderer("sprite"));


}