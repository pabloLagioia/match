(function(M, namespace) {

	function AllvsAllCollisionHandler( mode ) {

		this.objects = [];

		this.mode = null;

		this.setMode( mode || "Polygon" );

	}

	AllvsAllCollisionHandler.prototype = {

		reset: function() {
			this.objects = [];
		},

		onLoop: function() {

			var i = 0, j = 1;

			while ( i < this.objects.length ) {

				while ( j < this.objects.length ) {
					this.checkCollisions( this.objects[i], this.objects[j] );
					j++;
				}
				i++;
				j = i + 1;

			}

			i = this.objects.length;

			while ( i-- ) {
				if ( ! this.objects[i]._visible ) {
					M.removeIndexFromArray( i, this.objects );
				}
			}

		},

		canCollide: function( collider, collidable ){

			if ( collider.cantCollideType  ) {

				var i = collider.cantCollideType.length;

				while ( i-- ) {
					if ( collidable instanceof collider.cantCollideType[i] ) return false;
				}

			}
		
			if ( collider.cantCollide ) {

				var i = collider.cantCollide.length;

				while ( i-- ) {
					if ( collider.cantCollide[i] == collidable ) return false;
				}

			}

			return true;

		},

		checkCollisions: function(collider, collidable) {

			if ( ! this.canCollide( collider, collidable ) ) return;
			if ( ! this.canCollide( collidable, collider ) ) return;

			if ( this.mode.haveCollided( collider, collidable ) ) {

				if ( collider.onCollision ) {
					collider.onCollision( collidable );
				}
				if ( collidable.onCollision ) {
					collidable.onCollision( collider );
				}

			}

		},

		/**
		 * @param The collision mode from namespace.collisions
		 */
		setMode: function(mode, properties) {

			if ( typeof mode === "string" ) {
				this.mode = M.collisions[mode];
			} else {
				this.mode = mode;
			}

		},

		push: function( object ) {
			this.objects.push( object );
		},

		removeType: function( type ) {

			var i = this.objects.length;

			while ( i-- ) {
				if ( this.objects[i] instanceof type ) {
					this.remove( this.objects[i] );
				}
			}

		}

	};

	namespace.AllvsAllCollisionHandler = AllvsAllCollisionHandler;
	
})(window.Match, window.Match.collisions || ( window.Match.collisions = {} ) );