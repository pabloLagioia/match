function main() {

	var layer = M.createLayer(),
		object = new M.Entity();

	object.shows("itself").as("circle").set({
		fill: "red", x: M.renderer.getCenter().x, y: M.renderer.getCenter().y, size: 50
	});

	object.has("scaleData");
	object.has("spinAroundSpeed");

	object.does("spinAround");
	object.does("scaleUpAndDownUsingScaleData");

	layer.push(object);

}