M.registerEntity("grass", function(tile) {

	var grass = new M.Entity({
		"attributes": [
			"location"
		],
    "behaviours": [
      "fixViewsToEntity"
    ]
  });
  
  grass.attribute("location").set(tile.center.x, tile.center.y);
  grass.attribute("layer", "terrain");
  
  grass.shows("base").as("sprite").set({
    "fill": "grass"
  });
  
  return grass;
  
});