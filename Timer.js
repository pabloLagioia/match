/**
 * @module Match
 */
(function(M) {

	/**
	 * Executes a callback once per interval
	 *
	 * @class Timer
	 * @constructor
	 * @extends GameObject
	 * @param {int} interval time in milliseconds before calling the callback
	 * @param {Function} callback function to be called
	 * @param {Object} [owner] object to apply the callback to
	 */
	function Timer( interval, callback, owner ) {
		/**
		 * Interval time in milliseconds before calling the callback
		 * @property interval
		 * @type int
		 */
		/**
		 * Time in milliseconds when the last tick took place
		 * @private
		 * @property _lastTime
		 * @type int
		 */
		/**
		 * Object to apply the callback to
		 * @optional
		 * @property owner
		 * @type Object
		 */
		/**
		 * Function that will be called
		 * @property callback
		 * @type Function
		 */
		
		this.interval = interval;
		this._lastTime = M.getTime();
		if ( owner ) {
			this.owner = owner;
			this.callback = callback;
		} else {
			this.tick = callback;
		}
		this.enabled = true;
	}
	
	
	/**
	 * Checks if the interval has been reached and calls the callback
	 * @method onLoop
	 */
	Timer.prototype.onLoop = function(p) {

		if ( this.enabled && M.elapsedTimeFrom( this._lastTime, this.interval ) ) {

			this.tick();
			this._lastTime = M.getTime();

		}

	};
	/**
	 * Calls the callback
	 * @method tick
	 */
	Timer.prototype.tick = function() {
		this.callback.call(this.owner);
	};
	
	M.Timer = Timer;

})(window.Match);