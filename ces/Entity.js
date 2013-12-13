function Entity(props) {
	this.attributes = props.attributes || {};
	this.behaviours = props.behaviours || [];
}
Entity.prototype.update = function() {
	for ( var i = 0; i < this.behaviours.length; i++ ) {
		this.behaviours[i](this.attributes, this, M);
	}
};
Entity.prototype.onLoop = Entity.prototype.update;
Entity.prototype.addAttribute = function(name, attribute) {
	this.attributes[name] = attribute;
};
Entity.prototype.addBehaviour = function(behaviour) {
	this.behaviours.push(behaviour);
};
Entity.prototype.addAttributes = function(map) {
	for ( var i in map ) {
		this.addAttribute(i, map[i]);
	}
};
Entity.prototype.addBehaviours = function() {
	for ( var i = 0; i < arguments.length; i++ ) {
		this.behaviours.push(arguments[i]);
	}
};
Entity.prototype.removeBehaviours = function() {
	for ( var i in arguments ) {
		this.behaviours.splice(this.behaviours.indexOf(i), 1);
	}
};
Entity.prototype.removeAttributes = function() {
	for ( var i in arguments ) {
		this.attributes[i] = null;
	}
};
Entity.prototype.replaceBehaviour = function(out, in_) {
	this.behaviours[this.behaviours.indexOf(out)] = in_;
};
Entity.prototype.replaceAttribute = function(name, in_) {
	this.attributes[name] = in_;
};