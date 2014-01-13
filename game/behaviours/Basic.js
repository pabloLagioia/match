//Common attributes
M.registerAttribute("scaleData", {
	value: 1, direction: 1, speed: 0.025, max: 3, min: 1
});

M.registerAttribute("spinAroundSpeed", 0.01);

//Common behaviours
M.registerBehaviour("spinAround", function(e, a, v) {

	var spinAroundSpeed = a.get("spinAroundSpeed");

	v.eachValue(function(view) {
		view.offsetRotation(spinAroundSpeed);
	});

});

M.registerBehaviour("scaleUpAndDownUsingScaleData", function(e, a, v) {

	var scale = a.get("scaleData")
		newScale = scale.direction * scale.speed;

	scale.value = scale.value += newScale;

	if ( scale.value < scale.min || scale.value > scale.max ) {
		scale.direction *= -1;
	}
	
	v.eachValue(function(view) {
		view.offsetScale(newScale, newScale);
	});

});

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