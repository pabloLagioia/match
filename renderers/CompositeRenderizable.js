(function(M) {
	
	function CompositeRenderizable() {
		this.objects = {};
		this._visible = true;
		this.onChangeEvent = {};
	}
	
	CompositeRenderizable.prototype._zIndex = 0;
	
	CompositeRenderizable.prototype.addObject = function(key, obj) {
		this.objects[key] = obj;
		obj.onChangeEvent = this.onChangeEvent;
	};
	
	CompositeRenderizable.prototype.removeObject = function(key) {
		delete this.objects[key];
	};
	
	CompositeRenderizable.prototype.onLoop = function(p) {		
		if ( this.onUpdate ) this.onUpdate(p);
		for(var i in this.objects) {
			this.objects[i].onLoop(p);
		}
	};
	
	CompositeRenderizable.prototype.onRender = function(c, cnv, cameraX0, cameraY0, cameraX1, cameraY1) {
		var i, o;
		for(i in this.objects) {
			o = this.objects[i];
			if ( o.isVisible( cameraX0, cameraY0, cameraX1, cameraY1 ) ) {
				o.onRender(c, cnv, cameraX0, cameraY0);
			}
		}
	};
	
	CompositeRenderizable.prototype.offsetX = function(x) {		
		for(var i in this.objects) {
			this.objects[i].setX(this.objects[i]._x + x);
		}
	};
	
	CompositeRenderizable.prototype.offsetY = function(y) {		
		for(var i in this.objects) {
			this.objects[i].setY(this.objects[i]._y + y);
		}
	};
	
	CompositeRenderizable.prototype.offset = function(x, y) {
		
		var i, c;
		
		for(i in this.objects) {
			c = this.objects[i];
			c.setX(this.objects[i]._x + x);
			c.setY(this.objects[i]._y + y);
		}
		
	};
	
	CompositeRenderizable.prototype.setRotation = function(angle) {		
		for(var i in this.objects) {
			this.objects[i].setRotation(angle);
		}
	};
	
	CompositeRenderizable.prototype.offsetRotation = function(angle) {		
		for(var i in this.objects) {
			this.objects[i].setRotation(this.objects[i]._rotation + angle);
		}
	};
	
	CompositeRenderizable.prototype.setX = function(x) {		
		for(var i in this.objects) {
			this.objects[i].setX(x);
		}
	};
	
	CompositeRenderizable.prototype.setY = function(y) {		
		for(var i in this.objects) {
			this.objects[i].setY(y);
		}
	};
	
	CompositeRenderizable.prototype.setLocation = function(x, y) {
		
		var i, c;
		
		for(i in this.objects) {
			c = this.objects[i];
			c.setX(x);
			c.setY(y);
		}
		
	};
	
	CompositeRenderizable.prototype.setVisible = function(value) {
		
		for(var i in this.objects) {
			this.objects[i].setVisible(value);
		}
		
		this._visible = value;
		
	};
	
	CompositeRenderizable.prototype.setZIndex = function(value) {
		
		for(var i in this.objects) {
			this.objects[i].setZIndex(value);
		}
		
		this._zIndex = value;
		
	};
	
	CompositeRenderizable.prototype.getZIndex = function() {		
		return this._zIndex;		
	};
	
	CompositeRenderizable.prototype.isVisible = function() {
		return this._visible;
	};	
	
	CompositeRenderizable.prototype.each = function(func) {		
		for(var i in this.objects) {
			func( this.objects[i] );
		}
	};

	
	M.CompositeRenderizable = CompositeRenderizable;
	
})(window.Match);