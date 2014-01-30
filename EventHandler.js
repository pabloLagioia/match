(function (namespace) {

	function EventHandler() {
		this._eventListeners = {};	
	}

	EventHandler.prototype.addEventListener = function(name, callback) {
		if ( !this._eventListeners[name] ) {
			this._eventListeners[name] = [];
		}
		this._eventListeners[name].push(callback);
	};
	EventHandler.prototype.raiseEvent = function(name, data) {
		var eventListeners = this._eventListeners[name];
		if ( eventListeners ) {
			for ( var i = 0, l = eventListeners.length; i < l; i++ ) {
				eventListeners[i](data);
			}
		}
	};
	EventHandler.prototype.removeEventListener = function(name, callback) {
		if ( this._eventListeners[name] ) {
			var eventListeners = this._eventListeners[name];
			eventListeners.splice(eventListeners.indexOf(callback), 1);
		}
	};
	EventHandler.prototype.removeAllListeners = function(name) {
		this._eventListeners = {};
	};
	EventHandler.name = "EventHandler";

	EventHandler.name = "EventHandler";

	namespace.EventHandler = EventHandler;

})(window);