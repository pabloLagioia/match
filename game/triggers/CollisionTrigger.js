(function (M, SimpleCollisionHandler) {
	
	function CollisionTrigger() {
		
		this.extendsTrigger();

		this.entitiesAndCallbacks = [];

	}

	CollisionTrigger.prototype.update = function() {

		var i = 0,
			l = this.entitiesAndCallbacks.length,
			wrapper,
			manifold;

		for ( i = 0; i < l; i++) {

			wrapper = this.entitiesAndCallbacks[i];

			manifold = wrapper.entity.attribute("manifold");

			if ( manifold ) {

				wrapper.callback(manifold, this);

			}

		}

	};

	CollisionTrigger.prototype.onCollision = function (entity, callback) {
		this.entitiesAndCallbacks.push({
			entity: entity,
			callback: callback
		});
	};

	M.extend(CollisionTrigger, M.Trigger);

	M.CollisionTrigger = CollisionTrigger;

})(Match);