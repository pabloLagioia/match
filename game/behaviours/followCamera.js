M.registerBehaviour("followCamera", function(e, a, v, p) {

	var location = a.get("location");

	p.m.renderer.camera.centerAt(location.x, location.y);

});