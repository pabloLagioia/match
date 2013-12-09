(function(namespace) {

	function ScrollingObject(object, speedX, speedY, directionX, directionY) {
		this.startX = object.getX();
		this.startY = object.getY();
		this.speedX = speedX;
		this.speedY = speedY;
		this.directionX = directionX;
		this.directionY = directionY;
		this.object = object;
	}

	ScrollingObject.prototype.onLoop = function() {
		this.object.offset(this.directionX * this.speedX, this.directionY * this.speedY);
		var c = M.camera,
			l = this.object.ownerLayer;
		if ( !this.object.isIn(c.getLeftFromLayer(l), c.getTopFromLayer(l), c.getRightFromLayer(l), c.getBottomFromLayer(l)) ) {
			this.object.setLocation(this.startX, this.startY);
		}
		return true;
	};

	namespace.ScrollingObject = ScrollingObject;

})(M.game || (M.game = {}));