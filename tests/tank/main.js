M.registerScene("test", {

	sprites: {
		"grass": "grass.png",
		"tree": "tree.gif"
	},
	onLoad: function() {

		var tileW = M.sprites.assets.grass.width,
				tileH = M.sprites.assets.grass.height,
				tileHW = tileH / 2,
				tileHH = tileW / 2,
				tilesX = 20,
				tilesY = 20;
			
		var terrain = new M.Entity();
		
		for ( var column = 0; column < tilesX; column++ ) {
			for ( var row = 0; row < tilesY; row++ ) {
				var viewId = "tile" + column + ":" + row;
				terrain.shows(viewId).as("sprite").set({
					fill: "grass",
					x: column * tileW + tileHW,
					y: row * tileH + tileHH
				})
			}
		}

		M.add(terrain).to("world");

		for ( var i = 0; i < M.random.integer(2, 3); i++ ) {
		
			var tree = new M.Entity();
			
			tree.shows("body").as("sprite").set({
				fill: "tree",
				x: M.random.integer(0, 640),
				y: M.random.integer(0, 480),
				width: 62,
				height: 64
			});
			
			tree.has("collisionGroup", 0);
			
			M.add(tree).to("world");
			
		}
	
		for ( var i = 0; i < 100; i++ ) {
			
			tank = M.game.entities.createTank();
			tank.getAttribute("location").set(M.random.integer(0, 640), M.random.integer(0, 480));

			M.add(tank).to("gameArea");
			
		}

	}

});

var tank;

function main() {
	M.setScene("test");
}