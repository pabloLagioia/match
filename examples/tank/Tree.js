M.registerEntity("tree", function() {

	var tree = new M.ViewableEntity({
		"attributes": [
			"location"
		]
  });
  
  tree.attribute("location").set(Math.random() * 640, Math.random() * 480);
  
  tree.shows("base").as("sprite").set({
    "fill": "tree"
  });
  
  return tree;
  
});