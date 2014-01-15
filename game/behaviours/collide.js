M.registerBehaviour("collide", function(entity, attributes) {

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

						location.set(location.prevX, location.prevY);

						entity.attributes.set("collider", current);
						
						document.getElementById("info").innerHTML = "collided";

						return;
					
					}
					
				}
				
			}
		
			
		}
	}
	
	attributes.set("collider", false);
	
	document.getElementById("info").innerHTML = "";
	
});