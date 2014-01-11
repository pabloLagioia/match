(function(M, GameObject) {

	/** 
	 * Polygon
	 * Given an array of vertices [ { x, y },... ] a polygon object is created
	 */
	function Polygon( properties ) {

		GameObject.apply(this, arguments);

		this._fillStyle = "rgb(0,0,0)";
		this._strokeStyle = null;
		this._lineWidth = null;
		this._vertices = [];

		this.set( properties );

	}

	Polygon.prototype = {

		getCenter: function() {

			var cX = 0;
			var cY = 0;
		
			for ( var i = 0; i < this.vertices.length; i++ ) {
				cX += this.vertices[i].x;
				cY += this.vertices[i].y;
			}

			return {x: cX / this.vertices.length, y: cY / this.vertices.length};

		},

		onRender: function(context) {

			var context = p.context;

			context.save();

			if ( this.alpha >= 0 && this.alpha <= 1 ) {

				context.globalAlpha = this.alpha;
			
			}

			context.translate(this._x, this._y);

			if ( this._rotation ) {
				context.rotate(this._rotation);
			}

			if ( this._scale ) {
				context.scale(this._scale.x, this._scale.y);
			}

			context.fillStyle = this.fillStyle;

			context.beginPath();

			var v = this._vertices;
			
			context.moveTo(v[0].x, v[0].y);

			for ( var i = 1; i < v.length; i++ ) {

				context.lineTo(v[i].x, v[i].y);

			}

			if ( this._strokeStyle ) {

				context.strokeStyle = this._strokeStyle;

				if ( this._lineWidth ) {
					context.lineWidth = this._lineWidth;
				}

				context.stroke();

			}

			context.closePath();
			context.fill();

			if ( this._shadow ) {
				context.shadowColor = this._shadow.color;
				context.shadowBlur = this._shadow.blur;
				context.shadowOffsetX = this._shadow.offsetX;
				context.shadowOffsetY = this._shadow.offsetY;
			}

			context.restore();
			
			this._changed = false;

		},
		
		setVertices: function(value) {
			this._vertices = value;
			this._changed = true;
		},
		getVertices: function() {
			return this._vertices;
		},

		setShadow: function(x, y, color, blur) {
			this._shadow = {
				x: x, y: y, color: color || "black", blur: blur || 1
			}
			this._changed = true;
		},

		getShadow: function() {
			return this._shadow;
		}

	};

	Polygon.name = "Polygon";

	M.extend(Polygon, GameObject);

	M.Polygon = Polygon;

})(window.Match, window.Match.GameObject);