M.registerScene("loading", {

	sprites: {
		fonts: M.renderizables.BitmapText.DEFAULT_FONT
	},
	
	onLoad: function() {

		var loading = new M.Entity(),
			progressBar = new M.Entity(),
			center = M.getCenter(),
			background,
			backgroundWidth;
		
		loading.shows("loading").as("bitmapText").set({
			fill: "fonts", x: center.x, y: center.y, text: "LOADING...",
			scaleX: 0.25,
			scaleY: 0.25
		});
		
		progressBar.shows("background").as("rectangle").set({
			fill: "#fa0",
			x: loading.getView("loading").getX(),
			y: center.y + 30,
			width: 0,
			height: 20
		});
		progressBar.shows("border").as("rectangle").set({
			fill: "rgba(0,0,0,0)",
			x: center.x,
			y: center.y + 30,
			width: 150,
			height: 20,
			border: "#a50",
			borderWidth: 2
		});

		M.push(loading).to("loading");
		M.push(progressBar).to("loading");
		
		M.getLayer("loading").background = "#000";
		
		background = progressBar.getView("background"),
		backgroundWidth = progressBar.getView("border").getWidth();
		
		M.sprites.onImageLoaded.addEventListener(function (data) {
		
			background.setWidth(backgroundWidth - data.remaining * backgroundWidth / data.total);
			background.setLeft(loading.getView("loading").getLeft());
			
			console.debug("loaded sprite: " + data.name);
		
		});
		
	}
		
});