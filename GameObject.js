/**
 * @module Match
 */
(function (M) {
	/**
	 * Basic object for every game
	 *
	 * @class GameObject
	 * @constructor
	 */
    function GameObject() {
		/**
		 * Focus indicator. Determines whether the object is focused and will accept keyboard input or not
		 * @property hasFocus
		 * @type Boolean
		 */
		this.hasFocus = false;
        this.children = {};
	}
    GameObject.prototype.removeChild = function(key) {
        this.children[key] = null;
    };
	/**
	 * Abstract method that is called once per game loop.
	 * Every object pushed into Match list or GameLayer
	 * must override this method
	 * @method onLoop
	 * @protected
	 */
	GameObject.prototype.onLoop = function() {
		throw new Error("Method GameObject.onLoop is abstract and must be overriden");
	};
	
    M.GameObject = GameObject;
	
	/**
	 * Supports on loop events
	 * @class GameObjectWithEvents
	 * @extends GameObject
	 */
	 /**
	 * Mappings for the keydown event. Maps a key to a method of this object by name
	 * Object must have focus for this to be executed
	 * @property keyDownMappings
	 * @protected
	 * @type Object object of the like of a String-String Map. Contains a key mapped to the name of the method of this object
	 * @example
			//Provided this object has a method called moveLeft
			this.keyDownMappings = {
				"left": "moveLeft"
			}
	 */
	/**
	 * Mappings for the keyup event. Maps a key to a method of this object by name.
	 * Object must have focus for this to be executed.
	 * @property keyUpMappings
	 * @protected
	 * @type Object object of the like of a String-String Map. Contains a key mapped to the name of the method of this object
	 * @example
		//Provided this object has a method called jump
		this.keyDownMappings = {
			"up": "jump"
		}
	 */
	/**
	 * Method to be executed in the case of a keydown event
	 * NOTE: You must override this method in the prototype
	 * @method onKeyDown
	 * @protected
	 * @param {Object} keysDown object of the like of a String-Boolean Map. Contains the name of the keys that are being pressed and true if that is the case
	 */ 
	/**
	 * Method to be executed in the case of a keydup event.
	 * NOTE: You must override this method in the prototype
	 * @method onKeyUp
	 * @protected
	 * @param {Object} keysUp object of the like of a String-Boolean Map. Contains the name of the keys that where just released and true if that is the case
	 */
	/**
	 * Method to be executed in the case of a mouse down event.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseDown
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed in the case of a mouse up event.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseUp
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse enters this object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseIn
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse is moved in this object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseMove
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse leaves this object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseOut
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the in the case of a click event.
	 * NOTE: You must override this method in the prototype
	 * @method onClick
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse left button is down and the mouse moves.
	 * NOTE: You must override this method in the prototype
	 * @method onDrag
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the in the case of a mouse wheel event.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseWheel
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed if the mouse if over the object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseOver
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	
})(window.M);