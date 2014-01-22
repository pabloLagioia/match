/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Shape) {

	/**
	 * @class Circle
	 * @constructor
	 * @extends renderers.Shape
	 * @param {Object} [properties] properties to construct this object
	 */
	function Circle( properties ) {

		this.extendsShape();

		/**
		 * Radius of the circle
		 * @private
		 * @property _radius
		 * @default 1
		 * @type float
		 */
		this._radius = 1;
		/**
		 * Angle in which to begin rendering the circle.
		 * Valid values: 0 to 2 * Math.PI
		 * @private
		 * @property _radius
		 * @default 0
		 * @type float
		 */
		this._startAngle = 0;
		/**
		 * Angle in which to end rendering the circle
		 * Valid values: 0 to 2 * Math.PI
		 * @private
		 * @property _radius
		 * @default 6.28
		 * @type float
		 */
		this._endAngle = 6.28;

		this.TYPE = M.renderizables.TYPES.CIRCLE;

		this.set( properties );

	}
	/**
	 * Sets the diameter of the circle
	 *
	 * @method setSize
	 * @param {float} size
	 */
	Circle.prototype.setSize = function(size) {
		return this.setRadius(size / 2);
	};
	/**
	 * Gets the diameter of the circle
	 *
	 * @method getSize
	 * @return {float} diameter
	 */
	Circle.prototype.getSize = function() {
		return this._radius * 2;
	};
	/**
	 * Sets the radius of the circle
	 *
	 * @method setRadius
	 * @param {float} radius
	 */
	Circle.prototype.setRadius = function(radius) {
		this._radius = radius;
		this.raiseEvent("attributeChanged");
	};
	/**
	 * Gets the radius of the circle
	 * @method getRadius
	 * @return {float} the shadow
	 */
	Circle.prototype.getRadius = function() {
		return this._radius;
	};
	/**
	 * Returns whether the mouse is over this object or not
	 *
	 * @method isMouseOver
	 * @param {Object} p M.onLoopProperties
	 * @return {Boolean} true if mouse is over this object else false
	 */
	Circle.prototype.isMouseOver = function( p ) {
		if ( ! p ) p = M.onLoopProperties;
		return M.Math2d.getDistance( {x: this._x, y: this._y }, p.mouse ) <= this._radius;
	};
	/**
	 * Gets the height of this object. This is actually an ellipsis so this method will return the width of the shape
	 * @method getWidth
	 * @return {float} the width
	 */
	Circle.prototype.getWidth = function() {
		if ( this._scale ) {
			return this._radius * this._scale.x;
		} else {
			return this._radius;
		}
	};
	/**
	 * Gets the height of this object. This is actually an ellipsis so this method will return the height of the shape
	 * @method getWidth
	 * @return {float} the width
	 */
	Circle.prototype.getHeight = function() {
		if ( this._scale ) {
			return this._radius * this._scale.y;
		} else {
			return this._radius;
		}
	};
	/**
	 * Returns x coordinate representing the leftmost part of the Object
	 *
	 * @method getLeft
	 * @return {float} the coordinates to left of the object
	 */
	Circle.prototype.getLeft = function() {
		if ( this._scale ) {
			return this._x - this._radius * this._scale.x;
		} else {
			return this._x - this._radius;
		}
	};
	/**
	 * Returns x coordinate representing the rightmost part of the Object
	 *
	 * @method getRight
	 * @return {float} the coordinates to right of the object
	 */
	Circle.prototype.getRight = function() {
		if ( this._scale ) {
			return this._x + this._radius * this._scale.x;
		} else {
			return this._x + this._radius;
		}
	};
	/**
	 * Returns y coordinate representing the topmost part of the Object
	 *
	 * @method getTop
	 * @return {float} the coordinates to top of the object
	 */
	Circle.prototype.getTop = function() {
		if ( this._scale ) {
			return this._y - this._radius * this._scale.y;
		} else {
			return this._y - this._radius;
		}
	};
	/**
	 * Returns y coordinate representing the bottommost part of the Object
	 *
	 * @method getBottom
	 * @return {float} the coordinates to bottom of the object
	 */
	Circle.prototype.getBottom = function() {
		if ( this._scale ) {
			return this._y + this._radius * this._scale.y;
		} else {
			return this._y + this._radius;
		}
	};
	/**
	 * Sets the leftmost coordinates of the Object
	 *
	 * @method setLeft
	 * @param {float} value the coordinates to left of the object
	 */
	Circle.prototype.setLeft = function(value) {
		if ( this._scale ) {
			this.setX(value + this._radius * this._scale.x);
		} else {
			this.setX(value + this._radius);
		}
	};
	/**
	 * Sets the rightmost coordinates of the Object
	 *
	 * @method setRight
	 * @param {float} value the coordinates to right of the object
	 */
	Circle.prototype.setRight = function(value) {
		if ( this._scale ) {
			this.setX(value - this._radius * this._scale.x);
		} else {
			this.setX(value - this._radius);
		}
	};
	/**
	 * Sets the topmost coordinates of the Object
	 *
	 * @method setTop
	 * @param {float} value the coordinates to top of the object
	 */
	Circle.prototype.setTop = function(value) {
		if ( this._scale ) {
			this.setY(this._y = value + this._radius * this._scale.y);
		} else {
			this.setY(value + this._radius);
		}
	};
	/**
	 * Sets the bottommost coordinates of the Object
	 *
	 * @method setBottom
	 * @param {float} value the coordinates to bottom of the object
	 */
	Circle.prototype.setBottom = function(value) {
		if ( this._scale ) {
			this.setY(value - this._radius * this._scale.y);
		} else {
			this.setY(value - this._radius);
		}
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Circle.prototype.toString = function() {
		return "Circle";
    };

    Circle.name = "Circle";

	M.extend(Circle, Shape);

	namespace.Circle = Circle;

})(Match.renderizables, Match, Match.renderizables.Shape);