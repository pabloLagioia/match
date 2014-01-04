(function (Renderer) {
	
	function StandardRenderer() {
		this.extendsRenderer();
		this.context = this.canvas.getContext("2d");
		this._operationChanged = false;
	}

	StandardRenderer.prototype.render = function(object) {
		if ( object.type == Sprite) {
		} else if ( object.type == Layer ) {
		} else if ( object.type == Rectangle ) {
		}
	};

	StandardRenderer.prtotype.renderRectangle = function(renderizable, context, cameraX, cameraY) {

		this._applyOperation(renderizable.operation);
		this._applyAlpha(renderizable.alpha);

		if ( renderizable._rotation || renderizable._scale ) {

			context.save();
			
			this._applyTranslation(context, cameraX, cameraY);
			this._applyRotation(context);
			this._applyScale(context);
			
			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
			}

			context.fillRect( -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );


			if ( renderizable._strokeStyle ) {

				if ( renderizable._lineWidth ) {
					context.lineWidth = renderizable._lineWidth;
				}

				context.strokeStyle = renderizable._strokeStyle;
				context.strokeRect( -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );
			}

			context.restore();
		
		} else {
		
			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
			}
		
			context.fillRect( renderizable._x - renderizable._halfWidth, renderizable._y - renderizable._halfHeight, renderizable._width, renderizable._height );

			if ( renderizable._strokeStyle ) {

				if ( renderizable._lineWidth ) {
					context.lineWidth = renderizable._lineWidth;
				}

				context.strokeStyle = renderizable._strokeStyle;
				context.strokeRect( renderizable._x - renderizable._halfWidth, renderizable._y - renderizable._halfHeight, renderizable._width, renderizable._height );

			}

		}

		this._applyShadow(context);

	};
	/**
	 * Applies the operation of this object to the provided context as composite operation
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 */
	StandardRenderer.prototype._applyOperation = function(operation) {
		if ( operation ) {
			context.globalCompositeOperation = operation;
			this._operationChanged = false;
		} else if (this._operationChanged) {
			this.resetOperation();
		}
	};
	/**
	 * Applies the alpha of this object to the provided context
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 */
	StandardRenderer.prototype._applyAlpha = function(context) {
		if ( this._alpha != null && this._alpha >= 0 && this._alpha <= 1 ) {
			context.globalAlpha = this._alpha;
			context.alphaChanged = true;
		} else if (context.alphaChanged) {
			context.resetAlpha();
		}
	};
	/**
	 * Applies the shadow of this object to the provided context
	 *
	 * @method _applyShadow
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 */
	StandardRenderer.prototype._applyShadow = function(context) {
		if ( this._shadow ) {
			context.shadowOffsetX = this._shadow.x;
			context.shadowOffsetY = this._shadow.y;
			context.shadowColor = this._shadow.color;
			context.shadowBlur = this._shadow.blur;
			context.shadowChanged = false;
		} else if (context.shadowChanged) {
			context.resetShadow();
		}
	};
	/**
	 * Applies the translation of this object to the provided context using the camera coordinates or 0
	 *
	 * @method _applyTranslation
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 * @param {int} [cameraX] defaults to 0
	 * @param {int} [cameraY] defaults to 0
	 */
	StandardRenderer.prototype._applyTranslation = function(renderizable, cameraX, cameraY) {
		this.context.translate(renderizable._x - cameraX, renderizable._y - cameraY);
	};
	/**
	 * Applies the rotation of this object to the provided context
	 *
	 * @method _applyRotation
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 */
	StandardRenderer.prototype._applyRotation = function(context) {
		if ( this._rotation ) {
			context.rotate(this._rotation);
		}
	};
	/**
	 * Applies the scale factor of this object to the provided context
	 *
	 * @method _applyScale
	 * @protected
	 * @param {CanvasRenderingContext2D} context
	 */
	StandardRenderer.prototype._applyScale = function(context) {
		if ( this._scale ) {
			context.scale(this._scale.x, this._scale.y);
		}
	};

	M.extend(StandardRenderer, Renderer);

})(M.renderers.Renderer);