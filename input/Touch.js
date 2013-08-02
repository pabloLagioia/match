/**
 * @module Match
 */
(function(M) {

	var instance;

	function touchStartHelper(event) {
		// event.preventDefault();
		instance.start(event);
	}
	function touchEndHelper(event) {
		// event.preventDefault();
		instance.end(event);
	}
	function touchCancelHelper(event) {
		// event.preventDefault();
		instance.cancel(event);
	}
	function touchLeaveHelper(event) {
		// event.preventDefault();
		instance.leave(event);
	}
	function touchMoveHelper(event) {
		// event.preventDefault();
		instance.move(event);
	}

	function Touch() {

		document.addEventListener("touchstart", touchStartHelper, false);
		document.addEventListener("touchend", touchEndHelper, false);
		document.addEventListener("touchmove", touchMoveHelper, false);

		this.x = 0;
		this.y = 0;

		this.isDragging = false;

		this.events = {
			start: null,
			end: null,
			move: null
		};

	}

	Touch.prototype.clear = function() {
		if ( this.events.end ) {
			this.events.start = null;
			this.x = 0;
			this.y = 0;
		}
		this.events.end = null;
		this.events.move = null;
		this.force = null;
		if ( !this.isDragging ) {
			this.selectedObject = null;
		}
	};
	Touch.prototype.update = function() {
		this.fireEventOnLastSelectedObject(this);
		this.clear();
	};
	Touch.prototype.getHeight = function() {
		return 2;
	};
	Touch.prototype.getWidth = function() {
		return 2;
	};
	Touch.prototype.applyToObject = function(renderizable) {
		if ( !this.isDragging ) {
			if ( renderizable.onTouch || renderizable.onTouchEnd || renderizable.onTouchMove || renderizable.onDrag ) {
				if ( this.isOverPolygon(renderizable) && this.isOverPixelPerfect(renderizable) ) {
					this.selectedObject = renderizable;
				}
			}
		}
	};
	Touch.prototype._setTouch = function(touch) {
		this.x = touch.pageX - touch.target.offsetLeft;
		this.y = touch.pageY - touch.target.offsetTop;
		this.force = touch.force;
	};
	Touch.prototype.start = function(event) {
		var touches = event.changedTouches;
		if ( touches.length ) {
			var touch = touches[0];
			this._setTouch(touch);
			this.events.start = touch;
		}
	};
	Touch.prototype.end = function(event) {
		var touches = event.changedTouches;
		if ( touches.length ) {
			var touch = touches[0];
			this.events.end = touch;
			this.isDragging = false;
			this.selectedObject = null;
		}
	};
	Touch.prototype.move = function(event) {
		var touches = event.changedTouches;
		if ( touches.length ) {
			var touch = touches[0];
			this._setTouch(touch);
			this.events.move = touch;
		}
	};
	Touch.prototype.started = function() {
		return this.events.start;
	};
	Touch.prototype.moved = function() {
		return this.events.move;
	};
	Touch.prototype.ended = function() {
		return this.events.end;
	};
	Touch.prototype.any = function() {
		return this.started() || this.moved() || this.ended();
	};
	/**
	 * Executes the events of the selected object
	 * @method fireEventOnLastSelectedObject
	 * @private
	 */
	Touch.prototype.fireEventOnLastSelectedObject = function() {

		if ( this.selectedObject ) {
			if ( this.events.start ) {
				if ( this.selectedObject.onTouch ) {
					this.selectedObject.onTouch(this);
				}
				if ( this.selectedObject.onDrag ) {
					this.isDragging = true;
				}
			}
			if ( this.events.end && this.selectedObject.onTouchEnd ) {
				this.selectedObject.onTouchEnd(this);
			}
			if ( this.events.move ) {
				if ( this.selectedObject.onTouchMove ) {
					this.selectedObject.onTouchMove(this);
				}
				if ( this.isDragging ) {
					this.selectedObject.onDrag(this);
				}
			}
		}

	};
	/**
	 * Returns whether the mouse is over the given object
	 * @method isOverPixelPerfect
	 * @param {renderers.Renderizable} renderizable
	 * @param {OnLoopProperties} p
	 */
	Touch.prototype.isOverPixelPerfect = function( renderizable ) {
		if ( ! renderizable.onRender ) return;
		if ( ! renderizable._visible ) return;
		var ctx = M.offScreenContext,
			cnv = M.offScreenCanvas,
			camera = M.camera;
		ctx.save();
		ctx.clearRect(0, 0, cnv.width, cnv.height);
		renderizable.onRender(ctx, cnv, camera.x, camera.y);
		var imgData = ctx.getImageData(this.x, this.y, 1, 1);
		if ( !imgData.data[3] ) return false;
		if ( imgData.data[0] ) return true;
		if ( imgData.data[1] ) return true;
		if ( imgData.data[2] ) return true;
		return false;
	},
	/**
	 * Returns whether the mouse is over the given renderizable or not
	 *
	 * @method isOverPolygon
	 * @param {renderers.Renderizable} renderizable
	 * @param {Camera} camera
	 * @return {Boolean} true if mouse is over this object else false
	 */
	Touch.prototype.isOverPolygon = function (renderizable) {
		var camera = M.camera,
			x = this.x + camera.x,
			y = this.y + camera.y;
		if (renderizable._rotation) {
			this._x = x;
			this._y = y;
			return M.collisions.Polygon.haveCollided(renderizable, this);
		} else {
			if (renderizable.getBottom() < y) return false;
			if (renderizable.getTop() > y) return false;
			if (renderizable.getRight() < x) return false;
			if (renderizable.getLeft() > x) return false;
			return true;
		}
	};

	instance = new Touch();

	M.setTouch(instance);

})(window.Match);