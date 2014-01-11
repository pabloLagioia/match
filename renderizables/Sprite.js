/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable, spriteAssets) {

	/**
	 * Contains an array of images that can be rendered to play an animation
	 *
	 * @class Sprite
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {String} img the key of the image loaded by M.sprites
	 * @param {float} x the x coordinate
	 * @param {float} y the y coordinate
	 */
	function Sprite(img, x, y) {

		this.extendsRenderizable();
		
		/**
		 * The image to render
		 * @private
		 * @property _image
		 * @type HTMLImageElement
		 */
		/**
		 * The current frame of the spritesheet
		 * @property currentFrame
		 * @protected
		 * @type Object
		 */
		 /**
		 * The name of the animation to play
		 * @property animationName
		 * @protected 
		 * @type Object
		 */
		 this.animationName = null;
		/**
		 * The animation to play
		 * @property _animation
		 * @protected
		 * @type Object
		 */
		 this._animation = null;
		 /**
		 * The index of the current frame
		 * @property _frameIndex
		 * @protected
		 * @type int
		 */
		 this._frameIndex = 0;
		 /**
		 * Indicates if the animation if playing
		 * @property isPlaying
		 * @type Boolean
		 */
		 this.isPlaying = false;
		 /**
		 * Time in milliseconds when the current frame started playing
		 * @property currentFrameStartInMillis
		 * @protected
		 * @type int
		 */
		
		if ( img ) this.setImage(img);
		
		this.setLocation(x || 0, y || 0);
		
		this.TYPE = M.renderers.TYPES.SPRITE;
		
	}

	/**
	 * Sets the image of this Sprite
	 * 
	 * @method setImage
	 * @param {String} img the key of the image loaded by M.sprites
	 * @param {int} frameIndex the starting frame index
	 */
	Sprite.prototype.setImage = function( img, frameIndex ) {

		if ( !img ) throw new Error("Image cannot be null");

		if ( img instanceof Image ) {
			if ( !img.frames ) {
				img.frames = [{x:0, y: 0, width: img.width, height: img.height, halfWidth: img.width / 2, halfHeight: img.height / 2}];
			}
			this._image = img;
		} else {
			var sprt = spriteAssets[ img ];
			if ( sprt ) {
				this._image = sprt;
			} else {
				throw new Error("Image by id " + img + " not loaded");
			}
		}

        this.setFrameIndex(frameIndex);
		this.animationName = null;
		this._animation = null;
		this.isPlaying = false;

	};
	/**
	 * Starts playing the animation
	 * 
	 * @method play
	 * @param {String} animationName the key of the animation to play
	 * @param {Boolean} [loop] if true the animation will loop
	 */
	Sprite.prototype.play = function( animationName, loop ) {

		if ( this._animation && this.animationName == animationName && this.isPlaying ) return;

		if ( !animationName && this._animation ) {

			this.isPlaying = true;

		} else {

			if ( !this._image ) throw new Error("No image selected");

			if ( !this._image.animations ) throw new Error("Image has no animations");

			if ( !this._image.animations[animationName] ) throw new Error("Image has no animation by name " + animationName);

			this._animation = this._image.animations[animationName];

			this.animationName = animationName;

			this._frameIndex = 0;

			this.isPlaying = true;

		}

		this.loop = loop || this._animation.loop;

		this.notifyChange();

	};
	/**
	 * Stops the animation
	 *
	 * @method stop
	 */
	Sprite.prototype.stop = function() {
		this.isPlaying = false;
	};
	/**
	 * Animates the object
	 *
	 * @method _animate
	 * @private
	 */
	Sprite.prototype._animate = function() {

		if ( this.isPlaying ) {
			
			var timeInMillis = M.getTime();

			if ( ! this.currentFrameStartInMillis ) this.currentFrameStartInMillis = timeInMillis;

			if ( timeInMillis - this.currentFrameStartInMillis > this._animation.duration ) {

				this.currentFrame = this._image.frames[this._animation.frames[this._frameIndex]];

				if ( this._frameIndex < this._animation.frames.length - 1 ) {

					this._frameIndex++;

				} else {

					if ( this.loop ) {

						if ( this._frameIndex == 0 ) {

							this._frameIndex = 1;

						} else {

							this._frameIndex = 0;

						}

					} else {

						if ( this._animation.next ) {
							this.play(this._animation.next);
						} else {
							this.isPlaying = false;
						}

					}

				}

				this.currentFrameStartInMillis = timeInMillis;

				this.notifyChange();

			}

		}

	};
	/**
	 * Returns whether the current frame is the last frame of the animation
	 *
	 * @method isLastAnimationFrame
	 * @return {Boolean} true if current frame is the last of the animation
	 */
	Sprite.prototype.isLastAnimationFrame = function() {

		if ( this._animation ) {
			return this._frameIndex == this._animation.frames.length - 1;
		}

		return false;

	};
	/**
	 * Returns whether the current frame is the first frame of the animation
	 *
	 * @method isFirstAnimationFrame
	 * @return {Boolean} true if current frame is the first of the animation
	 */
	Sprite.prototype.isFirstAnimationFrame = function() {

		if ( this._animation ) {
			return this._frameIndex == 1;
		}

		return false;

	};
	/**
	 * Loops through animations, timers, calls onUpdate and animates the sprite
	 * @method onLoop
	 * @protected
	 */
	Sprite.prototype.onLoop = function(p) {
        this._loopThroughAnimations();
        this._loopThroughTimers();
        for ( var i = 0; i < this.behaviours.size; i++ ) {
        	this.behaviours._list[i](this, this.attributes);
        }
        if (this.onUpdate) this.onUpdate(p);
		this._animate();
	};
	Sprite.prototype.setSize = function(width, height) {
		this.oW = width;
		this.oH = height;
		this.oHW = width / 2;
		this.oHH = height / 2;
		this.notifyChange();
	};
    /**
	 * Sets the index of the frame to render
	 *
	 * @method setFrameIndex
	 * @return {integer} the index to render
	 */
    Sprite.prototype.setFrameIndex = function(index) {
		index = index || 0;
        this._frameIndex = index;
        this.currentFrame = this._image.frames[index];
    };
	/**
	 * Returns y coordinate representing the topmost part of the Object
	 *
	 * @method getTop
	 * @return {float} the coordinates to top of the object
	 */
	Sprite.prototype.getTop = function() {
		if ( this._scale ) {
			return this._y - this.currentFrame.halfHeight * this._scale.y;
		} else {
			return this._y - this.currentFrame.halfHeight;
		}
	};
	/**
	 * Returns y coordinate representing the bottommost part of the Object
	 *
	 * @method getBottom
	 * @return {float} the coordinates to bottom of the object
	 */
	Sprite.prototype.getBottom = function() {
		if ( this._scale ) {
			return this._y + this.currentFrame.halfHeight * this._scale.y;
		} else {
			return this._y + this.currentFrame.halfHeight;
		}
	};
	/**
	 * Returns x coordinate representing the leftmost part of the Object
	 *
	 * @method getLeft
	 * @return {float} the coordinates to left of the object
	 */
	Sprite.prototype.getLeft = function() {
		if ( this._scale ) {
			return this._x - this.currentFrame.halfWidth * this._scale.x;
		} else {
			return this._x - this.currentFrame.halfWidth;
		}
	};
	/**
	 * Returns x coordinate representing the rightmost part of the Object
	 *
	 * @method getRight
	 * @return {float} the coordinates to right of the object
	 */
	Sprite.prototype.getRight = function() {
		if ( this._scale ) {
			return this._x + this.currentFrame.halfWidth * this._scale.x;
		} else {
			return this._x + this.currentFrame.halfWidth;
		}
	};
	/**
	 * Gets the width of this object
	 * @method getWidth
	 * @return {float} the width
	 */
	Sprite.prototype.getWidth = function() {
		if ( this._scale ) {
			return this.currentFrame.width * this._scale.x;
		} else {
			return this.currentFrame.width;
		}
	};
	/**
	 * Gets the height of this object
	 * @method getHeight
	 * @return {float} the height
	 */
	Sprite.prototype.getHeight = function() {
		if ( this._scale ) {
			return this.currentFrame.height * this._scale.y;
		} else {
			return this.currentFrame.height;
		}
	};
	/**
	 * Sets the leftmost coordinates of the Object
	 *
	 * @method setLeft
	 * @param {float} value the coordinates to left of the object
	 */
	Sprite.prototype.setLeft = function(value) {
		if ( this._scale ) {
			this._x = value + this.currentFrame.halfWidth * this._scale.x;
		} else {
			this._x = value + this.currentFrame.halfWidth;
		}
		this.notifyChange();
	};
	/**
	 * Sets the rightmost coordinates of the Object
	 *
	 * @method setRight
	 * @param {float} value the coordinates to right of the object
	 */
	Sprite.prototype.setRight = function(value) {
		if ( this._scale ) {
			this._x = value - this.currentFrame.halfWidth * this._scale.x;
		} else {
			this._x = value - this.currentFrame.halfWidth;
		}
		this.notifyChange();
	};
	/**
	 * Sets the topmost coordinates of the Object
	 *
	 * @method setTop
	 * @param {float} value the coordinates to top of the object
	 */
	Sprite.prototype.setTop = function(value) {
		if ( this._scale ) {
			this._y = value + this.currentFrame.halfHeight * this._scale.y;
		} else {
			this._y = value + this.currentFrame.halfHeight;
		}
		this.notifyChange();
	};
	/**
	 * Sets the bottommost coordinates of the Object
	 *
	 * @method setBottom
	 * @param {float} value the coordinates to bottom of the object
	 */
	Sprite.prototype.setBottom = function(value) {
		if ( this._scale ) {
			this._y = value - this.currentFrame.halfHeight * this._scale.y;
		} else {
			this._y = value - this.currentFrame.halfHeight;
		}
		this.notifyChange();
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Sprite.prototype.toString = function() {
		return "Sprite";
    };
	
    Sprite.name = "Sprite";

	M.extend( Sprite, Renderizable );

	namespace.Sprite = Sprite;

})(Match.renderizables, Match, Match.renderizables.Renderizable, Match.sprites.assets);