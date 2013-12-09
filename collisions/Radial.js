(function(namespace, math2d) {

	/**
	 * Radial collision detection
	 * Uses the radius provided to compare it to the other objects radius
	 */
	function Radial(radius) {
		this.math2d = math2d;
	}

	Radial.prototype = {

		haveCollided: function(collider, collidable) {

			var colliderradius = ( collider.getWidth() * collider.getHeight() ) / 2,
				collidableradius = ( collidable.getWidth() * collidable.getHeight() ) / 2,
				radius = colliderradius < collidableradius ? colliderradius : collidableradius;

			return this.math2d.getSquareDistance( collider.getLocation(), collidable.getLocation() ) <= radius * radius;

		}

	};

	namespace.Radial = new Radial();
	
})(window.Match.collisions || ( window.Match.collisions = {} ), window.Match.math2d );