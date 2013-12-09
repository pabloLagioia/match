(function(M, namespace) {

	/**
	 * Radial Gradient
	 * @constructor
	 * @param sx: source x
	 * @param sy: source y
	 * @param sr: source radius
	 * @param dx: destination x
	 * @param dy: destination y
	 * @param dr: destination radius
	 * @param colorStops: a list containing the color stops
	 */
	function RadialGradient(properties) {

		if ( properties ) {

			M.applyProperties(this, properties);

		} else {

			/* Source */
			this.sx = 0;
			this.sy = 0;
			/* Destination */
			this.dx = 0;
			this.dy = 0;
			/* radius */
			this.sr = 0;
			this.dr = 0;
			/* Color stops */
			this.colorStops = [];
			/* Gradient Fillstyle */
			this.fillStyle = null;

		}

	}

	RadialGradient.prototype = {

		getFillStyle: function( context ) {

			if ( ! this.fillStyle ) {

				this.updateFillStyle( context );;

			}

			return this.fillStyle;

		},

		updateFillStyle: function( context ) {

			if ( ! context ) context = M.context;

			this.fillStyle = M.context.createRadialGradient(this.sx, this.sy, this.sr, this.dx, this.dy, this.dr);

			var currentColorStop;

			for ( var i in this.colorStops ) {

				if ( i < 0 || i > 1 ) throw "Gradient color index must be between 0 and 1, you specified [" + i + "]";

				currentColorStop = this.colorStops[i];

				// this.fillStyle.addColorStop( i, currentColorStop );
				this.fillStyle.addColorStop( i, M.rgba( currentColorStop.red, currentColorStop.green, currentColorStop.blue, currentColorStop.alpha ) );

			}

		}

	};

	namespace.RadialGradient = RadialGradient;
	
})(window.Match, window.Match.gradients || ( window.Match.gradients = {} ) );