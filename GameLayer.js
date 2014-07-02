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
		 * object visibility. Determines whether the object will be rendered or not
		 * @private
		 * @property _visible
		 * @type Boolean
		 */
		this._visible = true;
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

		this.background = null;

		this.TYPE = M.renderizables.TYPES.LAYER;

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
	 * Loops through every renderizable and renderizes it if it is visible
	 * @method onLoop
	 * @protected
	 * @param {Object} p contains information like if it is required to debug
	 * @return {HTMLCanvasElement} a canvas contaning the result of the rendering
	 */
	GameLayer.prototype.onLoop = function(p) {
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
	GameLayer.prototype.add = function(entity, key, zIndex) {

		if ( ! entity ) {
			throw new Error("Cannot push null entity to game layer");
		}

		if ( !entity.setZIndex ) {
			// M.logger.warn(M.getObjectName(entity) + " does not implement setZIndex method");
		}

		if ( !entity.getZIndex ) {
			// M.logger.warn(M.getObjectName(entity) + " does not implement getZIndex method");
		}

		if ( !entity._zIndex ) {
			entity._zIndex = this.onRenderList.length;
		}

		if ( entity.onLoad ) {
			entity.onLoad();
		}

		var self = this,
			onChange = function() {
				self.needsRedraw = true;
			};
		
		entity.views.eachValue(function(view) {
			view.addEventListener("attributeChanged", onChange);
		});

		this.needsSorting = true;

		this.onRenderList.push(entity);

		//TODO: We need to know which objects were added so if they were outside the viewport we must not re render
		this.needsRedraw = true;

		M.raise("gameObjectPushedToLayer", entity);

	};
	GameLayer.prototype.push = GameLayer.prototype.add;
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

				M.raise("gameObjectRemovedFromLayer", object);

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

	M.GameLayer = M.Layer = GameLayer;

})(window.Match);