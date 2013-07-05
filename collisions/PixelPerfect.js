(function(M, namespace) {

	function PixelPerfect() {
		this.testContext = document.createElement("canvas").getContext("2d");
	}

	PixelPerfect.prototype.haveCollided = function( collider, collidable ) {

		var frontCanvas = M.frontBuffer.canvas,
			math = window.Math,
			minX = math.min(collider.getLeft(), collidable.getLeft()),
			minY = math.min(collider.getTop(), collidable.getTop()),
			width = math.max(collider.getRight(), collidable.getRight()) - minX,
			height = math.max(collider.getBottom(), collidable.getBottom()) - minY,
			context = this.testContext,
			column = 0,
			row = 0,
			imageData;

		context.clearRect( minX, minY, width, height );

		context.save();
		collider.onRender(context, context.canvas, 0, 0);
		context.globalCompositeOperation = "source-in";
		collidable.onRender(context, context.canvas, 0, 0);
		context.restore();

		imageData = context.getImageData( minX, minY, width, height );

		while( column < imageData.width ) {

			while( row < imageData.height ) {

				var offset = ( row * imageData.width + column ) * 4;

				if ( imageData.data[ offset + 3 ] != 0 ) {
					return true;
				}

				row++;

			}

			column++;
			row = 0;

		}

		return false;

	};

	namespace.PixelPerfect = new PixelPerfect();

})(window.Match, window.Match.collisions || ( window.Match.collisions = {} ) );