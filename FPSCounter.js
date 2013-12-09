/**
 * @module Match
 */
(function(M) {

	/**
	 * Counts the amount of frames per second that Match takes to loop through the scenes
	 * @class FpsCounter
	 * @static
	 * @constructor
	 */
	function FpsCounter() {

		/**
		 * Last time used to measeure the fps
		 * @property lastTime
		 * @private
		 * @type long
		 */
		this.lastTime = new Date().getTime();
		/**
		 * Amount of fps counted up to a certain moment
		 * @property _currentFps
		 * @private
		 * @type int
		 */
		this._currentFps = 0;
		/**
		 * Frames per second
		 * @property fps
		 * @readOnly
		 * @type int
		 */
		this.fps = "";
		/**
		 * Elapsed time since starting counting fps
		 * @property gameTime
		 * @readOnly
		 * @type int
		 */
		this.gameTime = 1;
		/**
		 * Current time in milliseconds
		 * @property timeInMillis
		 * @readOnly
		 * @type int
		 */
		this.timeInMillis = 0;
		/**
		 * Total fps counted
		 * @property totalFps
		 * @readOnly
		 * @type int
		 */
		this.totalFps = 0;

	}
	/**
	 * Resets the fps count
	 * @method reset
	 */
	FpsCounter.prototype.reset = function() {
		this.fps = "";
		this.totalFps = 0;
		this._currentFps = 0;
		this.timeInMillis = 0;
		this.gameTime = 1;
	};
	/**
	 * Counts the fps. If elapsed time since last call is greater than 1000ms then counts
	 * @method count
	 */
	FpsCounter.prototype.count = function() {

		this.timeInMillis = new Date().getTime();

		if ( this.timeInMillis - this.lastTime >= 1000 ) {

			this.lastTime = this.timeInMillis;
			this.fps = this._currentFps;
			this.gameTime++;
			this.totalFps += this.fps;
			this._currentFps = 0;

		} else {

			this._currentFps++;

		}

	};
	/**
	 * Returns the average fps since using the total fps counted so far
	 * @method getAverageFps
	 * @return {int}
	 */
	FpsCounter.prototype.getAverageFps = function() {
		if ( this.totalFps == 0 ) return 60;
		return Math.floor(this.totalFps / this.gameTime);
	};

	M.FpsCounter = new FpsCounter();

})(window.Match);