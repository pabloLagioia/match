M.registerEntity("startingLine", function(tile) {

  var startingLine = new M.Entity();

  startingLine.shows(M.random.string()).as("sprite").set({
    fill: "startingLine",
    x: tile.center.x,
    y: tile.center.y - 30
  });
  
  startingLine.has("layer", "track");
  startingLine.has("collisionGroup", 1);
  
  return startingLine;

});