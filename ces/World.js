function World() {
	this.entities = [];
}

World.prototype.update = function() {
	for ( var i = 0; i < this.entities.length; i++ ) {
		this.entities.update();
	}
};
World.prototype.removeEntitiesByName = function(name) {
	for ( var i = 0; i < this.entities.length; i++ ) {
		if ( this.entities[i].name == name ) {
			this.entities[i].splice(i, 1);
		}
	}
};
World.prototype.getEntitiesByName = function(name) {
	var query = [];
	for ( var i = 0; i < this.entities.length; i++ ) {
		if ( this.entities[i].name == name ) {
			query.push(this.entities[i]);
		}
	}
	return query;
};