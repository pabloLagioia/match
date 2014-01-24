/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable, spriteAssets) {

	/**
	 * Contains an array of images that can be rendered to play an animation
	 *
	 * @class BitmapText
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {String} sprite the key of the image loaded by M.sprites
	 * @param {float} x the x coordinate
	 * @param {float} y the y coordinate
	 */
	function BitmapText(sprite, x, y) {

		this.extendsRenderizable();
		
		/**
		 * The image to render
		 * @private
		 * @property _sprite
		 * @type HTMLImageElement
		 */
		this._sprite = null;
		
		if ( sprite ) this.setSprite(sprite);
		
		this.setLocation(x || 0, y || 0);
		
		this.TYPE = M.renderizables.TYPES.BITMAP_TEXT;
		
	}

	/**
	 * Sets the sprite of this BitmapText
	 * 
	 * @method setSprite
	 * @param {String} sprite the key of the sprite loaded by M.sprites
	 * @param {int} frameIndex the starting frame index
	 */
	BitmapText.prototype.setSprite = function( sprite, frameIndex ) {

		if ( !sprite ) throw new Error("Image cannot be null");

		if ( sprite instanceof Image ) {
			if ( !sprite.frames ) {
				throw new Error("A bitmap font requires each font to be specified as a frame");
			}
			this._sprite = sprite;
		} else {
			var sprt = spriteAssets[ sprite ];
			if ( sprt ) {
				this._sprite = sprt;
			} else {
				throw new Error("Image by id " + sprite + " not loaded");
			}
		}

		this.raiseEvent("attributeChanged", "sprite");
		
		return this;

	};
	/**
	 * Gets the sprite of this BitmapText
	 * 
	 * @method getSprite
	 * @return {Image} the sprite used by this BitmapText
	 */
	BitmapText.prototype.getSprite = function() {
		return this._sprite;
	};
	BitmapText.prototype.setFillStyle = BitmapText.prototype.setSprite;
	BitmapText.prototype.getFillStyle = BitmapText.prototype.getSprite;
	BitmapText.prototype.setFill = BitmapText.prototype.setSprite;
	BitmapText.prototype.getFill = BitmapText.prototype.getSprite;
	BitmapText.prototype.setText = function(text) {

		if ( text != this._text ) {

			this._text = text;

			this._width = 0;
			this._height = 0;

			var i = 0,
				j = text.length,
				character;

			for ( var i = 0, j = text.length; i < j; i++ ) {

				character = this._sprite.frames[text[i]];

				if ( character == undefined ) {
					throw new Error("Character '" + text[i] + "' has not been defined for this BitmapText");
				}

				this._width += this._sprite.frames[text[i]].width;
				this._height = Math.max(this._height, this._sprite.frames[text[i]].height);

			}

			this._halfWidth = this._width / 2;
			this._halfHeight = this._height / 2;

			this.raiseEvent("attributeChanged", "text");

		}

		return this;

	};
	BitmapText.prototype.getText = function() {
		return this._text;
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    BitmapText.prototype.toString = function() {
		return "BitmapText";
    };
	
	BitmapText.DEFAULT_FONT = {
		source: "data:image/png;base64,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",
		frames: {
			"A": {x: 0, y: 0, width: 76, height: 73},
			"B": {x: 84, y: 0, width: 76, height: 73},
			"C": {x: 166, y: 0, width: 76, height: 73},
			"D": {x: 248, y: 0, width: 76, height: 73},
			"E": {x: 328, y: 0, width: 76, height: 73},
			"F": {x: 0, y: 84, width: 76, height: 73},
			"G": {x: 84, y: 84, width: 76, height: 73},
			"H": {x: 164, y: 84, width: 76, height: 73},
			"I": {x: 246, y: 84, width: 46, height: 73},
			"J": {x: 294, y: 84, width: 76, height: 73},
			"K": {x: 374, y: 84, width: 76, height: 73},
			"L": {x: 0, y: 168, width: 76, height: 73},
			"M": {x: 82, y: 168, width: 118, height: 73},
			"N": {x: 200, y: 168, width: 76, height: 73},
			"O": {x: 284, y: 168, width: 76, height: 73},
			"P": {x: 364, y: 168, width: 76, height: 73},
			" ": {x: 436, y: 168, width: 24, height: 73},
			"Q": {x: 0, y: 252, width: 76, height: 73},
			"R": {x: 82, y: 252, width: 76, height: 73},
			"S": {x: 164, y: 252, width: 76, height: 73},
			"T": {x: 246, y: 252, width: 76, height: 73},
			"U": {x: 330, y: 252, width: 76, height: 73},
			"V": {x: 0, y: 336, width: 76, height: 73},
			"W": {x: 84, y: 336, width: 113, height: 73},
			"X": {x: 200, y: 336, width: 81, height: 73},
			"Y": {x: 284, y: 336, width: 80, height: 73},
			"Z": {x: 364, y: 336, width: 81, height: 73},
			"0": {x: 0, y: 421, width: 81, height: 73},
			"1": {x: 81, y: 421, width: 81, height: 73},
			"2": {x: 128, y: 421, width: 82, height: 73},
			"3": {x: 210, y: 421, width: 83, height: 73},
			"4": {x: 293, y: 421, width: 82, height: 73},
			"5": {x: 374, y: 421, width: 82, height: 73},
			"6": {x: 0, y: 505, width: 82, height: 73},
			"7": {x: 82, y: 505, width: 82, height: 73},
			"8": {x: 164, y: 505, width: 82, height: 73},
			"9": {x: 246, y: 505, width: 82, height: 73},
			":": {x: 327, y: 505, width: 37, height: 73},
			".": {x: 364, y: 505, width: 36, height: 73},
			"-": {x: 400, y: 505, width: 47, height: 73}
		}
	}
	
    BitmapText.name = "BitmapText";

	M.extend( BitmapText, Renderizable );

	namespace.BitmapText = BitmapText;

})(Match.renderizables, Match, Match.renderizables.Renderizable, Match.sprites.assets);