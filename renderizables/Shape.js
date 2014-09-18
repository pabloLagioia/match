/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable) {

	function Shape(properties) {
		this.extendsRenderizable(properties);
				/**
		 * Fill Style used to fill the shape. Can be a color, a pattern or a gradient
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
		 * Line width used to render the borders of the shape
		 * @private
		 * @property _lineWidth
		 * @type String
		 * @example
				this._strokeStyle = "black";
		 * @example
				this._strokeStyle = "rgba(255,0,0,100)";
		 */
		this._lineWidth = 1;
	}

	/**
	 * Sets the style used to stroke the shape
	 *
	 * @method setStrokeStyle
	 * @param {Object} value the strokeStyle
	 * @example
			this.setStrokeStyle("rgb('255,0,0')");
	 * @example
			this.setStrokeStyle("Red");
	 */
	Shape.prototype.setStrokeStyle = function(value) {
		if ( this._strokeStyle != value ) {
			this._strokeStyle = value;
			this.raiseEvent("attributeChanged", "strokeStyle");
		}
		return this;
	};
	/**
	 * Returns the style used to stroke the shape
	 *
	 * @method getStrokeStyle
	 * @example
			this.getStrokeStyle();
	 */
	Shape.prototype.getStrokeStyle = function() {
		return this._strokeStyle;
	};
	/**
	 * Sets the style used to fill the shape
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
	Shape.prototype.setFillStyle = function(value) {
		if ( this._fillStyle != value ) {
			this._fillStyle = value;
			this.raiseEvent("attributeChanged", "fillStyle");
		}
		return this;
	};
	/**
	 * Gets the fill style
	 * @method getFillStyle
	 * @return {String} the fillStyle
	 */
	Shape.prototype.getFillStyle = function() {
		return this._fillStyle;
	};	
	/**
	 * Sets the style used to fill the shape
	 *
	 * @method setFill
	 * @param {Object} value the fillStyle
	 */
	Shape.prototype.setFill = Shape.prototype.setFillStyle;
	/**
	 * Gets the fill style
	 * @method getFill
	 * @return {String} the fillStyle
	 */
	Shape.prototype.getFill = Shape.prototype.setFillStyle;
	/**
	 * Sets the style used to fill the shape
	 *
	 * @method setColor
	 * @param {Object} value the fillStyle
	 */
	Shape.prototype.setColor = Shape.prototype.setFillStyle;
	/**
	 * Gets the fill style
	 * @method getColor
	 * @return {String} the fillStyle
	 */
	Shape.prototype.getColor = Shape.prototype.getFillStyle;
	/**
	 * Gets the stroke style
	 * @method getStrokeStyle
	 * @return {String} the strokeStyle
	 */
	Shape.prototype.getStrokeWidth = function() {
		return this._lineWidth;
	};
	/**
	 * Sets the border color of the shape
	 *
	 * @method setBorder
	 * @param {Object} value the color of the border
	 * @example
			this.setBorder("rgb('255,0,0')");
	 * @example
			this.setBorder("Red");
	 */
	Shape.prototype.setBorder = Shape.prototype.setStrokeStyle;
	/**
	 * Sets the line width used to stroke the shape
	 *
	 * @method setStrokeWidth
	 * @param {int} value the strokeStyle
	 * @example
			this.setStrokeWidth(5);
	 */
	Shape.prototype.setStrokeWidth = function(value) {
		if ( this._lineWidth != value ) {
			this._lineWidth = value;
			this.raiseEvent("strokeWidthChanged", value);
		}
		return this;
	};
	/**
	 * Sets the line width used to stroke the shape
	 *
	 * @method setBorderWidth
	 * @param {int} value the strokeStyle
	 * @example
			this.setStrokeWidth(5);
	 */
	Shape.prototype.setBorderWidth = Shape.prototype.setStrokeWidth;
	/**
	 * Returns the style used to stroke the shape
	 *
	 * @method getBorder
	 * @example
			this.getStrokeStyle();
	 */
	Shape.prototype.getBorder = Shape.prototype.getStrokeStyle;
	/**
	 * Gets the stroke width
	 * @method getStrokeWidth
	 * @return {int} the strokeWidth
	 */
	Shape.prototype.getStrokeWidth = function() {
		return this._lineWidth;
	};
	/**
	 * Gets the stroke width
	 * @method getBorderWidth
	 * @return {int} the strokeWidth
	 */
	Shape.prototype.getBorderWidth = Shape.prototype.getStrokeWidth;
		/**
	 * Sets the shadow style for this shape
	 *
	 * @method setShadow
	 * @param {float} x displacent in x
	 * @param {float} y displacent in y
	 * @param {String} color
	 * @param {int} blur
	 */
	Shape.prototype.setShadow = function(x, y, color, blur) {
		this._shadow = {
			x: x, y: y, color: color || "#000000", blur: blur || 1
		}
		this.raiseEvent("shadowChanged", this._shadow);
	};
	/**
	 * Gets the shadow
	 * @method getShadow
	 * @return {Object} the shadow
	 */
	Shape.prototype.getShadow = function() {
		return this._shadow;
	};

	Shape.prototype.setBlur = function(value, color) {
		this.setShadow(0, 0, color || this._fillStyle, value)
	};

	Shape.prototype.getBlur = function() {
		return this._shadow.blur;
	};

	Shape.name = "Shape";
	
	M.extend(Shape, Renderizable);
	
	namespace.Shape = Shape;
	
})(Match.renderizables, Match, Match.renderizables.Renderizable);