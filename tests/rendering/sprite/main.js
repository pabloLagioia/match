function main() {

	M.sprites.load({

		logo: "match.png"

	}, function() {

		var layer = M.createLayer(),
			object = new M.Entity();

		object.shows("itself").as("sprite").set({
			fill: "logo", x: M.renderer.getCenter().x, y: M.renderer.getCenter().y
		});

		object.has("scaleData");
		object.has("spinAroundSpeed");

		object.does("spinAround");
		object.does("scaleUpAndDownUsingScaleData");

		layer.push(object);
		
	});

}