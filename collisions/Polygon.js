(function(namespace, math2d) {

	/**
	 * Square with ray casting collision detection
	 * Once the object is inside the square ray casting is applied for 
	 * more accurate detection on the inner rectangular object.
	 * This is the most accurate detection method but also the most
	 * processing time consuming
	 */
	function Polygon() {
		this.math2d = math2d;
	}

	Polygon.prototype = {

		getCollisionArea: function(renderizable) {

			var vertices = [],
				halfWidth = renderizable.getWidth() / 2,
                halfHeight = renderizable.getHeight() / 2;

			vertices.push({ x: -halfWidth, y: -halfHeight });
			vertices.push({ x: halfWidth, y: -halfHeight });
			vertices.push({ x: halfWidth, y: halfHeight });
			vertices.push({ x: -halfWidth, y: halfHeight });
            
			this.rotate(vertices, renderizable._rotation);
            
            this.translate(vertices, renderizable._x, renderizable._y);

			return vertices;

		},

		translate: function(vertices, x, y) {
			for ( var i = 0; i < vertices.length; i++ ) {
				vertices[i].x += x;
				vertices[i].y += y;
			}
		},

		rotate: function(vertices, angle) {
			if ( ! angle ) return;
			for ( var i = 0; i < vertices.length; i++ ) {
				vertices[i] = this.math2d.getRotatedVertex(vertices[i], angle);
			}
		},        

		haveCollided: function(collider, collidable) {

			var collidableVertices = this.getCollisionArea(collidable),
				colliderVertices =  this.getCollisionArea(collider),
				i = 0;

			for ( ; i < colliderVertices.length; i++ ) {
				if ( this.pointInPolygon( colliderVertices[i].x, colliderVertices[i].y, collidableVertices ) ) return true;
				if ( this.pointInPolygon( collidableVertices[i].x, collidableVertices[i].y, colliderVertices ) ) return true;
			}

			return false;

		},

		pointInPolygon: function(x, y, vertices) {

			var i, j, c = false, nvert = vertices.length, vi, vj;

			for ( i = 0, j = nvert-1; i < nvert; j = i++ ) {
			
				vi = vertices[i];
				vj = vertices[j];
			
				if ( ( ( vi.y > y ) != ( vj.y > y ) ) && ( x < ( vj.x - vi.x ) * ( y - vi.y ) / ( vj.y - vi.y ) + vi.x ) ) {
					c = !c;
				}

			}

			return c;

		}

	};

	namespace.Polygon = new Polygon();
	
})(window.Match.collisions || ( window.Match.collisions = {} ), window.Match.math2d );