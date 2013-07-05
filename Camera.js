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
		 * @type float
		 */
		this.x = 0;
		/**
		 * The y coordinate
		 * @property y
		 * @type float
		 */
		this.y = 0;
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
	};
	
	M.onLoopProperties.camera = M.camera = new Camera();

})(window.Match);