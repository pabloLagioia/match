M.registerEntity("paviment", function(tile) {

  var paviment = new M.Entity();
  
  paviment.shows(M.random.string()).as("sprite").set({
    fill: "asphalt",
    x: tile.center.x,
    y: tile.center.y,
    scaleX: 0.5,
    scaleY: 0.5
  });
  
  paviment.has("layer", "terrain");
  paviment.has("collisionGroup", 2);
  
  return paviment;

});