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
    	this.extendsGameObject();
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
		
		this.pivotX = null;
		this.pivotY = null;
		
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
        this.animations = [];
		/**
		 * Array that contains chained animations for this object
		 * @private
		 * @property chainedAnimations
		 * @type ArrayList
		 */
        this.chainedAnimations = [];
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
        this._onLoopTimers = [];
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
	/**
	 * Notifies owner layer about a change in this object
	 * @method notifyChange
	 */
	Renderizable.prototype.notifyChange = function() {
		this.ownerLayer&&this.ownerLayer.renderizableChanged();
		return this;
	};
	/**
	 * Notifies owner layer about a change in the zIndex this object
	 * @method notifyZIndexChange
	 */
	Renderizable.prototype.notifyZIndexChange = function() {
		this.ownerLayer&&this.ownerLayer.zIndexChanged();
		return this;
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
		return this;
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
		return this;
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
		return this;
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
		return this;
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
		return this;
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
		return this;
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
		return this;
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
    Renderizable.prototype.getBoundingHalfWidth = function () {
    	
    	if ( this._rotation == 0 ) {
    		return this._halfWidth;
    	}

		var halfWidth = this._halfWidth,
			halfHeight = this._halfHeight,
			math2d = M.math2d
			math = Math,
			v1 = math2d.getRotatedVertexCoords(-halfWidth, -halfHeight, this._rotation),
			v2 = math2d.getRotatedVertexCoords(halfWidth, -halfHeight, this._rotation),
			v3 = math2d.getRotatedVertexCoords(halfWidth, halfHeight, this._rotation),
			v4 = math2d.getRotatedVertexCoords(-halfWidth, halfHeight, this._rotation),
			maxX = math.max(v1.x, v2.x, v3.x, v4.x);

		return math.abs(maxX);
    };
    Renderizable.prototype.getBoundingWidth = function () {
    	return this.getBoundingHalfWidth() * 2;
    };
    Renderizable.prototype.getBoundingHalfHeight = function () {

    	if ( this._rotation == 0 ) {
    		return this._halfHeight;
    	}

		var halfWidth = this._halfWidth,
			halfHeight = this._halfHeight,
			math2d = M.math2d
			math = Math,
			v1 = math2d.getRotatedVertexCoords(-halfWidth, -halfHeight, this._rotation),
			v2 = math2d.getRotatedVertexCoords(halfWidth, -halfHeight, this._rotation),
			v3 = math2d.getRotatedVertexCoords(halfWidth, halfHeight, this._rotation),
			v4 = math2d.getRotatedVertexCoords(-halfWidth, halfHeight, this._rotation),
			maxY = math.max(v1.y, v2.y, v3.y, v4.y);

		return math.abs(maxY);

    };
    Renderizable.prototype.getBoundingHeight = function () {
    	return this.getBoundingHalfHeight() * 2;
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
		return this;
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
		return this;
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
		return this;
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
		return this;
	};
	/**
	 * Inverts the object in the x axis
	 * Note: Works exactly as invertX
	 * @method mirror
	 */
	Renderizable.prototype.mirror = function () {
		this.invertX();
		return this;
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
		return this;
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
		return this;
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
                return this._x - this.getBoundingHalfWidth() * this._scale.x;
            }
        } else {
            if (this.pivotX != undefined) {
                return this._x + this.pivotX - this._width;
        	} else {
        		return this._x - this.getBoundingHalfWidth();
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
                return this._x + this.getBoundingHalfWidth() * this._scale.x;
            }
        } else {
            if (this.pivotX != undefined) {
                return this._x + this.pivotX + this._width;
        	} else {
        		return this._x + this.getBoundingHalfWidth();
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
                return this._y - this.getBoundingHalfHeight() * this._scale.y;
            }
        } else {
            if (this.pivotY != undefined) {
                return this._y + this.pivotY - this._height;
        	} else {
        		return this._y - this.getBoundingHalfHeight();
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
                return this._y + this.getBoundingHalfHeight() * this._scale.y;
            }
        } else {
            if (this.pivotY != undefined) {
                return this._y + this.pivotY + this._height;
        	} else {
        		return this._y + this.getBoundingHalfHeight();
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
            this._x = value + this.getBoundingHalfWidth() * this._scale.x;
        } else {
            this._x = value + this.getBoundingHalfWidth();
        }
        this.notifyChange();
		return this;
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
            this._x = value - this.getBoundingHalfWidth() * this._scale.x;
        } else {
            this._x = value - this.getBoundingHalfWidth();
        }
        this.notifyChange();
		return this;
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
            this._y = value + this.getBoundingHalfHeight() * this._scale.y;
        } else {
            this._y = value + this.getBoundingHalfHeight();
        }
        this.notifyChange();
		return this;
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
            this._y = value - this.getBoundingHalfHeight() * this._scale.y;
        } else {
            this._y = value - this.getBoundingHalfHeight();
        }
        this.notifyChange();
		return this;
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
		this.notifyChange();
		return this;
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
	 * Offsets the alpha value
	 *
	 * @method offsetAlpha
	 * @param {float} offset
	 */
    Renderizable.prototype.offsetAlpha = function(offset) {
        this._alpha += offset;
        this.notifyChange();
		return this;
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
		return this;
    };
	/**
	 * Sets the rotation angle of this object
	 *
	 * @method setRotation
	 * @param {float} rotation the rotation angle
	 */
	Renderizable.prototype.setRotation = function (rotation) {
		this._rotation = rotation;
		this.notifyChange();
		return this;
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
		this.notifyChange();
		return this;
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
		this.notifyChange();
		return this;
    };
	Renderizable.prototype.remove = function () {
		this.ownerLayer.remove(this);
		return this;
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
    	    this.notifyChange();
    	}
		
		return this;

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
        this.notifyChange();
		return this;
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
        this.notifyChange();
		return this;
    };
	/**
	 * Centers the object at the given vector2d object
	 *
	 * @method centerAt
	 * @param {Vector2d} vector2d object containing x and y attributes
	 */
	Renderizable.prototype.centerAt = function (vector2d) {
		this.setLocation(vector2d.x, vector2d.y);
		return this;
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

    Renderizable.name = "Renderizable";

    M.extend(Renderizable, M.GameObject);

	M.renderizables = M.renderers || {};
	M.renderizables.Renderizable = Renderizable;

})(Match, Match.effects.visual);