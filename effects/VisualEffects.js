/**
 * @module Match
 */
(function(namespace, M) {

	/**
	 * @class Particle
	 * @namespace visual
	 * @constructor
	 * @param {Vector2d} origin
	 * @param {Vector2d} destination
	 * @param {float} width
	 * @param {float} height
	 * @param {String} fillStyle
	 */
	function Particle(origin, destination, width, height, fillStyle) {
		this.angle = 0;
		this._rotationSpeed = 0.1;
		this.speed = 0.05;
		this.vanishRate = 0.005;
		this.alpha = 1;
		this.setPath(origin, destination);
		this.setWidth(width);
		this.setHeight(height);
	}
	/**
	 * @method setWidth
	 * @param {float} width
	 */
	Particle.prototype.setWidth = function(width) {
		this._halfWidth = width / 2;
	};
	/**
	 * @method setHeight
	 * @param {float} height
	 */
	Particle.prototype.setHeight = function(height) {
		this._halfHeight = height / 2;
	};
	/**
	 * @method setPath
	 * @param {Object} origin Object containing origin x and y coordinates
	 * @param {Object} destination Object containing destination x and y coordinates
	 */
	Particle.prototype.setPath = function(origin, destination) {

		this._x = origin.x;
		this._y = origin.y;

		this.direction = M.math2d.getVector2d(origin, destination);

	};
	/**
	 * Updates the particle
	 * @method onLoop
	 * @protected
	 */
	Particle.prototype.onLoop = function() {

		this.alpha -= this.vanishRate;

		this.angle += this._rotationSpeed;
		this._x += this.speed * this.direction.x;
		this._y += this.speed * this.direction.y;

	};
	/**
	 * Renders the particle
	 * @method onRender
	 */
	Particle.prototype.onRender = function(context, canvas, cameraX, cameraY) {

		if ( this.alpha >= 0 ) {

			context.save();
			context.globalAlpha = this.alpha;
			context.translate(this._x - cameraX, this._y - cameraY);
			context.rotate(this.angle);
			context.fillStyle = this.fillStyle;
			context.fillRect(-this._halfWidth, -this._halfHeight, this._halfWidth, this._halfHeight);
			context.restore();

		}

	};
	/**
	 * Sets the zIndex of this object
	 * @method setZIndex
	 * @param {int} value the zIndex
	 */
	Particle.prototype.setZIndex = function (value) {
        this._zIndex = value;
    };
	/**
	 * Returns whether this object is visible and is inside the given viewport
	 *
	 * @method isVisible
	 * @param {float} cameraX0 the left coordinate of the camera
	 * @param {float} cameraY0 the top coordinate of the camera
	 * @param {float} cameraX1 the right coordinate of the viewport
	 * @param {float} cameraY1 the bottom coordinate of the viewport
	 * @return {Boolean}
	 */
	Particle.prototype.isVisible = function(cameraX0, cameraY0, cameraX1, cameraY1) {
		if ( this.alpha <= 0 ) {
			return false;
		}
		var camera = M.camera;
		if (this._y + this._halfHeight < cameraY0) return false;
		if (this._y - this._halfHeight > cameraY1) return false;
		if (this._x + this._halfWidth < cameraX0) return false;
		if (this._x - this._halfWidth > cameraX1) return false;
		return true;
	};

	/*
	 * Creates linear particles and returns them as in array
	 * @param amount of particles
	 * @param departure x
	 * @param departure y
	 * @param direction in which the particles will move
	 * @param min width of the particles
	 * @param min height of the particles
	 * @param max width of the particles
	 * @param max height of the particles
	 * @param min speed of the particles
	 * @param max speed of the particles
	 * @param color of the particles - if not provided an explosion color will be applied
	 */
	function createLinearParticles(amount, origin, direction, minWidth, minHeight, maxWidth, maxHeight, minSpeed, maxSpeed, color, vanishRate, maxVanishRate) {

		var lib = M.Math2d;

		var particles = [];

		for ( var i = 0; i < amount; i++) {

			var particle = new Particle(origin, { x: origin.x + direction.x * 5, y: origin.y + direction.y * 5});

			particle.setWidth(lib.randomInt(minWidth, maxWidth));
			particle.setHeight(lib.randomInt(minHeight, maxHeight));

			if ( ! color ) {
				switch ( lib.randomInt(0,2) ) {
					case 0:
						particle.color = "rgb(255, 128, 0)";
						break;
					case 1:
						particle.color = "rgb(255, 180, 0)";
						break;
					case 2:
						particle.color = "rgb(255, 80, 0)";
				}
			} else {
				particle.color = color[lib.randomInt(0, color.length - 1)];
			}

			if ( maxVanishRate ) {
				particle.vanishRate = lib.randomFloat( vanishRate, maxVanishRate );
			} else if ( vanishRate ) {
				particle.vanishRate = vanishRate;
			}

			particle.speed = lib.randomFloat(minSpeed, maxSpeed);

			particles.push(particle);

		}

		return particles;

	}

	/**
	 * @class RadialParticleEmitter
	 * @constructor
	 * @namespace visual
	 * @constructor
	 * @param {int} amount amount of particles
	 * @param {Array} color array of Strings with posible colors
	 * @param {float} minWidth min width of the particles
	 * @param {float} minHeight min height of the particles
	 * @param {float} maxWidth max width of the particles
	 * @param {float} maxHeight max height of the particles
	 * @param {float} minSpeed min speed of the particles
	 * @param {float} maxSpeed max speed of the particles
	 * @param {float} vanishRate if not provided will default to 0.01 @see particle.vanishRate
	 */
	function RadialParticleEmitter(amount, color, minWidth, minHeight, maxWidth, maxHeight, minSpeed, maxSpeed, vanishRate) {
		if ( ! this.minAngle ) this.minAngle = 0;
		if ( ! this.maxAngle ) this.maxAngle = 6.28;
		this.amount = amount;
		this.color = color;
		this.minWidth = minWidth || 1;
		this.minHeight = minHeight || 1;
		this.maxWidth = maxWidth || 3;
		this.maxHeight = maxHeight || 3;
		this.minSpeed = minSpeed || 0.01;
		this.maxSpeed = maxSpeed || 0.1;
		this.vanishRate = vanishRate;
	}

	RadialParticleEmitter.prototype.onLoop = function() {
		if ( !this.children ) return;
		var i = 0, l = this.children.length, notVisible = 0, currentParticle;
		for ( ; i < l; i++ ) {
			currentParticle = this.children[i];
			if ( currentParticle.alpha <= 0 ) {
				notVisible++;
			} else {
				currentParticle.onLoop();
			}
		}
		if ( notVisible == l ) {
			this.children = null;
		} else {
			// this.notifyChange();
		}
	};

	RadialParticleEmitter.prototype.onRender = function () {
	};

	RadialParticleEmitter.prototype.isVisible = function() {
		return true;
	};

	RadialParticleEmitter.prototype.setZIndex = function (value) {
		this._zIndex = value;
		// this.notifyChange();
		// this.notifyZIndexChange();
	};
	/**
	 * Creates particles that will move from the center to another part of a circle
	 * @method create
	 * @param {int} x the x center at where to create the particles
	 * @param {int} y the y center at where to create the particles
	 */
	RadialParticleEmitter.prototype.create = function(x, y) {

		var rnd = M.random;

		this.children = new Array();

		for ( var i = 0; i < this.amount; i++) {

			/* t E [0, 2 * PI] */
			var t = rnd.decimal(this.minAngle, this.maxAngle),
			/* Radius */
			r = 50,
			origin = new Object(),
			destination = new Object(),
			particle;

			origin.x = x;
			origin.y = y;

			destination.x = x + r * Math.cos(t);
			destination.y = y + r * Math.sin(t);

			particle = new Particle(origin, destination);

			particle.setWidth(rnd.integer(this.minWidth, this.maxWidth));
			particle.setHeight(rnd.integer(this.minHeight, this.maxHeight));

			if ( !this.color ) {
				switch ( rnd.integer(0,2) ) {
					case 0:
						particle.fillStyle = "rgb(255, 128, 0)";
						break;
					case 1:
						particle.fillStyle = "rgb(255, 180, 0)";
						break;
					default:
						particle.fillStyle = "rgb(255, 80, 0)";
				}
			} else {
				particle.fillStyle = this.color[rnd.integer(0, color.length - 1)];
			}

			if ( this.vanishRate ) {
				particle.vanishRate = this.vanishRate;
			}

			particle.speed = rnd.decimal(this.minSpeed, this.maxSpeed);

			this.children.push(particle);

		}

	};

	/**
	 * @class LinearParticleEmitter
	 * @constructor
	 * @namespace visual
	 * @constructor
	 * @param {int} particleAmount
	 * @param {String} color
	 * @param {float} [minWidth]
	 * @param {float} [minHeight]
	 * @param {float} [maxWidth]
	 * @param {float} [maxHeight]
	 * @param {float} [minSpeed]
	 * @param {float} [maxSpeed]
	 * @param {float} [vanishRate]
	 */
	function LinearParticleEmitter(amount, color, minWidth, minHeight, maxWidth, maxHeight, minSpeed, maxSpeed, vanishRate) {

		this.origin = origin;
		this.direction = direction;

		this.particles = createLinearParticles(particleAmount, origin, direction, minWidth || 4, minHeight || 4, maxWidth || 8, maxHeight || 8, minSpeed || 0.01, maxSpeed || 0.4, color, vanishRate || M.Math2d.randomFloat(0.01, 0.03));
		this.visibleParticles = this.particles.length;

	}
	/**
	 * Creates particles that will move from a point to another in a cone
	 * @method create
	 * @param {int} x the x center at where to create the particles
	 * @param {int} y the y center at where to create the particles
	 */
	LinearParticleEmitter.prototype.create = function(from, to) {
		
	};

	LinearParticleEmitter.prototype.onLoop = function(p) {

		if ( this.visible ) {

			var currentParticle;

			for ( var i = 0; i < this.particles.length; i++ ) {

				currentParticle = this.particles[i];

				currentParticle.onLoop(p);

				if ( ! currentParticle.isVisible() ) {

					if ( this.loop ) {

						currentParticle.setPath(this.origin, { x: this.origin.x + this.direction.x * 5, y: this.origin.y + this.direction.y * 5});
						currentParticle.rotation = 0;
						currentParticle.alpha = 1;
						currentParticle.angle = 0;
						currentParticle.vanishRate = M.Math2d.randomFloat(0.05, 0.2);
						currentParticle.speed = M.Math2d.randomFloat(0.005, 0.5);

					} else {

						this.visibleParticles--;

					}

				}
				
			}

			if ( this.visibleParticles < 1 ) {
					M.remove(this);
			}

		}

	};

	/**
	 * Applies a Tint on the provided game object
	 * @class Tint
	 * @constructor
	 * @deprecated
	 * @param {renderers.Renderizable} owner object to apply the tint
	 * @param {String} fillStyle tint color
	 * @param {int} duration duration in milliseconds
	 */
	function Tint(properties) {

		this.operation = "source-atop";
		this.startTime = 0;

		M.applyProperties( this, properties, ["fillStyle"] );

	}

	Tint.prototype.render = function( context, width, height ) {

		if ( this.isVisible() ) {

			context.globalCompositeOperation = this.operation;

			context.fillStyle = this.fillStyle;

			context.fillRect( 0, 0, width, height );

		}

	};

	Tint.prototype.show = function() {
		this.startTime = M.getTimeInMillis();
	};

	Tint.prototype.isVisible = function() {
		return this.showAlways || M.getTimeInMillis() - this.startTime < this.duration
	};

	/**
	 * Creates a FadeIn object to be applied to the given renderers.Renderizable.
	 * Fade the object in when the onLoop method is called
	 * @class FadeIn
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object object to apply the tint
	 * @param {int} seconds fade in duration in seconds
	 * @param {Function} [onFinished] function to execute on animation finish
	 */
	function FadeIn(object, seconds, onFinished) {

		if ( seconds == undefined ) seconds = 1;

		/* Rate is 1 because we must go from 0 to 1 in the given amount of seconds */
		this.rate = 1 / ( seconds * M.getAverageFps() );

		this.object = object;
		this.onFinished = onFinished;

	}

	FadeIn.prototype.initialize = function() {

		this.object.setAlpha(0);
		this.onLoop = this.run;
		return true;

	};

	FadeIn.prototype.run = function() {

		var newAlpha = this.object.getAlpha() + this.rate;
	
		if ( newAlpha < 1 ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( 1 );
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	FadeIn.prototype.onLoop = FadeIn.prototype.initialize;

	/**
	 * Creates a FadeOut object to be applied to the given renderers.Renderizable.
	 * Fade the object out when the onLoop method is called
	 * @class FadeOut
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object object to apply the tint
	 * @param {int} seconds fade out duration in seconds
	 * @param {Function} [onFinished] function to execute on animation finish
	 */
	function FadeOut(object, seconds, onFinished) {

		if ( seconds == undefined ) seconds = 1;

		/* Rate is 1 because we must go from 0 to 1 in the given amount of seconds */
		this.rate = 1 / ( seconds * M.getAverageFps() );

		this.object = object;
		this.onFinished = onFinished;

	}

	FadeOut.prototype.initialize = function() {
		this.object.setAlpha(1);
		this.onLoop = this.run;
		return true;
	};

	FadeOut.prototype.run = function() {

		var newAlpha = this.object.getAlpha() - this.rate;

		if ( newAlpha > 0 ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( 0 );
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	FadeOut.prototype.onLoop = FadeOut.prototype.initialize;

	/**
	 * Creates a Wait object to be applied to the given renderers.Renderizable.
	 * Wait is used for chained effects
	 * @class Wait
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object object to apply the tint
	 * @param {int} seconds fade out duration in seconds
	 * @param {Function} [onFinished] function to execute on animation finish
	 */
	function Wait(object, seconds, onFinished) {

		if ( seconds == undefined ) seconds = 1;

		this.seconds = seconds;
		this.object = object;
		this.timer = 0;
		this.onFinished = onFinished;

	}

	Wait.prototype.initialize = function(p) {
		this.timer = new M.TimeCounter(this.seconds * 1000);
		this.onLoop = this.run;
	};

	Wait.prototype.run = function() {


		if ( this.timer.elapsed() ) {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	Wait.prototype.onLoop = Wait.prototype.initialize;

	/**
	 * Creates ContinouseFade object to be applied to the given renderers.Renderizable.
	 * Continously fades in and out the object
	 * @class ContinousFade
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} seconds fade in and out duration in seconds
	 * @param {Boolean} fadeOut value that determines if effect will start as a fade out. Default starts fading in
	 * @param {int} min minumum alpha value
	 * @param {int} max maximum alpha value
	 */
	function ContinousFade(object, seconds, fadeOut, min, max) {
		
		if ( seconds == undefined ) seconds = 1;

		/* Rate is 1 because we must go from 0 to 1 in the given amount of seconds */
		this.rate = 1 / ( seconds * M.getAverageFps() );

		this.object = object;
		
		this.min = min || 0;
		this.max = max || 1;

		object.setAlpha( 1 );
		
		this.onFinished = this.changeFade;
		
		if ( fadeOut ) {
			this.onLoop = this.fadeOut;
		} else {
			this.onLoop = this.fadeIn;
		}
		
	}
	
	ContinousFade.prototype.fadeIn = function(p) {

		var newAlpha = this.object._alpha + this.rate;
	
		if ( newAlpha < this.max ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( this.max );
			this.onLoop = this.fadeOut;
		}

		return true;

	};
	
	ContinousFade.prototype.fadeOut = function() {
		
		var newAlpha = this.object._alpha - this.rate;

		if ( newAlpha > this.min ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( this.min );
			this.onLoop = this.fadeIn;
		}

		return true;
		
	};

	/**
	 * Creates Move object to be applied to the given renderers.Renderizable.
	 * Moves the object closer to the destination when the onLoop method is called
	 *
	 * @class FadeOut
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} seconds duration of the animation in seconds
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function Move( object, x, y, seconds, onFinished ) {

		this.object = object;
		this._x = x;
		this._y = y;

		if ( seconds == undefined ) seconds = 1;
		
		this.onFinished = onFinished;

		var lib = M.Math2d,
			frames = seconds * M.getAverageFps(),
			coorsFrom = new lib.Vector2d(object._x, object._y),
			coordsTo = new lib.Vector2d(x, y);

		this.speed = lib.getDistance( coorsFrom, coordsTo ) / frames;
		this.direction = M.Math2d.getNormalized( M.Math2d.getVector2d( coorsFrom, coordsTo ) );

	}

	Move.prototype.onLoop = function(p) {

		var moveX = Math.abs( this._x - this.object._x ) > this.speed,
			moveY = Math.abs( this._y - this.object._y ) > this.speed;
			
		if ( moveX ) this.object.offsetX(this.direction.x * this.speed);
		if ( moveY ) this.object.offsetY(this.direction.y * this.speed);

		if ( ! moveX && ! moveY ) {
			this.object.setLocation(this._x, this._y);
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	/**
	 * Creates a ScaleUp object to be applied to the given renderers.Renderizable.
	 * Scales the object up when the onLoop method is called
	 *
	 * @class ScaleUp
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} seconds duration of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function ScaleUp( object, x, y, seconds, onFinished ) {

		var frames = seconds * M.getAverageFps();

		if ( ! object._scale ) {
			object._scale = { x: 1, y: 1 };
		}

		this.speedX = Math.abs( object._scale.x - x ) / frames;
		this.speedY = Math.abs( object._scale.y - y ) / frames;
		this.object = object;
		this._x = x;
		this._y = y;
		this.onFinished = onFinished;

	}

	ScaleUp.prototype.onLoop = function(p) {

		if ( this.object._scale.x < this._x ) {
			this.object._scale.x += this.speedX;
			// this.notifyChange();
		}
		if ( this.object._scale.y < this._y ) {
			this.object._scale.y += this.speedY;
			// this.notifyChange();
		}

		if ( this.object._scale.x >= this._x && this.object._scale.y >= this._y ) {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};
	
	/**
	 * Creates a ScaleDown object to be applied to the given renderers.Renderizable.
	 * Scales the object down when the onLoop method is called
	 *
	 * @class ScaleDown
	 * @constructor
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} seconds duration of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function ScaleDown( object, x, y, seconds, onFinished ) {

		var frames = seconds * M.getAverageFps();

		if ( ! object._scale ) {
			object._scale = { x: 1, y: 1 };
		}

		this.speedX = Math.abs( object._scale.x - x ) / frames;
		this.speedY = Math.abs( object._scale.y - y ) / frames;
		this.object = object;
		this._x = x;
		this._y = y;
		this.onFinished = onFinished;

	}

	ScaleDown.prototype.onLoop = function(p) {

		if ( this.object._scale.x > this._x ) {
			this.object._scale.x -= this.speedX;
		}
		if ( this.object._scale.y > this._y ) {
			this.object._scale.y -= this.speedY;
		}

		if ( this.object._scale.x <= this._x && this.object._scale.y <= this._y ) {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	/**
	 * Creates a Twinkle object to be applied to the given renderers.Renderizable.
	 * Twinkles the object when the onLoop method is called
	 *
	 * @class Twinkle
	 * @constructor
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} times times to twinkle
	 * @param {int} duration duration in milliseconds of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function Twinkle(object, times, duration, onFinished) {
		this.object = object;
		if ( times == undefined ) {
			this.times = 6;
		} else {
			this.times = times * 2;
		}
		if ( duration == undefined ) {
			this.duration = 250;
		} else {
			this.duration = duration;
		}
		this.lastTime = 0;
		this.onFinished = onFinished;
	}

	Twinkle.prototype.onLoop = function(p) {

		if ( M.getTimeInMillis() - this.lastTime >= this.duration ) {

			if ( this.times-- ) {

				if ( this.object._alpha == 1 ) {
					this.object.setAlpha( 0 );
				} else {
					this.object.setAlpha( 1 );
				}

			} else {

				this.object.setAlpha( undefined );

				if ( this.onFinished ) this.onFinished.apply( this.object );
				return false;

			}

			this.lastTime = M.getTimeInMillis();

		}

		return true;

	};

	/**
	 * Creates a Rotate object to be applied to the given renderers.Renderizable.
	 * Rotates the object when the onLoop method is called
	 *
	 * @class Rotate
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {float} angle angle to rotate the object to
	 * @param {int} seconds duration in seconds of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function Rotate( object, angle, seconds, onFinished ) {

		if ( ! seconds ) seconds = 1;
	
		this.frames = seconds * M.getAverageFps();

		if ( ! object._rotation ) {
			object._rotation = 0;
		}

		this.object = object;
		this.angle = angle;
		this.onFinished = onFinished;

		this._rotation = ( this.angle - object._rotation ) / this.frames;

	}

	Rotate.prototype.onLoop = function(p) {

		if ( this.frames-- ) {
			this.object.offsetRotation(this._rotation);
		} else {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	/**
	 * Fades an object in
	 *
	 * Usage example:
	 *
	 * fadeIn( object, seconds, onFinished );
	 *
	 */
	function fadeIn( object, seconds, onFinished ) {
		return new Animation( new FadeIn( object, seconds, onFinished ) ).play();
	}

	/**
	 * Fades an object out
	 *
	 * Usage example:
	 *
	 * fadeOut( object, seconds, onFinished );
	 *
	 */
	function fadeOut( object, seconds, onFinished ) {
		return new Animation( new FadeOut( object, seconds, onFinished ) ).play();
	}

	
	/**
	 * Fades an object out
	 *
	 * Usage example:
	 *
	 * fadeOut( object, seconds, onFinished );
	 *
	 */
	function continousFade( object, seconds, fadeOutFirst ) {
		return new Animation( new ContinousFade( object, seconds, fadeOutFirst ) ).play();
	}

	/**
	 * Moves an object from a position to the other in a certain amout of time
	 *
	 * Usage example:
	 *
	 * move( object, x, y, seconds, acceleration, decceleration, onFinished );
	 *
	 */
	function move( object, x, y, seconds, onFinished ) {
		return new Animation( new Move( object, x, y, seconds, onFinished ) ).play();
	}

	/**
	 * Scales an object from its current scale value to the one provided.
	 *
	 * Usage example:
	 *
	 * scaleUp( object, x, y, seconds, onFinished );
	 *
	 */
	function scaleUp( object, x, y, seconds, onFinished ) {
		return new Animation( new ScaleUp( object, x, y, seconds, onFinished ) ).play();
	}

	/**
	 * Scales an object from its current scale value to the one provided.
	 *
	 * Usage example:
	 *
	 * scaleDown( object, x, y, seconds, onFinished );
	 *
	 */
	function scaleDown( object, x, y, seconds, onFinished ) {
		return new Animation( new ScaleDown( object, x, y, seconds, onFinished ) ).play();
	}

	/**
	 * Makes an object twinkle an amount of times during certain time
	 *
	 * Usage example:
	 *
	 * twinkle( objectToApply, timesToTwinkle, durationInMilliseconds, onFinished );
	 *
	 */
	function twinkle( object, times, duration, onFinished ) {
		return new Animation( new Twinkle( object, times, duration, onFinished ) ).play();
	}

	/**
	 * Rotates an object to the specified angle in seconds
	 *
	 * Usage example:
	 *
	 * rotate( objectToApply, angle, seconds, onFinished );
	 *
	 */
	function rotate( object, angle, seconds, onFinished ) {
		return new Animation( new Rotate( object, angle, seconds, onFinished ) ).play();
	}

	/**
	 * @deprecated
	 * Shakes the canvas for the specified duration of seconds
	 */
	function shakeCanvas( duration ) {

		if ( ! M.canvas.shaking ) {

			M.canvas.shaking = true;
			M.canvas.style.position = "relative";

			M.push({
			
				startTime: M.getGameTime(),

				duration: duration || 1,

				onLoop: function(p) {
					if ( M.getGameTime() - this.startTime < this.duration ) {
						p.canvas.style.left = p.M.randomSign() + "px";
						p.canvas.style.top = p.M.randomSign() + "px";
					} else {
						p.canvas.style.left = "0px";
						p.canvas.style.top = "0px";
						p.M.remove( this );
						p.canvas.shaking = false;
					}
				}

			}, "shake");

		}

	}

	/**
	 * @class visual
	 */
	namespace.visual = {

		Particle: Particle,
		LinearParticleEmitter: LinearParticleEmitter,
		RadialParticleEmitter: RadialParticleEmitter,

		Tint: Tint,

		Move: Move,
		FadeIn: FadeIn,
		FadeOut: FadeOut,
		ContinousFade: ContinousFade,
		ScaleUp: ScaleUp,
		ScaleDown: ScaleDown,
		Rotate: Rotate,
		Twinkle: Twinkle,
		Wait: Wait

	};

})( M.effects || ( M.effects = {} ), M );