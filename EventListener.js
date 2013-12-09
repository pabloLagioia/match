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
			listener = listener.bind(owner);
		}
		this.listeners.push(listener);
	};
	/**
	 * @method raise
	 */
	EventListener.prototype.raise = function() {
	
		var i = 0,
			l = this.listeners.length;
		
		if ( l == 0 ) return;
		
		for ( var i = 0; i < l; i++ ) {
			this.listeners[i](arguments);
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
		var listeners = this.listeners;
		this.listeners = new Array();
		return listeners;
	};

	namespace.EventListener = EventListener;

})(window);