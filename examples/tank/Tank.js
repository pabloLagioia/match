M.registerEntity("tank", function (tile) {

  var tank = new M.Entity({
    "attributes": [
      "location",
      "direction",
      "acceleration",
      "deceleration",
      "speed",
      "maxSpeed",
      "minSpeed",
      "canGoReverse"
    ]
  });
 
  //ATTRIBUTES
	
  tank.attribute("layer", "gameArea");
  tank.attribute("location").set(tile.center.x, tile.center.y);
  tank.attribute("direction").set(0, -1);
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
  tank.has("turretDirectionVector").as("direction").set(0, -1);

  tank.has("lastTimeFire", 0);
  tank.has("reloadTime", 1500);

  tank.has("keyboardMapping", {
    up: "up",
    left: "left",
    right: "right",
    down: "down",
    rotateTurretLeft: "a",
    rotateTurretRight: "s",
    fire: "d"
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

  tank.does("rotateTurret", function (entity, attributes, views) {

    var turretRotation = attributes.get("turretRotation"),
      turretRotationSpeed = attributes.get("turretRotationSpeed") * attributes.get("turretDirection"),
      turretBase = views.get("turretBase"),
      cannon = views.get("cannon");

    if (turretRotation != this.previousTurretRotation) {

      turretBase.offsetRotation(turretRotationSpeed);
      cannon.offsetRotation(turretRotationSpeed, turretBase._x, turretBase._y);

      this.previousTurretRotation = turretRotation;

    }

  });

  tank.does("fixViewsToEntity");

  tank.does("accelerate");

  tank.does("deccelerate");

  tank.registerBehaviour("reload", function (e, a, views) {
    e.doesnt("reload");
    setTimeout(function () {
      e.does("expectToFire");
    }, a.get("reloadTime"));
  });

  tank.registerBehaviour("fire", function (e, a, views) {

    e.doesnt("fire");

    var turretDirection = a.get("turretDirectionVector"),
      location = a.get("location");
		
    //CREATE BULLET AND ADD IT TO THE LAYER
    var bullet = M.game.entities.bullet();
    bullet.attribute("direction").set(turretDirection.x, turretDirection.y);
    bullet.attribute("location").set(location.x, location.y);
    bullet.has("rotation", a.get("turretRotation"));
    M.add(bullet).to("gameArea");

  });

  tank.registerBehaviour("expectToFire", function (e, a, v, input) {

    var keysDown = input.keyboard.keysDown,
      mappings = a.get("keyboardMapping");

    if (keysDown[mappings.fire] || input.touch.ended()) {
      e.doesnt("expectToFire");
      e.does("fire");
      e.does("reload");
    }

  });

  tank.does("expectToFire");

  tank.does("listenToKeyboard", function (e, a, v, input) {

    var keysDown = input.keyboard.keysDown,
      mappings = a.get("keyboardMapping");

    if (keysDown[mappings.up]) {
      a.set("isAccelerating", true);
      a.set("isDecelerating", false);
    } else if (keysDown[mappings.down]) {
      a.set("isDecelerating", true);
      a.set("isAccelerating", false);
    } else {
      a.set("isAccelerating", false);
      a.set("isDecelerating", false);
    }
    if (keysDown[mappings.left]) {
      var rotationSpeed = a.get("rotationSpeed"),
        rotation = a.get("rotation") - rotationSpeed;
      a.set("rotation", rotation);
      a.set("direction", M.math2d.getRotatedVertex(a.get("direction"), -rotationSpeed));
    } else if (keysDown[mappings.right]) {
      var rotationSpeed = a.get("rotationSpeed"),
        rotation = a.get("rotation") + rotationSpeed;
      a.set("rotation", rotation);
      a.set("direction", M.math2d.getRotatedVertex(a.get("direction"), rotationSpeed));
    }
    if (keysDown[mappings.rotateTurretRight]) {

      var rotationSpeed = a.get("turretRotationSpeed"),
        rotation = a.get("turretRotation") + rotationSpeed,
        turretDirectionVector = a.get("turretDirectionVector");

      a.set("turretRotation", rotation);
      a.set("turretDirection", 1);

      turretDirectionVector = M.math2d.getRotatedVertex(turretDirectionVector, rotationSpeed);

      a.set("turretDirectionVector", turretDirectionVector);

    } else if (keysDown[mappings.rotateTurretLeft]) {

      var rotationSpeed = a.get("turretRotationSpeed"),
        rotation = a.get("turretRotation") - rotationSpeed,
        turretDirectionVector = a.get("turretDirectionVector");

      a.set("turretRotation", rotation);
      a.set("turretDirection", -1);

      turretDirectionVector = M.math2d.getRotatedVertex(turretDirectionVector, -rotationSpeed);

      a.set("turretDirectionVector", turretDirectionVector);

    }

  });

  // tank.does("collide");
  tank.does("actOnCollision", function (e, a) {

    var manifold = a.get("manifold");

    if (manifold) {

      var speed = a.get("speed"),
        direction = a.get("direction"),
        location = a.get("location");

      location.offset(direction.x * -speed, direction.y * -speed);

      //determine if the object collided because it was rotated

    }

  });
  tank.does("followCamera");
	
  tank.does("moveWithSpeedAndDirection");

  tank.does("listenToMouseOver", function (e, a, v, p) {
    var mouse = p.mouse;

  });

  return tank;

});