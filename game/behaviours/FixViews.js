(function (M) {

	M.registerBehaviour("fixViews", function(entity, attributes, views) {
		
		// if ( attributes.get("attributeChanged") ) {
		
			var i = 0,
				values = views._values,
				l = values.length,
				currentView,
				location = attributes.get("location"),
				rotation = attributes.get("rotation");

			for ( ; i < l; i++ ) {
			
				currentView = values[i];
				
				if ( currentView._initialLocation == undefined ) {
					currentView._initialLocation = {
						x: currentView.getX(),
						y: currentView.getY()
					}
				}
				
				if ( currentView._initialRotation == undefined ) {
					currentView._initialRotation = currentView.getRotation();
				}
				
				currentView.setX(location.x + currentView._initialLocation.x);
				currentView.setY(location.y + currentView._initialLocation.y);
				currentView.setRotation(rotation + currentView._initialRotation);
				
			}
		
		// M.renderer.camera.centerAtRenderizable(views.get("base"));
		
		// }
	
	});

})(M);