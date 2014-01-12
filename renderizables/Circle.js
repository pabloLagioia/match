/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable) {

	/**
	 * @class Circle
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {Object} [properties] properties to construct this object
	 */
	function Circle( properties ) {

		this.extendsRenderizable(properties);
		/**
		 * Fill Style used to fill the circle. Can be a color, a pattern or a gradient
		 * @private
		 * @property _fillStyle
		 * @default "black"
		 * @type Object
		 * @example
				this._fillStyle = "black";
		 * @example
				this._fillStyle = "rgba(255,0,0,100)";
		 */
		this._fillStyle = "rgb(0,0,0)";
		/**
		 * Stroke Style
		 * @private
		 * @property _strokeStyle
		 * @type String
		 * @example
				this._strokeStyle = "black";
		 * @example
				this._strokeStyle = "rgba(255,0,0,100)";
		 */
		this._strokeStyle = null;
		/**
		 * Line width used to render the borders of the circle
		 * @private
		 * @property _lineWidth
		 * @type String
		 * @example
				this._strokeStyle = "black";
		 * @example
				this._strokeStyle = "rgba(255,0,0,100)";
		 */
		this._lineWidth = null;
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
	 * Applies the css style by the given selector to the circle object.
	 * Valid css values: color, background-color, border-color, border-width, width, height, box-shadow
	 *
	 * @method css
	 * @param {String} selector the css selector
	 * @example
			this.css(".myCssStyle");
	 */
	Circle.prototype.css = function(selector) {
		var style = M.getStyleBySelector(selector);
		if ( style.color != "" ) this.setFillStyle(style.color);
		if ( style.backgroundColor != "" ) this.setFillStyle(style.backgroundColor);
		if ( style.borderColor != "" ) this.setStrokeStyle(style.borderColor);
		if ( style.borderWidth != "" ) this.setLineWidth(style.borderWidth);
		if ( style.width != "" ) this.setRadius(style.width);
		if ( style.height != "" ) this.setRadius(style.height);
		if ( style.left != "" ) this.setLeft(style.left);
		if ( style.right != "" ) this.setRight(style.right);
		if ( style.top != "" ) this.setTop(style.top);
		if ( style.bottom != "" ) this.setBottom(style.bottom);
		if ( style.boxShadow != "" ) {

			var color, shadow, x, y, blur;

			if ( style.boxShadow.indexOf("rgb") > -1 ) {
				color = style.boxShadow.match(/rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/)[0];
			} else {
				if ( style.boxShadow.indexOf("px") > style.boxShadow.indexOf(" ") ) {
					color = style.boxShadow.substr(0, style.boxShadow.indexOf(" "));
				}
			}

			shadow = style.boxShadow.match(/([0-9]+px) ([0-9]+px) ([0-9]+px)/);
			if ( shadow ) {
				x = parseInt(shadow[1]);
				y = parseInt(shadow[2]);
				blur = parseInt(shadow[3]);
			}
			this.setShadow( x, y, color, blur );
		}
	};
	/**
	 * Sets the style used to stroke the circle
	 *
	 * @method setStrokeStyle
	 * @param {Object} value the strokeStyle
	 * @example
			this.setStrokeStyle("rgb('255,0,0')");
	 * @example
			this.setStrokeStyle("Red");
	 */
	Circle.prototype.setStrokeStyle = function(value) {
		this._strokeStyle = value;
		this.notifyChange();
	};
	Circle.prototype.getStrokeStyle = function() {
		return this._strokeStyle;
	};
	/**
	 * Sets the style used to fill the circle
	 *
	 * @method setFillStyle
	 * @param {Object} value the fillStyle
	 * @example
			this.setFillStyle("rgb('255,0,0')");
	 * @example
			this.setFillStyle("Red");
	 * @example
			this.setFillStyle(aPattern);
	 * @example
			this.setFillStyle(aGradient);
	 */
	Circle.prototype.setFillStyle = function(value) {
		this._fillStyle = value;
		this.notifyChange();
	};
	/**
	 * Gets the fill style
	 * @method getFillStyle
	 * @return {String} the fillStyle
	 */
	Circle.prototype.getFillStyle = function() {
		return this._fillStyle;
	};
	/**
	 * Sets the line width used to stroke the circle
	 *
	 * @method setStrokeWidth
	 * @param {int} value the strokeStyle
	 * @example
			this.setStrokeWidth(5);
	 */
	Circle.prototype.setStrokeWidth = function(value) {
		this._lineWidth = value;
		this.notifyChange();
	};
	/**
	 * Gets the stroke style
	 * @method getStrokeStyle
	 * @return {String} the strokeStyle
	 */
	Circle.prototype.getStrokeWidth = function() {
		return this._lineWidth;
	};
	/**
	 * Sets the radius of circle
	 *
	 * @method setRadius
	 * @param {float} radius
	 */
	Circle.prototype.setRadius = function(radius) {
		this._radius = radius;
		this.notifyChange();
	};
	/**
	 * Sets the shadow style for this circle
	 *
	 * @method setShadow
	 * @param {float} x displacent in x
	 * @param {float} y displacent in y
	 * @param {String} color
	 * @param {int} blur
	 */
	Circle.prototype.setShadow = function(x, y, color, blur) {
		this._shadow = {
			x: x, y: y, color: color || "black", blur: blur || 1
		}
		this.notifyChange();
	};
	/**
	 * Gets the shadow
	 * @method getShadow
	 * @return {Object} the shadow
	 */
	Circle.prototype.getShadow = function() {
		return this._shadow;
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
			this._x = value + this._radius * this._scale.x;
		} else {
			this._x = value + this._radius;
		}
		this.notifyChange();
	};
	/**
	 * Sets the rightmost coordinates of the Object
	 *
	 * @method setRight
	 * @param {float} value the coordinates to right of the object
	 */
	Circle.prototype.setRight = function(value) {
		if ( this._scale ) {
			this._x = value - this._radius * this._scale.x;
		} else {
			this._x = value - this._radius;
		}
		this.notifyChange();
	};
	/**
	 * Sets the topmost coordinates of the Object
	 *
	 * @method setTop
	 * @param {float} value the coordinates to top of the object
	 */
	Circle.prototype.setTop = function(value) {
		if ( this._scale ) {
			this._y = value + this._radius * this._scale.y;
		} else {
			this._y = value + this._radius;
		}
		this.notifyChange();
	};
	/**
	 * Sets the bottommost coordinates of the Object
	 *
	 * @method setBottom
	 * @param {float} value the coordinates to bottom of the object
	 */
	Circle.prototype.setBottom = function(value) {
		if ( this._scale ) {
			this._y = value - this._radius * this._scale.y;
		} else {
			this._y = value - this._radius;
		}
		this.notifyChange();
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

	M.extend(Circle, Renderizable);

	namespace.Circle = Circle;

})(Match.renderizables, Match, Match.renderizables.Renderizable);