function main() {

	M.registerGameAttributes({
		Location: function (x, y) {
			this.x = x || 0;
			this.y = y || 0;
		},
		Speed: function (x, y) {
			this.x = x || 0;
			this.y = y || 0;
		},
		Deceleration: function () {
			this.x = 1;
			this.y = 1;
		},
		Acceleration: function () {
			this.x = 0;
			this.y = 0;
		},
		MaxSpeed: function () {
			this.x = 4;
			this.y = 4;
		},
		Size: function (width, height) {
			this.width = width;
			this.height = height;
			this._halfWidth = this.width / 2;
			this._halfHeight = this.height / 2;
		},
		backgroundLayer: M.createLayer(),
		frontLayer: M.createLayer()
	});

	M.registerGameBehaviours({
		moveWithKeyboard: function(attr) {
			if ( M.keyboard.keysDown.left ) {
				attr.acceleration.x = -1;
			} else if ( M.keyboard.keysDown.right ) {
				attr.acceleration.x = 1;
			} else {
				attr.acceleration.x = 0;
			}
			if ( M.keyboard.keysDown.up ) {
				attr.acceleration.y = -1;
			} else if ( M.keyboard.keysDown.down ) {
				attr.acceleration.y = 1;				
			} else {
				attr.acceleration.y = 0;
			}
		},
		moveSideWards: function(attr) {
			attr.location.x += attr.speed.x;
			attr.layer.needsRedraw = true;
		},
		accelerate: function(attr) {
			if ( attr.speed.y < attr.maxSpeed.y ) {
				attr.speed.y += attr.acceleration.y;
			}
			if ( attr.speed.x < attr.maxSpeed.x ) {
				attr.speed.x += attr.acceleration.x;
			}
		},
		decelerate: function(attr) {
			if ( attr.speed.y > 0 ) {
				attr.speed.y -= attr.deceleration.y;
			} else {
				attr.speed.y = 0;
			}
			if ( attr.speed.x > 0 ) {
				attr.speed.x -= attr.deceleration.x;
			} else {
				attr.speed.x = 0;
			}
		},
		moveUpDown: function(attr) {
			attr.location.y += attr.speed.y;
		}
	});

	var behaviours = M.game.behaviours,
		attributes = M.game.attributes;

	M.registerGameEntity("Car", function() {
		this.addAttribute("location", new attributes.Location(0, 0));
		this.addAttribute("speed", new attributes.Speed);
		this.addAttribute("maxSpeed", new attributes.MaxSpeed);
		this.addAttribute("acceleration", new attributes.Acceleration);
		this.addAttribute("deceleration", new attributes.Deceleration);
		this.addAttribute("fillStyle", "red");
		this.addAttribute("layer", attributes.frontLayer);
		this.addAttribute("size", new attributes.Size(100, 100));
		this.addBehaviours(behaviours.moveWithKeyboard);
		this.addBehaviours(behaviours.moveUpDown);
		this.addBehaviours(behaviours.accelerate);
		// this.addBehaviours(behaviours.decelerate);
		this.addBehaviours(renderingEngine.renderRectangleNoTransform);
	});

	car = M.createEntity("Car");

	M.pushGameObject(car);

}