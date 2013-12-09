(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function NoPostProcess() {
	}

	NoPostProcess.prototype.run = function(context) {
		return context.canvas;
	};

	namespace.postProcess.NoPostProcess = NoPostProcess;

})(window.M);

(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function GrayScale() {
	}

	GrayScale.prototype.run = function(context) {
		var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height),
            d = imageData.data,
			l = d.length,
			i,
			r,
			g,
			b,
			v;
		for (i = 0; i < l; i += 4) {
			r = d[i];
			g = d[i+1];
			b = d[i+2];
			// CIE luminance for the RGB
			// The human eye is bad at seeing red and blue, so we de-emphasize them.
			v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
			d[i] = d[i+1] = d[i+2] = v;
		}
        context.putImageData(imageData, 0, 0);
		return context.canvas;
	};

	namespace.postProcess.GrayScale = GrayScale;

})(window.M);

(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function Brightness(value) {
        if ( value == undefined ) throw new Error("Brightness has no constructor that takes no arguments. You must specify the brightness value");
		this.value = value;
	}

	Brightness.prototype.run = function(context) {
		var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height),
            d = imageData.data;
		for (var i=0; i<d.length; i+=4) {
			d[i] += this.value;
			d[i+1] += this.value;
			d[i+2] += this.value;
		}
        
        context.putImageData(imageData, 0, 0);
		return context.canvas;
	};

	namespace.postProcess.Brightness = Brightness;

})(window.M);

(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function Convolute(matrix, opaque) {
		this.matrix = matrix;
		this.opaque = opaque;
	}

	Convolute.prototype.setSharpen = function() {
		this.matrix = [ 0, -1,  0, -1,  5, -1, 0, -1,  0 ];
	};

	Convolute.prototype.setBlur = function() {
		this.matrix = [ 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9 ];
	};

	Convolute.prototype.setContour = function() {
		this.matrix = [ 1, 1, 1, 1, 0.7, -1, -1, -1, -1 ];
	};

	Convolute.prototype.run = function(context) {
        if ( !this.matrix ) return;
		var side = Math.round(Math.sqrt(this.matrix.length));
		var halfSide = Math.floor(side/2);
        var imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
		var src = imgData.data;
		var sw = imgData.width;
		var sh = imgData.height;
		// pad output by the convolution matrix
		var w = sw;
		var h = sh;
        //TODO: Create a buffer for destination
		var imageData = document.createElement("canvas").getContext("2d");
        imageData.canvas.width = imgData.width;
        imageData.canvas.height = imgData.height;
        var data = imageData.getImageData(0, 0, imgData.width, imgData.height);
		var dst = data.data;
		// go through the destination image pixels
		var alphaFac = this.opaque ? 1 : 0;
		for (var y=0; y<h; y++) {
			for (var x=0; x<w; x++) {
				var sy = y;
				var sx = x;
				var dstOff = (y*w+x)*4;
				// calculate the weighed sum of the source image pixels that
				// fall under the convolution matrix
				var r=0, g=0, b=0, a=0;
				for (var cy=0; cy<side; cy++) {
					for (var cx=0; cx<side; cx++) {
						var scy = sy + cy - halfSide;
						var scx = sx + cx - halfSide;
						if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
							var srcOff = (scy*sw+scx)*4;
							var wt = this.matrix[cy*side+cx];
							r += src[srcOff] * wt;
							g += src[srcOff+1] * wt;
							b += src[srcOff+2] * wt;
							a += src[srcOff+3] * wt;
						}
					}
				}
				dst[dstOff] = r;
				dst[dstOff+1] = g;
				dst[dstOff+2] = b;
				dst[dstOff+3] = a + alphaFac*(255-a);
			}
		}
        context.putImageData(data, 0, 0);
		return context.canvas;
	};

	namespace.postProcess.Convolute = Convolute;

})(window.M);