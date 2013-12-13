function Namespace() {	
}
Namespace.prototype.add = function(fullNamespace, value) {

	var namespace = fullNamespace.split("\."),
		current = this,
		l = namespace.length - 1,
		name;

	for ( var i = 0; i < l; i++ ) {
		name = namespace[i];
		if ( !current[name] ) {
			current[name] = new Object();
		}
		current = current[name];
	}

	current[namespace[l]] = value;

};