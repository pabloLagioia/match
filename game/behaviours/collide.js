(function (M) {

	function Manifold(entity, otherEntity, viewFromSelf, viewFromOther, collisionInX, collisionInY) {
		this.entity = entity;
		this.collidedWith = otherEntity;
		this.viewFromSelf = viewFromSelf;
		this.viewFromOther = viewFromOther;
		this.collisionInX = collisionInX;
		this.collisionInY = collisionInY;
	}


	M.registerBehaviour("collide", function(entity, attributes) {

		var location = attributes.get("location"),
			otherObjects = M._gameObjects,
			i = 0,
			l = otherObjects.length,
			otherEntity,
			collisionGroup = attributes.get("collisionGroup"),
			// simpleCollisionHandler = M.collisions.Simple,
			polygonCollisionHandler = M.collisions.Polygon,
			collisionInX = false,
			collisionInY = false,
			viewFromSelf,
			viewFromOther,
			j,
			k,
			currentY,
			prevY;
		
		for ( ; i < l; i++ ) {
		
			otherEntity = otherObjects[i];
			
			if ( otherEntity != entity && otherEntity.attribute("collisionGroup") == collisionGroup ) {

				for ( k = 0; k < otherEntity.views._values.length; k++ ) {

					viewFromOther = otherEntity.views._values[k];

					for ( j = 0; j < entity.views._values.length; j++ ) {
						
						viewFromSelf = entity.views._values[j];

						if ( polygonCollisionHandler.haveCollided(viewFromSelf, viewFromOther) ) {

							currentY = viewFromSelf._y;
							prevY = viewFromSelf._prevY;

							viewFromSelf._y = prevY;


							if ( polygonCollisionHandler.haveCollided(viewFromSelf, viewFromOther) ) {
								collisionInX = true;
							} else {
								collisionInY = true;
							}

							viewFromSelf._y = currentY;

							var manifold = new Manifold(entity, otherEntity, viewFromSelf, viewFromOther, collisionInX, collisionInY);

							attributes.set("manifold", manifold);

							entity.raiseEvent("onCollision", manifold);

							// if ( attributes.get("preventMoveOnCollision") ) {
							// 	location.set(location.prevX, location.prevY);
							// }
							
							return;
						
						}
						
					}
					
				}
			
				
			}
		}
		
		attributes.set("manifold", false);
		
	});

})(Match);
