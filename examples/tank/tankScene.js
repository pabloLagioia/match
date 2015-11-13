M.registerScene("tankScene", {

	sprites: {
		tree: "tree.gif",
		grass: "grass.png"
	},
	
	loadingScene: "loading",

	onLoad: function() {

		var tanks = 1,
        trees = 2;
    
		var object = new M.Entity(),
			  center = M.getCenter();

		object.shows("grass").as("sprite").set({
			x: center.x, y: center.y, fill: "grass"
		});

		M.push(object).to("world");
    			
		for (var i = 0; i < tanks; i++) {
			M.push("tank").to("world");
		}
		
    for (var i = 0; i < trees; i++) {
      M.push("tree").to("world");
    }
		
	}

});