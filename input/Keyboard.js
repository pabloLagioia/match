/**
 * @module Match
 */
(function(M) {

	function onkeydown(e) {
		M.keyboard.fireDown( e );
	}

	function onkeyup(e) {
		M.keyboard.fireUp( e );
	}

	/**
	 * Provides keyboard support.
	 * This class is automatically binded to Match if this file is included. Can be accessed by M.keyboard
	 * @class Keyboard
	 * @namespace input
	 * @static
	 */
	function Keyboard() {
		document.addEventListener("keydown", onkeydown, false);
		document.addEventListener("keyup", onkeyup, false);
	}

	Keyboard.prototype = {

		8: 		    "backspace",
		9: 			"tab",
		13: 		"enter",
		16: 		"shift",
		17:			"ctrl",
		18:			"alt",
		19:			"pause",
		20:			"capslock",
		27:			"escape",
		32:			"space",
		33:			"pageup",
		34:			"pagedown",
		35:			"end",
		36:			"home",
		37:			"left",
		38:			"up",
		39:			"right",
		40:			"down",
		45:			"insert",
		46:			"delete",
		112:		"f1",
		113:		"f2",
		114:		"f3",
		115:		"f4",
		116:		"f5",
		117:		"f6",
		118:		"f7",
		119:		"f8",
		120:		"f9",
		121:		"f10",
		122:		"f11",
		123:		"f12",
		145:		"numlock",
		220:		"pipe",

        /**
         * Map of <String, Boolean> containing true for keys that are being pressed
         * @property keysDown
         * @type {Map}
         */
        keysDown: {
            length: 0
        },
        /**
         * Map of <String, Boolean> containing true for keys that were released
         * @property keysUp
         * @type {Map}
         */
        keysUp: null,
        /**
         * Map of <String, Boolean> containing true for keys that were pressed (down -> executes and disables, up -> enables)
         * @property keysUp
         * @type {Map}
         */
        keysPressed: {            
        },
        /**
         * Method that gets executed when the user is pressing a key
         * @method fireDown
         * @private
         * @param {Event} event
         */
        fireDown: function( event ) {

			var key = this[ event.which ] || String.fromCharCode( event.which ).toLowerCase();

			this.keysDown[ key ] = true;

            if ( this.keysPressed[ key ] == undefined ) {
                this.keysPressed[ key ] = true;
            }
			
			this.keysDown.length++;

		},
		/**
		 * Method that gets executed when the released user a key
		 * @method fireUp
		 * @private
		 * @param {Event} event
		 */
		fireUp: function( event ) {

			var key = this[ event.which ] || String.fromCharCode( event.which ).toLowerCase();

			if ( ! this.keysUp ) this.keysUp = {};

			this.keysDown[ key ] = false;
            this.keysPressed[ key ] = undefined;
			this.keysUp[ key ] = true;
			
			if ( this.keysDown.length > 0 ) this.keysDown.length--;

		},
		/**
		 * Clears the keysUp Map to avoid further executions when the keys where long released
		 * @method update
		 */
		update: function() {
			this.keysUp = null;
            for ( var i in this.keysPressed ) {
                if ( this.keysPressed[i] == true ) {
                    this.keysPressed[i] = false;
                }
            }
		},
		/**
		 * Looks for onKeyDown and onKeyUp methods in the provided object and executes them if the object has focus.
		 * Also, if the object has keyDownMappings or keyUpMappings and a key event binded to any of those is executed
		 * then KeyboardInputHandler executes the specified method on the object
		 * @method applyToObject
		 *
		 * @example 
				Ninja.prototype.moveUp = function() { 
				 //move the ninja up 
				}
				Ninja.prototype.keyDownMappings = {
					"up": "moveUp"
				}
				//Both examples result in the execution of the moveUp method
				Ninja.prototype.onKeyUp = function(keysUp) {
					if ( keysUp.up ) {
						this.moveUp();
					}
				}
		 */
		applyToObject: function( object ) {
			
            if ( !object.hasFocus ) return;
            
			if ( object.onKeyDown ) object.onKeyDown(this.keysDown);
			if ( object.onKeyUp ) object.onKeyUp(this.keysUp);
			
			if ( object.keyDownMappings && this.keysDown.length > 0 ) {
				for ( var i in object.keyDownMappings ) {
					if ( this.keysDown[i] ) object[object.keyDownMappings[i]]();
				}
			}
			if ( object.keyUpMappings && this.keysUp ) {
				for ( var i in object.keyUpMappings ) {
					if ( this.keysUp[i] ) object[object.keyUpMappings[i]]();
				}
			}

		},

        getKeyCode: function(key) {
            return key.charCodeAt(0);
        }

	};

	M.setKeyboard(new Keyboard());

})(window.Match);