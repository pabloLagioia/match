/**
 * @module Match
 */
(function(namespace, M) {

	// t: current time, b: begInnIng value, c: change In value, d: duration
	function Easing() {
		this.def = "easeOutQuad";
		this.math = window.Math;
	}

	Easing.prototype.swing = function (x, t, b, c, d) {
		return this[this.def](x, t, b, c, d);
	};
	Easing.prototype.easeInQuad = function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	};
	Easing.prototype.easeOutQuad = function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	};
	Easing.prototype.easeInOutQuad = function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	};
	Easing.prototype.easeInCubic = function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	};
	Easing.prototype.easeOutCubic = function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	};
	Easing.prototype.easeInOutCubic = function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	};
	Easing.prototype.easeInQuart = function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	};
	Easing.prototype.easeOutQuart = function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	};
	Easing.prototype.easeInOutQuart = function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	};
	Easing.prototype.easeInQuint = function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	};
	Easing.prototype.easeOutQuint = function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	};
	Easing.prototype.easeInOutQuint = function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	};
	Easing.prototype.easeInSine = function (x, t, b, c, d) {
		return -c * this.math.cos(t/d * (this.math.PI/2)) + c + b;
	};
	Easing.prototype.easeOutSine = function (x, t, b, c, d) {
		return c * this.math.sin(t/d * (this.math.PI/2)) + b;
	};
	Easing.prototype.easeInOutSine = function (x, t, b, c, d) {
		return -c/2 * (this.math.cos(this.math.PI*t/d) - 1) + b;
	};
	Easing.prototype.easeInExpo = function (x, t, b, c, d) {
		return (t==0) ? b : c * this.math.pow(2, 10 * (t/d - 1)) + b;
	};
	Easing.prototype.easeOutExpo = function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-this.math.pow(2, -10 * t/d) + 1) + b;
	};
	Easing.prototype.easeInOutExpo = function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * this.math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-this.math.pow(2, -10 * --t) + 2) + b;
	};
	Easing.prototype.easeInCirc = function (x, t, b, c, d) {
		return -c * (this.math.sqrt(1 - (t/=d)*t) - 1) + b;
	};
	Easing.prototype.easeOutCirc = function (x, t, b, c, d) {
		return c * this.math.sqrt(1 - (t=t/d-1)*t) + b;
	};
	Easing.prototype.easeInOutCirc = function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (this.math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (this.math.sqrt(1 - (t-=2)*t) + 1) + b;
	};
	Easing.prototype.easeInElastic = function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < this.math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*this.math.PI) * this.math.asin (c/a);
		return -(a*this.math.pow(2,10*(t-=1)) * this.math.sin( (t*d-s)*(2*this.math.PI)/p )) + b;
	};
	Easing.prototype.easeOutElastic = function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < this.math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*this.math.PI) * this.math.asin (c/a);
		return a*this.math.pow(2,-10*t) * this.math.sin( (t*d-s)*(2*this.math.PI)/p ) + c + b;
	};
	Easing.prototype.easeInOutElastic = function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < this.math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*this.math.PI) * this.math.asin (c/a);
		if (t < 1) return -.5*(a*this.math.pow(2,10*(t-=1)) * this.math.sin( (t*d-s)*(2*this.math.PI)/p )) + b;
		return a*this.math.pow(2,-10*(t-=1)) * this.math.sin( (t*d-s)*(2*this.math.PI)/p )*.5 + c + b;
	};
	Easing.prototype.easeInBack = function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	};
	Easing.prototype.easeOutBack = function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	};
	Easing.prototype.easeInOutBack = function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	};
	Easing.prototype.easeInBounce = function (x, t, b, c, d) {
		return c - this.easeOutBounce(x, d-t, 0, c, d) + b;
	};
	Easing.prototype.easeOutBounce = function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	};
	Easing.prototype.easeInOutBounce = function (x, t, b, c, d) {
		if (t < d/2) return this.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return this.easeOutBounce(x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	};

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
		this.onChangeEvent = new Object();
	}

	Particle.prototype.setWidth = function(width) {
		this._halfWidth = width / 2;
	};

	Particle.prototype.setHeight = function(height) {
		this._halfHeight = height / 2;
	};

	Particle.prototype.setPath = function(origin, destination) {

		this._x = origin.x;
		this._y = origin.y;

		this.direction = M.math2d.getVector2d(origin, destination);

	};

	Particle.prototype.onLoop = function() {

		this.alpha -= this.vanishRate;

		this.angle += this._rotationSpeed;
		this._x += this.speed * this.direction.x;
		this._y += this.speed * this.direction.y;

		this.onChangeEvent.needsRedraw = true;

	};

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

	Particle.prototype.setZIndex = function (value) {
        this._zIndex = value;
        this.onChangeEvent.needsRedraw = true;
        this.onChangeEvent.needsSorting = true;
    };

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
		this.onChangeEvent = new Object();
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
			this.onChangeEvent.needsRedraw = true;
		}
	};

	RadialParticleEmitter.prototype.onRender = function () {
	};

	RadialParticleEmitter.prototype.isVisible = function() {
		return true;
	};

	RadialParticleEmitter.prototype.setZIndex = function (value) {
		this._zIndex = value;
		this.onChangeEvent.needsRedraw = true;
		this.onChangeEvent.needsSorting = true;
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

	Tint.prototype = {

		render: function( context, width, height ) {

			if ( this.isVisible() ) {

				context.globalCompositeOperation = this.operation;

				context.fillStyle = this.fillStyle;

				context.fillRect( 0, 0, width, height );

			}

		},

		show: function() {
			this.startTime = M.getTimeInMillis();
		},

		isVisible: function() {
			return this.showAlways || M.getTimeInMillis() - this.startTime < this.duration;
		}

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

		object.setAlpha(0);

	}

	FadeIn.prototype.onLoop = function(p) {

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

		object.setAlpha( 1 );

	}

	FadeOut.prototype.onLoop = function(p) {

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
	
	/**
	 * Creates ContinouseFade object to be applied to the given renderers.Renderizable.
	 * Continously fades in and out the object
	 * @class ContinousFade
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} seconds fade in and out duration in seconds
	 * @param {Boolean} fadeOut value that determines if effect will start as a fade out. Default starts fading in
	 * @param [int] min minumum alpha value
	 * @param [int] max maximum alpha value
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
	 * @param [int] y destination y
	 * @param [Function] onFinished function to execute once the animation is finished
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

	Move.prototype = {

		onLoop: function(p) {

			var moveX = Math.abs( this._x - this.object._x ) > 1,
				moveY = Math.abs( this._y - this.object._y ) > 1;
				
			if ( moveX ) this.object.offsetX(this.direction.x * this.speed);
			if ( moveY ) this.object.offsetY(this.direction.y * this.speed);

			if ( ! moveX && ! moveY ) {
				if ( this.onFinished ) this.onFinished.apply( this.object );
				return false;
			}

			return true;

		}

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
	 * @param [int] y destination y
	 * @param [int] seconds duration of the effect
	 * @param [Function] onFinished function to execute once the animation is finished
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

	ScaleUp.prototype = {

		onLoop: function(p) {

			if ( this.object._scale.x < this._x ) {
				this.object._scale.x += this.speedX;
				this.object.onChangeEvent.needsRedraw = true;
			}
			if ( this.object._scale.y < this._y ) {
				this.object._scale.y += this.speedY;	
				this.object.onChangeEvent.needsRedraw = true;
			}

			if ( this.object._scale.x >= this._x && this.object._scale.y >= this._y ) {
				if ( this.onFinished ) this.onFinished.apply( this.object );
				return false;
			}

			return true;

		}

	};
	
	/**
	 * Creates a ScaleDown object to be applied to the given renderers.Renderizable.
	 * Scales the object down when the onLoop method is called
	 *
	 * @class ScaleDown
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param [int] y destination y
	 * @param [int] seconds duration of the effect
	 * @param [Function] onFinished function to execute once the animation is finished
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

	ScaleDown.prototype = {

		onLoop: function(p) {

			if ( this.object._scale.x > this._x ) {
				this.object._scale.x -= this.speedX;
				this.object.onChangeEvent.needsRedraw = true;
			}
			if ( this.object._scale.y > this._y ) {
				this.object._scale.y -= this.speedY;
				this.object.onChangeEvent.needsRedraw = true;
			}

			if ( this.object._scale.x <= this._x && this.object._scale.y <= this._y ) {
				if ( this.onFinished ) this.onFinished.apply( this.object );
				return false;
			}

			return true;

		}

	};

	/**
	 * Creates a Twinkle object to be applied to the given renderers.Renderizable.
	 * Twinkles the object when the onLoop method is called
	 *
	 * @class ScaleDown
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} times times to twinkle
	 * @param [int] duration duration in milliseconds of the effect
	 * @param [Function] onFinished function to execute once the animation is finished
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

	Twinkle.prototype = {

		onLoop: function(p) {

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

		}

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
	 * @param [int] seconds duration in seconds of the effect
	 * @param [Function] onFinished function to execute once the animation is finished
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

	Rotate.prototype = {

		onLoop: function(p) {

			if ( this.frames-- ) {
				this.object.offsetRotation(this._rotation);
			} else {
				if ( this.onFinished ) this.onFinished.apply( this.object );
				return false;
			}

			return true;

		}

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

	};

})( M.effects || ( M.effects = {} ), M );