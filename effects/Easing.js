/**
 * @module Match
 */
(function(namespace, M) {

	/**
	 * @class Easing
	 * @namespace visual
	 * @constructor
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} durationSeconds duration of the animation in seconds
	 * @param {String} easingMethodX easing function to apply to the x axis
	 * @param {String} easingMethodY easing function to apply to the y axis
	 * Note: for more information on easing please go to http://www.gizma.com/easing/#sin3
	 */
	function Easing(object, endValueX, endValueY, durationSeconds, easingMethodX, easingMethodY, loop, onFinished) {

		this.object = object;

		this.endValueX = endValueX;
		this.endValueY = endValueY;
		
		this.startValueX = 0;
		this.startValueY = 0;

		this.easingMethodX = this[easingMethodX] || this["linearTween"];
		this.easingMethodY = this[easingMethodY] || this.easingMethodX;
	
		this.currentFrame = 1;

		this.durationSeconds = durationSeconds;

		this.mathCached = Math;

		this.totalFrames = 0;
		
		this.loop = loop;
		
		this._needsStartValue = true;
		
		this.onFinished = onFinished;

	}

	Easing.prototype._init = function() {

		var durationSeconds = this.durationSeconds;

		if ( typeof durationSeconds == "string" && durationSeconds.indexOf("px") != -1 ) {
			
			durationSeconds = parseInt(durationSeconds);
			
			var xDistanceToCover = this.endValueX - this.object.getX();
			var yDistanceToCover = this.endValueY - this.object.getY();

			var pixelsPerSecond = durationSeconds;

			var timeToCoverX = xDistanceToCover / pixelsPerSecond;
			var timeToCoverY = yDistanceToCover / pixelsPerSecond;

			durationSeconds = Math.max(timeToCoverX, timeToCoverY);

		}

		this.totalFrames = durationSeconds * M.getAverageFps();

		this.currentFrame = 0;
		
		if ( this._needsStartValue || !this.loop ) {

			this.startValueX = this.object.getX();
			this.startValueY = this.object.getY();
			
			this.endValueX = this.endValueX - this.startValueX;
			this.endValueY = this.endValueY - this.startValueY;
			
			this._needsStartValue = false;
			
		}
		
		
		this.onLoop = this._ease;
		
		return true;
		
	};
	
	Easing.prototype._ease = function () {
	
		this.object.setLocation(
			this.easingMethodX(this.currentFrame, this.startValueX, this.endValueX, this.totalFrames), 
			this.easingMethodY(this.currentFrame, this.startValueY, this.endValueY, this.totalFrames)
		);
		
		this.currentFrame++;
		
		if ( this.currentFrame <= this.totalFrames ) {
			return true;
		} else {
			if ( this.onFinished ) {
				this.onFinished.apply(this.object);
			}
			if ( this.loop ) {
				this.onLoop = this._init;
				return true;
			}
		}
		
		return false;
		
	};

	Easing.prototype.onLoop = Easing.prototype._init;

	/**
	 * Simple linear tweening - no easing, no acceleration
	 * @method linearTween
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.linearTween = function (t, b, c, d) {
		return c*t/d + b;
	};

	/**
	 * Quadratic easing in - accelerating from zero velocity
	 * @method easeInQuad
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInQuad = function (t, b, c, d) {
		t /= d;
		return c*t*t + b;
	};
			
	/**
	 * quadratic easing out - decelerating to zero velocity
	 * @method easeOutQuad
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutQuad = function (t, b, c, d) {
		t /= d;
		return -c * t*(t-2) + b;
	};
			
	/**
	 * quadratic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutQuad
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutQuad = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t + b;
		t--;
		return -c/2 * (t*(t-2) - 1) + b;
	};

	/**
	 * cubic easing in - accelerating from zero velocity
	 * @method easeInCubic
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInCubic = function (t, b, c, d) {
		t /= d;
		return c*t*t*t + b;
	};
			
	/**
	 * cubic easing out - decelerating to zero velocity
	 * @method easeOutCubic
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutCubic = function (t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	};
			
	/**
	 * cubic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutCubic
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutCubic = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	};
		
	/**
	 * quartic easing in - accelerating from zero velocity
	 * @method easeInQuart
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInQuart = function (t, b, c, d) {
		t /= d;
		return c*t*t*t*t + b;
	};
		
	/**
	 * quartic easing out - decelerating to zero velocity
	 * @method easeOutQuart
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutQuart = function (t, b, c, d) {
		t /= d;
		t--;
		return -c * (t*t*t*t - 1) + b;
	};

	/**
	 * quartic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutQuart
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutQuart = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t + b;
		t -= 2;
		return -c/2 * (t*t*t*t - 2) + b;
	};

	/**
	 * quintic easing in - accelerating from zero velocity
	 * @method easeInQuint
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInQuint = function (t, b, c, d) {
		t /= d;
		return c*t*t*t*t*t + b;
	};

	/**
	 * quintic easing out - decelerating to zero velocity
	 * @method easeOutQuint
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutQuint = function (t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t*t*t + 1) + b;
	};

	/**
	 * quintic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutQuint
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutQuint = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t*t*t + 2) + b;
	};

	/**
	 * sinusoidal easing in - accelerating from zero velocity
	 * @method easeInSine
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInSine = function (t, b, c, d) {
		return -c * this.mathCached.cos(t/d * (this.mathCached.PI/2)) + c + b;
	};

	/**
	 * sinusoidal easing out - decelerating to zero velocity
	 * @method easeOutSine
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutSine = function (t, b, c, d) {
		return c * this.mathCached.sin(t/d * (this.mathCached.PI/2)) + b;
	};

	/**
	 * sinusoidal easing in/out - accelerating until halfway, then decelerating
	 * @method easeInOutSine
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutSine = function (t, b, c, d) {
		return -c/2 * (this.mathCached.cos(this.mathCached.PI*t/d) - 1) + b;
	};

	/**
	 * exponential easing in - accelerating from zero velocity
	 * @method easeInExpo
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInExpo = function (t, b, c, d) {
		return c * this.mathCached.pow( 2, 10 * (t/d - 1) ) + b;
	};

	/**
	 * exponential easing out - decelerating to zero velocity
	 * @method easeOutExpo
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutExpo = function (t, b, c, d) {
		return c * ( -this.mathCached.pow( 2, -10 * t/d ) + 1 ) + b;
	};

	/**
	 * exponential easing in/out - accelerating until halfway, then decelerating
	 * @method easeInOutExpo
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutExpo = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2 * this.mathCached.pow( 2, 10 * (t - 1) ) + b;
		t--;
		return c/2 * ( -this.mathCached.pow( 2, -10 * t) + 2 ) + b;
	};	

	/**
	 * circular easing in - accelerating from zero velocity
	 * @method easeInCirc
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInCirc = function (t, b, c, d) {
		t /= d;
		return -c * (this.mathCached.sqrt(1 - t*t) - 1) + b;
	};

	/**
	 * circular easing out - decelerating to zero velocity
	 * @method easeOutCirc
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutCirc = function (t, b, c, d) {
		t /= d;
		t--;
		return c * this.mathCached.sqrt(1 - t*t) + b;
	};

	/**
	 * Circular easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutCirc
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutCirc = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return -c/2 * (this.mathCached.sqrt(1 - t*t) - 1) + b;
		t -= 2;
		return c/2 * (this.mathCached.sqrt(1 - t*t) + 1) + b;
	};

	/*
	Easing.prototype.easeInOutSine = function (currentTime, startValue, endValue, duration) {
		return -endValue / 2 * (this.mathCached.cos(this.mathCached.PI * currentTime / duration) - 1) + startValue;
	};
	Easing.prototype.easeInQuad = function(currentTime, startValue, endValue, duration) {
		currentTime /= duration;
		return endValue * currentTime * currentTime + startValue;
	};
	*/

	namespace.Easing = Easing;

})(M.effects.visual, M);