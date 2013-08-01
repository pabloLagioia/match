/**
 * @module Match
 */
(function(M) {

	/**
	 * Fillstyle pattern that can be applied to shapes
	 * @class Pattern
	 * @constructor
	 * @param {HTMLImageElement} image the image used to create the pattern
	 * @param {Object} style the pattern style, can be one of [ repeat | repeat-x | repeat-y | no-repeat ]
	 */
	function Pattern(properties) {

		if ( properties ) {

			M.applyProperties(this, properties);

		} else {

			/**
			 * Pattern image
			 * @property
			 * @type {HTMLImageElement}
			 */
			this.image = null;
			/**
			 * Style type
			 * @property
			 * @default "repeat"
			 * @type {String} "repeat" | "repeat-x" | "repeat-y" | "no-repeat"
			 */
			this.style = "repeat";
			/**
			 * Pattern Fillstyle
			 * @property
			 * @type {Object}
			 */
			this.fillStyle = null;

		}

	}
	/**
	 * Returns the fillStyle
	 * @method getFillStyle
	 */
	Pattern.prototype.getFillStyle = function() {

		if ( ! this.fillStyle ) {

			this.fillStyle = M.context.createPattern(image, this.style);

		}

		return this.fillStyle;

	};

	M.Pattern = Pattern;
	
})(window.Match);