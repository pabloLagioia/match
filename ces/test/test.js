var car, spaceShip;

function main() {

	function moveBasedOnSpeed(obj) {
		var speed = obj.attributes.speed;
		obj.offsetX(speed.x);
		obj.offsetY(speed.y);
	}
	function moveBasedOnSpeedAndDirection(obj) {
		obj.offset(obj.attributes.speed.x * obj.attributes.direction.x, obj.attributes.speed.y * obj.attributes.direction.y);
	}
	function moveOnKeyDownUsingSpeed(obj) {
		if ( M.keyboard.keysDown.up ) {
			obj.attributes.speed.y += 0.01;
		} else if (M.keyboard.keysDown.down) {
			obj.attributes.speed.y -= 0.01;
		}
	}
	function accelerateOnKeyDown(obj) {
		if ( M.keyboard.keysDown[obj.increaseSpeedKeyBinding] ) {
			obj.addBehaviour(increaseSpeedBasedOnAccelerationAndMaxSpeed);
			obj.removeBehaviour(decreaseSpeedBasedOnAccelerationAndMaxSpeed);
		} else if (M.keyboard.keysDown[obj.decreaseSpeedKeyBinding]) {
			obj.removeBehaviour(increaseSpeedBasedOnAccelerationAndMaxSpeed);
			obj.addBehaviour(decreaseSpeedBasedOnAccelerationAndMaxSpeed);
		}
	}
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

	function centerCannon(obj) {
		obj.children[0].setLocation(obj._x, obj._y);
	}

	function Vector2d(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	M.defineAttribute("Speed", Vector2d);
	M.defineAttribute("Acceleration", Vector2d);

	M.defineBehaviour("increaseSpeedOnKeyDown", increaseSpeedOnKeyDown);
	M.defineBehaviour("increaseSpeedBasedOnAccelerationAndMaxSpeed", increaseSpeedBasedOnAccelerationAndMaxSpeed);
	M.defineBehaviour("centerCannon", centerCannon);
	
	M.defineEntity("Tank", function () {

		var attr = M.game.attributes,
			behaviours = M.game.behaviours,
			Sprite = M.renderers.Sprite,
			tank = new Sprite("tank"),
			cannon = new Sprite("tank");

		tank.addAttribute("speed", new attr.Speed);

		tank.setFrameIndex(0);

		cannon.setFrameIndex(1);

		tank.pushChild(cannon, 10, 10);

		tank.addBehaviour(moveBasedOnSpeed);
		tank.addBehaviour(moveOnKeyDownUsingSpeed);
		// tank.addBehaviour(centerCannon);

		return tank;

	});


	M.sprites.load({
		"tank": {
			source: "tank.png",
			frames: [
				{x: 0, y: 0, width: 73, height: 116},
				{x: 74, y: 0, width: 47, height: 116}
			]
		}
	}, function() {

		var layer = M.createLayer(),
			tank = M.game.entities.Tank();

		tank.setLocation(M.getSceneCenter().x , M.getSceneCenter().y);
		tank.children[0].setLocation(M.getSceneCenter().x , M.getSceneCenter().y);

		layer.push(tank);

	});

}