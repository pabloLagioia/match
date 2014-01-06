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
	function GameLayer(name, zIndex) {
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
		 * Determines whether this layer needs to be redrawn or not
		 */
		this.needsRedraw = true;
		/**
		 * Determines whether the objects in this layer needs to be sorted again
		 */
		this.needsSorting = false;
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
		/**
		 * Name of the layer
		 * @property name
		 * @type String
		 */
		this.name = name || "layer" + M._gameLayers.length;
		/**
		 * z-index of this layer. Match uses this attribute to sort the layers
		 * @property _zIndex
		 * @private
		 * @type {int}
		 */
		this._zIndex = zIndex || 0;

		this.result = this.buffer.canvas;

		if ( M.frontBuffer ) {
			this.setSize(M.frontBuffer.canvas.width, M.frontBuffer.canvas.height);
		}
		
		this.TYPE = M.renderers.TYPES.LAYER;

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

		// if ( p.debug ) {
			// time = new Date().getTime()
		// }

		if ( this.needsRedraw ) {

			var cameraX0 = p.camera._x * this.parrallaxFactor.x,
				cameraY0 = p.camera._y * this.parrallaxFactor.y,
				cameraX1 = cameraX0 + p.camera.viewportWidth,
				cameraY1 = cameraY0 + p.camera.viewportHeight,
				buffer = this.buffer,
				canvas = buffer.canvas/*,
				time*/;

			this.clear(buffer, canvas);

			this.renderGameObjects(this.onRenderList, buffer, canvas, cameraX0, cameraY0, cameraX1, cameraY1);

			this.needsRedraw = false;

			this.result = this.postProcessing.run(buffer);

		}

		if ( this.needsSorting ) {
			this.sort();
			this.needsSorting = false;
		}

		this._loopThroughAnimations();

		// if ( p.debug ) {
			// this._loopTime = new Date().getTime() - time;
		// }

		return this.result;

	};
	GameLayer.prototype.renderGameObjects = function(nodes, buffer, canvas, cameraX0, cameraY0, cameraX1, cameraY1) {
		for ( var i = 0; i < nodes.length; i++ ) {

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
	 * Tells the layer about a change in some attribute of one of its renderizables
	 * @method renderizableChanged
	 * @private
	 */
	GameLayer.prototype.renderizableChanged = function() {
		this.needsRedraw = true;
	};
	/**
	 * Tells the layer about a change in the z-index of one of its renderizables
	 * @method zIndexChanged
	 * @private
	 */
	GameLayer.prototype.zIndexChanged = function() {
		this.needsSorting = true;
	};
	/**
	 * Sets the z-index of this layer and makes Match sort the layers accordingly
	 * @method setZIndex
	 */
	GameLayer.prototype.setZIndex = function(value) {
		this._zIndex = value;
		M.sortLayers();
	};
	/**
	 * Returns the z-index of this layer
	 * @method getZIndex
	 */
	GameLayer.prototype.getZIndex = function() {
		return this._zIndex;
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

		if ( ! object ) {
			throw new Error("Cannot push null Object to game layer");
		}

		if ( !object.onRender ) {
			throw new Error(M.getObjectName(object) + " must implement onRender method");
		}

		if ( !object.setZIndex ) {
			// throw new Error(M.getObjectName(object) + " does not implement setZIndex method");
			console.warn(M.getObjectName(object) + " does not implement setZIndex method");
		}

		if ( !object.getZIndex ) {
			//throw new Error(M.getObjectName(object) + " does not implement getZIndex method");
			console.warn(M.getObjectName(object) + " does not implement getZIndex method");
		}

		if ( !object._zIndex ) {
			object._zIndex = this.onRenderList.length;
		}

		if ( !object.notifyChange ) {
			// throw new Error(M.getObjectName(object) + " does not implement notifyChange method. This method must inform the onwerLayer of any change in a value that would require a redraw action. ie: function() { this.ownerLayer.renderizableChanged(); } ownerLayer is added when the object is pushed into a layer by default");
			console.warn(M.getObjectName(object) + " does not implement notifyChange method. This method must inform the onwerLayer of any change in a value that would require a redraw action. ie: function() { this.ownerLayer.renderizableChanged(); } ownerLayer is added when the object is pushed into a layer by default");
			object.notifyChange = function () {
				if ( this.ownerLayer ) {
					this.ownerLayer.renderizableChanged();
				}
			}
		}

		if ( !object.notifyZIndexChange ) {
			// throw new Error(M.getObjectName(object) + " does not implement notifyZIndexChange method. This method must inform the onwerLayer of any change in the zIndex so that the layer reorders its children. ie: function() { this.ownerLayer.zIndexChanged(); } ownerLayer is added when the object is pushed into a layer by default");
			console.warn(M.getObjectName(object) + " does not implement notifyZIndexChange method. This method must inform the onwerLayer of any change in the zIndex so that the layer reorders its children. ie: function() { this.ownerLayer.zIndexChanged(); } ownerLayer is added when the object is pushed into a layer by default");
			object.notifyZIndexChange = function () {
				if ( this.ownerLayer ) {
					this.ownerLayer.zIndexChange();
				}
			}
		}

		object.ownerLayer = this;

		if ( object.onLoad ) {
			object.onLoad();
		}

		this.needsSorting = true;

		this.onRenderList.push(object);

		if ( object.onLoop ) {
			M.pushGameObject(object);
		}

		//TODO: We need to know which objects were added so if they were outside the viewport we must not re render
		this.needsRedraw = true;

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

		if ( ! object ) return;

		if ( typeof object == "string" ) {

			this.remove( this.get( object ) );

		} else {

			var i = this.onRenderList.indexOf( object );

			if ( i > -1 ) {
				this.onRenderList.splice( i, 1 );
			}

		}

		if ( object.onLoop ) {

			M.removeGameObject( object );

		}

		object.ownerLayer = null;

		this.needsRedraw = true;

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