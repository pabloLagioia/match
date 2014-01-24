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
		 * The path where all sprites are located
		 * @property path
		 * @type String
		 */
		this.path = "";

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
		/**
		 * Map used to store sprites
		 */
		this.assets = {};

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

        if ( image.frames == undefined ) {

            image.frames = [{x:0, y: 0, width: image.width, height: image.height, halfWidth: image.width / 2, halfHeight: image.height / 2}];

        } else if ( image.tiles ) {

			var frames = new Array(),
				width = image.tiles.width,
				height = image.tiles.height,
				padding = image.tiles.padding || 0,
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

		} else {
		
 			for ( var i in image.frames ) {

				image.frames[i].halfWidth = image.frames[i].width / 2;
				image.frames[i].halfHeight = image.frames[i].height / 2;

			}
		
		}

        this.onImageLoaded.raise({image: image, name: image.getAttribute("data-name"), remaining: this.toLoad, total: this.total});

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
	 * @param {Function} onFinished callback to execute when all images are loaded
	 * @param {Function} onProgress callback to execute when an image is loaded
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
	 * @example
			M.SpriteManager.load([
				"assets/sprites/sky.json",
				"assets/sprites/sun.json",
				"assets/sprites/ground.json"
			]);
	 */
    SpriteManager.prototype.load = function( map, onFinished, onProgress ) {
	
		var current, img, i;

		if ( onFinished ) {
			this.onAllImagesLoaded.addEventListener(onFinished);
		}
		if ( onProgress ) {
			this.onImageLoaded.addEventListener(onProgress);
		}

		if ( map instanceof Array ) {
		
			var jsonMap = {},
				loaded = 0,
				self = this,
				onJsonReceived = function(response) {
					var json = JSON.parse(response);
					jsonMap[json.name] = json;
					loaded++;
					if ( loaded >= map.length ) {
						self.load(jsonMap);
					}
				};
			
			for ( i = 0; i < map.length; i++ ) {
				
				M.Ajax.post(map[i], onJsonReceived);
				
			}
		
		} else {
		
			var alreadyLoaded = 0,
				count = 0;
		
			for ( i in map ) {
			
				count++;
				
				if ( ! this.assets[ i ] ) {
				

					current = map[i],
					img = new Image();

					img.setAttribute("data-name", i);
					img.onload = onLoad;
					img.onerror = onError;

					this.total = ++this.toLoad;

					if ( typeof current == "string" ) {

						img.src = this.path + current;

					} else {

						img.src = this.path + current.source;

						img.frames = current.frames;

						img.animations = current.animations;

					}

					this.assets[ i ] = img;

				} else {
					alreadyLoaded++;
				}

			}
			
			if ( alreadyLoaded == count ) {
				this.onAllImagesLoaded.raise();
			}
		
		}

    };
	/**
	 * Removes the sprite that matches the given id
	 * @method remove
	 * @param {String} id the sprite id
	 */
	SpriteManager.prototype.remove = function(id) {
		if ( this.assets[id] ) {
			delete this.assets[id];
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
		this.assets = {};
		this.total = 0;
		this.toLoad = 0;
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

})(M, EventListener);