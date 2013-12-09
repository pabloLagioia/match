/**
 * @module Match
 */
(function( namespace ) {

	/**
	 * Provides utility methods for creating strings from RGB and RGBA colors
	 * and converting RGB to HEX
	 * @class Color
	 * @static
	 * @constructor
	 */
	function Color() {
	}
	/**
	 * Returns a String representing the specified rgb color
	 * @method rgb
	 * @param {byte} r
	 * @param {byte} g
	 * @param {byte} b
	 * @return {String}
	 */
	Color.prototype.rgb = function(r, g, b) {
		return "rgb(" + [r, g, b].join(",") + ")";
	};
	/**
	 * Returns a String representing the specified rgba color
	 * @method rgba
	 * @param {byte} r
	 * @param {byte} g
	 * @param {byte} b
	 * @param {byte} a
	 * @return {String}
	 */
	Color.prototype.rgba = function(r, g, b, a) {
		return "rgba(" + [r, g, b, a].join(",") + ")";
	};
	/**
	 * Converts an rgb color to hexa
	 * @method rgbToHex
	 * @param {byte} r
	 * @param {byte} g
	 * @param {byte} b
	 * @return {String}
	 */
	Color.prototype.rgbToHex = function(r, g, b) {
		return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	};
	/**
	 * Converts a number from 0 to 255 to hexa
	 * @method componentToHex
	 * @param {byte} c
	 * @return {String}
	 */
	Color.prototype.componentToHex = function(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	};
	/**
	 * Converts an hexa to rgb
	 * @method hexToRgb
	 * @param {String} hex
	 * @return {String}
	 */
	Color.prototype.hexToRgb = function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return this.rgb(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16));
	};
    /**
	 * Returns a transparent color
	 * @method alpha
	 * @return {String}
	 */
	Color.prototype.alpha = function() {
		return this.rgba(0, 0, 0, 0);
	};
	/**
	 * Returns a random rgb color
	 * @method random
	 * @return {String}
	 */
	Color.prototype.random = function() {
		var math = window.Math;
		return this.rgb(math.round(math.random() * 255), math.round(math.random() * 255), math.round(math.random() * 255));
	};
	/**
	 * Returns an object with the attributes r, g, b from the given argument
	 * @method random
	 * @param {String} rgbString a string containing rgb colors
	 * @return {String}
		 * @example 
				var orangeColorObject = M.color.rgbStringToObject("rgb(255, 200, 0)");
		 */
	Color.prototype.rgbStringToObject = function(rgbString) {

		var obj = new Object();

		if ( rgbString ) {
			var regexResult = rgbString.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
			if ( regexResult ) {
				obj.r = parseInt(regexResult[1]);
				obj.g = parseInt(regexResult[2]);
				obj.b = parseInt(regexResult[3]);
			}
		}

		return obj;

	};

	namespace.color = new Color();

})( window.Match );