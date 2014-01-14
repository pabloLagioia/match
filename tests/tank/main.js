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
					terrain.shows(viewId).as("sprite").setImage("grass").setLocation(column * tileW + tileHW, row * tileH + tileHH);
				}
			}
			
			terrainLayer.push(terrain);
			
			for ( var i = 0; i < M.random.integer(2, 3); i++ ) {
				var tree = new M.Entity();
				tree.shows("tree").as("sprite").setImage("tree").setLocation(M.random.integer(0, 640), M.random.integer(0, 480));
				tree.has("collisionGroup", 0);
				terrainLayer.push(tree);
			}
		
			var layer = M.createLayer();

			for ( var i = 0; i < 1; i++ ) {
				tank = M.game.entities.createTank();

				layer.push(tank);
			}

			// var obj = new M.Entity();
			// obj.shows("base").as("rectangle").set({
			// 	x: 350, y: 150, width: 50, height: 50, color: "red"
			// });
			// obj.shows("cannon").as("rectangle").set({
			// 	x: 350, y: 150, width: 30, height: 25, color: "orange", pivotY: -50
			// });
			// obj.shows("center").as("rectangle").set({
			// 	x: 350, y: 150, width: 1, height: 1, color: "black"
			// });

			// obj.has("spinAroundSpeed", 0.01);
			// obj.does("spinAround");

			// layer.push(obj);

			// M.renderer.camera.setViewport(300, 300);
			
		},
		
		function (loaded) {
			M.logger.log("Loaded " + loaded.name);
		}
		
	);

}