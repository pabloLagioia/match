(function(namespace) {

	/**
	 * Square collision detection
	 * Uses the max size of the object to generate a square centered at the center
	 * of the object
	 */
	function Square() {
	}

	Square.prototype = {

		haveCollided: function(collider, collidable) {

			var sizeThis = 0, sizeObj = 0;

			if ( collider._halfWidth > collider._halfHeight ) {
				sizeThis = collider._halfWidth;
			} else {
				sizeThis = collider._halfHeight;
			}

			if ( collidable._halfWidth > collidable._halfHeight ) {
				sizeObj = collidable._halfWidth;
			} else {
				sizeObj = collidable._halfHeight;
			}

			if ( collider._y + sizeThis < collidable._y - sizeObj ) return false;
			if ( collider._y - sizeThis > collidable._y + sizeObj ) return false;
			if ( collider._x + sizeThis < collidable._x - sizeObj ) return false;
			if ( collider._x - sizeThis > collidable._x + sizeObj ) return false;

			return true;

		}

	};

	namespace.Square = new Square();

})(window.Match.collisions || ( window.Match.collisions = {} ));