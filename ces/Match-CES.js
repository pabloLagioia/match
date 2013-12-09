Match.prototype.registerGameEntity = function(name, constructor) {
	this.game.entities[name] = constructor;
};
Match.prototype.registerGameAttribute = function(name, constructor) {
	this.game.attributes[name] = constructor;
};
Match.prototype.registerGameBehaviour = function(name, behaviour) {
	this.game.behaviours[name] = behaviour;
};
Match.prototype.registerGameEntities = function(entities) {
	for ( var i in map ) {
		this.registerGameEntity(i, map[i]);
	}
};
Match.prototype.registerGameAttributes = function(map) {
	for ( var i in map ) {
		this.registerGameAttribute(i, map[i]);
	}
};
Match.prototype.registerGameBehaviours = function(map) {
	for ( var i in map ) {
		this.registerGameBehaviour(i, map[i]);
	}
};
Match.prototype.createEntity = function(name) {

	var entity = new Entity();
	entity.name = name;
	this.game.entities[name].call(entity, this.game.attributes, this.game.behaviours);

	return entity;

};