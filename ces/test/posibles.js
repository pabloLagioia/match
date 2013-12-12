var tank = new M.renderers.Sprite("tank");

tank.addAttribute("maxSpeed", engine1.maxSpeed);
tank.addAttribute("acceleration", engine1.acceleration);
tank.addAttribute("deceleration", engine1.deceleration);
tank.addAttribute("speed", 0);
tank.addAttribute("cannon", new M.renderers.Sprite("cannon"));
tank.addAttribute("missileLauncher", new M.renderers.Sprite("missileLauncher", "0%", "90%"));
tank.addAttribute("missileLauncher", new M.renderers.Sprite("missileLauncher", "90%", "90%"));
tank.addAttribute("direction", new attributes.Direction());
tank.addAttribute("rotationSpeed", engine.rotationSpeed);

tank.addBehaviour(increaseSpeedKeyBinding);
tank.addBehaviour(fixObjectToBoundsInX);
tank.addBehaviour(fixObjectToBoundsInY);
tank.addBehaviour(function () {
	//Fire main cannon
});
tank.addBehaviour(rotateUsingRotationSpeed);

M.definePrototype("Tank", tank);

var tankB = M.create("Tank");


/*****************************************************************************************************/

M.defineEntity("Tank": {
	attributes: {
		maxSpeed: engine1.maxSpeed,
		acceleration: engine1.acceleration,
		deceleration: engine1.deceleration,
		speed: 0,
		cannon: new M.renderers.Sprite("cannon", ),
		missileLauncher1: new M.renderers.Sprite("missileLauncher", "0%", "90%"),
		missileLauncher2: new M.renderers.Sprite("missileLauncher", "90%", "90%"),
		direction: new attributes.Direction(),
		rotationSpeed: engine.rotationSpeed,
	},
	behaviours: [
		increaseSpeedKeyBinding,
		fixObjectToBoundsInX,
		fixObjectToBoundsInY,
		function () {
			//Fire main cannon
		},
		rotateUsingRotationSpeed
	]
});

var tank = M.create("Tank");