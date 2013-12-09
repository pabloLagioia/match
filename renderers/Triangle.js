(function(M, Polygon) {

	/** 
	 * Polygon
	 * A triangle is created from three points
	 */
	function Triangle() {
		Polygon.apply(this, arguments);
		this.vertices = [{x: -5, y: 5}, {x: 0, y: -5}, {x: 5, y: 5}];
	}

	Triangle.prototype = {
		setWidth: function( value ) {
			value = value / 2;
			this.vertices[0].x = -value;
			this.vertices[1].x = 0;
			this.vertices[2].x = value;
		},
		setHeight: function( value ) {
			value = value / 2;
			this.vertices[1].y = -value;
			this.vertices[0].y = value;
			this.vertices[2].y = value;
		},
		getWidth: function() {
			return this.vertices[2].x - this.vertices[0].x;
		},
		getHeight: function() {
			return this.vertices[0].y - this.vertices[1].y;
		}
	};

	M.extend( Triangle, Polygon );

})(window.Match, window.Match.Polygon);