/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable) {

	/**
	 * Contains an array of images that can be rendered to play an animation
	 *
	 * @class Sprite
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {String} [img] the key of the image loaded by M.sprites
	 */
	function Sprite(img) {

		Renderizable.apply(this);
		
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
		/**
		 * The animation to play
		 * @property _animation
		 * @protected
		 * @type Object
		 */
		 /**
		 * The index of the current frame
		 * @property _frameIndex
		 * @protected
		 * @type int
		 */
		 /**
		 * Indicates if the animation if playing
		 * @property isPlaying
		 * @type Boolean
		 */
		 /**
		 * Time in milliseconds when the current frame started playing
		 * @property currentFrameStartInMillis
		 * @protected
		 * @type int
		 */
		
		if ( img ) this.setImage(img);
		
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
		} else if ( M.sprites[ img ] ) {
			this._image = M.sprites[img];
		} else {
			throw new Error("Image by id " + img + " not loaded");
		}

        this.setFrameIndex(frameIndex);

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

		this.loop = loop;

		this.onChangeEvent.needsRedraw = true;

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

						this.isPlaying = false;

					}

				}

				this.currentFrameStartInMillis = timeInMillis;

				this.onChangeEvent.needsRedraw = true;

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
        if (this.onUpdate) this.onUpdate(p);
		this._animate();
	}
	/**
	 * Renders the current sprite in the provided context
	 *
	 * @method onRender
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	Sprite.prototype.onRender = function( context, canvas, cameraX, cameraY ) {
		
		if ( ! this._image ) return;

		context.save();
		
		this._applyOperation(context);
		this._applyAlpha(context);
		this._applyTranslation(context, cameraX, cameraY);
		this._applyRotation(context);
		this._applyScale(context);
		this._applyShadow(context);

		var x, y;

		if ( this.pivotX ) {
			x = this.pivotX;
		} else {
			x = -this.currentFrame.halfWidth;
		}

		if ( this.pivotY ) {
			y = this.pivotY;
		} else {
			y = -this.currentFrame.halfHeight;
		}
		context.drawImage( this._image, this.currentFrame.x, this.currentFrame.y, this.currentFrame.width, this.currentFrame.height, x, y, this.oW || this.currentFrame.width, this.oH || this.currentFrame.height );

		context.restore();

	};
	Sprite.prototype.setSize = function(width, height) {
		this.oW = width;
		this.oH = height;
		this.onChangeEvent.needsRedraw = true;
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
		this.onChangeEvent.needsRedraw = true;
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
		this.onChangeEvent.needsRedraw = true;
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
		this.onChangeEvent.needsRedraw = true;
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
		this.onChangeEvent.needsRedraw = true;
	};
	
	M.extend( Sprite, Renderizable );

	namespace.Sprite = Sprite;

})(window.Match.renderers, window.Match, window.Match.renderers.Renderizable);