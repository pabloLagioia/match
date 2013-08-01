/**
 * @module Match
 */
(function(M) {

	/**
	 * A game layer is like an offscreen canvas where all renderizable objects, that is objects that implement an
	 * onRender method, are put together for rendering. Game layers can be applied properties like alpha or scaling.
	 * All rendering takes place in a buffer which result is then rendered to the main canvas.
	 * NOTE: You need at least one layer in your game
	 * @class GameLayer
	 * @constructor
	 */
	function GameLayer() {
		/**
		 * Object that applies post processing to the layer.
		 * By default no actions are taken.
		 * @property buffer
		 * @type M.postProcess
		 */
		this.postProcessing = new M.postProcess.NoPostProcess();
		/**
		 * Buffer context where the rendering of this layer takes place
		 * @property buffer
		 * @private
		 * @type CanvasRenderingContext2D
		 */
		this.buffer = document.createElement("canvas").getContext("2d");
		/**
		 * Array of Renderizables
		 * @property onRenderList
		 * @private
		 * @type Array
		 */
		this.onRenderList = [];
		/**
		 * Contains directions on whether to redraw all visible objects to the buffer or sort the objects
		 * @private
		 * @property eventListener
		 * @type Object
		 */
		this.eventListener = {
			needsRedraw: true,
			needsSorting: false
		}

		/**
		 * object rotation
		 * @property rotation
		 * @type float
		 * @example
				this.rotation = Math.PI;
		 */
        this.rotation = null;
		/**
		 * object scale factor
		 * @property scale
		 * @type Object
		 * @example
				this.scale = { x: 1, y: 1 };
		 */
        this.scale = null;
		/**
		 * Composite operation.
		 * Possible values: "source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "darker" | "copy" | "xor"
		 * @property operation
		 * @type String
		 * @example
				this.operation = "source-in";
		 */
		this.operation = null;
		/**
		 * object transparency
		 * @property alpha
		 * @type float value must be between 0 and 1
		 * @example
				this.alpha = 0.5;
		 */
		this._alpha;
		/**
		 * Parrallax factor is used for parralax scrolling. The object x and y coordinates are multiplied by the camera position to translate the scene in different speeds
		 * @property parrallaxFactor
		 * @type Object object that contains floats x and y
		 * @default {x: 1, y: 1}
		 * @example
				var layer = new M.GameLayer();
				layer.parrallaxFactor.x = 1.25; //Move faster in the x axis
		 */
		this.parrallaxFactor = {
			x: 1, y: 1
		}
		/**
		 * Array that contains animations for this object
		 * @private
		 * @property _onLoopAnimations
		 * @type Array
		 */
		this._onLoopAnimations = [];

		if ( M.frontBuffer ) {
			this.setSize(M.frontBuffer.canvas.width, M.frontBuffer.canvas.height);
		}

	}

	/**
	 * Loops through the animations of the object
	 * @private
	 * @method _loopThroughAnimations
	 */
	GameLayer.prototype._loopThroughAnimations = function() {
		var i = 0,
		l = this._onLoopAnimations.length;
		for (; i < l; i++) {
			if (!this._onLoopAnimations[i].onLoop()) {
				this._onLoopAnimations.splice(i, 1);
			}
		}
	};
	/**
	 * Sets the transparency of the object
	 * @method setAlpha
	 * @param {float} value alpha value to set. Must be between 0 and 1
	 */
	GameLayer.prototype.setAlpha = function(value) {
		this._alpha = value;
	};
	/**
	 * Gets the transparency of the object
	 * @method getAlpha
	 * @param {float} value alpha value
	 */
	GameLayer.prototype.getAlpha = function() {
		return this._alpha;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	GameLayer.prototype.fadeIn = function(seconds, onFinished) {
		this._onLoopAnimations.push(new M.effects.visual.FadeIn(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade out animation to this object
	 * @method fadeOut
	 * @param {int} seconds time in seconds that the fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	GameLayer.prototype.fadeOut = function(seconds, onFinished) {
		this._onLoopAnimations.push(new M.effects.visual.FadeOut(this, seconds, onFinished));
		return this;
	};
	GameLayer.prototype.continousFade = function (seconds, fadeOutFirst, min, max) {
		this._onLoopAnimations.push(new M.effects.visual.ContinousFade(this, seconds, fadeOutFirst, min, max));
		return this;
	};
	/**
	 * Sets the size of the buffer using the given canvas
	 *
	 * @method setBufferSize
	 * @param {HTMLCanvasElement} canvas from where to take size
	 */
	GameLayer.prototype.setBufferSize = function(canvas) {
		if ( ! (canvas instanceof HTMLCanvasElement) ) {
			throw new Error("setBufferSize is expecting an HTMLCanvasElement as argument");
		}
		this.buffer.canvas.width = arguments[0].width;
		this.buffer.canvas.height = arguments[0].height;
	};
	/**
	 * Sets the antialiasing of the buffer
	 *
	 * @method setAntialiasing
	 * @param {Boolean} value
	 */
	GameLayer.prototype.setAntialiasing = function(value) {
		this.buffer.mozImageSmoothingEnabled = value;
		this.buffer.webkitImageSmoothingEnabled = value;
		this.buffer.mozImageSmoothingEnabled = value;
		this.buffer.webkitImageSmoothingEnabled = value;
	};
	/**
	 * Gets the width of the layer
	 * @method getWidth
	 * @return {float} the width
	 */
	GameLayer.prototype.getWidth = function() {
		return this.buffer.canvas.width;
	};
	/**
	 * Gets the height of the layer
	 * @method getHeight
	 * @return {float} the height
	 */
	GameLayer.prototype.getHeight = function() {
		return this.buffer.canvas.height;
	};
	/**
	 * Sets the width of the layer
	 * @method setWidth
	 * @param {float} value the width
	 */
	GameLayer.prototype.setWidth = function(value) {
		this.buffer.canvas.width = value;
	};
	/**
	 * Sets the height of the layer
	 * @method setHeight
	 * @param {float} value the height
	 */
	GameLayer.prototype.setHeight = function(value) {
		this.buffer.canvas.height = value;
	};
	GameLayer.prototype.setSize = function(width, height) {
		this.setWidth(width);
		this.setHeight(height);
	};
	/**
	 * Gets the center of the layer
	 * @method getCenter
	 * @return {Object} object containing x and y
	 */
	GameLayer.prototype.getCenter = function() {
		return new M.math2d.Vector2d( this.buffer.canvas.width / 2, this.buffer.canvas.height / 2 );
	};
	/**
	 * Clears the buffer
	 * @method clearUsingDefault
	 * @param {HTMLContext2d} buffer the context to clear
	 * @param {CanvasRenderingContext2D} canvas the canvas to clear
	 */
	GameLayer.prototype.clearUsingDefault = function(buffer, canvas) {
		buffer.clearRect(0,0, canvas.width, canvas.height);
	};
	/**
	 * Clears the buffer using a fill color
	 * @method clearUsingFillColor
	 * @param {HTMLContext2d} buffer the context to clear
	 * @param {CanvasRenderingContext2D} canvas the canvas to clear
	 */
	GameLayer.prototype.clearUsingFillColor = function(buffer, canvas) {
		buffer.fillStyle = this.clearColor;
		buffer.fillRect(0,0, canvas.width, canvas.height);
	};
	/**
	 * Clears the buffer using an image
	 * @method clearUsingImage
	 * @param {HTMLContext2d} buffer the context to clear
	 * @param {CanvasRenderingContext2D} canvas the canvas to clear
	 */
	GameLayer.prototype.clearUsingImage = function(buffer, canvas) {
		buffer.drawImage(this.clearImage, 0, 0);
	};
	GameLayer.prototype.clear = GameLayer.prototype.clearUsingDefault;
	/**
	 * Loops through every renderizable and renderizes it if it is visible
	 * @method onLoop
	 * @protected
	 * @param {Object} p contains information like if it is required to debug
	 * @return {HTMLCanvasElement} a canvas contaning the result of the rendering
	 */
	GameLayer.prototype.onLoop = function(p) {

		var cameraX0 = p.camera.x * this.parrallaxFactor.x,
			cameraY0 = p.camera.y * this.parrallaxFactor.y,
			cameraX1 = cameraX0 + p.camera.viewportWidth,
			cameraY1 = cameraY0 + p.camera.viewportHeight,
			buffer = this.buffer,
			canvas = buffer.canvas,
			time;

		// if ( p.debug ) {
			// time = new Date().getTime()
		// }

		if ( this.eventListener.needsRedraw ) {

			this.clear(buffer, canvas);

			this.renderGameObjects(this.onRenderList, buffer, canvas, cameraX0, cameraY0, cameraX1, cameraY1);

			this.eventListener.needsRedraw = false;

			this.result = this.postProcessing.run(buffer);

		}

		if ( this.eventListener.needsSorting ) {
			this.sort();
			this.eventListener.needsSorting = false;
		}

		this._loopThroughAnimations();

		// if ( p.debug ) {
			// this._loopTime = new Date().getTime() - time;
		// }

		return this.result;

	};
	GameLayer.prototype.renderGameObjects = function(nodes, buffer, canvas, cameraX0, cameraY0, cameraX1, cameraY1) {
		for ( var i in nodes ) {

			var node = nodes[i];

			if (node.isVisible(cameraX0, cameraY0, cameraX1, cameraY1)) {

				// renderer[node.renderingType](node);

				node.onRender(buffer, canvas, cameraX0, cameraY0, cameraX1, cameraY1);
				
				if ( node.children ) {
					this.renderGameObjects(node.children, buffer, canvas, cameraX0, cameraY0, cameraX1, cameraY1);
				}

			}

		}
	};
	/**
	 * Adds this layer to Match list of layers
	 * @method addToGame
	 * @example
			var layer = new M.GameLayer();
			layer.addToGame();
	 */
	GameLayer.prototype.addToGame = function() {
		M.pushGameLayer(this);
	};
	/**
	 * Pushes an object into the onRenderList
	 * @method push
	 * @param {renderers.Renderizable} object
	 * @param {String} key
	 * @param {int} zIndex
	 * @example
			this.push(new Sprite("ninja"), "ninja", 10);
	 */
	GameLayer.prototype.push = function(object, key, zIndex) {

		if ( ! object ) throw new Error("Cannot add null object to rendering loop");

		if ( object instanceof Function ) {
			
			object = {
				onRender: object,
				isVisible: function() {
					this.onChangeEvent.needsRedraw = true;
					return true;
				},
				setZIndex: function(value) {
					this._zIndex = value;
				}
			}

		}

		if ( !object.onRender ) {
			console.warn("Cannot add object with no onRender method ", object.constructor.name, "adding to Match list of Game Objects");
			M.pushGameObject(object);
			return;
		}

		if ( key ) object.key = key;

		if ( object._zIndex == undefined ) {

			if ( zIndex > -1 ) {
				try {
					object.setZIndex(zIndex || 0);
				} catch (e) {
					object._zIndex = zIndex || 0;
				}
			}

		} else {
			object.setZIndex(object.getZIndex());
		}

		if ( object.onLoad ) object.onLoad();
		
		this.eventListener.needsSorting = true;
		object.onChangeEvent = this.eventListener;

		this.onRenderList.push(object);

		if ( object.onLoop ) M.pushGameObject(object);

		var camera = M.camera,
			cameraX0 = camera.x * this.parrallaxFactor.x,
			cameraY0 = camera.y * this.parrallaxFactor.y,
			cameraX1 = cameraX0 + camera.viewportWidth,
			cameraY1 = cameraY0 + camera.viewportHeight;

		if ( object.isVisible(cameraX0, cameraY0, cameraX1, cameraY1) ) {
			this.eventListener.needsRedraw = true;
		}

	};
	/**
	 * Sorts the onRenderList by the elements zIndex
	 * @method sort
	 */
	GameLayer.prototype.sort = function() {
		this.onRenderList.sort(this._sortFunction);
	};
	/**
	 * Sort logic based on zIndex
	 * @method _sortFunction
	 * @private
	 * @param {renderers.Renderizable} a
	 * @param {renderers.Renderizable} b
	 * @return {int} the difference between the zIndex of the given objects
	 */
	GameLayer.prototype._sortFunction = function(a, b) {
		return a._zIndex - b._zIndex;
	};
	/**
	 * Gets the first element from the onRenderList
	 * @method getFirst
	 * @return {renderers.Renderizable} the first game object in the list or null if the list is empty
	 */
	GameLayer.prototype.getFirst = function() {
		return this.getIndex(0);
	};
	/**
	 * Gets the element matching the provided index
	 * @method getIndex
	 * @return {renderers.Renderizable} the game object at the specified index or null if it is not in the list
	 */
	GameLayer.prototype.getIndex = function( index ) {
		try {
			return this.onRenderList[ index ];
		} catch (e) {
			return null;
		}
	};
	/**
	 * Gets the contents of this layer as an image in base64
	 * @method getAsBase64Image
	 * @return {String} a string representing an image in base64
	 */
	GameLayer.prototype.getAsBase64Image = function() {
		return this.buffer.canvas.toDataURL();
	};
	/**
	 * Gets the contents of this layer as an html image
	 * @method getAsImage
	 * @return {HTMLImageElement} an image element with the result of this layer
	 */
	GameLayer.prototype.getAsImage = function() {
		var img = new Image();
		img.src = this.getAsBase64Image();
		return img;
	};
	/**
	 * Gets the element matching the provided key
	 * @method get
	 * @param {String} key
	 * @return {renderers.Renderizable} the object matching the provided key or null if it is not in the list
	 * @example
	 
			var layer = new M.GameLayer(),
				ninja = new Sprite("ninja");
			
			layer.push(ninja, "ninja");
	 
			var theNinja = layer.get("ninja");
			
			alert(ninja == theNinja) //will yield true
			
	 */
	GameLayer.prototype.get = function(key) {

		if ( this.cache && this.cache.key == key ) {
			return this.cache;
		}

		var i = this.onRenderList.length, 
			current;

		while ( i-- ) {
			current = this.onRenderList[i];
			if ( key == current.key ) {
				this.cache = current;
				return current;
			}
		}
		
		return null;

	};
	/**
	 * Gets the last element from the onRenderList
	 * @method getLast
	 * @return {renderers.Renderizable} the last renderizable in the list or null if the list is empty
	 */
	GameLayer.prototype.getLast = function() {
		return this.getIndex( this.onRenderList.length - 1 );
	};
	/**
	 * Returns true if the element is in the onRenderList and false if not
	 * @method isonRenderList
	 * @return {Boolean} true if the object in in the list or false if not
	 */
	GameLayer.prototype.isOnRenderList = function(object) {
		return this.onRenderList.indexOf(object) != -1;
	};
	/**
	 * Removes an element from the onRenderList
	 * @method remove
	 * @param {renderers.Renderizable} object the object to remove
	 * @example
			//Create a sprite
			var ninja = new Sprite("ninja");
			
			//Add the sprite
			gameLayer.push(ninja);
			
			//Remove the sprite
			gameLayer.remove(ninja);
	 */
	GameLayer.prototype.remove = function( object ) {

		if ( object != undefined ) {

			if ( typeof object == "string" ) {

				this.remove( this.get( object ) );

			} else if ( isNaN( object ) ) {

				var index = this.onRenderList.indexOf( object );

				if ( index != -1 ) {

					this.onRenderList.splice( index, 1);

				}

			} else {

				this.onRenderList.splice( object, 1);

			}

			if ( object.onLoop ) {

				M.removeGameObject( object );

			}

			this._needsRedraw = true;

		}

	};
	/**
	 * Removes all elements from the onRenderList
	 * @method removeAll
	 */
	GameLayer.prototype.removeAll = function() {
		this.onRenderList = [];
	};
	/**
	 * Sets the background of the buffer
	 *
	 * @method setBackground
	 * @param {String} background a color, sprite name or null
	 * @example
			this.setBackground("black");
			this.setBackground("rgb(0, 100, 100)");
			this.setBackground("skySprite");
			this.setBackground(); //sets default background
			this.setBackground(""); //sets default background
	 */
	GameLayer.prototype.setBackground = function(background) {
		if ( !background == "" && typeof background == "string" ) {
			if ( M.sprites[background] ) {
				this.clearImage = M.sprites[background]._image;
				this.clear = this.clearUsingImage;
			} else {
				this.clearColor = background;
				this.clear = this.clearUsingFillColor;
			}
		} else {
			this.clear = this.clearUsingDefault;
		}
	};
	/**
	 * Gets the background of the buffer
	 *
	 * @method getBackground
	 * @return {String} a css string representing the background
	 */
	GameLayer.prototype.getBackground = function() {
		return this.buffer.canvas.getPropertyValue("background");
	};


	M.GameLayer = M.Layer = GameLayer;

})(window.Match);