(function (M) {

	M.registerBehaviour("collide", function(entity, attributes) {
	
		var location = attributes.get("location"),
			rotation = attributes.get("rotation"),
			otherObjects = M._gameObjects,
			i = 0,
			l = otherObjects.length,
			current,
			collisionGroup = attributes.get("collisionGroup"),
			collisionHandler = M.collisions.Square;
		
		for ( ; i < l; i++ ) {
		
			current = otherObjects[i];
			
			if ( current != entity && current.attribute("collisionGroup") == collisionGroup ) {

				for ( var view = 0; view < current.views._values.length; view++ ) {
					for ( var entityView = 0; entityView < entity.views._values.length; entityView++ ) {
						
						if ( collisionHandler.haveCollided(entity.views._values[entityView], current.views._values[view]) ) {

							var location = entity.attribute("location");
							
							location.set(location.prevX, location.prevY);

							return;
						
						}
						
					}
					
				}
			
				
			}
		}
		
		// attributes.push("collided", null);
		
	});

})(M);