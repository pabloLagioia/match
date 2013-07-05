/**
 * @module Match
 */
(function(M) {

	/**
	 * Generates random values
	 *
	 * @class Random
	 * @constructor
	 */
	function Random() {
		this.math = window.Math;
	}
	/**
	 * Returns a random integer
	 *
	 * @method integer
	 * @param {int} from
	 * @param {int} to
	 * @return {int}
	 */
	Random.prototype.integer = function(from, to) {
		return this.math.floor(this.math.random() * ( to - from + 1) ) + from;
	};
	/**
	 * Returns a random decimal
	 * @method decimal
	 * @param {decimal} from
	 * @param {decimal} to
	 * @return {decimal}
	 */
	Random.prototype.decimal = function(from, to) {
		return this.math.random() * ( to - from) + from;
	};
	/**
	 * Returns a random bool
	 *
	 * @method boolean
	 * @return {Boolean}
	 */
	Random.prototype.bool = function() {
		return this.math.random() < 0.5;
	};
	/**
	 * Returns a random sign
	 *
	 * @method sign
	 * @return {int} 1 or -1
	 */
	Random.prototype.sign = function() {
		return this.bool() ? 1 : -1;
	};
	/**
	 * Returns a random boolean from a true chance percentage
	 *
	 * @method booleanFromChance
	 * @param {int} trueChancePercentage 0 to 100
	 * @return {Boolean}
	 */
	Random.prototype.booleanFromChance = function(trueChancePercentage) {
		return this.integer(0, 100) <= trueChancePercentage;
	};
	/**
	 * Returns a random rgb color
	 *
	 * @method color
	 * @return {String}
	 * @example "rgb(100,100,30)"
	 */
	Random.prototype.color = function() {
		return M.color.random();
	};

	M.random = new Random();

})( window.Match );