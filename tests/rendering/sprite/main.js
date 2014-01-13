function main() {

	M.sprites.load({

		logo: {
			source: "megaman.png",
			frames: [
				{x: 0, y: 0, width: 71, height: 65},
				{x: 71, y: 1, width: 43, height: 63},
				{x: 115, y: 0, width: 59, height: 64}
			],
			animations: {
				run: {
					duration: 100,
					frames: [
						0, 1, 2
					]
				}
			}
		}

	}, function() {

		var layer = M.createLayer(),
			object = new M.Entity();

		object.shows("itself").as("sprite").set({
			fill: "logo", x: M.renderer.getCenter().x, y: M.renderer.getCenter().y
		}).play("run", true);

		object.has("direction").set(1,1);
		object.has("scaleData");
		object.has("spinAroundSpeed");

		object.does("spinAround");
		object.does("scaleUpAndDownUsingScaleData");
		object.does("bounce");
		object.does("stickToCanvas");

		layer.push(object);
		
	});

}