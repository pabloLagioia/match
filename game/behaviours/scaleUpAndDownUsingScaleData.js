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