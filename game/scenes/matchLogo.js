M.registerScene("matchLogo", {

	sprites: {
		fonts: M.renderizables.BitmapText.DEFAULT_FONT,
	},

	onLoad: function() {

		var object = new M.Entity(),
			center = M.getCenter();

		object.shows("poweredBy").as("bitmapText").set({
			fill: "fonts", x: center.x, y: center.y - 40, text: "POWERED BY",
			scaleX: 0.15,
			scaleY: 0.15
		});
		object.shows("match").as("bitmapText").set({
			fill: "fonts", x: center.x, y: center.y, text: "MATCH",
			scaleX: 0.5,
			scaleY: 0.5
		});

		M.push(object).to("logo");
		
		M.getLayer("logo").background = "#000";
		
	}

});