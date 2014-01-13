var tank;

function main() {

	M.sprites.load({
		
			"grass": "grass.png",
			"tree": "tree.gif"
		
		},
		
		function() {
		
			var terrainLayer = M.createLayer();
			
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
					terrain.shows(viewId).as("sprite").setImage("grass");
					terrain.view(viewId).setLocation(column * tileW + tileHW, row * tileH + tileHH);
				}
			}
			
			terrainLayer.push(terrain);
			
			for ( var i = 0; i < M.random.integer(2, 3); i++ ) {
				var tree = new M.Entity();
				tree.shows("tree").as("sprite").setImage("tree");
				tree.view("tree").setLocation(M.random.integer(0, 640), M.random.integer(0, 480));
				tree.has("collisionGroup", 0);
				terrainLayer.push(tree);
			}
		
			var layer = M.createLayer();

			// for ( var i = 0; i < 1; i++ ) {
				tank = M.game.entities.createTank();
				// tank.attribute("location").set(M.random.integer(0, 640), M.random.integer(0, 480));
				layer.push(tank);
			// }			
			
			// M.renderer.camera.setViewport(300, 300);
			
			// layer.push(object);
			
			M.plugins.Debug.enable();
			
		},
		
		function (loaded) {
			M.logger.log("Loaded " + loaded.name);
		}
		
	);

}