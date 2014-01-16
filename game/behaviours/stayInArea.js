M.registerBehaviour("stayInArea", function(e, a, v, p) {
	
	var area = a.get("areaToStayIn");
	
	v.eachValue(function(view) {
		if ( view.getLeft() < area.left ) {
			view.setLeft(area.left);
		}		
		if ( view.getRight() > area.right ) {
			view.setRight(area.right);
		}
		if ( view.getTop() < area.top ) {
			view.setTop(area.top);
		}		
		if ( view.getBottom() > area.bottom ) {
			view.setBottom(area.bottom);
		}
	});
	
});