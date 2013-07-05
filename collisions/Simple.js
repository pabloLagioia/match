(function(namespace) {

	function Simple() {
	}

	Simple.prototype = {
	
		haveCollided: function(collider, collidable) {

			if ( collider.getBottom() < collidable.getTop() ) return false;
			if ( collider.getTop() > collidable.getBottom() ) return false;
			if ( collider.getRight() < collidable.getLeft() ) return false;
			if ( collider.getLeft() > collidable.getRight() ) return false;

			return true;

		}

	};

	namespace.Simple = new Simple();
	
})(window.Match.collisions || ( window.Match.collisions = {} ));