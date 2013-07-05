/**
 * @module Match
 */
(function(M) {

	function mouseDownHelper(e) {
		M.mouse.mousedown(e);
	}
	function mouseUpHelper(e) {
		M.mouse.mouseup(e);
	}
	function mouseClickHelper(e) {
		M.mouse.click(e);
	}
	function mouseMoveHelper(e) {
		M.mouse.mousemove(e);
	}
	function mouseWheelHelper(e) {
		M.mouse.mousewheel(e);
	}
	function mouseWheelHelperFireFox(e) {
		M.mouse.DOMMouseScroll(e);
	}
	// function contextMenuHelper(e) {
		// e.preventDefault();
	// }

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
		// document.addEventListener("contextmenu", contextMenuHelper, false );
        		
	}

	Mouse.prototype = {

		/**
		 * Left mouse button
		 * @property LEFT
		 * @final
		 * @type int
		 */
		LEFT: 0,
		/**
		 * Middle mouse button
		 * @property MIDDLE
		 * @final
		 * @type int
		 */
		MIDDLE: 1,
		/**
		 * Right mouse button
		 * @property RIGHT
		 * @final
		 * @type int
		 */
		RIGHT: 2,
		/**
		 * Sets the selected object if there is not dragging going on
		 * @method select
		 * @param {Object} object the object to select
		 * @param {Event} event
		 * @private
		 */
		select: function( object ) {

			if ( ! this.isDragging ) {
				this.selectedObject = object;
			}

		},
		/**
		 * Executes the events of the selected object
		 * @method fireEventOnLastSelectedObject
		 * @private
		 */
		fireEventOnLastSelectedObject: function() {

			var s = this.selectedObject,
				ps = this.prevSelectedObject;
		
			if ( s ) {
				if ( s.onMouseIn && !s._mouseInRaised ) {
					s._mouseInRaised = true;
					s.onMouseIn(this);
				}
				if ( ps && ps != s ) {
					ps._mouseInRaised = false;
					if ( ps.onMouseOut ) {
						ps.onMouseOut(this);
					}
				} 
				if ( s.onMouseUp && this.up() ) {
					s.onMouseUp(this);
				}
				if ( s.onClick && this.clicked() ) {
					s.onClick(this);
				}
				if ( s.onMouseDown && this.down() ) {
					s.onMouseDown(this);
					this.isDragging = true;
					if ( s.onDrag ) {
						s.onDrag(this);
					}
				}
				if ( s.onMouseOver ) {
					s.onMouseOver(this);
				}
				if ( s.onMouseMove && this.moved() ) {
					s.onMouseMove(this);
				}
				if ( s.onMouseWheel && this.wheel() ) {
					s.onMouseWheel(this);
				}
			} else if ( ps && ps.onMouseOut ) {
				ps._mouseInRaised = false;
				ps.onMouseOut(this);
			}
			
			this.prevSelectedObject = s;
			
			if ( ! this.isDragging ) {
				this.selectedObject = null;
			}

		},
		/**
		 * Returns whether the given button has been pressed and released
		 * @method clicked
		 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
		 * @return {Boolean} true if the button was pressed and released and false if not
		 */
		clicked: function( button ) {
			if ( button != null ) {
				return this.events[ button ].click;
			}
			return this.events[0].click;
		},
		/**
		 * Returns whether the given button is being pressed
		 * @method down
		 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
		 * @return {Boolean} true if the button is being pressed and false if not
		 */
		down: function( button ) {
			if ( button != null ) {
				return this.events[ button ].down;
			}
			return this.events[0].down || this.events[1].down || this.events[2].down;
		},
		/**
		 * Returns whether the given button has been released
		 * @method up
		 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
		 * @return {Boolean} true if the button has been released and false if not
		 */
		up: function( button ) {
			if ( button != null ) {
				return this.events[ button ].up;
			}
			return this.events[0].up || this.events[1].up || this.events[2].up;
		},
		/**
		 * Returns the move event or null if the mouse has not moved
		 * @method moved
		 * @return {Event} mouse event
		 */
		moved: function() {
			return this.eventMouseMove;
		},
		/**
		 * Returns the wheel delta y
		 * @method wheel
		 * @return {int} delta y
		 */
		wheel: function() {
			this.wheelDeltaY = 0;
			if ( this.eventMouseWheel ) {
				this.wheelDeltaY = this.eventMouseWheel.wheelDeltaY;
			}
			return this.wheelDeltaY;
		},
		/**
		 * Clears mouse events. This method is to be called once after game loop
		 * @protected
		 * @method clear
		 */
		clear: function() {

			for ( var i = 0; i < 3; i++ ) {
				this.events[i].up = null;
				this.events[i].click = null;
			}

			this.eventMouseWheel = null;
			this.eventMouseMove = null;

		},
		/**
		 * Sets the mouse click event and updates mouse location
		 * @method click
		 * @private
		 * @param {Event} e the mouse event
		 */
		click: function( e ) {
			this.events[ e.button ].click = e;
			this.x = e.offsetX;
			this.y = e.offsetY;
		},
		/**
		 * Sets the mouse down event
		 * @method mousedown
		 * @private
		 * @param {Event} e mouse event
		 */
		mousedown: function( e ) {
			this.events[ e.button ].down = e;
		},
		/**
		 * Sets the mouse up event and releases dragging
		 * @method mouseup
		 * @private
		 * @param {Event} e mouse event
		 */
		mouseup: function( e ) {
			this.events[ e.button ].down = null;
			this.events[ e.button ].up = e;
			this.isDragging = false;
		},
		/**
		 * Sets the mouse wheel event for every browser except Firefox
		 * @method mousewheel
		 * @private
		 * @param {Event} e mouse event
		 */
		mousewheel: function( e ) {
			this.eventMouseWheel = e;
		},
		/**
		 * Sets the mouse wheel event. For Firefox only
		 * @method mousewheel
		 * @private
		 * @param {Event} e mouse event
		 */
		DOMMouseScroll: function( e ) {
			this.mousewheel( { wheelDeltaY: e.detail * -40 } );
		},
		/**
		 * Returns whether the mouse is over the given object
		 * @method isOverPixelPerfect
		 * @param {renderers.Renderizable} renderizable
		 * @param {OnLoopProperties} p
		 */
		isOverPixelPerfect: function( renderizable ) {
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
        isOverPolygon: function (renderizable) {
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
        },
        getHeight: function() {
            return 2;
        },
        getWidth: function() {
            return 2;
        },
		/**
		 * Returns whether the mouse is over the given object
		 * @method update
		 */
		update: function() {
			this.fireEventOnLastSelectedObject();
			this.clear();
		},
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
		applyToObject: function( renderizable ) {
			if ( renderizable.onMouseOver || renderizable.onMouseIn || renderizable.onMouseOut || renderizable.onMouseWheel || ( renderizable.onMouseDown && this.down() ) || ( renderizable.onMouseUp && this.up() ) || ( renderizable.onClick && this.clicked() ) ) {
				if ( this.isOverPolygon(renderizable) && this.isOverPixelPerfect(renderizable) ) {
					this.select(renderizable);
				}
			}
		}

	};

	if ( M.browser.isFirefox ) {

		Mouse.prototype.mousemove = function(e) {
			this.eventMouseMove = e;
			this.x = e.layerX - e.target.offsetLeft;
			this.y = e.layerY - e.target.offsetTop;
		};

		Mouse.prototype.click = function( e ) {
			this.events[ e.button ].click = e;
			this.x = e.layerX - e.target.offsetLeft;
			this.y = e.layerY - e.target.offsetTop;
		};

	} else {

		Mouse.prototype.mousemove = function( e ) {
			this.eventMouseMove = e;
			this.x = e.offsetX;
			this.y = e.offsetY;
		};

	}

	M.setMouse(new Mouse());

})(window.Match);