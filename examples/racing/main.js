function main() {

	var CANVAS_W = 640,
		CANVAS_H = 480,
		tileW = 128,
		tileH = 128,
		tileHW = tileH / 2,
		tileHH = tileW / 2,
		tilesX = track[0].length,
		tilesY = track.length;
	
	for ( var column = 0; column < tilesX; column++ ) {
		for ( var row = 0; row < tilesY; row++ ) {
			
			var viewId = "tile" + column + ":" + row;
			
			var tile = new M.Entity();
			
			switch ( track[row][column] ) {
			
				case 0:
				
					tile.shows(viewId).as("rectangle").set({
						fill: "#500",
						x: column * tileW + tileHW,
						y: row * tileH + tileHH,
						border: "#0A0",
						borderWidth: 1,
						width: tileW,
						height: tileH
					});
					tile.has("collisionGroup", 0);
				
					break;
				case 1:
					
					tile.shows(viewId).as("rectangle").set({
						fill: "#050",
						x: column * tileW + tileHW,
						y: row * tileH + tileHH,
						border: "#0A0",
						borderWidth: 1,
						width: tileW,
						height: tileH
					});
					
					tile.has("collisionGroup", 0);
					
					break;
				
				case 2:
					
					tile.shows(viewId).as("rectangle").set({
						fill: "#999",
						x: column * tileW + tileHW,
						y: row * tileH + tileHH,
						border: "#BBB",
						borderWidth: 1,
						width: tileW,
						height: tileH
					});
					
					tile.has("collisionGroup", 2);
					
					break;
					
			}
			
			M.add(tile).to("terrain");
			
		}

	}
	
	M.getCamera().setBoundingArea(0, 0, tileW * tilesX - CANVAS_W, tileH * tilesY - CANVAS_H);
	
	//PLAYER 1
	var car = M.createEntity("car");
		car.attribute("location").set((CANVAS_W / 2 + 160) * 2, (CANVAS_H / 2 + 400) * 2);
		car.does("followCamera");
		M.getCamera().centerAt(car.attribute("location").x, car.attribute("location").y);
		M.add(car).to("track");
	
	//PLAYER 2	
	var car2 = M.createEntity("car");
		car2.attribute("location").set((CANVAS_W / 2 + 220) * 2, (CANVAS_H / 2 + 400) * 2);
		car2.has("keyboardMapping", {
			up: "w", left: "a", right: "d", down: "s"
		});
		car2.view("base").setColor("blue");
		M.add(car2).to("track");

	window.player1 = car;
	window.player2 = car2;

}