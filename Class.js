(function () {
	
	function Class() {
	}

	/**
	 * Adds parent prototype methods to the childs prototype
	 * @method each
	 * @param {Object} descendant object to put the methods from the parents prototype
	 * @param {Object} parent where to take the methods to put in descendant
	 */
	Class.extend = function( child, parent ) {

		if ( !child ) throw new Error("Child is undefined and cannot be extended");
		if ( !parent ) throw new Error("Parent is undefined, you cannot extend child with an undefined parent");
		if ( !parent.name ) throw new Error("Parent name is undefined. Please add a field name to the parent constructor where name is the name of the function. This usually creates issues in Internet Explorer." + parent);

		child.prototype["extends" + parent.name] = parent;

		for (var m in parent.prototype) {

			if ( !child.prototype[m] ) {
				child.prototype[m] = parent.prototype[m];
			} else if ( !child.prototype[parent.name + m]) {
				//Cammel case method name
				child.prototype[parent.name.substr(0, 1).toLowerCase() + parent.name.substr(1) + m.substr(0, 1).toUpperCase() + m.substr(1)] = parent.prototype[m];
			}

		}

	};

	window.Class = Class;

})();