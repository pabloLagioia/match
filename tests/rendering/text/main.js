function main() {

	var layer = M.createLayer(),
		object = new M.Entity();

	object.shows("itself").as("text").set({
		fill: "red", x: M.renderer.getCenter().x, y: M.renderer.getCenter().y, size: 20, text: "Hello World!"
	});

	object.has("direction").set(1,1);
	object.has("scaleData");
	object.has("spinAroundSpeed");

	object.does("spinAround");
	object.does("scaleUpAndDownUsingScaleData");
	object.does("bounce");
	object.does("stickToCanvas");

	layer.push(object);

}