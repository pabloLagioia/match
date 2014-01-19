function main() {

	var object = new M.Entity();

	object.shows("itself").as("circle").set({
		fill: "red", x: M.renderer.getCenter().x, y: M.renderer.getCenter().y, size: 50
	});

	object.has("direction").set(1,1);
	object.has("scaleData");

	object.does("scaleUpAndDownUsingScaleData");
	object.does("bounce");
	object.does("stickToCanvas");

	M.push(object);

}