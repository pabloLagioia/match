M.registerScene("matchLogo", {

	sprites: {
		fonts: {
			source: "font.png",
			frames: {
				"A": {x: 0, y: 0, width: 76, height: 73},
				"B": {x: 84, y: 0, width: 76, height: 73},
				"C": {x: 166, y: 0, width: 76, height: 73},
				"D": {x: 248, y: 0, width: 76, height: 73},
				"E": {x: 328, y: 0, width: 76, height: 73},
				"F": {x: 0, y: 84, width: 76, height: 73},
				"G": {x: 84, y: 84, width: 76, height: 73},
				"H": {x: 164, y: 84, width: 76, height: 73},
				"I": {x: 246, y: 84, width: 46, height: 73},
				"J": {x: 294, y: 84, width: 76, height: 73},
				"K": {x: 374, y: 84, width: 76, height: 73},
				"L": {x: 0, y: 168, width: 76, height: 73},
				"M": {x: 82, y: 168, width: 118, height: 73},
				"N": {x: 200, y: 168, width: 76, height: 73},
				"O": {x: 284, y: 168, width: 76, height: 73},
				"P": {x: 364, y: 168, width: 76, height: 73},
				" ": {x: 436, y: 168, width: 24, height: 73},
				"Q": {x: 0, y: 252, width: 76, height: 73},
				"R": {x: 82, y: 252, width: 76, height: 73},
				"S": {x: 164, y: 252, width: 76, height: 73},
				"T": {x: 246, y: 252, width: 76, height: 73},
				"U": {x: 330, y: 252, width: 76, height: 73},
				"V": {x: 0, y: 336, width: 76, height: 73},
				"W": {x: 84, y: 336, width: 113, height: 73},
				"X": {x: 200, y: 336, width: 81, height: 73},
				"Y": {x: 284, y: 336, width: 80, height: 73},
				"Z": {x: 364, y: 336, width: 81, height: 73},
				"0": {x: 0, y: 421, width: 81, height: 73},
				"1": {x: 81, y: 421, width: 81, height: 73},
				"2": {x: 128, y: 421, width: 82, height: 73},
				"3": {x: 210, y: 421, width: 83, height: 73},
				"4": {x: 293, y: 421, width: 82, height: 73},
				"5": {x: 374, y: 421, width: 82, height: 73},
				"6": {x: 0, y: 505, width: 82, height: 73},
				"7": {x: 82, y: 505, width: 82, height: 73},
				"8": {x: 164, y: 505, width: 82, height: 73},
				"9": {x: 246, y: 505, width: 82, height: 73},
				":": {x: 327, y: 505, width: 37, height: 73},
				".": {x: 364, y: 505, width: 36, height: 73},
				"-": {x: 400, y: 505, width: 47, height: 73}
			}
		}
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

		M.push(object).to("world");
		
	};

});