(function(M, namespace) {

	/**
	 * Linear Gradient
	 * @constructor
	 * @param sx: source x
	 * @param sy: source y
	 * @param dx: destination x
	 * @param dy: destination y
	 * @param colorStops: a list containing the color stops
	 */
	function LinearGradient(properties) {

		if ( properties ) {

			M.applyProperties(this, properties);

		} else {

			/* Source */
			this.sx = 0;
			this.sy = 0;
			/* Destination */
			this.dx = 0;
			this.dy = 0;
			/* Color stops */
			this.colorStops = {};
			/* Gradient Fillstyle */
			this.fillStyle = null;

		}

	}

	LinearGradient.prototype.getFillStyle = function() {

		if ( ! this.fillStyle ) {

			this.fillStyle = M.context.createLinearGradient(this.sx, this.sy, this.dx, this.dy);

			var currentColorStop;

			for ( var i in this.colorStops ) {

				if ( i < 0 || i > 1 ) throw "Gradient color index must be between 0 and 1, you specified [" + i + "]";

				currentColorStop = this.colorStops[i];

				this.fillStyle.addColorStop( i, currentColorStop );

			}

		}

		return this.fillStyle;

	};

	namespace.LinearGradient = LinearGradient;
	
})(window.Match, window.Match.gradients || ( window.Match.gradients = {} ) );