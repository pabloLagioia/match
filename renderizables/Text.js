/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Shape) {

	var textMeasuringDiv = document.createElement("div");
		textMeasuringDiv.setAttribute("id", "match-text-measuring");
		textMeasuringDiv.style.setProperty("visibility", "hidden");
		textMeasuringDiv.style.setProperty("display", "inline-block");
		textMeasuringDiv.style.setProperty("position", "absolute");

	document.addEventListener( "DOMContentLoaded", function() {
		document.body.appendChild(textMeasuringDiv);
	});


	/**
	 * @class Text
	 * @constructor
	 * @extends renderers.Shape
	 * @param {Object} [properties] properties to construct this object
	 */
	function Text( properties ) {

		this.extendsShape();
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
		this._textAlign = "left";
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
		this._textBaseline = "top";
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

		this._changed = false;
		
		this.TYPE = M.renderizables.TYPES.TEXT;

		this.set( properties );

	}
	Text.prototype.getBoundingHalfWidth = function () {
		//Calculate and cache internal halfWidth and halfHeight which are needed for bounding method
		this.getWidth();
		this.getHeight();
		return this.shapeGetBoundingHalfWidth();
	};
	Text.prototype.getBoundingHalfHeigth = function () {
		//Calculate and cache internal halfWidth and halfHeight which are needed for bounding method
		this.getWidth();
		this.getHeight();
		return this.shapeGetBoundingHalfHeight();
	};
	/**
	 * Gets the height of this object
	 * @method getHeight
	 * @return {float} the height
	 */
	Text.prototype.getHeight = function() {
		
		if ( this._changed ) {

			textMeasuringDiv.style.setProperty("font-size", this._size);
			textMeasuringDiv.style.setProperty("font-family", this._family);
			textMeasuringDiv.style.setProperty("font-variant", this._variant);
			textMeasuringDiv.style.setProperty("font-weight", this._weight);
			textMeasuringDiv.style.setProperty("font-style", this._style);
			textMeasuringDiv.innerHTML = this._text;

			this._width = textMeasuringDiv.offsetWidth;
			this._height = textMeasuringDiv.offsetHeight;
			this._halfWidth = this._width / 2;
			this._halfHeight = this._height / 2;
		
			this._changed = false;

		}

		return this._height;

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
		this._changed = true;
	};
	/**
	 * @deprecated
	 */
	Text.prototype.setHorizontalAlign = function(value) {
		this._textAlign = value;
		this._changed = true;
		this.raiseEvent("horizontalAlignChanged", value);
	};
	/**
	 * @deprecated
	 */
	Text.prototype.setVerticalAlign = function(value) {
		this._textBaseline = value;
		this._changed = true;
		this.raiseEvent("verticalAlignChanged", value);
	};
	/**
	 * Gets the width of this object
	 * @method getWidth
	 * @return {float} the width
	 */
	Text.prototype.getWidth = function() {

		if ( this._changed ) {

			textMeasuringDiv.style.setProperty("font-size", this._size);
			textMeasuringDiv.style.setProperty("font-family", this._family);
			textMeasuringDiv.style.setProperty("font-variant", this._variant);
			textMeasuringDiv.style.setProperty("font-weight", this._weight);
			textMeasuringDiv.style.setProperty("font-style", this._style);
			textMeasuringDiv.innerHTML = this._text;

			this._width = textMeasuringDiv.offsetWidth;
			this._height = textMeasuringDiv.offsetHeight;
			this._halfWidth = this._width / 2;
			this._halfHeight = this._height / 2;
		
			this._changed = false;

		}

		return this._width;

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
		this._changed = true;
		this.raiseEvent("familyChanged", value);
	};

	Text.prototype.setFont = Text.prototype.setFamily;

	Text.prototype.getFont = Text.prototype.getFamily;
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
		this._changed = true;
		this.raiseEvent("sizeChanged", value);
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
		this._changed = true;
		this.raiseEvent("weightChanged", value);
	};
	/**
	 * Makes the font bold or regular
	 *
	 * @method setBold
	 * @param {Boolean} value true or false to set font bold
	 * @example
			this.setBold(true);
	* @example
			this.setBold(false);
	 */
	Text.prototype.setBold = function(value) {
		if ( value ) {
			this.setWeight("bold");
		} else {
			this.setWeight("");
		}
		this._changed = true;
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
		this._changed = true;
		this.raiseEvent("variantChanged", value);
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
		this._changed = true;
		this.raiseEvent("styleChanged", value);
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
	 * Sets the text
	 * @method setText
	 * @param {String} value the text
	 */
	Text.prototype.setText = function(value, multiLine) {
		if ( multiLine ) {
			this.multiLine = value.split("\n");
		}
		this._text = value;
		this._changed = true;
		this.raiseEvent("textChanged", value);
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
	 * Gets the text
	 * @method getText
	 * @return {String} the text
	 */
	Text.prototype.getText = function() {
		return this._text;
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Text.prototype.toString = function() {
		return "Text";
    };

    Text.name = "Text";
    
	M.extend( Text, Shape );

	namespace.Text = Text;

})(Match.renderizables, Match, Match.renderizables.Shape);