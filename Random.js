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
	 * @example "M.random.rgb(100,100,30)"
	 */
	Random.prototype.color = function() {
		return M.color.random();
	};
	/**
	 * Returns a 2d point from an area
	 *
	 * @method area
	 * @return {Object}
	 * @example "M.random.area(0, 0, 100, 10)"
	 */
	Random.prototype.area = function(minX, minY, maxX, maxY) {
		return {
			x: M.random.integer(minX, maxX),
			y: M.random.integer(minY, maxY)
		}
	};
  /**
	 * Returns a random string given a length
	 *
	 * @method string
	 * @return {String}
	 * @example "M.random.string(8)"
	 */
  Random.prototype.string = function(length) {
    length = length || 16;
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  };

	M.random = new Random();

})( window.Match );