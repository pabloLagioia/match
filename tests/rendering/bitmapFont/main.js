function main() {

	M.sprites.load({

		fonts: {
			source: "font.png",
			frames: {
				"A": {x: 0, y: 0, width: 76, height: 73},
				"B": {x: 84, y: 0, width: 76, height: 73},
				"C": {x: 166, y: 0, width: 76, height: 73}
			}
		}

	}, function() {

		var object = new M.Entity();

		object.shows("itself").as("bitmapText").set({
			fill: "fonts", x: M.renderer.getCenter().x, y: M.renderer.getCenter().y, text: "ABC"
		});

		object.has("direction").set(1,1);
		object.has("scaleData");
		object.has("spinAroundSpeed");

		object.does("spinAround");
		// object.does("scaleUpAndDownUsingScaleData");
		object.does("bounce");
		object.does("stickToCanvas");

		M.push(object).to("world");
		
	});

}