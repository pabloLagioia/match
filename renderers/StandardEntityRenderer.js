(function (Renderer) {
	
	function StandardEntityRenderer(canvas) {

		this.extendsRenderer(canvas);

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
	 * @param {CanvasRenderingContext2D} frontCanvas the canvas attached to the document where the game takes place
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
	 * @param {CanvasRenderingContext2D} frontCanvas the canvas attached to the document where the game takes place
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

			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);
			
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
		
		this._applyShadow(renderizable, context);

		if ( renderizable._halfWidth == 0 ) {
			renderizable.getWidth();
		}
		if ( renderizable._halfHeight == 0 ) {
			renderizable.getHeight();
		}

		if ( renderizable._rotation || renderizable._scale ) {

			context.save();

			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);

			this.fillText(renderizable, context, -renderizable._halfWidth, -renderizable._halfHeight);

			context.restore();

		} else {

			this.fillText(renderizable, context, renderizable._x - renderizable._halfWidth, renderizable._y - renderizable._halfHeight);

		}

	};
	StandardEntityRenderer.prototype.fillText = function(renderizable, context, x , y) {

		context.fillStyle = renderizable._fillStyle;
		
		if ( renderizable.multiLine ) {
			for ( var i = 0; i < renderizable.multiLine.length; i++ ) {
				context.fillText( renderizable.multiLine[i], x, y + i * renderizable.getHeight() );
			}
		} else {
			context.fillText( renderizable._text, x, y );
		}

		if ( renderizable._strokeStyle ) {
			context.strokeStyle = renderizable._strokeStyle;
			context.lineWidth = renderizable._lineWidth || 1;
			context.strokeText(renderizable._text, x, y );
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
			context.arc( renderizable._x, renderizable._y, renderizable._radius, renderizable._startAngle, renderizable._endAngle, false);
			context.closePath();

			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
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
		
		renderizable._animate();

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		var fX = renderizable.currentFrame.x,
			fY = renderizable.currentFrame.y;

		if ( renderizable._rotation || renderizable._scale ) {
		
			context.save();
			
			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);

			context.drawImage( renderizable._image, fX, fY, renderizable._width, renderizable._height, -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );

			context.restore();

		} else {

			context.drawImage( renderizable._image, fX, fY, renderizable._width, renderizable._height, renderizable._x - renderizable._halfWidth - cameraX, renderizable._y - renderizable._halfHeight - cameraY, renderizable._width, renderizable._height );

		}

	};
	StandardEntityRenderer.prototype.renderLayer = function (layer, context, cameraX, cameraY, viewportWidth, viewportHeight) {
	
		// if ( layer.needsRedraw ) {

			var current,
				currentView,
				currentViews;

			if ( layer.background ) {
				if ( layer.background.src ) {
					this.backBuffer.drawImage(layer.background, 0, 0, this.backBuffer.canvas.width, this.backBuffer.canvas.height);
				} else {
					this.backBuffer.fillStyle = layer.background;
					this.backBuffer.fillRect(0, 0, this.backBuffer.canvas.width, this.backBuffer.canvas.height);
				}
			} else {
				this.backBuffer.clearRect(0, 0, this.backBuffer.canvas.width, this.backBuffer.canvas.height);
			}

			for ( var i = 0, l = layer.onRenderList.length; i < l; i++ ) {

				current = layer.onRenderList[i];
				currentViews = current.views._values;

				for ( var j = 0, jl = currentViews.length; j < jl; j++ ) {
			
					currentView = currentViews[j];
			
					if ( this.camera.canSee(currentView) ) {
					
						this.render(currentView, this.backBuffer, cameraX, cameraY);
					
					}
				
				}

			}

			// layer.needsRedraw = false;

			this.frontBuffer.drawImage(this.backBuffer.canvas, 0, 0);

		// }

		if ( this.needsSorting ) {
			this.sort();
			this.needsSorting = false;
		}

	};
	StandardEntityRenderer.prototype.render = function(object, context, cameraX, cameraY) {

		var types = M.renderizables.TYPES;
		
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

	};
	/**
	 * Sets the antialiasing of the buffer
	 *
	 * @method setAntialiasing
	 * @param {Boolean} value
	 */
	StandardEntityRenderer.prototype.setAntialiasing = function(value) {
		this.frontBuffer.mozImageSmoothingEnabled = value;
		this.frontBuffer.webkitImageSmoothingEnabled = value;
		this.frontBuffer.imageSmoothingEnabled = value;
		
		this.backBuffer.mozImageSmoothingEnabled = value;
		this.backBuffer.webkitImageSmoothingEnabled = value;
		this.backBuffer.imageSmoothingEnabled = value;		
	};
	StandardEntityRenderer.prototype._getImageRenderingStyle = function() {
		var style = document.getElementById("match-image-quality");
		if ( style == undefined ) {
			style = document.createElement("style");
			style.setAttribute("id", "match-image-quality");
			style.type = "text/css";
			document.head.appendChild(style);
		}
		return style;
	};
	StandardEntityRenderer.prototype.prioritizeQuality = function() {
		this.setAntialiasing(true);
		this._getImageRenderingStyle().innerHTML = "canvas { -ms-interpolation-mode: bicubic; image-rendering: optimizeQuality; }";
	};
	StandardEntityRenderer.prototype.prioritizeSpeed = function() {
		this.setAntialiasing(false);
		this._getImageRenderingStyle().innerHTML = "canvas { -ms-interpolation-mode: nearest-neighbor; image-rendering: optimizeSpeed; }";
	};
	/**
	 * Gets the center of the layer
	 * @method getCenter
	 * @return {Object} object containing x and y
	 */
	StandardEntityRenderer.prototype.getSceneCenter = function() {
		return new M.math2d.Vector2d( this.frontBuffer.canvas.width / 2, this.frontBuffer.canvas.height / 2 );
	};
	/**
	 * Gets the contents of this layer as an image in base64
	 * @method getAsBase64Image
	 * @return {String} a string representing an image in base64
	 */
	StandardEntityRenderer.prototype.getAsBase64Image = function() {
		return this.frontBuffer.canvas.toDataURL();
	};
	/**
	 * Gets the contents of this layer as an html image
	 * @method getAsImage
	 * @return {HTMLImageElement} an image element with the result of this layer
	 */
	StandardEntityRenderer.prototype.getAsImage = function() {
		var img = new Image();
		img.src = this.getAsBase64Image();
		return img;
	};
	// /**
	 // * Sets the background of the buffer
	 // *
	 // * @method setBackground
	 // * @param {String} background a color, sprite name or null
	 // * @example
			// this.setBackground("black");
			// this.setBackground("rgb(0, 100, 100)");
			// this.setBackground("skySprite");
			// this.setBackground(); //sets default background
			// this.setBackground(""); //sets default background
	 // */
	// GameLayer.prototype.setBackground = function(background) {
		// if ( !background == "" && typeof background == "string" ) {
			// if ( M.sprites[background] ) {
				// this.clearImage = M.sprites[background]._image;
				// this.clear = this.clearUsingImage;
			// } else {
				// this.clearColor = background;
				// this.clear = this.clearUsingFillColor;
			// }
		// } else {
			// this.clear = this.clearUsingDefault;
		// }
	// };
	// /**
	 // * Gets the background of the buffer
	 // *
	 // * @method getBackground
	 // * @return {String} a css string representing the background
	 // */
	// GameLayer.prototype.getBackground = function() {
		// return this.buffer.canvas.getPropertyValue("background");
	// };

	M.extend(StandardEntityRenderer, Renderer);

	M.renderers.StandardEntityRenderer = StandardEntityRenderer;

})(M.renderers.Renderer);