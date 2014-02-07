(function (namespace, SimpleMap, EventListener) {
	
	function EventSimpleMap() {
		this.extendsSimpleMap();
		this.onSet = new EventListener();
		this.onRemoved = new EventListener();
	}
	
	EventSimpleMap.prototype.set = function(key, value) {
		this.simpleMapSet(key, value);
		this.onSet.raise(key);
	};
	EventSimpleMap.prototype.remove = function(key) {
		this.simpleMapRemove(key);
		this.onRemoved.raise(key);
	};
	
	Class.extend(EventSimpleMap, SimpleMap);
	
	namespace.EventSimpleMap = EventSimpleMap;
	
})(window, SimpleMap, EventListener);