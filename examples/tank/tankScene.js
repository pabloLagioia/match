M.registerScene("tankScene", {

	sprites: {
		tree: "tree.gif",
		grass: "grass.png"
	},

	onLoad: function() {

		
for (var i = 0; i < 100; i++) {
	M.push(M.createEntity("tank")).to("world");
}

		// var object = new M.Entity(),
		// 	center = M.getCenter();

		// object.shows("poweredBy").as("bitmapText").set({
		// 	fill: "fonts", x: center.x, y: center.y - 40, text: "POWERED BY",
		// 	scaleX: 0.15,
		// 	scaleY: 0.15
		// });
		// object.shows("match").as("bitmapText").set({
		// 	fill: "fonts", x: center.x, y: center.y, text: "MATCH",
		// 	scaleX: 0.5,
		// 	scaleY: 0.5
		// });

		// M.push(object).to("logo");
		
		// M.getLayer("logo").background = "#000";
		
	}

});