/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Shape) {

	/**
	 * @class Rectangle
	 * @constructor
	 * @extends renderers.Shape
	 * @param {Object} [properties] properties to construct this object
	 */
	function Rectangle( properties ) {

		this.extendsShape();

		this.TYPE = M.renderizables.TYPES.RECTANGLE;

		this.set( properties );

	}
	
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
  Rectangle.prototype.toString = function() {
    return "Rectangle";
  };

  Rectangle.name = "Rectangle";

	M.extend(Rectangle, Shape);

	namespace.Rectangle = Rectangle;

})(Match.renderizables, Match, Match.renderizables.Shape);