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
	
    BitmapText.name = "BitmapText";

	M.extend( BitmapText, Renderizable );

	namespace.BitmapText = BitmapText;

})(Match.renderizables, Match, Match.renderizables.Renderizable, Match.sprites.assets);