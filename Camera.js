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
		this._prevX = 0;
		this._prevY = 0;
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
		
		this._boundingArea = null;
		
	}
	Camera.prototype.setBoundingArea = function(left, top, right, bottom) {
		this._boundingArea = {
			minX: left,
			minY: top,
			maxX: right,
			maxY: bottom
		}
	};
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
		this.centerAt(renderizable._x, renderizable._y);
	};
	/**
	 * Centers the camera at the given coordinates
	 * @method centerAt
	 * @param {x} integer
	 * @param {y} integer
	 */
	Camera.prototype.centerAt = function(x, y) {

		x = x - this._halfViewportWidth;
		y = y - this._halfViewportHeight;

		if ( this._boundingArea ) {
			if ( x < this._boundingArea.minX ) {
				x = this._boundingArea.minX;
			}
			if ( y < this._boundingArea.minY ) {
				y = this._boundingArea.minY;
			}
			if ( x > this._boundingArea.maxX ) {
				x = this._boundingArea.maxX;
			}
			if ( y > this._boundingArea.maxY ) {
				y = this._boundingArea.maxY;
			}
		}

		this.setX(x);
		this.setY(y);

	};

	Camera.prototype.notifyChange = function() {
		//TODO: Inform renderer that it must redraw all layers
	};

	Camera.prototype.setX = function(value) {
		this._prevX = this._x;
		this._x = value;
		this.notifyChange();
	};

	Camera.prototype.setY = function(value) {
		this._prevY = this._y;
		this._y = value;
		this.notifyChange();
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
		return this._x * layer.parrallaxFactor.x;
	};

	Camera.prototype.getTopFromLayer = function(layer) {
		return this._y * layer.parrallaxFactor.y;
	};

	Camera.prototype.getBottomFromLayer = function(layer) {
		return this.getTopFromLayer(layer) + this.viewportHeight;
	};

	Camera.prototype.getRightFromLayer = function(layer) {
		return this.getLeftFromLayer(layer) + this.viewportWidth;
	};
	/**
	 * We use Square collision detection to determine if the
	 * object is visible or not
	 */
	Camera.prototype.canSee = function(renderizable) {
		
		if ( renderizable._alpha == 0 || !renderizable._visible ) return false;
		
		var sizeObj = 0;
		
		if ( renderizable._halfWidth > renderizable._halfHeight ) {
			sizeObj = renderizable._halfWidth;
		} else {
			sizeObj = renderizable._halfHeight;
		}
		
		// if ( this._y + this.viewportHeight < renderizable._y - sizeObj ) return false;
		// if ( this._y - this.viewportHeight > renderizable._y + sizeObj ) return false;
		// if ( this._x + this.viewportWidth < renderizable._x - sizeObj ) return false;
		// if ( this._x - this.viewportWidth > renderizable._x + sizeObj ) return false;
		
		//This is more precize but takes more processing time if the object is rotating constantly
		//We should make sure this is less expensive than rendering an object
		if ( this._y + this.viewportHeight < renderizable.getTop() ) return false;
		if ( this._y - this.viewportHeight > renderizable.getBottom() ) return false;
		if ( this._x + this.viewportWidth < renderizable.getLeft() ) return false;
		if ( this._x - this.viewportWidth > renderizable.getRight() ) return false;
		
		return true;
		
	};
	
	M.Camera = Camera;

})(window.Match);