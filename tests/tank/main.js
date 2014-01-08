var tank;

function main() {

	M.sprites.load({
	
			"sprite": "https://www.google.com.ar/images/srpr/logo11w.png"
		
		},
		
		function() {
		
			var layer = M.createLayer();
			
			tank = new M.Entity();
			tank.has("location", {x: 100, y: 100});
			tank.has("speed", 0);
			tank.has("rotation", 0);
			tank.has("turretRotation", 0);
			tank.has("turretRotationSpeed", 0);
			tank.has("direction", {x: 0, y: 1});
			tank.has("turretDirection", {x: 0, y: 1});
			tank.has("keyboardMapping", {
				up: "up", left: "left", right: "right", down: "down",
				rotateTurretLeft: "a", rotateTurretRight: "s"
			});
			tank.shows("base", new M.renderers.Rectangle({
				x: 0, y: 0, color: "red", width: 65, height: 100
			}));
			tank.shows("leftTrack", new M.renderers.Rectangle({
				x: -35, y: 0, color: "black", width: 8, height: 105
			}));
			tank.shows("rightTrack", new M.renderers.Rectangle({
				x: 35, y: 0, color: "black", width: 8, height: 105
			}));
			tank.shows("turretBase", new M.renderers.Rectangle({
				x: 0, y: -10, color: "yellow", width: 40, height: 55
			}));
			tank.shows("cannon", new M.renderers.Rectangle({
				x: 0, y: -60, color: "black", width: 10, height: 70,
				pivotX: 5, pivotY: -35
			}));
			tank.shows("leftFuelTank", new M.renderers.Rectangle({
				x: -15, y: 40, color: "brown", width: 25, height: 10
			}));
			tank.shows("rightfuelTank", new M.renderers.Rectangle({
				x: 15, y: 40, color: "brown", width: 25, height: 10
			}));
			tank.can("fixViewLocations", function(entity, attributes, views) {
				
				var i = 0,
					values = views._values,
					l = values.length,
					currentView,
					location = attributes.get("location"),
					rotation = attributes.get("rotation");

				for ( ; i < l; i++ ) {
					currentView = values[i];
					if ( currentView._initialLocation == undefined ) {
						currentView._initialLocation = {
							x: currentView.getX(), 
							y: currentView.getY()
						}
					}
					if ( currentView._initialRotation == undefined ) {
						currentView._initialRotation = currentView.getRotation()
						// currentView.pivotX = location.x - currentView.getX();
						// currentView.pivotY = location.y - currentView.getY();
					}
					currentView.setX(location.x + currentView._initialLocation.x);
					currentView.setY(location.y + currentView._initialLocation.y);
					currentView.setRotation(rotation + currentView._initialRotation);
				}
			
			});
			tank.does("monitorAttributes", function(entity, attributes) {
				var location = attributes.get("location");
				if ( !this._cachedLocation || this._cachedLocation.x != location.x || this._cachedLocation.y != location.y ) {
					// console.debug("changed");
				}
				this._cachedLocation = {
					x: attributes.get("location").x,
					y: attributes.get("location").y,
				};
			});
			tank.can("listenToKeyboard", function(e, a, v, input) {
				var keysDown = input.keyboard.keysDown,
					mappings = a.get("keyboardMapping");
				if ( keysDown[mappings.up] ) {
					a.push("speed", a.get("speed") - 0.25);
				} else if ( keysDown[mappings.down] ) {
					a.push("speed", a.get("speed") + 0.25);
				} else if ( keysDown[mappings.left] ) {
					var rotation = a.get("rotation") - 0.1;
					a.push("rotation", rotation);
					a.push("direction", M.math2d.getRotatedVertex(a.get("direction"), rotation));
				} else if ( keysDown[mappings.right] ) {
					var rotation = a.get("rotation") + 0.1;
					a.push("rotation", rotation);
					a.push("direction", M.math2d.getRotatedVertex(a.get("direction"), rotation));
				} else if ( keysDown[mappings.rotateTurretLeft] ) {
					var rotation = a.get("turretRotation") - 0.1;
					a.push("turretRotation", rotation);
					a.push("turretDirection", M.math2d.getRotatedVertex(a.get("turretDirection"), rotation));
				} else if ( keysDown[mappings.rotateTurretRight] ) {
					var rotation = a.get("turretRotation") + 0.1;
					a.push("turretRotation", rotation);
					a.push("turretDirection", M.math2d.getRotatedVertex(a.get("turretDirection"), rotation));
				}
			});
			tank.can("moveBySpeed", function(e, a, v) {
				
				var speed = a.get("speed"),
					direction = a.get("direction"),
					location = a.get("location");
					
				location.x += speed * direction.x;
				location.y += speed * direction.y;
				
			});
			
			// M.push(tank);
			
			layer.push(tank);
			
		},
		
		function () {
			console.debug("Loaded an image");
		}
		
	);

}