/**
 * @module Match
 * @namespace renderers
 */
(function(M, visual) {
	/**
	 * Provides basic behaviour for rendering game objects
	 *
	 * @class Renderizable
	 * @constructor
	 * @extends GameObjectWithEvents
	 * @param {Object} [properties] properties to construct this object
	 */
    function Renderizable(properties) {
    	M.GameObject.call(this);
		/**
		 * X coordinate of the object
		 * @private
		 * @property _x
		 * @type float
		 */
        this._x = 0;
		/**
		 * Y coordinate of the object
		 * @private
		 * @property _y
		 * @type float
		 */
		this._y = 0;
		/**
		 * object width
		 * @private
		 * @property _width
		 * @type float
		 */
		this._width = 0;
		/**
		 * object height
		 * @private
		 * @property _height
		 * @type float
		 */
        this._height = 0;
		/**
		 * object half width, used for faster rendering
		 * @private
		 * @property _halfWidth
		 * @type float
		 */
        this._halfWidth = 0;
		/**
		 * object half height, used for faster rendering
		 * @private
		 * @property _halfHeight
		 * @type float
		 */
        this._halfHeight = 0;
		/**
		 * object rotation
		 * @private
		 * @property _rotation
		 * @type float
		 */
        this._rotation = null;
		/**
		 * object scale factor
		 * @private
		 * @property _scale
		 * @type Object
		 * @example
				this._scale = { x: 1, y: 1 };
		 */
        this._scale = null;
		/**
		 * object visibility. Determines whether the object will be rendered or not
		 * @private
		 * @property _visible
		 * @type Boolean
		 */
        this._visible = true;
		/**
		 * Composite operation
		 * Possible values: "source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "darker" | "copy" | "xor"
		 * @property operation
		 * @type String
		 * @example
				this.operation = "source-in"
			
		 */
		this.operation = null;
		/**
		 * Array that contains animations for this object
		 * @private
		 * @property animations
		 * @type ArrayList
		 */
        this.animations = new M.ArrayList();
		/**
		 * Array that contains chained animations for this object
		 * @private
		 * @property chainedAnimations
		 * @type ArrayList
		 */
        this.chainedAnimations = new M.ArrayList();
        /**
		 * Array that contains behaviours for this object
		 * @private
		 * @property behaviours
		 * @type ArrayList
		 */
        this.attributes = {};
        /**
		 * Array that contains behaviours for this object
		 * @private
		 * @property behaviours
		 * @type ArrayList
		 */
        this.behaviours = new M.ArrayList();
		/**
		 * Index of the behaviour that's being executed at the moment
		 * @private
		 * @property _currentChainedBehaviour
		 * @type int
		 */
		this._currentChainedBehaviour = 0;
		/**
		 * Array that contains timers for this object
		 * @private
		 * @property _onLoopTimers
		 * @type Array
		 */
        this._onLoopTimers = new M.ArrayList();
		/**
		 * object transparency
		 * @private
		 * @property _alpha
		 * @type float
		 */
		this._alpha = null;
		/**
		 * Reference to the layer that contains this object
		 * @private
		 * @property onwerLayer
		 * @type float
		 */
		this.onwerLayer = null;

		this._raisedNotVisible = false;

        this.set(properties);

	}
	Renderizable.prototype.addAttribute = function(name, attribute) {
		this.attributes[name] = attribute;
	};
	Renderizable.prototype.addBehaviour = function(behaviour) {
		this.behaviours.push(behaviour);
	};
	Renderizable.prototype.addAttributes = function(map) {
		for ( var i in map ) {
			this.addAttribute(i, map[i]);
		}
	};
	Renderizable.prototype.addBehaviours = function() {
		for ( var i = 0; i < arguments.length; i++ ) {
			this.behaviours.push(arguments[i]);
		}
	};
	Renderizable.prototype.removeBehaviours = function() {
		for ( var i in arguments ) {
			this.behaviours.splice(this.behaviours.indexOf(i), 1);
		}
	};
	Renderizable.prototype.removeAttributes = function() {
		for ( var i in arguments ) {
			this.attributes[i] = null;
		}
	};
	Renderizable.prototype.replaceBehaviour = function(out, in_) {
		this.behaviours[this.behaviours.indexOf(out)] = in_;
	};
	Renderizable.prototype.replaceAttribute = function(name, in_) {
		this.attributes[name] = in_;
	};
	/**
	 * Notifies owner layer about a change in this object
	 * @method notifyChange
	 */
	Renderizable.prototype.notifyChange = function() {
		this.ownerLayer&&this.ownerLayer.renderizableChanged();
	};
	/**
	 * Notifies owner layer about a change in the zIndex this object
	 * @method notifyZIndexChange
	 */
	Renderizable.prototype.notifyZIndexChange = function() {
		this.ownerLayer&&this.ownerLayer.zIndexChanged();
	};
	/**
	 * @private
	 * @property _zIndex
	 * @type int
	 */
	Renderizable.prototype._zIndex = 0;
	/**
	 * Loops through animations, timers and calls onUpdate
	 * @method onLoop
	 * @protected
	 */
    Renderizable.prototype.onLoop = function (p) {
        this._loopThroughAnimations();
        this._loopThroughTimers();
        for ( var i = 0; i < this.behaviours.length; i++ ) {
        	this.behaviours[i](this, this.attributes);
        }
        if (this.onUpdate) this.onUpdate(p);
    };
	/**
	 * Sets the properties of this object based on the given object
	 * @method set
	 * @param {Object} properties properties to construct this object
	 */
    Renderizable.prototype.set = function (properties) {
        if (!properties) return;
        var setter = "";
        for (var i in properties) {
            setter = "set" + i.charAt(0).toUpperCase() + i.substr(1);
            if (this[setter]) {
                this[setter](properties[i]);
            } else {
                this[i] = properties[i];
            }
        }
    };
	/**
	 * Sets the transparency of the object
	 * @method setAlpha
	 * @param {float} value alpha value to set. Must be between 0 and 1
	 */
	Renderizable.prototype.setAlpha = function(value) {
		if ( value >= 0 && value <= 1 ) {
			this._alpha = value;
			this.notifyChange();
		} else {
			this._alpha = null;
		}
	};
	/**
	 * Gets the transparency of the object
	 * @method getAlpha
	 * @param {float} value alpha value
	 */
	Renderizable.prototype.getAlpha = function() {
		return this._alpha;
	};
	/**
	 * Loops through the animations of an object. When the animation
	 * is complete it is removed from the list.
	 * @method _loopThroughAnimations
	 * @private
	 */
	Renderizable.prototype._loopThroughAnimations = function () {

		function doLoop(item, index, list) {
			if ( item && !item.onLoop() ) {
				list.quickRemove(index);
			}
		}

		this.animations.each(doLoop);
		
		if ( this.chainedAnimations.size ) {
			if ( !this.chainedAnimations._list[this._currentChainedBehaviour].onLoop() ) {
				this._currentChainedBehaviour++;
			}
			if ( this._currentChainedBehaviour == this.chainedAnimations.size ) {
				this.chainedAnimations.removeAll();
				this._currentChainedBehaviour = 0;
			}
		}
		
	};
	/**
	 * Clears the animation loop
	 * @method clearAnimations
	 */
	Renderizable.prototype.clearAnimations = function () {
		this.animations = new Array();
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.fadeIn = function (seconds, onFinished) {
		this.animations.push(new visual.FadeIn(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade out animation to this object
	 * @method fadeOut
	 * @param {int} seconds time in seconds that the fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.fadeOut = function (seconds, onFinished) {
		this.animations.push(new visual.FadeOut(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a continouse fade animation to this object
	 * @method continousFade
	 * @param {int} seconds time in seconds that the fade in and fade out will take
	 * @param {Boolean} [fadeOutFirst] determines whether the animation will start fading in or out
	 * @param {int} [min] minumum alpha value, defaults to 0
	 * @param {int} [max] maximum alpha value, defaults to 1
	 */
	Renderizable.prototype.continousFade = function (seconds, fadeOutFirst, min, max) {
		this.animations.push(new visual.ContinousFade(this, seconds, fadeOutFirst, min, max));
		return this;
	};
	/**
	 * Moves an object to the given coordinates in the provided seconds
	 * @method move
	 * @param {float} x the destination x coordinate
	 * @param {float} y the destination y coordinate
	 * @param {String} easingX Ease function name for x axis
	 * @param {String} easingY Ease function name for y axis
	 * @param {Boolean} loop Start over when reched destination
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.move = function (x, y, seconds, easingX, easingY, loop, onFinished) {
		this.animations.push(new visual.Easing(this, x, y, seconds, easingX, easingY, loop, onFinished));
		return this;
	};
	/**
	 * Scales an object up to the given values in the provided seconds
	 * @method scaleUp
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.scaleUp = function (x, y, seconds, onFinished) {
		this.animations.push(new visual.ScaleUp(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Scales an object down to the given values in the provided seconds
	 * @method scaleDown
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.scaleDown = function (x, y, seconds, onFinished) {
		this.animations.push(new visual.ScaleDown(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Makes an object twinkle the given amount of times in the duration provided
	 * @method twinkle
	 * @param {int} timesToTwinkle the amount of times the object will twinkle
	 * @param {int} durationInMilliseconds the duration, in milliseconds, the twinkle effect will last
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.twinkle = function (timesToTwinkle, durationInMilliseconds, onFinished) {
		this.animations.push(new visual.Twinkle(this, timesToTwinkle, durationInMilliseconds, onFinished));
		return this;
	};
	/**
	 * Rotates an object to the given angle in the provided seconds
	 * @method rotate
	 * @param {float} the destination angle
	 * @param {int} seconds the duration the rotation effect will take to reach the provided angle
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.rotate = function (angle, seconds, onFinished) {
		this.animations.push(new visual.Rotate(this, angle, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainWait = function (seconds, onFinished) {
		this.chainedAnimations.push(new visual.Wait(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainFadeIn = function (seconds, onFinished) {
		this.chainedAnimations.push(new visual.FadeIn(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade out animation to this object
	 * @method fadeOut
	 * @param {int} seconds time in seconds that the fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainFadeOut = function (seconds, onFinished) {
		this.chainedAnimations.push(new visual.FadeOut(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a continouse fade animation to this object
	 * @method continousFade
	 * @param {int} seconds time in seconds that the fade in and fade out will take
	 * @param {Boolean} [fadeOutFirst] determines whether the animation will start fading in or out
	 * @param {int} [min] minumum alpha value, defaults to 0
	 * @param {int} [max] maximum alpha value, defaults to 1
	 */
	Renderizable.prototype.chainContinousFade = function (seconds, fadeOutFirst, min, max) {
		this.chainedAnimations.push(new visual.ContinousFade(this, seconds, fadeOutFirst, min, max));
		return this;
	};
	/**
	 * Moves an object to the given coordinates in the provided seconds
	 * @method move
	 * @param {float} x the destination x coordinate
	 * @param {float} y the destination y coordinate
	 * @param {int} seconds time in seconds that the fade in and fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainMove = function (x, y, seconds, easingX, easingY) {
		// this.chainedAnimations.push(new visual.Move(this, x, y, seconds, onFinished));
		this.chainedAnimations.push(new visual.Easing(this, x, y, seconds, easingX, easingY));
		return this;
	};
	/**
	 * Scales an object up to the given values in the provided seconds
	 * @method scaleUp
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainScaleUp = function (x, y, seconds, onFinished) {
		this.chainedAnimations.push(new visual.ScaleUp(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Scales an object down to the given values in the provided seconds
	 * @method scaleDown
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainScaleDown = function (x, y, seconds, onFinished) {
		this.chainedAnimations.push(new visual.ScaleDown(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Makes an object twinkle the given amount of times in the duration provided
	 * @method twinkle
	 * @param {int} timesToTwinkle the amount of times the object will twinkle
	 * @param {int} durationInMilliseconds the duration, in milliseconds, the twinkle effect will last
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainTwinkle = function (timesToTwinkle, durationInMilliseconds, onFinished) {
		this.chainedAnimations.push(new visual.Twinkle(this, timesToTwinkle, durationInMilliseconds, onFinished));
		return this;
	};
	/**
	 * Rotates an object to the given angle in the provided seconds
	 * @method rotate
	 * @param {float} the destination angle
	 * @param {int} seconds the duration the rotation effect will take to reach the provided angle
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainRotate = function (angle, seconds, onFinished) {
		this.chainedAnimations.push(new visual.Rotate(this, angle, seconds, onFinished));
		return this;
	};
	/**
	 * Loops through the timers of the object
	 * @private
	 * @method _loopThroughTimers
	 */
    Renderizable.prototype._loopThroughTimers = function () {
        var i = 0,
        l = this._onLoopTimers.length;
        for (; i < l; i++) {
            this._onLoopTimers[i].onLoop();
        }
    };
	/**
	 * Adds a timer to this object and returns it
	 * @method addTimer
	 * @param {int} timeInMillis
	 * @param {Function} callback the function to call once per interval. If the callback function is a method of this object, then the context will become this object
	 * @returns {Timer} the newly created timer
	 */
    Renderizable.prototype.addTimer = function (timeInMillis, callback) {
        var timer = new M.Timer(timeInMillis, callback, this);
        this._onLoopTimers.push(timer);
        return timer;
    };
	/**
	 * Removes a timer from this object
	 * @method removeTimer
	 * @param {Function} callback the function to be removed
	 * @returns {Renderizable} returns itself
	 */
    Renderizable.prototype.removeTimer = function (callback) {
        this._onLoopTimers.splice(this._onLoopTimers.indexOf(this._getTimer(callback)), 1);
        return this;
    };
	/**
	 * Returns the timer that handles the given callback
	 * @method _getTimer
	 * @private
	 * @param {Function} callback the function assigned to the timer
	 * @returns {Timer} the timer or null
	 */
    Renderizable.prototype._getTimer = function (callback) {
        var i = 0,
        l = this._onLoopTimers.length;
        for (; i < l; i++) {
            if (this._onLoopTimers[i].callback == callback) return this._onLoopTimers[i];
        }
    };
	/**
	 * Sets the zIndex of this object
	 * @method setZIndex
	 * @param {int} value the zIndex
	 */
    Renderizable.prototype.setZIndex = function (value) {
        this._zIndex = value;
        this.notifyChange();
        this.notifyZIndexChange();
    };
	/**
	 * Gets the zIndex of this object
	 * @method getZIndex
	 * @return {int} the zIndex
	 */
    Renderizable.prototype.getZIndex = function () {
        return this._zIndex;
    };
	/**
	 * Sets the visibility of this object
	 * @method setVisible
	 * @param {Boolean} value true if it is visible or false if it is not
	 */
    Renderizable.prototype.setVisible = function (value) {
        this._visible = value;
        this.notifyChange();
    };
	/**
	 * Sets the width of this object
	 * @method setWidth
	 * @param {float} value
	 */
    Renderizable.prototype.setWidth = function (value) {
        this._width = value;
        this._halfWidth = value / 2;
        this.notifyChange();
    };
	/**
	 * Sets the height of this object
	 * @method setHeight
	 * @param {float} value
	 */
    Renderizable.prototype.setHeight = function (value) {
        this._height = value;
        this._halfHeight = value / 2;
        this.notifyChange();
    };
	/**
	 * Gets the width of this object
	 * @method getWidth
	 * @return {float} the width
	 */
    Renderizable.prototype.getWidth = function () {
        if (this._scale) {
            return this._width * this._scale.x;
        } else {
            return this._width;
        }
    };
	/**
	 * Gets the height of this object
	 * @method getHeight
	 * @return {float} the height
	 */
    Renderizable.prototype.getHeight = function () {
        if (this._scale) {
            return this._height * this._scale.y;
        } else {
            return this._height;
        }
    };
	/**
	 * Sets the width and height of this object. Behaves exactly as if calling setWidth(width); setHeight(height);
	 * @method setSize
	 * @param {float} the width
	 * @param {float} the height
	 */
    Renderizable.prototype.setSize = function (width, height) {
        this.setWidth(width);
        this.setHeight(height);
    };
	/**
	 * Returns the width and height of this object
	 * @method getSize
	 */
    Renderizable.prototype.getSize = function () {
        return {width: this.getWidth(), height: this.getHeight()};
    };
	/**
	 * Sets the scale of this object. Behaves exactly as if calling setScaleX(x); setScaleY(y);
	 * @method setScale
	 * @param {float} the width factor, defaults to 1
	 * @param {float} the height factor, defaults to 1
	 */
    Renderizable.prototype.setScale = function (x, y) {
        if (!x && !y) return;
        if (!x) x = 1;
        if (!y) y = 1;
        this._scale = {
            x: x,
            y: y
        };
        this.notifyChange();
    };
	/**
	 * Sets the scale width factor
	 * @method setScaleX
	 * @param {float} the width factor
	 */
    Renderizable.prototype.setScaleX = function (x) {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.y = 1;
		}
        this._scale.x = x;
        this.notifyChange();
    };
	/**
	 * Sets the scale height factor
	 * @method setScaleY
	 * @param {float} the height factor
	 */
    Renderizable.prototype.setScaleY = function (y) {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.x = 1;
		}
		this._scale.y = y;
		this.notifyChange();
	};
	/**
	 * Inverts the object in the x axis
	 * Note: Works exactly as invertX
	 * @method mirror
	 */
	Renderizable.prototype.mirror = function () {
		this.invertX();
	};
	/**
	 * Inverts the object in the x axis
	 * @method invertX
	 */
    Renderizable.prototype.invertX = function () {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.x = 1;
			this._scale.y = 1;
		}
        this._scale.x *= -1;
        this.notifyChange();
    };
	/**
	 * Inverts the object in the y axis
	 * @method invertY
	 */
    Renderizable.prototype.invertY = function () {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.x = 1;
			this._scale.y = 1;
		}
        this._scale.y = -1;
        this.notifyChange();
    };
	/**
	 * Returns x coordinate representing the leftmost part of the Object
	 *
	 * @method getLeft
	 * @return {float} the coordinates to left of the object
	 */
    Renderizable.prototype.getLeft = function () {
        if (this._scale) {
            if (this.pivotX != undefined) {
                return this._x + this.pivotX - this._width * this._scale.x;
            } else {
                return this._x - this._halfWidth * this._scale.x;
            }
        } else {
            if (this.pivotX != undefined) {
                return this._x + this.pivotX - this._width;
            } else {
                return this._x - this._halfWidth;
            }
        }
    };
	/**
	 * Returns x coordinate representing the rightmost part of the Object
	 *
	 * @method getRight
	 * @return {float} the coordinates to right of the object
	 */
    Renderizable.prototype.getRight = function () {
        if (this._scale) {
            if (this.pivotX != undefined) {
                return this._x + this.pivotX + this._width * this._scale.x;
            } else {
                return this._x + this._halfWidth * this._scale.x;
            }
        } else {
            if (this.pivotX != undefined) {
                return this._x + this.pivotX + this._width;
            } else {
                return this._x + this._halfWidth;
            }
        }
    };
	/**
	 * Returns y coordinate representing the topmost part of the Object
	 *
	 * @method getTop
	 * @return {float} the coordinates to top of the object
	 */
    Renderizable.prototype.getTop = function () {
        if (this._scale) {
            if (this.pivotY != undefined) {
                return this._y + this.pivotY - this._height * this._scale.y;
            } else {
                return this._y - this._halfHeight * this._scale.y;
            }
        } else {
            if (this.pivotY != undefined) {
                return this._y + this.pivotY - this._height;
            } else {
                return this._y - this._halfHeight;
            }
        }
    };
	/**
	 * Returns y coordinate representing the bottommost part of the Object
	 *
	 * @method getBottom
	 * @return {float} the coordinates to bottom of the object
	 */
    Renderizable.prototype.getBottom = function () {
        if (this._scale) {
            if (this.pivotY != undefined) {
                return this._y + this.pivotY + this._height * this._scale.y;
            } else {
                return this._y + this._halfHeight * this._scale.y;
            }
        } else {
            if (this.pivotY != undefined) {
                return this._y + this.pivotY + this._height;
            } else {
                return this._y + this._halfHeight;
            }
        }
    };
	/**
	 * Sets the leftmost coordinates of the Object
	 *
	 * @method setLeft
	 * @param {float} value the coordinates to left of the object
	 */
    Renderizable.prototype.setLeft = function (value) {
		this._prevX = this._x;
        if (this._scale) {
            this._x = value + this._halfWidth * this._scale.x;
        } else {
            this._x = value + this._halfWidth;
        }
		for ( var i = 0; i < this.children.length; i++ ) {
			this.children[i].setLeft();
		}
        this.notifyChange();
    };
	/**
	 * Sets the rightmost coordinates of the Object
	 *
	 * @method setRight
	 * @param {float} value the coordinates to right of the object
	 */
    Renderizable.prototype.setRight = function (value) {
		this._prevX = this._x;
        if (this._scale) {
            this._x = value - this._halfWidth * this._scale.x;
        } else {
            this._x = value - this._halfWidth;
        }
		this.updateChildrenPosition();
        this.notifyChange();
    };
	/**
	 * Sets the topmost coordinates of the Object
	 *
	 * @method setTop
	 * @param {float} value the coordinates to top of the object
	 */
    Renderizable.prototype.setTop = function (value) {
		this._prevY = this._y;
        if (this._scale) {
            this._y = value + this._halfHeight * this._scale.y;
        } else {
            this._y = value + this._halfHeight;
        }
		this.updateChildrenPosition();
        this.notifyChange();
    };
	/**
	 * Sets the bottommost coordinates of the Object
	 *
	 * @method setBottom
	 * @param {float} value the coordinates to bottom of the object
	 */
    Renderizable.prototype.setBottom = function (value) {
		this._prevY = this._y;
        if (this._scale) {
            this._y = value - this._halfHeight * this._scale.y;
        } else {
            this._y = value - this._halfHeight;
        }
		this.updateChildrenPosition();
        this.notifyChange();
    };
	/**
	 * Returns an object containing the x and y coordinates of the object
	 *
	 * @method getLocation
	 * @return Object
	 * @example
			{x: 100, y: 400}
	 */
    Renderizable.prototype.getLocation = function () {
		return {
			x: this._x,
			y: this._y
		};
    };
	/**
	 * Sets the x and y coordinates of the object
	 *
	 * @method setLocation
	 * @param {float} x the x coordinate
	 * @param {float} y the y coordinate
	 */
    Renderizable.prototype.setLocation = function (x, y) {
		this.prevX = this._x;
		this.prevY = this._y;
		this._x = x;
		this._y = y;
		this.updateChildrenPosition();
		this.notifyChange();
    };
	/**
	 * Returns true if this object moved in the x axis
	 *
	 * @method movedInX
	 * @param {CanvasRenderingContext2D} context
	 */
	Renderizable.prototype.movedInX = function () {
		return this.prevX != this._x;
	};
	/**
	 * Returns true if this object moved in the y axis
	 *
	 * @method movedInY
	 * @return {Boolean}
	 */
	Renderizable.prototype.movedInY = function () {
		return this.prevY != this._y;
	};
	/**
	 * Applies the operation of this object to the provided context as composite operation
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 */
	Renderizable.prototype._applyOperation = function(context) {
		if ( this.operation ) {
			context.globalCompositeOperation = this.operation;
			context.operationChanged = false;
		} else if (context.operationChanged) {
			context.resetOperation();
		}
	};
	/**
	 * Applies the alpha of this object to the provided context
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 */
	Renderizable.prototype._applyAlpha = function(context) {
		if ( this._alpha != null && this._alpha >= 0 && this._alpha <= 1 ) {
			context.globalAlpha = this._alpha;
			context.alphaChanged = true;
		} else if (context.alphaChanged) {
			context.resetAlpha();
		}
	};
	/**
	 * Applies the shadow of this object to the provided context
	 *
	 * @method _applyShadow
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 */
	Renderizable.prototype._applyShadow = function(context) {
		if ( this._shadow ) {
			context.shadowOffsetX = this._shadow.x;
			context.shadowOffsetY = this._shadow.y;
			context.shadowColor = this._shadow.color;
			context.shadowBlur = this._shadow.blur;
			context.shadowChanged = false;
		} else if (context.shadowChanged) {
			context.resetShadow();
		}
	};
	/**
	 * Applies the translation of this object to the provided context using the camera coordinates or 0
	 *
	 * @method _applyTranslation
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 * @param {int} [cameraX] defaults to 0
	 * @param {int} [cameraY] defaults to 0
	 */
	Renderizable.prototype._applyTranslation = function(context, cameraX, cameraY) {
		context.translate(this._x - cameraX, this._y - cameraY);
	};
	/**
	 * Applies the rotation of this object to the provided context
	 *
	 * @method _applyRotation
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 */
	Renderizable.prototype._applyRotation = function(context) {
		if ( this._rotation ) {
			context.rotate(this._rotation);
		}
	};
	/**
	 * Applies the scale factor of this object to the provided context
	 *
	 * @method _applyScale
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 */
	Renderizable.prototype._applyScale = function(context) {
		if ( this._scale ) {
			context.scale(this._scale.x, this._scale.y);
		}
	};
    /**
	 * Offsets the alpha value
	 *
	 * @method offsetAlpha
	 * @param {float} offset
	 */
    Renderizable.prototype.offsetAlpha = function(offset) {
        this._alpha += offset;
        this.notifyChange();
    };
    /**
	 * Offsets the rotation
	 *
	 * @method offsetRotation
	 * @param {float} offset
	 */
    Renderizable.prototype.offsetRotation = function(offset) {
        this._rotation += offset;
        this.notifyChange();
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
    Renderizable.prototype.isVisible = function (cameraX0, cameraY0, cameraX1, cameraY1) {
    	
		if ( this._alpha == 0 || !this._visible ) return false;
    	
    	var insideViewport = this.isIn(cameraX0, cameraY0, cameraX1, cameraY1);

    	if ( this.onOutsideViewport ) {
			if ( !(this._raisedNotVisible && insideViewport) ) {
				this.onOutsideViewport();
				this._raisedNotVisible = true;
			} else {
				this._raisedNotVisible = false;
			}
		}

		return insideViewport; 
    
    };
	/**
	 * Returns whether this object is inside the given rectangle
	 *
	 * @method isIn
	 * @param {float} x0 begining x coordinate
	 * @param {float} y0 begining y coordinate
	 * @param {float} x1 final x coordinate
	 * @param {float} y1 final y coordinate
	 * @return {Boolean}
	 */
    Renderizable.prototype.isIn = function(x0, y0, x1, y1) {

        if (this._rotation) {
			/* Check using polygon collision */
			//TODO: We might optimize this. Save the rectangle as a collision area, update it only if rotation has changed and pass it to haveCollided
            return M.collisions.Polygon.haveCollided(this, new Rectangle(x0, y0, x1, y1));
        } else {
            if (this.getBottom() < y0) return false;
            if (this.getTop() > y1) return false;
            if (this.getRight() < x0) return false;
            if (this.getLeft() > x1) return false;
            return true;
        }

    }
	/**
	 * Sets the rotation angle of this object
	 *
	 * @method setRotation
	 * @param {float} rotation the rotation angle
	 */
	Renderizable.prototype.setRotation = function (rotation) {
		this._rotation = rotation;
		this.notifyChange();
	};
	/**
	 * Gets the rotation angle of this object
	 *
	 * @method getRotation
	 * @return {float}
	 */
	Renderizable.prototype.getRotation = function () {
		return this._rotation;
	};
	/**
	 * Sets the x coordinate of this object
	 *
	 * @method setX
	 * @param {float} x the rotation angle
	 */
	Renderizable.prototype.setX = function (x) {
		this.prevX = this._x;
		this._x = x;
		this.updateChildrenPosition();
		this.notifyChange();
	};
	/**
	 * Sets the y coordinate of this object
	 *
	 * @method setY
	 * @param {float} y the rotation angle
	 */
	Renderizable.prototype.setY = function (y) {
		this.prevY = this._y;
		this._y = y;
		this.updateChildrenPosition();
		this.notifyChange();
    };
	Renderizable.prototype.updateChildrenPosition = function () {
		if ( this.children ) {
			for ( var i in this.children ) {
				this.children[i].offset(this.prevX - this._x, this.prevY - this._y);
			}
		}
	};
	Renderizable.prototype.remove = function () {
		this.ownerLayer.remove(this);
	};
	/**
	 * Adds the given x and y coordinates to those of the object
	 *
	 * @method offset
	 * @param {float} x the x coordinate to add
	 * @param {float} y the y coordinate to add
	 */
    Renderizable.prototype.offset = function (x, y) {

    	var notify = false;

    	if ( x != 0 ) {
			this.prevX = this._x;
			this._x += x;
			notify = true;
		}
		if ( y != 0 ) {
			this.prevY = this._y;
			this._y += y;
			notify = true;
		}

		if ( notify ) {
			this.updateChildrenPosition();
    	    this.notifyChange();
    	}

    };
	/**
	 * Adds the given x coordinate to that of the object
	 *
	 * @method offsetX
	 * @param {float} x the x coordinate to add
	 */
    Renderizable.prototype.offsetX = function (x) {
		this.prevX = this._x;
		this._x += x;
		this.updateChildrenPosition();
        this.notifyChange();
    };
	/**
	 * Adds the given y coordinates to that of the object
	 *
	 * @method offsetY
	 * @param {float} y the y coordinate to add
	 */
    Renderizable.prototype.offsetY = function (y) {
		this.prevY = this._y;
		this._y += y;
		this.updateChildrenPosition();
        this.notifyChange();
    };
	/**
	 * Centers the object at the given vector2d object
	 *
	 * @method centerAt
	 * @param {Vector2d} vector2d object containing x and y attributes
	 */
	Renderizable.prototype.centerAt = function (vector2d) {
		this.setLocation(vector2d.x, vector2d.y);
    };
	/**
	 * Returns the x coordinate of this object that belongs to it's center
	 *
	 * @method getX
	 * @return {float}
	 */
    Renderizable.prototype.getX = function () {
        return this._x;
    };
	/**
	 * Returns the y coordinate of this object that belongs to it's center
	 *
	 * @method getY
	 * @return {float}
	 */
	 Renderizable.prototype.getY = function () {
        return this._y;
    };
	/**
	 * Abstract method. Renders the object
	 *
	 * @method onRender
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
    Renderizable.prototype.onRender = function() {
		throw new Error("Method onRender must be overriden");
	};
    /**
	 * Returns the biggest number between width and height
	 *
	 * @method getMaxSize
	 */
    Renderizable.prototype.getMaxSize = function() {
        return Math.max(this.getWidth(), this.getHeight());
    };
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Renderizable.prototype.toString = function() {
		return this.constructor.name;
    };

    M.extend(Renderizable, M.GameObject);

	M.renderers = M.renderers || {};
	M.renderers.Renderizable = Renderizable;

    function Rectangle(x0, y0, x1, y1) {
        this.width = x1 - x0;
        this.height = y1 - y0;
        this._x = x0 + this.width / 2;
        this._y = y0 + this.height / 2;
    }
    Rectangle.prototype.getWidth = function() {
        return this.width;
    };
    Rectangle.prototype.getHeight = function() {
        return this.height;
    };


})(M, M.effects.visual);