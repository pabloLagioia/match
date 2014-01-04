(function (namespace) {
	
	function RenderingProvider() {
	}

	RenderingProvider.prototype.getRenderer2d = function () {
		return new M.renderers.Renderer2d();
	};

	namespace.renderingProvider = new RenderingProvider();

})(M);