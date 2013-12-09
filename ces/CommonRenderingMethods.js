var renderingEngine = {
	applyOperation: function(attr) {
		var context = attr.layer.buffer;
		if ( attr.operation ) {
			context.globalCompositeOperation = attr.operation;
			context.operationChanged = false;
		} else if (context.operationChanged) {
			context.resetOperation();
		}
	},
	applyAlpha: function(attr) {
		var context = attr.layer.buffer;
		if ( attr._alpha != null && attr._alpha >= 0 && attr._alpha <= 1 ) {
			context.globalAlpha = attr._alpha;
			context.alphaChanged = true;
		} else if (context.alphaChanged) {
			context.resetAlpha();
		}
	},
	applyTranslation: function(attr, obj, m) {
		var context = attr.layer.buffer;
		context.translate(attr.location.x - attr.camera.x, attr.location.y - attr.camera.y);
	},
	applyShadow: function(attr) {
		var context = attr.layer.buffer;
		if ( attr._shadow ) {
			context.shadowOffsetX = attr._shadow.x;
			context.shadowOffsetY = attr._shadow.y;
			context.shadowColor = attr._shadow.color;
			context.shadowBlur = attr._shadow.blur;
			context.shadowChanged = false;
		} else if (context.shadowChanged) {
			context.resetShadow();
		}
	},
	renderSpriteNoTransform: function(attr) {
		var context = attr.layer.buffer;
		context.drawImage( attr.sprite.image, attr.sprite.currentFrame.x, attr.sprite.currentFrame.y, attr.sprite.currentFrame.width, attr.sprite.currentFrame.height, attr.location.x + x, attr.location.y + y, attr.sprite.currentFrame.width, attr.sprite.currentFrame.height );
		context.resetAlpha();
	},
	renderRectangleNoTransform: function(attr) {
		var context = attr.layer.buffer;
		context.fillRect( attr.location.x - attr.size._halfWidth, attr.location.y - attr.size._halfHeight, attr.size.width, attr.size.height );
	}
}