/**
 * @module Match
 * @submodule input
 */
(function(M) {

	var instance;

	function mouseDownHelper(e) {
		instance.mousedown(e);
	}
	function mouseUpHelper(e) {
		instance.mouseup(e);
	}
	function mouseClickHelper(e) {
		instance.click(e);
	}
	function mouseMoveHelper(e) {
		instance.mousemove(e);
	}
	function mouseWheelHelper(e) {
		instance.mousewheel(e);
	}
	function mouseWheelHelperFireFox(e) {
		instance.DOMMouseScroll(e);
	}
	function contextMenuHelper(e) {
		e.preventDefault();
	}

	/**
	 * Provides mouse support.
	 * This class is automatically binded to Match if this file is included. Can be accessed by M.keyboard
	 * @class Mouse
	 * @namespace input
	 * @static
	 */
	function Mouse() {
		/**
		 * Object that contains mouse events for the existing buttons
		 * @property LEFT
		 * @private
		 * @type Object
		 */
		this.events = {
			0: {},
			1: {},
			2: {}
		};
		/**
		 * x coordinate of the mouse
		 * @property x
		 * @type int
		 */
		this.x = null;
		/**
		 * y coordinate of the mouse
		 * @property y
		 * @type int
		 */
		this.y = null;
		/**
		 * Indicates whether draggin is taking place or not
		 * @property isDragging
		 * @private
		 * @type Boolean
		 */
		this.isDragging = false;

	}

	/**
	 * Left mouse button
	 * @property LEFT
	 * @final
	 * @type int
	 */
	Mouse.prototype.LEFT = 0;
	/**
	 * Middle mouse button
	 * @property MIDDLE
	 * @final
	 * @type int
	 */
	Mouse.prototype.MIDDLE = 1;
	/**
	 * Right mouse button
	 * @property RIGHT
	 * @final
	 * @type int
	 */
	Mouse.prototype.RIGHT = 2;
	/**
	 * Sets the selected object if there is not dragging going on
	 * @method select
	 * @param {Object} object the object to select
	 * @param {Event} event
	 * @private
	 */
	Mouse.prototype.select = function( object ) {

		if ( ! this.isDragging ) {
			this.selectedObject = object;
		}

	};
	/**
	 * Prevents the context menu from showing up when the user right clicks on the document
	 * @method preventContexMenu
	 * @param {Boolean} value boolean that determines whether to prevent context menu or not
	 */
	Mouse.prototype.preventContexMenu = function(value) {
		if ( value ) {
			document.addEventListener("contextmenu", contextMenuHelper, false );
		} else {
			document.removeEventListener("contextmenu", contextMenuHelper, false );
		}
	};
	/**
	 * Executes the events of the selected object
	 * @method fireEventOnLastSelectedObject
	 * @private
	 */
	Mouse.prototype.fireEventOnLastSelectedObject = function() {

		var s = this.selectedObject,
			ps = this.prevSelectedObject;

		if ( s ) {
			if ( !s._mouseInRaised && s.listensTo("mouseIn") ) {
				s._mouseInRaised = true;
				s.raiseEvent("mouseIn", this);
			}
			if ( ps && ps != s ) {
				ps._mouseInRaised = false;
				if ( ps.listensTo("mouseOut") ) {
					ps.raiseEvent("mouseOut", this);
				}
			} 
			if ( this.up() && s.listensTo("mouseUp") ) {
				s.onMouseUp(this);
			}
			if ( this.clicked() && s.listensTo("click") ) {
				s.raiseEvent("click", this);
			}
			if ( this.down() ) {
				if ( s.listensTo("mouseDown") ) {
					s.raiseEvent("mouseDown", this);
				}
				this.isDragging = true;
				if ( s.listensTo("mouseDrag") ) {
					s.raiseEvent("mouseDrag", this);
				}
			}
			if ( s.listensTo("mouseOver") ) {
				s.raiseEvent("mouseOver", this);
			}
			if ( this.moved() && s.listensTo("mouseMove") ) {
				s.raiseEvent("mouseMove", this);
			}
			if ( this.wheel() && s.listensTo("mouseWheel") ) {
				s.raiseEvent("mouseWheel", this);
			}
		} else if ( ps && ps.listensTo("mouseOut") ) {
			ps._mouseInRaised = false;
			ps.raiseEvent("mouseOut", this);
		}
		
		this.prevSelectedObject = s;
		
		if ( ! this.isDragging ) {
			this.selectedObject = null;
		}

	};
	/**
	 * Returns whether the given button has been pressed and released
	 * @method clicked
	 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
	 * @return {Boolean} true if the button was pressed and released and false if not
	 */
	Mouse.prototype.clicked = function( button ) {
		if ( button != null ) {
			return this.events[ button ].click;
		}
		return this.events[0].click;
	};
	/**
	 * Returns whether the given button is being pressed
	 * @method down
	 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
	 * @return {Boolean} true if the button is being pressed and false if not
	 */
	Mouse.prototype.down = function( button ) {
		if ( button != null ) {
			return this.events[ button ].down;
		}
		return this.events[0].down || this.events[1].down || this.events[2].down;
	};
	/**
	 * Returns whether the given button has been released
	 * @method up
	 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
	 * @return {Boolean} true if the button has been released and false if not
	 */
	Mouse.prototype.up = function( button ) {
		if ( button != null ) {
			return this.events[ button ].up;
		}
		return this.events[0].up || this.events[1].up || this.events[2].up;
	};
	/**
	 * Returns the move event or null if the mouse has not moved
	 * @method moved
	 * @return {Event} mouse event
	 */
	Mouse.prototype.moved = function() {
		return this.eventMouseMove;
	};
	/**
	 * Returns the wheel delta y
	 * @method wheel
	 * @return {int} delta y
	 */
	Mouse.prototype.wheel = function() {
		this.wheelDeltaY = 0;
		if ( this.eventMouseWheel ) {
			this.wheelDeltaY = this.eventMouseWheel.wheelDeltaY;
		}
		return this.wheelDeltaY;
	};
	/**
	 * Clears mouse events. This method is to be called once after game loop
	 * @protected
	 * @method clear
	 */
	Mouse.prototype.clear = function() {

		for ( var i = 0; i < 3; i++ ) {
			this.events[i].up = null;
			this.events[i].click = null;
		}

		this.eventMouseWheel = null;
		this.eventMouseMove = null;

	};
	/**
	 * Sets the mouse click event and updates mouse location
	 * @method click
	 * @private
	 * @param {Event} e the mouse event
	 */
	Mouse.prototype.click = function( e ) {
		this.events[ e.button ].click = e;
		this.x = e.offsetX;
		this.y = e.offsetY;
	};
	/**
	 * Sets the mouse down event
	 * @method mousedown
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.mousedown = function( e ) {
		this.events[ e.button ].down = e;
	};
	/**
	 * Sets the mouse up event and releases dragging
	 * @method mouseup
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.mouseup = function( e ) {
		this.events[ e.button ].down = null;
		this.events[ e.button ].up = e;
		this.isDragging = false;
	};
	/**
	 * Sets the mouse wheel event for every browser except Firefox
	 * @method mousewheel
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.mousewheel = function( e ) {
		this.eventMouseWheel = e;
		};
	/**
	 * Sets the mouse wheel event. For Firefox only
	 * @method mousewheel
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.DOMMouseScroll = function( e ) {
		this.mousewheel( { wheelDeltaY: e.detail * -40 } );
	};
	/**
	 * Returns whether the mouse is over the given object
	 * @method isOverPixelPerfect
	 * @param {renderers.Renderizable} renderizable
	 * @param {OnLoopProperties} p
	 */
	Mouse.prototype.isOverPixelPerfect = function( renderizable ) {
		if ( ! renderizable._visible ) return;
		var ctx = M.offScreenContext,
			cnv = M.offScreenCanvas,
			camera = M.getCamera();
		cnv.width = M.renderer.frontBuffer.canvas.width;
		cnv.height = M.renderer.frontBuffer.canvas.height;
		ctx.save();
		ctx.clearRect(0, 0, cnv.width, cnv.height);
		M.renderer.render(renderizable, ctx, camera._x, camera._y);
		ctx.restore();
		var imgData = ctx.getImageData(this.x, this.y, 1, 1);
		if ( !imgData.data[3] ) return false;
		if ( imgData.data[0] ) return true;
		if ( imgData.data[1] ) return true;
		if ( imgData.data[2] ) return true;
		return false;
	};
	/**
	 * Returns whether the mouse is over the given renderizable or not
	 *
	 * @method isOverPolygon
	 * @param {renderers.Renderizable} renderizable
	 * @param {Camera} camera
	 * @return {Boolean} true if mouse is over this object else false
	 */
	Mouse.prototype.isOverPolygon = function (renderizable) {
		var camera = M.getCamera(),
			x = this.x + camera._x,
			y = this.y + camera._y;
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
	Mouse.prototype.getHeight = function() {
		return 2;
	};
	Mouse.prototype.getWidth = function() {
		return 2;
	};
	/**
	 * Fires mouse event on the object that is under the mouse and clears input
	 * @method update
	 */
	Mouse.prototype.update = function() {
		this.fireEventOnLastSelectedObject();
		this.clear();
	};
	/**
	 * Looks for mouse methods in the provided object and executes them if the object has focus.
	 * @method applyToObject
	 * @private
	 * @param {M.renderers.Renderizable} renderizable
	 * @param {OnLoopProperties} p
	 *
	 * @example 
			Ninja.prototype.throwStar = function() { 
				//throw ninja star
			}
			Ninja.prototype.onMouseDown = function(mouse) {
				if ( mouse.down(mouse.LEFT) ) {
					this.throwStar();
				}
			}
	 */
	Mouse.prototype.applyToEntity = function( renderizable ) {
		if ( renderizable.onMouseOver || renderizable.onMouseIn || renderizable.onMouseOut || renderizable.onMouseWheel || ( renderizable.onMouseDown && this.down() ) || ( renderizable.onMouseUp && this.up() ) || ( renderizable.onClick && this.clicked() ) ) {
			if ( this.isOverPolygon(renderizable) && this.isOverPixelPerfect(renderizable) ) {
				this.select(renderizable);
			}
		}
	};

	Mouse.prototype.applyToObject = function( entity ) {
	
		var views = entity.views._values,
			i = 0,
			l = views.length,
			renderizable;

		if ( entity.listensTo("mouseOver") || entity.listensTo("mouseIn") || entity.listensTo("mouseOut") || entity.listensTo("onMouseWheel") || ( entity.listensTo("mouseDown") && this.down() ) || ( entity.listensTo("mouseUp") && this.up() ) || ( entity.listensTo("click") && this.clicked() ) ) {

		// if ( entity.onMouseOver || entity.onMouseIn || entity.onMouseOut || entity.onMouseWheel || ( entity.onMouseDown && this.down() ) || ( entity.onMouseUp && this.up() ) || ( entity.onClick && this.clicked() ) ) {

			for (; i < l; i++ ) {

			renderizable = views[i];

				if ( this.isOverPolygon(renderizable) && this.isOverPixelPerfect(renderizable) ) {
					this.select(entity);
				}

			}
			
		}

	};

	if ( M.browser.isFirefox ) {

		Mouse.prototype.mousemove = function(e) {
			this.eventMouseMove = e;
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = e.layerX - e.target.offsetLeft;
			this.y = e.layerY - e.target.offsetTop;
		};

		Mouse.prototype.click = function( e ) {
			this.events[ e.button ].click = e;
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = e.layerX - e.target.offsetLeft;
			this.y = e.layerY - e.target.offsetTop;
		};

	} else {

		Mouse.prototype.mousemove = function( e ) {
			this.eventMouseMove = e;
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = e.offsetX;
			this.y = e.offsetY;
		};

	}

	Mouse.prototype.bind = function() {
		if ( M.browser.isFirefox  ) {
			document.addEventListener("DOMMouseScroll", mouseWheelHelperFireFox, false);
		} else if ( M.browser.name == "MSIE 9.0" ) {
			document.addEventListener("onwheel", mouseWheelHelper, false);
		} else {
			document.addEventListener("mousewheel", mouseWheelHelper, false);
		}
		document.addEventListener("mousedown", mouseDownHelper, false);
		document.addEventListener("mouseup", mouseUpHelper, false);
		document.addEventListener("mousemove", mouseMoveHelper, false);
		document.addEventListener("click", mouseClickHelper, false);
		M.setMouse(this);
	};

	Mouse.prototype.unbind = function() {
		if ( M.browser.isFirefox  ) {
			document.removeEventListener("DOMMouseScroll", mouseWheelHelperFireFox);
		} else if ( M.browser.name == "MSIE 9.0" ) {
			document.removeEventListener("onwheel", mouseWheelHelper);
		} else {
			document.removeEventListener("mousewheel", mouseWheelHelper);
		}
		document.removeEventListener("mousedown", mouseDownHelper);
		document.removeEventListener("mouseup", mouseUpHelper);
		document.removeEventListener("mousemove", mouseMoveHelper);
		document.removeEventListener("click", mouseClickHelper);
		M.setMouse(null);
	};

	instance = new Mouse();
	instance.bind();

})(window.Match);