(function (M) {

	function Vector2d(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}
	Vector2d.prototype.offset = function(x, y) {
		this.x += x;
		this.y += y;
		return this;
	};
	Vector2d.prototype.set = function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	};
	Vector2d.prototype.reset = function() {
		return this.set(0, 0);
	};
	Vector2d.prototype.setX = function(x) {
		this.x = x;
		return this;
	};
	Vector2d.prototype.setY = function(x) {
		this.y = y;
		return this;
	};
	Vector2d.prototype.rotate = function(rotation) {
		var rotated = M.math2d.getRotatedVertex(this, rotation);
		this.x = rotated.x;
		this.y = rotated.y;
		return this;
	};

	M.registerAttribute("location", Vector2d);
	M.registerAttribute("direction", Vector2d);

})(M);