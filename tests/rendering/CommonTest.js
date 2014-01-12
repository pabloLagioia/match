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
