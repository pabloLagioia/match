/**
 * @module Match
 */
(function(M) {

	var instance;

	function onkeydown(e) {
		instance.fireDown( e );
	}

	function onkeyup(e) {
		instance.fireUp( e );
	}

	/**
	 * Provides keyboard support.
	 * This class is automatically binded to Match if this file is included. Can be accessed by M.keyboard
	 * @class Keyboard
	 * @namespace input
	 * @static
	 */
	function Keyboard() {
		/**
		 * Map of <String, Boolean> containing true for keys that are being pressed
		 * @property keysDown
		 * @type {Map}
		 */
		this.keysDown = {
			length: 0
		};
		/**
		 * Map of <String, Boolean> containing true for keys that were released
		 * @property keysUp
		 * @type {Map}
		 */
		this.keysUp = null;
		/**
		 * Map of <String, Boolean> containing true for keys that were pressed (down -> executes and disables, up -> enables)
		 * @property keysUp
		 * @type {Map}
		 */
		this.keysPressed = {            
		};
	}

	Keyboard.prototype.bind = function() {
		document.addEventListener("keydown", onkeydown, false);
		document.addEventListener("keyup", onkeyup, false);
		M.setKeyboard(this);
	};

	Keyboard.prototype.unbind = function() {
		document.removeEventListener("keydown", onkeydown);
		document.removeEventListener("keyup", onkeyup);
		M.setKeyboard(null);
	};

	Keyboard.prototype[8] 	= "backspace";
	Keyboard.prototype[9] 	= "tab";
	Keyboard.prototype[13] 	= "enter";
	Keyboard.prototype[16] 	= "shift";
	Keyboard.prototype[17]	= "ctrl";
	Keyboard.prototype[18] 	= "alt";
	Keyboard.prototype[19]	= "pause";
	Keyboard.prototype[20]	= "capslock";
	Keyboard.prototype[27]	= "escape";
	Keyboard.prototype[32]	= "space";
	Keyboard.prototype[33] 	= "pageup";
	Keyboard.prototype[34] 	= "pagedown";
	Keyboard.prototype[35] 	= "end";
	Keyboard.prototype[36] 	= "home";
	Keyboard.prototype[37] 	= "left";
	Keyboard.prototype[38] 	= "up";
	Keyboard.prototype[39] 	= "right";
	Keyboard.prototype[40] 	= "down";
	Keyboard.prototype[45] 	= "insert";
	Keyboard.prototype[46] 	= "delete";
	Keyboard.prototype[112] = "f1";
	Keyboard.prototype[113] = "f2";
	Keyboard.prototype[114] = "f3";
	Keyboard.prototype[115] = "f4";
	Keyboard.prototype[116] = "f5";
	Keyboard.prototype[117] = "f6";
	Keyboard.prototype[118] = "f7";
	Keyboard.prototype[119] = "f8";
	Keyboard.prototype[120] = "f9";
	Keyboard.prototype[121] = "f10";
	Keyboard.prototype[122] = "f11";
	Keyboard.prototype[123] = "f12";
	Keyboard.prototype[145] = "numlock";
	Keyboard.prototype[220] = "pipe";
    /**
     * Method that gets executed when the user is pressing a key
     * @method fireDown
     * @private
     * @param {Event} event
     */
    Keyboard.prototype.fireDown = function( event ) {

		var key = this[ event.which ] || String.fromCharCode( event.which ).toLowerCase();

		this.keysDown[ key ] = true;

        if ( this.keysPressed[ key ] == undefined ) {
            this.keysPressed[ key ] = true;
        }
		
		this.keysDown.length++;

	};
	/**
	 * Method that gets executed when the released user a key
	 * @method fireUp
	 * @private
	 * @param {Event} event
	 */
	Keyboard.prototype.fireUp = function( event ) {

		var key = this[ event.which ] || String.fromCharCode( event.which ).toLowerCase();

		if ( ! this.keysUp ) this.keysUp = {};

		this.keysDown[ key ] = false;
        this.keysPressed[ key ] = undefined;
		this.keysUp[ key ] = true;
		
		if ( this.keysDown.length > 0 ) this.keysDown.length--;

	};
	/**
	 * Clears the keysUp Map to avoid further executions when the keys where long released
	 * @method update
	 */
	Keyboard.prototype.update = function() {
		this.keysUp = null;
        for ( var i in this.keysPressed ) {
            if ( this.keysPressed[i] ) {
                this.keysPressed[i] = false;
            }
        }
	};
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
	Keyboard.prototype.applyToObject = function( object ) {
		
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

	};

    Keyboard.prototype.getKeyCode = function(key) {
        return key.charCodeAt(0);
    }

    var instance = new Keyboard();
   	instance.bind();

})(window.Match);