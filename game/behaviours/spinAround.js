M.registerBehaviour("spinAround", function(e, a, v) {

	var spinAroundSpeed = a.get("spinAroundSpeed");

	v.eachValue(function(view) {
		view.offsetRotation(spinAroundSpeed);
	});

});