M.registerBehaviour("bounceOnCollision", function(e, attributes, v, p) {
	
  // This inverts direction
  var direction = attributes.get("direction");
  var manifold = attributes.get("manifold");
  
  if (direction && manifold) {
    direction.set(-direction.x, -direction.y);
    attributes.set("isAccelerating", false);
    attributes.set("isDecelerating", true);
  }

});