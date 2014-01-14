(function (M) {

	M.registerBehaviour("fixViews", function(entity, attributes, views) {
		
		// if ( attributes.get("attributeChanged") ) {
		
			var i = 0,
				values = views._values,
				l = values.length,
				view,
				location = attributes.get("location"),
				rotation = attributes.get("rotation");

			for ( ; i < l; i++ ) {
			
				view = values[i];
				
				if ( view._initialLocation == undefined ) {
					view._initialLocation = {
						x: view.getX(),
						y: view.getY()
					}
				}
				if ( view._initialRotation == undefined ) {
					view._initialRotation = view._rotation;
				}
				
				if ( rotation != 0 ) {

					// if ( view._x != 0 && view._y != 0 ) {
					// 	var rotatedX = M.math2d.getRotatedVertexCoordsX(view._initialLocation.x, view._initialLocation.y, rotation),
					// 		rotatedY = M.math2d.getRotatedVertexCoordsY(view._initialLocation.x, view._initialLocation.y, rotation);

					// 	view.setLocation(rotatedX + location.x, rotatedY + location.y);
					// }
					
					// view.setRotation(view._initialRotation + rotation);
					
				} else {
					view.setX(location.x + view._initialLocation.x);
					view.setY(location.y + view._initialLocation.y);
				}
				
			}
		
		// M.renderer.camera.centerAtRenderizable(views.get("base"));
		
		// }
	
	}, "location, rotation", "fixes views to entity coordinates and rotation");

})(M);