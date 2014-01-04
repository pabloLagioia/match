(function (namespace, Renderer) {
	
	/**
	 * @class Renderer2d
	 * @constructor
	 * @extends renderers.Renderer
	 */
	function Renderer2d(frontCanvas) {

		this.extendsRenderer();

		this.frontCanvas = frontCanvas;

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
	 * @param {Renderer2d} context
	 */
	Renderer2d.prototype._applyOperation = function(object) {
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
	Renderer2d.prototype.resetOperation = function() {
		this.context.globalCompositeOperation = this.compositeOperations[this.DEFAULT_COMPOSITE_OPERATION];
		this.compositeOperation = this.DEFAULT_COMPOSITE_OPERATION;
	};
	/**
	 * Applies the alpha of this object to the provided context
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {Renderer2d} context
	 */
	Renderer2d.prototype._applyAlpha = function(context) {
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
	Renderer2d.prototype.resetAlpha = function() {
		this.context.globalAlpha = this.alpha = this.DEFAULT_ALPHA;
	};
	/**
	 * Applies the shadow of this object to the provided context
	 *
	 * @method _applyShadow
	 * @protected
	 * @param {Renderer2d} context
	 */
	Renderer2d.prototype._applyShadow = function(object) {
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
	Renderer2d.prototype.resetShadow = function() {
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
	Renderer2d.prototype._applyTranslation = function(object, cameraX, cameraY) {
		context.translate(object._x - cameraX, object._y - cameraY);
	};
	/**
	 * Applies the rotation of this object to the provided context
	 *
	 * @method _applyRotation
	 * @protected
	 * @param {Renderer2d} context
	 */
	Renderer2d.prototype._applyRotation = function(object) {
		if ( object._rotation ) {
			this.context.rotate(object._rotation);
		}
	};
	/**
	 * Applies the scale factor of this object to the provided context
	 *
	 * @method _applyScale
	 * @protected
	 * @param {Renderer2d} context
	 */
	Renderer2d.prototype._applyScale = function(object) {
		if ( object._scale ) {
			this.context.scale(object._scale.x, object._scale.y);
		}
	};
	/**
	 * Clears the given context
	 * @method clear
	 * @param {HTMLContext2d} context to clear
	 */
	Renderer2d.prototype.clear = function(context) {
		context.clearRect(0,0, context.canvas.width, context.canvas.height);
	};

	Renderer2d.prototype.renderLayer = function (object) {
	
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

	Renderer2d.prototype.render = function (object) {
	
		if ( object.TYPE == this.LAYER ) {
			this.renderLayer(object);
		} else if ( object.TYPE == this.RECTANGLE ) {
			this.renderRectangle(object);
		}

	};

	Renderer2d.prototype.renderRectangle = function (object) {

		var context = this.context;

		this._applyOperation(object);
		this._applyAlpha(object);

		if ( object._rotation || object._scale ) {
			
			context.save();
			
			this._applyTranslation(object, cameraX, cameraY);
			this._applyRotation(object);
			this._applyScale(object);

			if ( object._fillStyle ) {
				context.fillStyle = object._fillStyle;
			}

			context.fillRect( -object._halfWidth, -object._halfHeight, object._width, object._height );

			if ( object._lineWidth ) {
				context.lineWidth = object._lineWidth;
			}

			if ( object._strokeStyle ) {
				context.strokeStyle = object._strokeStyle;
				context.strokeRect( -object._halfWidth, -object._halfHeight, object._width, object._height );
			}

			context.restore();
		
		} else {
		
			if ( object._fillStyle ) {
				context.fillStyle = object._fillStyle;
			}

			var x = object._x - object._halfWidth,
				y = object._y - object._halfHeight;
		
			context.fillRect( x, y, object._width, object._height );

			if ( object._lineWidth ) {
				context.lineWidth = object._lineWidth;
			}

			if ( object._strokeStyle ) {
				context.strokeStyle = object._strokeStyle;
				context.strokeRect( x, y, object._width, object._height );
			}

		}

		this._applyShadow(object);

	};

	M.extend(Renderer2d, Renderer);

	namespace.Renderer2d = Renderer2d;

})(M.renderers, M.renderers.Renderer);
