M.registerEntity("bridge", function(tile) {

  var entity = new M.Entity();
  
  entity.shows(M.random.string()).as("sprite").set({
    fill: "bridge",
    x: tile.center.x,
    y: tile.center.y
  });
  
  entity.has("layer", "above");
  entity.has("collisionGroup", 2);
  
  return entity;

});