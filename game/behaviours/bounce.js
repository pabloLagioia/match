M.registerBehaviour("bounce", function(e, a, v, p) {
	
	var direction = a.get("direction"),
		viewportWidth = p.m.renderer.getWidth(),
		viewportHeight = p.m.renderer.getHeight();

	v.eachValue(function (view) {

		view.offset(direction.x, direction.y);
	
		if ( view.getRight() > viewportWidth || view.getLeft() < 0 ) {
			direction.x *= -1;
		}
	
		if ( view.getBottom() > viewportHeight || view.getTop() < 0 ) {
			direction.y *= -1;
		}

	});
		
});