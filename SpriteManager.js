/**
 * @module Match
 */
(function(M, EventListener) {

	/**
	 * Provides methods for loading sprites and spritesheets. The event listeners inform you how many resources where loaded so far, this is 
	 * useful for loading screens.
	 * 
	 * @class SpriteManager
	 * @static
	 * @constructor
	 */
    function SpriteManager() {

		/**
		 * The amount of sprites remaining to load
		 * @property toLoad
		 * @readOnly
		 * @type int
		 */
        this.toLoad = 0;
		/**
		 * The totla amount of sprites to load
		 * @property total
		 * @readOnly
		 * @type int
		 */
        this.total = 0;
		/**
		 * EventListener that gets called whenever a sprite is finished loading
		 * @property onImageLoaded
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				//e = {image, remaining, total}
				M.sprites.onImagesLoaded.addEventListener(function(e) {
					loadingText.setText("Loaded " + (e.total - e.remaining) + " of " + e.total);
				});
		 */
		this.onImageLoaded = new EventListener();
		/**
		 * EventListener that gets called when all sprites of a pack are finished loading
		 * @property onAllImagesLoaded
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				M.sprites.onAllImagesLoaded.addEventListener(function() {
					alert("All images are ready");
				});
		 */
		this.onAllImagesLoaded = new EventListener();
		/**
		 * EventListener that gets called whenever a sprite cannot be loaded
		 * @property onImageError
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				M.sprites.onImagesLoaded.addEventListener(function(image) {
					alert("could not load image " + image);
				});
		 */
		this.onImageError = new EventListener();

    }

    function onError() {

        M.sprites._imageError(this);

    }

    function onLoad() {

        M.sprites._imageLoaded(this);

    }

	/**
	 * Method that gets called after an image has finished loading
	 * @method _imageLoaded
	 * @private
	 * @param {HTMLImageElement} image
	 */
    SpriteManager.prototype._imageLoaded = function( image ) {

        this.toLoad--;

        if ( ! image.frames ) {

            image.frames = [{x:0, y: 0, width: image.width, height: image.height, halfWidth: image.width / 2, halfHeight: image.height / 2}];

        } else if ( image.frames instanceof Array ) {

			for ( var i in image.frames ) {

				image.frames[i].halfWidth = image.frames[i].width / 2;

				image.frames[i].halfHeight = image.frames[i].height / 2;

			}

		} else {

			var frames = new Array(),
				width = image.frames.width,
				height = image.frames.height,
				padding = image.frames.padding || 0,
				columns = Math.floor(image.width / (width + padding)),
				lines = Math.floor(image.height / (height + padding)),
				column,
				line;

			for ( line = 0; line < lines; line++ ) {
				for ( column = 0; column < columns; column++ ) {
					var x = (padding + width) * column + padding,
						y = (padding + height) * line + padding;
					frames.push({
						x: x,
						y: y,
						width: width,
						height: height,
						halfWidth: width / 2,
						halfHeight: height / 2
					});
				}
			}

			image.frames = frames;

		}

        this.onImageLoaded.raise({image: image, remaining: this.toLoad, total: this.total});

        if ( this.toLoad <= 0 ) this.onAllImagesLoaded.raise();

    };
	/**
	 * Method that gets called after an image has failed loading
	 * @method _imageError
	 * @private
	 * @param {HTMLImageElement} image
	 */
    SpriteManager.prototype._imageError = function( image ) {

        this.toLoad--;
		
		this.onImageError.raise(image);

        console.error("Could not load", image.src);

    };
	/**
	 * Loads images from a Map of String-Url or String-SpriteSheet
	 * @method load
	 * @param {Map<String, Url>|Map<String, Object>} images
	 * @example 
			M.SpriteManager.load({"sky": "/assets/sky.png"});
	 * @example 
			M.SpriteManager.load({"sky": "/assets/sky.png", "ground": "/assets/ground.png"});
	 * @example 
			M.SpriteManager.load({
				"sky": "/assets/sky.png",
				"ground": "/assets/ground.png",
				"ninja": {
					"source" : "/assets/ninja.png",
					//Array of frames that compose this spritesheet
					"frames" : [{
							"x" : 10,
							"y" : 10,
							"width" : 90,
							"height" : 14
						}, {
							"x" : 110,
							"y" : 10,
							"width" : 90,
							"height" : 14
						}, {
							"x" : 210,
							"y" : 10,
							"width" : 90,
							"height" : 14
						}
					],
					//Map of animations
					"animations" : {
						"jump": {
							"duration" : 250,
							"frames" : [0, 1, 2] //Index of the frames that compose this animation
						}
					}
				});
	 */
    SpriteManager.prototype.load = function( map ) {
	
		var current, img, i;

		if ( map.onProgress ) {
			this.onImageLoaded.addEventListener(map.onProgress);
			delete map.onProgress;
		}
		if ( map.onFinish ) {
			this.onAllImagesLoaded.addEventListener(map.onFinish);
			delete map.onFinish;
		}

		for ( i in map ) {

			current = map[i],
			img = new Image();

            img.onload = onLoad;
            img.onerror = onError;

            this.total = ++this.toLoad;

            if ( typeof current == "string" ) {

                img.src = current;

            } else {

                img.src = current.source;

                img.frames = current.frames;

                img.animations = current.animations;

            }

            this[ i ] = img;

        }

    };
	/**
	 * Removes the sprite that matches the given id
	 * @method remove
	 * @param {String} id the sprite id
	 */
	SpriteManager.prototype.remove = function(id) {
		if ( this[id] instanceof Image ) {
			delete this[id];
			if ( this.total - 1 >= 0 ) {
				this.total--;
			}
			if ( this.toLoad - 1 >= 0 ) {
				this.toLoad--;
			}
		}
	};
	/**
	 * Removes all sprites
	 * @method removeAll
	 */
	SpriteManager.prototype.removeAll = function() {
		for ( var id in this ) {
			this.remove(id);
		}
	};
	/**
	 * Removes all event listeners
	 * @method removeAllEventListeners
	 */
	SpriteManager.prototype.removeAllEventListeners = function() {
		this.onImageLoaded = new EventListener();
		this.onAllImagesLoaded = new EventListener();
		this.onImageError = new EventListener();
	};

    M.SpriteManager = new SpriteManager();

    M.sprites = M.SpriteManager;

})(M || (M = {}),M.EventListener || (M.EventListener = {}));