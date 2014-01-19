function main() {

	var object = new M.Entity();

	object.shows("itself").as("rectangle").set({
		fill: "red", x: M.renderer.getCenter().x, y: M.renderer.getCenter().y, width: 100, height: 50
	});

	object.has("direction").set(1,1);
	object.has("scaleData");
	object.has("spinAroundSpeed");

	object.does("spinAround");
	object.does("scaleUpAndDownUsingScaleData");
	object.does("bounce");
	object.does("stickToCanvas");

	M.push(object);

}