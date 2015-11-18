M.registerEntity("curve", function(tile, rotation) {

  var paviment = new M.Entity();
  
  var rotationMappings = {
    "left": 0,
    "right": Math.PI / 2,
    "oright": Math.PI,
    "oleft": Math.PI + Math.PI / 2
  }
  
  paviment.shows(M.random.string()).as("sprite").set({
    fill: "asphaltCurve",
    x: tile.center.x,
    y: tile.center.y,
    scaleX: 0.5,
    scaleY: 0.5,
    rotation: rotationMappings[rotation]
  });
  
  paviment.has("layer", "terrain");
  paviment.has("collisionGroup", 2);
  
  return paviment;

});