function CollisionFactory() {
	this.groups = {};
}

CollisionFactory.prototype.createFrom = function(renderizable, groupId) {

	var clone = new Object();

	for ( var i in renderizable ) {
		clone[i] = renderizable[i];
	}

	clone._setXOriginal = clone.setX;
	clone._setYOriginal = clone.setY;
	clone.setX = this._setXProxy;
	clone.setY = this._setYProxy;

	this.addCollidable(clone, groupId);

	return clone;

};

CollisionFactory.prototype.addCollidable = function(object, groupId) {

	if ( !this.groups[groupId] ) {
		this.groups[groupId] = new M.ArrayList();
	}

	this.groups[groupId].push(object);

};

CollisionFactory.prototype._setXProxy = function(value) {
	console.debug("proxy x");
	//if we move the object to the new position and there is a colision in x we put it back to where it was before
	var prevX = this.getX();
	this._setXOriginal(value);
	if ( this.collides() ) {
		this._setXOriginal(prevX);
	}
};

CollisionFactory.prototype._setYProxy = function() {
	console.debug("proxy y");
	//if we move the object to the new position and there is a colision in x we put it back to where it was before
	var prevY = this.getY();
	this._setYOriginal(value);
	if ( this.collides() ) {
		this._setYOriginal(prevY);
	}
};


/**************************** PROXY B ******************************/

function Collidable(renderizableToWrap, groupId) {
	for ( var i in renderizableToWrap ) {
		this[i] = renderizableToWrap[i];
	}
	this._setXOriginal = clone.setX;
	this._setYOriginal = clone.setY;
	this.setX = this._setXProxy;
	this.setY = this._setYProxy;
}

Collidable.prototype._setXProxy = function(value) {
	console.debug("proxy x");
	//if we move the object to the new position and there is a colision in x we put it back to where it was before
	var prevX = this.getX();
	this._setXOriginal(value);
	if ( this.collides() ) {
		this._setXOriginal(prevX);
	}
};

Collidable.prototype._setYProxy = function() {
	console.debug("proxy y");
	//if we move the object to the new position and there is a colision in x we put it back to where it was before
	var prevY = this.getY();
	this._setYOriginal(value);
	if ( this.collides() ) {
		this._setYOriginal(prevY);
	}
};


/***************************************************/

function Ninja() {
	M.renderers.Sprite.apply(this);
	M.collisions.Collidable.apply(this);
	this.setCollisionGroup(0);
}

M.extend(Ninja, M.renderers.Sprite);
M.extend(Ninja, M.collisions.Collidable);

/***************************************************/

function Ninja() {
	M.renderers.Sprite.apply(this);
}

M.extend(Ninja, M.renderers.Sprite);

/*
 * Returns a collidable object for group id 0
 */
var Ninja = M.collisions.CollisionFactory.createFrom(new Ninja(), 0);

var Ninja = new Collidable(new Ninja(), 0);

