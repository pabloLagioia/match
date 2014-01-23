/**
 * @module Match
 */
(function(namespace) {

	/**
	 * Provides an easy solution to event handling
	 * 
	 * @class EventListener
	 * @constructor
	 * @example 
	 
			function onClickListener(sender) {
				console.log("Clicked on: " + sender);
			}
	 
			var onClick = new M.EventListener();
			
			onClick.addEventListener(onClickListener);
			
			onClick.raise(this);
			
			onClick.removeEventListener(onClickListener);

	 * @example 

			var obj = { name: "Ninja" };

			function onClickListener() {
				console.log("Clicked on: " + this.name); //Will print Ninja
			}
	 
			var onClick = new M.EventListener();
			
			onClick.addEventListener(onClickListener, obj); //Bind execution context to obj
			
			onClick.raise();
			
			onClick.removeEventListener(onClickListener);
	 */
	function EventListener() {
		this.listeners = new Array();
	}
	/**
	 * @method addEventListener
	 * @param {Function} listener 
	 * @param {Object} owner [optional] object to bind the listener to
	 */
	EventListener.prototype.addEventListener = function(listener, owner) {
		if ( owner ) {
			this.listeners.push(new ObjectListener(listener, owner));
		} else {
			this.listeners.push(new FunctionListener(listener));
		}
	};
	/**
	 * @method raise
	 */
	EventListener.prototype.raise = function() {
	
		var i = 0,
			l = this.listeners.length;
		
		if ( l == 0 ) return;
		
		for ( ; i < l; i++ ) {
			this.listeners[i].run(arguments);
		}
		
	};
	/**
	 * @method removeEventListener
	 */
	EventListener.prototype.removeEventListener = function(listener) {
		var l = this.listeners.indexOf(listener);
		if ( l > -1 ) {
			this.listeners.splice(l, 1);
		}
	};
	/**
	 * @method removeAllEventListeners
	 *
	 * @return {Array} Array containing the event listeners that are removed
	 */
	EventListener.prototype.removeAllEventListeners = function() {
		this.listeners = new Array();
		return listeners;
	};

	EventListener.name = "EventListener";

	namespace.EventListener = EventListener;

	/**
	 * Wraps a function to use it as a listener
	 * 
	 * @class FunctionListener
	 * @constructor
	 * @param {Function} callback function to invoke
	 */
	function FunctionListener(callback) {
		this.callback = callback;
	}
	/**
	 * Invokes callback function
	 * @method run
	 */
	FunctionListener.prototype.run = function(args) {
		this.callback(args[0]);
	};

	/**
	 * Wraps an object and the callback name
	 * 
	 * @class ObjectListener
	 * @constructor
	 * @param {String} callbackName name of the function to call
	 * @param {Object} object object in which to invoke the callback
	 */
	function ObjectListener(callbackName, object) {
		this.callbackName = callbackName;
		this.object = object;
	}
	/**
	 * Invokes callback function on object
	 * @method run
	 */
	ObjectListener.prototype.run = function(args) {
		this.object[this.callbackName](args[0]);
	};

})(window);