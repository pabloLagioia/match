(function (StandardRenderer) {
	
	function StandardEntityRenderer(canvas) {

		this.extendsStandardRenderer(canvas);

		this.frontBuffer = this.canvas.getContext("2d");
		
		this.backBuffer = document.createElement("canvas").getContext("2d");

		this.backBuffer.canvas.width = this.frontBuffer.canvas.width;
		this.backBuffer.canvas.height = this.frontBuffer.canvas.height;
		
		this.backBufferHalfWidth = this.backBuffer.canvas.width / 2;
		this.backBufferHalfHeight = this.backBuffer.canvas.height / 2;

		this.frontBuffer = this.canvas.getContext("2d");

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

		this.camera = new M.Camera();

		this.updateBufferSize();
		this.updateViewport();
		
	}
	/**
	 * Applies the operation of this object to the context as composite operation
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyOperation = function(object, context) {
		if ( object._compositeOperation ) {
			context.globalCompositeOperation = this.compositeOperations[object._compositeOperation];
			this.compositeOperation = object._compositeOperation;
		} else if (this.compositeOperation != this.DEFAULT_COMPOSITE_OPERATION) {
			this.resetOperation(context);
		}
	};
	/**
	 * @method resetOperation
	 * @abstract
	 */
	StandardEntityRenderer.prototype.resetOperation = function(context) {
		context.globalCompositeOperation = this.compositeOperations[this.DEFAULT_COMPOSITE_OPERATION];
		this.compositeOperation = this.DEFAULT_COMPOSITE_OPERATION;
	};
	/**
	 * Applies the alpha of this object to the provided context
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyAlpha = function(object, context) {
		if ( object._alpha != null && this.alpha != object._alpha && object._alpha >= 0 && object._alpha <= 1 ) {
			context.globalAlpha = this.alpha = object._alpha;
		} else if (this.alpha != this.DEFAULT_ALPHA) {
			this.resetAlpha(context);
		}
	};
	/**
	 * @method resetAlpha
	 * @abstract
	 */
	StandardEntityRenderer.prototype.resetAlpha = function(context) {
		context.globalAlpha = this.alpha = this.DEFAULT_ALPHA;
	};
	/**
	 * Applies the shadow of this object to the provided context
	 *
	 * @method _applyShadow
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyShadow = function(object, context) {
		if ( object._shadow ) {
			var s = object._shadow;
			context.shadowOffsetX = this.shadowOffsetX = s.x;
			context.shadowOffsetY = this.shadowOffsetY = s.y;
			context.shadowBlur = this.shadowBlur = s.blur;
			context.shadowColor = s.color;
			context.shadowChanged = false;
		} else if (this.shadowChanged) {
			this.resetShadow(context);
		}
	};
	/**
	 * @method resetShadow
	 * @abstract
	 */
	StandardEntityRenderer.prototype.resetShadow = function(context) {
		if ( this.shadowChanged ) {
			if ( this.shadowBlur != this.DEFAULT_SHADOW_BLUR ) {
				context.shadowBlur = this.shadowBlur = this.DEFAULT_SHADOW_BLUR;
			}
			if ( this.shadowOffsetX != this.DEFAULT_SHADOW_BLUR ) {
				context.shadowOffsetX = this.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
			}
			if ( this.shadowOffsetY != this.DEFAULT_SHADOW_OFFSET_Y ) {
				context.shadowOffsetY = this.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
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
	StandardEntityRenderer.prototype._applyTranslation = function(object, context, cameraX, cameraY) {
		context.translate(object._x - cameraX, object._y - cameraY);
	};
	/**
	 * Applies the rotation of this object to the provided context
	 *
	 * @method _applyRotation
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyRotation = function(object, context) {
		if ( object._rotation ) {
			context.rotate(object._rotation);
		}
	};
	/**
	 * Applies the scale factor of this object to the provided context
	 *
	 * @method _applyScale
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyScale = function(object, context) {
		if ( object._scale ) {
			context.scale(object._scale.x, object._scale.y);
		}
	};
	/**
	 * Clears the given context
	 * @method clear
	 * @param {HTMLContext2d} context to clear
	 */
	StandardEntityRenderer.prototype.clear = function(context) {
		context.clearRect(0,0, context.canvas.width, context.canvas.height);
	};
	
	/**
	 * Renders the contents of the layers to the game canvas without using a middle buffer. This may result in flickering
	 * in some systems and does not allow applying properties to layers
	 * @method renderSingleBuffer
	 * @param {Array} gameLayerList array of game layers
	 * @param {CanvasRenderingContext2D} fronCanvas the canvas attached to the document where the game takes place
	 * @param {OnLoopProperties} p useful objects for performance increase
	 */
	StandardEntityRenderer.prototype.renderSingleBuffer = function(gameLayerList, frontCanvas, p) {

		/**
		 * Cache variables that are used in this function
		 */
		var l = gameLayerList.length,
			i = 0,
			f = this.frontBuffer;

		f.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		for ( ; i < l; i++ ) {
			f.drawImage( gameLayerList[i].onLoop(p), 0, 0 );
		}

	};
	/**
	 * Renders the contents of the layers to the game canvas using a middle buffer to avoid flickering. Enables the use of layer properties
	 * @method renderDoubleBuffer
	 * @param {Array} gameLayerList array of game layers
	 * @param {CanvasRenderingContext2D} fronCanvas the canvas attached to the document where the game takes place
	 * @param {OnLoopProperties} p useful objects for performance increase
	 */
	StandardEntityRenderer.prototype.renderDoubleBuffer = function(gameLayerList, frontCanvas, p) {

		/*
		 * Cache variables that are used in this function
		 */
		var l = gameLayerList.length,
			i = 0,
			currentLayer,
			backBuffer = this.backBuffer;

		backBuffer.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		for ( ; i < l; i++ ) {

			currentLayer = gameLayerList[i];

			var result = currentLayer.onLoop(p);

			backBuffer.save();

			if ( currentLayer.composite ) {
				backBuffer.globalCompositeOperation = currentLayer.composite;
			}

			if ( currentLayer._alpha != null && currentLayer._alpha >= 0 && currentLayer._alpha <= 1 ) {
				backBuffer.globalAlpha = currentLayer._alpha;
			}

			backBuffer.translate(this.backBufferHalfWidth, this.backBufferHalfHeight);

			if ( currentLayer.rotation ) {
				backBuffer.rotate(currentLayer.rotation);
			}

			if ( currentLayer.scale ) {
				backBuffer.scale(currentLayer.scale.x, currentLayer.scale.y);
			}

			backBuffer.drawImage( result, -this.backBufferHalfWidth, -this.backBufferHalfHeight);

			backBuffer.restore();

		}

		this.frontBuffer.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		this.frontBuffer.drawImage( backBuffer.canvas, 0, 0 );

	};
	/**
	 * Updates the back buffer size to match the size of the game canvas
	 *
	 * @method updateBufferSize
	 */
	StandardEntityRenderer.prototype.updateBufferSize = function() {

		if ( this.backBuffer && this.frontBuffer ) {
			this.backBuffer.canvas.width = this.frontBuffer.canvas.width;
			this.backBuffer.canvas.height = this.frontBuffer.canvas.height;
			this.backBufferHalfWidth = this.backBuffer.canvas.width / 2;
			this.backBufferHalfHeight = this.backBuffer.canvas.height / 2;
		}
		
		if ( M.collisions.PixelPerfect ) {
			M.collisions.PixelPerfect.testContext.canvas.width = this.backBuffer.canvas.width;
			M.collisions.PixelPerfect.testContext.canvas.height = this.backBuffer.canvas.height;
		}

		this.updateViewport();

	};
	/**
	 * Updates the camera viewport to match the size of the game canvas
	 * @method updateViewport
	 */
	StandardEntityRenderer.prototype.updateViewport = function() {
		this.camera.setViewport( this.frontBuffer.canvas.width, this.frontBuffer.canvas.height );
	};
	StandardEntityRenderer.prototype.getViewportSize = function() {
		return { width: this.camera.viewportWidth, height: this.camera.viewportHeight };
	};
	StandardEntityRenderer.prototype.renderRectangle = function(renderizable, context, cameraX, cameraY) {

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);
		

		if ( renderizable._rotation || renderizable._scale ) {

			context.save();
			
			var pivotX = renderizable.pivotX || 0,
				pivotY = renderizable.pivotY || 0;
			
			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);
			
			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
			}

			context.fillRect( pivotX, pivotY, renderizable._width, renderizable._height );

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

		this._applyShadow(renderizable, context);
		
	};
	/**
	 * Renders the current text in the provided context
	 *
	 * @method onRender
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	StandardEntityRenderer.prototype.renderText = function( renderizable, context, cameraX, cameraY ) {

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		//TODO: caching oportunity
		context.font = renderizable._style + renderizable._variant + renderizable._weight + renderizable._size + renderizable._family;

		context.textAlign = renderizable._textAlign;

		context.textBaseline = renderizable._textBaseline;

		context.fillStyle = renderizable._fillStyle;

		this._applyShadow(renderizable, context);

		if ( renderizable._rotation || renderizable._scale ) {

			context.save();

			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);

			this.fillText(renderizable, context, 0, 0);

			context.restore();

		} else {

			this.fillText(renderizable, context, renderizable._x, renderizable._y);

		}

	};
	StandardEntityRenderer.prototype.fillText = function(renderer, context, x , y) {

		if ( renderer.multiLine ) {
			for ( var i = 0; i < renderer.multiLine.length; i++ ) {
				context.fillText( renderer.multiLine[i], x, y + i * renderer.getHeight() );
			}
		} else {
			context.fillText( renderer._text, x, y );
		}

		if ( renderer._strokeStyle ) {
			context.strokeStyle = renderer._strokeStyle;
			context.lineWidth = renderer._lineWidth || 1;
			context.strokeText(renderer._text, x, y );
		}

	};
	/**
	 * Renders the current sprite in the provided context
	 *
	 * @method onRender
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	StandardEntityRenderer.prototype.renderCircle = function( renderizable, context, cameraX, cameraY ) {

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		if ( renderizable._scale ) {

			context.save();

			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyScale(renderizable, context);

			context.beginPath();
			context.arc( 0, 0, renderizable._radius, renderizable._startAngle, renderizable._endAngle, false);
			context.closePath();

			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
				context.fill();
			}

			context.restore();

		} else {

			context.beginPath();
			//TODO: Cache radius / 2 as halfRadius in Circle
			context.arc( renderizable._x - renderizable._radius / 2, renderizable._y - renderizable._radius / 2, renderizable._radius, renderizable._startAngle, renderizable._endAngle, false);
			context.closePath();

			if ( renderizable._fillStyle ) {
				context.fillStyle = this._fillStyle;
				context.fill();
			}

		}

		this._applyShadow(renderizable, context);

		if ( renderizable._strokeStyle ) {

			if ( renderizable._lineWidth ) {
				context.lineWidth = renderizable._lineWidth;
			}
			
			context.strokeStyle = renderizable._strokeStyle;
			context.stroke( -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );
			
		}

	};
	/**
	 * Renders the current sprite in the provided context
	 *
	 * @method renderSprite
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	StandardEntityRenderer.prototype.renderSprite = function( renderizable, context, cameraX, cameraY ) {

		if ( ! renderizable._image ) return;

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);
		
		var x, y;

		if ( renderizable.pivotX ) {
			x = renderizable.pivotX;
		} else {
			x = -renderizable.oHW || -renderizable.currentFrame.halfWidth;
		}

		if ( renderizable.pivotY ) {
			y = renderizable.pivotY;
		} else {
			y = -renderizable.oHH || -renderizable.currentFrame.halfHeight;
		}

		if ( renderizable._rotation || renderizable._scale ) {
		
			context.save();
			
			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);

			context.drawImage( renderizable._image, renderizable.currentFrame.x, renderizable.currentFrame.y, renderizable.currentFrame.width, renderizable.currentFrame.height, x, y, renderizable.oW || renderizable.currentFrame.width, renderizable.oH || renderizable.currentFrame.height );

			context.restore();
			
		} else {
		
			context.drawImage( renderizable._image, renderizable.currentFrame.x, renderizable.currentFrame.y, renderizable.currentFrame.width, renderizable.currentFrame.height, renderizable._x + x, renderizable._y + y, renderizable.oW || renderizable.currentFrame.width, renderizable.oH || renderizable.currentFrame.height );

		}

		this._applyShadow(context);

	};
	StandardEntityRenderer.prototype.renderLayer = function (layer, context, cameraX, cameraY, viewportWidth, viewportHeight) {
	
		if ( layer.needsRedraw ) {

			var cameraX0 = cameraX * layer.parrallaxFactor.x,
				cameraY0 = cameraX * layer.parrallaxFactor.y,
				cameraX1 = cameraX0 + viewportWidth,
				cameraY1 = cameraY0 + viewportHeight,
				current,
				currentView,
				currentViews;

			this.backBuffer.clearRect(0, 0, this.backBuffer.canvas.width, this.backBuffer.canvas.height);

			for ( var i = 0, l = layer.onRenderList.length; i < l; i++ ) {

				current = layer.onRenderList[i];
				currentViews = current.views._values;

				for ( var j = 0, jl = currentViews.length; j < jl; j++ ) {
			
					currentView = currentViews[j];
			
					if ( this.isVisible(currentView, cameraX0, cameraY0, cameraX1, cameraY1) ) {
					
						this.render(currentView, this.backBuffer, cameraX, cameraY);
					
					}
				
				}

			}

			// layer.needsRedraw = false;

			this.frontBuffer.clearRect(0, 0, this.frontBuffer.canvas.width, this.frontBuffer.canvas.height);
			this.frontBuffer.drawImage(this.backBuffer.canvas, 0, 0);

		}

		if ( this.needsSorting ) {
			this.sort();
			this.needsSorting = false;
		}

	};
	/**
	 * Returns whether this object is visible and is inside the given viewport
	 *
	 * @method isVisible
	 * @param {float} cameraX0 the left coordinate of the camera
	 * @param {float} cameraY0 the top coordinate of the camera
	 * @param {float} cameraX1 the right coordinate of the viewport
	 * @param {float} cameraY1 the bottom coordinate of the viewport
	 * @return {Boolean}
	 */
    StandardEntityRenderer.prototype.isVisible = function (object, cameraX0, cameraY0, cameraX1, cameraY1) {
    	
		if ( object._alpha == 0 || !object._visible ) return false;
    	
    	var insideViewport = object.isIn(cameraX0, cameraY0, cameraX1, cameraY1);

    	if ( object.onOutsideViewport ) {
			if ( !(object._raisedNotVisible && insideViewport) ) {
				object.onOutsideViewport();
				object._raisedNotVisible = true;
			} else {
				object._raisedNotVisible = false;
			}
		}

		return insideViewport; 
    
    };
	StandardEntityRenderer.prototype.render = function(object, context, cameraX, cameraY) {

		var types = M.renderers.TYPES;
		
		switch ( object.TYPE ) {
			case types.SPRITE:
				this.renderSprite(object, context, cameraX, cameraY);
				break;
			case types.LAYER:
				this.renderLayer(object, object._context, this.camera._x, this.camera._y, this.camera.viewportWidth, this.camera.viewportHeight);
				break;
			case types.TEXT:
				this.renderText(object, context, cameraX, cameraY);
				break;
			case types.RECTANGLE:
				this.renderRectangle(object, context, cameraX, cameraY);
				break;
			case types.CIRCLE:
				this.renderCircle(object, context, cameraX, cameraY);
				break;
			default:
				throw new Error("Unable to render object of type " + object.TYPE);
		}
		
		if ( object.children ) {
			for ( var i = 0, l = object.children.length; i < l; i++ ) {
				this.render(object.children[i], context, cameraX, cameraY);
			}
		}

	};

	M.extend(StandardEntityRenderer, StandardRenderer);

	M.renderers.StandardEntityRenderer = StandardEntityRenderer;

})(M.renderers.StandardRenderer);