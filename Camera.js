/**
 * @module Match
 */
(function(M) {

	/**
	 * Provides a Camera for easy scene displacement
	 * 
	 * @class Camera
	 * @static
	 * @constructor
	 */
	function Camera() {
	
		/**
		 * The x coordinate
		 * @property x
		 * @private
		 * @type float
		 */
		this._x = 0;
		/**
		 * The y coordinate
		 * @property y
		 * @private
		 * @type float
		 */
		this._y = 0;
		/**
		 * Represents the width of the viewable area
		 * @property viewportWidth
		 * @type float
		 */
		this.viewportWidth = 0;
		/**
		 * Represents the height of the viewable area
		 * @property viewportHeight
		 * @type float
		 */
		this.viewportHeight = 0;
		/**
		 * Represents the half height of the viewable area
		 * @property _halfViewportHeight
		 * @type float
		 * @private 
		 */
		this._halfViewportHeight = 0;
		/**
		 * Represents the half width of the viewable area
		 * @property _halfViewportWidth
		 * @type float
		 * @private 
		 */
		this._halfViewportWidth = 0;
	}
	/**
	 * Sets viewport width, hight and halfs sizes
	 * @method setViewport
	 * @param {int} width
	 * @param {int} height
	 */
	Camera.prototype.setViewport = function(width, height) {
		this.viewportWidth = width;
		this.viewportHeight = height;
		this._halfViewportWidth = width / 2;
		this._halfViewportHeight = height / 2;
	}
	/**
	 * Centers the camera at the given Renderizable
	 * @method centerAtRenderizable
	 * @param {renderers.Renderizable} renderizable
	 */
	Camera.prototype.centerAtRenderizable = function(renderizable) {
		this.x = renderizable._x - this._halfViewportWidth;
		this.y = renderizable._y - this._halfViewportHeight;
	};
	/**
	 * Centers the camera at the given coordinates
	 * @method centerAt
	 * @param {x} integer
	 * @param {y} integer
	 */
	Camera.prototype.centerAt = function(x, y) {
		this.x = x - this._halfViewportWidth;
		this.y = y - this._halfViewportHeight;
		M.redrawAllLayers();
	};

	Camera.prototype.setX = function(value) {
		this._x = value;
		M.redrawAllLayers();
	};

	Camera.prototype.setY = function(value) {
		this._y = value;
		M.redrawAllLayers();
	};

	Camera.prototype.getX = function() {
		return this._x;
	};

	Camera.prototype.getY = function() {
		return this._y;
	};
	
	Camera.prototype.offsetX = function(value) {
		this.setX(this._x + value);
	};

	Camera.prototype.offsetY = function(value) {
		this.setY(this._y + value);
	};

	Camera.prototype.getLeftFromLayer = function(layer) {
		return this.x * layer.parrallaxFactor.x;
	};

	Camera.prototype.getTopFromLayer = function(layer) {
		return this.y * layer.parrallaxFactor.y;
	};

	Camera.prototype.getBottomFromLayer = function(layer) {
		return this.getTopFromLayer(layer) + this.viewportHeight;
	};

	Camera.prototype.getRightFromLayer = function(layer) {
		return this.getLeftFromLayer(layer) + this.viewportWidth;
	};
	
	M.onLoopProperties.camera = M.camera = new Camera();

})(window.Match);