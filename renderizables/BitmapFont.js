/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable, spriteAssets) {

	/**
	 * Contains an array of images that can be rendered to play an animation
	 *
	 * @class BitmapFont
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {String} img the key of the image loaded by M.sprites
	 * @param {float} x the x coordinate
	 * @param {float} y the y coordinate
	 */
	function BitmapFont(img, x, y) {

		this.extendsRenderizable();
		
		/**
		 * The image to render
		 * @private
		 * @property _sprite
		 * @type HTMLImageElement
		 */
		this._sprite = null;
		
		if ( img ) this.setImage(img);
		
		this.setLocation(x || 0, y || 0);
		
		this.TYPE = M.renderizables.TYPES.BITMAP_FONT;
		
	}

	/**
	 * Sets the image of this BitmapFont
	 * 
	 * @method setImage
	 * @param {String} img the key of the image loaded by M.sprites
	 * @param {int} frameIndex the starting frame index
	 */
	BitmapFont.prototype.setImage = function( img, frameIndex ) {

		if ( !img ) throw new Error("Image cannot be null");

		if ( img instanceof Image ) {
			if ( !img.frames ) {
				throw new Error("A bitmap font requires each font to be specified as a frame");
			}
			this._sprite = img;
		} else {
			var sprt = spriteAssets[ img ];
			if ( sprt ) {
				this._sprite = sprt;
			} else {
				throw new Error("Image by id " + img + " not loaded");
			}
		}
		
		return this;

	};
	BitmapFont.prototype.getImage = function() {
		return this._sprite;
	};
	BitmapFont.prototype.setFillStyle = BitmapFont.prototype.setImage;
	BitmapFont.prototype.getFillStyle = BitmapFont.prototype.getImage;
	BitmapFont.prototype.setFill = BitmapFont.prototype.setImage;
	BitmapFont.prototype.getFill = BitmapFont.prototype.getImage;
	BitmapFont.prototype.setText = function(text) {
		this._text = text;
		return this;
	};
	BitmapFont.prototype.getText = function() {
		return this._text;
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    BitmapFont.prototype.toString = function() {
		return "BitmapFont";
    };
	
    BitmapFont.name = "BitmapFont";

	M.extend( BitmapFont, Renderizable );

	namespace.BitmapFont = BitmapFont;

})(Match.renderizables, Match, Match.renderizables.Renderizable, Match.sprites.assets);