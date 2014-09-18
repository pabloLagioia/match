/**
 * @module Match
 */
(function(namespace) {

	/**
	 * Provides methods for common 2d Math operations
	 * 
	 * @class Math2d
	 * @static
	 * @constructor
	 */
	function Math2d() {
		this.math = Math;
	}

	/**
	 * Returns true if value is between a and b or false
	 *
	 * @method valueInBetween
	 * @param {Number} value the value
	 * @param {Number} a  between a
	 * @param {Number} b  and between b
	 * @return {float}
	 */
	Math2d.prototype.valueInBetween = function(value, a, b) {
		return a <= value && value <= b;
	};
	/**
	 * Returns x value matching the corresponding parameters of a circle
	 *
	 * @method getXFromCircle
	 * @param x0 - Center in the x axis
	 * @param r  - Circle radius
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getXFromCircle = function(x0, r, t) {
		return x0 + r * this.math.cos(t);
	};
	/**
	 * Returns y value matching the corresponding parameters of a circle
	 * @method getYFromCircle
	 * @param y0 - Center in the y axis
	 * @param r  - Circle radius
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getYFromCircle = function(y0, r, t) {
		return y0 + r * this.math.sin(t);
	};
	/**
	 * Returns a point containing x and y values matching the corresponding parameters of an elipsis
	 * @method getPointFromCircle
	 * @param x0 - Center in the x axis
	 * @param y0 - Center in the y axis
	 * @param r  - Circle radius
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getPointFromCircle = function( x0, y0, r, t ) {
		return this.getPointFromElipsis( x0, y0, r, r, t );
	};
	/**
	 * Returns a point containing x and y values matching the corresponding parameters of an elipsis
	 * @method getPointFromElipsis
	 * @param x0 - Center in the x axis
	 * @param y0 - Center in the y axis
	 * @param rX - Elipsis radius in x axis
	 * @param rY - Elipsis radius in y axis
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getPointFromElipsis = function( x0, y0, xR, yR, t ) {
		return new Vector2d( this.getXFromCircle( x0, xR, t ), this.getYFromCircle( y0, yR, t ) );
	};
    /**
	 * Returns a 2d vector given 2 vectors
	 * @method getVector2d
	 * @param {Vector2d} vector1
	 * @param {Vector2d} vector2
     * @return {Vector2d}
	 */
	Math2d.prototype.getVector2d = function(vector1, vector2) {
		return new Vector2d( vector2.x - vector1.x, vector2.y - vector1.y );
	};       
	/**
	 * Returns a 2d vector given 2 vectors
	 * @method getVector
	 * @param {Vector2d} vector1
	 * @param {Vector2d} vector2
     * @return {Vector2d}
	 */
	Math2d.prototype.getVector = function(vector1, vector2) {
		return this.getVector2d( vector1, vector2 );
	};
	/**
	 * Returns the vector rotated
	 * @method getRotatedVertex
	 * @param {Vector2d} vertex
	 * @param {float} rotation
	 * @return {Vector2d}
	 */
	Math2d.prototype.getRotatedVertex = function(vertex, rotation) {
		return this.getRotatedVertexCoords(vertex.x, vertex.y, rotation);
	};
	Math2d.prototype.getRotatedVertexCoordsX = function(x, y, rotation) {
		return x * this.math.cos(rotation) - y * this.math.sin(rotation);
	};
	Math2d.prototype.getRotatedVertexCoordsY = function(x, y, rotation) {
		return y * this.math.cos(rotation) + x * this.math.sin(rotation);
	};
	/*
	 * Returns the vector rotated
	 * @method getRotatedVertexCoords
	 * @param {float} x
	 * @param {float} y
	 * @param {float} rotation
	 * @return {Vector2d}
	 */
	Math2d.prototype.getRotatedVertexCoords = function(x, y, rotation) {
		return new Vector2d( this.getRotatedVertexCoordsX(x, y, rotation), this.getRotatedVertexCoordsY(x, y, rotation) );
	};
   /**
	* Returns the magnitude of a vector
	* @method getMagnitude
	* @param {Vector2d} vector
	* @return {float}
	*/
	Math2d.prototype.getMagnitude = function(vector) {
		return this.math.sqrt(vector.x * vector.x + vector.y * vector.y);
	};
   /**
	* Returns the distance between two vectors without calculating squareroot
	* @method getSquareDistance
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getSquareDistance = function(vector1, vector2) {

		var x = vector1.x - vector2.x;
		var y = vector1.y - vector2.y;

		return x*x + y*y;

	};
   /**
	* Returns the angle between two vectors
	* @method getAngleBetweenVectors
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getAngleBetweenVectors = function(vector1, vector2) {

		var m = this.getMagnitude(vector1) * this.getMagnitude(vector2);

		return this.math.acos((vector1.x * vector2.x + vector1.y * vector2.y) / m);

	};
   /**
	* Returns the cos between two vectors
	* Returns the angle between two vectors
	* @method getCosBetweenVectors
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getCosBetweenVectors = function(vector1, vector2) {
	
		var m = this.getMagnitude(vector1) * this.getMagnitude(vector2);

		return (vector1.x * vector2.x + vector1.y * vector2.y) / m;

	};
   /**
	* Returns the distance between two vectors
	* @method getDistance
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getDistance = function(vector1, vector2) {
		return this.math.sqrt(this.getSquareDistance(vector1, vector2));
	};
   /**
	* Returns true if the provided vectors have the same direction
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Boolean}
	*/
	Math2d.prototype.haveTheSameDirection = function(vector1, vector2) {

		if ( vector1.x > 0 && vector2.x < 0 ) return false;
		if ( vector1.x < 0 && vector2.x > 0 ) return false;
		if ( vector1.y > 0 && vector2.y < 0 ) return false;
		if ( vector1.y < 0 && vector2.y > 0 ) return false;

		return true;

	};
   /**
	* Returns true if the provided vectors are parallel
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Boolean}
	*/
	Math2d.prototype.areParallelVectors = function(vector1, vector2) {

		vector1 = this.getNormalized( vector1 );
		vector2 = this.getNormalized( vector2 );

		var x = vector1.x / vector2.x,
			y = vector1.y / vector2.y;

		return x >= y - 0.1 && x <= y + 0.1;

	};
   /**
	* Returns the vector normalized
	* @param {Vector2d} vector
	* @return {Vector2d}
	*/
	Math2d.prototype.getNormalized = function(vector) {

		var magnitude = this.getMagnitude(vector);
	
		return new Vector2d( vector.x / magnitude, vector.y / magnitude );
	
	};
   /**
	* Returns the resulting vector of a substraction
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Vector2d}
	*/
	Math2d.prototype.substract = function(vector1, vector2) {
		return new Vector2d( vector1.x - vector2.x, vector1.y - vector2.y );
	};
   /**
	* Returns the resulting vector of a add
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Vector2d}
	*/
	Math2d.prototype.add = function(vector1, vector2) {
		return new Vector2d( vector1.x + vector2.x, vector1.y + vector2.y );
	};
   /**
	* Returns the product from a vector an a number
	* @param {Vector2d} vector
	* @param {float} scalar
	* @return {Vector2d}
	*/
	Math2d.prototype.scalarProduct = function(vector, scalar) {
		return new Vector2d( vector.x * scalar, vector.y * scalar );
	};
   /**
	* Rotates vector1 by rotation to make it closer to vector2 and returns the rotation
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @param {float} rotation the angle to add to the vector
	* @return {float}
	*/
	Math2d.prototype.rotateIfNeeded = function( vector1, vector2, rotation ) {

		if ( ! ( this.areParallelVectors( vector1, vector2 ) && this.haveTheSameDirection( vector1, vector2 ) ) ) {

			var distance = this.getSquareDistance( vector1, vector2 ),
				rotated1 = this.getRotatedVertex( vector1, rotation ),
				distanceAfterRotation = this.getSquareDistance( rotated1, vector2 );

			if ( distanceAfterRotation < distance ) {
				vector1.x = rotated1.x;
				vector1.y = rotated1.y;
				return rotation;
			} else {
				var rotated2 = this.getRotatedVertex( vector1, -rotation );
				vector1.x = rotated2.x;
				vector1.y = rotated2.y;
				return -rotation;
			}

		}

		return 0;

	};

   /**
	* @class Vector2d
	* @constructor
	* @param {float} x
	* @param {float} y
	* @private
	*/
	function Vector2d(x, y) {
		this.x = x || 0;
		this.y = y || 0;
		this.prevX = 0;
		this.prevY = 0;
	}
	Vector2d.prototype.offset = function(x, y) {
		this.set(this.x + x, this.y + y);
		return this;
	};
	Vector2d.prototype.set = function(x, y) {
		this.setX(x);
		this.setY(y);
		return this;
	};
	Vector2d.prototype.reset = function() {
		return this.set(0, 0);
	};
	Vector2d.prototype.setX = function(x) {
		this.prevX = this.x;
		this.x = x;
		return this;
	};
	Vector2d.prototype.setY = function(y) {
		this.prevY = this.y;
		this.y = y;
		return this;
	};
	Vector2d.prototype.rotate = function(rotation) {
		this.setX(instance.getRotatedVertexCoordsX(this.x, this.y, rotation));
		this.setY(instance.getRotatedVertexCoordsY(this.x, this.y, rotation));
		return this;
	};

	M.Vector2d = Vector2d;
	
	var instance = new Math2d();

	namespace.math2d = namespace.Math2d = instance;
	namespace.math2d.Vector2d = Vector2d;
	
})(window.Match);