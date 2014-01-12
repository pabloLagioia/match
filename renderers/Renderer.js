(function (namespace) {
	
	/**
	 * @class Renderer
	 * @constructor
	 * @abstract
	 */
	function Renderer(canvas) {
		this.canvas = canvas;
		this.frontBuffer = null;
	}
	/**
	 * @method render
	 * @abstract
	 */
	Renderer.prototype.render = function() {
		throw new Error("Abstract method");
	};
	/**
	 * @method getCenter
	 */
	Renderer.prototype.getCenter = function() {
		return {x: this.canvas.width / 2, y: this.canvas.height / 2};
	};
	/**
	 * @method setSize
	 */
	Renderer.prototype.setSize = function( width, height ) {
		this.canvas.width = width;
		this.canvas.height = height;
	};
	/**
	 * @method adjustTo
	 * Stretches canvas to the given values.
	 */
	Renderer.prototype.adjustTo = function( width, height ) {
		this.canvas.style.setProperty("width", width + "px", null);
		this.canvas.style.setProperty("height", height + "px", null);
	};
	/**
	 * @method adjustToAvailSize
	 */
	Renderer.prototype.adjustToAvailSize = function() {
		this.canvas.adjustTo( window.screen.availWidth + "px", window.screen.availHeight + "px" );
	};
	/**
	 * @method resizeKeepingAspect
	 */
	Renderer.prototype.resizeKeepingAspect = function( times ) {
		this.canvas.adjustTo( this.canvas.width * times, this.canvas.height * times );
	};
	/**
	 * @method getRight
	 */
	Renderer.prototype.getRight = function() {
		return this.canvas.offsetLeft + this.canvas.offsetWidth;
	};
	/**
	 * @method getBottom
	 */
	Renderer.prototype.getBottom = function() {
		return this.canvas.offsetTop + this.canvas.offsetHeight;
	};
	/**
	 * @method getAvailWidth
	 */
	Renderer.prototype.getAvailWidth = function() {
		if ( this.canvas.getRight() < window.screen.availWidth ) { 
			return this.canvas.offsetWidth;
		} else {
			return window.screen.availWidth - this.canvas.offsetLeft;
		}
	};
	/**
	 * @method getAvailHeight
	 */
	Renderer.prototype.getAvailHeight = function() {
		if ( this.canvas.getBottom() < window.screen.availHeight ) { 
			return this.canvas.offsetHeight;
		} else {
			return window.screen.availHeight - this.canvas.offsetTop;
		}
	};
	/**
	 * @method getViewport
	 */
	Renderer.prototype.getViewport = function() {
		var viewport = {};
		if ( this.canvas.offsetLeft < 0 ) {
			viewport.left = -this.canvas.offsetLeft;
		} else {
			viewport.left = 0;
		}
		if ( this.canvas.offsetTop < 0 ) {
			viewport.top = -this.canvas.offsetTop;
		} else {
			viewport.top = 0;
		}
		if ( this.canvas.offsetLeft + this.canvas.offsetWidth > window.screen.availWidth ) {
			viewport.right = window.screen.availWidth - this.canvas.offsetLeft;
		} else {
			viewport.right = this.canvas.offsetWidth;
		}
		if ( this.canvas.offsetTop + this.canvas.offsetHeight > window.screen.availHeight ) {
			viewport.bottom = window.screen.availHeight - this.canvas.offsetTop;
		} else {
			viewport.bottom = this.canvas.offsetHeight;
		}
		return viewport;
	};
	/**
	 * Returns the aspect between the actual size of the canvas and the css size of it  
	 * @method getAspect
	 */
	Renderer.prototype.getAspect = function() {
		var aspect = { x: 1, y: 1 };
		if ( this.canvas.style.width && this.canvas.width != parseInt(this.canvas.style.width) ) {
			aspect.x = this.canvas.width / parseInt(this.canvas.style.width);
		}
		if ( this.canvas.style.height && this.canvas.height != parseInt(this.canvas.style.height) ) {
			aspect.y = this.canvas.height / parseInt(this.canvas.style.height);
		}
		return aspect;
	};
	/**
	 * Stretches the contents of the canvas to the size of the html document.
	 * This works as forcing a fullscreen, if the navigation bars of the browser were hidden.
	 *
	 * NOTE: This method behaves exactly as setCanvasStretchTo using document client width and height
	 *
	 * @method setCanvasStretch
	 * @param {Boolean} value true to stretch, false to set default values
	 */
	Renderer.prototype.setCanvasStretch = function(value) {
		if ( value ) {
			this.setCanvasStretchTo(document.documentElement.clientWidth, document.documentElement.clientHeight);
		} else {
			this.setCanvasStretchTo("auto", "auto");
		}
	};
	/**
	 * Stretches the contents of the canvas to the given size
	 *
	 * @method setCanvasStretchTo
	 * @param {String} w width in coordinates, as css pixels or percentages
	 * @param {String} h height in coordinates, as css pixels or percentages
	 */
	Renderer.prototype.setCanvasStretchTo = function(w, h) {
		if ( this.frontBuffer ) {
			if ( w ) {
				if ( typeof w == "number" || ( w != "auto" && w.indexOf("px") == "-1" && w.indexOf("%") == "-1" ) ) {
					w = w + "px";
				}
				this.frontBuffer.canvas.style.width = w;
			}

			if ( h ) {
				if ( typeof h == "number" || ( h != "auto" && h.indexOf("px") == "-1" && h.indexOf("%") == "-1" ) ) {
					h = h + "px";
				}
				this.frontBuffer.canvas.style.height = h;
			}
		}
	};
	
	Renderer.name = "Renderer";

	M.renderers = M.renderers || {};

	namespace.renderers.Renderer = Renderer;

})(M);