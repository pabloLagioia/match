(function (namespace, SimpleMap) {

	function Entity() {
		this.attributes = new SimpleMap();
		this.behaviours = new SimpleMap();
		this.views = new SimpleMap();
	}

	Entity.prototype.onLoop = function(p) {
		var i = 0, a = this.attributes, views = this.views, v = this.behaviours._values, l = v.length;
		for ( ; i < l; i++ ) {
			v[i](this, a, views, p);
		}
	};
	Entity.prototype.has = function(name, value) {
		this.attributes.push(name, value);
	};
	Entity.prototype.can = function(name, value) {
		this.behaviours.push(name, value);
	};
	Entity.prototype.does = Entity.prototype.can;
	Entity.prototype.shows = function(name, value) {
		this.views.push(name, value);
	};

	namespace.Entity = Entity;

})(M, SimpleMap);