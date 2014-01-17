var car;

function main() {

	var CANVAS_W = 640,
		CANVAS_H = 480;

	var terrainLayer = M.createLayer();
	
	var tileW = 128,
		tileH = 128,
		tileHW = tileH / 2,
		tileHH = tileW / 2,
		tilesX = track[0].length,
		tilesY = track.length;
	
	
	for ( var column = 0; column < tilesX; column++ ) {
		for ( var row = 0; row < tilesY; row++ ) {
			
			var viewId = "tile" + column + ":" + row;
			
			var terrain = new M.Entity();
			
			switch ( track[row][column] ) {
			
				case 0:
				
					terrain.shows(viewId).as("rectangle").set({
						fill: "#500",
						x: column * tileW + tileHW,
						y: row * tileH + tileHH,
						border: "#0A0",
						borderWidth: 1,
						width: tileW,
						height: tileH
					});
					terrain.has("collisionGroup", 0);
				
					break;
				case 1:
					
					terrain.shows(viewId).as("rectangle").set({
						fill: "#050",
						x: column * tileW + tileHW,
						y: row * tileH + tileHH,
						border: "#0A0",
						borderWidth: 1,
						width: tileW,
						height: tileH
					});
					
					terrain.has("collisionGroup", 1);
					
					break;
				
				case 2:
					
					terrain.shows(viewId).as("rectangle").set({
						fill: "#999",
						x: column * tileW + tileHW,
						y: row * tileH + tileHH,
						border: "#BBB",
						borderWidth: 1,
						width: tileW,
						height: tileH
					});
					
					terrain.has("collisionGroup", 2);
					
					break;
					
			}
			
			terrainLayer.push(terrain);
			
		}
	}
	
	var layer = M.createLayer();

	M.renderer.camera.setBoundingArea(0, 0, tileW * tilesX - CANVAS_W, tileH * tilesY - CANVAS_H);
	
	//PLAYER 1
		car = M.game.entities.createCar();
		car.attribute("location").set((CANVAS_W / 2 + 160) * 2, (CANVAS_H / 2 + 400) * 2);
		car.does("followCamera");
		M.renderer.camera.centerAt(car.attribute("location").x, car.attribute("location").y);
		layer.push(car);
	
	//PLAYER 2
	var car2 = M.game.entities.createCar();
		car2.attribute("location").set((CANVAS_W / 2 + 220) * 2, (CANVAS_H / 2 + 400) * 2);
		car2.has("keyboardMapping", {
			up: "w", left: "a", right: "d", down: "s"
		});
		car2.view("base").setColor("blue");
		layer.push(car2);

}