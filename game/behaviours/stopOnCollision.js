M.registerBehaviour("stopOnCollision", function(e, attributes, v, p) {
	
  // This inverts direction
  var manifold = attributes.get("manifold");
  
  if (manifold) {
  
    var location = attributes.get("location");
  
		location.set(location.prevX, location.prevY);
    
  }

});