M.registerBehaviour("collide", function(entity, attributes) {

	var Vector2d = M.math2d.Vector2d;

	function getVelocityManifold(entityA, entityB) {
	
		var velocityA = getSpeedVector(entityA),
			velocityB = getSpeedVector(entityB);

		return new Vector2d(velocityA.x - velocityB.x, velocityA.y - velocityB.y); 

	}

	function getSpeedVector(entity) {
		
		var speed = entity.getAttribute("speed"),
			direction = entity.getAttribute("direction");
		
		return new Vector2d(speed * direction.x, speed * direction.y);

	}


	var location = attributes.get("location"),
		otherObjects = M._gameObjects,
		i = 0,
		l = otherObjects.length,
		current,
		collisionGroup = attributes.get("collisionGroup"),
		collisionHandler = M.collisions.Polygon;
	
	for ( ; i < l; i++ ) {
	
		current = otherObjects[i];
		
		if ( current != entity && current.attribute("collisionGroup") == collisionGroup ) {

			for ( var view = 0; view < current.views._values.length; view++ ) {
				for ( var entityView = 0; entityView < entity.views._values.length; entityView++ ) {
					
					if ( collisionHandler.haveCollided(entity.views._values[entityView], current.views._values[view]) ) {

						attributes.set("manifold", {
							collidedWith: current,
							viewFromOther: current.views._values[view],
							viewFromSelf: entity.views._values[entityView]/*,
							velocityDelta: getVelocityManifold(entity, current)*/
						});
						
						return;
					
					}
					
				}
				
			}
		
			
		}
	}
	
	attributes.set("manifold", false);
	
});