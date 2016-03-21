M.registerEntity("ship", function() {
  
  var ship = new M.Entity();
  
	ship.has("location").set(M.getCenter().x, M.getCenter().y);
  ship.attributes.set("destination", new M.Vector2d(M.getCenter().x, M.getCenter().y));
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

  ship.shows("selection").as("rectangle").set({
    "fill": null,
    "strokeStyle": "rgba(255, 255, 255, 1)",
    "width": 64,
    "height": 64,
    "strokeWidth": 2,
    "x": 0,
    "y": 0,
    "visible": false
  });

  ship.shows("selected").as("rectangle").set({
    "fill": null,
    "strokeStyle": "rgba(0, 255, 0, 1)",
    "width": 64,
    "height": 64,
    "strokeWidth": 2,
    "x": 0,
    "y": 0,
    "visible": false
  });
  
  ship.on("mouseIn", function(mouse) {
    if (ship.view("selected").getVisible()) {
      return;
    }
    ship.view("selection").setVisible(true);
  });
  
  ship.on("mouseOut", function(mouse) {
    ship.view("selection").setVisible(false);
  });
  
  ship.on("click", function(mouse) {
    ship.view("selected").setVisible(true);
  });
  
  ship.does("navigateToDestination", function(e, a) {
    
    var location = a.get("location"),
        destination = a.get("destination"),
        direction = new M.Vector2d();
    
    direction.setX(destination.x - location.x);
    direction.setY(destination.y - location.y);
    
    direction = M.Math2d.getNormalized(direction);
    
    location.setX(direction.x + location.x);
    location.setY(direction.y + location.y);
    
  });
  
  // M.trigger("moveShip", function(p) {
    
  //   if (!ship.view("selected")) {
  //     return;
  //   }
    
  //   ship.attribute("destination", {
  //     "x": p.mouse.x,
  //     "y": p.mouse.y
  //   });
    
  //   ship.does("navigateToDestination");
    
  // });
  
  // ship.does("followCamera");
  
  
  
  M.addTrigger("showMessage", "objectTypeInArea", {
    "objectType": "ship",
    "area": {
      
    }
  });
  
  
  M.addTrigger("showMessage", {
    "conditions": [function() {
      return true;
    }],
    "actions": [function() {
      alert("Hola!");
    }]
  });
  
  M.addTrigger("showMessage2", {
    "conditions": [M.triggers.conditions.always],
    "actions": [M.triggers.actions.sayHi]
  });
  
  M.addTrigger("setShipDestination", {
    "conditions": [
      M.triggers.conditions.isObjectSelected(ship),
      M.triggers.conditions.userClickedElsewhere
    ],
    "actions": [
      function() {
        ship.attribute("destination").setX(M.input.mouse.x).setY(M.input.mouse.y)
      }
    ]
  });
  
  return ship;
  
});

M.registerTrigger("setShipDestination", function() {
  
  var trigger = new M.Trigger();
  
  trigger.addCondition("isObjectTypeSelected", "playerShip");
  trigger.addCondition("userClickedElsewhere");
  
  trigger.addAction()
  
});