
	Match.prototype.registerClass = function() {

		var current = this._createNamespaceFromString(arguments[0]),	
			clousure = arguments[arguments.length - 1],
			dependencies = [];

		for ( var i = 1; i < arguments.length - 1; i++ ) {
			dependencies.push(arguments[i]);
		}
		
		current[namespace[l]] = clousure.apply(clousure, dependencies);
		current[namespace[l]].namespace = arguments[0];

	};

	Match.prototype.registerGameObject = function() {
		// The current implementation may change to:
		// arguments[0] = "M.game.objects" + arguments[0];
		// arguments[0] = "M.game.classes" + arguments[0];
		// registerGameClass;
		console.warn("registerGameObject implementation is not final and may change");
		arguments[0] = "game." + arguments[0];
		this.registerClass.apply(this, arguments);
	};

	Match.prototype.registerPlugin = function() {
		arguments[0] = "M.plugins." + arguments[0];
		this.registerClass.apply(this, arguments);
	};

	Match.prototype.registerPluginTemplate = function(id, html) {
		this.plugins.html[id] = html;
	};
	/**
	 * Returns a game class or object based on the given name
	 *
	 * @method getGameObject
	 * @param {String} className the name of the class or object to retrieve
	 * @return {Object} the object registered by the given className
	 */
	Match.prototype.getGameObject = function(className) {
		console.warn("getGameObject implementation is not final and may change");
		// The current implementation may change to:
		// return this.game.objects[className];
		return game[className];
	};
	/**
	 * Instantiates a game object by the given className and calls the setters
	 * on it provided in setAttributes
	 *
	 * NOTE: The class you are willing to instantiate must have a public and
	 * non arguments constructor
	 *
	 * @method getGameClassInstance
	 * @private
	 *
	 * @param {String} className
	 * @param {Map} setAttributes
	 * @return {Object} the instantiated game object
	 */
	Match.prototype._getClassInstance = function(className, setAttributes) {
	
		var path = className.split("."),
			clazz = window,
			instance,
			i,
			keyValuePair;
		
		for ( var i = 0; i < path.length; i++ ) {
			clazz = clazz[path[i]];
		}
		
		instance = new clazz();
		
		for ( i in setAttributes ) {
			
			keyValuePair = setAttributes[i];
			
			if ( instance[keyValuePair.key] ) {
				if ( typeof instance[keyValuePair.key] == "function" ) {
					instance[keyValuePair.key](keyValuePair.value);
				} else {
					instance[keyValuePair.key] = keyValuePair.value;
				}
			}
			
		}
		
		return instance;
		
	};