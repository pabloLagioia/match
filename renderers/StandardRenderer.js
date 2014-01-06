(function (Renderer) {
	
	function StandardRenderer() {

		this.extendsRenderer();

		this.context = this.canvas.getContext("2d");

		this.canvas.width = frontCanvas.width;
		this.canvas.height = frontCanvas.height;

		this.context = this.canvas.getContext("2d");

		this.compositeOperations = [
			"source-over", 
			"source-atop", 
			"source-in", 
			"source-out", 
			"destination-atop", 
			"destination-in", 
			"destination-out", 
			"destination-over", 
			"lighter", 
			"xor", 
			"copy"
		];
	
		this.DEFAULT_COMPOSITE_OPERATION = 0;
		this.DEFAULT_ALPHA = 1;
		this.DEFAULT_SHADOW_OFFSET_X = 0;
		this.DEFAULT_SHADOW_OFFSET_Y = 0;
		this.DEFAULT_SHADOW_BLUR = 0;

		this.shadowBlur = this.DEFAULT_SHADOW_BLUR;
		this.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
		this.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
		this.shadowChanged = false;

		this.compositeOperation = this.DEFAULT_COMPOSITE_OPERATION;
		
		this.SPRITE = 0;
		this.LAYER = 1;
		this.TEXT = 2;
		this.RECTANGLE = 3;
		this.CIRCLE = 4;

	}
	/**
	 * Applies the operation of this object to the context as composite operation
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {StandardRenderer} context
	 */
	StandardRenderer.prototype._applyOperation = function(object) {
		if ( object._compositeOperation ) {
			context.globalCompositeOperation = this.compositeOperations[object._compositeOperation];
			this.compositeOperation = object._compositeOperation;
		} else if (this.compositeOperation != this.DEFAULT_COMPOSITE_OPERATION) {
			this.resetOperation();
		}
	};
	/**
	 * @method resetOperation
	 * @abstract
	 */
	StandardRenderer.prototype.resetOperation = function() {
		this.context.globalCompositeOperation = this.compositeOperations[this.DEFAULT_COMPOSITE_OPERATION];
		this.compositeOperation = this.DEFAULT_COMPOSITE_OPERATION;
	};
	/**
	 * Applies the alpha of this object to the provided context
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {StandardRenderer} context
	 */
	StandardRenderer.prototype._applyAlpha = function(context) {
		if ( this.alpha != object._alpha && object._alpha >= 0 && object._alpha <= 1 ) {
			context.globalAlpha = this.alpha = object._alpha;
		} else if (this.alpha != this.DEFAULT_ALPHA) {
			this.resetAlpha();
		}
	};
	/**
	 * @method resetAlpha
	 * @abstract
	 */
	StandardRenderer.prototype.resetAlpha = function() {
		this.context.globalAlpha = this.alpha = this.DEFAULT_ALPHA;
	};
	/**
	 * Applies the shadow of this object to the provided context
	 *
	 * @method _applyShadow
	 * @protected
	 * @param {StandardRenderer} context
	 */
	StandardRenderer.prototype._applyShadow = function(object) {
		if ( object._shadow ) {
			var s = object._shadow;
			context.shadowOffsetX = this.shadowOffsetX = s.x;
			context.shadowOffsetY = this.shadowOffsetY = s.y;
			context.shadowBlur = this.shadowBlur = s.blur;
			context.shadowColor = s.color;
			context.shadowChanged = false;
		} else if (this.shadowChanged) {
			this.resetShadow();
		}
	};
	/**
	 * @method resetShadow
	 * @abstract
	 */
	StandardRenderer.prototype.resetShadow = function() {
		if ( this.shadowChanged ) {
			if ( this.shadowBlur != this.DEFAULT_SHADOW_BLUR ) {
				this.context.shadowBlur = this.shadowBlur = this.DEFAULT_SHADOW_BLUR;
			}
			if ( this.shadowOffsetX != this.DEFAULT_SHADOW_BLUR ) {
				this.context.shadowOffsetX = this.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
			}
			if ( this.shadowOffsetY != this.DEFAULT_SHADOW_OFFSET_Y ) {
				this.context.shadowOffsetY = this.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
			}
			this.shadowChanged = false;
		}
	};
	/**
	 * Applies the translation of this object to the provided context using the camera coordinates or 0
	 *
	 * @method _applyTranslation
	 * @protected
	 * @param {Renderizable} object
	 * @param {int} [cameraX] defaults to 0
	 * @param {int} [cameraY] defaults to 0
	 */
	StandardRenderer.prototype._applyTranslation = function(object, cameraX, cameraY) {
		context.translate(object._x - cameraX, object._y - cameraY);
	};
	/**
	 * Applies the rotation of this object to the provided context
	 *
	 * @method _applyRotation
	 * @protected
	 * @param {StandardRenderer} context
	 */
	StandardRenderer.prototype._applyRotation = function(object) {
		if ( object._rotation ) {
			this.context.rotate(object._rotation);
		}
	};
	/**
	 * Applies the scale factor of this object to the provided context
	 *
	 * @method _applyScale
	 * @protected
	 * @param {StandardRenderer} context
	 */
	StandardRenderer.prototype._applyScale = function(object) {
		if ( object._scale ) {
			this.context.scale(object._scale.x, object._scale.y);
		}
	};
	/**
	 * Clears the given context
	 * @method clear
	 * @param {HTMLContext2d} context to clear
	 */
	StandardRenderer.prototype.clear = function(context) {
		context.clearRect(0,0, context.canvas.width, context.canvas.height);
	};
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
	StandardRenderer.prototype.renderLayer = function (object) {
	
		if ( object.needsRedraw ) {

			var cameraX0 = p.camera._x * object.parrallaxFactor.x,
				cameraY0 = p.camera._y * object.parrallaxFactor.y,
				cameraX1 = cameraX0 + p.camera.viewportWidth,
				cameraY1 = cameraY0 + p.camera.viewportHeight,
				buffer = this.buffer,
				canvas = buffer.canvas,
				current;

			this.clear(this.context);

			for ( var i = 0, l = object.onRenderList.length; i < l; i++ ) {

				this.render(object.onRenderList[i]);

			}

			this.renderGameObjects(this.onRenderList, buffer, canvas, cameraX0, cameraY0, cameraX1, cameraY1);

			object.needsRedraw = false;

			// this.result = this.postProcessing.run(buffer);

		}

		if ( this.needsSorting ) {
			this.sort();
			this.needsSorting = false;
		}

	};
	StandardRenderer.prototype.render = function(object) {

		var camera = M.camera;

		if ( object.type == Sprite) {

		} else if ( object.type == Layer ) {
			this.renderLayer(object, object._context, camera);
		} else if ( object.type == Rectangle ) {
			this.renderLayer(object, object._context, camera._x, camera._y);
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
	StandardRenderer.prototype.renderLayer = function (layer, context, camera) {
	
		if ( layer.needsRedraw ) {

			var cameraX0 = camera._x * layer.parrallaxFactor.x,
				cameraY0 = camera._y * layer.parrallaxFactor.y,
				cameraX1 = cameraX0 + camera.viewportWidth,
				cameraY1 = cameraY0 + camera.viewportHeight,
				buffer = this.buffer,
				canvas = buffer.canvas,
				current;

			this.clear(this.context);

			for ( var i = 0, l = layer.onRenderList.length; i < l; i++ ) {

				this.render(layer.onRenderList[i]);

			}

			// this.renderGameObjects(this.onRenderList, buffer, canvas, cameraX0, cameraY0, cameraX1, cameraY1);

			layer.needsRedraw = false;

			// this.result = this.postProcessing.run(buffer);

		}

		if ( layer.needsSorting ) {
			layer.sort();
			layer.needsSorting = false;
		}

	};

	M.extend(StandardRenderer, Renderer);

})(M.renderers.Renderer);