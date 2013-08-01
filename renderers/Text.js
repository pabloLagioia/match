/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable) {
	/**
	 * @class Text
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {Object} [properties] properties to construct this object
	 */
	function Text( properties ) {

		Renderizable.apply(this, arguments);
		/**
		 * Font style
		 * @private
		 * @property _style
		 * @default "normal"
		 * @type String
		 * @example
				this._style = "normal";
		 * @example
				this._style = "italic";
		 * @example
				this._style = "bold";
		 */
		this._style = "";
		/**
		 * Font variant
		 * @private
		 * @property _variant
		 * @default "normal"
		 * @type String
		 * @example
				this._variant = "normal";
		 * @example
				this._variant = "small-caps";
		 */
		this._variant = "";
		/**
		 * Font weight
		 * @private
		 * @property _weight
		 * @default "normal"
		 * @type String
		 * @example
				this._weight = "normal";
		 * @example
				this._weight = "bold";
		 * @example
				this._weight = "bolder";
		 * @example
				this._weight = "lighter";
		 */
		this._weight = "";
		/**
		 * Font size
		 * @private
		 * @property _size
		 * @type String
		 * @example
				this._size = "10px";
		 */
		this._size = "14px";
		/**
		 * Font family
		 * @private
		 * @property _family
		 * @type String
		 * @example
				this._family = "Monospace";
		 */
		this._family = "Calibri, Verdana, Arial, Monospace";
		/**
		 * Text align
		 * @private
		 * @property _textAlign
		 * @default center
		 * @type String
		 * @example
				this._textAlign = "left";
		 * @example
				this._textAlign = "center";
		 * @example
				this._textAlign = "right";
		 * @example
				this._textAlign = "justify";
		 */
		this._textAlign = "center";
		/**
		 * Text baseline
		 * @private
		 * @property _textBaseline
		 * @default middle
		 * @type String
		 * @example
				this._textBaseline = "top";
		 * @example
				this._textBaseline = "bottom";
		 * @example
				this._textBaseline = "middle";
		 * @example
				this._textBaseline = "alphabetic";
		 * @example
				this._textBaseline = "hanging";
		 */
		this._textBaseline = "middle";
		/**
		 * Text
		 * @private
		 * @property _text
		 * @default ""
		 * @type String
		 * @example
				this._textBaseline = "Hellow World!";
		 */
		this._text = "";

		this.set( properties );

	}
	/**
	 * Renders the current text in the provided context
	 *
	 * @method onRender
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	Text.prototype.onRender = function(context, canvas, cameraX, cameraY) {

		context.save();

		this._applyShadow(context);
		this._applyAlpha(context);
		this._applyTranslation(context, cameraX, cameraY);
		this._applyRotation(context);
		this._applyScale(context);

		context.font = this._style + this._variant + this._weight + this._size + this._family;

		context.textAlign = this._textAlign;

		context.textBaseline = this._textBaseline;

		context.fillStyle = this._fillStyle;

		if ( this.multiLine ) {
			for ( var i = 0; i < this.multiLine.length; i++ ) {
				context.fillText( this.multiLine[i], 0, i * this.getHeight() );
			}
		} else {
			context.fillText( this._text, 0, 0 );
		}

		if ( this._strokeStyle ) {
			context.strokeStyle = this._strokeStyle;
			context.lineWidth = this._lineWidth || 1;
			context.strokeText(this._text, 0, 0 );
		}

		context.restore();

	};
	/**
	 * Returns x coordinate representing the rightmost part of the Object
	 *
	 * @method getRight
	 * @return {float} the coordinates to right of the object
	 */
	Text.prototype.getRight = function() {
		return this._x + this.getWidth();
	};
	/**
	 * Returns y coordinate representing the bottommost part of the Object
	 *
	 * @method getBottom
	 * @return {float} the coordinates to bottom of the object
	 */
	Text.prototype.getBottom = function() {
		return this._y + this.getHeight();
	};
	/**
	 * Gets the height of this object
	 * @method getHeight
	 * @return {float} the height
	 */
	Text.prototype.getHeight = function() {
		
		if ( this._text == this._cachedText2 )  return this._height;
		
		var d = document.createElement("span"),
			height;
		d.font = this._style + this._variant + this._weight + this._size + this._family;
		d.textContent = this._text;
		document.body.appendChild(d);
		height = d.offsetHeight;
		document.body.removeChild(d);
		
		this._height = height;
		this._cachedText2 = this._text;
		
		return height;

	};
	/*
	 * A Text size is too difficult to calculate so we
	 * just handle it's coordinates as we do with both
	 * of the objects, x and y is always center.
	 * That's why this methods are commented
	 */
	/**
	 * @deprecated
	 */
	Text.prototype.setAlignment = function( horizontal, vertical ) {
		this.setHorizontalAlign(horizontal);
		this.setVerticalAlign(vertical);
	};
	/**
	 * @deprecated
	 */
	Text.prototype.setHorizontalAlign = function(value) {
		this._textAlign = value;
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * @deprecated
	 */
	Text.prototype.setVerticalAlign = function(value) {
		this._textBaseline = value;
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * Gets the width of this object
	 * @method getWidth
	 * @return {float} the width
	 */
	Text.prototype.getWidth = function() {

		if ( this._text == this._cachedText ) return this._width;

		var width,
			context = M.offScreenContext;

		context.save();
		context.font = this._style + this._variant + this._weight + this._size + this._family;
		context.fillStyle = this._fillStyle;

		width = context.measureText(this._text).width;

		context.restore();

		this._width = width;
		this._cachedText = this._text;

		return width;

	};
	/**
	 * Sets the font family
	 *
	 * @method setFamily
	 * @param {String} value the font family
	 * @example
			this.setFamily("Monospace");
	 */
	Text.prototype.setFamily = function(value) {
		this._family = value;
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * Sets the font size
	 *
	 * @method setSize
	 * @param {String} value the font size without "px"
	 * @example
			this.setSize(14);
	 */
	Text.prototype.setSize = function(value) {
		this._size = parseInt(value) + "px ";
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * Sets the font weight
	 *
	 * @method setWeight
	 * @param {String} value the font weight
	 * @example
			this.setWeight("normal");
	 * @example
			this.setWeight("bold");
	 * @example
			this.setWeight("bolder");
	 * @example
			this.setWeight("lighter");
	 */
	Text.prototype.setWeight = function(value) {
		this._weight = value + " ";
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * Sets the font variant
	 *
	 * @method setVariant
	 * @param {String} value the font variant
	 * @example
			this.setVariant("normal");
	 * @example
			this.setVariant("small-caps");
	 */
	Text.prototype.setVariant = function(value) {
		this._variant = value + " ";
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * Sets the font style
	 *
	 * @method setStyle
	 * @param {String} value the font style
	 * @example
			this.setStyle("normal");
	 * @example
			this.setStyle("italic");
	 * @example
			this.setStyle("bold");
	 */
	Text.prototype.setStyle = function(value) {
		this._style = value + " ";
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * Sets the font fillStyle
	 *
	 * @method setFillStyle
	 * @param {Object} value the fillStyle
	 * @example
			this.setFillStyle("rgb('255,0,0')");
	 * @example
			// is equal to
			this.setFillStyle(M.Color.rgb(255,0,0));
			// Note: you must add the Color class to the compilation
	 */
	Text.prototype.setFillStyle = function(value) {
		this._fillStyle = value;
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * Applies the css style by the given selector to the text object.
	 * Valid css values: color, font-family, font-size, font-style, font-variant, font-weight, text-shadow
	 *
	 * @method css
	 * @param {String} selector the css selector
	 * @example
			this.css(".myTextStyle");
	 */
	Text.prototype.css = function(selector) {
		var style = M.getStyleBySelector(selector);
		if ( style.color != "" ) this.setFillStyle(style.color);
		if ( style.fontFamily != "" ) this.setFamily(style.fontFamily);
		if ( style.fontSize != "" ) this.setSize(style.fontSize);
		if ( style.fontStyle != "" ) this.setStyle(style.fontStyle);
		if ( style.fontVariant != "" ) this.setVariant(style.fontVariant);
		if ( style.fontWeight != "" ) this.setWeight(style.fontWeight);
		if ( style.left != "" ) this.setLeft(style.left);
		if ( style.right != "" ) this.setRight(style.right);
		if ( style.top != "" ) this.setTop(style.top);
		if ( style.bottom != "" ) this.setBottom(style.bottom);
		if ( style.textShadow != "" ) {
		
			var color, shadow, x, y, blur;
			
			if ( style.textShadow.indexOf("rgb") > -1 ) {
				color = style.textShadow.match(/rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/)[0];
			} else {
				if ( style.textShadow.indexOf("px") > style.textShadow.indexOf(" ") ) {
					color = style.textShadow.substr(0, style.textShadow.indexOf(" "));
				}
			}
		
			shadow = style.textShadow.match(/([0-9]+px) ([0-9]+px) ([0-9]+px)/);
			if ( shadow ) {
				x = parseInt(shadow[1]);
				y = parseInt(shadow[2]);
				blur = parseInt(shadow[3]);
			}
			this.setShadow( x, y, color, blur );
		}
	};
	/**
	 * Gets the font size
	 * @method getSize
	 * @return {int} the size
	 */
	Text.prototype.getSize = function(value) {
		return this._size;
	};
	/**
	 * Gets the font weight
	 * @method getWeight
	 * @return {String} the weight
	 */
	Text.prototype.getWeight = function(value) {
		return this._weight;
	};
	/**
	 * Gets the font variant
	 * @method getVariant
	 * @return {String} the variant
	 */
	Text.prototype.getVariant = function(value) {
		return this._variant;
	};
	/**
	 * Gets the font style
	 * @method getStyle
	 * @return {String} the style
	 */
	Text.prototype.getStyle = function(value) {
		return this._style;
	};
	/**
	 * Sets the stroke style
	 * @method setStrokeStyle
	 * @param {Object} value the strokeStyle
	 */
	Text.prototype.setStrokeStyle = function(value) {
		this._strokeStyle = value;
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * Sets the line width used to stroke the text
	 *
	 * @method setStrokeWidth
	 * @param {int} value the strokeStyle
	 * @example
			this.setStrokeWidth(5);
	 */
	Text.prototype.setStrokeWidth = function(value) {
		this._lineWidth = value;
		this._changed = true;
	};
	/**
	 * Gets the line width used to stroke the text
	 *
	 * @method getStrokeWidth
	 * @return {int}
	 */
	Text.prototype.getStrokeWidth = function() {
		return this._lineWidth;
	};
	/**
	 * Sets the text
	 * @method setText
	 * @param {String} value the text
	 */
	Text.prototype.setText = function(value, multiLine) {
		if ( multiLine ) {
			this.multiLine = value.split("\n");
		}
		this._text = value;
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * Gets the font family
	 * @method getFamily
	 * @return {String} the family
	 */
	Text.prototype.getFamily = function(value) {
		return this._family;
	};
	/**
	 * Gets the fill style
	 * @method getFillStyle
	 * @return {String} the fillStyle
	 */
	Text.prototype.getFillStyle = function(value) {
		return this._fillStyle;
	};
	/**
	 * Gets the stroke style
	 * @method getStrokeStyle
	 * @return {String} the strokeStyle
	 */
	Text.prototype.getStrokeStyle = function(value) {
		return this._strokeStyle;
	};
	/**
	 * Gets the text
	 * @method getText
	 * @return {String} the text
	 */
	Text.prototype.getText = function() {
		return this._text;
	};
	/**
	 * Sets the text shadow
	 * @method setShadow
	 * @param {float} x displacent in x
	 * @param {float} y displacent in y
	 * @param {String} color
	 * @param {int} blur
	 */
	Text.prototype.setShadow = function(x, y, color, blur) {
		this._shadow = {
			x: x, y: y, color: color || "black", blur: blur || 1
		}
		this.onChangeEvent.needsRedraw = true;
	};
	/**
	 * Gets the text shadow
	 * @method getShadow
	 * @return {Object} the shadow
	 */
	Text.prototype.getShadow = function() {
		return this._shadow;
	};

	M.extend( Text, Renderizable );

	namespace.Text = Text;

})(window.Match.renderers, window.Match, window.Match.renderers.Renderizable);