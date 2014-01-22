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
		
		this.TYPE = M.renderizables.TYPES.SPRITE;
		
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

		return this;

	};
	Sprite.prototype.getImage = function() {
		return this._image;
	};
	Sprite.prototype.setFillStyle = Sprite.prototype.setImage;
	Sprite.prototype.getFillStyle = Sprite.prototype.getImage;
	Sprite.prototype.setFill = Sprite.prototype.setImage;
	Sprite.prototype.getFill = Sprite.prototype.getImage;
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

		this.raiseEvent("animationPlaying");

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

					this.setFrameIndex(this._frameIndex + 1);

				} else {

					if ( this.loop ) {

						if ( this._frameIndex == 0 ) {

							this.setFrameIndex(1);

						} else {

							this.setFrameIndex(0);

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
		this._animate();
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
        this._width = this.currentFrame.width;
        this._height = this.currentFrame.height;
        this._halfWidth = this.currentFrame.halfWidth;
        this._halfHeight = this.currentFrame.halfHeight;
        this.raiseEvent("frameChanged", index);
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