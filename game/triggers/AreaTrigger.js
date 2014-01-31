(function (M, SimpleCollisionHandler) {
	
	function AreaTrigger(left, top, width, height) {
		
		this.extendsTrigger();

		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;

		this.entitiesAndCallbacks = [];

	}

	AreaTrigger.prototype.getLeft = function() {
		return this.left;
	};
	AreaTrigger.prototype.getTop = function() {
		return this.top;
	};
	AreaTrigger.prototype.getRight = function() {
		return this.left + this.width;
	};
	AreaTrigger.prototype.getBottom = function() {
		return this.top + this.height;
	};

	AreaTrigger.prototype.update = function() {

		var i = 0,
			l = this.entitiesAndCallbacks.length,
			self = this,
			wrapper;

		for ( i = 0; i < l; i++) {

			wrapper = this.entitiesAndCallbacks[i];

			wrapper.entity.views.eachValue(function (view) {

				if ( SimpleCollisionHandler.haveCollided(view, self) ) {
					wrapper.callback(wrapper.entity, self);
					return;
				}

			});

		}

	};

	AreaTrigger.prototype.onObjectInArea = function(entity, callback) {
		this.entitiesAndCallbacks.push({
			entity: entity,
			callback: callback
		});
	};

	M.extend(AreaTrigger, M.Trigger);

	M.AreaTrigger = AreaTrigger;

})(Match, Match.collisions.Simple);