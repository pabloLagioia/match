M.registerEntity("ship", function() {
  
  var ship = new M.Entity();
  
	ship.has("location").set(M.getCenter().x, M.getCenter().y);
	ship.has("direction").set(0, -1);
	ship.has("acceleration", 0.02);
	ship.has("deceleration", 0.03);
	ship.has("speed", 0);
	ship.has("maxSpeed", 6);
	ship.has("minSpeed", -1);
	ship.has("canGoReverse", false);
	
	ship.has("rotation", 0);
	ship.has("rotationSpeed", 0.025);
	ship.has("rotationSpeedVariation", 0.1); // 10%

	ship.has("keyboardMapping", {
		up: "up", left: "left", right: "right", down: "down"
	});
  
  ship.shows("base").as("sprite").set({
    "fill": "ship"
  });
  
  ship.does("fixViewsToEntity");
  
  // ship.does("followCamera");
  
  return ship;
  
});