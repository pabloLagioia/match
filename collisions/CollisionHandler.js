(function(M, namespace) {

	function CollisionHandler(mode) {

		this.colliders = [];

		this.collidables = [];

		this.setMode( mode || "Polygon" );

		this.colliderCallback = "onCollision";

		this.collidableCallback = "onCollision";

	}

	CollisionHandler.prototype = {

		onLoop: function() {

			var i = this.colliders.length;

			while ( i-- ) {
				this.checkCollisions( this.colliders[i], this.collidables );
			}

		},

		checkCollisions: function(collider, list) {

			if ( ! collider ) return;

			var i = list.length, collidable = null;

			while ( i-- ) {

				collidable = list[i];

				if ( ! collidable ) return;

				if ( collidable instanceof Array ) {

					this.checkCollisions( collider, collidable );

				} else if ( this.mode.haveCollided( collider, collidable ) ) {

					if ( collider[this.colliderCallback] ) {
						collider[this.colliderCallback]( collidable );
					}
					if ( collidable[this.collidableCallback] ) {
						collidable[this.collidableCallback]( collider );
					}

				}

			}

		},

		/**
		 * @param The collision mode from namespace.collisions
		 */
		setMode: function(mode) {

			if ( typeof mode === "string" ) {
				this.mode = M.collisions[mode];
			} else {
				this.mode = mode;
			}

		}

	};

	namespace.CollisionHandler = CollisionHandler;
	
})(window.Match, window.Match.collisions || ( window.Match.collisions = {} ) );