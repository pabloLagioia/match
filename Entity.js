(function (namespace, SimpleMap, M) {

	function StoreAs(name, attributes) {
		this.name = name;
		this.attributes = attributes;
	}
	StoreAs.prototype.as = function(actualName) {
		var value = M.game.attributes[actualName];
		if ( typeof value == "function" ) {
			value = new value;
		}
		this.attributes.set(this.name, value);
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

	function Entity(name, definition) {
		this.extendsEventHandler();
		
		if (typeof name != "string") {
			definition = name;
			name = undefined;
		}
		
		this.name = name || ("Unnamed Entity" + M._gameObjects.length);
		this.attributes = new SimpleMap();
		this.behaviours = new SimpleMap();
    
    this.customBehaviours = new Object();
    
		this.views = new SimpleMap();
		
		if (definition) {
			
			var self = this;
			
			definition.attributes && definition.attributes.forEach(function(attribute) {
				self.has(attribute);
			});
						
			definition.behaviours && definition.behaviours.forEach(function(behaviour) {
				self.does(behaviour);
			});
						
			// TODO: Define views 
			// definition.views && definition.views.forEach(function(view) {
			// 	self.show(view);
			// });
			
		}
		
	}

	Entity.prototype.onLoop = function(p) {
		var i = 0, a = this.attributes, views = this.views, v = this.behaviours._values, l = v.length;
		for ( ; i < l; i++ ) {
			if (v[i]) {
				v[i](this, a, views, p);
			}
		}
	};
	
	Entity.prototype.getAttribute = function(name) {
		return this.attributes.get(name);
	};
	
	Entity.prototype.hasAttribute = function(name) {
		return !!this.attributes.get(name);	
	};

	Entity.prototype.attribute = function(name, value) {
		if ( arguments.length == 2 ) {
			this.attributes.set(name, value);
		} else {
			return this.attributes.get(name);
		}
	};

	Entity.prototype.behaviour = function(name, value) {
		if ( arguments.length == 2 ) {
			this.behaviours.set(name, value);
		} else {
			return this.behaviours.get(name);
		}
	};
	
	Entity.prototype.hasBehaviour = function(name) {
		return !!this.behaviours.get(name);	
	};
	
	Entity.prototype.getBehaviour = function(name) {
		return this.behaviours.get(name);
	};

	Entity.prototype.behaviour = Entity.prototype.getBehaviour;
	
	Entity.prototype.getView = function(name) {
		return this.views.get(name);
	};

	Entity.prototype.view = Entity.prototype.getView;
	
	Entity.prototype.has = function(name, value) {

		//TODO: this might be a good idea to review. Consider performance costs vs usability, meaning, is this feature really needed? Besides retrocompat
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
	Entity.prototype.hasnt = function(name) {
		return this.attributes.remove(name);
	};
  
	Entity.prototype.does = function(name, value) {
    
    if ( value ) {
      this.registerBehaviour(name, value);
    }
    
		if ( value == undefined ) {
			value = M.game.behaviours[name] || this.customBehaviours[name];
		}
    
		if ( value == undefined ) {
			M.logger.error("Cannot add undefined behaviour " + name + " to entity");
		} else {
			this.behaviours.set(name, value);
		}
    
		return this;
    
	};
  
  Entity.prototype.registerBehaviour = function(name, value) {
    this.customBehaviours[name] = value;
  };
	
	Entity.prototype.do = function(name) {
		var behaviour = this.behaviour.get(name);
		if ( behaviour ) {
			behaviour(this, this.attributes, this.views, M.onLoopProperties)
		}
	};
	
	Entity.prototype.can = function(name) {
		return !!this.behaviours.get(name);
	};
	
	Entity.prototype.doesnt = function(name) {
		return this.behaviours.remove(name);
	};

	Entity.prototype.shows = function(name, value) {
		if ( value == undefined ) {
			return new ShowsAs(name, this.views);
		} else {
			this.views.set(name, value);
		}
	};
	
	Entity.prototype.doesntShow = function(name) {
		return this.views.remove(name);
	};

	Entity.name = "Entity";

	M.extend(Entity, EventHandler);

	namespace.Entity = Entity;

})(M, SimpleMap, M);