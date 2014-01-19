var tank;

function main() {

	M.sprites.load({
		
			"grass": "grass.png",
			"tree": "tree.gif"
		
		},
		
		function() {
		
			var tileW = M.sprites.assets.grass.width,
				tileH = M.sprites.assets.grass.height,
				tileHW = tileH / 2,
				tileHH = tileW / 2,
				tilesX = Math.ceil(640 / tileW),
				tilesY = Math.ceil(480 / tileH);
			
			var terrain = new M.Entity();
			
			for ( var column = 0; column < tilesX; column++ ) {
				for ( var row = 0; row < tilesY; row++ ) {
					var viewId = "tile" + column + ":" + row;
					terrain.shows(viewId).as("sprite").setImage("grass").setLocation(column * tileW + tileHW, row * tileH + tileHH);
				}
			}
			
			M.push(terrain);
			
			for ( var i = 0; i < M.random.integer(2, 3); i++ ) {
				var tree = new M.Entity();
				// tree.shows("tree").as("sprite").setImage("tree").setLocation(M.random.integer(0, 640), M.random.integer(0, 480));
				tree.shows("body").as("sprite").set({
					fill: "tree",
					x: M.random.integer(0, 640),
					y: M.random.integer(0, 480),
					width: 62,
					height: 64
				});
				tree.has("collisionGroup", 0);
				M.push(tree);
			}
		
			for ( var i = 0; i < 1; i++ ) {
				tank = M.game.entities.createTank();

				M.push(tank, "gameArea");
			}

		},
		
		function (loaded) {
			M.logger.log("Loaded " + loaded.name);
		}
		
	);

}