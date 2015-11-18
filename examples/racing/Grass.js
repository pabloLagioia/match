M.registerEntity("grass", function(tile) {

  var grass = new M.Entity();

  grass.shows(M.random.string()).as("sprite").set({
    fill: "grass",
    x: tile.center.x,
    y: tile.center.y,
    width: tile.width,
    height: tile.height
  });

  // grass.shows(M.random.string()).as("rectangle").set({
  //   fill: "#050",
  //   x: tile.center.x,
  //   y: tile.center.y,
  //   border: "#0A0",
  //   borderWidth: 1,
  //   width: tile.width,
  //   height: tile.height
  // });
  
  grass.has("layer", "terrain");
  grass.has("collisionGroup", 1);
  
  return grass;

});
