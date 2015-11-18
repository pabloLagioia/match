M.registerEntity("tree", function(tile) {

  var entity = new M.Entity();
  
  entity.shows(M.random.string()).as("sprite").set({
    fill: "tree",
    x: tile.center.x,
    y: tile.center.y,
    scaleX: 0.5,
    scaleY: 0.5
  });
  
  entity.has("layer", "terrain");
  entity.has("collisionGroup", 0);
  
  return entity;

});