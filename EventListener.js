/**
 * @module Match
 */
(function(M) {

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

	 */
	function EventListener() {
		this.listeners = new Array();
	}

	EventListener.prototype.addEventListener = function(listener) {
		this.listeners.push(listener);
	};

	EventListener.prototype.raise = function() {
		for ( var i = 0, l = this.listeners.length; i < l; i++ ) {
			this.listeners[i](arguments);
		}
	};

	EventListener.prototype.removeEventListener = function(listener) {
		var l = this.listeners.indexOf(listener);
		if ( l > -1 ) {
			this.listeners.splice(l, 1);
		}
	};

	M.EventListener = EventListener;

})(window.Match);