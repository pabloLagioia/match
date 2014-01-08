(function (namespace) {
	
	function RenderingProvider() {
	}

	RenderingProvider.prototype.isWebGLSupported = function() {
		return WebGLRenderingContext !== undefined;
	};

	RenderingProvider.prototype.getRenderer = function (canvas, mode) {
		if ( mode && mode.toLowerCase() == "webgl" && this.isWebGLSupported() ) {
			return this.getWebGLRenderer(canvas);
		} else {
			return this.getStandardEntityRenderer(canvas);
		}
	};
	RenderingProvider.prototype.getStandardRenderer = function (canvas) {
		return new M.renderers.StandardRenderer(canvas);
	};
	RenderingProvider.prototype.getStandardEntityRenderer = function (canvas) {
		return new M.renderers.StandardEntityRenderer(canvas);
	};

	RenderingProvider.prototype.getWebGLRenderer = function (canvas) {
		return new M.renderers.WebGLRenderer(canvas);
	};

	namespace.renderingProvider = new RenderingProvider();

})(M);