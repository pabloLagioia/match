M.registerBehaviour("stickToCanvas", function(e, a, v, p) {
	
	var viewportWidth = p.m.renderer.getWidth(),
		viewportHeight = p.m.renderer.getHeight();
	
	v.eachValue(function(view) {
		if ( view.getLeft() < 0 ) {
			view.setLeft(0);
		}		
		if ( view.getRight() > viewportWidth ) {
			view.setRight(viewportWidth);
		}
		if ( view.getTop() < 0 ) {
			view.setTop(0);
		}		
		if ( view.getBottom() > viewportHeight ) {
			view.setBottom(viewportHeight);
		}
	});
	
});