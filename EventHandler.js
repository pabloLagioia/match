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
	EventHandler.prototype.on = function() {
		
		var events = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
			callback = arguments[arguments.length -1 ];

		for ( var i = 0; i < events.length; i++ ) {
			this.addEventListener(events[i], callback);
		}

	};
	EventHandler.prototype.off = function() {

		var events = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
			callback = arguments[arguments.length -1 ];

		for ( var i = 0; i < events.length; i++ ) {
			this.removeEventListener(events[i], callback);
		}

	};
	EventHandler.prototype.raise = function(name, data) {
		var eventListeners = this._eventListeners[name];
		if ( eventListeners ) {
			for ( var i = 0, l = eventListeners.length; i < l; i++ ) {
				eventListeners[i](data);
			}
		}
	};
	EventHandler.prototype.raiseEvent = EventHandler.prototype.raise;
	EventHandler.prototype.removeEventListener = function(name, callback) {
		if ( this._eventListeners[name] ) {
			var eventListeners = this._eventListeners[name];
			eventListeners.splice(eventListeners.indexOf(callback), 1);
		}
	};
	EventHandler.prototype.removeAllListeners = function(name) {
		this._eventListeners = {};
	};
	EventHandler.prototype.listensTo = function(name) {
		return this._eventListeners[name];
	};

	EventHandler.name = "EventHandler";

	namespace.EventHandler = EventHandler;

})(window);