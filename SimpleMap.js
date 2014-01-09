(function (namespace) {

	/**
	 * Simple implementation of a map that consists of two arrays, one is used as an
	 * index of keys and the other is used to store the items.
	 * This way we take advantage of javascript native object key-value
	 * and the speed of iterating a simple array.
	 *
	 * You can use the build-in method eachValue to quickly iterate through all values
	 * of the map or just use a traditional for-loop on attribute _values. Please do not
	 * modify _values array, use the map methods to do it.
	 *
	 * @class SimpleMap
	 * @constructor
	 */
	function SimpleMap() {
		this._keys = {};
		this._values = [];
		this.length = 0;
	}
	/**
	 * Pushes an item into the map
	 * @method push
	 * @param {Object} key object representing unique id
	 * @param {Object} value value to add
	 */
	SimpleMap.prototype.set = function(key, value) {

		var existingIndex = this._keys[key];

		if ( existingIndex ) {
			this._values[existingIndex] = value;
		} else {
			var valueIndex = this._values.push(value) - 1;
			this._keys[key] = valueIndex;
		}

		this.length++;

	};
	SimpleMap.prototype.push = SimpleMap.prototype.set;
	/**
	 * Gets the item that matches the given key
	 * @method get
	 * @param {Object} key object representing unique id
	 * @return {Object}
	 */
	SimpleMap.prototype.get = function(key) {
		return this._values[this._keys[key]];
	};
	/**
	 * Removes the item by the given key
	 * @method remove
	 * @param {Object} key object representing unique id
	 */
	SimpleMap.prototype.remove = function(key) {
		var index = this._keys[key];
		this._values.splice(index, 1);
		delete this._keys[key];
		this.length--;
	};
	/**
	 * Iterates through all values and invokes a callback
	 * @method eachValue
	 * @param {Function} callback
	 */
	SimpleMap.prototype.eachValue = function(callback) {
		var i = 0,
			l = this._values.length,
			v = this._values;
		for ( ; i < l; i++ ) {
			callback(v[i]);
		}
	};
	/**
	 * Iterates through all keys and invokes a callback
	 * @method eachKey
	 * @param {Function} callback
	 */
	SimpleMap.prototype.eachKey = function(callback) {
		var i = 0,
			l = this._values.length;
		for ( ; i < l; i++ ) {
			callback(this._keys[i]);
		}
	};
	/**
	 * Iterates through all values and invokes a callback passing key and value as arguments respectively
	 * @method each
	 * @param {Function} callback
	 */
	SimpleMap.prototype.each = function(callback) {
		var i = 0,
			l = this._values.length;
		for ( ; i < l; i++ ) {
			callback(this._keys[i], this._values[i]);
		}
	};

	namespace.SimpleMap = SimpleMap;

})(window);

var m = new SimpleMap
m.push("pedo", {a: 100})