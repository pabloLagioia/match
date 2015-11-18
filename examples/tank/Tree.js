M.registerEntity("tree", function(tile) {

	var tree = new M.Entity({
		"attributes": [
			"location"
		],
    "behaviours": [
      "fixViewsToEntity"
    ]
  });
  
  tree.attribute("location").set(tile.center.x, tile.center.y);
  tree.attribute("layer", "terrain");
  
  tree.shows("base").as("sprite").set({
    "fill": "tree"
  });
  
  return tree;
  
});