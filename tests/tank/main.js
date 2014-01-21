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
				tilesX = 20,
				tilesY = 20;
			
			var terrain = new M.Entity();
			
			var worldLayer = M.getLayer("world");
			
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
				
				// M.add(tree).to("world");
				
				worldLayer.add(tree);
				
			}
		
			for ( var i = 0; i < 1; i++ ) {
				
				tank = M.createEntity("tank");

				tank.addEventListener("fire", function(entity, attributes, views) {

					var tankDirection = attributes.get("direction"),
						turretDirection = attributes.get("turretDirectionVector"),
						location = attributes.get("location");
					
					//CREATE BULLET AND ADD IT TO THE LAYER
					var bullet = M.createEntity("bullet");
					bullet.attribute("direction").set(tankDirection.x, tankDirection.y);
					bullet.attribute("location").set(location.x, location.y);
					bullet.has("rotation", attributes.get("turretRotation") + attributes.get("rotation"));
					M.add(bullet).to("gameArea");

				});

				M.add(tank).to("gameArea");
				
			}

		},
		
		function (loaded) {
			M.logger.log("Loaded " + loaded.name);
		}
		
	);

}