/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable) {

	/**
	 * @class Rectangle
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {Object} [properties] properties to construct this object
	 */
	function Rectangle( properties ) {

		this.extendsRenderizable(properties);

		/**
		 * Fill Style used to fill the rectangle. Can be a color, a pattern or a gradient
		 * @private
		 * @property _fillStyle
		 * @default "black"
		 * @type Object
		 * @example 
				this._fillStyle = "black";
		 * @example 
				this._fillStyle = "rgba(255,0,0,100)";
		 */
		this._fillStyle = "black";
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
		 * Line width used to render the borders of the rectangle
		 * @private
		 * @property _lineWidth
		 * @type String
		 * @example
				this._strokeStyle = "black";
		 * @example
				this._strokeStyle = "rgba(255,0,0,100)";
		 */
		this._lineWidth = null;

		this.TYPE = M.renderers.TYPES.RECTANGLE;

		this.set( properties );

	}
	/**
	 * Applies the css style by the given selector to the rectangle object.
	 * Valid css values: color, background-color, border-color, border-width, width, height, box-shadow
	 *
	 * @method css
	 * @param {String} selector the css selector
	 * @example
			this.css(".myCssStyle");
	 */
	Rectangle.prototype.css = function(selector) {
		var style = M.getStyleBySelector(selector);
		if ( style.color != "" ) this.setFillStyle(style.color);
		if ( style.backgroundColor != "" ) this.setFillStyle(style.backgroundColor);
		if ( style.borderColor != "" ) this.setStrokeStyle(style.borderColor);
		if ( style.borderWidth != "" ) this.setLineWidth(style.borderWidth);
		if ( style.width != "" ) this.setWidth(style.width);
		if ( style.height != "" ) this.setHeight(style.height);
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
	 * Sets the style used to fill the rectangle
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
	Rectangle.prototype.setFillStyle = function(value) {
		this._fillStyle = value;
		this.notifyChange();
	};
	/**
	 * Sets the style used to stroke the rectangle
	 *
	 * @method setStrokeStyle
	 * @param {Object} value the strokeStyle
	 * @example
			this.setStrokeStyle("rgb('255,0,0')");
	 * @example
			this.setStrokeStyle("Red");
	 */
	Rectangle.prototype.setStrokeStyle = function(value) {
		this._strokeStyle = value;
		this.notifyChange();
	};
	/**
	 * Sets the line width used to stroke the rectangle
	 *
	 * @method setStrokeWidth
	 * @param {int} value the strokeStyle
	 * @example
			this.setStrokeWidth(5);
	 */
	Rectangle.prototype.setStrokeWidth = function(value) {
		this._lineWidth = value;
		this.notifyChange();
	};
	/**
	 * Sets the shadow style for this rectangle
	 *
	 * @method setShadow
	 * @param {float} x displacent in x
	 * @param {float} y displacent in y
	 * @param {String} color
	 * @param {int} blur
	 */
	Rectangle.prototype.setShadow = function(x, y, color, blur) {
		this._shadow = {
			x: x, y: y, color: color || "black", blur: blur || 1
		}
		this.notifyChange();
	};
	/**
	 * Gets the fill style
	 * @method getFillStyle
	 * @return {String} the fillStyle
	 */
	Rectangle.prototype.getFillStyle = function() {
		return this._fillStyle;
	};
	/**
	 * Gets the stroke style
	 * @method getStrokeStyle
	 * @return {String} the strokeStyle
	 */
	Rectangle.prototype.getStrokeStyle = function() {
		return this._strokeStyle
	};
	/**
	 * Gets the stroke width
	 * @method getStrokeWidth
	 * @return {int} the strokeWidth
	 */
	Rectangle.prototype.getStrokeWidth = function() {
		return this._lineWidth;
	};
	/**
	 * Gets the shadow
	 * @method getShadow
	 * @return {Object} the shadow
	 */
	Rectangle.prototype.getShadow = function() {
		return this._shadow;
	};

    Rectangle.name = "Rectangle";

	M.extend(Rectangle, Renderizable);

	namespace.Rectangle = Rectangle;

})(window.Match.renderers, window.Match, window.Match.renderers.Renderizable);