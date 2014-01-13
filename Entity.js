(function (namespace, SimpleMap) {

	function StoreAs(name, attributes) {
		this.name = name;
		this.attributes = attributes;
	}
	StoreAs.prototype.as = function(actualName) {
		var value = M.game.attributes[actualName];
		if ( typeof value == "function" ) {
			value = new value;
		}
		this.attributes.set(this.name, actualName);
		return value;
	}
	
	function ShowsAs(name, views) {
		this.name = name;
		this.views = views;
	}
	ShowsAs.prototype.as = function(renderizableName) {
		var value = M.renderizables[renderizableName.charAt(0).toUpperCase() + renderizableName.substr(1)];
		if ( typeof value == "function" ) {
			value = new value;
		}
		this.views.set(this.name, value);
		return value;
	};

	function Entity() {
		this.attributes = new EventSimpleMap();
		this.behaviours = new SimpleMap();
		this.views = new SimpleMap();
	}

	Entity.prototype.onLoop = function(p) {
		var i = 0, a = this.attributes, views = this.views, v = this.behaviours._values, l = v.length;
		for ( ; i < l; i++ ) {
			v[i](this, a, views, p);
		}
	};
	
	Entity.prototype.getAttribute = function(name) {
		return this.attributes.get(name);
	};

	Entity.prototype.attribute = Entity.prototype.getAttribute;
	
	Entity.prototype.getBehaviour = function(name) {
		return this.behaviours.get(name);
	};

	Entity.prototype.behaviour = Entity.prototype.getBehaviour;
	
	Entity.prototype.getView = function(name) {
		return this.views.get(name);
	};

	Entity.prototype.view = Entity.prototype.getView;
	
	Entity.prototype.has = function(name, value) {
		if ( value == undefined ) {
			value = M.game.attributes[name];
			if ( typeof value == "function" ) {
				value = new value;
			}
			if ( value == undefined ) {
				return new StoreAs(name, this.attributes);
			}
		}
		this.attributes.set(name, value);
		return value;
	};
	
	Entity.prototype.does = function(name, value) {
		if ( value == undefined ) {
			value = M.game.behaviours[name];
		}
		if ( value == undefined ) {
			M.logger.error("Cannot add undefined behaviour " + name + " to entity");
		} else {
			this.behaviours.set(name, value);
		}
	};

	Entity.prototype.shows = function(name, value) {
		if ( value == undefined ) {
			return new ShowsAs(name, this.views);
		} else {
			this.views.set(name, value);
		}
	};

	namespace.Entity = Entity;

})(M, SimpleMap);