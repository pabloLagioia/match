(function (namespace) {
	
	function RenderingProvider() {
	}

	RenderingProvider.prototype.getStandardRenderer = function () {
		return new M.renderers.StandardRenderer();
	};

	RenderingProvider.prototype.getWebGLRenderer = function () {
		return new M.renderers.WebGLRenderer();
	};

	namespace.renderingProvider = new RenderingProvider();

})(M);