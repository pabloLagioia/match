var rect,
	rectChild,
	text,
	sprite;

function main() {

	M.sprites.load({
	
			"sprite": "https://www.google.com.ar/images/srpr/logo11w.png"
		
		},
		
		function() {
		
			var layer = M.createLayer();
			
			//RECTANGLE
			rect = new M.renderers.Rectangle();
			
			rect.setSize(40, 40);
			rect.setLocation(40, 40);
			rect.setFillStyle("blue");
			
			rectChild = new M.renderers.Rectangle();
			
			rectChild.setFillStyle("red");
			rectChild.setSize(20, 20);
			rectChild.setLocation(20, 20);
			
			rect.children.push(rectChild);
			
			//TEXT
			text = new M.renderers.Text();
			text.setLocation(100, 100);
			text.setText("HOLA MATCH!");
			
			//SPRITE
			sprite = new M.renderers.Sprite("sprite");
			sprite.setLocation(60, 60);
			
			layer.push(rect);
			layer.push(text);
			layer.push(sprite);

			layer.push(tank);
			
		},
		
		function () {
			console.debug("Loaded an image");
		}
		
	);

}