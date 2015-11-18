M.registerEntity("noPassable", function(tile) {

  var noPassable = new M.Entity();

  noPassable.shows(M.random.string()).as("rectangle").set({
    fill: "#500",
    x: tile.center.x,
    y: tile.center.y,
    border: "#0A0",
    borderWidth: 1,
    width: tile.width,
    height: tile.height
  });
  
  noPassable.has("layer", "terrain");
  noPassable.has("collisionGroup", 0);
  
  return noPassable;

});