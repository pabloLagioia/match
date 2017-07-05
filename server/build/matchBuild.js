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
(function (namespace) {

	function EventHandler() {
		this._eventListeners = {};	
	}

	EventHandler.prototype.addEventListener = function(name, callback) {
		if ( !this._eventListeners[name] ) {
			this._eventListeners[name] = [];
		}
		this._eventListeners[name].push(callback);
	};
	EventHandler.prototype.on = function() {
		
		var events = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
			callback = arguments[arguments.length -1 ];

		for ( var i = 0; i < events.length; i++ ) {
			this.addEventListener(events[i], callback);
		}

	};
	EventHandler.prototype.off = function() {

		var events = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
			callback = arguments[arguments.length -1 ];

		for ( var i = 0; i < events.length; i++ ) {
			this.removeEventListener(events[i], callback);
		}

	};
	EventHandler.prototype.raise = function(name, data) {
		var eventListeners = this._eventListeners[name];
		if ( eventListeners ) {
			for ( var i = 0, l = eventListeners.length; i < l; i++ ) {
				eventListeners[i](data);
				// eventListeners[i].call(this, data);
			}
		}
	};
	EventHandler.prototype.raiseEvent = EventHandler.prototype.raise;
	EventHandler.prototype.removeEventListener = function(name, callback) {
		if ( this._eventListeners[name] ) {
			var eventListeners = this._eventListeners[name];
			eventListeners.splice(eventListeners.indexOf(callback), 1);
		}
	};
	EventHandler.prototype.removeAllListeners = function(name) {
		this._eventListeners = {};
	};
	EventHandler.prototype.listensTo = function(name) {
		return this._eventListeners[name];
	};

	EventHandler.name = "EventHandler";

	namespace.EventHandler = EventHandler;

})(window);
/**
 * @module Match
 */
(function(namespace) {

	/**
	 * Provides an easy solution to event handling
	 * 
	 * @class EventListener
	 * @constructor
	 * @example 
	 
			function onClickListener(sender) {
				console.log("Clicked on: " + sender);
			}
	 
			var onClick = new M.EventListener();
			
			onClick.addEventListener(onClickListener);
			
			onClick.raise(this);
			
			onClick.removeEventListener(onClickListener);

	 * @example 

			var obj = { name: "Ninja" };

			function onClickListener() {
				console.log("Clicked on: " + this.name); //Will print Ninja
			}
	 
			var onClick = new M.EventListener();
			
			onClick.addEventListener(onClickListener, obj); //Bind execution context to obj
			
			onClick.raise();
			
			onClick.removeEventListener(onClickListener);
	 */
	function EventListener() {
		this.listeners = new Array();
	}
	/**
	 * @method addEventListener
	 * @param {Function} listener 
	 * @param {Object} owner [optional] object to bind the listener to
	 */
	EventListener.prototype.addEventListener = function(listener, owner) {
		if ( owner ) {
			this.listeners.push(new ObjectListener(listener, owner));
		} else {
			this.listeners.push(new FunctionListener(listener));
		}
	};
	/**
	 * @method raise
	 */
	EventListener.prototype.raise = function() {
	
		var i = 0,
			l = this.listeners.length;
		
		if ( l == 0 ) return;
		
		for ( ; i < l; i++ ) {
			this.listeners[i].run(arguments);
		}
		
	};
	/**
	 * @method removeEventListener
	 */
	EventListener.prototype.removeEventListener = function(listener, owner) {
		
		var i = 0,
			l = this.listeners.length,
			currentListener;

		for ( ; i < l; i++ ) {

			currentListener = this.listeners[i];

			if ( currentListener.callback == listener || (currentListener.callbackName == listener && owner == currentListener.object ) ) {

				this.listeners.splice(i, 1);
				return;

			}

		}

	};
	/**
	 * @method removeAllEventListeners
	 *
	 * @return {Array} Array containing the event listeners that are removed
	 */
	EventListener.prototype.removeAllEventListeners = function() {
		this.listeners = new Array();
		return listeners;
	};

	EventListener.name = "EventListener";

	namespace.EventListener = EventListener;

	/**
	 * Wraps a function to use it as a listener
	 * 
	 * @class FunctionListener
	 * @constructor
	 * @param {Function} callback function to invoke
	 */
	function FunctionListener(callback) {
		this.callback = callback;
	}
	/**
	 * Invokes callback function
	 * @method run
	 */
	FunctionListener.prototype.run = function(args) {
		this.callback(args[0]);
	};

	/**
	 * Wraps an object and the callback name
	 * 
	 * @class ObjectListener
	 * @constructor
	 * @param {String} callbackName name of the function to call
	 * @param {Object} object object in which to invoke the callback
	 */
	function ObjectListener(callbackName, object) {
		this.callbackName = callbackName;
		this.object = object;
	}
	/**
	 * Invokes callback function on object
	 * @method run
	 */
	ObjectListener.prototype.run = function(args) {
		this.object[this.callbackName](args[0]);
	};

})(window);
(function (namespace) {

	// var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	// var ARGUMENT_NAMES = /([^\s,]+)/g;

	// function getParamNames(func) {

	// 	var fnStr = func.toString().replace(STRIP_COMMENTS, ''),
	// 		result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).ModuleManager(ARGUMENT_NAMES);
		
	// 	if(result == null) {
	// 		result = [];
	// 	}

	// 	return result

	// }

	function ModuleManager() {
		this.modules = {};
	}

	/**
	 * Defines a new module where the first parameter is the name, last parameter is the constructor
	 * and parameters in the middle are dependencies
	 */
	ModuleManager.prototype.defineModule = function() {

		var module = {
			"requires": Array.prototype.slice.call(arguments, 1, arguments.length - 1),
			"name": arguments[0],
			"constructor": arguments[arguments.length - 1]
		};

		// if ( module.requires.length == 0 ) {
		// 	module.requires = getParamNames(module.constructor);
		// }

		this.modules[module.name] = module;

	};
	/**
	 * Gets a module provided the required modules have been defined
	 */
	ModuleManager.prototype.getModule = function(name) {

		var module = this.modules[name],
			requiredModules = [],
			canBeLoaded = true;

		if ( module ) {

			for ( var i = 0; i < module.requires.length; i++ ) {
			
				var requiredModule = this.modules[module.requires[i]];
			
				if ( requiredModule ) {

					if ( !requiredModule.cache ) {
						requiredModule.cache = this.getModule(requiredModule.name);
					}

					requiredModules.push(requiredModule.cache);

				} else {
					canBeLoaded = false;
					break;
				}
			
			}

			if ( canBeLoaded ) {
				return module.constructor.apply(module.constructor, requiredModules);
			}

		}

		return {};

	};
	/**
	 * Short-hand to getModule and defineModule
	 * Calls getModule if argument length equals 1 otherwise calls defineModule
	 */
	ModuleManager.prototype.module = function() {
		if ( arguments.length == 1 ) {
			return this.getModule(arguments[0]);
		} else {
			this.defineModule.apply(this, arguments);
			return this;
		}
	};

	namespace.ModuleManager = ModuleManager;

}(window));
(function (namespace) {

	/**
	 * Simple implementation of a map that consists of two arrays, one is used as an
	 * index of keys and the other is used to store the items.
	 * This way we take advantage of javascript native object key-value
	 * and the speed of iterating a simple array.
	 *
	 * You can use the build-in method eachValue to quickly iterate through all values
	 * of the map or just use a traditional for-loop on attribute _values. Please do not
	 * modify _values array, use the map methods to do it.
	 *
	 * @class SimpleMap
	 * @constructor
	 */
	function SimpleMap() {
		this._keys = {};
		this._values = [];
		this.length = 0;
	}
	/**
	 * Pushes an item into the map
	 * @method push
	 * @param {Object} key object representing unique id
	 * @param {Object} value value to add
	 */
	SimpleMap.prototype.set = function(key, value) {

		var existingIndex = this._keys[key];

		if ( existingIndex ) {
			this._values[existingIndex] = value;
		} else {
			var valueIndex = this._values.push(value) - 1;
			this._keys[key] = valueIndex;
			this.length++;
		}
    
    return value;

	};
	/**
	 * Removes all items
	 * @method clear
	 */
	SimpleMap.prototype.clear = function() {
		this._keys = {};
		this._values = [];
		this.length = 0;
	};
	/**
	 * Gets the item that matches the given key
	 * @method get
	 * @param {Object} key object representing unique id
	 * @return {Object}
	 */
	SimpleMap.prototype.get = function(key) {
		return this._values[this._keys[key]];
	};
	/**
	 * Removes the item by the given key
	 * @method remove
	 * @param {Object} key object representing unique id
	 */
	SimpleMap.prototype.remove = function(key) {
		
		var index = this._keys[key];
		
		if ( index == undefined ) {
			return;
		}

		this._values.splice(index, 1);
		
		delete this._keys[key];
		
		this.length--;
		
		for ( var i in this._keys ) {
			if ( this._keys[i] > index ) {
				this._keys[i]--;
			}
		}
		
	};
	/**
	 * Iterates through all values and invokes a callback
	 * @method eachValue
	 * @param {Function} callback
	 */
	SimpleMap.prototype.eachValue = function(callback) {
		var i = 0,
			l = this._values.length,
			v = this._values;
		for ( ; i < l; i++ ) {
			callback(v[i]);
		}
	};
	/**
	 * Iterates through all keys and invokes a callback
	 * @method eachKey
	 * @param {Function} callback
	 */
	SimpleMap.prototype.eachKey = function(callback) {
		for ( var key in this._keys ) {
			callback(key);
		}
	};
	/**
	 * Iterates through all values and invokes a callback passing key and value as arguments respectively
	 * @method each
	 * @param {Function} callback
	 */
	SimpleMap.prototype.each = function(callback) {
		for ( var key in this._keys ) {
			callback(key, this.get(key));
		}
	};

	SimpleMap.name = "SimpleMap";

	namespace.SimpleMap = SimpleMap;

})(window);
(function (namespace, SimpleMap, EventListener) {
	
	function EventSimpleMap() {
		this.extendsSimpleMap();
		this.onSet = new EventListener();
		this.onRemoved = new EventListener();
	}
	
	EventSimpleMap.prototype.set = function(key, value) {
		this.simpleMapSet(key, value);
		this.onSet.raise(key);
	};
	EventSimpleMap.prototype.remove = function(key) {
		this.simpleMapRemove(key);
		this.onRemoved.raise(key);
	};
	
	Class.extend(EventSimpleMap, SimpleMap);
	
	namespace.EventSimpleMap = EventSimpleMap;
	
})(window, SimpleMap, EventListener);
(function (namespace) {

	function DefaultLogger() {
	}
	
	DefaultLogger.prototype.joinArgs = function(args) {
		var values = [];
		for ( var i in args ) {
			values.push(args[i]);
		}
		return values.join(" ");
	};

	if ( window.console ) {

		if ( window.console.log ) {
			DefaultLogger.prototype.log = function () {
				window.console.log(this.joinArgs(arguments));
			}
		} else {
			DefaultLogger.prototype.log = function (value) {
				alert(this.joinArgs(arguments));
			}
		}
		if ( window.console.warn ) {
			DefaultLogger.prototype.warn = function (value) {
				window.console.warn(this.joinArgs(arguments));
			}
		} else {
			DefaultLogger.prototype.warn = DefaultLogger.prototype.log;
		}
		if ( window.console.error ) {
			DefaultLogger.prototype.error = function (value) {
				window.console.error(this.joinArgs(arguments));
			}
		} else {
			DefaultLogger.prototype.error = DefaultLogger.prototype.log;
		}

	} else {
		
		DefaultLogger.prototype.log = function(value) {
			alert(this.joinArgs(arguments));
		}
		DefaultLogger.prototype.debug = DefaultLogger.prototype.log;
		DefaultLogger.prototype.warn = DefaultLogger.prototype.log;
		DefaultLogger.prototype.error = DefaultLogger.prototype.log;

	}
	
	namespace.DefaultLogger = DefaultLogger;

})(window);
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2011 Pablo Lagioia, Puzzling Ideas
 *
 * Match Game Engine v1.5
 * http://puzzlingideas.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
var M = window.M || {},
	game = window.game || {};

/**
 * @module window
 */
(function(namespace) {

	if ( namespace.Match ) return;

	/**
	 * Provides information about the current browser
	 * @class Browser
	 * @readOnly
	 */
	function Browser() {

		var browsers = ["Firefox", "Chrome", "Opera", "Safari", "MSIE 9.0", "BlackBerry"],
		i,
		browserName;

		/**
		 * The name of the current browser
		 * @property name
		 * @readOnly
		 * @type String
		 * @example
				"Firefox"
		 */
		this.name = undefined;

		for ( i in browsers ) {
			browserName = browsers[i];
			this["is" + browserName] = ( navigator.userAgent.indexOf(browserName) != -1 );
			if ( !this.name && this["is" + browserName] ) {
				this.name = browserName;
			}
		}

		/**
		 * The extension of the audio format supported by the current browser
		 * @property supportedAudioFormat
		 * @readOnly
		 * @type String
		 * @example
				".mp3"
		 */
		this.supportedAudioFormat = this.getBrowserPreferredAudioFormat();

		/**
		 * Boolean indicating if the current browser is supported or not
		 * @property supported
		 * @readOnly
		 * @type Boolean
		 */
		this.supported = this.name != undefined;

	};

	/**
	 * Returns the audio extension supported by the current browser.
	 * @method getBrowserPreferredAudioFormat
	 * @private
	 * @return {String} the supported extension
	 */
	Browser.prototype.getBrowserPreferredAudioFormat = function() {

		var a = document.createElement("audio");

		if ( a.canPlayType( "audio/ogg" ) != "" ) return ".ogg";
		if ( a.canPlayType( "audio/mpeg" ) != "" ) return ".mp3";
		if ( a.canPlayType( "audio/wav" ) != "" ) return ".wav";
		if ( a.canPlayType( "audio/mp4" ) != "" ) return ".mp4";

		this.logger.warn("This browser does not support audio");

	};

	/**
	 * Returns the audio extension supported by the current browser.
	 * @method getBrowserAudioSupportedFormats
	 * @private
	 * @return {String} the supported extension
	 */
	Browser.prototype.getBrowserAudioSupportedFormats = function() {

		var a = document.createElement("audio"),
			f = new Array();

		if ( a.canPlayType( "audio/ogg" ) != "" ) f.push(".ogg");
		if ( a.canPlayType( "audio/mpeg" ) != "" ) f.push(".mp3");
		if ( a.canPlayType( "audio/wav" ) != "" ) f.push(".wav");
		if ( a.canPlayType( "audio/mp4" ) != "" ) f.push(".mp4");

		return f.join("|");

	};

	/**
	 * Contains information about the current device
	 * @class Device
	 * @readOnly
	 */
	function Device() {
	
		var devices = ["Android", "BlackBerry", "iPhone", "iPad", "iPod", "IEMobile"],
			i;
		
		/**
		 * The name of the current device
		 * @property name
		 * @type String
		 * @example
				"PC"
		* @example
				"Android"
		 */
		
		/**
		 * Boolean that determines if the current device is mobile
		 * @property isMobile
		 * @type Boolean
		 * @example
				false
		 */

		for ( i in devices ) {
			deviceName = devices[i];
			this["is" + deviceName] = ( navigator.userAgent.indexOf( deviceName ) != -1 );
			if ( !this.name && this["is" + deviceName] ) {
				this.name = deviceName;
			}
		}
		
		if ( this.name ) {
			this.isMobile = true;
		} else {
			this.isMobile = false;
			this.name = "PC";
		}
	
	}

	/**
	 * Match Game Engine.
	 * When DOMContentLoaded event is executed the game loop starts. 
	 * If window has a function called main, that function gets executed once after Match has finished loading
	 *
	 * @constructor
	 * @class Match
	 * @static
	 *
	 */
	function Match() {

		this.extendsModuleManager();
		this.extendsEventHandler();

		this.autowire = true;
		
		this.logger = new DefaultLogger();
		/**
		 * Determines whether to loop though the onLoop list
		 * @property _isPlaying
		 * @private
		 * @type Boolean
		 */
		this._isPlaying = false;
		/**
		 * Array of GameLayer. Match loops the objects in this array calling the onLoop method of each of them. This operation
		 * involves rendering that takes place in the layers. Match loops this list after looping the gameObjects array thus, ensuring,
		 * no input or updates affects rendering.
		 * @property _gameLayers
		 * @private
		 * @type Array
		 */
		// this._gameLayers = new EventSimpleMap();
		this._gameLayers = new SimpleMap();
		/**
		 * Array of GameObject. Match loops the objects in this array calling the onLoop method of each of them. This operation
		 * does not involve rendering. Match loops this list first, updates every object and once that is finished it loops
		 * the game layers
		 * @property _gameObjects
		 * @private
		 * @type Array
		 */
		this._gameObjects = new Array();
		/**
		 * Array of Triggers
		 * @property _gameObjects
		 * @private
		 * @type Array
		 */
		this._triggers = new Array();
		/**
		 * Cache used for retrieving elements from onLoopList faster
		 * @property cache
		 * @private
		 * @type Object
		 */
		this.cache = null;
		/**
		 * Offscreen canvas used for operations such as PixelPerfect collisions
		 * @property offScreenCanvas
		 * @type HTMLCanvasElement
		 */
		this.offScreenCanvas = document.createElement("canvas");
		/**
		 * Offscreen context used for operations such as PixelPerfect collisions
		 * @property offScreenContext
		 * @type CanvasRenderingContext2D
		 */
		this.offScreenContext = this.offScreenCanvas.getContext("2d");
		/**
		 * Object that is passed as argument to the onLoop method of every GameObject. This object contains useful objects such as keyboard and mouse
		 * @property onLoopProperties
		 * @type Array
		 */
		this.onLoopProperties = {
			offScreenContext: this.offScreenContext,
			offScreenCanvas: this.offScreenCanvas,
			debug: false,
			time: 0,
			m: this
		};
		/**
		 * Object that contains information about the current browser
		 * @property browser
		 * @type Browser
		 */
		this.browser = new Browser();
		/**
		 * Object that contains information about the current device
		 * @property device
		 * @type Device
		 */
		this.device = new Device();
		/**
		 * Event listener that will be raised before calling the game loop
		 * @property onBeforeLoop
		 * @type EventListener
		 */
		// this.onBeforeLoop = new EventListener();
		/**
		 * Event listener that will be raised after calling the game loop
		 * @property onAfterLoop
		 * @type EventListener
		 */
		// this.onAfterLoop = new EventListener();
		/**
		 * Event listener that will be raised when an object is added
		 * @property onGameObjectPushed
		 * @type EventListener
		 */
		// this.onGameObjectPushed = new EventListener();
		/**
		 * Event listener that will be raised when an object is removed
		 * @property onGameObjectRemoved
		 * @type EventListener
		 */
		// this.onGameObjectRemoved = new EventListener();
		/**
		 * SimpleMap containing input handlers
		 * @property input
		 * @type Array
		 * @private
		 */
		this.input = new SimpleMap();
		
		//Show logo and duration of animation
		this.showLogo = true;
		this.LOGO_DURATION = 2000;
		
		this.DEFAULT_LAYER_NAME = "world";
		this.DEFAULT_LAYER_BACKGROUND = "#000";

		this.DEFAULT_UPDATES_PER_SECOND = 60;
		this._updatesPerSecond = 0;
		this._msPerUpdate = 0;
		this._previousLoopTime = null;
		this._lag = 0;
		this._maxLag = 50;
		
		this.setUpdatesPerSecond(this.DEFAULT_UPDATES_PER_SECOND);

		this.version = "1.6a";
		this.name = "Match";
		this.company = "Puzzling Ideas";
		
		/**
		 * Common game attributes and behaviours
		 * @property game
		 * @type Object
		 */
		this.game = {
			behaviours: {
			},
			attributes: {
			},
			entities: {
			},
			scenes: {
			},
			displays: {
			}
		};

		var self = this;
		/*
		 * Start game loop when document is loaded
		 */
		document.addEventListener( "DOMContentLoaded", function() {

			if ( self.gameData ) {

				if ( self.gameData.title ) {
					document.title = self.gameData.title;
				}

				var canvas = self.gameData.canvas || self.dom("canvas");

				if ( self.gameData.size ) {
					if ( self.gameData.size == "fullScreen" ) {
						canvas.width = window.innerWidth;
						canvas.height = window.innerHeight;
					} else {
						canvas.width = M.gameData.size.width;
						canvas.height = M.gameData.size.height;
					}
				}

				self.start(canvas);

			} else {

				//Retrocompat
				var cnv = self.dom("canvas");

				if ( self.autowire && cnv ) {
					console.log("Autowire enabled. Starting Match on default canvas");
					self.start(cnv);
				}
				
			}


		});

	}

	/**
	 * size: "fullScreen" or {width: Number, height: Number}
	 * canvas: HTMLCanvasElement or null (will get canvas from document)
	 * title: String
	 * description: String
	 * main: String, Name of a Scene or function code
	 */
	Match.prototype.createGame = function(gameData) {

		this.gameData = gameData;

	};

	Match.prototype.getCamera = function() {
		return this.renderer.camera;
	};
	
	Match.prototype.setUpdatesPerSecond = function(updates) {
		this._updatesPerSecond = updates;
		this._msPerUpdate = Math.floor(1000 / updates);
	};
	
	Match.prototype.getUpdatesPerSecond = function() {
		return this._updatesPerSecond;
	};
	/**
	 * Returns the layer by the given name
	 * @method getLayer
	 * @param {String} name the name of the layer
	 */
	Match.prototype.getLayer = function(name) {
		return this._gameLayers.get(name);
	};
	/**
	 * Returns the layer by the given name. Works exactly as getLayer
	 * @method layer
	 * @param {String} name the name of the layer
	 */
	Match.prototype.layer = Match.prototype.getLayer;
	Match.prototype.setUpGameLoop = function() {

		this.gameLoopAlreadySetup = true;
		
		this._previousLoopTime = this.getTime();
		this._lag = 0;

		this.createGameLayer(this.DEFAULT_LAYER_NAME).background = this.DEFAULT_LAYER_BACKGROUND;

		gameLoop();

	};
	Match.prototype._showLogo = function() {

		this.setScene("matchLogo", function() {

			setTimeout(function() {
				M.removeScene();
				M._regularStart();
			}, M.LOGO_DURATION);
			
		})

	};
	Match.prototype.restart = function() {
		this.gameLoopAlreadySetup = false;
		this.start();
	};
	/**
	 * Set Keyboard object. This is called by default by the keyboard implementation of this library but it could be changed
	 * @method setKeyboard
	 * @param {input.Keyboard} keyboard the keyboard to bind
	 */
	Match.prototype.setKeyboard = function(keyboard) {
		this.onLoopProperties.keyboard = keyboard;
		this.input.set("keyboard", keyboard);
	};
	/**
	 * Set Mouse object. This is called by default by the mouse implementation of this library but it could be changed
	 * @method setMouse
	 * @param {input.Mouse} mouse the mouse to bind
	 */
	Match.prototype.setMouse = function(mouse) {
		this.onLoopProperties.mouse = mouse;
		this.input.set("mouse", mouse);
	};
	/**
	 * Set Touch object. This is called by default by the touch implementation of this library but it could be changed
	 * @method setTouch
	 * @param {input.Touch} touch the toucn to bind
	 */
	Match.prototype.setTouch = function(touch) {
		this.onLoopProperties.touch = touch;
		this.input.set("touch", touch);
	};
	/**
	 * Set Accelerometer object. This is called by default by the accelerometer implementation of this library but it could be changed
	 * @method setAccelerometer
	 * @param {input.Accelerometer} accelerometer the accelerometer to bind
	 */
	Match.prototype.setAccelerometer = function(accelerometer) {
		this.onLoopProperties.accelerometer = accelerometer;
		this.input.set("accelerometer", accelerometer);
	};
	/**
	 * Set Orientation object. This is called by default by the orientation implementation of this library but it could be changed
	 * @method setOrientation
	 * @param {input.Orientation} orientation the accelerometer to bind
	 */
	Match.prototype.setOrientation = function(orientation) {
		this.onLoopProperties.orientation = orientation;
		this.input.set("orientation", orientation);
	};
	Match.prototype.registerClass = function() {
	
		var namespace = arguments[0].split("\."),
			clousure = arguments[arguments.length - 1],
			current = window,
			l = namespace.length - 1,
			dependencies = [],
			name;
		
		for ( var i = 0; i < l; i++ ) {
			name = namespace[i];
			if ( !current[name] ) {
				current[name] = new Object();
			}
			current = current[name];
		}
		
		if ( ! current[namespace[l]] ) {
		
			//Adds the default namespace as a dependency so it is available as the first argument of the clousure
			// dependencies.push(current);
			
			for ( var i = 1; i < arguments.length - 1; i++ ) {
				dependencies.push(arguments[i]);
			}
			
			current[namespace[l]] = clousure.apply(clousure, dependencies);
			current[namespace[l]].namespace = arguments[0];
		
		}

	};

	Match.prototype.loadBehaviour = function() {
		script = document.createElement("script");
		script.src = "http://69.164.192.103:8082/behaviour/js?q=" + Array.prototype.slice.call(arguments, 0).join(",");
		document.head.appendChild(script);
	};

	Match.prototype.loadAttribute = function() {
		script = document.createElement("script");
		script.src = "http://69.164.192.103:8081/attribute/js?q=" + Array.prototype.slice.call(arguments, 0).join(",");
		document.head.appendChild(script);
	};
	Match.prototype.registerBehaviour = function(name, value) {

		if ( this.game.behaviours[name] ) {
			this.logger.warn("There is already a behaviour named ", name, "current will be overriden");
		}
		this.game.behaviours[name] = value;
		this.raise("behaviourRegistered", name);

	};
	Match.prototype.behaviour = function() {
		if ( arguments.length == 2 ) {
			this.registerBehaviour(arguments[0], arguments[1]);
		} else {
			return new this.game.behaviours[arguments[0]];
		}
	};
	Match.prototype.capitalize = function(word) {
		return word.charAt(0).toUpperCase() + word.substr(1);
	};
	Match.prototype.display = function(name, descriptor) {

		if ( arguments.length == 2 ) {

			var renderizableType = this.capitalize(descriptor.type);

			if ( !this.renderizables[renderizableType] ) {
				throw new Error("When trying to register a display, no display by the type '" + renderizableType + "' could be found. Try rectangle, circle, text or sprite");
			}

			this.game.displays[name] = descriptor;

		} else {
			
			var display = this.game.displays[name];
			
			if ( display ) {
				
				var renderizable = new this.renderizables[this.capitalize(display.type)];

				renderizable.set(display);

				return renderizable;

			} else {
				throw new Error("When trying to instantiate a display, no display by the name '" + name + "' could be found");
			}

		}
	};
	Match.prototype.registerAttribute = function(name, value) {
		if ( this.game.attributes[name] ) {
			this.logger.warn("There is already an attribute named ", name, "current will be overriden");
		}
		this.game.attributes[name] = value;
		this.raise("attributeRegistered", name);
	};
	Match.prototype.attribute = function() {
		if ( arguments.length == 2 ) {
			this.registerAttribute(arguments[0], arguments[1]);
		} else {
			return new this.game.attributes[arguments[0]];
		}
	};
	Match.prototype.registerEntity = function(name, value) {
		if ( this.game.entities[name] == undefined ) {
			this.game.entities[name] = value;
			this.raise("entityRegistered", name);
		} else {
			this.logger.warn("There is already an entity named ", name);
		}
	};
	Match.prototype.createEntity = function(name, properties, args) {

		var entityClass = this.game.entities[name];

		if ( typeof entityClass == "function" ) {

			//Custom spawner
			var entity = entityClass(properties, args);
			entity.name = name;
			this.raise("entityCreated", name);
			return entity;
			
		} else if ( entityClass !== undefined) {

			//Default spawner
			var entity = new this.Entity(properties, args);

			if ( entityClass.has ) {
				for ( var i = 0; i < entityClass.has.length; i++ ) {
					entity.has(entityClass.has[i]);
				}
			}

			if ( entityClass.does ) {
				for ( var i = 0; i < entityClass.does.length; i++ ) {
					entity.does(entityClass.does[i]);
				}
			}

			if ( entityClass.displays ) {

				for ( var i = 0; i < entityClass.displays.length; i++ ) {

					var displayData = entityClass.displays[i];

					if ( typeof displayData === "object" ) {

						var key = Object.keys(displayData)[0],
							properties = displayData[key],
							shape,
							view;

						if ( properties.text ) {
							shape = "Text";
						} else if ( properties.radius ) {
							shape = "Circle";
						} else if ( properties.image ) {
							shape = "Sprite";
						} else {
							shape = "Rectangle";
						}

						view = new M.renderizables[shape];

						view.set(properties);

						entity.views.set(key, view);

					} else {

					var display = this.display(entityClass.displays[i]);
					entity.views.set(entityClass.displays[i], display);

					}
				}
			}

			entity.name = name;
			this.raise("entityCreated", name);

			return entity;

		} else {
			throw new Error("Unable to instantiate entity by name '" + name + "' as it could not be found. Did you register it?");
		}

	};
	Match.prototype.entity = function() {
		if ( arguments.length == 2 ) {
			this.registerEntity(arguments[0], arguments[1]);
		} else {
			return this.createEntity(arguments[0]);
		}
	};
	Match.prototype.spawn = function(name, initialize) {
		
		var entity = this.entity(name);

		if ( initialize ) {
			initialize(entity);
		}

		var addSystem = M.add(entity);

		for ( var i = 0; i < entity.views._values.length; i++ ) {
			if ( entity.views._values[i].layer ) {
				//TODO: We need to be able to add just views to layers. This requires much more investigation and changing how layers work
				addSystem.to(entity.views._values[i].layer);
				return entity;
			}
		}

		addSystem.to("world");

		return entity;

	};
	Match.prototype.registerScene = function(name, value) {
		if ( this.game.scenes[name] == undefined ) {
			this.game.scenes[name] = value;
		} else {
			this.logger.warn("There is already a scene named ", name);
		}
	};
	Match.prototype.scene = function(name, value) {
		if ( arguments.length == 2 ) {
			this.registerScene(name, value);
		} else {
			return this.getScene(name);
		}
	};
	Match.prototype.unregisterScene = function(name) {
		this.game.scenes[name] = null;
	};
	Match.prototype.getScene = function(name) {
		return this.game.scenes[name];
	};
  /**
   * Creates objects and triggers based on a map given a map definition
   */
  Match.prototype.createMap = function(mapDefinition) {
    
    if (!mapDefinition) {
      throw new Error("There is no map registered with name " + name);
    }
    
    if (mapDefinition.cameraBoundingArea) {
      this.getCamera().setBoundingArea(mapDefinition.cameraBoundingArea.left, mapDefinition.cameraBoundingArea.top, mapDefinition.cameraBoundingArea.right, mapDefinition.cameraBoundingArea.bottom);
    }
    
    for (var row = 0; row < mapDefinition.definition.length; row++) {

      for (var column = 0; column < mapDefinition.definition[row].length; column++) {
        
        var tileRef = mapDefinition.definition[row][column];
        
        var tileConstructor = mapDefinition.entities[tileRef];
        
        var tile = {
          "row": row,
          "column": column,
          "width": mapDefinition.tile.width,
          "height": mapDefinition.tile.height,
          "center": {
            "x": column * mapDefinition.tile.width + mapDefinition.tile.width / 2,
            "y": row * mapDefinition.tile.height + mapDefinition.tile.height / 2
          },
          "type": tileRef
        };
        
        this._createMapTile(tileConstructor, tile);

      }
      
    }
    
  };
  Match.prototype._createMapTile = function(tileConstructor, tile) {
    
    if (typeof tileConstructor == "function") {
      
      this._createMapTile(tileConstructor(tile), tile);
      
    } else if (tileConstructor instanceof Array) {
      
      tileConstructor.forEach(function(currentTile) {
        M._createMapTile(currentTile, tile);
      });
      
    } else if (typeof tileConstructor == "string") {
      
      var argumentsIndex = tileConstructor.indexOf(":"),
          args;
      
      if (argumentsIndex != -1) {
        args = tileConstructor.substr(argumentsIndex + 1, tileConstructor.length);
        tileConstructor = tileConstructor.substr(0, argumentsIndex);
      }
      
      M.add(M.createEntity(tileConstructor, tile, args));
      
    } else {
      
      M.add(tileConstructor);
      
    }
    
  }
	/**
	 * Calls the onLoop method on all elements in nodes
	 * @method updateGameObjects
	 * @param {Array} nodes list of game objects
	 * @param {Object} p useful objects for performance increase
	 */
	Match.prototype.updateGameObjects = function(nodes, p) {

		for ( var i = 0; i < nodes.length; i++ ) {

			var node = nodes[i];

			this._applyInput(node);

			node.onLoop(p);

		}

	};
	/**
	 * Calls applyToObject to of each input handler
	 * @method _applyInput
	 * @param {Node} node to apply input handling to
	 */
	Match.prototype._applyInput = function(node) {
		var i = 0,
			input = this.input._values,
			l = input.length;
		for ( ; i < l; i++ ) {
			input[i].applyToObject(node);
		}
	};
	/**
	 * Updates all input handlers
	 * @method _updateInput
	 */
	Match.prototype._updateInput = function() {
		var i = 0,
			input = this.input._values,
			l = input.length;
		for ( ; i < l; i++ ) {
			input[i].update();
		}
	};
	/**
	 * Game loop, loops through the game objects and then loops through the scenes rendering them
	 * @method gameLoop
	 */
	Match.prototype.gameLoop = function() {

		if ( !this._isPlaying ) return;
		
		// this.onBeforeLoop.raise();

		this.raise("beforeLoop");

		var p = this.onLoopProperties,
			current = this.getTime(),
			renderer = this.renderer;

		p.time = this.FpsCounter.timeInMillis;
		
		// this._lag += current - this._previousLoopTime;
		this._previousLoopTime = current;

		// if ( this._lag > this._maxLag ) {
		// 	this._lag = this._maxLag;
		// }
		
		current = new Date().getTime();
		
		// while ( this._lag > this._msPerUpdate ) {
		
			this.updateGameObjects(this._gameObjects, p);
			this.updateTriggers(this._triggers, p);
			this._updateInput(p);
			// this._lag -= this._msPerUpdate;

		// }

		this.updateTime = new Date().getTime() - current;
		
		current = new Date().getTime();

		this.renderer.renderLayers(this._gameLayers);
		
		this.renderTime = new Date().getTime() - current;

		/*
		 * Update FPS count
		 */
		this.FpsCounter.count();

		// this.onAfterLoop.raise();

		this.raise("afterLoop");

	};
	Match.prototype.updateTriggers = function(triggers, p) {
		var i = 0, l = triggers.length;
		for ( ;  i < l; i++ ) {
			triggers[i].onLoop(p);
		}
	};
	/**
	 * Gets the result of all layers as an image in base64
	 * @method getAsBase64Image
	 * @return {String} a string representing an image in base64
	 */
	Match.prototype.getAsBase64Image = function() {
		return this.renderer.getAsBase64Image();
	};
	/**
	 * Gets the result of all layers as an html image
	 * @method getAsImage
	 * @return {HTMLImageElement} an image element with the result of this layer
	 */
	Match.prototype.getAsImage = function() {
		var img = new Image();
		img.src = this.getAsBase64Image();
		return img;
	};
	/**
	 * Gets the first element from the onLoopList
	 * @method getFirst
	 * @return {GameObject} the first game object in the list or null if the list is empty
	 */
	Match.prototype.getFirst = function() {
		return this.getIndex(0);
	};
	/**
	 * Gets the element matching the provided index
	 * @method getIndex
	 * @param {int} index the index of the object to get from the game objects list
	 * @return {GameObject} the game object at the specified index or null if it is not in the list
	 */
	Match.prototype.getIndex = function( index ) {
		try {
			return this._gameObjects[ index ];
		} catch (e) {
			return null;
		}
	};
	/**
	 * Gets the element matching the provided key.
	 * Caches the last object retreived for faster performance.
	 * @method get
	 * @param {String} key the key of the object to get from the game objects list
	 * @return {GameObject} the game object matching the provided key or null if it is not in the list
	 * @example
			var ninja = this.get("ninja");
	 */
	Match.prototype.get = function(key) {

		if ( this.cache && this.cache.key == key ) {
			return this.cache;
		}

		var i = this._gameObjects.length, 
			current;

		while ( i-- ) {
			current = this._gameObjects[i];
			if ( key == current.key ) {
				this.cache = current;
				return current;
			}
		}
		
		return null;

	};
	/**
	 * Gets the element matching the provided key.
	 * Caches the last object retreived for faster performance.
	 * @method get
	 * @param {String} key the key of the object to get from the game objects list
	 * @return {GameObject} the game object matching the provided key or null if it is not in the list
	 * @example
			var ninja = this.get("ninja");
	 */
	Match.prototype.getEntitiesByName = function(name) {

		var entities = [],
			i = this._gameObjects.length, 
			current;

		while ( i-- ) {
			current = this._gameObjects[i];
			if ( current.name === name ) {
				entities.push(current);
			}
		}
		
		return entities;

	};
	/**
	 * Gets the last element from the onLoopList
	 * @method getLast
	 * @return {GameObject} the last game object in the list or null if the list is empty
	 */
	Match.prototype.getLast = function() {
		return this.getIndex( this._gameObjects.length - 1 );
	};
	/**
	 * Returns true if the element is in the game objects list and false if not
	 * @method isOnLoopList
	 * @param {Object} object the object to determine if it is present in the game object list
	 * @return {Boolean} true if the object in in the list, false if not
	 */
	Match.prototype.isInOnLoopList = function(object) {
		return this._gameObjects.indexOf(object) != -1;
	};
	Match.prototype.add = function() {

		for ( var i = 0; i < arguments.length; i++ ) {
      
      if (typeof arguments[i] == "string") {
        arguments[i] = M.createEntity(arguments[i]);
      }
      
			this.pushGameObject(arguments[i]);
      
		}
	
		return {
		
			objects: arguments,
			
			to: function(layerName) {
				
        if ( !layerName ) {
					return;
				}
        
        for ( var i = 0; i < this.objects.length; i++ ) {
          M.addToLayer(layerName, this.objects[i]);
        }
				
			}
		}
		
	};
	Match.prototype.remove = function() {

		for ( var i = 0; i < arguments.length; i++ ) {
			this.removeGameObject(arguments[i]);
		}
	
		return {
		
			objects: arguments,
			
			from: function(layerName) {
					
				var layer = M.layer(layerName);
								
				if ( layer ) {
					for ( var i = 0; i < this.objects.length; i++ ) {
						layer.remove(this.objects[i]);
					}
				}
				
			}
		}

	};
  /**
   * Adds a game object to a layer. If the layer does not exist it creates it and then adds the object to it.
   */
  Match.prototype.addToLayer = function(layerName, entity) {
    
    if ( !layerName ) {
    	return;
    }
    
    if (!entity) {
      return;
    }
        
    var layer = this.layer(layerName) || this.createGameLayer(layerName);
    
    layer.add(entity);
    
  };
	Match.prototype.push = Match.prototype.add;	
	/**
	 * Pushes a game object, that is an object that implements an onLoop method, to the game object list.
	 * NOTE: If the object does not implement onLoop then this method will throw an Error
	 * @method pushGameObject
	 * @param {GameObject} gameObject the object to push to the game object list
	 */
	Match.prototype.pushGameObject = function(gameObject) {
		
		if ( !gameObject.onLoop ) throw new Error("Cannot add object " + gameObject.constructor.name + ", it doesn't have an onLoop method");
		
    if ( gameObject instanceof this.Entity ) {
			
      this._gameObjects.push(gameObject);
      
      var layer = gameObject.attribute("layer");
      
      if (layer) {
        this.addToLayer(layer, gameObject);
      }
      
		} else {
			this._triggers.push(gameObject);
		}

		// this.onGameObjectPushed.raise();
		this.raise("gameObjectPushed");

	};
	/**
	 * Shortcut to pushGameObject
	 * @method pushObject
	 */
	Match.prototype.pushObject = Match.prototype.pushGameObject;
	/**
	 * Removes an element from the game object list
	 * @method removeGameObject
	 * @param {GameObject} gameObject the object to remove from the game object list
	 */
	Match.prototype.removeGameObject = function( object ) {

		if ( object != undefined ) {

			if ( typeof object == "string" ) {

				this.removeGameObject( this.get( object ) );

			} else if ( isNaN( object ) ) {

				var index = this._gameObjects.indexOf( object );

				if ( index != -1 ) {

					this._gameObjects.splice( index, 1);
					
					// this.onGameObjectRemoved.raise();
					this.raise("gameObjectRemoved");

				}

			} else {

				this._gameObjects.splice( object, 1);
				
				// this.onGameObjectRemoved.raise();
				this.raise("gameObjectRemoved");

			}

		}

	};
	/**
	 * Removes all elements from the game object list
	 * @method removeAllGameObjects
	 */
	Match.prototype.removeAllGameObjects = function() {
		this._gameObjects = new Array();
	};
	/**
	 * Creates a new game layer, adds it to the game layer list and returns it
	 *
	 * @method createGameLayer
	 * @param name name of the layer
	 * @param zIndex z-index of the layer
	 * @return {GameLayer} the newly created layer
	 */
	Match.prototype.createGameLayer = function(name, zIndex) {
		if ( name === undefined ) {
			throw new Error("Cannot create layer. You must name it.");
		}
		var gameLayer = new this.GameLayer(name, zIndex || M._gameLayers.length);
		this.pushGameLayer(name, gameLayer);
		return gameLayer;
	};
	/**
	 * Shortcut to createGameLayer
	 * @method createGameLayer
	 */
	Match.prototype.createLayer = Match.prototype.createGameLayer;
	/**
	 * Adds a game layer to the list of layers
	 *
	 * @method pushGameLayer
	 * @param {GameLayer} gameLayer the layer to add to the list of layers
	 * @example
			var layer = new M.GameLayer();
			M.pushGameLayer(layer);
	 */
	Match.prototype.pushGameLayer = function(name, gameLayer) {
		if ( gameLayer === undefined ) {
			throw new Error("Cannot add null game layer");
		}
		this._gameLayers.set(name, gameLayer);
		this.raise("gameLayerPushed", name);
	};
	/**
	 * Shortcut to pushGameLayer
	 * @method createGameLayer
	 */
	Match.prototype.pushLayer = Match.prototype.pushGameLayer;
	/**
	 * Sets the current scene
	 * @method setScene
	 * @param {Scene} scene the scene to load
	 * @param {Layer} a layer that will be shown when loading
	 * @param {Function} transition the transition applied to the scene that is leaving and the one that is entering
	 */
	Match.prototype.setScene = function (name, callback) {

		var scene = this.getScene(name);

		if ( scene ) {
			this.logger.log("Loading scene by name", name);
		} else {
			this.logger.error("Unable to load scene by name", name, "It could not be found");
			return;
		}

		this.removeScene();

		if ( scene.fullScreen ) {
			this.setFullScreen();
		}
		
		if ( scene.loadingScene ) {
		
			var self = this;
	
			this.setScene(scene.loadingScene, function() {
			
				var soundsReady = false,
					spritesReady = false,
					loadingScene = self.getScene(scene.loadingScene),
					loadingFinished = false,
					checkLoading = function() {
						if ( !loadingFinished && soundsReady && spritesReady ) {
							self.sprites.removeAllEventListeners();
							self.sounds.removeAllEventListeners();
							self.removeAllGameLayers();
							for ( var i in loadingScene.sprites ) {
								if ( scene.sprites[i] == undefined ) {
									self.sprites.remove(i);
								}
							}
							for ( var i in loadingScene.sounds ) {
								if ( scene.sounds[i] == undefined ) {
									self.sounds.remove(i);
								}
							}
              
              if (scene.map) {
                //TODO: Should add to the loading
                M.createMap(scene.map);
              }
              
              if (scene.onLoad) {
                scene.onLoad();
                M.renderer.redrawAllLayers();
              }
              
							loadingFinished = true;
              
						}
					};
					
				if ( scene.sounds ) {
					self.sounds.load(scene.sounds, function() {
						soundsReady = true;
						checkLoading();
					});
				} else {
					soundsReady = true;
				}

				if ( scene.sprites ) {
					self.sprites.load(scene.sprites, function() {
						spritesReady = true;
						checkLoading();
					});
				} else {
					spritesReady = true;
				}
				
				checkLoading();
				
			});
			
		} else {

			var soundsReady = false,
				spritesReady = false,
				loadingFinished = false,
				checkLoading = function() {
					if ( !loadingFinished && soundsReady && spritesReady ) {
						loadingFinished = true;
            
            if (scene.map) {
              //TODO: Should add to the loading
              M.createMap(scene.map);
            }
            
            if (scene.onLoad) {
              scene.onLoad();
              M.renderer.redrawAllLayers();
            } 
            
            if ( callback ) {
              callback();
            }
            
					}
				};

			if ( scene.sounds ) {
				this.sounds.load(scene.sounds, function () {
					soundsReady = true;
					checkLoading();
				});
			} else {
				soundsReady = true;
			}

			if ( scene.sprites ) {

				this.sprites.load(scene.sprites, function () {
					
					//TODO: This is used for scenes that come with the objects and layers already defined
					// for ( var i in scene.layers ) {
					
					// 	var layer = new m.Layer,
					// 		layerData = scene.layers[i];
						
					// 	for ( var j in layerData ) {
						
					// 		var object = layerData[j],
					// 			instance = m._getClassInstance(object.className, object.setAttributes);
								
					// 		if ( object.beforePush ) {
					// 			object.beforePush(instance);
					// 		}
							
					// 		layer.push(instance);
							
					// 	}
						
					// 	m.pushLayer(layer);
						
					// }
					
					// for ( var i in scene.objects ) {
					// 	var object = scene.objects[i],
					// 		instance = m._getClassInstance(object.className, object.setAttributes);
					// 	if ( object.beforePush ) {
					// 		object.beforePush(instance);
					// 	}
					// 	m.pushGameObject(instance);
					// }

					spritesReady = true;
					checkLoading();

				});
			} else {
				spritesReady = true;
			}

			checkLoading();

		}
		
	};
	/**
	 * TODO: Complete JS Doc
	 */
	Match.prototype.removeScene = function() {
		this.removeAllGameObjects();
		this.removeAllGameLayers();
		this.sprites.removeAllEventListeners();
		this.sounds.removeAllEventListeners();
		this.createGameLayer(this.DEFAULT_LAYER_NAME).background = this.DEFAULT_LAYER_BACKGROUND;
		this.raise("sceneRemoved");
	};
	/**
	 * Pushes all provided layers into Match list of game layers
	 */
	Match.prototype.pushScene = function(layers) {
		var i = 0, l = layers.length;
		for ( ; i < l; i++ ) {
			this.pushGameLayer(layers[i]);
		}
		this.raise("scenePushed");
	};
	/**
	 * Removes current layers and oushes all provided layers into Match list of game layers
	 */
	Match.prototype.swapScenes = function(layers) {
		var layers = this.removeScene();
		this.pushScene(layers);
		return layers;
	};
	/**
	 * Removes a game layer from the list of layers
	 *
	 * @method removeGameLayer
	 * @param {GameLayer} gameLayer the layer remove from the list of layers
	 */
	Match.prototype.removeGameLayer = function(name) {
		
		var layer = this._gameLayers.get(name);

		if ( layer ) {

			for ( var i = 0; i < layer.onRenderList.length; i++ ) {
				this.removeGameObject(layer.onRenderList[i]);
			}

			this._gameLayers.remove(name);

			this.renderer._reRenderAllLayers = true;

			this.raise("gameLayerRemoved", name);

			return layer;

		} else {
		
			this.logger.error("could not remove layer by name", name);
		
		}

	};
	/**
	 * Shortcut to removeGameLayer
	 *
	 * @method removeLayer
	 */
	Match.prototype.removeLayer = Match.prototype.removeGameLayer;
	/**
	 * Removes all game layers
	 *
	 * @method removeAllGameLayers
	 */
	Match.prototype.removeAllGameLayers = function() {
		var self = this;
		this._gameLayers.eachKey(function(layer) {
			self.removeGameLayer(layer);
		});
	};
	/**
	 * Returns a speed measured in pixels based on the average fps
	 *
	 * @method getSpeed
	 * @param {int} pixelsPerSecond the amount of pixels that an object should be moved per second
	 * @return {float} the pixels to move the object relative to the average fps of the current device
	 */
	Match.prototype.getSpeed = function( pixelsPerSecond ) {
		return pixelsPerSecond / this.getAverageFps();
	};
	/**
	 * Returns a speed measured in pixels based on the average fps
	 *
	 * @method getSpeed
	 * @param {int} pixelsPerSecond the amount of pixels that an object should be moved per second
	 * @return {float} the pixels to move the object relative to the average fps of the current device
	 */
	Match.prototype.getSpeedFixedAt = function( pixelsPerSecond, fps ) {

		var avgFps = this.getAverageFps();

		return (pixelsPerSecond / avgFps) * (fps / avgFps);

	};
	/**
	 * Gets the current frames per second
	 * @method getFps
	 * @return {int} the frames per second
	 */
	Match.prototype.getFps = function() {
		return this.FpsCounter.fps;
	};
	/**
	 * Gets the average frames per second
	 * @method getAverageFps
	 * @return {int} the average frames per second
	 */
	Match.prototype.getAverageFps = function() {
		return this.FpsCounter.getAverageFps();
	};
	/**
	 * Gets the total game time in seconds
	 * @method getGameTime
	 * @return {int} the total game time in seconds
	 */
	Match.prototype.getGameTime = function() {
		return this.FpsCounter.gameTime;
	};
	/**
	 * Gets the current time in milliseconds measured by the FpsCounter
	 * @method getTime
	 * @return {long} the current time measured in milliseconds
	 */
	Match.prototype.getTime = function() {
		return this.FpsCounter.timeInMillis;
	};
	/**
	 * Immediately clears the front buffer
	 * @method clearFrontBuffer
	 */
	Match.prototype.clearFrontBuffer = function() {
		if ( this.frontBuffer ) {
			this.frontBuffer.clearRect(0, 0, this.frontBuffer.canvas.width, this.frontBuffer.canvas.height);
		}
	};
	/**
	 * Sorts layers based on their z-index
	 * @method sortLayers
	 */
	Match.prototype.sortLayers = function() {
		this._gameLayers._values.sort(function(a, b) {
			return a._zIndex - b._zIndex;
		});
		this._gameLayers._keys = {};
		for ( var i = 0; i < this._gameLayers._values.length; i++ ) {
			this._gameLayers._keys[this._gameLayers._values[i].name] = i;
		}
	};
	/**
	 * Pauses or unpauses the game loop. Also raises the M.onPause or M.onUnPause event provided those are defined
	 * @method pause
	 */
	Match.prototype.pause = function() {
	
		if ( this._isPlaying ) {
			// if ( this.onPause ) this.onPause();
			this.raise("pause");
		} else {
			// if ( this.onUnPause ) this.onUnPause();
			this.raise("unpause");
		}
	
		this._isPlaying = ! this._isPlaying;

	};
	/**
	 * Sets Match to loop through the scene using the provided canvas.
	 * 
	 * Note: If match is paused, to unpause use M.pause(), try not to
	 * call this method again unless you need to change the canvas
	 *
	 * @param {HTMLCanvasElement} canvas the canvas where to perform the rendering
	 * @method start
	 * @example
			//Use canvas by id gameCanvas and use double buffering
			M.start(document.querySelector("#gameCanvas"), true);
	 */
	Match.prototype.start = function(canvas, mode) {

		if ( !canvas ) {
			canvas = M.dom("canvas");
		}

		if ( ! (canvas instanceof HTMLCanvasElement) ) {
			throw new Error("M.start is expecting an HTMLCanvasElement as argument. If there's no canvas in the site, please add one and then call start. If M.autowire is true and there's no canvas on document load please set it to false.");
		}

		canvas.onselectstart = function() { return false; };
		canvas.requestFullScreen = canvas.requestFullScreen || 
								   canvas.webkitRequestFullScreen || 
								   canvas.mozRequestFullScreen || 
								   canvas.msRequestFullScreen;

		canvas.setAttribute("data-engine", this.name);
		canvas.setAttribute("data-version", this.version);

		this.renderer = this.renderingProvider.getRenderer(canvas, mode);

		this._isPlaying = true;

		if ( !this.gameLoopAlreadySetup ) {
			
			this.setUpGameLoop();

			if ( this.showLogo ) {
				this._showLogo();
			} else {
				this._regularStart();
			}

		}


	};
	Match.prototype._regularStart = function() {
		if ( this.gameData && this.gameData.main ) {
			if ( typeof this.gameData.main == "string" ) {
				this.setScene(this.gameData.main);
			} else {
				this.gameData.main();
			}
		} else if ( typeof window.main == "function" ) {
			window.main();
		}
	};
	/**
	 * Removes the provided index from the given array
	 * @method removeIndexFromArray
	 */
	Match.prototype.removeIndexFromArray = function(index, array) {
		array.splice(index, 1);
	};
	/**
	 * Removes the provided elemnt from the given array
	 * @method removeElementFromArray
	 */
	Match.prototype.removeElementFromArray = function(element, array) {

		var index = array.indexOf(element);

		if ( index != -1 ) {

			this.removeIndexFromArray(index, array);

		}

	};
	/**
	 * Returns the HTML element matching the selector.
	 * @method dom
	 * @param {String} selector the selector used to retrieve an element of the dom
	 * @return {HTMLElement} the element or null
	 */
	Match.prototype.dom = function(selector) {
		return document.querySelector(selector);
	};
	/**
	 * Adds variables and function contained in properties to the given object
	 * @method applyProperties
	 * @param {Object} object the object to apply the properties to
	 * @param {Object} properties the properties to apply to the object
	 * @param {Array} mandatoryList an array containing the mandatory properties to apply and that should be present in properties
	 */
	Match.prototype.applyProperties = function(object, properties, mandatoryList) {

		if ( ! object ) return;
		if ( ! properties ) return;

		if ( mandatoryList ) {

			if ( ! properties ) {
				throw new Error("Cannot apply null properties to " + object.constructor.name);
			}

			var i = mandatoryList.length;

			while ( i-- ) {
				if ( ! properties[mandatoryList[i]] ) throw new Error("Unable to apply properties to [" + object.constructor.name + "] You must specify [" + mandatoryList[i] + "]");
			}

		}

		var setter = "";
		for ( var i in properties ) {
			setter = "set" + i.charAt(0).toUpperCase() + i.substr(1);
			if ( object[ setter ] ) {
				object[ setter ]( properties[i] );
			} else {
				object[ i ] = properties[ i ];
			}
		}

		return object;

	};

	/**
	 * Adds variables and function contained in properties to the given object
	 * @method apply
	 */
	Match.prototype.apply = function() {

		var child = arguments[0];

		for ( var i = 1; i < arguments.length; i++ ) {

			var parent = arguments[i];

			if ( parent ) {

				if ( parent instanceof Function ) {

					var p = new parent();

					for ( var j in p ) {

						if ( ! parent.prototype[j] && ! child[j] ) {
							child[j] = p[j];
						}

					}

				} else {

					for ( var j in parent ) {

						if ( ! child[j] ) {
							child[j] = parent[j];
						}

					}

				}

			}

		}

	};
	/**
	 * Puts every element at "from" into "into"
	 * @method put
	 * @param {Object} into where to copy the elements
	 * @param {Object} from where to take the elements
	 */
	Match.prototype.put = function( into, from ) {

		for ( var i in from ) {
			into[i] = from[i];
		}

	};
	/**
	 * Creates a copy of the given object
	 * @method put
	 * @param {Object} object to clone
	 * @return {Object} an object with the same properties and methods of the argumetn object
	 */
	Match.prototype.clone = function(object) {

		var clonedObject = {};

		for ( var i in object ) {
			c[i] = object[i];
		}

		return clonedObject;

	};
	/**
	 * Iterates through an array and call the func method
	 * @method each
	 * @param {Array} array the array of objects to apply the function
	 * @param {Function} func the function to execute
	 * @param {Object} context the object to apply the function
	 */
	Match.prototype.each = function( array, func, context ) {

		var i = array.length;

		if ( context ) {

			while ( i-- ) {

				func.call( context, array[i] );

			}

		} else {

			while ( i-- ) {

				func.call( array[i] );

			}

		}

	};
	/**
	 * Adds parent prototype methods to the childs prototype
	 * @method each
	 * @param {Object} descendant object to put the methods from the parents prototype
	 * @param {Object} parent where to take the methods to put in descendant
	 */
	Match.prototype.extend = Class.extend;
	/**
	 * Rounds a number to the specified decimals
	 * @method round
	 * @param {int} number the number to round
	 * @param {int} decimals the decimals to use
	 */
	Match.prototype.round = function( number, decimals ) {
		var a = "1";
		while ( decimals-- ) {
			a += "0";
		}
		decimals = parseInt( a );
		return Math.round( number * decimals ) / decimals;
	};
	Match.prototype.fastRoundTo = function( number, decimals ) {
		return this.fastRound( number * decimals ) / decimals;
	};
	/**
	 * Rounds a number down using the fastest round method in javascript.
	 * @see http://jsperf.com/math-floor-vs-math-round-vs-parseint/33
	 * @method round
	 * @param {double} number the number to round
	 * @return {int}
	 */
	Match.prototype.fastRound = function(n) {
		// return number >> 0;
		return (0.5 + n) << 0;
	};
	/**
	 * Returns the a number indicating what percentage represents the given arguments
	 * @method getPercentage
	 * @param {int} part the part that needs to be turn into a percentage
	 * @param {int} of the total amount
	 */
	Match.prototype.getPercentage = function( part, of ) {
		return part * of / 100;
	};
	/**
	 * Returns true if the given time has passed from milliseconds
	 * @method elapsedTimeFrom
	 * @param {long} from time from where to check
	 * @param {long} milliseconds amount of milliseconds that could have passed since from
	 */
	Match.prototype.elapsedTimeFrom = function( from, milliseconds ) {
		return M.getTime() - from >= milliseconds;
	};
	/**
	 * Returns true if Match looping if paused
	 * @method isPaused
	 * @return {Boolean} returns true if game loop is active false if not
	 */
	Match.prototype.isPaused = function() {
		return !this._isPlaying;
	};
	/**
	 * Returns the css style sheet that matches the given selector
	 * @method getStyleBySelector
	 * @param {String} selector the css selector
	 * @return {CSSStyleDeclaration} returns the css style matching the given selector
	 */
	Match.prototype.getStyleBySelector = function( selector ) {
		var sheetList = document.styleSheets,
			ruleList,
			i, j;

		/* look through stylesheets in reverse order that they appear in the document */
		for (i=sheetList.length-1; i >= 0; i--) {
			ruleList = sheetList[i].cssRules;
			for (j=0; j<ruleList.length; j++) {
				if (ruleList[j].type == CSSRule.STYLE_RULE && ruleList[j].selectorText == selector) {
					return ruleList[j].style;
				}
			}
		}
		return null;
	};
	Match.prototype.setFullScreen = function() {
		// if ( this.frontBuffer && this.frontBuffer.canvas.requestFullScreen ) {
		// 	this.frontBuffer.canvas.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		// }
		if ( this.renderer ) {
			this.renderer.setFullScreen();
		} else {
			throw new Error("Cannot set fullScreen. You must call M.start() to set the canvas");
		}
	};
	Match.prototype.getCenter = function() {
		return this.renderer.getCenter();
	};
	Match.prototype.getSize = function() {
		return this.renderer.getViewportSize();
	};
	Match.prototype.getObjectName = function(object) {
		if (!object || !object.constructor) {
			return object;
		}
		var name = object.constructor.name;
		if ( !name ) {
			name = object.constructor.toString().match(/function ([a-zA-Z_$][a-zA-Z_$0-9]*)/)[1];
		}
		return name;
	};
	Match.prototype.getLayerNames = function() {
		return Object.keys(this._gameLayers._keys);
	};

	Class.extend(Match, ModuleManager);
	Class.extend(Match, EventHandler);
	
	if ( !window.requestAnimationFrame ) {

		window.requestAnimationFrame = 
			window.webkitRequestAnimationFrame	|| 
			window.mozRequestAnimationFrame		|| 
			window.oRequestAnimationFrame		|| 
			window.msRequestAnimationFrame		||
			function( callback ) { 
				setTimeout(callback, 1000 / 60);
			};

	}

	/* Set up namespace and global Match definition. Match is static. */
	namespace.M = namespace.Match = new Match();

	/**
	 * This is the game loop function that is called by the thread created
	 * by Match. It loops through the Match onLoopList calling the onLoop
	 * method of each of the contained objects.
	 *
	 *
	 * @private
	 * @method gameLoop
	 *
	 */
	/*
	 * NOTE: cancelRequestAnimationFrame has not been implemented in every
	 * browser so we just check Match state to know whether to loop or not.
	 */
	function gameLoop() {
		M.gameLoop();
		requestAnimationFrame(gameLoop);
	}

})(window);
(function( M ) {

	function Ajax() {
	}

	Ajax.prototype._request = function(method, url, callback, owner) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if ( this.readyState == 4 && this.status == 200 ) {
				if ( owner ) {
					callback.call(owner, this.responseText);
				} else {
					callback(this.responseText);
				}
			}
		};
		xmlhttp.open(method, url, true);
		xmlhttp.send();
	};

	Ajax.prototype.post = function(url, callback) {
		this._request("POST", url, callback);
	};

	Ajax.prototype.get = function(url, callback) {
		this._request("GET", url, callback);
	};

	M.Ajax = new Ajax();

})( window.Match );
/**
 * @module Match
 */
(function(M) {

	/**
	 * Counts the amount of frames per second that Match takes to loop through the scenes
	 * @class FpsCounter
	 * @static
	 * @constructor
	 */
	function FpsCounter() {

		/**
		 * Last time used to measeure the fps
		 * @property lastTime
		 * @private
		 * @type long
		 */
		this.lastTime = new Date().getTime();
		/**
		 * Amount of fps counted up to a certain moment
		 * @property _currentFps
		 * @private
		 * @type int
		 */
		this._currentFps = 0;
		/**
		 * Frames per second
		 * @property fps
		 * @readOnly
		 * @type int
		 */
		this.fps = "";
		/**
		 * Elapsed time since starting counting fps
		 * @property gameTime
		 * @readOnly
		 * @type int
		 */
		this.gameTime = 1;
		/**
		 * Current time in milliseconds
		 * @property timeInMillis
		 * @readOnly
		 * @type int
		 */
		this.timeInMillis = 0;
		/**
		 * Total fps counted
		 * @property totalFps
		 * @readOnly
		 * @type int
		 */
		this.totalFps = 0;

	}
	/**
	 * Resets the fps count
	 * @method reset
	 */
	FpsCounter.prototype.reset = function() {
		this.fps = "";
		this.totalFps = 0;
		this._currentFps = 0;
		this.timeInMillis = 0;
		this.gameTime = 1;
	};
	/**
	 * Counts the fps. If elapsed time since last call is greater than 1000ms then counts
	 * @method count
	 */
	FpsCounter.prototype.count = function() {

		this.timeInMillis = new Date().getTime();

		if ( this.timeInMillis - this.lastTime >= 1000 ) {

			this.lastTime = this.timeInMillis;
			this.fps = this._currentFps;
			this.gameTime++;
			this.totalFps += this.fps;
			this._currentFps = 0;

		} else {

			this._currentFps++;

		}

	};
	/**
	 * Returns the average fps since using the total fps counted so far
	 * @method getAverageFps
	 * @return {int}
	 */
	FpsCounter.prototype.getAverageFps = function() {
		if ( this.totalFps == 0 ) return 60;
		return Math.floor(this.totalFps / this.gameTime);
	};

	M.FpsCounter = new FpsCounter();

})(window.Match);
/**
 * @module Match
 */
(function (M) {
	/**
	 * Basic object for every game
	 *
	 * @class GameObject
	 * @constructor
	 */
    function GameObject() {
		/**
		 * Focus indicator. Determines whether the object is focused and will accept keyboard input or not
		 * @property hasFocus
		 * @type Boolean
		 */
		this.hasFocus = false;
	}
	/**
	 * Abstract method that is called once per game loop.
	 * Every object pushed into Match list or GameLayer
	 * must override this method
	 * @method onLoop
	 * @protected
	 */
	GameObject.prototype.onLoop = function() {
		throw new Error("Method GameObject.onLoop is abstract and must be overriden");
	};
	
    M.GameObject = GameObject;
	
	/**
	 * Supports on loop events
	 * @class GameObjectWithEvents
	 * @extends GameObject
	 */
	 /**
	 * Mappings for the keydown event. Maps a key to a method of this object by name
	 * Object must have focus for this to be executed
	 * @property keyDownMappings
	 * @protected
	 * @type Object object of the like of a String-String Map. Contains a key mapped to the name of the method of this object
	 * @example
			//Provided this object has a method called moveLeft
			this.keyDownMappings = {
				"left": "moveLeft"
			}
	 */
	/**
	 * Mappings for the keyup event. Maps a key to a method of this object by name.
	 * Object must have focus for this to be executed.
	 * @property keyUpMappings
	 * @protected
	 * @type Object object of the like of a String-String Map. Contains a key mapped to the name of the method of this object
	 * @example
		//Provided this object has a method called jump
		this.keyDownMappings = {
			"up": "jump"
		}
	 */
	/**
	 * Method to be executed in the case of a keydown event
	 * NOTE: You must override this method in the prototype
	 * @method onKeyDown
	 * @protected
	 * @param {Object} keysDown object of the like of a String-Boolean Map. Contains the name of the keys that are being pressed and true if that is the case
	 */ 
	/**
	 * Method to be executed in the case of a keydup event.
	 * NOTE: You must override this method in the prototype
	 * @method onKeyUp
	 * @protected
	 * @param {Object} keysUp object of the like of a String-Boolean Map. Contains the name of the keys that where just released and true if that is the case
	 */
	/**
	 * Method to be executed in the case of a mouse down event.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseDown
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed in the case of a mouse up event.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseUp
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse enters this object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseIn
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse is moved in this object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseMove
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse leaves this object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseOut
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the in the case of a click event.
	 * NOTE: You must override this method in the prototype
	 * @method onClick
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse left button is down and the mouse moves.
	 * NOTE: You must override this method in the prototype
	 * @method onDrag
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the in the case of a mouse wheel event.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseWheel
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed if the mouse if over the object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseOver
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */

	 GameObject.name = "GameObject";
	
})(window.M);
/**
 * @module Match
 */
(function(namespace) {

	/**
	 * Provides methods for common 2d Math operations
	 * 
	 * @class Math2d
	 * @static
	 * @constructor
	 */
	function Math2d() {
		this.math = Math;
	}

	/**
	 * Returns true if value is between a and b or false
	 *
	 * @method valueInBetween
	 * @param {Number} value the value
	 * @param {Number} a  between a
	 * @param {Number} b  and between b
	 * @return {float}
	 */
	Math2d.prototype.valueInBetween = function(value, a, b) {
		return a <= value && value <= b;
	};
	/**
	 * Returns x value matching the corresponding parameters of a circle
	 *
	 * @method getXFromCircle
	 * @param x0 - Center in the x axis
	 * @param r  - Circle radius
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getXFromCircle = function(x0, r, t) {
		return x0 + r * this.math.cos(t);
	};
	/**
	 * Returns y value matching the corresponding parameters of a circle
	 * @method getYFromCircle
	 * @param y0 - Center in the y axis
	 * @param r  - Circle radius
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getYFromCircle = function(y0, r, t) {
		return y0 + r * this.math.sin(t);
	};
	/**
	 * Returns a point containing x and y values matching the corresponding parameters of an elipsis
	 * @method getPointFromCircle
	 * @param x0 - Center in the x axis
	 * @param y0 - Center in the y axis
	 * @param r  - Circle radius
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getPointFromCircle = function( x0, y0, r, t ) {
		return this.getPointFromElipsis( x0, y0, r, r, t );
	};
	/**
	 * Returns a point containing x and y values matching the corresponding parameters of an elipsis
	 * @method getPointFromElipsis
	 * @param x0 - Center in the x axis
	 * @param y0 - Center in the y axis
	 * @param rX - Elipsis radius in x axis
	 * @param rY - Elipsis radius in y axis
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getPointFromElipsis = function( x0, y0, xR, yR, t ) {
		return new Vector2d( this.getXFromCircle( x0, xR, t ), this.getYFromCircle( y0, yR, t ) );
	};
    /**
	 * Returns a 2d vector given 2 vectors
	 * @method getVector2d
	 * @param {Vector2d} vector1
	 * @param {Vector2d} vector2
     * @return {Vector2d}
	 */
	Math2d.prototype.getVector2d = function(vector1, vector2) {
		return new Vector2d( vector2.x - vector1.x, vector2.y - vector1.y );
	};       
	/**
	 * Returns a 2d vector given 2 vectors
	 * @method getVector
	 * @param {Vector2d} vector1
	 * @param {Vector2d} vector2
     * @return {Vector2d}
	 */
	Math2d.prototype.getVector = function(vector1, vector2) {
		return this.getVector2d( vector1, vector2 );
	};
	/**
	 * Returns the vector rotated
	 * @method getRotatedVertex
	 * @param {Vector2d} vertex
	 * @param {float} rotation
	 * @return {Vector2d}
	 */
	Math2d.prototype.getRotatedVertex = function(vertex, rotation) {
		return this.getRotatedVertexCoords(vertex.x, vertex.y, rotation);
	};
	Math2d.prototype.getRotatedVertexCoordsX = function(x, y, rotation) {
		return x * this.math.cos(rotation) - y * this.math.sin(rotation);
	};
	Math2d.prototype.getRotatedVertexCoordsY = function(x, y, rotation) {
		return y * this.math.cos(rotation) + x * this.math.sin(rotation);
	};
	/*
	 * Returns the vector rotated
	 * @method getRotatedVertexCoords
	 * @param {float} x
	 * @param {float} y
	 * @param {float} rotation
	 * @return {Vector2d}
	 */
	Math2d.prototype.getRotatedVertexCoords = function(x, y, rotation) {
		return new Vector2d( this.getRotatedVertexCoordsX(x, y, rotation), this.getRotatedVertexCoordsY(x, y, rotation) );
	};
   /**
	* Returns the magnitude of a vector
	* @method getMagnitude
	* @param {Vector2d} vector
	* @return {float}
	*/
	Math2d.prototype.getMagnitude = function(vector) {
		return this.math.sqrt(vector.x * vector.x + vector.y * vector.y);
	};
   /**
	* Returns the distance between two vectors without calculating squareroot
	* @method getSquareDistance
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getSquareDistance = function(vector1, vector2) {

		var x = vector1.x - vector2.x;
		var y = vector1.y - vector2.y;

		return x*x + y*y;

	};
   /**
	* Returns the angle between two vectors
	* @method getAngleBetweenVectors
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getAngleBetweenVectors = function(vector1, vector2) {

		var m = this.getMagnitude(vector1) * this.getMagnitude(vector2);

		return this.math.acos((vector1.x * vector2.x + vector1.y * vector2.y) / m);

	};
   /**
	* Returns the cos between two vectors
	* Returns the angle between two vectors
	* @method getCosBetweenVectors
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getCosBetweenVectors = function(vector1, vector2) {
	
		var m = this.getMagnitude(vector1) * this.getMagnitude(vector2);

		return (vector1.x * vector2.x + vector1.y * vector2.y) / m;

	};
   /**
	* Returns the distance between two vectors
	* @method getDistance
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getDistance = function(vector1, vector2) {
		return this.math.sqrt(this.getSquareDistance(vector1, vector2));
	};
   /**
	* Returns true if the provided vectors have the same direction
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Boolean}
	*/
	Math2d.prototype.haveTheSameDirection = function(vector1, vector2) {

		if ( vector1.x > 0 && vector2.x < 0 ) return false;
		if ( vector1.x < 0 && vector2.x > 0 ) return false;
		if ( vector1.y > 0 && vector2.y < 0 ) return false;
		if ( vector1.y < 0 && vector2.y > 0 ) return false;

		return true;

	};
   /**
	* Returns true if the provided vectors are parallel
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Boolean}
	*/
	Math2d.prototype.areParallelVectors = function(vector1, vector2) {

		vector1 = this.getNormalized( vector1 );
		vector2 = this.getNormalized( vector2 );

		var x = vector1.x / vector2.x,
			y = vector1.y / vector2.y;

		return x >= y - 0.1 && x <= y + 0.1;

	};
   /**
	* Returns the vector normalized
	* @param {Vector2d} vector
	* @return {Vector2d}
	*/
	Math2d.prototype.getNormalized = function(vector) {

		var magnitude = this.getMagnitude(vector);
	
		return new Vector2d( vector.x / magnitude, vector.y / magnitude );
	
	};
   /**
	* Returns the resulting vector of a substraction
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Vector2d}
	*/
	Math2d.prototype.substract = function(vector1, vector2) {
		return new Vector2d( vector1.x - vector2.x, vector1.y - vector2.y );
	};
   /**
	* Returns the resulting vector of a add
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Vector2d}
	*/
	Math2d.prototype.add = function(vector1, vector2) {
		return new Vector2d( vector1.x + vector2.x, vector1.y + vector2.y );
	};
   /**
	* Returns the product from a vector an a number
	* @param {Vector2d} vector
	* @param {float} scalar
	* @return {Vector2d}
	*/
	Math2d.prototype.scalarProduct = function(vector, scalar) {
		return new Vector2d( vector.x * scalar, vector.y * scalar );
	};
   /**
	* Rotates vector1 by rotation to make it closer to vector2 and returns the rotation
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @param {float} rotation the angle to add to the vector
	* @return {float}
	*/
	Math2d.prototype.rotateIfNeeded = function( vector1, vector2, rotation ) {

		if ( ! ( this.areParallelVectors( vector1, vector2 ) && this.haveTheSameDirection( vector1, vector2 ) ) ) {

			var distance = this.getSquareDistance( vector1, vector2 ),
				rotated1 = this.getRotatedVertex( vector1, rotation ),
				distanceAfterRotation = this.getSquareDistance( rotated1, vector2 );

			if ( distanceAfterRotation < distance ) {
				vector1.x = rotated1.x;
				vector1.y = rotated1.y;
				return rotation;
			} else {
				var rotated2 = this.getRotatedVertex( vector1, -rotation );
				vector1.x = rotated2.x;
				vector1.y = rotated2.y;
				return -rotation;
			}

		}

		return 0;

	};
  /**
   * Given a matrix [[a11,a12,a13, b1], [a21, a22, a23, b2], [a31, a32, a33, b3]] solves values of a, b and c and so on
   * by Gauss
   */
  Math2d.prototype.gauss = function(A) {
    
    var n = A.length;

    for (var i=0; i<n; i++) {
        // Search for maximum in this column
        var maxEl = Math.abs(A[i][i]);
        var maxRow = i;
        for(var k=i+1; k<n; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row (column by column)
        for (var k=i; k<n+1; k++) {
            var tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (k=i+1; k<n; k++) {
            var c = -A[k][i]/A[i][i];
            for(var j=i; j<n+1; j++) {
                if (i==j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
        }
    }

    // Solve equation Ax=b for an upper triangular matrix A
    var x = new Array(n);
    for (var i=n-1; i>-1; i--) {
        x[i] = A[i][n]/A[i][i];
        for (var k=i-1; k>-1; k--) {
            A[k][n] -= A[k][i] * x[i];
        }
    }
    return x;
  }
  
  Math2d.prototype.quadDerivative = function(ax2, bx, c) {
    return [ax2 * 2, bx];
  };

 /**
	* @class Vector2d
	* @constructor
	* @param {float} x
	* @param {float} y
	* @private
	*/
	function Vector2d(x, y) {
		this.x = x || 0;
		this.y = y || 0;
		this.prevX = 0;
		this.prevY = 0;
	}
	Vector2d.prototype.offset = function(x, y) {
		this.set(this.x + x, this.y + y);
		return this;
	};
	Vector2d.prototype.set = function(x, y) {
		this.setX(x);
		this.setY(y);
		return this;
	};
	Vector2d.prototype.reset = function() {
		return this.set(0, 0);
	};
	Vector2d.prototype.setX = function(x) {
		this.prevX = this.x;
		this.x = x;
		return this;
	};
	Vector2d.prototype.setY = function(y) {
		this.prevY = this.y;
		this.y = y;
		return this;
	};
	Vector2d.prototype.rotate = function(rotation) {
		this.setX(instance.getRotatedVertexCoordsX(this.x, this.y, rotation));
		this.setY(instance.getRotatedVertexCoordsY(this.x, this.y, rotation));
		return this;
	};

	namespace.Vector2d = Vector2d;
	
	var instance = new Math2d();

	namespace.math2d = namespace.Math2d = instance;
	namespace.math2d.Vector2d = Vector2d;
	
})(window.Match);
/**
 * @module Match
 */
(function(M, EventHandler) {

	/**
	 * Provides a Camera for easy scene displacement
	 * 
	 * @class Camera
	 * @static
	 * @constructor
	 */
	function Camera() {
	
		this.extendsEventHandler();

		/**
		 * The x coordinate
		 * @property x
		 * @private
		 * @type float
		 */
		this._x = 0;
		/**
		 * The y coordinate
		 * @property y
		 * @private
		 * @type float
		 */
		this._y = 0;
		this._prevX = 0;
		this._prevY = 0;
		/**
		 * Represents the width of the viewable area
		 * @property viewportWidth
		 * @type float
		 */
		this.viewportWidth = 0;
		/**
		 * Represents the height of the viewable area
		 * @property viewportHeight
		 * @type float
		 */
		this.viewportHeight = 0;
		/**
		 * Represents the half height of the viewable area
		 * @property _halfViewportHeight
		 * @type float
		 * @private 
		 */
		this._halfViewportHeight = 0;
		/**
		 * Represents the half width of the viewable area
		 * @property _halfViewportWidth
		 * @type float
		 * @private 
		 */
		this._halfViewportWidth = 0;
		
		this._boundingArea = null;
		
	}
	Camera.prototype.setBoundingArea = function(left, top, right, bottom) {
		this._boundingArea = {
			minX: left,
			minY: top,
			maxX: right,
			maxY: bottom
		}
	};
	/**
	 * Sets viewport width, hight and halfs sizes
	 * @method setViewport
	 * @param {int} width
	 * @param {int} height
	 */
	Camera.prototype.setViewport = function(width, height) {
	
		this.viewportWidth = width;
		this.viewportHeight = height;
		
		this._halfViewportWidth = width / 2;
		this._halfViewportHeight = height / 2;
		
	}
	/**
	 * Centers the camera at the given Renderizable
	 * @method centerAtRenderizable
	 * @param {renderers.Renderizable} renderizable
	 */
	Camera.prototype.centerAtRenderizable = function(renderizable) {
		this.centerAt(renderizable._x, renderizable._y);
	};
	/**
	 * Centers the camera at the given coordinates
	 * @method centerAt
	 * @param {x} integer
	 * @param {y} integer
	 */
	Camera.prototype.centerAt = function(x, y) {

		x = x - this._halfViewportWidth;
		y = y - this._halfViewportHeight;

		if ( this._boundingArea ) {
			if ( x < this._boundingArea.minX ) {
				x = this._boundingArea.minX;
			}
			if ( y < this._boundingArea.minY ) {
				y = this._boundingArea.minY;
			}
			if ( x > this._boundingArea.maxX ) {
				x = this._boundingArea.maxX;
			}
			if ( y > this._boundingArea.maxY ) {
				y = this._boundingArea.maxY;
			}
		}

		this.setX(x);
		this.setY(y);

	};

	Camera.prototype.setX = function(value) {
		this._prevX = this._x;
		this._x = value;
		this.raiseEvent("locationChanged");
	};

	Camera.prototype.setY = function(value) {
		this._prevY = this._y;
		this._y = value;
		this.raiseEvent("locationChanged");
	};

	Camera.prototype.reset = function() {
		this.setX(0);
		this.setY(0);
	};

	Camera.prototype.getX = function() {
		return this._x;
	};

	Camera.prototype.getY = function() {
		return this._y;
	};
	
	Camera.prototype.offsetX = function(value) {
		this.setX(this._x + value);
	};

	Camera.prototype.offsetY = function(value) {
		this.setY(this._y + value);
	};

	Camera.prototype.offset = function(x, y) {
		this.offsetX(x);
		this.offsetY(y);
	};

	Camera.prototype.getLeftFromLayer = function(layer) {
		return this._x * layer.parrallaxFactor.x;
	};

	Camera.prototype.getTopFromLayer = function(layer) {
		return this._y * layer.parrallaxFactor.y;
	};

	Camera.prototype.getBottomFromLayer = function(layer) {
		return this.getTopFromLayer(layer) + this.viewportHeight;
	};

	Camera.prototype.getRightFromLayer = function(layer) {
		return this.getLeftFromLayer(layer) + this.viewportWidth;
	};
	/**
	 * We use Square collision detection to determine if the
	 * object is visible or not
	 */
	Camera.prototype.canSee = function(renderizable, parrallaxFactorX, parrallaxFactorY) {
		
		if ( renderizable._alpha == 0 || !renderizable._visible ) return false;
		
		var sizeObj = 0;
		
		if ( renderizable._halfWidth > renderizable._halfHeight ) {
			sizeObj = renderizable._halfWidth;
		} else {
			sizeObj = renderizable._halfHeight;
		}

		if ( this._y + this.viewportHeight < renderizable.getTop() * parrallaxFactorY ) return false;
		if ( this._y - this.viewportHeight > renderizable.getBottom() * parrallaxFactorY ) return false;
		if ( this._x + this.viewportWidth < renderizable.getLeft() * parrallaxFactorX ) return false;
		if ( this._x - this.viewportWidth > renderizable.getRight() * parrallaxFactorX ) return false;
		
		return true;
		
	};
	
	M.extend(Camera, EventHandler);

	M.Camera = Camera;

})(Match, EventHandler);
/**
 * @module Match
 */
(function(namespace, M) {

	/**
	 * @class Particle
	 * @namespace visual
	 * @constructor
	 * @param {Vector2d} origin
	 * @param {Vector2d} destination
	 * @param {float} width
	 * @param {float} height
	 * @param {String} fillStyle
	 */
	function Particle(origin, destination, width, height, fillStyle) {
		this.angle = 0;
		this._rotationSpeed = 0.1;
		this.speed = 0.05;
		this.vanishRate = 0.005;
		this.alpha = 1;
		this.setPath(origin, destination);
		this.setWidth(width);
		this.setHeight(height);
	}
	/**
	 * @method setWidth
	 * @param {float} width
	 */
	Particle.prototype.setWidth = function(width) {
		this._halfWidth = width / 2;
	};
	/**
	 * @method setHeight
	 * @param {float} height
	 */
	Particle.prototype.setHeight = function(height) {
		this._halfHeight = height / 2;
	};
	/**
	 * @method setPath
	 * @param {Object} origin Object containing origin x and y coordinates
	 * @param {Object} destination Object containing destination x and y coordinates
	 */
	Particle.prototype.setPath = function(origin, destination) {

		this._x = origin.x;
		this._y = origin.y;

		this.direction = M.math2d.getVector2d(origin, destination);

	};
	/**
	 * Updates the particle
	 * @method onLoop
	 * @protected
	 */
	Particle.prototype.onLoop = function() {

		this.alpha -= this.vanishRate;

		this.angle += this._rotationSpeed;
		this._x += this.speed * this.direction.x;
		this._y += this.speed * this.direction.y;

	};
	/**
	 * Renders the particle
	 * @method onRender
	 */
	Particle.prototype.onRender = function(context, canvas, cameraX, cameraY) {

		if ( this.alpha >= 0 ) {

			context.save();
			context.globalAlpha = this.alpha;
			context.translate(this._x - cameraX, this._y - cameraY);
			context.rotate(this.angle);
			context.fillStyle = this.fillStyle;
			context.fillRect(-this._halfWidth, -this._halfHeight, this._halfWidth, this._halfHeight);
			context.restore();

		}

	};
	/**
	 * Sets the zIndex of this object
	 * @method setZIndex
	 * @param {int} value the zIndex
	 */
	Particle.prototype.setZIndex = function (value) {
        this._zIndex = value;
    };
	/**
	 * Returns whether this object is visible and is inside the given viewport
	 *
	 * @method isVisible
	 * @param {float} cameraX0 the left coordinate of the camera
	 * @param {float} cameraY0 the top coordinate of the camera
	 * @param {float} cameraX1 the right coordinate of the viewport
	 * @param {float} cameraY1 the bottom coordinate of the viewport
	 * @return {Boolean}
	 */
	Particle.prototype.isVisible = function(cameraX0, cameraY0, cameraX1, cameraY1) {
		if ( this.alpha <= 0 ) {
			return false;
		}
		var camera = M.camera;
		if (this._y + this._halfHeight < cameraY0) return false;
		if (this._y - this._halfHeight > cameraY1) return false;
		if (this._x + this._halfWidth < cameraX0) return false;
		if (this._x - this._halfWidth > cameraX1) return false;
		return true;
	};

	/*
	 * Creates linear particles and returns them as in array
	 * @param amount of particles
	 * @param departure x
	 * @param departure y
	 * @param direction in which the particles will move
	 * @param min width of the particles
	 * @param min height of the particles
	 * @param max width of the particles
	 * @param max height of the particles
	 * @param min speed of the particles
	 * @param max speed of the particles
	 * @param color of the particles - if not provided an explosion color will be applied
	 */
	function createLinearParticles(amount, origin, direction, minWidth, minHeight, maxWidth, maxHeight, minSpeed, maxSpeed, color, vanishRate, maxVanishRate) {

		var lib = M.Math2d;

		var particles = [];

		for ( var i = 0; i < amount; i++) {

			var particle = new Particle(origin, { x: origin.x + direction.x * 5, y: origin.y + direction.y * 5});

			particle.setWidth(lib.randomInt(minWidth, maxWidth));
			particle.setHeight(lib.randomInt(minHeight, maxHeight));

			if ( ! color ) {
				switch ( lib.randomInt(0,2) ) {
					case 0:
						particle.color = "rgb(255, 128, 0)";
						break;
					case 1:
						particle.color = "rgb(255, 180, 0)";
						break;
					case 2:
						particle.color = "rgb(255, 80, 0)";
				}
			} else {
				particle.color = color[lib.randomInt(0, color.length - 1)];
			}

			if ( maxVanishRate ) {
				particle.vanishRate = lib.randomFloat( vanishRate, maxVanishRate );
			} else if ( vanishRate ) {
				particle.vanishRate = vanishRate;
			}

			particle.speed = lib.randomFloat(minSpeed, maxSpeed);

			particles.push(particle);

		}

		return particles;

	}

	/**
	 * @class RadialParticleEmitter
	 * @constructor
	 * @namespace visual
	 * @constructor
	 * @param {int} amount amount of particles
	 * @param {Array} color array of Strings with posible colors
	 * @param {float} minWidth min width of the particles
	 * @param {float} minHeight min height of the particles
	 * @param {float} maxWidth max width of the particles
	 * @param {float} maxHeight max height of the particles
	 * @param {float} minSpeed min speed of the particles
	 * @param {float} maxSpeed max speed of the particles
	 * @param {float} vanishRate if not provided will default to 0.01 @see particle.vanishRate
	 */
	function RadialParticleEmitter(amount, color, minWidth, minHeight, maxWidth, maxHeight, minSpeed, maxSpeed, vanishRate) {
		if ( ! this.minAngle ) this.minAngle = 0;
		if ( ! this.maxAngle ) this.maxAngle = 6.28;
		this.amount = amount;
		this.color = color;
		this.minWidth = minWidth || 1;
		this.minHeight = minHeight || 1;
		this.maxWidth = maxWidth || 3;
		this.maxHeight = maxHeight || 3;
		this.minSpeed = minSpeed || 0.01;
		this.maxSpeed = maxSpeed || 0.1;
		this.vanishRate = vanishRate;
	}

	RadialParticleEmitter.prototype.onLoop = function() {
		if ( !this.children ) return;
		var i = 0, l = this.children.length, notVisible = 0, currentParticle;
		for ( ; i < l; i++ ) {
			currentParticle = this.children[i];
			if ( currentParticle.alpha <= 0 ) {
				notVisible++;
			} else {
				currentParticle.onLoop();
			}
		}
		if ( notVisible == l ) {
			this.children = null;
		} else {
			// this.notifyChange();
		}
	};

	RadialParticleEmitter.prototype.onRender = function () {
	};

	RadialParticleEmitter.prototype.isVisible = function() {
		return true;
	};

	RadialParticleEmitter.prototype.setZIndex = function (value) {
		this._zIndex = value;
		// this.notifyChange();
		// this.notifyZIndexChange();
	};
	/**
	 * Creates particles that will move from the center to another part of a circle
	 * @method create
	 * @param {int} x the x center at where to create the particles
	 * @param {int} y the y center at where to create the particles
	 */
	RadialParticleEmitter.prototype.create = function(x, y) {

		var rnd = M.random;

		this.children = new Array();

		for ( var i = 0; i < this.amount; i++) {

			/* t E [0, 2 * PI] */
			var t = rnd.decimal(this.minAngle, this.maxAngle),
			/* Radius */
			r = 50,
			origin = new Object(),
			destination = new Object(),
			particle;

			origin.x = x;
			origin.y = y;

			destination.x = x + r * Math.cos(t);
			destination.y = y + r * Math.sin(t);

			particle = new Particle(origin, destination);

			particle.setWidth(rnd.integer(this.minWidth, this.maxWidth));
			particle.setHeight(rnd.integer(this.minHeight, this.maxHeight));

			if ( !this.color ) {
				switch ( rnd.integer(0,2) ) {
					case 0:
						particle.fillStyle = "rgb(255, 128, 0)";
						break;
					case 1:
						particle.fillStyle = "rgb(255, 180, 0)";
						break;
					default:
						particle.fillStyle = "rgb(255, 80, 0)";
				}
			} else {
				particle.fillStyle = this.color[rnd.integer(0, color.length - 1)];
			}

			if ( this.vanishRate ) {
				particle.vanishRate = this.vanishRate;
			}

			particle.speed = rnd.decimal(this.minSpeed, this.maxSpeed);

			this.children.push(particle);

		}

	};

	/**
	 * @class LinearParticleEmitter
	 * @constructor
	 * @namespace visual
	 * @constructor
	 * @param {int} particleAmount
	 * @param {String} color
	 * @param {float} [minWidth]
	 * @param {float} [minHeight]
	 * @param {float} [maxWidth]
	 * @param {float} [maxHeight]
	 * @param {float} [minSpeed]
	 * @param {float} [maxSpeed]
	 * @param {float} [vanishRate]
	 */
	function LinearParticleEmitter(amount, color, minWidth, minHeight, maxWidth, maxHeight, minSpeed, maxSpeed, vanishRate) {

		this.origin = origin;
		this.direction = direction;

		this.particles = createLinearParticles(particleAmount, origin, direction, minWidth || 4, minHeight || 4, maxWidth || 8, maxHeight || 8, minSpeed || 0.01, maxSpeed || 0.4, color, vanishRate || M.Math2d.randomFloat(0.01, 0.03));
		this.visibleParticles = this.particles.length;

	}
	/**
	 * Creates particles that will move from a point to another in a cone
	 * @method create
	 * @param {int} x the x center at where to create the particles
	 * @param {int} y the y center at where to create the particles
	 */
	LinearParticleEmitter.prototype.create = function(from, to) {
		
	};

	LinearParticleEmitter.prototype.onLoop = function(p) {

		if ( this.visible ) {

			var currentParticle;

			for ( var i = 0; i < this.particles.length; i++ ) {

				currentParticle = this.particles[i];

				currentParticle.onLoop(p);

				if ( ! currentParticle.isVisible() ) {

					if ( this.loop ) {

						currentParticle.setPath(this.origin, { x: this.origin.x + this.direction.x * 5, y: this.origin.y + this.direction.y * 5});
						currentParticle.rotation = 0;
						currentParticle.alpha = 1;
						currentParticle.angle = 0;
						currentParticle.vanishRate = M.Math2d.randomFloat(0.05, 0.2);
						currentParticle.speed = M.Math2d.randomFloat(0.005, 0.5);

					} else {

						this.visibleParticles--;

					}

				}
				
			}

			if ( this.visibleParticles < 1 ) {
					M.remove(this);
			}

		}

	};

	/**
	 * Applies a Tint on the provided game object
	 * @class Tint
	 * @constructor
	 * @deprecated
	 * @param {renderers.Renderizable} owner object to apply the tint
	 * @param {String} fillStyle tint color
	 * @param {int} duration duration in milliseconds
	 */
	function Tint(properties) {

		this.operation = "source-atop";
		this.startTime = 0;

		M.applyProperties( this, properties, ["fillStyle"] );

	}

	Tint.prototype.render = function( context, width, height ) {

		if ( this.isVisible() ) {

			context.globalCompositeOperation = this.operation;

			context.fillStyle = this.fillStyle;

			context.fillRect( 0, 0, width, height );

		}

	};

	Tint.prototype.show = function() {
		this.startTime = M.getTimeInMillis();
	};

	Tint.prototype.isVisible = function() {
		return this.showAlways || M.getTimeInMillis() - this.startTime < this.duration
	};

	/**
	 * Creates a FadeIn object to be applied to the given renderers.Renderizable.
	 * Fade the object in when the onLoop method is called
	 * @class FadeIn
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object object to apply the tint
	 * @param {int} seconds fade in duration in seconds
	 * @param {Function} [onFinished] function to execute on animation finish
	 */
	function FadeIn(object, seconds, onFinished) {

		if ( seconds == undefined ) seconds = 1;

		/* Rate is 1 because we must go from 0 to 1 in the given amount of seconds */
		this.rate = 1 / ( seconds * M.getAverageFps() );

		this.object = object;
		this.onFinished = onFinished;

	}

	FadeIn.prototype.initialize = function() {

		this.object.setAlpha(0);
		this.onLoop = this.run;
		return true;

	};

	FadeIn.prototype.run = function() {

		var newAlpha = this.object.getAlpha() + this.rate;
	
		if ( newAlpha < 1 ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( 1 );
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	FadeIn.prototype.onLoop = FadeIn.prototype.initialize;

	/**
	 * Creates a FadeOut object to be applied to the given renderers.Renderizable.
	 * Fade the object out when the onLoop method is called
	 * @class FadeOut
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object object to apply the tint
	 * @param {int} seconds fade out duration in seconds
	 * @param {Function} [onFinished] function to execute on animation finish
	 */
	function FadeOut(object, seconds, onFinished) {

		if ( seconds == undefined ) seconds = 1;

		/* Rate is 1 because we must go from 0 to 1 in the given amount of seconds */
		this.rate = 1 / ( seconds * M.getAverageFps() );

		this.object = object;
		this.onFinished = onFinished;

	}

	FadeOut.prototype.initialize = function() {
		this.object.setAlpha(1);
		this.onLoop = this.run;
		return true;
	};

	FadeOut.prototype.run = function() {

		var newAlpha = this.object.getAlpha() - this.rate;

		if ( newAlpha > 0 ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( 0 );
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	FadeOut.prototype.onLoop = FadeOut.prototype.initialize;

	/**
	 * Creates a Wait object to be applied to the given renderers.Renderizable.
	 * Wait is used for chained effects
	 * @class Wait
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object object to apply the tint
	 * @param {int} seconds fade out duration in seconds
	 * @param {Function} [onFinished] function to execute on animation finish
	 */
	function Wait(object, seconds, onFinished) {

		if ( seconds == undefined ) seconds = 1;

		this.seconds = seconds;
		this.object = object;
		this.timer = 0;
		this.onFinished = onFinished;

	}

	Wait.prototype.initialize = function(p) {
		this.timer = new M.TimeCounter(this.seconds * 1000);
		this.onLoop = this.run;
	};

	Wait.prototype.run = function() {


		if ( this.timer.elapsed() ) {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	Wait.prototype.onLoop = Wait.prototype.initialize;

	/**
	 * Creates ContinouseFade object to be applied to the given renderers.Renderizable.
	 * Continously fades in and out the object
	 * @class ContinousFade
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} seconds fade in and out duration in seconds
	 * @param {Boolean} fadeOut value that determines if effect will start as a fade out. Default starts fading in
	 * @param {int} min minumum alpha value
	 * @param {int} max maximum alpha value
	 */
	function ContinousFade(object, seconds, fadeOut, min, max) {
		
		if ( seconds == undefined ) seconds = 1;

		/* Rate is 1 because we must go from 0 to 1 in the given amount of seconds */
		this.rate = 1 / ( seconds * M.getAverageFps() );

		this.object = object;
		
		this.min = min || 0;
		this.max = max || 1;

		object.setAlpha( 1 );
		
		this.onFinished = this.changeFade;
		
		if ( fadeOut ) {
			this.onLoop = this.fadeOut;
		} else {
			this.onLoop = this.fadeIn;
		}
		
	}
	
	ContinousFade.prototype.fadeIn = function(p) {

		var newAlpha = this.object._alpha + this.rate;
	
		if ( newAlpha < this.max ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( this.max );
			this.onLoop = this.fadeOut;
		}

		return true;

	};
	
	ContinousFade.prototype.fadeOut = function() {
		
		var newAlpha = this.object._alpha - this.rate;

		if ( newAlpha > this.min ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( this.min );
			this.onLoop = this.fadeIn;
		}

		return true;
		
	};

	/**
	 * Creates Move object to be applied to the given renderers.Renderizable.
	 * Moves the object closer to the destination when the onLoop method is called
	 *
	 * @class FadeOut
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} seconds duration of the animation in seconds
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function Move( object, x, y, seconds, onFinished ) {

		this.object = object;
		this._x = x;
		this._y = y;

		if ( seconds == undefined ) seconds = 1;
		
		this.onFinished = onFinished;

		var lib = M.Math2d,
			frames = seconds * M.getAverageFps(),
			coorsFrom = new lib.Vector2d(object._x, object._y),
			coordsTo = new lib.Vector2d(x, y);

		this.speed = lib.getDistance( coorsFrom, coordsTo ) / frames;
		this.direction = M.Math2d.getNormalized( M.Math2d.getVector2d( coorsFrom, coordsTo ) );

	}

	Move.prototype.onLoop = function(p) {

		var moveX = Math.abs( this._x - this.object._x ) > this.speed,
			moveY = Math.abs( this._y - this.object._y ) > this.speed;
			
		if ( moveX ) this.object.offsetX(this.direction.x * this.speed);
		if ( moveY ) this.object.offsetY(this.direction.y * this.speed);

		if ( ! moveX && ! moveY ) {
			this.object.setLocation(this._x, this._y);
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	/**
	 * Creates a ScaleUp object to be applied to the given renderers.Renderizable.
	 * Scales the object up when the onLoop method is called
	 *
	 * @class ScaleUp
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} seconds duration of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function ScaleUp( object, x, y, seconds, onFinished ) {

		var frames = seconds * M.getAverageFps();

		if ( ! object._scale ) {
			object._scale = { x: 1, y: 1 };
		}

		this.speedX = Math.abs( object._scale.x - x ) / frames;
		this.speedY = Math.abs( object._scale.y - y ) / frames;
		this.object = object;
		this._x = x;
		this._y = y;
		this.onFinished = onFinished;

	}

	ScaleUp.prototype.onLoop = function(p) {

		if ( this.object._scale.x < this._x ) {
			this.object._scale.x += this.speedX;
			// this.notifyChange();
		}
		if ( this.object._scale.y < this._y ) {
			this.object._scale.y += this.speedY;
			// this.notifyChange();
		}

		if ( this.object._scale.x >= this._x && this.object._scale.y >= this._y ) {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};
	
	/**
	 * Creates a ScaleDown object to be applied to the given renderers.Renderizable.
	 * Scales the object down when the onLoop method is called
	 *
	 * @class ScaleDown
	 * @constructor
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} seconds duration of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function ScaleDown( object, x, y, seconds, onFinished ) {

		var frames = seconds * M.getAverageFps();

		if ( ! object._scale ) {
			object._scale = { x: 1, y: 1 };
		}

		this.speedX = Math.abs( object._scale.x - x ) / frames;
		this.speedY = Math.abs( object._scale.y - y ) / frames;
		this.object = object;
		this._x = x;
		this._y = y;
		this.onFinished = onFinished;

	}

	ScaleDown.prototype.onLoop = function(p) {

		if ( this.object._scale.x > this._x ) {
			this.object._scale.x -= this.speedX;
		}
		if ( this.object._scale.y > this._y ) {
			this.object._scale.y -= this.speedY;
		}

		if ( this.object._scale.x <= this._x && this.object._scale.y <= this._y ) {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	/**
	 * Creates a Twinkle object to be applied to the given renderers.Renderizable.
	 * Twinkles the object when the onLoop method is called
	 *
	 * @class Twinkle
	 * @constructor
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} times times to twinkle
	 * @param {int} duration duration in milliseconds of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function Twinkle(object, times, duration, onFinished) {
		this.object = object;
		if ( times == undefined ) {
			this.times = 6;
		} else {
			this.times = times * 2;
		}
		if ( duration == undefined ) {
			this.duration = 250;
		} else {
			this.duration = duration;
		}
		this.lastTime = 0;
		this.onFinished = onFinished;
	}

	Twinkle.prototype.onLoop = function(p) {

		if ( M.getTimeInMillis() - this.lastTime >= this.duration ) {

			if ( this.times-- ) {

				if ( this.object._alpha == 1 ) {
					this.object.setAlpha( 0 );
				} else {
					this.object.setAlpha( 1 );
				}

			} else {

				this.object.setAlpha( undefined );

				if ( this.onFinished ) this.onFinished.apply( this.object );
				return false;

			}

			this.lastTime = M.getTimeInMillis();

		}

		return true;

	};

	/**
	 * Creates a Rotate object to be applied to the given renderers.Renderizable.
	 * Rotates the object when the onLoop method is called
	 *
	 * @class Rotate
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {float} angle angle to rotate the object to
	 * @param {int} seconds duration in seconds of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function Rotate( object, angle, seconds, onFinished ) {

		if ( ! seconds ) seconds = 1;
	
		this.frames = seconds * M.getAverageFps();

		if ( ! object._rotation ) {
			object._rotation = 0;
		}

		this.object = object;
		this.angle = angle;
		this.onFinished = onFinished;

		this._rotation = ( this.angle - object._rotation ) / this.frames;

	}

	Rotate.prototype.onLoop = function(p) {

		if ( this.frames-- ) {
			this.object.offsetRotation(this._rotation);
		} else {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	/**
	 * Fades an object in
	 *
	 * Usage example:
	 *
	 * fadeIn( object, seconds, onFinished );
	 *
	 */
	function fadeIn( object, seconds, onFinished ) {
		return new Animation( new FadeIn( object, seconds, onFinished ) ).play();
	}

	/**
	 * Fades an object out
	 *
	 * Usage example:
	 *
	 * fadeOut( object, seconds, onFinished );
	 *
	 */
	function fadeOut( object, seconds, onFinished ) {
		return new Animation( new FadeOut( object, seconds, onFinished ) ).play();
	}

	
	/**
	 * Fades an object out
	 *
	 * Usage example:
	 *
	 * fadeOut( object, seconds, onFinished );
	 *
	 */
	function continousFade( object, seconds, fadeOutFirst ) {
		return new Animation( new ContinousFade( object, seconds, fadeOutFirst ) ).play();
	}

	/**
	 * Moves an object from a position to the other in a certain amout of time
	 *
	 * Usage example:
	 *
	 * move( object, x, y, seconds, acceleration, decceleration, onFinished );
	 *
	 */
	function move( object, x, y, seconds, onFinished ) {
		return new Animation( new Move( object, x, y, seconds, onFinished ) ).play();
	}

	/**
	 * Scales an object from its current scale value to the one provided.
	 *
	 * Usage example:
	 *
	 * scaleUp( object, x, y, seconds, onFinished );
	 *
	 */
	function scaleUp( object, x, y, seconds, onFinished ) {
		return new Animation( new ScaleUp( object, x, y, seconds, onFinished ) ).play();
	}

	/**
	 * Scales an object from its current scale value to the one provided.
	 *
	 * Usage example:
	 *
	 * scaleDown( object, x, y, seconds, onFinished );
	 *
	 */
	function scaleDown( object, x, y, seconds, onFinished ) {
		return new Animation( new ScaleDown( object, x, y, seconds, onFinished ) ).play();
	}

	/**
	 * Makes an object twinkle an amount of times during certain time
	 *
	 * Usage example:
	 *
	 * twinkle( objectToApply, timesToTwinkle, durationInMilliseconds, onFinished );
	 *
	 */
	function twinkle( object, times, duration, onFinished ) {
		return new Animation( new Twinkle( object, times, duration, onFinished ) ).play();
	}

	/**
	 * Rotates an object to the specified angle in seconds
	 *
	 * Usage example:
	 *
	 * rotate( objectToApply, angle, seconds, onFinished );
	 *
	 */
	function rotate( object, angle, seconds, onFinished ) {
		return new Animation( new Rotate( object, angle, seconds, onFinished ) ).play();
	}

	/**
	 * @deprecated
	 * Shakes the canvas for the specified duration of seconds
	 */
	function shakeCanvas( duration ) {

		if ( ! M.canvas.shaking ) {

			M.canvas.shaking = true;
			M.canvas.style.position = "relative";

			M.push({
			
				startTime: M.getGameTime(),

				duration: duration || 1,

				onLoop: function(p) {
					if ( M.getGameTime() - this.startTime < this.duration ) {
						p.canvas.style.left = p.M.randomSign() + "px";
						p.canvas.style.top = p.M.randomSign() + "px";
					} else {
						p.canvas.style.left = "0px";
						p.canvas.style.top = "0px";
						p.M.remove( this );
						p.canvas.shaking = false;
					}
				}

			}, "shake");

		}

	}

	/**
	 * @class visual
	 */
	namespace.visual = {

		Particle: Particle,
		LinearParticleEmitter: LinearParticleEmitter,
		RadialParticleEmitter: RadialParticleEmitter,

		Tint: Tint,

		Move: Move,
		FadeIn: FadeIn,
		FadeOut: FadeOut,
		ContinousFade: ContinousFade,
		ScaleUp: ScaleUp,
		ScaleDown: ScaleDown,
		Rotate: Rotate,
		Twinkle: Twinkle,
		Wait: Wait

	};

})( M.effects || ( M.effects = {} ), M );
/**
 * @module Match
 */
(function(namespace, M) {

	/**
	 * @class Easing
	 * @namespace visual
	 * @constructor
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} durationSeconds duration of the animation in seconds
	 * @param {String} easingMethodX easing function to apply to the x axis
	 * @param {String} easingMethodY easing function to apply to the y axis
	 * Note: for more information on easing please go to http://www.gizma.com/easing/#sin3
	 */
	function Easing(object, endValueX, endValueY, durationSeconds, easingMethodX, easingMethodY, loop, onFinished) {

		this.object = object;

		this.endValueX = endValueX;
		this.endValueY = endValueY;
		
		this.startValueX = 0;
		this.startValueY = 0;

		this.easingMethodX = this[easingMethodX] || this["linearTween"];
		this.easingMethodY = this[easingMethodY] || this.easingMethodX;
	
		this.currentFrame = 1;

		this.durationSeconds = durationSeconds;

		this.mathCached = Math;

		this.totalFrames = 0;
		
		this.loop = loop;
		
		this._needsStartValue = true;
		
		this.onFinished = onFinished;

	}

	Easing.prototype._init = function() {

		var durationSeconds = this.durationSeconds;

		if ( typeof durationSeconds == "string" && durationSeconds.indexOf("px") != -1 ) {
			
			durationSeconds = parseInt(durationSeconds);
			
			var xDistanceToCover = this.endValueX - this.object.getX();
			var yDistanceToCover = this.endValueY - this.object.getY();

			var pixelsPerSecond = durationSeconds;

			var timeToCoverX = xDistanceToCover / pixelsPerSecond;
			var timeToCoverY = yDistanceToCover / pixelsPerSecond;

			durationSeconds = Math.max(timeToCoverX, timeToCoverY);

		}

		this.totalFrames = durationSeconds * M.getAverageFps();

		this.currentFrame = 0;
		
		if ( this._needsStartValue || !this.loop ) {

			this.startValueX = this.object.getX();
			this.startValueY = this.object.getY();
			
			this.endValueX = this.endValueX - this.startValueX;
			this.endValueY = this.endValueY - this.startValueY;
			
			this._needsStartValue = false;
			
		}
		
		
		this.onLoop = this._ease;
		
		return true;
		
	};
	
	Easing.prototype._ease = function () {
	
		this.object.setLocation(
			this.easingMethodX(this.currentFrame, this.startValueX, this.endValueX, this.totalFrames), 
			this.easingMethodY(this.currentFrame, this.startValueY, this.endValueY, this.totalFrames)
		);
		
		this.currentFrame++;
		
		if ( this.currentFrame <= this.totalFrames ) {
			return true;
		} else {
			if ( this.onFinished ) {
				this.onFinished.apply(this.object);
			}
			if ( this.loop ) {
				this.onLoop = this._init;
				return true;
			}
		}
		
		return false;
		
	};

	Easing.prototype.onLoop = Easing.prototype._init;

	/**
	 * Simple linear tweening - no easing, no acceleration
	 * @method linearTween
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.linearTween = function (t, b, c, d) {
		return c*t/d + b;
	};

	/**
	 * Quadratic easing in - accelerating from zero velocity
	 * @method easeInQuad
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInQuad = function (t, b, c, d) {
		t /= d;
		return c*t*t + b;
	};
			
	/**
	 * quadratic easing out - decelerating to zero velocity
	 * @method easeOutQuad
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutQuad = function (t, b, c, d) {
		t /= d;
		return -c * t*(t-2) + b;
	};
			
	/**
	 * quadratic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutQuad
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutQuad = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t + b;
		t--;
		return -c/2 * (t*(t-2) - 1) + b;
	};

	/**
	 * cubic easing in - accelerating from zero velocity
	 * @method easeInCubic
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInCubic = function (t, b, c, d) {
		t /= d;
		return c*t*t*t + b;
	};
			
	/**
	 * cubic easing out - decelerating to zero velocity
	 * @method easeOutCubic
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutCubic = function (t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	};
			
	/**
	 * cubic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutCubic
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutCubic = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	};
		
	/**
	 * quartic easing in - accelerating from zero velocity
	 * @method easeInQuart
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInQuart = function (t, b, c, d) {
		t /= d;
		return c*t*t*t*t + b;
	};
		
	/**
	 * quartic easing out - decelerating to zero velocity
	 * @method easeOutQuart
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutQuart = function (t, b, c, d) {
		t /= d;
		t--;
		return -c * (t*t*t*t - 1) + b;
	};

	/**
	 * quartic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutQuart
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutQuart = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t + b;
		t -= 2;
		return -c/2 * (t*t*t*t - 2) + b;
	};

	/**
	 * quintic easing in - accelerating from zero velocity
	 * @method easeInQuint
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInQuint = function (t, b, c, d) {
		t /= d;
		return c*t*t*t*t*t + b;
	};

	/**
	 * quintic easing out - decelerating to zero velocity
	 * @method easeOutQuint
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutQuint = function (t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t*t*t + 1) + b;
	};

	/**
	 * quintic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutQuint
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutQuint = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t*t*t + 2) + b;
	};

	/**
	 * sinusoidal easing in - accelerating from zero velocity
	 * @method easeInSine
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInSine = function (t, b, c, d) {
		return -c * this.mathCached.cos(t/d * (this.mathCached.PI/2)) + c + b;
	};

	/**
	 * sinusoidal easing out - decelerating to zero velocity
	 * @method easeOutSine
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutSine = function (t, b, c, d) {
		return c * this.mathCached.sin(t/d * (this.mathCached.PI/2)) + b;
	};

	/**
	 * sinusoidal easing in/out - accelerating until halfway, then decelerating
	 * @method easeInOutSine
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutSine = function (t, b, c, d) {
		return -c/2 * (this.mathCached.cos(this.mathCached.PI*t/d) - 1) + b;
	};

	/**
	 * exponential easing in - accelerating from zero velocity
	 * @method easeInExpo
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInExpo = function (t, b, c, d) {
		return c * this.mathCached.pow( 2, 10 * (t/d - 1) ) + b;
	};

	/**
	 * exponential easing out - decelerating to zero velocity
	 * @method easeOutExpo
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutExpo = function (t, b, c, d) {
		return c * ( -this.mathCached.pow( 2, -10 * t/d ) + 1 ) + b;
	};

	/**
	 * exponential easing in/out - accelerating until halfway, then decelerating
	 * @method easeInOutExpo
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutExpo = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2 * this.mathCached.pow( 2, 10 * (t - 1) ) + b;
		t--;
		return c/2 * ( -this.mathCached.pow( 2, -10 * t) + 2 ) + b;
	};	

	/**
	 * circular easing in - accelerating from zero velocity
	 * @method easeInCirc
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInCirc = function (t, b, c, d) {
		t /= d;
		return -c * (this.mathCached.sqrt(1 - t*t) - 1) + b;
	};

	/**
	 * circular easing out - decelerating to zero velocity
	 * @method easeOutCirc
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutCirc = function (t, b, c, d) {
		t /= d;
		t--;
		return c * this.mathCached.sqrt(1 - t*t) + b;
	};

	/**
	 * Circular easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutCirc
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutCirc = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return -c/2 * (this.mathCached.sqrt(1 - t*t) - 1) + b;
		t -= 2;
		return c/2 * (this.mathCached.sqrt(1 - t*t) + 1) + b;
	};

	/*
	Easing.prototype.easeInOutSine = function (currentTime, startValue, endValue, duration) {
		return -endValue / 2 * (this.mathCached.cos(this.mathCached.PI * currentTime / duration) - 1) + startValue;
	};
	Easing.prototype.easeInQuad = function(currentTime, startValue, endValue, duration) {
		currentTime /= duration;
		return endValue * currentTime * currentTime + startValue;
	};
	*/

	namespace.Easing = Easing;

})(M.effects.visual, M);
/**
 * @module Match
 */
(function(namespace, M) {

	/**
	 * Fades out a sound
	 * @class SoundFadeOut
	 * @constructor
	 * @namespace sound
	 * @param {Audio} audioObject sound to fade out
	 * @param {int} min final volume - if no provided the sound will stop playing after being faded
	 */
	function SoundFadeOut(audioObject, min) {

		if ( ! min ) {
			this.min = 0.1;
			this.pauseAfterFade = true;
		} else {
			this.min = min;
			this.pauseAfterFade = false;
		}

		this.sound = audioObject;

	}

	SoundFadeOut.prototype = {

		onLoop: function() {

			if ( this.sound.volume > this.min ) {

				this.sound.volume -= 0.004;

			} else {

				if ( this.pauseAfterFade ) {
					this.sound.pause();
				}

				M.remove(this);

			}

		}

	};

	/**
	 * Fades in a sound
	 * @class SoundFadeIn
	 * @constructor
	 * @namespace sound
	 * @param {Audio} audioObject sound to fade in
	 * @param {int} max final volume
	 */
	function SoundFadeIn(audioObject, max) {

		if ( ! max ) {
			this.max = 0.9;
		}

		this.sound = audioObject;

	}

	SoundFadeIn.prototype = {

		onLoop: function() {
			if ( this.sound.volume < this.max ) {
				this.sound.volume += 0.004;
			} else {
				M.remove(this);
			}
		}

	};

	/**
	 * Transition effect fading out a sound and fading in another
	 * @class Transition
	 * @constructor
	 * @param {Audio} soundFrom sound to fade out
	 * @param {Audio} soundTo sound to fade in
	 * @param {int} maxVolume final volume of the faded in sound
	 */
	function Transition(soundFrom, soundTo, maxVolume) {
		this.soundFrom = soundFrom;
		this.soundTo = soundTo;
		this.max = maxVolume;
		this.currentStep = this.fadeOut;
	}

	Transition.prototype = {
		fadeOut: function() {
			if ( this.soundFrom.volume > 0.05 ) {
				this.soundFrom.volume -= 0.004;
			} else {
				this.soundFrom.pause();
				this.soundTo.volume = 0;
				this.soundTo.play();
				this.currentStep = this.fadeIn;
			}
		},
		fadeIn: function() {
			if ( this.soundTo.volume < this.max ) {
				this.soundTo.volume += 0.004;
			} else {
				M.remove(this);
			}
		},
		onLoop: function() {
			this.currentStep();
		}
	};

	/**
	 * Fades out a sound to play the other to fade in the first after finished
	 * @class SoundOver
	 * @constructor
	 * @param {Audio} soundFrom sound to lower
	 * @param {Audio} soundTo sound to play
	 */
	function SoundOver(soundFrom, soundTo) {
		this.max = soundFrom.volume;
		this.soundFrom = soundFrom;
		this.soundTo = soundTo;
		this.currentStep = this.fadeOut;
	}

	SoundOver.prototype = {
		fadeOut: function() {
			if ( this.soundFrom.volume > 0.25 ) {
				this.soundFrom.volume -= 0.01;
			} else {
				this.soundTo.play();
				this.currentStep = this.fadeIn;
			}
		},
		fadeIn: function() {
			if ( this.soundTo.ended && this.soundFrom.volume < this.max ) {
				this.soundTo.volume += 0.01;
			} else {
				M.remove(this);
			}
		},
		onLoop: function() {
			this.currentStep();
		}
	};

	/**
	 * Plays a sound after the other
	 * @class SoundQueue
	 * @constructor
	 * @param {Array} List of Audio to play
	 */
	function SoundQueue(list) {
		this.sounds = list;
		this.currentSoundIndex = 0;
		this.sounds[0].play();
	}

	SoundQueue.prototype = {

		onLoop: function() {

			if ( this.sounds[this.currentSoundIndex].ended ) {

				this.currentSoundIndex++;

				if ( this.currentSoundIndex < this.sounds.length ) {
					this.sounds[this.currentSoundIndex].play();
				} else {
					M.remove(this);
				}

			}

		}

	};
	
	/**
	 * @class sound
	 */

	/**
	 * Adds a fade out effect to Match loop list. Shorthand for SoundFadeOut
	 * @method addFadeOut
	 * @param {Audio} audioObject sound to fade out
	 * @param {int} min final volume - if no provided the sound will stop playing after being faded
	 */
	function addFadeOut(audioObject, min) {
		M.push(new SoundFadeOut(audioObject, min));
	}    

	/**
	 * Adds a fade in effect to Match loop list. Shorthand for SoundFadeIn
	 * @method addFadeIn
	 * @param {Audio} audioObject sound to fade in
	 * @param {int} max final volume
	 */
	function addFadeIn(audioObject, max) {
		M.push(new SoundFadeIn(audioObject, max));
	}

	/**
	 * Adds a sound transition effect to Match loop list. Shorthand for Transition
	 * @method addSoundTransition
	 * @param {Audio} soundFrom sound to fade out
	 * @param {Audio} soundTo sound to fade in
	 * @param {int} maxVolume final volume of the faded in sound
	 */
	function addSoundTransition(soundFrom, soundTo, maxVolume) {
		M.push(new Transition(soundFrom, soundTo, maxVolume));
	}
	/**
	 * Fade out a sound and plays the other. After finishing fades in the previous sound to its original volume. Shorthand for SoundOver
	 * @method addSoundOver
	 * @param {Audio} soundFrom sound to lower
	 * @param {Audio} soundTo sound to play
	 */
	function addSoundOver(soundFrom, soundTo) {
		M.push(new SoundOver(soundFrom, soundTo));
	}

	/**
	 * Crease a sound queue. Shorthand for SoundQueue
	 * @method addSoundQueue
	 * @param {Array} List of Audio to play
	 */
	function addSoundQueue(list) {
		M.push(new SoundQueue(list));
	}

	namespace.sound = {
		fadeOut: addFadeOut,
		fadeIn: addFadeIn,
		transition: addSoundTransition,
		soundOver: addSoundTransition,
		soundQueue: addSoundQueue
	};

})( M.effects || ( M.effects = {} ), M );
(function(M, namespace) {

	function AllvsAllCollisionHandler( mode ) {

		this.objects = [];

		this.mode = null;

		this.setMode( mode || "Polygon" );

	}

	AllvsAllCollisionHandler.prototype = {

		reset: function() {
			this.objects = [];
		},

		onLoop: function() {

			var i = 0, j = 1;

			while ( i < this.objects.length ) {

				while ( j < this.objects.length ) {
					this.checkCollisions( this.objects[i], this.objects[j] );
					j++;
				}
				i++;
				j = i + 1;

			}

			i = this.objects.length;

			while ( i-- ) {
				if ( ! this.objects[i]._visible ) {
					M.removeIndexFromArray( i, this.objects );
				}
			}

		},

		canCollide: function( collider, collidable ){

			if ( collider.cantCollideType  ) {

				var i = collider.cantCollideType.length;

				while ( i-- ) {
					if ( collidable instanceof collider.cantCollideType[i] ) return false;
				}

			}
		
			if ( collider.cantCollide ) {

				var i = collider.cantCollide.length;

				while ( i-- ) {
					if ( collider.cantCollide[i] == collidable ) return false;
				}

			}

			return true;

		},

		checkCollisions: function(collider, collidable) {

			if ( ! this.canCollide( collider, collidable ) ) return;
			if ( ! this.canCollide( collidable, collider ) ) return;

			if ( this.mode.haveCollided( collider, collidable ) ) {

				if ( collider.onCollision ) {
					collider.onCollision( collidable );
				}
				if ( collidable.onCollision ) {
					collidable.onCollision( collider );
				}

			}

		},

		/**
		 * @param The collision mode from namespace.collisions
		 */
		setMode: function(mode, properties) {

			if ( typeof mode === "string" ) {
				this.mode = M.collisions[mode];
			} else {
				this.mode = mode;
			}

		},

		push: function( object ) {
			this.objects.push( object );
		},

		removeType: function( type ) {

			var i = this.objects.length;

			while ( i-- ) {
				if ( this.objects[i] instanceof type ) {
					this.remove( this.objects[i] );
				}
			}

		}

	};

	namespace.AllvsAllCollisionHandler = AllvsAllCollisionHandler;
	
})(window.Match, window.Match.collisions || ( window.Match.collisions = {} ) );
(function(M, namespace) {

	function CollisionHandler(mode) {

		this.colliders = [];

		this.collidables = [];

		this.setMode( mode || "Polygon" );

		this.colliderCallback = "onCollision";

		this.collidableCallback = "onCollision";

	}

	CollisionHandler.prototype = {

		onLoop: function() {

			var i = this.colliders.length;

			while ( i-- ) {
				this.checkCollisions( this.colliders[i], this.collidables );
			}

		},

		checkCollisions: function(collider, list) {

			if ( ! collider ) return;

			var i = list.length, collidable = null;

			while ( i-- ) {

				collidable = list[i];

				if ( ! collidable ) return;

				if ( collidable instanceof Array ) {

					this.checkCollisions( collider, collidable );

				} else if ( this.mode.haveCollided( collider, collidable ) ) {

					if ( collider[this.colliderCallback] ) {
						collider[this.colliderCallback]( collidable );
					}
					if ( collidable[this.collidableCallback] ) {
						collidable[this.collidableCallback]( collider );
					}

				}

			}

		},

		/**
		 * @param The collision mode from namespace.collisions
		 */
		setMode: function(mode) {

			if ( typeof mode === "string" ) {
				this.mode = M.collisions[mode];
			} else {
				this.mode = mode;
			}

		}

	};

	namespace.CollisionHandler = CollisionHandler;
	
})(window.Match, window.Match.collisions || ( window.Match.collisions = {} ) );
(function(namespace, math2d) {

	/**
	 * Square with ray casting collision detection
	 * Once the object is inside the square ray casting is applied for 
	 * more accurate detection on the inner rectangular object.
	 * This is the most accurate detection method but also the most
	 * processing time consuming
	 */
	function Polygon() {
		this.math2d = math2d;
	}

	Polygon.prototype = {

		getCollisionArea: function(renderizable) {

			var vertices = [],
				halfWidth = renderizable.getWidth() / 2,
                halfHeight = renderizable.getHeight() / 2;

			vertices.push({ x: -halfWidth, y: -halfHeight });
			vertices.push({ x: halfWidth, y: -halfHeight });
			vertices.push({ x: halfWidth, y: halfHeight });
			vertices.push({ x: -halfWidth, y: halfHeight });
            
			this.rotate(vertices, renderizable._rotation);
            
            this.translate(vertices, renderizable._x, renderizable._y);

			return vertices;

		},

		translate: function(vertices, x, y) {
			for ( var i = 0; i < vertices.length; i++ ) {
				vertices[i].x += x;
				vertices[i].y += y;
			}
		},

		rotate: function(vertices, angle) {
			if ( ! angle ) return;
			for ( var i = 0; i < vertices.length; i++ ) {
				vertices[i] = this.math2d.getRotatedVertex(vertices[i], angle);
			}
		},        

		haveCollided: function(collider, collidable) {

			var collidableVertices = this.getCollisionArea(collidable),
				colliderVertices =  this.getCollisionArea(collider),
				i = 0;

			for ( ; i < colliderVertices.length; i++ ) {
				if ( this.pointInPolygon( colliderVertices[i].x, colliderVertices[i].y, collidableVertices ) ) return true;
				if ( this.pointInPolygon( collidableVertices[i].x, collidableVertices[i].y, colliderVertices ) ) return true;
			}

			return false;

		},

		pointInPolygon: function(x, y, vertices) {

			var i, j, c = false, nvert = vertices.length, vi, vj;

			for ( i = 0, j = nvert-1; i < nvert; j = i++ ) {
			
				vi = vertices[i];
				vj = vertices[j];
			
				if ( ( ( vi.y > y ) != ( vj.y > y ) ) && ( x < ( vj.x - vi.x ) * ( y - vi.y ) / ( vj.y - vi.y ) + vi.x ) ) {
					c = !c;
				}

			}

			return c;

		}

	};

	namespace.Polygon = new Polygon();
	
})(window.Match.collisions || ( window.Match.collisions = {} ), window.Match.math2d );
(function(namespace) {

	/**
	 * Square collision detection
	 * Uses the max size of the object to generate a square centered at the center
	 * of the object
	 */
	function Square() {
	}

	Square.prototype = {

		haveCollided: function(collider, collidable) {

			var sizeThis = 0, sizeObj = 0;

			if ( collider._halfWidth > collider._halfHeight ) {
				sizeThis = collider._halfWidth;
			} else {
				sizeThis = collider._halfHeight;
			}

			if ( collidable._halfWidth > collidable._halfHeight ) {
				sizeObj = collidable._halfWidth;
			} else {
				sizeObj = collidable._halfHeight;
			}

			if ( collider._y + sizeThis < collidable._y - sizeObj ) return false;
			if ( collider._y - sizeThis > collidable._y + sizeObj ) return false;
			if ( collider._x + sizeThis < collidable._x - sizeObj ) return false;
			if ( collider._x - sizeThis > collidable._x + sizeObj ) return false;

			return true;

		}

	};

	namespace.Square = new Square();

})(window.Match.collisions || ( window.Match.collisions = {} ));
(function(namespace, math2d) {

	/**
	 * Radial collision detection
	 * Uses the radius provided to compare it to the other objects radius
	 */
	function Radial(radius) {
		this.math2d = math2d;
	}

	Radial.prototype = {

		haveCollided: function(collider, collidable) {

			var colliderradius = ( collider.getWidth() * collider.getHeight() ) / 2,
				collidableradius = ( collidable.getWidth() * collidable.getHeight() ) / 2,
				radius = colliderradius < collidableradius ? colliderradius : collidableradius;

			return this.math2d.getSquareDistance( collider.getLocation(), collidable.getLocation() ) <= radius * radius;

		}

	};

	namespace.Radial = new Radial();
	
})(window.Match.collisions || ( window.Match.collisions = {} ), window.Match.math2d );
(function(namespace) {

	function Simple() {
	}

	Simple.prototype = {
	
		haveCollided: function(collider, collidable) {

			if ( collider.getBottom() < collidable.getTop() ) return false;
			if ( collider.getTop() > collidable.getBottom() ) return false;
			if ( collider.getRight() < collidable.getLeft() ) return false;
			if ( collider.getLeft() > collidable.getRight() ) return false;

			return true;

		}

	};

	namespace.Simple = new Simple();
	
})(window.Match.collisions || ( window.Match.collisions = {} ));
(function(M, namespace) {

	function PixelPerfect() {
		this.testContext = document.createElement("canvas").getContext("2d");
	}

	PixelPerfect.prototype.haveCollided = function( collider, collidable ) {

		var frontCanvas = M.frontBuffer.canvas,
			math = window.Math,
			minX = math.min(collider.getLeft(), collidable.getLeft()),
			minY = math.min(collider.getTop(), collidable.getTop()),
			width = math.max(collider.getRight(), collidable.getRight()) - minX,
			height = math.max(collider.getBottom(), collidable.getBottom()) - minY,
			context = this.testContext,
			column = 0,
			row = 0,
			imageData;

		context.clearRect( minX, minY, width, height );

		context.save();
		collider.onRender(context, context.canvas, 0, 0);
		context.globalCompositeOperation = "source-in";
		collidable.onRender(context, context.canvas, 0, 0);
		context.restore();

		imageData = context.getImageData( minX, minY, width, height );

		while( column < imageData.width ) {

			while( row < imageData.height ) {

				var offset = ( row * imageData.width + column ) * 4;

				if ( imageData.data[ offset + 3 ] != 0 ) {
					return true;
				}

				row++;

			}

			column++;
			row = 0;

		}

		return false;

	};

	namespace.PixelPerfect = new PixelPerfect();

})(window.Match, window.Match.collisions || ( window.Match.collisions = {} ) );
/**
 * @module Match
 * @submodule input
 */
(function(M) {

	var instance;

	function mouseDownHelper(e) {
		instance.mousedown(e);
	}
	function mouseUpHelper(e) {
		instance.mouseup(e);
	}
	function mouseClickHelper(e) {
		instance.click(e);
	}
	function mouseMoveHelper(e) {
		instance.mousemove(e);
	}
	function mouseWheelHelper(e) {
		instance.mousewheel(e);
	}
	function mouseWheelHelperFireFox(e) {
		instance.DOMMouseScroll(e);
	}
	function contextMenuHelper(e) {
		e.preventDefault();
	}

	/**
	 * Provides mouse support.
	 * This class is automatically binded to Match if this file is included. Can be accessed by M.keyboard
	 * @class Mouse
	 * @namespace input
	 * @static
	 */
	function Mouse() {
		/**
		 * Object that contains mouse events for the existing buttons
		 * @property LEFT
		 * @private
		 * @type Object
		 */
		this.events = {
			0: {},
			1: {},
			2: {}
		};
		/**
		 * x coordinate of the mouse
		 * @property x
		 * @type int
		 */
		this.x = null;
		/**
		 * y coordinate of the mouse
		 * @property y
		 * @type int
		 */
		this.y = null;
		/**
		 * Indicates whether draggin is taking place or not
		 * @property isDragging
		 * @private
		 * @type Boolean
		 */
		this.isDragging = false;

	}

	/**
	 * Left mouse button
	 * @property LEFT
	 * @final
	 * @type int
	 */
	Mouse.prototype.LEFT = 0;
	/**
	 * Middle mouse button
	 * @property MIDDLE
	 * @final
	 * @type int
	 */
	Mouse.prototype.MIDDLE = 1;
	/**
	 * Right mouse button
	 * @property RIGHT
	 * @final
	 * @type int
	 */
	Mouse.prototype.RIGHT = 2;
	/**
	 * Sets the selected object if there is not dragging going on
	 * @method select
	 * @param {Object} object the object to select
	 * @param {Event} event
	 * @private
	 */
	Mouse.prototype.select = function( object, view ) {

		if ( ! this.isDragging ) {
      object.selectedView = view;
			this.selectedObject = object;
		}

	};
	/**
	 * Prevents the context menu from showing up when the user right clicks on the document
	 * @method preventContexMenu
	 * @param {Boolean} value boolean that determines whether to prevent context menu or not
	 */
	Mouse.prototype.preventContexMenu = function(value) {
		if ( value ) {
			document.addEventListener("contextmenu", contextMenuHelper, false );
		} else {
			document.removeEventListener("contextmenu", contextMenuHelper, false );
		}
	};
	/**
	 * Executes the events of the selected object
	 * @method fireEventOnLastSelectedObject
	 * @private
	 */
	Mouse.prototype.fireEventOnLastSelectedObject = function() {

		var s = this.selectedObject,
        ps = this.prevSelectedObject;

		if ( s ) {
			if ( !s._mouseInRaised && s.listensTo("mouseIn") ) {
				s._mouseInRaised = true;
				s.raiseEvent("mouseIn", this);
			}
			if ( ps && ps != s ) {
				ps._mouseInRaised = false;
				if ( ps.listensTo("mouseOut") ) {
					ps.raiseEvent("mouseOut", this);
				}
			}
			if ( this.up() && s.listensTo("mouseUp") ) {
				s.raiseEvent("mouseUp", this);
			}
			if ( this.clicked() && s.listensTo("click") ) {
				s.raiseEvent("click", this);
			}
			if ( this.down() ) {
				if ( s.listensTo("mouseDown") ) {
					s.raiseEvent("mouseDown", this);
				}
				this.isDragging = true;
				if ( s.listensTo("mouseDrag") ) {
					s.raiseEvent("mouseDrag", this);
				}
			}
			if ( s.listensTo("mouseOver") ) {
				s.raiseEvent("mouseOver", this);
			}
			if ( this.moved() && s.listensTo("mouseMove") ) {
				s.raiseEvent("mouseMove", this);
			}
			if ( this.wheel() && s.listensTo("mouseWheel") ) {
				s.raiseEvent("mouseWheel", this);
			}
		} else if ( ps && ps.listensTo("mouseOut") ) {
			ps._mouseInRaised = false;
			ps.raiseEvent("mouseOut", this);
		}
		
		this.prevSelectedObject = s;
		
		if ( ! this.isDragging ) {
      this.deselectObject();
		}

	};
  Mouse.prototype.deselectObject = function() {
    if (this.selectedObject) {
      this.selectedObject.selectedView = null;
      this.selectedObject = null;
    }
  };
	/**
	 * Returns whether the given button has been pressed and released
	 * @method clicked
	 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
	 * @return {Boolean} true if the button was pressed and released and false if not
	 */
	Mouse.prototype.clicked = function( button ) {
		if ( button != null ) {
			return this.events[ button ].click;
		}
		return this.events[0].click;
	};
	/**
	 * Returns whether the given button is being pressed
	 * @method down
	 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
	 * @return {Boolean} true if the button is being pressed and false if not
	 */
	Mouse.prototype.down = function( button ) {
		if ( button != null ) {
			return this.events[ button ].down;
		}
		return this.events[0].down || this.events[1].down || this.events[2].down;
	};
	/**
	 * Returns whether the given button has been released
	 * @method up
	 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
	 * @return {Boolean} true if the button has been released and false if not
	 */
	Mouse.prototype.up = function( button ) {
		if ( button != null ) {
			return this.events[ button ].up;
		}
		return this.events[0].up || this.events[1].up || this.events[2].up;
	};
	/**
	 * Returns the move event or null if the mouse has not moved
	 * @method moved
	 * @return {Event} mouse event
	 */
	Mouse.prototype.moved = function() {
		return this.eventMouseMove;
	};
	/**
	 * Returns the wheel delta y
	 * @method wheel
	 * @return {int} delta y
	 */
	Mouse.prototype.wheel = function() {
		this.wheelDeltaY = 0;
		if ( this.eventMouseWheel ) {
			this.wheelDeltaY = this.eventMouseWheel.wheelDeltaY;
		}
		return this.wheelDeltaY;
	};
	/**
	 * Clears mouse events. This method is to be called once after game loop
	 * @protected
	 * @method clear
	 */
	Mouse.prototype.clear = function() {

		for ( var i = 0; i < 3; i++ ) {
			this.events[i].up = null;
			this.events[i].click = null;
		}

		this.eventMouseWheel = null;
		this.eventMouseMove = null;

	};
	/**
	 * Sets the mouse click event and updates mouse location
	 * @method click
	 * @private
	 * @param {Event} e the mouse event
	 */
	Mouse.prototype.click = function( e ) {
		this.events[ e.button ].click = e;
		this.x = e.offsetX;
		this.y = e.offsetY;
	};
	/**
	 * Sets the mouse down event
	 * @method mousedown
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.mousedown = function( e ) {
		this.events[ e.button ].down = e;
	};
	/**
	 * Sets the mouse up event and releases dragging
	 * @method mouseup
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.mouseup = function( e ) {
		this.events[ e.button ].down = null;
		this.events[ e.button ].up = e;
		this.isDragging = false;
	};
	/**
	 * Sets the mouse wheel event for every browser except Firefox
	 * @method mousewheel
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.mousewheel = function( e ) {
		this.eventMouseWheel = e;
		};
	/**
	 * Sets the mouse wheel event. For Firefox only
	 * @method mousewheel
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.DOMMouseScroll = function( e ) {
		this.mousewheel( { wheelDeltaY: e.detail * -40 } );
	};
	/**
	 * Returns whether the mouse is over the given object
	 * @method isOverPixelPerfect
	 * @param {renderers.Renderizable} renderizable
	 * @param {OnLoopProperties} p
	 */
	Mouse.prototype.isOverPixelPerfect = function( renderizable ) {
		if ( ! renderizable._visible ) return;
		var ctx = M.offScreenContext,
			cnv = M.offScreenCanvas,
			camera = M.getCamera();
		cnv.width = M.renderer.frontBuffer.canvas.width;
		cnv.height = M.renderer.frontBuffer.canvas.height;
		//TODO: This might not be necessary cause we clean the context and it's the offscreen context used for testing
		ctx.save();
		ctx.clearRect(0, 0, cnv.width, cnv.height);
		M.renderer.render(renderizable, ctx, camera._x, camera._y);
		ctx.restore();
		var imgData = ctx.getImageData(this.x, this.y, 1, 1);
		if ( !imgData.data[3] ) return false;
		if ( imgData.data[0] ) return true;
		if ( imgData.data[1] ) return true;
		if ( imgData.data[2] ) return true;
		return false;
	};
	/**
	 * Returns whether the mouse is over the given renderizable or not
	 *
	 * @method isOverPolygon
	 * @param {renderers.Renderizable} renderizable
	 * @param {Camera} camera
	 * @return {Boolean} true if mouse is over this object else false
	 */
	Mouse.prototype.isOverPolygon = function (renderizable) {
		var camera = M.getCamera(),
			x = this.x + camera._x,
			y = this.y + camera._y;
		if (renderizable._rotation) {
			this._x = x;
			this._y = y;
			return M.collisions.Polygon.haveCollided(renderizable, this);
		} else {
			if (renderizable.getBottom() < y) return false;
			if (renderizable.getTop() > y) return false;
			if (renderizable.getRight() < x) return false;
			if (renderizable.getLeft() > x) return false;
			return true;
		}
	};
	Mouse.prototype.getHeight = function() {
		return 2;
	};
	Mouse.prototype.getWidth = function() {
		return 2;
	};
	/**
	 * Fires mouse event on the object that is under the mouse and clears input
	 * @method update
	 */
	Mouse.prototype.update = function() {
		this.fireEventOnLastSelectedObject();
		this.clear();
	};

	Mouse.prototype.applyToObject = function( entity ) {
	
		var views = entity.views._values,
			i = 0,
			l = views.length,
			renderizable;

		if ( entity.listensTo("mouseOver") || entity.listensTo("mouseIn") || entity.listensTo("mouseOut") || entity.listensTo("onMouseWheel") || ( entity.listensTo("mouseDown") && this.down() ) || ( entity.listensTo("mouseUp") && this.up() ) || ( entity.listensTo("click") && this.clicked() ) ) {

			for (; i < l; i++ ) {

				renderizable = views[i];

				if ( this.isOverPolygon(renderizable) && this.isOverPixelPerfect(renderizable) ) {
					this.select(entity, renderizable);
				}

			}
			
		}

	};

	if ( M.browser.isFirefox ) {

		Mouse.prototype.mousemove = function(e) {
			this.eventMouseMove = e;
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = e.layerX - e.target.offsetLeft;
			this.y = e.layerY - e.target.offsetTop;
		};

		Mouse.prototype.click = function( e ) {
			this.events[ e.button ].click = e;
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = e.layerX - e.target.offsetLeft;
			this.y = e.layerY - e.target.offsetTop;
		};

	} else {

		Mouse.prototype.mousemove = function( e ) {
			this.eventMouseMove = e;
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = e.offsetX;
			this.y = e.offsetY;
		};

	}

	Mouse.prototype.bind = function() {
		if ( M.browser.isFirefox  ) {
			document.addEventListener("DOMMouseScroll", mouseWheelHelperFireFox, false);
		} else if ( M.browser.name == "MSIE 9.0" ) {
			document.addEventListener("onwheel", mouseWheelHelper, false);
		} else {
			document.addEventListener("mousewheel", mouseWheelHelper, false);
		}
		document.addEventListener("mousedown", mouseDownHelper, false);
		document.addEventListener("mouseup", mouseUpHelper, false);
		document.addEventListener("mousemove", mouseMoveHelper, false);
		document.addEventListener("click", mouseClickHelper, false);
		M.setMouse(this);
	};

	Mouse.prototype.unbind = function() {
		if ( M.browser.isFirefox  ) {
			document.removeEventListener("DOMMouseScroll", mouseWheelHelperFireFox);
		} else if ( M.browser.name == "MSIE 9.0" ) {
			document.removeEventListener("onwheel", mouseWheelHelper);
		} else {
			document.removeEventListener("mousewheel", mouseWheelHelper);
		}
		document.removeEventListener("mousedown", mouseDownHelper);
		document.removeEventListener("mouseup", mouseUpHelper);
		document.removeEventListener("mousemove", mouseMoveHelper);
		document.removeEventListener("click", mouseClickHelper);
		M.setMouse(null);
	};

	instance = new Mouse();
	instance.bind();

})(window.Match);
/**
 * @module Match
 */
(function(M) {

	var instance;

	function devicemotion(e) {
		instance.accelerate(e);
	}

	function Accelerometer() {
	}

	Accelerometer.prototype.accelerate = function(event) {
		this._hasEvent = true;
		this.accelerationIncludingGravity = event.accelerationIncludingGravity;
		this.acceleration = event.acceleration;
		this.rotationRate = event.rotationRate;
	};

	Accelerometer.prototype.update = function() {
		this._hasEvent = false;
	};

	Accelerometer.prototype.right = function() {
		return this._hasEvent && (this.acceleration.x > 0 || this.accelerationIncludingGravity.x > 0);
	};
	Accelerometer.prototype.left = function() {
		return this._hasEvent && (this.acceleration.x < 0 || this.accelerationIncludingGravity.y < 0);
	};
	Accelerometer.prototype.up = function() {
		return this._hasEvent && this.acceleration.y > 0;
	};
	Accelerometer.prototype.down = function() {
		return this._hasEvent && this.acceleration.y < 0;
	};

	Accelerometer.prototype.applyToObject = function(node) {
		if ( this._hasEvent ) {
			if ( node.onDeviceAccelerationIncludingGravity ) {
				node.onDeviceAccelerationIncludingGravity(this.accelerationIncludingGravity.x, this.accelerationIncludingGravity.y, this.accelerationIncludingGravity.z, this.rotationRate);
			}
			if ( node.onDeviceAcceleration ) {
				node.onDeviceAcceleration(this.acceleration.x, this.acceleration.y, this.acceleration.z, this.rotationRate);
			}
			if ( node.onDeviceRotation ) {
				/*
				 * alpha
				 *	The rate at which the device is rotating about its Z axis; that is, being twisted about a line perpendicular to the screen.
				 * beta
				 *	The rate at which the device is rotating about its X axis; that is, front to back.
				 * gamma
				 *	The rate at which the device is rotating about its Y axis; that is, side to side.
				 */
				node.onDeviceRotation(this.rotationRate.alpha, this.rotationRate.beta, this.rotationRate.gamma);
			}
		}
	};

	Accelerometer.prototype.bind = function() {
		window.addEventListener("devicemotion", devicemotion, false);
		M.setAccelerometer(this);
	};

	Accelerometer.prototype.unbind = function() {
		window.removeEventListener("devicemotion", devicemotion);
		M.setAccelerometer(null);
	};

	instance = new Accelerometer();
	instance.bind();

})(window.Match);
/**
 * @module Match
 */
(function(M) {

	var instance;

	function onkeydown(e) {
		instance.fireDown( e );
	}

	function onkeyup(e) {
		instance.fireUp( e );
	}

	/**
	 * Provides keyboard support.
	 * This class is automatically binded to Match if this file is included. Can be accessed by M.keyboard
	 * @class Keyboard
	 * @namespace input
	 * @static
	 */
	function Keyboard() {
		/**
		 * Map of <String, Boolean> containing true for keys that are being pressed
		 * @property keysDown
		 * @type {Map}
		 */
		this.keysDown = {
			length: 0
		};
		/**
		 * Map of <String, Boolean> containing true for keys that were released
		 * @property keysUp
		 * @type {Map}
		 */
		this.keysUp = null;
		/**
		 * Map of <String, Boolean> containing true for keys that were pressed (down -> executes and disables, up -> enables)
		 * @property keysUp
		 * @type {Map}
		 */
		this.keysPressed = {            
		};
	}

	Keyboard.prototype.bind = function() {
		document.addEventListener("keydown", onkeydown, false);
		document.addEventListener("keyup", onkeyup, false);
		M.setKeyboard(this);
	};

	Keyboard.prototype.unbind = function() {
		document.removeEventListener("keydown", onkeydown);
		document.removeEventListener("keyup", onkeyup);
		M.setKeyboard(null);
	};

	Keyboard.prototype[8] 	= "backspace";
	Keyboard.prototype[9] 	= "tab";
	Keyboard.prototype[13] 	= "enter";
	Keyboard.prototype[16] 	= "shift";
	Keyboard.prototype[17]	= "ctrl";
	Keyboard.prototype[18] 	= "alt";
	Keyboard.prototype[19]	= "pause";
	Keyboard.prototype[20]	= "capslock";
	Keyboard.prototype[27]	= "escape";
	Keyboard.prototype[32]	= "space";
	Keyboard.prototype[33] 	= "pageup";
	Keyboard.prototype[34] 	= "pagedown";
	Keyboard.prototype[35] 	= "end";
	Keyboard.prototype[36] 	= "home";
	Keyboard.prototype[37] 	= "left";
	Keyboard.prototype[38] 	= "up";
	Keyboard.prototype[39] 	= "right";
	Keyboard.prototype[40] 	= "down";
	Keyboard.prototype[45] 	= "insert";
	Keyboard.prototype[46] 	= "delete";
	Keyboard.prototype[112] = "f1";
	Keyboard.prototype[113] = "f2";
	Keyboard.prototype[114] = "f3";
	Keyboard.prototype[115] = "f4";
	Keyboard.prototype[116] = "f5";
	Keyboard.prototype[117] = "f6";
	Keyboard.prototype[118] = "f7";
	Keyboard.prototype[119] = "f8";
	Keyboard.prototype[120] = "f9";
	Keyboard.prototype[121] = "f10";
	Keyboard.prototype[122] = "f11";
	Keyboard.prototype[123] = "f12";
	Keyboard.prototype[145] = "numlock";
	Keyboard.prototype[220] = "pipe";
    /**
     * Method that gets executed when the user is pressing a key
     * @method fireDown
     * @private
     * @param {Event} event
     */
    Keyboard.prototype.fireDown = function( event ) {

		var key = this[ event.which ] || String.fromCharCode( event.which ).toLowerCase();

		this.keysDown[ key ] = true;

        if ( this.keysPressed[ key ] == undefined ) {
            this.keysPressed[ key ] = true;
        }
		
		this.keysDown.length++;

	};
	/**
	 * Method that gets executed when the released user a key
	 * @method fireUp
	 * @private
	 * @param {Event} event
	 */
	Keyboard.prototype.fireUp = function( event ) {

		var key = this[ event.which ] || String.fromCharCode( event.which ).toLowerCase();

		if ( ! this.keysUp ) this.keysUp = {};

		this.keysDown[ key ] = false;
        this.keysPressed[ key ] = undefined;
		this.keysUp[ key ] = true;
		
		if ( this.keysDown.length > 0 ) this.keysDown.length--;

	};
	/**
	 * Clears the keysUp Map to avoid further executions when the keys where long released
	 * @method update
	 */
	Keyboard.prototype.update = function() {
		this.keysUp = null;
        for ( var i in this.keysPressed ) {
            if ( this.keysPressed[i] ) {
                this.keysPressed[i] = false;
            }
        }
	};
	/**
	 * Looks for onKeyDown and onKeyUp methods in the provided object and executes them if the object has focus.
	 * Also, if the object has keyDownMappings or keyUpMappings and a key event binded to any of those is executed
	 * then KeyboardInputHandler executes the specified method on the object
	 * @method applyToObject
	 *
	 * @example 
			Ninja.prototype.moveUp = function() { 
			 //move the ninja up 
			}
			Ninja.prototype.keyDownMappings = {
				"up": "moveUp"
			}
			//Both examples result in the execution of the moveUp method
			Ninja.prototype.onKeyUp = function(keysUp) {
				if ( keysUp.up ) {
					this.moveUp();
				}
			}
	 */
	Keyboard.prototype.applyToObject = function( object ) {

		if ( object.listensTo("keyDown") ) {
			object.raiseEvent("keyDown", this.keysDown);
		}

		if ( object.listensTo("keyUp" ) ) {
			object.raiseEvent("keyUp", this.keysUp);
		}
		
		// if ( object.keyDownMappings && this.keysDown.length > 0 ) {
		// 	for ( var i in object.keyDownMappings ) {
		// 		if ( this.keysDown[i] ) object[object.keyDownMappings[i]]();
		// 	}
		// }
		// if ( object.keyUpMappings && this.keysUp ) {
		// 	for ( var i in object.keyUpMappings ) {
		// 		if ( this.keysUp[i] ) object[object.keyUpMappings[i]]();
		// 	}
		// }

	};

    Keyboard.prototype.getKeyCode = function(key) {
        return key.charCodeAt(0);
    }

    var instance = new Keyboard();
   	instance.bind();

})(window.Match);
/**
 * @module Match
 */
(function(M) {

	var instance;

	function touchStartHelper(event) {
		instance.start(event);
	}
	function touchEndHelper(event) {
		instance.end(event);
	}
	function touchCancelHelper(event) {
		instance.cancel(event);
	}
	function touchLeaveHelper(event) {
		instance.leave(event);
	}
	function touchMoveHelper(event) {
		instance.move(event);
	}

	function Touch() {

		/*
		 * IE handles touch with MSPointerDown, MSPointerUp and MSPointerMove. We must update this interfac
		 * to support IE or user will have to default to mouse
		 */

		this.x = 0;
		this.y = 0;

		this.isDragging = false;

		this.events = {
			start: null,
			end: null,
			move: null
		};

	}

	Touch.prototype.clear = function() {
		if ( this.events.end ) {
			this.events.start = null;
			this.x = 0;
			this.y = 0;
		}
		this.events.end = null;
		this.events.move = null;
		this.force = null;
		if ( !this.isDragging ) {
			this.selectedObject = null;
		}
	};
	Touch.prototype.update = function() {
		this.fireEventOnLastSelectedObject(this);
		this.clear();
	};
	Touch.prototype.getHeight = function() {
		return 2;
	};
	Touch.prototype.getWidth = function() {
		return 2;
	};
	Touch.prototype.applyToObject = function(renderizable) {
		if ( !this.isDragging ) {
			if ( renderizable.onTouch || renderizable.onTouchEnd || renderizable.onTouchMove || renderizable.onDrag ) {
				if ( this.isOverPolygon(renderizable) && this.isOverPixelPerfect(renderizable) ) {
					this.selectedObject = renderizable;
				}
			}
		}
	};
	Touch.prototype._setTouch = function(touch) {
		this.x = touch.pageX - touch.target.offsetLeft;
		this.y = touch.pageY - touch.target.offsetTop;
		this.force = touch.force;
	};
	Touch.prototype.start = function(event) {
		var touches = event.changedTouches;
		if ( touches.length ) {
			var touch = touches[0];
			this._setTouch(touch);
			this.events.start = touch;
		}
	};
	Touch.prototype.end = function(event) {
		var touches = event.changedTouches;
		if ( touches.length ) {
			var touch = touches[0];
			this.events.end = touch;
			this.isDragging = false;
			this.selectedObject = null;
		}
	};
	Touch.prototype.move = function(event) {
		var touches = event.changedTouches;
		if ( touches.length ) {
			var touch = touches[0];
			this._setTouch(touch);
			this.events.move = touch;
		}
	};
	Touch.prototype.started = function() {
		return this.events.start;
	};
	Touch.prototype.moved = function() {
		return this.events.move;
	};
	Touch.prototype.ended = function() {
		return this.events.end;
	};
	Touch.prototype.any = function() {
		return this.started() || this.moved() || this.ended();
	};
	/**
	 * Executes the events of the selected object
	 * @method fireEventOnLastSelectedObject
	 * @private
	 */
	Touch.prototype.fireEventOnLastSelectedObject = function() {

		if ( this.selectedObject ) {
			if ( this.events.start ) {
				if ( this.selectedObject.onTouch ) {
					this.selectedObject.onTouch(this);
				}
				if ( this.selectedObject.onDrag ) {
					this.isDragging = true;
				}
			}
			if ( this.events.end && this.selectedObject.onTouchEnd ) {
				this.selectedObject.onTouchEnd(this);
			}
			if ( this.events.move ) {
				if ( this.selectedObject.onTouchMove ) {
					this.selectedObject.onTouchMove(this);
				}
				if ( this.isDragging ) {
					this.selectedObject.onDrag(this);
				}
			}
		}

	};
	/**
	 * Returns whether the mouse is over the given object
	 * @method isOverPixelPerfect
	 * @param {renderers.Renderizable} renderizable
	 * @param {OnLoopProperties} p
	 */
	Touch.prototype.isOverPixelPerfect = function( renderizable ) {
		if ( ! renderizable.onRender ) return;
		if ( ! renderizable._visible ) return;
		var ctx = M.offScreenContext,
			cnv = M.offScreenCanvas,
			camera = M.camera;
		ctx.save();
		ctx.clearRect(0, 0, cnv.width, cnv.height);
		renderizable.onRender(ctx, cnv, camera.x, camera.y);
		var imgData = ctx.getImageData(this.x, this.y, 1, 1);
		if ( !imgData.data[3] ) return false;
		if ( imgData.data[0] ) return true;
		if ( imgData.data[1] ) return true;
		if ( imgData.data[2] ) return true;
		return false;
	},
	/**
	 * Returns whether the mouse is over the given renderizable or not
	 *
	 * @method isOverPolygon
	 * @param {renderers.Renderizable} renderizable
	 * @param {Camera} camera
	 * @return {Boolean} true if mouse is over this object else false
	 */
	Touch.prototype.isOverPolygon = function (renderizable) {
		var camera = M.camera,
			x = this.x + camera.x,
			y = this.y + camera.y;
		if (renderizable._rotation) {
			this._x = x;
			this._y = y;
			return M.collisions.Polygon.haveCollided(renderizable, this);
		} else {
			if (renderizable.getBottom() < y) return false;
			if (renderizable.getTop() > y) return false;
			if (renderizable.getRight() < x) return false;
			if (renderizable.getLeft() > x) return false;
			return true;
		}
	};

	Touch.prototype.bind = function() {
		document.addEventListener("touchstart", touchStartHelper, false);
		document.addEventListener("touchend", touchEndHelper, false);
		document.addEventListener("touchmove", touchMoveHelper, false);
		M.setTouch(this);
	};

	Touch.prototype.unbind = function() {
		document.removeEventListener("touchstart", touchStartHelper);
		document.removeEventListener("touchend", touchEndHelper);
		document.removeEventListener("touchmove", touchMoveHelper);
		M.setTouch(null);
	};

	instance = new Touch();
	instance.bind();

})(window.Match);
/**
 * @module Match
 */
(function( namespace ) {

	/**
	 * Provides utility methods for creating strings from RGB and RGBA colors
	 * and converting RGB to HEX
	 * @class Color
	 * @static
	 * @constructor
	 */
	function Color() {
	}
	/**
	 * Returns a String representing the specified rgb color
	 * @method rgb
	 * @param {byte} r
	 * @param {byte} g
	 * @param {byte} b
	 * @return {String}
	 */
	Color.prototype.rgb = function(r, g, b) {
		return "rgb(" + [r, g, b].join(",") + ")";
	};
	/**
	 * Returns a String representing the specified rgba color
	 * @method rgba
	 * @param {byte} r
	 * @param {byte} g
	 * @param {byte} b
	 * @param {byte} a
	 * @return {String}
	 */
	Color.prototype.rgba = function(r, g, b, a) {
		return "rgba(" + [r, g, b, a].join(",") + ")";
	};
	/**
	 * Converts an rgb color to hexa
	 * @method rgbToHex
	 * @param {byte} r
	 * @param {byte} g
	 * @param {byte} b
	 * @return {String}
	 */
	Color.prototype.rgbToHex = function(r, g, b) {
		return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	};
	/**
	 * Converts a number from 0 to 255 to hexa
	 * @method componentToHex
	 * @param {byte} c
	 * @return {String}
	 */
	Color.prototype.componentToHex = function(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	};
	/**
	 * Converts an hexa to rgb
	 * @method hexToRgb
	 * @param {String} hex
	 * @return {String}
	 */
	Color.prototype.hexToRgb = function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return this.rgb(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16));
	};
    /**
	 * Returns a transparent color
	 * @method alpha
	 * @return {String}
	 */
	Color.prototype.alpha = function() {
		return this.rgba(0, 0, 0, 0);
	};
	/**
	 * Returns a random rgb color
	 * @method random
	 * @return {String}
	 */
	Color.prototype.random = function() {
		var math = window.Math;
		return this.rgb(math.round(math.random() * 255), math.round(math.random() * 255), math.round(math.random() * 255));
	};
	/**
	 * Returns an object with the attributes r, g, b from the given argument
	 * @method random
	 * @param {String} rgbString a string containing rgb colors
	 * @return {String}
		 * @example 
				var orangeColorObject = M.color.rgbStringToObject("rgb(255, 200, 0)");
		 */
	Color.prototype.rgbStringToObject = function(rgbString) {

		var obj = new Object();

		if ( rgbString ) {
			var regexResult = rgbString.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
			if ( regexResult ) {
				obj.r = parseInt(regexResult[1]);
				obj.g = parseInt(regexResult[2]);
				obj.b = parseInt(regexResult[3]);
			}
		}

		return obj;

	};

	namespace.color = new Color();

})( window.Match );
/**
 * @module Match
 */
(function(M) {

	/**
	 * Generates random values
	 *
	 * @class Random
	 * @constructor
	 */
	function Random() {
		this.math = window.Math;
	}
	/**
	 * Returns a random integer
	 *
	 * @method integer
	 * @param {int} from
	 * @param {int} to
	 * @return {int}
	 */
	Random.prototype.integer = function(from, to) {
		return this.math.floor(this.math.random() * ( to - from + 1) ) + from;
	};
	/**
	 * Returns a random decimal
	 * @method decimal
	 * @param {decimal} from
	 * @param {decimal} to
	 * @return {decimal}
	 */
	Random.prototype.decimal = function(from, to) {
		return this.math.random() * ( to - from) + from;
	};
	/**
	 * Returns a random bool
	 *
	 * @method boolean
	 * @return {Boolean}
	 */
	Random.prototype.bool = function() {
		return this.math.random() < 0.5;
	};
	/**
	 * Returns a random sign
	 *
	 * @method sign
	 * @return {int} 1 or -1
	 */
	Random.prototype.sign = function() {
		return this.bool() ? 1 : -1;
	};
	/**
	 * Returns a random boolean from a true chance percentage
	 *
	 * @method booleanFromChance
	 * @param {int} trueChancePercentage 0 to 100
	 * @return {Boolean}
	 */
	Random.prototype.booleanFromChance = function(trueChancePercentage) {
		return this.integer(0, 100) <= trueChancePercentage;
	};
	/**
	 * Returns a random rgb color
	 *
	 * @method color
	 * @return {String}
	 * @example "M.random.rgb(100,100,30)"
	 */
	Random.prototype.color = function() {
		return M.color.random();
	};
	/**
	 * Returns a 2d point from an area
	 *
	 * @method area
	 * @return {Object}
	 * @example "M.random.area(0, 0, 100, 10)"
	 */
	Random.prototype.area = function(minX, minY, maxX, maxY) {
		return {
			x: M.random.integer(minX, maxX),
			y: M.random.integer(minY, maxY)
		}
	};
  /**
	 * Returns a random string given a length
	 *
	 * @method string
	 * @return {String}
	 * @example "M.random.string(8)"
	 */
  Random.prototype.string = function(length) {
    length = length || 16;
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  };

	M.random = new Random();

})( window.Match );
(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function NoPostProcess() {
	}

	NoPostProcess.prototype.run = function(context) {
		return context.canvas;
	};

	namespace.postProcess.NoPostProcess = NoPostProcess;

})(window.M);

(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function GrayScale() {
	}

	GrayScale.prototype.run = function(context) {
		var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height),
            d = imageData.data,
			l = d.length,
			i,
			r,
			g,
			b,
			v;
		for (i = 0; i < l; i += 4) {
			r = d[i];
			g = d[i+1];
			b = d[i+2];
			// CIE luminance for the RGB
			// The human eye is bad at seeing red and blue, so we de-emphasize them.
			v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
			d[i] = d[i+1] = d[i+2] = v;
		}
        context.putImageData(imageData, 0, 0);
		return context.canvas;
	};

	namespace.postProcess.GrayScale = GrayScale;

})(window.M);

(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function Brightness(value) {
        if ( value == undefined ) throw new Error("Brightness has no constructor that takes no arguments. You must specify the brightness value");
		this.value = value;
	}

	Brightness.prototype.run = function(context) {
		var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height),
            d = imageData.data;
		for (var i=0; i<d.length; i+=4) {
			d[i] += this.value;
			d[i+1] += this.value;
			d[i+2] += this.value;
		}
        
        context.putImageData(imageData, 0, 0);
		return context.canvas;
	};

	namespace.postProcess.Brightness = Brightness;

})(window.M);

(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function Convolute(matrix, opaque) {
		this.matrix = matrix;
		this.opaque = opaque;
	}

	Convolute.prototype.setSharpen = function() {
		this.matrix = [ 0, -1,  0, -1,  5, -1, 0, -1,  0 ];
	};

	Convolute.prototype.setBlur = function() {
		this.matrix = [ 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9 ];
	};

	Convolute.prototype.setContour = function() {
		this.matrix = [ 1, 1, 1, 1, 0.7, -1, -1, -1, -1 ];
	};

	Convolute.prototype.run = function(context) {
        if ( !this.matrix ) return;
		var side = Math.round(Math.sqrt(this.matrix.length));
		var halfSide = Math.floor(side/2);
        var imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
		var src = imgData.data;
		var sw = imgData.width;
		var sh = imgData.height;
		// pad output by the convolution matrix
		var w = sw;
		var h = sh;
        //TODO: Create a buffer for destination
		var imageData = document.createElement("canvas").getContext("2d");
        imageData.canvas.width = imgData.width;
        imageData.canvas.height = imgData.height;
        var data = imageData.getImageData(0, 0, imgData.width, imgData.height);
		var dst = data.data;
		// go through the destination image pixels
		var alphaFac = this.opaque ? 1 : 0;
		for (var y=0; y<h; y++) {
			for (var x=0; x<w; x++) {
				var sy = y;
				var sx = x;
				var dstOff = (y*w+x)*4;
				// calculate the weighed sum of the source image pixels that
				// fall under the convolution matrix
				var r=0, g=0, b=0, a=0;
				for (var cy=0; cy<side; cy++) {
					for (var cx=0; cx<side; cx++) {
						var scy = sy + cy - halfSide;
						var scx = sx + cx - halfSide;
						if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
							var srcOff = (scy*sw+scx)*4;
							var wt = this.matrix[cy*side+cx];
							r += src[srcOff] * wt;
							g += src[srcOff+1] * wt;
							b += src[srcOff+2] * wt;
							a += src[srcOff+3] * wt;
						}
					}
				}
				dst[dstOff] = r;
				dst[dstOff+1] = g;
				dst[dstOff+2] = b;
				dst[dstOff+3] = a + alphaFac*(255-a);
			}
		}
        context.putImageData(data, 0, 0);
		return context.canvas;
	};

	namespace.postProcess.Convolute = Convolute;

})(window.M);
/**
 * @module Match
 */
(function(M) {

	/**
	 * A game layer is like an offscreen canvas where all renderizable objects, that is objects that implement an
	 * onRender method, are put together for rendering. Game layers can be applied properties like alpha or scaling.
	 * All rendering takes place in a buffer which result is then rendered to the main canvas.
	 * NOTE: You need at least one layer in your game
	 * @class GameLayer
	 * @constructor
	 */
	function GameLayer(name, zIndex) {
		/**
		 * Array of Renderizables
		 * @property onRenderList
		 * @private
		 * @type Array
		 */
		this.onRenderList = [];
		/**
		 * Determines whether this layer needs to be redrawn or not
		 */
		this.needsRedraw = true;
		/**
		 * Determines whether the objects in this layer needs to be sorted again
		 */
		this.needsSorting = false;
		/**
		 * object rotation
		 * @property rotation
		 * @type float
		 * @example
				this.rotation = Math.PI;
		 */
    this.rotation = null;
		/**
		 * object scale factor
		 * @property scale
		 * @type Object
		 * @example
				this.scale = { x: 1, y: 1 };
		 */
    this.scale = null;
		/**
		 * Composite operation.
		 * Possible values: "source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "darker" | "copy" | "xor"
		 * @property operation
		 * @type String
		 * @example
				this.operation = "source-in";
		 */
		this.operation = null;
		/**
		 * object transparency
		 * @property alpha
		 * @type float value must be between 0 and 1
		 * @example
				this.alpha = 0.5;
		 */
		this._alpha;
		/**
		 * object visibility. Determines whether the object will be rendered or not
		 * @private
		 * @property _visible
		 * @type Boolean
		 */
		this._visible = true;
		/**
		 * Parrallax factor is used for parralax scrolling. The object x and y coordinates are multiplied by the camera position to translate the scene in different speeds
		 * @property parrallaxFactor
		 * @type Object object that contains floats x and y
		 * @default {x: 1, y: 1}
		 * @example
				var layer = new M.GameLayer();
				layer.parrallaxFactor.x = 1.25; //Move faster in the x axis
		 */
		this.parrallaxFactor = {
			x: 1, y: 1
		}
		/**
		 * Array that contains animations for this object
		 * @private
		 * @property _onLoopAnimations
		 * @type Array
		 */
		this._onLoopAnimations = [];
		/**
		 * Name of the layer
		 * @property name
		 * @type String
		 */
		this.name = name || "layer" + M._gameLayers.length;
		/**
		 * z-index of this layer. Match uses this attribute to sort the layers
		 * @property _zIndex
		 * @private
		 * @type {int}
		 */
		this._zIndex = zIndex || 0;
    /**
	   * Sets the background of the buffer
	   *
	   * @method setBackground
	   * @param {String} background a color, sprite name or null
	   * @example
		   this.background = "black";
			 this.background = "rgb(0, 100, 100)";
			 this.background = "skySprite";
			 this.background = null; //sets default background
	   */
		this.background = null;

		this.TYPE = M.renderizables.TYPES.LAYER;

	}
	/**
	 * Loops through the animations of the object
	 * @private
	 * @method _loopThroughAnimations
	 */
	GameLayer.prototype._loopThroughAnimations = function() {
		var i = 0,
		l = this._onLoopAnimations.length;
		for (; i < l; i++) {
			if (!this._onLoopAnimations[i].onLoop()) {
				this._onLoopAnimations.splice(i, 1);
			}
		}
	};
	/**
	 * Sets the transparency of the object
	 * @method setAlpha
	 * @param {float} value alpha value to set. Must be between 0 and 1
	 */
	GameLayer.prototype.setAlpha = function(value) {
		this._alpha = value;
	};
	/**
	 * Gets the transparency of the object
	 * @method getAlpha
	 * @param {float} value alpha value
	 */
	GameLayer.prototype.getAlpha = function() {
		return this._alpha;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	GameLayer.prototype.fadeIn = function(seconds, onFinished) {
		this._onLoopAnimations.push(new M.effects.visual.FadeIn(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade out animation to this object
	 * @method fadeOut
	 * @param {int} seconds time in seconds that the fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	GameLayer.prototype.fadeOut = function(seconds, onFinished) {
		this._onLoopAnimations.push(new M.effects.visual.FadeOut(this, seconds, onFinished));
		return this;
	};
	GameLayer.prototype.continousFade = function (seconds, fadeOutFirst, min, max) {
		this._onLoopAnimations.push(new M.effects.visual.ContinousFade(this, seconds, fadeOutFirst, min, max));
		return this;
	};
	/**
	 * Loops through every renderizable and renderizes it if it is visible
	 * @method onLoop
	 * @protected
	 * @param {Object} p contains information like if it is required to debug
	 * @return {HTMLCanvasElement} a canvas contaning the result of the rendering
	 */
	GameLayer.prototype.onLoop = function(p) {
	};
	/**
	 * Adds this layer to Match list of layers
	 * @method addToGame
	 * @example
			var layer = new M.GameLayer();
			layer.addToGame();
	 */
	GameLayer.prototype.addToGame = function() {
		M.pushGameLayer(this);
	};
	/**
	 * Tells the layer about a change in some attribute of one of its renderizables
	 * @method renderizableChanged
	 * @private
	 */
	GameLayer.prototype.renderizableChanged = function() {
		this.needsRedraw = true;
	};
	/**
	 * Tells the layer about a change in the z-index of one of its renderizables
	 * @method zIndexChanged
	 * @private
	 */
	GameLayer.prototype.zIndexChanged = function() {
		this.needsSorting = true;
	};
	/**
	 * Sets the z-index of this layer and makes Match sort the layers accordingly
	 * @method setZIndex
	 */
	GameLayer.prototype.setZIndex = function(value) {
		this._zIndex = value;
		M.sortLayers();
	};
	/**
	 * Returns the z-index of this layer
	 * @method getZIndex
	 */
	GameLayer.prototype.getZIndex = function() {
		return this._zIndex;
	};
	/**
	 * Pushes an object into the onRenderList
	 * @method push
	 * @param {renderers.Renderizable} object
	 * @param {String} key
	 * @param {int} zIndex
	 * @example
			this.push(new Sprite("ninja"), "ninja", 10);
	 */
	GameLayer.prototype.add = function(entity, key, zIndex) {

		if ( ! entity ) {
			throw new Error("Cannot push null entity to game layer");
		}

		if ( !entity.setZIndex ) {
			// M.logger.warn(M.getObjectName(entity) + " does not implement setZIndex method");
		}

		if ( !entity.getZIndex ) {
			// M.logger.warn(M.getObjectName(entity) + " does not implement getZIndex method");
		}

		if ( !entity._zIndex ) {
			entity._zIndex = this.onRenderList.length;
		}

		if ( entity.onLoad ) {
			entity.onLoad();
		}

		var self = this,
			onChange = function() {
				self.needsRedraw = true;
			};
		
		entity.views.eachValue(function(view) {
			view.addEventListener("attributeChanged", onChange);
		});

		this.needsSorting = true;

		this.onRenderList.push(entity);

		//TODO: We need to know which objects were added so if they were outside the viewport we must not re render
		this.needsRedraw = true;

		M.raise("gameObjectPushedToLayer", entity);

	};
	GameLayer.prototype.push = GameLayer.prototype.add;
	/**
	 * Sorts the onRenderList by the elements zIndex
	 * @method sort
	 */
	GameLayer.prototype.sort = function() {
		this.onRenderList.sort(this._sortFunction);
	};
	/**
	 * Sort logic based on zIndex
	 * @method _sortFunction
	 * @private
	 * @param {renderers.Renderizable} a
	 * @param {renderers.Renderizable} b
	 * @return {int} the difference between the zIndex of the given objects
	 */
	GameLayer.prototype._sortFunction = function(a, b) {
		return a._zIndex - b._zIndex;
	};
	/**
	 * Gets the first element from the onRenderList
	 * @method getFirst
	 * @return {renderers.Renderizable} the first game object in the list or null if the list is empty
	 */
	GameLayer.prototype.getFirst = function() {
		return this.getIndex(0);
	};
	/**
	 * Gets the element matching the provided index
	 * @method getIndex
	 * @return {renderers.Renderizable} the game object at the specified index or null if it is not in the list
	 */
	GameLayer.prototype.getIndex = function( index ) {
		try {
			return this.onRenderList[ index ];
		} catch (e) {
			return null;
		}
	};
	/**
	 * Gets the element matching the provided key
	 * @method get
	 * @param {String} key
	 * @return {renderers.Renderizable} the object matching the provided key or null if it is not in the list
	 * @example
	 
			var layer = new M.GameLayer(),
				ninja = new Sprite("ninja");
			
			layer.push(ninja, "ninja");
	 
			var theNinja = layer.get("ninja");
			
			alert(ninja == theNinja) //will yield true
			
	 */
	GameLayer.prototype.get = function(key) {

		if ( this.cache && this.cache.key == key ) {
			return this.cache;
		}

		var i = this.onRenderList.length, 
			current;

		while ( i-- ) {
			current = this.onRenderList[i];
			if ( key == current.key ) {
				this.cache = current;
				return current;
			}
		}
		
		return null;

	};
	/**
	 * Gets the last element from the onRenderList
	 * @method getLast
	 * @return {renderers.Renderizable} the last renderizable in the list or null if the list is empty
	 */
	GameLayer.prototype.getLast = function() {
		return this.getIndex( this.onRenderList.length - 1 );
	};
	/**
	 * Returns true if the element is in the onRenderList and false if not
	 * @method isonRenderList
	 * @return {Boolean} true if the object in in the list or false if not
	 */
	GameLayer.prototype.isOnRenderList = function(object) {
		return this.onRenderList.indexOf(object) != -1;
	};
	/**
	 * Removes an element from the onRenderList
	 * @method remove
	 * @param {renderers.Renderizable} object the object to remove
	 * @example
			//Create a sprite
			var ninja = new Sprite("ninja");
			
			//Add the sprite
			gameLayer.push(ninja);
			
			//Remove the sprite
			gameLayer.remove(ninja);
	 */
	GameLayer.prototype.remove = function( object ) {

		if ( ! object ) return;

		if ( typeof object == "string" ) {

			this.remove( this.get( object ) );

		} else {

			var i = this.onRenderList.indexOf( object );

			if ( i > -1 ) {
				
				this.onRenderList.splice( i, 1 );

				M.raise("gameObjectRemovedFromLayer", object);

			}

		}

		if ( object.onLoop ) {

			M.removeGameObject( object );

		}

		object.ownerLayer = null;

		this.needsRedraw = true;

	};
	/**
	 * Removes all elements from the onRenderList
	 * @method removeAll
	 */
	GameLayer.prototype.removeAll = function() {
		this.onRenderList = [];
	};

	M.GameLayer = M.Layer = GameLayer;

})(window.Match);
/**
 * @module Match
 */
(function(M, EventListener) {

	/**
	 * Provides methods for loading sprites and spritesheets. The event listeners inform you how many resources where loaded so far, this is 
	 * useful for loading screens.
	 * 
	 * @class SpriteManager
	 * @static
	 * @constructor
	 */
	function SpriteManager() {
	
		/**
		 * The path where all sprites are located
		 * @property path
		 * @type String
		 */
		this.path = "";

		/**
		 * The amount of sprites remaining to load
		 * @property toLoad
		 * @readOnly
		 * @type int
		 */
        this.toLoad = 0;
		/**
		 * The totla amount of sprites to load
		 * @property total
		 * @readOnly
		 * @type int
		 */
        this.total = 0;
		/**
		 * EventListener that gets called whenever a sprite is finished loading
		 * @property onImageLoaded
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				//e = {image, remaining, total}
				M.sprites.onImagesLoaded.addEventListener(function(e) {
					loadingText.setText("Loaded " + (e.total - e.remaining) + " of " + e.total);
				});
		 */
		this.onImageLoaded = new EventListener();
		/**
		 * EventListener that gets called when all sprites of a pack are finished loading
		 * @property onAllImagesLoaded
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				M.sprites.onAllImagesLoaded.addEventListener(function() {
					alert("All images are ready");
				});
		 */
		this.onAllImagesLoaded = new EventListener();
		/**
		 * EventListener that gets called whenever a sprite cannot be loaded
		 * @property onImageError
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				M.sprites.onImagesLoaded.addEventListener(function(image) {
					alert("could not load image " + image);
				});
		 */
		this.onImageError = new EventListener();
		/**
		 * Map used to store sprites
		 */
		this.assets = {};

    }

    function onError() {

        M.sprites._imageError(this);

    }

    function onLoad() {

        M.sprites._imageLoaded(this);

    }

    SpriteManager.prototype.get = function( name ) {
    	return this.assets[name];
    };

	/**
	 * Method that gets called after an image has finished loading
	 * @method _imageLoaded
	 * @private
	 * @param {HTMLImageElement} image
	 */
    SpriteManager.prototype._imageLoaded = function( image ) {

        this.toLoad--;

        if ( image.frames == undefined ) {

            image.frames = [{x:0, y: 0, width: image.width, height: image.height, halfWidth: image.width / 2, halfHeight: image.height / 2}];

        } else if ( image.tiles ) {

			var frames = new Array(),
				width = image.tiles.width,
				height = image.tiles.height,
				padding = image.tiles.padding || 0,
				columns = Math.floor(image.width / (width + padding)),
				lines = Math.floor(image.height / (height + padding)),
				column,
				line;

			for ( line = 0; line < lines; line++ ) {
				for ( column = 0; column < columns; column++ ) {
					var x = (padding + width) * column + padding,
						y = (padding + height) * line + padding;
					frames.push({
						x: x,
						y: y,
						width: width,
						height: height,
						halfWidth: width / 2,
						halfHeight: height / 2
					});
				}
			}

			image.frames = frames;

		} else {
		
 			for ( var i in image.frames ) {

				image.frames[i].halfWidth = image.frames[i].width / 2;
				image.frames[i].halfHeight = image.frames[i].height / 2;

			}
		
		}

        this.onImageLoaded.raise({image: image, name: image.getAttribute("data-name"), remaining: this.toLoad, total: this.total});

        if ( this.toLoad <= 0 ) this.onAllImagesLoaded.raise();

    };
	/**
	 * Method that gets called after an image has failed loading
	 * @method _imageError
	 * @private
	 * @param {HTMLImageElement} image
	 */
    SpriteManager.prototype._imageError = function( image ) {

        this.toLoad--;
		
		this.onImageError.raise(image);

        console.error("Could not load", image.src);

    };
	/**
	 * Loads images from a Map of String-Url or String-SpriteSheet
	 * @method load
	 * @param {Map<String, Url>|Map<String, Object>} images
	 * @param {Function} onFinished callback to execute when all images are loaded
	 * @param {Function} onProgress callback to execute when an image is loaded
	 * @example 
			M.SpriteManager.load({"sky": "/assets/sky.png"});
	 * @example 
			M.SpriteManager.load({"sky": "/assets/sky.png", "ground": "/assets/ground.png"});
	 * @example 
			M.SpriteManager.load({
				"sky": "/assets/sky.png",
				"ground": "/assets/ground.png",
				"ninja": {
					"source" : "/assets/ninja.png",
					//Array of frames that compose this spritesheet
					"frames" : [{
							"x" : 10,
							"y" : 10,
							"width" : 90,
							"height" : 14
						}, {
							"x" : 110,
							"y" : 10,
							"width" : 90,
							"height" : 14
						}, {
							"x" : 210,
							"y" : 10,
							"width" : 90,
							"height" : 14
						}
					],
					//Map of animations
					"animations" : {
						"jump": {
							"duration" : 250,
							"frames" : [0, 1, 2] //Index of the frames that compose this animation
						}
					}
				});
	 * @example
			M.SpriteManager.load([
				"assets/sprites/sky.json",
				"assets/sprites/sun.json",
				"assets/sprites/ground.json"
			]);
	 */
    SpriteManager.prototype.load = function( map, onFinished, onProgress ) {
	
		var current, img, i;

		if ( onFinished ) {
			this.onAllImagesLoaded.addEventListener(onFinished);
		}
		if ( onProgress ) {
			this.onImageLoaded.addEventListener(onProgress);
		}

		if ( map instanceof Array ) {
		
			var jsonMap = {},
				loaded = 0,
				self = this,
				onJsonReceived = function(response) {
					var json = JSON.parse(response);
					jsonMap[json.name] = json;
					loaded++;
					if ( loaded >= map.length ) {
						self.load(jsonMap);
					}
				};
			
			for ( i = 0; i < map.length; i++ ) {
				
				M.Ajax.post(map[i], onJsonReceived);
				
			}
		
		} else {
		
			var alreadyLoaded = 0,
				count = 0;
		
			for ( i in map ) {
			
				count++;
				
				if ( ! this.assets[ i ] ) {
				

					current = map[i],
					img = new Image();

					img.setAttribute("data-name", i);
					img.onload = onLoad;
					img.onerror = onError;

					this.total = ++this.toLoad;

					if ( typeof current == "string" ) {

						img.src = this.path + current;

					} else {

						img.src = this.path + current.source;

						img.frames = current.frames;

						img.animations = current.animations;

					}

					this.assets[ i ] = img;

				} else {
					alreadyLoaded++;
				}

			}
			
			if ( alreadyLoaded == count ) {
				this.onAllImagesLoaded.raise();
			}
		
		}

    };
	/**
	 * Removes the sprite that matches the given id
	 * @method remove
	 * @param {String} id the sprite id
	 */
	SpriteManager.prototype.remove = function(id) {
		if ( this.assets[id] ) {
			delete this.assets[id];
			if ( this.total - 1 >= 0 ) {
				this.total--;
			}
			if ( this.toLoad - 1 >= 0 ) {
				this.toLoad--;
			}
		}
	};
	/**
	 * Removes all sprites
	 * @method removeAll
	 */
	SpriteManager.prototype.removeAll = function() {
		this.assets = {};
		this.total = 0;
		this.toLoad = 0;
	};
	/**
	 * Removes all event listeners
	 * @method removeAllEventListeners
	 */
	SpriteManager.prototype.removeAllEventListeners = function() {
		this.onImageLoaded = new EventListener();
		this.onAllImagesLoaded = new EventListener();
		this.onImageError = new EventListener();
	};

    M.SpriteManager = new SpriteManager();

    M.sprites = M.SpriteManager;

})(M, EventListener);
/**
 * @module Match
 */
(function(M, EventListener) {

	/**
	 * Provides an interface for Audio. Holds a buffuer for simoultaneuisly playing the same sound.
	 * @class Sound
	 * @protected
	 * @constructor
	 */
	function Sound( name, url ) {

		/**
		 * Array containing the same sound multiple times. Used for playing the same sound simoultaneusly.
		 * @property audioBuffer
		 * @private
		 * @type Array
		 */
		this.audioBuffer = [];
		/**
		 * Sound source url
		 * @property src
		 * @private
		 * @type String
		 */
		this.src = url;
		/**
		 * @property name
		 * Name of the sound
		 * @private
		 * @type String
		 */
		this.name = name;

		this.increaseBuffer();

	}

	/**
	 * Max audio buffer size
	 * @property MAX_BUFFER
	 * @type int
	 */
	Sound.prototype.MAX_BUFFER = 3;
	/**
	 * Sets the current sound ready and calls onSoundLoaded
	 * @method setReady
	 * @private
	 */
	Sound.prototype.setReady = function() {
		this.canPlay = this.checkOk;
		if ( this.audioBuffer.length == 1 ) {
			M.sounds.onSoundLoaded.raise({sound: this, remaining: M.sounds.toLoad, total: M.sounds.total});
		}
	};
	/**
	 * Sets the current sound not ready and calls onSoundError
	 * @method setNotReady
	 * @private
	 */
	Sound.prototype.setNotReady = function() {
		this.canPlay = this.checkOk;
		M.sounds.onSoundError.raise({sound: this, remaining: M.sounds.toLoad, total: M.sounds.total});
	};
	/**
	 * Plays the current sound. If a sound like this is already playing then a new one is added to the
	 * buffer and played
	 * @method play
	 */
	Sound.prototype.play = function(loop) {

		if ( ! this.canPlay() ) return;

		var i = 0, current;

		while ( i < this.audioBuffer.length ) {

			current = this.audioBuffer[i];

			if ( current.ended || current.currentTime == 0 ) {
				current.loop = loop;
				current.play();
				return;
			}

			i++;

		}

		current = this.audioBuffer[0];
		current.pause();
		current.currentTime = 0;
		current.loop = loop;
		current.play();

		if ( this.audioBuffer.length < this.MAX_BUFFER ) {
			this.increaseBuffer();
		}

	};
	/**
	 * Stops plays the current sound
	 * @method stop
	 */
	Sound.prototype.stop = function() {

		if ( ! this.canPlay() ) return;

		this.each( function( obj ) {
            if ( obj.duration > 0 ) {
                obj.pause();
                obj.currentTime = 0;
            }
		});

	};
	/**
	 * Pauses the current sound
	 * buffer and played
	 * @method pause
	 */
	Sound.prototype.pause = function() {

		if ( ! this.canPlay() ) return;
		
		if(this.onNextPauseResume) {
			this.play();
			this.onNextPauseResume = false;
		} else {
			this.onNextPauseResume = this.isPlaying();
			this.each( function( obj ) {
				obj.pause();
			});
		}
	};
	/**
	 * Returns false
	 * @method checkFail
	 * @private
	 */
	Sound.prototype.checkFail = function() {
		return false;
	};
	/**
	 * Returns true
	 * @method checkOf
	 * @private
	 */
	Sound.prototype.checkOk = function() {
		return true;
	};
	/**
	 * Determines whether this sound can be played or not
	 * @method canPlay
	 * @type Boolean
	 */
	Sound.prototype.canPlay = function() {
		this.increaseBuffer();
		return false;
	};
	/**
	 * Sets the sound playback speed
	 * @method setPlaybackRate
	 * @param {int} rate
	 */
	Sound.prototype.setPlaybackRate = function(rate) {
		this.each( function( obj ) {
			obj.playbackRate = rate;
		});
	};
	/**
	 * Resets the sound playback speed to normal
	 * @method resetPlaybackRate
	 */
    Sound.prototype.resetPlaybackRate = function() {
        this.each( function( obj ) {
			obj.playbackRate = 1;
		});
    }
	/**
	 * Gets the sound playback speed
	 * @method getPlaybackRate
	 */
	Sound.prototype.getPlaybackRate = function() {
		return this.audioBuffer[0].playbackRate;
	};
	/**
	 * Determines whether the sound is paused or playing
	 * @method isPaused
	 */
	Sound.prototype.isPaused = function() {
		var i = 0; l = this.audioBuffer.length;
		for(; i < l; i++) {
			if ( this.audioBuffer[i].paused ) return true;
		}		
		return false;
	};
	/**
	 * Sets the volume of this sound
	 * @method setVolume
	 * @param volume
	 */
	Sound.prototype.setVolume = function( volume ) {

		this.each( function( obj ) {
			obj.volume = volume;
		});

	};
	/**
	 * Determines whether the sound is playing or not
	 * @method isPlaying
	 */
	Sound.prototype.isPlaying = function() {
		var i = 0; l = this.audioBuffer.length;
		for(; i < l; i++) {
			if( !this.audioBuffer[i].paused ) return true;
		}		
		return false;		
	};
	/**
	 * Executes the provided function using every sound in the buffer as parameter
	 * @method each
	 * @param {Function} func the function to execute
	 */
	Sound.prototype.each = function( func ) {

		var i = this.audioBuffer.length;

		while ( i-- ) {

			func( this.audioBuffer[i] );

		}

	};
	/**
	 * Increases the sound buffer provided the limit is not reached
	 * @method increaseBuffer
	 */
	Sound.prototype.increaseBuffer = function() {

		var sound = new Audio( this.src ),
			first = this.audioBuffer[0];

		sound.addEventListener("loadeddata", onloadeddata );
		sound.addEventListener("error", onerror );
		sound.name = this.name;

		if ( first ) {
			sound.muted = first.muted;
			sound.volume = first.volume;
		}

		this.audioBuffer.push( sound );

	};
	Sound.prototype.isMuted = function() {
		if ( this.audioBuffer.length > 0 ) {
			return this.audioBuffer[0].muted;
		}
		return false;
	};
	/**
	 * Toggles this sound on or off
	 * @method toggle
	 */
	Sound.prototype.toggle = function() {
		if ( this.isMuted() ) {
			this.unmute();
		} else {
			this.mute();
		}
	};
	/**
	 * Mutes this sound
	 * @method mute
	 */
	Sound.prototype.mute = function() {

		this.each( function( obj ) {
			obj.muted = true;
		});

	};
	/**
	 * Unmutes this sound
	 * @method unmute
	 */
	Sound.prototype.unmute = function() {

		this.each( function( obj ) {
			obj.muted = false;
		});

	};
	/**
	 * Sets this sound to loop
	 * @method setLoop
	 * @param {Boolean} value
	 */
	Sound.prototype.setLoop = function(value) {
		this.audioBuffer[0].loop = value;
	};

	var fakeFunc = function() {};
		fakeSound = {
            name: ""
        };

    for ( var i in Sound.prototype ) {
        if ( typeof Sound.prototype[i] == "function" ) {
            fakeSound[i] = fakeFunc;
        }
    }

	function onloadeddata() {
		M.sounds.assets[ this.name ].setReady();
		M.sounds.toLoad--;
		if(M.sounds.toLoad <= 0) {
			M.sounds.onAllSoundsLoaded.raise();
		}
	}

	function onerror() {
		console.warn( "Unable to load " + this.src );
        M.sounds.error = true;
		M.sounds.assets[ this.name ].setNotReady();
		M.sounds.toLoad--;
		if(M.sounds.toLoad <= 0) {
			M.sounds.onAllSoundsLoaded.raise();
		}
	}
	
	/**
	 * Provides methods for loading and playing sounds. The event listeners inform you how many resources where loaded so far, this is 
	 * useful for loading screens.
	 * 
	 * @example
			//To play a sound you must first load it using the SoundManager, once it is loaded you can access it by its key inside the SoundManager
			M.sounds.load("laser", "/sounds/laser");
			M.sounds.laser.play();
	 *
	 * @class SoundManager
	 * @static
	 * @constructor
	 */
	function SoundManager() {

		/**
		 * The path where all sounds are located
		 * @property path
		 * @type String
		 */
		this.path = "";
		/**
		 * The amount of sprites remaining to load
		 * @property toLoad
		 * @readOnly
		 * @type int
		 */
		this.toLoad = 0;
		/**
		 * The totla amount of sprites to load
		 * @property total
		 * @readOnly
		 * @type int
		 */
        this.total = 0;
		/**
		 * EventListener that gets called whenever a sound is finished loading
		 * @property onSoundLoaded
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				//e = {sound, remaining, total}
				M.sounds.onSoundLoaded.addEventListener(function(e) {
					loadingText.setText("Loaded " + (e.total - e.remaining) + " of " + e.total);
				});
		 */
		this.onSoundLoaded = new EventListener();
		/**
		 * EventListener that gets called when all sounds of a pack are finished loading
		 * @property onAllSoundsLoaded
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				M.sounds.onAllSoundsLoaded.addEventListener(function() {
					alert("All sounds are ready");
				});
		 */
		this.onAllSoundsLoaded = new EventListener();
		/**
		 * EventListener that gets called whenever a sound cannot be loaded
		 * @property onSoundError
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				M.sounds.onSoundError.addEventListener(function(sound) {
					alert("could not load sound " + sound);
				});
		 */
		this.onSoundError = new EventListener();
		
		/**
		 * If there were errors while loading sounds this attribute becomes true
		 * @property error
		 * @readOnly
		 * @type Boolean
		 */
        this.error = false;
		/**
		 * Map used to store sounds
		 */
		this.assets = {};

	}
	/**
	 * Loads sounds from a Map of String-Url. The SoundManager determines what extension is best for the current browser
	 * so the extension is not required.
	 * @method load
	 * @param {Map<String, Url>} sounds
	 * @example
			//Let the SoundManager load the file with the most suitable extension for this browser
			M.SoundManager.load({
				"laser": "/sounds/laser",
				"talk": "/sounds/talk"
			});
	 * @example
			//Force loading an mp3 file
			M.SoundManager.load({
				"laser": "/sounds/laser.mp3",
				"talk": "/sounds/talk.mp3"
			});

	 */
	SoundManager.prototype.load = function(map, onFinished, onProgress) {
	
		if ( onProgress ) {
			this.onSoundLoaded.addEventListener(onProgress);
		}
		if ( onFinished ) {
			this.onAllSoundsLoaded.addEventListener(onFinished);
		}

		if ( map instanceof Array ) {
		
			var jsonMap = {},
				loaded = 0,
				self = this,
				onJsonReceived = function(response) {

					loaded++;
					
					var json = JSON.parse(response);
					
					jsonMap[json.name] = json.source;
					
					if ( loaded >= map.length ) {
						self.load(jsonMap);
					}
				
				};
			
			for ( var i = 0; i < map.length; i++ ) {
				
				M.Ajax.post(map[i], onJsonReceived);
				
			}
		
		} else {
		
			for ( var i in map ) {
				this.loadOne( i, map[i] );
			}
		
		}

	};
	/**
	 * Loads a sound from the given url and assigns it the provided name
	 * @method loadOne
	 * @param {String} name
	 * @param {String} url
	 * @example 
			//Load one file
			M.SoundManager.loadOne("footstep", "/sounds/footstep"});
	 */
	SoundManager.prototype.loadOne = function( name, url ) {

		this.total = ++this.toLoad;
		
		if ( M.browser.supportedAudioFormat == undefined ) {

			this.assets[ name ] = fakeSound;
			fakeSound.name = name;
			this.onSoundLoaded.raise({sound: fakeSound, remaining: M.sounds.toLoad--, total: M.sounds.total});
            
            if ( this.toLoad <= 0 ) {
                this.onAllSoundsLoaded.raise();
            }

		} else {

			if ( url.substr(0, 4) == "data" ) {
			
				this.assets[ name ] = new Sound( name, url );
				
			} else {
			
				if ( url.lastIndexOf(".") == -1 ) {
					url = url + M.browser.supportedAudioFormat;
				}
			
				this.assets[ name ] = new Sound( name, this.path + url );
				
			}


		}

		this.assets[ name ].name = name;

	};
	/**
	 * Pauses all sounds
	 * @method pause
	 * @example 
			M.SoundManager.pause();
	 */
	SoundManager.prototype.pause = function() {
		for ( var i in this.assets ) {
			this.assets[i].pause();
		}
	};
	/**
	 * Sets the volume of all sounds
	 * @method setVolume
	 * @param {float} value the volume value, must be between 0 and 1
	 * @example 
			M.SoundManager.setVolume(0.6);
	 */
	SoundManager.prototype.setVolume = function(value) {
		for ( var i in this.assets ) {
			this.assets[i].setVolume( value );
		}
	};
	/**
	 * Mutes all sounds
	 * @method mute
	 * @example 
			M.SoundManager.mute();
	 */
	SoundManager.prototype.mute = function() {
		for ( var i in this.assets ) {
			this.assets[i].mute();
		}
	};
	/**
	 * Unmutes all sounds
	 * @method mute
	 * @example 
			M.SoundManager.unmute();
	 */
	SoundManager.prototype.unmute = function() {
		for ( var i in this.assets ) {
			this.assets[i].unmute();
		}
	};
	/**
	 * Mutes or unmutes all sounds
	 * @method mute
	 * @example 
			M.SoundManager.mute();
	 */
	SoundManager.prototype.toggle = function() {
		for ( var i in this.assets ) {
			this.assets[i].toggle();
		}
	};
	/**
	 * Stops all sounds
	 * @method stop
	 * @example 
			M.SoundManager.stop();
	 */
	SoundManager.prototype.stop = function() {
		for ( var i in this.assets ) {
			this.assets[i].stop();
		}
	};
	/**
	 * Removes the sound that matches the given id
	 * @method remove
	 * @param {String} id the sound id
	 */
	SoundManager.prototype.remove = function(id) {
		if ( this.assets[id] ) {
			delete this.assets[id];
			if ( this.total - 1 >= 0 ) {
				this.total--;
			}
			if ( this.toLoad - 1 >= 0 ) {
				this.toLoad--;
			}
		}
	};
	/**
	 * Removes all sounds
	 * @method removeAll
	 */
	SoundManager.prototype.removeAll = function() {
		this.assets = {};
		this.toLoad = 0;
		this.total = 0;
	};

	SoundManager.prototype.removeAllEventListeners = function() {
		this.onSoundLoaded = new EventListener();
		this.onAllSoundsLoaded = new EventListener();
		this.onSoundError = new EventListener();
	};
	
	SoundManager.prototype.play = function(name, loop) {
		var sound = this.assets[name];
		if ( sound ) {
			sound.play(loop);
		}
	};

	SoundManager.prototype.stop = function(name) {
		var sound = this.assets[name];
		if ( sound ) {
			sound.stop();
		}
	};

	SoundManager.prototype.pause = function(name) {
		var sound = this.assets[name];
		if ( sound ) {
			sound.pause();
		}
	};

	SoundManager.prototype.getSound = function(name) {
		return this.assets[name];
	};

	M.SoundManager = M.sounds = new SoundManager();

})( Match, EventListener );
(function (namespace) {
	
	/**
	 * @class Renderer
	 * @constructor
	 * @abstract
	 */
	function Renderer(canvas) {
		this.canvas = canvas;
		this.frontBuffer = null;
	}
	/**
	 * @method render
	 * @abstract
	 */
	Renderer.prototype.render = function() {
		throw new Error("Abstract method");
	};
	/**
	 * @method getCenter
	 */
	Renderer.prototype.getCenter = function() {
		return {x: this.canvas.width / 2, y: this.canvas.height / 2};
	};
	/**
	 * @method setSize
	 */
	Renderer.prototype.setSize = function( width, height ) {
		this.canvas.width = width;
		this.canvas.height = height;
	};
	/**
	 * @method getWidth
	 */
	Renderer.prototype.getWidth = function() {
		return this.canvas.width;
	};
	/**
	 * @method getHeight
	 */
	Renderer.prototype.getHeight = function() {
		return this.canvas.height;
	};
	/**
	 * @method adjustTo
	 * Stretches canvas to the given values.
	 */
	Renderer.prototype.adjustTo = function( width, height ) {
		this.canvas.style.setProperty("width", width + "px", null);
		this.canvas.style.setProperty("height", height + "px", null);
	};
	/**
	 * @method adjustToAvailSize
	 */
	Renderer.prototype.adjustToAvailSize = function() {
		this.canvas.adjustTo( window.screen.availWidth + "px", window.screen.availHeight + "px" );
	};
	/**
	 * @method resizeKeepingAspect
	 */
	Renderer.prototype.resizeKeepingAspect = function( times ) {
		this.canvas.adjustTo( this.canvas.width * times, this.canvas.height * times );
	};
	/**
	 * @method getRight
	 */
	Renderer.prototype.getRight = function() {
		return this.canvas.offsetLeft + this.canvas.offsetWidth;
	};
	/**
	 * @method getBottom
	 */
	Renderer.prototype.getBottom = function() {
		return this.canvas.offsetTop + this.canvas.offsetHeight;
	};
	/**
	 * @method getAvailWidth
	 */
	Renderer.prototype.getAvailWidth = function() {
		if ( this.canvas.getRight() < window.screen.availWidth ) { 
			return this.canvas.offsetWidth;
		} else {
			return window.screen.availWidth - this.canvas.offsetLeft;
		}
	};
	/**
	 * @method getAvailHeight
	 */
	Renderer.prototype.getAvailHeight = function() {
		if ( this.canvas.getBottom() < window.screen.availHeight ) { 
			return this.canvas.offsetHeight;
		} else {
			return window.screen.availHeight - this.canvas.offsetTop;
		}
	};
	/**
	 * @method getViewport
	 */
	Renderer.prototype.getViewport = function() {
		var viewport = {};
		if ( this.canvas.offsetLeft < 0 ) {
			viewport.left = -this.canvas.offsetLeft;
		} else {
			viewport.left = 0;
		}
		if ( this.canvas.offsetTop < 0 ) {
			viewport.top = -this.canvas.offsetTop;
		} else {
			viewport.top = 0;
		}
		if ( this.canvas.offsetLeft + this.canvas.offsetWidth > window.screen.availWidth ) {
			viewport.right = window.screen.availWidth - this.canvas.offsetLeft;
		} else {
			viewport.right = this.canvas.offsetWidth;
		}
		if ( this.canvas.offsetTop + this.canvas.offsetHeight > window.screen.availHeight ) {
			viewport.bottom = window.screen.availHeight - this.canvas.offsetTop;
		} else {
			viewport.bottom = this.canvas.offsetHeight;
		}
		return viewport;
	};
	/**
	 * Returns the aspect between the actual size of the canvas and the css size of it  
	 * @method getAspect
	 */
	Renderer.prototype.getAspect = function() {
		var aspect = { x: 1, y: 1 };
		if ( this.canvas.style.width && this.canvas.width != parseInt(this.canvas.style.width) ) {
			aspect.x = this.canvas.width / parseInt(this.canvas.style.width);
		}
		if ( this.canvas.style.height && this.canvas.height != parseInt(this.canvas.style.height) ) {
			aspect.y = this.canvas.height / parseInt(this.canvas.style.height);
		}
		return aspect;
	};
	/**
	 * Stretches the contents of the canvas to the size of the html document.
	 * This works as forcing a fullscreen, if the navigation bars of the browser were hidden.
	 *
	 * NOTE: This method behaves exactly as setCanvasStretchTo using document client width and height
	 *
	 * @method setCanvasStretch
	 * @param {Boolean} value true to stretch, false to set default values
	 */
	Renderer.prototype.setCanvasStretch = function(value) {
		if ( value ) {
			this.setCanvasStretchTo(document.documentElement.clientWidth, document.documentElement.clientHeight);
		} else {
			this.setCanvasStretchTo("auto", "auto");
		}
	};
	/**
	 * Stretches the contents of the canvas to the given size
	 *
	 * @method setCanvasStretchTo
	 * @param {String} w width in coordinates, as css pixels or percentages
	 * @param {String} h height in coordinates, as css pixels or percentages
	 */
	Renderer.prototype.setCanvasStretchTo = function(w, h) {
		if ( this.frontBuffer ) {
			if ( w ) {
				if ( typeof w == "number" || ( w != "auto" && w.indexOf("px") == "-1" && w.indexOf("%") == "-1" ) ) {
					w = w + "px";
				}
				this.frontBuffer.canvas.style.width = w;
			}

			if ( h ) {
				if ( typeof h == "number" || ( h != "auto" && h.indexOf("px") == "-1" && h.indexOf("%") == "-1" ) ) {
					h = h + "px";
				}
				this.frontBuffer.canvas.style.height = h;
			}
		}
	};
	
	Renderer.name = "Renderer";

	M.renderers = M.renderers || {};

	namespace.renderers.Renderer = Renderer;

})(M);
(function (Renderer) {
	
	function StandardEntityRenderer(canvas) {

		this.extendsRenderer(canvas);

		this.frontBuffer = this.canvas.getContext("2d");
		
		this.backBuffer = document.createElement("canvas").getContext("2d");

		this.compositeOperations = [
			"source-over",
			"source-atop",
			"source-in",
			"source-out",
			"destination-atop",
			"destination-in",
			"destination-out",
			"destination-over",
			"lighter",
			"xor",
			"copy"
		];
	
		this.DEFAULT_COMPOSITE_OPERATION = 0;
		this.DEFAULT_ALPHA = 1;
		this.DEFAULT_SHADOW_OFFSET_X = this.frontBuffer.shadowOffsetX;
		this.DEFAULT_SHADOW_OFFSET_Y = this.frontBuffer.shadowOffsetY;
		this.DEFAULT_SHADOW_COLOR = this.frontBuffer.shadowColor;
		this.DEFAULT_SHADOW_BLUR = this.frontBuffer.shadowBlur;

		this.shadowBlur = this.DEFAULT_SHADOW_BLUR;
		this.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
		this.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
		this.shadowChanged = false;

		this.compositeOperation = this.DEFAULT_COMPOSITE_OPERATION;

		this._reRenderAllLayers = false;
    
    this._buffers = {};

		var self = this;

		this.camera = new M.Camera();
		this.camera.addEventListener("locationChanged", function () {
			self._reRenderAllLayers = true;
		});

		this.updateBufferSize();
		this.updateViewport();
		
	}
	StandardEntityRenderer.prototype.setFullScreen = function() {
		this.frontBuffer.canvas.width = window.innerWidth;
		this.frontBuffer.canvas.height = window.innerHeight;
		this.updateBufferSize();
	};
	StandardEntityRenderer.prototype.getContext = function() {
		return this.frontBuffer;
	};
	StandardEntityRenderer.prototype.getCanvas = function() {
		return this.frontBuffer.canvas;
	};
	/**
	 * Applies the operation of this object to the context as composite operation
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyOperation = function(object, context) {
		if ( object._compositeOperation ) {
			context.globalCompositeOperation = this.compositeOperations[object._compositeOperation];
			this.compositeOperation = object._compositeOperation;
		} else if (this.compositeOperation != this.DEFAULT_COMPOSITE_OPERATION) {
			this.resetOperation(context);
		}
	};
	/**
	 * @method resetOperation
	 * @abstract
	 */
	StandardEntityRenderer.prototype.resetOperation = function(context) {
		context.globalCompositeOperation = this.compositeOperations[this.DEFAULT_COMPOSITE_OPERATION];
		this.compositeOperation = this.DEFAULT_COMPOSITE_OPERATION;
	};
	/**
	 * Applies the alpha of this object to the provided context
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyAlpha = function(object, context) {
		
		if ( object._alpha != undefined && object._alpha >= 0 && object._alpha <= 1 ) {
			if (  this.alpha != object._alpha ) {
				context.globalAlpha = this.alpha = object._alpha;
			}
		} else if ( this.alpha != this.DEFAULT_ALPHA ) {
			this.resetAlpha(context);
		}

	};
	/**
	 * @method resetAlpha
	 * @abstract
	 */
	StandardEntityRenderer.prototype.resetAlpha = function(context) {
		context.globalAlpha = this.alpha = this.DEFAULT_ALPHA;
	};
	/**
	 * Applies the shadow of this object to the provided context
	 *
	 * @method _applyShadow
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyShadow = function(object, context) {
		// if ( object._shadow ) {
		// 	var s = object._shadow;
		// 	context.shadowOffsetX = this.shadowOffsetX = s.x;
		// 	context.shadowOffsetY = this.shadowOffsetY = s.y;
		// 	context.shadowBlur = this.shadowBlur = s.blur;
		// 	context.shadowColor = s.color;
		// 	this.shadowChanged = true;
		// } else if (this.shadowChanged) {
		// 	this.resetShadow(context);
		// }

		context.shadowBlur = this.DEFAULT_SHADOW_BLUR;
		context.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
		context.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
		context.shadowColor = this.DEFAULT_SHADOW_COLOR;
		
		if ( object._shadow ) {
			var s = object._shadow;
			context.shadowOffsetX = s.x;
			context.shadowOffsetY = s.y;
			context.shadowBlur = s.blur;
			context.shadowColor = s.color;
		}

	};
	/**
	 * @method resetShadow
	 * @abstract
	 */
	StandardEntityRenderer.prototype.resetShadow = function(context) {
		// if ( this.shadowChanged ) {
			// if ( this.shadowBlur != this.DEFAULT_SHADOW_BLUR ) {
			// 	context.shadowBlur = this.shadowBlur = this.DEFAULT_SHADOW_BLUR;
			// }
			// if ( this.shadowOffsetX != this.DEFAULT_SHADOW_BLUR ) {
			// 	context.shadowOffsetX = this.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
			// }
			// if ( this.shadowOffsetY != this.DEFAULT_SHADOW_OFFSET_Y ) {
			// 	context.shadowOffsetY = this.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
			// }
			// this.shadowChanged = false;
		// }

		context.shadowBlur = this.DEFAULT_SHADOW_BLUR;
		context.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
		context.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
		context.shadowColor = this.DEFAULT_SHADOW_COLOR;

	};
	StandardEntityRenderer.prototype.setRenderingAlphaTime = function(alphaTime) {
		this._alphaTime = alphaTime;
		this._alphaTimeDif = 1 - alphaTime;
	};			
	StandardEntityRenderer.prototype.interpolate = function(current, previous) {
		return previous * this._alphaTime + current * this._alphaTimeDif;
	};
	StandardEntityRenderer.prototype._interpolateX = function(object) {
		return this.interpolate(object._x, object._prevX);
	};
	StandardEntityRenderer.prototype._interpolateY = function(object) {
		return this.interpolate(object._y, object._prevY);
	};
	StandardEntityRenderer.prototype._applyTranslation = function(object, context, cameraX, cameraY) {
		context.translate(object._x - cameraX, object._y - cameraY);
	};
	/**
	 * Applies the rotation of this object to the provided context
	 *
	 * @method _applyRotation
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyRotation = function(object, context) {
		if ( object._rotation ) {
			context.rotate(object._rotation);
		}
	};
	/**
	 * Applies the scale factor of this object to the provided context
	 *
	 * @method _applyScale
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyScale = function(object, context) {
		if ( object._scale ) {
			context.scale(object._scale.x, object._scale.y);
		}
	};
	/**
	 * Clears the given context
	 * @method clear
	 * @param {HTMLContext2d} context to clear
	 */
	StandardEntityRenderer.prototype.clear = function(context) {
		context.clearRect(0,0, context.canvas.width, context.canvas.height);
	};
	/**
	 * Renders the contents of the layers to the game canvas without using a middle buffer. This may result in flickering
	 * in some systems and does not allow applying properties to layers
	 * @method renderSingleBuffer
	 * @param {Array} gameLayerList array of game layers
	 * @param {CanvasRenderingContext2D} frontCanvas the canvas attached to the document where the game takes place
	 * @param {OnLoopProperties} p useful objects for performance increase
	 */
	StandardEntityRenderer.prototype.renderSingleBuffer = function(gameLayerList, frontCanvas, p) {

		/**
		 * Cache variables that are used in this function
		 */
		var l = gameLayerList.length,
			i = 0,
			f = this.frontBuffer;

		f.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		for ( ; i < l; i++ ) {
			f.drawImage( gameLayerList[i].onLoop(p), 0, 0 );
		}

	};
	/**
	 * Renders the contents of the layers to the game canvas using a middle buffer to avoid flickering. Enables the use of layer properties
	 * @method renderDoubleBuffer
	 * @param {Array} gameLayerList array of game layers
	 * @param {CanvasRenderingContext2D} frontCanvas the canvas attached to the document where the game takes place
	 * @param {OnLoopProperties} p useful objects for performance increase
	 */
	StandardEntityRenderer.prototype.renderDoubleBuffer = function(gameLayerList, frontCanvas, p) {

		/*
		 * Cache variables that are used in this function
		 */
		var l = gameLayerList.length,
			i = 0,
			currentLayer,
			backBuffer = this.backBuffer;

		backBuffer.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		for ( ; i < l; i++ ) {

			currentLayer = gameLayerList[i];

			var result = currentLayer.onLoop(p);

			backBuffer.save();

			if ( currentLayer.composite ) {
				backBuffer.globalCompositeOperation = currentLayer.composite;
			}

			if ( currentLayer._alpha != null && currentLayer._alpha >= 0 && currentLayer._alpha <= 1 ) {
				backBuffer.globalAlpha = currentLayer._alpha;
			}

			var hW = this.backBufferHalfWidth,
				hH = this.backBufferHalfHeight;

			// var hW = ~~(this.backBufferHalfWidth + 0.5),
			// 	hH = ~~(this.backBufferHalfHeight + 0.5);


			backBuffer.translate(hW, hH);

			if ( currentLayer.rotation ) {
				backBuffer.rotate(currentLayer.rotation);
			}

			if ( currentLayer.scale ) {
				backBuffer.scale(currentLayer.scale.x, currentLayer.scale.y);
			}

			backBuffer.drawImage( result, hW, hH);

			backBuffer.restore();

		}

		this.frontBuffer.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		this.frontBuffer.drawImage( backBuffer.canvas, 0, 0 );

	};
	/**
	 * Updates the back buffer size to match the size of the game canvas
	 *
	 * @method updateBufferSize
	 */
	StandardEntityRenderer.prototype.updateBufferSize = function() {

		if ( this.backBuffer && this.frontBuffer ) {
			this.backBuffer.canvas.width = this.frontBuffer.canvas.width;
			this.backBuffer.canvas.height = this.frontBuffer.canvas.height;
			this.backBufferHalfWidth = this.backBuffer.canvas.width / 2;
			this.backBufferHalfHeight = this.backBuffer.canvas.height / 2;
		}
		
		if ( M.collisions.PixelPerfect ) {
			M.collisions.PixelPerfect.testContext.canvas.width = this.backBuffer.canvas.width;
			M.collisions.PixelPerfect.testContext.canvas.height = this.backBuffer.canvas.height;
		}

		if ( M.offScreenCanvas ) {
			M.offScreenCanvas.width = this.frontBuffer.canvas.width;
			M.offScreenCanvas.height = this.frontBuffer.canvas.height;
		}

		this.updateViewport();

	};
	/**
	 * Updates the camera viewport to match the size of the game canvas
	 * @method updateViewport
	 */
	StandardEntityRenderer.prototype.updateViewport = function() {
		this.camera.setViewport( this.frontBuffer.canvas.width, this.frontBuffer.canvas.height );
	};
	StandardEntityRenderer.prototype.getViewportSize = function() {
		return { width: this.camera.viewportWidth, height: this.camera.viewportHeight };
	};
	StandardEntityRenderer.prototype.renderRectangle = function(renderizable, context, cameraX, cameraY) {

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		if ( renderizable._rotation || renderizable._scale ) {
		
			context.save();

			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);
			
			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
			 context.fillRect( -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );
			}

			if ( renderizable._strokeStyle ) {

				if ( renderizable._lineWidth ) {
					context.lineWidth = renderizable._lineWidth;
				}

				context.strokeStyle = renderizable._strokeStyle;
				context.strokeRect( -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );
			}

			context.restore();
		
		} else {
		
			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
        // context.fillRect( renderizable._x - renderizable._halfWidth - cameraX, renderizable._y - renderizable._halfHeight - cameraY, renderizable._width, renderizable._height );
        context.fillRect( M.fastRound(renderizable._x - renderizable._halfWidth - cameraX), M.fastRound(renderizable._y - renderizable._halfHeight - cameraY), renderizable._width, renderizable._height );
			}
			
			if ( renderizable._strokeStyle ) {

				if ( renderizable._lineWidth ) {
					context.lineWidth = renderizable._lineWidth;
				}

				context.strokeStyle = renderizable._strokeStyle;
				context.strokeRect( renderizable._x - renderizable._halfWidth - cameraX, renderizable._y - renderizable._halfHeight - cameraY, renderizable._width, renderizable._height );

			}

		}

		this._applyShadow(renderizable, context);
		
	};
	/**
	 * Renders the current text in the provided context
	 *
	 * @method onRender
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	StandardEntityRenderer.prototype.renderText = function( renderizable, context, cameraX, cameraY ) {

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		//TODO: caching oportunity
		context.font = renderizable._style + renderizable._variant + renderizable._weight + renderizable._size + renderizable._family;

		context.textAlign = renderizable._textAlign;

		context.textBaseline = renderizable._textBaseline;
		
		this._applyShadow(renderizable, context);

		if ( renderizable._halfWidth == 0 ) {
			renderizable.getWidth();
		}
		if ( renderizable._halfHeight == 0 ) {
			renderizable.getHeight();
		}

		if ( renderizable._rotation || renderizable._scale ) {

			context.save();

			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);

			this.fillText(renderizable, context, -renderizable._halfWidth, -renderizable._halfHeight);

			context.restore();

		} else {

			this.fillText(renderizable, context, renderizable._x - renderizable._halfWidth, renderizable._y - renderizable._halfHeight);

		}

	};
	StandardEntityRenderer.prototype.fillText = function(renderizable, context, x , y) {

		context.fillStyle = renderizable._fillStyle;
		
		if ( renderizable.multiLine ) {
			for ( var i = 0; i < renderizable.multiLine.length; i++ ) {
				context.fillText( renderizable.multiLine[i], x, y + i * renderizable.getHeight() );
			}
		} else {
			context.fillText( renderizable._text, x, y );
		}

		if ( renderizable._strokeStyle ) {
			context.strokeStyle = renderizable._strokeStyle;
			context.lineWidth = renderizable._lineWidth || 1;
			context.strokeText(renderizable._text, x, y );
		}

	};
	/**
	 * Renders the current sprite in the provided context
	 *
	 * @method onRender
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	StandardEntityRenderer.prototype.renderCircle = function( renderizable, context, cameraX, cameraY ) {

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		if ( renderizable._scale ) {

			context.save();

			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyScale(renderizable, context);

			context.beginPath();
			context.arc( 0, 0, renderizable._radius, renderizable._startAngle, renderizable._endAngle, false);
			context.closePath();

			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
				context.fill();
			}

			context.restore();

		} else {

			context.beginPath();
			context.arc( renderizable._x - cameraX, renderizable._y - cameraY, renderizable._radius, renderizable._startAngle, renderizable._endAngle, false);
			context.closePath();

			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
				context.fill();
			}

		}

		this._applyShadow(renderizable, context);

		if ( renderizable._strokeStyle ) {

			if ( renderizable._lineWidth ) {
				context.lineWidth = renderizable._lineWidth;
			}
			
			context.strokeStyle = renderizable._strokeStyle;
			// context.stroke( -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );
			context.stroke();
			
		}

	};
	/**
	 * Renders the current sprite in the provided context
	 *
	 * @method renderSprite
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	StandardEntityRenderer.prototype.renderSprite = function( renderizable, context, cameraX, cameraY ) {

		if ( ! renderizable._image ) return;
		
		renderizable._animate();

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		var fX = renderizable.currentFrame.x,
			fY = renderizable.currentFrame.y;

		if ( renderizable._rotation || renderizable._scale ) {
		
			context.save();
			
			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);

			context.drawImage( renderizable._image, fX, fY, renderizable._width, renderizable._height, -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );

			context.restore();

		} else {

			context.drawImage( renderizable._image, fX, fY, renderizable._width, renderizable._height, renderizable._x - renderizable._halfWidth - cameraX, renderizable._y - renderizable._halfHeight - cameraY, renderizable._width, renderizable._height );

		}

	};
	StandardEntityRenderer.prototype.renderBitmapText = function( renderizable, context, cameraX, cameraY ) {
	
		if ( ! renderizable._sprite ) return;
		
		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);
		
		var text = renderizable._text,
			length = text.length,
			start = 0,
			frames = renderizable._sprite.frames,
			x,
			y;
		
		if ( renderizable._rotation || renderizable._scale ) {
		
			context.save();
			
			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);

			x = -renderizable._halfWidth;
			y = -renderizable._halfHeight;
			
			for ( var i = 0; i < length; i++ ) {
			
				var currentFrame = frames[text[i]];
				
				context.drawImage( renderizable._sprite, currentFrame.x, currentFrame.y, currentFrame.width, currentFrame.height, x + start, y, currentFrame.width, currentFrame.height );
				
				start = start + currentFrame.width;
				
			}

			context.restore();

		} else {

			x = renderizable._x - cameraX - renderizable._halfWidth;
			y = renderizable._y - cameraY - renderizable._halfHeight;

			for ( var i = 0; i < length; i++ ) {
			
				var currentFrame = frames[text[i]];
				
				context.drawImage( renderizable._sprite, currentFrame.x, currentFrame.y, currentFrame.width, currentFrame.height, x + start, y, currentFrame.width, currentFrame.height );

				start = start + currentFrame.width;
				
			}
		

		}
		
	};
	StandardEntityRenderer.prototype.renderLayer = function (layer, cameraX, cameraY, viewportWidth, viewportHeight) {

		if ( !layer._visible ) return;

    //TODO: When adding or removing views, it doesnt update 
		// if ( this._reRenderAllLayers || layer.needsRedraw ) {

			var current,
          currentView,
          currentViews,
          canvas = this.backBuffer.canvas;

			if ( layer.background ) {
        //TODO: Not clearing the buffer will end up in displaying blurred images if background has opacity 
				if ( layer.background.src ) {
					this.backBuffer.drawImage(layer.background, 0, 0, canvas.width, canvas.height);
				} else if (M.sprites.get(layer.background)) {
					this.backBuffer.drawImage(M.sprites.get(layer.background), 0, 0, canvas.width, canvas.height);
        } else {
					this.backBuffer.fillStyle = layer.background;
					this.backBuffer.fillRect(0, 0, canvas.width, canvas.height);
				}
			} else {
				this.backBuffer.clearRect(0, 0, canvas.width, canvas.height);
			}

			for ( var i = 0, l = layer.onRenderList.length; i < l; i++ ) {

				current = layer.onRenderList[i];
				currentViews = current.views._values;

				for ( var j = 0, jl = currentViews.length; j < jl; j++ ) {
			
					currentView = currentViews[j];

					var pFX = layer.parrallaxFactor.x,
						  pFY = layer.parrallaxFactor.y;
			
					if ( this.camera.canSee(currentView, pFX, pFY) ) {
					
						this.render(currentView, this.backBuffer, cameraX * pFX, cameraY * pFY);
					
					}
				
				}

			}

			//TODO: Review post processing
			if ( layer.postProcessing ) {
				layer.postProcessing(this.backBuffer, this.frontBuffer, cameraX, cameraY);
			}
			
			layer.needsRedraw = false;

			// if ( layer._alpha != undefined ) {
			// 	this.frontBuffer.globalAlpha = layer._alpha;
			// }

			this._applyOperation(layer, this.frontBuffer);
			this._applyAlpha(layer, this.frontBuffer);
      
      //TODO: Review translation, rotation and scale. This should work
			// this._applyTranslation(layer, this.frontBuffer, 0, 0);
			// this._applyRotation(layer, this.frontBuffer);
			// this._applyScale(layer, this.frontBuffer);

			// if ( layer._x != undefined && layer._y != undefined ) {
			// 	this.frontBuffer.rotate(layer._rotation);
			// }
			// if ( layer._rotation != undefined ) {
			// 	this.frontBuffer.rotate(layer._rotation);
			// }
      
      
      //TODO: Testing zoom, remove after testing
      // if (this.zoom) {
      //   this.frontBuffer.drawImage(this.backBuffer, -this.zoom, -this.zoom, )        
      // } else {
			 this.frontBuffer.drawImage(this.backBuffer.canvas, 0, 0);
       
       var currentBuffer = this._getBuffer(layer.name);
       
       if (!currentBuffer) {
         currentBuffer = this._createBuffer(layer.name);
         currentBuffer.canvas.width = this.frontBuffer.canvas.width;
         currentBuffer.canvas.height = this.frontBuffer.canvas.height;
       }
       
       currentBuffer.drawImage(this.backBuffer.canvas, 0, 0);
       
      // }


			// if ( layer._rotation != undefined ) {
			// 	this.frontBuffer.rotate(0);
			// }

			// this.frontBuffer.globalAlpha = 1;
			
		// } else {
		
      //TODO: With every new game layer, we should store a new buffer in this renderer. This fails because the layer no longer has a buffer
			// this.frontBuffer.drawImage(layer._buffer.canvas, 0, 0);
		// 	this.frontBuffer.drawImage(this._getBuffer(layer.name).canvas, 0, 0);
			
		// }

		// if ( this.needsSorting ) {
		// 	this.sort();
		// 	this.needsSorting = false;
		// }

	};
  StandardEntityRenderer.prototype._createBuffer = function(name) {
    var buffer = document.createElement("canvas").getContext("2d");
    this._buffers[name] = buffer;
    return buffer;    
  };
  StandardEntityRenderer.prototype._getBuffer = function(name) {
    return this._buffers[name];
  };
	StandardEntityRenderer.prototype.renderLayers = function(layers) {
		this.frontBuffer.clearRect(0, 0, this.backBuffer.canvas.width, this.backBuffer.canvas.height);
		for ( var i = 0, l = layers._values.length; i < l; i++ ) {
			this.renderLayer(layers._values[i], this.camera._x, this.camera._y, this.camera.viewportWidth, this.camera.viewportHeight);
		}		
		this._reRenderAllLayers = false;
	};
  StandardEntityRenderer.prototype.redrawAllLayers = function() {
    this._reRenderAllLayers = true;
  };
	StandardEntityRenderer.prototype.render = function(object, context, cameraX, cameraY) {

		var types = M.renderizables.TYPES;

		switch ( object.TYPE ) {
			case types.SPRITE:
				this.renderSprite(object, context, cameraX, cameraY);
				break;
			case types.BITMAP_TEXT:
				this.renderBitmapText(object, context, cameraX, cameraY);
				break;
			case types.TEXT:
				this.renderText(object, context, cameraX, cameraY);
				break;
			case types.RECTANGLE:
				this.renderRectangle(object, context, cameraX, cameraY);
				break;
			case types.CIRCLE:
				this.renderCircle(object, context, cameraX, cameraY);
				break;
			default:
				throw new Error("Unable to render object of type " + object.TYPE);
		}

	};
	/**
	 * Sets the antialiasing of the buffer
	 *
	 * @method setAntialiasing
	 * @param {Boolean} value
	 */
	StandardEntityRenderer.prototype.setAntialiasing = function(value) {
		this.frontBuffer.mozImageSmoothingEnabled = value;
		this.frontBuffer.webkitImageSmoothingEnabled = value;
		this.frontBuffer.imageSmoothingEnabled = value;
		
		this.backBuffer.mozImageSmoothingEnabled = value;
		this.backBuffer.webkitImageSmoothingEnabled = value;
		this.backBuffer.imageSmoothingEnabled = value;		
	};
	StandardEntityRenderer.prototype._getImageRenderingStyle = function() {
		var style = document.getElementById("match-image-quality");
		if ( style == undefined ) {
			style = document.createElement("style");
			style.setAttribute("id", "match-image-quality");
			style.type = "text/css";
			document.head.appendChild(style);
		}
		return style;
	};
	StandardEntityRenderer.prototype.prioritizeQuality = function() {
		this.setAntialiasing(true);
		this._getImageRenderingStyle().innerHTML = "canvas { -ms-interpolation-mode: bicubic; image-rendering: optimizeQuality; }";
	};
	StandardEntityRenderer.prototype.prioritizeSpeed = function() {
		this.setAntialiasing(false);
		this._getImageRenderingStyle().innerHTML = "canvas { -ms-interpolation-mode: nearest-neighbor; image-rendering: optimizeSpeed; }";
	};
	/**
	 * Gets the center of the layer
	 * @method getCenter
	 * @return {Object} object containing x and y
	 */
	StandardEntityRenderer.prototype.getSceneCenter = function() {
		return new M.math2d.Vector2d( this.frontBuffer.canvas.width / 2, this.frontBuffer.canvas.height / 2 );
	};
	/**
	 * Gets the contents of this layer as an image in base64
	 * @method getAsBase64Image
	 * @return {String} a string representing an image in base64
	 */
	StandardEntityRenderer.prototype.getAsBase64Image = function() {
		return this.frontBuffer.canvas.toDataURL();
	};
	/**
	 * Gets the contents of this layer as an html image
	 * @method getAsImage
	 * @return {HTMLImageElement} an image element with the result of this layer
	 */
	StandardEntityRenderer.prototype.getAsImage = function() {
		var img = new Image();
		img.src = this.getAsBase64Image();
		return img;
	};

	M.extend(StandardEntityRenderer, Renderer);

	M.renderers.StandardEntityRenderer = StandardEntityRenderer;

})(M.renderers.Renderer);
(function (namespace) {
	
	function RenderingProvider() {
	}

	RenderingProvider.prototype.isWebGLSupported = function() {
		return WebGLRenderingContext !== undefined;
	};

	RenderingProvider.prototype.getRenderer = function (canvas, mode) {
		if ( mode && mode.toLowerCase() == "webgl" && this.isWebGLSupported() ) {
			return this.getWebGLRenderer(canvas);
		} else {
			return this.getStandardEntityRenderer(canvas);
		}
	};
	RenderingProvider.prototype.getStandardRenderer = function (canvas) {
		return new M.renderers.StandardRenderer(canvas);
	};
	RenderingProvider.prototype.getStandardEntityRenderer = function (canvas) {
		return new M.renderers.StandardEntityRenderer(canvas);
	};

	RenderingProvider.prototype.getWebGLRenderer = function (canvas) {
		return new M.renderers.WebGLRenderer(canvas);
	};

	namespace.renderingProvider = new RenderingProvider();

})(M);
/**
 * @module Match
 * @namespace renderers
 */
(function(M) {

	M.renderizables = {
		TYPES: {
			SPRITE: 0,
			LAYER: 1,
			BITMAP_TEXT: 2,
			TEXT: 3,
			RECTANGLE: 4,
			CIRCLE: 5
		}
	}

})(M);
/**
 * @module Match
 * @namespace renderers
 */
(function(M, visual) {
	/**
	 * Provides basic behaviour for rendering game objects
	 *
	 * @class Renderizable
	 * @constructor
	 * @extends GameObjectWithEvents
	 * @param {Object} [properties] properties to construct this object
	 */
    function Renderizable(properties) {
    	this.extendsGameObject();
    	this.extendsEventHandler();
		/**
		 * X coordinate of the object
		 * @private
		 * @property _x
		 * @type float
		 */
        this._x = 0;
		/**
		 * Y coordinate of the object
		 * @private
		 * @property _y
		 * @type float
		 */
		this._y = 0;
		/**
		 * previous x coordinate of the object
		 * @private
		 * @property _prevX
		 * @type float
		 */
		this._prevX = 0;
		/**
		 * previous y coordinate of the object
		 * @private
		 * @property _prevY
		 * @type float
		 */
		this._prevY = 0;		
		/**
		 * object width
		 * @private
		 * @property _width
		 * @type float
		 */
		this._width = 0;
		/**
		 * object height
		 * @private
		 * @property _height
		 * @type float
		 */
        this._height = 0;
		/**
		 * object half width, used for faster rendering
		 * @private
		 * @property _halfWidth
		 * @type float
		 */
        this._halfWidth = 0;
		/**
		 * object half height, used for faster rendering
		 * @private
		 * @property _halfHeight
		 * @type float
		 */
        this._halfHeight = 0;
		/**
		 * object rotation
		 * @private
		 * @property _rotation
		 * @type float
		 */
        this._rotation = null;
		/**
		 * object scale factor
		 * @private
		 * @property _scale
		 * @type Object
		 * @example
				this._scale = { x: 1, y: 1 };
		 */
        this._scale = null;
		/**
		 * object visibility. Determines whether the object will be rendered or not
		 * @private
		 * @property _visible
		 * @type Boolean
		 */
        this._visible = true;
		/**
		 * Composite operation
		 * Possible values: "source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "darker" | "copy" | "xor"
		 * @property operation
		 * @type String
		 * @example
				this.operation = "source-in"
			
		 */
		this.operation = null;
		/**
		 * object transparency
		 * @private
		 * @property _alpha
		 * @type float
		 */
		this._alpha = null;

		this._math = Math;
		this._math2d = M.math2d;
		
		this._cachedRotationForBoundingHalfWidth = 0;
		this._cachedRotationForBoundingHalfHeight = 0;
		this._cachedBoundingHalfWidth = null;
		this._cachedBoundingHalfHeight = null;
		
        this.set(properties);

	}
	/**
	 * @private
	 * @property _zIndex
	 * @type int
	 */
	Renderizable.prototype._zIndex = 0;
	/**
	 * Sets the properties of this object based on the given object
	 * @method set
	 * @param {Object} properties properties to construct this object
	 */
    Renderizable.prototype.set = function (properties) {
        if (!properties) return;
        var setter = "";
        for (var i in properties) {
            setter = "set" + i.charAt(0).toUpperCase() + i.substr(1);
            if (this[setter]) {
                this[setter](properties[i]);
            } else {
                this[i] = properties[i];
            }
        }
		return this;
    };
	/**
	 * Sets the transparency of the object
	 * @method setAlpha
	 * @param {float} value alpha value to set. Must be between 0 and 1
	 */
	Renderizable.prototype.setAlpha = function(value) {
		if ( value >= 0 && value <= 1 && this._alpha != value ) {
			this._alpha = value;
			this.raiseEvent("alphaChanged", value);
			this.raiseEvent("attributeChanged", "alpha");
		} else {
			this._alpha = null;
		}
		return this;
	};
	/**
	 * Gets the transparency of the object
	 * @method getAlpha
	 * @param {float} value alpha value
	 */
	Renderizable.prototype.getAlpha = function() {
		return this._alpha;
	};
	/**
	 * Loops through the animations of an object. When the animation
	 * is complete it is removed from the list.
	 * @method _loopThroughAnimations
	 * @private
	 */
	Renderizable.prototype._loopThroughAnimations = function () {

		function doLoop(item, index, list) {
			if ( item && !item.onLoop() ) {
				list.quickRemove(index);
			}
		}

		this.animations.each(doLoop);
		
		if ( this.chainedAnimations.size ) {
			if ( !this.chainedAnimations._list[this._currentChainedBehaviour].onLoop() ) {
				this._currentChainedBehaviour++;
			}
			if ( this._currentChainedBehaviour == this.chainedAnimations.size ) {
				this.chainedAnimations.removeAll();
				this._currentChainedBehaviour = 0;
			}
		}
		
	};
	/**
	 * Clears the animation loop
	 * @method clearAnimations
	 */
	Renderizable.prototype.clearAnimations = function () {
		this.animations = new Array();
		return this;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.fadeIn = function (seconds, onFinished) {
		this.animations.push(new visual.FadeIn(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade out animation to this object
	 * @method fadeOut
	 * @param {int} seconds time in seconds that the fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.fadeOut = function (seconds, onFinished) {
		this.animations.push(new visual.FadeOut(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a continouse fade animation to this object
	 * @method continousFade
	 * @param {int} seconds time in seconds that the fade in and fade out will take
	 * @param {Boolean} [fadeOutFirst] determines whether the animation will start fading in or out
	 * @param {int} [min] minumum alpha value, defaults to 0
	 * @param {int} [max] maximum alpha value, defaults to 1
	 */
	Renderizable.prototype.continousFade = function (seconds, fadeOutFirst, min, max) {
		this.animations.push(new visual.ContinousFade(this, seconds, fadeOutFirst, min, max));
		return this;
	};
	/**
	 * Moves an object to the given coordinates in the provided seconds
	 * @method move
	 * @param {float} x the destination x coordinate
	 * @param {float} y the destination y coordinate
	 * @param {String} easingX Ease function name for x axis
	 * @param {String} easingY Ease function name for y axis
	 * @param {Boolean} loop Start over when reched destination
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.move = function (x, y, seconds, easingX, easingY, loop, onFinished) {
		this.animations.push(new visual.Easing(this, x, y, seconds, easingX, easingY, loop, onFinished));
		return this;
	};
	/**
	 * Scales an object up to the given values in the provided seconds
	 * @method scaleUp
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.scaleUp = function (x, y, seconds, onFinished) {
		this.animations.push(new visual.ScaleUp(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Scales an object down to the given values in the provided seconds
	 * @method scaleDown
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.scaleDown = function (x, y, seconds, onFinished) {
		this.animations.push(new visual.ScaleDown(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Makes an object twinkle the given amount of times in the duration provided
	 * @method twinkle
	 * @param {int} timesToTwinkle the amount of times the object will twinkle
	 * @param {int} durationInMilliseconds the duration, in milliseconds, the twinkle effect will last
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.twinkle = function (timesToTwinkle, durationInMilliseconds, onFinished) {
		this.animations.push(new visual.Twinkle(this, timesToTwinkle, durationInMilliseconds, onFinished));
		return this;
	};
	/**
	 * Rotates an object to the given angle in the provided seconds
	 * @method rotate
	 * @param {float} the destination angle
	 * @param {int} seconds the duration the rotation effect will take to reach the provided angle
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.rotate = function (angle, seconds, onFinished) {
		this.animations.push(new visual.Rotate(this, angle, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainWait = function (seconds, onFinished) {
		this.chainedAnimations.push(new visual.Wait(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainFadeIn = function (seconds, onFinished) {
		this.chainedAnimations.push(new visual.FadeIn(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade out animation to this object
	 * @method fadeOut
	 * @param {int} seconds time in seconds that the fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainFadeOut = function (seconds, onFinished) {
		this.chainedAnimations.push(new visual.FadeOut(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a continouse fade animation to this object
	 * @method continousFade
	 * @param {int} seconds time in seconds that the fade in and fade out will take
	 * @param {Boolean} [fadeOutFirst] determines whether the animation will start fading in or out
	 * @param {int} [min] minumum alpha value, defaults to 0
	 * @param {int} [max] maximum alpha value, defaults to 1
	 */
	Renderizable.prototype.chainContinousFade = function (seconds, fadeOutFirst, min, max) {
		this.chainedAnimations.push(new visual.ContinousFade(this, seconds, fadeOutFirst, min, max));
		return this;
	};
	/**
	 * Moves an object to the given coordinates in the provided seconds
	 * @method move
	 * @param {float} x the destination x coordinate
	 * @param {float} y the destination y coordinate
	 * @param {int} seconds time in seconds that the fade in and fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainMove = function (x, y, seconds, easingX, easingY) {
		// this.chainedAnimations.push(new visual.Move(this, x, y, seconds, onFinished));
		this.chainedAnimations.push(new visual.Easing(this, x, y, seconds, easingX, easingY));
		return this;
	};
	/**
	 * Scales an object up to the given values in the provided seconds
	 * @method scaleUp
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainScaleUp = function (x, y, seconds, onFinished) {
		this.chainedAnimations.push(new visual.ScaleUp(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Scales an object down to the given values in the provided seconds
	 * @method scaleDown
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainScaleDown = function (x, y, seconds, onFinished) {
		this.chainedAnimations.push(new visual.ScaleDown(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Makes an object twinkle the given amount of times in the duration provided
	 * @method twinkle
	 * @param {int} timesToTwinkle the amount of times the object will twinkle
	 * @param {int} durationInMilliseconds the duration, in milliseconds, the twinkle effect will last
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainTwinkle = function (timesToTwinkle, durationInMilliseconds, onFinished) {
		this.chainedAnimations.push(new visual.Twinkle(this, timesToTwinkle, durationInMilliseconds, onFinished));
		return this;
	};
	/**
	 * Rotates an object to the given angle in the provided seconds
	 * @method rotate
	 * @param {float} the destination angle
	 * @param {int} seconds the duration the rotation effect will take to reach the provided angle
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainRotate = function (angle, seconds, onFinished) {
		this.chainedAnimations.push(new visual.Rotate(this, angle, seconds, onFinished));
		return this;
	};
	/**
	 * Loops through the timers of the object
	 * @private
	 * @method _loopThroughTimers
	 */
    Renderizable.prototype._loopThroughTimers = function () {
        var i = 0,
        l = this._onLoopTimers.length;
        for (; i < l; i++) {
            this._onLoopTimers[i].onLoop();
        }
    };
	/**
	 * Adds a timer to this object and returns it
	 * @method addTimer
	 * @param {int} timeInMillis
	 * @param {Function} callback the function to call once per interval. If the callback function is a method of this object, then the context will become this object
	 * @returns {Timer} the newly created timer
	 */
    Renderizable.prototype.addTimer = function (timeInMillis, callback) {
        var timer = new M.Timer(timeInMillis, callback, this);
        this._onLoopTimers.push(timer);
        return timer;
    };
	/**
	 * Removes a timer from this object
	 * @method removeTimer
	 * @param {Function} callback the function to be removed
	 * @returns {Renderizable} returns itself
	 */
    Renderizable.prototype.removeTimer = function (callback) {
        this._onLoopTimers.splice(this._onLoopTimers.indexOf(this._getTimer(callback)), 1);
        return this;
    };
	/**
	 * Returns the timer that handles the given callback
	 * @method _getTimer
	 * @private
	 * @param {Function} callback the function assigned to the timer
	 * @returns {Timer} the timer or null
	 */
    Renderizable.prototype._getTimer = function (callback) {
        var i = 0,
        l = this._onLoopTimers.length;
        for (; i < l; i++) {
            if (this._onLoopTimers[i].callback == callback) return this._onLoopTimers[i];
        }
    };
	/**
	 * Sets the zIndex of this object
	 * @method setZIndex
	 * @param {int} value the zIndex
	 */
    Renderizable.prototype.setZIndex = function (value) {
		if ( this._zIndex != value ) {
			this._zIndex = value;
			this.raiseEvent("zIndexChanged", value);
			this.raiseEvent("attributeChanged", "zIndex");
		}
		return this;
    };
	/**
	 * Gets the zIndex of this object
	 * @method getZIndex
	 * @return {int} the zIndex
	 */
    Renderizable.prototype.getZIndex = function () {
        return this._zIndex;
    };
	/**
	 * Sets the visibility of this object
	 * @method setVisible
	 * @param {Boolean} value true if it is visible or false if it is not
	 */
    Renderizable.prototype.setVisible = function (value) {
    	if ( this._visible != value ) {
	        this._visible = value;
	        this.raiseEvent("visibilityChanged", value);
			this.raiseEvent("attributeChanged", "visibility");
    	}
		return this;
    };
    Renderizable.prototype.getVisible = function() {
      return this._visible;
    };
	/**
	 * Sets the width of this object
	 * @method setWidth
	 * @param {float} value
	 */
    Renderizable.prototype.setWidth = function (value) {
    	//value = ~~(value+0.5);
		if ( this._width != value ) {
			this._width = value;
			this._halfWidth = value / 2;
			this.raiseEvent("widthChanged", value);
			this.raiseEvent("attributeChanged", "width");
		}
		return this;
    };
	/**
	 * Sets the height of this object
	 * @method setHeight
	 * @param {float} value
	 */
    Renderizable.prototype.setHeight = function (value) {
    	//value = ~~(value+0.5);
		if ( this._height != value ) {
			this._height = value;
			this._halfHeight = value / 2;
			this.raiseEvent("heightChanged", value);
			this.raiseEvent("attributeChanged", "height");
		}
		return this;
    };
	/**
	 * Gets the width of this object
	 * @method getWidth
	 * @return {float} the width
	 */
    Renderizable.prototype.getWidth = function () {
        if (this._scale) {
            return this._width * this._scale.x;
        } else {
            return this._width;
        }
    };
    Renderizable.prototype.getBoundingHalfWidth = function () {
    	
    	if ( !this._rotation ) {
    		return this._halfWidth;
    	} else if ( this._cachedRotationForBoundingHalfWidth == this._rotation ) {
    		return this._cachedBoundingHalfWidth;
    	}

		var halfWidth = this._halfWidth,
			halfHeight = this._halfHeight,
			v1 = this._math2d.getRotatedVertexCoordsX(-halfWidth, -halfHeight, this._rotation),
			v2 = this._math2d.getRotatedVertexCoordsX(halfWidth, -halfHeight, this._rotation),
			v3 = this._math2d.getRotatedVertexCoordsX(halfWidth, halfHeight, this._rotation),
			v4 = this._math2d.getRotatedVertexCoordsX(-halfWidth, halfHeight, this._rotation),
			maxX = this._math.max(v1, v2, v3, v4);

		this._cachedBoundingHalfWidth = this._math.abs(maxX);
		this._cachedRotationForBoundingHalfWidth = this._rotation;

		return this._cachedBoundingHalfWidth;
    };
    Renderizable.prototype.getBoundingWidth = function () {
    	return this.getBoundingHalfWidth() * 2;
    };
    Renderizable.prototype.getBoundingHalfHeight = function () {

    	if ( !this._rotation ) {
    		return this._halfHeight;
    	} else if ( this._cachedRotationForBoundingHalfHeight == this._rotation ) {
    		return this._cachedBoundingHalfHeight;
    	}

		var halfWidth = this._halfWidth,
			halfHeight = this._halfHeight,
			v1 = this._math2d.getRotatedVertexCoordsY(-halfWidth, -halfHeight, this._rotation),
			v2 = this._math2d.getRotatedVertexCoordsY(halfWidth, -halfHeight, this._rotation),
			v3 = this._math2d.getRotatedVertexCoordsY(halfWidth, halfHeight, this._rotation),
			v4 = this._math2d.getRotatedVertexCoordsY(-halfWidth, halfHeight, this._rotation),
			maxY = this._math.max(v1, v2, v3, v4);

		this._cachedBoundingHalfHeight = this._math.abs(maxY);
		this._cachedRotationForBoundingHalfHeight = this._rotation;

		return this._cachedBoundingHalfHeight;

    };
    Renderizable.prototype.getBoundingHeight = function () {
    	return this.getBoundingHalfHeight() * 2;
    };
	/**
	 * Gets the height of this object
	 * @method getHeight
	 * @return {float} the height
	 */
    Renderizable.prototype.getHeight = function () {
        if (this._scale) {
            return this._height * this._scale.y;
        } else {
            return this._height;
        }
    };
	/**
	 * Sets the width and height of this object. Behaves exactly as if calling setWidth(width); setHeight(height);
	 * @method setSize
	 * @param {float} the width
	 * @param {float} the height
	 */
    Renderizable.prototype.setSize = function (width, height) {
        this.setWidth(width);
		if ( height == undefined )  {
			this.setHeight(width);
		} else {
			this.setHeight(height);
		}
		return this;
    };
	/**
	 * Returns the width and height of this object
	 * @method getSize
	 */
    Renderizable.prototype.getSize = function () {
        return {width: this.getWidth(), height: this.getHeight()};
    };
	/**
	 * Sets the scale of this object. Behaves exactly as if calling setScaleX(x); setScaleY(y);
	 * @method setScale
	 * @param {float} the width factor, defaults to 1
	 * @param {float} the height factor, defaults to 1
	 */
    Renderizable.prototype.setScale = function (x, y) {
        if (!x && !y) return;
        if (!x) x = 1;
        if (!y) y = 1;
        this.setScaleX(x);
        this.setScaleY(y);
		return this;
    };
	/**
	 * Sets the scale width factor
	 * @method setScaleX
	 * @param {float} the width factor
	 */
    Renderizable.prototype.setScaleX = function (value) {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.y = 1;
		}
		if ( this._scale.x != value ) {
			this._scale.x = value;
			this.raiseEvent("scaleXChanged", value);
			this.raiseEvent("attributeChanged", "scaleX");
		}
		return this;
    };
	/**
	 * Sets the scale height factor
	 * @method setScaleY
	 * @param {float} the height factor
	 */
    Renderizable.prototype.setScaleY = function (value) {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.x = 1;
		}
		if ( this._scale.y != value ) {
			this._scale.y = value;
			this.raiseEvent("scaleYChanged", value);
			this.raiseEvent("attributeChanged", "scaleY");
		}
		return this;
	};
    Renderizable.prototype.offsetScale = function (x, y) {
    	this.offsetScaleX(x);
    	this.offsetScaleY(y);
    	return this;
    };
    Renderizable.prototype.offsetScaleX = function (x) {
    	return this.setScaleX(this.getScaleX() + x);
    };
    Renderizable.prototype.offsetScaleY = function (y) {
    	return this.setScaleY(this.getScaleY() + y);
    };
    Renderizable.prototype.getScaleX = function () {
	if ( !this._scale ) {
			return 1;
		}
		return this._scale.x;
	};
    Renderizable.prototype.getScaleY = function () {
		if ( !this._scale ) {
			return 1;
		}
		return this._scale.y;
	};
	/**
	 * Inverts the object in the x axis
	 * Note: Works exactly as invertX
	 * @method mirror
	 */
	Renderizable.prototype.mirror = function () {
		this.invertX();
		return this;
	};
	/**
	 * Inverts the object in the x axis
	 * @method invertX
	 */
    Renderizable.prototype.invertX = function () {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.x = -1;
		} else {
			this.setScaleX(this._scale.x * -1);
		}
		return this;
    };
	/**
	 * Inverts the object in the y axis
	 * @method invertY
	 */
    Renderizable.prototype.invertY = function () {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.y = -1;
		} else {
			this.setScaleY(this._scale.y * -1);
		}
		return this;
    };
	/**
	 * Returns x coordinate representing the leftmost part of the Object
	 *
	 * @method getLeft
	 * @return {float} the coordinates to left of the object
	 */
    Renderizable.prototype.getLeft = function () {
        if (this._scale) {
			return this._x - this.getBoundingHalfWidth() * this._scale.x;
        } else {
			return this._x - this.getBoundingHalfWidth();
        }
    };
	/**
	 * Returns x coordinate representing the rightmost part of the Object
	 *
	 * @method getRight
	 * @return {float} the coordinates to right of the object
	 */
    Renderizable.prototype.getRight = function () {
        if (this._scale) {
            return this._x + this.getBoundingHalfWidth() * this._scale.x;
        } else {
			return this._x + this.getBoundingHalfWidth();
        }
    };
	/**
	 * Returns y coordinate representing the topmost part of the Object
	 *
	 * @method getTop
	 * @return {float} the coordinates to top of the object
	 */
    Renderizable.prototype.getTop = function () {
        if (this._scale) {
            return this._y - this.getBoundingHalfHeight() * this._scale.y;
        } else {
        	return this._y - this.getBoundingHalfHeight();
        }
    };
	/**
	 * Returns y coordinate representing the bottommost part of the Object
	 *
	 * @method getBottom
	 * @return {float} the coordinates to bottom of the object
	 */
    Renderizable.prototype.getBottom = function () {
        if (this._scale) {
            return this._y + this.getBoundingHalfHeight() * this._scale.y;
        } else {
        	return this._y + this.getBoundingHalfHeight();
        }
    };
	/**
	 * Sets the leftmost coordinates of the Object
	 *
	 * @method setLeft
	 * @param {float} value the coordinates to left of the object
	 */
    Renderizable.prototype.setLeft = function (value) {
        if (this._scale) {
        	this.setX(value + this.getBoundingHalfWidth() * this._scale.x);
        } else {
        	this.setX(value + this.getBoundingHalfWidth());
        }
		return this;
    };
	/**
	 * Sets the rightmost coordinates of the Object
	 *
	 * @method setRight
	 * @param {float} value the coordinates to right of the object
	 */
    Renderizable.prototype.setRight = function (value) {
        if (this._scale) {
            this.setX(value - this.getBoundingHalfWidth() * this._scale.x);
        } else {
            this.setX(value - this.getBoundingHalfWidth());
        }
		return this;
    };
	/**
	 * Sets the topmost coordinates of the Object
	 *
	 * @method setTop
	 * @param {float} value the coordinates to top of the object
	 */
    Renderizable.prototype.setTop = function (value) {
        if (this._scale) {
            this.setY(this._y = value + this.getBoundingHalfHeight() * this._scale.y);
        } else {
            this.setY(this._y = value + this.getBoundingHalfHeight());
        }
		return this;
    };
	/**
	 * Sets the bottommost coordinates of the Object
	 *
	 * @method setBottom
	 * @param {float} value the coordinates to bottom of the object
	 */
    Renderizable.prototype.setBottom = function (value) {
        if (this._scale) {
            this.setY(value - this.getBoundingHalfHeight() * this._scale.y);
        } else {
            this.setY(value - this.getBoundingHalfHeight());
        }
		return this;
    };
	/**
	 * Returns an object containing the x and y coordinates of the object
	 *
	 * @method getLocation
	 * @return Object
	 * @example
			{x: 100, y: 400}
	 */
    Renderizable.prototype.getLocation = function () {
		return {
			x: this._x,
			y: this._y
		};
    };
	/**
	 * Sets the x and y coordinates of the object
	 *
	 * @method setLocation
	 * @param {float} x the x coordinate
	 * @param {float} y the y coordinate
	 */
    Renderizable.prototype.setLocation = function (x, y) {
    	this.setX(x);
    	this.setY(y);
		return this;
    };
    /**
	 * Offsets the alpha value
	 *
	 * @method offsetAlpha
	 * @param {float} offset
	 */
    Renderizable.prototype.offsetAlpha = function(offset) {
        this.setAlpha(this._alpha + offset);
		return this;
    };
    /**
	 * Offsets the rotation
	 *
	 * @method offsetRotation
	 * @param {float} offset
	 */
    Renderizable.prototype.offsetRotation = function(offset, pivotX, pivotY) {
        
        this.setRotation(this._rotation + offset);

		if ( pivotX != undefined || pivotY != undefined ) {

			var x = this._x - pivotX,
				y = this._y - pivotY,				
				rotatedX,
				rotatedY;
				
			if ( x != 0 || y != 0 ) {
				rotatedX = M.math2d.getRotatedVertexCoordsX(x, y, offset),
				rotatedY = M.math2d.getRotatedVertexCoordsY(x, y, offset);
				this.setLocation(rotatedX + pivotX, rotatedY + pivotY);
			}


		}

		return this;

    };
	/**
	 * Sets the rotation angle of this object
	 *
	 * @method setRotation
	 * @param {float} rotation the rotation angle
	 */
	Renderizable.prototype.setRotation = function (rotation) {
		
		if ( rotation != this._rotation ) {
		
			this._rotation = rotation;

			this.raiseEvent("rotationChanged", rotation);
			this.raiseEvent("attributeChanged", "rotation");
		
		}

		return this;

	};
	/**
	 * Gets the rotation angle of this object
	 *
	 * @method getRotation
	 * @return {float}
	 */
	Renderizable.prototype.getRotation = function () {
		return this._rotation;
	};
	/**
	 * Sets the x coordinate of this object
	 *
	 * @method setX
	 * @param {float} x the rotation angle
	 */
	Renderizable.prototype.setX = function (value) {
		//value = ~~(value+0.5);
		if ( value != this._x ) {
			this._prevX = this._x;
			this._x = value;
			this.raiseEvent("xChanged", value);
			this.raiseEvent("attributeChanged", "x");
		}
		return this;
	};
	/**
	 * Sets the y coordinate of this object
	 *
	 * @method setY
	 * @param {float} y the rotation angle
	 */
	Renderizable.prototype.setY = function (value) {
		//value = ~~(value+0.5);
		if ( value != this._y ) {
			this._prevY = this._y;
			this._y = value;
			this.raiseEvent("yChanged", value);
			this.raiseEvent("attributeChanged", "y");
		}
		return this;
    };
	Renderizable.prototype.remove = function () {
		this.ownerLayer.remove(this);
		return this;
	};
	/**
	 * Adds the given x and y coordinates to those of the object
	 *
	 * @method offset
	 * @param {float} x the x coordinate to add
	 * @param {float} y the y coordinate to add
	 */
    Renderizable.prototype.offset = function (x, y) {

   		this.offsetX(x);
    	this.offsetY(y);

		return this;

    };
	/**
	 * Adds the given x coordinate to that of the object
	 *
	 * @method offsetX
	 * @param {float} x the x coordinate to add
	 */
    Renderizable.prototype.offsetX = function (x) {
    	if ( x != 0 ) {
    		this.setX(this._x + x);
    	}
		return this;
    };
	/**
	 * Adds the given y coordinates to that of the object
	 *
	 * @method offsetY
	 * @param {float} y the y coordinate to add
	 */
    Renderizable.prototype.offsetY = function (y) {
    	if ( y != 0 ) {
    		this.setY(this._y + y);
    	}
		return this;
    };
	/**
	 * Centers the object at the given vector2d object
	 *
	 * @method centerAt
	 * @param {Vector2d} vector2d object containing x and y attributes
	 */
	Renderizable.prototype.centerAt = function (vector2d) {
		this.setLocation(vector2d.x, vector2d.y);
		return this;
    };
	/**
	 * Returns the x coordinate of this object that belongs to it's center
	 *
	 * @method getX
	 * @return {float}
	 */
    Renderizable.prototype.getX = function () {
        return this._x;
    };
	/**
	 * Returns the y coordinate of this object that belongs to it's center
	 *
	 * @method getY
	 * @return {float}
	 */
	 Renderizable.prototype.getY = function () {
        return this._y;
    };
	/**
	 * Returns the previous x coordinate
	 *
	 * @method getPrevX
	 * @return {float}
	 */
    Renderizable.prototype.getPrevX = function () {
        return this._prevX;
    };
	/**
	 * Returns the previous y coordinate
	 *
	 * @method getPrevY
	 * @return {float}
	 */
	 Renderizable.prototype.getPrevY = function () {
        return this._prevY;
    };
    /**
	 * Returns the biggest number between width and height
	 *
	 * @method getMaxSize
	 */
    Renderizable.prototype.getMaxSize = function() {
        return Math.max(this.getWidth(), this.getHeight());
    };
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Renderizable.prototype.toString = function() {
		return this.constructor.name;
    };

    Renderizable.name = "Renderizable";

    M.extend(Renderizable, M.GameObject);
    M.extend(Renderizable, EventHandler);

	M.renderizables.Renderizable = Renderizable;

})(Match, Match.effects.visual);
/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable) {

	function Shape(properties) {
		this.extendsRenderizable(properties);
				/**
		 * Fill Style used to fill the shape. Can be a color, a pattern or a gradient
		 * @private
		 * @property _fillStyle
		 * @default "black"
		 * @type Object
		 * @example
				this._fillStyle = "black";
		 * @example
				this._fillStyle = "rgba(255,0,0,100)";
		 */
		this._fillStyle = "rgb(0,0,0)";
		/**
		 * Stroke Style
		 * @private
		 * @property _strokeStyle
		 * @type String
		 * @example
				this._strokeStyle = "black";
		 * @example
				this._strokeStyle = "rgba(255,0,0,100)";
		 */
		this._strokeStyle = null;
		/**
		 * Line width used to render the borders of the shape
		 * @private
		 * @property _lineWidth
		 * @type String
		 * @example
				this._strokeStyle = "black";
		 * @example
				this._strokeStyle = "rgba(255,0,0,100)";
		 */
		this._lineWidth = 1;
	}

	/**
	 * Sets the style used to stroke the shape
	 *
	 * @method setStrokeStyle
	 * @param {Object} value the strokeStyle
	 * @example
			this.setStrokeStyle("rgb('255,0,0')");
	 * @example
			this.setStrokeStyle("Red");
	 */
	Shape.prototype.setStrokeStyle = function(value) {
		if ( this._strokeStyle != value ) {
			this._strokeStyle = value;
			this.raiseEvent("attributeChanged", "strokeStyle");
		}
		return this;
	};
	/**
	 * Returns the style used to stroke the shape
	 *
	 * @method getStrokeStyle
	 * @example
			this.getStrokeStyle();
	 */
	Shape.prototype.getStrokeStyle = function() {
		return this._strokeStyle;
	};
	/**
	 * Sets the style used to fill the shape
	 *
	 * @method setFillStyle
	 * @param {Object} value the fillStyle
	 * @example
			this.setFillStyle("rgb('255,0,0')");
	 * @example
			this.setFillStyle("Red");
	 * @example
			this.setFillStyle(aPattern);
	 * @example
			this.setFillStyle(aGradient);
	 */
	Shape.prototype.setFillStyle = function(value) {
		if ( this._fillStyle != value ) {
			this._fillStyle = value;
			this.raiseEvent("attributeChanged", "fillStyle");
		}
		return this;
	};
	/**
	 * Gets the fill style
	 * @method getFillStyle
	 * @return {String} the fillStyle
	 */
	Shape.prototype.getFillStyle = function() {
		return this._fillStyle;
	};	
	/**
	 * Sets the style used to fill the shape
	 *
	 * @method setFill
	 * @param {Object} value the fillStyle
	 */
	Shape.prototype.setFill = Shape.prototype.setFillStyle;
	/**
	 * Gets the fill style
	 * @method getFill
	 * @return {String} the fillStyle
	 */
	Shape.prototype.getFill = Shape.prototype.setFillStyle;
	/**
	 * Sets the style used to fill the shape
	 *
	 * @method setColor
	 * @param {Object} value the fillStyle
	 */
	Shape.prototype.setColor = Shape.prototype.setFillStyle;
	/**
	 * Gets the fill style
	 * @method getColor
	 * @return {String} the fillStyle
	 */
	Shape.prototype.getColor = Shape.prototype.getFillStyle;
	/**
	 * Gets the stroke style
	 * @method getStrokeStyle
	 * @return {String} the strokeStyle
	 */
	Shape.prototype.getStrokeWidth = function() {
		return this._lineWidth;
	};
	/**
	 * Sets the border color of the shape
	 *
	 * @method setBorder
	 * @param {Object} value the color of the border
	 * @example
			this.setBorder("rgb('255,0,0')");
	 * @example
			this.setBorder("Red");
	 */
	Shape.prototype.setBorder = Shape.prototype.setStrokeStyle;
	/**
	 * Sets the line width used to stroke the shape
	 *
	 * @method setStrokeWidth
	 * @param {int} value the strokeStyle
	 * @example
			this.setStrokeWidth(5);
	 */
	Shape.prototype.setStrokeWidth = function(value) {
		if ( this._lineWidth != value ) {
			this._lineWidth = value;
			this.raiseEvent("strokeWidthChanged", value);
		}
		return this;
	};
	/**
	 * Sets the line width used to stroke the shape
	 *
	 * @method setBorderWidth
	 * @param {int} value the strokeStyle
	 * @example
			this.setStrokeWidth(5);
	 */
	Shape.prototype.setBorderWidth = Shape.prototype.setStrokeWidth;
	/**
	 * Returns the style used to stroke the shape
	 *
	 * @method getBorder
	 * @example
			this.getStrokeStyle();
	 */
	Shape.prototype.getBorder = Shape.prototype.getStrokeStyle;
	/**
	 * Gets the stroke width
	 * @method getStrokeWidth
	 * @return {int} the strokeWidth
	 */
	Shape.prototype.getStrokeWidth = function() {
		return this._lineWidth;
	};
	/**
	 * Gets the stroke width
	 * @method getBorderWidth
	 * @return {int} the strokeWidth
	 */
	Shape.prototype.getBorderWidth = Shape.prototype.getStrokeWidth;
		/**
	 * Sets the shadow style for this shape
	 *
	 * @method setShadow
	 * @param {float} x displacent in x
	 * @param {float} y displacent in y
	 * @param {String} color
	 * @param {int} blur
	 */
	Shape.prototype.setShadow = function(x, y, color, blur) {
		this._shadow = {
			x: x, y: y, color: color || "#000000", blur: blur || 1
		}
		this.raiseEvent("shadowChanged", this._shadow);
	};
	/**
	 * Gets the shadow
	 * @method getShadow
	 * @return {Object} the shadow
	 */
	Shape.prototype.getShadow = function() {
		return this._shadow;
	};

	Shape.prototype.setBlur = function(value, color) {
		this.setShadow(0, 0, color || this._fillStyle, value)
	};

	Shape.prototype.getBlur = function() {
		return this._shadow.blur;
	};

	Shape.name = "Shape";
	
	M.extend(Shape, Renderizable);
	
	namespace.Shape = Shape;
	
})(Match.renderizables, Match, Match.renderizables.Renderizable);
/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable, spriteAssets) {

	/**
	 * Contains an array of images that can be rendered to play an animation
	 *
	 * @class Sprite
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {String} img the key of the image loaded by M.sprites
	 * @param {float} x the x coordinate
	 * @param {float} y the y coordinate
	 */
	function Sprite(img, x, y) {

		this.extendsRenderizable();
		
		/**
		 * The image to render
		 * @private
		 * @property _image
		 * @type HTMLImageElement
		 */
		/**
		 * The current frame of the spritesheet
		 * @property currentFrame
		 * @protected
		 * @type Object
		 */
		 /**
		 * The name of the animation to play
		 * @property animationName
		 * @protected 
		 * @type Object
		 */
		 this.animationName = null;
		/**
		 * The animation to play
		 * @property _animation
		 * @protected
		 * @type Object
		 */
		 this._animation = null;
		 /**
		 * The index of the current frame
		 * @property _frameIndex
		 * @protected
		 * @type int
		 */
		 this._frameIndex = 0;
		 /**
		 * Indicates if the animation if playing
		 * @property isPlaying
		 * @type Boolean
		 */
		 this.isPlaying = false;
		 /**
		 * Time in milliseconds when the current frame started playing
		 * @property currentFrameStartInMillis
		 * @protected
		 * @type int
		 */
		
		if ( img ) this.setImage(img);
		
		this.setLocation(x || 0, y || 0);
		
		this.TYPE = M.renderizables.TYPES.SPRITE;
		
	}

	/**
	 * Sets the image of this Sprite
	 * 
	 * @method setImage
	 * @param {String} img the key of the image loaded by M.sprites
	 * @param {int} frameIndex the starting frame index
	 */
	Sprite.prototype.setImage = function( img, frameIndex ) {

		if ( !img ) throw new Error("Image cannot be null");

		if ( img instanceof Image ) {
			if ( !img.frames ) {
				img.frames = [{x:0, y: 0, width: img.width, height: img.height, halfWidth: img.width / 2, halfHeight: img.height / 2}];
			}
			this._image = img;
		} else {
			var sprt = spriteAssets[ img ];
			if ( sprt ) {
				this._image = sprt;
			} else {
				throw new Error("Image by id " + img + " not loaded");
			}
		}

        this.setFrameIndex(frameIndex);
		this.animationName = null;
		this._animation = null;
		this.isPlaying = false;

		return this;

	};
	Sprite.prototype.getImage = function() {
		return this._image;
	};
	Sprite.prototype.setFillStyle = Sprite.prototype.setImage;
	Sprite.prototype.getFillStyle = Sprite.prototype.getImage;
	Sprite.prototype.setFill = Sprite.prototype.setImage;
	Sprite.prototype.getFill = Sprite.prototype.getImage;
	Sprite.prototype.setSprite = Sprite.prototype.setImage;
	Sprite.prototype.getSprite = Sprite.prototype.getImage;
	/**
	 * Starts playing the animation
	 * 
	 * @method play
	 * @param {String} animationName the key of the animation to play
	 * @param {Boolean} [loop] if true the animation will loop
	 */
	Sprite.prototype.play = function( animationName, loop ) {

		if ( this._animation && this.animationName == animationName && this.isPlaying ) return;

		if ( !animationName && this._animation ) {

			this.isPlaying = true;

		} else {

			if ( !this._image ) throw new Error("No image selected");

			if ( !this._image.animations ) throw new Error("Image has no animations");

			if ( !this._image.animations[animationName] ) throw new Error("Image has no animation by name " + animationName);

			this._animation = this._image.animations[animationName];

			this.animationName = animationName;

			this._frameIndex = 0;

			this.isPlaying = true;

		}

		this.loop = loop || this._animation.loop;

		this.raiseEvent("animationPlaying");

	};
	/**
	 * Stops the animation
	 *
	 * @method stop
	 */
	Sprite.prototype.stop = function() {
		this.isPlaying = false;
	};
	/**
	 * Animates the object
	 *
	 * @method _animate
	 * @private
	 */
	Sprite.prototype._animate = function() {

		if ( this.isPlaying ) {
			
			var timeInMillis = M.getTime();

			if ( ! this.currentFrameStartInMillis ) this.currentFrameStartInMillis = timeInMillis;

			if ( timeInMillis - this.currentFrameStartInMillis > this._animation.duration ) {

				this.currentFrame = this._image.frames[this._animation.frames[this._frameIndex]];

				if ( this._frameIndex < this._animation.frames.length - 1 ) {

					this.setFrameIndex(this._frameIndex + 1);

				} else {

					if ( this.loop ) {

						if ( this._frameIndex == 0 ) {

							this.setFrameIndex(1);

						} else {

							this.setFrameIndex(0);

						}

					} else {

						if ( this._animation.next ) {
							this.play(this._animation.next);
						} else {
							this.isPlaying = false;
						}

					}

				}

				this.currentFrameStartInMillis = timeInMillis;

			}

		}

	};
	/**
	 * Returns whether the current frame is the last frame of the animation
	 *
	 * @method isLastAnimationFrame
	 * @return {Boolean} true if current frame is the last of the animation
	 */
	Sprite.prototype.isLastAnimationFrame = function() {

		if ( this._animation ) {
			return this._frameIndex == this._animation.frames.length - 1;
		}

		return false;

	};
	/**
	 * Returns whether the current frame is the first frame of the animation
	 *
	 * @method isFirstAnimationFrame
	 * @return {Boolean} true if current frame is the first of the animation
	 */
	Sprite.prototype.isFirstAnimationFrame = function() {

		if ( this._animation ) {
			return this._frameIndex == 1;
		}

		return false;

	};
    /**
	 * Sets the index of the frame to render
	 *
	 * @method setFrameIndex
	 * @return {integer} the index to render
	 */
    Sprite.prototype.setFrameIndex = function(index) {
		index = index || 0;
        this._frameIndex = index;
        this.currentFrame = this._image.frames[index];
        this._width = this.currentFrame.width;
        this._height = this.currentFrame.height;
        this._halfWidth = this.currentFrame.halfWidth;
        this._halfHeight = this.currentFrame.halfHeight;
        this.raiseEvent("attributeChanged", "frame");
    };
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Sprite.prototype.toString = function() {
		return "Sprite";
    };
	
    Sprite.name = "Sprite";

	M.extend( Sprite, Renderizable );

	namespace.Sprite = Sprite;

})(Match.renderizables, Match, Match.renderizables.Renderizable, Match.sprites.assets);
/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Shape) {

	/**
	 * @class Rectangle
	 * @constructor
	 * @extends renderers.Shape
	 * @param {Object} [properties] properties to construct this object
	 */
	function Rectangle( properties ) {

		this.extendsShape();

		this.TYPE = M.renderizables.TYPES.RECTANGLE;

		this.set( properties );

	}
	
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
  Rectangle.prototype.toString = function() {
    return "Rectangle";
  };

  Rectangle.name = "Rectangle";

	M.extend(Rectangle, Shape);

	namespace.Rectangle = Rectangle;

})(Match.renderizables, Match, Match.renderizables.Shape);
/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Shape) {

	/**
	 * @class Circle
	 * @constructor
	 * @extends renderers.Shape
	 * @param {Object} [properties] properties to construct this object
	 */
	function Circle( properties ) {

		this.extendsShape();

		/**
		 * Radius of the circle
		 * @private
		 * @property _radius
		 * @default 1
		 * @type float
		 */
		this._radius = 1;
		/**
		 * Angle in which to begin rendering the circle.
		 * Valid values: 0 to 2 * Math.PI
		 * @private
		 * @property _radius
		 * @default 0
		 * @type float
		 */
		this._startAngle = 0;
		/**
		 * Angle in which to end rendering the circle
		 * Valid values: 0 to 2 * Math.PI
		 * @private
		 * @property _radius
		 * @default 6.28
		 * @type float
		 */
		this._endAngle = 6.28;

		this.TYPE = M.renderizables.TYPES.CIRCLE;

		this.set( properties );

	}
	/**
	 * Sets the diameter of the circle
	 *
	 * @method setSize
	 * @param {float} size
	 */
	Circle.prototype.setSize = function(size) {
		return this.setRadius(size / 2);
	};
	/**
	 * Gets the diameter of the circle
	 *
	 * @method getSize
	 * @return {float} diameter
	 */
	Circle.prototype.getSize = function() {
		return this._radius * 2;
	};
	/**
	 * Sets the radius of the circle
	 *
	 * @method setRadius
	 * @param {float} radius
	 */
	Circle.prototype.setRadius = function(radius) {
		this._radius = radius;
		this.raiseEvent("attributeChanged");
	};
	/**
	 * Gets the radius of the circle
	 * @method getRadius
	 * @return {float} the shadow
	 */
	Circle.prototype.getRadius = function() {
		return this._radius;
	};
	/**
	 * Returns whether the mouse is over this object or not
	 *
	 * @method isMouseOver
	 * @param {Object} p M.onLoopProperties
	 * @return {Boolean} true if mouse is over this object else false
	 */
	Circle.prototype.isMouseOver = function( p ) {
		if ( ! p ) p = M.onLoopProperties;
		return M.Math2d.getDistance( {x: this._x, y: this._y }, p.mouse ) <= this._radius;
	};
	/**
	 * Gets the height of this object. This is actually an ellipsis so this method will return the width of the shape
	 * @method getWidth
	 * @return {float} the width
	 */
	Circle.prototype.getWidth = function() {
		if ( this._scale ) {
			return this._radius * 2 * this._scale.x;
		} else {
			return this._radius * 2;
		}
	};
	/**
	 * Gets the height of this object. This is actually an ellipsis so this method will return the height of the shape
	 * @method getWidth
	 * @return {float} the width
	 */
	Circle.prototype.getHeight = function() {
		if ( this._scale ) {
			return this._radius * 2 * this._scale.y;
		} else {
			return this._radius * 2;
		}
	};
	/**
	 * Returns x coordinate representing the leftmost part of the Object
	 *
	 * @method getLeft
	 * @return {float} the coordinates to left of the object
	 */
	Circle.prototype.getLeft = function() {
		if ( this._scale ) {
			return this._x - this._radius * this._scale.x;
		} else {
			return this._x - this._radius;
		}
	};
	/**
	 * Returns x coordinate representing the rightmost part of the Object
	 *
	 * @method getRight
	 * @return {float} the coordinates to right of the object
	 */
	Circle.prototype.getRight = function() {
		if ( this._scale ) {
			return this._x + this._radius * this._scale.x;
		} else {
			return this._x + this._radius;
		}
	};
	/**
	 * Returns y coordinate representing the topmost part of the Object
	 *
	 * @method getTop
	 * @return {float} the coordinates to top of the object
	 */
	Circle.prototype.getTop = function() {
		if ( this._scale ) {
			return this._y - this._radius * this._scale.y;
		} else {
			return this._y - this._radius;
		}
	};
	/**
	 * Returns y coordinate representing the bottommost part of the Object
	 *
	 * @method getBottom
	 * @return {float} the coordinates to bottom of the object
	 */
	Circle.prototype.getBottom = function() {
		if ( this._scale ) {
			return this._y + this._radius * this._scale.y;
		} else {
			return this._y + this._radius;
		}
	};
	/**
	 * Sets the leftmost coordinates of the Object
	 *
	 * @method setLeft
	 * @param {float} value the coordinates to left of the object
	 */
	Circle.prototype.setLeft = function(value) {
		if ( this._scale ) {
			this.setX(value + this._radius * this._scale.x);
		} else {
			this.setX(value + this._radius);
		}
	};
	/**
	 * Sets the rightmost coordinates of the Object
	 *
	 * @method setRight
	 * @param {float} value the coordinates to right of the object
	 */
	Circle.prototype.setRight = function(value) {
		if ( this._scale ) {
			this.setX(value - this._radius * this._scale.x);
		} else {
			this.setX(value - this._radius);
		}
	};
	/**
	 * Sets the topmost coordinates of the Object
	 *
	 * @method setTop
	 * @param {float} value the coordinates to top of the object
	 */
	Circle.prototype.setTop = function(value) {
		if ( this._scale ) {
			this.setY(this._y = value + this._radius * this._scale.y);
		} else {
			this.setY(value + this._radius);
		}
	};
	/**
	 * Sets the bottommost coordinates of the Object
	 *
	 * @method setBottom
	 * @param {float} value the coordinates to bottom of the object
	 */
	Circle.prototype.setBottom = function(value) {
		if ( this._scale ) {
			this.setY(value - this._radius * this._scale.y);
		} else {
			this.setY(value - this._radius);
		}
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Circle.prototype.toString = function() {
		return "Circle";
    };

    Circle.name = "Circle";

	M.extend(Circle, Shape);

	namespace.Circle = Circle;

})(Match.renderizables, Match, Match.renderizables.Shape);
/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Shape) {

	var textMeasuringDiv = document.createElement("div");
		textMeasuringDiv.setAttribute("id", "match-text-measuring");
		textMeasuringDiv.style.setProperty("visibility", "hidden");
		textMeasuringDiv.style.setProperty("display", "inline-block");
		textMeasuringDiv.style.setProperty("position", "absolute");

	document.addEventListener( "DOMContentLoaded", function() {
		document.body.appendChild(textMeasuringDiv);
	});


	/**
	 * @class Text
	 * @constructor
	 * @extends renderers.Shape
	 * @param {Object} [properties] properties to construct this object
	 */
	function Text( properties ) {

		this.extendsShape();
		/**
		 * Font style
		 * @private
		 * @property _style
		 * @default "normal"
		 * @type String
		 * @example
				this._style = "normal";
		 * @example
				this._style = "italic";
		 * @example
				this._style = "bold";
		 */
		this._style = "";
		/**
		 * Font variant
		 * @private
		 * @property _variant
		 * @default "normal"
		 * @type String
		 * @example
				this._variant = "normal";
		 * @example
				this._variant = "small-caps";
		 */
		this._variant = "";
		/**
		 * Font weight
		 * @private
		 * @property _weight
		 * @default "normal"
		 * @type String
		 * @example
				this._weight = "normal";
		 * @example
				this._weight = "bold";
		 * @example
				this._weight = "bolder";
		 * @example
				this._weight = "lighter";
		 */
		this._weight = "";
		/**
		 * Font size
		 * @private
		 * @property _size
		 * @type String
		 * @example
				this._size = "10px";
		 */
		this._size = "14px";
		/**
		 * Font family
		 * @private
		 * @property _family
		 * @type String
		 * @example
				this._family = "Monospace";
		 */
		this._family = "Calibri, Verdana, Arial, Monospace";
		/**
		 * Text align
		 * @private
		 * @property _textAlign
		 * @default center
		 * @type String
		 * @example
				this._textAlign = "left";
		 * @example
				this._textAlign = "center";
		 * @example
				this._textAlign = "right";
		 * @example
				this._textAlign = "justify";
		 */
		this._textAlign = "left";
		/**
		 * Text baseline
		 * @private
		 * @property _textBaseline
		 * @default middle
		 * @type String
		 * @example
				this._textBaseline = "top";
		 * @example
				this._textBaseline = "bottom";
		 * @example
				this._textBaseline = "middle";
		 * @example
				this._textBaseline = "alphabetic";
		 * @example
				this._textBaseline = "hanging";
		 */
		this._textBaseline = "top";
		/**
		 * Text
		 * @private
		 * @property _text
		 * @default ""
		 * @type String
		 * @example
				this._textBaseline = "Hellow World!";
		 */
		this._text = "";

		this._changed = false;
		
		this.TYPE = M.renderizables.TYPES.TEXT;

		this.set( properties );

	}
	Text.prototype.getBoundingHalfWidth = function () {
		//Calculate and cache internal halfWidth and halfHeight which are needed for bounding method
		this.getWidth();
		this.getHeight();
		return this.shapeGetBoundingHalfWidth();
	};
	Text.prototype.getBoundingHalfHeigth = function () {
		//Calculate and cache internal halfWidth and halfHeight which are needed for bounding method
		this.getWidth();
		this.getHeight();
		return this.shapeGetBoundingHalfHeight();
	};
	/**
	 * Gets the height of this object
	 * @method getHeight
	 * @return {float} the height
	 */
	Text.prototype.getHeight = function() {
		
		if ( this._changed ) {

			textMeasuringDiv.style.setProperty("font-size", this._size);
			textMeasuringDiv.style.setProperty("font-family", this._family);
			textMeasuringDiv.style.setProperty("font-variant", this._variant);
			textMeasuringDiv.style.setProperty("font-weight", this._weight);
			textMeasuringDiv.style.setProperty("font-style", this._style);
			textMeasuringDiv.innerHTML = this._text;

			this._width = textMeasuringDiv.offsetWidth;
			this._height = textMeasuringDiv.offsetHeight;
			this._halfWidth = this._width / 2;
			this._halfHeight = this._height / 2;
		
			this._changed = false;

		}

		return this._height;

	};
	/*
	 * A Text size is too difficult to calculate so we
	 * just handle it's coordinates as we do with both
	 * of the objects, x and y is always center.
	 * That's why this methods are commented
	 */
	/**
	 * @deprecated
	 */
	Text.prototype.setAlignment = function( horizontal, vertical ) {
		this.setHorizontalAlign(horizontal);
		this.setVerticalAlign(vertical);
		this._changed = true;
	};
	/**
	 * @deprecated
	 */
	Text.prototype.setHorizontalAlign = function(value) {
		this._textAlign = value;
		this._changed = true;
		this.raiseEvent("horizontalAlignChanged", value);
	};
	/**
	 * @deprecated
	 */
	Text.prototype.setVerticalAlign = function(value) {
		this._textBaseline = value;
		this._changed = true;
		this.raiseEvent("verticalAlignChanged", value);
	};
	/**
	 * Gets the width of this object
	 * @method getWidth
	 * @return {float} the width
	 */
	Text.prototype.getWidth = function() {

		if ( this._changed ) {

			textMeasuringDiv.style.setProperty("font-size", this._size);
			textMeasuringDiv.style.setProperty("font-family", this._family);
			textMeasuringDiv.style.setProperty("font-variant", this._variant);
			textMeasuringDiv.style.setProperty("font-weight", this._weight);
			textMeasuringDiv.style.setProperty("font-style", this._style);
			textMeasuringDiv.innerHTML = this._text;

			this._width = textMeasuringDiv.offsetWidth;
			this._height = textMeasuringDiv.offsetHeight;
			this._halfWidth = this._width / 2;
			this._halfHeight = this._height / 2;
		
			this._changed = false;

		}

		return this._width;

	};
	/**
	 * Sets the font family
	 *
	 * @method setFamily
	 * @param {String} value the font family
	 * @example
			this.setFamily("Monospace");
	 */
	Text.prototype.setFamily = function(value) {
		this._family = value;
		this._changed = true;
		this.raiseEvent("familyChanged", value);
	};

	Text.prototype.setFont = Text.prototype.setFamily;

	Text.prototype.getFont = Text.prototype.getFamily;
	/**
	 * Sets the font size
	 *
	 * @method setSize
	 * @param {String} value the font size without "px"
	 * @example
			this.setSize(14);
	 */
	Text.prototype.setSize = function(value) {
		this._size = parseInt(value) + "px ";
		this._changed = true;
		this.raiseEvent("sizeChanged", value);
	};
	/**
	 * Sets the font weight
	 *
	 * @method setWeight
	 * @param {String} value the font weight
	 * @example
			this.setWeight("normal");
	 * @example
			this.setWeight("bold");
	 * @example
			this.setWeight("bolder");
	 * @example
			this.setWeight("lighter");
	 */
	Text.prototype.setWeight = function(value) {
		this._weight = value + " ";
		this._changed = true;
		this.raiseEvent("weightChanged", value);
	};
	/**
	 * Makes the font bold or regular
	 *
	 * @method setBold
	 * @param {Boolean} value true or false to set font bold
	 * @example
			this.setBold(true);
	* @example
			this.setBold(false);
	 */
	Text.prototype.setBold = function(value) {
		if ( value ) {
			this.setWeight("bold");
		} else {
			this.setWeight("");
		}
		this._changed = true;
	};
	/**
	 * Sets the font variant
	 *
	 * @method setVariant
	 * @param {String} value the font variant
	 * @example
			this.setVariant("normal");
	 * @example
			this.setVariant("small-caps");
	 */
	Text.prototype.setVariant = function(value) {
		this._variant = value + " ";
		this._changed = true;
		this.raiseEvent("variantChanged", value);
	};
	/**
	 * Sets the font style
	 *
	 * @method setStyle
	 * @param {String} value the font style
	 * @example
			this.setStyle("normal");
	 * @example
			this.setStyle("italic");
	 * @example
			this.setStyle("bold");
	 */
	Text.prototype.setStyle = function(value) {
		this._style = value + " ";
		this._changed = true;
		this.raiseEvent("styleChanged", value);
	};
	/**
	 * Gets the font size
	 * @method getSize
	 * @return {int} the size
	 */
	Text.prototype.getSize = function(value) {
		return this._size;
	};
	/**
	 * Gets the font weight
	 * @method getWeight
	 * @return {String} the weight
	 */
	Text.prototype.getWeight = function(value) {
		return this._weight;
	};
	/**
	 * Gets the font variant
	 * @method getVariant
	 * @return {String} the variant
	 */
	Text.prototype.getVariant = function(value) {
		return this._variant;
	};
	/**
	 * Gets the font style
	 * @method getStyle
	 * @return {String} the style
	 */
	Text.prototype.getStyle = function(value) {
		return this._style;
	};
	/**
	 * Sets the text
	 * @method setText
	 * @param {String} value the text
	 */
	Text.prototype.setText = function(value, multiLine) {
		if ( multiLine ) {
			this.multiLine = value.split("\n");
		}
		this._text = value;
		this._changed = true;
		this.raiseEvent("textChanged", value);
	};
	/**
	 * Gets the font family
	 * @method getFamily
	 * @return {String} the family
	 */
	Text.prototype.getFamily = function(value) {
		return this._family;
	};
	/**
	 * Gets the text
	 * @method getText
	 * @return {String} the text
	 */
	Text.prototype.getText = function() {
		return this._text;
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Text.prototype.toString = function() {
		return "Text";
    };

    Text.name = "Text";
    
	M.extend( Text, Shape );

	namespace.Text = Text;

})(Match.renderizables, Match, Match.renderizables.Shape);
/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable, spriteAssets) {

	/**
	 * Contains an array of images that can be rendered to play an animation
	 *
	 * @class BitmapText
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {String} sprite the key of the image loaded by M.sprites
	 * @param {float} x the x coordinate
	 * @param {float} y the y coordinate
	 */
	function BitmapText(sprite, x, y) {

		this.extendsRenderizable();
		
		/**
		 * The image to render
		 * @private
		 * @property _sprite
		 * @type HTMLImageElement
		 */
		this._sprite = null;
		
		if ( sprite ) this.setSprite(sprite);
		
		this.setLocation(x || 0, y || 0);
		
		this.TYPE = M.renderizables.TYPES.BITMAP_TEXT;
		
	}

	/**
	 * Sets the sprite of this BitmapText
	 * 
	 * @method setSprite
	 * @param {String} sprite the key of the sprite loaded by M.sprites
	 * @param {int} frameIndex the starting frame index
	 */
	BitmapText.prototype.setSprite = function( sprite, frameIndex ) {

		if ( !sprite ) throw new Error("Image cannot be null");

		if ( sprite instanceof Image ) {
			if ( !sprite.frames ) {
				throw new Error("A bitmap font requires each font to be specified as a frame");
			}
			this._sprite = sprite;
		} else {
			var sprt = spriteAssets[ sprite ];
			if ( sprt ) {
				this._sprite = sprt;
			} else {
				throw new Error("Image by id " + sprite + " not loaded");
			}
		}

		this.raiseEvent("attributeChanged", "sprite");
		
		return this;

	};
	/**
	 * Gets the sprite of this BitmapText
	 * 
	 * @method getSprite
	 * @return {Image} the sprite used by this BitmapText
	 */
	BitmapText.prototype.getSprite = function() {
		return this._sprite;
	};
	BitmapText.prototype.setFillStyle = BitmapText.prototype.setSprite;
	BitmapText.prototype.getFillStyle = BitmapText.prototype.getSprite;
	BitmapText.prototype.setFill = BitmapText.prototype.setSprite;
	BitmapText.prototype.getFill = BitmapText.prototype.getSprite;
	BitmapText.prototype.setText = function(text) {

		if ( text != this._text ) {

			this._text = text;

			this._width = 0;
			this._height = 0;

			var i = 0,
				j = text.length,
				character;

			for ( var i = 0, j = text.length; i < j; i++ ) {

				character = this._sprite.frames[text[i]];

				if ( character == undefined ) {
					throw new Error("Character '" + text[i] + "' has not been defined for this BitmapText");
				}

				this._width += this._sprite.frames[text[i]].width;
				this._height = Math.max(this._height, this._sprite.frames[text[i]].height);

			}

			this._halfWidth = this._width / 2;
			this._halfHeight = this._height / 2;

			this.raiseEvent("attributeChanged", "text");

		}

		return this;

	};
	BitmapText.prototype.getText = function() {
		return this._text;
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    BitmapText.prototype.toString = function() {
		return "BitmapText";
    };
	
	BitmapText.DEFAULT_FONT = {
		source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAb8AAAJBCAYAAADWY7uGAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB94BFxAECRXYT7kAAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAE35JREFUeNrt3U1uGzsWgFFWoF15pEAzeeANGYn3ZM0E1MjwogSjepCU0nHiF0uqn0vec0YBGg8ts0h+KltFdcMwFP7UP3VDKaVsvw2d0cB8hLbm4+b8r5d7FZxC6+N499wZd/Mx3Xw0v5qzMQRctQlEiaBNyXyM/KYM8cOmI3qIIOKHTUf0EEHED5uO6CGCiB82HdFDBBE/6tt0+uOhlHLFR6JFj0jzkeZ8MQQAiB8AiB8AiB8AiB8AiB8AiB8AxBHmOb/x+ZupbXf7VBfUOMYex2zMR/NR/Ba2fTz9+Mfrg6tsHDEfIXb8vn4vk5y8MDyW1CeEGMeJNlsngZiP5mOT/M0PAPEDAPEDAPEDAPEDAPEDAPEDAPEDAPEDgMWEO+FleDsNLotxBEgRv/OZfRhH4Pd1HexYs/6pGyK+rjrv/BxUaxyBv3u595ucifmbHwDiBwDiBwDiBwB12xgCbtUfDwYBcOcHAO78aFrNz/oA7vxgcv1TN4wPxAK486MdHsAF3PkBgPgBgPgBgPgBwILCfOBlrgelt7t9qgtqHMG6pqL4Tb5Zj8+e+STibeM4fj+gr0oCxG+BaHGTr9/LJOM4PBZvHsD+2Bx/8wNA/ABA/ABA/ABA/ABA/ABA/ABA/ABA/ABgMb7MtlHD28nJLJiPIH45nM/i5LZxDHaMVP/UDRFfl/loPoofMTiAehoORDcfzcem+ZsfAOIHAOIHAOIHAOIHAOIHAOIHAIF4zo9Z9MfDJP/9drc3mKw+HxE/uGiTufYEiPG/O58kIYKsOB8RP1h0kxFBRA/xI+0mI4KIHuJH2k1GBBE9xI+0m4wIInpMEr9WPw219M+V5VNlUTaZ9xHEfDSOfCp+rW4aS/9cWTbfqO+sRdB8NI5cohsG1xaAXJzwAoD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4Lax/6gbn+rn+Xo91ZBzbfN2/vtLo5d4EXUNt43733BmXin4u69r15x/xQ/Qued1LRRBA/ERPBAHET/REEED8RE8EAcRP9EQQQPxEb8lx6I+HUkop22+DGAJheM4PAPEDAPEDAPEDAPEDAPEDAPEDgEDCPOc3Pg+GcQRw5wcArd75jZwEYhwB3PkBgPgBgPgBgPgBgPgBkF7/1A39UzeU4vv8AKjVDd+f6s4PgHTEDwDxAwDxA4DGhPnAS7TjuMZPBDkmLOc4uu4gfsu44VM7GH/jAVzCrz0BED8AED8AED8AED8AED8AED8AED8AWI+vNAKgLhMcQiF+AKSJnvgBkC564gdAuuiJHwDpohcufv3x4IIHHv/tbm88JpBtHCFa9Nz58WOT//l9ex9u1uP32vmKn9uiZxwhRPTCxs+XiBpv4wOi584PYGHjb0S8+WkveuIH2ByZ1flv3Ctfz7/9DV/8AGjzDv5d9P7/Tl78AEgTPfEDIF30xA+AdNETPwDSRU/8AEgXPfEDoGq3PIcpfgCkiZ74mRSAdZSW+LXGyRhgHWW5PnfPV79J+WIUAag2gle+URE/ANJFUPwASBdB8QMgXQTFD4B0EfRpTwBmMZ7EMj46cv6S4PF7/paM4LvXI34ALGL1CLrzW+CdzooXNdI4gHVkHUWMoPg1/M4mwmJ1UgbWkXUU8TqLn8VrsWIdWUfprrP4WbwWK9aRdZTuOoufxWuxYh1ZR+mus/hZvBYr1pF1lO46bz66GCx7UWt9/UttDq1Y+udqfV1bRzmu/xzXeVPrpLF4G12sjc7HpX+ubOvaOspx/ae8zt0waB8AuTjbEwDxAwDxAwDxAwDxAwDxAwDxAwDxAwDxAwDxA4Dm49c/dYNzRgFYwq+vNHq5F54pGMd13D13rmvg8csy7kuNo/k4YfyghTcdUTdx45djczcPqxlH8cOiIc74tXJHYx6GH0fxw6Jh/fFr9dd45mHYcRQ/LBrWG78sfyM3D8ONo/iRatH0x0MpZf5v0rbpiJ4Ixh5H8QOWexPh09DejAUZRw+5A5CO+AEgfgAgfgAgfgAgfgAgfgAQmef8GjM+7zK17W7fxOtxXY2jcTSO4se/J+P40GiQh5OjvR7XNfk4Pp5+/OP1wWBUNo7i1/rm5vW4rvzh6/cyyTgOj2UwjnWOo7/5AZCO+AEgfgAgfgAgfgAgfgAgfgAgfgAgfgCwHie8AHCV4e1U7Qk34gfARc5ncbrzAyCNBg7y9jc/ANIRPwDEDwDEDwDEDwDEDwDEDwAi85wfAFXqjwfxAyBn9Lbfhk78ABA98QNA9MQPgKTREz8A0kVP/ACYJE5zmSN64gdASHNGT/wACB+puTjhBYB0xA8A8QMA8QMA8QMA8QMA8QMA8QMA8QOA9TjhBUhneDsNRkH8Qoh2TE7/1A0RXxdwwz7zeDIIBLvze7n3TgyY1+uDMaCU4m9+AIgfAIgfAIgfAIgfAIgfAIgfAITihBdgMf3xUEopZbvbGwfED8hhPDHpfIJSsgi+j54TpMQPEEHRQ/wAERQ9xA8QQdFD/AARFD1ujJ9PH80z+f1cbbwe13XdCNYacfMxcPxqnVzhNpFGxzHaz7X063FdRTBU9OzXk+mGwVgCkIsTXgAQPwAQPwAQPwAQPwAQPwAQPwAQPwAQPwAQPwAQP0isf+oG5zrmHcdor7uF+Xj9Vxq93Nf1g989L/PVIrWNS9RxNO7GxTj6uULFr9bBGl931M3bOFq8QMD4tbLJiGAb4yh6wKzxa/12XwTrGkfRA2aNX5ZNRgTrGEfRA2aNX9ZNRgRjjqPoAbPGzybz2zj0x0MppZTtt0EM1xhH8xGYkef8ABA/ABA/ABA/ABA/ABA/ABA/AAhkE+WFjM+DTW2726e6oMYx9jjW+nOsff1buR6I3+y2j6cf/3h9cJWNYzpTfdfa+XAChw4gfvP6+r1McqLK8FhSL1bjOFH8Kz3hp9WTiZy4xFT8zQ8A8QMA8QMA8QMA8QMA8QMA8QMA8QMA8QOAxWwMQZuGt5PjqADEL4fzWZzcNo6O0QLxoyIOoJ7G3Ac53z2LK6zI3/xgrbj6pgQQPxBBQPxABAHxAxEExA9EELiKT3tC9AiWUvrjoZTiEQxw5wcA7vyIZLxTufW/3+72BhMQP+qK3rW/phv/u/6pG0QQED+ajp4IAuJH2uiJICB+pI2eCALiR9roiSAgfqSN3r8iGJ1Ig/hRoagPWUeP4HncnNoC4ofoZX2dwLqc8AKAO7/aDW8nv1aaw/jrOt9ADohf4Oi9Pri6IgjQZvxETwQB0sRP9EQQIE38RE8EAdLET/REECBN/ESv7gj6BnJA/EQPAPETPQASx+984K/YAfy+P/qzQft3flBKcQA0WA+zcrYnAOIHAOIHAOIHAHXzgZfGvH+ofPxm8/OnaQEQv9aJIID4iaAIAvyK3/nXZZVvin+cJen5GBFsYD4TZF9Jvl5amo+bVjZFm4QItrzJOOHDejEfZ4pfrRfZJmFR22SwXszHm+NXy0W2SVjUNhmsF/Nx8vhFvcg2CYvaJoP1Yj7OHr8oF9kmYVGLHtaL+bh4/D66yGtNsmsv6tKTqLVFbRzXnc9RNkdi7o9Z5uMq8VvrIl8cvaU360one7hNNsk4VhM98zpFBDP+5qEbBnMbgFwcbA2A+AGA+AGA+AGA+AGA+AGA+AGA+AGA+AGA+AFA8/Hrn7oh0jl40V6PcXRdjaNxZLpx/HWw9ct9mxdg6Z/LOLqurqtxNI7u/ABA/ABA/ABA/ABA/ABA/ABA/ABA/ABA/ABA/AAQPwAQPwAQPwBow8YQANSlPx6a/Lm2u734AfAueo1+99/229CVUhb9qibxA6gtEtzM3/wAED8AED8AED8AED8AED8AED8AED8AED8AWIwTXoA0nJCC+IFNO58Fz45E/ACbNuaP+AEgeuIHgOiJHwCiJ34AiJ74wZL64+HD/22726f7mRE98YOWo/fU2VwQPfGDXD71fF2jG5FnCxE/gL/cEQskq87DG341L37wGRl/zeRXa1QSvWvehIkfAGmiJ34ApIue+AGQLnriB0C66IkfrLCIp9Lqg/Xkntd/zPMZP00sflCR82bgk5hkmOczEj9oZDHXdMeQ/c61laPjap7X4gcsvlmeH5JPFsEl/paF+AEiKHoki5+/iYAIih5p4id6IIKiR5r4iR6IoOiRJn6iByIoeqSJn+iBCIoeaeInepA2glH2AdETP9EDRBnxEz0AxO+z76DG3+WLXVPvRL0zBvvM3M5/E77gdZ3j58y938ehWtHePHgzA+1pYF1v3pfcmXvuWABat/nodtaZewCkiV+WCIoegPiVLBEUPQA+/WlPZ+4BkC5+tUZQ9AC4OX61RFD0AJg8flEjuHb0PC9Zx28AAPGbxNoRjHKnl/15yejR8xsAYNL4rbX5R93cRFD0gETxW2rzr2VzE0HRAxLFb67Nv9bNTQRFD0gUv6k2/1Y2NxEUPSBR/D7a/K/972t36ziw7LyI9mnR7J9e9fP79HJ18bt282/1Hb0IBo9esOuSfZ74+e0TU+mGwVgCkMsXQwCA+AGA+AGA+AGA+AGA+AGA+AGA+AGA+AGA+AHATDaGoC3nb4vw7QZgLfLhdbk+fi/3dR0KevcccwJGGcfarmfU628czWHj0uidX60DOb7uKIvXhMx9/Y2jtUQl8Wtlgq29eC1Um7dxtJaoIH6tTrClF6+FavM2jtYSFcQvywSbe/FaqDZv42gtUUH8sk6wqRevhWrzNo6iRwXxM8F+G4f+eCilXPExZeOY+/oz3ThaS8zIQ+4AiB8AiB8AiB8AiB8AiB8AiB8ABBLmK43G54Gmtt3tXeUVx39tS19/49jeXLaHtLkmmv0+v+3j6cc/Xh/Mvv+amD+/26q56z8+VL3Qg9LG0R6CO7+bfP1eJjlRY3gsToe4ZHPDODbm1r3EHtL2GvE3PwDSET8AxA8AxA8AxA8AxA8AxA8AxA8AxA8A1rMxBECLhreTE1oQPyCH85mca7+OiY/zGs+Pre0ovaivV/y4TsKDjo1LJaIcRG0uLDMOd89XxVX8sKCB+vekCyMofogekC6C4ofoAekiKH6IHpAuguKH6HGT/ngwCFQXQfFD9IA0e9z4Zk38gJvU9twZiB+841d4E49npQ9mI36QMno26wv4lTniB6IHiB+IHiB+IHqA+IHoAeKHOM1n7ui1+mnR7W5f3ZxY4zVHnAvmpPiR2OzR+/mR/mbHbcFPdN46lmu85pBvKM1J8UOkvG5jme3nMSf/2xdDAID4AYD4AYD4AYD4AYD4AYD4AYD4AYD4AcBSwp3wMrydfDEmADnit308uRqJRTuKaTwX0RFRIH7zen1wNTJr5RDi5IcpY07Wwt/8ABA/ABA/ABA/ABA/ABA/ABA/AAjk/JxffzyUUkrZ7vapB2QcB8A6ot05eY7feJLF+WSLZBF8PzBO9gDriHbn5B8nvGSLoMUK1hH55uSHx5u1HkGLFawj8s7Jf57t2VoELVawjjAnP32wde0RtFjBOsKcvDh+H0WwNnMv1lo/5ebTecYx0jpyLYzD3HNyc+v/US0RnD16lb4ZqPV1G0fRM6eNwy1zshsG8wSAXJzwAoD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4Lax/6gZnBBpHoE1XH2xdXu5taMbFuF/r7rkzjg2PIw3Gz+aOzXq61x1l8zaOiJ/oIXppNm/jiPiJHqKXZvM2joif6CF6aTZv4wgfxE/0EL32Nm/jKIJ8ED/RQ/TCjkN/PJRSStl+GzrjuMI40hzP+QEgfgAgfgAgfgAgfgBcwdm369kYAoB/8KlZd34A4M5vqtv/n8/f1K6Vn+O97W6famHMdR2No3FE/Npa5H5vz39t1o+nH/94fTAYxhHx+8vkrvTkheZPjEj6N4+v38sk13V4LKnfHBlHovE3PwDc+YE7PkD8ED0A8UP0AMQP0QMQP0QPQPwQPQDxQ/QAxA/RAxA/RC+C4e1k/Iwj4jef5o8HE72qnM+QxDgS3ni28iUdiXPnN/dmffecI66iNw0HJxtHmt53NukuTqsRFD0A8UsTQdEDEL80ERQ9APFLE0HRAxC/NBFMFr3+ePjwf9vu9ul+ZkD8FonMuBGt/ghGtuj9/MgyeGOC+GW+E022WXzqzUajbwg86+rNGOJHI9GzoU+7CV86nuffYDT6q2JvSBA/2opexg/2zPAzj9fhHE8RBPHDnV62OxgRBPFD9ERQBBE/ED0RBPED0RNBEL8lN9fJFrfFLHrm48URDB9t6zrFenHnd83iGL9HzFeqiJ752EwEz/PQMX8x9omKn4MMF7+v38skm+zwWCyOKTebpLLOR292aH2efHH5AMhG/AAQPwCW0T91Q6S/m0V7PXPyqAPAv0T7gI0P/LjzAwDxAwDxAwDxA0D8ACCXcJ/2HN5OPsWE+QjkiN/57EMwH4E0d34OoCaSVuaj58Hgr/zNDwDxAwDxAwDxAwDxAwDxAwDxA4BAzs/59cdDKaWU7W6fekDGcSDGdTAfzUfjyKzx234bulJ+fJNvxk3n/eIYx4N1mI/mo3Fkkfhl3XQsDhE0H40j4pdm07E4RNB8FD3EL82mY3GIoPkoevDpg61r33QsDhE0H0UPLo7fR5tOrZtmbYsa89E8Mo72hxXjV+umU030Kt3ERTDYZp1kHmUbR/vDdP4HCc7safHYZuMAAAAASUVORK5CYII=",
		frames: {
			"A": {x: 0, y: 0, width: 76, height: 73},
			"B": {x: 84, y: 0, width: 76, height: 73},
			"C": {x: 166, y: 0, width: 76, height: 73},
			"D": {x: 248, y: 0, width: 76, height: 73},
			"E": {x: 328, y: 0, width: 76, height: 73},
			"F": {x: 0, y: 84, width: 76, height: 73},
			"G": {x: 84, y: 84, width: 76, height: 73},
			"H": {x: 164, y: 84, width: 76, height: 73},
			"I": {x: 246, y: 84, width: 46, height: 73},
			"J": {x: 294, y: 84, width: 76, height: 73},
			"K": {x: 374, y: 84, width: 76, height: 73},
			"L": {x: 0, y: 168, width: 76, height: 73},
			"M": {x: 82, y: 168, width: 118, height: 73},
			"N": {x: 200, y: 168, width: 76, height: 73},
			"O": {x: 284, y: 168, width: 76, height: 73},
			"P": {x: 364, y: 168, width: 76, height: 73},
			" ": {x: 436, y: 168, width: 24, height: 73},
			"Q": {x: 0, y: 252, width: 76, height: 73},
			"R": {x: 82, y: 252, width: 76, height: 73},
			"S": {x: 164, y: 252, width: 76, height: 73},
			"T": {x: 246, y: 252, width: 76, height: 73},
			"U": {x: 330, y: 252, width: 76, height: 73},
			"V": {x: 0, y: 336, width: 76, height: 73},
			"W": {x: 84, y: 336, width: 113, height: 73},
			"X": {x: 200, y: 336, width: 81, height: 73},
			"Y": {x: 284, y: 336, width: 80, height: 73},
			"Z": {x: 364, y: 336, width: 81, height: 73},
			"0": {x: 0, y: 421, width: 81, height: 73},
			"1": {x: 81, y: 421, width: 81, height: 73},
			"2": {x: 128, y: 421, width: 82, height: 73},
			"3": {x: 210, y: 421, width: 83, height: 73},
			"4": {x: 293, y: 421, width: 82, height: 73},
			"5": {x: 374, y: 421, width: 82, height: 73},
			"6": {x: 0, y: 505, width: 82, height: 73},
			"7": {x: 82, y: 505, width: 82, height: 73},
			"8": {x: 164, y: 505, width: 82, height: 73},
			"9": {x: 246, y: 505, width: 82, height: 73},
			":": {x: 327, y: 505, width: 37, height: 73},
			".": {x: 364, y: 505, width: 36, height: 73},
			"-": {x: 400, y: 505, width: 47, height: 73}
		}
	}
	
    BitmapText.name = "BitmapText";

	M.extend( BitmapText, Renderizable );

	namespace.BitmapText = BitmapText;

})(Match.renderizables, Match, Match.renderizables.Renderizable, Match.sprites.assets);
/**
 * @module Match
 */
(function(M) {

	/**
	 * Executes a callback once per interval
	 *
	 * @class Timer
	 * @constructor
	 * @extends GameObject
	 * @param {int} interval time in milliseconds before calling the callback
	 * @param {Function} callback function to be called
	 * @param {Object} [owner] object to apply the callback to
	 */
	function Timer( interval, callback, owner ) {
		/**
		 * Interval time in milliseconds before calling the callback
		 * @property interval
		 * @type int
		 */
		/**
		 * Time in milliseconds when the last tick took place
		 * @private
		 * @property _lastTime
		 * @type int
		 */
		/**
		 * Object to apply the callback to
		 * @optional
		 * @property owner
		 * @type Object
		 */
		/**
		 * Function that will be called
		 * @property callback
		 * @type Function
		 */
		
		this.interval = interval;
		this._lastTime = M.getTime();
		if ( owner ) {
			this.owner = owner;
			this.callback = callback;
		} else {
			this.tick = callback;
		}
		this.enabled = true;
	}
	
	
	/**
	 * Checks if the interval has been reached and calls the callback
	 * @method onLoop
	 */
	Timer.prototype.onLoop = function(p) {

		if ( this.enabled && M.elapsedTimeFrom( this._lastTime, this.interval ) ) {

			this.tick();
			this._lastTime = M.getTime();

		}

	};
	/**
	 * Calls the callback
	 * @method tick
	 */
	Timer.prototype.tick = function() {
		this.callback.call(this.owner);
	};
	
	M.Timer = Timer;

})(window.Match);
/**
 * @module Match
 */
(function(M) {
    
    /**
	 * Used for knowing if the given amount of milliseconds have passed since last check.
     * This class is usefull for objects like weapons and determining if it can fire again
     * or not given its rate-of-fire
	 * @class TimeCounter
	 * @constructor
	 * @param {time} integer Time in milliseconds that need to pass from last check
	 */
	function TimeCounter(time) {
		/**
		 * Last time in milliseconds that update was called
		 * @property _lastTime
		 * @private
		 * @type int
		 */
		this._lastTime = 0;
		/**
		 * Time in milliseconds that need to pass from last check
		 * @property _lastTime
		 * @type int
		 */
		this.time = time;

	}
	TimeCounter.prototype.initialize = function() {
		this._lastTime = M.getTime();
		this.elapsed = this._run;
		return false;
	};
	/**
	 * Sets the time interval
	 * @method elapsed
	 * @param {integer} value the inteval
	 */
	TimeCounter.prototype.setInterval = function(value) {
		this.elapsed = this.initialize;
		this.time = value;
		return false;
	};
	/**
	 * Returns true if time has elapsed since last update or false
	 * @method elapsed
	 * @private
	 */
	TimeCounter.prototype._run = function() {

		var currentTime = M.getTime();

		if ( currentTime - this.time >= this._lastTime ) {
			this._lastTime = currentTime;
			return true;
		}

		return false;

	};
	/**
	 * Resets the counter
	 * @method reset
	 */
	TimeCounter.prototype.reset = function() {
		this.elapsed = this.initialize;
	};

	TimeCounter.prototype.elapsed = TimeCounter.prototype.initialize;

	M.TimeCounter = TimeCounter;

	})(window.Match);
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
    this.customViews = new Object();
    
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
	/**
   * Adds an attribute
   */
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
  /**
   * Removes an attribute 
   */
	Entity.prototype.hasnt = function(name) {
		return this.attributes.remove(name);
	};  
  /**
   * Adds a behaviour
   * If value is present and the behaviour doesn't exist it registers it as a custom one then adds it to the entity.
   */
	Entity.prototype.does = function(name, value) {
    
    if ( value && !M.game.behaviours[name] ) {
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
  /**
   * Registers a custom behaviour
   */
  Entity.prototype.registerBehaviour = function(name, value) {
    this.customBehaviours[name] = value;
  };
	/**
   * Forces the execution of a behaviour
   */
	Entity.prototype.do = function(name) {
		var behaviour = this.behaviour.get(name);
		if ( behaviour ) {
			behaviour(this, this.attributes, this.views, M.onLoopProperties)
		}
	};
	/**
   * Returns true if the entity has a behaviour matching name 
   */
	Entity.prototype.can = function(name) {
		return !!this.behaviours.get(name);
	};
	/**
   * Removes a behaviour
   */
	Entity.prototype.doesnt = function(name) {
		return this.behaviours.remove(name);
	};
  /**
   * Adds a view
   */
	Entity.prototype.shows = function(name, value) {

		var _name = name;

		if (!_name) {
			_name = M.random.string();
		}

		if ( value == undefined ) {
			return new ShowsAs(_name, this.views);
		} else {
			this.views.set(_name, value);
		}

	};
	/**
   * Removes a view
   */
	Entity.prototype.doesntShow = function(name) {
		return this.views.remove(name);
	};
  
  Entity.prototype.registerView = function(name, view) {
    this.customViews[name] = view;
  };
  
  Entity.prototype.addView = function(name) {
    return this.views.set(name, this.customViews[name]);
  };
  
  Entity.prototype.removeView = function(name) {
    this.views.remove(name);
  };

	Entity.name = "Entity";

	M.extend(Entity, EventHandler);

	namespace.Entity = Entity;

})(M, SimpleMap, M);
(function (namespace, Entity, M) {

  function ViewableEntity(properties) {
    Entity.call(this, properties);
    this.does("fixViewsToEntity");
  }
  
	ViewableEntity.name = "ViewableEntity";

	M.extend(ViewableEntity, Entity);

	namespace.ViewableEntity = ViewableEntity;
 
 })(Match, M.Entity, M);
(function (M) {
	
	function Trigger() {
		this.disabled = false;
	}

	Trigger.prototype.enable = function() {
		this.disabled = false;
	};

	Trigger.prototype.disable = function() {
		this.disabled = true;
	};

	Trigger.prototype.onLoop = function() {
		if ( this.disabled ) return;
		this.update();
	};

	Trigger.name = "Trigger";

	M.Trigger = Trigger;

})(Match);
(function (M, SimpleCollisionHandler) {
	
	function CollisionTrigger() {
		
		this.extendsTrigger();

		this.entitiesAndCallbacks = [];

	}

	CollisionTrigger.prototype.update = function() {

		var i = 0,
			l = this.entitiesAndCallbacks.length,
			wrapper,
			manifold;

		for ( i = 0; i < l; i++) {

			wrapper = this.entitiesAndCallbacks[i];

			manifold = wrapper.entity.attribute("manifold");

			if ( manifold ) {

				wrapper.callback(manifold, this);

			}

		}

	};

	CollisionTrigger.prototype.onCollision = function (entity, callback) {
		this.entitiesAndCallbacks.push({
			entity: entity,
			callback: callback
		});
	};

	M.extend(CollisionTrigger, M.Trigger);

	M.CollisionTrigger = CollisionTrigger;

})(Match);
(function (M, SimpleCollisionHandler) {
	
	function AreaTrigger(left, top, width, height) {
		
		this.extendsTrigger();

		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;

		this.entitiesAndCallbacks = [];

	}

	AreaTrigger.prototype.getLeft = function() {
		return this.left;
	};
	AreaTrigger.prototype.getTop = function() {
		return this.top;
	};
	AreaTrigger.prototype.getRight = function() {
		return this.left + this.width;
	};
	AreaTrigger.prototype.getBottom = function() {
		return this.top + this.height;
	};

	AreaTrigger.prototype.update = function() {

		var i = 0,
			l = this.entitiesAndCallbacks.length,
			self = this,
			wrapper;

		for ( i = 0; i < l; i++) {

			wrapper = this.entitiesAndCallbacks[i];

			wrapper.entity.views.eachValue(function (view) {

				if ( SimpleCollisionHandler.haveCollided(view, self) ) {
					wrapper.callback(wrapper.entity, self);
					return;
				}

			});

		}

	};

	AreaTrigger.prototype.onObjectInArea = function(entity, callback) {
		this.entitiesAndCallbacks.push({
			entity: entity,
			callback: callback
		});
	};

	M.extend(AreaTrigger, M.Trigger);

	M.AreaTrigger = AreaTrigger;

})(Match, Match.collisions.Simple);
M.registerScene("matchLogo", {

	sprites: {
		fonts: M.renderizables.BitmapText.DEFAULT_FONT,
	},

	onLoad: function() {

		var object = new M.Entity(),
			center = M.getCenter();

		object.shows("poweredBy").as("bitmapText").set({
			fill: "fonts", x: center.x, y: center.y - 40, text: "POWERED BY",
			scaleX: 0.15,
			scaleY: 0.15
		});
		object.shows("match").as("bitmapText").set({
			fill: "fonts", x: center.x, y: center.y, text: "MATCH",
			scaleX: 0.5,
			scaleY: 0.5
		});

		M.push(object).to("logo");
		
		M.getLayer("logo").background = "#000";
		
	}

});
M.registerScene("loading", {

	sprites: {
		fonts: M.renderizables.BitmapText.DEFAULT_FONT
	},
	
	onLoad: function() {

		var loading = new M.Entity(),
			progressBar = new M.Entity(),
			center = M.getCenter(),
			background,
			backgroundWidth;
		
		loading.shows("loading").as("bitmapText").set({
			fill: "fonts", x: center.x, y: center.y, text: "LOADING...",
			scaleX: 0.25,
			scaleY: 0.25
		});
		
		progressBar.shows("background").as("rectangle").set({
			fill: "#fa0",
			x: loading.getView("loading").getX(),
			y: center.y + 30,
			width: 0,
			height: 20
		});
		progressBar.shows("border").as("rectangle").set({
			fill: "rgba(0,0,0,0)",
			x: center.x,
			y: center.y + 30,
			width: 150,
			height: 20,
			border: "#a50",
			borderWidth: 2
		});

		M.push(loading).to("loading");
		M.push(progressBar).to("loading");
		
		M.getLayer("loading").background = "#000";
		
		background = progressBar.getView("background"),
		backgroundWidth = progressBar.getView("border").getWidth();
		
		M.sprites.onImageLoaded.addEventListener(function (data) {
		
			background.setWidth(backgroundWidth - data.remaining * backgroundWidth / data.total);
			background.setLeft(loading.getView("loading").getLeft());
			
			console.debug("loaded sprite: " + data.name);
		
		});
		
	}
		
});
M.registerAttribute("location", M.math2d.Vector2d);
M.registerAttribute("direction", M.math2d.Vector2d);
M.registerAttribute("areaToStayIn", function (top, right, bottom, left) {
	this.left = left;
	this.top = top;
	this.right = right;
	this.bottom = bottom;
});
M.registerAttribute("collisionGroup", 0);
M.registerBehaviour("accelerate", function(e, a) {

	if ( a.get("isAccelerating") ) {
	
		var speed = a.get("speed") + a.get("acceleration"),
			maxSpeed = a.get("maxSpeed");
		
		if ( speed > maxSpeed ) {
			speed = maxSpeed;
		}
	
		a.set("speed", speed);
		
	}

});
M.registerBehaviour("bounce", function(e, a, v, p) {
	
	var direction = a.get("direction"),
		viewportWidth = p.m.renderer.getWidth(),
		viewportHeight = p.m.renderer.getHeight();

	v.eachValue(function (view) {

		view.offset(direction.x, direction.y);
	
		if ( view.getRight() > viewportWidth || view.getLeft() < 0 ) {
			direction.x *= -1;
		}
	
		if ( view.getBottom() > viewportHeight || view.getTop() < 0 ) {
			direction.y *= -1;
		}

	});
		
});
(function (M) {

	function Manifold(entity, otherEntity, viewFromSelf, viewFromOther, collisionInX, collisionInY) {
		this.entity = entity;
		this.collidedWith = otherEntity;
		this.viewFromSelf = viewFromSelf;
		this.viewFromOther = viewFromOther;
		this.collisionInX = collisionInX;
		this.collisionInY = collisionInY;
	}


	M.registerBehaviour("collide", function(entity, attributes) {

		var location = attributes.get("location"),
			otherObjects = M._gameObjects,
			i = 0,
			l = otherObjects.length,
			otherEntity,
			collisionGroup = attributes.get("collisionGroup"),
			// simpleCollisionHandler = M.collisions.Simple,
			polygonCollisionHandler = M.collisions.Polygon,
			collisionInX = false,
			collisionInY = false,
			viewFromSelf,
			viewFromOther,
			j,
			k,
			currentY,
			prevY;
		
		for ( ; i < l; i++ ) {
		
			otherEntity = otherObjects[i];
			
			if ( otherEntity != entity && otherEntity.attribute("collisionGroup") == collisionGroup ) {

				for ( k = 0; k < otherEntity.views._values.length; k++ ) {

					viewFromOther = otherEntity.views._values[k];

					for ( j = 0; j < entity.views._values.length; j++ ) {
						
						viewFromSelf = entity.views._values[j];

						if ( polygonCollisionHandler.haveCollided(viewFromSelf, viewFromOther) ) {

							currentY = viewFromSelf._y;
							prevY = viewFromSelf._prevY;

							viewFromSelf._y = prevY;


							if ( polygonCollisionHandler.haveCollided(viewFromSelf, viewFromOther) ) {
								collisionInX = true;
							} else {
								collisionInY = true;
							}

							viewFromSelf._y = currentY;

							var manifold = new Manifold(entity, otherEntity, viewFromSelf, viewFromOther, collisionInX, collisionInY);

							attributes.set("manifold", manifold);

							entity.raiseEvent("onCollision", manifold);

							// if ( attributes.get("preventMoveOnCollision") ) {
							// 	location.set(location.prevX, location.prevY);
							// }
							
							return;
						
						}
						
					}
					
				}
			
				
			}
		}
		
		attributes.set("manifold", false);
		
	});

})(Match);

M.registerBehaviour("decelerate", function(e, a) {
	if ( a.get("isDecelerating") ) {
	
		var speed = a.get("speed") - a.get("deceleration"),
			minSpeed = a.get("minSpeed");
		
		if ( !a.get("canGoReverse") && speed < 0 ) {
			speed = 0;
		}
		
		if ( speed < minSpeed ) {
			speed = minSpeed;
		}
		
		a.set("speed", speed);
	
	}
});
M.registerBehaviour("fixViewsToEntity", function(e, a, v) {

	var rotation = a.get("rotation"),
		location = a.get("location"),
		offsetRotation = 0,
		offsetX = 0,
		offsetY = 0;

	if ( this.rotation == undefined ) {
		this.rotation = 0;
	}

	if ( this.location == undefined ) {
		this.location = new Object();
		this.location.x = 0;
		this.location.y = 0;
	}

	if ( rotation && rotation != this.rotation ) {
		offsetRotation = rotation - this.rotation;
		this.rotation = rotation;
	}

	if ( location.x != this.location.x ) {
		offsetX = location.x - this.location.x;
		this.location.x = location.x;
	}
	if ( location.y != this.location.y ) {
		offsetY = location.y - this.location.y;
		this.location.y = location.y;
	}
	
	v.eachValue(function(view) {

		if ( offsetX != 0 || offsetY != 0 ) {

			view.offset(offsetX, offsetY);

		}

		if ( offsetRotation != 0 ) {

			view.offsetRotation(offsetRotation, location.x, location.y);

		}

	});

});
M.registerBehaviour("followCamera", function(e, a, v, p) {

	var location = a.get("location");

	p.m.renderer.camera.centerAt(location.x, location.y);

});
(function (M) {

	M.registerBehaviour("monitorAttributes", function(entity, attributes) {
	
		var location = attributes.get("location"),
			rotation = attributes.get("rotation");
		
		if ( !this._cachedValues || this._cachedValues.x != location.x || this._cachedValues.y != location.y || this._cachedValues.rotation != rotation ) {

			this._cachedValues = {
				x: attributes.get("location").x,
				y: attributes.get("location").y,
				rotation: attributes.get("rotation")
			};

			attributes.push("attributeChanged", true);

			this.alreadyUpdated = false;
			
		} else if ( !this.alreadyUpdated ) {
			
			attributes.push("attributeChanged", false);
			
			this.alreadyUpdated = true;
			
		}
		
	});

})(M);
M.registerBehaviour("rotateViews", function(e, a, v) {

	var rotation = a.get("rotation"),
		offsetRotation = 0;

	if ( this.rotation == undefined ) {
		this.rotation = 0;
	}

	if ( rotation != this.rotation ) {
		offsetRotation = rotation - this.rotation;
		this.rotation = rotation;
	}

	if ( offsetRotation != 0 ) {

		//Rotar todos los vertices de las vistas usando el centro "location" como pivote y su propia rotacion
		var location = a.get("location");
		
		v.eachValue(function(view) {

			view.offsetRotation(offsetRotation);

		var x = view._x - location.x,
			y = view._y - location.y,
			rotatedX = M.math2d.getRotatedVertexCoordsX(x, y, offsetRotation),
			rotatedY = M.math2d.getRotatedVertexCoordsY(x, y, offsetRotation);

			view.setLocation(rotatedX + location.x, rotatedY + location.y);

		});

	}

});
M.registerBehaviour("stayInArea", function(e, a, v, p) {
	
	var area = a.get("areaToStayIn");
	
	v.eachValue(function(view) {
		if ( view.getLeft() < area.left ) {
			view.setLeft(area.left);
		}		
		if ( view.getRight() > area.right ) {
			view.setRight(area.right);
		}
		if ( view.getTop() < area.top ) {
			view.setTop(area.top);
		}		
		if ( view.getBottom() > area.bottom ) {
			view.setBottom(area.bottom);
		}
	});
	
});
M.registerBehaviour("stickToCanvas", function(e, a, v, p) {
	
	var viewportWidth = p.m.renderer.getWidth(),
		viewportHeight = p.m.renderer.getHeight();
	
	v.eachValue(function(view) {
		if ( view.getLeft() < 0 ) {
			view.setLeft(0);
		}		
		if ( view.getRight() > viewportWidth ) {
			view.setRight(viewportWidth);
		}
		if ( view.getTop() < 0 ) {
			view.setTop(0);
		}		
		if ( view.getBottom() > viewportHeight ) {
			view.setBottom(viewportHeight);
		}
	});
	
});
M.registerBehaviour("translateViews", function(e, a, v) {

		var location = a.get("location"),
			offsetX = 0,
			offsetY = 0;

		if ( this.location == undefined ) {
			this.location = new Object();
			this.location.x = 0;
			this.location.y = 0;
		}

		if ( location.x != this.location.x ) {
			offsetX = location.x - this.location.x;
			this.location.x = location.x;
		}
		if ( location.y != this.location.y ) {
			offsetY = location.y - this.location.y;
			this.location.y = location.y;
		}

		if ( offsetX != 0 || offsetY != 0 ) {

			v.eachValue(function(view) {

				view.offset(offsetX, offsetY);

			});

		}

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsYXNzLmpzIiwiRXZlbnRIYW5kbGVyLmpzIiwiRXZlbnRMaXN0ZW5lci5qcyIsIk1vZHVsZU1hbmFnZXIuanMiLCJTaW1wbGVNYXAuanMiLCJFdmVudFNpbXBsZU1hcC5qcyIsIkRlZmF1bHRMb2dnZXIuanMiLCJNYXRjaC5qcyIsIkFqYXguanMiLCJGUFNDb3VudGVyLmpzIiwiR2FtZU9iamVjdC5qcyIsIk1hdGgyZC5qcyIsIkNhbWVyYS5qcyIsIlZpc3VhbEVmZmVjdHMuanMiLCJFYXNpbmcuanMiLCJTb3VuZEVmZmVjdHMuanMiLCJBbGx2c0FsbENvbGxpc2lvbkhhbmRsZXIuanMiLCJDb2xsaXNpb25IYW5kbGVyLmpzIiwiUG9seWdvbi5qcyIsIlNxdWFyZS5qcyIsIlJhZGlhbC5qcyIsIlNpbXBsZS5qcyIsIlBpeGVsUGVyZmVjdC5qcyIsIk1vdXNlLmpzIiwiQWNjZWxlcm9tZXRlci5qcyIsIktleWJvYXJkLmpzIiwiVG91Y2guanMiLCJDb2xvci5qcyIsIlJhbmRvbS5qcyIsIlBvc3RQcm9jZXNzLmpzIiwiR2FtZUxheWVyLmpzIiwiU3ByaXRlTWFuYWdlci5qcyIsIlNvdW5kTWFuYWdlci5qcyIsIlJlbmRlcmVyLmpzIiwiU3RhbmRhcmRFbnRpdHlSZW5kZXJlci5qcyIsIlJlbmRlcmluZ1Byb3ZpZGVyLmpzIiwiUmVuZGVyaXphYmxlcy5qcyIsIlJlbmRlcml6YWJsZS5qcyIsIlNoYXBlLmpzIiwiU3ByaXRlLmpzIiwiUmVjdGFuZ2xlLmpzIiwiQ2lyY2xlLmpzIiwiVGV4dC5qcyIsIkJpdG1hcFRleHQuanMiLCJUaW1lci5qcyIsIlRpbWVDb3VudGVyLmpzIiwiRW50aXR5LmpzIiwiVmlld2FibGVFbnRpdHkuanMiLCJUcmlnZ2VyLmpzIiwiQ29sbGlzaW9uVHJpZ2dlci5qcyIsIkFyZWFUcmlnZ2VyLmpzIiwibWF0Y2hMb2dvLmpzIiwibG9hZGluZy5qcyIsIkxvY2F0aW9uLmpzIiwiRGlyZWN0aW9uLmpzIiwiQXJlYVRvU3RheUluLmpzIiwiQ29sbGlzaW9uR3JvdXAuanMiLCJhY2NlbGVyYXRlLmpzIiwiYm91bmNlLmpzIiwiY29sbGlkZS5qcyIsImRlY2VsZXJhdGUuanMiLCJmaXhWaWV3c1RvRW50aXR5LmpzIiwiZm9sbG93Q2FtZXJhLmpzIiwibW9uaXRvckxvY2F0aW9uQW5kUm90YXRpb24uanMiLCJyb3RhdGVWaWV3cy5qcyIsInN0YXlJbkFyZWEuanMiLCJzdGlja1RvQ2FudmFzLmpzIiwidHJhbnNsYXRlVmlld3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOW9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3gwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RpQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUNBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1hdGNoQnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKCkge1xuXHRcblx0ZnVuY3Rpb24gQ2xhc3MoKSB7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBwYXJlbnQgcHJvdG90eXBlIG1ldGhvZHMgdG8gdGhlIGNoaWxkcyBwcm90b3R5cGVcblx0ICogQG1ldGhvZCBlYWNoXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjZW5kYW50IG9iamVjdCB0byBwdXQgdGhlIG1ldGhvZHMgZnJvbSB0aGUgcGFyZW50cyBwcm90b3R5cGVcblx0ICogQHBhcmFtIHtPYmplY3R9IHBhcmVudCB3aGVyZSB0byB0YWtlIHRoZSBtZXRob2RzIHRvIHB1dCBpbiBkZXNjZW5kYW50XG5cdCAqL1xuXHRDbGFzcy5leHRlbmQgPSBmdW5jdGlvbiggY2hpbGQsIHBhcmVudCApIHtcblxuXHRcdGlmICggIWNoaWxkICkgdGhyb3cgbmV3IEVycm9yKFwiQ2hpbGQgaXMgdW5kZWZpbmVkIGFuZCBjYW5ub3QgYmUgZXh0ZW5kZWRcIik7XG5cdFx0aWYgKCAhcGFyZW50ICkgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IGlzIHVuZGVmaW5lZCwgeW91IGNhbm5vdCBleHRlbmQgY2hpbGQgd2l0aCBhbiB1bmRlZmluZWQgcGFyZW50XCIpO1xuXHRcdGlmICggIXBhcmVudC5uYW1lICkgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IG5hbWUgaXMgdW5kZWZpbmVkLiBQbGVhc2UgYWRkIGEgZmllbGQgbmFtZSB0byB0aGUgcGFyZW50IGNvbnN0cnVjdG9yIHdoZXJlIG5hbWUgaXMgdGhlIG5hbWUgb2YgdGhlIGZ1bmN0aW9uLiBUaGlzIHVzdWFsbHkgY3JlYXRlcyBpc3N1ZXMgaW4gSW50ZXJuZXQgRXhwbG9yZXIuXCIgKyBwYXJlbnQpO1xuXG5cdFx0Y2hpbGQucHJvdG90eXBlW1wiZXh0ZW5kc1wiICsgcGFyZW50Lm5hbWVdID0gcGFyZW50O1xuXG5cdFx0Zm9yICh2YXIgbSBpbiBwYXJlbnQucHJvdG90eXBlKSB7XG5cblx0XHRcdGlmICggIWNoaWxkLnByb3RvdHlwZVttXSApIHtcblx0XHRcdFx0Y2hpbGQucHJvdG90eXBlW21dID0gcGFyZW50LnByb3RvdHlwZVttXTtcblx0XHRcdH0gZWxzZSBpZiAoICFjaGlsZC5wcm90b3R5cGVbcGFyZW50Lm5hbWUgKyBtXSkge1xuXHRcdFx0XHQvL0NhbW1lbCBjYXNlIG1ldGhvZCBuYW1lXG5cdFx0XHRcdGNoaWxkLnByb3RvdHlwZVtwYXJlbnQubmFtZS5zdWJzdHIoMCwgMSkudG9Mb3dlckNhc2UoKSArIHBhcmVudC5uYW1lLnN1YnN0cigxKSArIG0uc3Vic3RyKDAsIDEpLnRvVXBwZXJDYXNlKCkgKyBtLnN1YnN0cigxKV0gPSBwYXJlbnQucHJvdG90eXBlW21dO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH07XG5cblx0d2luZG93LkNsYXNzID0gQ2xhc3M7XG5cbn0pKCk7IiwiKGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcblxuXHRmdW5jdGlvbiBFdmVudEhhbmRsZXIoKSB7XG5cdFx0dGhpcy5fZXZlbnRMaXN0ZW5lcnMgPSB7fTtcdFxuXHR9XG5cblx0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcblx0XHRpZiAoICF0aGlzLl9ldmVudExpc3RlbmVyc1tuYW1lXSApIHtcblx0XHRcdHRoaXMuX2V2ZW50TGlzdGVuZXJzW25hbWVdID0gW107XG5cdFx0fVxuXHRcdHRoaXMuX2V2ZW50TGlzdGVuZXJzW25hbWVdLnB1c2goY2FsbGJhY2spO1xuXHR9O1xuXHRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dmFyIGV2ZW50cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgYXJndW1lbnRzLmxlbmd0aCAtIDEpLFxuXHRcdFx0Y2FsbGJhY2sgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtMSBdO1xuXG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKGV2ZW50c1tpXSwgY2FsbGJhY2spO1xuXHRcdH1cblxuXHR9O1xuXHRFdmVudEhhbmRsZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGV2ZW50cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgYXJndW1lbnRzLmxlbmd0aCAtIDEpLFxuXHRcdFx0Y2FsbGJhY2sgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtMSBdO1xuXG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50c1tpXSwgY2FsbGJhY2spO1xuXHRcdH1cblxuXHR9O1xuXHRFdmVudEhhbmRsZXIucHJvdG90eXBlLnJhaXNlID0gZnVuY3Rpb24obmFtZSwgZGF0YSkge1xuXHRcdHZhciBldmVudExpc3RlbmVycyA9IHRoaXMuX2V2ZW50TGlzdGVuZXJzW25hbWVdO1xuXHRcdGlmICggZXZlbnRMaXN0ZW5lcnMgKSB7XG5cdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSBldmVudExpc3RlbmVycy5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHRcdGV2ZW50TGlzdGVuZXJzW2ldKGRhdGEpO1xuXHRcdFx0XHQvLyBldmVudExpc3RlbmVyc1tpXS5jYWxsKHRoaXMsIGRhdGEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5yYWlzZUV2ZW50ID0gRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5yYWlzZTtcblx0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcblx0XHRpZiAoIHRoaXMuX2V2ZW50TGlzdGVuZXJzW25hbWVdICkge1xuXHRcdFx0dmFyIGV2ZW50TGlzdGVuZXJzID0gdGhpcy5fZXZlbnRMaXN0ZW5lcnNbbmFtZV07XG5cdFx0XHRldmVudExpc3RlbmVycy5zcGxpY2UoZXZlbnRMaXN0ZW5lcnMuaW5kZXhPZihjYWxsYmFjayksIDEpO1xuXHRcdH1cblx0fTtcblx0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0dGhpcy5fZXZlbnRMaXN0ZW5lcnMgPSB7fTtcblx0fTtcblx0RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5saXN0ZW5zVG8gPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2V2ZW50TGlzdGVuZXJzW25hbWVdO1xuXHR9O1xuXG5cdEV2ZW50SGFuZGxlci5uYW1lID0gXCJFdmVudEhhbmRsZXJcIjtcblxuXHRuYW1lc3BhY2UuRXZlbnRIYW5kbGVyID0gRXZlbnRIYW5kbGVyO1xuXG59KSh3aW5kb3cpOyIsIi8qKlxuICogQG1vZHVsZSBNYXRjaFxuICovXG4oZnVuY3Rpb24obmFtZXNwYWNlKSB7XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIGFuIGVhc3kgc29sdXRpb24gdG8gZXZlbnQgaGFuZGxpbmdcblx0ICogXG5cdCAqIEBjbGFzcyBFdmVudExpc3RlbmVyXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAZXhhbXBsZSBcblx0IFxuXHRcdFx0ZnVuY3Rpb24gb25DbGlja0xpc3RlbmVyKHNlbmRlcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIkNsaWNrZWQgb246IFwiICsgc2VuZGVyKTtcblx0XHRcdH1cblx0IFxuXHRcdFx0dmFyIG9uQ2xpY2sgPSBuZXcgTS5FdmVudExpc3RlbmVyKCk7XG5cdFx0XHRcblx0XHRcdG9uQ2xpY2suYWRkRXZlbnRMaXN0ZW5lcihvbkNsaWNrTGlzdGVuZXIpO1xuXHRcdFx0XG5cdFx0XHRvbkNsaWNrLnJhaXNlKHRoaXMpO1xuXHRcdFx0XG5cdFx0XHRvbkNsaWNrLnJlbW92ZUV2ZW50TGlzdGVuZXIob25DbGlja0xpc3RlbmVyKTtcblxuXHQgKiBAZXhhbXBsZSBcblxuXHRcdFx0dmFyIG9iaiA9IHsgbmFtZTogXCJOaW5qYVwiIH07XG5cblx0XHRcdGZ1bmN0aW9uIG9uQ2xpY2tMaXN0ZW5lcigpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJDbGlja2VkIG9uOiBcIiArIHRoaXMubmFtZSk7IC8vV2lsbCBwcmludCBOaW5qYVxuXHRcdFx0fVxuXHQgXG5cdFx0XHR2YXIgb25DbGljayA9IG5ldyBNLkV2ZW50TGlzdGVuZXIoKTtcblx0XHRcdFxuXHRcdFx0b25DbGljay5hZGRFdmVudExpc3RlbmVyKG9uQ2xpY2tMaXN0ZW5lciwgb2JqKTsgLy9CaW5kIGV4ZWN1dGlvbiBjb250ZXh0IHRvIG9ialxuXHRcdFx0XG5cdFx0XHRvbkNsaWNrLnJhaXNlKCk7XG5cdFx0XHRcblx0XHRcdG9uQ2xpY2sucmVtb3ZlRXZlbnRMaXN0ZW5lcihvbkNsaWNrTGlzdGVuZXIpO1xuXHQgKi9cblx0ZnVuY3Rpb24gRXZlbnRMaXN0ZW5lcigpIHtcblx0XHR0aGlzLmxpc3RlbmVycyA9IG5ldyBBcnJheSgpO1xuXHR9XG5cdC8qKlxuXHQgKiBAbWV0aG9kIGFkZEV2ZW50TGlzdGVuZXJcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvd25lciBbb3B0aW9uYWxdIG9iamVjdCB0byBiaW5kIHRoZSBsaXN0ZW5lciB0b1xuXHQgKi9cblx0RXZlbnRMaXN0ZW5lci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGxpc3RlbmVyLCBvd25lcikge1xuXHRcdGlmICggb3duZXIgKSB7XG5cdFx0XHR0aGlzLmxpc3RlbmVycy5wdXNoKG5ldyBPYmplY3RMaXN0ZW5lcihsaXN0ZW5lciwgb3duZXIpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5saXN0ZW5lcnMucHVzaChuZXcgRnVuY3Rpb25MaXN0ZW5lcihsaXN0ZW5lcikpO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIEBtZXRob2QgcmFpc2Vcblx0ICovXG5cdEV2ZW50TGlzdGVuZXIucHJvdG90eXBlLnJhaXNlID0gZnVuY3Rpb24oKSB7XG5cdFxuXHRcdHZhciBpID0gMCxcblx0XHRcdGwgPSB0aGlzLmxpc3RlbmVycy5sZW5ndGg7XG5cdFx0XG5cdFx0aWYgKCBsID09IDAgKSByZXR1cm47XG5cdFx0XG5cdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0dGhpcy5saXN0ZW5lcnNbaV0ucnVuKGFyZ3VtZW50cyk7XG5cdFx0fVxuXHRcdFxuXHR9O1xuXHQvKipcblx0ICogQG1ldGhvZCByZW1vdmVFdmVudExpc3RlbmVyXG5cdCAqL1xuXHRFdmVudExpc3RlbmVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24obGlzdGVuZXIsIG93bmVyKSB7XG5cdFx0XG5cdFx0dmFyIGkgPSAwLFxuXHRcdFx0bCA9IHRoaXMubGlzdGVuZXJzLmxlbmd0aCxcblx0XHRcdGN1cnJlbnRMaXN0ZW5lcjtcblxuXHRcdGZvciAoIDsgaSA8IGw7IGkrKyApIHtcblxuXHRcdFx0Y3VycmVudExpc3RlbmVyID0gdGhpcy5saXN0ZW5lcnNbaV07XG5cblx0XHRcdGlmICggY3VycmVudExpc3RlbmVyLmNhbGxiYWNrID09IGxpc3RlbmVyIHx8IChjdXJyZW50TGlzdGVuZXIuY2FsbGJhY2tOYW1lID09IGxpc3RlbmVyICYmIG93bmVyID09IGN1cnJlbnRMaXN0ZW5lci5vYmplY3QgKSApIHtcblxuXHRcdFx0XHR0aGlzLmxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdHJldHVybjtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH07XG5cdC8qKlxuXHQgKiBAbWV0aG9kIHJlbW92ZUFsbEV2ZW50TGlzdGVuZXJzXG5cdCAqXG5cdCAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBjb250YWluaW5nIHRoZSBldmVudCBsaXN0ZW5lcnMgdGhhdCBhcmUgcmVtb3ZlZFxuXHQgKi9cblx0RXZlbnRMaXN0ZW5lci5wcm90b3R5cGUucmVtb3ZlQWxsRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmxpc3RlbmVycyA9IG5ldyBBcnJheSgpO1xuXHRcdHJldHVybiBsaXN0ZW5lcnM7XG5cdH07XG5cblx0RXZlbnRMaXN0ZW5lci5uYW1lID0gXCJFdmVudExpc3RlbmVyXCI7XG5cblx0bmFtZXNwYWNlLkV2ZW50TGlzdGVuZXIgPSBFdmVudExpc3RlbmVyO1xuXG5cdC8qKlxuXHQgKiBXcmFwcyBhIGZ1bmN0aW9uIHRvIHVzZSBpdCBhcyBhIGxpc3RlbmVyXG5cdCAqIFxuXHQgKiBAY2xhc3MgRnVuY3Rpb25MaXN0ZW5lclxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlXG5cdCAqL1xuXHRmdW5jdGlvbiBGdW5jdGlvbkxpc3RlbmVyKGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHR9XG5cdC8qKlxuXHQgKiBJbnZva2VzIGNhbGxiYWNrIGZ1bmN0aW9uXG5cdCAqIEBtZXRob2QgcnVuXG5cdCAqL1xuXHRGdW5jdGlvbkxpc3RlbmVyLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbihhcmdzKSB7XG5cdFx0dGhpcy5jYWxsYmFjayhhcmdzWzBdKTtcblx0fTtcblxuXHQvKipcblx0ICogV3JhcHMgYW4gb2JqZWN0IGFuZCB0aGUgY2FsbGJhY2sgbmFtZVxuXHQgKiBcblx0ICogQGNsYXNzIE9iamVjdExpc3RlbmVyXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY2FsbGJhY2tOYW1lIG5hbWUgb2YgdGhlIGZ1bmN0aW9uIHRvIGNhbGxcblx0ICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBvYmplY3QgaW4gd2hpY2ggdG8gaW52b2tlIHRoZSBjYWxsYmFja1xuXHQgKi9cblx0ZnVuY3Rpb24gT2JqZWN0TGlzdGVuZXIoY2FsbGJhY2tOYW1lLCBvYmplY3QpIHtcblx0XHR0aGlzLmNhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTmFtZTtcblx0XHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblx0fVxuXHQvKipcblx0ICogSW52b2tlcyBjYWxsYmFjayBmdW5jdGlvbiBvbiBvYmplY3Rcblx0ICogQG1ldGhvZCBydW5cblx0ICovXG5cdE9iamVjdExpc3RlbmVyLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbihhcmdzKSB7XG5cdFx0dGhpcy5vYmplY3RbdGhpcy5jYWxsYmFja05hbWVdKGFyZ3NbMF0pO1xuXHR9O1xuXG59KSh3aW5kb3cpOyIsIihmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cblx0Ly8gdmFyIFNUUklQX0NPTU1FTlRTID0gLygoXFwvXFwvLiokKXwoXFwvXFwqW1xcc1xcU10qP1xcKlxcLykpL21nO1xuXHQvLyB2YXIgQVJHVU1FTlRfTkFNRVMgPSAvKFteXFxzLF0rKS9nO1xuXG5cdC8vIGZ1bmN0aW9uIGdldFBhcmFtTmFtZXMoZnVuYykge1xuXG5cdC8vIFx0dmFyIGZuU3RyID0gZnVuYy50b1N0cmluZygpLnJlcGxhY2UoU1RSSVBfQ09NTUVOVFMsICcnKSxcblx0Ly8gXHRcdHJlc3VsdCA9IGZuU3RyLnNsaWNlKGZuU3RyLmluZGV4T2YoJygnKSsxLCBmblN0ci5pbmRleE9mKCcpJykpLk1vZHVsZU1hbmFnZXIoQVJHVU1FTlRfTkFNRVMpO1xuXHRcdFxuXHQvLyBcdGlmKHJlc3VsdCA9PSBudWxsKSB7XG5cdC8vIFx0XHRyZXN1bHQgPSBbXTtcblx0Ly8gXHR9XG5cblx0Ly8gXHRyZXR1cm4gcmVzdWx0XG5cblx0Ly8gfVxuXG5cdGZ1bmN0aW9uIE1vZHVsZU1hbmFnZXIoKSB7XG5cdFx0dGhpcy5tb2R1bGVzID0ge307XG5cdH1cblxuXHQvKipcblx0ICogRGVmaW5lcyBhIG5ldyBtb2R1bGUgd2hlcmUgdGhlIGZpcnN0IHBhcmFtZXRlciBpcyB0aGUgbmFtZSwgbGFzdCBwYXJhbWV0ZXIgaXMgdGhlIGNvbnN0cnVjdG9yXG5cdCAqIGFuZCBwYXJhbWV0ZXJzIGluIHRoZSBtaWRkbGUgYXJlIGRlcGVuZGVuY2llc1xuXHQgKi9cblx0TW9kdWxlTWFuYWdlci5wcm90b3R5cGUuZGVmaW5lTW9kdWxlID0gZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbW9kdWxlID0ge1xuXHRcdFx0XCJyZXF1aXJlc1wiOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEsIGFyZ3VtZW50cy5sZW5ndGggLSAxKSxcblx0XHRcdFwibmFtZVwiOiBhcmd1bWVudHNbMF0sXG5cdFx0XHRcImNvbnN0cnVjdG9yXCI6IGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV1cblx0XHR9O1xuXG5cdFx0Ly8gaWYgKCBtb2R1bGUucmVxdWlyZXMubGVuZ3RoID09IDAgKSB7XG5cdFx0Ly8gXHRtb2R1bGUucmVxdWlyZXMgPSBnZXRQYXJhbU5hbWVzKG1vZHVsZS5jb25zdHJ1Y3Rvcik7XG5cdFx0Ly8gfVxuXG5cdFx0dGhpcy5tb2R1bGVzW21vZHVsZS5uYW1lXSA9IG1vZHVsZTtcblxuXHR9O1xuXHQvKipcblx0ICogR2V0cyBhIG1vZHVsZSBwcm92aWRlZCB0aGUgcmVxdWlyZWQgbW9kdWxlcyBoYXZlIGJlZW4gZGVmaW5lZFxuXHQgKi9cblx0TW9kdWxlTWFuYWdlci5wcm90b3R5cGUuZ2V0TW9kdWxlID0gZnVuY3Rpb24obmFtZSkge1xuXG5cdFx0dmFyIG1vZHVsZSA9IHRoaXMubW9kdWxlc1tuYW1lXSxcblx0XHRcdHJlcXVpcmVkTW9kdWxlcyA9IFtdLFxuXHRcdFx0Y2FuQmVMb2FkZWQgPSB0cnVlO1xuXG5cdFx0aWYgKCBtb2R1bGUgKSB7XG5cblx0XHRcdGZvciAoIHZhciBpID0gMDsgaSA8IG1vZHVsZS5yZXF1aXJlcy5sZW5ndGg7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0XHR2YXIgcmVxdWlyZWRNb2R1bGUgPSB0aGlzLm1vZHVsZXNbbW9kdWxlLnJlcXVpcmVzW2ldXTtcblx0XHRcdFxuXHRcdFx0XHRpZiAoIHJlcXVpcmVkTW9kdWxlICkge1xuXG5cdFx0XHRcdFx0aWYgKCAhcmVxdWlyZWRNb2R1bGUuY2FjaGUgKSB7XG5cdFx0XHRcdFx0XHRyZXF1aXJlZE1vZHVsZS5jYWNoZSA9IHRoaXMuZ2V0TW9kdWxlKHJlcXVpcmVkTW9kdWxlLm5hbWUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJlcXVpcmVkTW9kdWxlcy5wdXNoKHJlcXVpcmVkTW9kdWxlLmNhY2hlKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNhbkJlTG9hZGVkID0gZmFsc2U7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGNhbkJlTG9hZGVkICkge1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmNvbnN0cnVjdG9yLmFwcGx5KG1vZHVsZS5jb25zdHJ1Y3RvciwgcmVxdWlyZWRNb2R1bGVzKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiB7fTtcblxuXHR9O1xuXHQvKipcblx0ICogU2hvcnQtaGFuZCB0byBnZXRNb2R1bGUgYW5kIGRlZmluZU1vZHVsZVxuXHQgKiBDYWxscyBnZXRNb2R1bGUgaWYgYXJndW1lbnQgbGVuZ3RoIGVxdWFscyAxIG90aGVyd2lzZSBjYWxscyBkZWZpbmVNb2R1bGVcblx0ICovXG5cdE1vZHVsZU1hbmFnZXIucHJvdG90eXBlLm1vZHVsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAxICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0TW9kdWxlKGFyZ3VtZW50c1swXSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuZGVmaW5lTW9kdWxlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH07XG5cblx0bmFtZXNwYWNlLk1vZHVsZU1hbmFnZXIgPSBNb2R1bGVNYW5hZ2VyO1xuXG59KHdpbmRvdykpOyIsIihmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cblx0LyoqXG5cdCAqIFNpbXBsZSBpbXBsZW1lbnRhdGlvbiBvZiBhIG1hcCB0aGF0IGNvbnNpc3RzIG9mIHR3byBhcnJheXMsIG9uZSBpcyB1c2VkIGFzIGFuXG5cdCAqIGluZGV4IG9mIGtleXMgYW5kIHRoZSBvdGhlciBpcyB1c2VkIHRvIHN0b3JlIHRoZSBpdGVtcy5cblx0ICogVGhpcyB3YXkgd2UgdGFrZSBhZHZhbnRhZ2Ugb2YgamF2YXNjcmlwdCBuYXRpdmUgb2JqZWN0IGtleS12YWx1ZVxuXHQgKiBhbmQgdGhlIHNwZWVkIG9mIGl0ZXJhdGluZyBhIHNpbXBsZSBhcnJheS5cblx0ICpcblx0ICogWW91IGNhbiB1c2UgdGhlIGJ1aWxkLWluIG1ldGhvZCBlYWNoVmFsdWUgdG8gcXVpY2tseSBpdGVyYXRlIHRocm91Z2ggYWxsIHZhbHVlc1xuXHQgKiBvZiB0aGUgbWFwIG9yIGp1c3QgdXNlIGEgdHJhZGl0aW9uYWwgZm9yLWxvb3Agb24gYXR0cmlidXRlIF92YWx1ZXMuIFBsZWFzZSBkbyBub3Rcblx0ICogbW9kaWZ5IF92YWx1ZXMgYXJyYXksIHVzZSB0aGUgbWFwIG1ldGhvZHMgdG8gZG8gaXQuXG5cdCAqXG5cdCAqIEBjbGFzcyBTaW1wbGVNYXBcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRmdW5jdGlvbiBTaW1wbGVNYXAoKSB7XG5cdFx0dGhpcy5fa2V5cyA9IHt9O1xuXHRcdHRoaXMuX3ZhbHVlcyA9IFtdO1xuXHRcdHRoaXMubGVuZ3RoID0gMDtcblx0fVxuXHQvKipcblx0ICogUHVzaGVzIGFuIGl0ZW0gaW50byB0aGUgbWFwXG5cdCAqIEBtZXRob2QgcHVzaFxuXHQgKiBAcGFyYW0ge09iamVjdH0ga2V5IG9iamVjdCByZXByZXNlbnRpbmcgdW5pcXVlIGlkXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSB2YWx1ZSB0byBhZGRcblx0ICovXG5cdFNpbXBsZU1hcC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuXG5cdFx0dmFyIGV4aXN0aW5nSW5kZXggPSB0aGlzLl9rZXlzW2tleV07XG5cblx0XHRpZiAoIGV4aXN0aW5nSW5kZXggKSB7XG5cdFx0XHR0aGlzLl92YWx1ZXNbZXhpc3RpbmdJbmRleF0gPSB2YWx1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHZhbHVlSW5kZXggPSB0aGlzLl92YWx1ZXMucHVzaCh2YWx1ZSkgLSAxO1xuXHRcdFx0dGhpcy5fa2V5c1trZXldID0gdmFsdWVJbmRleDtcblx0XHRcdHRoaXMubGVuZ3RoKys7XG5cdFx0fVxuICAgIFxuICAgIHJldHVybiB2YWx1ZTtcblxuXHR9O1xuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgaXRlbXNcblx0ICogQG1ldGhvZCBjbGVhclxuXHQgKi9cblx0U2ltcGxlTWFwLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX2tleXMgPSB7fTtcblx0XHR0aGlzLl92YWx1ZXMgPSBbXTtcblx0XHR0aGlzLmxlbmd0aCA9IDA7XG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBpdGVtIHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4ga2V5XG5cdCAqIEBtZXRob2QgZ2V0XG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBrZXkgb2JqZWN0IHJlcHJlc2VudGluZyB1bmlxdWUgaWRcblx0ICogQHJldHVybiB7T2JqZWN0fVxuXHQgKi9cblx0U2ltcGxlTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihrZXkpIHtcblx0XHRyZXR1cm4gdGhpcy5fdmFsdWVzW3RoaXMuX2tleXNba2V5XV07XG5cdH07XG5cdC8qKlxuXHQgKiBSZW1vdmVzIHRoZSBpdGVtIGJ5IHRoZSBnaXZlbiBrZXlcblx0ICogQG1ldGhvZCByZW1vdmVcblx0ICogQHBhcmFtIHtPYmplY3R9IGtleSBvYmplY3QgcmVwcmVzZW50aW5nIHVuaXF1ZSBpZFxuXHQgKi9cblx0U2ltcGxlTWFwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihrZXkpIHtcblx0XHRcblx0XHR2YXIgaW5kZXggPSB0aGlzLl9rZXlzW2tleV07XG5cdFx0XG5cdFx0aWYgKCBpbmRleCA9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5fdmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XG5cdFx0ZGVsZXRlIHRoaXMuX2tleXNba2V5XTtcblx0XHRcblx0XHR0aGlzLmxlbmd0aC0tO1xuXHRcdFxuXHRcdGZvciAoIHZhciBpIGluIHRoaXMuX2tleXMgKSB7XG5cdFx0XHRpZiAoIHRoaXMuX2tleXNbaV0gPiBpbmRleCApIHtcblx0XHRcdFx0dGhpcy5fa2V5c1tpXS0tO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0fTtcblx0LyoqXG5cdCAqIEl0ZXJhdGVzIHRocm91Z2ggYWxsIHZhbHVlcyBhbmQgaW52b2tlcyBhIGNhbGxiYWNrXG5cdCAqIEBtZXRob2QgZWFjaFZhbHVlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG5cdCAqL1xuXHRTaW1wbGVNYXAucHJvdG90eXBlLmVhY2hWYWx1ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0dmFyIGkgPSAwLFxuXHRcdFx0bCA9IHRoaXMuX3ZhbHVlcy5sZW5ndGgsXG5cdFx0XHR2ID0gdGhpcy5fdmFsdWVzO1xuXHRcdGZvciAoIDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdGNhbGxiYWNrKHZbaV0pO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIEl0ZXJhdGVzIHRocm91Z2ggYWxsIGtleXMgYW5kIGludm9rZXMgYSBjYWxsYmFja1xuXHQgKiBAbWV0aG9kIGVhY2hLZXlcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcblx0ICovXG5cdFNpbXBsZU1hcC5wcm90b3R5cGUuZWFjaEtleSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0Zm9yICggdmFyIGtleSBpbiB0aGlzLl9rZXlzICkge1xuXHRcdFx0Y2FsbGJhY2soa2V5KTtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBJdGVyYXRlcyB0aHJvdWdoIGFsbCB2YWx1ZXMgYW5kIGludm9rZXMgYSBjYWxsYmFjayBwYXNzaW5nIGtleSBhbmQgdmFsdWUgYXMgYXJndW1lbnRzIHJlc3BlY3RpdmVseVxuXHQgKiBAbWV0aG9kIGVhY2hcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcblx0ICovXG5cdFNpbXBsZU1hcC5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0Zm9yICggdmFyIGtleSBpbiB0aGlzLl9rZXlzICkge1xuXHRcdFx0Y2FsbGJhY2soa2V5LCB0aGlzLmdldChrZXkpKTtcblx0XHR9XG5cdH07XG5cblx0U2ltcGxlTWFwLm5hbWUgPSBcIlNpbXBsZU1hcFwiO1xuXG5cdG5hbWVzcGFjZS5TaW1wbGVNYXAgPSBTaW1wbGVNYXA7XG5cbn0pKHdpbmRvdyk7IiwiKGZ1bmN0aW9uIChuYW1lc3BhY2UsIFNpbXBsZU1hcCwgRXZlbnRMaXN0ZW5lcikge1xuXHRcblx0ZnVuY3Rpb24gRXZlbnRTaW1wbGVNYXAoKSB7XG5cdFx0dGhpcy5leHRlbmRzU2ltcGxlTWFwKCk7XG5cdFx0dGhpcy5vblNldCA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG5cdFx0dGhpcy5vblJlbW92ZWQgPSBuZXcgRXZlbnRMaXN0ZW5lcigpO1xuXHR9XG5cdFxuXHRFdmVudFNpbXBsZU1hcC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuXHRcdHRoaXMuc2ltcGxlTWFwU2V0KGtleSwgdmFsdWUpO1xuXHRcdHRoaXMub25TZXQucmFpc2Uoa2V5KTtcblx0fTtcblx0RXZlbnRTaW1wbGVNYXAucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge1xuXHRcdHRoaXMuc2ltcGxlTWFwUmVtb3ZlKGtleSk7XG5cdFx0dGhpcy5vblJlbW92ZWQucmFpc2Uoa2V5KTtcblx0fTtcblx0XG5cdENsYXNzLmV4dGVuZChFdmVudFNpbXBsZU1hcCwgU2ltcGxlTWFwKTtcblx0XG5cdG5hbWVzcGFjZS5FdmVudFNpbXBsZU1hcCA9IEV2ZW50U2ltcGxlTWFwO1xuXHRcbn0pKHdpbmRvdywgU2ltcGxlTWFwLCBFdmVudExpc3RlbmVyKTsiLCIoZnVuY3Rpb24gKG5hbWVzcGFjZSkge1xuXG5cdGZ1bmN0aW9uIERlZmF1bHRMb2dnZXIoKSB7XG5cdH1cblx0XG5cdERlZmF1bHRMb2dnZXIucHJvdG90eXBlLmpvaW5BcmdzID0gZnVuY3Rpb24oYXJncykge1xuXHRcdHZhciB2YWx1ZXMgPSBbXTtcblx0XHRmb3IgKCB2YXIgaSBpbiBhcmdzICkge1xuXHRcdFx0dmFsdWVzLnB1c2goYXJnc1tpXSk7XG5cdFx0fVxuXHRcdHJldHVybiB2YWx1ZXMuam9pbihcIiBcIik7XG5cdH07XG5cblx0aWYgKCB3aW5kb3cuY29uc29sZSApIHtcblxuXHRcdGlmICggd2luZG93LmNvbnNvbGUubG9nICkge1xuXHRcdFx0RGVmYXVsdExvZ2dlci5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR3aW5kb3cuY29uc29sZS5sb2codGhpcy5qb2luQXJncyhhcmd1bWVudHMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0RGVmYXVsdExvZ2dlci5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdGFsZXJ0KHRoaXMuam9pbkFyZ3MoYXJndW1lbnRzKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICggd2luZG93LmNvbnNvbGUud2FybiApIHtcblx0XHRcdERlZmF1bHRMb2dnZXIucHJvdG90eXBlLndhcm4gPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0d2luZG93LmNvbnNvbGUud2Fybih0aGlzLmpvaW5BcmdzKGFyZ3VtZW50cykpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHREZWZhdWx0TG9nZ2VyLnByb3RvdHlwZS53YXJuID0gRGVmYXVsdExvZ2dlci5wcm90b3R5cGUubG9nO1xuXHRcdH1cblx0XHRpZiAoIHdpbmRvdy5jb25zb2xlLmVycm9yICkge1xuXHRcdFx0RGVmYXVsdExvZ2dlci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0d2luZG93LmNvbnNvbGUuZXJyb3IodGhpcy5qb2luQXJncyhhcmd1bWVudHMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0RGVmYXVsdExvZ2dlci5wcm90b3R5cGUuZXJyb3IgPSBEZWZhdWx0TG9nZ2VyLnByb3RvdHlwZS5sb2c7XG5cdFx0fVxuXG5cdH0gZWxzZSB7XG5cdFx0XG5cdFx0RGVmYXVsdExvZ2dlci5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdGFsZXJ0KHRoaXMuam9pbkFyZ3MoYXJndW1lbnRzKSk7XG5cdFx0fVxuXHRcdERlZmF1bHRMb2dnZXIucHJvdG90eXBlLmRlYnVnID0gRGVmYXVsdExvZ2dlci5wcm90b3R5cGUubG9nO1xuXHRcdERlZmF1bHRMb2dnZXIucHJvdG90eXBlLndhcm4gPSBEZWZhdWx0TG9nZ2VyLnByb3RvdHlwZS5sb2c7XG5cdFx0RGVmYXVsdExvZ2dlci5wcm90b3R5cGUuZXJyb3IgPSBEZWZhdWx0TG9nZ2VyLnByb3RvdHlwZS5sb2c7XG5cblx0fVxuXHRcblx0bmFtZXNwYWNlLkRlZmF1bHRMb2dnZXIgPSBEZWZhdWx0TG9nZ2VyO1xuXG59KSh3aW5kb3cpOyIsIi8qXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEgUGFibG8gTGFnaW9pYSwgUHV6emxpbmcgSWRlYXNcbiAqXG4gKiBNYXRjaCBHYW1lIEVuZ2luZSB2MS41XG4gKiBodHRwOi8vcHV6emxpbmdpZGVhcy5jb20vXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICogXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKiBcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICpcbiAqL1xudmFyIE0gPSB3aW5kb3cuTSB8fCB7fSxcblx0Z2FtZSA9IHdpbmRvdy5nYW1lIHx8IHt9O1xuXG4vKipcbiAqIEBtb2R1bGUgd2luZG93XG4gKi9cbihmdW5jdGlvbihuYW1lc3BhY2UpIHtcblxuXHRpZiAoIG5hbWVzcGFjZS5NYXRjaCApIHJldHVybjtcblxuXHQvKipcblx0ICogUHJvdmlkZXMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgYnJvd3NlclxuXHQgKiBAY2xhc3MgQnJvd3NlclxuXHQgKiBAcmVhZE9ubHlcblx0ICovXG5cdGZ1bmN0aW9uIEJyb3dzZXIoKSB7XG5cblx0XHR2YXIgYnJvd3NlcnMgPSBbXCJGaXJlZm94XCIsIFwiQ2hyb21lXCIsIFwiT3BlcmFcIiwgXCJTYWZhcmlcIiwgXCJNU0lFIDkuMFwiLCBcIkJsYWNrQmVycnlcIl0sXG5cdFx0aSxcblx0XHRicm93c2VyTmFtZTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBuYW1lIG9mIHRoZSBjdXJyZW50IGJyb3dzZXJcblx0XHQgKiBAcHJvcGVydHkgbmFtZVxuXHRcdCAqIEByZWFkT25seVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdFwiRmlyZWZveFwiXG5cdFx0ICovXG5cdFx0dGhpcy5uYW1lID0gdW5kZWZpbmVkO1xuXG5cdFx0Zm9yICggaSBpbiBicm93c2VycyApIHtcblx0XHRcdGJyb3dzZXJOYW1lID0gYnJvd3NlcnNbaV07XG5cdFx0XHR0aGlzW1wiaXNcIiArIGJyb3dzZXJOYW1lXSA9ICggbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKGJyb3dzZXJOYW1lKSAhPSAtMSApO1xuXHRcdFx0aWYgKCAhdGhpcy5uYW1lICYmIHRoaXNbXCJpc1wiICsgYnJvd3Nlck5hbWVdICkge1xuXHRcdFx0XHR0aGlzLm5hbWUgPSBicm93c2VyTmFtZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUaGUgZXh0ZW5zaW9uIG9mIHRoZSBhdWRpbyBmb3JtYXQgc3VwcG9ydGVkIGJ5IHRoZSBjdXJyZW50IGJyb3dzZXJcblx0XHQgKiBAcHJvcGVydHkgc3VwcG9ydGVkQXVkaW9Gb3JtYXRcblx0XHQgKiBAcmVhZE9ubHlcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHRcIi5tcDNcIlxuXHRcdCAqL1xuXHRcdHRoaXMuc3VwcG9ydGVkQXVkaW9Gb3JtYXQgPSB0aGlzLmdldEJyb3dzZXJQcmVmZXJyZWRBdWRpb0Zvcm1hdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogQm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoZSBjdXJyZW50IGJyb3dzZXIgaXMgc3VwcG9ydGVkIG9yIG5vdFxuXHRcdCAqIEBwcm9wZXJ0eSBzdXBwb3J0ZWRcblx0XHQgKiBAcmVhZE9ubHlcblx0XHQgKiBAdHlwZSBCb29sZWFuXG5cdFx0ICovXG5cdFx0dGhpcy5zdXBwb3J0ZWQgPSB0aGlzLm5hbWUgIT0gdW5kZWZpbmVkO1xuXG5cdH07XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGF1ZGlvIGV4dGVuc2lvbiBzdXBwb3J0ZWQgYnkgdGhlIGN1cnJlbnQgYnJvd3Nlci5cblx0ICogQG1ldGhvZCBnZXRCcm93c2VyUHJlZmVycmVkQXVkaW9Gb3JtYXRcblx0ICogQHByaXZhdGVcblx0ICogQHJldHVybiB7U3RyaW5nfSB0aGUgc3VwcG9ydGVkIGV4dGVuc2lvblxuXHQgKi9cblx0QnJvd3Nlci5wcm90b3R5cGUuZ2V0QnJvd3NlclByZWZlcnJlZEF1ZGlvRm9ybWF0ID0gZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhdWRpb1wiKTtcblxuXHRcdGlmICggYS5jYW5QbGF5VHlwZSggXCJhdWRpby9vZ2dcIiApICE9IFwiXCIgKSByZXR1cm4gXCIub2dnXCI7XG5cdFx0aWYgKCBhLmNhblBsYXlUeXBlKCBcImF1ZGlvL21wZWdcIiApICE9IFwiXCIgKSByZXR1cm4gXCIubXAzXCI7XG5cdFx0aWYgKCBhLmNhblBsYXlUeXBlKCBcImF1ZGlvL3dhdlwiICkgIT0gXCJcIiApIHJldHVybiBcIi53YXZcIjtcblx0XHRpZiAoIGEuY2FuUGxheVR5cGUoIFwiYXVkaW8vbXA0XCIgKSAhPSBcIlwiICkgcmV0dXJuIFwiLm1wNFwiO1xuXG5cdFx0dGhpcy5sb2dnZXIud2FybihcIlRoaXMgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGF1ZGlvXCIpO1xuXG5cdH07XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGF1ZGlvIGV4dGVuc2lvbiBzdXBwb3J0ZWQgYnkgdGhlIGN1cnJlbnQgYnJvd3Nlci5cblx0ICogQG1ldGhvZCBnZXRCcm93c2VyQXVkaW9TdXBwb3J0ZWRGb3JtYXRzXG5cdCAqIEBwcml2YXRlXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gdGhlIHN1cHBvcnRlZCBleHRlbnNpb25cblx0ICovXG5cdEJyb3dzZXIucHJvdG90eXBlLmdldEJyb3dzZXJBdWRpb1N1cHBvcnRlZEZvcm1hdHMgPSBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImF1ZGlvXCIpLFxuXHRcdFx0ZiA9IG5ldyBBcnJheSgpO1xuXG5cdFx0aWYgKCBhLmNhblBsYXlUeXBlKCBcImF1ZGlvL29nZ1wiICkgIT0gXCJcIiApIGYucHVzaChcIi5vZ2dcIik7XG5cdFx0aWYgKCBhLmNhblBsYXlUeXBlKCBcImF1ZGlvL21wZWdcIiApICE9IFwiXCIgKSBmLnB1c2goXCIubXAzXCIpO1xuXHRcdGlmICggYS5jYW5QbGF5VHlwZSggXCJhdWRpby93YXZcIiApICE9IFwiXCIgKSBmLnB1c2goXCIud2F2XCIpO1xuXHRcdGlmICggYS5jYW5QbGF5VHlwZSggXCJhdWRpby9tcDRcIiApICE9IFwiXCIgKSBmLnB1c2goXCIubXA0XCIpO1xuXG5cdFx0cmV0dXJuIGYuam9pbihcInxcIik7XG5cblx0fTtcblxuXHQvKipcblx0ICogQ29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgZGV2aWNlXG5cdCAqIEBjbGFzcyBEZXZpY2Vcblx0ICogQHJlYWRPbmx5XG5cdCAqL1xuXHRmdW5jdGlvbiBEZXZpY2UoKSB7XG5cdFxuXHRcdHZhciBkZXZpY2VzID0gW1wiQW5kcm9pZFwiLCBcIkJsYWNrQmVycnlcIiwgXCJpUGhvbmVcIiwgXCJpUGFkXCIsIFwiaVBvZFwiLCBcIklFTW9iaWxlXCJdLFxuXHRcdFx0aTtcblx0XHRcblx0XHQvKipcblx0XHQgKiBUaGUgbmFtZSBvZiB0aGUgY3VycmVudCBkZXZpY2Vcblx0XHQgKiBAcHJvcGVydHkgbmFtZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdFwiUENcIlxuXHRcdCogQGV4YW1wbGVcblx0XHRcdFx0XCJBbmRyb2lkXCJcblx0XHQgKi9cblx0XHRcblx0XHQvKipcblx0XHQgKiBCb29sZWFuIHRoYXQgZGV0ZXJtaW5lcyBpZiB0aGUgY3VycmVudCBkZXZpY2UgaXMgbW9iaWxlXG5cdFx0ICogQHByb3BlcnR5IGlzTW9iaWxlXG5cdFx0ICogQHR5cGUgQm9vbGVhblxuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdGZhbHNlXG5cdFx0ICovXG5cblx0XHRmb3IgKCBpIGluIGRldmljZXMgKSB7XG5cdFx0XHRkZXZpY2VOYW1lID0gZGV2aWNlc1tpXTtcblx0XHRcdHRoaXNbXCJpc1wiICsgZGV2aWNlTmFtZV0gPSAoIG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZiggZGV2aWNlTmFtZSApICE9IC0xICk7XG5cdFx0XHRpZiAoICF0aGlzLm5hbWUgJiYgdGhpc1tcImlzXCIgKyBkZXZpY2VOYW1lXSApIHtcblx0XHRcdFx0dGhpcy5uYW1lID0gZGV2aWNlTmFtZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0aWYgKCB0aGlzLm5hbWUgKSB7XG5cdFx0XHR0aGlzLmlzTW9iaWxlID0gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pc01vYmlsZSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5uYW1lID0gXCJQQ1wiO1xuXHRcdH1cblx0XG5cdH1cblxuXHQvKipcblx0ICogTWF0Y2ggR2FtZSBFbmdpbmUuXG5cdCAqIFdoZW4gRE9NQ29udGVudExvYWRlZCBldmVudCBpcyBleGVjdXRlZCB0aGUgZ2FtZSBsb29wIHN0YXJ0cy4gXG5cdCAqIElmIHdpbmRvdyBoYXMgYSBmdW5jdGlvbiBjYWxsZWQgbWFpbiwgdGhhdCBmdW5jdGlvbiBnZXRzIGV4ZWN1dGVkIG9uY2UgYWZ0ZXIgTWF0Y2ggaGFzIGZpbmlzaGVkIGxvYWRpbmdcblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBjbGFzcyBNYXRjaFxuXHQgKiBAc3RhdGljXG5cdCAqXG5cdCAqL1xuXHRmdW5jdGlvbiBNYXRjaCgpIHtcblxuXHRcdHRoaXMuZXh0ZW5kc01vZHVsZU1hbmFnZXIoKTtcblx0XHR0aGlzLmV4dGVuZHNFdmVudEhhbmRsZXIoKTtcblxuXHRcdHRoaXMuYXV0b3dpcmUgPSB0cnVlO1xuXHRcdFxuXHRcdHRoaXMubG9nZ2VyID0gbmV3IERlZmF1bHRMb2dnZXIoKTtcblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdG8gbG9vcCB0aG91Z2ggdGhlIG9uTG9vcCBsaXN0XG5cdFx0ICogQHByb3BlcnR5IF9pc1BsYXlpbmdcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEB0eXBlIEJvb2xlYW5cblx0XHQgKi9cblx0XHR0aGlzLl9pc1BsYXlpbmcgPSBmYWxzZTtcblx0XHQvKipcblx0XHQgKiBBcnJheSBvZiBHYW1lTGF5ZXIuIE1hdGNoIGxvb3BzIHRoZSBvYmplY3RzIGluIHRoaXMgYXJyYXkgY2FsbGluZyB0aGUgb25Mb29wIG1ldGhvZCBvZiBlYWNoIG9mIHRoZW0uIFRoaXMgb3BlcmF0aW9uXG5cdFx0ICogaW52b2x2ZXMgcmVuZGVyaW5nIHRoYXQgdGFrZXMgcGxhY2UgaW4gdGhlIGxheWVycy4gTWF0Y2ggbG9vcHMgdGhpcyBsaXN0IGFmdGVyIGxvb3BpbmcgdGhlIGdhbWVPYmplY3RzIGFycmF5IHRodXMsIGVuc3VyaW5nLFxuXHRcdCAqIG5vIGlucHV0IG9yIHVwZGF0ZXMgYWZmZWN0cyByZW5kZXJpbmcuXG5cdFx0ICogQHByb3BlcnR5IF9nYW1lTGF5ZXJzXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAdHlwZSBBcnJheVxuXHRcdCAqL1xuXHRcdC8vIHRoaXMuX2dhbWVMYXllcnMgPSBuZXcgRXZlbnRTaW1wbGVNYXAoKTtcblx0XHR0aGlzLl9nYW1lTGF5ZXJzID0gbmV3IFNpbXBsZU1hcCgpO1xuXHRcdC8qKlxuXHRcdCAqIEFycmF5IG9mIEdhbWVPYmplY3QuIE1hdGNoIGxvb3BzIHRoZSBvYmplY3RzIGluIHRoaXMgYXJyYXkgY2FsbGluZyB0aGUgb25Mb29wIG1ldGhvZCBvZiBlYWNoIG9mIHRoZW0uIFRoaXMgb3BlcmF0aW9uXG5cdFx0ICogZG9lcyBub3QgaW52b2x2ZSByZW5kZXJpbmcuIE1hdGNoIGxvb3BzIHRoaXMgbGlzdCBmaXJzdCwgdXBkYXRlcyBldmVyeSBvYmplY3QgYW5kIG9uY2UgdGhhdCBpcyBmaW5pc2hlZCBpdCBsb29wc1xuXHRcdCAqIHRoZSBnYW1lIGxheWVyc1xuXHRcdCAqIEBwcm9wZXJ0eSBfZ2FtZU9iamVjdHNcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEB0eXBlIEFycmF5XG5cdFx0ICovXG5cdFx0dGhpcy5fZ2FtZU9iamVjdHMgPSBuZXcgQXJyYXkoKTtcblx0XHQvKipcblx0XHQgKiBBcnJheSBvZiBUcmlnZ2Vyc1xuXHRcdCAqIEBwcm9wZXJ0eSBfZ2FtZU9iamVjdHNcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEB0eXBlIEFycmF5XG5cdFx0ICovXG5cdFx0dGhpcy5fdHJpZ2dlcnMgPSBuZXcgQXJyYXkoKTtcblx0XHQvKipcblx0XHQgKiBDYWNoZSB1c2VkIGZvciByZXRyaWV2aW5nIGVsZW1lbnRzIGZyb20gb25Mb29wTGlzdCBmYXN0ZXJcblx0XHQgKiBAcHJvcGVydHkgY2FjaGVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEB0eXBlIE9iamVjdFxuXHRcdCAqL1xuXHRcdHRoaXMuY2FjaGUgPSBudWxsO1xuXHRcdC8qKlxuXHRcdCAqIE9mZnNjcmVlbiBjYW52YXMgdXNlZCBmb3Igb3BlcmF0aW9ucyBzdWNoIGFzIFBpeGVsUGVyZmVjdCBjb2xsaXNpb25zXG5cdFx0ICogQHByb3BlcnR5IG9mZlNjcmVlbkNhbnZhc1xuXHRcdCAqIEB0eXBlIEhUTUxDYW52YXNFbGVtZW50XG5cdFx0ICovXG5cdFx0dGhpcy5vZmZTY3JlZW5DYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdC8qKlxuXHRcdCAqIE9mZnNjcmVlbiBjb250ZXh0IHVzZWQgZm9yIG9wZXJhdGlvbnMgc3VjaCBhcyBQaXhlbFBlcmZlY3QgY29sbGlzaW9uc1xuXHRcdCAqIEBwcm9wZXJ0eSBvZmZTY3JlZW5Db250ZXh0XG5cdFx0ICogQHR5cGUgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXG5cdFx0ICovXG5cdFx0dGhpcy5vZmZTY3JlZW5Db250ZXh0ID0gdGhpcy5vZmZTY3JlZW5DYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdC8qKlxuXHRcdCAqIE9iamVjdCB0aGF0IGlzIHBhc3NlZCBhcyBhcmd1bWVudCB0byB0aGUgb25Mb29wIG1ldGhvZCBvZiBldmVyeSBHYW1lT2JqZWN0LiBUaGlzIG9iamVjdCBjb250YWlucyB1c2VmdWwgb2JqZWN0cyBzdWNoIGFzIGtleWJvYXJkIGFuZCBtb3VzZVxuXHRcdCAqIEBwcm9wZXJ0eSBvbkxvb3BQcm9wZXJ0aWVzXG5cdFx0ICogQHR5cGUgQXJyYXlcblx0XHQgKi9cblx0XHR0aGlzLm9uTG9vcFByb3BlcnRpZXMgPSB7XG5cdFx0XHRvZmZTY3JlZW5Db250ZXh0OiB0aGlzLm9mZlNjcmVlbkNvbnRleHQsXG5cdFx0XHRvZmZTY3JlZW5DYW52YXM6IHRoaXMub2ZmU2NyZWVuQ2FudmFzLFxuXHRcdFx0ZGVidWc6IGZhbHNlLFxuXHRcdFx0dGltZTogMCxcblx0XHRcdG06IHRoaXNcblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIE9iamVjdCB0aGF0IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IGJyb3dzZXJcblx0XHQgKiBAcHJvcGVydHkgYnJvd3NlclxuXHRcdCAqIEB0eXBlIEJyb3dzZXJcblx0XHQgKi9cblx0XHR0aGlzLmJyb3dzZXIgPSBuZXcgQnJvd3NlcigpO1xuXHRcdC8qKlxuXHRcdCAqIE9iamVjdCB0aGF0IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IGRldmljZVxuXHRcdCAqIEBwcm9wZXJ0eSBkZXZpY2Vcblx0XHQgKiBAdHlwZSBEZXZpY2Vcblx0XHQgKi9cblx0XHR0aGlzLmRldmljZSA9IG5ldyBEZXZpY2UoKTtcblx0XHQvKipcblx0XHQgKiBFdmVudCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgcmFpc2VkIGJlZm9yZSBjYWxsaW5nIHRoZSBnYW1lIGxvb3Bcblx0XHQgKiBAcHJvcGVydHkgb25CZWZvcmVMb29wXG5cdFx0ICogQHR5cGUgRXZlbnRMaXN0ZW5lclxuXHRcdCAqL1xuXHRcdC8vIHRoaXMub25CZWZvcmVMb29wID0gbmV3IEV2ZW50TGlzdGVuZXIoKTtcblx0XHQvKipcblx0XHQgKiBFdmVudCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgcmFpc2VkIGFmdGVyIGNhbGxpbmcgdGhlIGdhbWUgbG9vcFxuXHRcdCAqIEBwcm9wZXJ0eSBvbkFmdGVyTG9vcFxuXHRcdCAqIEB0eXBlIEV2ZW50TGlzdGVuZXJcblx0XHQgKi9cblx0XHQvLyB0aGlzLm9uQWZ0ZXJMb29wID0gbmV3IEV2ZW50TGlzdGVuZXIoKTtcblx0XHQvKipcblx0XHQgKiBFdmVudCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgcmFpc2VkIHdoZW4gYW4gb2JqZWN0IGlzIGFkZGVkXG5cdFx0ICogQHByb3BlcnR5IG9uR2FtZU9iamVjdFB1c2hlZFxuXHRcdCAqIEB0eXBlIEV2ZW50TGlzdGVuZXJcblx0XHQgKi9cblx0XHQvLyB0aGlzLm9uR2FtZU9iamVjdFB1c2hlZCA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG5cdFx0LyoqXG5cdFx0ICogRXZlbnQgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIHJhaXNlZCB3aGVuIGFuIG9iamVjdCBpcyByZW1vdmVkXG5cdFx0ICogQHByb3BlcnR5IG9uR2FtZU9iamVjdFJlbW92ZWRcblx0XHQgKiBAdHlwZSBFdmVudExpc3RlbmVyXG5cdFx0ICovXG5cdFx0Ly8gdGhpcy5vbkdhbWVPYmplY3RSZW1vdmVkID0gbmV3IEV2ZW50TGlzdGVuZXIoKTtcblx0XHQvKipcblx0XHQgKiBTaW1wbGVNYXAgY29udGFpbmluZyBpbnB1dCBoYW5kbGVyc1xuXHRcdCAqIEBwcm9wZXJ0eSBpbnB1dFxuXHRcdCAqIEB0eXBlIEFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHR0aGlzLmlucHV0ID0gbmV3IFNpbXBsZU1hcCgpO1xuXHRcdFxuXHRcdC8vU2hvdyBsb2dvIGFuZCBkdXJhdGlvbiBvZiBhbmltYXRpb25cblx0XHR0aGlzLnNob3dMb2dvID0gdHJ1ZTtcblx0XHR0aGlzLkxPR09fRFVSQVRJT04gPSAyMDAwO1xuXHRcdFxuXHRcdHRoaXMuREVGQVVMVF9MQVlFUl9OQU1FID0gXCJ3b3JsZFwiO1xuXHRcdHRoaXMuREVGQVVMVF9MQVlFUl9CQUNLR1JPVU5EID0gXCIjMDAwXCI7XG5cblx0XHR0aGlzLkRFRkFVTFRfVVBEQVRFU19QRVJfU0VDT05EID0gNjA7XG5cdFx0dGhpcy5fdXBkYXRlc1BlclNlY29uZCA9IDA7XG5cdFx0dGhpcy5fbXNQZXJVcGRhdGUgPSAwO1xuXHRcdHRoaXMuX3ByZXZpb3VzTG9vcFRpbWUgPSBudWxsO1xuXHRcdHRoaXMuX2xhZyA9IDA7XG5cdFx0dGhpcy5fbWF4TGFnID0gNTA7XG5cdFx0XG5cdFx0dGhpcy5zZXRVcGRhdGVzUGVyU2Vjb25kKHRoaXMuREVGQVVMVF9VUERBVEVTX1BFUl9TRUNPTkQpO1xuXG5cdFx0dGhpcy52ZXJzaW9uID0gXCIxLjZhXCI7XG5cdFx0dGhpcy5uYW1lID0gXCJNYXRjaFwiO1xuXHRcdHRoaXMuY29tcGFueSA9IFwiUHV6emxpbmcgSWRlYXNcIjtcblx0XHRcblx0XHQvKipcblx0XHQgKiBDb21tb24gZ2FtZSBhdHRyaWJ1dGVzIGFuZCBiZWhhdmlvdXJzXG5cdFx0ICogQHByb3BlcnR5IGdhbWVcblx0XHQgKiBAdHlwZSBPYmplY3Rcblx0XHQgKi9cblx0XHR0aGlzLmdhbWUgPSB7XG5cdFx0XHRiZWhhdmlvdXJzOiB7XG5cdFx0XHR9LFxuXHRcdFx0YXR0cmlidXRlczoge1xuXHRcdFx0fSxcblx0XHRcdGVudGl0aWVzOiB7XG5cdFx0XHR9LFxuXHRcdFx0c2NlbmVzOiB7XG5cdFx0XHR9LFxuXHRcdFx0ZGlzcGxheXM6IHtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdC8qXG5cdFx0ICogU3RhcnQgZ2FtZSBsb29wIHdoZW4gZG9jdW1lbnQgaXMgbG9hZGVkXG5cdFx0ICovXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRpZiAoIHNlbGYuZ2FtZURhdGEgKSB7XG5cblx0XHRcdFx0aWYgKCBzZWxmLmdhbWVEYXRhLnRpdGxlICkge1xuXHRcdFx0XHRcdGRvY3VtZW50LnRpdGxlID0gc2VsZi5nYW1lRGF0YS50aXRsZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBjYW52YXMgPSBzZWxmLmdhbWVEYXRhLmNhbnZhcyB8fCBzZWxmLmRvbShcImNhbnZhc1wiKTtcblxuXHRcdFx0XHRpZiAoIHNlbGYuZ2FtZURhdGEuc2l6ZSApIHtcblx0XHRcdFx0XHRpZiAoIHNlbGYuZ2FtZURhdGEuc2l6ZSA9PSBcImZ1bGxTY3JlZW5cIiApIHtcblx0XHRcdFx0XHRcdGNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y2FudmFzLndpZHRoID0gTS5nYW1lRGF0YS5zaXplLndpZHRoO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmhlaWdodCA9IE0uZ2FtZURhdGEuc2l6ZS5oZWlnaHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2VsZi5zdGFydChjYW52YXMpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vUmV0cm9jb21wYXRcblx0XHRcdFx0dmFyIGNudiA9IHNlbGYuZG9tKFwiY2FudmFzXCIpO1xuXG5cdFx0XHRcdGlmICggc2VsZi5hdXRvd2lyZSAmJiBjbnYgKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJBdXRvd2lyZSBlbmFibGVkLiBTdGFydGluZyBNYXRjaCBvbiBkZWZhdWx0IGNhbnZhc1wiKTtcblx0XHRcdFx0XHRzZWxmLnN0YXJ0KGNudik7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9XG5cblxuXHRcdH0pO1xuXG5cdH1cblxuXHQvKipcblx0ICogc2l6ZTogXCJmdWxsU2NyZWVuXCIgb3Ige3dpZHRoOiBOdW1iZXIsIGhlaWdodDogTnVtYmVyfVxuXHQgKiBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IG9yIG51bGwgKHdpbGwgZ2V0IGNhbnZhcyBmcm9tIGRvY3VtZW50KVxuXHQgKiB0aXRsZTogU3RyaW5nXG5cdCAqIGRlc2NyaXB0aW9uOiBTdHJpbmdcblx0ICogbWFpbjogU3RyaW5nLCBOYW1lIG9mIGEgU2NlbmUgb3IgZnVuY3Rpb24gY29kZVxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmNyZWF0ZUdhbWUgPSBmdW5jdGlvbihnYW1lRGF0YSkge1xuXG5cdFx0dGhpcy5nYW1lRGF0YSA9IGdhbWVEYXRhO1xuXG5cdH07XG5cblx0TWF0Y2gucHJvdG90eXBlLmdldENhbWVyYSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnJlbmRlcmVyLmNhbWVyYTtcblx0fTtcblx0XG5cdE1hdGNoLnByb3RvdHlwZS5zZXRVcGRhdGVzUGVyU2Vjb25kID0gZnVuY3Rpb24odXBkYXRlcykge1xuXHRcdHRoaXMuX3VwZGF0ZXNQZXJTZWNvbmQgPSB1cGRhdGVzO1xuXHRcdHRoaXMuX21zUGVyVXBkYXRlID0gTWF0aC5mbG9vcigxMDAwIC8gdXBkYXRlcyk7XG5cdH07XG5cdFxuXHRNYXRjaC5wcm90b3R5cGUuZ2V0VXBkYXRlc1BlclNlY29uZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl91cGRhdGVzUGVyU2Vjb25kO1xuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbGF5ZXIgYnkgdGhlIGdpdmVuIG5hbWVcblx0ICogQG1ldGhvZCBnZXRMYXllclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSB0aGUgbmFtZSBvZiB0aGUgbGF5ZXJcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5nZXRMYXllciA9IGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2FtZUxheWVycy5nZXQobmFtZSk7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBsYXllciBieSB0aGUgZ2l2ZW4gbmFtZS4gV29ya3MgZXhhY3RseSBhcyBnZXRMYXllclxuXHQgKiBAbWV0aG9kIGxheWVyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBsYXllclxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmxheWVyID0gTWF0Y2gucHJvdG90eXBlLmdldExheWVyO1xuXHRNYXRjaC5wcm90b3R5cGUuc2V0VXBHYW1lTG9vcCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5nYW1lTG9vcEFscmVhZHlTZXR1cCA9IHRydWU7XG5cdFx0XG5cdFx0dGhpcy5fcHJldmlvdXNMb29wVGltZSA9IHRoaXMuZ2V0VGltZSgpO1xuXHRcdHRoaXMuX2xhZyA9IDA7XG5cblx0XHR0aGlzLmNyZWF0ZUdhbWVMYXllcih0aGlzLkRFRkFVTFRfTEFZRVJfTkFNRSkuYmFja2dyb3VuZCA9IHRoaXMuREVGQVVMVF9MQVlFUl9CQUNLR1JPVU5EO1xuXG5cdFx0Z2FtZUxvb3AoKTtcblxuXHR9O1xuXHRNYXRjaC5wcm90b3R5cGUuX3Nob3dMb2dvID0gZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLnNldFNjZW5lKFwibWF0Y2hMb2dvXCIsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRNLnJlbW92ZVNjZW5lKCk7XG5cdFx0XHRcdE0uX3JlZ3VsYXJTdGFydCgpO1xuXHRcdFx0fSwgTS5MT0dPX0RVUkFUSU9OKTtcblx0XHRcdFxuXHRcdH0pXG5cblx0fTtcblx0TWF0Y2gucHJvdG90eXBlLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmdhbWVMb29wQWxyZWFkeVNldHVwID0gZmFsc2U7XG5cdFx0dGhpcy5zdGFydCgpO1xuXHR9O1xuXHQvKipcblx0ICogU2V0IEtleWJvYXJkIG9iamVjdC4gVGhpcyBpcyBjYWxsZWQgYnkgZGVmYXVsdCBieSB0aGUga2V5Ym9hcmQgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBsaWJyYXJ5IGJ1dCBpdCBjb3VsZCBiZSBjaGFuZ2VkXG5cdCAqIEBtZXRob2Qgc2V0S2V5Ym9hcmRcblx0ICogQHBhcmFtIHtpbnB1dC5LZXlib2FyZH0ga2V5Ym9hcmQgdGhlIGtleWJvYXJkIHRvIGJpbmRcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5zZXRLZXlib2FyZCA9IGZ1bmN0aW9uKGtleWJvYXJkKSB7XG5cdFx0dGhpcy5vbkxvb3BQcm9wZXJ0aWVzLmtleWJvYXJkID0ga2V5Ym9hcmQ7XG5cdFx0dGhpcy5pbnB1dC5zZXQoXCJrZXlib2FyZFwiLCBrZXlib2FyZCk7XG5cdH07XG5cdC8qKlxuXHQgKiBTZXQgTW91c2Ugb2JqZWN0LiBUaGlzIGlzIGNhbGxlZCBieSBkZWZhdWx0IGJ5IHRoZSBtb3VzZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIGxpYnJhcnkgYnV0IGl0IGNvdWxkIGJlIGNoYW5nZWRcblx0ICogQG1ldGhvZCBzZXRNb3VzZVxuXHQgKiBAcGFyYW0ge2lucHV0Lk1vdXNlfSBtb3VzZSB0aGUgbW91c2UgdG8gYmluZFxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLnNldE1vdXNlID0gZnVuY3Rpb24obW91c2UpIHtcblx0XHR0aGlzLm9uTG9vcFByb3BlcnRpZXMubW91c2UgPSBtb3VzZTtcblx0XHR0aGlzLmlucHV0LnNldChcIm1vdXNlXCIsIG1vdXNlKTtcblx0fTtcblx0LyoqXG5cdCAqIFNldCBUb3VjaCBvYmplY3QuIFRoaXMgaXMgY2FsbGVkIGJ5IGRlZmF1bHQgYnkgdGhlIHRvdWNoIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgbGlicmFyeSBidXQgaXQgY291bGQgYmUgY2hhbmdlZFxuXHQgKiBAbWV0aG9kIHNldFRvdWNoXG5cdCAqIEBwYXJhbSB7aW5wdXQuVG91Y2h9IHRvdWNoIHRoZSB0b3VjbiB0byBiaW5kXG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUuc2V0VG91Y2ggPSBmdW5jdGlvbih0b3VjaCkge1xuXHRcdHRoaXMub25Mb29wUHJvcGVydGllcy50b3VjaCA9IHRvdWNoO1xuXHRcdHRoaXMuaW5wdXQuc2V0KFwidG91Y2hcIiwgdG91Y2gpO1xuXHR9O1xuXHQvKipcblx0ICogU2V0IEFjY2VsZXJvbWV0ZXIgb2JqZWN0LiBUaGlzIGlzIGNhbGxlZCBieSBkZWZhdWx0IGJ5IHRoZSBhY2NlbGVyb21ldGVyIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgbGlicmFyeSBidXQgaXQgY291bGQgYmUgY2hhbmdlZFxuXHQgKiBAbWV0aG9kIHNldEFjY2VsZXJvbWV0ZXJcblx0ICogQHBhcmFtIHtpbnB1dC5BY2NlbGVyb21ldGVyfSBhY2NlbGVyb21ldGVyIHRoZSBhY2NlbGVyb21ldGVyIHRvIGJpbmRcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5zZXRBY2NlbGVyb21ldGVyID0gZnVuY3Rpb24oYWNjZWxlcm9tZXRlcikge1xuXHRcdHRoaXMub25Mb29wUHJvcGVydGllcy5hY2NlbGVyb21ldGVyID0gYWNjZWxlcm9tZXRlcjtcblx0XHR0aGlzLmlucHV0LnNldChcImFjY2VsZXJvbWV0ZXJcIiwgYWNjZWxlcm9tZXRlcik7XG5cdH07XG5cdC8qKlxuXHQgKiBTZXQgT3JpZW50YXRpb24gb2JqZWN0LiBUaGlzIGlzIGNhbGxlZCBieSBkZWZhdWx0IGJ5IHRoZSBvcmllbnRhdGlvbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIGxpYnJhcnkgYnV0IGl0IGNvdWxkIGJlIGNoYW5nZWRcblx0ICogQG1ldGhvZCBzZXRPcmllbnRhdGlvblxuXHQgKiBAcGFyYW0ge2lucHV0Lk9yaWVudGF0aW9ufSBvcmllbnRhdGlvbiB0aGUgYWNjZWxlcm9tZXRlciB0byBiaW5kXG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUuc2V0T3JpZW50YXRpb24gPSBmdW5jdGlvbihvcmllbnRhdGlvbikge1xuXHRcdHRoaXMub25Mb29wUHJvcGVydGllcy5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xuXHRcdHRoaXMuaW5wdXQuc2V0KFwib3JpZW50YXRpb25cIiwgb3JpZW50YXRpb24pO1xuXHR9O1xuXHRNYXRjaC5wcm90b3R5cGUucmVnaXN0ZXJDbGFzcyA9IGZ1bmN0aW9uKCkge1xuXHRcblx0XHR2YXIgbmFtZXNwYWNlID0gYXJndW1lbnRzWzBdLnNwbGl0KFwiXFwuXCIpLFxuXHRcdFx0Y2xvdXN1cmUgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdLFxuXHRcdFx0Y3VycmVudCA9IHdpbmRvdyxcblx0XHRcdGwgPSBuYW1lc3BhY2UubGVuZ3RoIC0gMSxcblx0XHRcdGRlcGVuZGVuY2llcyA9IFtdLFxuXHRcdFx0bmFtZTtcblx0XHRcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHRuYW1lID0gbmFtZXNwYWNlW2ldO1xuXHRcdFx0aWYgKCAhY3VycmVudFtuYW1lXSApIHtcblx0XHRcdFx0Y3VycmVudFtuYW1lXSA9IG5ldyBPYmplY3QoKTtcblx0XHRcdH1cblx0XHRcdGN1cnJlbnQgPSBjdXJyZW50W25hbWVdO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoICEgY3VycmVudFtuYW1lc3BhY2VbbF1dICkge1xuXHRcdFxuXHRcdFx0Ly9BZGRzIHRoZSBkZWZhdWx0IG5hbWVzcGFjZSBhcyBhIGRlcGVuZGVuY3kgc28gaXQgaXMgYXZhaWxhYmxlIGFzIHRoZSBmaXJzdCBhcmd1bWVudCBvZiB0aGUgY2xvdXN1cmVcblx0XHRcdC8vIGRlcGVuZGVuY2llcy5wdXNoKGN1cnJlbnQpO1xuXHRcdFx0XG5cdFx0XHRmb3IgKCB2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSsrICkge1xuXHRcdFx0XHRkZXBlbmRlbmNpZXMucHVzaChhcmd1bWVudHNbaV0pO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjdXJyZW50W25hbWVzcGFjZVtsXV0gPSBjbG91c3VyZS5hcHBseShjbG91c3VyZSwgZGVwZW5kZW5jaWVzKTtcblx0XHRcdGN1cnJlbnRbbmFtZXNwYWNlW2xdXS5uYW1lc3BhY2UgPSBhcmd1bWVudHNbMF07XG5cdFx0XG5cdFx0fVxuXG5cdH07XG5cblx0TWF0Y2gucHJvdG90eXBlLmxvYWRCZWhhdmlvdXIgPSBmdW5jdGlvbigpIHtcblx0XHRzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuXHRcdHNjcmlwdC5zcmMgPSBcImh0dHA6Ly82OS4xNjQuMTkyLjEwMzo4MDgyL2JlaGF2aW91ci9qcz9xPVwiICsgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKS5qb2luKFwiLFwiKTtcblx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cdH07XG5cblx0TWF0Y2gucHJvdG90eXBlLmxvYWRBdHRyaWJ1dGUgPSBmdW5jdGlvbigpIHtcblx0XHRzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuXHRcdHNjcmlwdC5zcmMgPSBcImh0dHA6Ly82OS4xNjQuMTkyLjEwMzo4MDgxL2F0dHJpYnV0ZS9qcz9xPVwiICsgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKS5qb2luKFwiLFwiKTtcblx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS5yZWdpc3RlckJlaGF2aW91ciA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG5cblx0XHRpZiAoIHRoaXMuZ2FtZS5iZWhhdmlvdXJzW25hbWVdICkge1xuXHRcdFx0dGhpcy5sb2dnZXIud2FybihcIlRoZXJlIGlzIGFscmVhZHkgYSBiZWhhdmlvdXIgbmFtZWQgXCIsIG5hbWUsIFwiY3VycmVudCB3aWxsIGJlIG92ZXJyaWRlblwiKTtcblx0XHR9XG5cdFx0dGhpcy5nYW1lLmJlaGF2aW91cnNbbmFtZV0gPSB2YWx1ZTtcblx0XHR0aGlzLnJhaXNlKFwiYmVoYXZpb3VyUmVnaXN0ZXJlZFwiLCBuYW1lKTtcblxuXHR9O1xuXHRNYXRjaC5wcm90b3R5cGUuYmVoYXZpb3VyID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDIgKSB7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyQmVoYXZpb3VyKGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG5ldyB0aGlzLmdhbWUuYmVoYXZpb3Vyc1thcmd1bWVudHNbMF1dO1xuXHRcdH1cblx0fTtcblx0TWF0Y2gucHJvdG90eXBlLmNhcGl0YWxpemUgPSBmdW5jdGlvbih3b3JkKSB7XG5cdFx0cmV0dXJuIHdvcmQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB3b3JkLnN1YnN0cigxKTtcblx0fTtcblx0TWF0Y2gucHJvdG90eXBlLmRpc3BsYXkgPSBmdW5jdGlvbihuYW1lLCBkZXNjcmlwdG9yKSB7XG5cblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMiApIHtcblxuXHRcdFx0dmFyIHJlbmRlcml6YWJsZVR5cGUgPSB0aGlzLmNhcGl0YWxpemUoZGVzY3JpcHRvci50eXBlKTtcblxuXHRcdFx0aWYgKCAhdGhpcy5yZW5kZXJpemFibGVzW3JlbmRlcml6YWJsZVR5cGVdICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJXaGVuIHRyeWluZyB0byByZWdpc3RlciBhIGRpc3BsYXksIG5vIGRpc3BsYXkgYnkgdGhlIHR5cGUgJ1wiICsgcmVuZGVyaXphYmxlVHlwZSArIFwiJyBjb3VsZCBiZSBmb3VuZC4gVHJ5IHJlY3RhbmdsZSwgY2lyY2xlLCB0ZXh0IG9yIHNwcml0ZVwiKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5nYW1lLmRpc3BsYXlzW25hbWVdID0gZGVzY3JpcHRvcjtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRcblx0XHRcdHZhciBkaXNwbGF5ID0gdGhpcy5nYW1lLmRpc3BsYXlzW25hbWVdO1xuXHRcdFx0XG5cdFx0XHRpZiAoIGRpc3BsYXkgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgcmVuZGVyaXphYmxlID0gbmV3IHRoaXMucmVuZGVyaXphYmxlc1t0aGlzLmNhcGl0YWxpemUoZGlzcGxheS50eXBlKV07XG5cblx0XHRcdFx0cmVuZGVyaXphYmxlLnNldChkaXNwbGF5KTtcblxuXHRcdFx0XHRyZXR1cm4gcmVuZGVyaXphYmxlO1xuXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJXaGVuIHRyeWluZyB0byBpbnN0YW50aWF0ZSBhIGRpc3BsYXksIG5vIGRpc3BsYXkgYnkgdGhlIG5hbWUgJ1wiICsgbmFtZSArIFwiJyBjb3VsZCBiZSBmb3VuZFwiKTtcblx0XHRcdH1cblxuXHRcdH1cblx0fTtcblx0TWF0Y2gucHJvdG90eXBlLnJlZ2lzdGVyQXR0cmlidXRlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcblx0XHRpZiAoIHRoaXMuZ2FtZS5hdHRyaWJ1dGVzW25hbWVdICkge1xuXHRcdFx0dGhpcy5sb2dnZXIud2FybihcIlRoZXJlIGlzIGFscmVhZHkgYW4gYXR0cmlidXRlIG5hbWVkIFwiLCBuYW1lLCBcImN1cnJlbnQgd2lsbCBiZSBvdmVycmlkZW5cIik7XG5cdFx0fVxuXHRcdHRoaXMuZ2FtZS5hdHRyaWJ1dGVzW25hbWVdID0gdmFsdWU7XG5cdFx0dGhpcy5yYWlzZShcImF0dHJpYnV0ZVJlZ2lzdGVyZWRcIiwgbmFtZSk7XG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS5hdHRyaWJ1dGUgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMiApIHtcblx0XHRcdHRoaXMucmVnaXN0ZXJBdHRyaWJ1dGUoYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbmV3IHRoaXMuZ2FtZS5hdHRyaWJ1dGVzW2FyZ3VtZW50c1swXV07XG5cdFx0fVxuXHR9O1xuXHRNYXRjaC5wcm90b3R5cGUucmVnaXN0ZXJFbnRpdHkgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuXHRcdGlmICggdGhpcy5nYW1lLmVudGl0aWVzW25hbWVdID09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuZ2FtZS5lbnRpdGllc1tuYW1lXSA9IHZhbHVlO1xuXHRcdFx0dGhpcy5yYWlzZShcImVudGl0eVJlZ2lzdGVyZWRcIiwgbmFtZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubG9nZ2VyLndhcm4oXCJUaGVyZSBpcyBhbHJlYWR5IGFuIGVudGl0eSBuYW1lZCBcIiwgbmFtZSk7XG5cdFx0fVxuXHR9O1xuXHRNYXRjaC5wcm90b3R5cGUuY3JlYXRlRW50aXR5ID0gZnVuY3Rpb24obmFtZSwgcHJvcGVydGllcywgYXJncykge1xuXG5cdFx0dmFyIGVudGl0eUNsYXNzID0gdGhpcy5nYW1lLmVudGl0aWVzW25hbWVdO1xuXG5cdFx0aWYgKCB0eXBlb2YgZW50aXR5Q2xhc3MgPT0gXCJmdW5jdGlvblwiICkge1xuXG5cdFx0XHQvL0N1c3RvbSBzcGF3bmVyXG5cdFx0XHR2YXIgZW50aXR5ID0gZW50aXR5Q2xhc3MocHJvcGVydGllcywgYXJncyk7XG5cdFx0XHRlbnRpdHkubmFtZSA9IG5hbWU7XG5cdFx0XHR0aGlzLnJhaXNlKFwiZW50aXR5Q3JlYXRlZFwiLCBuYW1lKTtcblx0XHRcdHJldHVybiBlbnRpdHk7XG5cdFx0XHRcblx0XHR9IGVsc2UgaWYgKCBlbnRpdHlDbGFzcyAhPT0gdW5kZWZpbmVkKSB7XG5cblx0XHRcdC8vRGVmYXVsdCBzcGF3bmVyXG5cdFx0XHR2YXIgZW50aXR5ID0gbmV3IHRoaXMuRW50aXR5KHByb3BlcnRpZXMsIGFyZ3MpO1xuXG5cdFx0XHRpZiAoIGVudGl0eUNsYXNzLmhhcyApIHtcblx0XHRcdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgZW50aXR5Q2xhc3MuaGFzLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0XHRcdGVudGl0eS5oYXMoZW50aXR5Q2xhc3MuaGFzW2ldKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGVudGl0eUNsYXNzLmRvZXMgKSB7XG5cdFx0XHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGVudGl0eUNsYXNzLmRvZXMubGVuZ3RoOyBpKysgKSB7XG5cdFx0XHRcdFx0ZW50aXR5LmRvZXMoZW50aXR5Q2xhc3MuZG9lc1tpXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBlbnRpdHlDbGFzcy5kaXNwbGF5cyApIHtcblxuXHRcdFx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBlbnRpdHlDbGFzcy5kaXNwbGF5cy5sZW5ndGg7IGkrKyApIHtcblxuXHRcdFx0XHRcdHZhciBkaXNwbGF5RGF0YSA9IGVudGl0eUNsYXNzLmRpc3BsYXlzW2ldO1xuXG5cdFx0XHRcdFx0aWYgKCB0eXBlb2YgZGlzcGxheURhdGEgPT09IFwib2JqZWN0XCIgKSB7XG5cblx0XHRcdFx0XHRcdHZhciBrZXkgPSBPYmplY3Qua2V5cyhkaXNwbGF5RGF0YSlbMF0sXG5cdFx0XHRcdFx0XHRcdHByb3BlcnRpZXMgPSBkaXNwbGF5RGF0YVtrZXldLFxuXHRcdFx0XHRcdFx0XHRzaGFwZSxcblx0XHRcdFx0XHRcdFx0dmlldztcblxuXHRcdFx0XHRcdFx0aWYgKCBwcm9wZXJ0aWVzLnRleHQgKSB7XG5cdFx0XHRcdFx0XHRcdHNoYXBlID0gXCJUZXh0XCI7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCBwcm9wZXJ0aWVzLnJhZGl1cyApIHtcblx0XHRcdFx0XHRcdFx0c2hhcGUgPSBcIkNpcmNsZVwiO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmICggcHJvcGVydGllcy5pbWFnZSApIHtcblx0XHRcdFx0XHRcdFx0c2hhcGUgPSBcIlNwcml0ZVwiO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0c2hhcGUgPSBcIlJlY3RhbmdsZVwiO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR2aWV3ID0gbmV3IE0ucmVuZGVyaXphYmxlc1tzaGFwZV07XG5cblx0XHRcdFx0XHRcdHZpZXcuc2V0KHByb3BlcnRpZXMpO1xuXG5cdFx0XHRcdFx0XHRlbnRpdHkudmlld3Muc2V0KGtleSwgdmlldyk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0dmFyIGRpc3BsYXkgPSB0aGlzLmRpc3BsYXkoZW50aXR5Q2xhc3MuZGlzcGxheXNbaV0pO1xuXHRcdFx0XHRcdGVudGl0eS52aWV3cy5zZXQoZW50aXR5Q2xhc3MuZGlzcGxheXNbaV0sIGRpc3BsYXkpO1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGVudGl0eS5uYW1lID0gbmFtZTtcblx0XHRcdHRoaXMucmFpc2UoXCJlbnRpdHlDcmVhdGVkXCIsIG5hbWUpO1xuXG5cdFx0XHRyZXR1cm4gZW50aXR5O1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBpbnN0YW50aWF0ZSBlbnRpdHkgYnkgbmFtZSAnXCIgKyBuYW1lICsgXCInIGFzIGl0IGNvdWxkIG5vdCBiZSBmb3VuZC4gRGlkIHlvdSByZWdpc3RlciBpdD9cIik7XG5cdFx0fVxuXG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS5lbnRpdHkgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMiApIHtcblx0XHRcdHRoaXMucmVnaXN0ZXJFbnRpdHkoYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFbnRpdHkoYXJndW1lbnRzWzBdKTtcblx0XHR9XG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS5zcGF3biA9IGZ1bmN0aW9uKG5hbWUsIGluaXRpYWxpemUpIHtcblx0XHRcblx0XHR2YXIgZW50aXR5ID0gdGhpcy5lbnRpdHkobmFtZSk7XG5cblx0XHRpZiAoIGluaXRpYWxpemUgKSB7XG5cdFx0XHRpbml0aWFsaXplKGVudGl0eSk7XG5cdFx0fVxuXG5cdFx0dmFyIGFkZFN5c3RlbSA9IE0uYWRkKGVudGl0eSk7XG5cblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBlbnRpdHkudmlld3MuX3ZhbHVlcy5sZW5ndGg7IGkrKyApIHtcblx0XHRcdGlmICggZW50aXR5LnZpZXdzLl92YWx1ZXNbaV0ubGF5ZXIgKSB7XG5cdFx0XHRcdC8vVE9ETzogV2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBqdXN0IHZpZXdzIHRvIGxheWVycy4gVGhpcyByZXF1aXJlcyBtdWNoIG1vcmUgaW52ZXN0aWdhdGlvbiBhbmQgY2hhbmdpbmcgaG93IGxheWVycyB3b3JrXG5cdFx0XHRcdGFkZFN5c3RlbS50byhlbnRpdHkudmlld3MuX3ZhbHVlc1tpXS5sYXllcik7XG5cdFx0XHRcdHJldHVybiBlbnRpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0YWRkU3lzdGVtLnRvKFwid29ybGRcIik7XG5cblx0XHRyZXR1cm4gZW50aXR5O1xuXG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS5yZWdpc3RlclNjZW5lID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcblx0XHRpZiAoIHRoaXMuZ2FtZS5zY2VuZXNbbmFtZV0gPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5nYW1lLnNjZW5lc1tuYW1lXSA9IHZhbHVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmxvZ2dlci53YXJuKFwiVGhlcmUgaXMgYWxyZWFkeSBhIHNjZW5lIG5hbWVkIFwiLCBuYW1lKTtcblx0XHR9XG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS5zY2VuZSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDIgKSB7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyU2NlbmUobmFtZSwgdmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRTY2VuZShuYW1lKTtcblx0XHR9XG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS51bnJlZ2lzdGVyU2NlbmUgPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0dGhpcy5nYW1lLnNjZW5lc1tuYW1lXSA9IG51bGw7XG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS5nZXRTY2VuZSA9IGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRyZXR1cm4gdGhpcy5nYW1lLnNjZW5lc1tuYW1lXTtcblx0fTtcbiAgLyoqXG4gICAqIENyZWF0ZXMgb2JqZWN0cyBhbmQgdHJpZ2dlcnMgYmFzZWQgb24gYSBtYXAgZ2l2ZW4gYSBtYXAgZGVmaW5pdGlvblxuICAgKi9cbiAgTWF0Y2gucHJvdG90eXBlLmNyZWF0ZU1hcCA9IGZ1bmN0aW9uKG1hcERlZmluaXRpb24pIHtcbiAgICBcbiAgICBpZiAoIW1hcERlZmluaXRpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZXJlIGlzIG5vIG1hcCByZWdpc3RlcmVkIHdpdGggbmFtZSBcIiArIG5hbWUpO1xuICAgIH1cbiAgICBcbiAgICBpZiAobWFwRGVmaW5pdGlvbi5jYW1lcmFCb3VuZGluZ0FyZWEpIHtcbiAgICAgIHRoaXMuZ2V0Q2FtZXJhKCkuc2V0Qm91bmRpbmdBcmVhKG1hcERlZmluaXRpb24uY2FtZXJhQm91bmRpbmdBcmVhLmxlZnQsIG1hcERlZmluaXRpb24uY2FtZXJhQm91bmRpbmdBcmVhLnRvcCwgbWFwRGVmaW5pdGlvbi5jYW1lcmFCb3VuZGluZ0FyZWEucmlnaHQsIG1hcERlZmluaXRpb24uY2FtZXJhQm91bmRpbmdBcmVhLmJvdHRvbSk7XG4gICAgfVxuICAgIFxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1hcERlZmluaXRpb24uZGVmaW5pdGlvbi5sZW5ndGg7IHJvdysrKSB7XG5cbiAgICAgIGZvciAodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IG1hcERlZmluaXRpb24uZGVmaW5pdGlvbltyb3ddLmxlbmd0aDsgY29sdW1uKyspIHtcbiAgICAgICAgXG4gICAgICAgIHZhciB0aWxlUmVmID0gbWFwRGVmaW5pdGlvbi5kZWZpbml0aW9uW3Jvd11bY29sdW1uXTtcbiAgICAgICAgXG4gICAgICAgIHZhciB0aWxlQ29uc3RydWN0b3IgPSBtYXBEZWZpbml0aW9uLmVudGl0aWVzW3RpbGVSZWZdO1xuICAgICAgICBcbiAgICAgICAgdmFyIHRpbGUgPSB7XG4gICAgICAgICAgXCJyb3dcIjogcm93LFxuICAgICAgICAgIFwiY29sdW1uXCI6IGNvbHVtbixcbiAgICAgICAgICBcIndpZHRoXCI6IG1hcERlZmluaXRpb24udGlsZS53aWR0aCxcbiAgICAgICAgICBcImhlaWdodFwiOiBtYXBEZWZpbml0aW9uLnRpbGUuaGVpZ2h0LFxuICAgICAgICAgIFwiY2VudGVyXCI6IHtcbiAgICAgICAgICAgIFwieFwiOiBjb2x1bW4gKiBtYXBEZWZpbml0aW9uLnRpbGUud2lkdGggKyBtYXBEZWZpbml0aW9uLnRpbGUud2lkdGggLyAyLFxuICAgICAgICAgICAgXCJ5XCI6IHJvdyAqIG1hcERlZmluaXRpb24udGlsZS5oZWlnaHQgKyBtYXBEZWZpbml0aW9uLnRpbGUuaGVpZ2h0IC8gMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJ0eXBlXCI6IHRpbGVSZWZcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2NyZWF0ZU1hcFRpbGUodGlsZUNvbnN0cnVjdG9yLCB0aWxlKTtcblxuICAgICAgfVxuICAgICAgXG4gICAgfVxuICAgIFxuICB9O1xuICBNYXRjaC5wcm90b3R5cGUuX2NyZWF0ZU1hcFRpbGUgPSBmdW5jdGlvbih0aWxlQ29uc3RydWN0b3IsIHRpbGUpIHtcbiAgICBcbiAgICBpZiAodHlwZW9mIHRpbGVDb25zdHJ1Y3RvciA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIFxuICAgICAgdGhpcy5fY3JlYXRlTWFwVGlsZSh0aWxlQ29uc3RydWN0b3IodGlsZSksIHRpbGUpO1xuICAgICAgXG4gICAgfSBlbHNlIGlmICh0aWxlQ29uc3RydWN0b3IgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgXG4gICAgICB0aWxlQ29uc3RydWN0b3IuZm9yRWFjaChmdW5jdGlvbihjdXJyZW50VGlsZSkge1xuICAgICAgICBNLl9jcmVhdGVNYXBUaWxlKGN1cnJlbnRUaWxlLCB0aWxlKTtcbiAgICAgIH0pO1xuICAgICAgXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGlsZUNvbnN0cnVjdG9yID09IFwic3RyaW5nXCIpIHtcbiAgICAgIFxuICAgICAgdmFyIGFyZ3VtZW50c0luZGV4ID0gdGlsZUNvbnN0cnVjdG9yLmluZGV4T2YoXCI6XCIpLFxuICAgICAgICAgIGFyZ3M7XG4gICAgICBcbiAgICAgIGlmIChhcmd1bWVudHNJbmRleCAhPSAtMSkge1xuICAgICAgICBhcmdzID0gdGlsZUNvbnN0cnVjdG9yLnN1YnN0cihhcmd1bWVudHNJbmRleCArIDEsIHRpbGVDb25zdHJ1Y3Rvci5sZW5ndGgpO1xuICAgICAgICB0aWxlQ29uc3RydWN0b3IgPSB0aWxlQ29uc3RydWN0b3Iuc3Vic3RyKDAsIGFyZ3VtZW50c0luZGV4KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgTS5hZGQoTS5jcmVhdGVFbnRpdHkodGlsZUNvbnN0cnVjdG9yLCB0aWxlLCBhcmdzKSk7XG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgXG4gICAgICBNLmFkZCh0aWxlQ29uc3RydWN0b3IpO1xuICAgICAgXG4gICAgfVxuICAgIFxuICB9XG5cdC8qKlxuXHQgKiBDYWxscyB0aGUgb25Mb29wIG1ldGhvZCBvbiBhbGwgZWxlbWVudHMgaW4gbm9kZXNcblx0ICogQG1ldGhvZCB1cGRhdGVHYW1lT2JqZWN0c1xuXHQgKiBAcGFyYW0ge0FycmF5fSBub2RlcyBsaXN0IG9mIGdhbWUgb2JqZWN0c1xuXHQgKiBAcGFyYW0ge09iamVjdH0gcCB1c2VmdWwgb2JqZWN0cyBmb3IgcGVyZm9ybWFuY2UgaW5jcmVhc2Vcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS51cGRhdGVHYW1lT2JqZWN0cyA9IGZ1bmN0aW9uKG5vZGVzLCBwKSB7XG5cblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKyApIHtcblxuXHRcdFx0dmFyIG5vZGUgPSBub2Rlc1tpXTtcblxuXHRcdFx0dGhpcy5fYXBwbHlJbnB1dChub2RlKTtcblxuXHRcdFx0bm9kZS5vbkxvb3AocCk7XG5cblx0XHR9XG5cblx0fTtcblx0LyoqXG5cdCAqIENhbGxzIGFwcGx5VG9PYmplY3QgdG8gb2YgZWFjaCBpbnB1dCBoYW5kbGVyXG5cdCAqIEBtZXRob2QgX2FwcGx5SW5wdXRcblx0ICogQHBhcmFtIHtOb2RlfSBub2RlIHRvIGFwcGx5IGlucHV0IGhhbmRsaW5nIHRvXG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUuX2FwcGx5SW5wdXQgPSBmdW5jdGlvbihub2RlKSB7XG5cdFx0dmFyIGkgPSAwLFxuXHRcdFx0aW5wdXQgPSB0aGlzLmlucHV0Ll92YWx1ZXMsXG5cdFx0XHRsID0gaW5wdXQubGVuZ3RoO1xuXHRcdGZvciAoIDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdGlucHV0W2ldLmFwcGx5VG9PYmplY3Qobm9kZSk7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogVXBkYXRlcyBhbGwgaW5wdXQgaGFuZGxlcnNcblx0ICogQG1ldGhvZCBfdXBkYXRlSW5wdXRcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5fdXBkYXRlSW5wdXQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgaSA9IDAsXG5cdFx0XHRpbnB1dCA9IHRoaXMuaW5wdXQuX3ZhbHVlcyxcblx0XHRcdGwgPSBpbnB1dC5sZW5ndGg7XG5cdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0aW5wdXRbaV0udXBkYXRlKCk7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogR2FtZSBsb29wLCBsb29wcyB0aHJvdWdoIHRoZSBnYW1lIG9iamVjdHMgYW5kIHRoZW4gbG9vcHMgdGhyb3VnaCB0aGUgc2NlbmVzIHJlbmRlcmluZyB0aGVtXG5cdCAqIEBtZXRob2QgZ2FtZUxvb3Bcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5nYW1lTG9vcCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYgKCAhdGhpcy5faXNQbGF5aW5nICkgcmV0dXJuO1xuXHRcdFxuXHRcdC8vIHRoaXMub25CZWZvcmVMb29wLnJhaXNlKCk7XG5cblx0XHR0aGlzLnJhaXNlKFwiYmVmb3JlTG9vcFwiKTtcblxuXHRcdHZhciBwID0gdGhpcy5vbkxvb3BQcm9wZXJ0aWVzLFxuXHRcdFx0Y3VycmVudCA9IHRoaXMuZ2V0VGltZSgpLFxuXHRcdFx0cmVuZGVyZXIgPSB0aGlzLnJlbmRlcmVyO1xuXG5cdFx0cC50aW1lID0gdGhpcy5GcHNDb3VudGVyLnRpbWVJbk1pbGxpcztcblx0XHRcblx0XHQvLyB0aGlzLl9sYWcgKz0gY3VycmVudCAtIHRoaXMuX3ByZXZpb3VzTG9vcFRpbWU7XG5cdFx0dGhpcy5fcHJldmlvdXNMb29wVGltZSA9IGN1cnJlbnQ7XG5cblx0XHQvLyBpZiAoIHRoaXMuX2xhZyA+IHRoaXMuX21heExhZyApIHtcblx0XHQvLyBcdHRoaXMuX2xhZyA9IHRoaXMuX21heExhZztcblx0XHQvLyB9XG5cdFx0XG5cdFx0Y3VycmVudCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcdFxuXHRcdC8vIHdoaWxlICggdGhpcy5fbGFnID4gdGhpcy5fbXNQZXJVcGRhdGUgKSB7XG5cdFx0XG5cdFx0XHR0aGlzLnVwZGF0ZUdhbWVPYmplY3RzKHRoaXMuX2dhbWVPYmplY3RzLCBwKTtcblx0XHRcdHRoaXMudXBkYXRlVHJpZ2dlcnModGhpcy5fdHJpZ2dlcnMsIHApO1xuXHRcdFx0dGhpcy5fdXBkYXRlSW5wdXQocCk7XG5cdFx0XHQvLyB0aGlzLl9sYWcgLT0gdGhpcy5fbXNQZXJVcGRhdGU7XG5cblx0XHQvLyB9XG5cblx0XHR0aGlzLnVwZGF0ZVRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIGN1cnJlbnQ7XG5cdFx0XG5cdFx0Y3VycmVudCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG5cdFx0dGhpcy5yZW5kZXJlci5yZW5kZXJMYXllcnModGhpcy5fZ2FtZUxheWVycyk7XG5cdFx0XG5cdFx0dGhpcy5yZW5kZXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBjdXJyZW50O1xuXG5cdFx0Lypcblx0XHQgKiBVcGRhdGUgRlBTIGNvdW50XG5cdFx0ICovXG5cdFx0dGhpcy5GcHNDb3VudGVyLmNvdW50KCk7XG5cblx0XHQvLyB0aGlzLm9uQWZ0ZXJMb29wLnJhaXNlKCk7XG5cblx0XHR0aGlzLnJhaXNlKFwiYWZ0ZXJMb29wXCIpO1xuXG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS51cGRhdGVUcmlnZ2VycyA9IGZ1bmN0aW9uKHRyaWdnZXJzLCBwKSB7XG5cdFx0dmFyIGkgPSAwLCBsID0gdHJpZ2dlcnMubGVuZ3RoO1xuXHRcdGZvciAoIDsgIGkgPCBsOyBpKysgKSB7XG5cdFx0XHR0cmlnZ2Vyc1tpXS5vbkxvb3AocCk7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgcmVzdWx0IG9mIGFsbCBsYXllcnMgYXMgYW4gaW1hZ2UgaW4gYmFzZTY0XG5cdCAqIEBtZXRob2QgZ2V0QXNCYXNlNjRJbWFnZVxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9IGEgc3RyaW5nIHJlcHJlc2VudGluZyBhbiBpbWFnZSBpbiBiYXNlNjRcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5nZXRBc0Jhc2U2NEltYWdlID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMucmVuZGVyZXIuZ2V0QXNCYXNlNjRJbWFnZSgpO1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgcmVzdWx0IG9mIGFsbCBsYXllcnMgYXMgYW4gaHRtbCBpbWFnZVxuXHQgKiBAbWV0aG9kIGdldEFzSW1hZ2Vcblx0ICogQHJldHVybiB7SFRNTEltYWdlRWxlbWVudH0gYW4gaW1hZ2UgZWxlbWVudCB3aXRoIHRoZSByZXN1bHQgb2YgdGhpcyBsYXllclxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmdldEFzSW1hZ2UgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgaW1nID0gbmV3IEltYWdlKCk7XG5cdFx0aW1nLnNyYyA9IHRoaXMuZ2V0QXNCYXNlNjRJbWFnZSgpO1xuXHRcdHJldHVybiBpbWc7XG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBmaXJzdCBlbGVtZW50IGZyb20gdGhlIG9uTG9vcExpc3Rcblx0ICogQG1ldGhvZCBnZXRGaXJzdFxuXHQgKiBAcmV0dXJuIHtHYW1lT2JqZWN0fSB0aGUgZmlyc3QgZ2FtZSBvYmplY3QgaW4gdGhlIGxpc3Qgb3IgbnVsbCBpZiB0aGUgbGlzdCBpcyBlbXB0eVxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmdldEZpcnN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW5kZXgoMCk7XG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBlbGVtZW50IG1hdGNoaW5nIHRoZSBwcm92aWRlZCBpbmRleFxuXHQgKiBAbWV0aG9kIGdldEluZGV4XG5cdCAqIEBwYXJhbSB7aW50fSBpbmRleCB0aGUgaW5kZXggb2YgdGhlIG9iamVjdCB0byBnZXQgZnJvbSB0aGUgZ2FtZSBvYmplY3RzIGxpc3Rcblx0ICogQHJldHVybiB7R2FtZU9iamVjdH0gdGhlIGdhbWUgb2JqZWN0IGF0IHRoZSBzcGVjaWZpZWQgaW5kZXggb3IgbnVsbCBpZiBpdCBpcyBub3QgaW4gdGhlIGxpc3Rcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5nZXRJbmRleCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2dhbWVPYmplY3RzWyBpbmRleCBdO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIGVsZW1lbnQgbWF0Y2hpbmcgdGhlIHByb3ZpZGVkIGtleS5cblx0ICogQ2FjaGVzIHRoZSBsYXN0IG9iamVjdCByZXRyZWl2ZWQgZm9yIGZhc3RlciBwZXJmb3JtYW5jZS5cblx0ICogQG1ldGhvZCBnZXRcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleSB0aGUga2V5IG9mIHRoZSBvYmplY3QgdG8gZ2V0IGZyb20gdGhlIGdhbWUgb2JqZWN0cyBsaXN0XG5cdCAqIEByZXR1cm4ge0dhbWVPYmplY3R9IHRoZSBnYW1lIG9iamVjdCBtYXRjaGluZyB0aGUgcHJvdmlkZWQga2V5IG9yIG51bGwgaWYgaXQgaXMgbm90IGluIHRoZSBsaXN0XG5cdCAqIEBleGFtcGxlXG5cdFx0XHR2YXIgbmluamEgPSB0aGlzLmdldChcIm5pbmphXCIpO1xuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuXG5cdFx0aWYgKCB0aGlzLmNhY2hlICYmIHRoaXMuY2FjaGUua2V5ID09IGtleSApIHtcblx0XHRcdHJldHVybiB0aGlzLmNhY2hlO1xuXHRcdH1cblxuXHRcdHZhciBpID0gdGhpcy5fZ2FtZU9iamVjdHMubGVuZ3RoLCBcblx0XHRcdGN1cnJlbnQ7XG5cblx0XHR3aGlsZSAoIGktLSApIHtcblx0XHRcdGN1cnJlbnQgPSB0aGlzLl9nYW1lT2JqZWN0c1tpXTtcblx0XHRcdGlmICgga2V5ID09IGN1cnJlbnQua2V5ICkge1xuXHRcdFx0XHR0aGlzLmNhY2hlID0gY3VycmVudDtcblx0XHRcdFx0cmV0dXJuIGN1cnJlbnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBudWxsO1xuXG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBlbGVtZW50IG1hdGNoaW5nIHRoZSBwcm92aWRlZCBrZXkuXG5cdCAqIENhY2hlcyB0aGUgbGFzdCBvYmplY3QgcmV0cmVpdmVkIGZvciBmYXN0ZXIgcGVyZm9ybWFuY2UuXG5cdCAqIEBtZXRob2QgZ2V0XG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgdGhlIGtleSBvZiB0aGUgb2JqZWN0IHRvIGdldCBmcm9tIHRoZSBnYW1lIG9iamVjdHMgbGlzdFxuXHQgKiBAcmV0dXJuIHtHYW1lT2JqZWN0fSB0aGUgZ2FtZSBvYmplY3QgbWF0Y2hpbmcgdGhlIHByb3ZpZGVkIGtleSBvciBudWxsIGlmIGl0IGlzIG5vdCBpbiB0aGUgbGlzdFxuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dmFyIG5pbmphID0gdGhpcy5nZXQoXCJuaW5qYVwiKTtcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5nZXRFbnRpdGllc0J5TmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcblxuXHRcdHZhciBlbnRpdGllcyA9IFtdLFxuXHRcdFx0aSA9IHRoaXMuX2dhbWVPYmplY3RzLmxlbmd0aCwgXG5cdFx0XHRjdXJyZW50O1xuXG5cdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHRjdXJyZW50ID0gdGhpcy5fZ2FtZU9iamVjdHNbaV07XG5cdFx0XHRpZiAoIGN1cnJlbnQubmFtZSA9PT0gbmFtZSApIHtcblx0XHRcdFx0ZW50aXRpZXMucHVzaChjdXJyZW50KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGVudGl0aWVzO1xuXG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBsYXN0IGVsZW1lbnQgZnJvbSB0aGUgb25Mb29wTGlzdFxuXHQgKiBAbWV0aG9kIGdldExhc3Rcblx0ICogQHJldHVybiB7R2FtZU9iamVjdH0gdGhlIGxhc3QgZ2FtZSBvYmplY3QgaW4gdGhlIGxpc3Qgb3IgbnVsbCBpZiB0aGUgbGlzdCBpcyBlbXB0eVxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmdldExhc3QgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRJbmRleCggdGhpcy5fZ2FtZU9iamVjdHMubGVuZ3RoIC0gMSApO1xuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoZSBlbGVtZW50IGlzIGluIHRoZSBnYW1lIG9iamVjdHMgbGlzdCBhbmQgZmFsc2UgaWYgbm90XG5cdCAqIEBtZXRob2QgaXNPbkxvb3BMaXN0XG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgdGhlIG9iamVjdCB0byBkZXRlcm1pbmUgaWYgaXQgaXMgcHJlc2VudCBpbiB0aGUgZ2FtZSBvYmplY3QgbGlzdFxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIHRoZSBvYmplY3QgaW4gaW4gdGhlIGxpc3QsIGZhbHNlIGlmIG5vdFxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmlzSW5Pbkxvb3BMaXN0ID0gZnVuY3Rpb24ob2JqZWN0KSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dhbWVPYmplY3RzLmluZGV4T2Yob2JqZWN0KSAhPSAtMTtcblx0fTtcblx0TWF0Y2gucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgXG4gICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1tpXSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGFyZ3VtZW50c1tpXSA9IE0uY3JlYXRlRW50aXR5KGFyZ3VtZW50c1tpXSk7XG4gICAgICB9XG4gICAgICBcblx0XHRcdHRoaXMucHVzaEdhbWVPYmplY3QoYXJndW1lbnRzW2ldKTtcbiAgICAgIFxuXHRcdH1cblx0XG5cdFx0cmV0dXJuIHtcblx0XHRcblx0XHRcdG9iamVjdHM6IGFyZ3VtZW50cyxcblx0XHRcdFxuXHRcdFx0dG86IGZ1bmN0aW9uKGxheWVyTmFtZSkge1xuXHRcdFx0XHRcbiAgICAgICAgaWYgKCAhbGF5ZXJOYW1lICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuICAgICAgICBcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdGhpcy5vYmplY3RzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIE0uYWRkVG9MYXllcihsYXllck5hbWUsIHRoaXMub2JqZWN0c1tpXSk7XG4gICAgICAgIH1cblx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHR9O1xuXHRNYXRjaC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKysgKSB7XG5cdFx0XHR0aGlzLnJlbW92ZUdhbWVPYmplY3QoYXJndW1lbnRzW2ldKTtcblx0XHR9XG5cdFxuXHRcdHJldHVybiB7XG5cdFx0XG5cdFx0XHRvYmplY3RzOiBhcmd1bWVudHMsXG5cdFx0XHRcblx0XHRcdGZyb206IGZ1bmN0aW9uKGxheWVyTmFtZSkge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR2YXIgbGF5ZXIgPSBNLmxheWVyKGxheWVyTmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdGlmICggbGF5ZXIgKSB7XG5cdFx0XHRcdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgdGhpcy5vYmplY3RzLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0XHRcdFx0bGF5ZXIucmVtb3ZlKHRoaXMub2JqZWN0c1tpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdH1cblxuXHR9O1xuICAvKipcbiAgICogQWRkcyBhIGdhbWUgb2JqZWN0IHRvIGEgbGF5ZXIuIElmIHRoZSBsYXllciBkb2VzIG5vdCBleGlzdCBpdCBjcmVhdGVzIGl0IGFuZCB0aGVuIGFkZHMgdGhlIG9iamVjdCB0byBpdC5cbiAgICovXG4gIE1hdGNoLnByb3RvdHlwZS5hZGRUb0xheWVyID0gZnVuY3Rpb24obGF5ZXJOYW1lLCBlbnRpdHkpIHtcbiAgICBcbiAgICBpZiAoICFsYXllck5hbWUgKSB7XG4gICAgXHRyZXR1cm47XG4gICAgfVxuICAgIFxuICAgIGlmICghZW50aXR5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICAgICBcbiAgICB2YXIgbGF5ZXIgPSB0aGlzLmxheWVyKGxheWVyTmFtZSkgfHwgdGhpcy5jcmVhdGVHYW1lTGF5ZXIobGF5ZXJOYW1lKTtcbiAgICBcbiAgICBsYXllci5hZGQoZW50aXR5KTtcbiAgICBcbiAgfTtcblx0TWF0Y2gucHJvdG90eXBlLnB1c2ggPSBNYXRjaC5wcm90b3R5cGUuYWRkO1x0XG5cdC8qKlxuXHQgKiBQdXNoZXMgYSBnYW1lIG9iamVjdCwgdGhhdCBpcyBhbiBvYmplY3QgdGhhdCBpbXBsZW1lbnRzIGFuIG9uTG9vcCBtZXRob2QsIHRvIHRoZSBnYW1lIG9iamVjdCBsaXN0LlxuXHQgKiBOT1RFOiBJZiB0aGUgb2JqZWN0IGRvZXMgbm90IGltcGxlbWVudCBvbkxvb3AgdGhlbiB0aGlzIG1ldGhvZCB3aWxsIHRocm93IGFuIEVycm9yXG5cdCAqIEBtZXRob2QgcHVzaEdhbWVPYmplY3Rcblx0ICogQHBhcmFtIHtHYW1lT2JqZWN0fSBnYW1lT2JqZWN0IHRoZSBvYmplY3QgdG8gcHVzaCB0byB0aGUgZ2FtZSBvYmplY3QgbGlzdFxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLnB1c2hHYW1lT2JqZWN0ID0gZnVuY3Rpb24oZ2FtZU9iamVjdCkge1xuXHRcdFxuXHRcdGlmICggIWdhbWVPYmplY3Qub25Mb29wICkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGFkZCBvYmplY3QgXCIgKyBnYW1lT2JqZWN0LmNvbnN0cnVjdG9yLm5hbWUgKyBcIiwgaXQgZG9lc24ndCBoYXZlIGFuIG9uTG9vcCBtZXRob2RcIik7XG5cdFx0XG4gICAgaWYgKCBnYW1lT2JqZWN0IGluc3RhbmNlb2YgdGhpcy5FbnRpdHkgKSB7XG5cdFx0XHRcbiAgICAgIHRoaXMuX2dhbWVPYmplY3RzLnB1c2goZ2FtZU9iamVjdCk7XG4gICAgICBcbiAgICAgIHZhciBsYXllciA9IGdhbWVPYmplY3QuYXR0cmlidXRlKFwibGF5ZXJcIik7XG4gICAgICBcbiAgICAgIGlmIChsYXllcikge1xuICAgICAgICB0aGlzLmFkZFRvTGF5ZXIobGF5ZXIsIGdhbWVPYmplY3QpO1xuICAgICAgfVxuICAgICAgXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX3RyaWdnZXJzLnB1c2goZ2FtZU9iamVjdCk7XG5cdFx0fVxuXG5cdFx0Ly8gdGhpcy5vbkdhbWVPYmplY3RQdXNoZWQucmFpc2UoKTtcblx0XHR0aGlzLnJhaXNlKFwiZ2FtZU9iamVjdFB1c2hlZFwiKTtcblxuXHR9O1xuXHQvKipcblx0ICogU2hvcnRjdXQgdG8gcHVzaEdhbWVPYmplY3Rcblx0ICogQG1ldGhvZCBwdXNoT2JqZWN0XG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUucHVzaE9iamVjdCA9IE1hdGNoLnByb3RvdHlwZS5wdXNoR2FtZU9iamVjdDtcblx0LyoqXG5cdCAqIFJlbW92ZXMgYW4gZWxlbWVudCBmcm9tIHRoZSBnYW1lIG9iamVjdCBsaXN0XG5cdCAqIEBtZXRob2QgcmVtb3ZlR2FtZU9iamVjdFxuXHQgKiBAcGFyYW0ge0dhbWVPYmplY3R9IGdhbWVPYmplY3QgdGhlIG9iamVjdCB0byByZW1vdmUgZnJvbSB0aGUgZ2FtZSBvYmplY3QgbGlzdFxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLnJlbW92ZUdhbWVPYmplY3QgPSBmdW5jdGlvbiggb2JqZWN0ICkge1xuXG5cdFx0aWYgKCBvYmplY3QgIT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRpZiAoIHR5cGVvZiBvYmplY3QgPT0gXCJzdHJpbmdcIiApIHtcblxuXHRcdFx0XHR0aGlzLnJlbW92ZUdhbWVPYmplY3QoIHRoaXMuZ2V0KCBvYmplY3QgKSApO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCBpc05hTiggb2JqZWN0ICkgKSB7XG5cblx0XHRcdFx0dmFyIGluZGV4ID0gdGhpcy5fZ2FtZU9iamVjdHMuaW5kZXhPZiggb2JqZWN0ICk7XG5cblx0XHRcdFx0aWYgKCBpbmRleCAhPSAtMSApIHtcblxuXHRcdFx0XHRcdHRoaXMuX2dhbWVPYmplY3RzLnNwbGljZSggaW5kZXgsIDEpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIHRoaXMub25HYW1lT2JqZWN0UmVtb3ZlZC5yYWlzZSgpO1xuXHRcdFx0XHRcdHRoaXMucmFpc2UoXCJnYW1lT2JqZWN0UmVtb3ZlZFwiKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0dGhpcy5fZ2FtZU9iamVjdHMuc3BsaWNlKCBvYmplY3QsIDEpO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gdGhpcy5vbkdhbWVPYmplY3RSZW1vdmVkLnJhaXNlKCk7XG5cdFx0XHRcdHRoaXMucmFpc2UoXCJnYW1lT2JqZWN0UmVtb3ZlZFwiKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH07XG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBnYW1lIG9iamVjdCBsaXN0XG5cdCAqIEBtZXRob2QgcmVtb3ZlQWxsR2FtZU9iamVjdHNcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5yZW1vdmVBbGxHYW1lT2JqZWN0cyA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX2dhbWVPYmplY3RzID0gbmV3IEFycmF5KCk7XG5cdH07XG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IGdhbWUgbGF5ZXIsIGFkZHMgaXQgdG8gdGhlIGdhbWUgbGF5ZXIgbGlzdCBhbmQgcmV0dXJucyBpdFxuXHQgKlxuXHQgKiBAbWV0aG9kIGNyZWF0ZUdhbWVMYXllclxuXHQgKiBAcGFyYW0gbmFtZSBuYW1lIG9mIHRoZSBsYXllclxuXHQgKiBAcGFyYW0gekluZGV4IHotaW5kZXggb2YgdGhlIGxheWVyXG5cdCAqIEByZXR1cm4ge0dhbWVMYXllcn0gdGhlIG5ld2x5IGNyZWF0ZWQgbGF5ZXJcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5jcmVhdGVHYW1lTGF5ZXIgPSBmdW5jdGlvbihuYW1lLCB6SW5kZXgpIHtcblx0XHRpZiAoIG5hbWUgPT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgbGF5ZXIuIFlvdSBtdXN0IG5hbWUgaXQuXCIpO1xuXHRcdH1cblx0XHR2YXIgZ2FtZUxheWVyID0gbmV3IHRoaXMuR2FtZUxheWVyKG5hbWUsIHpJbmRleCB8fCBNLl9nYW1lTGF5ZXJzLmxlbmd0aCk7XG5cdFx0dGhpcy5wdXNoR2FtZUxheWVyKG5hbWUsIGdhbWVMYXllcik7XG5cdFx0cmV0dXJuIGdhbWVMYXllcjtcblx0fTtcblx0LyoqXG5cdCAqIFNob3J0Y3V0IHRvIGNyZWF0ZUdhbWVMYXllclxuXHQgKiBAbWV0aG9kIGNyZWF0ZUdhbWVMYXllclxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmNyZWF0ZUxheWVyID0gTWF0Y2gucHJvdG90eXBlLmNyZWF0ZUdhbWVMYXllcjtcblx0LyoqXG5cdCAqIEFkZHMgYSBnYW1lIGxheWVyIHRvIHRoZSBsaXN0IG9mIGxheWVyc1xuXHQgKlxuXHQgKiBAbWV0aG9kIHB1c2hHYW1lTGF5ZXJcblx0ICogQHBhcmFtIHtHYW1lTGF5ZXJ9IGdhbWVMYXllciB0aGUgbGF5ZXIgdG8gYWRkIHRvIHRoZSBsaXN0IG9mIGxheWVyc1xuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dmFyIGxheWVyID0gbmV3IE0uR2FtZUxheWVyKCk7XG5cdFx0XHRNLnB1c2hHYW1lTGF5ZXIobGF5ZXIpO1xuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLnB1c2hHYW1lTGF5ZXIgPSBmdW5jdGlvbihuYW1lLCBnYW1lTGF5ZXIpIHtcblx0XHRpZiAoIGdhbWVMYXllciA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGFkZCBudWxsIGdhbWUgbGF5ZXJcIik7XG5cdFx0fVxuXHRcdHRoaXMuX2dhbWVMYXllcnMuc2V0KG5hbWUsIGdhbWVMYXllcik7XG5cdFx0dGhpcy5yYWlzZShcImdhbWVMYXllclB1c2hlZFwiLCBuYW1lKTtcblx0fTtcblx0LyoqXG5cdCAqIFNob3J0Y3V0IHRvIHB1c2hHYW1lTGF5ZXJcblx0ICogQG1ldGhvZCBjcmVhdGVHYW1lTGF5ZXJcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5wdXNoTGF5ZXIgPSBNYXRjaC5wcm90b3R5cGUucHVzaEdhbWVMYXllcjtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGN1cnJlbnQgc2NlbmVcblx0ICogQG1ldGhvZCBzZXRTY2VuZVxuXHQgKiBAcGFyYW0ge1NjZW5lfSBzY2VuZSB0aGUgc2NlbmUgdG8gbG9hZFxuXHQgKiBAcGFyYW0ge0xheWVyfSBhIGxheWVyIHRoYXQgd2lsbCBiZSBzaG93biB3aGVuIGxvYWRpbmdcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNpdGlvbiB0aGUgdHJhbnNpdGlvbiBhcHBsaWVkIHRvIHRoZSBzY2VuZSB0aGF0IGlzIGxlYXZpbmcgYW5kIHRoZSBvbmUgdGhhdCBpcyBlbnRlcmluZ1xuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLnNldFNjZW5lID0gZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrKSB7XG5cblx0XHR2YXIgc2NlbmUgPSB0aGlzLmdldFNjZW5lKG5hbWUpO1xuXG5cdFx0aWYgKCBzY2VuZSApIHtcblx0XHRcdHRoaXMubG9nZ2VyLmxvZyhcIkxvYWRpbmcgc2NlbmUgYnkgbmFtZVwiLCBuYW1lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sb2dnZXIuZXJyb3IoXCJVbmFibGUgdG8gbG9hZCBzY2VuZSBieSBuYW1lXCIsIG5hbWUsIFwiSXQgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMucmVtb3ZlU2NlbmUoKTtcblxuXHRcdGlmICggc2NlbmUuZnVsbFNjcmVlbiApIHtcblx0XHRcdHRoaXMuc2V0RnVsbFNjcmVlbigpO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIHNjZW5lLmxvYWRpbmdTY2VuZSApIHtcblx0XHRcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XG5cdFx0XHR0aGlzLnNldFNjZW5lKHNjZW5lLmxvYWRpbmdTY2VuZSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdFx0dmFyIHNvdW5kc1JlYWR5ID0gZmFsc2UsXG5cdFx0XHRcdFx0c3ByaXRlc1JlYWR5ID0gZmFsc2UsXG5cdFx0XHRcdFx0bG9hZGluZ1NjZW5lID0gc2VsZi5nZXRTY2VuZShzY2VuZS5sb2FkaW5nU2NlbmUpLFxuXHRcdFx0XHRcdGxvYWRpbmdGaW5pc2hlZCA9IGZhbHNlLFxuXHRcdFx0XHRcdGNoZWNrTG9hZGluZyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCAhbG9hZGluZ0ZpbmlzaGVkICYmIHNvdW5kc1JlYWR5ICYmIHNwcml0ZXNSZWFkeSApIHtcblx0XHRcdFx0XHRcdFx0c2VsZi5zcHJpdGVzLnJlbW92ZUFsbEV2ZW50TGlzdGVuZXJzKCk7XG5cdFx0XHRcdFx0XHRcdHNlbGYuc291bmRzLnJlbW92ZUFsbEV2ZW50TGlzdGVuZXJzKCk7XG5cdFx0XHRcdFx0XHRcdHNlbGYucmVtb3ZlQWxsR2FtZUxheWVycygpO1xuXHRcdFx0XHRcdFx0XHRmb3IgKCB2YXIgaSBpbiBsb2FkaW5nU2NlbmUuc3ByaXRlcyApIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIHNjZW5lLnNwcml0ZXNbaV0gPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0c2VsZi5zcHJpdGVzLnJlbW92ZShpKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Zm9yICggdmFyIGkgaW4gbG9hZGluZ1NjZW5lLnNvdW5kcyApIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIHNjZW5lLnNvdW5kc1tpXSA9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzZWxmLnNvdW5kcy5yZW1vdmUoaSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBpZiAoc2NlbmUubWFwKSB7XG4gICAgICAgICAgICAgICAgLy9UT0RPOiBTaG91bGQgYWRkIHRvIHRoZSBsb2FkaW5nXG4gICAgICAgICAgICAgICAgTS5jcmVhdGVNYXAoc2NlbmUubWFwKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaWYgKHNjZW5lLm9uTG9hZCkge1xuICAgICAgICAgICAgICAgIHNjZW5lLm9uTG9hZCgpO1xuICAgICAgICAgICAgICAgIE0ucmVuZGVyZXIucmVkcmF3QWxsTGF5ZXJzKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG5cdFx0XHRcdFx0XHRcdGxvYWRpbmdGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgIFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XG5cdFx0XHRcdGlmICggc2NlbmUuc291bmRzICkge1xuXHRcdFx0XHRcdHNlbGYuc291bmRzLmxvYWQoc2NlbmUuc291bmRzLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHNvdW5kc1JlYWR5ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdGNoZWNrTG9hZGluZygpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNvdW5kc1JlYWR5ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggc2NlbmUuc3ByaXRlcyApIHtcblx0XHRcdFx0XHRzZWxmLnNwcml0ZXMubG9hZChzY2VuZS5zcHJpdGVzLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHNwcml0ZXNSZWFkeSA9IHRydWU7XG5cdFx0XHRcdFx0XHRjaGVja0xvYWRpbmcoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzcHJpdGVzUmVhZHkgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRjaGVja0xvYWRpbmcoKTtcblx0XHRcdFx0XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHZhciBzb3VuZHNSZWFkeSA9IGZhbHNlLFxuXHRcdFx0XHRzcHJpdGVzUmVhZHkgPSBmYWxzZSxcblx0XHRcdFx0bG9hZGluZ0ZpbmlzaGVkID0gZmFsc2UsXG5cdFx0XHRcdGNoZWNrTG9hZGluZyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICggIWxvYWRpbmdGaW5pc2hlZCAmJiBzb3VuZHNSZWFkeSAmJiBzcHJpdGVzUmVhZHkgKSB7XG5cdFx0XHRcdFx0XHRsb2FkaW5nRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoc2NlbmUubWFwKSB7XG4gICAgICAgICAgICAgIC8vVE9ETzogU2hvdWxkIGFkZCB0byB0aGUgbG9hZGluZ1xuICAgICAgICAgICAgICBNLmNyZWF0ZU1hcChzY2VuZS5tYXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoc2NlbmUub25Mb2FkKSB7XG4gICAgICAgICAgICAgIHNjZW5lLm9uTG9hZCgpO1xuICAgICAgICAgICAgICBNLnJlbmRlcmVyLnJlZHJhd0FsbExheWVycygpO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCBjYWxsYmFjayApIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0aWYgKCBzY2VuZS5zb3VuZHMgKSB7XG5cdFx0XHRcdHRoaXMuc291bmRzLmxvYWQoc2NlbmUuc291bmRzLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0c291bmRzUmVhZHkgPSB0cnVlO1xuXHRcdFx0XHRcdGNoZWNrTG9hZGluZygpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNvdW5kc1JlYWR5ID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBzY2VuZS5zcHJpdGVzICkge1xuXG5cdFx0XHRcdHRoaXMuc3ByaXRlcy5sb2FkKHNjZW5lLnNwcml0ZXMsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvL1RPRE86IFRoaXMgaXMgdXNlZCBmb3Igc2NlbmVzIHRoYXQgY29tZSB3aXRoIHRoZSBvYmplY3RzIGFuZCBsYXllcnMgYWxyZWFkeSBkZWZpbmVkXG5cdFx0XHRcdFx0Ly8gZm9yICggdmFyIGkgaW4gc2NlbmUubGF5ZXJzICkge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIFx0dmFyIGxheWVyID0gbmV3IG0uTGF5ZXIsXG5cdFx0XHRcdFx0Ly8gXHRcdGxheWVyRGF0YSA9IHNjZW5lLmxheWVyc1tpXTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIFx0Zm9yICggdmFyIGogaW4gbGF5ZXJEYXRhICkge1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gXHRcdHZhciBvYmplY3QgPSBsYXllckRhdGFbal0sXG5cdFx0XHRcdFx0Ly8gXHRcdFx0aW5zdGFuY2UgPSBtLl9nZXRDbGFzc0luc3RhbmNlKG9iamVjdC5jbGFzc05hbWUsIG9iamVjdC5zZXRBdHRyaWJ1dGVzKTtcblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBcdFx0aWYgKCBvYmplY3QuYmVmb3JlUHVzaCApIHtcblx0XHRcdFx0XHQvLyBcdFx0XHRvYmplY3QuYmVmb3JlUHVzaChpbnN0YW5jZSk7XG5cdFx0XHRcdFx0Ly8gXHRcdH1cblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gXHRcdGxheWVyLnB1c2goaW5zdGFuY2UpO1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBcdH1cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIFx0bS5wdXNoTGF5ZXIobGF5ZXIpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gfVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIGZvciAoIHZhciBpIGluIHNjZW5lLm9iamVjdHMgKSB7XG5cdFx0XHRcdFx0Ly8gXHR2YXIgb2JqZWN0ID0gc2NlbmUub2JqZWN0c1tpXSxcblx0XHRcdFx0XHQvLyBcdFx0aW5zdGFuY2UgPSBtLl9nZXRDbGFzc0luc3RhbmNlKG9iamVjdC5jbGFzc05hbWUsIG9iamVjdC5zZXRBdHRyaWJ1dGVzKTtcblx0XHRcdFx0XHQvLyBcdGlmICggb2JqZWN0LmJlZm9yZVB1c2ggKSB7XG5cdFx0XHRcdFx0Ly8gXHRcdG9iamVjdC5iZWZvcmVQdXNoKGluc3RhbmNlKTtcblx0XHRcdFx0XHQvLyBcdH1cblx0XHRcdFx0XHQvLyBcdG0ucHVzaEdhbWVPYmplY3QoaW5zdGFuY2UpO1xuXHRcdFx0XHRcdC8vIH1cblxuXHRcdFx0XHRcdHNwcml0ZXNSZWFkeSA9IHRydWU7XG5cdFx0XHRcdFx0Y2hlY2tMb2FkaW5nKCk7XG5cblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzcHJpdGVzUmVhZHkgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRjaGVja0xvYWRpbmcoKTtcblxuXHRcdH1cblx0XHRcblx0fTtcblx0LyoqXG5cdCAqIFRPRE86IENvbXBsZXRlIEpTIERvY1xuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLnJlbW92ZVNjZW5lID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5yZW1vdmVBbGxHYW1lT2JqZWN0cygpO1xuXHRcdHRoaXMucmVtb3ZlQWxsR2FtZUxheWVycygpO1xuXHRcdHRoaXMuc3ByaXRlcy5yZW1vdmVBbGxFdmVudExpc3RlbmVycygpO1xuXHRcdHRoaXMuc291bmRzLnJlbW92ZUFsbEV2ZW50TGlzdGVuZXJzKCk7XG5cdFx0dGhpcy5jcmVhdGVHYW1lTGF5ZXIodGhpcy5ERUZBVUxUX0xBWUVSX05BTUUpLmJhY2tncm91bmQgPSB0aGlzLkRFRkFVTFRfTEFZRVJfQkFDS0dST1VORDtcblx0XHR0aGlzLnJhaXNlKFwic2NlbmVSZW1vdmVkXCIpO1xuXHR9O1xuXHQvKipcblx0ICogUHVzaGVzIGFsbCBwcm92aWRlZCBsYXllcnMgaW50byBNYXRjaCBsaXN0IG9mIGdhbWUgbGF5ZXJzXG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUucHVzaFNjZW5lID0gZnVuY3Rpb24obGF5ZXJzKSB7XG5cdFx0dmFyIGkgPSAwLCBsID0gbGF5ZXJzLmxlbmd0aDtcblx0XHRmb3IgKCA7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHR0aGlzLnB1c2hHYW1lTGF5ZXIobGF5ZXJzW2ldKTtcblx0XHR9XG5cdFx0dGhpcy5yYWlzZShcInNjZW5lUHVzaGVkXCIpO1xuXHR9O1xuXHQvKipcblx0ICogUmVtb3ZlcyBjdXJyZW50IGxheWVycyBhbmQgb3VzaGVzIGFsbCBwcm92aWRlZCBsYXllcnMgaW50byBNYXRjaCBsaXN0IG9mIGdhbWUgbGF5ZXJzXG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUuc3dhcFNjZW5lcyA9IGZ1bmN0aW9uKGxheWVycykge1xuXHRcdHZhciBsYXllcnMgPSB0aGlzLnJlbW92ZVNjZW5lKCk7XG5cdFx0dGhpcy5wdXNoU2NlbmUobGF5ZXJzKTtcblx0XHRyZXR1cm4gbGF5ZXJzO1xuXHR9O1xuXHQvKipcblx0ICogUmVtb3ZlcyBhIGdhbWUgbGF5ZXIgZnJvbSB0aGUgbGlzdCBvZiBsYXllcnNcblx0ICpcblx0ICogQG1ldGhvZCByZW1vdmVHYW1lTGF5ZXJcblx0ICogQHBhcmFtIHtHYW1lTGF5ZXJ9IGdhbWVMYXllciB0aGUgbGF5ZXIgcmVtb3ZlIGZyb20gdGhlIGxpc3Qgb2YgbGF5ZXJzXG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUucmVtb3ZlR2FtZUxheWVyID0gZnVuY3Rpb24obmFtZSkge1xuXHRcdFxuXHRcdHZhciBsYXllciA9IHRoaXMuX2dhbWVMYXllcnMuZ2V0KG5hbWUpO1xuXG5cdFx0aWYgKCBsYXllciApIHtcblxuXHRcdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgbGF5ZXIub25SZW5kZXJMaXN0Lmxlbmd0aDsgaSsrICkge1xuXHRcdFx0XHR0aGlzLnJlbW92ZUdhbWVPYmplY3QobGF5ZXIub25SZW5kZXJMaXN0W2ldKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fZ2FtZUxheWVycy5yZW1vdmUobmFtZSk7XG5cblx0XHRcdHRoaXMucmVuZGVyZXIuX3JlUmVuZGVyQWxsTGF5ZXJzID0gdHJ1ZTtcblxuXHRcdFx0dGhpcy5yYWlzZShcImdhbWVMYXllclJlbW92ZWRcIiwgbmFtZSk7XG5cblx0XHRcdHJldHVybiBsYXllcjtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XG5cdFx0XHR0aGlzLmxvZ2dlci5lcnJvcihcImNvdWxkIG5vdCByZW1vdmUgbGF5ZXIgYnkgbmFtZVwiLCBuYW1lKTtcblx0XHRcblx0XHR9XG5cblx0fTtcblx0LyoqXG5cdCAqIFNob3J0Y3V0IHRvIHJlbW92ZUdhbWVMYXllclxuXHQgKlxuXHQgKiBAbWV0aG9kIHJlbW92ZUxheWVyXG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUucmVtb3ZlTGF5ZXIgPSBNYXRjaC5wcm90b3R5cGUucmVtb3ZlR2FtZUxheWVyO1xuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgZ2FtZSBsYXllcnNcblx0ICpcblx0ICogQG1ldGhvZCByZW1vdmVBbGxHYW1lTGF5ZXJzXG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUucmVtb3ZlQWxsR2FtZUxheWVycyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLl9nYW1lTGF5ZXJzLmVhY2hLZXkoZnVuY3Rpb24obGF5ZXIpIHtcblx0XHRcdHNlbGYucmVtb3ZlR2FtZUxheWVyKGxheWVyKTtcblx0XHR9KTtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgYSBzcGVlZCBtZWFzdXJlZCBpbiBwaXhlbHMgYmFzZWQgb24gdGhlIGF2ZXJhZ2UgZnBzXG5cdCAqXG5cdCAqIEBtZXRob2QgZ2V0U3BlZWRcblx0ICogQHBhcmFtIHtpbnR9IHBpeGVsc1BlclNlY29uZCB0aGUgYW1vdW50IG9mIHBpeGVscyB0aGF0IGFuIG9iamVjdCBzaG91bGQgYmUgbW92ZWQgcGVyIHNlY29uZFxuXHQgKiBAcmV0dXJuIHtmbG9hdH0gdGhlIHBpeGVscyB0byBtb3ZlIHRoZSBvYmplY3QgcmVsYXRpdmUgdG8gdGhlIGF2ZXJhZ2UgZnBzIG9mIHRoZSBjdXJyZW50IGRldmljZVxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmdldFNwZWVkID0gZnVuY3Rpb24oIHBpeGVsc1BlclNlY29uZCApIHtcblx0XHRyZXR1cm4gcGl4ZWxzUGVyU2Vjb25kIC8gdGhpcy5nZXRBdmVyYWdlRnBzKCk7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgc3BlZWQgbWVhc3VyZWQgaW4gcGl4ZWxzIGJhc2VkIG9uIHRoZSBhdmVyYWdlIGZwc1xuXHQgKlxuXHQgKiBAbWV0aG9kIGdldFNwZWVkXG5cdCAqIEBwYXJhbSB7aW50fSBwaXhlbHNQZXJTZWNvbmQgdGhlIGFtb3VudCBvZiBwaXhlbHMgdGhhdCBhbiBvYmplY3Qgc2hvdWxkIGJlIG1vdmVkIHBlciBzZWNvbmRcblx0ICogQHJldHVybiB7ZmxvYXR9IHRoZSBwaXhlbHMgdG8gbW92ZSB0aGUgb2JqZWN0IHJlbGF0aXZlIHRvIHRoZSBhdmVyYWdlIGZwcyBvZiB0aGUgY3VycmVudCBkZXZpY2Vcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5nZXRTcGVlZEZpeGVkQXQgPSBmdW5jdGlvbiggcGl4ZWxzUGVyU2Vjb25kLCBmcHMgKSB7XG5cblx0XHR2YXIgYXZnRnBzID0gdGhpcy5nZXRBdmVyYWdlRnBzKCk7XG5cblx0XHRyZXR1cm4gKHBpeGVsc1BlclNlY29uZCAvIGF2Z0ZwcykgKiAoZnBzIC8gYXZnRnBzKTtcblxuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgY3VycmVudCBmcmFtZXMgcGVyIHNlY29uZFxuXHQgKiBAbWV0aG9kIGdldEZwc1xuXHQgKiBAcmV0dXJuIHtpbnR9IHRoZSBmcmFtZXMgcGVyIHNlY29uZFxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmdldEZwcyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLkZwc0NvdW50ZXIuZnBzO1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgYXZlcmFnZSBmcmFtZXMgcGVyIHNlY29uZFxuXHQgKiBAbWV0aG9kIGdldEF2ZXJhZ2VGcHNcblx0ICogQHJldHVybiB7aW50fSB0aGUgYXZlcmFnZSBmcmFtZXMgcGVyIHNlY29uZFxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmdldEF2ZXJhZ2VGcHMgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5GcHNDb3VudGVyLmdldEF2ZXJhZ2VGcHMoKTtcblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIHRvdGFsIGdhbWUgdGltZSBpbiBzZWNvbmRzXG5cdCAqIEBtZXRob2QgZ2V0R2FtZVRpbWVcblx0ICogQHJldHVybiB7aW50fSB0aGUgdG90YWwgZ2FtZSB0aW1lIGluIHNlY29uZHNcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5nZXRHYW1lVGltZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLkZwc0NvdW50ZXIuZ2FtZVRpbWU7XG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBjdXJyZW50IHRpbWUgaW4gbWlsbGlzZWNvbmRzIG1lYXN1cmVkIGJ5IHRoZSBGcHNDb3VudGVyXG5cdCAqIEBtZXRob2QgZ2V0VGltZVxuXHQgKiBAcmV0dXJuIHtsb25nfSB0aGUgY3VycmVudCB0aW1lIG1lYXN1cmVkIGluIG1pbGxpc2Vjb25kc1xuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmdldFRpbWUgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5GcHNDb3VudGVyLnRpbWVJbk1pbGxpcztcblx0fTtcblx0LyoqXG5cdCAqIEltbWVkaWF0ZWx5IGNsZWFycyB0aGUgZnJvbnQgYnVmZmVyXG5cdCAqIEBtZXRob2QgY2xlYXJGcm9udEJ1ZmZlclxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmNsZWFyRnJvbnRCdWZmZXIgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuZnJvbnRCdWZmZXIgKSB7XG5cdFx0XHR0aGlzLmZyb250QnVmZmVyLmNsZWFyUmVjdCgwLCAwLCB0aGlzLmZyb250QnVmZmVyLmNhbnZhcy53aWR0aCwgdGhpcy5mcm9udEJ1ZmZlci5jYW52YXMuaGVpZ2h0KTtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBTb3J0cyBsYXllcnMgYmFzZWQgb24gdGhlaXIgei1pbmRleFxuXHQgKiBAbWV0aG9kIHNvcnRMYXllcnNcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5zb3J0TGF5ZXJzID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fZ2FtZUxheWVycy5fdmFsdWVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0cmV0dXJuIGEuX3pJbmRleCAtIGIuX3pJbmRleDtcblx0XHR9KTtcblx0XHR0aGlzLl9nYW1lTGF5ZXJzLl9rZXlzID0ge307XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgdGhpcy5fZ2FtZUxheWVycy5fdmFsdWVzLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0dGhpcy5fZ2FtZUxheWVycy5fa2V5c1t0aGlzLl9nYW1lTGF5ZXJzLl92YWx1ZXNbaV0ubmFtZV0gPSBpO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFBhdXNlcyBvciB1bnBhdXNlcyB0aGUgZ2FtZSBsb29wLiBBbHNvIHJhaXNlcyB0aGUgTS5vblBhdXNlIG9yIE0ub25VblBhdXNlIGV2ZW50IHByb3ZpZGVkIHRob3NlIGFyZSBkZWZpbmVkXG5cdCAqIEBtZXRob2QgcGF1c2Vcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuXHRcblx0XHRpZiAoIHRoaXMuX2lzUGxheWluZyApIHtcblx0XHRcdC8vIGlmICggdGhpcy5vblBhdXNlICkgdGhpcy5vblBhdXNlKCk7XG5cdFx0XHR0aGlzLnJhaXNlKFwicGF1c2VcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmICggdGhpcy5vblVuUGF1c2UgKSB0aGlzLm9uVW5QYXVzZSgpO1xuXHRcdFx0dGhpcy5yYWlzZShcInVucGF1c2VcIik7XG5cdFx0fVxuXHRcblx0XHR0aGlzLl9pc1BsYXlpbmcgPSAhIHRoaXMuX2lzUGxheWluZztcblxuXHR9O1xuXHQvKipcblx0ICogU2V0cyBNYXRjaCB0byBsb29wIHRocm91Z2ggdGhlIHNjZW5lIHVzaW5nIHRoZSBwcm92aWRlZCBjYW52YXMuXG5cdCAqIFxuXHQgKiBOb3RlOiBJZiBtYXRjaCBpcyBwYXVzZWQsIHRvIHVucGF1c2UgdXNlIE0ucGF1c2UoKSwgdHJ5IG5vdCB0b1xuXHQgKiBjYWxsIHRoaXMgbWV0aG9kIGFnYWluIHVubGVzcyB5b3UgbmVlZCB0byBjaGFuZ2UgdGhlIGNhbnZhc1xuXHQgKlxuXHQgKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXMgdGhlIGNhbnZhcyB3aGVyZSB0byBwZXJmb3JtIHRoZSByZW5kZXJpbmdcblx0ICogQG1ldGhvZCBzdGFydFxuXHQgKiBAZXhhbXBsZVxuXHRcdFx0Ly9Vc2UgY2FudmFzIGJ5IGlkIGdhbWVDYW52YXMgYW5kIHVzZSBkb3VibGUgYnVmZmVyaW5nXG5cdFx0XHRNLnN0YXJ0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZUNhbnZhc1wiKSwgdHJ1ZSk7XG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbihjYW52YXMsIG1vZGUpIHtcblxuXHRcdGlmICggIWNhbnZhcyApIHtcblx0XHRcdGNhbnZhcyA9IE0uZG9tKFwiY2FudmFzXCIpO1xuXHRcdH1cblxuXHRcdGlmICggISAoY2FudmFzIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTS5zdGFydCBpcyBleHBlY3RpbmcgYW4gSFRNTENhbnZhc0VsZW1lbnQgYXMgYXJndW1lbnQuIElmIHRoZXJlJ3Mgbm8gY2FudmFzIGluIHRoZSBzaXRlLCBwbGVhc2UgYWRkIG9uZSBhbmQgdGhlbiBjYWxsIHN0YXJ0LiBJZiBNLmF1dG93aXJlIGlzIHRydWUgYW5kIHRoZXJlJ3Mgbm8gY2FudmFzIG9uIGRvY3VtZW50IGxvYWQgcGxlYXNlIHNldCBpdCB0byBmYWxzZS5cIik7XG5cdFx0fVxuXG5cdFx0Y2FudmFzLm9uc2VsZWN0c3RhcnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9O1xuXHRcdGNhbnZhcy5yZXF1ZXN0RnVsbFNjcmVlbiA9IGNhbnZhcy5yZXF1ZXN0RnVsbFNjcmVlbiB8fCBcblx0XHRcdFx0XHRcdFx0XHQgICBjYW52YXMud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4gfHwgXG5cdFx0XHRcdFx0XHRcdFx0ICAgY2FudmFzLm1velJlcXVlc3RGdWxsU2NyZWVuIHx8IFxuXHRcdFx0XHRcdFx0XHRcdCAgIGNhbnZhcy5tc1JlcXVlc3RGdWxsU2NyZWVuO1xuXG5cdFx0Y2FudmFzLnNldEF0dHJpYnV0ZShcImRhdGEtZW5naW5lXCIsIHRoaXMubmFtZSk7XG5cdFx0Y2FudmFzLnNldEF0dHJpYnV0ZShcImRhdGEtdmVyc2lvblwiLCB0aGlzLnZlcnNpb24pO1xuXG5cdFx0dGhpcy5yZW5kZXJlciA9IHRoaXMucmVuZGVyaW5nUHJvdmlkZXIuZ2V0UmVuZGVyZXIoY2FudmFzLCBtb2RlKTtcblxuXHRcdHRoaXMuX2lzUGxheWluZyA9IHRydWU7XG5cblx0XHRpZiAoICF0aGlzLmdhbWVMb29wQWxyZWFkeVNldHVwICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLnNldFVwR2FtZUxvb3AoKTtcblxuXHRcdFx0aWYgKCB0aGlzLnNob3dMb2dvICkge1xuXHRcdFx0XHR0aGlzLl9zaG93TG9nbygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5fcmVndWxhclN0YXJ0KCk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblxuXHR9O1xuXHRNYXRjaC5wcm90b3R5cGUuX3JlZ3VsYXJTdGFydCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5nYW1lRGF0YSAmJiB0aGlzLmdhbWVEYXRhLm1haW4gKSB7XG5cdFx0XHRpZiAoIHR5cGVvZiB0aGlzLmdhbWVEYXRhLm1haW4gPT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0dGhpcy5zZXRTY2VuZSh0aGlzLmdhbWVEYXRhLm1haW4pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5nYW1lRGF0YS5tYWluKCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICggdHlwZW9mIHdpbmRvdy5tYWluID09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdHdpbmRvdy5tYWluKCk7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogUmVtb3ZlcyB0aGUgcHJvdmlkZWQgaW5kZXggZnJvbSB0aGUgZ2l2ZW4gYXJyYXlcblx0ICogQG1ldGhvZCByZW1vdmVJbmRleEZyb21BcnJheVxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLnJlbW92ZUluZGV4RnJvbUFycmF5ID0gZnVuY3Rpb24oaW5kZXgsIGFycmF5KSB7XG5cdFx0YXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcblx0fTtcblx0LyoqXG5cdCAqIFJlbW92ZXMgdGhlIHByb3ZpZGVkIGVsZW1udCBmcm9tIHRoZSBnaXZlbiBhcnJheVxuXHQgKiBAbWV0aG9kIHJlbW92ZUVsZW1lbnRGcm9tQXJyYXlcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5yZW1vdmVFbGVtZW50RnJvbUFycmF5ID0gZnVuY3Rpb24oZWxlbWVudCwgYXJyYXkpIHtcblxuXHRcdHZhciBpbmRleCA9IGFycmF5LmluZGV4T2YoZWxlbWVudCk7XG5cblx0XHRpZiAoIGluZGV4ICE9IC0xICkge1xuXG5cdFx0XHR0aGlzLnJlbW92ZUluZGV4RnJvbUFycmF5KGluZGV4LCBhcnJheSk7XG5cblx0XHR9XG5cblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIEhUTUwgZWxlbWVudCBtYXRjaGluZyB0aGUgc2VsZWN0b3IuXG5cdCAqIEBtZXRob2QgZG9tXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciB0aGUgc2VsZWN0b3IgdXNlZCB0byByZXRyaWV2ZSBhbiBlbGVtZW50IG9mIHRoZSBkb21cblx0ICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHRoZSBlbGVtZW50IG9yIG51bGxcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5kb20gPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuXHRcdHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcblx0fTtcblx0LyoqXG5cdCAqIEFkZHMgdmFyaWFibGVzIGFuZCBmdW5jdGlvbiBjb250YWluZWQgaW4gcHJvcGVydGllcyB0byB0aGUgZ2l2ZW4gb2JqZWN0XG5cdCAqIEBtZXRob2QgYXBwbHlQcm9wZXJ0aWVzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgdGhlIG9iamVjdCB0byBhcHBseSB0aGUgcHJvcGVydGllcyB0b1xuXHQgKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllcyB0aGUgcHJvcGVydGllcyB0byBhcHBseSB0byB0aGUgb2JqZWN0XG5cdCAqIEBwYXJhbSB7QXJyYXl9IG1hbmRhdG9yeUxpc3QgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbWFuZGF0b3J5IHByb3BlcnRpZXMgdG8gYXBwbHkgYW5kIHRoYXQgc2hvdWxkIGJlIHByZXNlbnQgaW4gcHJvcGVydGllc1xuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmFwcGx5UHJvcGVydGllcyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydGllcywgbWFuZGF0b3J5TGlzdCkge1xuXG5cdFx0aWYgKCAhIG9iamVjdCApIHJldHVybjtcblx0XHRpZiAoICEgcHJvcGVydGllcyApIHJldHVybjtcblxuXHRcdGlmICggbWFuZGF0b3J5TGlzdCApIHtcblxuXHRcdFx0aWYgKCAhIHByb3BlcnRpZXMgKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBhcHBseSBudWxsIHByb3BlcnRpZXMgdG8gXCIgKyBvYmplY3QuY29uc3RydWN0b3IubmFtZSk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBpID0gbWFuZGF0b3J5TGlzdC5sZW5ndGg7XG5cblx0XHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0XHRpZiAoICEgcHJvcGVydGllc1ttYW5kYXRvcnlMaXN0W2ldXSApIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBhcHBseSBwcm9wZXJ0aWVzIHRvIFtcIiArIG9iamVjdC5jb25zdHJ1Y3Rvci5uYW1lICsgXCJdIFlvdSBtdXN0IHNwZWNpZnkgW1wiICsgbWFuZGF0b3J5TGlzdFtpXSArIFwiXVwiKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHZhciBzZXR0ZXIgPSBcIlwiO1xuXHRcdGZvciAoIHZhciBpIGluIHByb3BlcnRpZXMgKSB7XG5cdFx0XHRzZXR0ZXIgPSBcInNldFwiICsgaS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGkuc3Vic3RyKDEpO1xuXHRcdFx0aWYgKCBvYmplY3RbIHNldHRlciBdICkge1xuXHRcdFx0XHRvYmplY3RbIHNldHRlciBdKCBwcm9wZXJ0aWVzW2ldICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvYmplY3RbIGkgXSA9IHByb3BlcnRpZXNbIGkgXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb2JqZWN0O1xuXG5cdH07XG5cblx0LyoqXG5cdCAqIEFkZHMgdmFyaWFibGVzIGFuZCBmdW5jdGlvbiBjb250YWluZWQgaW4gcHJvcGVydGllcyB0byB0aGUgZ2l2ZW4gb2JqZWN0XG5cdCAqIEBtZXRob2QgYXBwbHlcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGNoaWxkID0gYXJndW1lbnRzWzBdO1xuXG5cdFx0Zm9yICggdmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrICkge1xuXG5cdFx0XHR2YXIgcGFyZW50ID0gYXJndW1lbnRzW2ldO1xuXG5cdFx0XHRpZiAoIHBhcmVudCApIHtcblxuXHRcdFx0XHRpZiAoIHBhcmVudCBpbnN0YW5jZW9mIEZ1bmN0aW9uICkge1xuXG5cdFx0XHRcdFx0dmFyIHAgPSBuZXcgcGFyZW50KCk7XG5cblx0XHRcdFx0XHRmb3IgKCB2YXIgaiBpbiBwICkge1xuXG5cdFx0XHRcdFx0XHRpZiAoICEgcGFyZW50LnByb3RvdHlwZVtqXSAmJiAhIGNoaWxkW2pdICkge1xuXHRcdFx0XHRcdFx0XHRjaGlsZFtqXSA9IHBbal07XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGZvciAoIHZhciBqIGluIHBhcmVudCApIHtcblxuXHRcdFx0XHRcdFx0aWYgKCAhIGNoaWxkW2pdICkge1xuXHRcdFx0XHRcdFx0XHRjaGlsZFtqXSA9IHBhcmVudFtqXTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9O1xuXHQvKipcblx0ICogUHV0cyBldmVyeSBlbGVtZW50IGF0IFwiZnJvbVwiIGludG8gXCJpbnRvXCJcblx0ICogQG1ldGhvZCBwdXRcblx0ICogQHBhcmFtIHtPYmplY3R9IGludG8gd2hlcmUgdG8gY29weSB0aGUgZWxlbWVudHNcblx0ICogQHBhcmFtIHtPYmplY3R9IGZyb20gd2hlcmUgdG8gdGFrZSB0aGUgZWxlbWVudHNcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbiggaW50bywgZnJvbSApIHtcblxuXHRcdGZvciAoIHZhciBpIGluIGZyb20gKSB7XG5cdFx0XHRpbnRvW2ldID0gZnJvbVtpXTtcblx0XHR9XG5cblx0fTtcblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoZSBnaXZlbiBvYmplY3Rcblx0ICogQG1ldGhvZCBwdXRcblx0ICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCB0byBjbG9uZVxuXHQgKiBAcmV0dXJuIHtPYmplY3R9IGFuIG9iamVjdCB3aXRoIHRoZSBzYW1lIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMgb2YgdGhlIGFyZ3VtZXRuIG9iamVjdFxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24ob2JqZWN0KSB7XG5cblx0XHR2YXIgY2xvbmVkT2JqZWN0ID0ge307XG5cblx0XHRmb3IgKCB2YXIgaSBpbiBvYmplY3QgKSB7XG5cdFx0XHRjW2ldID0gb2JqZWN0W2ldO1xuXHRcdH1cblxuXHRcdHJldHVybiBjbG9uZWRPYmplY3Q7XG5cblx0fTtcblx0LyoqXG5cdCAqIEl0ZXJhdGVzIHRocm91Z2ggYW4gYXJyYXkgYW5kIGNhbGwgdGhlIGZ1bmMgbWV0aG9kXG5cdCAqIEBtZXRob2QgZWFjaFxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSB0aGUgYXJyYXkgb2Ygb2JqZWN0cyB0byBhcHBseSB0aGUgZnVuY3Rpb25cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyB0aGUgZnVuY3Rpb24gdG8gZXhlY3V0ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCB0aGUgb2JqZWN0IHRvIGFwcGx5IHRoZSBmdW5jdGlvblxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbiggYXJyYXksIGZ1bmMsIGNvbnRleHQgKSB7XG5cblx0XHR2YXIgaSA9IGFycmF5Lmxlbmd0aDtcblxuXHRcdGlmICggY29udGV4dCApIHtcblxuXHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cblx0XHRcdFx0ZnVuYy5jYWxsKCBjb250ZXh0LCBhcnJheVtpXSApO1xuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR3aGlsZSAoIGktLSApIHtcblxuXHRcdFx0XHRmdW5jLmNhbGwoIGFycmF5W2ldICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9O1xuXHQvKipcblx0ICogQWRkcyBwYXJlbnQgcHJvdG90eXBlIG1ldGhvZHMgdG8gdGhlIGNoaWxkcyBwcm90b3R5cGVcblx0ICogQG1ldGhvZCBlYWNoXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjZW5kYW50IG9iamVjdCB0byBwdXQgdGhlIG1ldGhvZHMgZnJvbSB0aGUgcGFyZW50cyBwcm90b3R5cGVcblx0ICogQHBhcmFtIHtPYmplY3R9IHBhcmVudCB3aGVyZSB0byB0YWtlIHRoZSBtZXRob2RzIHRvIHB1dCBpbiBkZXNjZW5kYW50XG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUuZXh0ZW5kID0gQ2xhc3MuZXh0ZW5kO1xuXHQvKipcblx0ICogUm91bmRzIGEgbnVtYmVyIHRvIHRoZSBzcGVjaWZpZWQgZGVjaW1hbHNcblx0ICogQG1ldGhvZCByb3VuZFxuXHQgKiBAcGFyYW0ge2ludH0gbnVtYmVyIHRoZSBudW1iZXIgdG8gcm91bmRcblx0ICogQHBhcmFtIHtpbnR9IGRlY2ltYWxzIHRoZSBkZWNpbWFscyB0byB1c2Vcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5yb3VuZCA9IGZ1bmN0aW9uKCBudW1iZXIsIGRlY2ltYWxzICkge1xuXHRcdHZhciBhID0gXCIxXCI7XG5cdFx0d2hpbGUgKCBkZWNpbWFscy0tICkge1xuXHRcdFx0YSArPSBcIjBcIjtcblx0XHR9XG5cdFx0ZGVjaW1hbHMgPSBwYXJzZUludCggYSApO1xuXHRcdHJldHVybiBNYXRoLnJvdW5kKCBudW1iZXIgKiBkZWNpbWFscyApIC8gZGVjaW1hbHM7XG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS5mYXN0Um91bmRUbyA9IGZ1bmN0aW9uKCBudW1iZXIsIGRlY2ltYWxzICkge1xuXHRcdHJldHVybiB0aGlzLmZhc3RSb3VuZCggbnVtYmVyICogZGVjaW1hbHMgKSAvIGRlY2ltYWxzO1xuXHR9O1xuXHQvKipcblx0ICogUm91bmRzIGEgbnVtYmVyIGRvd24gdXNpbmcgdGhlIGZhc3Rlc3Qgcm91bmQgbWV0aG9kIGluIGphdmFzY3JpcHQuXG5cdCAqIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vbWF0aC1mbG9vci12cy1tYXRoLXJvdW5kLXZzLXBhcnNlaW50LzMzXG5cdCAqIEBtZXRob2Qgcm91bmRcblx0ICogQHBhcmFtIHtkb3VibGV9IG51bWJlciB0aGUgbnVtYmVyIHRvIHJvdW5kXG5cdCAqIEByZXR1cm4ge2ludH1cblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5mYXN0Um91bmQgPSBmdW5jdGlvbihuKSB7XG5cdFx0Ly8gcmV0dXJuIG51bWJlciA+PiAwO1xuXHRcdHJldHVybiAoMC41ICsgbikgPDwgMDtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGEgbnVtYmVyIGluZGljYXRpbmcgd2hhdCBwZXJjZW50YWdlIHJlcHJlc2VudHMgdGhlIGdpdmVuIGFyZ3VtZW50c1xuXHQgKiBAbWV0aG9kIGdldFBlcmNlbnRhZ2Vcblx0ICogQHBhcmFtIHtpbnR9IHBhcnQgdGhlIHBhcnQgdGhhdCBuZWVkcyB0byBiZSB0dXJuIGludG8gYSBwZXJjZW50YWdlXG5cdCAqIEBwYXJhbSB7aW50fSBvZiB0aGUgdG90YWwgYW1vdW50XG5cdCAqL1xuXHRNYXRjaC5wcm90b3R5cGUuZ2V0UGVyY2VudGFnZSA9IGZ1bmN0aW9uKCBwYXJ0LCBvZiApIHtcblx0XHRyZXR1cm4gcGFydCAqIG9mIC8gMTAwO1xuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiB0aW1lIGhhcyBwYXNzZWQgZnJvbSBtaWxsaXNlY29uZHNcblx0ICogQG1ldGhvZCBlbGFwc2VkVGltZUZyb21cblx0ICogQHBhcmFtIHtsb25nfSBmcm9tIHRpbWUgZnJvbSB3aGVyZSB0byBjaGVja1xuXHQgKiBAcGFyYW0ge2xvbmd9IG1pbGxpc2Vjb25kcyBhbW91bnQgb2YgbWlsbGlzZWNvbmRzIHRoYXQgY291bGQgaGF2ZSBwYXNzZWQgc2luY2UgZnJvbVxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmVsYXBzZWRUaW1lRnJvbSA9IGZ1bmN0aW9uKCBmcm9tLCBtaWxsaXNlY29uZHMgKSB7XG5cdFx0cmV0dXJuIE0uZ2V0VGltZSgpIC0gZnJvbSA+PSBtaWxsaXNlY29uZHM7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgTWF0Y2ggbG9vcGluZyBpZiBwYXVzZWRcblx0ICogQG1ldGhvZCBpc1BhdXNlZFxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSByZXR1cm5zIHRydWUgaWYgZ2FtZSBsb29wIGlzIGFjdGl2ZSBmYWxzZSBpZiBub3Rcblx0ICovXG5cdE1hdGNoLnByb3RvdHlwZS5pc1BhdXNlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAhdGhpcy5faXNQbGF5aW5nO1xuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3NzIHN0eWxlIHNoZWV0IHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gc2VsZWN0b3Jcblx0ICogQG1ldGhvZCBnZXRTdHlsZUJ5U2VsZWN0b3Jcblx0ICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIHRoZSBjc3Mgc2VsZWN0b3Jcblx0ICogQHJldHVybiB7Q1NTU3R5bGVEZWNsYXJhdGlvbn0gcmV0dXJucyB0aGUgY3NzIHN0eWxlIG1hdGNoaW5nIHRoZSBnaXZlbiBzZWxlY3RvclxuXHQgKi9cblx0TWF0Y2gucHJvdG90eXBlLmdldFN0eWxlQnlTZWxlY3RvciA9IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcblx0XHR2YXIgc2hlZXRMaXN0ID0gZG9jdW1lbnQuc3R5bGVTaGVldHMsXG5cdFx0XHRydWxlTGlzdCxcblx0XHRcdGksIGo7XG5cblx0XHQvKiBsb29rIHRocm91Z2ggc3R5bGVzaGVldHMgaW4gcmV2ZXJzZSBvcmRlciB0aGF0IHRoZXkgYXBwZWFyIGluIHRoZSBkb2N1bWVudCAqL1xuXHRcdGZvciAoaT1zaGVldExpc3QubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRydWxlTGlzdCA9IHNoZWV0TGlzdFtpXS5jc3NSdWxlcztcblx0XHRcdGZvciAoaj0wOyBqPHJ1bGVMaXN0Lmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGlmIChydWxlTGlzdFtqXS50eXBlID09IENTU1J1bGUuU1RZTEVfUlVMRSAmJiBydWxlTGlzdFtqXS5zZWxlY3RvclRleHQgPT0gc2VsZWN0b3IpIHtcblx0XHRcdFx0XHRyZXR1cm4gcnVsZUxpc3Rbal0uc3R5bGU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS5zZXRGdWxsU2NyZWVuID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly8gaWYgKCB0aGlzLmZyb250QnVmZmVyICYmIHRoaXMuZnJvbnRCdWZmZXIuY2FudmFzLnJlcXVlc3RGdWxsU2NyZWVuICkge1xuXHRcdC8vIFx0dGhpcy5mcm9udEJ1ZmZlci5jYW52YXMucmVxdWVzdEZ1bGxTY3JlZW4oRWxlbWVudC5BTExPV19LRVlCT0FSRF9JTlBVVCk7XG5cdFx0Ly8gfVxuXHRcdGlmICggdGhpcy5yZW5kZXJlciApIHtcblx0XHRcdHRoaXMucmVuZGVyZXIuc2V0RnVsbFNjcmVlbigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgc2V0IGZ1bGxTY3JlZW4uIFlvdSBtdXN0IGNhbGwgTS5zdGFydCgpIHRvIHNldCB0aGUgY2FudmFzXCIpO1xuXHRcdH1cblx0fTtcblx0TWF0Y2gucHJvdG90eXBlLmdldENlbnRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnJlbmRlcmVyLmdldENlbnRlcigpO1xuXHR9O1xuXHRNYXRjaC5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnJlbmRlcmVyLmdldFZpZXdwb3J0U2l6ZSgpO1xuXHR9O1xuXHRNYXRjaC5wcm90b3R5cGUuZ2V0T2JqZWN0TmFtZSA9IGZ1bmN0aW9uKG9iamVjdCkge1xuXHRcdGlmICghb2JqZWN0IHx8ICFvYmplY3QuY29uc3RydWN0b3IpIHtcblx0XHRcdHJldHVybiBvYmplY3Q7XG5cdFx0fVxuXHRcdHZhciBuYW1lID0gb2JqZWN0LmNvbnN0cnVjdG9yLm5hbWU7XG5cdFx0aWYgKCAhbmFtZSApIHtcblx0XHRcdG5hbWUgPSBvYmplY3QuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvZnVuY3Rpb24gKFthLXpBLVpfJF1bYS16QS1aXyQwLTldKikvKVsxXTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH07XG5cdE1hdGNoLnByb3RvdHlwZS5nZXRMYXllck5hbWVzID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2dhbWVMYXllcnMuX2tleXMpO1xuXHR9O1xuXG5cdENsYXNzLmV4dGVuZChNYXRjaCwgTW9kdWxlTWFuYWdlcik7XG5cdENsYXNzLmV4dGVuZChNYXRjaCwgRXZlbnRIYW5kbGVyKTtcblx0XG5cdGlmICggIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKSB7XG5cblx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gXG5cdFx0XHR3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXHR8fCBcblx0XHRcdHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0fHwgXG5cdFx0XHR3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZVx0XHR8fCBcblx0XHRcdHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZVx0XHR8fFxuXHRcdFx0ZnVuY3Rpb24oIGNhbGxiYWNrICkgeyBcblx0XHRcdFx0c2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcblx0XHRcdH07XG5cblx0fVxuXG5cdC8qIFNldCB1cCBuYW1lc3BhY2UgYW5kIGdsb2JhbCBNYXRjaCBkZWZpbml0aW9uLiBNYXRjaCBpcyBzdGF0aWMuICovXG5cdG5hbWVzcGFjZS5NID0gbmFtZXNwYWNlLk1hdGNoID0gbmV3IE1hdGNoKCk7XG5cblx0LyoqXG5cdCAqIFRoaXMgaXMgdGhlIGdhbWUgbG9vcCBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBieSB0aGUgdGhyZWFkIGNyZWF0ZWRcblx0ICogYnkgTWF0Y2guIEl0IGxvb3BzIHRocm91Z2ggdGhlIE1hdGNoIG9uTG9vcExpc3QgY2FsbGluZyB0aGUgb25Mb29wXG5cdCAqIG1ldGhvZCBvZiBlYWNoIG9mIHRoZSBjb250YWluZWQgb2JqZWN0cy5cblx0ICpcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQG1ldGhvZCBnYW1lTG9vcFxuXHQgKlxuXHQgKi9cblx0Lypcblx0ICogTk9URTogY2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lIGhhcyBub3QgYmVlbiBpbXBsZW1lbnRlZCBpbiBldmVyeVxuXHQgKiBicm93c2VyIHNvIHdlIGp1c3QgY2hlY2sgTWF0Y2ggc3RhdGUgdG8ga25vdyB3aGV0aGVyIHRvIGxvb3Agb3Igbm90LlxuXHQgKi9cblx0ZnVuY3Rpb24gZ2FtZUxvb3AoKSB7XG5cdFx0TS5nYW1lTG9vcCgpO1xuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XG5cdH1cblxufSkod2luZG93KTsiLCIoZnVuY3Rpb24oIE0gKSB7XG5cblx0ZnVuY3Rpb24gQWpheCgpIHtcblx0fVxuXG5cdEFqYXgucHJvdG90eXBlLl9yZXF1ZXN0ID0gZnVuY3Rpb24obWV0aG9kLCB1cmwsIGNhbGxiYWNrLCBvd25lcikge1xuXHRcdHZhciB4bWxodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdFx0eG1saHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoIHRoaXMucmVhZHlTdGF0ZSA9PSA0ICYmIHRoaXMuc3RhdHVzID09IDIwMCApIHtcblx0XHRcdFx0aWYgKCBvd25lciApIHtcblx0XHRcdFx0XHRjYWxsYmFjay5jYWxsKG93bmVyLCB0aGlzLnJlc3BvbnNlVGV4dCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2sodGhpcy5yZXNwb25zZVRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR4bWxodHRwLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuXHRcdHhtbGh0dHAuc2VuZCgpO1xuXHR9O1xuXG5cdEFqYXgucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5fcmVxdWVzdChcIlBPU1RcIiwgdXJsLCBjYWxsYmFjayk7XG5cdH07XG5cblx0QWpheC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuXHRcdHRoaXMuX3JlcXVlc3QoXCJHRVRcIiwgdXJsLCBjYWxsYmFjayk7XG5cdH07XG5cblx0TS5BamF4ID0gbmV3IEFqYXgoKTtcblxufSkoIHdpbmRvdy5NYXRjaCApOyIsIi8qKlxuICogQG1vZHVsZSBNYXRjaFxuICovXG4oZnVuY3Rpb24oTSkge1xuXG5cdC8qKlxuXHQgKiBDb3VudHMgdGhlIGFtb3VudCBvZiBmcmFtZXMgcGVyIHNlY29uZCB0aGF0IE1hdGNoIHRha2VzIHRvIGxvb3AgdGhyb3VnaCB0aGUgc2NlbmVzXG5cdCAqIEBjbGFzcyBGcHNDb3VudGVyXG5cdCAqIEBzdGF0aWNcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRmdW5jdGlvbiBGcHNDb3VudGVyKCkge1xuXG5cdFx0LyoqXG5cdFx0ICogTGFzdCB0aW1lIHVzZWQgdG8gbWVhc2V1cmUgdGhlIGZwc1xuXHRcdCAqIEBwcm9wZXJ0eSBsYXN0VGltZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHR5cGUgbG9uZ1xuXHRcdCAqL1xuXHRcdHRoaXMubGFzdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHQvKipcblx0XHQgKiBBbW91bnQgb2YgZnBzIGNvdW50ZWQgdXAgdG8gYSBjZXJ0YWluIG1vbWVudFxuXHRcdCAqIEBwcm9wZXJ0eSBfY3VycmVudEZwc1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHR5cGUgaW50XG5cdFx0ICovXG5cdFx0dGhpcy5fY3VycmVudEZwcyA9IDA7XG5cdFx0LyoqXG5cdFx0ICogRnJhbWVzIHBlciBzZWNvbmRcblx0XHQgKiBAcHJvcGVydHkgZnBzXG5cdFx0ICogQHJlYWRPbmx5XG5cdFx0ICogQHR5cGUgaW50XG5cdFx0ICovXG5cdFx0dGhpcy5mcHMgPSBcIlwiO1xuXHRcdC8qKlxuXHRcdCAqIEVsYXBzZWQgdGltZSBzaW5jZSBzdGFydGluZyBjb3VudGluZyBmcHNcblx0XHQgKiBAcHJvcGVydHkgZ2FtZVRpbWVcblx0XHQgKiBAcmVhZE9ubHlcblx0XHQgKiBAdHlwZSBpbnRcblx0XHQgKi9cblx0XHR0aGlzLmdhbWVUaW1lID0gMTtcblx0XHQvKipcblx0XHQgKiBDdXJyZW50IHRpbWUgaW4gbWlsbGlzZWNvbmRzXG5cdFx0ICogQHByb3BlcnR5IHRpbWVJbk1pbGxpc1xuXHRcdCAqIEByZWFkT25seVxuXHRcdCAqIEB0eXBlIGludFxuXHRcdCAqL1xuXHRcdHRoaXMudGltZUluTWlsbGlzID0gMDtcblx0XHQvKipcblx0XHQgKiBUb3RhbCBmcHMgY291bnRlZFxuXHRcdCAqIEBwcm9wZXJ0eSB0b3RhbEZwc1xuXHRcdCAqIEByZWFkT25seVxuXHRcdCAqIEB0eXBlIGludFxuXHRcdCAqL1xuXHRcdHRoaXMudG90YWxGcHMgPSAwO1xuXG5cdH1cblx0LyoqXG5cdCAqIFJlc2V0cyB0aGUgZnBzIGNvdW50XG5cdCAqIEBtZXRob2QgcmVzZXRcblx0ICovXG5cdEZwc0NvdW50ZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mcHMgPSBcIlwiO1xuXHRcdHRoaXMudG90YWxGcHMgPSAwO1xuXHRcdHRoaXMuX2N1cnJlbnRGcHMgPSAwO1xuXHRcdHRoaXMudGltZUluTWlsbGlzID0gMDtcblx0XHR0aGlzLmdhbWVUaW1lID0gMTtcblx0fTtcblx0LyoqXG5cdCAqIENvdW50cyB0aGUgZnBzLiBJZiBlbGFwc2VkIHRpbWUgc2luY2UgbGFzdCBjYWxsIGlzIGdyZWF0ZXIgdGhhbiAxMDAwbXMgdGhlbiBjb3VudHNcblx0ICogQG1ldGhvZCBjb3VudFxuXHQgKi9cblx0RnBzQ291bnRlci5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMudGltZUluTWlsbGlzID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cblx0XHRpZiAoIHRoaXMudGltZUluTWlsbGlzIC0gdGhpcy5sYXN0VGltZSA+PSAxMDAwICkge1xuXG5cdFx0XHR0aGlzLmxhc3RUaW1lID0gdGhpcy50aW1lSW5NaWxsaXM7XG5cdFx0XHR0aGlzLmZwcyA9IHRoaXMuX2N1cnJlbnRGcHM7XG5cdFx0XHR0aGlzLmdhbWVUaW1lKys7XG5cdFx0XHR0aGlzLnRvdGFsRnBzICs9IHRoaXMuZnBzO1xuXHRcdFx0dGhpcy5fY3VycmVudEZwcyA9IDA7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR0aGlzLl9jdXJyZW50RnBzKys7XG5cblx0XHR9XG5cblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGF2ZXJhZ2UgZnBzIHNpbmNlIHVzaW5nIHRoZSB0b3RhbCBmcHMgY291bnRlZCBzbyBmYXJcblx0ICogQG1ldGhvZCBnZXRBdmVyYWdlRnBzXG5cdCAqIEByZXR1cm4ge2ludH1cblx0ICovXG5cdEZwc0NvdW50ZXIucHJvdG90eXBlLmdldEF2ZXJhZ2VGcHMgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMudG90YWxGcHMgPT0gMCApIHJldHVybiA2MDtcblx0XHRyZXR1cm4gTWF0aC5mbG9vcih0aGlzLnRvdGFsRnBzIC8gdGhpcy5nYW1lVGltZSk7XG5cdH07XG5cblx0TS5GcHNDb3VudGVyID0gbmV3IEZwc0NvdW50ZXIoKTtcblxufSkod2luZG93Lk1hdGNoKTsiLCIvKipcbiAqIEBtb2R1bGUgTWF0Y2hcbiAqL1xuKGZ1bmN0aW9uIChNKSB7XG5cdC8qKlxuXHQgKiBCYXNpYyBvYmplY3QgZm9yIGV2ZXJ5IGdhbWVcblx0ICpcblx0ICogQGNsYXNzIEdhbWVPYmplY3Rcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuICAgIGZ1bmN0aW9uIEdhbWVPYmplY3QoKSB7XG5cdFx0LyoqXG5cdFx0ICogRm9jdXMgaW5kaWNhdG9yLiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIG9iamVjdCBpcyBmb2N1c2VkIGFuZCB3aWxsIGFjY2VwdCBrZXlib2FyZCBpbnB1dCBvciBub3Rcblx0XHQgKiBAcHJvcGVydHkgaGFzRm9jdXNcblx0XHQgKiBAdHlwZSBCb29sZWFuXG5cdFx0ICovXG5cdFx0dGhpcy5oYXNGb2N1cyA9IGZhbHNlO1xuXHR9XG5cdC8qKlxuXHQgKiBBYnN0cmFjdCBtZXRob2QgdGhhdCBpcyBjYWxsZWQgb25jZSBwZXIgZ2FtZSBsb29wLlxuXHQgKiBFdmVyeSBvYmplY3QgcHVzaGVkIGludG8gTWF0Y2ggbGlzdCBvciBHYW1lTGF5ZXJcblx0ICogbXVzdCBvdmVycmlkZSB0aGlzIG1ldGhvZFxuXHQgKiBAbWV0aG9kIG9uTG9vcFxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRHYW1lT2JqZWN0LnByb3RvdHlwZS5vbkxvb3AgPSBmdW5jdGlvbigpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2QgR2FtZU9iamVjdC5vbkxvb3AgaXMgYWJzdHJhY3QgYW5kIG11c3QgYmUgb3ZlcnJpZGVuXCIpO1xuXHR9O1xuXHRcbiAgICBNLkdhbWVPYmplY3QgPSBHYW1lT2JqZWN0O1xuXHRcblx0LyoqXG5cdCAqIFN1cHBvcnRzIG9uIGxvb3AgZXZlbnRzXG5cdCAqIEBjbGFzcyBHYW1lT2JqZWN0V2l0aEV2ZW50c1xuXHQgKiBAZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdCAqL1xuXHQgLyoqXG5cdCAqIE1hcHBpbmdzIGZvciB0aGUga2V5ZG93biBldmVudC4gTWFwcyBhIGtleSB0byBhIG1ldGhvZCBvZiB0aGlzIG9iamVjdCBieSBuYW1lXG5cdCAqIE9iamVjdCBtdXN0IGhhdmUgZm9jdXMgZm9yIHRoaXMgdG8gYmUgZXhlY3V0ZWRcblx0ICogQHByb3BlcnR5IGtleURvd25NYXBwaW5nc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqIEB0eXBlIE9iamVjdCBvYmplY3Qgb2YgdGhlIGxpa2Ugb2YgYSBTdHJpbmctU3RyaW5nIE1hcC4gQ29udGFpbnMgYSBrZXkgbWFwcGVkIHRvIHRoZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2YgdGhpcyBvYmplY3Rcblx0ICogQGV4YW1wbGVcblx0XHRcdC8vUHJvdmlkZWQgdGhpcyBvYmplY3QgaGFzIGEgbWV0aG9kIGNhbGxlZCBtb3ZlTGVmdFxuXHRcdFx0dGhpcy5rZXlEb3duTWFwcGluZ3MgPSB7XG5cdFx0XHRcdFwibGVmdFwiOiBcIm1vdmVMZWZ0XCJcblx0XHRcdH1cblx0ICovXG5cdC8qKlxuXHQgKiBNYXBwaW5ncyBmb3IgdGhlIGtleXVwIGV2ZW50LiBNYXBzIGEga2V5IHRvIGEgbWV0aG9kIG9mIHRoaXMgb2JqZWN0IGJ5IG5hbWUuXG5cdCAqIE9iamVjdCBtdXN0IGhhdmUgZm9jdXMgZm9yIHRoaXMgdG8gYmUgZXhlY3V0ZWQuXG5cdCAqIEBwcm9wZXJ0eSBrZXlVcE1hcHBpbmdzXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICogQHR5cGUgT2JqZWN0IG9iamVjdCBvZiB0aGUgbGlrZSBvZiBhIFN0cmluZy1TdHJpbmcgTWFwLiBDb250YWlucyBhIGtleSBtYXBwZWQgdG8gdGhlIG5hbWUgb2YgdGhlIG1ldGhvZCBvZiB0aGlzIG9iamVjdFxuXHQgKiBAZXhhbXBsZVxuXHRcdC8vUHJvdmlkZWQgdGhpcyBvYmplY3QgaGFzIGEgbWV0aG9kIGNhbGxlZCBqdW1wXG5cdFx0dGhpcy5rZXlEb3duTWFwcGluZ3MgPSB7XG5cdFx0XHRcInVwXCI6IFwianVtcFwiXG5cdFx0fVxuXHQgKi9cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBiZSBleGVjdXRlZCBpbiB0aGUgY2FzZSBvZiBhIGtleWRvd24gZXZlbnRcblx0ICogTk9URTogWW91IG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QgaW4gdGhlIHByb3RvdHlwZVxuXHQgKiBAbWV0aG9kIG9uS2V5RG93blxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBrZXlzRG93biBvYmplY3Qgb2YgdGhlIGxpa2Ugb2YgYSBTdHJpbmctQm9vbGVhbiBNYXAuIENvbnRhaW5zIHRoZSBuYW1lIG9mIHRoZSBrZXlzIHRoYXQgYXJlIGJlaW5nIHByZXNzZWQgYW5kIHRydWUgaWYgdGhhdCBpcyB0aGUgY2FzZVxuXHQgKi8gXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gYmUgZXhlY3V0ZWQgaW4gdGhlIGNhc2Ugb2YgYSBrZXlkdXAgZXZlbnQuXG5cdCAqIE5PVEU6IFlvdSBtdXN0IG92ZXJyaWRlIHRoaXMgbWV0aG9kIGluIHRoZSBwcm90b3R5cGVcblx0ICogQG1ldGhvZCBvbktleVVwXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICogQHBhcmFtIHtPYmplY3R9IGtleXNVcCBvYmplY3Qgb2YgdGhlIGxpa2Ugb2YgYSBTdHJpbmctQm9vbGVhbiBNYXAuIENvbnRhaW5zIHRoZSBuYW1lIG9mIHRoZSBrZXlzIHRoYXQgd2hlcmUganVzdCByZWxlYXNlZCBhbmQgdHJ1ZSBpZiB0aGF0IGlzIHRoZSBjYXNlXG5cdCAqL1xuXHQvKipcblx0ICogTWV0aG9kIHRvIGJlIGV4ZWN1dGVkIGluIHRoZSBjYXNlIG9mIGEgbW91c2UgZG93biBldmVudC5cblx0ICogTk9URTogWW91IG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QgaW4gdGhlIHByb3RvdHlwZVxuXHQgKiBAbWV0aG9kIG9uTW91c2VEb3duXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICogQHBhcmFtIHtpbnB1dC5Nb3VzZX0gbW91c2UgdGhlIG1vdXNlIG9iamVjdCB0byBwcm92aWRlIGZ1cnRoZXIgbW91c2UgaW5mb3JtYXRpb25cblx0ICovXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gYmUgZXhlY3V0ZWQgaW4gdGhlIGNhc2Ugb2YgYSBtb3VzZSB1cCBldmVudC5cblx0ICogTk9URTogWW91IG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QgaW4gdGhlIHByb3RvdHlwZVxuXHQgKiBAbWV0aG9kIG9uTW91c2VVcFxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqIEBwYXJhbSB7aW5wdXQuTW91c2V9IG1vdXNlIHRoZSBtb3VzZSBvYmplY3QgdG8gcHJvdmlkZSBmdXJ0aGVyIG1vdXNlIGluZm9ybWF0aW9uXG5cdCAqL1xuXHQvKipcblx0ICogTWV0aG9kIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIG1vdXNlIGVudGVycyB0aGlzIG9iamVjdC5cblx0ICogTk9URTogWW91IG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QgaW4gdGhlIHByb3RvdHlwZVxuXHQgKiBAbWV0aG9kIG9uTW91c2VJblxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqIEBwYXJhbSB7aW5wdXQuTW91c2V9IG1vdXNlIHRoZSBtb3VzZSBvYmplY3QgdG8gcHJvdmlkZSBmdXJ0aGVyIG1vdXNlIGluZm9ybWF0aW9uXG5cdCAqL1xuXHQvKipcblx0ICogTWV0aG9kIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIG1vdXNlIGlzIG1vdmVkIGluIHRoaXMgb2JqZWN0LlxuXHQgKiBOT1RFOiBZb3UgbXVzdCBvdmVycmlkZSB0aGlzIG1ldGhvZCBpbiB0aGUgcHJvdG90eXBlXG5cdCAqIEBtZXRob2Qgb25Nb3VzZU1vdmVcblx0ICogQHByb3RlY3RlZFxuXHQgKiBAcGFyYW0ge2lucHV0Lk1vdXNlfSBtb3VzZSB0aGUgbW91c2Ugb2JqZWN0IHRvIHByb3ZpZGUgZnVydGhlciBtb3VzZSBpbmZvcm1hdGlvblxuXHQgKi9cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBtb3VzZSBsZWF2ZXMgdGhpcyBvYmplY3QuXG5cdCAqIE5PVEU6IFlvdSBtdXN0IG92ZXJyaWRlIHRoaXMgbWV0aG9kIGluIHRoZSBwcm90b3R5cGVcblx0ICogQG1ldGhvZCBvbk1vdXNlT3V0XG5cdCAqIEBwcm90ZWN0ZWRcblx0ICogQHBhcmFtIHtpbnB1dC5Nb3VzZX0gbW91c2UgdGhlIG1vdXNlIG9iamVjdCB0byBwcm92aWRlIGZ1cnRoZXIgbW91c2UgaW5mb3JtYXRpb25cblx0ICovXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgaW4gdGhlIGNhc2Ugb2YgYSBjbGljayBldmVudC5cblx0ICogTk9URTogWW91IG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QgaW4gdGhlIHByb3RvdHlwZVxuXHQgKiBAbWV0aG9kIG9uQ2xpY2tcblx0ICogQHByb3RlY3RlZFxuXHQgKiBAcGFyYW0ge2lucHV0Lk1vdXNlfSBtb3VzZSB0aGUgbW91c2Ugb2JqZWN0IHRvIHByb3ZpZGUgZnVydGhlciBtb3VzZSBpbmZvcm1hdGlvblxuXHQgKi9cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBtb3VzZSBsZWZ0IGJ1dHRvbiBpcyBkb3duIGFuZCB0aGUgbW91c2UgbW92ZXMuXG5cdCAqIE5PVEU6IFlvdSBtdXN0IG92ZXJyaWRlIHRoaXMgbWV0aG9kIGluIHRoZSBwcm90b3R5cGVcblx0ICogQG1ldGhvZCBvbkRyYWdcblx0ICogQHByb3RlY3RlZFxuXHQgKiBAcGFyYW0ge2lucHV0Lk1vdXNlfSBtb3VzZSB0aGUgbW91c2Ugb2JqZWN0IHRvIHByb3ZpZGUgZnVydGhlciBtb3VzZSBpbmZvcm1hdGlvblxuXHQgKi9cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBpbiB0aGUgY2FzZSBvZiBhIG1vdXNlIHdoZWVsIGV2ZW50LlxuXHQgKiBOT1RFOiBZb3UgbXVzdCBvdmVycmlkZSB0aGlzIG1ldGhvZCBpbiB0aGUgcHJvdG90eXBlXG5cdCAqIEBtZXRob2Qgb25Nb3VzZVdoZWVsXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICogQHBhcmFtIHtpbnB1dC5Nb3VzZX0gbW91c2UgdGhlIG1vdXNlIG9iamVjdCB0byBwcm92aWRlIGZ1cnRoZXIgbW91c2UgaW5mb3JtYXRpb25cblx0ICovXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gYmUgZXhlY3V0ZWQgaWYgdGhlIG1vdXNlIGlmIG92ZXIgdGhlIG9iamVjdC5cblx0ICogTk9URTogWW91IG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QgaW4gdGhlIHByb3RvdHlwZVxuXHQgKiBAbWV0aG9kIG9uTW91c2VPdmVyXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICogQHBhcmFtIHtpbnB1dC5Nb3VzZX0gbW91c2UgdGhlIG1vdXNlIG9iamVjdCB0byBwcm92aWRlIGZ1cnRoZXIgbW91c2UgaW5mb3JtYXRpb25cblx0ICovXG5cblx0IEdhbWVPYmplY3QubmFtZSA9IFwiR2FtZU9iamVjdFwiO1xuXHRcbn0pKHdpbmRvdy5NKTsiLCIvKipcbiAqIEBtb2R1bGUgTWF0Y2hcbiAqL1xuKGZ1bmN0aW9uKG5hbWVzcGFjZSkge1xuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyBtZXRob2RzIGZvciBjb21tb24gMmQgTWF0aCBvcGVyYXRpb25zXG5cdCAqIFxuXHQgKiBAY2xhc3MgTWF0aDJkXG5cdCAqIEBzdGF0aWNcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRmdW5jdGlvbiBNYXRoMmQoKSB7XG5cdFx0dGhpcy5tYXRoID0gTWF0aDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdmFsdWUgaXMgYmV0d2VlbiBhIGFuZCBiIG9yIGZhbHNlXG5cdCAqXG5cdCAqIEBtZXRob2QgdmFsdWVJbkJldHdlZW5cblx0ICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIHRoZSB2YWx1ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gYSAgYmV0d2VlbiBhXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiICBhbmQgYmV0d2VlbiBiXG5cdCAqIEByZXR1cm4ge2Zsb2F0fVxuXHQgKi9cblx0TWF0aDJkLnByb3RvdHlwZS52YWx1ZUluQmV0d2VlbiA9IGZ1bmN0aW9uKHZhbHVlLCBhLCBiKSB7XG5cdFx0cmV0dXJuIGEgPD0gdmFsdWUgJiYgdmFsdWUgPD0gYjtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgeCB2YWx1ZSBtYXRjaGluZyB0aGUgY29ycmVzcG9uZGluZyBwYXJhbWV0ZXJzIG9mIGEgY2lyY2xlXG5cdCAqXG5cdCAqIEBtZXRob2QgZ2V0WEZyb21DaXJjbGVcblx0ICogQHBhcmFtIHgwIC0gQ2VudGVyIGluIHRoZSB4IGF4aXNcblx0ICogQHBhcmFtIHIgIC0gQ2lyY2xlIHJhZGl1c1xuXHQgKiBAcGFyYW0gdCAgLSBQZXJpb2Rcblx0ICogQHJldHVybiB7ZmxvYXR9XG5cdCAqL1xuXHRNYXRoMmQucHJvdG90eXBlLmdldFhGcm9tQ2lyY2xlID0gZnVuY3Rpb24oeDAsIHIsIHQpIHtcblx0XHRyZXR1cm4geDAgKyByICogdGhpcy5tYXRoLmNvcyh0KTtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgeSB2YWx1ZSBtYXRjaGluZyB0aGUgY29ycmVzcG9uZGluZyBwYXJhbWV0ZXJzIG9mIGEgY2lyY2xlXG5cdCAqIEBtZXRob2QgZ2V0WUZyb21DaXJjbGVcblx0ICogQHBhcmFtIHkwIC0gQ2VudGVyIGluIHRoZSB5IGF4aXNcblx0ICogQHBhcmFtIHIgIC0gQ2lyY2xlIHJhZGl1c1xuXHQgKiBAcGFyYW0gdCAgLSBQZXJpb2Rcblx0ICogQHJldHVybiB7ZmxvYXR9XG5cdCAqL1xuXHRNYXRoMmQucHJvdG90eXBlLmdldFlGcm9tQ2lyY2xlID0gZnVuY3Rpb24oeTAsIHIsIHQpIHtcblx0XHRyZXR1cm4geTAgKyByICogdGhpcy5tYXRoLnNpbih0KTtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgYSBwb2ludCBjb250YWluaW5nIHggYW5kIHkgdmFsdWVzIG1hdGNoaW5nIHRoZSBjb3JyZXNwb25kaW5nIHBhcmFtZXRlcnMgb2YgYW4gZWxpcHNpc1xuXHQgKiBAbWV0aG9kIGdldFBvaW50RnJvbUNpcmNsZVxuXHQgKiBAcGFyYW0geDAgLSBDZW50ZXIgaW4gdGhlIHggYXhpc1xuXHQgKiBAcGFyYW0geTAgLSBDZW50ZXIgaW4gdGhlIHkgYXhpc1xuXHQgKiBAcGFyYW0gciAgLSBDaXJjbGUgcmFkaXVzXG5cdCAqIEBwYXJhbSB0ICAtIFBlcmlvZFxuXHQgKiBAcmV0dXJuIHtmbG9hdH1cblx0ICovXG5cdE1hdGgyZC5wcm90b3R5cGUuZ2V0UG9pbnRGcm9tQ2lyY2xlID0gZnVuY3Rpb24oIHgwLCB5MCwgciwgdCApIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRQb2ludEZyb21FbGlwc2lzKCB4MCwgeTAsIHIsIHIsIHQgKTtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgYSBwb2ludCBjb250YWluaW5nIHggYW5kIHkgdmFsdWVzIG1hdGNoaW5nIHRoZSBjb3JyZXNwb25kaW5nIHBhcmFtZXRlcnMgb2YgYW4gZWxpcHNpc1xuXHQgKiBAbWV0aG9kIGdldFBvaW50RnJvbUVsaXBzaXNcblx0ICogQHBhcmFtIHgwIC0gQ2VudGVyIGluIHRoZSB4IGF4aXNcblx0ICogQHBhcmFtIHkwIC0gQ2VudGVyIGluIHRoZSB5IGF4aXNcblx0ICogQHBhcmFtIHJYIC0gRWxpcHNpcyByYWRpdXMgaW4geCBheGlzXG5cdCAqIEBwYXJhbSByWSAtIEVsaXBzaXMgcmFkaXVzIGluIHkgYXhpc1xuXHQgKiBAcGFyYW0gdCAgLSBQZXJpb2Rcblx0ICogQHJldHVybiB7ZmxvYXR9XG5cdCAqL1xuXHRNYXRoMmQucHJvdG90eXBlLmdldFBvaW50RnJvbUVsaXBzaXMgPSBmdW5jdGlvbiggeDAsIHkwLCB4UiwgeVIsIHQgKSB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IyZCggdGhpcy5nZXRYRnJvbUNpcmNsZSggeDAsIHhSLCB0ICksIHRoaXMuZ2V0WUZyb21DaXJjbGUoIHkwLCB5UiwgdCApICk7XG5cdH07XG4gICAgLyoqXG5cdCAqIFJldHVybnMgYSAyZCB2ZWN0b3IgZ2l2ZW4gMiB2ZWN0b3JzXG5cdCAqIEBtZXRob2QgZ2V0VmVjdG9yMmRcblx0ICogQHBhcmFtIHtWZWN0b3IyZH0gdmVjdG9yMVxuXHQgKiBAcGFyYW0ge1ZlY3RvcjJkfSB2ZWN0b3IyXG4gICAgICogQHJldHVybiB7VmVjdG9yMmR9XG5cdCAqL1xuXHRNYXRoMmQucHJvdG90eXBlLmdldFZlY3RvcjJkID0gZnVuY3Rpb24odmVjdG9yMSwgdmVjdG9yMikge1xuXHRcdHJldHVybiBuZXcgVmVjdG9yMmQoIHZlY3RvcjIueCAtIHZlY3RvcjEueCwgdmVjdG9yMi55IC0gdmVjdG9yMS55ICk7XG5cdH07ICAgICAgIFxuXHQvKipcblx0ICogUmV0dXJucyBhIDJkIHZlY3RvciBnaXZlbiAyIHZlY3RvcnNcblx0ICogQG1ldGhvZCBnZXRWZWN0b3Jcblx0ICogQHBhcmFtIHtWZWN0b3IyZH0gdmVjdG9yMVxuXHQgKiBAcGFyYW0ge1ZlY3RvcjJkfSB2ZWN0b3IyXG4gICAgICogQHJldHVybiB7VmVjdG9yMmR9XG5cdCAqL1xuXHRNYXRoMmQucHJvdG90eXBlLmdldFZlY3RvciA9IGZ1bmN0aW9uKHZlY3RvcjEsIHZlY3RvcjIpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWZWN0b3IyZCggdmVjdG9yMSwgdmVjdG9yMiApO1xuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdmVjdG9yIHJvdGF0ZWRcblx0ICogQG1ldGhvZCBnZXRSb3RhdGVkVmVydGV4XG5cdCAqIEBwYXJhbSB7VmVjdG9yMmR9IHZlcnRleFxuXHQgKiBAcGFyYW0ge2Zsb2F0fSByb3RhdGlvblxuXHQgKiBAcmV0dXJuIHtWZWN0b3IyZH1cblx0ICovXG5cdE1hdGgyZC5wcm90b3R5cGUuZ2V0Um90YXRlZFZlcnRleCA9IGZ1bmN0aW9uKHZlcnRleCwgcm90YXRpb24pIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRSb3RhdGVkVmVydGV4Q29vcmRzKHZlcnRleC54LCB2ZXJ0ZXgueSwgcm90YXRpb24pO1xuXHR9O1xuXHRNYXRoMmQucHJvdG90eXBlLmdldFJvdGF0ZWRWZXJ0ZXhDb29yZHNYID0gZnVuY3Rpb24oeCwgeSwgcm90YXRpb24pIHtcblx0XHRyZXR1cm4geCAqIHRoaXMubWF0aC5jb3Mocm90YXRpb24pIC0geSAqIHRoaXMubWF0aC5zaW4ocm90YXRpb24pO1xuXHR9O1xuXHRNYXRoMmQucHJvdG90eXBlLmdldFJvdGF0ZWRWZXJ0ZXhDb29yZHNZID0gZnVuY3Rpb24oeCwgeSwgcm90YXRpb24pIHtcblx0XHRyZXR1cm4geSAqIHRoaXMubWF0aC5jb3Mocm90YXRpb24pICsgeCAqIHRoaXMubWF0aC5zaW4ocm90YXRpb24pO1xuXHR9O1xuXHQvKlxuXHQgKiBSZXR1cm5zIHRoZSB2ZWN0b3Igcm90YXRlZFxuXHQgKiBAbWV0aG9kIGdldFJvdGF0ZWRWZXJ0ZXhDb29yZHNcblx0ICogQHBhcmFtIHtmbG9hdH0geFxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB5XG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHJvdGF0aW9uXG5cdCAqIEByZXR1cm4ge1ZlY3RvcjJkfVxuXHQgKi9cblx0TWF0aDJkLnByb3RvdHlwZS5nZXRSb3RhdGVkVmVydGV4Q29vcmRzID0gZnVuY3Rpb24oeCwgeSwgcm90YXRpb24pIHtcblx0XHRyZXR1cm4gbmV3IFZlY3RvcjJkKCB0aGlzLmdldFJvdGF0ZWRWZXJ0ZXhDb29yZHNYKHgsIHksIHJvdGF0aW9uKSwgdGhpcy5nZXRSb3RhdGVkVmVydGV4Q29vcmRzWSh4LCB5LCByb3RhdGlvbikgKTtcblx0fTtcbiAgIC8qKlxuXHQqIFJldHVybnMgdGhlIG1hZ25pdHVkZSBvZiBhIHZlY3RvclxuXHQqIEBtZXRob2QgZ2V0TWFnbml0dWRlXG5cdCogQHBhcmFtIHtWZWN0b3IyZH0gdmVjdG9yXG5cdCogQHJldHVybiB7ZmxvYXR9XG5cdCovXG5cdE1hdGgyZC5wcm90b3R5cGUuZ2V0TWFnbml0dWRlID0gZnVuY3Rpb24odmVjdG9yKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0aC5zcXJ0KHZlY3Rvci54ICogdmVjdG9yLnggKyB2ZWN0b3IueSAqIHZlY3Rvci55KTtcblx0fTtcbiAgIC8qKlxuXHQqIFJldHVybnMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlY3RvcnMgd2l0aG91dCBjYWxjdWxhdGluZyBzcXVhcmVyb290XG5cdCogQG1ldGhvZCBnZXRTcXVhcmVEaXN0YW5jZVxuXHQqIEBwYXJhbSB7VmVjdG9yMmR9IHZlY3RvcjFcblx0KiBAcGFyYW0ge1ZlY3RvcjJkfSB2ZWN0b3IyXG5cdCogQHJldHVybiB7ZmxvYXR9XG5cdCovXG5cdE1hdGgyZC5wcm90b3R5cGUuZ2V0U3F1YXJlRGlzdGFuY2UgPSBmdW5jdGlvbih2ZWN0b3IxLCB2ZWN0b3IyKSB7XG5cblx0XHR2YXIgeCA9IHZlY3RvcjEueCAtIHZlY3RvcjIueDtcblx0XHR2YXIgeSA9IHZlY3RvcjEueSAtIHZlY3RvcjIueTtcblxuXHRcdHJldHVybiB4KnggKyB5Knk7XG5cblx0fTtcbiAgIC8qKlxuXHQqIFJldHVybnMgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIHZlY3RvcnNcblx0KiBAbWV0aG9kIGdldEFuZ2xlQmV0d2VlblZlY3RvcnNcblx0KiBAcGFyYW0ge1ZlY3RvcjJkfSB2ZWN0b3IxXG5cdCogQHBhcmFtIHtWZWN0b3IyZH0gdmVjdG9yMlxuXHQqIEByZXR1cm4ge2Zsb2F0fVxuXHQqL1xuXHRNYXRoMmQucHJvdG90eXBlLmdldEFuZ2xlQmV0d2VlblZlY3RvcnMgPSBmdW5jdGlvbih2ZWN0b3IxLCB2ZWN0b3IyKSB7XG5cblx0XHR2YXIgbSA9IHRoaXMuZ2V0TWFnbml0dWRlKHZlY3RvcjEpICogdGhpcy5nZXRNYWduaXR1ZGUodmVjdG9yMik7XG5cblx0XHRyZXR1cm4gdGhpcy5tYXRoLmFjb3MoKHZlY3RvcjEueCAqIHZlY3RvcjIueCArIHZlY3RvcjEueSAqIHZlY3RvcjIueSkgLyBtKTtcblxuXHR9O1xuICAgLyoqXG5cdCogUmV0dXJucyB0aGUgY29zIGJldHdlZW4gdHdvIHZlY3RvcnNcblx0KiBSZXR1cm5zIHRoZSBhbmdsZSBiZXR3ZWVuIHR3byB2ZWN0b3JzXG5cdCogQG1ldGhvZCBnZXRDb3NCZXR3ZWVuVmVjdG9yc1xuXHQqIEBwYXJhbSB7VmVjdG9yMmR9IHZlY3RvcjFcblx0KiBAcGFyYW0ge1ZlY3RvcjJkfSB2ZWN0b3IyXG5cdCogQHJldHVybiB7ZmxvYXR9XG5cdCovXG5cdE1hdGgyZC5wcm90b3R5cGUuZ2V0Q29zQmV0d2VlblZlY3RvcnMgPSBmdW5jdGlvbih2ZWN0b3IxLCB2ZWN0b3IyKSB7XG5cdFxuXHRcdHZhciBtID0gdGhpcy5nZXRNYWduaXR1ZGUodmVjdG9yMSkgKiB0aGlzLmdldE1hZ25pdHVkZSh2ZWN0b3IyKTtcblxuXHRcdHJldHVybiAodmVjdG9yMS54ICogdmVjdG9yMi54ICsgdmVjdG9yMS55ICogdmVjdG9yMi55KSAvIG07XG5cblx0fTtcbiAgIC8qKlxuXHQqIFJldHVybnMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlY3RvcnNcblx0KiBAbWV0aG9kIGdldERpc3RhbmNlXG5cdCogQHBhcmFtIHtWZWN0b3IyZH0gdmVjdG9yMVxuXHQqIEBwYXJhbSB7VmVjdG9yMmR9IHZlY3RvcjJcblx0KiBAcmV0dXJuIHtmbG9hdH1cblx0Ki9cblx0TWF0aDJkLnByb3RvdHlwZS5nZXREaXN0YW5jZSA9IGZ1bmN0aW9uKHZlY3RvcjEsIHZlY3RvcjIpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRoLnNxcnQodGhpcy5nZXRTcXVhcmVEaXN0YW5jZSh2ZWN0b3IxLCB2ZWN0b3IyKSk7XG5cdH07XG4gICAvKipcblx0KiBSZXR1cm5zIHRydWUgaWYgdGhlIHByb3ZpZGVkIHZlY3RvcnMgaGF2ZSB0aGUgc2FtZSBkaXJlY3Rpb25cblx0KiBAcGFyYW0ge1ZlY3RvcjJkfSB2ZWN0b3IxXG5cdCogQHBhcmFtIHtWZWN0b3IyZH0gdmVjdG9yMlxuXHQqIEByZXR1cm4ge0Jvb2xlYW59XG5cdCovXG5cdE1hdGgyZC5wcm90b3R5cGUuaGF2ZVRoZVNhbWVEaXJlY3Rpb24gPSBmdW5jdGlvbih2ZWN0b3IxLCB2ZWN0b3IyKSB7XG5cblx0XHRpZiAoIHZlY3RvcjEueCA+IDAgJiYgdmVjdG9yMi54IDwgMCApIHJldHVybiBmYWxzZTtcblx0XHRpZiAoIHZlY3RvcjEueCA8IDAgJiYgdmVjdG9yMi54ID4gMCApIHJldHVybiBmYWxzZTtcblx0XHRpZiAoIHZlY3RvcjEueSA+IDAgJiYgdmVjdG9yMi55IDwgMCApIHJldHVybiBmYWxzZTtcblx0XHRpZiAoIHZlY3RvcjEueSA8IDAgJiYgdmVjdG9yMi55ID4gMCApIHJldHVybiBmYWxzZTtcblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH07XG4gICAvKipcblx0KiBSZXR1cm5zIHRydWUgaWYgdGhlIHByb3ZpZGVkIHZlY3RvcnMgYXJlIHBhcmFsbGVsXG5cdCogQHBhcmFtIHtWZWN0b3IyZH0gdmVjdG9yMVxuXHQqIEBwYXJhbSB7VmVjdG9yMmR9IHZlY3RvcjJcblx0KiBAcmV0dXJuIHtCb29sZWFufVxuXHQqL1xuXHRNYXRoMmQucHJvdG90eXBlLmFyZVBhcmFsbGVsVmVjdG9ycyA9IGZ1bmN0aW9uKHZlY3RvcjEsIHZlY3RvcjIpIHtcblxuXHRcdHZlY3RvcjEgPSB0aGlzLmdldE5vcm1hbGl6ZWQoIHZlY3RvcjEgKTtcblx0XHR2ZWN0b3IyID0gdGhpcy5nZXROb3JtYWxpemVkKCB2ZWN0b3IyICk7XG5cblx0XHR2YXIgeCA9IHZlY3RvcjEueCAvIHZlY3RvcjIueCxcblx0XHRcdHkgPSB2ZWN0b3IxLnkgLyB2ZWN0b3IyLnk7XG5cblx0XHRyZXR1cm4geCA+PSB5IC0gMC4xICYmIHggPD0geSArIDAuMTtcblxuXHR9O1xuICAgLyoqXG5cdCogUmV0dXJucyB0aGUgdmVjdG9yIG5vcm1hbGl6ZWRcblx0KiBAcGFyYW0ge1ZlY3RvcjJkfSB2ZWN0b3Jcblx0KiBAcmV0dXJuIHtWZWN0b3IyZH1cblx0Ki9cblx0TWF0aDJkLnByb3RvdHlwZS5nZXROb3JtYWxpemVkID0gZnVuY3Rpb24odmVjdG9yKSB7XG5cblx0XHR2YXIgbWFnbml0dWRlID0gdGhpcy5nZXRNYWduaXR1ZGUodmVjdG9yKTtcblx0XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IyZCggdmVjdG9yLnggLyBtYWduaXR1ZGUsIHZlY3Rvci55IC8gbWFnbml0dWRlICk7XG5cdFxuXHR9O1xuICAgLyoqXG5cdCogUmV0dXJucyB0aGUgcmVzdWx0aW5nIHZlY3RvciBvZiBhIHN1YnN0cmFjdGlvblxuXHQqIEBwYXJhbSB7VmVjdG9yMmR9IHZlY3RvcjFcblx0KiBAcGFyYW0ge1ZlY3RvcjJkfSB2ZWN0b3IyXG5cdCogQHJldHVybiB7VmVjdG9yMmR9XG5cdCovXG5cdE1hdGgyZC5wcm90b3R5cGUuc3Vic3RyYWN0ID0gZnVuY3Rpb24odmVjdG9yMSwgdmVjdG9yMikge1xuXHRcdHJldHVybiBuZXcgVmVjdG9yMmQoIHZlY3RvcjEueCAtIHZlY3RvcjIueCwgdmVjdG9yMS55IC0gdmVjdG9yMi55ICk7XG5cdH07XG4gICAvKipcblx0KiBSZXR1cm5zIHRoZSByZXN1bHRpbmcgdmVjdG9yIG9mIGEgYWRkXG5cdCogQHBhcmFtIHtWZWN0b3IyZH0gdmVjdG9yMVxuXHQqIEBwYXJhbSB7VmVjdG9yMmR9IHZlY3RvcjJcblx0KiBAcmV0dXJuIHtWZWN0b3IyZH1cblx0Ki9cblx0TWF0aDJkLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih2ZWN0b3IxLCB2ZWN0b3IyKSB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IyZCggdmVjdG9yMS54ICsgdmVjdG9yMi54LCB2ZWN0b3IxLnkgKyB2ZWN0b3IyLnkgKTtcblx0fTtcbiAgIC8qKlxuXHQqIFJldHVybnMgdGhlIHByb2R1Y3QgZnJvbSBhIHZlY3RvciBhbiBhIG51bWJlclxuXHQqIEBwYXJhbSB7VmVjdG9yMmR9IHZlY3RvclxuXHQqIEBwYXJhbSB7ZmxvYXR9IHNjYWxhclxuXHQqIEByZXR1cm4ge1ZlY3RvcjJkfVxuXHQqL1xuXHRNYXRoMmQucHJvdG90eXBlLnNjYWxhclByb2R1Y3QgPSBmdW5jdGlvbih2ZWN0b3IsIHNjYWxhcikge1xuXHRcdHJldHVybiBuZXcgVmVjdG9yMmQoIHZlY3Rvci54ICogc2NhbGFyLCB2ZWN0b3IueSAqIHNjYWxhciApO1xuXHR9O1xuICAgLyoqXG5cdCogUm90YXRlcyB2ZWN0b3IxIGJ5IHJvdGF0aW9uIHRvIG1ha2UgaXQgY2xvc2VyIHRvIHZlY3RvcjIgYW5kIHJldHVybnMgdGhlIHJvdGF0aW9uXG5cdCogQHBhcmFtIHtWZWN0b3IyZH0gdmVjdG9yMVxuXHQqIEBwYXJhbSB7VmVjdG9yMmR9IHZlY3RvcjJcblx0KiBAcGFyYW0ge2Zsb2F0fSByb3RhdGlvbiB0aGUgYW5nbGUgdG8gYWRkIHRvIHRoZSB2ZWN0b3Jcblx0KiBAcmV0dXJuIHtmbG9hdH1cblx0Ki9cblx0TWF0aDJkLnByb3RvdHlwZS5yb3RhdGVJZk5lZWRlZCA9IGZ1bmN0aW9uKCB2ZWN0b3IxLCB2ZWN0b3IyLCByb3RhdGlvbiApIHtcblxuXHRcdGlmICggISAoIHRoaXMuYXJlUGFyYWxsZWxWZWN0b3JzKCB2ZWN0b3IxLCB2ZWN0b3IyICkgJiYgdGhpcy5oYXZlVGhlU2FtZURpcmVjdGlvbiggdmVjdG9yMSwgdmVjdG9yMiApICkgKSB7XG5cblx0XHRcdHZhciBkaXN0YW5jZSA9IHRoaXMuZ2V0U3F1YXJlRGlzdGFuY2UoIHZlY3RvcjEsIHZlY3RvcjIgKSxcblx0XHRcdFx0cm90YXRlZDEgPSB0aGlzLmdldFJvdGF0ZWRWZXJ0ZXgoIHZlY3RvcjEsIHJvdGF0aW9uICksXG5cdFx0XHRcdGRpc3RhbmNlQWZ0ZXJSb3RhdGlvbiA9IHRoaXMuZ2V0U3F1YXJlRGlzdGFuY2UoIHJvdGF0ZWQxLCB2ZWN0b3IyICk7XG5cblx0XHRcdGlmICggZGlzdGFuY2VBZnRlclJvdGF0aW9uIDwgZGlzdGFuY2UgKSB7XG5cdFx0XHRcdHZlY3RvcjEueCA9IHJvdGF0ZWQxLng7XG5cdFx0XHRcdHZlY3RvcjEueSA9IHJvdGF0ZWQxLnk7XG5cdFx0XHRcdHJldHVybiByb3RhdGlvbjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciByb3RhdGVkMiA9IHRoaXMuZ2V0Um90YXRlZFZlcnRleCggdmVjdG9yMSwgLXJvdGF0aW9uICk7XG5cdFx0XHRcdHZlY3RvcjEueCA9IHJvdGF0ZWQyLng7XG5cdFx0XHRcdHZlY3RvcjEueSA9IHJvdGF0ZWQyLnk7XG5cdFx0XHRcdHJldHVybiAtcm90YXRpb247XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gMDtcblxuXHR9O1xuICAvKipcbiAgICogR2l2ZW4gYSBtYXRyaXggW1thMTEsYTEyLGExMywgYjFdLCBbYTIxLCBhMjIsIGEyMywgYjJdLCBbYTMxLCBhMzIsIGEzMywgYjNdXSBzb2x2ZXMgdmFsdWVzIG9mIGEsIGIgYW5kIGMgYW5kIHNvIG9uXG4gICAqIGJ5IEdhdXNzXG4gICAqL1xuICBNYXRoMmQucHJvdG90eXBlLmdhdXNzID0gZnVuY3Rpb24oQSkge1xuICAgIFxuICAgIHZhciBuID0gQS5sZW5ndGg7XG5cbiAgICBmb3IgKHZhciBpPTA7IGk8bjsgaSsrKSB7XG4gICAgICAgIC8vIFNlYXJjaCBmb3IgbWF4aW11bSBpbiB0aGlzIGNvbHVtblxuICAgICAgICB2YXIgbWF4RWwgPSBNYXRoLmFicyhBW2ldW2ldKTtcbiAgICAgICAgdmFyIG1heFJvdyA9IGk7XG4gICAgICAgIGZvcih2YXIgaz1pKzE7IGs8bjsgaysrKSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoQVtrXVtpXSkgPiBtYXhFbCkge1xuICAgICAgICAgICAgICAgIG1heEVsID0gTWF0aC5hYnMoQVtrXVtpXSk7XG4gICAgICAgICAgICAgICAgbWF4Um93ID0gaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN3YXAgbWF4aW11bSByb3cgd2l0aCBjdXJyZW50IHJvdyAoY29sdW1uIGJ5IGNvbHVtbilcbiAgICAgICAgZm9yICh2YXIgaz1pOyBrPG4rMTsgaysrKSB7XG4gICAgICAgICAgICB2YXIgdG1wID0gQVttYXhSb3ddW2tdO1xuICAgICAgICAgICAgQVttYXhSb3ddW2tdID0gQVtpXVtrXTtcbiAgICAgICAgICAgIEFbaV1ba10gPSB0bXA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYWtlIGFsbCByb3dzIGJlbG93IHRoaXMgb25lIDAgaW4gY3VycmVudCBjb2x1bW5cbiAgICAgICAgZm9yIChrPWkrMTsgazxuOyBrKyspIHtcbiAgICAgICAgICAgIHZhciBjID0gLUFba11baV0vQVtpXVtpXTtcbiAgICAgICAgICAgIGZvcih2YXIgaj1pOyBqPG4rMTsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGk9PWopIHtcbiAgICAgICAgICAgICAgICAgICAgQVtrXVtqXSA9IDA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgQVtrXVtqXSArPSBjICogQVtpXVtqXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTb2x2ZSBlcXVhdGlvbiBBeD1iIGZvciBhbiB1cHBlciB0cmlhbmd1bGFyIG1hdHJpeCBBXG4gICAgdmFyIHggPSBuZXcgQXJyYXkobik7XG4gICAgZm9yICh2YXIgaT1uLTE7IGk+LTE7IGktLSkge1xuICAgICAgICB4W2ldID0gQVtpXVtuXS9BW2ldW2ldO1xuICAgICAgICBmb3IgKHZhciBrPWktMTsgaz4tMTsgay0tKSB7XG4gICAgICAgICAgICBBW2tdW25dIC09IEFba11baV0gKiB4W2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB4O1xuICB9XG4gIFxuICBNYXRoMmQucHJvdG90eXBlLnF1YWREZXJpdmF0aXZlID0gZnVuY3Rpb24oYXgyLCBieCwgYykge1xuICAgIHJldHVybiBbYXgyICogMiwgYnhdO1xuICB9O1xuXG4gLyoqXG5cdCogQGNsYXNzIFZlY3RvcjJkXG5cdCogQGNvbnN0cnVjdG9yXG5cdCogQHBhcmFtIHtmbG9hdH0geFxuXHQqIEBwYXJhbSB7ZmxvYXR9IHlcblx0KiBAcHJpdmF0ZVxuXHQqL1xuXHRmdW5jdGlvbiBWZWN0b3IyZCh4LCB5KSB7XG5cdFx0dGhpcy54ID0geCB8fCAwO1xuXHRcdHRoaXMueSA9IHkgfHwgMDtcblx0XHR0aGlzLnByZXZYID0gMDtcblx0XHR0aGlzLnByZXZZID0gMDtcblx0fVxuXHRWZWN0b3IyZC5wcm90b3R5cGUub2Zmc2V0ID0gZnVuY3Rpb24oeCwgeSkge1xuXHRcdHRoaXMuc2V0KHRoaXMueCArIHgsIHRoaXMueSArIHkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHRWZWN0b3IyZC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oeCwgeSkge1xuXHRcdHRoaXMuc2V0WCh4KTtcblx0XHR0aGlzLnNldFkoeSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cdFZlY3RvcjJkLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnNldCgwLCAwKTtcblx0fTtcblx0VmVjdG9yMmQucHJvdG90eXBlLnNldFggPSBmdW5jdGlvbih4KSB7XG5cdFx0dGhpcy5wcmV2WCA9IHRoaXMueDtcblx0XHR0aGlzLnggPSB4O1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHRWZWN0b3IyZC5wcm90b3R5cGUuc2V0WSA9IGZ1bmN0aW9uKHkpIHtcblx0XHR0aGlzLnByZXZZID0gdGhpcy55O1xuXHRcdHRoaXMueSA9IHk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cdFZlY3RvcjJkLnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbihyb3RhdGlvbikge1xuXHRcdHRoaXMuc2V0WChpbnN0YW5jZS5nZXRSb3RhdGVkVmVydGV4Q29vcmRzWCh0aGlzLngsIHRoaXMueSwgcm90YXRpb24pKTtcblx0XHR0aGlzLnNldFkoaW5zdGFuY2UuZ2V0Um90YXRlZFZlcnRleENvb3Jkc1kodGhpcy54LCB0aGlzLnksIHJvdGF0aW9uKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cblx0bmFtZXNwYWNlLlZlY3RvcjJkID0gVmVjdG9yMmQ7XG5cdFxuXHR2YXIgaW5zdGFuY2UgPSBuZXcgTWF0aDJkKCk7XG5cblx0bmFtZXNwYWNlLm1hdGgyZCA9IG5hbWVzcGFjZS5NYXRoMmQgPSBpbnN0YW5jZTtcblx0bmFtZXNwYWNlLm1hdGgyZC5WZWN0b3IyZCA9IFZlY3RvcjJkO1xuXHRcbn0pKHdpbmRvdy5NYXRjaCk7IiwiLyoqXG4gKiBAbW9kdWxlIE1hdGNoXG4gKi9cbihmdW5jdGlvbihNLCBFdmVudEhhbmRsZXIpIHtcblxuXHQvKipcblx0ICogUHJvdmlkZXMgYSBDYW1lcmEgZm9yIGVhc3kgc2NlbmUgZGlzcGxhY2VtZW50XG5cdCAqIFxuXHQgKiBAY2xhc3MgQ2FtZXJhXG5cdCAqIEBzdGF0aWNcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRmdW5jdGlvbiBDYW1lcmEoKSB7XG5cdFxuXHRcdHRoaXMuZXh0ZW5kc0V2ZW50SGFuZGxlcigpO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIHggY29vcmRpbmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSB4XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAdHlwZSBmbG9hdFxuXHRcdCAqL1xuXHRcdHRoaXMuX3ggPSAwO1xuXHRcdC8qKlxuXHRcdCAqIFRoZSB5IGNvb3JkaW5hdGVcblx0XHQgKiBAcHJvcGVydHkgeVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHR5cGUgZmxvYXRcblx0XHQgKi9cblx0XHR0aGlzLl95ID0gMDtcblx0XHR0aGlzLl9wcmV2WCA9IDA7XG5cdFx0dGhpcy5fcHJldlkgPSAwO1xuXHRcdC8qKlxuXHRcdCAqIFJlcHJlc2VudHMgdGhlIHdpZHRoIG9mIHRoZSB2aWV3YWJsZSBhcmVhXG5cdFx0ICogQHByb3BlcnR5IHZpZXdwb3J0V2lkdGhcblx0XHQgKiBAdHlwZSBmbG9hdFxuXHRcdCAqL1xuXHRcdHRoaXMudmlld3BvcnRXaWR0aCA9IDA7XG5cdFx0LyoqXG5cdFx0ICogUmVwcmVzZW50cyB0aGUgaGVpZ2h0IG9mIHRoZSB2aWV3YWJsZSBhcmVhXG5cdFx0ICogQHByb3BlcnR5IHZpZXdwb3J0SGVpZ2h0XG5cdFx0ICogQHR5cGUgZmxvYXRcblx0XHQgKi9cblx0XHR0aGlzLnZpZXdwb3J0SGVpZ2h0ID0gMDtcblx0XHQvKipcblx0XHQgKiBSZXByZXNlbnRzIHRoZSBoYWxmIGhlaWdodCBvZiB0aGUgdmlld2FibGUgYXJlYVxuXHRcdCAqIEBwcm9wZXJ0eSBfaGFsZlZpZXdwb3J0SGVpZ2h0XG5cdFx0ICogQHR5cGUgZmxvYXRcblx0XHQgKiBAcHJpdmF0ZSBcblx0XHQgKi9cblx0XHR0aGlzLl9oYWxmVmlld3BvcnRIZWlnaHQgPSAwO1xuXHRcdC8qKlxuXHRcdCAqIFJlcHJlc2VudHMgdGhlIGhhbGYgd2lkdGggb2YgdGhlIHZpZXdhYmxlIGFyZWFcblx0XHQgKiBAcHJvcGVydHkgX2hhbGZWaWV3cG9ydFdpZHRoXG5cdFx0ICogQHR5cGUgZmxvYXRcblx0XHQgKiBAcHJpdmF0ZSBcblx0XHQgKi9cblx0XHR0aGlzLl9oYWxmVmlld3BvcnRXaWR0aCA9IDA7XG5cdFx0XG5cdFx0dGhpcy5fYm91bmRpbmdBcmVhID0gbnVsbDtcblx0XHRcblx0fVxuXHRDYW1lcmEucHJvdG90eXBlLnNldEJvdW5kaW5nQXJlYSA9IGZ1bmN0aW9uKGxlZnQsIHRvcCwgcmlnaHQsIGJvdHRvbSkge1xuXHRcdHRoaXMuX2JvdW5kaW5nQXJlYSA9IHtcblx0XHRcdG1pblg6IGxlZnQsXG5cdFx0XHRtaW5ZOiB0b3AsXG5cdFx0XHRtYXhYOiByaWdodCxcblx0XHRcdG1heFk6IGJvdHRvbVxuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdmlld3BvcnQgd2lkdGgsIGhpZ2h0IGFuZCBoYWxmcyBzaXplc1xuXHQgKiBAbWV0aG9kIHNldFZpZXdwb3J0XG5cdCAqIEBwYXJhbSB7aW50fSB3aWR0aFxuXHQgKiBAcGFyYW0ge2ludH0gaGVpZ2h0XG5cdCAqL1xuXHRDYW1lcmEucHJvdG90eXBlLnNldFZpZXdwb3J0ID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXHRcblx0XHR0aGlzLnZpZXdwb3J0V2lkdGggPSB3aWR0aDtcblx0XHR0aGlzLnZpZXdwb3J0SGVpZ2h0ID0gaGVpZ2h0O1xuXHRcdFxuXHRcdHRoaXMuX2hhbGZWaWV3cG9ydFdpZHRoID0gd2lkdGggLyAyO1xuXHRcdHRoaXMuX2hhbGZWaWV3cG9ydEhlaWdodCA9IGhlaWdodCAvIDI7XG5cdFx0XG5cdH1cblx0LyoqXG5cdCAqIENlbnRlcnMgdGhlIGNhbWVyYSBhdCB0aGUgZ2l2ZW4gUmVuZGVyaXphYmxlXG5cdCAqIEBtZXRob2QgY2VudGVyQXRSZW5kZXJpemFibGVcblx0ICogQHBhcmFtIHtyZW5kZXJlcnMuUmVuZGVyaXphYmxlfSByZW5kZXJpemFibGVcblx0ICovXG5cdENhbWVyYS5wcm90b3R5cGUuY2VudGVyQXRSZW5kZXJpemFibGUgPSBmdW5jdGlvbihyZW5kZXJpemFibGUpIHtcblx0XHR0aGlzLmNlbnRlckF0KHJlbmRlcml6YWJsZS5feCwgcmVuZGVyaXphYmxlLl95KTtcblx0fTtcblx0LyoqXG5cdCAqIENlbnRlcnMgdGhlIGNhbWVyYSBhdCB0aGUgZ2l2ZW4gY29vcmRpbmF0ZXNcblx0ICogQG1ldGhvZCBjZW50ZXJBdFxuXHQgKiBAcGFyYW0ge3h9IGludGVnZXJcblx0ICogQHBhcmFtIHt5fSBpbnRlZ2VyXG5cdCAqL1xuXHRDYW1lcmEucHJvdG90eXBlLmNlbnRlckF0ID0gZnVuY3Rpb24oeCwgeSkge1xuXG5cdFx0eCA9IHggLSB0aGlzLl9oYWxmVmlld3BvcnRXaWR0aDtcblx0XHR5ID0geSAtIHRoaXMuX2hhbGZWaWV3cG9ydEhlaWdodDtcblxuXHRcdGlmICggdGhpcy5fYm91bmRpbmdBcmVhICkge1xuXHRcdFx0aWYgKCB4IDwgdGhpcy5fYm91bmRpbmdBcmVhLm1pblggKSB7XG5cdFx0XHRcdHggPSB0aGlzLl9ib3VuZGluZ0FyZWEubWluWDtcblx0XHRcdH1cblx0XHRcdGlmICggeSA8IHRoaXMuX2JvdW5kaW5nQXJlYS5taW5ZICkge1xuXHRcdFx0XHR5ID0gdGhpcy5fYm91bmRpbmdBcmVhLm1pblk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHggPiB0aGlzLl9ib3VuZGluZ0FyZWEubWF4WCApIHtcblx0XHRcdFx0eCA9IHRoaXMuX2JvdW5kaW5nQXJlYS5tYXhYO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB5ID4gdGhpcy5fYm91bmRpbmdBcmVhLm1heFkgKSB7XG5cdFx0XHRcdHkgPSB0aGlzLl9ib3VuZGluZ0FyZWEubWF4WTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnNldFgoeCk7XG5cdFx0dGhpcy5zZXRZKHkpO1xuXG5cdH07XG5cblx0Q2FtZXJhLnByb3RvdHlwZS5zZXRYID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLl9wcmV2WCA9IHRoaXMuX3g7XG5cdFx0dGhpcy5feCA9IHZhbHVlO1xuXHRcdHRoaXMucmFpc2VFdmVudChcImxvY2F0aW9uQ2hhbmdlZFwiKTtcblx0fTtcblxuXHRDYW1lcmEucHJvdG90eXBlLnNldFkgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHRoaXMuX3ByZXZZID0gdGhpcy5feTtcblx0XHR0aGlzLl95ID0gdmFsdWU7XG5cdFx0dGhpcy5yYWlzZUV2ZW50KFwibG9jYXRpb25DaGFuZ2VkXCIpO1xuXHR9O1xuXG5cdENhbWVyYS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFgoMCk7XG5cdFx0dGhpcy5zZXRZKDApO1xuXHR9O1xuXG5cdENhbWVyYS5wcm90b3R5cGUuZ2V0WCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl94O1xuXHR9O1xuXG5cdENhbWVyYS5wcm90b3R5cGUuZ2V0WSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl95O1xuXHR9O1xuXHRcblx0Q2FtZXJhLnByb3RvdHlwZS5vZmZzZXRYID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLnNldFgodGhpcy5feCArIHZhbHVlKTtcblx0fTtcblxuXHRDYW1lcmEucHJvdG90eXBlLm9mZnNldFkgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHRoaXMuc2V0WSh0aGlzLl95ICsgdmFsdWUpO1xuXHR9O1xuXG5cdENhbWVyYS5wcm90b3R5cGUub2Zmc2V0ID0gZnVuY3Rpb24oeCwgeSkge1xuXHRcdHRoaXMub2Zmc2V0WCh4KTtcblx0XHR0aGlzLm9mZnNldFkoeSk7XG5cdH07XG5cblx0Q2FtZXJhLnByb3RvdHlwZS5nZXRMZWZ0RnJvbUxheWVyID0gZnVuY3Rpb24obGF5ZXIpIHtcblx0XHRyZXR1cm4gdGhpcy5feCAqIGxheWVyLnBhcnJhbGxheEZhY3Rvci54O1xuXHR9O1xuXG5cdENhbWVyYS5wcm90b3R5cGUuZ2V0VG9wRnJvbUxheWVyID0gZnVuY3Rpb24obGF5ZXIpIHtcblx0XHRyZXR1cm4gdGhpcy5feSAqIGxheWVyLnBhcnJhbGxheEZhY3Rvci55O1xuXHR9O1xuXG5cdENhbWVyYS5wcm90b3R5cGUuZ2V0Qm90dG9tRnJvbUxheWVyID0gZnVuY3Rpb24obGF5ZXIpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRUb3BGcm9tTGF5ZXIobGF5ZXIpICsgdGhpcy52aWV3cG9ydEhlaWdodDtcblx0fTtcblxuXHRDYW1lcmEucHJvdG90eXBlLmdldFJpZ2h0RnJvbUxheWVyID0gZnVuY3Rpb24obGF5ZXIpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRMZWZ0RnJvbUxheWVyKGxheWVyKSArIHRoaXMudmlld3BvcnRXaWR0aDtcblx0fTtcblx0LyoqXG5cdCAqIFdlIHVzZSBTcXVhcmUgY29sbGlzaW9uIGRldGVjdGlvbiB0byBkZXRlcm1pbmUgaWYgdGhlXG5cdCAqIG9iamVjdCBpcyB2aXNpYmxlIG9yIG5vdFxuXHQgKi9cblx0Q2FtZXJhLnByb3RvdHlwZS5jYW5TZWUgPSBmdW5jdGlvbihyZW5kZXJpemFibGUsIHBhcnJhbGxheEZhY3RvclgsIHBhcnJhbGxheEZhY3RvclkpIHtcblx0XHRcblx0XHRpZiAoIHJlbmRlcml6YWJsZS5fYWxwaGEgPT0gMCB8fCAhcmVuZGVyaXphYmxlLl92aXNpYmxlICkgcmV0dXJuIGZhbHNlO1xuXHRcdFxuXHRcdHZhciBzaXplT2JqID0gMDtcblx0XHRcblx0XHRpZiAoIHJlbmRlcml6YWJsZS5faGFsZldpZHRoID4gcmVuZGVyaXphYmxlLl9oYWxmSGVpZ2h0ICkge1xuXHRcdFx0c2l6ZU9iaiA9IHJlbmRlcml6YWJsZS5faGFsZldpZHRoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzaXplT2JqID0gcmVuZGVyaXphYmxlLl9oYWxmSGVpZ2h0O1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5feSArIHRoaXMudmlld3BvcnRIZWlnaHQgPCByZW5kZXJpemFibGUuZ2V0VG9wKCkgKiBwYXJyYWxsYXhGYWN0b3JZICkgcmV0dXJuIGZhbHNlO1xuXHRcdGlmICggdGhpcy5feSAtIHRoaXMudmlld3BvcnRIZWlnaHQgPiByZW5kZXJpemFibGUuZ2V0Qm90dG9tKCkgKiBwYXJyYWxsYXhGYWN0b3JZICkgcmV0dXJuIGZhbHNlO1xuXHRcdGlmICggdGhpcy5feCArIHRoaXMudmlld3BvcnRXaWR0aCA8IHJlbmRlcml6YWJsZS5nZXRMZWZ0KCkgKiBwYXJyYWxsYXhGYWN0b3JYICkgcmV0dXJuIGZhbHNlO1xuXHRcdGlmICggdGhpcy5feCAtIHRoaXMudmlld3BvcnRXaWR0aCA+IHJlbmRlcml6YWJsZS5nZXRSaWdodCgpICogcGFycmFsbGF4RmFjdG9yWCApIHJldHVybiBmYWxzZTtcblx0XHRcblx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcblx0fTtcblx0XG5cdE0uZXh0ZW5kKENhbWVyYSwgRXZlbnRIYW5kbGVyKTtcblxuXHRNLkNhbWVyYSA9IENhbWVyYTtcblxufSkoTWF0Y2gsIEV2ZW50SGFuZGxlcik7IiwiLyoqXG4gKiBAbW9kdWxlIE1hdGNoXG4gKi9cbihmdW5jdGlvbihuYW1lc3BhY2UsIE0pIHtcblxuXHQvKipcblx0ICogQGNsYXNzIFBhcnRpY2xlXG5cdCAqIEBuYW1lc3BhY2UgdmlzdWFsXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge1ZlY3RvcjJkfSBvcmlnaW5cblx0ICogQHBhcmFtIHtWZWN0b3IyZH0gZGVzdGluYXRpb25cblx0ICogQHBhcmFtIHtmbG9hdH0gd2lkdGhcblx0ICogQHBhcmFtIHtmbG9hdH0gaGVpZ2h0XG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBmaWxsU3R5bGVcblx0ICovXG5cdGZ1bmN0aW9uIFBhcnRpY2xlKG9yaWdpbiwgZGVzdGluYXRpb24sIHdpZHRoLCBoZWlnaHQsIGZpbGxTdHlsZSkge1xuXHRcdHRoaXMuYW5nbGUgPSAwO1xuXHRcdHRoaXMuX3JvdGF0aW9uU3BlZWQgPSAwLjE7XG5cdFx0dGhpcy5zcGVlZCA9IDAuMDU7XG5cdFx0dGhpcy52YW5pc2hSYXRlID0gMC4wMDU7XG5cdFx0dGhpcy5hbHBoYSA9IDE7XG5cdFx0dGhpcy5zZXRQYXRoKG9yaWdpbiwgZGVzdGluYXRpb24pO1xuXHRcdHRoaXMuc2V0V2lkdGgod2lkdGgpO1xuXHRcdHRoaXMuc2V0SGVpZ2h0KGhlaWdodCk7XG5cdH1cblx0LyoqXG5cdCAqIEBtZXRob2Qgc2V0V2lkdGhcblx0ICogQHBhcmFtIHtmbG9hdH0gd2lkdGhcblx0ICovXG5cdFBhcnRpY2xlLnByb3RvdHlwZS5zZXRXaWR0aCA9IGZ1bmN0aW9uKHdpZHRoKSB7XG5cdFx0dGhpcy5faGFsZldpZHRoID0gd2lkdGggLyAyO1xuXHR9O1xuXHQvKipcblx0ICogQG1ldGhvZCBzZXRIZWlnaHRcblx0ICogQHBhcmFtIHtmbG9hdH0gaGVpZ2h0XG5cdCAqL1xuXHRQYXJ0aWNsZS5wcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24oaGVpZ2h0KSB7XG5cdFx0dGhpcy5faGFsZkhlaWdodCA9IGhlaWdodCAvIDI7XG5cdH07XG5cdC8qKlxuXHQgKiBAbWV0aG9kIHNldFBhdGhcblx0ICogQHBhcmFtIHtPYmplY3R9IG9yaWdpbiBPYmplY3QgY29udGFpbmluZyBvcmlnaW4geCBhbmQgeSBjb29yZGluYXRlc1xuXHQgKiBAcGFyYW0ge09iamVjdH0gZGVzdGluYXRpb24gT2JqZWN0IGNvbnRhaW5pbmcgZGVzdGluYXRpb24geCBhbmQgeSBjb29yZGluYXRlc1xuXHQgKi9cblx0UGFydGljbGUucHJvdG90eXBlLnNldFBhdGggPSBmdW5jdGlvbihvcmlnaW4sIGRlc3RpbmF0aW9uKSB7XG5cblx0XHR0aGlzLl94ID0gb3JpZ2luLng7XG5cdFx0dGhpcy5feSA9IG9yaWdpbi55O1xuXG5cdFx0dGhpcy5kaXJlY3Rpb24gPSBNLm1hdGgyZC5nZXRWZWN0b3IyZChvcmlnaW4sIGRlc3RpbmF0aW9uKTtcblxuXHR9O1xuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgcGFydGljbGVcblx0ICogQG1ldGhvZCBvbkxvb3Bcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0UGFydGljbGUucHJvdG90eXBlLm9uTG9vcCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5hbHBoYSAtPSB0aGlzLnZhbmlzaFJhdGU7XG5cblx0XHR0aGlzLmFuZ2xlICs9IHRoaXMuX3JvdGF0aW9uU3BlZWQ7XG5cdFx0dGhpcy5feCArPSB0aGlzLnNwZWVkICogdGhpcy5kaXJlY3Rpb24ueDtcblx0XHR0aGlzLl95ICs9IHRoaXMuc3BlZWQgKiB0aGlzLmRpcmVjdGlvbi55O1xuXG5cdH07XG5cdC8qKlxuXHQgKiBSZW5kZXJzIHRoZSBwYXJ0aWNsZVxuXHQgKiBAbWV0aG9kIG9uUmVuZGVyXG5cdCAqL1xuXHRQYXJ0aWNsZS5wcm90b3R5cGUub25SZW5kZXIgPSBmdW5jdGlvbihjb250ZXh0LCBjYW52YXMsIGNhbWVyYVgsIGNhbWVyYVkpIHtcblxuXHRcdGlmICggdGhpcy5hbHBoYSA+PSAwICkge1xuXG5cdFx0XHRjb250ZXh0LnNhdmUoKTtcblx0XHRcdGNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhO1xuXHRcdFx0Y29udGV4dC50cmFuc2xhdGUodGhpcy5feCAtIGNhbWVyYVgsIHRoaXMuX3kgLSBjYW1lcmFZKTtcblx0XHRcdGNvbnRleHQucm90YXRlKHRoaXMuYW5nbGUpO1xuXHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSB0aGlzLmZpbGxTdHlsZTtcblx0XHRcdGNvbnRleHQuZmlsbFJlY3QoLXRoaXMuX2hhbGZXaWR0aCwgLXRoaXMuX2hhbGZIZWlnaHQsIHRoaXMuX2hhbGZXaWR0aCwgdGhpcy5faGFsZkhlaWdodCk7XG5cdFx0XHRjb250ZXh0LnJlc3RvcmUoKTtcblxuXHRcdH1cblxuXHR9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgekluZGV4IG9mIHRoaXMgb2JqZWN0XG5cdCAqIEBtZXRob2Qgc2V0WkluZGV4XG5cdCAqIEBwYXJhbSB7aW50fSB2YWx1ZSB0aGUgekluZGV4XG5cdCAqL1xuXHRQYXJ0aWNsZS5wcm90b3R5cGUuc2V0WkluZGV4ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3pJbmRleCA9IHZhbHVlO1xuICAgIH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBvYmplY3QgaXMgdmlzaWJsZSBhbmQgaXMgaW5zaWRlIHRoZSBnaXZlbiB2aWV3cG9ydFxuXHQgKlxuXHQgKiBAbWV0aG9kIGlzVmlzaWJsZVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSBjYW1lcmFYMCB0aGUgbGVmdCBjb29yZGluYXRlIG9mIHRoZSBjYW1lcmFcblx0ICogQHBhcmFtIHtmbG9hdH0gY2FtZXJhWTAgdGhlIHRvcCBjb29yZGluYXRlIG9mIHRoZSBjYW1lcmFcblx0ICogQHBhcmFtIHtmbG9hdH0gY2FtZXJhWDEgdGhlIHJpZ2h0IGNvb3JkaW5hdGUgb2YgdGhlIHZpZXdwb3J0XG5cdCAqIEBwYXJhbSB7ZmxvYXR9IGNhbWVyYVkxIHRoZSBib3R0b20gY29vcmRpbmF0ZSBvZiB0aGUgdmlld3BvcnRcblx0ICogQHJldHVybiB7Qm9vbGVhbn1cblx0ICovXG5cdFBhcnRpY2xlLnByb3RvdHlwZS5pc1Zpc2libGUgPSBmdW5jdGlvbihjYW1lcmFYMCwgY2FtZXJhWTAsIGNhbWVyYVgxLCBjYW1lcmFZMSkge1xuXHRcdGlmICggdGhpcy5hbHBoYSA8PSAwICkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHR2YXIgY2FtZXJhID0gTS5jYW1lcmE7XG5cdFx0aWYgKHRoaXMuX3kgKyB0aGlzLl9oYWxmSGVpZ2h0IDwgY2FtZXJhWTApIHJldHVybiBmYWxzZTtcblx0XHRpZiAodGhpcy5feSAtIHRoaXMuX2hhbGZIZWlnaHQgPiBjYW1lcmFZMSkgcmV0dXJuIGZhbHNlO1xuXHRcdGlmICh0aGlzLl94ICsgdGhpcy5faGFsZldpZHRoIDwgY2FtZXJhWDApIHJldHVybiBmYWxzZTtcblx0XHRpZiAodGhpcy5feCAtIHRoaXMuX2hhbGZXaWR0aCA+IGNhbWVyYVgxKSByZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblx0Lypcblx0ICogQ3JlYXRlcyBsaW5lYXIgcGFydGljbGVzIGFuZCByZXR1cm5zIHRoZW0gYXMgaW4gYXJyYXlcblx0ICogQHBhcmFtIGFtb3VudCBvZiBwYXJ0aWNsZXNcblx0ICogQHBhcmFtIGRlcGFydHVyZSB4XG5cdCAqIEBwYXJhbSBkZXBhcnR1cmUgeVxuXHQgKiBAcGFyYW0gZGlyZWN0aW9uIGluIHdoaWNoIHRoZSBwYXJ0aWNsZXMgd2lsbCBtb3ZlXG5cdCAqIEBwYXJhbSBtaW4gd2lkdGggb2YgdGhlIHBhcnRpY2xlc1xuXHQgKiBAcGFyYW0gbWluIGhlaWdodCBvZiB0aGUgcGFydGljbGVzXG5cdCAqIEBwYXJhbSBtYXggd2lkdGggb2YgdGhlIHBhcnRpY2xlc1xuXHQgKiBAcGFyYW0gbWF4IGhlaWdodCBvZiB0aGUgcGFydGljbGVzXG5cdCAqIEBwYXJhbSBtaW4gc3BlZWQgb2YgdGhlIHBhcnRpY2xlc1xuXHQgKiBAcGFyYW0gbWF4IHNwZWVkIG9mIHRoZSBwYXJ0aWNsZXNcblx0ICogQHBhcmFtIGNvbG9yIG9mIHRoZSBwYXJ0aWNsZXMgLSBpZiBub3QgcHJvdmlkZWQgYW4gZXhwbG9zaW9uIGNvbG9yIHdpbGwgYmUgYXBwbGllZFxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlTGluZWFyUGFydGljbGVzKGFtb3VudCwgb3JpZ2luLCBkaXJlY3Rpb24sIG1pbldpZHRoLCBtaW5IZWlnaHQsIG1heFdpZHRoLCBtYXhIZWlnaHQsIG1pblNwZWVkLCBtYXhTcGVlZCwgY29sb3IsIHZhbmlzaFJhdGUsIG1heFZhbmlzaFJhdGUpIHtcblxuXHRcdHZhciBsaWIgPSBNLk1hdGgyZDtcblxuXHRcdHZhciBwYXJ0aWNsZXMgPSBbXTtcblxuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGFtb3VudDsgaSsrKSB7XG5cblx0XHRcdHZhciBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZShvcmlnaW4sIHsgeDogb3JpZ2luLnggKyBkaXJlY3Rpb24ueCAqIDUsIHk6IG9yaWdpbi55ICsgZGlyZWN0aW9uLnkgKiA1fSk7XG5cblx0XHRcdHBhcnRpY2xlLnNldFdpZHRoKGxpYi5yYW5kb21JbnQobWluV2lkdGgsIG1heFdpZHRoKSk7XG5cdFx0XHRwYXJ0aWNsZS5zZXRIZWlnaHQobGliLnJhbmRvbUludChtaW5IZWlnaHQsIG1heEhlaWdodCkpO1xuXG5cdFx0XHRpZiAoICEgY29sb3IgKSB7XG5cdFx0XHRcdHN3aXRjaCAoIGxpYi5yYW5kb21JbnQoMCwyKSApIHtcblx0XHRcdFx0XHRjYXNlIDA6XG5cdFx0XHRcdFx0XHRwYXJ0aWNsZS5jb2xvciA9IFwicmdiKDI1NSwgMTI4LCAwKVwiO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdFx0cGFydGljbGUuY29sb3IgPSBcInJnYigyNTUsIDE4MCwgMClcIjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRcdHBhcnRpY2xlLmNvbG9yID0gXCJyZ2IoMjU1LCA4MCwgMClcIjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cGFydGljbGUuY29sb3IgPSBjb2xvcltsaWIucmFuZG9tSW50KDAsIGNvbG9yLmxlbmd0aCAtIDEpXTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBtYXhWYW5pc2hSYXRlICkge1xuXHRcdFx0XHRwYXJ0aWNsZS52YW5pc2hSYXRlID0gbGliLnJhbmRvbUZsb2F0KCB2YW5pc2hSYXRlLCBtYXhWYW5pc2hSYXRlICk7XG5cdFx0XHR9IGVsc2UgaWYgKCB2YW5pc2hSYXRlICkge1xuXHRcdFx0XHRwYXJ0aWNsZS52YW5pc2hSYXRlID0gdmFuaXNoUmF0ZTtcblx0XHRcdH1cblxuXHRcdFx0cGFydGljbGUuc3BlZWQgPSBsaWIucmFuZG9tRmxvYXQobWluU3BlZWQsIG1heFNwZWVkKTtcblxuXHRcdFx0cGFydGljbGVzLnB1c2gocGFydGljbGUpO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhcnRpY2xlcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIEBjbGFzcyBSYWRpYWxQYXJ0aWNsZUVtaXR0ZXJcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBuYW1lc3BhY2UgdmlzdWFsXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge2ludH0gYW1vdW50IGFtb3VudCBvZiBwYXJ0aWNsZXNcblx0ICogQHBhcmFtIHtBcnJheX0gY29sb3IgYXJyYXkgb2YgU3RyaW5ncyB3aXRoIHBvc2libGUgY29sb3JzXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IG1pbldpZHRoIG1pbiB3aWR0aCBvZiB0aGUgcGFydGljbGVzXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IG1pbkhlaWdodCBtaW4gaGVpZ2h0IG9mIHRoZSBwYXJ0aWNsZXNcblx0ICogQHBhcmFtIHtmbG9hdH0gbWF4V2lkdGggbWF4IHdpZHRoIG9mIHRoZSBwYXJ0aWNsZXNcblx0ICogQHBhcmFtIHtmbG9hdH0gbWF4SGVpZ2h0IG1heCBoZWlnaHQgb2YgdGhlIHBhcnRpY2xlc1xuXHQgKiBAcGFyYW0ge2Zsb2F0fSBtaW5TcGVlZCBtaW4gc3BlZWQgb2YgdGhlIHBhcnRpY2xlc1xuXHQgKiBAcGFyYW0ge2Zsb2F0fSBtYXhTcGVlZCBtYXggc3BlZWQgb2YgdGhlIHBhcnRpY2xlc1xuXHQgKiBAcGFyYW0ge2Zsb2F0fSB2YW5pc2hSYXRlIGlmIG5vdCBwcm92aWRlZCB3aWxsIGRlZmF1bHQgdG8gMC4wMSBAc2VlIHBhcnRpY2xlLnZhbmlzaFJhdGVcblx0ICovXG5cdGZ1bmN0aW9uIFJhZGlhbFBhcnRpY2xlRW1pdHRlcihhbW91bnQsIGNvbG9yLCBtaW5XaWR0aCwgbWluSGVpZ2h0LCBtYXhXaWR0aCwgbWF4SGVpZ2h0LCBtaW5TcGVlZCwgbWF4U3BlZWQsIHZhbmlzaFJhdGUpIHtcblx0XHRpZiAoICEgdGhpcy5taW5BbmdsZSApIHRoaXMubWluQW5nbGUgPSAwO1xuXHRcdGlmICggISB0aGlzLm1heEFuZ2xlICkgdGhpcy5tYXhBbmdsZSA9IDYuMjg7XG5cdFx0dGhpcy5hbW91bnQgPSBhbW91bnQ7XG5cdFx0dGhpcy5jb2xvciA9IGNvbG9yO1xuXHRcdHRoaXMubWluV2lkdGggPSBtaW5XaWR0aCB8fCAxO1xuXHRcdHRoaXMubWluSGVpZ2h0ID0gbWluSGVpZ2h0IHx8IDE7XG5cdFx0dGhpcy5tYXhXaWR0aCA9IG1heFdpZHRoIHx8IDM7XG5cdFx0dGhpcy5tYXhIZWlnaHQgPSBtYXhIZWlnaHQgfHwgMztcblx0XHR0aGlzLm1pblNwZWVkID0gbWluU3BlZWQgfHwgMC4wMTtcblx0XHR0aGlzLm1heFNwZWVkID0gbWF4U3BlZWQgfHwgMC4xO1xuXHRcdHRoaXMudmFuaXNoUmF0ZSA9IHZhbmlzaFJhdGU7XG5cdH1cblxuXHRSYWRpYWxQYXJ0aWNsZUVtaXR0ZXIucHJvdG90eXBlLm9uTG9vcCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggIXRoaXMuY2hpbGRyZW4gKSByZXR1cm47XG5cdFx0dmFyIGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGgsIG5vdFZpc2libGUgPSAwLCBjdXJyZW50UGFydGljbGU7XG5cdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0Y3VycmVudFBhcnRpY2xlID0gdGhpcy5jaGlsZHJlbltpXTtcblx0XHRcdGlmICggY3VycmVudFBhcnRpY2xlLmFscGhhIDw9IDAgKSB7XG5cdFx0XHRcdG5vdFZpc2libGUrKztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGN1cnJlbnRQYXJ0aWNsZS5vbkxvb3AoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCBub3RWaXNpYmxlID09IGwgKSB7XG5cdFx0XHR0aGlzLmNoaWxkcmVuID0gbnVsbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gdGhpcy5ub3RpZnlDaGFuZ2UoKTtcblx0XHR9XG5cdH07XG5cblx0UmFkaWFsUGFydGljbGVFbWl0dGVyLnByb3RvdHlwZS5vblJlbmRlciA9IGZ1bmN0aW9uICgpIHtcblx0fTtcblxuXHRSYWRpYWxQYXJ0aWNsZUVtaXR0ZXIucHJvdG90eXBlLmlzVmlzaWJsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXG5cdFJhZGlhbFBhcnRpY2xlRW1pdHRlci5wcm90b3R5cGUuc2V0WkluZGV4ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0dGhpcy5fekluZGV4ID0gdmFsdWU7XG5cdFx0Ly8gdGhpcy5ub3RpZnlDaGFuZ2UoKTtcblx0XHQvLyB0aGlzLm5vdGlmeVpJbmRleENoYW5nZSgpO1xuXHR9O1xuXHQvKipcblx0ICogQ3JlYXRlcyBwYXJ0aWNsZXMgdGhhdCB3aWxsIG1vdmUgZnJvbSB0aGUgY2VudGVyIHRvIGFub3RoZXIgcGFydCBvZiBhIGNpcmNsZVxuXHQgKiBAbWV0aG9kIGNyZWF0ZVxuXHQgKiBAcGFyYW0ge2ludH0geCB0aGUgeCBjZW50ZXIgYXQgd2hlcmUgdG8gY3JlYXRlIHRoZSBwYXJ0aWNsZXNcblx0ICogQHBhcmFtIHtpbnR9IHkgdGhlIHkgY2VudGVyIGF0IHdoZXJlIHRvIGNyZWF0ZSB0aGUgcGFydGljbGVzXG5cdCAqL1xuXHRSYWRpYWxQYXJ0aWNsZUVtaXR0ZXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKHgsIHkpIHtcblxuXHRcdHZhciBybmQgPSBNLnJhbmRvbTtcblxuXHRcdHRoaXMuY2hpbGRyZW4gPSBuZXcgQXJyYXkoKTtcblxuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IHRoaXMuYW1vdW50OyBpKyspIHtcblxuXHRcdFx0LyogdCBFIFswLCAyICogUEldICovXG5cdFx0XHR2YXIgdCA9IHJuZC5kZWNpbWFsKHRoaXMubWluQW5nbGUsIHRoaXMubWF4QW5nbGUpLFxuXHRcdFx0LyogUmFkaXVzICovXG5cdFx0XHRyID0gNTAsXG5cdFx0XHRvcmlnaW4gPSBuZXcgT2JqZWN0KCksXG5cdFx0XHRkZXN0aW5hdGlvbiA9IG5ldyBPYmplY3QoKSxcblx0XHRcdHBhcnRpY2xlO1xuXG5cdFx0XHRvcmlnaW4ueCA9IHg7XG5cdFx0XHRvcmlnaW4ueSA9IHk7XG5cblx0XHRcdGRlc3RpbmF0aW9uLnggPSB4ICsgciAqIE1hdGguY29zKHQpO1xuXHRcdFx0ZGVzdGluYXRpb24ueSA9IHkgKyByICogTWF0aC5zaW4odCk7XG5cblx0XHRcdHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKG9yaWdpbiwgZGVzdGluYXRpb24pO1xuXG5cdFx0XHRwYXJ0aWNsZS5zZXRXaWR0aChybmQuaW50ZWdlcih0aGlzLm1pbldpZHRoLCB0aGlzLm1heFdpZHRoKSk7XG5cdFx0XHRwYXJ0aWNsZS5zZXRIZWlnaHQocm5kLmludGVnZXIodGhpcy5taW5IZWlnaHQsIHRoaXMubWF4SGVpZ2h0KSk7XG5cblx0XHRcdGlmICggIXRoaXMuY29sb3IgKSB7XG5cdFx0XHRcdHN3aXRjaCAoIHJuZC5pbnRlZ2VyKDAsMikgKSB7XG5cdFx0XHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRcdFx0cGFydGljbGUuZmlsbFN0eWxlID0gXCJyZ2IoMjU1LCAxMjgsIDApXCI7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdFx0XHRwYXJ0aWNsZS5maWxsU3R5bGUgPSBcInJnYigyNTUsIDE4MCwgMClcIjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRwYXJ0aWNsZS5maWxsU3R5bGUgPSBcInJnYigyNTUsIDgwLCAwKVwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwYXJ0aWNsZS5maWxsU3R5bGUgPSB0aGlzLmNvbG9yW3JuZC5pbnRlZ2VyKDAsIGNvbG9yLmxlbmd0aCAtIDEpXTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0aGlzLnZhbmlzaFJhdGUgKSB7XG5cdFx0XHRcdHBhcnRpY2xlLnZhbmlzaFJhdGUgPSB0aGlzLnZhbmlzaFJhdGU7XG5cdFx0XHR9XG5cblx0XHRcdHBhcnRpY2xlLnNwZWVkID0gcm5kLmRlY2ltYWwodGhpcy5taW5TcGVlZCwgdGhpcy5tYXhTcGVlZCk7XG5cblx0XHRcdHRoaXMuY2hpbGRyZW4ucHVzaChwYXJ0aWNsZSk7XG5cblx0XHR9XG5cblx0fTtcblxuXHQvKipcblx0ICogQGNsYXNzIExpbmVhclBhcnRpY2xlRW1pdHRlclxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQG5hbWVzcGFjZSB2aXN1YWxcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7aW50fSBwYXJ0aWNsZUFtb3VudFxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29sb3Jcblx0ICogQHBhcmFtIHtmbG9hdH0gW21pbldpZHRoXVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSBbbWluSGVpZ2h0XVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSBbbWF4V2lkdGhdXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IFttYXhIZWlnaHRdXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IFttaW5TcGVlZF1cblx0ICogQHBhcmFtIHtmbG9hdH0gW21heFNwZWVkXVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSBbdmFuaXNoUmF0ZV1cblx0ICovXG5cdGZ1bmN0aW9uIExpbmVhclBhcnRpY2xlRW1pdHRlcihhbW91bnQsIGNvbG9yLCBtaW5XaWR0aCwgbWluSGVpZ2h0LCBtYXhXaWR0aCwgbWF4SGVpZ2h0LCBtaW5TcGVlZCwgbWF4U3BlZWQsIHZhbmlzaFJhdGUpIHtcblxuXHRcdHRoaXMub3JpZ2luID0gb3JpZ2luO1xuXHRcdHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuXG5cdFx0dGhpcy5wYXJ0aWNsZXMgPSBjcmVhdGVMaW5lYXJQYXJ0aWNsZXMocGFydGljbGVBbW91bnQsIG9yaWdpbiwgZGlyZWN0aW9uLCBtaW5XaWR0aCB8fCA0LCBtaW5IZWlnaHQgfHwgNCwgbWF4V2lkdGggfHwgOCwgbWF4SGVpZ2h0IHx8IDgsIG1pblNwZWVkIHx8IDAuMDEsIG1heFNwZWVkIHx8IDAuNCwgY29sb3IsIHZhbmlzaFJhdGUgfHwgTS5NYXRoMmQucmFuZG9tRmxvYXQoMC4wMSwgMC4wMykpO1xuXHRcdHRoaXMudmlzaWJsZVBhcnRpY2xlcyA9IHRoaXMucGFydGljbGVzLmxlbmd0aDtcblxuXHR9XG5cdC8qKlxuXHQgKiBDcmVhdGVzIHBhcnRpY2xlcyB0aGF0IHdpbGwgbW92ZSBmcm9tIGEgcG9pbnQgdG8gYW5vdGhlciBpbiBhIGNvbmVcblx0ICogQG1ldGhvZCBjcmVhdGVcblx0ICogQHBhcmFtIHtpbnR9IHggdGhlIHggY2VudGVyIGF0IHdoZXJlIHRvIGNyZWF0ZSB0aGUgcGFydGljbGVzXG5cdCAqIEBwYXJhbSB7aW50fSB5IHRoZSB5IGNlbnRlciBhdCB3aGVyZSB0byBjcmVhdGUgdGhlIHBhcnRpY2xlc1xuXHQgKi9cblx0TGluZWFyUGFydGljbGVFbWl0dGVyLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuXHRcdFxuXHR9O1xuXG5cdExpbmVhclBhcnRpY2xlRW1pdHRlci5wcm90b3R5cGUub25Mb29wID0gZnVuY3Rpb24ocCkge1xuXG5cdFx0aWYgKCB0aGlzLnZpc2libGUgKSB7XG5cblx0XHRcdHZhciBjdXJyZW50UGFydGljbGU7XG5cblx0XHRcdGZvciAoIHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrICkge1xuXG5cdFx0XHRcdGN1cnJlbnRQYXJ0aWNsZSA9IHRoaXMucGFydGljbGVzW2ldO1xuXG5cdFx0XHRcdGN1cnJlbnRQYXJ0aWNsZS5vbkxvb3AocCk7XG5cblx0XHRcdFx0aWYgKCAhIGN1cnJlbnRQYXJ0aWNsZS5pc1Zpc2libGUoKSApIHtcblxuXHRcdFx0XHRcdGlmICggdGhpcy5sb29wICkge1xuXG5cdFx0XHRcdFx0XHRjdXJyZW50UGFydGljbGUuc2V0UGF0aCh0aGlzLm9yaWdpbiwgeyB4OiB0aGlzLm9yaWdpbi54ICsgdGhpcy5kaXJlY3Rpb24ueCAqIDUsIHk6IHRoaXMub3JpZ2luLnkgKyB0aGlzLmRpcmVjdGlvbi55ICogNX0pO1xuXHRcdFx0XHRcdFx0Y3VycmVudFBhcnRpY2xlLnJvdGF0aW9uID0gMDtcblx0XHRcdFx0XHRcdGN1cnJlbnRQYXJ0aWNsZS5hbHBoYSA9IDE7XG5cdFx0XHRcdFx0XHRjdXJyZW50UGFydGljbGUuYW5nbGUgPSAwO1xuXHRcdFx0XHRcdFx0Y3VycmVudFBhcnRpY2xlLnZhbmlzaFJhdGUgPSBNLk1hdGgyZC5yYW5kb21GbG9hdCgwLjA1LCAwLjIpO1xuXHRcdFx0XHRcdFx0Y3VycmVudFBhcnRpY2xlLnNwZWVkID0gTS5NYXRoMmQucmFuZG9tRmxvYXQoMC4wMDUsIDAuNSk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHR0aGlzLnZpc2libGVQYXJ0aWNsZXMtLTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHRoaXMudmlzaWJsZVBhcnRpY2xlcyA8IDEgKSB7XG5cdFx0XHRcdFx0TS5yZW1vdmUodGhpcyk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fTtcblxuXHQvKipcblx0ICogQXBwbGllcyBhIFRpbnQgb24gdGhlIHByb3ZpZGVkIGdhbWUgb2JqZWN0XG5cdCAqIEBjbGFzcyBUaW50XG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAZGVwcmVjYXRlZFxuXHQgKiBAcGFyYW0ge3JlbmRlcmVycy5SZW5kZXJpemFibGV9IG93bmVyIG9iamVjdCB0byBhcHBseSB0aGUgdGludFxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZmlsbFN0eWxlIHRpbnQgY29sb3Jcblx0ICogQHBhcmFtIHtpbnR9IGR1cmF0aW9uIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kc1xuXHQgKi9cblx0ZnVuY3Rpb24gVGludChwcm9wZXJ0aWVzKSB7XG5cblx0XHR0aGlzLm9wZXJhdGlvbiA9IFwic291cmNlLWF0b3BcIjtcblx0XHR0aGlzLnN0YXJ0VGltZSA9IDA7XG5cblx0XHRNLmFwcGx5UHJvcGVydGllcyggdGhpcywgcHJvcGVydGllcywgW1wiZmlsbFN0eWxlXCJdICk7XG5cblx0fVxuXG5cdFRpbnQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCBjb250ZXh0LCB3aWR0aCwgaGVpZ2h0ICkge1xuXG5cdFx0aWYgKCB0aGlzLmlzVmlzaWJsZSgpICkge1xuXG5cdFx0XHRjb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IHRoaXMub3BlcmF0aW9uO1xuXG5cdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFN0eWxlO1xuXG5cdFx0XHRjb250ZXh0LmZpbGxSZWN0KCAwLCAwLCB3aWR0aCwgaGVpZ2h0ICk7XG5cblx0XHR9XG5cblx0fTtcblxuXHRUaW50LnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zdGFydFRpbWUgPSBNLmdldFRpbWVJbk1pbGxpcygpO1xuXHR9O1xuXG5cdFRpbnQucHJvdG90eXBlLmlzVmlzaWJsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnNob3dBbHdheXMgfHwgTS5nZXRUaW1lSW5NaWxsaXMoKSAtIHRoaXMuc3RhcnRUaW1lIDwgdGhpcy5kdXJhdGlvblxuXHR9O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgRmFkZUluIG9iamVjdCB0byBiZSBhcHBsaWVkIHRvIHRoZSBnaXZlbiByZW5kZXJlcnMuUmVuZGVyaXphYmxlLlxuXHQgKiBGYWRlIHRoZSBvYmplY3QgaW4gd2hlbiB0aGUgb25Mb29wIG1ldGhvZCBpcyBjYWxsZWRcblx0ICogQGNsYXNzIEZhZGVJblxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQGV4dGVuZHMgR2FtZU9iamVjdFxuXHQgKiBAcGFyYW0ge3JlbmRlcmVycy5SZW5kZXJpemFibGV9IG9iamVjdCBvYmplY3QgdG8gYXBwbHkgdGhlIHRpbnRcblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgZmFkZSBpbiBkdXJhdGlvbiBpbiBzZWNvbmRzXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtvbkZpbmlzaGVkXSBmdW5jdGlvbiB0byBleGVjdXRlIG9uIGFuaW1hdGlvbiBmaW5pc2hcblx0ICovXG5cdGZ1bmN0aW9uIEZhZGVJbihvYmplY3QsIHNlY29uZHMsIG9uRmluaXNoZWQpIHtcblxuXHRcdGlmICggc2Vjb25kcyA9PSB1bmRlZmluZWQgKSBzZWNvbmRzID0gMTtcblxuXHRcdC8qIFJhdGUgaXMgMSBiZWNhdXNlIHdlIG11c3QgZ28gZnJvbSAwIHRvIDEgaW4gdGhlIGdpdmVuIGFtb3VudCBvZiBzZWNvbmRzICovXG5cdFx0dGhpcy5yYXRlID0gMSAvICggc2Vjb25kcyAqIE0uZ2V0QXZlcmFnZUZwcygpICk7XG5cblx0XHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblx0XHR0aGlzLm9uRmluaXNoZWQgPSBvbkZpbmlzaGVkO1xuXG5cdH1cblxuXHRGYWRlSW4ucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMub2JqZWN0LnNldEFscGhhKDApO1xuXHRcdHRoaXMub25Mb29wID0gdGhpcy5ydW47XG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fTtcblxuXHRGYWRlSW4ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG5ld0FscGhhID0gdGhpcy5vYmplY3QuZ2V0QWxwaGEoKSArIHRoaXMucmF0ZTtcblx0XG5cdFx0aWYgKCBuZXdBbHBoYSA8IDEgKSB7XG5cdFx0XHR0aGlzLm9iamVjdC5zZXRBbHBoYSggbmV3QWxwaGEgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5vYmplY3Quc2V0QWxwaGEoIDEgKTtcblx0XHRcdGlmICggdGhpcy5vbkZpbmlzaGVkICkgdGhpcy5vbkZpbmlzaGVkLmFwcGx5KCB0aGlzLm9iamVjdCApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH07XG5cblx0RmFkZUluLnByb3RvdHlwZS5vbkxvb3AgPSBGYWRlSW4ucHJvdG90eXBlLmluaXRpYWxpemU7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBGYWRlT3V0IG9iamVjdCB0byBiZSBhcHBsaWVkIHRvIHRoZSBnaXZlbiByZW5kZXJlcnMuUmVuZGVyaXphYmxlLlxuXHQgKiBGYWRlIHRoZSBvYmplY3Qgb3V0IHdoZW4gdGhlIG9uTG9vcCBtZXRob2QgaXMgY2FsbGVkXG5cdCAqIEBjbGFzcyBGYWRlT3V0XG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdCAqIEBwYXJhbSB7cmVuZGVyZXJzLlJlbmRlcml6YWJsZX0gb2JqZWN0IG9iamVjdCB0byBhcHBseSB0aGUgdGludFxuXHQgKiBAcGFyYW0ge2ludH0gc2Vjb25kcyBmYWRlIG91dCBkdXJhdGlvbiBpbiBzZWNvbmRzXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtvbkZpbmlzaGVkXSBmdW5jdGlvbiB0byBleGVjdXRlIG9uIGFuaW1hdGlvbiBmaW5pc2hcblx0ICovXG5cdGZ1bmN0aW9uIEZhZGVPdXQob2JqZWN0LCBzZWNvbmRzLCBvbkZpbmlzaGVkKSB7XG5cblx0XHRpZiAoIHNlY29uZHMgPT0gdW5kZWZpbmVkICkgc2Vjb25kcyA9IDE7XG5cblx0XHQvKiBSYXRlIGlzIDEgYmVjYXVzZSB3ZSBtdXN0IGdvIGZyb20gMCB0byAxIGluIHRoZSBnaXZlbiBhbW91bnQgb2Ygc2Vjb25kcyAqL1xuXHRcdHRoaXMucmF0ZSA9IDEgLyAoIHNlY29uZHMgKiBNLmdldEF2ZXJhZ2VGcHMoKSApO1xuXG5cdFx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cdFx0dGhpcy5vbkZpbmlzaGVkID0gb25GaW5pc2hlZDtcblxuXHR9XG5cblx0RmFkZU91dC5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub2JqZWN0LnNldEFscGhhKDEpO1xuXHRcdHRoaXMub25Mb29wID0gdGhpcy5ydW47XG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblx0RmFkZU91dC5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbmV3QWxwaGEgPSB0aGlzLm9iamVjdC5nZXRBbHBoYSgpIC0gdGhpcy5yYXRlO1xuXG5cdFx0aWYgKCBuZXdBbHBoYSA+IDAgKSB7XG5cdFx0XHR0aGlzLm9iamVjdC5zZXRBbHBoYSggbmV3QWxwaGEgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5vYmplY3Quc2V0QWxwaGEoIDAgKTtcblx0XHRcdGlmICggdGhpcy5vbkZpbmlzaGVkICkgdGhpcy5vbkZpbmlzaGVkLmFwcGx5KCB0aGlzLm9iamVjdCApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH07XG5cblx0RmFkZU91dC5wcm90b3R5cGUub25Mb29wID0gRmFkZU91dC5wcm90b3R5cGUuaW5pdGlhbGl6ZTtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIFdhaXQgb2JqZWN0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGdpdmVuIHJlbmRlcmVycy5SZW5kZXJpemFibGUuXG5cdCAqIFdhaXQgaXMgdXNlZCBmb3IgY2hhaW5lZCBlZmZlY3RzXG5cdCAqIEBjbGFzcyBXYWl0XG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdCAqIEBwYXJhbSB7cmVuZGVyZXJzLlJlbmRlcml6YWJsZX0gb2JqZWN0IG9iamVjdCB0byBhcHBseSB0aGUgdGludFxuXHQgKiBAcGFyYW0ge2ludH0gc2Vjb25kcyBmYWRlIG91dCBkdXJhdGlvbiBpbiBzZWNvbmRzXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtvbkZpbmlzaGVkXSBmdW5jdGlvbiB0byBleGVjdXRlIG9uIGFuaW1hdGlvbiBmaW5pc2hcblx0ICovXG5cdGZ1bmN0aW9uIFdhaXQob2JqZWN0LCBzZWNvbmRzLCBvbkZpbmlzaGVkKSB7XG5cblx0XHRpZiAoIHNlY29uZHMgPT0gdW5kZWZpbmVkICkgc2Vjb25kcyA9IDE7XG5cblx0XHR0aGlzLnNlY29uZHMgPSBzZWNvbmRzO1xuXHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXHRcdHRoaXMudGltZXIgPSAwO1xuXHRcdHRoaXMub25GaW5pc2hlZCA9IG9uRmluaXNoZWQ7XG5cblx0fVxuXG5cdFdhaXQucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbihwKSB7XG5cdFx0dGhpcy50aW1lciA9IG5ldyBNLlRpbWVDb3VudGVyKHRoaXMuc2Vjb25kcyAqIDEwMDApO1xuXHRcdHRoaXMub25Mb29wID0gdGhpcy5ydW47XG5cdH07XG5cblx0V2FpdC5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKSB7XG5cblxuXHRcdGlmICggdGhpcy50aW1lci5lbGFwc2VkKCkgKSB7XG5cdFx0XHRpZiAoIHRoaXMub25GaW5pc2hlZCApIHRoaXMub25GaW5pc2hlZC5hcHBseSggdGhpcy5vYmplY3QgKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblxuXHR9O1xuXG5cdFdhaXQucHJvdG90eXBlLm9uTG9vcCA9IFdhaXQucHJvdG90eXBlLmluaXRpYWxpemU7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgQ29udGlub3VzZUZhZGUgb2JqZWN0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGdpdmVuIHJlbmRlcmVycy5SZW5kZXJpemFibGUuXG5cdCAqIENvbnRpbm91c2x5IGZhZGVzIGluIGFuZCBvdXQgdGhlIG9iamVjdFxuXHQgKiBAY2xhc3MgQ29udGlub3VzRmFkZVxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQGV4dGVuZHMgR2FtZU9iamVjdFxuXHQgKiBAcGFyYW0ge3JlbmRlcmVycy5SZW5kZXJpemFibGV9IG9iamVjdCB0aGUgb2JqZWN0IHRvIGFwcGx5IHRoZSBlZmZlY3QgdG9cblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgZmFkZSBpbiBhbmQgb3V0IGR1cmF0aW9uIGluIHNlY29uZHNcblx0ICogQHBhcmFtIHtCb29sZWFufSBmYWRlT3V0IHZhbHVlIHRoYXQgZGV0ZXJtaW5lcyBpZiBlZmZlY3Qgd2lsbCBzdGFydCBhcyBhIGZhZGUgb3V0LiBEZWZhdWx0IHN0YXJ0cyBmYWRpbmcgaW5cblx0ICogQHBhcmFtIHtpbnR9IG1pbiBtaW51bXVtIGFscGhhIHZhbHVlXG5cdCAqIEBwYXJhbSB7aW50fSBtYXggbWF4aW11bSBhbHBoYSB2YWx1ZVxuXHQgKi9cblx0ZnVuY3Rpb24gQ29udGlub3VzRmFkZShvYmplY3QsIHNlY29uZHMsIGZhZGVPdXQsIG1pbiwgbWF4KSB7XG5cdFx0XG5cdFx0aWYgKCBzZWNvbmRzID09IHVuZGVmaW5lZCApIHNlY29uZHMgPSAxO1xuXG5cdFx0LyogUmF0ZSBpcyAxIGJlY2F1c2Ugd2UgbXVzdCBnbyBmcm9tIDAgdG8gMSBpbiB0aGUgZ2l2ZW4gYW1vdW50IG9mIHNlY29uZHMgKi9cblx0XHR0aGlzLnJhdGUgPSAxIC8gKCBzZWNvbmRzICogTS5nZXRBdmVyYWdlRnBzKCkgKTtcblxuXHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXHRcdFxuXHRcdHRoaXMubWluID0gbWluIHx8IDA7XG5cdFx0dGhpcy5tYXggPSBtYXggfHwgMTtcblxuXHRcdG9iamVjdC5zZXRBbHBoYSggMSApO1xuXHRcdFxuXHRcdHRoaXMub25GaW5pc2hlZCA9IHRoaXMuY2hhbmdlRmFkZTtcblx0XHRcblx0XHRpZiAoIGZhZGVPdXQgKSB7XG5cdFx0XHR0aGlzLm9uTG9vcCA9IHRoaXMuZmFkZU91dDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5vbkxvb3AgPSB0aGlzLmZhZGVJbjtcblx0XHR9XG5cdFx0XG5cdH1cblx0XG5cdENvbnRpbm91c0ZhZGUucHJvdG90eXBlLmZhZGVJbiA9IGZ1bmN0aW9uKHApIHtcblxuXHRcdHZhciBuZXdBbHBoYSA9IHRoaXMub2JqZWN0Ll9hbHBoYSArIHRoaXMucmF0ZTtcblx0XG5cdFx0aWYgKCBuZXdBbHBoYSA8IHRoaXMubWF4ICkge1xuXHRcdFx0dGhpcy5vYmplY3Quc2V0QWxwaGEoIG5ld0FscGhhICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMub2JqZWN0LnNldEFscGhhKCB0aGlzLm1heCApO1xuXHRcdFx0dGhpcy5vbkxvb3AgPSB0aGlzLmZhZGVPdXQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fTtcblx0XG5cdENvbnRpbm91c0ZhZGUucHJvdG90eXBlLmZhZGVPdXQgPSBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgbmV3QWxwaGEgPSB0aGlzLm9iamVjdC5fYWxwaGEgLSB0aGlzLnJhdGU7XG5cblx0XHRpZiAoIG5ld0FscGhhID4gdGhpcy5taW4gKSB7XG5cdFx0XHR0aGlzLm9iamVjdC5zZXRBbHBoYSggbmV3QWxwaGEgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5vYmplY3Quc2V0QWxwaGEoIHRoaXMubWluICk7XG5cdFx0XHR0aGlzLm9uTG9vcCA9IHRoaXMuZmFkZUluO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHRcdFxuXHR9O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIE1vdmUgb2JqZWN0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGdpdmVuIHJlbmRlcmVycy5SZW5kZXJpemFibGUuXG5cdCAqIE1vdmVzIHRoZSBvYmplY3QgY2xvc2VyIHRvIHRoZSBkZXN0aW5hdGlvbiB3aGVuIHRoZSBvbkxvb3AgbWV0aG9kIGlzIGNhbGxlZFxuXHQgKlxuXHQgKiBAY2xhc3MgRmFkZU91dFxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQGV4dGVuZHMgR2FtZU9iamVjdFxuXHQgKiBAcGFyYW0ge3JlbmRlcmVycy5SZW5kZXJpemFibGV9IG9iamVjdCB0aGUgb2JqZWN0IHRvIGFwcGx5IHRoZSBlZmZlY3QgdG9cblx0ICogQHBhcmFtIHtpbnR9IHggZGVzdGluYXRpb24geFxuXHQgKiBAcGFyYW0ge2ludH0geSBkZXN0aW5hdGlvbiB5XG5cdCAqIEBwYXJhbSB7aW50fSBzZWNvbmRzIGR1cmF0aW9uIG9mIHRoZSBhbmltYXRpb24gaW4gc2Vjb25kc1xuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZpbmlzaGVkIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgb25jZSB0aGUgYW5pbWF0aW9uIGlzIGZpbmlzaGVkXG5cdCAqL1xuXHRmdW5jdGlvbiBNb3ZlKCBvYmplY3QsIHgsIHksIHNlY29uZHMsIG9uRmluaXNoZWQgKSB7XG5cblx0XHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblx0XHR0aGlzLl94ID0geDtcblx0XHR0aGlzLl95ID0geTtcblxuXHRcdGlmICggc2Vjb25kcyA9PSB1bmRlZmluZWQgKSBzZWNvbmRzID0gMTtcblx0XHRcblx0XHR0aGlzLm9uRmluaXNoZWQgPSBvbkZpbmlzaGVkO1xuXG5cdFx0dmFyIGxpYiA9IE0uTWF0aDJkLFxuXHRcdFx0ZnJhbWVzID0gc2Vjb25kcyAqIE0uZ2V0QXZlcmFnZUZwcygpLFxuXHRcdFx0Y29vcnNGcm9tID0gbmV3IGxpYi5WZWN0b3IyZChvYmplY3QuX3gsIG9iamVjdC5feSksXG5cdFx0XHRjb29yZHNUbyA9IG5ldyBsaWIuVmVjdG9yMmQoeCwgeSk7XG5cblx0XHR0aGlzLnNwZWVkID0gbGliLmdldERpc3RhbmNlKCBjb29yc0Zyb20sIGNvb3Jkc1RvICkgLyBmcmFtZXM7XG5cdFx0dGhpcy5kaXJlY3Rpb24gPSBNLk1hdGgyZC5nZXROb3JtYWxpemVkKCBNLk1hdGgyZC5nZXRWZWN0b3IyZCggY29vcnNGcm9tLCBjb29yZHNUbyApICk7XG5cblx0fVxuXG5cdE1vdmUucHJvdG90eXBlLm9uTG9vcCA9IGZ1bmN0aW9uKHApIHtcblxuXHRcdHZhciBtb3ZlWCA9IE1hdGguYWJzKCB0aGlzLl94IC0gdGhpcy5vYmplY3QuX3ggKSA+IHRoaXMuc3BlZWQsXG5cdFx0XHRtb3ZlWSA9IE1hdGguYWJzKCB0aGlzLl95IC0gdGhpcy5vYmplY3QuX3kgKSA+IHRoaXMuc3BlZWQ7XG5cdFx0XHRcblx0XHRpZiAoIG1vdmVYICkgdGhpcy5vYmplY3Qub2Zmc2V0WCh0aGlzLmRpcmVjdGlvbi54ICogdGhpcy5zcGVlZCk7XG5cdFx0aWYgKCBtb3ZlWSApIHRoaXMub2JqZWN0Lm9mZnNldFkodGhpcy5kaXJlY3Rpb24ueSAqIHRoaXMuc3BlZWQpO1xuXG5cdFx0aWYgKCAhIG1vdmVYICYmICEgbW92ZVkgKSB7XG5cdFx0XHR0aGlzLm9iamVjdC5zZXRMb2NhdGlvbih0aGlzLl94LCB0aGlzLl95KTtcblx0XHRcdGlmICggdGhpcy5vbkZpbmlzaGVkICkgdGhpcy5vbkZpbmlzaGVkLmFwcGx5KCB0aGlzLm9iamVjdCApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH07XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBTY2FsZVVwIG9iamVjdCB0byBiZSBhcHBsaWVkIHRvIHRoZSBnaXZlbiByZW5kZXJlcnMuUmVuZGVyaXphYmxlLlxuXHQgKiBTY2FsZXMgdGhlIG9iamVjdCB1cCB3aGVuIHRoZSBvbkxvb3AgbWV0aG9kIGlzIGNhbGxlZFxuXHQgKlxuXHQgKiBAY2xhc3MgU2NhbGVVcFxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQGV4dGVuZHMgR2FtZU9iamVjdFxuXHQgKiBAcGFyYW0ge3JlbmRlcmVycy5SZW5kZXJpemFibGV9IG9iamVjdCB0aGUgb2JqZWN0IHRvIGFwcGx5IHRoZSBlZmZlY3QgdG9cblx0ICogQHBhcmFtIHtpbnR9IHggZGVzdGluYXRpb24geFxuXHQgKiBAcGFyYW0ge2ludH0geSBkZXN0aW5hdGlvbiB5XG5cdCAqIEBwYXJhbSB7aW50fSBzZWNvbmRzIGR1cmF0aW9uIG9mIHRoZSBlZmZlY3Rcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gb25GaW5pc2hlZCBmdW5jdGlvbiB0byBleGVjdXRlIG9uY2UgdGhlIGFuaW1hdGlvbiBpcyBmaW5pc2hlZFxuXHQgKi9cblx0ZnVuY3Rpb24gU2NhbGVVcCggb2JqZWN0LCB4LCB5LCBzZWNvbmRzLCBvbkZpbmlzaGVkICkge1xuXG5cdFx0dmFyIGZyYW1lcyA9IHNlY29uZHMgKiBNLmdldEF2ZXJhZ2VGcHMoKTtcblxuXHRcdGlmICggISBvYmplY3QuX3NjYWxlICkge1xuXHRcdFx0b2JqZWN0Ll9zY2FsZSA9IHsgeDogMSwgeTogMSB9O1xuXHRcdH1cblxuXHRcdHRoaXMuc3BlZWRYID0gTWF0aC5hYnMoIG9iamVjdC5fc2NhbGUueCAtIHggKSAvIGZyYW1lcztcblx0XHR0aGlzLnNwZWVkWSA9IE1hdGguYWJzKCBvYmplY3QuX3NjYWxlLnkgLSB5ICkgLyBmcmFtZXM7XG5cdFx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cdFx0dGhpcy5feCA9IHg7XG5cdFx0dGhpcy5feSA9IHk7XG5cdFx0dGhpcy5vbkZpbmlzaGVkID0gb25GaW5pc2hlZDtcblxuXHR9XG5cblx0U2NhbGVVcC5wcm90b3R5cGUub25Mb29wID0gZnVuY3Rpb24ocCkge1xuXG5cdFx0aWYgKCB0aGlzLm9iamVjdC5fc2NhbGUueCA8IHRoaXMuX3ggKSB7XG5cdFx0XHR0aGlzLm9iamVjdC5fc2NhbGUueCArPSB0aGlzLnNwZWVkWDtcblx0XHRcdC8vIHRoaXMubm90aWZ5Q2hhbmdlKCk7XG5cdFx0fVxuXHRcdGlmICggdGhpcy5vYmplY3QuX3NjYWxlLnkgPCB0aGlzLl95ICkge1xuXHRcdFx0dGhpcy5vYmplY3QuX3NjYWxlLnkgKz0gdGhpcy5zcGVlZFk7XG5cdFx0XHQvLyB0aGlzLm5vdGlmeUNoYW5nZSgpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vYmplY3QuX3NjYWxlLnggPj0gdGhpcy5feCAmJiB0aGlzLm9iamVjdC5fc2NhbGUueSA+PSB0aGlzLl95ICkge1xuXHRcdFx0aWYgKCB0aGlzLm9uRmluaXNoZWQgKSB0aGlzLm9uRmluaXNoZWQuYXBwbHkoIHRoaXMub2JqZWN0ICk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fTtcblx0XG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgU2NhbGVEb3duIG9iamVjdCB0byBiZSBhcHBsaWVkIHRvIHRoZSBnaXZlbiByZW5kZXJlcnMuUmVuZGVyaXphYmxlLlxuXHQgKiBTY2FsZXMgdGhlIG9iamVjdCBkb3duIHdoZW4gdGhlIG9uTG9vcCBtZXRob2QgaXMgY2FsbGVkXG5cdCAqXG5cdCAqIEBjbGFzcyBTY2FsZURvd25cblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7cmVuZGVyZXJzLlJlbmRlcml6YWJsZX0gb2JqZWN0IHRoZSBvYmplY3QgdG8gYXBwbHkgdGhlIGVmZmVjdCB0b1xuXHQgKiBAcGFyYW0ge2ludH0geCBkZXN0aW5hdGlvbiB4XG5cdCAqIEBwYXJhbSB7aW50fSB5IGRlc3RpbmF0aW9uIHlcblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgZHVyYXRpb24gb2YgdGhlIGVmZmVjdFxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZpbmlzaGVkIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgb25jZSB0aGUgYW5pbWF0aW9uIGlzIGZpbmlzaGVkXG5cdCAqL1xuXHRmdW5jdGlvbiBTY2FsZURvd24oIG9iamVjdCwgeCwgeSwgc2Vjb25kcywgb25GaW5pc2hlZCApIHtcblxuXHRcdHZhciBmcmFtZXMgPSBzZWNvbmRzICogTS5nZXRBdmVyYWdlRnBzKCk7XG5cblx0XHRpZiAoICEgb2JqZWN0Ll9zY2FsZSApIHtcblx0XHRcdG9iamVjdC5fc2NhbGUgPSB7IHg6IDEsIHk6IDEgfTtcblx0XHR9XG5cblx0XHR0aGlzLnNwZWVkWCA9IE1hdGguYWJzKCBvYmplY3QuX3NjYWxlLnggLSB4ICkgLyBmcmFtZXM7XG5cdFx0dGhpcy5zcGVlZFkgPSBNYXRoLmFicyggb2JqZWN0Ll9zY2FsZS55IC0geSApIC8gZnJhbWVzO1xuXHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXHRcdHRoaXMuX3ggPSB4O1xuXHRcdHRoaXMuX3kgPSB5O1xuXHRcdHRoaXMub25GaW5pc2hlZCA9IG9uRmluaXNoZWQ7XG5cblx0fVxuXG5cdFNjYWxlRG93bi5wcm90b3R5cGUub25Mb29wID0gZnVuY3Rpb24ocCkge1xuXG5cdFx0aWYgKCB0aGlzLm9iamVjdC5fc2NhbGUueCA+IHRoaXMuX3ggKSB7XG5cdFx0XHR0aGlzLm9iamVjdC5fc2NhbGUueCAtPSB0aGlzLnNwZWVkWDtcblx0XHR9XG5cdFx0aWYgKCB0aGlzLm9iamVjdC5fc2NhbGUueSA+IHRoaXMuX3kgKSB7XG5cdFx0XHR0aGlzLm9iamVjdC5fc2NhbGUueSAtPSB0aGlzLnNwZWVkWTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub2JqZWN0Ll9zY2FsZS54IDw9IHRoaXMuX3ggJiYgdGhpcy5vYmplY3QuX3NjYWxlLnkgPD0gdGhpcy5feSApIHtcblx0XHRcdGlmICggdGhpcy5vbkZpbmlzaGVkICkgdGhpcy5vbkZpbmlzaGVkLmFwcGx5KCB0aGlzLm9iamVjdCApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH07XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBUd2lua2xlIG9iamVjdCB0byBiZSBhcHBsaWVkIHRvIHRoZSBnaXZlbiByZW5kZXJlcnMuUmVuZGVyaXphYmxlLlxuXHQgKiBUd2lua2xlcyB0aGUgb2JqZWN0IHdoZW4gdGhlIG9uTG9vcCBtZXRob2QgaXMgY2FsbGVkXG5cdCAqXG5cdCAqIEBjbGFzcyBUd2lua2xlXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge3JlbmRlcmVycy5SZW5kZXJpemFibGV9IG9iamVjdCB0aGUgb2JqZWN0IHRvIGFwcGx5IHRoZSBlZmZlY3QgdG9cblx0ICogQHBhcmFtIHtpbnR9IHRpbWVzIHRpbWVzIHRvIHR3aW5rbGVcblx0ICogQHBhcmFtIHtpbnR9IGR1cmF0aW9uIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBvZiB0aGUgZWZmZWN0XG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9uRmluaXNoZWQgZnVuY3Rpb24gdG8gZXhlY3V0ZSBvbmNlIHRoZSBhbmltYXRpb24gaXMgZmluaXNoZWRcblx0ICovXG5cdGZ1bmN0aW9uIFR3aW5rbGUob2JqZWN0LCB0aW1lcywgZHVyYXRpb24sIG9uRmluaXNoZWQpIHtcblx0XHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblx0XHRpZiAoIHRpbWVzID09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMudGltZXMgPSA2O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnRpbWVzID0gdGltZXMgKiAyO1xuXHRcdH1cblx0XHRpZiAoIGR1cmF0aW9uID09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuZHVyYXRpb24gPSAyNTA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcblx0XHR9XG5cdFx0dGhpcy5sYXN0VGltZSA9IDA7XG5cdFx0dGhpcy5vbkZpbmlzaGVkID0gb25GaW5pc2hlZDtcblx0fVxuXG5cdFR3aW5rbGUucHJvdG90eXBlLm9uTG9vcCA9IGZ1bmN0aW9uKHApIHtcblxuXHRcdGlmICggTS5nZXRUaW1lSW5NaWxsaXMoKSAtIHRoaXMubGFzdFRpbWUgPj0gdGhpcy5kdXJhdGlvbiApIHtcblxuXHRcdFx0aWYgKCB0aGlzLnRpbWVzLS0gKSB7XG5cblx0XHRcdFx0aWYgKCB0aGlzLm9iamVjdC5fYWxwaGEgPT0gMSApIHtcblx0XHRcdFx0XHR0aGlzLm9iamVjdC5zZXRBbHBoYSggMCApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMub2JqZWN0LnNldEFscGhhKCAxICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHR0aGlzLm9iamVjdC5zZXRBbHBoYSggdW5kZWZpbmVkICk7XG5cblx0XHRcdFx0aWYgKCB0aGlzLm9uRmluaXNoZWQgKSB0aGlzLm9uRmluaXNoZWQuYXBwbHkoIHRoaXMub2JqZWN0ICk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmxhc3RUaW1lID0gTS5nZXRUaW1lSW5NaWxsaXMoKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH07XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBSb3RhdGUgb2JqZWN0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGdpdmVuIHJlbmRlcmVycy5SZW5kZXJpemFibGUuXG5cdCAqIFJvdGF0ZXMgdGhlIG9iamVjdCB3aGVuIHRoZSBvbkxvb3AgbWV0aG9kIGlzIGNhbGxlZFxuXHQgKlxuXHQgKiBAY2xhc3MgUm90YXRlXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdCAqIEBwYXJhbSB7cmVuZGVyZXJzLlJlbmRlcml6YWJsZX0gb2JqZWN0IHRoZSBvYmplY3QgdG8gYXBwbHkgdGhlIGVmZmVjdCB0b1xuXHQgKiBAcGFyYW0ge2Zsb2F0fSBhbmdsZSBhbmdsZSB0byByb3RhdGUgdGhlIG9iamVjdCB0b1xuXHQgKiBAcGFyYW0ge2ludH0gc2Vjb25kcyBkdXJhdGlvbiBpbiBzZWNvbmRzIG9mIHRoZSBlZmZlY3Rcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gb25GaW5pc2hlZCBmdW5jdGlvbiB0byBleGVjdXRlIG9uY2UgdGhlIGFuaW1hdGlvbiBpcyBmaW5pc2hlZFxuXHQgKi9cblx0ZnVuY3Rpb24gUm90YXRlKCBvYmplY3QsIGFuZ2xlLCBzZWNvbmRzLCBvbkZpbmlzaGVkICkge1xuXG5cdFx0aWYgKCAhIHNlY29uZHMgKSBzZWNvbmRzID0gMTtcblx0XG5cdFx0dGhpcy5mcmFtZXMgPSBzZWNvbmRzICogTS5nZXRBdmVyYWdlRnBzKCk7XG5cblx0XHRpZiAoICEgb2JqZWN0Ll9yb3RhdGlvbiApIHtcblx0XHRcdG9iamVjdC5fcm90YXRpb24gPSAwO1xuXHRcdH1cblxuXHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXHRcdHRoaXMuYW5nbGUgPSBhbmdsZTtcblx0XHR0aGlzLm9uRmluaXNoZWQgPSBvbkZpbmlzaGVkO1xuXG5cdFx0dGhpcy5fcm90YXRpb24gPSAoIHRoaXMuYW5nbGUgLSBvYmplY3QuX3JvdGF0aW9uICkgLyB0aGlzLmZyYW1lcztcblxuXHR9XG5cblx0Um90YXRlLnByb3RvdHlwZS5vbkxvb3AgPSBmdW5jdGlvbihwKSB7XG5cblx0XHRpZiAoIHRoaXMuZnJhbWVzLS0gKSB7XG5cdFx0XHR0aGlzLm9iamVjdC5vZmZzZXRSb3RhdGlvbih0aGlzLl9yb3RhdGlvbik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggdGhpcy5vbkZpbmlzaGVkICkgdGhpcy5vbkZpbmlzaGVkLmFwcGx5KCB0aGlzLm9iamVjdCApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH07XG5cblx0LyoqXG5cdCAqIEZhZGVzIGFuIG9iamVjdCBpblxuXHQgKlxuXHQgKiBVc2FnZSBleGFtcGxlOlxuXHQgKlxuXHQgKiBmYWRlSW4oIG9iamVjdCwgc2Vjb25kcywgb25GaW5pc2hlZCApO1xuXHQgKlxuXHQgKi9cblx0ZnVuY3Rpb24gZmFkZUluKCBvYmplY3QsIHNlY29uZHMsIG9uRmluaXNoZWQgKSB7XG5cdFx0cmV0dXJuIG5ldyBBbmltYXRpb24oIG5ldyBGYWRlSW4oIG9iamVjdCwgc2Vjb25kcywgb25GaW5pc2hlZCApICkucGxheSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZhZGVzIGFuIG9iamVjdCBvdXRcblx0ICpcblx0ICogVXNhZ2UgZXhhbXBsZTpcblx0ICpcblx0ICogZmFkZU91dCggb2JqZWN0LCBzZWNvbmRzLCBvbkZpbmlzaGVkICk7XG5cdCAqXG5cdCAqL1xuXHRmdW5jdGlvbiBmYWRlT3V0KCBvYmplY3QsIHNlY29uZHMsIG9uRmluaXNoZWQgKSB7XG5cdFx0cmV0dXJuIG5ldyBBbmltYXRpb24oIG5ldyBGYWRlT3V0KCBvYmplY3QsIHNlY29uZHMsIG9uRmluaXNoZWQgKSApLnBsYXkoKTtcblx0fVxuXG5cdFxuXHQvKipcblx0ICogRmFkZXMgYW4gb2JqZWN0IG91dFxuXHQgKlxuXHQgKiBVc2FnZSBleGFtcGxlOlxuXHQgKlxuXHQgKiBmYWRlT3V0KCBvYmplY3QsIHNlY29uZHMsIG9uRmluaXNoZWQgKTtcblx0ICpcblx0ICovXG5cdGZ1bmN0aW9uIGNvbnRpbm91c0ZhZGUoIG9iamVjdCwgc2Vjb25kcywgZmFkZU91dEZpcnN0ICkge1xuXHRcdHJldHVybiBuZXcgQW5pbWF0aW9uKCBuZXcgQ29udGlub3VzRmFkZSggb2JqZWN0LCBzZWNvbmRzLCBmYWRlT3V0Rmlyc3QgKSApLnBsYXkoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3ZlcyBhbiBvYmplY3QgZnJvbSBhIHBvc2l0aW9uIHRvIHRoZSBvdGhlciBpbiBhIGNlcnRhaW4gYW1vdXQgb2YgdGltZVxuXHQgKlxuXHQgKiBVc2FnZSBleGFtcGxlOlxuXHQgKlxuXHQgKiBtb3ZlKCBvYmplY3QsIHgsIHksIHNlY29uZHMsIGFjY2VsZXJhdGlvbiwgZGVjY2VsZXJhdGlvbiwgb25GaW5pc2hlZCApO1xuXHQgKlxuXHQgKi9cblx0ZnVuY3Rpb24gbW92ZSggb2JqZWN0LCB4LCB5LCBzZWNvbmRzLCBvbkZpbmlzaGVkICkge1xuXHRcdHJldHVybiBuZXcgQW5pbWF0aW9uKCBuZXcgTW92ZSggb2JqZWN0LCB4LCB5LCBzZWNvbmRzLCBvbkZpbmlzaGVkICkgKS5wbGF5KCk7XG5cdH1cblxuXHQvKipcblx0ICogU2NhbGVzIGFuIG9iamVjdCBmcm9tIGl0cyBjdXJyZW50IHNjYWxlIHZhbHVlIHRvIHRoZSBvbmUgcHJvdmlkZWQuXG5cdCAqXG5cdCAqIFVzYWdlIGV4YW1wbGU6XG5cdCAqXG5cdCAqIHNjYWxlVXAoIG9iamVjdCwgeCwgeSwgc2Vjb25kcywgb25GaW5pc2hlZCApO1xuXHQgKlxuXHQgKi9cblx0ZnVuY3Rpb24gc2NhbGVVcCggb2JqZWN0LCB4LCB5LCBzZWNvbmRzLCBvbkZpbmlzaGVkICkge1xuXHRcdHJldHVybiBuZXcgQW5pbWF0aW9uKCBuZXcgU2NhbGVVcCggb2JqZWN0LCB4LCB5LCBzZWNvbmRzLCBvbkZpbmlzaGVkICkgKS5wbGF5KCk7XG5cdH1cblxuXHQvKipcblx0ICogU2NhbGVzIGFuIG9iamVjdCBmcm9tIGl0cyBjdXJyZW50IHNjYWxlIHZhbHVlIHRvIHRoZSBvbmUgcHJvdmlkZWQuXG5cdCAqXG5cdCAqIFVzYWdlIGV4YW1wbGU6XG5cdCAqXG5cdCAqIHNjYWxlRG93biggb2JqZWN0LCB4LCB5LCBzZWNvbmRzLCBvbkZpbmlzaGVkICk7XG5cdCAqXG5cdCAqL1xuXHRmdW5jdGlvbiBzY2FsZURvd24oIG9iamVjdCwgeCwgeSwgc2Vjb25kcywgb25GaW5pc2hlZCApIHtcblx0XHRyZXR1cm4gbmV3IEFuaW1hdGlvbiggbmV3IFNjYWxlRG93biggb2JqZWN0LCB4LCB5LCBzZWNvbmRzLCBvbkZpbmlzaGVkICkgKS5wbGF5KCk7XG5cdH1cblxuXHQvKipcblx0ICogTWFrZXMgYW4gb2JqZWN0IHR3aW5rbGUgYW4gYW1vdW50IG9mIHRpbWVzIGR1cmluZyBjZXJ0YWluIHRpbWVcblx0ICpcblx0ICogVXNhZ2UgZXhhbXBsZTpcblx0ICpcblx0ICogdHdpbmtsZSggb2JqZWN0VG9BcHBseSwgdGltZXNUb1R3aW5rbGUsIGR1cmF0aW9uSW5NaWxsaXNlY29uZHMsIG9uRmluaXNoZWQgKTtcblx0ICpcblx0ICovXG5cdGZ1bmN0aW9uIHR3aW5rbGUoIG9iamVjdCwgdGltZXMsIGR1cmF0aW9uLCBvbkZpbmlzaGVkICkge1xuXHRcdHJldHVybiBuZXcgQW5pbWF0aW9uKCBuZXcgVHdpbmtsZSggb2JqZWN0LCB0aW1lcywgZHVyYXRpb24sIG9uRmluaXNoZWQgKSApLnBsYXkoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSb3RhdGVzIGFuIG9iamVjdCB0byB0aGUgc3BlY2lmaWVkIGFuZ2xlIGluIHNlY29uZHNcblx0ICpcblx0ICogVXNhZ2UgZXhhbXBsZTpcblx0ICpcblx0ICogcm90YXRlKCBvYmplY3RUb0FwcGx5LCBhbmdsZSwgc2Vjb25kcywgb25GaW5pc2hlZCApO1xuXHQgKlxuXHQgKi9cblx0ZnVuY3Rpb24gcm90YXRlKCBvYmplY3QsIGFuZ2xlLCBzZWNvbmRzLCBvbkZpbmlzaGVkICkge1xuXHRcdHJldHVybiBuZXcgQW5pbWF0aW9uKCBuZXcgUm90YXRlKCBvYmplY3QsIGFuZ2xlLCBzZWNvbmRzLCBvbkZpbmlzaGVkICkgKS5wbGF5KCk7XG5cdH1cblxuXHQvKipcblx0ICogQGRlcHJlY2F0ZWRcblx0ICogU2hha2VzIHRoZSBjYW52YXMgZm9yIHRoZSBzcGVjaWZpZWQgZHVyYXRpb24gb2Ygc2Vjb25kc1xuXHQgKi9cblx0ZnVuY3Rpb24gc2hha2VDYW52YXMoIGR1cmF0aW9uICkge1xuXG5cdFx0aWYgKCAhIE0uY2FudmFzLnNoYWtpbmcgKSB7XG5cblx0XHRcdE0uY2FudmFzLnNoYWtpbmcgPSB0cnVlO1xuXHRcdFx0TS5jYW52YXMuc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XG5cblx0XHRcdE0ucHVzaCh7XG5cdFx0XHRcblx0XHRcdFx0c3RhcnRUaW1lOiBNLmdldEdhbWVUaW1lKCksXG5cblx0XHRcdFx0ZHVyYXRpb246IGR1cmF0aW9uIHx8IDEsXG5cblx0XHRcdFx0b25Mb29wOiBmdW5jdGlvbihwKSB7XG5cdFx0XHRcdFx0aWYgKCBNLmdldEdhbWVUaW1lKCkgLSB0aGlzLnN0YXJ0VGltZSA8IHRoaXMuZHVyYXRpb24gKSB7XG5cdFx0XHRcdFx0XHRwLmNhbnZhcy5zdHlsZS5sZWZ0ID0gcC5NLnJhbmRvbVNpZ24oKSArIFwicHhcIjtcblx0XHRcdFx0XHRcdHAuY2FudmFzLnN0eWxlLnRvcCA9IHAuTS5yYW5kb21TaWduKCkgKyBcInB4XCI7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHAuY2FudmFzLnN0eWxlLmxlZnQgPSBcIjBweFwiO1xuXHRcdFx0XHRcdFx0cC5jYW52YXMuc3R5bGUudG9wID0gXCIwcHhcIjtcblx0XHRcdFx0XHRcdHAuTS5yZW1vdmUoIHRoaXMgKTtcblx0XHRcdFx0XHRcdHAuY2FudmFzLnNoYWtpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fSwgXCJzaGFrZVwiKTtcblxuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIEBjbGFzcyB2aXN1YWxcblx0ICovXG5cdG5hbWVzcGFjZS52aXN1YWwgPSB7XG5cblx0XHRQYXJ0aWNsZTogUGFydGljbGUsXG5cdFx0TGluZWFyUGFydGljbGVFbWl0dGVyOiBMaW5lYXJQYXJ0aWNsZUVtaXR0ZXIsXG5cdFx0UmFkaWFsUGFydGljbGVFbWl0dGVyOiBSYWRpYWxQYXJ0aWNsZUVtaXR0ZXIsXG5cblx0XHRUaW50OiBUaW50LFxuXG5cdFx0TW92ZTogTW92ZSxcblx0XHRGYWRlSW46IEZhZGVJbixcblx0XHRGYWRlT3V0OiBGYWRlT3V0LFxuXHRcdENvbnRpbm91c0ZhZGU6IENvbnRpbm91c0ZhZGUsXG5cdFx0U2NhbGVVcDogU2NhbGVVcCxcblx0XHRTY2FsZURvd246IFNjYWxlRG93bixcblx0XHRSb3RhdGU6IFJvdGF0ZSxcblx0XHRUd2lua2xlOiBUd2lua2xlLFxuXHRcdFdhaXQ6IFdhaXRcblxuXHR9O1xuXG59KSggTS5lZmZlY3RzIHx8ICggTS5lZmZlY3RzID0ge30gKSwgTSApOyIsIi8qKlxuICogQG1vZHVsZSBNYXRjaFxuICovXG4oZnVuY3Rpb24obmFtZXNwYWNlLCBNKSB7XG5cblx0LyoqXG5cdCAqIEBjbGFzcyBFYXNpbmdcblx0ICogQG5hbWVzcGFjZSB2aXN1YWxcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7cmVuZGVyZXJzLlJlbmRlcml6YWJsZX0gb2JqZWN0IHRoZSBvYmplY3QgdG8gYXBwbHkgdGhlIGVmZmVjdCB0b1xuXHQgKiBAcGFyYW0ge2ludH0geCBkZXN0aW5hdGlvbiB4XG5cdCAqIEBwYXJhbSB7aW50fSB5IGRlc3RpbmF0aW9uIHlcblx0ICogQHBhcmFtIHtpbnR9IGR1cmF0aW9uU2Vjb25kcyBkdXJhdGlvbiBvZiB0aGUgYW5pbWF0aW9uIGluIHNlY29uZHNcblx0ICogQHBhcmFtIHtTdHJpbmd9IGVhc2luZ01ldGhvZFggZWFzaW5nIGZ1bmN0aW9uIHRvIGFwcGx5IHRvIHRoZSB4IGF4aXNcblx0ICogQHBhcmFtIHtTdHJpbmd9IGVhc2luZ01ldGhvZFkgZWFzaW5nIGZ1bmN0aW9uIHRvIGFwcGx5IHRvIHRoZSB5IGF4aXNcblx0ICogTm90ZTogZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gZWFzaW5nIHBsZWFzZSBnbyB0byBodHRwOi8vd3d3Lmdpem1hLmNvbS9lYXNpbmcvI3NpbjNcblx0ICovXG5cdGZ1bmN0aW9uIEVhc2luZyhvYmplY3QsIGVuZFZhbHVlWCwgZW5kVmFsdWVZLCBkdXJhdGlvblNlY29uZHMsIGVhc2luZ01ldGhvZFgsIGVhc2luZ01ldGhvZFksIGxvb3AsIG9uRmluaXNoZWQpIHtcblxuXHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXG5cdFx0dGhpcy5lbmRWYWx1ZVggPSBlbmRWYWx1ZVg7XG5cdFx0dGhpcy5lbmRWYWx1ZVkgPSBlbmRWYWx1ZVk7XG5cdFx0XG5cdFx0dGhpcy5zdGFydFZhbHVlWCA9IDA7XG5cdFx0dGhpcy5zdGFydFZhbHVlWSA9IDA7XG5cblx0XHR0aGlzLmVhc2luZ01ldGhvZFggPSB0aGlzW2Vhc2luZ01ldGhvZFhdIHx8IHRoaXNbXCJsaW5lYXJUd2VlblwiXTtcblx0XHR0aGlzLmVhc2luZ01ldGhvZFkgPSB0aGlzW2Vhc2luZ01ldGhvZFldIHx8IHRoaXMuZWFzaW5nTWV0aG9kWDtcblx0XG5cdFx0dGhpcy5jdXJyZW50RnJhbWUgPSAxO1xuXG5cdFx0dGhpcy5kdXJhdGlvblNlY29uZHMgPSBkdXJhdGlvblNlY29uZHM7XG5cblx0XHR0aGlzLm1hdGhDYWNoZWQgPSBNYXRoO1xuXG5cdFx0dGhpcy50b3RhbEZyYW1lcyA9IDA7XG5cdFx0XG5cdFx0dGhpcy5sb29wID0gbG9vcDtcblx0XHRcblx0XHR0aGlzLl9uZWVkc1N0YXJ0VmFsdWUgPSB0cnVlO1xuXHRcdFxuXHRcdHRoaXMub25GaW5pc2hlZCA9IG9uRmluaXNoZWQ7XG5cblx0fVxuXG5cdEVhc2luZy5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBkdXJhdGlvblNlY29uZHMgPSB0aGlzLmR1cmF0aW9uU2Vjb25kcztcblxuXHRcdGlmICggdHlwZW9mIGR1cmF0aW9uU2Vjb25kcyA9PSBcInN0cmluZ1wiICYmIGR1cmF0aW9uU2Vjb25kcy5pbmRleE9mKFwicHhcIikgIT0gLTEgKSB7XG5cdFx0XHRcblx0XHRcdGR1cmF0aW9uU2Vjb25kcyA9IHBhcnNlSW50KGR1cmF0aW9uU2Vjb25kcyk7XG5cdFx0XHRcblx0XHRcdHZhciB4RGlzdGFuY2VUb0NvdmVyID0gdGhpcy5lbmRWYWx1ZVggLSB0aGlzLm9iamVjdC5nZXRYKCk7XG5cdFx0XHR2YXIgeURpc3RhbmNlVG9Db3ZlciA9IHRoaXMuZW5kVmFsdWVZIC0gdGhpcy5vYmplY3QuZ2V0WSgpO1xuXG5cdFx0XHR2YXIgcGl4ZWxzUGVyU2Vjb25kID0gZHVyYXRpb25TZWNvbmRzO1xuXG5cdFx0XHR2YXIgdGltZVRvQ292ZXJYID0geERpc3RhbmNlVG9Db3ZlciAvIHBpeGVsc1BlclNlY29uZDtcblx0XHRcdHZhciB0aW1lVG9Db3ZlclkgPSB5RGlzdGFuY2VUb0NvdmVyIC8gcGl4ZWxzUGVyU2Vjb25kO1xuXG5cdFx0XHRkdXJhdGlvblNlY29uZHMgPSBNYXRoLm1heCh0aW1lVG9Db3ZlclgsIHRpbWVUb0NvdmVyWSk7XG5cblx0XHR9XG5cblx0XHR0aGlzLnRvdGFsRnJhbWVzID0gZHVyYXRpb25TZWNvbmRzICogTS5nZXRBdmVyYWdlRnBzKCk7XG5cblx0XHR0aGlzLmN1cnJlbnRGcmFtZSA9IDA7XG5cdFx0XG5cdFx0aWYgKCB0aGlzLl9uZWVkc1N0YXJ0VmFsdWUgfHwgIXRoaXMubG9vcCApIHtcblxuXHRcdFx0dGhpcy5zdGFydFZhbHVlWCA9IHRoaXMub2JqZWN0LmdldFgoKTtcblx0XHRcdHRoaXMuc3RhcnRWYWx1ZVkgPSB0aGlzLm9iamVjdC5nZXRZKCk7XG5cdFx0XHRcblx0XHRcdHRoaXMuZW5kVmFsdWVYID0gdGhpcy5lbmRWYWx1ZVggLSB0aGlzLnN0YXJ0VmFsdWVYO1xuXHRcdFx0dGhpcy5lbmRWYWx1ZVkgPSB0aGlzLmVuZFZhbHVlWSAtIHRoaXMuc3RhcnRWYWx1ZVk7XG5cdFx0XHRcblx0XHRcdHRoaXMuX25lZWRzU3RhcnRWYWx1ZSA9IGZhbHNlO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdFxuXHRcdHRoaXMub25Mb29wID0gdGhpcy5fZWFzZTtcblx0XHRcblx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcblx0fTtcblx0XG5cdEVhc2luZy5wcm90b3R5cGUuX2Vhc2UgPSBmdW5jdGlvbiAoKSB7XG5cdFxuXHRcdHRoaXMub2JqZWN0LnNldExvY2F0aW9uKFxuXHRcdFx0dGhpcy5lYXNpbmdNZXRob2RYKHRoaXMuY3VycmVudEZyYW1lLCB0aGlzLnN0YXJ0VmFsdWVYLCB0aGlzLmVuZFZhbHVlWCwgdGhpcy50b3RhbEZyYW1lcyksIFxuXHRcdFx0dGhpcy5lYXNpbmdNZXRob2RZKHRoaXMuY3VycmVudEZyYW1lLCB0aGlzLnN0YXJ0VmFsdWVZLCB0aGlzLmVuZFZhbHVlWSwgdGhpcy50b3RhbEZyYW1lcylcblx0XHQpO1xuXHRcdFxuXHRcdHRoaXMuY3VycmVudEZyYW1lKys7XG5cdFx0XG5cdFx0aWYgKCB0aGlzLmN1cnJlbnRGcmFtZSA8PSB0aGlzLnRvdGFsRnJhbWVzICkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggdGhpcy5vbkZpbmlzaGVkICkge1xuXHRcdFx0XHR0aGlzLm9uRmluaXNoZWQuYXBwbHkodGhpcy5vYmplY3QpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0aGlzLmxvb3AgKSB7XG5cdFx0XHRcdHRoaXMub25Mb29wID0gdGhpcy5faW5pdDtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBmYWxzZTtcblx0XHRcblx0fTtcblxuXHRFYXNpbmcucHJvdG90eXBlLm9uTG9vcCA9IEVhc2luZy5wcm90b3R5cGUuX2luaXQ7XG5cblx0LyoqXG5cdCAqIFNpbXBsZSBsaW5lYXIgdHdlZW5pbmcgLSBubyBlYXNpbmcsIG5vIGFjY2VsZXJhdGlvblxuXHQgKiBAbWV0aG9kIGxpbmVhclR3ZWVuXG5cdCAqIEBwYXJhbSB0IGN1cnJlbnRUaW1lIGN1cnJlbnQgdGltZSBvciBmcmFtZSBvZiB0aGUgYW5pbWF0aW9uLiBTdGFydCBuZWVkcyB0byBiZSAwIGFuZCB0aGVuIHlvdSBoYXZlIHRvIGluY3JlYXNlIGl0IG9uIHlvdXIgY29kZVxuXHQgKiBAcGFyYW0gYiBzdGFydFZhbHVlIHN0YXJ0IGxvY2F0aW9uXG5cdCAqIEBwYXJhbSBjIGVuZFZhbHVlIGVuZCBsb2NhdGlvbi4gSWYgeW91J3JlIHVzaW5nIGFic29sdXRlIGNvb3JkaW5hdGVzIHlvdSdsbCBoYXZlIHRvIHJlc3QgdGhlIHN0YXJ0IHZhbHVlIHRvIGl0XG5cdCAqIEBwYXJhbSBkIGR1cmF0aW9uLiBEdXJhdGlvbiBpbiB0aW1lIG9yIGZyYW1lcyBvZiB0aGUgYW5pbWF0aW9uXG5cdCAqL1xuXHRFYXNpbmcucHJvdG90eXBlLmxpbmVhclR3ZWVuID0gZnVuY3Rpb24gKHQsIGIsIGMsIGQpIHtcblx0XHRyZXR1cm4gYyp0L2QgKyBiO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBRdWFkcmF0aWMgZWFzaW5nIGluIC0gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuXHQgKiBAbWV0aG9kIGVhc2VJblF1YWRcblx0ICogQHBhcmFtIHQgY3VycmVudFRpbWUgY3VycmVudCB0aW1lIG9yIGZyYW1lIG9mIHRoZSBhbmltYXRpb24uIFN0YXJ0IG5lZWRzIHRvIGJlIDAgYW5kIHRoZW4geW91IGhhdmUgdG8gaW5jcmVhc2UgaXQgb24geW91ciBjb2RlXG5cdCAqIEBwYXJhbSBiIHN0YXJ0VmFsdWUgc3RhcnQgbG9jYXRpb25cblx0ICogQHBhcmFtIGMgZW5kVmFsdWUgZW5kIGxvY2F0aW9uLiBJZiB5b3UncmUgdXNpbmcgYWJzb2x1dGUgY29vcmRpbmF0ZXMgeW91J2xsIGhhdmUgdG8gcmVzdCB0aGUgc3RhcnQgdmFsdWUgdG8gaXRcblx0ICogQHBhcmFtIGQgZHVyYXRpb24uIER1cmF0aW9uIGluIHRpbWUgb3IgZnJhbWVzIG9mIHRoZSBhbmltYXRpb25cblx0ICovXG5cdEVhc2luZy5wcm90b3R5cGUuZWFzZUluUXVhZCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkO1xuXHRcdHJldHVybiBjKnQqdCArIGI7XG5cdH07XG5cdFx0XHRcblx0LyoqXG5cdCAqIHF1YWRyYXRpYyBlYXNpbmcgb3V0IC0gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcblx0ICogQG1ldGhvZCBlYXNlT3V0UXVhZFxuXHQgKiBAcGFyYW0gdCBjdXJyZW50VGltZSBjdXJyZW50IHRpbWUgb3IgZnJhbWUgb2YgdGhlIGFuaW1hdGlvbi4gU3RhcnQgbmVlZHMgdG8gYmUgMCBhbmQgdGhlbiB5b3UgaGF2ZSB0byBpbmNyZWFzZSBpdCBvbiB5b3VyIGNvZGVcblx0ICogQHBhcmFtIGIgc3RhcnRWYWx1ZSBzdGFydCBsb2NhdGlvblxuXHQgKiBAcGFyYW0gYyBlbmRWYWx1ZSBlbmQgbG9jYXRpb24uIElmIHlvdSdyZSB1c2luZyBhYnNvbHV0ZSBjb29yZGluYXRlcyB5b3UnbGwgaGF2ZSB0byByZXN0IHRoZSBzdGFydCB2YWx1ZSB0byBpdFxuXHQgKiBAcGFyYW0gZCBkdXJhdGlvbi4gRHVyYXRpb24gaW4gdGltZSBvciBmcmFtZXMgb2YgdGhlIGFuaW1hdGlvblxuXHQgKi9cblx0RWFzaW5nLnByb3RvdHlwZS5lYXNlT3V0UXVhZCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkO1xuXHRcdHJldHVybiAtYyAqIHQqKHQtMikgKyBiO1xuXHR9O1xuXHRcdFx0XG5cdC8qKlxuXHQgKiBxdWFkcmF0aWMgZWFzaW5nIGluL291dCAtIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuXHQgKiBAbWV0aG9kIGVhc2VJbk91dFF1YWRcblx0ICogQHBhcmFtIHQgY3VycmVudFRpbWUgY3VycmVudCB0aW1lIG9yIGZyYW1lIG9mIHRoZSBhbmltYXRpb24uIFN0YXJ0IG5lZWRzIHRvIGJlIDAgYW5kIHRoZW4geW91IGhhdmUgdG8gaW5jcmVhc2UgaXQgb24geW91ciBjb2RlXG5cdCAqIEBwYXJhbSBiIHN0YXJ0VmFsdWUgc3RhcnQgbG9jYXRpb25cblx0ICogQHBhcmFtIGMgZW5kVmFsdWUgZW5kIGxvY2F0aW9uLiBJZiB5b3UncmUgdXNpbmcgYWJzb2x1dGUgY29vcmRpbmF0ZXMgeW91J2xsIGhhdmUgdG8gcmVzdCB0aGUgc3RhcnQgdmFsdWUgdG8gaXRcblx0ICogQHBhcmFtIGQgZHVyYXRpb24uIER1cmF0aW9uIGluIHRpbWUgb3IgZnJhbWVzIG9mIHRoZSBhbmltYXRpb25cblx0ICovXG5cdEVhc2luZy5wcm90b3R5cGUuZWFzZUluT3V0UXVhZCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkLzI7XG5cdFx0aWYgKHQgPCAxKSByZXR1cm4gYy8yKnQqdCArIGI7XG5cdFx0dC0tO1xuXHRcdHJldHVybiAtYy8yICogKHQqKHQtMikgLSAxKSArIGI7XG5cdH07XG5cblx0LyoqXG5cdCAqIGN1YmljIGVhc2luZyBpbiAtIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcblx0ICogQG1ldGhvZCBlYXNlSW5DdWJpY1xuXHQgKiBAcGFyYW0gdCBjdXJyZW50VGltZSBjdXJyZW50IHRpbWUgb3IgZnJhbWUgb2YgdGhlIGFuaW1hdGlvbi4gU3RhcnQgbmVlZHMgdG8gYmUgMCBhbmQgdGhlbiB5b3UgaGF2ZSB0byBpbmNyZWFzZSBpdCBvbiB5b3VyIGNvZGVcblx0ICogQHBhcmFtIGIgc3RhcnRWYWx1ZSBzdGFydCBsb2NhdGlvblxuXHQgKiBAcGFyYW0gYyBlbmRWYWx1ZSBlbmQgbG9jYXRpb24uIElmIHlvdSdyZSB1c2luZyBhYnNvbHV0ZSBjb29yZGluYXRlcyB5b3UnbGwgaGF2ZSB0byByZXN0IHRoZSBzdGFydCB2YWx1ZSB0byBpdFxuXHQgKiBAcGFyYW0gZCBkdXJhdGlvbi4gRHVyYXRpb24gaW4gdGltZSBvciBmcmFtZXMgb2YgdGhlIGFuaW1hdGlvblxuXHQgKi9cblx0RWFzaW5nLnByb3RvdHlwZS5lYXNlSW5DdWJpYyA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkO1xuXHRcdHJldHVybiBjKnQqdCp0ICsgYjtcblx0fTtcblx0XHRcdFxuXHQvKipcblx0ICogY3ViaWMgZWFzaW5nIG91dCAtIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG5cdCAqIEBtZXRob2QgZWFzZU91dEN1YmljXG5cdCAqIEBwYXJhbSB0IGN1cnJlbnRUaW1lIGN1cnJlbnQgdGltZSBvciBmcmFtZSBvZiB0aGUgYW5pbWF0aW9uLiBTdGFydCBuZWVkcyB0byBiZSAwIGFuZCB0aGVuIHlvdSBoYXZlIHRvIGluY3JlYXNlIGl0IG9uIHlvdXIgY29kZVxuXHQgKiBAcGFyYW0gYiBzdGFydFZhbHVlIHN0YXJ0IGxvY2F0aW9uXG5cdCAqIEBwYXJhbSBjIGVuZFZhbHVlIGVuZCBsb2NhdGlvbi4gSWYgeW91J3JlIHVzaW5nIGFic29sdXRlIGNvb3JkaW5hdGVzIHlvdSdsbCBoYXZlIHRvIHJlc3QgdGhlIHN0YXJ0IHZhbHVlIHRvIGl0XG5cdCAqIEBwYXJhbSBkIGR1cmF0aW9uLiBEdXJhdGlvbiBpbiB0aW1lIG9yIGZyYW1lcyBvZiB0aGUgYW5pbWF0aW9uXG5cdCAqL1xuXHRFYXNpbmcucHJvdG90eXBlLmVhc2VPdXRDdWJpYyA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkO1xuXHRcdHQtLTtcblx0XHRyZXR1cm4gYyoodCp0KnQgKyAxKSArIGI7XG5cdH07XG5cdFx0XHRcblx0LyoqXG5cdCAqIGN1YmljIGVhc2luZyBpbi9vdXQgLSBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cblx0ICogQG1ldGhvZCBlYXNlSW5PdXRDdWJpY1xuXHQgKiBAcGFyYW0gdCBjdXJyZW50VGltZSBjdXJyZW50IHRpbWUgb3IgZnJhbWUgb2YgdGhlIGFuaW1hdGlvbi4gU3RhcnQgbmVlZHMgdG8gYmUgMCBhbmQgdGhlbiB5b3UgaGF2ZSB0byBpbmNyZWFzZSBpdCBvbiB5b3VyIGNvZGVcblx0ICogQHBhcmFtIGIgc3RhcnRWYWx1ZSBzdGFydCBsb2NhdGlvblxuXHQgKiBAcGFyYW0gYyBlbmRWYWx1ZSBlbmQgbG9jYXRpb24uIElmIHlvdSdyZSB1c2luZyBhYnNvbHV0ZSBjb29yZGluYXRlcyB5b3UnbGwgaGF2ZSB0byByZXN0IHRoZSBzdGFydCB2YWx1ZSB0byBpdFxuXHQgKiBAcGFyYW0gZCBkdXJhdGlvbi4gRHVyYXRpb24gaW4gdGltZSBvciBmcmFtZXMgb2YgdGhlIGFuaW1hdGlvblxuXHQgKi9cblx0RWFzaW5nLnByb3RvdHlwZS5lYXNlSW5PdXRDdWJpYyA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkLzI7XG5cdFx0aWYgKHQgPCAxKSByZXR1cm4gYy8yKnQqdCp0ICsgYjtcblx0XHR0IC09IDI7XG5cdFx0cmV0dXJuIGMvMioodCp0KnQgKyAyKSArIGI7XG5cdH07XG5cdFx0XG5cdC8qKlxuXHQgKiBxdWFydGljIGVhc2luZyBpbiAtIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcblx0ICogQG1ldGhvZCBlYXNlSW5RdWFydFxuXHQgKiBAcGFyYW0gdCBjdXJyZW50VGltZSBjdXJyZW50IHRpbWUgb3IgZnJhbWUgb2YgdGhlIGFuaW1hdGlvbi4gU3RhcnQgbmVlZHMgdG8gYmUgMCBhbmQgdGhlbiB5b3UgaGF2ZSB0byBpbmNyZWFzZSBpdCBvbiB5b3VyIGNvZGVcblx0ICogQHBhcmFtIGIgc3RhcnRWYWx1ZSBzdGFydCBsb2NhdGlvblxuXHQgKiBAcGFyYW0gYyBlbmRWYWx1ZSBlbmQgbG9jYXRpb24uIElmIHlvdSdyZSB1c2luZyBhYnNvbHV0ZSBjb29yZGluYXRlcyB5b3UnbGwgaGF2ZSB0byByZXN0IHRoZSBzdGFydCB2YWx1ZSB0byBpdFxuXHQgKiBAcGFyYW0gZCBkdXJhdGlvbi4gRHVyYXRpb24gaW4gdGltZSBvciBmcmFtZXMgb2YgdGhlIGFuaW1hdGlvblxuXHQgKi9cblx0RWFzaW5nLnByb3RvdHlwZS5lYXNlSW5RdWFydCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkO1xuXHRcdHJldHVybiBjKnQqdCp0KnQgKyBiO1xuXHR9O1xuXHRcdFxuXHQvKipcblx0ICogcXVhcnRpYyBlYXNpbmcgb3V0IC0gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcblx0ICogQG1ldGhvZCBlYXNlT3V0UXVhcnRcblx0ICogQHBhcmFtIHQgY3VycmVudFRpbWUgY3VycmVudCB0aW1lIG9yIGZyYW1lIG9mIHRoZSBhbmltYXRpb24uIFN0YXJ0IG5lZWRzIHRvIGJlIDAgYW5kIHRoZW4geW91IGhhdmUgdG8gaW5jcmVhc2UgaXQgb24geW91ciBjb2RlXG5cdCAqIEBwYXJhbSBiIHN0YXJ0VmFsdWUgc3RhcnQgbG9jYXRpb25cblx0ICogQHBhcmFtIGMgZW5kVmFsdWUgZW5kIGxvY2F0aW9uLiBJZiB5b3UncmUgdXNpbmcgYWJzb2x1dGUgY29vcmRpbmF0ZXMgeW91J2xsIGhhdmUgdG8gcmVzdCB0aGUgc3RhcnQgdmFsdWUgdG8gaXRcblx0ICogQHBhcmFtIGQgZHVyYXRpb24uIER1cmF0aW9uIGluIHRpbWUgb3IgZnJhbWVzIG9mIHRoZSBhbmltYXRpb25cblx0ICovXG5cdEVhc2luZy5wcm90b3R5cGUuZWFzZU91dFF1YXJ0ID0gZnVuY3Rpb24gKHQsIGIsIGMsIGQpIHtcblx0XHR0IC89IGQ7XG5cdFx0dC0tO1xuXHRcdHJldHVybiAtYyAqICh0KnQqdCp0IC0gMSkgKyBiO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBxdWFydGljIGVhc2luZyBpbi9vdXQgLSBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cblx0ICogQG1ldGhvZCBlYXNlSW5PdXRRdWFydFxuXHQgKiBAcGFyYW0gdCBjdXJyZW50VGltZSBjdXJyZW50IHRpbWUgb3IgZnJhbWUgb2YgdGhlIGFuaW1hdGlvbi4gU3RhcnQgbmVlZHMgdG8gYmUgMCBhbmQgdGhlbiB5b3UgaGF2ZSB0byBpbmNyZWFzZSBpdCBvbiB5b3VyIGNvZGVcblx0ICogQHBhcmFtIGIgc3RhcnRWYWx1ZSBzdGFydCBsb2NhdGlvblxuXHQgKiBAcGFyYW0gYyBlbmRWYWx1ZSBlbmQgbG9jYXRpb24uIElmIHlvdSdyZSB1c2luZyBhYnNvbHV0ZSBjb29yZGluYXRlcyB5b3UnbGwgaGF2ZSB0byByZXN0IHRoZSBzdGFydCB2YWx1ZSB0byBpdFxuXHQgKiBAcGFyYW0gZCBkdXJhdGlvbi4gRHVyYXRpb24gaW4gdGltZSBvciBmcmFtZXMgb2YgdGhlIGFuaW1hdGlvblxuXHQgKi9cblx0RWFzaW5nLnByb3RvdHlwZS5lYXNlSW5PdXRRdWFydCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkLzI7XG5cdFx0aWYgKHQgPCAxKSByZXR1cm4gYy8yKnQqdCp0KnQgKyBiO1xuXHRcdHQgLT0gMjtcblx0XHRyZXR1cm4gLWMvMiAqICh0KnQqdCp0IC0gMikgKyBiO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBxdWludGljIGVhc2luZyBpbiAtIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcblx0ICogQG1ldGhvZCBlYXNlSW5RdWludFxuXHQgKiBAcGFyYW0gdCBjdXJyZW50VGltZSBjdXJyZW50IHRpbWUgb3IgZnJhbWUgb2YgdGhlIGFuaW1hdGlvbi4gU3RhcnQgbmVlZHMgdG8gYmUgMCBhbmQgdGhlbiB5b3UgaGF2ZSB0byBpbmNyZWFzZSBpdCBvbiB5b3VyIGNvZGVcblx0ICogQHBhcmFtIGIgc3RhcnRWYWx1ZSBzdGFydCBsb2NhdGlvblxuXHQgKiBAcGFyYW0gYyBlbmRWYWx1ZSBlbmQgbG9jYXRpb24uIElmIHlvdSdyZSB1c2luZyBhYnNvbHV0ZSBjb29yZGluYXRlcyB5b3UnbGwgaGF2ZSB0byByZXN0IHRoZSBzdGFydCB2YWx1ZSB0byBpdFxuXHQgKiBAcGFyYW0gZCBkdXJhdGlvbi4gRHVyYXRpb24gaW4gdGltZSBvciBmcmFtZXMgb2YgdGhlIGFuaW1hdGlvblxuXHQgKi9cblx0RWFzaW5nLnByb3RvdHlwZS5lYXNlSW5RdWludCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkO1xuXHRcdHJldHVybiBjKnQqdCp0KnQqdCArIGI7XG5cdH07XG5cblx0LyoqXG5cdCAqIHF1aW50aWMgZWFzaW5nIG91dCAtIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG5cdCAqIEBtZXRob2QgZWFzZU91dFF1aW50XG5cdCAqIEBwYXJhbSB0IGN1cnJlbnRUaW1lIGN1cnJlbnQgdGltZSBvciBmcmFtZSBvZiB0aGUgYW5pbWF0aW9uLiBTdGFydCBuZWVkcyB0byBiZSAwIGFuZCB0aGVuIHlvdSBoYXZlIHRvIGluY3JlYXNlIGl0IG9uIHlvdXIgY29kZVxuXHQgKiBAcGFyYW0gYiBzdGFydFZhbHVlIHN0YXJ0IGxvY2F0aW9uXG5cdCAqIEBwYXJhbSBjIGVuZFZhbHVlIGVuZCBsb2NhdGlvbi4gSWYgeW91J3JlIHVzaW5nIGFic29sdXRlIGNvb3JkaW5hdGVzIHlvdSdsbCBoYXZlIHRvIHJlc3QgdGhlIHN0YXJ0IHZhbHVlIHRvIGl0XG5cdCAqIEBwYXJhbSBkIGR1cmF0aW9uLiBEdXJhdGlvbiBpbiB0aW1lIG9yIGZyYW1lcyBvZiB0aGUgYW5pbWF0aW9uXG5cdCAqL1xuXHRFYXNpbmcucHJvdG90eXBlLmVhc2VPdXRRdWludCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkO1xuXHRcdHQtLTtcblx0XHRyZXR1cm4gYyoodCp0KnQqdCp0ICsgMSkgKyBiO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBxdWludGljIGVhc2luZyBpbi9vdXQgLSBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cblx0ICogQG1ldGhvZCBlYXNlSW5PdXRRdWludFxuXHQgKiBAcGFyYW0gdCBjdXJyZW50VGltZSBjdXJyZW50IHRpbWUgb3IgZnJhbWUgb2YgdGhlIGFuaW1hdGlvbi4gU3RhcnQgbmVlZHMgdG8gYmUgMCBhbmQgdGhlbiB5b3UgaGF2ZSB0byBpbmNyZWFzZSBpdCBvbiB5b3VyIGNvZGVcblx0ICogQHBhcmFtIGIgc3RhcnRWYWx1ZSBzdGFydCBsb2NhdGlvblxuXHQgKiBAcGFyYW0gYyBlbmRWYWx1ZSBlbmQgbG9jYXRpb24uIElmIHlvdSdyZSB1c2luZyBhYnNvbHV0ZSBjb29yZGluYXRlcyB5b3UnbGwgaGF2ZSB0byByZXN0IHRoZSBzdGFydCB2YWx1ZSB0byBpdFxuXHQgKiBAcGFyYW0gZCBkdXJhdGlvbi4gRHVyYXRpb24gaW4gdGltZSBvciBmcmFtZXMgb2YgdGhlIGFuaW1hdGlvblxuXHQgKi9cblx0RWFzaW5nLnByb3RvdHlwZS5lYXNlSW5PdXRRdWludCA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkLzI7XG5cdFx0aWYgKHQgPCAxKSByZXR1cm4gYy8yKnQqdCp0KnQqdCArIGI7XG5cdFx0dCAtPSAyO1xuXHRcdHJldHVybiBjLzIqKHQqdCp0KnQqdCArIDIpICsgYjtcblx0fTtcblxuXHQvKipcblx0ICogc2ludXNvaWRhbCBlYXNpbmcgaW4gLSBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG5cdCAqIEBtZXRob2QgZWFzZUluU2luZVxuXHQgKiBAcGFyYW0gdCBjdXJyZW50VGltZSBjdXJyZW50IHRpbWUgb3IgZnJhbWUgb2YgdGhlIGFuaW1hdGlvbi4gU3RhcnQgbmVlZHMgdG8gYmUgMCBhbmQgdGhlbiB5b3UgaGF2ZSB0byBpbmNyZWFzZSBpdCBvbiB5b3VyIGNvZGVcblx0ICogQHBhcmFtIGIgc3RhcnRWYWx1ZSBzdGFydCBsb2NhdGlvblxuXHQgKiBAcGFyYW0gYyBlbmRWYWx1ZSBlbmQgbG9jYXRpb24uIElmIHlvdSdyZSB1c2luZyBhYnNvbHV0ZSBjb29yZGluYXRlcyB5b3UnbGwgaGF2ZSB0byByZXN0IHRoZSBzdGFydCB2YWx1ZSB0byBpdFxuXHQgKiBAcGFyYW0gZCBkdXJhdGlvbi4gRHVyYXRpb24gaW4gdGltZSBvciBmcmFtZXMgb2YgdGhlIGFuaW1hdGlvblxuXHQgKi9cblx0RWFzaW5nLnByb3RvdHlwZS5lYXNlSW5TaW5lID0gZnVuY3Rpb24gKHQsIGIsIGMsIGQpIHtcblx0XHRyZXR1cm4gLWMgKiB0aGlzLm1hdGhDYWNoZWQuY29zKHQvZCAqICh0aGlzLm1hdGhDYWNoZWQuUEkvMikpICsgYyArIGI7XG5cdH07XG5cblx0LyoqXG5cdCAqIHNpbnVzb2lkYWwgZWFzaW5nIG91dCAtIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG5cdCAqIEBtZXRob2QgZWFzZU91dFNpbmVcblx0ICogQHBhcmFtIHQgY3VycmVudFRpbWUgY3VycmVudCB0aW1lIG9yIGZyYW1lIG9mIHRoZSBhbmltYXRpb24uIFN0YXJ0IG5lZWRzIHRvIGJlIDAgYW5kIHRoZW4geW91IGhhdmUgdG8gaW5jcmVhc2UgaXQgb24geW91ciBjb2RlXG5cdCAqIEBwYXJhbSBiIHN0YXJ0VmFsdWUgc3RhcnQgbG9jYXRpb25cblx0ICogQHBhcmFtIGMgZW5kVmFsdWUgZW5kIGxvY2F0aW9uLiBJZiB5b3UncmUgdXNpbmcgYWJzb2x1dGUgY29vcmRpbmF0ZXMgeW91J2xsIGhhdmUgdG8gcmVzdCB0aGUgc3RhcnQgdmFsdWUgdG8gaXRcblx0ICogQHBhcmFtIGQgZHVyYXRpb24uIER1cmF0aW9uIGluIHRpbWUgb3IgZnJhbWVzIG9mIHRoZSBhbmltYXRpb25cblx0ICovXG5cdEVhc2luZy5wcm90b3R5cGUuZWFzZU91dFNpbmUgPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuXHRcdHJldHVybiBjICogdGhpcy5tYXRoQ2FjaGVkLnNpbih0L2QgKiAodGhpcy5tYXRoQ2FjaGVkLlBJLzIpKSArIGI7XG5cdH07XG5cblx0LyoqXG5cdCAqIHNpbnVzb2lkYWwgZWFzaW5nIGluL291dCAtIGFjY2VsZXJhdGluZyB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGluZ1xuXHQgKiBAbWV0aG9kIGVhc2VJbk91dFNpbmVcblx0ICogQHBhcmFtIHQgY3VycmVudFRpbWUgY3VycmVudCB0aW1lIG9yIGZyYW1lIG9mIHRoZSBhbmltYXRpb24uIFN0YXJ0IG5lZWRzIHRvIGJlIDAgYW5kIHRoZW4geW91IGhhdmUgdG8gaW5jcmVhc2UgaXQgb24geW91ciBjb2RlXG5cdCAqIEBwYXJhbSBiIHN0YXJ0VmFsdWUgc3RhcnQgbG9jYXRpb25cblx0ICogQHBhcmFtIGMgZW5kVmFsdWUgZW5kIGxvY2F0aW9uLiBJZiB5b3UncmUgdXNpbmcgYWJzb2x1dGUgY29vcmRpbmF0ZXMgeW91J2xsIGhhdmUgdG8gcmVzdCB0aGUgc3RhcnQgdmFsdWUgdG8gaXRcblx0ICogQHBhcmFtIGQgZHVyYXRpb24uIER1cmF0aW9uIGluIHRpbWUgb3IgZnJhbWVzIG9mIHRoZSBhbmltYXRpb25cblx0ICovXG5cdEVhc2luZy5wcm90b3R5cGUuZWFzZUluT3V0U2luZSA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0cmV0dXJuIC1jLzIgKiAodGhpcy5tYXRoQ2FjaGVkLmNvcyh0aGlzLm1hdGhDYWNoZWQuUEkqdC9kKSAtIDEpICsgYjtcblx0fTtcblxuXHQvKipcblx0ICogZXhwb25lbnRpYWwgZWFzaW5nIGluIC0gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuXHQgKiBAbWV0aG9kIGVhc2VJbkV4cG9cblx0ICogQHBhcmFtIHQgY3VycmVudFRpbWUgY3VycmVudCB0aW1lIG9yIGZyYW1lIG9mIHRoZSBhbmltYXRpb24uIFN0YXJ0IG5lZWRzIHRvIGJlIDAgYW5kIHRoZW4geW91IGhhdmUgdG8gaW5jcmVhc2UgaXQgb24geW91ciBjb2RlXG5cdCAqIEBwYXJhbSBiIHN0YXJ0VmFsdWUgc3RhcnQgbG9jYXRpb25cblx0ICogQHBhcmFtIGMgZW5kVmFsdWUgZW5kIGxvY2F0aW9uLiBJZiB5b3UncmUgdXNpbmcgYWJzb2x1dGUgY29vcmRpbmF0ZXMgeW91J2xsIGhhdmUgdG8gcmVzdCB0aGUgc3RhcnQgdmFsdWUgdG8gaXRcblx0ICogQHBhcmFtIGQgZHVyYXRpb24uIER1cmF0aW9uIGluIHRpbWUgb3IgZnJhbWVzIG9mIHRoZSBhbmltYXRpb25cblx0ICovXG5cdEVhc2luZy5wcm90b3R5cGUuZWFzZUluRXhwbyA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0cmV0dXJuIGMgKiB0aGlzLm1hdGhDYWNoZWQucG93KCAyLCAxMCAqICh0L2QgLSAxKSApICsgYjtcblx0fTtcblxuXHQvKipcblx0ICogZXhwb25lbnRpYWwgZWFzaW5nIG91dCAtIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG5cdCAqIEBtZXRob2QgZWFzZU91dEV4cG9cblx0ICogQHBhcmFtIHQgY3VycmVudFRpbWUgY3VycmVudCB0aW1lIG9yIGZyYW1lIG9mIHRoZSBhbmltYXRpb24uIFN0YXJ0IG5lZWRzIHRvIGJlIDAgYW5kIHRoZW4geW91IGhhdmUgdG8gaW5jcmVhc2UgaXQgb24geW91ciBjb2RlXG5cdCAqIEBwYXJhbSBiIHN0YXJ0VmFsdWUgc3RhcnQgbG9jYXRpb25cblx0ICogQHBhcmFtIGMgZW5kVmFsdWUgZW5kIGxvY2F0aW9uLiBJZiB5b3UncmUgdXNpbmcgYWJzb2x1dGUgY29vcmRpbmF0ZXMgeW91J2xsIGhhdmUgdG8gcmVzdCB0aGUgc3RhcnQgdmFsdWUgdG8gaXRcblx0ICogQHBhcmFtIGQgZHVyYXRpb24uIER1cmF0aW9uIGluIHRpbWUgb3IgZnJhbWVzIG9mIHRoZSBhbmltYXRpb25cblx0ICovXG5cdEVhc2luZy5wcm90b3R5cGUuZWFzZU91dEV4cG8gPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuXHRcdHJldHVybiBjICogKCAtdGhpcy5tYXRoQ2FjaGVkLnBvdyggMiwgLTEwICogdC9kICkgKyAxICkgKyBiO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBleHBvbmVudGlhbCBlYXNpbmcgaW4vb3V0IC0gYWNjZWxlcmF0aW5nIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW5nXG5cdCAqIEBtZXRob2QgZWFzZUluT3V0RXhwb1xuXHQgKiBAcGFyYW0gdCBjdXJyZW50VGltZSBjdXJyZW50IHRpbWUgb3IgZnJhbWUgb2YgdGhlIGFuaW1hdGlvbi4gU3RhcnQgbmVlZHMgdG8gYmUgMCBhbmQgdGhlbiB5b3UgaGF2ZSB0byBpbmNyZWFzZSBpdCBvbiB5b3VyIGNvZGVcblx0ICogQHBhcmFtIGIgc3RhcnRWYWx1ZSBzdGFydCBsb2NhdGlvblxuXHQgKiBAcGFyYW0gYyBlbmRWYWx1ZSBlbmQgbG9jYXRpb24uIElmIHlvdSdyZSB1c2luZyBhYnNvbHV0ZSBjb29yZGluYXRlcyB5b3UnbGwgaGF2ZSB0byByZXN0IHRoZSBzdGFydCB2YWx1ZSB0byBpdFxuXHQgKiBAcGFyYW0gZCBkdXJhdGlvbi4gRHVyYXRpb24gaW4gdGltZSBvciBmcmFtZXMgb2YgdGhlIGFuaW1hdGlvblxuXHQgKi9cblx0RWFzaW5nLnByb3RvdHlwZS5lYXNlSW5PdXRFeHBvID0gZnVuY3Rpb24gKHQsIGIsIGMsIGQpIHtcblx0XHR0IC89IGQvMjtcblx0XHRpZiAodCA8IDEpIHJldHVybiBjLzIgKiB0aGlzLm1hdGhDYWNoZWQucG93KCAyLCAxMCAqICh0IC0gMSkgKSArIGI7XG5cdFx0dC0tO1xuXHRcdHJldHVybiBjLzIgKiAoIC10aGlzLm1hdGhDYWNoZWQucG93KCAyLCAtMTAgKiB0KSArIDIgKSArIGI7XG5cdH07XHRcblxuXHQvKipcblx0ICogY2lyY3VsYXIgZWFzaW5nIGluIC0gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuXHQgKiBAbWV0aG9kIGVhc2VJbkNpcmNcblx0ICogQHBhcmFtIHQgY3VycmVudFRpbWUgY3VycmVudCB0aW1lIG9yIGZyYW1lIG9mIHRoZSBhbmltYXRpb24uIFN0YXJ0IG5lZWRzIHRvIGJlIDAgYW5kIHRoZW4geW91IGhhdmUgdG8gaW5jcmVhc2UgaXQgb24geW91ciBjb2RlXG5cdCAqIEBwYXJhbSBiIHN0YXJ0VmFsdWUgc3RhcnQgbG9jYXRpb25cblx0ICogQHBhcmFtIGMgZW5kVmFsdWUgZW5kIGxvY2F0aW9uLiBJZiB5b3UncmUgdXNpbmcgYWJzb2x1dGUgY29vcmRpbmF0ZXMgeW91J2xsIGhhdmUgdG8gcmVzdCB0aGUgc3RhcnQgdmFsdWUgdG8gaXRcblx0ICogQHBhcmFtIGQgZHVyYXRpb24uIER1cmF0aW9uIGluIHRpbWUgb3IgZnJhbWVzIG9mIHRoZSBhbmltYXRpb25cblx0ICovXG5cdEVhc2luZy5wcm90b3R5cGUuZWFzZUluQ2lyYyA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0dCAvPSBkO1xuXHRcdHJldHVybiAtYyAqICh0aGlzLm1hdGhDYWNoZWQuc3FydCgxIC0gdCp0KSAtIDEpICsgYjtcblx0fTtcblxuXHQvKipcblx0ICogY2lyY3VsYXIgZWFzaW5nIG91dCAtIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG5cdCAqIEBtZXRob2QgZWFzZU91dENpcmNcblx0ICogQHBhcmFtIHQgY3VycmVudFRpbWUgY3VycmVudCB0aW1lIG9yIGZyYW1lIG9mIHRoZSBhbmltYXRpb24uIFN0YXJ0IG5lZWRzIHRvIGJlIDAgYW5kIHRoZW4geW91IGhhdmUgdG8gaW5jcmVhc2UgaXQgb24geW91ciBjb2RlXG5cdCAqIEBwYXJhbSBiIHN0YXJ0VmFsdWUgc3RhcnQgbG9jYXRpb25cblx0ICogQHBhcmFtIGMgZW5kVmFsdWUgZW5kIGxvY2F0aW9uLiBJZiB5b3UncmUgdXNpbmcgYWJzb2x1dGUgY29vcmRpbmF0ZXMgeW91J2xsIGhhdmUgdG8gcmVzdCB0aGUgc3RhcnQgdmFsdWUgdG8gaXRcblx0ICogQHBhcmFtIGQgZHVyYXRpb24uIER1cmF0aW9uIGluIHRpbWUgb3IgZnJhbWVzIG9mIHRoZSBhbmltYXRpb25cblx0ICovXG5cdEVhc2luZy5wcm90b3R5cGUuZWFzZU91dENpcmMgPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuXHRcdHQgLz0gZDtcblx0XHR0LS07XG5cdFx0cmV0dXJuIGMgKiB0aGlzLm1hdGhDYWNoZWQuc3FydCgxIC0gdCp0KSArIGI7XG5cdH07XG5cblx0LyoqXG5cdCAqIENpcmN1bGFyIGVhc2luZyBpbi9vdXQgLSBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cblx0ICogQG1ldGhvZCBlYXNlSW5PdXRDaXJjXG5cdCAqIEBwYXJhbSB0IGN1cnJlbnRUaW1lIGN1cnJlbnQgdGltZSBvciBmcmFtZSBvZiB0aGUgYW5pbWF0aW9uLiBTdGFydCBuZWVkcyB0byBiZSAwIGFuZCB0aGVuIHlvdSBoYXZlIHRvIGluY3JlYXNlIGl0IG9uIHlvdXIgY29kZVxuXHQgKiBAcGFyYW0gYiBzdGFydFZhbHVlIHN0YXJ0IGxvY2F0aW9uXG5cdCAqIEBwYXJhbSBjIGVuZFZhbHVlIGVuZCBsb2NhdGlvbi4gSWYgeW91J3JlIHVzaW5nIGFic29sdXRlIGNvb3JkaW5hdGVzIHlvdSdsbCBoYXZlIHRvIHJlc3QgdGhlIHN0YXJ0IHZhbHVlIHRvIGl0XG5cdCAqIEBwYXJhbSBkIGR1cmF0aW9uLiBEdXJhdGlvbiBpbiB0aW1lIG9yIGZyYW1lcyBvZiB0aGUgYW5pbWF0aW9uXG5cdCAqL1xuXHRFYXNpbmcucHJvdG90eXBlLmVhc2VJbk91dENpcmMgPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuXHRcdHQgLz0gZC8yO1xuXHRcdGlmICh0IDwgMSkgcmV0dXJuIC1jLzIgKiAodGhpcy5tYXRoQ2FjaGVkLnNxcnQoMSAtIHQqdCkgLSAxKSArIGI7XG5cdFx0dCAtPSAyO1xuXHRcdHJldHVybiBjLzIgKiAodGhpcy5tYXRoQ2FjaGVkLnNxcnQoMSAtIHQqdCkgKyAxKSArIGI7XG5cdH07XG5cblx0Lypcblx0RWFzaW5nLnByb3RvdHlwZS5lYXNlSW5PdXRTaW5lID0gZnVuY3Rpb24gKGN1cnJlbnRUaW1lLCBzdGFydFZhbHVlLCBlbmRWYWx1ZSwgZHVyYXRpb24pIHtcblx0XHRyZXR1cm4gLWVuZFZhbHVlIC8gMiAqICh0aGlzLm1hdGhDYWNoZWQuY29zKHRoaXMubWF0aENhY2hlZC5QSSAqIGN1cnJlbnRUaW1lIC8gZHVyYXRpb24pIC0gMSkgKyBzdGFydFZhbHVlO1xuXHR9O1xuXHRFYXNpbmcucHJvdG90eXBlLmVhc2VJblF1YWQgPSBmdW5jdGlvbihjdXJyZW50VGltZSwgc3RhcnRWYWx1ZSwgZW5kVmFsdWUsIGR1cmF0aW9uKSB7XG5cdFx0Y3VycmVudFRpbWUgLz0gZHVyYXRpb247XG5cdFx0cmV0dXJuIGVuZFZhbHVlICogY3VycmVudFRpbWUgKiBjdXJyZW50VGltZSArIHN0YXJ0VmFsdWU7XG5cdH07XG5cdCovXG5cblx0bmFtZXNwYWNlLkVhc2luZyA9IEVhc2luZztcblxufSkoTS5lZmZlY3RzLnZpc3VhbCwgTSk7IiwiLyoqXG4gKiBAbW9kdWxlIE1hdGNoXG4gKi9cbihmdW5jdGlvbihuYW1lc3BhY2UsIE0pIHtcblxuXHQvKipcblx0ICogRmFkZXMgb3V0IGEgc291bmRcblx0ICogQGNsYXNzIFNvdW5kRmFkZU91dFxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQG5hbWVzcGFjZSBzb3VuZFxuXHQgKiBAcGFyYW0ge0F1ZGlvfSBhdWRpb09iamVjdCBzb3VuZCB0byBmYWRlIG91dFxuXHQgKiBAcGFyYW0ge2ludH0gbWluIGZpbmFsIHZvbHVtZSAtIGlmIG5vIHByb3ZpZGVkIHRoZSBzb3VuZCB3aWxsIHN0b3AgcGxheWluZyBhZnRlciBiZWluZyBmYWRlZFxuXHQgKi9cblx0ZnVuY3Rpb24gU291bmRGYWRlT3V0KGF1ZGlvT2JqZWN0LCBtaW4pIHtcblxuXHRcdGlmICggISBtaW4gKSB7XG5cdFx0XHR0aGlzLm1pbiA9IDAuMTtcblx0XHRcdHRoaXMucGF1c2VBZnRlckZhZGUgPSB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1pbiA9IG1pbjtcblx0XHRcdHRoaXMucGF1c2VBZnRlckZhZGUgPSBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLnNvdW5kID0gYXVkaW9PYmplY3Q7XG5cblx0fVxuXG5cdFNvdW5kRmFkZU91dC5wcm90b3R5cGUgPSB7XG5cblx0XHRvbkxvb3A6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRpZiAoIHRoaXMuc291bmQudm9sdW1lID4gdGhpcy5taW4gKSB7XG5cblx0XHRcdFx0dGhpcy5zb3VuZC52b2x1bWUgLT0gMC4wMDQ7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYgKCB0aGlzLnBhdXNlQWZ0ZXJGYWRlICkge1xuXHRcdFx0XHRcdHRoaXMuc291bmQucGF1c2UoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdE0ucmVtb3ZlKHRoaXMpO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fTtcblxuXHQvKipcblx0ICogRmFkZXMgaW4gYSBzb3VuZFxuXHQgKiBAY2xhc3MgU291bmRGYWRlSW5cblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBuYW1lc3BhY2Ugc291bmRcblx0ICogQHBhcmFtIHtBdWRpb30gYXVkaW9PYmplY3Qgc291bmQgdG8gZmFkZSBpblxuXHQgKiBAcGFyYW0ge2ludH0gbWF4IGZpbmFsIHZvbHVtZVxuXHQgKi9cblx0ZnVuY3Rpb24gU291bmRGYWRlSW4oYXVkaW9PYmplY3QsIG1heCkge1xuXG5cdFx0aWYgKCAhIG1heCApIHtcblx0XHRcdHRoaXMubWF4ID0gMC45O1xuXHRcdH1cblxuXHRcdHRoaXMuc291bmQgPSBhdWRpb09iamVjdDtcblxuXHR9XG5cblx0U291bmRGYWRlSW4ucHJvdG90eXBlID0ge1xuXG5cdFx0b25Mb29wOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5zb3VuZC52b2x1bWUgPCB0aGlzLm1heCApIHtcblx0XHRcdFx0dGhpcy5zb3VuZC52b2x1bWUgKz0gMC4wMDQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRNLnJlbW92ZSh0aGlzKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fTtcblxuXHQvKipcblx0ICogVHJhbnNpdGlvbiBlZmZlY3QgZmFkaW5nIG91dCBhIHNvdW5kIGFuZCBmYWRpbmcgaW4gYW5vdGhlclxuXHQgKiBAY2xhc3MgVHJhbnNpdGlvblxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHtBdWRpb30gc291bmRGcm9tIHNvdW5kIHRvIGZhZGUgb3V0XG5cdCAqIEBwYXJhbSB7QXVkaW99IHNvdW5kVG8gc291bmQgdG8gZmFkZSBpblxuXHQgKiBAcGFyYW0ge2ludH0gbWF4Vm9sdW1lIGZpbmFsIHZvbHVtZSBvZiB0aGUgZmFkZWQgaW4gc291bmRcblx0ICovXG5cdGZ1bmN0aW9uIFRyYW5zaXRpb24oc291bmRGcm9tLCBzb3VuZFRvLCBtYXhWb2x1bWUpIHtcblx0XHR0aGlzLnNvdW5kRnJvbSA9IHNvdW5kRnJvbTtcblx0XHR0aGlzLnNvdW5kVG8gPSBzb3VuZFRvO1xuXHRcdHRoaXMubWF4ID0gbWF4Vm9sdW1lO1xuXHRcdHRoaXMuY3VycmVudFN0ZXAgPSB0aGlzLmZhZGVPdXQ7XG5cdH1cblxuXHRUcmFuc2l0aW9uLnByb3RvdHlwZSA9IHtcblx0XHRmYWRlT3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5zb3VuZEZyb20udm9sdW1lID4gMC4wNSApIHtcblx0XHRcdFx0dGhpcy5zb3VuZEZyb20udm9sdW1lIC09IDAuMDA0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zb3VuZEZyb20ucGF1c2UoKTtcblx0XHRcdFx0dGhpcy5zb3VuZFRvLnZvbHVtZSA9IDA7XG5cdFx0XHRcdHRoaXMuc291bmRUby5wbGF5KCk7XG5cdFx0XHRcdHRoaXMuY3VycmVudFN0ZXAgPSB0aGlzLmZhZGVJbjtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGZhZGVJbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMuc291bmRUby52b2x1bWUgPCB0aGlzLm1heCApIHtcblx0XHRcdFx0dGhpcy5zb3VuZFRvLnZvbHVtZSArPSAwLjAwNDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdE0ucmVtb3ZlKHRoaXMpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b25Mb29wOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY3VycmVudFN0ZXAoKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIEZhZGVzIG91dCBhIHNvdW5kIHRvIHBsYXkgdGhlIG90aGVyIHRvIGZhZGUgaW4gdGhlIGZpcnN0IGFmdGVyIGZpbmlzaGVkXG5cdCAqIEBjbGFzcyBTb3VuZE92ZXJcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7QXVkaW99IHNvdW5kRnJvbSBzb3VuZCB0byBsb3dlclxuXHQgKiBAcGFyYW0ge0F1ZGlvfSBzb3VuZFRvIHNvdW5kIHRvIHBsYXlcblx0ICovXG5cdGZ1bmN0aW9uIFNvdW5kT3Zlcihzb3VuZEZyb20sIHNvdW5kVG8pIHtcblx0XHR0aGlzLm1heCA9IHNvdW5kRnJvbS52b2x1bWU7XG5cdFx0dGhpcy5zb3VuZEZyb20gPSBzb3VuZEZyb207XG5cdFx0dGhpcy5zb3VuZFRvID0gc291bmRUbztcblx0XHR0aGlzLmN1cnJlbnRTdGVwID0gdGhpcy5mYWRlT3V0O1xuXHR9XG5cblx0U291bmRPdmVyLnByb3RvdHlwZSA9IHtcblx0XHRmYWRlT3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5zb3VuZEZyb20udm9sdW1lID4gMC4yNSApIHtcblx0XHRcdFx0dGhpcy5zb3VuZEZyb20udm9sdW1lIC09IDAuMDE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnNvdW5kVG8ucGxheSgpO1xuXHRcdFx0XHR0aGlzLmN1cnJlbnRTdGVwID0gdGhpcy5mYWRlSW47XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRmYWRlSW46IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLnNvdW5kVG8uZW5kZWQgJiYgdGhpcy5zb3VuZEZyb20udm9sdW1lIDwgdGhpcy5tYXggKSB7XG5cdFx0XHRcdHRoaXMuc291bmRUby52b2x1bWUgKz0gMC4wMTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdE0ucmVtb3ZlKHRoaXMpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b25Mb29wOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY3VycmVudFN0ZXAoKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIFBsYXlzIGEgc291bmQgYWZ0ZXIgdGhlIG90aGVyXG5cdCAqIEBjbGFzcyBTb3VuZFF1ZXVlXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge0FycmF5fSBMaXN0IG9mIEF1ZGlvIHRvIHBsYXlcblx0ICovXG5cdGZ1bmN0aW9uIFNvdW5kUXVldWUobGlzdCkge1xuXHRcdHRoaXMuc291bmRzID0gbGlzdDtcblx0XHR0aGlzLmN1cnJlbnRTb3VuZEluZGV4ID0gMDtcblx0XHR0aGlzLnNvdW5kc1swXS5wbGF5KCk7XG5cdH1cblxuXHRTb3VuZFF1ZXVlLnByb3RvdHlwZSA9IHtcblxuXHRcdG9uTG9vcDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdGlmICggdGhpcy5zb3VuZHNbdGhpcy5jdXJyZW50U291bmRJbmRleF0uZW5kZWQgKSB7XG5cblx0XHRcdFx0dGhpcy5jdXJyZW50U291bmRJbmRleCsrO1xuXG5cdFx0XHRcdGlmICggdGhpcy5jdXJyZW50U291bmRJbmRleCA8IHRoaXMuc291bmRzLmxlbmd0aCApIHtcblx0XHRcdFx0XHR0aGlzLnNvdW5kc1t0aGlzLmN1cnJlbnRTb3VuZEluZGV4XS5wbGF5KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0TS5yZW1vdmUodGhpcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH07XG5cdFxuXHQvKipcblx0ICogQGNsYXNzIHNvdW5kXG5cdCAqL1xuXG5cdC8qKlxuXHQgKiBBZGRzIGEgZmFkZSBvdXQgZWZmZWN0IHRvIE1hdGNoIGxvb3AgbGlzdC4gU2hvcnRoYW5kIGZvciBTb3VuZEZhZGVPdXRcblx0ICogQG1ldGhvZCBhZGRGYWRlT3V0XG5cdCAqIEBwYXJhbSB7QXVkaW99IGF1ZGlvT2JqZWN0IHNvdW5kIHRvIGZhZGUgb3V0XG5cdCAqIEBwYXJhbSB7aW50fSBtaW4gZmluYWwgdm9sdW1lIC0gaWYgbm8gcHJvdmlkZWQgdGhlIHNvdW5kIHdpbGwgc3RvcCBwbGF5aW5nIGFmdGVyIGJlaW5nIGZhZGVkXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGRGYWRlT3V0KGF1ZGlvT2JqZWN0LCBtaW4pIHtcblx0XHRNLnB1c2gobmV3IFNvdW5kRmFkZU91dChhdWRpb09iamVjdCwgbWluKSk7XG5cdH0gICAgXG5cblx0LyoqXG5cdCAqIEFkZHMgYSBmYWRlIGluIGVmZmVjdCB0byBNYXRjaCBsb29wIGxpc3QuIFNob3J0aGFuZCBmb3IgU291bmRGYWRlSW5cblx0ICogQG1ldGhvZCBhZGRGYWRlSW5cblx0ICogQHBhcmFtIHtBdWRpb30gYXVkaW9PYmplY3Qgc291bmQgdG8gZmFkZSBpblxuXHQgKiBAcGFyYW0ge2ludH0gbWF4IGZpbmFsIHZvbHVtZVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRkRmFkZUluKGF1ZGlvT2JqZWN0LCBtYXgpIHtcblx0XHRNLnB1c2gobmV3IFNvdW5kRmFkZUluKGF1ZGlvT2JqZWN0LCBtYXgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgc291bmQgdHJhbnNpdGlvbiBlZmZlY3QgdG8gTWF0Y2ggbG9vcCBsaXN0LiBTaG9ydGhhbmQgZm9yIFRyYW5zaXRpb25cblx0ICogQG1ldGhvZCBhZGRTb3VuZFRyYW5zaXRpb25cblx0ICogQHBhcmFtIHtBdWRpb30gc291bmRGcm9tIHNvdW5kIHRvIGZhZGUgb3V0XG5cdCAqIEBwYXJhbSB7QXVkaW99IHNvdW5kVG8gc291bmQgdG8gZmFkZSBpblxuXHQgKiBAcGFyYW0ge2ludH0gbWF4Vm9sdW1lIGZpbmFsIHZvbHVtZSBvZiB0aGUgZmFkZWQgaW4gc291bmRcblx0ICovXG5cdGZ1bmN0aW9uIGFkZFNvdW5kVHJhbnNpdGlvbihzb3VuZEZyb20sIHNvdW5kVG8sIG1heFZvbHVtZSkge1xuXHRcdE0ucHVzaChuZXcgVHJhbnNpdGlvbihzb3VuZEZyb20sIHNvdW5kVG8sIG1heFZvbHVtZSkpO1xuXHR9XG5cdC8qKlxuXHQgKiBGYWRlIG91dCBhIHNvdW5kIGFuZCBwbGF5cyB0aGUgb3RoZXIuIEFmdGVyIGZpbmlzaGluZyBmYWRlcyBpbiB0aGUgcHJldmlvdXMgc291bmQgdG8gaXRzIG9yaWdpbmFsIHZvbHVtZS4gU2hvcnRoYW5kIGZvciBTb3VuZE92ZXJcblx0ICogQG1ldGhvZCBhZGRTb3VuZE92ZXJcblx0ICogQHBhcmFtIHtBdWRpb30gc291bmRGcm9tIHNvdW5kIHRvIGxvd2VyXG5cdCAqIEBwYXJhbSB7QXVkaW99IHNvdW5kVG8gc291bmQgdG8gcGxheVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRkU291bmRPdmVyKHNvdW5kRnJvbSwgc291bmRUbykge1xuXHRcdE0ucHVzaChuZXcgU291bmRPdmVyKHNvdW5kRnJvbSwgc291bmRUbykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWFzZSBhIHNvdW5kIHF1ZXVlLiBTaG9ydGhhbmQgZm9yIFNvdW5kUXVldWVcblx0ICogQG1ldGhvZCBhZGRTb3VuZFF1ZXVlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IExpc3Qgb2YgQXVkaW8gdG8gcGxheVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRkU291bmRRdWV1ZShsaXN0KSB7XG5cdFx0TS5wdXNoKG5ldyBTb3VuZFF1ZXVlKGxpc3QpKTtcblx0fVxuXG5cdG5hbWVzcGFjZS5zb3VuZCA9IHtcblx0XHRmYWRlT3V0OiBhZGRGYWRlT3V0LFxuXHRcdGZhZGVJbjogYWRkRmFkZUluLFxuXHRcdHRyYW5zaXRpb246IGFkZFNvdW5kVHJhbnNpdGlvbixcblx0XHRzb3VuZE92ZXI6IGFkZFNvdW5kVHJhbnNpdGlvbixcblx0XHRzb3VuZFF1ZXVlOiBhZGRTb3VuZFF1ZXVlXG5cdH07XG5cbn0pKCBNLmVmZmVjdHMgfHwgKCBNLmVmZmVjdHMgPSB7fSApLCBNICk7IiwiKGZ1bmN0aW9uKE0sIG5hbWVzcGFjZSkge1xuXG5cdGZ1bmN0aW9uIEFsbHZzQWxsQ29sbGlzaW9uSGFuZGxlciggbW9kZSApIHtcblxuXHRcdHRoaXMub2JqZWN0cyA9IFtdO1xuXG5cdFx0dGhpcy5tb2RlID0gbnVsbDtcblxuXHRcdHRoaXMuc2V0TW9kZSggbW9kZSB8fCBcIlBvbHlnb25cIiApO1xuXG5cdH1cblxuXHRBbGx2c0FsbENvbGxpc2lvbkhhbmRsZXIucHJvdG90eXBlID0ge1xuXG5cdFx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5vYmplY3RzID0gW107XG5cdFx0fSxcblxuXHRcdG9uTG9vcDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBpID0gMCwgaiA9IDE7XG5cblx0XHRcdHdoaWxlICggaSA8IHRoaXMub2JqZWN0cy5sZW5ndGggKSB7XG5cblx0XHRcdFx0d2hpbGUgKCBqIDwgdGhpcy5vYmplY3RzLmxlbmd0aCApIHtcblx0XHRcdFx0XHR0aGlzLmNoZWNrQ29sbGlzaW9ucyggdGhpcy5vYmplY3RzW2ldLCB0aGlzLm9iamVjdHNbal0gKTtcblx0XHRcdFx0XHRqKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aSsrO1xuXHRcdFx0XHRqID0gaSArIDE7XG5cblx0XHRcdH1cblxuXHRcdFx0aSA9IHRoaXMub2JqZWN0cy5sZW5ndGg7XG5cblx0XHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0XHRpZiAoICEgdGhpcy5vYmplY3RzW2ldLl92aXNpYmxlICkge1xuXHRcdFx0XHRcdE0ucmVtb3ZlSW5kZXhGcm9tQXJyYXkoIGksIHRoaXMub2JqZWN0cyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0Y2FuQ29sbGlkZTogZnVuY3Rpb24oIGNvbGxpZGVyLCBjb2xsaWRhYmxlICl7XG5cblx0XHRcdGlmICggY29sbGlkZXIuY2FudENvbGxpZGVUeXBlICApIHtcblxuXHRcdFx0XHR2YXIgaSA9IGNvbGxpZGVyLmNhbnRDb2xsaWRlVHlwZS5sZW5ndGg7XG5cblx0XHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHRcdFx0aWYgKCBjb2xsaWRhYmxlIGluc3RhbmNlb2YgY29sbGlkZXIuY2FudENvbGxpZGVUeXBlW2ldICkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHRcblx0XHRcdGlmICggY29sbGlkZXIuY2FudENvbGxpZGUgKSB7XG5cblx0XHRcdFx0dmFyIGkgPSBjb2xsaWRlci5jYW50Q29sbGlkZS5sZW5ndGg7XG5cblx0XHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHRcdFx0aWYgKCBjb2xsaWRlci5jYW50Q29sbGlkZVtpXSA9PSBjb2xsaWRhYmxlICkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9LFxuXG5cdFx0Y2hlY2tDb2xsaXNpb25zOiBmdW5jdGlvbihjb2xsaWRlciwgY29sbGlkYWJsZSkge1xuXG5cdFx0XHRpZiAoICEgdGhpcy5jYW5Db2xsaWRlKCBjb2xsaWRlciwgY29sbGlkYWJsZSApICkgcmV0dXJuO1xuXHRcdFx0aWYgKCAhIHRoaXMuY2FuQ29sbGlkZSggY29sbGlkYWJsZSwgY29sbGlkZXIgKSApIHJldHVybjtcblxuXHRcdFx0aWYgKCB0aGlzLm1vZGUuaGF2ZUNvbGxpZGVkKCBjb2xsaWRlciwgY29sbGlkYWJsZSApICkge1xuXG5cdFx0XHRcdGlmICggY29sbGlkZXIub25Db2xsaXNpb24gKSB7XG5cdFx0XHRcdFx0Y29sbGlkZXIub25Db2xsaXNpb24oIGNvbGxpZGFibGUgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbGxpZGFibGUub25Db2xsaXNpb24gKSB7XG5cdFx0XHRcdFx0Y29sbGlkYWJsZS5vbkNvbGxpc2lvbiggY29sbGlkZXIgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQHBhcmFtIFRoZSBjb2xsaXNpb24gbW9kZSBmcm9tIG5hbWVzcGFjZS5jb2xsaXNpb25zXG5cdFx0ICovXG5cdFx0c2V0TW9kZTogZnVuY3Rpb24obW9kZSwgcHJvcGVydGllcykge1xuXG5cdFx0XHRpZiAoIHR5cGVvZiBtb2RlID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0XHR0aGlzLm1vZGUgPSBNLmNvbGxpc2lvbnNbbW9kZV07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vZGUgPSBtb2RlO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHB1c2g6IGZ1bmN0aW9uKCBvYmplY3QgKSB7XG5cdFx0XHR0aGlzLm9iamVjdHMucHVzaCggb2JqZWN0ICk7XG5cdFx0fSxcblxuXHRcdHJlbW92ZVR5cGU6IGZ1bmN0aW9uKCB0eXBlICkge1xuXG5cdFx0XHR2YXIgaSA9IHRoaXMub2JqZWN0cy5sZW5ndGg7XG5cblx0XHRcdHdoaWxlICggaS0tICkge1xuXHRcdFx0XHRpZiAoIHRoaXMub2JqZWN0c1tpXSBpbnN0YW5jZW9mIHR5cGUgKSB7XG5cdFx0XHRcdFx0dGhpcy5yZW1vdmUoIHRoaXMub2JqZWN0c1tpXSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fTtcblxuXHRuYW1lc3BhY2UuQWxsdnNBbGxDb2xsaXNpb25IYW5kbGVyID0gQWxsdnNBbGxDb2xsaXNpb25IYW5kbGVyO1xuXHRcbn0pKHdpbmRvdy5NYXRjaCwgd2luZG93Lk1hdGNoLmNvbGxpc2lvbnMgfHwgKCB3aW5kb3cuTWF0Y2guY29sbGlzaW9ucyA9IHt9ICkgKTsiLCIoZnVuY3Rpb24oTSwgbmFtZXNwYWNlKSB7XG5cblx0ZnVuY3Rpb24gQ29sbGlzaW9uSGFuZGxlcihtb2RlKSB7XG5cblx0XHR0aGlzLmNvbGxpZGVycyA9IFtdO1xuXG5cdFx0dGhpcy5jb2xsaWRhYmxlcyA9IFtdO1xuXG5cdFx0dGhpcy5zZXRNb2RlKCBtb2RlIHx8IFwiUG9seWdvblwiICk7XG5cblx0XHR0aGlzLmNvbGxpZGVyQ2FsbGJhY2sgPSBcIm9uQ29sbGlzaW9uXCI7XG5cblx0XHR0aGlzLmNvbGxpZGFibGVDYWxsYmFjayA9IFwib25Db2xsaXNpb25cIjtcblxuXHR9XG5cblx0Q29sbGlzaW9uSGFuZGxlci5wcm90b3R5cGUgPSB7XG5cblx0XHRvbkxvb3A6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgaSA9IHRoaXMuY29sbGlkZXJzLmxlbmd0aDtcblxuXHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHRcdHRoaXMuY2hlY2tDb2xsaXNpb25zKCB0aGlzLmNvbGxpZGVyc1tpXSwgdGhpcy5jb2xsaWRhYmxlcyApO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdGNoZWNrQ29sbGlzaW9uczogZnVuY3Rpb24oY29sbGlkZXIsIGxpc3QpIHtcblxuXHRcdFx0aWYgKCAhIGNvbGxpZGVyICkgcmV0dXJuO1xuXG5cdFx0XHR2YXIgaSA9IGxpc3QubGVuZ3RoLCBjb2xsaWRhYmxlID0gbnVsbDtcblxuXHRcdFx0d2hpbGUgKCBpLS0gKSB7XG5cblx0XHRcdFx0Y29sbGlkYWJsZSA9IGxpc3RbaV07XG5cblx0XHRcdFx0aWYgKCAhIGNvbGxpZGFibGUgKSByZXR1cm47XG5cblx0XHRcdFx0aWYgKCBjb2xsaWRhYmxlIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cblx0XHRcdFx0XHR0aGlzLmNoZWNrQ29sbGlzaW9ucyggY29sbGlkZXIsIGNvbGxpZGFibGUgKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKCB0aGlzLm1vZGUuaGF2ZUNvbGxpZGVkKCBjb2xsaWRlciwgY29sbGlkYWJsZSApICkge1xuXG5cdFx0XHRcdFx0aWYgKCBjb2xsaWRlclt0aGlzLmNvbGxpZGVyQ2FsbGJhY2tdICkge1xuXHRcdFx0XHRcdFx0Y29sbGlkZXJbdGhpcy5jb2xsaWRlckNhbGxiYWNrXSggY29sbGlkYWJsZSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIGNvbGxpZGFibGVbdGhpcy5jb2xsaWRhYmxlQ2FsbGJhY2tdICkge1xuXHRcdFx0XHRcdFx0Y29sbGlkYWJsZVt0aGlzLmNvbGxpZGFibGVDYWxsYmFja10oIGNvbGxpZGVyICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBwYXJhbSBUaGUgY29sbGlzaW9uIG1vZGUgZnJvbSBuYW1lc3BhY2UuY29sbGlzaW9uc1xuXHRcdCAqL1xuXHRcdHNldE1vZGU6IGZ1bmN0aW9uKG1vZGUpIHtcblxuXHRcdFx0aWYgKCB0eXBlb2YgbW9kZSA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0dGhpcy5tb2RlID0gTS5jb2xsaXNpb25zW21vZGVdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb2RlID0gbW9kZTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9O1xuXG5cdG5hbWVzcGFjZS5Db2xsaXNpb25IYW5kbGVyID0gQ29sbGlzaW9uSGFuZGxlcjtcblx0XG59KSh3aW5kb3cuTWF0Y2gsIHdpbmRvdy5NYXRjaC5jb2xsaXNpb25zIHx8ICggd2luZG93Lk1hdGNoLmNvbGxpc2lvbnMgPSB7fSApICk7IiwiKGZ1bmN0aW9uKG5hbWVzcGFjZSwgbWF0aDJkKSB7XG5cblx0LyoqXG5cdCAqIFNxdWFyZSB3aXRoIHJheSBjYXN0aW5nIGNvbGxpc2lvbiBkZXRlY3Rpb25cblx0ICogT25jZSB0aGUgb2JqZWN0IGlzIGluc2lkZSB0aGUgc3F1YXJlIHJheSBjYXN0aW5nIGlzIGFwcGxpZWQgZm9yIFxuXHQgKiBtb3JlIGFjY3VyYXRlIGRldGVjdGlvbiBvbiB0aGUgaW5uZXIgcmVjdGFuZ3VsYXIgb2JqZWN0LlxuXHQgKiBUaGlzIGlzIHRoZSBtb3N0IGFjY3VyYXRlIGRldGVjdGlvbiBtZXRob2QgYnV0IGFsc28gdGhlIG1vc3Rcblx0ICogcHJvY2Vzc2luZyB0aW1lIGNvbnN1bWluZ1xuXHQgKi9cblx0ZnVuY3Rpb24gUG9seWdvbigpIHtcblx0XHR0aGlzLm1hdGgyZCA9IG1hdGgyZDtcblx0fVxuXG5cdFBvbHlnb24ucHJvdG90eXBlID0ge1xuXG5cdFx0Z2V0Q29sbGlzaW9uQXJlYTogZnVuY3Rpb24ocmVuZGVyaXphYmxlKSB7XG5cblx0XHRcdHZhciB2ZXJ0aWNlcyA9IFtdLFxuXHRcdFx0XHRoYWxmV2lkdGggPSByZW5kZXJpemFibGUuZ2V0V2lkdGgoKSAvIDIsXG4gICAgICAgICAgICAgICAgaGFsZkhlaWdodCA9IHJlbmRlcml6YWJsZS5nZXRIZWlnaHQoKSAvIDI7XG5cblx0XHRcdHZlcnRpY2VzLnB1c2goeyB4OiAtaGFsZldpZHRoLCB5OiAtaGFsZkhlaWdodCB9KTtcblx0XHRcdHZlcnRpY2VzLnB1c2goeyB4OiBoYWxmV2lkdGgsIHk6IC1oYWxmSGVpZ2h0IH0pO1xuXHRcdFx0dmVydGljZXMucHVzaCh7IHg6IGhhbGZXaWR0aCwgeTogaGFsZkhlaWdodCB9KTtcblx0XHRcdHZlcnRpY2VzLnB1c2goeyB4OiAtaGFsZldpZHRoLCB5OiBoYWxmSGVpZ2h0IH0pO1xuICAgICAgICAgICAgXG5cdFx0XHR0aGlzLnJvdGF0ZSh2ZXJ0aWNlcywgcmVuZGVyaXphYmxlLl9yb3RhdGlvbik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKHZlcnRpY2VzLCByZW5kZXJpemFibGUuX3gsIHJlbmRlcml6YWJsZS5feSk7XG5cblx0XHRcdHJldHVybiB2ZXJ0aWNlcztcblxuXHRcdH0sXG5cblx0XHR0cmFuc2xhdGU6IGZ1bmN0aW9uKHZlcnRpY2VzLCB4LCB5KSB7XG5cdFx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcblx0XHRcdFx0dmVydGljZXNbaV0ueCArPSB4O1xuXHRcdFx0XHR2ZXJ0aWNlc1tpXS55ICs9IHk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHJvdGF0ZTogZnVuY3Rpb24odmVydGljZXMsIGFuZ2xlKSB7XG5cdFx0XHRpZiAoICEgYW5nbGUgKSByZXR1cm47XG5cdFx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcblx0XHRcdFx0dmVydGljZXNbaV0gPSB0aGlzLm1hdGgyZC5nZXRSb3RhdGVkVmVydGV4KHZlcnRpY2VzW2ldLCBhbmdsZSk7XG5cdFx0XHR9XG5cdFx0fSwgICAgICAgIFxuXG5cdFx0aGF2ZUNvbGxpZGVkOiBmdW5jdGlvbihjb2xsaWRlciwgY29sbGlkYWJsZSkge1xuXG5cdFx0XHR2YXIgY29sbGlkYWJsZVZlcnRpY2VzID0gdGhpcy5nZXRDb2xsaXNpb25BcmVhKGNvbGxpZGFibGUpLFxuXHRcdFx0XHRjb2xsaWRlclZlcnRpY2VzID0gIHRoaXMuZ2V0Q29sbGlzaW9uQXJlYShjb2xsaWRlciksXG5cdFx0XHRcdGkgPSAwO1xuXG5cdFx0XHRmb3IgKCA7IGkgPCBjb2xsaWRlclZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0XHRpZiAoIHRoaXMucG9pbnRJblBvbHlnb24oIGNvbGxpZGVyVmVydGljZXNbaV0ueCwgY29sbGlkZXJWZXJ0aWNlc1tpXS55LCBjb2xsaWRhYmxlVmVydGljZXMgKSApIHJldHVybiB0cnVlO1xuXHRcdFx0XHRpZiAoIHRoaXMucG9pbnRJblBvbHlnb24oIGNvbGxpZGFibGVWZXJ0aWNlc1tpXS54LCBjb2xsaWRhYmxlVmVydGljZXNbaV0ueSwgY29sbGlkZXJWZXJ0aWNlcyApICkgcmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH0sXG5cblx0XHRwb2ludEluUG9seWdvbjogZnVuY3Rpb24oeCwgeSwgdmVydGljZXMpIHtcblxuXHRcdFx0dmFyIGksIGosIGMgPSBmYWxzZSwgbnZlcnQgPSB2ZXJ0aWNlcy5sZW5ndGgsIHZpLCB2ajtcblxuXHRcdFx0Zm9yICggaSA9IDAsIGogPSBudmVydC0xOyBpIDwgbnZlcnQ7IGogPSBpKysgKSB7XG5cdFx0XHRcblx0XHRcdFx0dmkgPSB2ZXJ0aWNlc1tpXTtcblx0XHRcdFx0dmogPSB2ZXJ0aWNlc1tqXTtcblx0XHRcdFxuXHRcdFx0XHRpZiAoICggKCB2aS55ID4geSApICE9ICggdmoueSA+IHkgKSApICYmICggeCA8ICggdmoueCAtIHZpLnggKSAqICggeSAtIHZpLnkgKSAvICggdmoueSAtIHZpLnkgKSArIHZpLnggKSApIHtcblx0XHRcdFx0XHRjID0gIWM7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYztcblxuXHRcdH1cblxuXHR9O1xuXG5cdG5hbWVzcGFjZS5Qb2x5Z29uID0gbmV3IFBvbHlnb24oKTtcblx0XG59KSh3aW5kb3cuTWF0Y2guY29sbGlzaW9ucyB8fCAoIHdpbmRvdy5NYXRjaC5jb2xsaXNpb25zID0ge30gKSwgd2luZG93Lk1hdGNoLm1hdGgyZCApOyIsIihmdW5jdGlvbihuYW1lc3BhY2UpIHtcblxuXHQvKipcblx0ICogU3F1YXJlIGNvbGxpc2lvbiBkZXRlY3Rpb25cblx0ICogVXNlcyB0aGUgbWF4IHNpemUgb2YgdGhlIG9iamVjdCB0byBnZW5lcmF0ZSBhIHNxdWFyZSBjZW50ZXJlZCBhdCB0aGUgY2VudGVyXG5cdCAqIG9mIHRoZSBvYmplY3Rcblx0ICovXG5cdGZ1bmN0aW9uIFNxdWFyZSgpIHtcblx0fVxuXG5cdFNxdWFyZS5wcm90b3R5cGUgPSB7XG5cblx0XHRoYXZlQ29sbGlkZWQ6IGZ1bmN0aW9uKGNvbGxpZGVyLCBjb2xsaWRhYmxlKSB7XG5cblx0XHRcdHZhciBzaXplVGhpcyA9IDAsIHNpemVPYmogPSAwO1xuXG5cdFx0XHRpZiAoIGNvbGxpZGVyLl9oYWxmV2lkdGggPiBjb2xsaWRlci5faGFsZkhlaWdodCApIHtcblx0XHRcdFx0c2l6ZVRoaXMgPSBjb2xsaWRlci5faGFsZldpZHRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2l6ZVRoaXMgPSBjb2xsaWRlci5faGFsZkhlaWdodDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjb2xsaWRhYmxlLl9oYWxmV2lkdGggPiBjb2xsaWRhYmxlLl9oYWxmSGVpZ2h0ICkge1xuXHRcdFx0XHRzaXplT2JqID0gY29sbGlkYWJsZS5faGFsZldpZHRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2l6ZU9iaiA9IGNvbGxpZGFibGUuX2hhbGZIZWlnaHQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggY29sbGlkZXIuX3kgKyBzaXplVGhpcyA8IGNvbGxpZGFibGUuX3kgLSBzaXplT2JqICkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0aWYgKCBjb2xsaWRlci5feSAtIHNpemVUaGlzID4gY29sbGlkYWJsZS5feSArIHNpemVPYmogKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRpZiAoIGNvbGxpZGVyLl94ICsgc2l6ZVRoaXMgPCBjb2xsaWRhYmxlLl94IC0gc2l6ZU9iaiApIHJldHVybiBmYWxzZTtcblx0XHRcdGlmICggY29sbGlkZXIuX3ggLSBzaXplVGhpcyA+IGNvbGxpZGFibGUuX3ggKyBzaXplT2JqICkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdG5hbWVzcGFjZS5TcXVhcmUgPSBuZXcgU3F1YXJlKCk7XG5cbn0pKHdpbmRvdy5NYXRjaC5jb2xsaXNpb25zIHx8ICggd2luZG93Lk1hdGNoLmNvbGxpc2lvbnMgPSB7fSApKTsiLCIoZnVuY3Rpb24obmFtZXNwYWNlLCBtYXRoMmQpIHtcblxuXHQvKipcblx0ICogUmFkaWFsIGNvbGxpc2lvbiBkZXRlY3Rpb25cblx0ICogVXNlcyB0aGUgcmFkaXVzIHByb3ZpZGVkIHRvIGNvbXBhcmUgaXQgdG8gdGhlIG90aGVyIG9iamVjdHMgcmFkaXVzXG5cdCAqL1xuXHRmdW5jdGlvbiBSYWRpYWwocmFkaXVzKSB7XG5cdFx0dGhpcy5tYXRoMmQgPSBtYXRoMmQ7XG5cdH1cblxuXHRSYWRpYWwucHJvdG90eXBlID0ge1xuXG5cdFx0aGF2ZUNvbGxpZGVkOiBmdW5jdGlvbihjb2xsaWRlciwgY29sbGlkYWJsZSkge1xuXG5cdFx0XHR2YXIgY29sbGlkZXJyYWRpdXMgPSAoIGNvbGxpZGVyLmdldFdpZHRoKCkgKiBjb2xsaWRlci5nZXRIZWlnaHQoKSApIC8gMixcblx0XHRcdFx0Y29sbGlkYWJsZXJhZGl1cyA9ICggY29sbGlkYWJsZS5nZXRXaWR0aCgpICogY29sbGlkYWJsZS5nZXRIZWlnaHQoKSApIC8gMixcblx0XHRcdFx0cmFkaXVzID0gY29sbGlkZXJyYWRpdXMgPCBjb2xsaWRhYmxlcmFkaXVzID8gY29sbGlkZXJyYWRpdXMgOiBjb2xsaWRhYmxlcmFkaXVzO1xuXG5cdFx0XHRyZXR1cm4gdGhpcy5tYXRoMmQuZ2V0U3F1YXJlRGlzdGFuY2UoIGNvbGxpZGVyLmdldExvY2F0aW9uKCksIGNvbGxpZGFibGUuZ2V0TG9jYXRpb24oKSApIDw9IHJhZGl1cyAqIHJhZGl1cztcblxuXHRcdH1cblxuXHR9O1xuXG5cdG5hbWVzcGFjZS5SYWRpYWwgPSBuZXcgUmFkaWFsKCk7XG5cdFxufSkod2luZG93Lk1hdGNoLmNvbGxpc2lvbnMgfHwgKCB3aW5kb3cuTWF0Y2guY29sbGlzaW9ucyA9IHt9ICksIHdpbmRvdy5NYXRjaC5tYXRoMmQgKTsiLCIoZnVuY3Rpb24obmFtZXNwYWNlKSB7XG5cblx0ZnVuY3Rpb24gU2ltcGxlKCkge1xuXHR9XG5cblx0U2ltcGxlLnByb3RvdHlwZSA9IHtcblx0XG5cdFx0aGF2ZUNvbGxpZGVkOiBmdW5jdGlvbihjb2xsaWRlciwgY29sbGlkYWJsZSkge1xuXG5cdFx0XHRpZiAoIGNvbGxpZGVyLmdldEJvdHRvbSgpIDwgY29sbGlkYWJsZS5nZXRUb3AoKSApIHJldHVybiBmYWxzZTtcblx0XHRcdGlmICggY29sbGlkZXIuZ2V0VG9wKCkgPiBjb2xsaWRhYmxlLmdldEJvdHRvbSgpICkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0aWYgKCBjb2xsaWRlci5nZXRSaWdodCgpIDwgY29sbGlkYWJsZS5nZXRMZWZ0KCkgKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRpZiAoIGNvbGxpZGVyLmdldExlZnQoKSA+IGNvbGxpZGFibGUuZ2V0UmlnaHQoKSApIHJldHVybiBmYWxzZTtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9XG5cblx0fTtcblxuXHRuYW1lc3BhY2UuU2ltcGxlID0gbmV3IFNpbXBsZSgpO1xuXHRcbn0pKHdpbmRvdy5NYXRjaC5jb2xsaXNpb25zIHx8ICggd2luZG93Lk1hdGNoLmNvbGxpc2lvbnMgPSB7fSApKTsiLCIoZnVuY3Rpb24oTSwgbmFtZXNwYWNlKSB7XG5cblx0ZnVuY3Rpb24gUGl4ZWxQZXJmZWN0KCkge1xuXHRcdHRoaXMudGVzdENvbnRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLmdldENvbnRleHQoXCIyZFwiKTtcblx0fVxuXG5cdFBpeGVsUGVyZmVjdC5wcm90b3R5cGUuaGF2ZUNvbGxpZGVkID0gZnVuY3Rpb24oIGNvbGxpZGVyLCBjb2xsaWRhYmxlICkge1xuXG5cdFx0dmFyIGZyb250Q2FudmFzID0gTS5mcm9udEJ1ZmZlci5jYW52YXMsXG5cdFx0XHRtYXRoID0gd2luZG93Lk1hdGgsXG5cdFx0XHRtaW5YID0gbWF0aC5taW4oY29sbGlkZXIuZ2V0TGVmdCgpLCBjb2xsaWRhYmxlLmdldExlZnQoKSksXG5cdFx0XHRtaW5ZID0gbWF0aC5taW4oY29sbGlkZXIuZ2V0VG9wKCksIGNvbGxpZGFibGUuZ2V0VG9wKCkpLFxuXHRcdFx0d2lkdGggPSBtYXRoLm1heChjb2xsaWRlci5nZXRSaWdodCgpLCBjb2xsaWRhYmxlLmdldFJpZ2h0KCkpIC0gbWluWCxcblx0XHRcdGhlaWdodCA9IG1hdGgubWF4KGNvbGxpZGVyLmdldEJvdHRvbSgpLCBjb2xsaWRhYmxlLmdldEJvdHRvbSgpKSAtIG1pblksXG5cdFx0XHRjb250ZXh0ID0gdGhpcy50ZXN0Q29udGV4dCxcblx0XHRcdGNvbHVtbiA9IDAsXG5cdFx0XHRyb3cgPSAwLFxuXHRcdFx0aW1hZ2VEYXRhO1xuXG5cdFx0Y29udGV4dC5jbGVhclJlY3QoIG1pblgsIG1pblksIHdpZHRoLCBoZWlnaHQgKTtcblxuXHRcdGNvbnRleHQuc2F2ZSgpO1xuXHRcdGNvbGxpZGVyLm9uUmVuZGVyKGNvbnRleHQsIGNvbnRleHQuY2FudmFzLCAwLCAwKTtcblx0XHRjb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IFwic291cmNlLWluXCI7XG5cdFx0Y29sbGlkYWJsZS5vblJlbmRlcihjb250ZXh0LCBjb250ZXh0LmNhbnZhcywgMCwgMCk7XG5cdFx0Y29udGV4dC5yZXN0b3JlKCk7XG5cblx0XHRpbWFnZURhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSggbWluWCwgbWluWSwgd2lkdGgsIGhlaWdodCApO1xuXG5cdFx0d2hpbGUoIGNvbHVtbiA8IGltYWdlRGF0YS53aWR0aCApIHtcblxuXHRcdFx0d2hpbGUoIHJvdyA8IGltYWdlRGF0YS5oZWlnaHQgKSB7XG5cblx0XHRcdFx0dmFyIG9mZnNldCA9ICggcm93ICogaW1hZ2VEYXRhLndpZHRoICsgY29sdW1uICkgKiA0O1xuXG5cdFx0XHRcdGlmICggaW1hZ2VEYXRhLmRhdGFbIG9mZnNldCArIDMgXSAhPSAwICkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cm93Kys7XG5cblx0XHRcdH1cblxuXHRcdFx0Y29sdW1uKys7XG5cdFx0XHRyb3cgPSAwO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH07XG5cblx0bmFtZXNwYWNlLlBpeGVsUGVyZmVjdCA9IG5ldyBQaXhlbFBlcmZlY3QoKTtcblxufSkod2luZG93Lk1hdGNoLCB3aW5kb3cuTWF0Y2guY29sbGlzaW9ucyB8fCAoIHdpbmRvdy5NYXRjaC5jb2xsaXNpb25zID0ge30gKSApOyIsIi8qKlxuICogQG1vZHVsZSBNYXRjaFxuICogQHN1Ym1vZHVsZSBpbnB1dFxuICovXG4oZnVuY3Rpb24oTSkge1xuXG5cdHZhciBpbnN0YW5jZTtcblxuXHRmdW5jdGlvbiBtb3VzZURvd25IZWxwZXIoZSkge1xuXHRcdGluc3RhbmNlLm1vdXNlZG93bihlKTtcblx0fVxuXHRmdW5jdGlvbiBtb3VzZVVwSGVscGVyKGUpIHtcblx0XHRpbnN0YW5jZS5tb3VzZXVwKGUpO1xuXHR9XG5cdGZ1bmN0aW9uIG1vdXNlQ2xpY2tIZWxwZXIoZSkge1xuXHRcdGluc3RhbmNlLmNsaWNrKGUpO1xuXHR9XG5cdGZ1bmN0aW9uIG1vdXNlTW92ZUhlbHBlcihlKSB7XG5cdFx0aW5zdGFuY2UubW91c2Vtb3ZlKGUpO1xuXHR9XG5cdGZ1bmN0aW9uIG1vdXNlV2hlZWxIZWxwZXIoZSkge1xuXHRcdGluc3RhbmNlLm1vdXNld2hlZWwoZSk7XG5cdH1cblx0ZnVuY3Rpb24gbW91c2VXaGVlbEhlbHBlckZpcmVGb3goZSkge1xuXHRcdGluc3RhbmNlLkRPTU1vdXNlU2Nyb2xsKGUpO1xuXHR9XG5cdGZ1bmN0aW9uIGNvbnRleHRNZW51SGVscGVyKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdH1cblxuXHQvKipcblx0ICogUHJvdmlkZXMgbW91c2Ugc3VwcG9ydC5cblx0ICogVGhpcyBjbGFzcyBpcyBhdXRvbWF0aWNhbGx5IGJpbmRlZCB0byBNYXRjaCBpZiB0aGlzIGZpbGUgaXMgaW5jbHVkZWQuIENhbiBiZSBhY2Nlc3NlZCBieSBNLmtleWJvYXJkXG5cdCAqIEBjbGFzcyBNb3VzZVxuXHQgKiBAbmFtZXNwYWNlIGlucHV0XG5cdCAqIEBzdGF0aWNcblx0ICovXG5cdGZ1bmN0aW9uIE1vdXNlKCkge1xuXHRcdC8qKlxuXHRcdCAqIE9iamVjdCB0aGF0IGNvbnRhaW5zIG1vdXNlIGV2ZW50cyBmb3IgdGhlIGV4aXN0aW5nIGJ1dHRvbnNcblx0XHQgKiBAcHJvcGVydHkgTEVGVFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0dGhpcy5ldmVudHMgPSB7XG5cdFx0XHQwOiB7fSxcblx0XHRcdDE6IHt9LFxuXHRcdFx0Mjoge31cblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIHggY29vcmRpbmF0ZSBvZiB0aGUgbW91c2Vcblx0XHQgKiBAcHJvcGVydHkgeFxuXHRcdCAqIEB0eXBlIGludFxuXHRcdCAqL1xuXHRcdHRoaXMueCA9IG51bGw7XG5cdFx0LyoqXG5cdFx0ICogeSBjb29yZGluYXRlIG9mIHRoZSBtb3VzZVxuXHRcdCAqIEBwcm9wZXJ0eSB5XG5cdFx0ICogQHR5cGUgaW50XG5cdFx0ICovXG5cdFx0dGhpcy55ID0gbnVsbDtcblx0XHQvKipcblx0XHQgKiBJbmRpY2F0ZXMgd2hldGhlciBkcmFnZ2luIGlzIHRha2luZyBwbGFjZSBvciBub3Rcblx0XHQgKiBAcHJvcGVydHkgaXNEcmFnZ2luZ1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHR5cGUgQm9vbGVhblxuXHRcdCAqL1xuXHRcdHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuXG5cdH1cblxuXHQvKipcblx0ICogTGVmdCBtb3VzZSBidXR0b25cblx0ICogQHByb3BlcnR5IExFRlRcblx0ICogQGZpbmFsXG5cdCAqIEB0eXBlIGludFxuXHQgKi9cblx0TW91c2UucHJvdG90eXBlLkxFRlQgPSAwO1xuXHQvKipcblx0ICogTWlkZGxlIG1vdXNlIGJ1dHRvblxuXHQgKiBAcHJvcGVydHkgTUlERExFXG5cdCAqIEBmaW5hbFxuXHQgKiBAdHlwZSBpbnRcblx0ICovXG5cdE1vdXNlLnByb3RvdHlwZS5NSURETEUgPSAxO1xuXHQvKipcblx0ICogUmlnaHQgbW91c2UgYnV0dG9uXG5cdCAqIEBwcm9wZXJ0eSBSSUdIVFxuXHQgKiBAZmluYWxcblx0ICogQHR5cGUgaW50XG5cdCAqL1xuXHRNb3VzZS5wcm90b3R5cGUuUklHSFQgPSAyO1xuXHQvKipcblx0ICogU2V0cyB0aGUgc2VsZWN0ZWQgb2JqZWN0IGlmIHRoZXJlIGlzIG5vdCBkcmFnZ2luZyBnb2luZyBvblxuXHQgKiBAbWV0aG9kIHNlbGVjdFxuXHQgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IHRoZSBvYmplY3QgdG8gc2VsZWN0XG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRNb3VzZS5wcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24oIG9iamVjdCwgdmlldyApIHtcblxuXHRcdGlmICggISB0aGlzLmlzRHJhZ2dpbmcgKSB7XG4gICAgICBvYmplY3Quc2VsZWN0ZWRWaWV3ID0gdmlldztcblx0XHRcdHRoaXMuc2VsZWN0ZWRPYmplY3QgPSBvYmplY3Q7XG5cdFx0fVxuXG5cdH07XG5cdC8qKlxuXHQgKiBQcmV2ZW50cyB0aGUgY29udGV4dCBtZW51IGZyb20gc2hvd2luZyB1cCB3aGVuIHRoZSB1c2VyIHJpZ2h0IGNsaWNrcyBvbiB0aGUgZG9jdW1lbnRcblx0ICogQG1ldGhvZCBwcmV2ZW50Q29udGV4TWVudVxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IHZhbHVlIGJvb2xlYW4gdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdG8gcHJldmVudCBjb250ZXh0IG1lbnUgb3Igbm90XG5cdCAqL1xuXHRNb3VzZS5wcm90b3R5cGUucHJldmVudENvbnRleE1lbnUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmICggdmFsdWUgKSB7XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgY29udGV4dE1lbnVIZWxwZXIsIGZhbHNlICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCBjb250ZXh0TWVudUhlbHBlciwgZmFsc2UgKTtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBFeGVjdXRlcyB0aGUgZXZlbnRzIG9mIHRoZSBzZWxlY3RlZCBvYmplY3Rcblx0ICogQG1ldGhvZCBmaXJlRXZlbnRPbkxhc3RTZWxlY3RlZE9iamVjdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0TW91c2UucHJvdG90eXBlLmZpcmVFdmVudE9uTGFzdFNlbGVjdGVkT2JqZWN0ID0gZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgcyA9IHRoaXMuc2VsZWN0ZWRPYmplY3QsXG4gICAgICAgIHBzID0gdGhpcy5wcmV2U2VsZWN0ZWRPYmplY3Q7XG5cblx0XHRpZiAoIHMgKSB7XG5cdFx0XHRpZiAoICFzLl9tb3VzZUluUmFpc2VkICYmIHMubGlzdGVuc1RvKFwibW91c2VJblwiKSApIHtcblx0XHRcdFx0cy5fbW91c2VJblJhaXNlZCA9IHRydWU7XG5cdFx0XHRcdHMucmFpc2VFdmVudChcIm1vdXNlSW5cIiwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHBzICYmIHBzICE9IHMgKSB7XG5cdFx0XHRcdHBzLl9tb3VzZUluUmFpc2VkID0gZmFsc2U7XG5cdFx0XHRcdGlmICggcHMubGlzdGVuc1RvKFwibW91c2VPdXRcIikgKSB7XG5cdFx0XHRcdFx0cHMucmFpc2VFdmVudChcIm1vdXNlT3V0XCIsIHRoaXMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHRoaXMudXAoKSAmJiBzLmxpc3RlbnNUbyhcIm1vdXNlVXBcIikgKSB7XG5cdFx0XHRcdHMucmFpc2VFdmVudChcIm1vdXNlVXBcIiwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHRoaXMuY2xpY2tlZCgpICYmIHMubGlzdGVuc1RvKFwiY2xpY2tcIikgKSB7XG5cdFx0XHRcdHMucmFpc2VFdmVudChcImNsaWNrXCIsIHRoaXMpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0aGlzLmRvd24oKSApIHtcblx0XHRcdFx0aWYgKCBzLmxpc3RlbnNUbyhcIm1vdXNlRG93blwiKSApIHtcblx0XHRcdFx0XHRzLnJhaXNlRXZlbnQoXCJtb3VzZURvd25cIiwgdGhpcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcblx0XHRcdFx0aWYgKCBzLmxpc3RlbnNUbyhcIm1vdXNlRHJhZ1wiKSApIHtcblx0XHRcdFx0XHRzLnJhaXNlRXZlbnQoXCJtb3VzZURyYWdcIiwgdGhpcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICggcy5saXN0ZW5zVG8oXCJtb3VzZU92ZXJcIikgKSB7XG5cdFx0XHRcdHMucmFpc2VFdmVudChcIm1vdXNlT3ZlclwiLCB0aGlzKTtcblx0XHRcdH1cblx0XHRcdGlmICggdGhpcy5tb3ZlZCgpICYmIHMubGlzdGVuc1RvKFwibW91c2VNb3ZlXCIpICkge1xuXHRcdFx0XHRzLnJhaXNlRXZlbnQoXCJtb3VzZU1vdmVcIiwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHRoaXMud2hlZWwoKSAmJiBzLmxpc3RlbnNUbyhcIm1vdXNlV2hlZWxcIikgKSB7XG5cdFx0XHRcdHMucmFpc2VFdmVudChcIm1vdXNlV2hlZWxcIiwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICggcHMgJiYgcHMubGlzdGVuc1RvKFwibW91c2VPdXRcIikgKSB7XG5cdFx0XHRwcy5fbW91c2VJblJhaXNlZCA9IGZhbHNlO1xuXHRcdFx0cHMucmFpc2VFdmVudChcIm1vdXNlT3V0XCIsIHRoaXMpO1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLnByZXZTZWxlY3RlZE9iamVjdCA9IHM7XG5cdFx0XG5cdFx0aWYgKCAhIHRoaXMuaXNEcmFnZ2luZyApIHtcbiAgICAgIHRoaXMuZGVzZWxlY3RPYmplY3QoKTtcblx0XHR9XG5cblx0fTtcbiAgTW91c2UucHJvdG90eXBlLmRlc2VsZWN0T2JqZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRPYmplY3QpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRPYmplY3Quc2VsZWN0ZWRWaWV3ID0gbnVsbDtcbiAgICAgIHRoaXMuc2VsZWN0ZWRPYmplY3QgPSBudWxsO1xuICAgIH1cbiAgfTtcblx0LyoqXG5cdCAqIFJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gYnV0dG9uIGhhcyBiZWVuIHByZXNzZWQgYW5kIHJlbGVhc2VkXG5cdCAqIEBtZXRob2QgY2xpY2tlZFxuXHQgKiBAcGFyYW0ge2ludH0gYnV0dG9uIG9uZSBvZiBNb3VzZS5MRUZULCBNb3VzZS5NSURETEUsIE1vdXNlLlJJR0hUXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgdGhlIGJ1dHRvbiB3YXMgcHJlc3NlZCBhbmQgcmVsZWFzZWQgYW5kIGZhbHNlIGlmIG5vdFxuXHQgKi9cblx0TW91c2UucHJvdG90eXBlLmNsaWNrZWQgPSBmdW5jdGlvbiggYnV0dG9uICkge1xuXHRcdGlmICggYnV0dG9uICE9IG51bGwgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5ldmVudHNbIGJ1dHRvbiBdLmNsaWNrO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5ldmVudHNbMF0uY2xpY2s7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIGJ1dHRvbiBpcyBiZWluZyBwcmVzc2VkXG5cdCAqIEBtZXRob2QgZG93blxuXHQgKiBAcGFyYW0ge2ludH0gYnV0dG9uIG9uZSBvZiBNb3VzZS5MRUZULCBNb3VzZS5NSURETEUsIE1vdXNlLlJJR0hUXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgdGhlIGJ1dHRvbiBpcyBiZWluZyBwcmVzc2VkIGFuZCBmYWxzZSBpZiBub3Rcblx0ICovXG5cdE1vdXNlLnByb3RvdHlwZS5kb3duID0gZnVuY3Rpb24oIGJ1dHRvbiApIHtcblx0XHRpZiAoIGJ1dHRvbiAhPSBudWxsICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZXZlbnRzWyBidXR0b24gXS5kb3duO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5ldmVudHNbMF0uZG93biB8fCB0aGlzLmV2ZW50c1sxXS5kb3duIHx8IHRoaXMuZXZlbnRzWzJdLmRvd247XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIGJ1dHRvbiBoYXMgYmVlbiByZWxlYXNlZFxuXHQgKiBAbWV0aG9kIHVwXG5cdCAqIEBwYXJhbSB7aW50fSBidXR0b24gb25lIG9mIE1vdXNlLkxFRlQsIE1vdXNlLk1JRERMRSwgTW91c2UuUklHSFRcblx0ICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiB0aGUgYnV0dG9uIGhhcyBiZWVuIHJlbGVhc2VkIGFuZCBmYWxzZSBpZiBub3Rcblx0ICovXG5cdE1vdXNlLnByb3RvdHlwZS51cCA9IGZ1bmN0aW9uKCBidXR0b24gKSB7XG5cdFx0aWYgKCBidXR0b24gIT0gbnVsbCApIHtcblx0XHRcdHJldHVybiB0aGlzLmV2ZW50c1sgYnV0dG9uIF0udXA7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmV2ZW50c1swXS51cCB8fCB0aGlzLmV2ZW50c1sxXS51cCB8fCB0aGlzLmV2ZW50c1syXS51cDtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG1vdmUgZXZlbnQgb3IgbnVsbCBpZiB0aGUgbW91c2UgaGFzIG5vdCBtb3ZlZFxuXHQgKiBAbWV0aG9kIG1vdmVkXG5cdCAqIEByZXR1cm4ge0V2ZW50fSBtb3VzZSBldmVudFxuXHQgKi9cblx0TW91c2UucHJvdG90eXBlLm1vdmVkID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZXZlbnRNb3VzZU1vdmU7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB3aGVlbCBkZWx0YSB5XG5cdCAqIEBtZXRob2Qgd2hlZWxcblx0ICogQHJldHVybiB7aW50fSBkZWx0YSB5XG5cdCAqL1xuXHRNb3VzZS5wcm90b3R5cGUud2hlZWwgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLndoZWVsRGVsdGFZID0gMDtcblx0XHRpZiAoIHRoaXMuZXZlbnRNb3VzZVdoZWVsICkge1xuXHRcdFx0dGhpcy53aGVlbERlbHRhWSA9IHRoaXMuZXZlbnRNb3VzZVdoZWVsLndoZWVsRGVsdGFZO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy53aGVlbERlbHRhWTtcblx0fTtcblx0LyoqXG5cdCAqIENsZWFycyBtb3VzZSBldmVudHMuIFRoaXMgbWV0aG9kIGlzIHRvIGJlIGNhbGxlZCBvbmNlIGFmdGVyIGdhbWUgbG9vcFxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqIEBtZXRob2QgY2xlYXJcblx0ICovXG5cdE1vdXNlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgMzsgaSsrICkge1xuXHRcdFx0dGhpcy5ldmVudHNbaV0udXAgPSBudWxsO1xuXHRcdFx0dGhpcy5ldmVudHNbaV0uY2xpY2sgPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMuZXZlbnRNb3VzZVdoZWVsID0gbnVsbDtcblx0XHR0aGlzLmV2ZW50TW91c2VNb3ZlID0gbnVsbDtcblxuXHR9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgbW91c2UgY2xpY2sgZXZlbnQgYW5kIHVwZGF0ZXMgbW91c2UgbG9jYXRpb25cblx0ICogQG1ldGhvZCBjbGlja1xuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0V2ZW50fSBlIHRoZSBtb3VzZSBldmVudFxuXHQgKi9cblx0TW91c2UucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oIGUgKSB7XG5cdFx0dGhpcy5ldmVudHNbIGUuYnV0dG9uIF0uY2xpY2sgPSBlO1xuXHRcdHRoaXMueCA9IGUub2Zmc2V0WDtcblx0XHR0aGlzLnkgPSBlLm9mZnNldFk7XG5cdH07XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBtb3VzZSBkb3duIGV2ZW50XG5cdCAqIEBtZXRob2QgbW91c2Vkb3duXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGUgbW91c2UgZXZlbnRcblx0ICovXG5cdE1vdXNlLnByb3RvdHlwZS5tb3VzZWRvd24gPSBmdW5jdGlvbiggZSApIHtcblx0XHR0aGlzLmV2ZW50c1sgZS5idXR0b24gXS5kb3duID0gZTtcblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIG1vdXNlIHVwIGV2ZW50IGFuZCByZWxlYXNlcyBkcmFnZ2luZ1xuXHQgKiBAbWV0aG9kIG1vdXNldXBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtFdmVudH0gZSBtb3VzZSBldmVudFxuXHQgKi9cblx0TW91c2UucHJvdG90eXBlLm1vdXNldXAgPSBmdW5jdGlvbiggZSApIHtcblx0XHR0aGlzLmV2ZW50c1sgZS5idXR0b24gXS5kb3duID0gbnVsbDtcblx0XHR0aGlzLmV2ZW50c1sgZS5idXR0b24gXS51cCA9IGU7XG5cdFx0dGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG5cdH07XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBtb3VzZSB3aGVlbCBldmVudCBmb3IgZXZlcnkgYnJvd3NlciBleGNlcHQgRmlyZWZveFxuXHQgKiBAbWV0aG9kIG1vdXNld2hlZWxcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtFdmVudH0gZSBtb3VzZSBldmVudFxuXHQgKi9cblx0TW91c2UucHJvdG90eXBlLm1vdXNld2hlZWwgPSBmdW5jdGlvbiggZSApIHtcblx0XHR0aGlzLmV2ZW50TW91c2VXaGVlbCA9IGU7XG5cdFx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIG1vdXNlIHdoZWVsIGV2ZW50LiBGb3IgRmlyZWZveCBvbmx5XG5cdCAqIEBtZXRob2QgbW91c2V3aGVlbFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0V2ZW50fSBlIG1vdXNlIGV2ZW50XG5cdCAqL1xuXHRNb3VzZS5wcm90b3R5cGUuRE9NTW91c2VTY3JvbGwgPSBmdW5jdGlvbiggZSApIHtcblx0XHR0aGlzLm1vdXNld2hlZWwoIHsgd2hlZWxEZWx0YVk6IGUuZGV0YWlsICogLTQwIH0gKTtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgd2hldGhlciB0aGUgbW91c2UgaXMgb3ZlciB0aGUgZ2l2ZW4gb2JqZWN0XG5cdCAqIEBtZXRob2QgaXNPdmVyUGl4ZWxQZXJmZWN0XG5cdCAqIEBwYXJhbSB7cmVuZGVyZXJzLlJlbmRlcml6YWJsZX0gcmVuZGVyaXphYmxlXG5cdCAqIEBwYXJhbSB7T25Mb29wUHJvcGVydGllc30gcFxuXHQgKi9cblx0TW91c2UucHJvdG90eXBlLmlzT3ZlclBpeGVsUGVyZmVjdCA9IGZ1bmN0aW9uKCByZW5kZXJpemFibGUgKSB7XG5cdFx0aWYgKCAhIHJlbmRlcml6YWJsZS5fdmlzaWJsZSApIHJldHVybjtcblx0XHR2YXIgY3R4ID0gTS5vZmZTY3JlZW5Db250ZXh0LFxuXHRcdFx0Y252ID0gTS5vZmZTY3JlZW5DYW52YXMsXG5cdFx0XHRjYW1lcmEgPSBNLmdldENhbWVyYSgpO1xuXHRcdGNudi53aWR0aCA9IE0ucmVuZGVyZXIuZnJvbnRCdWZmZXIuY2FudmFzLndpZHRoO1xuXHRcdGNudi5oZWlnaHQgPSBNLnJlbmRlcmVyLmZyb250QnVmZmVyLmNhbnZhcy5oZWlnaHQ7XG5cdFx0Ly9UT0RPOiBUaGlzIG1pZ2h0IG5vdCBiZSBuZWNlc3NhcnkgY2F1c2Ugd2UgY2xlYW4gdGhlIGNvbnRleHQgYW5kIGl0J3MgdGhlIG9mZnNjcmVlbiBjb250ZXh0IHVzZWQgZm9yIHRlc3Rpbmdcblx0XHRjdHguc2F2ZSgpO1xuXHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgY252LndpZHRoLCBjbnYuaGVpZ2h0KTtcblx0XHRNLnJlbmRlcmVyLnJlbmRlcihyZW5kZXJpemFibGUsIGN0eCwgY2FtZXJhLl94LCBjYW1lcmEuX3kpO1xuXHRcdGN0eC5yZXN0b3JlKCk7XG5cdFx0dmFyIGltZ0RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKHRoaXMueCwgdGhpcy55LCAxLCAxKTtcblx0XHRpZiAoICFpbWdEYXRhLmRhdGFbM10gKSByZXR1cm4gZmFsc2U7XG5cdFx0aWYgKCBpbWdEYXRhLmRhdGFbMF0gKSByZXR1cm4gdHJ1ZTtcblx0XHRpZiAoIGltZ0RhdGEuZGF0YVsxXSApIHJldHVybiB0cnVlO1xuXHRcdGlmICggaW1nRGF0YS5kYXRhWzJdICkgcmV0dXJuIHRydWU7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyB3aGV0aGVyIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSBnaXZlbiByZW5kZXJpemFibGUgb3Igbm90XG5cdCAqXG5cdCAqIEBtZXRob2QgaXNPdmVyUG9seWdvblxuXHQgKiBAcGFyYW0ge3JlbmRlcmVycy5SZW5kZXJpemFibGV9IHJlbmRlcml6YWJsZVxuXHQgKiBAcGFyYW0ge0NhbWVyYX0gY2FtZXJhXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgbW91c2UgaXMgb3ZlciB0aGlzIG9iamVjdCBlbHNlIGZhbHNlXG5cdCAqL1xuXHRNb3VzZS5wcm90b3R5cGUuaXNPdmVyUG9seWdvbiA9IGZ1bmN0aW9uIChyZW5kZXJpemFibGUpIHtcblx0XHR2YXIgY2FtZXJhID0gTS5nZXRDYW1lcmEoKSxcblx0XHRcdHggPSB0aGlzLnggKyBjYW1lcmEuX3gsXG5cdFx0XHR5ID0gdGhpcy55ICsgY2FtZXJhLl95O1xuXHRcdGlmIChyZW5kZXJpemFibGUuX3JvdGF0aW9uKSB7XG5cdFx0XHR0aGlzLl94ID0geDtcblx0XHRcdHRoaXMuX3kgPSB5O1xuXHRcdFx0cmV0dXJuIE0uY29sbGlzaW9ucy5Qb2x5Z29uLmhhdmVDb2xsaWRlZChyZW5kZXJpemFibGUsIHRoaXMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAocmVuZGVyaXphYmxlLmdldEJvdHRvbSgpIDwgeSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0aWYgKHJlbmRlcml6YWJsZS5nZXRUb3AoKSA+IHkpIHJldHVybiBmYWxzZTtcblx0XHRcdGlmIChyZW5kZXJpemFibGUuZ2V0UmlnaHQoKSA8IHgpIHJldHVybiBmYWxzZTtcblx0XHRcdGlmIChyZW5kZXJpemFibGUuZ2V0TGVmdCgpID4geCkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9O1xuXHRNb3VzZS5wcm90b3R5cGUuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIDI7XG5cdH07XG5cdE1vdXNlLnByb3RvdHlwZS5nZXRXaWR0aCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAyO1xuXHR9O1xuXHQvKipcblx0ICogRmlyZXMgbW91c2UgZXZlbnQgb24gdGhlIG9iamVjdCB0aGF0IGlzIHVuZGVyIHRoZSBtb3VzZSBhbmQgY2xlYXJzIGlucHV0XG5cdCAqIEBtZXRob2QgdXBkYXRlXG5cdCAqL1xuXHRNb3VzZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5maXJlRXZlbnRPbkxhc3RTZWxlY3RlZE9iamVjdCgpO1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0fTtcblxuXHRNb3VzZS5wcm90b3R5cGUuYXBwbHlUb09iamVjdCA9IGZ1bmN0aW9uKCBlbnRpdHkgKSB7XG5cdFxuXHRcdHZhciB2aWV3cyA9IGVudGl0eS52aWV3cy5fdmFsdWVzLFxuXHRcdFx0aSA9IDAsXG5cdFx0XHRsID0gdmlld3MubGVuZ3RoLFxuXHRcdFx0cmVuZGVyaXphYmxlO1xuXG5cdFx0aWYgKCBlbnRpdHkubGlzdGVuc1RvKFwibW91c2VPdmVyXCIpIHx8IGVudGl0eS5saXN0ZW5zVG8oXCJtb3VzZUluXCIpIHx8IGVudGl0eS5saXN0ZW5zVG8oXCJtb3VzZU91dFwiKSB8fCBlbnRpdHkubGlzdGVuc1RvKFwib25Nb3VzZVdoZWVsXCIpIHx8ICggZW50aXR5Lmxpc3RlbnNUbyhcIm1vdXNlRG93blwiKSAmJiB0aGlzLmRvd24oKSApIHx8ICggZW50aXR5Lmxpc3RlbnNUbyhcIm1vdXNlVXBcIikgJiYgdGhpcy51cCgpICkgfHwgKCBlbnRpdHkubGlzdGVuc1RvKFwiY2xpY2tcIikgJiYgdGhpcy5jbGlja2VkKCkgKSApIHtcblxuXHRcdFx0Zm9yICg7IGkgPCBsOyBpKysgKSB7XG5cblx0XHRcdFx0cmVuZGVyaXphYmxlID0gdmlld3NbaV07XG5cblx0XHRcdFx0aWYgKCB0aGlzLmlzT3ZlclBvbHlnb24ocmVuZGVyaXphYmxlKSAmJiB0aGlzLmlzT3ZlclBpeGVsUGVyZmVjdChyZW5kZXJpemFibGUpICkge1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0KGVudGl0eSwgcmVuZGVyaXphYmxlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cblx0fTtcblxuXHRpZiAoIE0uYnJvd3Nlci5pc0ZpcmVmb3ggKSB7XG5cblx0XHRNb3VzZS5wcm90b3R5cGUubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xuXHRcdFx0dGhpcy5ldmVudE1vdXNlTW92ZSA9IGU7XG5cdFx0XHR0aGlzLnByZXZYID0gdGhpcy54O1xuXHRcdFx0dGhpcy5wcmV2WSA9IHRoaXMueTtcblx0XHRcdHRoaXMueCA9IGUubGF5ZXJYIC0gZS50YXJnZXQub2Zmc2V0TGVmdDtcblx0XHRcdHRoaXMueSA9IGUubGF5ZXJZIC0gZS50YXJnZXQub2Zmc2V0VG9wO1xuXHRcdH07XG5cblx0XHRNb3VzZS5wcm90b3R5cGUuY2xpY2sgPSBmdW5jdGlvbiggZSApIHtcblx0XHRcdHRoaXMuZXZlbnRzWyBlLmJ1dHRvbiBdLmNsaWNrID0gZTtcblx0XHRcdHRoaXMucHJldlggPSB0aGlzLng7XG5cdFx0XHR0aGlzLnByZXZZID0gdGhpcy55O1xuXHRcdFx0dGhpcy54ID0gZS5sYXllclggLSBlLnRhcmdldC5vZmZzZXRMZWZ0O1xuXHRcdFx0dGhpcy55ID0gZS5sYXllclkgLSBlLnRhcmdldC5vZmZzZXRUb3A7XG5cdFx0fTtcblxuXHR9IGVsc2Uge1xuXG5cdFx0TW91c2UucHJvdG90eXBlLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0dGhpcy5ldmVudE1vdXNlTW92ZSA9IGU7XG5cdFx0XHR0aGlzLnByZXZYID0gdGhpcy54O1xuXHRcdFx0dGhpcy5wcmV2WSA9IHRoaXMueTtcblx0XHRcdHRoaXMueCA9IGUub2Zmc2V0WDtcblx0XHRcdHRoaXMueSA9IGUub2Zmc2V0WTtcblx0XHR9O1xuXG5cdH1cblxuXHRNb3VzZS5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggTS5icm93c2VyLmlzRmlyZWZveCAgKSB7XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NTW91c2VTY3JvbGxcIiwgbW91c2VXaGVlbEhlbHBlckZpcmVGb3gsIGZhbHNlKTtcblx0XHR9IGVsc2UgaWYgKCBNLmJyb3dzZXIubmFtZSA9PSBcIk1TSUUgOS4wXCIgKSB7XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwib253aGVlbFwiLCBtb3VzZVdoZWVsSGVscGVyLCBmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXdoZWVsXCIsIG1vdXNlV2hlZWxIZWxwZXIsIGZhbHNlKTtcblx0XHR9XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBtb3VzZURvd25IZWxwZXIsIGZhbHNlKTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBtb3VzZVVwSGVscGVyLCBmYWxzZSk7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3VzZU1vdmVIZWxwZXIsIGZhbHNlKTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbW91c2VDbGlja0hlbHBlciwgZmFsc2UpO1xuXHRcdE0uc2V0TW91c2UodGhpcyk7XG5cdH07XG5cblx0TW91c2UucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggTS5icm93c2VyLmlzRmlyZWZveCAgKSB7XG5cdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NTW91c2VTY3JvbGxcIiwgbW91c2VXaGVlbEhlbHBlckZpcmVGb3gpO1xuXHRcdH0gZWxzZSBpZiAoIE0uYnJvd3Nlci5uYW1lID09IFwiTVNJRSA5LjBcIiApIHtcblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJvbndoZWVsXCIsIG1vdXNlV2hlZWxIZWxwZXIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V3aGVlbFwiLCBtb3VzZVdoZWVsSGVscGVyKTtcblx0XHR9XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBtb3VzZURvd25IZWxwZXIpO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG1vdXNlVXBIZWxwZXIpO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW91c2VNb3ZlSGVscGVyKTtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbW91c2VDbGlja0hlbHBlcik7XG5cdFx0TS5zZXRNb3VzZShudWxsKTtcblx0fTtcblxuXHRpbnN0YW5jZSA9IG5ldyBNb3VzZSgpO1xuXHRpbnN0YW5jZS5iaW5kKCk7XG5cbn0pKHdpbmRvdy5NYXRjaCk7IiwiLyoqXG4gKiBAbW9kdWxlIE1hdGNoXG4gKi9cbihmdW5jdGlvbihNKSB7XG5cblx0dmFyIGluc3RhbmNlO1xuXG5cdGZ1bmN0aW9uIGRldmljZW1vdGlvbihlKSB7XG5cdFx0aW5zdGFuY2UuYWNjZWxlcmF0ZShlKTtcblx0fVxuXG5cdGZ1bmN0aW9uIEFjY2VsZXJvbWV0ZXIoKSB7XG5cdH1cblxuXHRBY2NlbGVyb21ldGVyLnByb3RvdHlwZS5hY2NlbGVyYXRlID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR0aGlzLl9oYXNFdmVudCA9IHRydWU7XG5cdFx0dGhpcy5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5ID0gZXZlbnQuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eTtcblx0XHR0aGlzLmFjY2VsZXJhdGlvbiA9IGV2ZW50LmFjY2VsZXJhdGlvbjtcblx0XHR0aGlzLnJvdGF0aW9uUmF0ZSA9IGV2ZW50LnJvdGF0aW9uUmF0ZTtcblx0fTtcblxuXHRBY2NlbGVyb21ldGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9oYXNFdmVudCA9IGZhbHNlO1xuXHR9O1xuXG5cdEFjY2VsZXJvbWV0ZXIucHJvdG90eXBlLnJpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2hhc0V2ZW50ICYmICh0aGlzLmFjY2VsZXJhdGlvbi54ID4gMCB8fCB0aGlzLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueCA+IDApO1xuXHR9O1xuXHRBY2NlbGVyb21ldGVyLnByb3RvdHlwZS5sZWZ0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2hhc0V2ZW50ICYmICh0aGlzLmFjY2VsZXJhdGlvbi54IDwgMCB8fCB0aGlzLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueSA8IDApO1xuXHR9O1xuXHRBY2NlbGVyb21ldGVyLnByb3RvdHlwZS51cCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9oYXNFdmVudCAmJiB0aGlzLmFjY2VsZXJhdGlvbi55ID4gMDtcblx0fTtcblx0QWNjZWxlcm9tZXRlci5wcm90b3R5cGUuZG93biA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9oYXNFdmVudCAmJiB0aGlzLmFjY2VsZXJhdGlvbi55IDwgMDtcblx0fTtcblxuXHRBY2NlbGVyb21ldGVyLnByb3RvdHlwZS5hcHBseVRvT2JqZWN0ID0gZnVuY3Rpb24obm9kZSkge1xuXHRcdGlmICggdGhpcy5faGFzRXZlbnQgKSB7XG5cdFx0XHRpZiAoIG5vZGUub25EZXZpY2VBY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5ICkge1xuXHRcdFx0XHRub2RlLm9uRGV2aWNlQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSh0aGlzLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueCwgdGhpcy5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LnksIHRoaXMuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS56LCB0aGlzLnJvdGF0aW9uUmF0ZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIG5vZGUub25EZXZpY2VBY2NlbGVyYXRpb24gKSB7XG5cdFx0XHRcdG5vZGUub25EZXZpY2VBY2NlbGVyYXRpb24odGhpcy5hY2NlbGVyYXRpb24ueCwgdGhpcy5hY2NlbGVyYXRpb24ueSwgdGhpcy5hY2NlbGVyYXRpb24ueiwgdGhpcy5yb3RhdGlvblJhdGUpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBub2RlLm9uRGV2aWNlUm90YXRpb24gKSB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdCAqIGFscGhhXG5cdFx0XHRcdCAqXHRUaGUgcmF0ZSBhdCB3aGljaCB0aGUgZGV2aWNlIGlzIHJvdGF0aW5nIGFib3V0IGl0cyBaIGF4aXM7IHRoYXQgaXMsIGJlaW5nIHR3aXN0ZWQgYWJvdXQgYSBsaW5lIHBlcnBlbmRpY3VsYXIgdG8gdGhlIHNjcmVlbi5cblx0XHRcdFx0ICogYmV0YVxuXHRcdFx0XHQgKlx0VGhlIHJhdGUgYXQgd2hpY2ggdGhlIGRldmljZSBpcyByb3RhdGluZyBhYm91dCBpdHMgWCBheGlzOyB0aGF0IGlzLCBmcm9udCB0byBiYWNrLlxuXHRcdFx0XHQgKiBnYW1tYVxuXHRcdFx0XHQgKlx0VGhlIHJhdGUgYXQgd2hpY2ggdGhlIGRldmljZSBpcyByb3RhdGluZyBhYm91dCBpdHMgWSBheGlzOyB0aGF0IGlzLCBzaWRlIHRvIHNpZGUuXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRub2RlLm9uRGV2aWNlUm90YXRpb24odGhpcy5yb3RhdGlvblJhdGUuYWxwaGEsIHRoaXMucm90YXRpb25SYXRlLmJldGEsIHRoaXMucm90YXRpb25SYXRlLmdhbW1hKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0QWNjZWxlcm9tZXRlci5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiZGV2aWNlbW90aW9uXCIsIGRldmljZW1vdGlvbiwgZmFsc2UpO1xuXHRcdE0uc2V0QWNjZWxlcm9tZXRlcih0aGlzKTtcblx0fTtcblxuXHRBY2NlbGVyb21ldGVyLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbigpIHtcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImRldmljZW1vdGlvblwiLCBkZXZpY2Vtb3Rpb24pO1xuXHRcdE0uc2V0QWNjZWxlcm9tZXRlcihudWxsKTtcblx0fTtcblxuXHRpbnN0YW5jZSA9IG5ldyBBY2NlbGVyb21ldGVyKCk7XG5cdGluc3RhbmNlLmJpbmQoKTtcblxufSkod2luZG93Lk1hdGNoKTsiLCIvKipcbiAqIEBtb2R1bGUgTWF0Y2hcbiAqL1xuKGZ1bmN0aW9uKE0pIHtcblxuXHR2YXIgaW5zdGFuY2U7XG5cblx0ZnVuY3Rpb24gb25rZXlkb3duKGUpIHtcblx0XHRpbnN0YW5jZS5maXJlRG93biggZSApO1xuXHR9XG5cblx0ZnVuY3Rpb24gb25rZXl1cChlKSB7XG5cdFx0aW5zdGFuY2UuZmlyZVVwKCBlICk7XG5cdH1cblxuXHQvKipcblx0ICogUHJvdmlkZXMga2V5Ym9hcmQgc3VwcG9ydC5cblx0ICogVGhpcyBjbGFzcyBpcyBhdXRvbWF0aWNhbGx5IGJpbmRlZCB0byBNYXRjaCBpZiB0aGlzIGZpbGUgaXMgaW5jbHVkZWQuIENhbiBiZSBhY2Nlc3NlZCBieSBNLmtleWJvYXJkXG5cdCAqIEBjbGFzcyBLZXlib2FyZFxuXHQgKiBAbmFtZXNwYWNlIGlucHV0XG5cdCAqIEBzdGF0aWNcblx0ICovXG5cdGZ1bmN0aW9uIEtleWJvYXJkKCkge1xuXHRcdC8qKlxuXHRcdCAqIE1hcCBvZiA8U3RyaW5nLCBCb29sZWFuPiBjb250YWluaW5nIHRydWUgZm9yIGtleXMgdGhhdCBhcmUgYmVpbmcgcHJlc3NlZFxuXHRcdCAqIEBwcm9wZXJ0eSBrZXlzRG93blxuXHRcdCAqIEB0eXBlIHtNYXB9XG5cdFx0ICovXG5cdFx0dGhpcy5rZXlzRG93biA9IHtcblx0XHRcdGxlbmd0aDogMFxuXHRcdH07XG5cdFx0LyoqXG5cdFx0ICogTWFwIG9mIDxTdHJpbmcsIEJvb2xlYW4+IGNvbnRhaW5pbmcgdHJ1ZSBmb3Iga2V5cyB0aGF0IHdlcmUgcmVsZWFzZWRcblx0XHQgKiBAcHJvcGVydHkga2V5c1VwXG5cdFx0ICogQHR5cGUge01hcH1cblx0XHQgKi9cblx0XHR0aGlzLmtleXNVcCA9IG51bGw7XG5cdFx0LyoqXG5cdFx0ICogTWFwIG9mIDxTdHJpbmcsIEJvb2xlYW4+IGNvbnRhaW5pbmcgdHJ1ZSBmb3Iga2V5cyB0aGF0IHdlcmUgcHJlc3NlZCAoZG93biAtPiBleGVjdXRlcyBhbmQgZGlzYWJsZXMsIHVwIC0+IGVuYWJsZXMpXG5cdFx0ICogQHByb3BlcnR5IGtleXNVcFxuXHRcdCAqIEB0eXBlIHtNYXB9XG5cdFx0ICovXG5cdFx0dGhpcy5rZXlzUHJlc3NlZCA9IHsgICAgICAgICAgICBcblx0XHR9O1xuXHR9XG5cblx0S2V5Ym9hcmQucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBvbmtleWRvd24sIGZhbHNlKTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgb25rZXl1cCwgZmFsc2UpO1xuXHRcdE0uc2V0S2V5Ym9hcmQodGhpcyk7XG5cdH07XG5cblx0S2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG9ua2V5ZG93bik7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIG9ua2V5dXApO1xuXHRcdE0uc2V0S2V5Ym9hcmQobnVsbCk7XG5cdH07XG5cblx0S2V5Ym9hcmQucHJvdG90eXBlWzhdIFx0PSBcImJhY2tzcGFjZVwiO1xuXHRLZXlib2FyZC5wcm90b3R5cGVbOV0gXHQ9IFwidGFiXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVsxM10gXHQ9IFwiZW50ZXJcIjtcblx0S2V5Ym9hcmQucHJvdG90eXBlWzE2XSBcdD0gXCJzaGlmdFwiO1xuXHRLZXlib2FyZC5wcm90b3R5cGVbMTddXHQ9IFwiY3RybFwiO1xuXHRLZXlib2FyZC5wcm90b3R5cGVbMThdIFx0PSBcImFsdFwiO1xuXHRLZXlib2FyZC5wcm90b3R5cGVbMTldXHQ9IFwicGF1c2VcIjtcblx0S2V5Ym9hcmQucHJvdG90eXBlWzIwXVx0PSBcImNhcHNsb2NrXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVsyN11cdD0gXCJlc2NhcGVcIjtcblx0S2V5Ym9hcmQucHJvdG90eXBlWzMyXVx0PSBcInNwYWNlXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVszM10gXHQ9IFwicGFnZXVwXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVszNF0gXHQ9IFwicGFnZWRvd25cIjtcblx0S2V5Ym9hcmQucHJvdG90eXBlWzM1XSBcdD0gXCJlbmRcIjtcblx0S2V5Ym9hcmQucHJvdG90eXBlWzM2XSBcdD0gXCJob21lXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVszN10gXHQ9IFwibGVmdFwiO1xuXHRLZXlib2FyZC5wcm90b3R5cGVbMzhdIFx0PSBcInVwXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVszOV0gXHQ9IFwicmlnaHRcIjtcblx0S2V5Ym9hcmQucHJvdG90eXBlWzQwXSBcdD0gXCJkb3duXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVs0NV0gXHQ9IFwiaW5zZXJ0XCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVs0Nl0gXHQ9IFwiZGVsZXRlXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVsxMTJdID0gXCJmMVwiO1xuXHRLZXlib2FyZC5wcm90b3R5cGVbMTEzXSA9IFwiZjJcIjtcblx0S2V5Ym9hcmQucHJvdG90eXBlWzExNF0gPSBcImYzXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVsxMTVdID0gXCJmNFwiO1xuXHRLZXlib2FyZC5wcm90b3R5cGVbMTE2XSA9IFwiZjVcIjtcblx0S2V5Ym9hcmQucHJvdG90eXBlWzExN10gPSBcImY2XCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVsxMThdID0gXCJmN1wiO1xuXHRLZXlib2FyZC5wcm90b3R5cGVbMTE5XSA9IFwiZjhcIjtcblx0S2V5Ym9hcmQucHJvdG90eXBlWzEyMF0gPSBcImY5XCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVsxMjFdID0gXCJmMTBcIjtcblx0S2V5Ym9hcmQucHJvdG90eXBlWzEyMl0gPSBcImYxMVwiO1xuXHRLZXlib2FyZC5wcm90b3R5cGVbMTIzXSA9IFwiZjEyXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVsxNDVdID0gXCJudW1sb2NrXCI7XG5cdEtleWJvYXJkLnByb3RvdHlwZVsyMjBdID0gXCJwaXBlXCI7XG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRoYXQgZ2V0cyBleGVjdXRlZCB3aGVuIHRoZSB1c2VyIGlzIHByZXNzaW5nIGEga2V5XG4gICAgICogQG1ldGhvZCBmaXJlRG93blxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICAgKi9cbiAgICBLZXlib2FyZC5wcm90b3R5cGUuZmlyZURvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHR2YXIga2V5ID0gdGhpc1sgZXZlbnQud2hpY2ggXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKCBldmVudC53aGljaCApLnRvTG93ZXJDYXNlKCk7XG5cblx0XHR0aGlzLmtleXNEb3duWyBrZXkgXSA9IHRydWU7XG5cbiAgICAgICAgaWYgKCB0aGlzLmtleXNQcmVzc2VkWyBrZXkgXSA9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLmtleXNQcmVzc2VkWyBrZXkgXSA9IHRydWU7XG4gICAgICAgIH1cblx0XHRcblx0XHR0aGlzLmtleXNEb3duLmxlbmd0aCsrO1xuXG5cdH07XG5cdC8qKlxuXHQgKiBNZXRob2QgdGhhdCBnZXRzIGV4ZWN1dGVkIHdoZW4gdGhlIHJlbGVhc2VkIHVzZXIgYSBrZXlcblx0ICogQG1ldGhvZCBmaXJlVXBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICovXG5cdEtleWJvYXJkLnByb3RvdHlwZS5maXJlVXAgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHR2YXIga2V5ID0gdGhpc1sgZXZlbnQud2hpY2ggXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKCBldmVudC53aGljaCApLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRpZiAoICEgdGhpcy5rZXlzVXAgKSB0aGlzLmtleXNVcCA9IHt9O1xuXG5cdFx0dGhpcy5rZXlzRG93blsga2V5IF0gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5rZXlzUHJlc3NlZFsga2V5IF0gPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5rZXlzVXBbIGtleSBdID0gdHJ1ZTtcblx0XHRcblx0XHRpZiAoIHRoaXMua2V5c0Rvd24ubGVuZ3RoID4gMCApIHRoaXMua2V5c0Rvd24ubGVuZ3RoLS07XG5cblx0fTtcblx0LyoqXG5cdCAqIENsZWFycyB0aGUga2V5c1VwIE1hcCB0byBhdm9pZCBmdXJ0aGVyIGV4ZWN1dGlvbnMgd2hlbiB0aGUga2V5cyB3aGVyZSBsb25nIHJlbGVhc2VkXG5cdCAqIEBtZXRob2QgdXBkYXRlXG5cdCAqL1xuXHRLZXlib2FyZC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5rZXlzVXAgPSBudWxsO1xuICAgICAgICBmb3IgKCB2YXIgaSBpbiB0aGlzLmtleXNQcmVzc2VkICkge1xuICAgICAgICAgICAgaWYgKCB0aGlzLmtleXNQcmVzc2VkW2ldICkge1xuICAgICAgICAgICAgICAgIHRoaXMua2V5c1ByZXNzZWRbaV0gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXHR9O1xuXHQvKipcblx0ICogTG9va3MgZm9yIG9uS2V5RG93biBhbmQgb25LZXlVcCBtZXRob2RzIGluIHRoZSBwcm92aWRlZCBvYmplY3QgYW5kIGV4ZWN1dGVzIHRoZW0gaWYgdGhlIG9iamVjdCBoYXMgZm9jdXMuXG5cdCAqIEFsc28sIGlmIHRoZSBvYmplY3QgaGFzIGtleURvd25NYXBwaW5ncyBvciBrZXlVcE1hcHBpbmdzIGFuZCBhIGtleSBldmVudCBiaW5kZWQgdG8gYW55IG9mIHRob3NlIGlzIGV4ZWN1dGVkXG5cdCAqIHRoZW4gS2V5Ym9hcmRJbnB1dEhhbmRsZXIgZXhlY3V0ZXMgdGhlIHNwZWNpZmllZCBtZXRob2Qgb24gdGhlIG9iamVjdFxuXHQgKiBAbWV0aG9kIGFwcGx5VG9PYmplY3Rcblx0ICpcblx0ICogQGV4YW1wbGUgXG5cdFx0XHROaW5qYS5wcm90b3R5cGUubW92ZVVwID0gZnVuY3Rpb24oKSB7IFxuXHRcdFx0IC8vbW92ZSB0aGUgbmluamEgdXAgXG5cdFx0XHR9XG5cdFx0XHROaW5qYS5wcm90b3R5cGUua2V5RG93bk1hcHBpbmdzID0ge1xuXHRcdFx0XHRcInVwXCI6IFwibW92ZVVwXCJcblx0XHRcdH1cblx0XHRcdC8vQm90aCBleGFtcGxlcyByZXN1bHQgaW4gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgbW92ZVVwIG1ldGhvZFxuXHRcdFx0TmluamEucHJvdG90eXBlLm9uS2V5VXAgPSBmdW5jdGlvbihrZXlzVXApIHtcblx0XHRcdFx0aWYgKCBrZXlzVXAudXAgKSB7XG5cdFx0XHRcdFx0dGhpcy5tb3ZlVXAoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHQgKi9cblx0S2V5Ym9hcmQucHJvdG90eXBlLmFwcGx5VG9PYmplY3QgPSBmdW5jdGlvbiggb2JqZWN0ICkge1xuXG5cdFx0aWYgKCBvYmplY3QubGlzdGVuc1RvKFwia2V5RG93blwiKSApIHtcblx0XHRcdG9iamVjdC5yYWlzZUV2ZW50KFwia2V5RG93blwiLCB0aGlzLmtleXNEb3duKTtcblx0XHR9XG5cblx0XHRpZiAoIG9iamVjdC5saXN0ZW5zVG8oXCJrZXlVcFwiICkgKSB7XG5cdFx0XHRvYmplY3QucmFpc2VFdmVudChcImtleVVwXCIsIHRoaXMua2V5c1VwKTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gaWYgKCBvYmplY3Qua2V5RG93bk1hcHBpbmdzICYmIHRoaXMua2V5c0Rvd24ubGVuZ3RoID4gMCApIHtcblx0XHQvLyBcdGZvciAoIHZhciBpIGluIG9iamVjdC5rZXlEb3duTWFwcGluZ3MgKSB7XG5cdFx0Ly8gXHRcdGlmICggdGhpcy5rZXlzRG93bltpXSApIG9iamVjdFtvYmplY3Qua2V5RG93bk1hcHBpbmdzW2ldXSgpO1xuXHRcdC8vIFx0fVxuXHRcdC8vIH1cblx0XHQvLyBpZiAoIG9iamVjdC5rZXlVcE1hcHBpbmdzICYmIHRoaXMua2V5c1VwICkge1xuXHRcdC8vIFx0Zm9yICggdmFyIGkgaW4gb2JqZWN0LmtleVVwTWFwcGluZ3MgKSB7XG5cdFx0Ly8gXHRcdGlmICggdGhpcy5rZXlzVXBbaV0gKSBvYmplY3Rbb2JqZWN0LmtleVVwTWFwcGluZ3NbaV1dKCk7XG5cdFx0Ly8gXHR9XG5cdFx0Ly8gfVxuXG5cdH07XG5cbiAgICBLZXlib2FyZC5wcm90b3R5cGUuZ2V0S2V5Q29kZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICByZXR1cm4ga2V5LmNoYXJDb2RlQXQoMCk7XG4gICAgfVxuXG4gICAgdmFyIGluc3RhbmNlID0gbmV3IEtleWJvYXJkKCk7XG4gICBcdGluc3RhbmNlLmJpbmQoKTtcblxufSkod2luZG93Lk1hdGNoKTsiLCIvKipcbiAqIEBtb2R1bGUgTWF0Y2hcbiAqL1xuKGZ1bmN0aW9uKE0pIHtcblxuXHR2YXIgaW5zdGFuY2U7XG5cblx0ZnVuY3Rpb24gdG91Y2hTdGFydEhlbHBlcihldmVudCkge1xuXHRcdGluc3RhbmNlLnN0YXJ0KGV2ZW50KTtcblx0fVxuXHRmdW5jdGlvbiB0b3VjaEVuZEhlbHBlcihldmVudCkge1xuXHRcdGluc3RhbmNlLmVuZChldmVudCk7XG5cdH1cblx0ZnVuY3Rpb24gdG91Y2hDYW5jZWxIZWxwZXIoZXZlbnQpIHtcblx0XHRpbnN0YW5jZS5jYW5jZWwoZXZlbnQpO1xuXHR9XG5cdGZ1bmN0aW9uIHRvdWNoTGVhdmVIZWxwZXIoZXZlbnQpIHtcblx0XHRpbnN0YW5jZS5sZWF2ZShldmVudCk7XG5cdH1cblx0ZnVuY3Rpb24gdG91Y2hNb3ZlSGVscGVyKGV2ZW50KSB7XG5cdFx0aW5zdGFuY2UubW92ZShldmVudCk7XG5cdH1cblxuXHRmdW5jdGlvbiBUb3VjaCgpIHtcblxuXHRcdC8qXG5cdFx0ICogSUUgaGFuZGxlcyB0b3VjaCB3aXRoIE1TUG9pbnRlckRvd24sIE1TUG9pbnRlclVwIGFuZCBNU1BvaW50ZXJNb3ZlLiBXZSBtdXN0IHVwZGF0ZSB0aGlzIGludGVyZmFjXG5cdFx0ICogdG8gc3VwcG9ydCBJRSBvciB1c2VyIHdpbGwgaGF2ZSB0byBkZWZhdWx0IHRvIG1vdXNlXG5cdFx0ICovXG5cblx0XHR0aGlzLnggPSAwO1xuXHRcdHRoaXMueSA9IDA7XG5cblx0XHR0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcblxuXHRcdHRoaXMuZXZlbnRzID0ge1xuXHRcdFx0c3RhcnQ6IG51bGwsXG5cdFx0XHRlbmQ6IG51bGwsXG5cdFx0XHRtb3ZlOiBudWxsXG5cdFx0fTtcblxuXHR9XG5cblx0VG91Y2gucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLmV2ZW50cy5lbmQgKSB7XG5cdFx0XHR0aGlzLmV2ZW50cy5zdGFydCA9IG51bGw7XG5cdFx0XHR0aGlzLnggPSAwO1xuXHRcdFx0dGhpcy55ID0gMDtcblx0XHR9XG5cdFx0dGhpcy5ldmVudHMuZW5kID0gbnVsbDtcblx0XHR0aGlzLmV2ZW50cy5tb3ZlID0gbnVsbDtcblx0XHR0aGlzLmZvcmNlID0gbnVsbDtcblx0XHRpZiAoICF0aGlzLmlzRHJhZ2dpbmcgKSB7XG5cdFx0XHR0aGlzLnNlbGVjdGVkT2JqZWN0ID0gbnVsbDtcblx0XHR9XG5cdH07XG5cdFRvdWNoLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmZpcmVFdmVudE9uTGFzdFNlbGVjdGVkT2JqZWN0KHRoaXMpO1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0fTtcblx0VG91Y2gucHJvdG90eXBlLmdldEhlaWdodCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAyO1xuXHR9O1xuXHRUb3VjaC5wcm90b3R5cGUuZ2V0V2lkdGggPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gMjtcblx0fTtcblx0VG91Y2gucHJvdG90eXBlLmFwcGx5VG9PYmplY3QgPSBmdW5jdGlvbihyZW5kZXJpemFibGUpIHtcblx0XHRpZiAoICF0aGlzLmlzRHJhZ2dpbmcgKSB7XG5cdFx0XHRpZiAoIHJlbmRlcml6YWJsZS5vblRvdWNoIHx8IHJlbmRlcml6YWJsZS5vblRvdWNoRW5kIHx8IHJlbmRlcml6YWJsZS5vblRvdWNoTW92ZSB8fCByZW5kZXJpemFibGUub25EcmFnICkge1xuXHRcdFx0XHRpZiAoIHRoaXMuaXNPdmVyUG9seWdvbihyZW5kZXJpemFibGUpICYmIHRoaXMuaXNPdmVyUGl4ZWxQZXJmZWN0KHJlbmRlcml6YWJsZSkgKSB7XG5cdFx0XHRcdFx0dGhpcy5zZWxlY3RlZE9iamVjdCA9IHJlbmRlcml6YWJsZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0VG91Y2gucHJvdG90eXBlLl9zZXRUb3VjaCA9IGZ1bmN0aW9uKHRvdWNoKSB7XG5cdFx0dGhpcy54ID0gdG91Y2gucGFnZVggLSB0b3VjaC50YXJnZXQub2Zmc2V0TGVmdDtcblx0XHR0aGlzLnkgPSB0b3VjaC5wYWdlWSAtIHRvdWNoLnRhcmdldC5vZmZzZXRUb3A7XG5cdFx0dGhpcy5mb3JjZSA9IHRvdWNoLmZvcmNlO1xuXHR9O1xuXHRUb3VjaC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XG5cdFx0aWYgKCB0b3VjaGVzLmxlbmd0aCApIHtcblx0XHRcdHZhciB0b3VjaCA9IHRvdWNoZXNbMF07XG5cdFx0XHR0aGlzLl9zZXRUb3VjaCh0b3VjaCk7XG5cdFx0XHR0aGlzLmV2ZW50cy5zdGFydCA9IHRvdWNoO1xuXHRcdH1cblx0fTtcblx0VG91Y2gucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcztcblx0XHRpZiAoIHRvdWNoZXMubGVuZ3RoICkge1xuXHRcdFx0dmFyIHRvdWNoID0gdG91Y2hlc1swXTtcblx0XHRcdHRoaXMuZXZlbnRzLmVuZCA9IHRvdWNoO1xuXHRcdFx0dGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG5cdFx0XHR0aGlzLnNlbGVjdGVkT2JqZWN0ID0gbnVsbDtcblx0XHR9XG5cdH07XG5cdFRvdWNoLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuXHRcdGlmICggdG91Y2hlcy5sZW5ndGggKSB7XG5cdFx0XHR2YXIgdG91Y2ggPSB0b3VjaGVzWzBdO1xuXHRcdFx0dGhpcy5fc2V0VG91Y2godG91Y2gpO1xuXHRcdFx0dGhpcy5ldmVudHMubW92ZSA9IHRvdWNoO1xuXHRcdH1cblx0fTtcblx0VG91Y2gucHJvdG90eXBlLnN0YXJ0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5ldmVudHMuc3RhcnQ7XG5cdH07XG5cdFRvdWNoLnByb3RvdHlwZS5tb3ZlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmV2ZW50cy5tb3ZlO1xuXHR9O1xuXHRUb3VjaC5wcm90b3R5cGUuZW5kZWQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5ldmVudHMuZW5kO1xuXHR9O1xuXHRUb3VjaC5wcm90b3R5cGUuYW55ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc3RhcnRlZCgpIHx8IHRoaXMubW92ZWQoKSB8fCB0aGlzLmVuZGVkKCk7XG5cdH07XG5cdC8qKlxuXHQgKiBFeGVjdXRlcyB0aGUgZXZlbnRzIG9mIHRoZSBzZWxlY3RlZCBvYmplY3Rcblx0ICogQG1ldGhvZCBmaXJlRXZlbnRPbkxhc3RTZWxlY3RlZE9iamVjdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0VG91Y2gucHJvdG90eXBlLmZpcmVFdmVudE9uTGFzdFNlbGVjdGVkT2JqZWN0ID0gZnVuY3Rpb24oKSB7XG5cblx0XHRpZiAoIHRoaXMuc2VsZWN0ZWRPYmplY3QgKSB7XG5cdFx0XHRpZiAoIHRoaXMuZXZlbnRzLnN0YXJ0ICkge1xuXHRcdFx0XHRpZiAoIHRoaXMuc2VsZWN0ZWRPYmplY3Qub25Ub3VjaCApIHtcblx0XHRcdFx0XHR0aGlzLnNlbGVjdGVkT2JqZWN0Lm9uVG91Y2godGhpcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCB0aGlzLnNlbGVjdGVkT2JqZWN0Lm9uRHJhZyApIHtcblx0XHRcdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHRoaXMuZXZlbnRzLmVuZCAmJiB0aGlzLnNlbGVjdGVkT2JqZWN0Lm9uVG91Y2hFbmQgKSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWRPYmplY3Qub25Ub3VjaEVuZCh0aGlzKTtcblx0XHRcdH1cblx0XHRcdGlmICggdGhpcy5ldmVudHMubW92ZSApIHtcblx0XHRcdFx0aWYgKCB0aGlzLnNlbGVjdGVkT2JqZWN0Lm9uVG91Y2hNb3ZlICkge1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0ZWRPYmplY3Qub25Ub3VjaE1vdmUodGhpcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCB0aGlzLmlzRHJhZ2dpbmcgKSB7XG5cdFx0XHRcdFx0dGhpcy5zZWxlY3RlZE9iamVjdC5vbkRyYWcodGhpcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgd2hldGhlciB0aGUgbW91c2UgaXMgb3ZlciB0aGUgZ2l2ZW4gb2JqZWN0XG5cdCAqIEBtZXRob2QgaXNPdmVyUGl4ZWxQZXJmZWN0XG5cdCAqIEBwYXJhbSB7cmVuZGVyZXJzLlJlbmRlcml6YWJsZX0gcmVuZGVyaXphYmxlXG5cdCAqIEBwYXJhbSB7T25Mb29wUHJvcGVydGllc30gcFxuXHQgKi9cblx0VG91Y2gucHJvdG90eXBlLmlzT3ZlclBpeGVsUGVyZmVjdCA9IGZ1bmN0aW9uKCByZW5kZXJpemFibGUgKSB7XG5cdFx0aWYgKCAhIHJlbmRlcml6YWJsZS5vblJlbmRlciApIHJldHVybjtcblx0XHRpZiAoICEgcmVuZGVyaXphYmxlLl92aXNpYmxlICkgcmV0dXJuO1xuXHRcdHZhciBjdHggPSBNLm9mZlNjcmVlbkNvbnRleHQsXG5cdFx0XHRjbnYgPSBNLm9mZlNjcmVlbkNhbnZhcyxcblx0XHRcdGNhbWVyYSA9IE0uY2FtZXJhO1xuXHRcdGN0eC5zYXZlKCk7XG5cdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCBjbnYud2lkdGgsIGNudi5oZWlnaHQpO1xuXHRcdHJlbmRlcml6YWJsZS5vblJlbmRlcihjdHgsIGNudiwgY2FtZXJhLngsIGNhbWVyYS55KTtcblx0XHR2YXIgaW1nRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEodGhpcy54LCB0aGlzLnksIDEsIDEpO1xuXHRcdGlmICggIWltZ0RhdGEuZGF0YVszXSApIHJldHVybiBmYWxzZTtcblx0XHRpZiAoIGltZ0RhdGEuZGF0YVswXSApIHJldHVybiB0cnVlO1xuXHRcdGlmICggaW1nRGF0YS5kYXRhWzFdICkgcmV0dXJuIHRydWU7XG5cdFx0aWYgKCBpbWdEYXRhLmRhdGFbMl0gKSByZXR1cm4gdHJ1ZTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGdpdmVuIHJlbmRlcml6YWJsZSBvciBub3Rcblx0ICpcblx0ICogQG1ldGhvZCBpc092ZXJQb2x5Z29uXG5cdCAqIEBwYXJhbSB7cmVuZGVyZXJzLlJlbmRlcml6YWJsZX0gcmVuZGVyaXphYmxlXG5cdCAqIEBwYXJhbSB7Q2FtZXJhfSBjYW1lcmFcblx0ICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBtb3VzZSBpcyBvdmVyIHRoaXMgb2JqZWN0IGVsc2UgZmFsc2Vcblx0ICovXG5cdFRvdWNoLnByb3RvdHlwZS5pc092ZXJQb2x5Z29uID0gZnVuY3Rpb24gKHJlbmRlcml6YWJsZSkge1xuXHRcdHZhciBjYW1lcmEgPSBNLmNhbWVyYSxcblx0XHRcdHggPSB0aGlzLnggKyBjYW1lcmEueCxcblx0XHRcdHkgPSB0aGlzLnkgKyBjYW1lcmEueTtcblx0XHRpZiAocmVuZGVyaXphYmxlLl9yb3RhdGlvbikge1xuXHRcdFx0dGhpcy5feCA9IHg7XG5cdFx0XHR0aGlzLl95ID0geTtcblx0XHRcdHJldHVybiBNLmNvbGxpc2lvbnMuUG9seWdvbi5oYXZlQ29sbGlkZWQocmVuZGVyaXphYmxlLCB0aGlzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHJlbmRlcml6YWJsZS5nZXRCb3R0b20oKSA8IHkpIHJldHVybiBmYWxzZTtcblx0XHRcdGlmIChyZW5kZXJpemFibGUuZ2V0VG9wKCkgPiB5KSByZXR1cm4gZmFsc2U7XG5cdFx0XHRpZiAocmVuZGVyaXphYmxlLmdldFJpZ2h0KCkgPCB4KSByZXR1cm4gZmFsc2U7XG5cdFx0XHRpZiAocmVuZGVyaXphYmxlLmdldExlZnQoKSA+IHgpIHJldHVybiBmYWxzZTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fTtcblxuXHRUb3VjaC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRvdWNoU3RhcnRIZWxwZXIsIGZhbHNlKTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgdG91Y2hFbmRIZWxwZXIsIGZhbHNlKTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIHRvdWNoTW92ZUhlbHBlciwgZmFsc2UpO1xuXHRcdE0uc2V0VG91Y2godGhpcyk7XG5cdH07XG5cblx0VG91Y2gucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRvdWNoU3RhcnRIZWxwZXIpO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCB0b3VjaEVuZEhlbHBlcik7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCB0b3VjaE1vdmVIZWxwZXIpO1xuXHRcdE0uc2V0VG91Y2gobnVsbCk7XG5cdH07XG5cblx0aW5zdGFuY2UgPSBuZXcgVG91Y2goKTtcblx0aW5zdGFuY2UuYmluZCgpO1xuXG59KSh3aW5kb3cuTWF0Y2gpOyIsIi8qKlxuICogQG1vZHVsZSBNYXRjaFxuICovXG4oZnVuY3Rpb24oIG5hbWVzcGFjZSApIHtcblxuXHQvKipcblx0ICogUHJvdmlkZXMgdXRpbGl0eSBtZXRob2RzIGZvciBjcmVhdGluZyBzdHJpbmdzIGZyb20gUkdCIGFuZCBSR0JBIGNvbG9yc1xuXHQgKiBhbmQgY29udmVydGluZyBSR0IgdG8gSEVYXG5cdCAqIEBjbGFzcyBDb2xvclxuXHQgKiBAc3RhdGljXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKi9cblx0ZnVuY3Rpb24gQ29sb3IoKSB7XG5cdH1cblx0LyoqXG5cdCAqIFJldHVybnMgYSBTdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBzcGVjaWZpZWQgcmdiIGNvbG9yXG5cdCAqIEBtZXRob2QgcmdiXG5cdCAqIEBwYXJhbSB7Ynl0ZX0gclxuXHQgKiBAcGFyYW0ge2J5dGV9IGdcblx0ICogQHBhcmFtIHtieXRlfSBiXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cblx0ICovXG5cdENvbG9yLnByb3RvdHlwZS5yZ2IgPSBmdW5jdGlvbihyLCBnLCBiKSB7XG5cdFx0cmV0dXJuIFwicmdiKFwiICsgW3IsIGcsIGJdLmpvaW4oXCIsXCIpICsgXCIpXCI7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgU3RyaW5nIHJlcHJlc2VudGluZyB0aGUgc3BlY2lmaWVkIHJnYmEgY29sb3Jcblx0ICogQG1ldGhvZCByZ2JhXG5cdCAqIEBwYXJhbSB7Ynl0ZX0gclxuXHQgKiBAcGFyYW0ge2J5dGV9IGdcblx0ICogQHBhcmFtIHtieXRlfSBiXG5cdCAqIEBwYXJhbSB7Ynl0ZX0gYVxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XG5cdCAqL1xuXHRDb2xvci5wcm90b3R5cGUucmdiYSA9IGZ1bmN0aW9uKHIsIGcsIGIsIGEpIHtcblx0XHRyZXR1cm4gXCJyZ2JhKFwiICsgW3IsIGcsIGIsIGFdLmpvaW4oXCIsXCIpICsgXCIpXCI7XG5cdH07XG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhbiByZ2IgY29sb3IgdG8gaGV4YVxuXHQgKiBAbWV0aG9kIHJnYlRvSGV4XG5cdCAqIEBwYXJhbSB7Ynl0ZX0gclxuXHQgKiBAcGFyYW0ge2J5dGV9IGdcblx0ICogQHBhcmFtIHtieXRlfSBiXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cblx0ICovXG5cdENvbG9yLnByb3RvdHlwZS5yZ2JUb0hleCA9IGZ1bmN0aW9uKHIsIGcsIGIpIHtcblx0XHRyZXR1cm4gXCIjXCIgKyB0aGlzLmNvbXBvbmVudFRvSGV4KHIpICsgdGhpcy5jb21wb25lbnRUb0hleChnKSArIHRoaXMuY29tcG9uZW50VG9IZXgoYik7XG5cdH07XG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIG51bWJlciBmcm9tIDAgdG8gMjU1IHRvIGhleGFcblx0ICogQG1ldGhvZCBjb21wb25lbnRUb0hleFxuXHQgKiBAcGFyYW0ge2J5dGV9IGNcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblx0Q29sb3IucHJvdG90eXBlLmNvbXBvbmVudFRvSGV4ID0gZnVuY3Rpb24oYykge1xuXHRcdHZhciBoZXggPSBjLnRvU3RyaW5nKDE2KTtcblx0XHRyZXR1cm4gaGV4Lmxlbmd0aCA9PSAxID8gXCIwXCIgKyBoZXggOiBoZXg7XG5cdH07XG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhbiBoZXhhIHRvIHJnYlxuXHQgKiBAbWV0aG9kIGhleFRvUmdiXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBoZXhcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblx0Q29sb3IucHJvdG90eXBlLmhleFRvUmdiID0gZnVuY3Rpb24oaGV4KSB7XG5cdFx0dmFyIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuXHRcdHJldHVybiB0aGlzLnJnYihwYXJzZUludChyZXN1bHRbMV0sIDE2KSwgcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksIHBhcnNlSW50KHJlc3VsdFszXSwgMTYpKTtcblx0fTtcbiAgICAvKipcblx0ICogUmV0dXJucyBhIHRyYW5zcGFyZW50IGNvbG9yXG5cdCAqIEBtZXRob2QgYWxwaGFcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblx0Q29sb3IucHJvdG90eXBlLmFscGhhID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMucmdiYSgwLCAwLCAwLCAwKTtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgYSByYW5kb20gcmdiIGNvbG9yXG5cdCAqIEBtZXRob2QgcmFuZG9tXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cblx0ICovXG5cdENvbG9yLnByb3RvdHlwZS5yYW5kb20gPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgbWF0aCA9IHdpbmRvdy5NYXRoO1xuXHRcdHJldHVybiB0aGlzLnJnYihtYXRoLnJvdW5kKG1hdGgucmFuZG9tKCkgKiAyNTUpLCBtYXRoLnJvdW5kKG1hdGgucmFuZG9tKCkgKiAyNTUpLCBtYXRoLnJvdW5kKG1hdGgucmFuZG9tKCkgKiAyNTUpKTtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgYW4gb2JqZWN0IHdpdGggdGhlIGF0dHJpYnV0ZXMgciwgZywgYiBmcm9tIHRoZSBnaXZlbiBhcmd1bWVudFxuXHQgKiBAbWV0aG9kIHJhbmRvbVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gcmdiU3RyaW5nIGEgc3RyaW5nIGNvbnRhaW5pbmcgcmdiIGNvbG9yc1xuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XG5cdFx0ICogQGV4YW1wbGUgXG5cdFx0XHRcdHZhciBvcmFuZ2VDb2xvck9iamVjdCA9IE0uY29sb3IucmdiU3RyaW5nVG9PYmplY3QoXCJyZ2IoMjU1LCAyMDAsIDApXCIpO1xuXHRcdCAqL1xuXHRDb2xvci5wcm90b3R5cGUucmdiU3RyaW5nVG9PYmplY3QgPSBmdW5jdGlvbihyZ2JTdHJpbmcpIHtcblxuXHRcdHZhciBvYmogPSBuZXcgT2JqZWN0KCk7XG5cblx0XHRpZiAoIHJnYlN0cmluZyApIHtcblx0XHRcdHZhciByZWdleFJlc3VsdCA9IHJnYlN0cmluZy5tYXRjaCgvcmdiXFwoXFxzKihcXGR7MSwzfSlcXHMqLFxccyooXFxkezEsM30pXFxzKixcXHMqKFxcZHsxLDN9KVxccypcXCkvKTtcblx0XHRcdGlmICggcmVnZXhSZXN1bHQgKSB7XG5cdFx0XHRcdG9iai5yID0gcGFyc2VJbnQocmVnZXhSZXN1bHRbMV0pO1xuXHRcdFx0XHRvYmouZyA9IHBhcnNlSW50KHJlZ2V4UmVzdWx0WzJdKTtcblx0XHRcdFx0b2JqLmIgPSBwYXJzZUludChyZWdleFJlc3VsdFszXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9iajtcblxuXHR9O1xuXG5cdG5hbWVzcGFjZS5jb2xvciA9IG5ldyBDb2xvcigpO1xuXG59KSggd2luZG93Lk1hdGNoICk7IiwiLyoqXG4gKiBAbW9kdWxlIE1hdGNoXG4gKi9cbihmdW5jdGlvbihNKSB7XG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyByYW5kb20gdmFsdWVzXG5cdCAqXG5cdCAqIEBjbGFzcyBSYW5kb21cblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRmdW5jdGlvbiBSYW5kb20oKSB7XG5cdFx0dGhpcy5tYXRoID0gd2luZG93Lk1hdGg7XG5cdH1cblx0LyoqXG5cdCAqIFJldHVybnMgYSByYW5kb20gaW50ZWdlclxuXHQgKlxuXHQgKiBAbWV0aG9kIGludGVnZXJcblx0ICogQHBhcmFtIHtpbnR9IGZyb21cblx0ICogQHBhcmFtIHtpbnR9IHRvXG5cdCAqIEByZXR1cm4ge2ludH1cblx0ICovXG5cdFJhbmRvbS5wcm90b3R5cGUuaW50ZWdlciA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0aC5mbG9vcih0aGlzLm1hdGgucmFuZG9tKCkgKiAoIHRvIC0gZnJvbSArIDEpICkgKyBmcm9tO1xuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyBhIHJhbmRvbSBkZWNpbWFsXG5cdCAqIEBtZXRob2QgZGVjaW1hbFxuXHQgKiBAcGFyYW0ge2RlY2ltYWx9IGZyb21cblx0ICogQHBhcmFtIHtkZWNpbWFsfSB0b1xuXHQgKiBAcmV0dXJuIHtkZWNpbWFsfVxuXHQgKi9cblx0UmFuZG9tLnByb3RvdHlwZS5kZWNpbWFsID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRoLnJhbmRvbSgpICogKCB0byAtIGZyb20pICsgZnJvbTtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgYSByYW5kb20gYm9vbFxuXHQgKlxuXHQgKiBAbWV0aG9kIGJvb2xlYW5cblx0ICogQHJldHVybiB7Qm9vbGVhbn1cblx0ICovXG5cdFJhbmRvbS5wcm90b3R5cGUuYm9vbCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGgucmFuZG9tKCkgPCAwLjU7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgcmFuZG9tIHNpZ25cblx0ICpcblx0ICogQG1ldGhvZCBzaWduXG5cdCAqIEByZXR1cm4ge2ludH0gMSBvciAtMVxuXHQgKi9cblx0UmFuZG9tLnByb3RvdHlwZS5zaWduID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuYm9vbCgpID8gMSA6IC0xO1xuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyBhIHJhbmRvbSBib29sZWFuIGZyb20gYSB0cnVlIGNoYW5jZSBwZXJjZW50YWdlXG5cdCAqXG5cdCAqIEBtZXRob2QgYm9vbGVhbkZyb21DaGFuY2Vcblx0ICogQHBhcmFtIHtpbnR9IHRydWVDaGFuY2VQZXJjZW50YWdlIDAgdG8gMTAwXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59XG5cdCAqL1xuXHRSYW5kb20ucHJvdG90eXBlLmJvb2xlYW5Gcm9tQ2hhbmNlID0gZnVuY3Rpb24odHJ1ZUNoYW5jZVBlcmNlbnRhZ2UpIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlZ2VyKDAsIDEwMCkgPD0gdHJ1ZUNoYW5jZVBlcmNlbnRhZ2U7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgcmFuZG9tIHJnYiBjb2xvclxuXHQgKlxuXHQgKiBAbWV0aG9kIGNvbG9yXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cblx0ICogQGV4YW1wbGUgXCJNLnJhbmRvbS5yZ2IoMTAwLDEwMCwzMClcIlxuXHQgKi9cblx0UmFuZG9tLnByb3RvdHlwZS5jb2xvciA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBNLmNvbG9yLnJhbmRvbSgpO1xuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyBhIDJkIHBvaW50IGZyb20gYW4gYXJlYVxuXHQgKlxuXHQgKiBAbWV0aG9kIGFyZWFcblx0ICogQHJldHVybiB7T2JqZWN0fVxuXHQgKiBAZXhhbXBsZSBcIk0ucmFuZG9tLmFyZWEoMCwgMCwgMTAwLCAxMClcIlxuXHQgKi9cblx0UmFuZG9tLnByb3RvdHlwZS5hcmVhID0gZnVuY3Rpb24obWluWCwgbWluWSwgbWF4WCwgbWF4WSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHR4OiBNLnJhbmRvbS5pbnRlZ2VyKG1pblgsIG1heFgpLFxuXHRcdFx0eTogTS5yYW5kb20uaW50ZWdlcihtaW5ZLCBtYXhZKVxuXHRcdH1cblx0fTtcbiAgLyoqXG5cdCAqIFJldHVybnMgYSByYW5kb20gc3RyaW5nIGdpdmVuIGEgbGVuZ3RoXG5cdCAqXG5cdCAqIEBtZXRob2Qgc3RyaW5nXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cblx0ICogQGV4YW1wbGUgXCJNLnJhbmRvbS5zdHJpbmcoOClcIlxuXHQgKi9cbiAgUmFuZG9tLnByb3RvdHlwZS5zdHJpbmcgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgICBsZW5ndGggPSBsZW5ndGggfHwgMTY7XG4gICAgdmFyIGNoYXJzID0gXCIwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlwiO1xuICAgIHZhciByZXN1bHQgPSBcIlwiO1xuICAgIGZvciAodmFyIGkgPSBsZW5ndGg7IGkgPiAwOyAtLWkpIHJlc3VsdCArPSBjaGFyc1tNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAoY2hhcnMubGVuZ3RoIC0gMSkpXTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG5cdE0ucmFuZG9tID0gbmV3IFJhbmRvbSgpO1xuXG59KSggd2luZG93Lk1hdGNoICk7IiwiKGZ1bmN0aW9uKG5hbWVzcGFjZSkge1xuXG5cdGlmICggIW5hbWVzcGFjZS5wb3N0UHJvY2VzcyApIG5hbWVzcGFjZS5wb3N0UHJvY2VzcyA9IHt9O1xuXG5cdGZ1bmN0aW9uIE5vUG9zdFByb2Nlc3MoKSB7XG5cdH1cblxuXHROb1Bvc3RQcm9jZXNzLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdFx0cmV0dXJuIGNvbnRleHQuY2FudmFzO1xuXHR9O1xuXG5cdG5hbWVzcGFjZS5wb3N0UHJvY2Vzcy5Ob1Bvc3RQcm9jZXNzID0gTm9Qb3N0UHJvY2VzcztcblxufSkod2luZG93Lk0pO1xuXG4oZnVuY3Rpb24obmFtZXNwYWNlKSB7XG5cblx0aWYgKCAhbmFtZXNwYWNlLnBvc3RQcm9jZXNzICkgbmFtZXNwYWNlLnBvc3RQcm9jZXNzID0ge307XG5cblx0ZnVuY3Rpb24gR3JheVNjYWxlKCkge1xuXHR9XG5cblx0R3JheVNjYWxlLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdFx0dmFyIGltYWdlRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNvbnRleHQuY2FudmFzLndpZHRoLCBjb250ZXh0LmNhbnZhcy5oZWlnaHQpLFxuICAgICAgICAgICAgZCA9IGltYWdlRGF0YS5kYXRhLFxuXHRcdFx0bCA9IGQubGVuZ3RoLFxuXHRcdFx0aSxcblx0XHRcdHIsXG5cdFx0XHRnLFxuXHRcdFx0Yixcblx0XHRcdHY7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGw7IGkgKz0gNCkge1xuXHRcdFx0ciA9IGRbaV07XG5cdFx0XHRnID0gZFtpKzFdO1xuXHRcdFx0YiA9IGRbaSsyXTtcblx0XHRcdC8vIENJRSBsdW1pbmFuY2UgZm9yIHRoZSBSR0Jcblx0XHRcdC8vIFRoZSBodW1hbiBleWUgaXMgYmFkIGF0IHNlZWluZyByZWQgYW5kIGJsdWUsIHNvIHdlIGRlLWVtcGhhc2l6ZSB0aGVtLlxuXHRcdFx0diA9IDAuMjEyNiAqIHIgKyAwLjcxNTIgKiBnICsgMC4wNzIyICogYjtcblx0XHRcdGRbaV0gPSBkW2krMV0gPSBkW2krMl0gPSB2O1xuXHRcdH1cbiAgICAgICAgY29udGV4dC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcblx0XHRyZXR1cm4gY29udGV4dC5jYW52YXM7XG5cdH07XG5cblx0bmFtZXNwYWNlLnBvc3RQcm9jZXNzLkdyYXlTY2FsZSA9IEdyYXlTY2FsZTtcblxufSkod2luZG93Lk0pO1xuXG4oZnVuY3Rpb24obmFtZXNwYWNlKSB7XG5cblx0aWYgKCAhbmFtZXNwYWNlLnBvc3RQcm9jZXNzICkgbmFtZXNwYWNlLnBvc3RQcm9jZXNzID0ge307XG5cblx0ZnVuY3Rpb24gQnJpZ2h0bmVzcyh2YWx1ZSkge1xuICAgICAgICBpZiAoIHZhbHVlID09IHVuZGVmaW5lZCApIHRocm93IG5ldyBFcnJvcihcIkJyaWdodG5lc3MgaGFzIG5vIGNvbnN0cnVjdG9yIHRoYXQgdGFrZXMgbm8gYXJndW1lbnRzLiBZb3UgbXVzdCBzcGVjaWZ5IHRoZSBicmlnaHRuZXNzIHZhbHVlXCIpO1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0fVxuXG5cdEJyaWdodG5lc3MucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0XHR2YXIgaW1hZ2VEYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgY29udGV4dC5jYW52YXMud2lkdGgsIGNvbnRleHQuY2FudmFzLmhlaWdodCksXG4gICAgICAgICAgICBkID0gaW1hZ2VEYXRhLmRhdGE7XG5cdFx0Zm9yICh2YXIgaT0wOyBpPGQubGVuZ3RoOyBpKz00KSB7XG5cdFx0XHRkW2ldICs9IHRoaXMudmFsdWU7XG5cdFx0XHRkW2krMV0gKz0gdGhpcy52YWx1ZTtcblx0XHRcdGRbaSsyXSArPSB0aGlzLnZhbHVlO1xuXHRcdH1cbiAgICAgICAgXG4gICAgICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG5cdFx0cmV0dXJuIGNvbnRleHQuY2FudmFzO1xuXHR9O1xuXG5cdG5hbWVzcGFjZS5wb3N0UHJvY2Vzcy5CcmlnaHRuZXNzID0gQnJpZ2h0bmVzcztcblxufSkod2luZG93Lk0pO1xuXG4oZnVuY3Rpb24obmFtZXNwYWNlKSB7XG5cblx0aWYgKCAhbmFtZXNwYWNlLnBvc3RQcm9jZXNzICkgbmFtZXNwYWNlLnBvc3RQcm9jZXNzID0ge307XG5cblx0ZnVuY3Rpb24gQ29udm9sdXRlKG1hdHJpeCwgb3BhcXVlKSB7XG5cdFx0dGhpcy5tYXRyaXggPSBtYXRyaXg7XG5cdFx0dGhpcy5vcGFxdWUgPSBvcGFxdWU7XG5cdH1cblxuXHRDb252b2x1dGUucHJvdG90eXBlLnNldFNoYXJwZW4gPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm1hdHJpeCA9IFsgMCwgLTEsICAwLCAtMSwgIDUsIC0xLCAwLCAtMSwgIDAgXTtcblx0fTtcblxuXHRDb252b2x1dGUucHJvdG90eXBlLnNldEJsdXIgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm1hdHJpeCA9IFsgMS85LCAxLzksIDEvOSwgMS85LCAxLzksIDEvOSwgMS85LCAxLzksIDEvOSBdO1xuXHR9O1xuXG5cdENvbnZvbHV0ZS5wcm90b3R5cGUuc2V0Q29udG91ciA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubWF0cml4ID0gWyAxLCAxLCAxLCAxLCAwLjcsIC0xLCAtMSwgLTEsIC0xIF07XG5cdH07XG5cblx0Q29udm9sdXRlLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgICAgIGlmICggIXRoaXMubWF0cml4ICkgcmV0dXJuO1xuXHRcdHZhciBzaWRlID0gTWF0aC5yb3VuZChNYXRoLnNxcnQodGhpcy5tYXRyaXgubGVuZ3RoKSk7XG5cdFx0dmFyIGhhbGZTaWRlID0gTWF0aC5mbG9vcihzaWRlLzIpO1xuICAgICAgICB2YXIgaW1nRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNvbnRleHQuY2FudmFzLndpZHRoLCBjb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuXHRcdHZhciBzcmMgPSBpbWdEYXRhLmRhdGE7XG5cdFx0dmFyIHN3ID0gaW1nRGF0YS53aWR0aDtcblx0XHR2YXIgc2ggPSBpbWdEYXRhLmhlaWdodDtcblx0XHQvLyBwYWQgb3V0cHV0IGJ5IHRoZSBjb252b2x1dGlvbiBtYXRyaXhcblx0XHR2YXIgdyA9IHN3O1xuXHRcdHZhciBoID0gc2g7XG4gICAgICAgIC8vVE9ETzogQ3JlYXRlIGEgYnVmZmVyIGZvciBkZXN0aW5hdGlvblxuXHRcdHZhciBpbWFnZURhdGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgaW1hZ2VEYXRhLmNhbnZhcy53aWR0aCA9IGltZ0RhdGEud2lkdGg7XG4gICAgICAgIGltYWdlRGF0YS5jYW52YXMuaGVpZ2h0ID0gaW1nRGF0YS5oZWlnaHQ7XG4gICAgICAgIHZhciBkYXRhID0gaW1hZ2VEYXRhLmdldEltYWdlRGF0YSgwLCAwLCBpbWdEYXRhLndpZHRoLCBpbWdEYXRhLmhlaWdodCk7XG5cdFx0dmFyIGRzdCA9IGRhdGEuZGF0YTtcblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBkZXN0aW5hdGlvbiBpbWFnZSBwaXhlbHNcblx0XHR2YXIgYWxwaGFGYWMgPSB0aGlzLm9wYXF1ZSA/IDEgOiAwO1xuXHRcdGZvciAodmFyIHk9MDsgeTxoOyB5KyspIHtcblx0XHRcdGZvciAodmFyIHg9MDsgeDx3OyB4KyspIHtcblx0XHRcdFx0dmFyIHN5ID0geTtcblx0XHRcdFx0dmFyIHN4ID0geDtcblx0XHRcdFx0dmFyIGRzdE9mZiA9ICh5KncreCkqNDtcblx0XHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSB3ZWlnaGVkIHN1bSBvZiB0aGUgc291cmNlIGltYWdlIHBpeGVscyB0aGF0XG5cdFx0XHRcdC8vIGZhbGwgdW5kZXIgdGhlIGNvbnZvbHV0aW9uIG1hdHJpeFxuXHRcdFx0XHR2YXIgcj0wLCBnPTAsIGI9MCwgYT0wO1xuXHRcdFx0XHRmb3IgKHZhciBjeT0wOyBjeTxzaWRlOyBjeSsrKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgY3g9MDsgY3g8c2lkZTsgY3grKykge1xuXHRcdFx0XHRcdFx0dmFyIHNjeSA9IHN5ICsgY3kgLSBoYWxmU2lkZTtcblx0XHRcdFx0XHRcdHZhciBzY3ggPSBzeCArIGN4IC0gaGFsZlNpZGU7XG5cdFx0XHRcdFx0XHRpZiAoc2N5ID49IDAgJiYgc2N5IDwgc2ggJiYgc2N4ID49IDAgJiYgc2N4IDwgc3cpIHtcblx0XHRcdFx0XHRcdFx0dmFyIHNyY09mZiA9IChzY3kqc3crc2N4KSo0O1xuXHRcdFx0XHRcdFx0XHR2YXIgd3QgPSB0aGlzLm1hdHJpeFtjeSpzaWRlK2N4XTtcblx0XHRcdFx0XHRcdFx0ciArPSBzcmNbc3JjT2ZmXSAqIHd0O1xuXHRcdFx0XHRcdFx0XHRnICs9IHNyY1tzcmNPZmYrMV0gKiB3dDtcblx0XHRcdFx0XHRcdFx0YiArPSBzcmNbc3JjT2ZmKzJdICogd3Q7XG5cdFx0XHRcdFx0XHRcdGEgKz0gc3JjW3NyY09mZiszXSAqIHd0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRkc3RbZHN0T2ZmXSA9IHI7XG5cdFx0XHRcdGRzdFtkc3RPZmYrMV0gPSBnO1xuXHRcdFx0XHRkc3RbZHN0T2ZmKzJdID0gYjtcblx0XHRcdFx0ZHN0W2RzdE9mZiszXSA9IGEgKyBhbHBoYUZhYyooMjU1LWEpO1xuXHRcdFx0fVxuXHRcdH1cbiAgICAgICAgY29udGV4dC5wdXRJbWFnZURhdGEoZGF0YSwgMCwgMCk7XG5cdFx0cmV0dXJuIGNvbnRleHQuY2FudmFzO1xuXHR9O1xuXG5cdG5hbWVzcGFjZS5wb3N0UHJvY2Vzcy5Db252b2x1dGUgPSBDb252b2x1dGU7XG5cbn0pKHdpbmRvdy5NKTsiLCIvKipcbiAqIEBtb2R1bGUgTWF0Y2hcbiAqL1xuKGZ1bmN0aW9uKE0pIHtcblxuXHQvKipcblx0ICogQSBnYW1lIGxheWVyIGlzIGxpa2UgYW4gb2Zmc2NyZWVuIGNhbnZhcyB3aGVyZSBhbGwgcmVuZGVyaXphYmxlIG9iamVjdHMsIHRoYXQgaXMgb2JqZWN0cyB0aGF0IGltcGxlbWVudCBhblxuXHQgKiBvblJlbmRlciBtZXRob2QsIGFyZSBwdXQgdG9nZXRoZXIgZm9yIHJlbmRlcmluZy4gR2FtZSBsYXllcnMgY2FuIGJlIGFwcGxpZWQgcHJvcGVydGllcyBsaWtlIGFscGhhIG9yIHNjYWxpbmcuXG5cdCAqIEFsbCByZW5kZXJpbmcgdGFrZXMgcGxhY2UgaW4gYSBidWZmZXIgd2hpY2ggcmVzdWx0IGlzIHRoZW4gcmVuZGVyZWQgdG8gdGhlIG1haW4gY2FudmFzLlxuXHQgKiBOT1RFOiBZb3UgbmVlZCBhdCBsZWFzdCBvbmUgbGF5ZXIgaW4geW91ciBnYW1lXG5cdCAqIEBjbGFzcyBHYW1lTGF5ZXJcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRmdW5jdGlvbiBHYW1lTGF5ZXIobmFtZSwgekluZGV4KSB7XG5cdFx0LyoqXG5cdFx0ICogQXJyYXkgb2YgUmVuZGVyaXphYmxlc1xuXHRcdCAqIEBwcm9wZXJ0eSBvblJlbmRlckxpc3Rcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEB0eXBlIEFycmF5XG5cdFx0ICovXG5cdFx0dGhpcy5vblJlbmRlckxpc3QgPSBbXTtcblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhpcyBsYXllciBuZWVkcyB0byBiZSByZWRyYXduIG9yIG5vdFxuXHRcdCAqL1xuXHRcdHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuXHRcdC8qKlxuXHRcdCAqIERldGVybWluZXMgd2hldGhlciB0aGUgb2JqZWN0cyBpbiB0aGlzIGxheWVyIG5lZWRzIHRvIGJlIHNvcnRlZCBhZ2FpblxuXHRcdCAqL1xuXHRcdHRoaXMubmVlZHNTb3J0aW5nID0gZmFsc2U7XG5cdFx0LyoqXG5cdFx0ICogb2JqZWN0IHJvdGF0aW9uXG5cdFx0ICogQHByb3BlcnR5IHJvdGF0aW9uXG5cdFx0ICogQHR5cGUgZmxvYXRcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHR0aGlzLnJvdGF0aW9uID0gTWF0aC5QSTtcblx0XHQgKi9cbiAgICB0aGlzLnJvdGF0aW9uID0gbnVsbDtcblx0XHQvKipcblx0XHQgKiBvYmplY3Qgc2NhbGUgZmFjdG9yXG5cdFx0ICogQHByb3BlcnR5IHNjYWxlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5zY2FsZSA9IHsgeDogMSwgeTogMSB9O1xuXHRcdCAqL1xuICAgIHRoaXMuc2NhbGUgPSBudWxsO1xuXHRcdC8qKlxuXHRcdCAqIENvbXBvc2l0ZSBvcGVyYXRpb24uXG5cdFx0ICogUG9zc2libGUgdmFsdWVzOiBcInNvdXJjZS1vdmVyXCIgfCBcInNvdXJjZS1pblwiIHwgXCJzb3VyY2Utb3V0XCIgfCBcInNvdXJjZS1hdG9wXCIgfCBcImRlc3RpbmF0aW9uLW92ZXJcIiB8IFwiZGVzdGluYXRpb24taW5cIiB8IFwiZGVzdGluYXRpb24tb3V0XCIgfCBcImRlc3RpbmF0aW9uLWF0b3BcIiB8IFwibGlnaHRlclwiIHwgXCJkYXJrZXJcIiB8IFwiY29weVwiIHwgXCJ4b3JcIlxuXHRcdCAqIEBwcm9wZXJ0eSBvcGVyYXRpb25cblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHR0aGlzLm9wZXJhdGlvbiA9IFwic291cmNlLWluXCI7XG5cdFx0ICovXG5cdFx0dGhpcy5vcGVyYXRpb24gPSBudWxsO1xuXHRcdC8qKlxuXHRcdCAqIG9iamVjdCB0cmFuc3BhcmVuY3lcblx0XHQgKiBAcHJvcGVydHkgYWxwaGFcblx0XHQgKiBAdHlwZSBmbG9hdCB2YWx1ZSBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMVxuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdHRoaXMuYWxwaGEgPSAwLjU7XG5cdFx0ICovXG5cdFx0dGhpcy5fYWxwaGE7XG5cdFx0LyoqXG5cdFx0ICogb2JqZWN0IHZpc2liaWxpdHkuIERldGVybWluZXMgd2hldGhlciB0aGUgb2JqZWN0IHdpbGwgYmUgcmVuZGVyZWQgb3Igbm90XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX3Zpc2libGVcblx0XHQgKiBAdHlwZSBCb29sZWFuXG5cdFx0ICovXG5cdFx0dGhpcy5fdmlzaWJsZSA9IHRydWU7XG5cdFx0LyoqXG5cdFx0ICogUGFycmFsbGF4IGZhY3RvciBpcyB1c2VkIGZvciBwYXJyYWxheCBzY3JvbGxpbmcuIFRoZSBvYmplY3QgeCBhbmQgeSBjb29yZGluYXRlcyBhcmUgbXVsdGlwbGllZCBieSB0aGUgY2FtZXJhIHBvc2l0aW9uIHRvIHRyYW5zbGF0ZSB0aGUgc2NlbmUgaW4gZGlmZmVyZW50IHNwZWVkc1xuXHRcdCAqIEBwcm9wZXJ0eSBwYXJyYWxsYXhGYWN0b3Jcblx0XHQgKiBAdHlwZSBPYmplY3Qgb2JqZWN0IHRoYXQgY29udGFpbnMgZmxvYXRzIHggYW5kIHlcblx0XHQgKiBAZGVmYXVsdCB7eDogMSwgeTogMX1cblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHR2YXIgbGF5ZXIgPSBuZXcgTS5HYW1lTGF5ZXIoKTtcblx0XHRcdFx0bGF5ZXIucGFycmFsbGF4RmFjdG9yLnggPSAxLjI1OyAvL01vdmUgZmFzdGVyIGluIHRoZSB4IGF4aXNcblx0XHQgKi9cblx0XHR0aGlzLnBhcnJhbGxheEZhY3RvciA9IHtcblx0XHRcdHg6IDEsIHk6IDFcblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogQXJyYXkgdGhhdCBjb250YWlucyBhbmltYXRpb25zIGZvciB0aGlzIG9iamVjdFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHByb3BlcnR5IF9vbkxvb3BBbmltYXRpb25zXG5cdFx0ICogQHR5cGUgQXJyYXlcblx0XHQgKi9cblx0XHR0aGlzLl9vbkxvb3BBbmltYXRpb25zID0gW107XG5cdFx0LyoqXG5cdFx0ICogTmFtZSBvZiB0aGUgbGF5ZXJcblx0XHQgKiBAcHJvcGVydHkgbmFtZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdHRoaXMubmFtZSA9IG5hbWUgfHwgXCJsYXllclwiICsgTS5fZ2FtZUxheWVycy5sZW5ndGg7XG5cdFx0LyoqXG5cdFx0ICogei1pbmRleCBvZiB0aGlzIGxheWVyLiBNYXRjaCB1c2VzIHRoaXMgYXR0cmlidXRlIHRvIHNvcnQgdGhlIGxheWVyc1xuXHRcdCAqIEBwcm9wZXJ0eSBfekluZGV4XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAdHlwZSB7aW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuX3pJbmRleCA9IHpJbmRleCB8fCAwO1xuICAgIC8qKlxuXHQgICAqIFNldHMgdGhlIGJhY2tncm91bmQgb2YgdGhlIGJ1ZmZlclxuXHQgICAqXG5cdCAgICogQG1ldGhvZCBzZXRCYWNrZ3JvdW5kXG5cdCAgICogQHBhcmFtIHtTdHJpbmd9IGJhY2tncm91bmQgYSBjb2xvciwgc3ByaXRlIG5hbWUgb3IgbnVsbFxuXHQgICAqIEBleGFtcGxlXG5cdFx0ICAgdGhpcy5iYWNrZ3JvdW5kID0gXCJibGFja1wiO1xuXHRcdFx0IHRoaXMuYmFja2dyb3VuZCA9IFwicmdiKDAsIDEwMCwgMTAwKVwiO1xuXHRcdFx0IHRoaXMuYmFja2dyb3VuZCA9IFwic2t5U3ByaXRlXCI7XG5cdFx0XHQgdGhpcy5iYWNrZ3JvdW5kID0gbnVsbDsgLy9zZXRzIGRlZmF1bHQgYmFja2dyb3VuZFxuXHQgICAqL1xuXHRcdHRoaXMuYmFja2dyb3VuZCA9IG51bGw7XG5cblx0XHR0aGlzLlRZUEUgPSBNLnJlbmRlcml6YWJsZXMuVFlQRVMuTEFZRVI7XG5cblx0fVxuXHQvKipcblx0ICogTG9vcHMgdGhyb3VnaCB0aGUgYW5pbWF0aW9ucyBvZiB0aGUgb2JqZWN0XG5cdCAqIEBwcml2YXRlXG5cdCAqIEBtZXRob2QgX2xvb3BUaHJvdWdoQW5pbWF0aW9uc1xuXHQgKi9cblx0R2FtZUxheWVyLnByb3RvdHlwZS5fbG9vcFRocm91Z2hBbmltYXRpb25zID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGkgPSAwLFxuXHRcdGwgPSB0aGlzLl9vbkxvb3BBbmltYXRpb25zLmxlbmd0aDtcblx0XHRmb3IgKDsgaSA8IGw7IGkrKykge1xuXHRcdFx0aWYgKCF0aGlzLl9vbkxvb3BBbmltYXRpb25zW2ldLm9uTG9vcCgpKSB7XG5cdFx0XHRcdHRoaXMuX29uTG9vcEFuaW1hdGlvbnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHRyYW5zcGFyZW5jeSBvZiB0aGUgb2JqZWN0XG5cdCAqIEBtZXRob2Qgc2V0QWxwaGFcblx0ICogQHBhcmFtIHtmbG9hdH0gdmFsdWUgYWxwaGEgdmFsdWUgdG8gc2V0LiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMVxuXHQgKi9cblx0R2FtZUxheWVyLnByb3RvdHlwZS5zZXRBbHBoYSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5fYWxwaGEgPSB2YWx1ZTtcblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIHRyYW5zcGFyZW5jeSBvZiB0aGUgb2JqZWN0XG5cdCAqIEBtZXRob2QgZ2V0QWxwaGFcblx0ICogQHBhcmFtIHtmbG9hdH0gdmFsdWUgYWxwaGEgdmFsdWVcblx0ICovXG5cdEdhbWVMYXllci5wcm90b3R5cGUuZ2V0QWxwaGEgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fYWxwaGE7XG5cdH07XG5cdC8qKlxuXHQgKiBBZGRzIGEgZmFkZSBpbiBhbmltYXRpb24gdG8gdGhpcyBvYmplY3Rcblx0ICogQG1ldGhvZCBmYWRlSW5cblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgdGltZSBpbiBzZWNvbmRzIHRoYXQgdGhlIGZhZGUgaW4gd2lsbCB0YWtlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9uRmluaXNoZWQgZnVuY3Rpb24gdG8gY2FsbCBvbmNlIHRoZSBhbmltYXRpb24gZmluaXNoZXNcblx0ICovXG5cdEdhbWVMYXllci5wcm90b3R5cGUuZmFkZUluID0gZnVuY3Rpb24oc2Vjb25kcywgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuX29uTG9vcEFuaW1hdGlvbnMucHVzaChuZXcgTS5lZmZlY3RzLnZpc3VhbC5GYWRlSW4odGhpcywgc2Vjb25kcywgb25GaW5pc2hlZCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogQWRkcyBhIGZhZGUgb3V0IGFuaW1hdGlvbiB0byB0aGlzIG9iamVjdFxuXHQgKiBAbWV0aG9kIGZhZGVPdXRcblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgdGltZSBpbiBzZWNvbmRzIHRoYXQgdGhlIGZhZGUgb3V0IHdpbGwgdGFrZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZpbmlzaGVkIGZ1bmN0aW9uIHRvIGNhbGwgb25jZSB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzXG5cdCAqL1xuXHRHYW1lTGF5ZXIucHJvdG90eXBlLmZhZGVPdXQgPSBmdW5jdGlvbihzZWNvbmRzLCBvbkZpbmlzaGVkKSB7XG5cdFx0dGhpcy5fb25Mb29wQW5pbWF0aW9ucy5wdXNoKG5ldyBNLmVmZmVjdHMudmlzdWFsLkZhZGVPdXQodGhpcywgc2Vjb25kcywgb25GaW5pc2hlZCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHRHYW1lTGF5ZXIucHJvdG90eXBlLmNvbnRpbm91c0ZhZGUgPSBmdW5jdGlvbiAoc2Vjb25kcywgZmFkZU91dEZpcnN0LCBtaW4sIG1heCkge1xuXHRcdHRoaXMuX29uTG9vcEFuaW1hdGlvbnMucHVzaChuZXcgTS5lZmZlY3RzLnZpc3VhbC5Db250aW5vdXNGYWRlKHRoaXMsIHNlY29uZHMsIGZhZGVPdXRGaXJzdCwgbWluLCBtYXgpKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblx0LyoqXG5cdCAqIExvb3BzIHRocm91Z2ggZXZlcnkgcmVuZGVyaXphYmxlIGFuZCByZW5kZXJpemVzIGl0IGlmIGl0IGlzIHZpc2libGVcblx0ICogQG1ldGhvZCBvbkxvb3Bcblx0ICogQHByb3RlY3RlZFxuXHQgKiBAcGFyYW0ge09iamVjdH0gcCBjb250YWlucyBpbmZvcm1hdGlvbiBsaWtlIGlmIGl0IGlzIHJlcXVpcmVkIHRvIGRlYnVnXG5cdCAqIEByZXR1cm4ge0hUTUxDYW52YXNFbGVtZW50fSBhIGNhbnZhcyBjb250YW5pbmcgdGhlIHJlc3VsdCBvZiB0aGUgcmVuZGVyaW5nXG5cdCAqL1xuXHRHYW1lTGF5ZXIucHJvdG90eXBlLm9uTG9vcCA9IGZ1bmN0aW9uKHApIHtcblx0fTtcblx0LyoqXG5cdCAqIEFkZHMgdGhpcyBsYXllciB0byBNYXRjaCBsaXN0IG9mIGxheWVyc1xuXHQgKiBAbWV0aG9kIGFkZFRvR2FtZVxuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dmFyIGxheWVyID0gbmV3IE0uR2FtZUxheWVyKCk7XG5cdFx0XHRsYXllci5hZGRUb0dhbWUoKTtcblx0ICovXG5cdEdhbWVMYXllci5wcm90b3R5cGUuYWRkVG9HYW1lID0gZnVuY3Rpb24oKSB7XG5cdFx0TS5wdXNoR2FtZUxheWVyKHRoaXMpO1xuXHR9O1xuXHQvKipcblx0ICogVGVsbHMgdGhlIGxheWVyIGFib3V0IGEgY2hhbmdlIGluIHNvbWUgYXR0cmlidXRlIG9mIG9uZSBvZiBpdHMgcmVuZGVyaXphYmxlc1xuXHQgKiBAbWV0aG9kIHJlbmRlcml6YWJsZUNoYW5nZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEdhbWVMYXllci5wcm90b3R5cGUucmVuZGVyaXphYmxlQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuXHR9O1xuXHQvKipcblx0ICogVGVsbHMgdGhlIGxheWVyIGFib3V0IGEgY2hhbmdlIGluIHRoZSB6LWluZGV4IG9mIG9uZSBvZiBpdHMgcmVuZGVyaXphYmxlc1xuXHQgKiBAbWV0aG9kIHpJbmRleENoYW5nZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEdhbWVMYXllci5wcm90b3R5cGUuekluZGV4Q2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubmVlZHNTb3J0aW5nID0gdHJ1ZTtcblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHotaW5kZXggb2YgdGhpcyBsYXllciBhbmQgbWFrZXMgTWF0Y2ggc29ydCB0aGUgbGF5ZXJzIGFjY29yZGluZ2x5XG5cdCAqIEBtZXRob2Qgc2V0WkluZGV4XG5cdCAqL1xuXHRHYW1lTGF5ZXIucHJvdG90eXBlLnNldFpJbmRleCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5fekluZGV4ID0gdmFsdWU7XG5cdFx0TS5zb3J0TGF5ZXJzKCk7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB6LWluZGV4IG9mIHRoaXMgbGF5ZXJcblx0ICogQG1ldGhvZCBnZXRaSW5kZXhcblx0ICovXG5cdEdhbWVMYXllci5wcm90b3R5cGUuZ2V0WkluZGV4ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3pJbmRleDtcblx0fTtcblx0LyoqXG5cdCAqIFB1c2hlcyBhbiBvYmplY3QgaW50byB0aGUgb25SZW5kZXJMaXN0XG5cdCAqIEBtZXRob2QgcHVzaFxuXHQgKiBAcGFyYW0ge3JlbmRlcmVycy5SZW5kZXJpemFibGV9IG9iamVjdFxuXHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG5cdCAqIEBwYXJhbSB7aW50fSB6SW5kZXhcblx0ICogQGV4YW1wbGVcblx0XHRcdHRoaXMucHVzaChuZXcgU3ByaXRlKFwibmluamFcIiksIFwibmluamFcIiwgMTApO1xuXHQgKi9cblx0R2FtZUxheWVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihlbnRpdHksIGtleSwgekluZGV4KSB7XG5cblx0XHRpZiAoICEgZW50aXR5ICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHB1c2ggbnVsbCBlbnRpdHkgdG8gZ2FtZSBsYXllclwiKTtcblx0XHR9XG5cblx0XHRpZiAoICFlbnRpdHkuc2V0WkluZGV4ICkge1xuXHRcdFx0Ly8gTS5sb2dnZXIud2FybihNLmdldE9iamVjdE5hbWUoZW50aXR5KSArIFwiIGRvZXMgbm90IGltcGxlbWVudCBzZXRaSW5kZXggbWV0aG9kXCIpO1xuXHRcdH1cblxuXHRcdGlmICggIWVudGl0eS5nZXRaSW5kZXggKSB7XG5cdFx0XHQvLyBNLmxvZ2dlci53YXJuKE0uZ2V0T2JqZWN0TmFtZShlbnRpdHkpICsgXCIgZG9lcyBub3QgaW1wbGVtZW50IGdldFpJbmRleCBtZXRob2RcIik7XG5cdFx0fVxuXG5cdFx0aWYgKCAhZW50aXR5Ll96SW5kZXggKSB7XG5cdFx0XHRlbnRpdHkuX3pJbmRleCA9IHRoaXMub25SZW5kZXJMaXN0Lmxlbmd0aDtcblx0XHR9XG5cblx0XHRpZiAoIGVudGl0eS5vbkxvYWQgKSB7XG5cdFx0XHRlbnRpdHkub25Mb2FkKCk7XG5cdFx0fVxuXG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0b25DaGFuZ2UgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi5uZWVkc1JlZHJhdyA9IHRydWU7XG5cdFx0XHR9O1xuXHRcdFxuXHRcdGVudGl0eS52aWV3cy5lYWNoVmFsdWUoZnVuY3Rpb24odmlldykge1xuXHRcdFx0dmlldy5hZGRFdmVudExpc3RlbmVyKFwiYXR0cmlidXRlQ2hhbmdlZFwiLCBvbkNoYW5nZSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLm5lZWRzU29ydGluZyA9IHRydWU7XG5cblx0XHR0aGlzLm9uUmVuZGVyTGlzdC5wdXNoKGVudGl0eSk7XG5cblx0XHQvL1RPRE86IFdlIG5lZWQgdG8ga25vdyB3aGljaCBvYmplY3RzIHdlcmUgYWRkZWQgc28gaWYgdGhleSB3ZXJlIG91dHNpZGUgdGhlIHZpZXdwb3J0IHdlIG11c3Qgbm90IHJlIHJlbmRlclxuXHRcdHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuXG5cdFx0TS5yYWlzZShcImdhbWVPYmplY3RQdXNoZWRUb0xheWVyXCIsIGVudGl0eSk7XG5cblx0fTtcblx0R2FtZUxheWVyLnByb3RvdHlwZS5wdXNoID0gR2FtZUxheWVyLnByb3RvdHlwZS5hZGQ7XG5cdC8qKlxuXHQgKiBTb3J0cyB0aGUgb25SZW5kZXJMaXN0IGJ5IHRoZSBlbGVtZW50cyB6SW5kZXhcblx0ICogQG1ldGhvZCBzb3J0XG5cdCAqL1xuXHRHYW1lTGF5ZXIucHJvdG90eXBlLnNvcnQgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9uUmVuZGVyTGlzdC5zb3J0KHRoaXMuX3NvcnRGdW5jdGlvbik7XG5cdH07XG5cdC8qKlxuXHQgKiBTb3J0IGxvZ2ljIGJhc2VkIG9uIHpJbmRleFxuXHQgKiBAbWV0aG9kIF9zb3J0RnVuY3Rpb25cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtyZW5kZXJlcnMuUmVuZGVyaXphYmxlfSBhXG5cdCAqIEBwYXJhbSB7cmVuZGVyZXJzLlJlbmRlcml6YWJsZX0gYlxuXHQgKiBAcmV0dXJuIHtpbnR9IHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHpJbmRleCBvZiB0aGUgZ2l2ZW4gb2JqZWN0c1xuXHQgKi9cblx0R2FtZUxheWVyLnByb3RvdHlwZS5fc29ydEZ1bmN0aW9uID0gZnVuY3Rpb24oYSwgYikge1xuXHRcdHJldHVybiBhLl96SW5kZXggLSBiLl96SW5kZXg7XG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBmaXJzdCBlbGVtZW50IGZyb20gdGhlIG9uUmVuZGVyTGlzdFxuXHQgKiBAbWV0aG9kIGdldEZpcnN0XG5cdCAqIEByZXR1cm4ge3JlbmRlcmVycy5SZW5kZXJpemFibGV9IHRoZSBmaXJzdCBnYW1lIG9iamVjdCBpbiB0aGUgbGlzdCBvciBudWxsIGlmIHRoZSBsaXN0IGlzIGVtcHR5XG5cdCAqL1xuXHRHYW1lTGF5ZXIucHJvdG90eXBlLmdldEZpcnN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW5kZXgoMCk7XG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBlbGVtZW50IG1hdGNoaW5nIHRoZSBwcm92aWRlZCBpbmRleFxuXHQgKiBAbWV0aG9kIGdldEluZGV4XG5cdCAqIEByZXR1cm4ge3JlbmRlcmVycy5SZW5kZXJpemFibGV9IHRoZSBnYW1lIG9iamVjdCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4IG9yIG51bGwgaWYgaXQgaXMgbm90IGluIHRoZSBsaXN0XG5cdCAqL1xuXHRHYW1lTGF5ZXIucHJvdG90eXBlLmdldEluZGV4ID0gZnVuY3Rpb24oIGluZGV4ICkge1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vblJlbmRlckxpc3RbIGluZGV4IF07XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgZWxlbWVudCBtYXRjaGluZyB0aGUgcHJvdmlkZWQga2V5XG5cdCAqIEBtZXRob2QgZ2V0XG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcblx0ICogQHJldHVybiB7cmVuZGVyZXJzLlJlbmRlcml6YWJsZX0gdGhlIG9iamVjdCBtYXRjaGluZyB0aGUgcHJvdmlkZWQga2V5IG9yIG51bGwgaWYgaXQgaXMgbm90IGluIHRoZSBsaXN0XG5cdCAqIEBleGFtcGxlXG5cdCBcblx0XHRcdHZhciBsYXllciA9IG5ldyBNLkdhbWVMYXllcigpLFxuXHRcdFx0XHRuaW5qYSA9IG5ldyBTcHJpdGUoXCJuaW5qYVwiKTtcblx0XHRcdFxuXHRcdFx0bGF5ZXIucHVzaChuaW5qYSwgXCJuaW5qYVwiKTtcblx0IFxuXHRcdFx0dmFyIHRoZU5pbmphID0gbGF5ZXIuZ2V0KFwibmluamFcIik7XG5cdFx0XHRcblx0XHRcdGFsZXJ0KG5pbmphID09IHRoZU5pbmphKSAvL3dpbGwgeWllbGQgdHJ1ZVxuXHRcdFx0XG5cdCAqL1xuXHRHYW1lTGF5ZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuXG5cdFx0aWYgKCB0aGlzLmNhY2hlICYmIHRoaXMuY2FjaGUua2V5ID09IGtleSApIHtcblx0XHRcdHJldHVybiB0aGlzLmNhY2hlO1xuXHRcdH1cblxuXHRcdHZhciBpID0gdGhpcy5vblJlbmRlckxpc3QubGVuZ3RoLCBcblx0XHRcdGN1cnJlbnQ7XG5cblx0XHR3aGlsZSAoIGktLSApIHtcblx0XHRcdGN1cnJlbnQgPSB0aGlzLm9uUmVuZGVyTGlzdFtpXTtcblx0XHRcdGlmICgga2V5ID09IGN1cnJlbnQua2V5ICkge1xuXHRcdFx0XHR0aGlzLmNhY2hlID0gY3VycmVudDtcblx0XHRcdFx0cmV0dXJuIGN1cnJlbnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBudWxsO1xuXG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBsYXN0IGVsZW1lbnQgZnJvbSB0aGUgb25SZW5kZXJMaXN0XG5cdCAqIEBtZXRob2QgZ2V0TGFzdFxuXHQgKiBAcmV0dXJuIHtyZW5kZXJlcnMuUmVuZGVyaXphYmxlfSB0aGUgbGFzdCByZW5kZXJpemFibGUgaW4gdGhlIGxpc3Qgb3IgbnVsbCBpZiB0aGUgbGlzdCBpcyBlbXB0eVxuXHQgKi9cblx0R2FtZUxheWVyLnByb3RvdHlwZS5nZXRMYXN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW5kZXgoIHRoaXMub25SZW5kZXJMaXN0Lmxlbmd0aCAtIDEgKTtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCBpcyBpbiB0aGUgb25SZW5kZXJMaXN0IGFuZCBmYWxzZSBpZiBub3Rcblx0ICogQG1ldGhvZCBpc29uUmVuZGVyTGlzdFxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIHRoZSBvYmplY3QgaW4gaW4gdGhlIGxpc3Qgb3IgZmFsc2UgaWYgbm90XG5cdCAqL1xuXHRHYW1lTGF5ZXIucHJvdG90eXBlLmlzT25SZW5kZXJMaXN0ID0gZnVuY3Rpb24ob2JqZWN0KSB7XG5cdFx0cmV0dXJuIHRoaXMub25SZW5kZXJMaXN0LmluZGV4T2Yob2JqZWN0KSAhPSAtMTtcblx0fTtcblx0LyoqXG5cdCAqIFJlbW92ZXMgYW4gZWxlbWVudCBmcm9tIHRoZSBvblJlbmRlckxpc3Rcblx0ICogQG1ldGhvZCByZW1vdmVcblx0ICogQHBhcmFtIHtyZW5kZXJlcnMuUmVuZGVyaXphYmxlfSBvYmplY3QgdGhlIG9iamVjdCB0byByZW1vdmVcblx0ICogQGV4YW1wbGVcblx0XHRcdC8vQ3JlYXRlIGEgc3ByaXRlXG5cdFx0XHR2YXIgbmluamEgPSBuZXcgU3ByaXRlKFwibmluamFcIik7XG5cdFx0XHRcblx0XHRcdC8vQWRkIHRoZSBzcHJpdGVcblx0XHRcdGdhbWVMYXllci5wdXNoKG5pbmphKTtcblx0XHRcdFxuXHRcdFx0Ly9SZW1vdmUgdGhlIHNwcml0ZVxuXHRcdFx0Z2FtZUxheWVyLnJlbW92ZShuaW5qYSk7XG5cdCAqL1xuXHRHYW1lTGF5ZXIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCBvYmplY3QgKSB7XG5cblx0XHRpZiAoICEgb2JqZWN0ICkgcmV0dXJuO1xuXG5cdFx0aWYgKCB0eXBlb2Ygb2JqZWN0ID09IFwic3RyaW5nXCIgKSB7XG5cblx0XHRcdHRoaXMucmVtb3ZlKCB0aGlzLmdldCggb2JqZWN0ICkgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHZhciBpID0gdGhpcy5vblJlbmRlckxpc3QuaW5kZXhPZiggb2JqZWN0ICk7XG5cblx0XHRcdGlmICggaSA+IC0xICkge1xuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5vblJlbmRlckxpc3Quc3BsaWNlKCBpLCAxICk7XG5cblx0XHRcdFx0TS5yYWlzZShcImdhbWVPYmplY3RSZW1vdmVkRnJvbUxheWVyXCIsIG9iamVjdCk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGlmICggb2JqZWN0Lm9uTG9vcCApIHtcblxuXHRcdFx0TS5yZW1vdmVHYW1lT2JqZWN0KCBvYmplY3QgKTtcblxuXHRcdH1cblxuXHRcdG9iamVjdC5vd25lckxheWVyID0gbnVsbDtcblxuXHRcdHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuXG5cdH07XG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBvblJlbmRlckxpc3Rcblx0ICogQG1ldGhvZCByZW1vdmVBbGxcblx0ICovXG5cdEdhbWVMYXllci5wcm90b3R5cGUucmVtb3ZlQWxsID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vblJlbmRlckxpc3QgPSBbXTtcblx0fTtcblxuXHRNLkdhbWVMYXllciA9IE0uTGF5ZXIgPSBHYW1lTGF5ZXI7XG5cbn0pKHdpbmRvdy5NYXRjaCk7IiwiLyoqXG4gKiBAbW9kdWxlIE1hdGNoXG4gKi9cbihmdW5jdGlvbihNLCBFdmVudExpc3RlbmVyKSB7XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIG1ldGhvZHMgZm9yIGxvYWRpbmcgc3ByaXRlcyBhbmQgc3ByaXRlc2hlZXRzLiBUaGUgZXZlbnQgbGlzdGVuZXJzIGluZm9ybSB5b3UgaG93IG1hbnkgcmVzb3VyY2VzIHdoZXJlIGxvYWRlZCBzbyBmYXIsIHRoaXMgaXMgXG5cdCAqIHVzZWZ1bCBmb3IgbG9hZGluZyBzY3JlZW5zLlxuXHQgKiBcblx0ICogQGNsYXNzIFNwcml0ZU1hbmFnZXJcblx0ICogQHN0YXRpY1xuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGZ1bmN0aW9uIFNwcml0ZU1hbmFnZXIoKSB7XG5cdFxuXHRcdC8qKlxuXHRcdCAqIFRoZSBwYXRoIHdoZXJlIGFsbCBzcHJpdGVzIGFyZSBsb2NhdGVkXG5cdFx0ICogQHByb3BlcnR5IHBhdGhcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHR0aGlzLnBhdGggPSBcIlwiO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGFtb3VudCBvZiBzcHJpdGVzIHJlbWFpbmluZyB0byBsb2FkXG5cdFx0ICogQHByb3BlcnR5IHRvTG9hZFxuXHRcdCAqIEByZWFkT25seVxuXHRcdCAqIEB0eXBlIGludFxuXHRcdCAqL1xuICAgICAgICB0aGlzLnRvTG9hZCA9IDA7XG5cdFx0LyoqXG5cdFx0ICogVGhlIHRvdGxhIGFtb3VudCBvZiBzcHJpdGVzIHRvIGxvYWRcblx0XHQgKiBAcHJvcGVydHkgdG90YWxcblx0XHQgKiBAcmVhZE9ubHlcblx0XHQgKiBAdHlwZSBpbnRcblx0XHQgKi9cbiAgICAgICAgdGhpcy50b3RhbCA9IDA7XG5cdFx0LyoqXG5cdFx0ICogRXZlbnRMaXN0ZW5lciB0aGF0IGdldHMgY2FsbGVkIHdoZW5ldmVyIGEgc3ByaXRlIGlzIGZpbmlzaGVkIGxvYWRpbmdcblx0XHQgKiBAcHJvcGVydHkgb25JbWFnZUxvYWRlZFxuXHRcdCAqIEByZWFkT25seVxuXHRcdCAqIEB0eXBlIEV2ZW50TGlzdGVuZXJcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHQvL0FkZCBhIGxpc3RlbmVyXG5cdFx0XHRcdC8vZSA9IHtpbWFnZSwgcmVtYWluaW5nLCB0b3RhbH1cblx0XHRcdFx0TS5zcHJpdGVzLm9uSW1hZ2VzTG9hZGVkLmFkZEV2ZW50TGlzdGVuZXIoZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdGxvYWRpbmdUZXh0LnNldFRleHQoXCJMb2FkZWQgXCIgKyAoZS50b3RhbCAtIGUucmVtYWluaW5nKSArIFwiIG9mIFwiICsgZS50b3RhbCk7XG5cdFx0XHRcdH0pO1xuXHRcdCAqL1xuXHRcdHRoaXMub25JbWFnZUxvYWRlZCA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG5cdFx0LyoqXG5cdFx0ICogRXZlbnRMaXN0ZW5lciB0aGF0IGdldHMgY2FsbGVkIHdoZW4gYWxsIHNwcml0ZXMgb2YgYSBwYWNrIGFyZSBmaW5pc2hlZCBsb2FkaW5nXG5cdFx0ICogQHByb3BlcnR5IG9uQWxsSW1hZ2VzTG9hZGVkXG5cdFx0ICogQHJlYWRPbmx5XG5cdFx0ICogQHR5cGUgRXZlbnRMaXN0ZW5lclxuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdC8vQWRkIGEgbGlzdGVuZXJcblx0XHRcdFx0TS5zcHJpdGVzLm9uQWxsSW1hZ2VzTG9hZGVkLmFkZEV2ZW50TGlzdGVuZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWxlcnQoXCJBbGwgaW1hZ2VzIGFyZSByZWFkeVwiKTtcblx0XHRcdFx0fSk7XG5cdFx0ICovXG5cdFx0dGhpcy5vbkFsbEltYWdlc0xvYWRlZCA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG5cdFx0LyoqXG5cdFx0ICogRXZlbnRMaXN0ZW5lciB0aGF0IGdldHMgY2FsbGVkIHdoZW5ldmVyIGEgc3ByaXRlIGNhbm5vdCBiZSBsb2FkZWRcblx0XHQgKiBAcHJvcGVydHkgb25JbWFnZUVycm9yXG5cdFx0ICogQHJlYWRPbmx5XG5cdFx0ICogQHR5cGUgRXZlbnRMaXN0ZW5lclxuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdC8vQWRkIGEgbGlzdGVuZXJcblx0XHRcdFx0TS5zcHJpdGVzLm9uSW1hZ2VzTG9hZGVkLmFkZEV2ZW50TGlzdGVuZXIoZnVuY3Rpb24oaW1hZ2UpIHtcblx0XHRcdFx0XHRhbGVydChcImNvdWxkIG5vdCBsb2FkIGltYWdlIFwiICsgaW1hZ2UpO1xuXHRcdFx0XHR9KTtcblx0XHQgKi9cblx0XHR0aGlzLm9uSW1hZ2VFcnJvciA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG5cdFx0LyoqXG5cdFx0ICogTWFwIHVzZWQgdG8gc3RvcmUgc3ByaXRlc1xuXHRcdCAqL1xuXHRcdHRoaXMuYXNzZXRzID0ge307XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkVycm9yKCkge1xuXG4gICAgICAgIE0uc3ByaXRlcy5faW1hZ2VFcnJvcih0aGlzKTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uTG9hZCgpIHtcblxuICAgICAgICBNLnNwcml0ZXMuX2ltYWdlTG9hZGVkKHRoaXMpO1xuXG4gICAgfVxuXG4gICAgU3ByaXRlTWFuYWdlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oIG5hbWUgKSB7XG4gICAgXHRyZXR1cm4gdGhpcy5hc3NldHNbbmFtZV07XG4gICAgfTtcblxuXHQvKipcblx0ICogTWV0aG9kIHRoYXQgZ2V0cyBjYWxsZWQgYWZ0ZXIgYW4gaW1hZ2UgaGFzIGZpbmlzaGVkIGxvYWRpbmdcblx0ICogQG1ldGhvZCBfaW1hZ2VMb2FkZWRcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtIVE1MSW1hZ2VFbGVtZW50fSBpbWFnZVxuXHQgKi9cbiAgICBTcHJpdGVNYW5hZ2VyLnByb3RvdHlwZS5faW1hZ2VMb2FkZWQgPSBmdW5jdGlvbiggaW1hZ2UgKSB7XG5cbiAgICAgICAgdGhpcy50b0xvYWQtLTtcblxuICAgICAgICBpZiAoIGltYWdlLmZyYW1lcyA9PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgICAgICAgIGltYWdlLmZyYW1lcyA9IFt7eDowLCB5OiAwLCB3aWR0aDogaW1hZ2Uud2lkdGgsIGhlaWdodDogaW1hZ2UuaGVpZ2h0LCBoYWxmV2lkdGg6IGltYWdlLndpZHRoIC8gMiwgaGFsZkhlaWdodDogaW1hZ2UuaGVpZ2h0IC8gMn1dO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoIGltYWdlLnRpbGVzICkge1xuXG5cdFx0XHR2YXIgZnJhbWVzID0gbmV3IEFycmF5KCksXG5cdFx0XHRcdHdpZHRoID0gaW1hZ2UudGlsZXMud2lkdGgsXG5cdFx0XHRcdGhlaWdodCA9IGltYWdlLnRpbGVzLmhlaWdodCxcblx0XHRcdFx0cGFkZGluZyA9IGltYWdlLnRpbGVzLnBhZGRpbmcgfHwgMCxcblx0XHRcdFx0Y29sdW1ucyA9IE1hdGguZmxvb3IoaW1hZ2Uud2lkdGggLyAod2lkdGggKyBwYWRkaW5nKSksXG5cdFx0XHRcdGxpbmVzID0gTWF0aC5mbG9vcihpbWFnZS5oZWlnaHQgLyAoaGVpZ2h0ICsgcGFkZGluZykpLFxuXHRcdFx0XHRjb2x1bW4sXG5cdFx0XHRcdGxpbmU7XG5cblx0XHRcdGZvciAoIGxpbmUgPSAwOyBsaW5lIDwgbGluZXM7IGxpbmUrKyApIHtcblx0XHRcdFx0Zm9yICggY29sdW1uID0gMDsgY29sdW1uIDwgY29sdW1uczsgY29sdW1uKysgKSB7XG5cdFx0XHRcdFx0dmFyIHggPSAocGFkZGluZyArIHdpZHRoKSAqIGNvbHVtbiArIHBhZGRpbmcsXG5cdFx0XHRcdFx0XHR5ID0gKHBhZGRpbmcgKyBoZWlnaHQpICogbGluZSArIHBhZGRpbmc7XG5cdFx0XHRcdFx0ZnJhbWVzLnB1c2goe1xuXHRcdFx0XHRcdFx0eDogeCxcblx0XHRcdFx0XHRcdHk6IHksXG5cdFx0XHRcdFx0XHR3aWR0aDogd2lkdGgsXG5cdFx0XHRcdFx0XHRoZWlnaHQ6IGhlaWdodCxcblx0XHRcdFx0XHRcdGhhbGZXaWR0aDogd2lkdGggLyAyLFxuXHRcdFx0XHRcdFx0aGFsZkhlaWdodDogaGVpZ2h0IC8gMlxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGltYWdlLmZyYW1lcyA9IGZyYW1lcztcblxuXHRcdH0gZWxzZSB7XG5cdFx0XG4gXHRcdFx0Zm9yICggdmFyIGkgaW4gaW1hZ2UuZnJhbWVzICkge1xuXG5cdFx0XHRcdGltYWdlLmZyYW1lc1tpXS5oYWxmV2lkdGggPSBpbWFnZS5mcmFtZXNbaV0ud2lkdGggLyAyO1xuXHRcdFx0XHRpbWFnZS5mcmFtZXNbaV0uaGFsZkhlaWdodCA9IGltYWdlLmZyYW1lc1tpXS5oZWlnaHQgLyAyO1xuXG5cdFx0XHR9XG5cdFx0XG5cdFx0fVxuXG4gICAgICAgIHRoaXMub25JbWFnZUxvYWRlZC5yYWlzZSh7aW1hZ2U6IGltYWdlLCBuYW1lOiBpbWFnZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLW5hbWVcIiksIHJlbWFpbmluZzogdGhpcy50b0xvYWQsIHRvdGFsOiB0aGlzLnRvdGFsfSk7XG5cbiAgICAgICAgaWYgKCB0aGlzLnRvTG9hZCA8PSAwICkgdGhpcy5vbkFsbEltYWdlc0xvYWRlZC5yYWlzZSgpO1xuXG4gICAgfTtcblx0LyoqXG5cdCAqIE1ldGhvZCB0aGF0IGdldHMgY2FsbGVkIGFmdGVyIGFuIGltYWdlIGhhcyBmYWlsZWQgbG9hZGluZ1xuXHQgKiBAbWV0aG9kIF9pbWFnZUVycm9yXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7SFRNTEltYWdlRWxlbWVudH0gaW1hZ2Vcblx0ICovXG4gICAgU3ByaXRlTWFuYWdlci5wcm90b3R5cGUuX2ltYWdlRXJyb3IgPSBmdW5jdGlvbiggaW1hZ2UgKSB7XG5cbiAgICAgICAgdGhpcy50b0xvYWQtLTtcblx0XHRcblx0XHR0aGlzLm9uSW1hZ2VFcnJvci5yYWlzZShpbWFnZSk7XG5cbiAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBsb2FkXCIsIGltYWdlLnNyYyk7XG5cbiAgICB9O1xuXHQvKipcblx0ICogTG9hZHMgaW1hZ2VzIGZyb20gYSBNYXAgb2YgU3RyaW5nLVVybCBvciBTdHJpbmctU3ByaXRlU2hlZXRcblx0ICogQG1ldGhvZCBsb2FkXG5cdCAqIEBwYXJhbSB7TWFwPFN0cmluZywgVXJsPnxNYXA8U3RyaW5nLCBPYmplY3Q+fSBpbWFnZXNcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gb25GaW5pc2hlZCBjYWxsYmFjayB0byBleGVjdXRlIHdoZW4gYWxsIGltYWdlcyBhcmUgbG9hZGVkXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9uUHJvZ3Jlc3MgY2FsbGJhY2sgdG8gZXhlY3V0ZSB3aGVuIGFuIGltYWdlIGlzIGxvYWRlZFxuXHQgKiBAZXhhbXBsZSBcblx0XHRcdE0uU3ByaXRlTWFuYWdlci5sb2FkKHtcInNreVwiOiBcIi9hc3NldHMvc2t5LnBuZ1wifSk7XG5cdCAqIEBleGFtcGxlIFxuXHRcdFx0TS5TcHJpdGVNYW5hZ2VyLmxvYWQoe1wic2t5XCI6IFwiL2Fzc2V0cy9za3kucG5nXCIsIFwiZ3JvdW5kXCI6IFwiL2Fzc2V0cy9ncm91bmQucG5nXCJ9KTtcblx0ICogQGV4YW1wbGUgXG5cdFx0XHRNLlNwcml0ZU1hbmFnZXIubG9hZCh7XG5cdFx0XHRcdFwic2t5XCI6IFwiL2Fzc2V0cy9za3kucG5nXCIsXG5cdFx0XHRcdFwiZ3JvdW5kXCI6IFwiL2Fzc2V0cy9ncm91bmQucG5nXCIsXG5cdFx0XHRcdFwibmluamFcIjoge1xuXHRcdFx0XHRcdFwic291cmNlXCIgOiBcIi9hc3NldHMvbmluamEucG5nXCIsXG5cdFx0XHRcdFx0Ly9BcnJheSBvZiBmcmFtZXMgdGhhdCBjb21wb3NlIHRoaXMgc3ByaXRlc2hlZXRcblx0XHRcdFx0XHRcImZyYW1lc1wiIDogW3tcblx0XHRcdFx0XHRcdFx0XCJ4XCIgOiAxMCxcblx0XHRcdFx0XHRcdFx0XCJ5XCIgOiAxMCxcblx0XHRcdFx0XHRcdFx0XCJ3aWR0aFwiIDogOTAsXG5cdFx0XHRcdFx0XHRcdFwiaGVpZ2h0XCIgOiAxNFxuXHRcdFx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFx0XHRcInhcIiA6IDExMCxcblx0XHRcdFx0XHRcdFx0XCJ5XCIgOiAxMCxcblx0XHRcdFx0XHRcdFx0XCJ3aWR0aFwiIDogOTAsXG5cdFx0XHRcdFx0XHRcdFwiaGVpZ2h0XCIgOiAxNFxuXHRcdFx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFx0XHRcInhcIiA6IDIxMCxcblx0XHRcdFx0XHRcdFx0XCJ5XCIgOiAxMCxcblx0XHRcdFx0XHRcdFx0XCJ3aWR0aFwiIDogOTAsXG5cdFx0XHRcdFx0XHRcdFwiaGVpZ2h0XCIgOiAxNFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0Ly9NYXAgb2YgYW5pbWF0aW9uc1xuXHRcdFx0XHRcdFwiYW5pbWF0aW9uc1wiIDoge1xuXHRcdFx0XHRcdFx0XCJqdW1wXCI6IHtcblx0XHRcdFx0XHRcdFx0XCJkdXJhdGlvblwiIDogMjUwLFxuXHRcdFx0XHRcdFx0XHRcImZyYW1lc1wiIDogWzAsIDEsIDJdIC8vSW5kZXggb2YgdGhlIGZyYW1lcyB0aGF0IGNvbXBvc2UgdGhpcyBhbmltYXRpb25cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHQgKiBAZXhhbXBsZVxuXHRcdFx0TS5TcHJpdGVNYW5hZ2VyLmxvYWQoW1xuXHRcdFx0XHRcImFzc2V0cy9zcHJpdGVzL3NreS5qc29uXCIsXG5cdFx0XHRcdFwiYXNzZXRzL3Nwcml0ZXMvc3VuLmpzb25cIixcblx0XHRcdFx0XCJhc3NldHMvc3ByaXRlcy9ncm91bmQuanNvblwiXG5cdFx0XHRdKTtcblx0ICovXG4gICAgU3ByaXRlTWFuYWdlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCBtYXAsIG9uRmluaXNoZWQsIG9uUHJvZ3Jlc3MgKSB7XG5cdFxuXHRcdHZhciBjdXJyZW50LCBpbWcsIGk7XG5cblx0XHRpZiAoIG9uRmluaXNoZWQgKSB7XG5cdFx0XHR0aGlzLm9uQWxsSW1hZ2VzTG9hZGVkLmFkZEV2ZW50TGlzdGVuZXIob25GaW5pc2hlZCk7XG5cdFx0fVxuXHRcdGlmICggb25Qcm9ncmVzcyApIHtcblx0XHRcdHRoaXMub25JbWFnZUxvYWRlZC5hZGRFdmVudExpc3RlbmVyKG9uUHJvZ3Jlc3MpO1xuXHRcdH1cblxuXHRcdGlmICggbWFwIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cdFx0XG5cdFx0XHR2YXIganNvbk1hcCA9IHt9LFxuXHRcdFx0XHRsb2FkZWQgPSAwLFxuXHRcdFx0XHRzZWxmID0gdGhpcyxcblx0XHRcdFx0b25Kc29uUmVjZWl2ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdHZhciBqc29uID0gSlNPTi5wYXJzZShyZXNwb25zZSk7XG5cdFx0XHRcdFx0anNvbk1hcFtqc29uLm5hbWVdID0ganNvbjtcblx0XHRcdFx0XHRsb2FkZWQrKztcblx0XHRcdFx0XHRpZiAoIGxvYWRlZCA+PSBtYXAubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0c2VsZi5sb2FkKGpzb25NYXApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBtYXAubGVuZ3RoOyBpKysgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRNLkFqYXgucG9zdChtYXBbaV0sIG9uSnNvblJlY2VpdmVkKTtcblx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XG5cdFx0fSBlbHNlIHtcblx0XHRcblx0XHRcdHZhciBhbHJlYWR5TG9hZGVkID0gMCxcblx0XHRcdFx0Y291bnQgPSAwO1xuXHRcdFxuXHRcdFx0Zm9yICggaSBpbiBtYXAgKSB7XG5cdFx0XHRcblx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0XG5cdFx0XHRcdGlmICggISB0aGlzLmFzc2V0c1sgaSBdICkge1xuXHRcdFx0XHRcblxuXHRcdFx0XHRcdGN1cnJlbnQgPSBtYXBbaV0sXG5cdFx0XHRcdFx0aW1nID0gbmV3IEltYWdlKCk7XG5cblx0XHRcdFx0XHRpbWcuc2V0QXR0cmlidXRlKFwiZGF0YS1uYW1lXCIsIGkpO1xuXHRcdFx0XHRcdGltZy5vbmxvYWQgPSBvbkxvYWQ7XG5cdFx0XHRcdFx0aW1nLm9uZXJyb3IgPSBvbkVycm9yO1xuXG5cdFx0XHRcdFx0dGhpcy50b3RhbCA9ICsrdGhpcy50b0xvYWQ7XG5cblx0XHRcdFx0XHRpZiAoIHR5cGVvZiBjdXJyZW50ID09IFwic3RyaW5nXCIgKSB7XG5cblx0XHRcdFx0XHRcdGltZy5zcmMgPSB0aGlzLnBhdGggKyBjdXJyZW50O1xuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0aW1nLnNyYyA9IHRoaXMucGF0aCArIGN1cnJlbnQuc291cmNlO1xuXG5cdFx0XHRcdFx0XHRpbWcuZnJhbWVzID0gY3VycmVudC5mcmFtZXM7XG5cblx0XHRcdFx0XHRcdGltZy5hbmltYXRpb25zID0gY3VycmVudC5hbmltYXRpb25zO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGhpcy5hc3NldHNbIGkgXSA9IGltZztcblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFscmVhZHlMb2FkZWQrKztcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmICggYWxyZWFkeUxvYWRlZCA9PSBjb3VudCApIHtcblx0XHRcdFx0dGhpcy5vbkFsbEltYWdlc0xvYWRlZC5yYWlzZSgpO1xuXHRcdFx0fVxuXHRcdFxuXHRcdH1cblxuICAgIH07XG5cdC8qKlxuXHQgKiBSZW1vdmVzIHRoZSBzcHJpdGUgdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBpZFxuXHQgKiBAbWV0aG9kIHJlbW92ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaWQgdGhlIHNwcml0ZSBpZFxuXHQgKi9cblx0U3ByaXRlTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oaWQpIHtcblx0XHRpZiAoIHRoaXMuYXNzZXRzW2lkXSApIHtcblx0XHRcdGRlbGV0ZSB0aGlzLmFzc2V0c1tpZF07XG5cdFx0XHRpZiAoIHRoaXMudG90YWwgLSAxID49IDAgKSB7XG5cdFx0XHRcdHRoaXMudG90YWwtLTtcblx0XHRcdH1cblx0XHRcdGlmICggdGhpcy50b0xvYWQgLSAxID49IDAgKSB7XG5cdFx0XHRcdHRoaXMudG9Mb2FkLS07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgc3ByaXRlc1xuXHQgKiBAbWV0aG9kIHJlbW92ZUFsbFxuXHQgKi9cblx0U3ByaXRlTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlQWxsID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5hc3NldHMgPSB7fTtcblx0XHR0aGlzLnRvdGFsID0gMDtcblx0XHR0aGlzLnRvTG9hZCA9IDA7XG5cdH07XG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnNcblx0ICogQG1ldGhvZCByZW1vdmVBbGxFdmVudExpc3RlbmVyc1xuXHQgKi9cblx0U3ByaXRlTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlQWxsRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9uSW1hZ2VMb2FkZWQgPSBuZXcgRXZlbnRMaXN0ZW5lcigpO1xuXHRcdHRoaXMub25BbGxJbWFnZXNMb2FkZWQgPSBuZXcgRXZlbnRMaXN0ZW5lcigpO1xuXHRcdHRoaXMub25JbWFnZUVycm9yID0gbmV3IEV2ZW50TGlzdGVuZXIoKTtcblx0fTtcblxuICAgIE0uU3ByaXRlTWFuYWdlciA9IG5ldyBTcHJpdGVNYW5hZ2VyKCk7XG5cbiAgICBNLnNwcml0ZXMgPSBNLlNwcml0ZU1hbmFnZXI7XG5cbn0pKE0sIEV2ZW50TGlzdGVuZXIpOyIsIi8qKlxuICogQG1vZHVsZSBNYXRjaFxuICovXG4oZnVuY3Rpb24oTSwgRXZlbnRMaXN0ZW5lcikge1xuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyBhbiBpbnRlcmZhY2UgZm9yIEF1ZGlvLiBIb2xkcyBhIGJ1ZmZ1ZXIgZm9yIHNpbW91bHRhbmV1aXNseSBwbGF5aW5nIHRoZSBzYW1lIHNvdW5kLlxuXHQgKiBAY2xhc3MgU291bmRcblx0ICogQHByb3RlY3RlZFxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGZ1bmN0aW9uIFNvdW5kKCBuYW1lLCB1cmwgKSB7XG5cblx0XHQvKipcblx0XHQgKiBBcnJheSBjb250YWluaW5nIHRoZSBzYW1lIHNvdW5kIG11bHRpcGxlIHRpbWVzLiBVc2VkIGZvciBwbGF5aW5nIHRoZSBzYW1lIHNvdW5kIHNpbW91bHRhbmV1c2x5LlxuXHRcdCAqIEBwcm9wZXJ0eSBhdWRpb0J1ZmZlclxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHR5cGUgQXJyYXlcblx0XHQgKi9cblx0XHR0aGlzLmF1ZGlvQnVmZmVyID0gW107XG5cdFx0LyoqXG5cdFx0ICogU291bmQgc291cmNlIHVybFxuXHRcdCAqIEBwcm9wZXJ0eSBzcmNcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdHRoaXMuc3JjID0gdXJsO1xuXHRcdC8qKlxuXHRcdCAqIEBwcm9wZXJ0eSBuYW1lXG5cdFx0ICogTmFtZSBvZiB0aGUgc291bmRcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdHRoaXMubmFtZSA9IG5hbWU7XG5cblx0XHR0aGlzLmluY3JlYXNlQnVmZmVyKCk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBNYXggYXVkaW8gYnVmZmVyIHNpemVcblx0ICogQHByb3BlcnR5IE1BWF9CVUZGRVJcblx0ICogQHR5cGUgaW50XG5cdCAqL1xuXHRTb3VuZC5wcm90b3R5cGUuTUFYX0JVRkZFUiA9IDM7XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBjdXJyZW50IHNvdW5kIHJlYWR5IGFuZCBjYWxscyBvblNvdW5kTG9hZGVkXG5cdCAqIEBtZXRob2Qgc2V0UmVhZHlcblx0ICogQHByaXZhdGVcblx0ICovXG5cdFNvdW5kLnByb3RvdHlwZS5zZXRSZWFkeSA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY2FuUGxheSA9IHRoaXMuY2hlY2tPaztcblx0XHRpZiAoIHRoaXMuYXVkaW9CdWZmZXIubGVuZ3RoID09IDEgKSB7XG5cdFx0XHRNLnNvdW5kcy5vblNvdW5kTG9hZGVkLnJhaXNlKHtzb3VuZDogdGhpcywgcmVtYWluaW5nOiBNLnNvdW5kcy50b0xvYWQsIHRvdGFsOiBNLnNvdW5kcy50b3RhbH0pO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGN1cnJlbnQgc291bmQgbm90IHJlYWR5IGFuZCBjYWxscyBvblNvdW5kRXJyb3Jcblx0ICogQG1ldGhvZCBzZXROb3RSZWFkeVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0U291bmQucHJvdG90eXBlLnNldE5vdFJlYWR5ID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jYW5QbGF5ID0gdGhpcy5jaGVja09rO1xuXHRcdE0uc291bmRzLm9uU291bmRFcnJvci5yYWlzZSh7c291bmQ6IHRoaXMsIHJlbWFpbmluZzogTS5zb3VuZHMudG9Mb2FkLCB0b3RhbDogTS5zb3VuZHMudG90YWx9KTtcblx0fTtcblx0LyoqXG5cdCAqIFBsYXlzIHRoZSBjdXJyZW50IHNvdW5kLiBJZiBhIHNvdW5kIGxpa2UgdGhpcyBpcyBhbHJlYWR5IHBsYXlpbmcgdGhlbiBhIG5ldyBvbmUgaXMgYWRkZWQgdG8gdGhlXG5cdCAqIGJ1ZmZlciBhbmQgcGxheWVkXG5cdCAqIEBtZXRob2QgcGxheVxuXHQgKi9cblx0U291bmQucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbihsb29wKSB7XG5cblx0XHRpZiAoICEgdGhpcy5jYW5QbGF5KCkgKSByZXR1cm47XG5cblx0XHR2YXIgaSA9IDAsIGN1cnJlbnQ7XG5cblx0XHR3aGlsZSAoIGkgPCB0aGlzLmF1ZGlvQnVmZmVyLmxlbmd0aCApIHtcblxuXHRcdFx0Y3VycmVudCA9IHRoaXMuYXVkaW9CdWZmZXJbaV07XG5cblx0XHRcdGlmICggY3VycmVudC5lbmRlZCB8fCBjdXJyZW50LmN1cnJlbnRUaW1lID09IDAgKSB7XG5cdFx0XHRcdGN1cnJlbnQubG9vcCA9IGxvb3A7XG5cdFx0XHRcdGN1cnJlbnQucGxheSgpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGkrKztcblxuXHRcdH1cblxuXHRcdGN1cnJlbnQgPSB0aGlzLmF1ZGlvQnVmZmVyWzBdO1xuXHRcdGN1cnJlbnQucGF1c2UoKTtcblx0XHRjdXJyZW50LmN1cnJlbnRUaW1lID0gMDtcblx0XHRjdXJyZW50Lmxvb3AgPSBsb29wO1xuXHRcdGN1cnJlbnQucGxheSgpO1xuXG5cdFx0aWYgKCB0aGlzLmF1ZGlvQnVmZmVyLmxlbmd0aCA8IHRoaXMuTUFYX0JVRkZFUiApIHtcblx0XHRcdHRoaXMuaW5jcmVhc2VCdWZmZXIoKTtcblx0XHR9XG5cblx0fTtcblx0LyoqXG5cdCAqIFN0b3BzIHBsYXlzIHRoZSBjdXJyZW50IHNvdW5kXG5cdCAqIEBtZXRob2Qgc3RvcFxuXHQgKi9cblx0U291bmQucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcblxuXHRcdGlmICggISB0aGlzLmNhblBsYXkoKSApIHJldHVybjtcblxuXHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oIG9iaiApIHtcbiAgICAgICAgICAgIGlmICggb2JqLmR1cmF0aW9uID4gMCApIHtcbiAgICAgICAgICAgICAgICBvYmoucGF1c2UoKTtcbiAgICAgICAgICAgICAgICBvYmouY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgfVxuXHRcdH0pO1xuXG5cdH07XG5cdC8qKlxuXHQgKiBQYXVzZXMgdGhlIGN1cnJlbnQgc291bmRcblx0ICogYnVmZmVyIGFuZCBwbGF5ZWRcblx0ICogQG1ldGhvZCBwYXVzZVxuXHQgKi9cblx0U291bmQucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG5cblx0XHRpZiAoICEgdGhpcy5jYW5QbGF5KCkgKSByZXR1cm47XG5cdFx0XG5cdFx0aWYodGhpcy5vbk5leHRQYXVzZVJlc3VtZSkge1xuXHRcdFx0dGhpcy5wbGF5KCk7XG5cdFx0XHR0aGlzLm9uTmV4dFBhdXNlUmVzdW1lID0gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMub25OZXh0UGF1c2VSZXN1bWUgPSB0aGlzLmlzUGxheWluZygpO1xuXHRcdFx0dGhpcy5lYWNoKCBmdW5jdGlvbiggb2JqICkge1xuXHRcdFx0XHRvYmoucGF1c2UoKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgZmFsc2Vcblx0ICogQG1ldGhvZCBjaGVja0ZhaWxcblx0ICogQHByaXZhdGVcblx0ICovXG5cdFNvdW5kLnByb3RvdHlwZS5jaGVja0ZhaWwgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWVcblx0ICogQG1ldGhvZCBjaGVja09mXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRTb3VuZC5wcm90b3R5cGUuY2hlY2tPayA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoaXMgc291bmQgY2FuIGJlIHBsYXllZCBvciBub3Rcblx0ICogQG1ldGhvZCBjYW5QbGF5XG5cdCAqIEB0eXBlIEJvb2xlYW5cblx0ICovXG5cdFNvdW5kLnByb3RvdHlwZS5jYW5QbGF5ID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5pbmNyZWFzZUJ1ZmZlcigpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHNvdW5kIHBsYXliYWNrIHNwZWVkXG5cdCAqIEBtZXRob2Qgc2V0UGxheWJhY2tSYXRlXG5cdCAqIEBwYXJhbSB7aW50fSByYXRlXG5cdCAqL1xuXHRTb3VuZC5wcm90b3R5cGUuc2V0UGxheWJhY2tSYXRlID0gZnVuY3Rpb24ocmF0ZSkge1xuXHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oIG9iaiApIHtcblx0XHRcdG9iai5wbGF5YmFja1JhdGUgPSByYXRlO1xuXHRcdH0pO1xuXHR9O1xuXHQvKipcblx0ICogUmVzZXRzIHRoZSBzb3VuZCBwbGF5YmFjayBzcGVlZCB0byBub3JtYWxcblx0ICogQG1ldGhvZCByZXNldFBsYXliYWNrUmF0ZVxuXHQgKi9cbiAgICBTb3VuZC5wcm90b3R5cGUucmVzZXRQbGF5YmFja1JhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lYWNoKCBmdW5jdGlvbiggb2JqICkge1xuXHRcdFx0b2JqLnBsYXliYWNrUmF0ZSA9IDE7XG5cdFx0fSk7XG4gICAgfVxuXHQvKipcblx0ICogR2V0cyB0aGUgc291bmQgcGxheWJhY2sgc3BlZWRcblx0ICogQG1ldGhvZCBnZXRQbGF5YmFja1JhdGVcblx0ICovXG5cdFNvdW5kLnByb3RvdHlwZS5nZXRQbGF5YmFja1JhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5hdWRpb0J1ZmZlclswXS5wbGF5YmFja1JhdGU7XG5cdH07XG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNvdW5kIGlzIHBhdXNlZCBvciBwbGF5aW5nXG5cdCAqIEBtZXRob2QgaXNQYXVzZWRcblx0ICovXG5cdFNvdW5kLnByb3RvdHlwZS5pc1BhdXNlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpID0gMDsgbCA9IHRoaXMuYXVkaW9CdWZmZXIubGVuZ3RoO1xuXHRcdGZvcig7IGkgPCBsOyBpKyspIHtcblx0XHRcdGlmICggdGhpcy5hdWRpb0J1ZmZlcltpXS5wYXVzZWQgKSByZXR1cm4gdHJ1ZTtcblx0XHR9XHRcdFxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHZvbHVtZSBvZiB0aGlzIHNvdW5kXG5cdCAqIEBtZXRob2Qgc2V0Vm9sdW1lXG5cdCAqIEBwYXJhbSB2b2x1bWVcblx0ICovXG5cdFNvdW5kLnByb3RvdHlwZS5zZXRWb2x1bWUgPSBmdW5jdGlvbiggdm9sdW1lICkge1xuXG5cdFx0dGhpcy5lYWNoKCBmdW5jdGlvbiggb2JqICkge1xuXHRcdFx0b2JqLnZvbHVtZSA9IHZvbHVtZTtcblx0XHR9KTtcblxuXHR9O1xuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzb3VuZCBpcyBwbGF5aW5nIG9yIG5vdFxuXHQgKiBAbWV0aG9kIGlzUGxheWluZ1xuXHQgKi9cblx0U291bmQucHJvdG90eXBlLmlzUGxheWluZyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpID0gMDsgbCA9IHRoaXMuYXVkaW9CdWZmZXIubGVuZ3RoO1xuXHRcdGZvcig7IGkgPCBsOyBpKyspIHtcblx0XHRcdGlmKCAhdGhpcy5hdWRpb0J1ZmZlcltpXS5wYXVzZWQgKSByZXR1cm4gdHJ1ZTtcblx0XHR9XHRcdFxuXHRcdHJldHVybiBmYWxzZTtcdFx0XG5cdH07XG5cdC8qKlxuXHQgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gdXNpbmcgZXZlcnkgc291bmQgaW4gdGhlIGJ1ZmZlciBhcyBwYXJhbWV0ZXJcblx0ICogQG1ldGhvZCBlYWNoXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgdGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGVcblx0ICovXG5cdFNvdW5kLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oIGZ1bmMgKSB7XG5cblx0XHR2YXIgaSA9IHRoaXMuYXVkaW9CdWZmZXIubGVuZ3RoO1xuXG5cdFx0d2hpbGUgKCBpLS0gKSB7XG5cblx0XHRcdGZ1bmMoIHRoaXMuYXVkaW9CdWZmZXJbaV0gKTtcblxuXHRcdH1cblxuXHR9O1xuXHQvKipcblx0ICogSW5jcmVhc2VzIHRoZSBzb3VuZCBidWZmZXIgcHJvdmlkZWQgdGhlIGxpbWl0IGlzIG5vdCByZWFjaGVkXG5cdCAqIEBtZXRob2QgaW5jcmVhc2VCdWZmZXJcblx0ICovXG5cdFNvdW5kLnByb3RvdHlwZS5pbmNyZWFzZUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHNvdW5kID0gbmV3IEF1ZGlvKCB0aGlzLnNyYyApLFxuXHRcdFx0Zmlyc3QgPSB0aGlzLmF1ZGlvQnVmZmVyWzBdO1xuXG5cdFx0c291bmQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRlZGRhdGFcIiwgb25sb2FkZWRkYXRhICk7XG5cdFx0c291bmQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIG9uZXJyb3IgKTtcblx0XHRzb3VuZC5uYW1lID0gdGhpcy5uYW1lO1xuXG5cdFx0aWYgKCBmaXJzdCApIHtcblx0XHRcdHNvdW5kLm11dGVkID0gZmlyc3QubXV0ZWQ7XG5cdFx0XHRzb3VuZC52b2x1bWUgPSBmaXJzdC52b2x1bWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5hdWRpb0J1ZmZlci5wdXNoKCBzb3VuZCApO1xuXG5cdH07XG5cdFNvdW5kLnByb3RvdHlwZS5pc011dGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLmF1ZGlvQnVmZmVyLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hdWRpb0J1ZmZlclswXS5tdXRlZDtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXHQvKipcblx0ICogVG9nZ2xlcyB0aGlzIHNvdW5kIG9uIG9yIG9mZlxuXHQgKiBAbWV0aG9kIHRvZ2dsZVxuXHQgKi9cblx0U291bmQucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5pc011dGVkKCkgKSB7XG5cdFx0XHR0aGlzLnVubXV0ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm11dGUoKTtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBNdXRlcyB0aGlzIHNvdW5kXG5cdCAqIEBtZXRob2QgbXV0ZVxuXHQgKi9cblx0U291bmQucHJvdG90eXBlLm11dGUgPSBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oIG9iaiApIHtcblx0XHRcdG9iai5tdXRlZCA9IHRydWU7XG5cdFx0fSk7XG5cblx0fTtcblx0LyoqXG5cdCAqIFVubXV0ZXMgdGhpcyBzb3VuZFxuXHQgKiBAbWV0aG9kIHVubXV0ZVxuXHQgKi9cblx0U291bmQucHJvdG90eXBlLnVubXV0ZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5lYWNoKCBmdW5jdGlvbiggb2JqICkge1xuXHRcdFx0b2JqLm11dGVkID0gZmFsc2U7XG5cdFx0fSk7XG5cblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhpcyBzb3VuZCB0byBsb29wXG5cdCAqIEBtZXRob2Qgc2V0TG9vcFxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IHZhbHVlXG5cdCAqL1xuXHRTb3VuZC5wcm90b3R5cGUuc2V0TG9vcCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5hdWRpb0J1ZmZlclswXS5sb29wID0gdmFsdWU7XG5cdH07XG5cblx0dmFyIGZha2VGdW5jID0gZnVuY3Rpb24oKSB7fTtcblx0XHRmYWtlU291bmQgPSB7XG4gICAgICAgICAgICBuYW1lOiBcIlwiXG4gICAgICAgIH07XG5cbiAgICBmb3IgKCB2YXIgaSBpbiBTb3VuZC5wcm90b3R5cGUgKSB7XG4gICAgICAgIGlmICggdHlwZW9mIFNvdW5kLnByb3RvdHlwZVtpXSA9PSBcImZ1bmN0aW9uXCIgKSB7XG4gICAgICAgICAgICBmYWtlU291bmRbaV0gPSBmYWtlRnVuYztcbiAgICAgICAgfVxuICAgIH1cblxuXHRmdW5jdGlvbiBvbmxvYWRlZGRhdGEoKSB7XG5cdFx0TS5zb3VuZHMuYXNzZXRzWyB0aGlzLm5hbWUgXS5zZXRSZWFkeSgpO1xuXHRcdE0uc291bmRzLnRvTG9hZC0tO1xuXHRcdGlmKE0uc291bmRzLnRvTG9hZCA8PSAwKSB7XG5cdFx0XHRNLnNvdW5kcy5vbkFsbFNvdW5kc0xvYWRlZC5yYWlzZSgpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIG9uZXJyb3IoKSB7XG5cdFx0Y29uc29sZS53YXJuKCBcIlVuYWJsZSB0byBsb2FkIFwiICsgdGhpcy5zcmMgKTtcbiAgICAgICAgTS5zb3VuZHMuZXJyb3IgPSB0cnVlO1xuXHRcdE0uc291bmRzLmFzc2V0c1sgdGhpcy5uYW1lIF0uc2V0Tm90UmVhZHkoKTtcblx0XHRNLnNvdW5kcy50b0xvYWQtLTtcblx0XHRpZihNLnNvdW5kcy50b0xvYWQgPD0gMCkge1xuXHRcdFx0TS5zb3VuZHMub25BbGxTb3VuZHNMb2FkZWQucmFpc2UoKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBQcm92aWRlcyBtZXRob2RzIGZvciBsb2FkaW5nIGFuZCBwbGF5aW5nIHNvdW5kcy4gVGhlIGV2ZW50IGxpc3RlbmVycyBpbmZvcm0geW91IGhvdyBtYW55IHJlc291cmNlcyB3aGVyZSBsb2FkZWQgc28gZmFyLCB0aGlzIGlzIFxuXHQgKiB1c2VmdWwgZm9yIGxvYWRpbmcgc2NyZWVucy5cblx0ICogXG5cdCAqIEBleGFtcGxlXG5cdFx0XHQvL1RvIHBsYXkgYSBzb3VuZCB5b3UgbXVzdCBmaXJzdCBsb2FkIGl0IHVzaW5nIHRoZSBTb3VuZE1hbmFnZXIsIG9uY2UgaXQgaXMgbG9hZGVkIHlvdSBjYW4gYWNjZXNzIGl0IGJ5IGl0cyBrZXkgaW5zaWRlIHRoZSBTb3VuZE1hbmFnZXJcblx0XHRcdE0uc291bmRzLmxvYWQoXCJsYXNlclwiLCBcIi9zb3VuZHMvbGFzZXJcIik7XG5cdFx0XHRNLnNvdW5kcy5sYXNlci5wbGF5KCk7XG5cdCAqXG5cdCAqIEBjbGFzcyBTb3VuZE1hbmFnZXJcblx0ICogQHN0YXRpY1xuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGZ1bmN0aW9uIFNvdW5kTWFuYWdlcigpIHtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBwYXRoIHdoZXJlIGFsbCBzb3VuZHMgYXJlIGxvY2F0ZWRcblx0XHQgKiBAcHJvcGVydHkgcGF0aFxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdHRoaXMucGF0aCA9IFwiXCI7XG5cdFx0LyoqXG5cdFx0ICogVGhlIGFtb3VudCBvZiBzcHJpdGVzIHJlbWFpbmluZyB0byBsb2FkXG5cdFx0ICogQHByb3BlcnR5IHRvTG9hZFxuXHRcdCAqIEByZWFkT25seVxuXHRcdCAqIEB0eXBlIGludFxuXHRcdCAqL1xuXHRcdHRoaXMudG9Mb2FkID0gMDtcblx0XHQvKipcblx0XHQgKiBUaGUgdG90bGEgYW1vdW50IG9mIHNwcml0ZXMgdG8gbG9hZFxuXHRcdCAqIEBwcm9wZXJ0eSB0b3RhbFxuXHRcdCAqIEByZWFkT25seVxuXHRcdCAqIEB0eXBlIGludFxuXHRcdCAqL1xuICAgICAgICB0aGlzLnRvdGFsID0gMDtcblx0XHQvKipcblx0XHQgKiBFdmVudExpc3RlbmVyIHRoYXQgZ2V0cyBjYWxsZWQgd2hlbmV2ZXIgYSBzb3VuZCBpcyBmaW5pc2hlZCBsb2FkaW5nXG5cdFx0ICogQHByb3BlcnR5IG9uU291bmRMb2FkZWRcblx0XHQgKiBAcmVhZE9ubHlcblx0XHQgKiBAdHlwZSBFdmVudExpc3RlbmVyXG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0Ly9BZGQgYSBsaXN0ZW5lclxuXHRcdFx0XHQvL2UgPSB7c291bmQsIHJlbWFpbmluZywgdG90YWx9XG5cdFx0XHRcdE0uc291bmRzLm9uU291bmRMb2FkZWQuYWRkRXZlbnRMaXN0ZW5lcihmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0bG9hZGluZ1RleHQuc2V0VGV4dChcIkxvYWRlZCBcIiArIChlLnRvdGFsIC0gZS5yZW1haW5pbmcpICsgXCIgb2YgXCIgKyBlLnRvdGFsKTtcblx0XHRcdFx0fSk7XG5cdFx0ICovXG5cdFx0dGhpcy5vblNvdW5kTG9hZGVkID0gbmV3IEV2ZW50TGlzdGVuZXIoKTtcblx0XHQvKipcblx0XHQgKiBFdmVudExpc3RlbmVyIHRoYXQgZ2V0cyBjYWxsZWQgd2hlbiBhbGwgc291bmRzIG9mIGEgcGFjayBhcmUgZmluaXNoZWQgbG9hZGluZ1xuXHRcdCAqIEBwcm9wZXJ0eSBvbkFsbFNvdW5kc0xvYWRlZFxuXHRcdCAqIEByZWFkT25seVxuXHRcdCAqIEB0eXBlIEV2ZW50TGlzdGVuZXJcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHQvL0FkZCBhIGxpc3RlbmVyXG5cdFx0XHRcdE0uc291bmRzLm9uQWxsU291bmRzTG9hZGVkLmFkZEV2ZW50TGlzdGVuZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWxlcnQoXCJBbGwgc291bmRzIGFyZSByZWFkeVwiKTtcblx0XHRcdFx0fSk7XG5cdFx0ICovXG5cdFx0dGhpcy5vbkFsbFNvdW5kc0xvYWRlZCA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG5cdFx0LyoqXG5cdFx0ICogRXZlbnRMaXN0ZW5lciB0aGF0IGdldHMgY2FsbGVkIHdoZW5ldmVyIGEgc291bmQgY2Fubm90IGJlIGxvYWRlZFxuXHRcdCAqIEBwcm9wZXJ0eSBvblNvdW5kRXJyb3Jcblx0XHQgKiBAcmVhZE9ubHlcblx0XHQgKiBAdHlwZSBFdmVudExpc3RlbmVyXG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0Ly9BZGQgYSBsaXN0ZW5lclxuXHRcdFx0XHRNLnNvdW5kcy5vblNvdW5kRXJyb3IuYWRkRXZlbnRMaXN0ZW5lcihmdW5jdGlvbihzb3VuZCkge1xuXHRcdFx0XHRcdGFsZXJ0KFwiY291bGQgbm90IGxvYWQgc291bmQgXCIgKyBzb3VuZCk7XG5cdFx0XHRcdH0pO1xuXHRcdCAqL1xuXHRcdHRoaXMub25Tb3VuZEVycm9yID0gbmV3IEV2ZW50TGlzdGVuZXIoKTtcblx0XHRcblx0XHQvKipcblx0XHQgKiBJZiB0aGVyZSB3ZXJlIGVycm9ycyB3aGlsZSBsb2FkaW5nIHNvdW5kcyB0aGlzIGF0dHJpYnV0ZSBiZWNvbWVzIHRydWVcblx0XHQgKiBAcHJvcGVydHkgZXJyb3Jcblx0XHQgKiBAcmVhZE9ubHlcblx0XHQgKiBAdHlwZSBCb29sZWFuXG5cdFx0ICovXG4gICAgICAgIHRoaXMuZXJyb3IgPSBmYWxzZTtcblx0XHQvKipcblx0XHQgKiBNYXAgdXNlZCB0byBzdG9yZSBzb3VuZHNcblx0XHQgKi9cblx0XHR0aGlzLmFzc2V0cyA9IHt9O1xuXG5cdH1cblx0LyoqXG5cdCAqIExvYWRzIHNvdW5kcyBmcm9tIGEgTWFwIG9mIFN0cmluZy1VcmwuIFRoZSBTb3VuZE1hbmFnZXIgZGV0ZXJtaW5lcyB3aGF0IGV4dGVuc2lvbiBpcyBiZXN0IGZvciB0aGUgY3VycmVudCBicm93c2VyXG5cdCAqIHNvIHRoZSBleHRlbnNpb24gaXMgbm90IHJlcXVpcmVkLlxuXHQgKiBAbWV0aG9kIGxvYWRcblx0ICogQHBhcmFtIHtNYXA8U3RyaW5nLCBVcmw+fSBzb3VuZHNcblx0ICogQGV4YW1wbGVcblx0XHRcdC8vTGV0IHRoZSBTb3VuZE1hbmFnZXIgbG9hZCB0aGUgZmlsZSB3aXRoIHRoZSBtb3N0IHN1aXRhYmxlIGV4dGVuc2lvbiBmb3IgdGhpcyBicm93c2VyXG5cdFx0XHRNLlNvdW5kTWFuYWdlci5sb2FkKHtcblx0XHRcdFx0XCJsYXNlclwiOiBcIi9zb3VuZHMvbGFzZXJcIixcblx0XHRcdFx0XCJ0YWxrXCI6IFwiL3NvdW5kcy90YWxrXCJcblx0XHRcdH0pO1xuXHQgKiBAZXhhbXBsZVxuXHRcdFx0Ly9Gb3JjZSBsb2FkaW5nIGFuIG1wMyBmaWxlXG5cdFx0XHRNLlNvdW5kTWFuYWdlci5sb2FkKHtcblx0XHRcdFx0XCJsYXNlclwiOiBcIi9zb3VuZHMvbGFzZXIubXAzXCIsXG5cdFx0XHRcdFwidGFsa1wiOiBcIi9zb3VuZHMvdGFsay5tcDNcIlxuXHRcdFx0fSk7XG5cblx0ICovXG5cdFNvdW5kTWFuYWdlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKG1hcCwgb25GaW5pc2hlZCwgb25Qcm9ncmVzcykge1xuXHRcblx0XHRpZiAoIG9uUHJvZ3Jlc3MgKSB7XG5cdFx0XHR0aGlzLm9uU291bmRMb2FkZWQuYWRkRXZlbnRMaXN0ZW5lcihvblByb2dyZXNzKTtcblx0XHR9XG5cdFx0aWYgKCBvbkZpbmlzaGVkICkge1xuXHRcdFx0dGhpcy5vbkFsbFNvdW5kc0xvYWRlZC5hZGRFdmVudExpc3RlbmVyKG9uRmluaXNoZWQpO1xuXHRcdH1cblxuXHRcdGlmICggbWFwIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cdFx0XG5cdFx0XHR2YXIganNvbk1hcCA9IHt9LFxuXHRcdFx0XHRsb2FkZWQgPSAwLFxuXHRcdFx0XHRzZWxmID0gdGhpcyxcblx0XHRcdFx0b25Kc29uUmVjZWl2ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuXG5cdFx0XHRcdFx0bG9hZGVkKys7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dmFyIGpzb24gPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRqc29uTWFwW2pzb24ubmFtZV0gPSBqc29uLnNvdXJjZTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAoIGxvYWRlZCA+PSBtYXAubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0c2VsZi5sb2FkKGpzb25NYXApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdH07XG5cdFx0XHRcblx0XHRcdGZvciAoIHZhciBpID0gMDsgaSA8IG1hcC5sZW5ndGg7IGkrKyApIHtcblx0XHRcdFx0XG5cdFx0XHRcdE0uQWpheC5wb3N0KG1hcFtpXSwgb25Kc29uUmVjZWl2ZWQpO1xuXHRcdFx0XHRcblx0XHRcdH1cblx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFxuXHRcdFx0Zm9yICggdmFyIGkgaW4gbWFwICkge1xuXHRcdFx0XHR0aGlzLmxvYWRPbmUoIGksIG1hcFtpXSApO1xuXHRcdFx0fVxuXHRcdFxuXHRcdH1cblxuXHR9O1xuXHQvKipcblx0ICogTG9hZHMgYSBzb3VuZCBmcm9tIHRoZSBnaXZlbiB1cmwgYW5kIGFzc2lnbnMgaXQgdGhlIHByb3ZpZGVkIG5hbWVcblx0ICogQG1ldGhvZCBsb2FkT25lXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcblx0ICogQGV4YW1wbGUgXG5cdFx0XHQvL0xvYWQgb25lIGZpbGVcblx0XHRcdE0uU291bmRNYW5hZ2VyLmxvYWRPbmUoXCJmb290c3RlcFwiLCBcIi9zb3VuZHMvZm9vdHN0ZXBcIn0pO1xuXHQgKi9cblx0U291bmRNYW5hZ2VyLnByb3RvdHlwZS5sb2FkT25lID0gZnVuY3Rpb24oIG5hbWUsIHVybCApIHtcblxuXHRcdHRoaXMudG90YWwgPSArK3RoaXMudG9Mb2FkO1xuXHRcdFxuXHRcdGlmICggTS5icm93c2VyLnN1cHBvcnRlZEF1ZGlvRm9ybWF0ID09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dGhpcy5hc3NldHNbIG5hbWUgXSA9IGZha2VTb3VuZDtcblx0XHRcdGZha2VTb3VuZC5uYW1lID0gbmFtZTtcblx0XHRcdHRoaXMub25Tb3VuZExvYWRlZC5yYWlzZSh7c291bmQ6IGZha2VTb3VuZCwgcmVtYWluaW5nOiBNLnNvdW5kcy50b0xvYWQtLSwgdG90YWw6IE0uc291bmRzLnRvdGFsfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICggdGhpcy50b0xvYWQgPD0gMCApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQWxsU291bmRzTG9hZGVkLnJhaXNlKCk7XG4gICAgICAgICAgICB9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZiAoIHVybC5zdWJzdHIoMCwgNCkgPT0gXCJkYXRhXCIgKSB7XG5cdFx0XHRcblx0XHRcdFx0dGhpcy5hc3NldHNbIG5hbWUgXSA9IG5ldyBTb3VuZCggbmFtZSwgdXJsICk7XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFxuXHRcdFx0XHRpZiAoIHVybC5sYXN0SW5kZXhPZihcIi5cIikgPT0gLTEgKSB7XG5cdFx0XHRcdFx0dXJsID0gdXJsICsgTS5icm93c2VyLnN1cHBvcnRlZEF1ZGlvRm9ybWF0O1xuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdFx0dGhpcy5hc3NldHNbIG5hbWUgXSA9IG5ldyBTb3VuZCggbmFtZSwgdGhpcy5wYXRoICsgdXJsICk7XG5cdFx0XHRcdFxuXHRcdFx0fVxuXG5cblx0XHR9XG5cblx0XHR0aGlzLmFzc2V0c1sgbmFtZSBdLm5hbWUgPSBuYW1lO1xuXG5cdH07XG5cdC8qKlxuXHQgKiBQYXVzZXMgYWxsIHNvdW5kc1xuXHQgKiBAbWV0aG9kIHBhdXNlXG5cdCAqIEBleGFtcGxlIFxuXHRcdFx0TS5Tb3VuZE1hbmFnZXIucGF1c2UoKTtcblx0ICovXG5cdFNvdW5kTWFuYWdlci5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcblx0XHRmb3IgKCB2YXIgaSBpbiB0aGlzLmFzc2V0cyApIHtcblx0XHRcdHRoaXMuYXNzZXRzW2ldLnBhdXNlKCk7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgdm9sdW1lIG9mIGFsbCBzb3VuZHNcblx0ICogQG1ldGhvZCBzZXRWb2x1bWVcblx0ICogQHBhcmFtIHtmbG9hdH0gdmFsdWUgdGhlIHZvbHVtZSB2YWx1ZSwgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFcblx0ICogQGV4YW1wbGUgXG5cdFx0XHRNLlNvdW5kTWFuYWdlci5zZXRWb2x1bWUoMC42KTtcblx0ICovXG5cdFNvdW5kTWFuYWdlci5wcm90b3R5cGUuc2V0Vm9sdW1lID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRmb3IgKCB2YXIgaSBpbiB0aGlzLmFzc2V0cyApIHtcblx0XHRcdHRoaXMuYXNzZXRzW2ldLnNldFZvbHVtZSggdmFsdWUgKTtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBNdXRlcyBhbGwgc291bmRzXG5cdCAqIEBtZXRob2QgbXV0ZVxuXHQgKiBAZXhhbXBsZSBcblx0XHRcdE0uU291bmRNYW5hZ2VyLm11dGUoKTtcblx0ICovXG5cdFNvdW5kTWFuYWdlci5wcm90b3R5cGUubXV0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGZvciAoIHZhciBpIGluIHRoaXMuYXNzZXRzICkge1xuXHRcdFx0dGhpcy5hc3NldHNbaV0ubXV0ZSgpO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFVubXV0ZXMgYWxsIHNvdW5kc1xuXHQgKiBAbWV0aG9kIG11dGVcblx0ICogQGV4YW1wbGUgXG5cdFx0XHRNLlNvdW5kTWFuYWdlci51bm11dGUoKTtcblx0ICovXG5cdFNvdW5kTWFuYWdlci5wcm90b3R5cGUudW5tdXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0Zm9yICggdmFyIGkgaW4gdGhpcy5hc3NldHMgKSB7XG5cdFx0XHR0aGlzLmFzc2V0c1tpXS51bm11dGUoKTtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBNdXRlcyBvciB1bm11dGVzIGFsbCBzb3VuZHNcblx0ICogQG1ldGhvZCBtdXRlXG5cdCAqIEBleGFtcGxlIFxuXHRcdFx0TS5Tb3VuZE1hbmFnZXIubXV0ZSgpO1xuXHQgKi9cblx0U291bmRNYW5hZ2VyLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbigpIHtcblx0XHRmb3IgKCB2YXIgaSBpbiB0aGlzLmFzc2V0cyApIHtcblx0XHRcdHRoaXMuYXNzZXRzW2ldLnRvZ2dsZSgpO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFN0b3BzIGFsbCBzb3VuZHNcblx0ICogQG1ldGhvZCBzdG9wXG5cdCAqIEBleGFtcGxlIFxuXHRcdFx0TS5Tb3VuZE1hbmFnZXIuc3RvcCgpO1xuXHQgKi9cblx0U291bmRNYW5hZ2VyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0Zm9yICggdmFyIGkgaW4gdGhpcy5hc3NldHMgKSB7XG5cdFx0XHR0aGlzLmFzc2V0c1tpXS5zdG9wKCk7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogUmVtb3ZlcyB0aGUgc291bmQgdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBpZFxuXHQgKiBAbWV0aG9kIHJlbW92ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaWQgdGhlIHNvdW5kIGlkXG5cdCAqL1xuXHRTb3VuZE1hbmFnZXIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0aWYgKCB0aGlzLmFzc2V0c1tpZF0gKSB7XG5cdFx0XHRkZWxldGUgdGhpcy5hc3NldHNbaWRdO1xuXHRcdFx0aWYgKCB0aGlzLnRvdGFsIC0gMSA+PSAwICkge1xuXHRcdFx0XHR0aGlzLnRvdGFsLS07XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHRoaXMudG9Mb2FkIC0gMSA+PSAwICkge1xuXHRcdFx0XHR0aGlzLnRvTG9hZC0tO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIHNvdW5kc1xuXHQgKiBAbWV0aG9kIHJlbW92ZUFsbFxuXHQgKi9cblx0U291bmRNYW5hZ2VyLnByb3RvdHlwZS5yZW1vdmVBbGwgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmFzc2V0cyA9IHt9O1xuXHRcdHRoaXMudG9Mb2FkID0gMDtcblx0XHR0aGlzLnRvdGFsID0gMDtcblx0fTtcblxuXHRTb3VuZE1hbmFnZXIucHJvdG90eXBlLnJlbW92ZUFsbEV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vblNvdW5kTG9hZGVkID0gbmV3IEV2ZW50TGlzdGVuZXIoKTtcblx0XHR0aGlzLm9uQWxsU291bmRzTG9hZGVkID0gbmV3IEV2ZW50TGlzdGVuZXIoKTtcblx0XHR0aGlzLm9uU291bmRFcnJvciA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG5cdH07XG5cdFxuXHRTb3VuZE1hbmFnZXIucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbihuYW1lLCBsb29wKSB7XG5cdFx0dmFyIHNvdW5kID0gdGhpcy5hc3NldHNbbmFtZV07XG5cdFx0aWYgKCBzb3VuZCApIHtcblx0XHRcdHNvdW5kLnBsYXkobG9vcCk7XG5cdFx0fVxuXHR9O1xuXG5cdFNvdW5kTWFuYWdlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKG5hbWUpIHtcblx0XHR2YXIgc291bmQgPSB0aGlzLmFzc2V0c1tuYW1lXTtcblx0XHRpZiAoIHNvdW5kICkge1xuXHRcdFx0c291bmQuc3RvcCgpO1xuXHRcdH1cblx0fTtcblxuXHRTb3VuZE1hbmFnZXIucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24obmFtZSkge1xuXHRcdHZhciBzb3VuZCA9IHRoaXMuYXNzZXRzW25hbWVdO1xuXHRcdGlmICggc291bmQgKSB7XG5cdFx0XHRzb3VuZC5wYXVzZSgpO1xuXHRcdH1cblx0fTtcblxuXHRTb3VuZE1hbmFnZXIucHJvdG90eXBlLmdldFNvdW5kID0gZnVuY3Rpb24obmFtZSkge1xuXHRcdHJldHVybiB0aGlzLmFzc2V0c1tuYW1lXTtcblx0fTtcblxuXHRNLlNvdW5kTWFuYWdlciA9IE0uc291bmRzID0gbmV3IFNvdW5kTWFuYWdlcigpO1xuXG59KSggTWF0Y2gsIEV2ZW50TGlzdGVuZXIgKTsiLCIoZnVuY3Rpb24gKG5hbWVzcGFjZSkge1xuXHRcblx0LyoqXG5cdCAqIEBjbGFzcyBSZW5kZXJlclxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQGFic3RyYWN0XG5cdCAqL1xuXHRmdW5jdGlvbiBSZW5kZXJlcihjYW52YXMpIHtcblx0XHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcblx0XHR0aGlzLmZyb250QnVmZmVyID0gbnVsbDtcblx0fVxuXHQvKipcblx0ICogQG1ldGhvZCByZW5kZXJcblx0ICogQGFic3RyYWN0XG5cdCAqL1xuXHRSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQWJzdHJhY3QgbWV0aG9kXCIpO1xuXHR9O1xuXHQvKipcblx0ICogQG1ldGhvZCBnZXRDZW50ZXJcblx0ICovXG5cdFJlbmRlcmVyLnByb3RvdHlwZS5nZXRDZW50ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge3g6IHRoaXMuY2FudmFzLndpZHRoIC8gMiwgeTogdGhpcy5jYW52YXMuaGVpZ2h0IC8gMn07XG5cdH07XG5cdC8qKlxuXHQgKiBAbWV0aG9kIHNldFNpemVcblx0ICovXG5cdFJlbmRlcmVyLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24oIHdpZHRoLCBoZWlnaHQgKSB7XG5cdFx0dGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcblx0XHR0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdH07XG5cdC8qKlxuXHQgKiBAbWV0aG9kIGdldFdpZHRoXG5cdCAqL1xuXHRSZW5kZXJlci5wcm90b3R5cGUuZ2V0V2lkdGggPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5jYW52YXMud2lkdGg7XG5cdH07XG5cdC8qKlxuXHQgKiBAbWV0aG9kIGdldEhlaWdodFxuXHQgKi9cblx0UmVuZGVyZXIucHJvdG90eXBlLmdldEhlaWdodCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmNhbnZhcy5oZWlnaHQ7XG5cdH07XG5cdC8qKlxuXHQgKiBAbWV0aG9kIGFkanVzdFRvXG5cdCAqIFN0cmV0Y2hlcyBjYW52YXMgdG8gdGhlIGdpdmVuIHZhbHVlcy5cblx0ICovXG5cdFJlbmRlcmVyLnByb3RvdHlwZS5hZGp1c3RUbyA9IGZ1bmN0aW9uKCB3aWR0aCwgaGVpZ2h0ICkge1xuXHRcdHRoaXMuY2FudmFzLnN0eWxlLnNldFByb3BlcnR5KFwid2lkdGhcIiwgd2lkdGggKyBcInB4XCIsIG51bGwpO1xuXHRcdHRoaXMuY2FudmFzLnN0eWxlLnNldFByb3BlcnR5KFwiaGVpZ2h0XCIsIGhlaWdodCArIFwicHhcIiwgbnVsbCk7XG5cdH07XG5cdC8qKlxuXHQgKiBAbWV0aG9kIGFkanVzdFRvQXZhaWxTaXplXG5cdCAqL1xuXHRSZW5kZXJlci5wcm90b3R5cGUuYWRqdXN0VG9BdmFpbFNpemUgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNhbnZhcy5hZGp1c3RUbyggd2luZG93LnNjcmVlbi5hdmFpbFdpZHRoICsgXCJweFwiLCB3aW5kb3cuc2NyZWVuLmF2YWlsSGVpZ2h0ICsgXCJweFwiICk7XG5cdH07XG5cdC8qKlxuXHQgKiBAbWV0aG9kIHJlc2l6ZUtlZXBpbmdBc3BlY3Rcblx0ICovXG5cdFJlbmRlcmVyLnByb3RvdHlwZS5yZXNpemVLZWVwaW5nQXNwZWN0ID0gZnVuY3Rpb24oIHRpbWVzICkge1xuXHRcdHRoaXMuY2FudmFzLmFkanVzdFRvKCB0aGlzLmNhbnZhcy53aWR0aCAqIHRpbWVzLCB0aGlzLmNhbnZhcy5oZWlnaHQgKiB0aW1lcyApO1xuXHR9O1xuXHQvKipcblx0ICogQG1ldGhvZCBnZXRSaWdodFxuXHQgKi9cblx0UmVuZGVyZXIucHJvdG90eXBlLmdldFJpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2FudmFzLm9mZnNldExlZnQgKyB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aDtcblx0fTtcblx0LyoqXG5cdCAqIEBtZXRob2QgZ2V0Qm90dG9tXG5cdCAqL1xuXHRSZW5kZXJlci5wcm90b3R5cGUuZ2V0Qm90dG9tID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2FudmFzLm9mZnNldFRvcCArIHRoaXMuY2FudmFzLm9mZnNldEhlaWdodDtcblx0fTtcblx0LyoqXG5cdCAqIEBtZXRob2QgZ2V0QXZhaWxXaWR0aFxuXHQgKi9cblx0UmVuZGVyZXIucHJvdG90eXBlLmdldEF2YWlsV2lkdGggPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuY2FudmFzLmdldFJpZ2h0KCkgPCB3aW5kb3cuc2NyZWVuLmF2YWlsV2lkdGggKSB7IFxuXHRcdFx0cmV0dXJuIHRoaXMuY2FudmFzLm9mZnNldFdpZHRoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gd2luZG93LnNjcmVlbi5hdmFpbFdpZHRoIC0gdGhpcy5jYW52YXMub2Zmc2V0TGVmdDtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBAbWV0aG9kIGdldEF2YWlsSGVpZ2h0XG5cdCAqL1xuXHRSZW5kZXJlci5wcm90b3R5cGUuZ2V0QXZhaWxIZWlnaHQgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuY2FudmFzLmdldEJvdHRvbSgpIDwgd2luZG93LnNjcmVlbi5hdmFpbEhlaWdodCApIHsgXG5cdFx0XHRyZXR1cm4gdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gd2luZG93LnNjcmVlbi5hdmFpbEhlaWdodCAtIHRoaXMuY2FudmFzLm9mZnNldFRvcDtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBAbWV0aG9kIGdldFZpZXdwb3J0XG5cdCAqL1xuXHRSZW5kZXJlci5wcm90b3R5cGUuZ2V0Vmlld3BvcnQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgdmlld3BvcnQgPSB7fTtcblx0XHRpZiAoIHRoaXMuY2FudmFzLm9mZnNldExlZnQgPCAwICkge1xuXHRcdFx0dmlld3BvcnQubGVmdCA9IC10aGlzLmNhbnZhcy5vZmZzZXRMZWZ0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2aWV3cG9ydC5sZWZ0ID0gMDtcblx0XHR9XG5cdFx0aWYgKCB0aGlzLmNhbnZhcy5vZmZzZXRUb3AgPCAwICkge1xuXHRcdFx0dmlld3BvcnQudG9wID0gLXRoaXMuY2FudmFzLm9mZnNldFRvcDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmlld3BvcnQudG9wID0gMDtcblx0XHR9XG5cdFx0aWYgKCB0aGlzLmNhbnZhcy5vZmZzZXRMZWZ0ICsgdGhpcy5jYW52YXMub2Zmc2V0V2lkdGggPiB3aW5kb3cuc2NyZWVuLmF2YWlsV2lkdGggKSB7XG5cdFx0XHR2aWV3cG9ydC5yaWdodCA9IHdpbmRvdy5zY3JlZW4uYXZhaWxXaWR0aCAtIHRoaXMuY2FudmFzLm9mZnNldExlZnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZpZXdwb3J0LnJpZ2h0ID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XG5cdFx0fVxuXHRcdGlmICggdGhpcy5jYW52YXMub2Zmc2V0VG9wICsgdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0ID4gd2luZG93LnNjcmVlbi5hdmFpbEhlaWdodCApIHtcblx0XHRcdHZpZXdwb3J0LmJvdHRvbSA9IHdpbmRvdy5zY3JlZW4uYXZhaWxIZWlnaHQgLSB0aGlzLmNhbnZhcy5vZmZzZXRUb3A7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZpZXdwb3J0LmJvdHRvbSA9IHRoaXMuY2FudmFzLm9mZnNldEhlaWdodDtcblx0XHR9XG5cdFx0cmV0dXJuIHZpZXdwb3J0O1xuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYXNwZWN0IGJldHdlZW4gdGhlIGFjdHVhbCBzaXplIG9mIHRoZSBjYW52YXMgYW5kIHRoZSBjc3Mgc2l6ZSBvZiBpdCAgXG5cdCAqIEBtZXRob2QgZ2V0QXNwZWN0XG5cdCAqL1xuXHRSZW5kZXJlci5wcm90b3R5cGUuZ2V0QXNwZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGFzcGVjdCA9IHsgeDogMSwgeTogMSB9O1xuXHRcdGlmICggdGhpcy5jYW52YXMuc3R5bGUud2lkdGggJiYgdGhpcy5jYW52YXMud2lkdGggIT0gcGFyc2VJbnQodGhpcy5jYW52YXMuc3R5bGUud2lkdGgpICkge1xuXHRcdFx0YXNwZWN0LnggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHBhcnNlSW50KHRoaXMuY2FudmFzLnN0eWxlLndpZHRoKTtcblx0XHR9XG5cdFx0aWYgKCB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgJiYgdGhpcy5jYW52YXMuaGVpZ2h0ICE9IHBhcnNlSW50KHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCkgKSB7XG5cdFx0XHRhc3BlY3QueSA9IHRoaXMuY2FudmFzLmhlaWdodCAvIHBhcnNlSW50KHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCk7XG5cdFx0fVxuXHRcdHJldHVybiBhc3BlY3Q7XG5cdH07XG5cdC8qKlxuXHQgKiBTdHJldGNoZXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBjYW52YXMgdG8gdGhlIHNpemUgb2YgdGhlIGh0bWwgZG9jdW1lbnQuXG5cdCAqIFRoaXMgd29ya3MgYXMgZm9yY2luZyBhIGZ1bGxzY3JlZW4sIGlmIHRoZSBuYXZpZ2F0aW9uIGJhcnMgb2YgdGhlIGJyb3dzZXIgd2VyZSBoaWRkZW4uXG5cdCAqXG5cdCAqIE5PVEU6IFRoaXMgbWV0aG9kIGJlaGF2ZXMgZXhhY3RseSBhcyBzZXRDYW52YXNTdHJldGNoVG8gdXNpbmcgZG9jdW1lbnQgY2xpZW50IHdpZHRoIGFuZCBoZWlnaHRcblx0ICpcblx0ICogQG1ldGhvZCBzZXRDYW52YXNTdHJldGNoXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gdmFsdWUgdHJ1ZSB0byBzdHJldGNoLCBmYWxzZSB0byBzZXQgZGVmYXVsdCB2YWx1ZXNcblx0ICovXG5cdFJlbmRlcmVyLnByb3RvdHlwZS5zZXRDYW52YXNTdHJldGNoID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRpZiAoIHZhbHVlICkge1xuXHRcdFx0dGhpcy5zZXRDYW52YXNTdHJldGNoVG8oZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZXRDYW52YXNTdHJldGNoVG8oXCJhdXRvXCIsIFwiYXV0b1wiKTtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBTdHJldGNoZXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBjYW52YXMgdG8gdGhlIGdpdmVuIHNpemVcblx0ICpcblx0ICogQG1ldGhvZCBzZXRDYW52YXNTdHJldGNoVG9cblx0ICogQHBhcmFtIHtTdHJpbmd9IHcgd2lkdGggaW4gY29vcmRpbmF0ZXMsIGFzIGNzcyBwaXhlbHMgb3IgcGVyY2VudGFnZXNcblx0ICogQHBhcmFtIHtTdHJpbmd9IGggaGVpZ2h0IGluIGNvb3JkaW5hdGVzLCBhcyBjc3MgcGl4ZWxzIG9yIHBlcmNlbnRhZ2VzXG5cdCAqL1xuXHRSZW5kZXJlci5wcm90b3R5cGUuc2V0Q2FudmFzU3RyZXRjaFRvID0gZnVuY3Rpb24odywgaCkge1xuXHRcdGlmICggdGhpcy5mcm9udEJ1ZmZlciApIHtcblx0XHRcdGlmICggdyApIHtcblx0XHRcdFx0aWYgKCB0eXBlb2YgdyA9PSBcIm51bWJlclwiIHx8ICggdyAhPSBcImF1dG9cIiAmJiB3LmluZGV4T2YoXCJweFwiKSA9PSBcIi0xXCIgJiYgdy5pbmRleE9mKFwiJVwiKSA9PSBcIi0xXCIgKSApIHtcblx0XHRcdFx0XHR3ID0gdyArIFwicHhcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmZyb250QnVmZmVyLmNhbnZhcy5zdHlsZS53aWR0aCA9IHc7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggaCApIHtcblx0XHRcdFx0aWYgKCB0eXBlb2YgaCA9PSBcIm51bWJlclwiIHx8ICggaCAhPSBcImF1dG9cIiAmJiBoLmluZGV4T2YoXCJweFwiKSA9PSBcIi0xXCIgJiYgaC5pbmRleE9mKFwiJVwiKSA9PSBcIi0xXCIgKSApIHtcblx0XHRcdFx0XHRoID0gaCArIFwicHhcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmZyb250QnVmZmVyLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0XG5cdFJlbmRlcmVyLm5hbWUgPSBcIlJlbmRlcmVyXCI7XG5cblx0TS5yZW5kZXJlcnMgPSBNLnJlbmRlcmVycyB8fCB7fTtcblxuXHRuYW1lc3BhY2UucmVuZGVyZXJzLlJlbmRlcmVyID0gUmVuZGVyZXI7XG5cbn0pKE0pOyIsIihmdW5jdGlvbiAoUmVuZGVyZXIpIHtcblx0XG5cdGZ1bmN0aW9uIFN0YW5kYXJkRW50aXR5UmVuZGVyZXIoY2FudmFzKSB7XG5cblx0XHR0aGlzLmV4dGVuZHNSZW5kZXJlcihjYW52YXMpO1xuXG5cdFx0dGhpcy5mcm9udEJ1ZmZlciA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblx0XHRcblx0XHR0aGlzLmJhY2tCdWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLmdldENvbnRleHQoXCIyZFwiKTtcblxuXHRcdHRoaXMuY29tcG9zaXRlT3BlcmF0aW9ucyA9IFtcblx0XHRcdFwic291cmNlLW92ZXJcIixcblx0XHRcdFwic291cmNlLWF0b3BcIixcblx0XHRcdFwic291cmNlLWluXCIsXG5cdFx0XHRcInNvdXJjZS1vdXRcIixcblx0XHRcdFwiZGVzdGluYXRpb24tYXRvcFwiLFxuXHRcdFx0XCJkZXN0aW5hdGlvbi1pblwiLFxuXHRcdFx0XCJkZXN0aW5hdGlvbi1vdXRcIixcblx0XHRcdFwiZGVzdGluYXRpb24tb3ZlclwiLFxuXHRcdFx0XCJsaWdodGVyXCIsXG5cdFx0XHRcInhvclwiLFxuXHRcdFx0XCJjb3B5XCJcblx0XHRdO1xuXHRcblx0XHR0aGlzLkRFRkFVTFRfQ09NUE9TSVRFX09QRVJBVElPTiA9IDA7XG5cdFx0dGhpcy5ERUZBVUxUX0FMUEhBID0gMTtcblx0XHR0aGlzLkRFRkFVTFRfU0hBRE9XX09GRlNFVF9YID0gdGhpcy5mcm9udEJ1ZmZlci5zaGFkb3dPZmZzZXRYO1xuXHRcdHRoaXMuREVGQVVMVF9TSEFET1dfT0ZGU0VUX1kgPSB0aGlzLmZyb250QnVmZmVyLnNoYWRvd09mZnNldFk7XG5cdFx0dGhpcy5ERUZBVUxUX1NIQURPV19DT0xPUiA9IHRoaXMuZnJvbnRCdWZmZXIuc2hhZG93Q29sb3I7XG5cdFx0dGhpcy5ERUZBVUxUX1NIQURPV19CTFVSID0gdGhpcy5mcm9udEJ1ZmZlci5zaGFkb3dCbHVyO1xuXG5cdFx0dGhpcy5zaGFkb3dCbHVyID0gdGhpcy5ERUZBVUxUX1NIQURPV19CTFVSO1xuXHRcdHRoaXMuc2hhZG93T2Zmc2V0WCA9IHRoaXMuREVGQVVMVF9TSEFET1dfT0ZGU0VUX1g7XG5cdFx0dGhpcy5zaGFkb3dPZmZzZXRZID0gdGhpcy5ERUZBVUxUX1NIQURPV19PRkZTRVRfWTtcblx0XHR0aGlzLnNoYWRvd0NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuY29tcG9zaXRlT3BlcmF0aW9uID0gdGhpcy5ERUZBVUxUX0NPTVBPU0lURV9PUEVSQVRJT047XG5cblx0XHR0aGlzLl9yZVJlbmRlckFsbExheWVycyA9IGZhbHNlO1xuICAgIFxuICAgIHRoaXMuX2J1ZmZlcnMgPSB7fTtcblxuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMuY2FtZXJhID0gbmV3IE0uQ2FtZXJhKCk7XG5cdFx0dGhpcy5jYW1lcmEuYWRkRXZlbnRMaXN0ZW5lcihcImxvY2F0aW9uQ2hhbmdlZFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLl9yZVJlbmRlckFsbExheWVycyA9IHRydWU7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnVwZGF0ZUJ1ZmZlclNpemUoKTtcblx0XHR0aGlzLnVwZGF0ZVZpZXdwb3J0KCk7XG5cdFx0XG5cdH1cblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUuc2V0RnVsbFNjcmVlbiA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZnJvbnRCdWZmZXIuY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0dGhpcy5mcm9udEJ1ZmZlci5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdHRoaXMudXBkYXRlQnVmZmVyU2l6ZSgpO1xuXHR9O1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZnJvbnRCdWZmZXI7XG5cdH07XG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLmdldENhbnZhcyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmZyb250QnVmZmVyLmNhbnZhcztcblx0fTtcblx0LyoqXG5cdCAqIEFwcGxpZXMgdGhlIG9wZXJhdGlvbiBvZiB0aGlzIG9iamVjdCB0byB0aGUgY29udGV4dCBhcyBjb21wb3NpdGUgb3BlcmF0aW9uXG5cdCAqXG5cdCAqIEBtZXRob2QgX2FwcGx5T3BlcmF0aW9uXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICogQHBhcmFtIHtTdGFuZGFyZEVudGl0eVJlbmRlcmVyfSBjb250ZXh0XG5cdCAqL1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5fYXBwbHlPcGVyYXRpb24gPSBmdW5jdGlvbihvYmplY3QsIGNvbnRleHQpIHtcblx0XHRpZiAoIG9iamVjdC5fY29tcG9zaXRlT3BlcmF0aW9uICkge1xuXHRcdFx0Y29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSB0aGlzLmNvbXBvc2l0ZU9wZXJhdGlvbnNbb2JqZWN0Ll9jb21wb3NpdGVPcGVyYXRpb25dO1xuXHRcdFx0dGhpcy5jb21wb3NpdGVPcGVyYXRpb24gPSBvYmplY3QuX2NvbXBvc2l0ZU9wZXJhdGlvbjtcblx0XHR9IGVsc2UgaWYgKHRoaXMuY29tcG9zaXRlT3BlcmF0aW9uICE9IHRoaXMuREVGQVVMVF9DT01QT1NJVEVfT1BFUkFUSU9OKSB7XG5cdFx0XHR0aGlzLnJlc2V0T3BlcmF0aW9uKGNvbnRleHQpO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIEBtZXRob2QgcmVzZXRPcGVyYXRpb25cblx0ICogQGFic3RyYWN0XG5cdCAqL1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5yZXNldE9wZXJhdGlvbiA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0XHRjb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IHRoaXMuY29tcG9zaXRlT3BlcmF0aW9uc1t0aGlzLkRFRkFVTFRfQ09NUE9TSVRFX09QRVJBVElPTl07XG5cdFx0dGhpcy5jb21wb3NpdGVPcGVyYXRpb24gPSB0aGlzLkRFRkFVTFRfQ09NUE9TSVRFX09QRVJBVElPTjtcblx0fTtcblx0LyoqXG5cdCAqIEFwcGxpZXMgdGhlIGFscGhhIG9mIHRoaXMgb2JqZWN0IHRvIHRoZSBwcm92aWRlZCBjb250ZXh0XG5cdCAqXG5cdCAqIEBtZXRob2QgX2FwcGx5T3BlcmF0aW9uXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICogQHBhcmFtIHtTdGFuZGFyZEVudGl0eVJlbmRlcmVyfSBjb250ZXh0XG5cdCAqL1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5fYXBwbHlBbHBoYSA9IGZ1bmN0aW9uKG9iamVjdCwgY29udGV4dCkge1xuXHRcdFxuXHRcdGlmICggb2JqZWN0Ll9hbHBoYSAhPSB1bmRlZmluZWQgJiYgb2JqZWN0Ll9hbHBoYSA+PSAwICYmIG9iamVjdC5fYWxwaGEgPD0gMSApIHtcblx0XHRcdGlmICggIHRoaXMuYWxwaGEgIT0gb2JqZWN0Ll9hbHBoYSApIHtcblx0XHRcdFx0Y29udGV4dC5nbG9iYWxBbHBoYSA9IHRoaXMuYWxwaGEgPSBvYmplY3QuX2FscGhhO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIHRoaXMuYWxwaGEgIT0gdGhpcy5ERUZBVUxUX0FMUEhBICkge1xuXHRcdFx0dGhpcy5yZXNldEFscGhhKGNvbnRleHQpO1xuXHRcdH1cblxuXHR9O1xuXHQvKipcblx0ICogQG1ldGhvZCByZXNldEFscGhhXG5cdCAqIEBhYnN0cmFjdFxuXHQgKi9cblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUucmVzZXRBbHBoYSA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0XHRjb250ZXh0Lmdsb2JhbEFscGhhID0gdGhpcy5hbHBoYSA9IHRoaXMuREVGQVVMVF9BTFBIQTtcblx0fTtcblx0LyoqXG5cdCAqIEFwcGxpZXMgdGhlIHNoYWRvdyBvZiB0aGlzIG9iamVjdCB0byB0aGUgcHJvdmlkZWQgY29udGV4dFxuXHQgKlxuXHQgKiBAbWV0aG9kIF9hcHBseVNoYWRvd1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqIEBwYXJhbSB7U3RhbmRhcmRFbnRpdHlSZW5kZXJlcn0gY29udGV4dFxuXHQgKi9cblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUuX2FwcGx5U2hhZG93ID0gZnVuY3Rpb24ob2JqZWN0LCBjb250ZXh0KSB7XG5cdFx0Ly8gaWYgKCBvYmplY3QuX3NoYWRvdyApIHtcblx0XHQvLyBcdHZhciBzID0gb2JqZWN0Ll9zaGFkb3c7XG5cdFx0Ly8gXHRjb250ZXh0LnNoYWRvd09mZnNldFggPSB0aGlzLnNoYWRvd09mZnNldFggPSBzLng7XG5cdFx0Ly8gXHRjb250ZXh0LnNoYWRvd09mZnNldFkgPSB0aGlzLnNoYWRvd09mZnNldFkgPSBzLnk7XG5cdFx0Ly8gXHRjb250ZXh0LnNoYWRvd0JsdXIgPSB0aGlzLnNoYWRvd0JsdXIgPSBzLmJsdXI7XG5cdFx0Ly8gXHRjb250ZXh0LnNoYWRvd0NvbG9yID0gcy5jb2xvcjtcblx0XHQvLyBcdHRoaXMuc2hhZG93Q2hhbmdlZCA9IHRydWU7XG5cdFx0Ly8gfSBlbHNlIGlmICh0aGlzLnNoYWRvd0NoYW5nZWQpIHtcblx0XHQvLyBcdHRoaXMucmVzZXRTaGFkb3coY29udGV4dCk7XG5cdFx0Ly8gfVxuXG5cdFx0Y29udGV4dC5zaGFkb3dCbHVyID0gdGhpcy5ERUZBVUxUX1NIQURPV19CTFVSO1xuXHRcdGNvbnRleHQuc2hhZG93T2Zmc2V0WCA9IHRoaXMuREVGQVVMVF9TSEFET1dfT0ZGU0VUX1g7XG5cdFx0Y29udGV4dC5zaGFkb3dPZmZzZXRZID0gdGhpcy5ERUZBVUxUX1NIQURPV19PRkZTRVRfWTtcblx0XHRjb250ZXh0LnNoYWRvd0NvbG9yID0gdGhpcy5ERUZBVUxUX1NIQURPV19DT0xPUjtcblx0XHRcblx0XHRpZiAoIG9iamVjdC5fc2hhZG93ICkge1xuXHRcdFx0dmFyIHMgPSBvYmplY3QuX3NoYWRvdztcblx0XHRcdGNvbnRleHQuc2hhZG93T2Zmc2V0WCA9IHMueDtcblx0XHRcdGNvbnRleHQuc2hhZG93T2Zmc2V0WSA9IHMueTtcblx0XHRcdGNvbnRleHQuc2hhZG93Qmx1ciA9IHMuYmx1cjtcblx0XHRcdGNvbnRleHQuc2hhZG93Q29sb3IgPSBzLmNvbG9yO1xuXHRcdH1cblxuXHR9O1xuXHQvKipcblx0ICogQG1ldGhvZCByZXNldFNoYWRvd1xuXHQgKiBAYWJzdHJhY3Rcblx0ICovXG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLnJlc2V0U2hhZG93ID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRcdC8vIGlmICggdGhpcy5zaGFkb3dDaGFuZ2VkICkge1xuXHRcdFx0Ly8gaWYgKCB0aGlzLnNoYWRvd0JsdXIgIT0gdGhpcy5ERUZBVUxUX1NIQURPV19CTFVSICkge1xuXHRcdFx0Ly8gXHRjb250ZXh0LnNoYWRvd0JsdXIgPSB0aGlzLnNoYWRvd0JsdXIgPSB0aGlzLkRFRkFVTFRfU0hBRE9XX0JMVVI7XG5cdFx0XHQvLyB9XG5cdFx0XHQvLyBpZiAoIHRoaXMuc2hhZG93T2Zmc2V0WCAhPSB0aGlzLkRFRkFVTFRfU0hBRE9XX0JMVVIgKSB7XG5cdFx0XHQvLyBcdGNvbnRleHQuc2hhZG93T2Zmc2V0WCA9IHRoaXMuc2hhZG93T2Zmc2V0WCA9IHRoaXMuREVGQVVMVF9TSEFET1dfT0ZGU0VUX1g7XG5cdFx0XHQvLyB9XG5cdFx0XHQvLyBpZiAoIHRoaXMuc2hhZG93T2Zmc2V0WSAhPSB0aGlzLkRFRkFVTFRfU0hBRE9XX09GRlNFVF9ZICkge1xuXHRcdFx0Ly8gXHRjb250ZXh0LnNoYWRvd09mZnNldFkgPSB0aGlzLnNoYWRvd09mZnNldFkgPSB0aGlzLkRFRkFVTFRfU0hBRE9XX09GRlNFVF9ZO1xuXHRcdFx0Ly8gfVxuXHRcdFx0Ly8gdGhpcy5zaGFkb3dDaGFuZ2VkID0gZmFsc2U7XG5cdFx0Ly8gfVxuXG5cdFx0Y29udGV4dC5zaGFkb3dCbHVyID0gdGhpcy5ERUZBVUxUX1NIQURPV19CTFVSO1xuXHRcdGNvbnRleHQuc2hhZG93T2Zmc2V0WCA9IHRoaXMuREVGQVVMVF9TSEFET1dfT0ZGU0VUX1g7XG5cdFx0Y29udGV4dC5zaGFkb3dPZmZzZXRZID0gdGhpcy5ERUZBVUxUX1NIQURPV19PRkZTRVRfWTtcblx0XHRjb250ZXh0LnNoYWRvd0NvbG9yID0gdGhpcy5ERUZBVUxUX1NIQURPV19DT0xPUjtcblxuXHR9O1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5zZXRSZW5kZXJpbmdBbHBoYVRpbWUgPSBmdW5jdGlvbihhbHBoYVRpbWUpIHtcblx0XHR0aGlzLl9hbHBoYVRpbWUgPSBhbHBoYVRpbWU7XG5cdFx0dGhpcy5fYWxwaGFUaW1lRGlmID0gMSAtIGFscGhhVGltZTtcblx0fTtcdFx0XHRcblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUuaW50ZXJwb2xhdGUgPSBmdW5jdGlvbihjdXJyZW50LCBwcmV2aW91cykge1xuXHRcdHJldHVybiBwcmV2aW91cyAqIHRoaXMuX2FscGhhVGltZSArIGN1cnJlbnQgKiB0aGlzLl9hbHBoYVRpbWVEaWY7XG5cdH07XG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLl9pbnRlcnBvbGF0ZVggPSBmdW5jdGlvbihvYmplY3QpIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcnBvbGF0ZShvYmplY3QuX3gsIG9iamVjdC5fcHJldlgpO1xuXHR9O1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5faW50ZXJwb2xhdGVZID0gZnVuY3Rpb24ob2JqZWN0KSB7XG5cdFx0cmV0dXJuIHRoaXMuaW50ZXJwb2xhdGUob2JqZWN0Ll95LCBvYmplY3QuX3ByZXZZKTtcblx0fTtcblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUuX2FwcGx5VHJhbnNsYXRpb24gPSBmdW5jdGlvbihvYmplY3QsIGNvbnRleHQsIGNhbWVyYVgsIGNhbWVyYVkpIHtcblx0XHRjb250ZXh0LnRyYW5zbGF0ZShvYmplY3QuX3ggLSBjYW1lcmFYLCBvYmplY3QuX3kgLSBjYW1lcmFZKTtcblx0fTtcblx0LyoqXG5cdCAqIEFwcGxpZXMgdGhlIHJvdGF0aW9uIG9mIHRoaXMgb2JqZWN0IHRvIHRoZSBwcm92aWRlZCBjb250ZXh0XG5cdCAqXG5cdCAqIEBtZXRob2QgX2FwcGx5Um90YXRpb25cblx0ICogQHByb3RlY3RlZFxuXHQgKiBAcGFyYW0ge1N0YW5kYXJkRW50aXR5UmVuZGVyZXJ9IGNvbnRleHRcblx0ICovXG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLl9hcHBseVJvdGF0aW9uID0gZnVuY3Rpb24ob2JqZWN0LCBjb250ZXh0KSB7XG5cdFx0aWYgKCBvYmplY3QuX3JvdGF0aW9uICkge1xuXHRcdFx0Y29udGV4dC5yb3RhdGUob2JqZWN0Ll9yb3RhdGlvbik7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogQXBwbGllcyB0aGUgc2NhbGUgZmFjdG9yIG9mIHRoaXMgb2JqZWN0IHRvIHRoZSBwcm92aWRlZCBjb250ZXh0XG5cdCAqXG5cdCAqIEBtZXRob2QgX2FwcGx5U2NhbGVcblx0ICogQHByb3RlY3RlZFxuXHQgKiBAcGFyYW0ge1N0YW5kYXJkRW50aXR5UmVuZGVyZXJ9IGNvbnRleHRcblx0ICovXG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLl9hcHBseVNjYWxlID0gZnVuY3Rpb24ob2JqZWN0LCBjb250ZXh0KSB7XG5cdFx0aWYgKCBvYmplY3QuX3NjYWxlICkge1xuXHRcdFx0Y29udGV4dC5zY2FsZShvYmplY3QuX3NjYWxlLngsIG9iamVjdC5fc2NhbGUueSk7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogQ2xlYXJzIHRoZSBnaXZlbiBjb250ZXh0XG5cdCAqIEBtZXRob2QgY2xlYXJcblx0ICogQHBhcmFtIHtIVE1MQ29udGV4dDJkfSBjb250ZXh0IHRvIGNsZWFyXG5cdCAqL1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0XHRjb250ZXh0LmNsZWFyUmVjdCgwLDAsIGNvbnRleHQuY2FudmFzLndpZHRoLCBjb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuXHR9O1xuXHQvKipcblx0ICogUmVuZGVycyB0aGUgY29udGVudHMgb2YgdGhlIGxheWVycyB0byB0aGUgZ2FtZSBjYW52YXMgd2l0aG91dCB1c2luZyBhIG1pZGRsZSBidWZmZXIuIFRoaXMgbWF5IHJlc3VsdCBpbiBmbGlja2VyaW5nXG5cdCAqIGluIHNvbWUgc3lzdGVtcyBhbmQgZG9lcyBub3QgYWxsb3cgYXBwbHlpbmcgcHJvcGVydGllcyB0byBsYXllcnNcblx0ICogQG1ldGhvZCByZW5kZXJTaW5nbGVCdWZmZXJcblx0ICogQHBhcmFtIHtBcnJheX0gZ2FtZUxheWVyTGlzdCBhcnJheSBvZiBnYW1lIGxheWVyc1xuXHQgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gZnJvbnRDYW52YXMgdGhlIGNhbnZhcyBhdHRhY2hlZCB0byB0aGUgZG9jdW1lbnQgd2hlcmUgdGhlIGdhbWUgdGFrZXMgcGxhY2Vcblx0ICogQHBhcmFtIHtPbkxvb3BQcm9wZXJ0aWVzfSBwIHVzZWZ1bCBvYmplY3RzIGZvciBwZXJmb3JtYW5jZSBpbmNyZWFzZVxuXHQgKi9cblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyU2luZ2xlQnVmZmVyID0gZnVuY3Rpb24oZ2FtZUxheWVyTGlzdCwgZnJvbnRDYW52YXMsIHApIHtcblxuXHRcdC8qKlxuXHRcdCAqIENhY2hlIHZhcmlhYmxlcyB0aGF0IGFyZSB1c2VkIGluIHRoaXMgZnVuY3Rpb25cblx0XHQgKi9cblx0XHR2YXIgbCA9IGdhbWVMYXllckxpc3QubGVuZ3RoLFxuXHRcdFx0aSA9IDAsXG5cdFx0XHRmID0gdGhpcy5mcm9udEJ1ZmZlcjtcblxuXHRcdGYuY2xlYXJSZWN0KDAsIDAsIGZyb250Q2FudmFzLndpZHRoLCBmcm9udENhbnZhcy5oZWlnaHQpO1xuXG5cdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0Zi5kcmF3SW1hZ2UoIGdhbWVMYXllckxpc3RbaV0ub25Mb29wKHApLCAwLCAwICk7XG5cdFx0fVxuXG5cdH07XG5cdC8qKlxuXHQgKiBSZW5kZXJzIHRoZSBjb250ZW50cyBvZiB0aGUgbGF5ZXJzIHRvIHRoZSBnYW1lIGNhbnZhcyB1c2luZyBhIG1pZGRsZSBidWZmZXIgdG8gYXZvaWQgZmxpY2tlcmluZy4gRW5hYmxlcyB0aGUgdXNlIG9mIGxheWVyIHByb3BlcnRpZXNcblx0ICogQG1ldGhvZCByZW5kZXJEb3VibGVCdWZmZXJcblx0ICogQHBhcmFtIHtBcnJheX0gZ2FtZUxheWVyTGlzdCBhcnJheSBvZiBnYW1lIGxheWVyc1xuXHQgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gZnJvbnRDYW52YXMgdGhlIGNhbnZhcyBhdHRhY2hlZCB0byB0aGUgZG9jdW1lbnQgd2hlcmUgdGhlIGdhbWUgdGFrZXMgcGxhY2Vcblx0ICogQHBhcmFtIHtPbkxvb3BQcm9wZXJ0aWVzfSBwIHVzZWZ1bCBvYmplY3RzIGZvciBwZXJmb3JtYW5jZSBpbmNyZWFzZVxuXHQgKi9cblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyRG91YmxlQnVmZmVyID0gZnVuY3Rpb24oZ2FtZUxheWVyTGlzdCwgZnJvbnRDYW52YXMsIHApIHtcblxuXHRcdC8qXG5cdFx0ICogQ2FjaGUgdmFyaWFibGVzIHRoYXQgYXJlIHVzZWQgaW4gdGhpcyBmdW5jdGlvblxuXHRcdCAqL1xuXHRcdHZhciBsID0gZ2FtZUxheWVyTGlzdC5sZW5ndGgsXG5cdFx0XHRpID0gMCxcblx0XHRcdGN1cnJlbnRMYXllcixcblx0XHRcdGJhY2tCdWZmZXIgPSB0aGlzLmJhY2tCdWZmZXI7XG5cblx0XHRiYWNrQnVmZmVyLmNsZWFyUmVjdCgwLCAwLCBmcm9udENhbnZhcy53aWR0aCwgZnJvbnRDYW52YXMuaGVpZ2h0KTtcblxuXHRcdGZvciAoIDsgaSA8IGw7IGkrKyApIHtcblxuXHRcdFx0Y3VycmVudExheWVyID0gZ2FtZUxheWVyTGlzdFtpXTtcblxuXHRcdFx0dmFyIHJlc3VsdCA9IGN1cnJlbnRMYXllci5vbkxvb3AocCk7XG5cblx0XHRcdGJhY2tCdWZmZXIuc2F2ZSgpO1xuXG5cdFx0XHRpZiAoIGN1cnJlbnRMYXllci5jb21wb3NpdGUgKSB7XG5cdFx0XHRcdGJhY2tCdWZmZXIuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gY3VycmVudExheWVyLmNvbXBvc2l0ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjdXJyZW50TGF5ZXIuX2FscGhhICE9IG51bGwgJiYgY3VycmVudExheWVyLl9hbHBoYSA+PSAwICYmIGN1cnJlbnRMYXllci5fYWxwaGEgPD0gMSApIHtcblx0XHRcdFx0YmFja0J1ZmZlci5nbG9iYWxBbHBoYSA9IGN1cnJlbnRMYXllci5fYWxwaGE7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBoVyA9IHRoaXMuYmFja0J1ZmZlckhhbGZXaWR0aCxcblx0XHRcdFx0aEggPSB0aGlzLmJhY2tCdWZmZXJIYWxmSGVpZ2h0O1xuXG5cdFx0XHQvLyB2YXIgaFcgPSB+fih0aGlzLmJhY2tCdWZmZXJIYWxmV2lkdGggKyAwLjUpLFxuXHRcdFx0Ly8gXHRoSCA9IH5+KHRoaXMuYmFja0J1ZmZlckhhbGZIZWlnaHQgKyAwLjUpO1xuXG5cblx0XHRcdGJhY2tCdWZmZXIudHJhbnNsYXRlKGhXLCBoSCk7XG5cblx0XHRcdGlmICggY3VycmVudExheWVyLnJvdGF0aW9uICkge1xuXHRcdFx0XHRiYWNrQnVmZmVyLnJvdGF0ZShjdXJyZW50TGF5ZXIucm90YXRpb24pO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGN1cnJlbnRMYXllci5zY2FsZSApIHtcblx0XHRcdFx0YmFja0J1ZmZlci5zY2FsZShjdXJyZW50TGF5ZXIuc2NhbGUueCwgY3VycmVudExheWVyLnNjYWxlLnkpO1xuXHRcdFx0fVxuXG5cdFx0XHRiYWNrQnVmZmVyLmRyYXdJbWFnZSggcmVzdWx0LCBoVywgaEgpO1xuXG5cdFx0XHRiYWNrQnVmZmVyLnJlc3RvcmUoKTtcblxuXHRcdH1cblxuXHRcdHRoaXMuZnJvbnRCdWZmZXIuY2xlYXJSZWN0KDAsIDAsIGZyb250Q2FudmFzLndpZHRoLCBmcm9udENhbnZhcy5oZWlnaHQpO1xuXG5cdFx0dGhpcy5mcm9udEJ1ZmZlci5kcmF3SW1hZ2UoIGJhY2tCdWZmZXIuY2FudmFzLCAwLCAwICk7XG5cblx0fTtcblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGJhY2sgYnVmZmVyIHNpemUgdG8gbWF0Y2ggdGhlIHNpemUgb2YgdGhlIGdhbWUgY2FudmFzXG5cdCAqXG5cdCAqIEBtZXRob2QgdXBkYXRlQnVmZmVyU2l6ZVxuXHQgKi9cblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUudXBkYXRlQnVmZmVyU2l6ZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYgKCB0aGlzLmJhY2tCdWZmZXIgJiYgdGhpcy5mcm9udEJ1ZmZlciApIHtcblx0XHRcdHRoaXMuYmFja0J1ZmZlci5jYW52YXMud2lkdGggPSB0aGlzLmZyb250QnVmZmVyLmNhbnZhcy53aWR0aDtcblx0XHRcdHRoaXMuYmFja0J1ZmZlci5jYW52YXMuaGVpZ2h0ID0gdGhpcy5mcm9udEJ1ZmZlci5jYW52YXMuaGVpZ2h0O1xuXHRcdFx0dGhpcy5iYWNrQnVmZmVySGFsZldpZHRoID0gdGhpcy5iYWNrQnVmZmVyLmNhbnZhcy53aWR0aCAvIDI7XG5cdFx0XHR0aGlzLmJhY2tCdWZmZXJIYWxmSGVpZ2h0ID0gdGhpcy5iYWNrQnVmZmVyLmNhbnZhcy5oZWlnaHQgLyAyO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIE0uY29sbGlzaW9ucy5QaXhlbFBlcmZlY3QgKSB7XG5cdFx0XHRNLmNvbGxpc2lvbnMuUGl4ZWxQZXJmZWN0LnRlc3RDb250ZXh0LmNhbnZhcy53aWR0aCA9IHRoaXMuYmFja0J1ZmZlci5jYW52YXMud2lkdGg7XG5cdFx0XHRNLmNvbGxpc2lvbnMuUGl4ZWxQZXJmZWN0LnRlc3RDb250ZXh0LmNhbnZhcy5oZWlnaHQgPSB0aGlzLmJhY2tCdWZmZXIuY2FudmFzLmhlaWdodDtcblx0XHR9XG5cblx0XHRpZiAoIE0ub2ZmU2NyZWVuQ2FudmFzICkge1xuXHRcdFx0TS5vZmZTY3JlZW5DYW52YXMud2lkdGggPSB0aGlzLmZyb250QnVmZmVyLmNhbnZhcy53aWR0aDtcblx0XHRcdE0ub2ZmU2NyZWVuQ2FudmFzLmhlaWdodCA9IHRoaXMuZnJvbnRCdWZmZXIuY2FudmFzLmhlaWdodDtcblx0XHR9XG5cblx0XHR0aGlzLnVwZGF0ZVZpZXdwb3J0KCk7XG5cblx0fTtcblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGNhbWVyYSB2aWV3cG9ydCB0byBtYXRjaCB0aGUgc2l6ZSBvZiB0aGUgZ2FtZSBjYW52YXNcblx0ICogQG1ldGhvZCB1cGRhdGVWaWV3cG9ydFxuXHQgKi9cblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUudXBkYXRlVmlld3BvcnQgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNhbWVyYS5zZXRWaWV3cG9ydCggdGhpcy5mcm9udEJ1ZmZlci5jYW52YXMud2lkdGgsIHRoaXMuZnJvbnRCdWZmZXIuY2FudmFzLmhlaWdodCApO1xuXHR9O1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5nZXRWaWV3cG9ydFNpemUgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4geyB3aWR0aDogdGhpcy5jYW1lcmEudmlld3BvcnRXaWR0aCwgaGVpZ2h0OiB0aGlzLmNhbWVyYS52aWV3cG9ydEhlaWdodCB9O1xuXHR9O1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJSZWN0YW5nbGUgPSBmdW5jdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQsIGNhbWVyYVgsIGNhbWVyYVkpIHtcblxuXHRcdHRoaXMuX2FwcGx5T3BlcmF0aW9uKHJlbmRlcml6YWJsZSwgY29udGV4dCk7XG5cdFx0dGhpcy5fYXBwbHlBbHBoYShyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXG5cdFx0aWYgKCByZW5kZXJpemFibGUuX3JvdGF0aW9uIHx8IHJlbmRlcml6YWJsZS5fc2NhbGUgKSB7XG5cdFx0XG5cdFx0XHRjb250ZXh0LnNhdmUoKTtcblxuXHRcdFx0dGhpcy5fYXBwbHlUcmFuc2xhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQsIGNhbWVyYVgsIGNhbWVyYVkpO1xuXHRcdFx0dGhpcy5fYXBwbHlSb3RhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXHRcdFx0dGhpcy5fYXBwbHlTY2FsZShyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXHRcdFx0XG5cdFx0XHRpZiAoIHJlbmRlcml6YWJsZS5fZmlsbFN0eWxlICkge1xuXHRcdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IHJlbmRlcml6YWJsZS5fZmlsbFN0eWxlO1xuXHRcdFx0IGNvbnRleHQuZmlsbFJlY3QoIC1yZW5kZXJpemFibGUuX2hhbGZXaWR0aCwgLXJlbmRlcml6YWJsZS5faGFsZkhlaWdodCwgcmVuZGVyaXphYmxlLl93aWR0aCwgcmVuZGVyaXphYmxlLl9oZWlnaHQgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCByZW5kZXJpemFibGUuX3N0cm9rZVN0eWxlICkge1xuXG5cdFx0XHRcdGlmICggcmVuZGVyaXphYmxlLl9saW5lV2lkdGggKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5saW5lV2lkdGggPSByZW5kZXJpemFibGUuX2xpbmVXaWR0aDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnRleHQuc3Ryb2tlU3R5bGUgPSByZW5kZXJpemFibGUuX3N0cm9rZVN0eWxlO1xuXHRcdFx0XHRjb250ZXh0LnN0cm9rZVJlY3QoIC1yZW5kZXJpemFibGUuX2hhbGZXaWR0aCwgLXJlbmRlcml6YWJsZS5faGFsZkhlaWdodCwgcmVuZGVyaXphYmxlLl93aWR0aCwgcmVuZGVyaXphYmxlLl9oZWlnaHQgKTtcblx0XHRcdH1cblxuXHRcdFx0Y29udGV4dC5yZXN0b3JlKCk7XG5cdFx0XG5cdFx0fSBlbHNlIHtcblx0XHRcblx0XHRcdGlmICggcmVuZGVyaXphYmxlLl9maWxsU3R5bGUgKSB7XG5cdFx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gcmVuZGVyaXphYmxlLl9maWxsU3R5bGU7XG4gICAgICAgIC8vIGNvbnRleHQuZmlsbFJlY3QoIHJlbmRlcml6YWJsZS5feCAtIHJlbmRlcml6YWJsZS5faGFsZldpZHRoIC0gY2FtZXJhWCwgcmVuZGVyaXphYmxlLl95IC0gcmVuZGVyaXphYmxlLl9oYWxmSGVpZ2h0IC0gY2FtZXJhWSwgcmVuZGVyaXphYmxlLl93aWR0aCwgcmVuZGVyaXphYmxlLl9oZWlnaHQgKTtcbiAgICAgICAgY29udGV4dC5maWxsUmVjdCggTS5mYXN0Um91bmQocmVuZGVyaXphYmxlLl94IC0gcmVuZGVyaXphYmxlLl9oYWxmV2lkdGggLSBjYW1lcmFYKSwgTS5mYXN0Um91bmQocmVuZGVyaXphYmxlLl95IC0gcmVuZGVyaXphYmxlLl9oYWxmSGVpZ2h0IC0gY2FtZXJhWSksIHJlbmRlcml6YWJsZS5fd2lkdGgsIHJlbmRlcml6YWJsZS5faGVpZ2h0ICk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmICggcmVuZGVyaXphYmxlLl9zdHJva2VTdHlsZSApIHtcblxuXHRcdFx0XHRpZiAoIHJlbmRlcml6YWJsZS5fbGluZVdpZHRoICkge1xuXHRcdFx0XHRcdGNvbnRleHQubGluZVdpZHRoID0gcmVuZGVyaXphYmxlLl9saW5lV2lkdGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb250ZXh0LnN0cm9rZVN0eWxlID0gcmVuZGVyaXphYmxlLl9zdHJva2VTdHlsZTtcblx0XHRcdFx0Y29udGV4dC5zdHJva2VSZWN0KCByZW5kZXJpemFibGUuX3ggLSByZW5kZXJpemFibGUuX2hhbGZXaWR0aCAtIGNhbWVyYVgsIHJlbmRlcml6YWJsZS5feSAtIHJlbmRlcml6YWJsZS5faGFsZkhlaWdodCAtIGNhbWVyYVksIHJlbmRlcml6YWJsZS5fd2lkdGgsIHJlbmRlcml6YWJsZS5faGVpZ2h0ICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHRoaXMuX2FwcGx5U2hhZG93KHJlbmRlcml6YWJsZSwgY29udGV4dCk7XG5cdFx0XG5cdH07XG5cdC8qKlxuXHQgKiBSZW5kZXJzIHRoZSBjdXJyZW50IHRleHQgaW4gdGhlIHByb3ZpZGVkIGNvbnRleHRcblx0ICpcblx0ICogQG1ldGhvZCBvblJlbmRlclxuXHQgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dFxuXHQgKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXNcblx0ICogQHBhcmFtIHtpbnR9IGNhbWVyYVhcblx0ICogQHBhcmFtIHtpbnR9IGNhbWVyYVlcblx0ICovXG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLnJlbmRlclRleHQgPSBmdW5jdGlvbiggcmVuZGVyaXphYmxlLCBjb250ZXh0LCBjYW1lcmFYLCBjYW1lcmFZICkge1xuXG5cdFx0dGhpcy5fYXBwbHlPcGVyYXRpb24ocmVuZGVyaXphYmxlLCBjb250ZXh0KTtcblx0XHR0aGlzLl9hcHBseUFscGhhKHJlbmRlcml6YWJsZSwgY29udGV4dCk7XG5cblx0XHQvL1RPRE86IGNhY2hpbmcgb3BvcnR1bml0eVxuXHRcdGNvbnRleHQuZm9udCA9IHJlbmRlcml6YWJsZS5fc3R5bGUgKyByZW5kZXJpemFibGUuX3ZhcmlhbnQgKyByZW5kZXJpemFibGUuX3dlaWdodCArIHJlbmRlcml6YWJsZS5fc2l6ZSArIHJlbmRlcml6YWJsZS5fZmFtaWx5O1xuXG5cdFx0Y29udGV4dC50ZXh0QWxpZ24gPSByZW5kZXJpemFibGUuX3RleHRBbGlnbjtcblxuXHRcdGNvbnRleHQudGV4dEJhc2VsaW5lID0gcmVuZGVyaXphYmxlLl90ZXh0QmFzZWxpbmU7XG5cdFx0XG5cdFx0dGhpcy5fYXBwbHlTaGFkb3cocmVuZGVyaXphYmxlLCBjb250ZXh0KTtcblxuXHRcdGlmICggcmVuZGVyaXphYmxlLl9oYWxmV2lkdGggPT0gMCApIHtcblx0XHRcdHJlbmRlcml6YWJsZS5nZXRXaWR0aCgpO1xuXHRcdH1cblx0XHRpZiAoIHJlbmRlcml6YWJsZS5faGFsZkhlaWdodCA9PSAwICkge1xuXHRcdFx0cmVuZGVyaXphYmxlLmdldEhlaWdodCgpO1xuXHRcdH1cblxuXHRcdGlmICggcmVuZGVyaXphYmxlLl9yb3RhdGlvbiB8fCByZW5kZXJpemFibGUuX3NjYWxlICkge1xuXG5cdFx0XHRjb250ZXh0LnNhdmUoKTtcblxuXHRcdFx0dGhpcy5fYXBwbHlUcmFuc2xhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQsIGNhbWVyYVgsIGNhbWVyYVkpO1xuXHRcdFx0dGhpcy5fYXBwbHlSb3RhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXHRcdFx0dGhpcy5fYXBwbHlTY2FsZShyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXG5cdFx0XHR0aGlzLmZpbGxUZXh0KHJlbmRlcml6YWJsZSwgY29udGV4dCwgLXJlbmRlcml6YWJsZS5faGFsZldpZHRoLCAtcmVuZGVyaXphYmxlLl9oYWxmSGVpZ2h0KTtcblxuXHRcdFx0Y29udGV4dC5yZXN0b3JlKCk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR0aGlzLmZpbGxUZXh0KHJlbmRlcml6YWJsZSwgY29udGV4dCwgcmVuZGVyaXphYmxlLl94IC0gcmVuZGVyaXphYmxlLl9oYWxmV2lkdGgsIHJlbmRlcml6YWJsZS5feSAtIHJlbmRlcml6YWJsZS5faGFsZkhlaWdodCk7XG5cblx0XHR9XG5cblx0fTtcblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUuZmlsbFRleHQgPSBmdW5jdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQsIHggLCB5KSB7XG5cblx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IHJlbmRlcml6YWJsZS5fZmlsbFN0eWxlO1xuXHRcdFxuXHRcdGlmICggcmVuZGVyaXphYmxlLm11bHRpTGluZSApIHtcblx0XHRcdGZvciAoIHZhciBpID0gMDsgaSA8IHJlbmRlcml6YWJsZS5tdWx0aUxpbmUubGVuZ3RoOyBpKysgKSB7XG5cdFx0XHRcdGNvbnRleHQuZmlsbFRleHQoIHJlbmRlcml6YWJsZS5tdWx0aUxpbmVbaV0sIHgsIHkgKyBpICogcmVuZGVyaXphYmxlLmdldEhlaWdodCgpICk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnRleHQuZmlsbFRleHQoIHJlbmRlcml6YWJsZS5fdGV4dCwgeCwgeSApO1xuXHRcdH1cblxuXHRcdGlmICggcmVuZGVyaXphYmxlLl9zdHJva2VTdHlsZSApIHtcblx0XHRcdGNvbnRleHQuc3Ryb2tlU3R5bGUgPSByZW5kZXJpemFibGUuX3N0cm9rZVN0eWxlO1xuXHRcdFx0Y29udGV4dC5saW5lV2lkdGggPSByZW5kZXJpemFibGUuX2xpbmVXaWR0aCB8fCAxO1xuXHRcdFx0Y29udGV4dC5zdHJva2VUZXh0KHJlbmRlcml6YWJsZS5fdGV4dCwgeCwgeSApO1xuXHRcdH1cblxuXHR9O1xuXHQvKipcblx0ICogUmVuZGVycyB0aGUgY3VycmVudCBzcHJpdGUgaW4gdGhlIHByb3ZpZGVkIGNvbnRleHRcblx0ICpcblx0ICogQG1ldGhvZCBvblJlbmRlclxuXHQgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dFxuXHQgKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXNcblx0ICogQHBhcmFtIHtpbnR9IGNhbWVyYVhcblx0ICogQHBhcmFtIHtpbnR9IGNhbWVyYVlcblx0ICovXG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLnJlbmRlckNpcmNsZSA9IGZ1bmN0aW9uKCByZW5kZXJpemFibGUsIGNvbnRleHQsIGNhbWVyYVgsIGNhbWVyYVkgKSB7XG5cblx0XHR0aGlzLl9hcHBseU9wZXJhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXHRcdHRoaXMuX2FwcGx5QWxwaGEocmVuZGVyaXphYmxlLCBjb250ZXh0KTtcblxuXHRcdGlmICggcmVuZGVyaXphYmxlLl9zY2FsZSApIHtcblxuXHRcdFx0Y29udGV4dC5zYXZlKCk7XG5cblx0XHRcdHRoaXMuX2FwcGx5VHJhbnNsYXRpb24ocmVuZGVyaXphYmxlLCBjb250ZXh0LCBjYW1lcmFYLCBjYW1lcmFZKTtcblx0XHRcdHRoaXMuX2FwcGx5U2NhbGUocmVuZGVyaXphYmxlLCBjb250ZXh0KTtcblxuXHRcdFx0Y29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRcdGNvbnRleHQuYXJjKCAwLCAwLCByZW5kZXJpemFibGUuX3JhZGl1cywgcmVuZGVyaXphYmxlLl9zdGFydEFuZ2xlLCByZW5kZXJpemFibGUuX2VuZEFuZ2xlLCBmYWxzZSk7XG5cdFx0XHRjb250ZXh0LmNsb3NlUGF0aCgpO1xuXG5cdFx0XHRpZiAoIHJlbmRlcml6YWJsZS5fZmlsbFN0eWxlICkge1xuXHRcdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IHJlbmRlcml6YWJsZS5fZmlsbFN0eWxlO1xuXHRcdFx0XHRjb250ZXh0LmZpbGwoKTtcblx0XHRcdH1cblxuXHRcdFx0Y29udGV4dC5yZXN0b3JlKCk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y29udGV4dC5hcmMoIHJlbmRlcml6YWJsZS5feCAtIGNhbWVyYVgsIHJlbmRlcml6YWJsZS5feSAtIGNhbWVyYVksIHJlbmRlcml6YWJsZS5fcmFkaXVzLCByZW5kZXJpemFibGUuX3N0YXJ0QW5nbGUsIHJlbmRlcml6YWJsZS5fZW5kQW5nbGUsIGZhbHNlKTtcblx0XHRcdGNvbnRleHQuY2xvc2VQYXRoKCk7XG5cblx0XHRcdGlmICggcmVuZGVyaXphYmxlLl9maWxsU3R5bGUgKSB7XG5cdFx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gcmVuZGVyaXphYmxlLl9maWxsU3R5bGU7XG5cdFx0XHRcdGNvbnRleHQuZmlsbCgpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0dGhpcy5fYXBwbHlTaGFkb3cocmVuZGVyaXphYmxlLCBjb250ZXh0KTtcblxuXHRcdGlmICggcmVuZGVyaXphYmxlLl9zdHJva2VTdHlsZSApIHtcblxuXHRcdFx0aWYgKCByZW5kZXJpemFibGUuX2xpbmVXaWR0aCApIHtcblx0XHRcdFx0Y29udGV4dC5saW5lV2lkdGggPSByZW5kZXJpemFibGUuX2xpbmVXaWR0aDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Y29udGV4dC5zdHJva2VTdHlsZSA9IHJlbmRlcml6YWJsZS5fc3Ryb2tlU3R5bGU7XG5cdFx0XHQvLyBjb250ZXh0LnN0cm9rZSggLXJlbmRlcml6YWJsZS5faGFsZldpZHRoLCAtcmVuZGVyaXphYmxlLl9oYWxmSGVpZ2h0LCByZW5kZXJpemFibGUuX3dpZHRoLCByZW5kZXJpemFibGUuX2hlaWdodCApO1xuXHRcdFx0Y29udGV4dC5zdHJva2UoKTtcblx0XHRcdFxuXHRcdH1cblxuXHR9O1xuXHQvKipcblx0ICogUmVuZGVycyB0aGUgY3VycmVudCBzcHJpdGUgaW4gdGhlIHByb3ZpZGVkIGNvbnRleHRcblx0ICpcblx0ICogQG1ldGhvZCByZW5kZXJTcHJpdGVcblx0ICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGNvbnRleHRcblx0ICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzXG5cdCAqIEBwYXJhbSB7aW50fSBjYW1lcmFYXG5cdCAqIEBwYXJhbSB7aW50fSBjYW1lcmFZXG5cdCAqL1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJTcHJpdGUgPSBmdW5jdGlvbiggcmVuZGVyaXphYmxlLCBjb250ZXh0LCBjYW1lcmFYLCBjYW1lcmFZICkge1xuXG5cdFx0aWYgKCAhIHJlbmRlcml6YWJsZS5faW1hZ2UgKSByZXR1cm47XG5cdFx0XG5cdFx0cmVuZGVyaXphYmxlLl9hbmltYXRlKCk7XG5cblx0XHR0aGlzLl9hcHBseU9wZXJhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXHRcdHRoaXMuX2FwcGx5QWxwaGEocmVuZGVyaXphYmxlLCBjb250ZXh0KTtcblxuXHRcdHZhciBmWCA9IHJlbmRlcml6YWJsZS5jdXJyZW50RnJhbWUueCxcblx0XHRcdGZZID0gcmVuZGVyaXphYmxlLmN1cnJlbnRGcmFtZS55O1xuXG5cdFx0aWYgKCByZW5kZXJpemFibGUuX3JvdGF0aW9uIHx8IHJlbmRlcml6YWJsZS5fc2NhbGUgKSB7XG5cdFx0XG5cdFx0XHRjb250ZXh0LnNhdmUoKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5fYXBwbHlUcmFuc2xhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQsIGNhbWVyYVgsIGNhbWVyYVkpO1xuXHRcdFx0dGhpcy5fYXBwbHlSb3RhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXHRcdFx0dGhpcy5fYXBwbHlTY2FsZShyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXG5cdFx0XHRjb250ZXh0LmRyYXdJbWFnZSggcmVuZGVyaXphYmxlLl9pbWFnZSwgZlgsIGZZLCByZW5kZXJpemFibGUuX3dpZHRoLCByZW5kZXJpemFibGUuX2hlaWdodCwgLXJlbmRlcml6YWJsZS5faGFsZldpZHRoLCAtcmVuZGVyaXphYmxlLl9oYWxmSGVpZ2h0LCByZW5kZXJpemFibGUuX3dpZHRoLCByZW5kZXJpemFibGUuX2hlaWdodCApO1xuXG5cdFx0XHRjb250ZXh0LnJlc3RvcmUoKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGNvbnRleHQuZHJhd0ltYWdlKCByZW5kZXJpemFibGUuX2ltYWdlLCBmWCwgZlksIHJlbmRlcml6YWJsZS5fd2lkdGgsIHJlbmRlcml6YWJsZS5faGVpZ2h0LCByZW5kZXJpemFibGUuX3ggLSByZW5kZXJpemFibGUuX2hhbGZXaWR0aCAtIGNhbWVyYVgsIHJlbmRlcml6YWJsZS5feSAtIHJlbmRlcml6YWJsZS5faGFsZkhlaWdodCAtIGNhbWVyYVksIHJlbmRlcml6YWJsZS5fd2lkdGgsIHJlbmRlcml6YWJsZS5faGVpZ2h0ICk7XG5cblx0XHR9XG5cblx0fTtcblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyQml0bWFwVGV4dCA9IGZ1bmN0aW9uKCByZW5kZXJpemFibGUsIGNvbnRleHQsIGNhbWVyYVgsIGNhbWVyYVkgKSB7XG5cdFxuXHRcdGlmICggISByZW5kZXJpemFibGUuX3Nwcml0ZSApIHJldHVybjtcblx0XHRcblx0XHR0aGlzLl9hcHBseU9wZXJhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXHRcdHRoaXMuX2FwcGx5QWxwaGEocmVuZGVyaXphYmxlLCBjb250ZXh0KTtcblx0XHRcblx0XHR2YXIgdGV4dCA9IHJlbmRlcml6YWJsZS5fdGV4dCxcblx0XHRcdGxlbmd0aCA9IHRleHQubGVuZ3RoLFxuXHRcdFx0c3RhcnQgPSAwLFxuXHRcdFx0ZnJhbWVzID0gcmVuZGVyaXphYmxlLl9zcHJpdGUuZnJhbWVzLFxuXHRcdFx0eCxcblx0XHRcdHk7XG5cdFx0XG5cdFx0aWYgKCByZW5kZXJpemFibGUuX3JvdGF0aW9uIHx8IHJlbmRlcml6YWJsZS5fc2NhbGUgKSB7XG5cdFx0XG5cdFx0XHRjb250ZXh0LnNhdmUoKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5fYXBwbHlUcmFuc2xhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQsIGNhbWVyYVgsIGNhbWVyYVkpO1xuXHRcdFx0dGhpcy5fYXBwbHlSb3RhdGlvbihyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXHRcdFx0dGhpcy5fYXBwbHlTY2FsZShyZW5kZXJpemFibGUsIGNvbnRleHQpO1xuXG5cdFx0XHR4ID0gLXJlbmRlcml6YWJsZS5faGFsZldpZHRoO1xuXHRcdFx0eSA9IC1yZW5kZXJpemFibGUuX2hhbGZIZWlnaHQ7XG5cdFx0XHRcblx0XHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrICkge1xuXHRcdFx0XG5cdFx0XHRcdHZhciBjdXJyZW50RnJhbWUgPSBmcmFtZXNbdGV4dFtpXV07XG5cdFx0XHRcdFxuXHRcdFx0XHRjb250ZXh0LmRyYXdJbWFnZSggcmVuZGVyaXphYmxlLl9zcHJpdGUsIGN1cnJlbnRGcmFtZS54LCBjdXJyZW50RnJhbWUueSwgY3VycmVudEZyYW1lLndpZHRoLCBjdXJyZW50RnJhbWUuaGVpZ2h0LCB4ICsgc3RhcnQsIHksIGN1cnJlbnRGcmFtZS53aWR0aCwgY3VycmVudEZyYW1lLmhlaWdodCApO1xuXHRcdFx0XHRcblx0XHRcdFx0c3RhcnQgPSBzdGFydCArIGN1cnJlbnRGcmFtZS53aWR0aDtcblx0XHRcdFx0XG5cdFx0XHR9XG5cblx0XHRcdGNvbnRleHQucmVzdG9yZSgpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0eCA9IHJlbmRlcml6YWJsZS5feCAtIGNhbWVyYVggLSByZW5kZXJpemFibGUuX2hhbGZXaWR0aDtcblx0XHRcdHkgPSByZW5kZXJpemFibGUuX3kgLSBjYW1lcmFZIC0gcmVuZGVyaXphYmxlLl9oYWxmSGVpZ2h0O1xuXG5cdFx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcblx0XHRcdFxuXHRcdFx0XHR2YXIgY3VycmVudEZyYW1lID0gZnJhbWVzW3RleHRbaV1dO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29udGV4dC5kcmF3SW1hZ2UoIHJlbmRlcml6YWJsZS5fc3ByaXRlLCBjdXJyZW50RnJhbWUueCwgY3VycmVudEZyYW1lLnksIGN1cnJlbnRGcmFtZS53aWR0aCwgY3VycmVudEZyYW1lLmhlaWdodCwgeCArIHN0YXJ0LCB5LCBjdXJyZW50RnJhbWUud2lkdGgsIGN1cnJlbnRGcmFtZS5oZWlnaHQgKTtcblxuXHRcdFx0XHRzdGFydCA9IHN0YXJ0ICsgY3VycmVudEZyYW1lLndpZHRoO1xuXHRcdFx0XHRcblx0XHRcdH1cblx0XHRcblxuXHRcdH1cblx0XHRcblx0fTtcblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyTGF5ZXIgPSBmdW5jdGlvbiAobGF5ZXIsIGNhbWVyYVgsIGNhbWVyYVksIHZpZXdwb3J0V2lkdGgsIHZpZXdwb3J0SGVpZ2h0KSB7XG5cblx0XHRpZiAoICFsYXllci5fdmlzaWJsZSApIHJldHVybjtcblxuICAgIC8vVE9ETzogV2hlbiBhZGRpbmcgb3IgcmVtb3Zpbmcgdmlld3MsIGl0IGRvZXNudCB1cGRhdGUgXG5cdFx0Ly8gaWYgKCB0aGlzLl9yZVJlbmRlckFsbExheWVycyB8fCBsYXllci5uZWVkc1JlZHJhdyApIHtcblxuXHRcdFx0dmFyIGN1cnJlbnQsXG4gICAgICAgICAgY3VycmVudFZpZXcsXG4gICAgICAgICAgY3VycmVudFZpZXdzLFxuICAgICAgICAgIGNhbnZhcyA9IHRoaXMuYmFja0J1ZmZlci5jYW52YXM7XG5cblx0XHRcdGlmICggbGF5ZXIuYmFja2dyb3VuZCApIHtcbiAgICAgICAgLy9UT0RPOiBOb3QgY2xlYXJpbmcgdGhlIGJ1ZmZlciB3aWxsIGVuZCB1cCBpbiBkaXNwbGF5aW5nIGJsdXJyZWQgaW1hZ2VzIGlmIGJhY2tncm91bmQgaGFzIG9wYWNpdHkgXG5cdFx0XHRcdGlmICggbGF5ZXIuYmFja2dyb3VuZC5zcmMgKSB7XG5cdFx0XHRcdFx0dGhpcy5iYWNrQnVmZmVyLmRyYXdJbWFnZShsYXllci5iYWNrZ3JvdW5kLCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKE0uc3ByaXRlcy5nZXQobGF5ZXIuYmFja2dyb3VuZCkpIHtcblx0XHRcdFx0XHR0aGlzLmJhY2tCdWZmZXIuZHJhd0ltYWdlKE0uc3ByaXRlcy5nZXQobGF5ZXIuYmFja2dyb3VuZCksIDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgIH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5iYWNrQnVmZmVyLmZpbGxTdHlsZSA9IGxheWVyLmJhY2tncm91bmQ7XG5cdFx0XHRcdFx0dGhpcy5iYWNrQnVmZmVyLmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuYmFja0J1ZmZlci5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdH1cblxuXHRcdFx0Zm9yICggdmFyIGkgPSAwLCBsID0gbGF5ZXIub25SZW5kZXJMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcblxuXHRcdFx0XHRjdXJyZW50ID0gbGF5ZXIub25SZW5kZXJMaXN0W2ldO1xuXHRcdFx0XHRjdXJyZW50Vmlld3MgPSBjdXJyZW50LnZpZXdzLl92YWx1ZXM7XG5cblx0XHRcdFx0Zm9yICggdmFyIGogPSAwLCBqbCA9IGN1cnJlbnRWaWV3cy5sZW5ndGg7IGogPCBqbDsgaisrICkge1xuXHRcdFx0XG5cdFx0XHRcdFx0Y3VycmVudFZpZXcgPSBjdXJyZW50Vmlld3Nbal07XG5cblx0XHRcdFx0XHR2YXIgcEZYID0gbGF5ZXIucGFycmFsbGF4RmFjdG9yLngsXG5cdFx0XHRcdFx0XHQgIHBGWSA9IGxheWVyLnBhcnJhbGxheEZhY3Rvci55O1xuXHRcdFx0XG5cdFx0XHRcdFx0aWYgKCB0aGlzLmNhbWVyYS5jYW5TZWUoY3VycmVudFZpZXcsIHBGWCwgcEZZKSApIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdHRoaXMucmVuZGVyKGN1cnJlbnRWaWV3LCB0aGlzLmJhY2tCdWZmZXIsIGNhbWVyYVggKiBwRlgsIGNhbWVyYVkgKiBwRlkpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHQvL1RPRE86IFJldmlldyBwb3N0IHByb2Nlc3Npbmdcblx0XHRcdGlmICggbGF5ZXIucG9zdFByb2Nlc3NpbmcgKSB7XG5cdFx0XHRcdGxheWVyLnBvc3RQcm9jZXNzaW5nKHRoaXMuYmFja0J1ZmZlciwgdGhpcy5mcm9udEJ1ZmZlciwgY2FtZXJhWCwgY2FtZXJhWSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGxheWVyLm5lZWRzUmVkcmF3ID0gZmFsc2U7XG5cblx0XHRcdC8vIGlmICggbGF5ZXIuX2FscGhhICE9IHVuZGVmaW5lZCApIHtcblx0XHRcdC8vIFx0dGhpcy5mcm9udEJ1ZmZlci5nbG9iYWxBbHBoYSA9IGxheWVyLl9hbHBoYTtcblx0XHRcdC8vIH1cblxuXHRcdFx0dGhpcy5fYXBwbHlPcGVyYXRpb24obGF5ZXIsIHRoaXMuZnJvbnRCdWZmZXIpO1xuXHRcdFx0dGhpcy5fYXBwbHlBbHBoYShsYXllciwgdGhpcy5mcm9udEJ1ZmZlcik7XG4gICAgICBcbiAgICAgIC8vVE9ETzogUmV2aWV3IHRyYW5zbGF0aW9uLCByb3RhdGlvbiBhbmQgc2NhbGUuIFRoaXMgc2hvdWxkIHdvcmtcblx0XHRcdC8vIHRoaXMuX2FwcGx5VHJhbnNsYXRpb24obGF5ZXIsIHRoaXMuZnJvbnRCdWZmZXIsIDAsIDApO1xuXHRcdFx0Ly8gdGhpcy5fYXBwbHlSb3RhdGlvbihsYXllciwgdGhpcy5mcm9udEJ1ZmZlcik7XG5cdFx0XHQvLyB0aGlzLl9hcHBseVNjYWxlKGxheWVyLCB0aGlzLmZyb250QnVmZmVyKTtcblxuXHRcdFx0Ly8gaWYgKCBsYXllci5feCAhPSB1bmRlZmluZWQgJiYgbGF5ZXIuX3kgIT0gdW5kZWZpbmVkICkge1xuXHRcdFx0Ly8gXHR0aGlzLmZyb250QnVmZmVyLnJvdGF0ZShsYXllci5fcm90YXRpb24pO1xuXHRcdFx0Ly8gfVxuXHRcdFx0Ly8gaWYgKCBsYXllci5fcm90YXRpb24gIT0gdW5kZWZpbmVkICkge1xuXHRcdFx0Ly8gXHR0aGlzLmZyb250QnVmZmVyLnJvdGF0ZShsYXllci5fcm90YXRpb24pO1xuXHRcdFx0Ly8gfVxuICAgICAgXG4gICAgICBcbiAgICAgIC8vVE9ETzogVGVzdGluZyB6b29tLCByZW1vdmUgYWZ0ZXIgdGVzdGluZ1xuICAgICAgLy8gaWYgKHRoaXMuem9vbSkge1xuICAgICAgLy8gICB0aGlzLmZyb250QnVmZmVyLmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIsIC10aGlzLnpvb20sIC10aGlzLnpvb20sICkgICAgICAgIFxuICAgICAgLy8gfSBlbHNlIHtcblx0XHRcdCB0aGlzLmZyb250QnVmZmVyLmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIuY2FudmFzLCAwLCAwKTtcbiAgICAgICBcbiAgICAgICB2YXIgY3VycmVudEJ1ZmZlciA9IHRoaXMuX2dldEJ1ZmZlcihsYXllci5uYW1lKTtcbiAgICAgICBcbiAgICAgICBpZiAoIWN1cnJlbnRCdWZmZXIpIHtcbiAgICAgICAgIGN1cnJlbnRCdWZmZXIgPSB0aGlzLl9jcmVhdGVCdWZmZXIobGF5ZXIubmFtZSk7XG4gICAgICAgICBjdXJyZW50QnVmZmVyLmNhbnZhcy53aWR0aCA9IHRoaXMuZnJvbnRCdWZmZXIuY2FudmFzLndpZHRoO1xuICAgICAgICAgY3VycmVudEJ1ZmZlci5jYW52YXMuaGVpZ2h0ID0gdGhpcy5mcm9udEJ1ZmZlci5jYW52YXMuaGVpZ2h0O1xuICAgICAgIH1cbiAgICAgICBcbiAgICAgICBjdXJyZW50QnVmZmVyLmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIuY2FudmFzLCAwLCAwKTtcbiAgICAgICBcbiAgICAgIC8vIH1cblxuXG5cdFx0XHQvLyBpZiAoIGxheWVyLl9yb3RhdGlvbiAhPSB1bmRlZmluZWQgKSB7XG5cdFx0XHQvLyBcdHRoaXMuZnJvbnRCdWZmZXIucm90YXRlKDApO1xuXHRcdFx0Ly8gfVxuXG5cdFx0XHQvLyB0aGlzLmZyb250QnVmZmVyLmdsb2JhbEFscGhhID0gMTtcblx0XHRcdFxuXHRcdC8vIH0gZWxzZSB7XG5cdFx0XG4gICAgICAvL1RPRE86IFdpdGggZXZlcnkgbmV3IGdhbWUgbGF5ZXIsIHdlIHNob3VsZCBzdG9yZSBhIG5ldyBidWZmZXIgaW4gdGhpcyByZW5kZXJlci4gVGhpcyBmYWlscyBiZWNhdXNlIHRoZSBsYXllciBubyBsb25nZXIgaGFzIGEgYnVmZmVyXG5cdFx0XHQvLyB0aGlzLmZyb250QnVmZmVyLmRyYXdJbWFnZShsYXllci5fYnVmZmVyLmNhbnZhcywgMCwgMCk7XG5cdFx0Ly8gXHR0aGlzLmZyb250QnVmZmVyLmRyYXdJbWFnZSh0aGlzLl9nZXRCdWZmZXIobGF5ZXIubmFtZSkuY2FudmFzLCAwLCAwKTtcblx0XHRcdFxuXHRcdC8vIH1cblxuXHRcdC8vIGlmICggdGhpcy5uZWVkc1NvcnRpbmcgKSB7XG5cdFx0Ly8gXHR0aGlzLnNvcnQoKTtcblx0XHQvLyBcdHRoaXMubmVlZHNTb3J0aW5nID0gZmFsc2U7XG5cdFx0Ly8gfVxuXG5cdH07XG4gIFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLl9jcmVhdGVCdWZmZXIgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGJ1ZmZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIikuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIHRoaXMuX2J1ZmZlcnNbbmFtZV0gPSBidWZmZXI7XG4gICAgcmV0dXJuIGJ1ZmZlcjsgICAgXG4gIH07XG4gIFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLl9nZXRCdWZmZXIgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX2J1ZmZlcnNbbmFtZV07XG4gIH07XG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLnJlbmRlckxheWVycyA9IGZ1bmN0aW9uKGxheWVycykge1xuXHRcdHRoaXMuZnJvbnRCdWZmZXIuY2xlYXJSZWN0KDAsIDAsIHRoaXMuYmFja0J1ZmZlci5jYW52YXMud2lkdGgsIHRoaXMuYmFja0J1ZmZlci5jYW52YXMuaGVpZ2h0KTtcblx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSBsYXllcnMuX3ZhbHVlcy5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHR0aGlzLnJlbmRlckxheWVyKGxheWVycy5fdmFsdWVzW2ldLCB0aGlzLmNhbWVyYS5feCwgdGhpcy5jYW1lcmEuX3ksIHRoaXMuY2FtZXJhLnZpZXdwb3J0V2lkdGgsIHRoaXMuY2FtZXJhLnZpZXdwb3J0SGVpZ2h0KTtcblx0XHR9XHRcdFxuXHRcdHRoaXMuX3JlUmVuZGVyQWxsTGF5ZXJzID0gZmFsc2U7XG5cdH07XG4gIFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLnJlZHJhd0FsbExheWVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3JlUmVuZGVyQWxsTGF5ZXJzID0gdHJ1ZTtcbiAgfTtcblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24ob2JqZWN0LCBjb250ZXh0LCBjYW1lcmFYLCBjYW1lcmFZKSB7XG5cblx0XHR2YXIgdHlwZXMgPSBNLnJlbmRlcml6YWJsZXMuVFlQRVM7XG5cblx0XHRzd2l0Y2ggKCBvYmplY3QuVFlQRSApIHtcblx0XHRcdGNhc2UgdHlwZXMuU1BSSVRFOlxuXHRcdFx0XHR0aGlzLnJlbmRlclNwcml0ZShvYmplY3QsIGNvbnRleHQsIGNhbWVyYVgsIGNhbWVyYVkpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgdHlwZXMuQklUTUFQX1RFWFQ6XG5cdFx0XHRcdHRoaXMucmVuZGVyQml0bWFwVGV4dChvYmplY3QsIGNvbnRleHQsIGNhbWVyYVgsIGNhbWVyYVkpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgdHlwZXMuVEVYVDpcblx0XHRcdFx0dGhpcy5yZW5kZXJUZXh0KG9iamVjdCwgY29udGV4dCwgY2FtZXJhWCwgY2FtZXJhWSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSB0eXBlcy5SRUNUQU5HTEU6XG5cdFx0XHRcdHRoaXMucmVuZGVyUmVjdGFuZ2xlKG9iamVjdCwgY29udGV4dCwgY2FtZXJhWCwgY2FtZXJhWSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSB0eXBlcy5DSVJDTEU6XG5cdFx0XHRcdHRoaXMucmVuZGVyQ2lyY2xlKG9iamVjdCwgY29udGV4dCwgY2FtZXJhWCwgY2FtZXJhWSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJlbmRlciBvYmplY3Qgb2YgdHlwZSBcIiArIG9iamVjdC5UWVBFKTtcblx0XHR9XG5cblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGFudGlhbGlhc2luZyBvZiB0aGUgYnVmZmVyXG5cdCAqXG5cdCAqIEBtZXRob2Qgc2V0QW50aWFsaWFzaW5nXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gdmFsdWVcblx0ICovXG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLnNldEFudGlhbGlhc2luZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5mcm9udEJ1ZmZlci5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSB2YWx1ZTtcblx0XHR0aGlzLmZyb250QnVmZmVyLndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IHZhbHVlO1xuXHRcdHRoaXMuZnJvbnRCdWZmZXIuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gdmFsdWU7XG5cdFx0XG5cdFx0dGhpcy5iYWNrQnVmZmVyLm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IHZhbHVlO1xuXHRcdHRoaXMuYmFja0J1ZmZlci53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSB2YWx1ZTtcblx0XHR0aGlzLmJhY2tCdWZmZXIuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gdmFsdWU7XHRcdFxuXHR9O1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5fZ2V0SW1hZ2VSZW5kZXJpbmdTdHlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzdHlsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWF0Y2gtaW1hZ2UtcXVhbGl0eVwiKTtcblx0XHRpZiAoIHN0eWxlID09IHVuZGVmaW5lZCApIHtcblx0XHRcdHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXHRcdFx0c3R5bGUuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJtYXRjaC1pbWFnZS1xdWFsaXR5XCIpO1xuXHRcdFx0c3R5bGUudHlwZSA9IFwidGV4dC9jc3NcIjtcblx0XHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuXHRcdH1cblx0XHRyZXR1cm4gc3R5bGU7XG5cdH07XG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLnByaW9yaXRpemVRdWFsaXR5ID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRBbnRpYWxpYXNpbmcodHJ1ZSk7XG5cdFx0dGhpcy5fZ2V0SW1hZ2VSZW5kZXJpbmdTdHlsZSgpLmlubmVySFRNTCA9IFwiY2FudmFzIHsgLW1zLWludGVycG9sYXRpb24tbW9kZTogYmljdWJpYzsgaW1hZ2UtcmVuZGVyaW5nOiBvcHRpbWl6ZVF1YWxpdHk7IH1cIjtcblx0fTtcblx0U3RhbmRhcmRFbnRpdHlSZW5kZXJlci5wcm90b3R5cGUucHJpb3JpdGl6ZVNwZWVkID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRBbnRpYWxpYXNpbmcoZmFsc2UpO1xuXHRcdHRoaXMuX2dldEltYWdlUmVuZGVyaW5nU3R5bGUoKS5pbm5lckhUTUwgPSBcImNhbnZhcyB7IC1tcy1pbnRlcnBvbGF0aW9uLW1vZGU6IG5lYXJlc3QtbmVpZ2hib3I7IGltYWdlLXJlbmRlcmluZzogb3B0aW1pemVTcGVlZDsgfVwiO1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgY2VudGVyIG9mIHRoZSBsYXllclxuXHQgKiBAbWV0aG9kIGdldENlbnRlclxuXHQgKiBAcmV0dXJuIHtPYmplY3R9IG9iamVjdCBjb250YWluaW5nIHggYW5kIHlcblx0ICovXG5cdFN0YW5kYXJkRW50aXR5UmVuZGVyZXIucHJvdG90eXBlLmdldFNjZW5lQ2VudGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyBNLm1hdGgyZC5WZWN0b3IyZCggdGhpcy5mcm9udEJ1ZmZlci5jYW52YXMud2lkdGggLyAyLCB0aGlzLmZyb250QnVmZmVyLmNhbnZhcy5oZWlnaHQgLyAyICk7XG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBjb250ZW50cyBvZiB0aGlzIGxheWVyIGFzIGFuIGltYWdlIGluIGJhc2U2NFxuXHQgKiBAbWV0aG9kIGdldEFzQmFzZTY0SW1hZ2Vcblx0ICogQHJldHVybiB7U3RyaW5nfSBhIHN0cmluZyByZXByZXNlbnRpbmcgYW4gaW1hZ2UgaW4gYmFzZTY0XG5cdCAqL1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5nZXRBc0Jhc2U2NEltYWdlID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZnJvbnRCdWZmZXIuY2FudmFzLnRvRGF0YVVSTCgpO1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgY29udGVudHMgb2YgdGhpcyBsYXllciBhcyBhbiBodG1sIGltYWdlXG5cdCAqIEBtZXRob2QgZ2V0QXNJbWFnZVxuXHQgKiBAcmV0dXJuIHtIVE1MSW1hZ2VFbGVtZW50fSBhbiBpbWFnZSBlbGVtZW50IHdpdGggdGhlIHJlc3VsdCBvZiB0aGlzIGxheWVyXG5cdCAqL1xuXHRTdGFuZGFyZEVudGl0eVJlbmRlcmVyLnByb3RvdHlwZS5nZXRBc0ltYWdlID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuXHRcdGltZy5zcmMgPSB0aGlzLmdldEFzQmFzZTY0SW1hZ2UoKTtcblx0XHRyZXR1cm4gaW1nO1xuXHR9O1xuXG5cdE0uZXh0ZW5kKFN0YW5kYXJkRW50aXR5UmVuZGVyZXIsIFJlbmRlcmVyKTtcblxuXHRNLnJlbmRlcmVycy5TdGFuZGFyZEVudGl0eVJlbmRlcmVyID0gU3RhbmRhcmRFbnRpdHlSZW5kZXJlcjtcblxufSkoTS5yZW5kZXJlcnMuUmVuZGVyZXIpOyIsIihmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cdFxuXHRmdW5jdGlvbiBSZW5kZXJpbmdQcm92aWRlcigpIHtcblx0fVxuXG5cdFJlbmRlcmluZ1Byb3ZpZGVyLnByb3RvdHlwZS5pc1dlYkdMU3VwcG9ydGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIFdlYkdMUmVuZGVyaW5nQ29udGV4dCAhPT0gdW5kZWZpbmVkO1xuXHR9O1xuXG5cdFJlbmRlcmluZ1Byb3ZpZGVyLnByb3RvdHlwZS5nZXRSZW5kZXJlciA9IGZ1bmN0aW9uIChjYW52YXMsIG1vZGUpIHtcblx0XHRpZiAoIG1vZGUgJiYgbW9kZS50b0xvd2VyQ2FzZSgpID09IFwid2ViZ2xcIiAmJiB0aGlzLmlzV2ViR0xTdXBwb3J0ZWQoKSApIHtcblx0XHRcdHJldHVybiB0aGlzLmdldFdlYkdMUmVuZGVyZXIoY2FudmFzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0U3RhbmRhcmRFbnRpdHlSZW5kZXJlcihjYW52YXMpO1xuXHRcdH1cblx0fTtcblx0UmVuZGVyaW5nUHJvdmlkZXIucHJvdG90eXBlLmdldFN0YW5kYXJkUmVuZGVyZXIgPSBmdW5jdGlvbiAoY2FudmFzKSB7XG5cdFx0cmV0dXJuIG5ldyBNLnJlbmRlcmVycy5TdGFuZGFyZFJlbmRlcmVyKGNhbnZhcyk7XG5cdH07XG5cdFJlbmRlcmluZ1Byb3ZpZGVyLnByb3RvdHlwZS5nZXRTdGFuZGFyZEVudGl0eVJlbmRlcmVyID0gZnVuY3Rpb24gKGNhbnZhcykge1xuXHRcdHJldHVybiBuZXcgTS5yZW5kZXJlcnMuU3RhbmRhcmRFbnRpdHlSZW5kZXJlcihjYW52YXMpO1xuXHR9O1xuXG5cdFJlbmRlcmluZ1Byb3ZpZGVyLnByb3RvdHlwZS5nZXRXZWJHTFJlbmRlcmVyID0gZnVuY3Rpb24gKGNhbnZhcykge1xuXHRcdHJldHVybiBuZXcgTS5yZW5kZXJlcnMuV2ViR0xSZW5kZXJlcihjYW52YXMpO1xuXHR9O1xuXG5cdG5hbWVzcGFjZS5yZW5kZXJpbmdQcm92aWRlciA9IG5ldyBSZW5kZXJpbmdQcm92aWRlcigpO1xuXG59KShNKTsiLCIvKipcbiAqIEBtb2R1bGUgTWF0Y2hcbiAqIEBuYW1lc3BhY2UgcmVuZGVyZXJzXG4gKi9cbihmdW5jdGlvbihNKSB7XG5cblx0TS5yZW5kZXJpemFibGVzID0ge1xuXHRcdFRZUEVTOiB7XG5cdFx0XHRTUFJJVEU6IDAsXG5cdFx0XHRMQVlFUjogMSxcblx0XHRcdEJJVE1BUF9URVhUOiAyLFxuXHRcdFx0VEVYVDogMyxcblx0XHRcdFJFQ1RBTkdMRTogNCxcblx0XHRcdENJUkNMRTogNVxuXHRcdH1cblx0fVxuXG59KShNKTsiLCIvKipcbiAqIEBtb2R1bGUgTWF0Y2hcbiAqIEBuYW1lc3BhY2UgcmVuZGVyZXJzXG4gKi9cbihmdW5jdGlvbihNLCB2aXN1YWwpIHtcblx0LyoqXG5cdCAqIFByb3ZpZGVzIGJhc2ljIGJlaGF2aW91ciBmb3IgcmVuZGVyaW5nIGdhbWUgb2JqZWN0c1xuXHQgKlxuXHQgKiBAY2xhc3MgUmVuZGVyaXphYmxlXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAZXh0ZW5kcyBHYW1lT2JqZWN0V2l0aEV2ZW50c1xuXHQgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXNdIHByb3BlcnRpZXMgdG8gY29uc3RydWN0IHRoaXMgb2JqZWN0XG5cdCAqL1xuICAgIGZ1bmN0aW9uIFJlbmRlcml6YWJsZShwcm9wZXJ0aWVzKSB7XG4gICAgXHR0aGlzLmV4dGVuZHNHYW1lT2JqZWN0KCk7XG4gICAgXHR0aGlzLmV4dGVuZHNFdmVudEhhbmRsZXIoKTtcblx0XHQvKipcblx0XHQgKiBYIGNvb3JkaW5hdGUgb2YgdGhlIG9iamVjdFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHByb3BlcnR5IF94XG5cdFx0ICogQHR5cGUgZmxvYXRcblx0XHQgKi9cbiAgICAgICAgdGhpcy5feCA9IDA7XG5cdFx0LyoqXG5cdFx0ICogWSBjb29yZGluYXRlIG9mIHRoZSBvYmplY3Rcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfeVxuXHRcdCAqIEB0eXBlIGZsb2F0XG5cdFx0ICovXG5cdFx0dGhpcy5feSA9IDA7XG5cdFx0LyoqXG5cdFx0ICogcHJldmlvdXMgeCBjb29yZGluYXRlIG9mIHRoZSBvYmplY3Rcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfcHJldlhcblx0XHQgKiBAdHlwZSBmbG9hdFxuXHRcdCAqL1xuXHRcdHRoaXMuX3ByZXZYID0gMDtcblx0XHQvKipcblx0XHQgKiBwcmV2aW91cyB5IGNvb3JkaW5hdGUgb2YgdGhlIG9iamVjdFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHByb3BlcnR5IF9wcmV2WVxuXHRcdCAqIEB0eXBlIGZsb2F0XG5cdFx0ICovXG5cdFx0dGhpcy5fcHJldlkgPSAwO1x0XHRcblx0XHQvKipcblx0XHQgKiBvYmplY3Qgd2lkdGhcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfd2lkdGhcblx0XHQgKiBAdHlwZSBmbG9hdFxuXHRcdCAqL1xuXHRcdHRoaXMuX3dpZHRoID0gMDtcblx0XHQvKipcblx0XHQgKiBvYmplY3QgaGVpZ2h0XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX2hlaWdodFxuXHRcdCAqIEB0eXBlIGZsb2F0XG5cdFx0ICovXG4gICAgICAgIHRoaXMuX2hlaWdodCA9IDA7XG5cdFx0LyoqXG5cdFx0ICogb2JqZWN0IGhhbGYgd2lkdGgsIHVzZWQgZm9yIGZhc3RlciByZW5kZXJpbmdcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfaGFsZldpZHRoXG5cdFx0ICogQHR5cGUgZmxvYXRcblx0XHQgKi9cbiAgICAgICAgdGhpcy5faGFsZldpZHRoID0gMDtcblx0XHQvKipcblx0XHQgKiBvYmplY3QgaGFsZiBoZWlnaHQsIHVzZWQgZm9yIGZhc3RlciByZW5kZXJpbmdcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfaGFsZkhlaWdodFxuXHRcdCAqIEB0eXBlIGZsb2F0XG5cdFx0ICovXG4gICAgICAgIHRoaXMuX2hhbGZIZWlnaHQgPSAwO1xuXHRcdC8qKlxuXHRcdCAqIG9iamVjdCByb3RhdGlvblxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHByb3BlcnR5IF9yb3RhdGlvblxuXHRcdCAqIEB0eXBlIGZsb2F0XG5cdFx0ICovXG4gICAgICAgIHRoaXMuX3JvdGF0aW9uID0gbnVsbDtcblx0XHQvKipcblx0XHQgKiBvYmplY3Qgc2NhbGUgZmFjdG9yXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX3NjYWxlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fc2NhbGUgPSB7IHg6IDEsIHk6IDEgfTtcblx0XHQgKi9cbiAgICAgICAgdGhpcy5fc2NhbGUgPSBudWxsO1xuXHRcdC8qKlxuXHRcdCAqIG9iamVjdCB2aXNpYmlsaXR5LiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIG9iamVjdCB3aWxsIGJlIHJlbmRlcmVkIG9yIG5vdFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHByb3BlcnR5IF92aXNpYmxlXG5cdFx0ICogQHR5cGUgQm9vbGVhblxuXHRcdCAqL1xuICAgICAgICB0aGlzLl92aXNpYmxlID0gdHJ1ZTtcblx0XHQvKipcblx0XHQgKiBDb21wb3NpdGUgb3BlcmF0aW9uXG5cdFx0ICogUG9zc2libGUgdmFsdWVzOiBcInNvdXJjZS1vdmVyXCIgfCBcInNvdXJjZS1pblwiIHwgXCJzb3VyY2Utb3V0XCIgfCBcInNvdXJjZS1hdG9wXCIgfCBcImRlc3RpbmF0aW9uLW92ZXJcIiB8IFwiZGVzdGluYXRpb24taW5cIiB8IFwiZGVzdGluYXRpb24tb3V0XCIgfCBcImRlc3RpbmF0aW9uLWF0b3BcIiB8IFwibGlnaHRlclwiIHwgXCJkYXJrZXJcIiB8IFwiY29weVwiIHwgXCJ4b3JcIlxuXHRcdCAqIEBwcm9wZXJ0eSBvcGVyYXRpb25cblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHR0aGlzLm9wZXJhdGlvbiA9IFwic291cmNlLWluXCJcblx0XHRcdFxuXHRcdCAqL1xuXHRcdHRoaXMub3BlcmF0aW9uID0gbnVsbDtcblx0XHQvKipcblx0XHQgKiBvYmplY3QgdHJhbnNwYXJlbmN5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX2FscGhhXG5cdFx0ICogQHR5cGUgZmxvYXRcblx0XHQgKi9cblx0XHR0aGlzLl9hbHBoYSA9IG51bGw7XG5cblx0XHR0aGlzLl9tYXRoID0gTWF0aDtcblx0XHR0aGlzLl9tYXRoMmQgPSBNLm1hdGgyZDtcblx0XHRcblx0XHR0aGlzLl9jYWNoZWRSb3RhdGlvbkZvckJvdW5kaW5nSGFsZldpZHRoID0gMDtcblx0XHR0aGlzLl9jYWNoZWRSb3RhdGlvbkZvckJvdW5kaW5nSGFsZkhlaWdodCA9IDA7XG5cdFx0dGhpcy5fY2FjaGVkQm91bmRpbmdIYWxmV2lkdGggPSBudWxsO1xuXHRcdHRoaXMuX2NhY2hlZEJvdW5kaW5nSGFsZkhlaWdodCA9IG51bGw7XG5cdFx0XG4gICAgICAgIHRoaXMuc2V0KHByb3BlcnRpZXMpO1xuXG5cdH1cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwcm9wZXJ0eSBfekluZGV4XG5cdCAqIEB0eXBlIGludFxuXHQgKi9cblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5fekluZGV4ID0gMDtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHByb3BlcnRpZXMgb2YgdGhpcyBvYmplY3QgYmFzZWQgb24gdGhlIGdpdmVuIG9iamVjdFxuXHQgKiBAbWV0aG9kIHNldFxuXHQgKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllcyBwcm9wZXJ0aWVzIHRvIGNvbnN0cnVjdCB0aGlzIG9iamVjdFxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmICghcHJvcGVydGllcykgcmV0dXJuO1xuICAgICAgICB2YXIgc2V0dGVyID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBzZXR0ZXIgPSBcInNldFwiICsgaS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGkuc3Vic3RyKDEpO1xuICAgICAgICAgICAgaWYgKHRoaXNbc2V0dGVyXSkge1xuICAgICAgICAgICAgICAgIHRoaXNbc2V0dGVyXShwcm9wZXJ0aWVzW2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpc1tpXSA9IHByb3BlcnRpZXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblx0XHRyZXR1cm4gdGhpcztcbiAgICB9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgdHJhbnNwYXJlbmN5IG9mIHRoZSBvYmplY3Rcblx0ICogQG1ldGhvZCBzZXRBbHBoYVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB2YWx1ZSBhbHBoYSB2YWx1ZSB0byBzZXQuIE11c3QgYmUgYmV0d2VlbiAwIGFuZCAxXG5cdCAqL1xuXHRSZW5kZXJpemFibGUucHJvdG90eXBlLnNldEFscGhhID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRpZiAoIHZhbHVlID49IDAgJiYgdmFsdWUgPD0gMSAmJiB0aGlzLl9hbHBoYSAhPSB2YWx1ZSApIHtcblx0XHRcdHRoaXMuX2FscGhhID0gdmFsdWU7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJhbHBoYUNoYW5nZWRcIiwgdmFsdWUpO1xuXHRcdFx0dGhpcy5yYWlzZUV2ZW50KFwiYXR0cmlidXRlQ2hhbmdlZFwiLCBcImFscGhhXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9hbHBoYSA9IG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgdHJhbnNwYXJlbmN5IG9mIHRoZSBvYmplY3Rcblx0ICogQG1ldGhvZCBnZXRBbHBoYVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB2YWx1ZSBhbHBoYSB2YWx1ZVxuXHQgKi9cblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5nZXRBbHBoYSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9hbHBoYTtcblx0fTtcblx0LyoqXG5cdCAqIExvb3BzIHRocm91Z2ggdGhlIGFuaW1hdGlvbnMgb2YgYW4gb2JqZWN0LiBXaGVuIHRoZSBhbmltYXRpb25cblx0ICogaXMgY29tcGxldGUgaXQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBsaXN0LlxuXHQgKiBAbWV0aG9kIF9sb29wVGhyb3VnaEFuaW1hdGlvbnNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdFJlbmRlcml6YWJsZS5wcm90b3R5cGUuX2xvb3BUaHJvdWdoQW5pbWF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdGZ1bmN0aW9uIGRvTG9vcChpdGVtLCBpbmRleCwgbGlzdCkge1xuXHRcdFx0aWYgKCBpdGVtICYmICFpdGVtLm9uTG9vcCgpICkge1xuXHRcdFx0XHRsaXN0LnF1aWNrUmVtb3ZlKGluZGV4KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmFuaW1hdGlvbnMuZWFjaChkb0xvb3ApO1xuXHRcdFxuXHRcdGlmICggdGhpcy5jaGFpbmVkQW5pbWF0aW9ucy5zaXplICkge1xuXHRcdFx0aWYgKCAhdGhpcy5jaGFpbmVkQW5pbWF0aW9ucy5fbGlzdFt0aGlzLl9jdXJyZW50Q2hhaW5lZEJlaGF2aW91cl0ub25Mb29wKCkgKSB7XG5cdFx0XHRcdHRoaXMuX2N1cnJlbnRDaGFpbmVkQmVoYXZpb3VyKys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHRoaXMuX2N1cnJlbnRDaGFpbmVkQmVoYXZpb3VyID09IHRoaXMuY2hhaW5lZEFuaW1hdGlvbnMuc2l6ZSApIHtcblx0XHRcdFx0dGhpcy5jaGFpbmVkQW5pbWF0aW9ucy5yZW1vdmVBbGwoKTtcblx0XHRcdFx0dGhpcy5fY3VycmVudENoYWluZWRCZWhhdmlvdXIgPSAwO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0fTtcblx0LyoqXG5cdCAqIENsZWFycyB0aGUgYW5pbWF0aW9uIGxvb3Bcblx0ICogQG1ldGhvZCBjbGVhckFuaW1hdGlvbnNcblx0ICovXG5cdFJlbmRlcml6YWJsZS5wcm90b3R5cGUuY2xlYXJBbmltYXRpb25zID0gZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuYW5pbWF0aW9ucyA9IG5ldyBBcnJheSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogQWRkcyBhIGZhZGUgaW4gYW5pbWF0aW9uIHRvIHRoaXMgb2JqZWN0XG5cdCAqIEBtZXRob2QgZmFkZUluXG5cdCAqIEBwYXJhbSB7aW50fSBzZWNvbmRzIHRpbWUgaW4gc2Vjb25kcyB0aGF0IHRoZSBmYWRlIGluIHdpbGwgdGFrZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZpbmlzaGVkIGZ1bmN0aW9uIHRvIGNhbGwgb25jZSB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzXG5cdCAqL1xuXHRSZW5kZXJpemFibGUucHJvdG90eXBlLmZhZGVJbiA9IGZ1bmN0aW9uIChzZWNvbmRzLCBvbkZpbmlzaGVkKSB7XG5cdFx0dGhpcy5hbmltYXRpb25zLnB1c2gobmV3IHZpc3VhbC5GYWRlSW4odGhpcywgc2Vjb25kcywgb25GaW5pc2hlZCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogQWRkcyBhIGZhZGUgb3V0IGFuaW1hdGlvbiB0byB0aGlzIG9iamVjdFxuXHQgKiBAbWV0aG9kIGZhZGVPdXRcblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgdGltZSBpbiBzZWNvbmRzIHRoYXQgdGhlIGZhZGUgb3V0IHdpbGwgdGFrZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZpbmlzaGVkIGZ1bmN0aW9uIHRvIGNhbGwgb25jZSB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzXG5cdCAqL1xuXHRSZW5kZXJpemFibGUucHJvdG90eXBlLmZhZGVPdXQgPSBmdW5jdGlvbiAoc2Vjb25kcywgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuYW5pbWF0aW9ucy5wdXNoKG5ldyB2aXN1YWwuRmFkZU91dCh0aGlzLCBzZWNvbmRzLCBvbkZpbmlzaGVkKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cdC8qKlxuXHQgKiBBZGRzIGEgY29udGlub3VzZSBmYWRlIGFuaW1hdGlvbiB0byB0aGlzIG9iamVjdFxuXHQgKiBAbWV0aG9kIGNvbnRpbm91c0ZhZGVcblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgdGltZSBpbiBzZWNvbmRzIHRoYXQgdGhlIGZhZGUgaW4gYW5kIGZhZGUgb3V0IHdpbGwgdGFrZVxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IFtmYWRlT3V0Rmlyc3RdIGRldGVybWluZXMgd2hldGhlciB0aGUgYW5pbWF0aW9uIHdpbGwgc3RhcnQgZmFkaW5nIGluIG9yIG91dFxuXHQgKiBAcGFyYW0ge2ludH0gW21pbl0gbWludW11bSBhbHBoYSB2YWx1ZSwgZGVmYXVsdHMgdG8gMFxuXHQgKiBAcGFyYW0ge2ludH0gW21heF0gbWF4aW11bSBhbHBoYSB2YWx1ZSwgZGVmYXVsdHMgdG8gMVxuXHQgKi9cblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5jb250aW5vdXNGYWRlID0gZnVuY3Rpb24gKHNlY29uZHMsIGZhZGVPdXRGaXJzdCwgbWluLCBtYXgpIHtcblx0XHR0aGlzLmFuaW1hdGlvbnMucHVzaChuZXcgdmlzdWFsLkNvbnRpbm91c0ZhZGUodGhpcywgc2Vjb25kcywgZmFkZU91dEZpcnN0LCBtaW4sIG1heCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogTW92ZXMgYW4gb2JqZWN0IHRvIHRoZSBnaXZlbiBjb29yZGluYXRlcyBpbiB0aGUgcHJvdmlkZWQgc2Vjb25kc1xuXHQgKiBAbWV0aG9kIG1vdmVcblx0ICogQHBhcmFtIHtmbG9hdH0geCB0aGUgZGVzdGluYXRpb24geCBjb29yZGluYXRlXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHkgdGhlIGRlc3RpbmF0aW9uIHkgY29vcmRpbmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZWFzaW5nWCBFYXNlIGZ1bmN0aW9uIG5hbWUgZm9yIHggYXhpc1xuXHQgKiBAcGFyYW0ge1N0cmluZ30gZWFzaW5nWSBFYXNlIGZ1bmN0aW9uIG5hbWUgZm9yIHkgYXhpc1xuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IGxvb3AgU3RhcnQgb3ZlciB3aGVuIHJlY2hlZCBkZXN0aW5hdGlvblxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZpbmlzaGVkIGZ1bmN0aW9uIHRvIGNhbGwgb25jZSB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzXG5cdCAqL1xuXHRSZW5kZXJpemFibGUucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbiAoeCwgeSwgc2Vjb25kcywgZWFzaW5nWCwgZWFzaW5nWSwgbG9vcCwgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuYW5pbWF0aW9ucy5wdXNoKG5ldyB2aXN1YWwuRWFzaW5nKHRoaXMsIHgsIHksIHNlY29uZHMsIGVhc2luZ1gsIGVhc2luZ1ksIGxvb3AsIG9uRmluaXNoZWQpKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblx0LyoqXG5cdCAqIFNjYWxlcyBhbiBvYmplY3QgdXAgdG8gdGhlIGdpdmVuIHZhbHVlcyBpbiB0aGUgcHJvdmlkZWQgc2Vjb25kc1xuXHQgKiBAbWV0aG9kIHNjYWxlVXBcblx0ICogQHBhcmFtIHtmbG9hdH0geCB0aGUgZGVzdGluYXRpb24gd2lkdGggZmFjdG9yXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHkgdGhlIGRlc3RpbmF0aW9uIGhlaWdodCBmYWN0b3Jcblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgdGltZSBpbiBzZWNvbmRzIHRoYXQgdGhlIHNjYWxpbmcgd2lsbCB0YWtlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9uRmluaXNoZWQgZnVuY3Rpb24gdG8gY2FsbCBvbmNlIHRoZSBhbmltYXRpb24gZmluaXNoZXNcblx0ICovXG5cdFJlbmRlcml6YWJsZS5wcm90b3R5cGUuc2NhbGVVcCA9IGZ1bmN0aW9uICh4LCB5LCBzZWNvbmRzLCBvbkZpbmlzaGVkKSB7XG5cdFx0dGhpcy5hbmltYXRpb25zLnB1c2gobmV3IHZpc3VhbC5TY2FsZVVwKHRoaXMsIHgsIHksIHNlY29uZHMsIG9uRmluaXNoZWQpKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblx0LyoqXG5cdCAqIFNjYWxlcyBhbiBvYmplY3QgZG93biB0byB0aGUgZ2l2ZW4gdmFsdWVzIGluIHRoZSBwcm92aWRlZCBzZWNvbmRzXG5cdCAqIEBtZXRob2Qgc2NhbGVEb3duXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHggdGhlIGRlc3RpbmF0aW9uIHdpZHRoIGZhY3RvclxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB5IHRoZSBkZXN0aW5hdGlvbiBoZWlnaHQgZmFjdG9yXG5cdCAqIEBwYXJhbSB7aW50fSBzZWNvbmRzIHRpbWUgaW4gc2Vjb25kcyB0aGF0IHRoZSBzY2FsaW5nIHdpbGwgdGFrZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZpbmlzaGVkIGZ1bmN0aW9uIHRvIGNhbGwgb25jZSB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzXG5cdCAqL1xuXHRSZW5kZXJpemFibGUucHJvdG90eXBlLnNjYWxlRG93biA9IGZ1bmN0aW9uICh4LCB5LCBzZWNvbmRzLCBvbkZpbmlzaGVkKSB7XG5cdFx0dGhpcy5hbmltYXRpb25zLnB1c2gobmV3IHZpc3VhbC5TY2FsZURvd24odGhpcywgeCwgeSwgc2Vjb25kcywgb25GaW5pc2hlZCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogTWFrZXMgYW4gb2JqZWN0IHR3aW5rbGUgdGhlIGdpdmVuIGFtb3VudCBvZiB0aW1lcyBpbiB0aGUgZHVyYXRpb24gcHJvdmlkZWRcblx0ICogQG1ldGhvZCB0d2lua2xlXG5cdCAqIEBwYXJhbSB7aW50fSB0aW1lc1RvVHdpbmtsZSB0aGUgYW1vdW50IG9mIHRpbWVzIHRoZSBvYmplY3Qgd2lsbCB0d2lua2xlXG5cdCAqIEBwYXJhbSB7aW50fSBkdXJhdGlvbkluTWlsbGlzZWNvbmRzIHRoZSBkdXJhdGlvbiwgaW4gbWlsbGlzZWNvbmRzLCB0aGUgdHdpbmtsZSBlZmZlY3Qgd2lsbCBsYXN0XG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9uRmluaXNoZWQgZnVuY3Rpb24gdG8gY2FsbCBvbmNlIHRoZSBhbmltYXRpb24gZmluaXNoZXNcblx0ICovXG5cdFJlbmRlcml6YWJsZS5wcm90b3R5cGUudHdpbmtsZSA9IGZ1bmN0aW9uICh0aW1lc1RvVHdpbmtsZSwgZHVyYXRpb25Jbk1pbGxpc2Vjb25kcywgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuYW5pbWF0aW9ucy5wdXNoKG5ldyB2aXN1YWwuVHdpbmtsZSh0aGlzLCB0aW1lc1RvVHdpbmtsZSwgZHVyYXRpb25Jbk1pbGxpc2Vjb25kcywgb25GaW5pc2hlZCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogUm90YXRlcyBhbiBvYmplY3QgdG8gdGhlIGdpdmVuIGFuZ2xlIGluIHRoZSBwcm92aWRlZCBzZWNvbmRzXG5cdCAqIEBtZXRob2Qgcm90YXRlXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHRoZSBkZXN0aW5hdGlvbiBhbmdsZVxuXHQgKiBAcGFyYW0ge2ludH0gc2Vjb25kcyB0aGUgZHVyYXRpb24gdGhlIHJvdGF0aW9uIGVmZmVjdCB3aWxsIHRha2UgdG8gcmVhY2ggdGhlIHByb3ZpZGVkIGFuZ2xlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9uRmluaXNoZWQgZnVuY3Rpb24gdG8gY2FsbCBvbmNlIHRoZSBhbmltYXRpb24gZmluaXNoZXNcblx0ICovXG5cdFJlbmRlcml6YWJsZS5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24gKGFuZ2xlLCBzZWNvbmRzLCBvbkZpbmlzaGVkKSB7XG5cdFx0dGhpcy5hbmltYXRpb25zLnB1c2gobmV3IHZpc3VhbC5Sb3RhdGUodGhpcywgYW5nbGUsIHNlY29uZHMsIG9uRmluaXNoZWQpKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblx0LyoqXG5cdCAqIEFkZHMgYSBmYWRlIGluIGFuaW1hdGlvbiB0byB0aGlzIG9iamVjdFxuXHQgKiBAbWV0aG9kIGZhZGVJblxuXHQgKiBAcGFyYW0ge2ludH0gc2Vjb25kcyB0aW1lIGluIHNlY29uZHMgdGhhdCB0aGUgZmFkZSBpbiB3aWxsIHRha2Vcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gb25GaW5pc2hlZCBmdW5jdGlvbiB0byBjYWxsIG9uY2UgdGhlIGFuaW1hdGlvbiBmaW5pc2hlc1xuXHQgKi9cblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5jaGFpbldhaXQgPSBmdW5jdGlvbiAoc2Vjb25kcywgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuY2hhaW5lZEFuaW1hdGlvbnMucHVzaChuZXcgdmlzdWFsLldhaXQodGhpcywgc2Vjb25kcywgb25GaW5pc2hlZCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogQWRkcyBhIGZhZGUgaW4gYW5pbWF0aW9uIHRvIHRoaXMgb2JqZWN0XG5cdCAqIEBtZXRob2QgZmFkZUluXG5cdCAqIEBwYXJhbSB7aW50fSBzZWNvbmRzIHRpbWUgaW4gc2Vjb25kcyB0aGF0IHRoZSBmYWRlIGluIHdpbGwgdGFrZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZpbmlzaGVkIGZ1bmN0aW9uIHRvIGNhbGwgb25jZSB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzXG5cdCAqL1xuXHRSZW5kZXJpemFibGUucHJvdG90eXBlLmNoYWluRmFkZUluID0gZnVuY3Rpb24gKHNlY29uZHMsIG9uRmluaXNoZWQpIHtcblx0XHR0aGlzLmNoYWluZWRBbmltYXRpb25zLnB1c2gobmV3IHZpc3VhbC5GYWRlSW4odGhpcywgc2Vjb25kcywgb25GaW5pc2hlZCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogQWRkcyBhIGZhZGUgb3V0IGFuaW1hdGlvbiB0byB0aGlzIG9iamVjdFxuXHQgKiBAbWV0aG9kIGZhZGVPdXRcblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgdGltZSBpbiBzZWNvbmRzIHRoYXQgdGhlIGZhZGUgb3V0IHdpbGwgdGFrZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZpbmlzaGVkIGZ1bmN0aW9uIHRvIGNhbGwgb25jZSB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzXG5cdCAqL1xuXHRSZW5kZXJpemFibGUucHJvdG90eXBlLmNoYWluRmFkZU91dCA9IGZ1bmN0aW9uIChzZWNvbmRzLCBvbkZpbmlzaGVkKSB7XG5cdFx0dGhpcy5jaGFpbmVkQW5pbWF0aW9ucy5wdXNoKG5ldyB2aXN1YWwuRmFkZU91dCh0aGlzLCBzZWNvbmRzLCBvbkZpbmlzaGVkKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cdC8qKlxuXHQgKiBBZGRzIGEgY29udGlub3VzZSBmYWRlIGFuaW1hdGlvbiB0byB0aGlzIG9iamVjdFxuXHQgKiBAbWV0aG9kIGNvbnRpbm91c0ZhZGVcblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgdGltZSBpbiBzZWNvbmRzIHRoYXQgdGhlIGZhZGUgaW4gYW5kIGZhZGUgb3V0IHdpbGwgdGFrZVxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IFtmYWRlT3V0Rmlyc3RdIGRldGVybWluZXMgd2hldGhlciB0aGUgYW5pbWF0aW9uIHdpbGwgc3RhcnQgZmFkaW5nIGluIG9yIG91dFxuXHQgKiBAcGFyYW0ge2ludH0gW21pbl0gbWludW11bSBhbHBoYSB2YWx1ZSwgZGVmYXVsdHMgdG8gMFxuXHQgKiBAcGFyYW0ge2ludH0gW21heF0gbWF4aW11bSBhbHBoYSB2YWx1ZSwgZGVmYXVsdHMgdG8gMVxuXHQgKi9cblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5jaGFpbkNvbnRpbm91c0ZhZGUgPSBmdW5jdGlvbiAoc2Vjb25kcywgZmFkZU91dEZpcnN0LCBtaW4sIG1heCkge1xuXHRcdHRoaXMuY2hhaW5lZEFuaW1hdGlvbnMucHVzaChuZXcgdmlzdWFsLkNvbnRpbm91c0ZhZGUodGhpcywgc2Vjb25kcywgZmFkZU91dEZpcnN0LCBtaW4sIG1heCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogTW92ZXMgYW4gb2JqZWN0IHRvIHRoZSBnaXZlbiBjb29yZGluYXRlcyBpbiB0aGUgcHJvdmlkZWQgc2Vjb25kc1xuXHQgKiBAbWV0aG9kIG1vdmVcblx0ICogQHBhcmFtIHtmbG9hdH0geCB0aGUgZGVzdGluYXRpb24geCBjb29yZGluYXRlXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHkgdGhlIGRlc3RpbmF0aW9uIHkgY29vcmRpbmF0ZVxuXHQgKiBAcGFyYW0ge2ludH0gc2Vjb25kcyB0aW1lIGluIHNlY29uZHMgdGhhdCB0aGUgZmFkZSBpbiBhbmQgZmFkZSBvdXQgd2lsbCB0YWtlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9uRmluaXNoZWQgZnVuY3Rpb24gdG8gY2FsbCBvbmNlIHRoZSBhbmltYXRpb24gZmluaXNoZXNcblx0ICovXG5cdFJlbmRlcml6YWJsZS5wcm90b3R5cGUuY2hhaW5Nb3ZlID0gZnVuY3Rpb24gKHgsIHksIHNlY29uZHMsIGVhc2luZ1gsIGVhc2luZ1kpIHtcblx0XHQvLyB0aGlzLmNoYWluZWRBbmltYXRpb25zLnB1c2gobmV3IHZpc3VhbC5Nb3ZlKHRoaXMsIHgsIHksIHNlY29uZHMsIG9uRmluaXNoZWQpKTtcblx0XHR0aGlzLmNoYWluZWRBbmltYXRpb25zLnB1c2gobmV3IHZpc3VhbC5FYXNpbmcodGhpcywgeCwgeSwgc2Vjb25kcywgZWFzaW5nWCwgZWFzaW5nWSkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogU2NhbGVzIGFuIG9iamVjdCB1cCB0byB0aGUgZ2l2ZW4gdmFsdWVzIGluIHRoZSBwcm92aWRlZCBzZWNvbmRzXG5cdCAqIEBtZXRob2Qgc2NhbGVVcFxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB4IHRoZSBkZXN0aW5hdGlvbiB3aWR0aCBmYWN0b3Jcblx0ICogQHBhcmFtIHtmbG9hdH0geSB0aGUgZGVzdGluYXRpb24gaGVpZ2h0IGZhY3RvclxuXHQgKiBAcGFyYW0ge2ludH0gc2Vjb25kcyB0aW1lIGluIHNlY29uZHMgdGhhdCB0aGUgc2NhbGluZyB3aWxsIHRha2Vcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gb25GaW5pc2hlZCBmdW5jdGlvbiB0byBjYWxsIG9uY2UgdGhlIGFuaW1hdGlvbiBmaW5pc2hlc1xuXHQgKi9cblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5jaGFpblNjYWxlVXAgPSBmdW5jdGlvbiAoeCwgeSwgc2Vjb25kcywgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuY2hhaW5lZEFuaW1hdGlvbnMucHVzaChuZXcgdmlzdWFsLlNjYWxlVXAodGhpcywgeCwgeSwgc2Vjb25kcywgb25GaW5pc2hlZCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogU2NhbGVzIGFuIG9iamVjdCBkb3duIHRvIHRoZSBnaXZlbiB2YWx1ZXMgaW4gdGhlIHByb3ZpZGVkIHNlY29uZHNcblx0ICogQG1ldGhvZCBzY2FsZURvd25cblx0ICogQHBhcmFtIHtmbG9hdH0geCB0aGUgZGVzdGluYXRpb24gd2lkdGggZmFjdG9yXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHkgdGhlIGRlc3RpbmF0aW9uIGhlaWdodCBmYWN0b3Jcblx0ICogQHBhcmFtIHtpbnR9IHNlY29uZHMgdGltZSBpbiBzZWNvbmRzIHRoYXQgdGhlIHNjYWxpbmcgd2lsbCB0YWtlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9uRmluaXNoZWQgZnVuY3Rpb24gdG8gY2FsbCBvbmNlIHRoZSBhbmltYXRpb24gZmluaXNoZXNcblx0ICovXG5cdFJlbmRlcml6YWJsZS5wcm90b3R5cGUuY2hhaW5TY2FsZURvd24gPSBmdW5jdGlvbiAoeCwgeSwgc2Vjb25kcywgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuY2hhaW5lZEFuaW1hdGlvbnMucHVzaChuZXcgdmlzdWFsLlNjYWxlRG93bih0aGlzLCB4LCB5LCBzZWNvbmRzLCBvbkZpbmlzaGVkKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cdC8qKlxuXHQgKiBNYWtlcyBhbiBvYmplY3QgdHdpbmtsZSB0aGUgZ2l2ZW4gYW1vdW50IG9mIHRpbWVzIGluIHRoZSBkdXJhdGlvbiBwcm92aWRlZFxuXHQgKiBAbWV0aG9kIHR3aW5rbGVcblx0ICogQHBhcmFtIHtpbnR9IHRpbWVzVG9Ud2lua2xlIHRoZSBhbW91bnQgb2YgdGltZXMgdGhlIG9iamVjdCB3aWxsIHR3aW5rbGVcblx0ICogQHBhcmFtIHtpbnR9IGR1cmF0aW9uSW5NaWxsaXNlY29uZHMgdGhlIGR1cmF0aW9uLCBpbiBtaWxsaXNlY29uZHMsIHRoZSB0d2lua2xlIGVmZmVjdCB3aWxsIGxhc3Rcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gb25GaW5pc2hlZCBmdW5jdGlvbiB0byBjYWxsIG9uY2UgdGhlIGFuaW1hdGlvbiBmaW5pc2hlc1xuXHQgKi9cblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5jaGFpblR3aW5rbGUgPSBmdW5jdGlvbiAodGltZXNUb1R3aW5rbGUsIGR1cmF0aW9uSW5NaWxsaXNlY29uZHMsIG9uRmluaXNoZWQpIHtcblx0XHR0aGlzLmNoYWluZWRBbmltYXRpb25zLnB1c2gobmV3IHZpc3VhbC5Ud2lua2xlKHRoaXMsIHRpbWVzVG9Ud2lua2xlLCBkdXJhdGlvbkluTWlsbGlzZWNvbmRzLCBvbkZpbmlzaGVkKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cdC8qKlxuXHQgKiBSb3RhdGVzIGFuIG9iamVjdCB0byB0aGUgZ2l2ZW4gYW5nbGUgaW4gdGhlIHByb3ZpZGVkIHNlY29uZHNcblx0ICogQG1ldGhvZCByb3RhdGVcblx0ICogQHBhcmFtIHtmbG9hdH0gdGhlIGRlc3RpbmF0aW9uIGFuZ2xlXG5cdCAqIEBwYXJhbSB7aW50fSBzZWNvbmRzIHRoZSBkdXJhdGlvbiB0aGUgcm90YXRpb24gZWZmZWN0IHdpbGwgdGFrZSB0byByZWFjaCB0aGUgcHJvdmlkZWQgYW5nbGVcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gb25GaW5pc2hlZCBmdW5jdGlvbiB0byBjYWxsIG9uY2UgdGhlIGFuaW1hdGlvbiBmaW5pc2hlc1xuXHQgKi9cblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5jaGFpblJvdGF0ZSA9IGZ1bmN0aW9uIChhbmdsZSwgc2Vjb25kcywgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuY2hhaW5lZEFuaW1hdGlvbnMucHVzaChuZXcgdmlzdWFsLlJvdGF0ZSh0aGlzLCBhbmdsZSwgc2Vjb25kcywgb25GaW5pc2hlZCkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogTG9vcHMgdGhyb3VnaCB0aGUgdGltZXJzIG9mIHRoZSBvYmplY3Rcblx0ICogQHByaXZhdGVcblx0ICogQG1ldGhvZCBfbG9vcFRocm91Z2hUaW1lcnNcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5fbG9vcFRocm91Z2hUaW1lcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgbCA9IHRoaXMuX29uTG9vcFRpbWVycy5sZW5ndGg7XG4gICAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLl9vbkxvb3BUaW1lcnNbaV0ub25Mb29wKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXHQvKipcblx0ICogQWRkcyBhIHRpbWVyIHRvIHRoaXMgb2JqZWN0IGFuZCByZXR1cm5zIGl0XG5cdCAqIEBtZXRob2QgYWRkVGltZXJcblx0ICogQHBhcmFtIHtpbnR9IHRpbWVJbk1pbGxpc1xuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0aGUgZnVuY3Rpb24gdG8gY2FsbCBvbmNlIHBlciBpbnRlcnZhbC4gSWYgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIGEgbWV0aG9kIG9mIHRoaXMgb2JqZWN0LCB0aGVuIHRoZSBjb250ZXh0IHdpbGwgYmVjb21lIHRoaXMgb2JqZWN0XG5cdCAqIEByZXR1cm5zIHtUaW1lcn0gdGhlIG5ld2x5IGNyZWF0ZWQgdGltZXJcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5hZGRUaW1lciA9IGZ1bmN0aW9uICh0aW1lSW5NaWxsaXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciB0aW1lciA9IG5ldyBNLlRpbWVyKHRpbWVJbk1pbGxpcywgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkxvb3BUaW1lcnMucHVzaCh0aW1lcik7XG4gICAgICAgIHJldHVybiB0aW1lcjtcbiAgICB9O1xuXHQvKipcblx0ICogUmVtb3ZlcyBhIHRpbWVyIGZyb20gdGhpcyBvYmplY3Rcblx0ICogQG1ldGhvZCByZW1vdmVUaW1lclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0aGUgZnVuY3Rpb24gdG8gYmUgcmVtb3ZlZFxuXHQgKiBAcmV0dXJucyB7UmVuZGVyaXphYmxlfSByZXR1cm5zIGl0c2VsZlxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLnJlbW92ZVRpbWVyID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuX29uTG9vcFRpbWVycy5zcGxpY2UodGhpcy5fb25Mb29wVGltZXJzLmluZGV4T2YodGhpcy5fZ2V0VGltZXIoY2FsbGJhY2spKSwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB0aW1lciB0aGF0IGhhbmRsZXMgdGhlIGdpdmVuIGNhbGxiYWNrXG5cdCAqIEBtZXRob2QgX2dldFRpbWVyXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRoZSBmdW5jdGlvbiBhc3NpZ25lZCB0byB0aGUgdGltZXJcblx0ICogQHJldHVybnMge1RpbWVyfSB0aGUgdGltZXIgb3IgbnVsbFxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLl9nZXRUaW1lciA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgIGwgPSB0aGlzLl9vbkxvb3BUaW1lcnMubGVuZ3RoO1xuICAgICAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX29uTG9vcFRpbWVyc1tpXS5jYWxsYmFjayA9PSBjYWxsYmFjaykgcmV0dXJuIHRoaXMuX29uTG9vcFRpbWVyc1tpXTtcbiAgICAgICAgfVxuICAgIH07XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSB6SW5kZXggb2YgdGhpcyBvYmplY3Rcblx0ICogQG1ldGhvZCBzZXRaSW5kZXhcblx0ICogQHBhcmFtIHtpbnR9IHZhbHVlIHRoZSB6SW5kZXhcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5zZXRaSW5kZXggPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRpZiAoIHRoaXMuX3pJbmRleCAhPSB2YWx1ZSApIHtcblx0XHRcdHRoaXMuX3pJbmRleCA9IHZhbHVlO1xuXHRcdFx0dGhpcy5yYWlzZUV2ZW50KFwiekluZGV4Q2hhbmdlZFwiLCB2YWx1ZSk7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJhdHRyaWJ1dGVDaGFuZ2VkXCIsIFwiekluZGV4XCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcbiAgICB9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgekluZGV4IG9mIHRoaXMgb2JqZWN0XG5cdCAqIEBtZXRob2QgZ2V0WkluZGV4XG5cdCAqIEByZXR1cm4ge2ludH0gdGhlIHpJbmRleFxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLmdldFpJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3pJbmRleDtcbiAgICB9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgdmlzaWJpbGl0eSBvZiB0aGlzIG9iamVjdFxuXHQgKiBAbWV0aG9kIHNldFZpc2libGVcblx0ICogQHBhcmFtIHtCb29sZWFufSB2YWx1ZSB0cnVlIGlmIGl0IGlzIHZpc2libGUgb3IgZmFsc2UgaWYgaXQgaXMgbm90XG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuc2V0VmlzaWJsZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIFx0aWYgKCB0aGlzLl92aXNpYmxlICE9IHZhbHVlICkge1xuXHQgICAgICAgIHRoaXMuX3Zpc2libGUgPSB2YWx1ZTtcblx0ICAgICAgICB0aGlzLnJhaXNlRXZlbnQoXCJ2aXNpYmlsaXR5Q2hhbmdlZFwiLCB2YWx1ZSk7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJhdHRyaWJ1dGVDaGFuZ2VkXCIsIFwidmlzaWJpbGl0eVwiKTtcbiAgICBcdH1cblx0XHRyZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuZ2V0VmlzaWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Zpc2libGU7XG4gICAgfTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHdpZHRoIG9mIHRoaXMgb2JqZWN0XG5cdCAqIEBtZXRob2Qgc2V0V2lkdGhcblx0ICogQHBhcmFtIHtmbG9hdH0gdmFsdWVcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5zZXRXaWR0aCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIFx0Ly92YWx1ZSA9IH5+KHZhbHVlKzAuNSk7XG5cdFx0aWYgKCB0aGlzLl93aWR0aCAhPSB2YWx1ZSApIHtcblx0XHRcdHRoaXMuX3dpZHRoID0gdmFsdWU7XG5cdFx0XHR0aGlzLl9oYWxmV2lkdGggPSB2YWx1ZSAvIDI7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJ3aWR0aENoYW5nZWRcIiwgdmFsdWUpO1xuXHRcdFx0dGhpcy5yYWlzZUV2ZW50KFwiYXR0cmlidXRlQ2hhbmdlZFwiLCBcIndpZHRoXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcbiAgICB9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgaGVpZ2h0IG9mIHRoaXMgb2JqZWN0XG5cdCAqIEBtZXRob2Qgc2V0SGVpZ2h0XG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHZhbHVlXG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgXHQvL3ZhbHVlID0gfn4odmFsdWUrMC41KTtcblx0XHRpZiAoIHRoaXMuX2hlaWdodCAhPSB2YWx1ZSApIHtcblx0XHRcdHRoaXMuX2hlaWdodCA9IHZhbHVlO1xuXHRcdFx0dGhpcy5faGFsZkhlaWdodCA9IHZhbHVlIC8gMjtcblx0XHRcdHRoaXMucmFpc2VFdmVudChcImhlaWdodENoYW5nZWRcIiwgdmFsdWUpO1xuXHRcdFx0dGhpcy5yYWlzZUV2ZW50KFwiYXR0cmlidXRlQ2hhbmdlZFwiLCBcImhlaWdodFwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG4gICAgfTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIHdpZHRoIG9mIHRoaXMgb2JqZWN0XG5cdCAqIEBtZXRob2QgZ2V0V2lkdGhcblx0ICogQHJldHVybiB7ZmxvYXR9IHRoZSB3aWR0aFxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLmdldFdpZHRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fc2NhbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93aWR0aCAqIHRoaXMuX3NjYWxlLng7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuZ2V0Qm91bmRpbmdIYWxmV2lkdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgXHRcbiAgICBcdGlmICggIXRoaXMuX3JvdGF0aW9uICkge1xuICAgIFx0XHRyZXR1cm4gdGhpcy5faGFsZldpZHRoO1xuICAgIFx0fSBlbHNlIGlmICggdGhpcy5fY2FjaGVkUm90YXRpb25Gb3JCb3VuZGluZ0hhbGZXaWR0aCA9PSB0aGlzLl9yb3RhdGlvbiApIHtcbiAgICBcdFx0cmV0dXJuIHRoaXMuX2NhY2hlZEJvdW5kaW5nSGFsZldpZHRoO1xuICAgIFx0fVxuXG5cdFx0dmFyIGhhbGZXaWR0aCA9IHRoaXMuX2hhbGZXaWR0aCxcblx0XHRcdGhhbGZIZWlnaHQgPSB0aGlzLl9oYWxmSGVpZ2h0LFxuXHRcdFx0djEgPSB0aGlzLl9tYXRoMmQuZ2V0Um90YXRlZFZlcnRleENvb3Jkc1goLWhhbGZXaWR0aCwgLWhhbGZIZWlnaHQsIHRoaXMuX3JvdGF0aW9uKSxcblx0XHRcdHYyID0gdGhpcy5fbWF0aDJkLmdldFJvdGF0ZWRWZXJ0ZXhDb29yZHNYKGhhbGZXaWR0aCwgLWhhbGZIZWlnaHQsIHRoaXMuX3JvdGF0aW9uKSxcblx0XHRcdHYzID0gdGhpcy5fbWF0aDJkLmdldFJvdGF0ZWRWZXJ0ZXhDb29yZHNYKGhhbGZXaWR0aCwgaGFsZkhlaWdodCwgdGhpcy5fcm90YXRpb24pLFxuXHRcdFx0djQgPSB0aGlzLl9tYXRoMmQuZ2V0Um90YXRlZFZlcnRleENvb3Jkc1goLWhhbGZXaWR0aCwgaGFsZkhlaWdodCwgdGhpcy5fcm90YXRpb24pLFxuXHRcdFx0bWF4WCA9IHRoaXMuX21hdGgubWF4KHYxLCB2MiwgdjMsIHY0KTtcblxuXHRcdHRoaXMuX2NhY2hlZEJvdW5kaW5nSGFsZldpZHRoID0gdGhpcy5fbWF0aC5hYnMobWF4WCk7XG5cdFx0dGhpcy5fY2FjaGVkUm90YXRpb25Gb3JCb3VuZGluZ0hhbGZXaWR0aCA9IHRoaXMuX3JvdGF0aW9uO1xuXG5cdFx0cmV0dXJuIHRoaXMuX2NhY2hlZEJvdW5kaW5nSGFsZldpZHRoO1xuICAgIH07XG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5nZXRCb3VuZGluZ1dpZHRoID0gZnVuY3Rpb24gKCkge1xuICAgIFx0cmV0dXJuIHRoaXMuZ2V0Qm91bmRpbmdIYWxmV2lkdGgoKSAqIDI7XG4gICAgfTtcbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLmdldEJvdW5kaW5nSGFsZkhlaWdodCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIFx0aWYgKCAhdGhpcy5fcm90YXRpb24gKSB7XG4gICAgXHRcdHJldHVybiB0aGlzLl9oYWxmSGVpZ2h0O1xuICAgIFx0fSBlbHNlIGlmICggdGhpcy5fY2FjaGVkUm90YXRpb25Gb3JCb3VuZGluZ0hhbGZIZWlnaHQgPT0gdGhpcy5fcm90YXRpb24gKSB7XG4gICAgXHRcdHJldHVybiB0aGlzLl9jYWNoZWRCb3VuZGluZ0hhbGZIZWlnaHQ7XG4gICAgXHR9XG5cblx0XHR2YXIgaGFsZldpZHRoID0gdGhpcy5faGFsZldpZHRoLFxuXHRcdFx0aGFsZkhlaWdodCA9IHRoaXMuX2hhbGZIZWlnaHQsXG5cdFx0XHR2MSA9IHRoaXMuX21hdGgyZC5nZXRSb3RhdGVkVmVydGV4Q29vcmRzWSgtaGFsZldpZHRoLCAtaGFsZkhlaWdodCwgdGhpcy5fcm90YXRpb24pLFxuXHRcdFx0djIgPSB0aGlzLl9tYXRoMmQuZ2V0Um90YXRlZFZlcnRleENvb3Jkc1koaGFsZldpZHRoLCAtaGFsZkhlaWdodCwgdGhpcy5fcm90YXRpb24pLFxuXHRcdFx0djMgPSB0aGlzLl9tYXRoMmQuZ2V0Um90YXRlZFZlcnRleENvb3Jkc1koaGFsZldpZHRoLCBoYWxmSGVpZ2h0LCB0aGlzLl9yb3RhdGlvbiksXG5cdFx0XHR2NCA9IHRoaXMuX21hdGgyZC5nZXRSb3RhdGVkVmVydGV4Q29vcmRzWSgtaGFsZldpZHRoLCBoYWxmSGVpZ2h0LCB0aGlzLl9yb3RhdGlvbiksXG5cdFx0XHRtYXhZID0gdGhpcy5fbWF0aC5tYXgodjEsIHYyLCB2MywgdjQpO1xuXG5cdFx0dGhpcy5fY2FjaGVkQm91bmRpbmdIYWxmSGVpZ2h0ID0gdGhpcy5fbWF0aC5hYnMobWF4WSk7XG5cdFx0dGhpcy5fY2FjaGVkUm90YXRpb25Gb3JCb3VuZGluZ0hhbGZIZWlnaHQgPSB0aGlzLl9yb3RhdGlvbjtcblxuXHRcdHJldHVybiB0aGlzLl9jYWNoZWRCb3VuZGluZ0hhbGZIZWlnaHQ7XG5cbiAgICB9O1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuZ2V0Qm91bmRpbmdIZWlnaHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgXHRyZXR1cm4gdGhpcy5nZXRCb3VuZGluZ0hhbGZIZWlnaHQoKSAqIDI7XG4gICAgfTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIGhlaWdodCBvZiB0aGlzIG9iamVjdFxuXHQgKiBAbWV0aG9kIGdldEhlaWdodFxuXHQgKiBAcmV0dXJuIHtmbG9hdH0gdGhlIGhlaWdodFxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLmdldEhlaWdodCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NjYWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGVpZ2h0ICogdGhpcy5fc2NhbGUueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGlzIG9iamVjdC4gQmVoYXZlcyBleGFjdGx5IGFzIGlmIGNhbGxpbmcgc2V0V2lkdGgod2lkdGgpOyBzZXRIZWlnaHQoaGVpZ2h0KTtcblx0ICogQG1ldGhvZCBzZXRTaXplXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHRoZSB3aWR0aFxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB0aGUgaGVpZ2h0XG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuc2V0U2l6ZSA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMuc2V0V2lkdGgod2lkdGgpO1xuXHRcdGlmICggaGVpZ2h0ID09IHVuZGVmaW5lZCApICB7XG5cdFx0XHR0aGlzLnNldEhlaWdodCh3aWR0aCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0SGVpZ2h0KGhlaWdodCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuICAgIH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoaXMgb2JqZWN0XG5cdCAqIEBtZXRob2QgZ2V0U2l6ZVxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7d2lkdGg6IHRoaXMuZ2V0V2lkdGgoKSwgaGVpZ2h0OiB0aGlzLmdldEhlaWdodCgpfTtcbiAgICB9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgc2NhbGUgb2YgdGhpcyBvYmplY3QuIEJlaGF2ZXMgZXhhY3RseSBhcyBpZiBjYWxsaW5nIHNldFNjYWxlWCh4KTsgc2V0U2NhbGVZKHkpO1xuXHQgKiBAbWV0aG9kIHNldFNjYWxlXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHRoZSB3aWR0aCBmYWN0b3IsIGRlZmF1bHRzIHRvIDFcblx0ICogQHBhcmFtIHtmbG9hdH0gdGhlIGhlaWdodCBmYWN0b3IsIGRlZmF1bHRzIHRvIDFcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5zZXRTY2FsZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIGlmICgheCAmJiAheSkgcmV0dXJuO1xuICAgICAgICBpZiAoIXgpIHggPSAxO1xuICAgICAgICBpZiAoIXkpIHkgPSAxO1xuICAgICAgICB0aGlzLnNldFNjYWxlWCh4KTtcbiAgICAgICAgdGhpcy5zZXRTY2FsZVkoeSk7XG5cdFx0cmV0dXJuIHRoaXM7XG4gICAgfTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHNjYWxlIHdpZHRoIGZhY3RvclxuXHQgKiBAbWV0aG9kIHNldFNjYWxlWFxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB0aGUgd2lkdGggZmFjdG9yXG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuc2V0U2NhbGVYID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0aWYgKCAhdGhpcy5fc2NhbGUgKSB7XG5cdFx0XHR0aGlzLl9zY2FsZSA9IG5ldyBPYmplY3QoKTtcblx0XHRcdHRoaXMuX3NjYWxlLnkgPSAxO1xuXHRcdH1cblx0XHRpZiAoIHRoaXMuX3NjYWxlLnggIT0gdmFsdWUgKSB7XG5cdFx0XHR0aGlzLl9zY2FsZS54ID0gdmFsdWU7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJzY2FsZVhDaGFuZ2VkXCIsIHZhbHVlKTtcblx0XHRcdHRoaXMucmFpc2VFdmVudChcImF0dHJpYnV0ZUNoYW5nZWRcIiwgXCJzY2FsZVhcIik7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuICAgIH07XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBzY2FsZSBoZWlnaHQgZmFjdG9yXG5cdCAqIEBtZXRob2Qgc2V0U2NhbGVZXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHRoZSBoZWlnaHQgZmFjdG9yXG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuc2V0U2NhbGVZID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0aWYgKCAhdGhpcy5fc2NhbGUgKSB7XG5cdFx0XHR0aGlzLl9zY2FsZSA9IG5ldyBPYmplY3QoKTtcblx0XHRcdHRoaXMuX3NjYWxlLnggPSAxO1xuXHRcdH1cblx0XHRpZiAoIHRoaXMuX3NjYWxlLnkgIT0gdmFsdWUgKSB7XG5cdFx0XHR0aGlzLl9zY2FsZS55ID0gdmFsdWU7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJzY2FsZVlDaGFuZ2VkXCIsIHZhbHVlKTtcblx0XHRcdHRoaXMucmFpc2VFdmVudChcImF0dHJpYnV0ZUNoYW5nZWRcIiwgXCJzY2FsZVlcIik7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUub2Zmc2V0U2NhbGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgIFx0dGhpcy5vZmZzZXRTY2FsZVgoeCk7XG4gICAgXHR0aGlzLm9mZnNldFNjYWxlWSh5KTtcbiAgICBcdHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5vZmZzZXRTY2FsZVggPSBmdW5jdGlvbiAoeCkge1xuICAgIFx0cmV0dXJuIHRoaXMuc2V0U2NhbGVYKHRoaXMuZ2V0U2NhbGVYKCkgKyB4KTtcbiAgICB9O1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUub2Zmc2V0U2NhbGVZID0gZnVuY3Rpb24gKHkpIHtcbiAgICBcdHJldHVybiB0aGlzLnNldFNjYWxlWSh0aGlzLmdldFNjYWxlWSgpICsgeSk7XG4gICAgfTtcbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLmdldFNjYWxlWCA9IGZ1bmN0aW9uICgpIHtcblx0aWYgKCAhdGhpcy5fc2NhbGUgKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3NjYWxlLng7XG5cdH07XG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5nZXRTY2FsZVkgPSBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCAhdGhpcy5fc2NhbGUgKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3NjYWxlLnk7XG5cdH07XG5cdC8qKlxuXHQgKiBJbnZlcnRzIHRoZSBvYmplY3QgaW4gdGhlIHggYXhpc1xuXHQgKiBOb3RlOiBXb3JrcyBleGFjdGx5IGFzIGludmVydFhcblx0ICogQG1ldGhvZCBtaXJyb3Jcblx0ICovXG5cdFJlbmRlcml6YWJsZS5wcm90b3R5cGUubWlycm9yID0gZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuaW52ZXJ0WCgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXHQvKipcblx0ICogSW52ZXJ0cyB0aGUgb2JqZWN0IGluIHRoZSB4IGF4aXNcblx0ICogQG1ldGhvZCBpbnZlcnRYXG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuaW52ZXJ0WCA9IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoICF0aGlzLl9zY2FsZSApIHtcblx0XHRcdHRoaXMuX3NjYWxlID0gbmV3IE9iamVjdCgpO1xuXHRcdFx0dGhpcy5fc2NhbGUueCA9IC0xO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldFNjYWxlWCh0aGlzLl9zY2FsZS54ICogLTEpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcbiAgICB9O1xuXHQvKipcblx0ICogSW52ZXJ0cyB0aGUgb2JqZWN0IGluIHRoZSB5IGF4aXNcblx0ICogQG1ldGhvZCBpbnZlcnRZXG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuaW52ZXJ0WSA9IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoICF0aGlzLl9zY2FsZSApIHtcblx0XHRcdHRoaXMuX3NjYWxlID0gbmV3IE9iamVjdCgpO1xuXHRcdFx0dGhpcy5fc2NhbGUueSA9IC0xO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldFNjYWxlWSh0aGlzLl9zY2FsZS55ICogLTEpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcbiAgICB9O1xuXHQvKipcblx0ICogUmV0dXJucyB4IGNvb3JkaW5hdGUgcmVwcmVzZW50aW5nIHRoZSBsZWZ0bW9zdCBwYXJ0IG9mIHRoZSBPYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBnZXRMZWZ0XG5cdCAqIEByZXR1cm4ge2Zsb2F0fSB0aGUgY29vcmRpbmF0ZXMgdG8gbGVmdCBvZiB0aGUgb2JqZWN0XG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuZ2V0TGVmdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NjYWxlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5feCAtIHRoaXMuZ2V0Qm91bmRpbmdIYWxmV2lkdGgoKSAqIHRoaXMuX3NjYWxlLng7XG4gICAgICAgIH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5feCAtIHRoaXMuZ2V0Qm91bmRpbmdIYWxmV2lkdGgoKTtcbiAgICAgICAgfVxuICAgIH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHggY29vcmRpbmF0ZSByZXByZXNlbnRpbmcgdGhlIHJpZ2h0bW9zdCBwYXJ0IG9mIHRoZSBPYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBnZXRSaWdodFxuXHQgKiBAcmV0dXJuIHtmbG9hdH0gdGhlIGNvb3JkaW5hdGVzIHRvIHJpZ2h0IG9mIHRoZSBvYmplY3Rcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5nZXRSaWdodCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NjYWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5feCArIHRoaXMuZ2V0Qm91bmRpbmdIYWxmV2lkdGgoKSAqIHRoaXMuX3NjYWxlLng7XG4gICAgICAgIH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5feCArIHRoaXMuZ2V0Qm91bmRpbmdIYWxmV2lkdGgoKTtcbiAgICAgICAgfVxuICAgIH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHkgY29vcmRpbmF0ZSByZXByZXNlbnRpbmcgdGhlIHRvcG1vc3QgcGFydCBvZiB0aGUgT2JqZWN0XG5cdCAqXG5cdCAqIEBtZXRob2QgZ2V0VG9wXG5cdCAqIEByZXR1cm4ge2Zsb2F0fSB0aGUgY29vcmRpbmF0ZXMgdG8gdG9wIG9mIHRoZSBvYmplY3Rcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5nZXRUb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY2FsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3kgLSB0aGlzLmdldEJvdW5kaW5nSGFsZkhlaWdodCgpICogdGhpcy5fc2NhbGUueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgXHRyZXR1cm4gdGhpcy5feSAtIHRoaXMuZ2V0Qm91bmRpbmdIYWxmSGVpZ2h0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXHQvKipcblx0ICogUmV0dXJucyB5IGNvb3JkaW5hdGUgcmVwcmVzZW50aW5nIHRoZSBib3R0b21tb3N0IHBhcnQgb2YgdGhlIE9iamVjdFxuXHQgKlxuXHQgKiBAbWV0aG9kIGdldEJvdHRvbVxuXHQgKiBAcmV0dXJuIHtmbG9hdH0gdGhlIGNvb3JkaW5hdGVzIHRvIGJvdHRvbSBvZiB0aGUgb2JqZWN0XG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuZ2V0Qm90dG9tID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fc2NhbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl95ICsgdGhpcy5nZXRCb3VuZGluZ0hhbGZIZWlnaHQoKSAqIHRoaXMuX3NjYWxlLnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgIFx0cmV0dXJuIHRoaXMuX3kgKyB0aGlzLmdldEJvdW5kaW5nSGFsZkhlaWdodCgpO1xuICAgICAgICB9XG4gICAgfTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGxlZnRtb3N0IGNvb3JkaW5hdGVzIG9mIHRoZSBPYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBzZXRMZWZ0XG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHZhbHVlIHRoZSBjb29yZGluYXRlcyB0byBsZWZ0IG9mIHRoZSBvYmplY3Rcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5zZXRMZWZ0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY2FsZSkge1xuICAgICAgICBcdHRoaXMuc2V0WCh2YWx1ZSArIHRoaXMuZ2V0Qm91bmRpbmdIYWxmV2lkdGgoKSAqIHRoaXMuX3NjYWxlLngpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICBcdHRoaXMuc2V0WCh2YWx1ZSArIHRoaXMuZ2V0Qm91bmRpbmdIYWxmV2lkdGgoKSk7XG4gICAgICAgIH1cblx0XHRyZXR1cm4gdGhpcztcbiAgICB9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgcmlnaHRtb3N0IGNvb3JkaW5hdGVzIG9mIHRoZSBPYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBzZXRSaWdodFxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB2YWx1ZSB0aGUgY29vcmRpbmF0ZXMgdG8gcmlnaHQgb2YgdGhlIG9iamVjdFxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLnNldFJpZ2h0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY2FsZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRYKHZhbHVlIC0gdGhpcy5nZXRCb3VuZGluZ0hhbGZXaWR0aCgpICogdGhpcy5fc2NhbGUueCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFgodmFsdWUgLSB0aGlzLmdldEJvdW5kaW5nSGFsZldpZHRoKCkpO1xuICAgICAgICB9XG5cdFx0cmV0dXJuIHRoaXM7XG4gICAgfTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHRvcG1vc3QgY29vcmRpbmF0ZXMgb2YgdGhlIE9iamVjdFxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldFRvcFxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB2YWx1ZSB0aGUgY29vcmRpbmF0ZXMgdG8gdG9wIG9mIHRoZSBvYmplY3Rcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5zZXRUb3AgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NjYWxlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFkodGhpcy5feSA9IHZhbHVlICsgdGhpcy5nZXRCb3VuZGluZ0hhbGZIZWlnaHQoKSAqIHRoaXMuX3NjYWxlLnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRZKHRoaXMuX3kgPSB2YWx1ZSArIHRoaXMuZ2V0Qm91bmRpbmdIYWxmSGVpZ2h0KCkpO1xuICAgICAgICB9XG5cdFx0cmV0dXJuIHRoaXM7XG4gICAgfTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGJvdHRvbW1vc3QgY29vcmRpbmF0ZXMgb2YgdGhlIE9iamVjdFxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldEJvdHRvbVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB2YWx1ZSB0aGUgY29vcmRpbmF0ZXMgdG8gYm90dG9tIG9mIHRoZSBvYmplY3Rcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5zZXRCb3R0b20gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NjYWxlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFkodmFsdWUgLSB0aGlzLmdldEJvdW5kaW5nSGFsZkhlaWdodCgpICogdGhpcy5fc2NhbGUueSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFkodmFsdWUgLSB0aGlzLmdldEJvdW5kaW5nSGFsZkhlaWdodCgpKTtcbiAgICAgICAgfVxuXHRcdHJldHVybiB0aGlzO1xuICAgIH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSB4IGFuZCB5IGNvb3JkaW5hdGVzIG9mIHRoZSBvYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBnZXRMb2NhdGlvblxuXHQgKiBAcmV0dXJuIE9iamVjdFxuXHQgKiBAZXhhbXBsZVxuXHRcdFx0e3g6IDEwMCwgeTogNDAwfVxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLmdldExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHR4OiB0aGlzLl94LFxuXHRcdFx0eTogdGhpcy5feVxuXHRcdH07XG4gICAgfTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHggYW5kIHkgY29vcmRpbmF0ZXMgb2YgdGhlIG9iamVjdFxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldExvY2F0aW9uXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHggdGhlIHggY29vcmRpbmF0ZVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB5IHRoZSB5IGNvb3JkaW5hdGVcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5zZXRMb2NhdGlvbiA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgXHR0aGlzLnNldFgoeCk7XG4gICAgXHR0aGlzLnNldFkoeSk7XG5cdFx0cmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKipcblx0ICogT2Zmc2V0cyB0aGUgYWxwaGEgdmFsdWVcblx0ICpcblx0ICogQG1ldGhvZCBvZmZzZXRBbHBoYVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSBvZmZzZXRcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5vZmZzZXRBbHBoYSA9IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgICAgICB0aGlzLnNldEFscGhhKHRoaXMuX2FscGhhICsgb2Zmc2V0KTtcblx0XHRyZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qKlxuXHQgKiBPZmZzZXRzIHRoZSByb3RhdGlvblxuXHQgKlxuXHQgKiBAbWV0aG9kIG9mZnNldFJvdGF0aW9uXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IG9mZnNldFxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLm9mZnNldFJvdGF0aW9uID0gZnVuY3Rpb24ob2Zmc2V0LCBwaXZvdFgsIHBpdm90WSkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5zZXRSb3RhdGlvbih0aGlzLl9yb3RhdGlvbiArIG9mZnNldCk7XG5cblx0XHRpZiAoIHBpdm90WCAhPSB1bmRlZmluZWQgfHwgcGl2b3RZICE9IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dmFyIHggPSB0aGlzLl94IC0gcGl2b3RYLFxuXHRcdFx0XHR5ID0gdGhpcy5feSAtIHBpdm90WSxcdFx0XHRcdFxuXHRcdFx0XHRyb3RhdGVkWCxcblx0XHRcdFx0cm90YXRlZFk7XG5cdFx0XHRcdFxuXHRcdFx0aWYgKCB4ICE9IDAgfHwgeSAhPSAwICkge1xuXHRcdFx0XHRyb3RhdGVkWCA9IE0ubWF0aDJkLmdldFJvdGF0ZWRWZXJ0ZXhDb29yZHNYKHgsIHksIG9mZnNldCksXG5cdFx0XHRcdHJvdGF0ZWRZID0gTS5tYXRoMmQuZ2V0Um90YXRlZFZlcnRleENvb3Jkc1koeCwgeSwgb2Zmc2V0KTtcblx0XHRcdFx0dGhpcy5zZXRMb2NhdGlvbihyb3RhdGVkWCArIHBpdm90WCwgcm90YXRlZFkgKyBwaXZvdFkpO1xuXHRcdFx0fVxuXG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuICAgIH07XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSByb3RhdGlvbiBhbmdsZSBvZiB0aGlzIG9iamVjdFxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldFJvdGF0aW9uXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHJvdGF0aW9uIHRoZSByb3RhdGlvbiBhbmdsZVxuXHQgKi9cblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5zZXRSb3RhdGlvbiA9IGZ1bmN0aW9uIChyb3RhdGlvbikge1xuXHRcdFxuXHRcdGlmICggcm90YXRpb24gIT0gdGhpcy5fcm90YXRpb24gKSB7XG5cdFx0XG5cdFx0XHR0aGlzLl9yb3RhdGlvbiA9IHJvdGF0aW9uO1xuXG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJyb3RhdGlvbkNoYW5nZWRcIiwgcm90YXRpb24pO1xuXHRcdFx0dGhpcy5yYWlzZUV2ZW50KFwiYXR0cmlidXRlQ2hhbmdlZFwiLCBcInJvdGF0aW9uXCIpO1xuXHRcdFxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSByb3RhdGlvbiBhbmdsZSBvZiB0aGlzIG9iamVjdFxuXHQgKlxuXHQgKiBAbWV0aG9kIGdldFJvdGF0aW9uXG5cdCAqIEByZXR1cm4ge2Zsb2F0fVxuXHQgKi9cblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5nZXRSb3RhdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fcm90YXRpb247XG5cdH07XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSB4IGNvb3JkaW5hdGUgb2YgdGhpcyBvYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBzZXRYXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHggdGhlIHJvdGF0aW9uIGFuZ2xlXG5cdCAqL1xuXHRSZW5kZXJpemFibGUucHJvdG90eXBlLnNldFggPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHQvL3ZhbHVlID0gfn4odmFsdWUrMC41KTtcblx0XHRpZiAoIHZhbHVlICE9IHRoaXMuX3ggKSB7XG5cdFx0XHR0aGlzLl9wcmV2WCA9IHRoaXMuX3g7XG5cdFx0XHR0aGlzLl94ID0gdmFsdWU7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJ4Q2hhbmdlZFwiLCB2YWx1ZSk7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJhdHRyaWJ1dGVDaGFuZ2VkXCIsIFwieFwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSB5IGNvb3JkaW5hdGUgb2YgdGhpcyBvYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBzZXRZXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHkgdGhlIHJvdGF0aW9uIGFuZ2xlXG5cdCAqL1xuXHRSZW5kZXJpemFibGUucHJvdG90eXBlLnNldFkgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHQvL3ZhbHVlID0gfn4odmFsdWUrMC41KTtcblx0XHRpZiAoIHZhbHVlICE9IHRoaXMuX3kgKSB7XG5cdFx0XHR0aGlzLl9wcmV2WSA9IHRoaXMuX3k7XG5cdFx0XHR0aGlzLl95ID0gdmFsdWU7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJ5Q2hhbmdlZFwiLCB2YWx1ZSk7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJhdHRyaWJ1dGVDaGFuZ2VkXCIsIFwieVwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG4gICAgfTtcblx0UmVuZGVyaXphYmxlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5vd25lckxheWVyLnJlbW92ZSh0aGlzKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblx0LyoqXG5cdCAqIEFkZHMgdGhlIGdpdmVuIHggYW5kIHkgY29vcmRpbmF0ZXMgdG8gdGhvc2Ugb2YgdGhlIG9iamVjdFxuXHQgKlxuXHQgKiBAbWV0aG9kIG9mZnNldFxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB4IHRoZSB4IGNvb3JkaW5hdGUgdG8gYWRkXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHkgdGhlIHkgY29vcmRpbmF0ZSB0byBhZGRcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5vZmZzZXQgPSBmdW5jdGlvbiAoeCwgeSkge1xuXG4gICBcdFx0dGhpcy5vZmZzZXRYKHgpO1xuICAgIFx0dGhpcy5vZmZzZXRZKHkpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cbiAgICB9O1xuXHQvKipcblx0ICogQWRkcyB0aGUgZ2l2ZW4geCBjb29yZGluYXRlIHRvIHRoYXQgb2YgdGhlIG9iamVjdFxuXHQgKlxuXHQgKiBAbWV0aG9kIG9mZnNldFhcblx0ICogQHBhcmFtIHtmbG9hdH0geCB0aGUgeCBjb29yZGluYXRlIHRvIGFkZFxuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLm9mZnNldFggPSBmdW5jdGlvbiAoeCkge1xuICAgIFx0aWYgKCB4ICE9IDAgKSB7XG4gICAgXHRcdHRoaXMuc2V0WCh0aGlzLl94ICsgeCk7XG4gICAgXHR9XG5cdFx0cmV0dXJuIHRoaXM7XG4gICAgfTtcblx0LyoqXG5cdCAqIEFkZHMgdGhlIGdpdmVuIHkgY29vcmRpbmF0ZXMgdG8gdGhhdCBvZiB0aGUgb2JqZWN0XG5cdCAqXG5cdCAqIEBtZXRob2Qgb2Zmc2V0WVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB5IHRoZSB5IGNvb3JkaW5hdGUgdG8gYWRkXG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUub2Zmc2V0WSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgXHRpZiAoIHkgIT0gMCApIHtcbiAgICBcdFx0dGhpcy5zZXRZKHRoaXMuX3kgKyB5KTtcbiAgICBcdH1cblx0XHRyZXR1cm4gdGhpcztcbiAgICB9O1xuXHQvKipcblx0ICogQ2VudGVycyB0aGUgb2JqZWN0IGF0IHRoZSBnaXZlbiB2ZWN0b3IyZCBvYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBjZW50ZXJBdFxuXHQgKiBAcGFyYW0ge1ZlY3RvcjJkfSB2ZWN0b3IyZCBvYmplY3QgY29udGFpbmluZyB4IGFuZCB5IGF0dHJpYnV0ZXNcblx0ICovXG5cdFJlbmRlcml6YWJsZS5wcm90b3R5cGUuY2VudGVyQXQgPSBmdW5jdGlvbiAodmVjdG9yMmQpIHtcblx0XHR0aGlzLnNldExvY2F0aW9uKHZlY3RvcjJkLngsIHZlY3RvcjJkLnkpO1xuXHRcdHJldHVybiB0aGlzO1xuICAgIH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB4IGNvb3JkaW5hdGUgb2YgdGhpcyBvYmplY3QgdGhhdCBiZWxvbmdzIHRvIGl0J3MgY2VudGVyXG5cdCAqXG5cdCAqIEBtZXRob2QgZ2V0WFxuXHQgKiBAcmV0dXJuIHtmbG9hdH1cblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5nZXRYID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5feDtcbiAgICB9O1xuXHQvKipcblx0ICogUmV0dXJucyB0aGUgeSBjb29yZGluYXRlIG9mIHRoaXMgb2JqZWN0IHRoYXQgYmVsb25ncyB0byBpdCdzIGNlbnRlclxuXHQgKlxuXHQgKiBAbWV0aG9kIGdldFlcblx0ICogQHJldHVybiB7ZmxvYXR9XG5cdCAqL1xuXHQgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5nZXRZID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5feTtcbiAgICB9O1xuXHQvKipcblx0ICogUmV0dXJucyB0aGUgcHJldmlvdXMgeCBjb29yZGluYXRlXG5cdCAqXG5cdCAqIEBtZXRob2QgZ2V0UHJldlhcblx0ICogQHJldHVybiB7ZmxvYXR9XG5cdCAqL1xuICAgIFJlbmRlcml6YWJsZS5wcm90b3R5cGUuZ2V0UHJldlggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcmV2WDtcbiAgICB9O1xuXHQvKipcblx0ICogUmV0dXJucyB0aGUgcHJldmlvdXMgeSBjb29yZGluYXRlXG5cdCAqXG5cdCAqIEBtZXRob2QgZ2V0UHJldllcblx0ICogQHJldHVybiB7ZmxvYXR9XG5cdCAqL1xuXHQgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5nZXRQcmV2WSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ByZXZZO1xuICAgIH07XG4gICAgLyoqXG5cdCAqIFJldHVybnMgdGhlIGJpZ2dlc3QgbnVtYmVyIGJldHdlZW4gd2lkdGggYW5kIGhlaWdodFxuXHQgKlxuXHQgKiBAbWV0aG9kIGdldE1heFNpemVcblx0ICovXG4gICAgUmVuZGVyaXphYmxlLnByb3RvdHlwZS5nZXRNYXhTaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCh0aGlzLmdldFdpZHRoKCksIHRoaXMuZ2V0SGVpZ2h0KCkpO1xuICAgIH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjb25zdHJ1Y3RvcidzIG5hbWVcblx0ICpcblx0ICogQG1ldGhvZCB0b1N0cmluZ1xuXHQgKi9cbiAgICBSZW5kZXJpemFibGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZTtcbiAgICB9O1xuXG4gICAgUmVuZGVyaXphYmxlLm5hbWUgPSBcIlJlbmRlcml6YWJsZVwiO1xuXG4gICAgTS5leHRlbmQoUmVuZGVyaXphYmxlLCBNLkdhbWVPYmplY3QpO1xuICAgIE0uZXh0ZW5kKFJlbmRlcml6YWJsZSwgRXZlbnRIYW5kbGVyKTtcblxuXHRNLnJlbmRlcml6YWJsZXMuUmVuZGVyaXphYmxlID0gUmVuZGVyaXphYmxlO1xuXG59KShNYXRjaCwgTWF0Y2guZWZmZWN0cy52aXN1YWwpOyIsIi8qKlxuICogQG1vZHVsZSBNYXRjaFxuICogQG5hbWVzcGFjZSByZW5kZXJlcnNcbiAqL1xuKGZ1bmN0aW9uKG5hbWVzcGFjZSwgTSwgUmVuZGVyaXphYmxlKSB7XG5cblx0ZnVuY3Rpb24gU2hhcGUocHJvcGVydGllcykge1xuXHRcdHRoaXMuZXh0ZW5kc1JlbmRlcml6YWJsZShwcm9wZXJ0aWVzKTtcblx0XHRcdFx0LyoqXG5cdFx0ICogRmlsbCBTdHlsZSB1c2VkIHRvIGZpbGwgdGhlIHNoYXBlLiBDYW4gYmUgYSBjb2xvciwgYSBwYXR0ZXJuIG9yIGEgZ3JhZGllbnRcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfZmlsbFN0eWxlXG5cdFx0ICogQGRlZmF1bHQgXCJibGFja1wiXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fZmlsbFN0eWxlID0gXCJibGFja1wiO1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdHRoaXMuX2ZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMCwwLDEwMClcIjtcblx0XHQgKi9cblx0XHR0aGlzLl9maWxsU3R5bGUgPSBcInJnYigwLDAsMClcIjtcblx0XHQvKipcblx0XHQgKiBTdHJva2UgU3R5bGVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfc3Ryb2tlU3R5bGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHR0aGlzLl9zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHR0aGlzLl9zdHJva2VTdHlsZSA9IFwicmdiYSgyNTUsMCwwLDEwMClcIjtcblx0XHQgKi9cblx0XHR0aGlzLl9zdHJva2VTdHlsZSA9IG51bGw7XG5cdFx0LyoqXG5cdFx0ICogTGluZSB3aWR0aCB1c2VkIHRvIHJlbmRlciB0aGUgYm9yZGVycyBvZiB0aGUgc2hhcGVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfbGluZVdpZHRoXG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fc3Ryb2tlU3R5bGUgPSBcImJsYWNrXCI7XG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fc3Ryb2tlU3R5bGUgPSBcInJnYmEoMjU1LDAsMCwxMDApXCI7XG5cdFx0ICovXG5cdFx0dGhpcy5fbGluZVdpZHRoID0gMTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBzdHlsZSB1c2VkIHRvIHN0cm9rZSB0aGUgc2hhcGVcblx0ICpcblx0ICogQG1ldGhvZCBzZXRTdHJva2VTdHlsZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gdmFsdWUgdGhlIHN0cm9rZVN0eWxlXG5cdCAqIEBleGFtcGxlXG5cdFx0XHR0aGlzLnNldFN0cm9rZVN0eWxlKFwicmdiKCcyNTUsMCwwJylcIik7XG5cdCAqIEBleGFtcGxlXG5cdFx0XHR0aGlzLnNldFN0cm9rZVN0eWxlKFwiUmVkXCIpO1xuXHQgKi9cblx0U2hhcGUucHJvdG90eXBlLnNldFN0cm9rZVN0eWxlID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRpZiAoIHRoaXMuX3N0cm9rZVN0eWxlICE9IHZhbHVlICkge1xuXHRcdFx0dGhpcy5fc3Ryb2tlU3R5bGUgPSB2YWx1ZTtcblx0XHRcdHRoaXMucmFpc2VFdmVudChcImF0dHJpYnV0ZUNoYW5nZWRcIiwgXCJzdHJva2VTdHlsZVwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzdHlsZSB1c2VkIHRvIHN0cm9rZSB0aGUgc2hhcGVcblx0ICpcblx0ICogQG1ldGhvZCBnZXRTdHJva2VTdHlsZVxuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dGhpcy5nZXRTdHJva2VTdHlsZSgpO1xuXHQgKi9cblx0U2hhcGUucHJvdG90eXBlLmdldFN0cm9rZVN0eWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0cm9rZVN0eWxlO1xuXHR9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgc3R5bGUgdXNlZCB0byBmaWxsIHRoZSBzaGFwZVxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldEZpbGxTdHlsZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gdmFsdWUgdGhlIGZpbGxTdHlsZVxuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dGhpcy5zZXRGaWxsU3R5bGUoXCJyZ2IoJzI1NSwwLDAnKVwiKTtcblx0ICogQGV4YW1wbGVcblx0XHRcdHRoaXMuc2V0RmlsbFN0eWxlKFwiUmVkXCIpO1xuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dGhpcy5zZXRGaWxsU3R5bGUoYVBhdHRlcm4pO1xuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dGhpcy5zZXRGaWxsU3R5bGUoYUdyYWRpZW50KTtcblx0ICovXG5cdFNoYXBlLnByb3RvdHlwZS5zZXRGaWxsU3R5bGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmICggdGhpcy5fZmlsbFN0eWxlICE9IHZhbHVlICkge1xuXHRcdFx0dGhpcy5fZmlsbFN0eWxlID0gdmFsdWU7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJhdHRyaWJ1dGVDaGFuZ2VkXCIsIFwiZmlsbFN0eWxlXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIGZpbGwgc3R5bGVcblx0ICogQG1ldGhvZCBnZXRGaWxsU3R5bGVcblx0ICogQHJldHVybiB7U3RyaW5nfSB0aGUgZmlsbFN0eWxlXG5cdCAqL1xuXHRTaGFwZS5wcm90b3R5cGUuZ2V0RmlsbFN0eWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2ZpbGxTdHlsZTtcblx0fTtcdFxuXHQvKipcblx0ICogU2V0cyB0aGUgc3R5bGUgdXNlZCB0byBmaWxsIHRoZSBzaGFwZVxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldEZpbGxcblx0ICogQHBhcmFtIHtPYmplY3R9IHZhbHVlIHRoZSBmaWxsU3R5bGVcblx0ICovXG5cdFNoYXBlLnByb3RvdHlwZS5zZXRGaWxsID0gU2hhcGUucHJvdG90eXBlLnNldEZpbGxTdHlsZTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIGZpbGwgc3R5bGVcblx0ICogQG1ldGhvZCBnZXRGaWxsXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gdGhlIGZpbGxTdHlsZVxuXHQgKi9cblx0U2hhcGUucHJvdG90eXBlLmdldEZpbGwgPSBTaGFwZS5wcm90b3R5cGUuc2V0RmlsbFN0eWxlO1xuXHQvKipcblx0ICogU2V0cyB0aGUgc3R5bGUgdXNlZCB0byBmaWxsIHRoZSBzaGFwZVxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldENvbG9yXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSB0aGUgZmlsbFN0eWxlXG5cdCAqL1xuXHRTaGFwZS5wcm90b3R5cGUuc2V0Q29sb3IgPSBTaGFwZS5wcm90b3R5cGUuc2V0RmlsbFN0eWxlO1xuXHQvKipcblx0ICogR2V0cyB0aGUgZmlsbCBzdHlsZVxuXHQgKiBAbWV0aG9kIGdldENvbG9yXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gdGhlIGZpbGxTdHlsZVxuXHQgKi9cblx0U2hhcGUucHJvdG90eXBlLmdldENvbG9yID0gU2hhcGUucHJvdG90eXBlLmdldEZpbGxTdHlsZTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIHN0cm9rZSBzdHlsZVxuXHQgKiBAbWV0aG9kIGdldFN0cm9rZVN0eWxlXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gdGhlIHN0cm9rZVN0eWxlXG5cdCAqL1xuXHRTaGFwZS5wcm90b3R5cGUuZ2V0U3Ryb2tlV2lkdGggPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fbGluZVdpZHRoO1xuXHR9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgYm9yZGVyIGNvbG9yIG9mIHRoZSBzaGFwZVxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldEJvcmRlclxuXHQgKiBAcGFyYW0ge09iamVjdH0gdmFsdWUgdGhlIGNvbG9yIG9mIHRoZSBib3JkZXJcblx0ICogQGV4YW1wbGVcblx0XHRcdHRoaXMuc2V0Qm9yZGVyKFwicmdiKCcyNTUsMCwwJylcIik7XG5cdCAqIEBleGFtcGxlXG5cdFx0XHR0aGlzLnNldEJvcmRlcihcIlJlZFwiKTtcblx0ICovXG5cdFNoYXBlLnByb3RvdHlwZS5zZXRCb3JkZXIgPSBTaGFwZS5wcm90b3R5cGUuc2V0U3Ryb2tlU3R5bGU7XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBsaW5lIHdpZHRoIHVzZWQgdG8gc3Ryb2tlIHRoZSBzaGFwZVxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldFN0cm9rZVdpZHRoXG5cdCAqIEBwYXJhbSB7aW50fSB2YWx1ZSB0aGUgc3Ryb2tlU3R5bGVcblx0ICogQGV4YW1wbGVcblx0XHRcdHRoaXMuc2V0U3Ryb2tlV2lkdGgoNSk7XG5cdCAqL1xuXHRTaGFwZS5wcm90b3R5cGUuc2V0U3Ryb2tlV2lkdGggPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmICggdGhpcy5fbGluZVdpZHRoICE9IHZhbHVlICkge1xuXHRcdFx0dGhpcy5fbGluZVdpZHRoID0gdmFsdWU7XG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJzdHJva2VXaWR0aENoYW5nZWRcIiwgdmFsdWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGxpbmUgd2lkdGggdXNlZCB0byBzdHJva2UgdGhlIHNoYXBlXG5cdCAqXG5cdCAqIEBtZXRob2Qgc2V0Qm9yZGVyV2lkdGhcblx0ICogQHBhcmFtIHtpbnR9IHZhbHVlIHRoZSBzdHJva2VTdHlsZVxuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dGhpcy5zZXRTdHJva2VXaWR0aCg1KTtcblx0ICovXG5cdFNoYXBlLnByb3RvdHlwZS5zZXRCb3JkZXJXaWR0aCA9IFNoYXBlLnByb3RvdHlwZS5zZXRTdHJva2VXaWR0aDtcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHN0eWxlIHVzZWQgdG8gc3Ryb2tlIHRoZSBzaGFwZVxuXHQgKlxuXHQgKiBAbWV0aG9kIGdldEJvcmRlclxuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dGhpcy5nZXRTdHJva2VTdHlsZSgpO1xuXHQgKi9cblx0U2hhcGUucHJvdG90eXBlLmdldEJvcmRlciA9IFNoYXBlLnByb3RvdHlwZS5nZXRTdHJva2VTdHlsZTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIHN0cm9rZSB3aWR0aFxuXHQgKiBAbWV0aG9kIGdldFN0cm9rZVdpZHRoXG5cdCAqIEByZXR1cm4ge2ludH0gdGhlIHN0cm9rZVdpZHRoXG5cdCAqL1xuXHRTaGFwZS5wcm90b3R5cGUuZ2V0U3Ryb2tlV2lkdGggPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fbGluZVdpZHRoO1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgc3Ryb2tlIHdpZHRoXG5cdCAqIEBtZXRob2QgZ2V0Qm9yZGVyV2lkdGhcblx0ICogQHJldHVybiB7aW50fSB0aGUgc3Ryb2tlV2lkdGhcblx0ICovXG5cdFNoYXBlLnByb3RvdHlwZS5nZXRCb3JkZXJXaWR0aCA9IFNoYXBlLnByb3RvdHlwZS5nZXRTdHJva2VXaWR0aDtcblx0XHQvKipcblx0ICogU2V0cyB0aGUgc2hhZG93IHN0eWxlIGZvciB0aGlzIHNoYXBlXG5cdCAqXG5cdCAqIEBtZXRob2Qgc2V0U2hhZG93XG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHggZGlzcGxhY2VudCBpbiB4XG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHkgZGlzcGxhY2VudCBpbiB5XG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvclxuXHQgKiBAcGFyYW0ge2ludH0gYmx1clxuXHQgKi9cblx0U2hhcGUucHJvdG90eXBlLnNldFNoYWRvdyA9IGZ1bmN0aW9uKHgsIHksIGNvbG9yLCBibHVyKSB7XG5cdFx0dGhpcy5fc2hhZG93ID0ge1xuXHRcdFx0eDogeCwgeTogeSwgY29sb3I6IGNvbG9yIHx8IFwiIzAwMDAwMFwiLCBibHVyOiBibHVyIHx8IDFcblx0XHR9XG5cdFx0dGhpcy5yYWlzZUV2ZW50KFwic2hhZG93Q2hhbmdlZFwiLCB0aGlzLl9zaGFkb3cpO1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgc2hhZG93XG5cdCAqIEBtZXRob2QgZ2V0U2hhZG93XG5cdCAqIEByZXR1cm4ge09iamVjdH0gdGhlIHNoYWRvd1xuXHQgKi9cblx0U2hhcGUucHJvdG90eXBlLmdldFNoYWRvdyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9zaGFkb3c7XG5cdH07XG5cblx0U2hhcGUucHJvdG90eXBlLnNldEJsdXIgPSBmdW5jdGlvbih2YWx1ZSwgY29sb3IpIHtcblx0XHR0aGlzLnNldFNoYWRvdygwLCAwLCBjb2xvciB8fCB0aGlzLl9maWxsU3R5bGUsIHZhbHVlKVxuXHR9O1xuXG5cdFNoYXBlLnByb3RvdHlwZS5nZXRCbHVyID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3NoYWRvdy5ibHVyO1xuXHR9O1xuXG5cdFNoYXBlLm5hbWUgPSBcIlNoYXBlXCI7XG5cdFxuXHRNLmV4dGVuZChTaGFwZSwgUmVuZGVyaXphYmxlKTtcblx0XG5cdG5hbWVzcGFjZS5TaGFwZSA9IFNoYXBlO1xuXHRcbn0pKE1hdGNoLnJlbmRlcml6YWJsZXMsIE1hdGNoLCBNYXRjaC5yZW5kZXJpemFibGVzLlJlbmRlcml6YWJsZSk7IiwiLyoqXG4gKiBAbW9kdWxlIE1hdGNoXG4gKiBAbmFtZXNwYWNlIHJlbmRlcmVyc1xuICovXG4oZnVuY3Rpb24obmFtZXNwYWNlLCBNLCBSZW5kZXJpemFibGUsIHNwcml0ZUFzc2V0cykge1xuXG5cdC8qKlxuXHQgKiBDb250YWlucyBhbiBhcnJheSBvZiBpbWFnZXMgdGhhdCBjYW4gYmUgcmVuZGVyZWQgdG8gcGxheSBhbiBhbmltYXRpb25cblx0ICpcblx0ICogQGNsYXNzIFNwcml0ZVxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQGV4dGVuZHMgcmVuZGVyZXJzLlJlbmRlcml6YWJsZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW1nIHRoZSBrZXkgb2YgdGhlIGltYWdlIGxvYWRlZCBieSBNLnNwcml0ZXNcblx0ICogQHBhcmFtIHtmbG9hdH0geCB0aGUgeCBjb29yZGluYXRlXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHkgdGhlIHkgY29vcmRpbmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gU3ByaXRlKGltZywgeCwgeSkge1xuXG5cdFx0dGhpcy5leHRlbmRzUmVuZGVyaXphYmxlKCk7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogVGhlIGltYWdlIHRvIHJlbmRlclxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHByb3BlcnR5IF9pbWFnZVxuXHRcdCAqIEB0eXBlIEhUTUxJbWFnZUVsZW1lbnRcblx0XHQgKi9cblx0XHQvKipcblx0XHQgKiBUaGUgY3VycmVudCBmcmFtZSBvZiB0aGUgc3ByaXRlc2hlZXRcblx0XHQgKiBAcHJvcGVydHkgY3VycmVudEZyYW1lXG5cdFx0ICogQHByb3RlY3RlZFxuXHRcdCAqIEB0eXBlIE9iamVjdFxuXHRcdCAqL1xuXHRcdCAvKipcblx0XHQgKiBUaGUgbmFtZSBvZiB0aGUgYW5pbWF0aW9uIHRvIHBsYXlcblx0XHQgKiBAcHJvcGVydHkgYW5pbWF0aW9uTmFtZVxuXHRcdCAqIEBwcm90ZWN0ZWQgXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0IHRoaXMuYW5pbWF0aW9uTmFtZSA9IG51bGw7XG5cdFx0LyoqXG5cdFx0ICogVGhlIGFuaW1hdGlvbiB0byBwbGF5XG5cdFx0ICogQHByb3BlcnR5IF9hbmltYXRpb25cblx0XHQgKiBAcHJvdGVjdGVkXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0IHRoaXMuX2FuaW1hdGlvbiA9IG51bGw7XG5cdFx0IC8qKlxuXHRcdCAqIFRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBmcmFtZVxuXHRcdCAqIEBwcm9wZXJ0eSBfZnJhbWVJbmRleFxuXHRcdCAqIEBwcm90ZWN0ZWRcblx0XHQgKiBAdHlwZSBpbnRcblx0XHQgKi9cblx0XHQgdGhpcy5fZnJhbWVJbmRleCA9IDA7XG5cdFx0IC8qKlxuXHRcdCAqIEluZGljYXRlcyBpZiB0aGUgYW5pbWF0aW9uIGlmIHBsYXlpbmdcblx0XHQgKiBAcHJvcGVydHkgaXNQbGF5aW5nXG5cdFx0ICogQHR5cGUgQm9vbGVhblxuXHRcdCAqL1xuXHRcdCB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuXHRcdCAvKipcblx0XHQgKiBUaW1lIGluIG1pbGxpc2Vjb25kcyB3aGVuIHRoZSBjdXJyZW50IGZyYW1lIHN0YXJ0ZWQgcGxheWluZ1xuXHRcdCAqIEBwcm9wZXJ0eSBjdXJyZW50RnJhbWVTdGFydEluTWlsbGlzXG5cdFx0ICogQHByb3RlY3RlZFxuXHRcdCAqIEB0eXBlIGludFxuXHRcdCAqL1xuXHRcdFxuXHRcdGlmICggaW1nICkgdGhpcy5zZXRJbWFnZShpbWcpO1xuXHRcdFxuXHRcdHRoaXMuc2V0TG9jYXRpb24oeCB8fCAwLCB5IHx8IDApO1xuXHRcdFxuXHRcdHRoaXMuVFlQRSA9IE0ucmVuZGVyaXphYmxlcy5UWVBFUy5TUFJJVEU7XG5cdFx0XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgaW1hZ2Ugb2YgdGhpcyBTcHJpdGVcblx0ICogXG5cdCAqIEBtZXRob2Qgc2V0SW1hZ2Vcblx0ICogQHBhcmFtIHtTdHJpbmd9IGltZyB0aGUga2V5IG9mIHRoZSBpbWFnZSBsb2FkZWQgYnkgTS5zcHJpdGVzXG5cdCAqIEBwYXJhbSB7aW50fSBmcmFtZUluZGV4IHRoZSBzdGFydGluZyBmcmFtZSBpbmRleFxuXHQgKi9cblx0U3ByaXRlLnByb3RvdHlwZS5zZXRJbWFnZSA9IGZ1bmN0aW9uKCBpbWcsIGZyYW1lSW5kZXggKSB7XG5cblx0XHRpZiAoICFpbWcgKSB0aHJvdyBuZXcgRXJyb3IoXCJJbWFnZSBjYW5ub3QgYmUgbnVsbFwiKTtcblxuXHRcdGlmICggaW1nIGluc3RhbmNlb2YgSW1hZ2UgKSB7XG5cdFx0XHRpZiAoICFpbWcuZnJhbWVzICkge1xuXHRcdFx0XHRpbWcuZnJhbWVzID0gW3t4OjAsIHk6IDAsIHdpZHRoOiBpbWcud2lkdGgsIGhlaWdodDogaW1nLmhlaWdodCwgaGFsZldpZHRoOiBpbWcud2lkdGggLyAyLCBoYWxmSGVpZ2h0OiBpbWcuaGVpZ2h0IC8gMn1dO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5faW1hZ2UgPSBpbWc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBzcHJ0ID0gc3ByaXRlQXNzZXRzWyBpbWcgXTtcblx0XHRcdGlmICggc3BydCApIHtcblx0XHRcdFx0dGhpcy5faW1hZ2UgPSBzcHJ0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW1hZ2UgYnkgaWQgXCIgKyBpbWcgKyBcIiBub3QgbG9hZGVkXCIpO1xuXHRcdFx0fVxuXHRcdH1cblxuICAgICAgICB0aGlzLnNldEZyYW1lSW5kZXgoZnJhbWVJbmRleCk7XG5cdFx0dGhpcy5hbmltYXRpb25OYW1lID0gbnVsbDtcblx0XHR0aGlzLl9hbmltYXRpb24gPSBudWxsO1xuXHRcdHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXHRTcHJpdGUucHJvdG90eXBlLmdldEltYWdlID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2ltYWdlO1xuXHR9O1xuXHRTcHJpdGUucHJvdG90eXBlLnNldEZpbGxTdHlsZSA9IFNwcml0ZS5wcm90b3R5cGUuc2V0SW1hZ2U7XG5cdFNwcml0ZS5wcm90b3R5cGUuZ2V0RmlsbFN0eWxlID0gU3ByaXRlLnByb3RvdHlwZS5nZXRJbWFnZTtcblx0U3ByaXRlLnByb3RvdHlwZS5zZXRGaWxsID0gU3ByaXRlLnByb3RvdHlwZS5zZXRJbWFnZTtcblx0U3ByaXRlLnByb3RvdHlwZS5nZXRGaWxsID0gU3ByaXRlLnByb3RvdHlwZS5nZXRJbWFnZTtcblx0U3ByaXRlLnByb3RvdHlwZS5zZXRTcHJpdGUgPSBTcHJpdGUucHJvdG90eXBlLnNldEltYWdlO1xuXHRTcHJpdGUucHJvdG90eXBlLmdldFNwcml0ZSA9IFNwcml0ZS5wcm90b3R5cGUuZ2V0SW1hZ2U7XG5cdC8qKlxuXHQgKiBTdGFydHMgcGxheWluZyB0aGUgYW5pbWF0aW9uXG5cdCAqIFxuXHQgKiBAbWV0aG9kIHBsYXlcblx0ICogQHBhcmFtIHtTdHJpbmd9IGFuaW1hdGlvbk5hbWUgdGhlIGtleSBvZiB0aGUgYW5pbWF0aW9uIHRvIHBsYXlcblx0ICogQHBhcmFtIHtCb29sZWFufSBbbG9vcF0gaWYgdHJ1ZSB0aGUgYW5pbWF0aW9uIHdpbGwgbG9vcFxuXHQgKi9cblx0U3ByaXRlLnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24oIGFuaW1hdGlvbk5hbWUsIGxvb3AgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2FuaW1hdGlvbiAmJiB0aGlzLmFuaW1hdGlvbk5hbWUgPT0gYW5pbWF0aW9uTmFtZSAmJiB0aGlzLmlzUGxheWluZyApIHJldHVybjtcblxuXHRcdGlmICggIWFuaW1hdGlvbk5hbWUgJiYgdGhpcy5fYW5pbWF0aW9uICkge1xuXG5cdFx0XHR0aGlzLmlzUGxheWluZyA9IHRydWU7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZiAoICF0aGlzLl9pbWFnZSApIHRocm93IG5ldyBFcnJvcihcIk5vIGltYWdlIHNlbGVjdGVkXCIpO1xuXG5cdFx0XHRpZiAoICF0aGlzLl9pbWFnZS5hbmltYXRpb25zICkgdGhyb3cgbmV3IEVycm9yKFwiSW1hZ2UgaGFzIG5vIGFuaW1hdGlvbnNcIik7XG5cblx0XHRcdGlmICggIXRoaXMuX2ltYWdlLmFuaW1hdGlvbnNbYW5pbWF0aW9uTmFtZV0gKSB0aHJvdyBuZXcgRXJyb3IoXCJJbWFnZSBoYXMgbm8gYW5pbWF0aW9uIGJ5IG5hbWUgXCIgKyBhbmltYXRpb25OYW1lKTtcblxuXHRcdFx0dGhpcy5fYW5pbWF0aW9uID0gdGhpcy5faW1hZ2UuYW5pbWF0aW9uc1thbmltYXRpb25OYW1lXTtcblxuXHRcdFx0dGhpcy5hbmltYXRpb25OYW1lID0gYW5pbWF0aW9uTmFtZTtcblxuXHRcdFx0dGhpcy5fZnJhbWVJbmRleCA9IDA7XG5cblx0XHRcdHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcblxuXHRcdH1cblxuXHRcdHRoaXMubG9vcCA9IGxvb3AgfHwgdGhpcy5fYW5pbWF0aW9uLmxvb3A7XG5cblx0XHR0aGlzLnJhaXNlRXZlbnQoXCJhbmltYXRpb25QbGF5aW5nXCIpO1xuXG5cdH07XG5cdC8qKlxuXHQgKiBTdG9wcyB0aGUgYW5pbWF0aW9uXG5cdCAqXG5cdCAqIEBtZXRob2Qgc3RvcFxuXHQgKi9cblx0U3ByaXRlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5pc1BsYXlpbmcgPSBmYWxzZTtcblx0fTtcblx0LyoqXG5cdCAqIEFuaW1hdGVzIHRoZSBvYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBfYW5pbWF0ZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0U3ByaXRlLnByb3RvdHlwZS5fYW5pbWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYgKCB0aGlzLmlzUGxheWluZyApIHtcblx0XHRcdFxuXHRcdFx0dmFyIHRpbWVJbk1pbGxpcyA9IE0uZ2V0VGltZSgpO1xuXG5cdFx0XHRpZiAoICEgdGhpcy5jdXJyZW50RnJhbWVTdGFydEluTWlsbGlzICkgdGhpcy5jdXJyZW50RnJhbWVTdGFydEluTWlsbGlzID0gdGltZUluTWlsbGlzO1xuXG5cdFx0XHRpZiAoIHRpbWVJbk1pbGxpcyAtIHRoaXMuY3VycmVudEZyYW1lU3RhcnRJbk1pbGxpcyA+IHRoaXMuX2FuaW1hdGlvbi5kdXJhdGlvbiApIHtcblxuXHRcdFx0XHR0aGlzLmN1cnJlbnRGcmFtZSA9IHRoaXMuX2ltYWdlLmZyYW1lc1t0aGlzLl9hbmltYXRpb24uZnJhbWVzW3RoaXMuX2ZyYW1lSW5kZXhdXTtcblxuXHRcdFx0XHRpZiAoIHRoaXMuX2ZyYW1lSW5kZXggPCB0aGlzLl9hbmltYXRpb24uZnJhbWVzLmxlbmd0aCAtIDEgKSB7XG5cblx0XHRcdFx0XHR0aGlzLnNldEZyYW1lSW5kZXgodGhpcy5fZnJhbWVJbmRleCArIDEpO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRpZiAoIHRoaXMubG9vcCApIHtcblxuXHRcdFx0XHRcdFx0aWYgKCB0aGlzLl9mcmFtZUluZGV4ID09IDAgKSB7XG5cblx0XHRcdFx0XHRcdFx0dGhpcy5zZXRGcmFtZUluZGV4KDEpO1xuXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2V0RnJhbWVJbmRleCgwKTtcblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0aWYgKCB0aGlzLl9hbmltYXRpb24ubmV4dCApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5wbGF5KHRoaXMuX2FuaW1hdGlvbi5uZXh0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuY3VycmVudEZyYW1lU3RhcnRJbk1pbGxpcyA9IHRpbWVJbk1pbGxpcztcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGN1cnJlbnQgZnJhbWUgaXMgdGhlIGxhc3QgZnJhbWUgb2YgdGhlIGFuaW1hdGlvblxuXHQgKlxuXHQgKiBAbWV0aG9kIGlzTGFzdEFuaW1hdGlvbkZyYW1lXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgY3VycmVudCBmcmFtZSBpcyB0aGUgbGFzdCBvZiB0aGUgYW5pbWF0aW9uXG5cdCAqL1xuXHRTcHJpdGUucHJvdG90eXBlLmlzTGFzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oKSB7XG5cblx0XHRpZiAoIHRoaXMuX2FuaW1hdGlvbiApIHtcblx0XHRcdHJldHVybiB0aGlzLl9mcmFtZUluZGV4ID09IHRoaXMuX2FuaW1hdGlvbi5mcmFtZXMubGVuZ3RoIC0gMTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgd2hldGhlciB0aGUgY3VycmVudCBmcmFtZSBpcyB0aGUgZmlyc3QgZnJhbWUgb2YgdGhlIGFuaW1hdGlvblxuXHQgKlxuXHQgKiBAbWV0aG9kIGlzRmlyc3RBbmltYXRpb25GcmFtZVxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGN1cnJlbnQgZnJhbWUgaXMgdGhlIGZpcnN0IG9mIHRoZSBhbmltYXRpb25cblx0ICovXG5cdFNwcml0ZS5wcm90b3R5cGUuaXNGaXJzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oKSB7XG5cblx0XHRpZiAoIHRoaXMuX2FuaW1hdGlvbiApIHtcblx0XHRcdHJldHVybiB0aGlzLl9mcmFtZUluZGV4ID09IDE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH07XG4gICAgLyoqXG5cdCAqIFNldHMgdGhlIGluZGV4IG9mIHRoZSBmcmFtZSB0byByZW5kZXJcblx0ICpcblx0ICogQG1ldGhvZCBzZXRGcmFtZUluZGV4XG5cdCAqIEByZXR1cm4ge2ludGVnZXJ9IHRoZSBpbmRleCB0byByZW5kZXJcblx0ICovXG4gICAgU3ByaXRlLnByb3RvdHlwZS5zZXRGcmFtZUluZGV4ID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRpbmRleCA9IGluZGV4IHx8IDA7XG4gICAgICAgIHRoaXMuX2ZyYW1lSW5kZXggPSBpbmRleDtcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWUgPSB0aGlzLl9pbWFnZS5mcmFtZXNbaW5kZXhdO1xuICAgICAgICB0aGlzLl93aWR0aCA9IHRoaXMuY3VycmVudEZyYW1lLndpZHRoO1xuICAgICAgICB0aGlzLl9oZWlnaHQgPSB0aGlzLmN1cnJlbnRGcmFtZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuX2hhbGZXaWR0aCA9IHRoaXMuY3VycmVudEZyYW1lLmhhbGZXaWR0aDtcbiAgICAgICAgdGhpcy5faGFsZkhlaWdodCA9IHRoaXMuY3VycmVudEZyYW1lLmhhbGZIZWlnaHQ7XG4gICAgICAgIHRoaXMucmFpc2VFdmVudChcImF0dHJpYnV0ZUNoYW5nZWRcIiwgXCJmcmFtZVwiKTtcbiAgICB9O1xuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY29uc3RydWN0b3IncyBuYW1lXG5cdCAqXG5cdCAqIEBtZXRob2QgdG9TdHJpbmdcblx0ICovXG4gICAgU3ByaXRlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBcIlNwcml0ZVwiO1xuICAgIH07XG5cdFxuICAgIFNwcml0ZS5uYW1lID0gXCJTcHJpdGVcIjtcblxuXHRNLmV4dGVuZCggU3ByaXRlLCBSZW5kZXJpemFibGUgKTtcblxuXHRuYW1lc3BhY2UuU3ByaXRlID0gU3ByaXRlO1xuXG59KShNYXRjaC5yZW5kZXJpemFibGVzLCBNYXRjaCwgTWF0Y2gucmVuZGVyaXphYmxlcy5SZW5kZXJpemFibGUsIE1hdGNoLnNwcml0ZXMuYXNzZXRzKTsiLCIvKipcbiAqIEBtb2R1bGUgTWF0Y2hcbiAqIEBuYW1lc3BhY2UgcmVuZGVyZXJzXG4gKi9cbihmdW5jdGlvbihuYW1lc3BhY2UsIE0sIFNoYXBlKSB7XG5cblx0LyoqXG5cdCAqIEBjbGFzcyBSZWN0YW5nbGVcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBleHRlbmRzIHJlbmRlcmVycy5TaGFwZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXNdIHByb3BlcnRpZXMgdG8gY29uc3RydWN0IHRoaXMgb2JqZWN0XG5cdCAqL1xuXHRmdW5jdGlvbiBSZWN0YW5nbGUoIHByb3BlcnRpZXMgKSB7XG5cblx0XHR0aGlzLmV4dGVuZHNTaGFwZSgpO1xuXG5cdFx0dGhpcy5UWVBFID0gTS5yZW5kZXJpemFibGVzLlRZUEVTLlJFQ1RBTkdMRTtcblxuXHRcdHRoaXMuc2V0KCBwcm9wZXJ0aWVzICk7XG5cblx0fVxuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGNvbnN0cnVjdG9yJ3MgbmFtZVxuXHQgKlxuXHQgKiBAbWV0aG9kIHRvU3RyaW5nXG5cdCAqL1xuICBSZWN0YW5nbGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiUmVjdGFuZ2xlXCI7XG4gIH07XG5cbiAgUmVjdGFuZ2xlLm5hbWUgPSBcIlJlY3RhbmdsZVwiO1xuXG5cdE0uZXh0ZW5kKFJlY3RhbmdsZSwgU2hhcGUpO1xuXG5cdG5hbWVzcGFjZS5SZWN0YW5nbGUgPSBSZWN0YW5nbGU7XG5cbn0pKE1hdGNoLnJlbmRlcml6YWJsZXMsIE1hdGNoLCBNYXRjaC5yZW5kZXJpemFibGVzLlNoYXBlKTsiLCIvKipcbiAqIEBtb2R1bGUgTWF0Y2hcbiAqIEBuYW1lc3BhY2UgcmVuZGVyZXJzXG4gKi9cbihmdW5jdGlvbihuYW1lc3BhY2UsIE0sIFNoYXBlKSB7XG5cblx0LyoqXG5cdCAqIEBjbGFzcyBDaXJjbGVcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBleHRlbmRzIHJlbmRlcmVycy5TaGFwZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXNdIHByb3BlcnRpZXMgdG8gY29uc3RydWN0IHRoaXMgb2JqZWN0XG5cdCAqL1xuXHRmdW5jdGlvbiBDaXJjbGUoIHByb3BlcnRpZXMgKSB7XG5cblx0XHR0aGlzLmV4dGVuZHNTaGFwZSgpO1xuXG5cdFx0LyoqXG5cdFx0ICogUmFkaXVzIG9mIHRoZSBjaXJjbGVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfcmFkaXVzXG5cdFx0ICogQGRlZmF1bHQgMVxuXHRcdCAqIEB0eXBlIGZsb2F0XG5cdFx0ICovXG5cdFx0dGhpcy5fcmFkaXVzID0gMTtcblx0XHQvKipcblx0XHQgKiBBbmdsZSBpbiB3aGljaCB0byBiZWdpbiByZW5kZXJpbmcgdGhlIGNpcmNsZS5cblx0XHQgKiBWYWxpZCB2YWx1ZXM6IDAgdG8gMiAqIE1hdGguUElcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfcmFkaXVzXG5cdFx0ICogQGRlZmF1bHQgMFxuXHRcdCAqIEB0eXBlIGZsb2F0XG5cdFx0ICovXG5cdFx0dGhpcy5fc3RhcnRBbmdsZSA9IDA7XG5cdFx0LyoqXG5cdFx0ICogQW5nbGUgaW4gd2hpY2ggdG8gZW5kIHJlbmRlcmluZyB0aGUgY2lyY2xlXG5cdFx0ICogVmFsaWQgdmFsdWVzOiAwIHRvIDIgKiBNYXRoLlBJXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX3JhZGl1c1xuXHRcdCAqIEBkZWZhdWx0IDYuMjhcblx0XHQgKiBAdHlwZSBmbG9hdFxuXHRcdCAqL1xuXHRcdHRoaXMuX2VuZEFuZ2xlID0gNi4yODtcblxuXHRcdHRoaXMuVFlQRSA9IE0ucmVuZGVyaXphYmxlcy5UWVBFUy5DSVJDTEU7XG5cblx0XHR0aGlzLnNldCggcHJvcGVydGllcyApO1xuXG5cdH1cblx0LyoqXG5cdCAqIFNldHMgdGhlIGRpYW1ldGVyIG9mIHRoZSBjaXJjbGVcblx0ICpcblx0ICogQG1ldGhvZCBzZXRTaXplXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHNpemVcblx0ICovXG5cdENpcmNsZS5wcm90b3R5cGUuc2V0U2l6ZSA9IGZ1bmN0aW9uKHNpemUpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRSYWRpdXMoc2l6ZSAvIDIpO1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgZGlhbWV0ZXIgb2YgdGhlIGNpcmNsZVxuXHQgKlxuXHQgKiBAbWV0aG9kIGdldFNpemVcblx0ICogQHJldHVybiB7ZmxvYXR9IGRpYW1ldGVyXG5cdCAqL1xuXHRDaXJjbGUucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fcmFkaXVzICogMjtcblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHJhZGl1cyBvZiB0aGUgY2lyY2xlXG5cdCAqXG5cdCAqIEBtZXRob2Qgc2V0UmFkaXVzXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHJhZGl1c1xuXHQgKi9cblx0Q2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMgPSBmdW5jdGlvbihyYWRpdXMpIHtcblx0XHR0aGlzLl9yYWRpdXMgPSByYWRpdXM7XG5cdFx0dGhpcy5yYWlzZUV2ZW50KFwiYXR0cmlidXRlQ2hhbmdlZFwiKTtcblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIHJhZGl1cyBvZiB0aGUgY2lyY2xlXG5cdCAqIEBtZXRob2QgZ2V0UmFkaXVzXG5cdCAqIEByZXR1cm4ge2Zsb2F0fSB0aGUgc2hhZG93XG5cdCAqL1xuXHRDaXJjbGUucHJvdG90eXBlLmdldFJhZGl1cyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9yYWRpdXM7XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIG1vdXNlIGlzIG92ZXIgdGhpcyBvYmplY3Qgb3Igbm90XG5cdCAqXG5cdCAqIEBtZXRob2QgaXNNb3VzZU92ZXJcblx0ICogQHBhcmFtIHtPYmplY3R9IHAgTS5vbkxvb3BQcm9wZXJ0aWVzXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgbW91c2UgaXMgb3ZlciB0aGlzIG9iamVjdCBlbHNlIGZhbHNlXG5cdCAqL1xuXHRDaXJjbGUucHJvdG90eXBlLmlzTW91c2VPdmVyID0gZnVuY3Rpb24oIHAgKSB7XG5cdFx0aWYgKCAhIHAgKSBwID0gTS5vbkxvb3BQcm9wZXJ0aWVzO1xuXHRcdHJldHVybiBNLk1hdGgyZC5nZXREaXN0YW5jZSgge3g6IHRoaXMuX3gsIHk6IHRoaXMuX3kgfSwgcC5tb3VzZSApIDw9IHRoaXMuX3JhZGl1cztcblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIGhlaWdodCBvZiB0aGlzIG9iamVjdC4gVGhpcyBpcyBhY3R1YWxseSBhbiBlbGxpcHNpcyBzbyB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgd2lkdGggb2YgdGhlIHNoYXBlXG5cdCAqIEBtZXRob2QgZ2V0V2lkdGhcblx0ICogQHJldHVybiB7ZmxvYXR9IHRoZSB3aWR0aFxuXHQgKi9cblx0Q2lyY2xlLnByb3RvdHlwZS5nZXRXaWR0aCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5fc2NhbGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fcmFkaXVzICogMiAqIHRoaXMuX3NjYWxlLng7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9yYWRpdXMgKiAyO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIGhlaWdodCBvZiB0aGlzIG9iamVjdC4gVGhpcyBpcyBhY3R1YWxseSBhbiBlbGxpcHNpcyBzbyB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgaGVpZ2h0IG9mIHRoZSBzaGFwZVxuXHQgKiBAbWV0aG9kIGdldFdpZHRoXG5cdCAqIEByZXR1cm4ge2Zsb2F0fSB0aGUgd2lkdGhcblx0ICovXG5cdENpcmNsZS5wcm90b3R5cGUuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLl9zY2FsZSApIHtcblx0XHRcdHJldHVybiB0aGlzLl9yYWRpdXMgKiAyICogdGhpcy5fc2NhbGUueTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3JhZGl1cyAqIDI7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyB4IGNvb3JkaW5hdGUgcmVwcmVzZW50aW5nIHRoZSBsZWZ0bW9zdCBwYXJ0IG9mIHRoZSBPYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBnZXRMZWZ0XG5cdCAqIEByZXR1cm4ge2Zsb2F0fSB0aGUgY29vcmRpbmF0ZXMgdG8gbGVmdCBvZiB0aGUgb2JqZWN0XG5cdCAqL1xuXHRDaXJjbGUucHJvdG90eXBlLmdldExlZnQgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuX3NjYWxlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3ggLSB0aGlzLl9yYWRpdXMgKiB0aGlzLl9zY2FsZS54O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5feCAtIHRoaXMuX3JhZGl1cztcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHggY29vcmRpbmF0ZSByZXByZXNlbnRpbmcgdGhlIHJpZ2h0bW9zdCBwYXJ0IG9mIHRoZSBPYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBnZXRSaWdodFxuXHQgKiBAcmV0dXJuIHtmbG9hdH0gdGhlIGNvb3JkaW5hdGVzIHRvIHJpZ2h0IG9mIHRoZSBvYmplY3Rcblx0ICovXG5cdENpcmNsZS5wcm90b3R5cGUuZ2V0UmlnaHQgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuX3NjYWxlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3ggKyB0aGlzLl9yYWRpdXMgKiB0aGlzLl9zY2FsZS54O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5feCArIHRoaXMuX3JhZGl1cztcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHkgY29vcmRpbmF0ZSByZXByZXNlbnRpbmcgdGhlIHRvcG1vc3QgcGFydCBvZiB0aGUgT2JqZWN0XG5cdCAqXG5cdCAqIEBtZXRob2QgZ2V0VG9wXG5cdCAqIEByZXR1cm4ge2Zsb2F0fSB0aGUgY29vcmRpbmF0ZXMgdG8gdG9wIG9mIHRoZSBvYmplY3Rcblx0ICovXG5cdENpcmNsZS5wcm90b3R5cGUuZ2V0VG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLl9zY2FsZSApIHtcblx0XHRcdHJldHVybiB0aGlzLl95IC0gdGhpcy5fcmFkaXVzICogdGhpcy5fc2NhbGUueTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3kgLSB0aGlzLl9yYWRpdXM7XG5cdFx0fVxuXHR9O1xuXHQvKipcblx0ICogUmV0dXJucyB5IGNvb3JkaW5hdGUgcmVwcmVzZW50aW5nIHRoZSBib3R0b21tb3N0IHBhcnQgb2YgdGhlIE9iamVjdFxuXHQgKlxuXHQgKiBAbWV0aG9kIGdldEJvdHRvbVxuXHQgKiBAcmV0dXJuIHtmbG9hdH0gdGhlIGNvb3JkaW5hdGVzIHRvIGJvdHRvbSBvZiB0aGUgb2JqZWN0XG5cdCAqL1xuXHRDaXJjbGUucHJvdG90eXBlLmdldEJvdHRvbSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5fc2NhbGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5feSArIHRoaXMuX3JhZGl1cyAqIHRoaXMuX3NjYWxlLnk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl95ICsgdGhpcy5fcmFkaXVzO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGxlZnRtb3N0IGNvb3JkaW5hdGVzIG9mIHRoZSBPYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBzZXRMZWZ0XG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHZhbHVlIHRoZSBjb29yZGluYXRlcyB0byBsZWZ0IG9mIHRoZSBvYmplY3Rcblx0ICovXG5cdENpcmNsZS5wcm90b3R5cGUuc2V0TGVmdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKCB0aGlzLl9zY2FsZSApIHtcblx0XHRcdHRoaXMuc2V0WCh2YWx1ZSArIHRoaXMuX3JhZGl1cyAqIHRoaXMuX3NjYWxlLngpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldFgodmFsdWUgKyB0aGlzLl9yYWRpdXMpO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHJpZ2h0bW9zdCBjb29yZGluYXRlcyBvZiB0aGUgT2JqZWN0XG5cdCAqXG5cdCAqIEBtZXRob2Qgc2V0UmlnaHRcblx0ICogQHBhcmFtIHtmbG9hdH0gdmFsdWUgdGhlIGNvb3JkaW5hdGVzIHRvIHJpZ2h0IG9mIHRoZSBvYmplY3Rcblx0ICovXG5cdENpcmNsZS5wcm90b3R5cGUuc2V0UmlnaHQgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmICggdGhpcy5fc2NhbGUgKSB7XG5cdFx0XHR0aGlzLnNldFgodmFsdWUgLSB0aGlzLl9yYWRpdXMgKiB0aGlzLl9zY2FsZS54KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZXRYKHZhbHVlIC0gdGhpcy5fcmFkaXVzKTtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSB0b3Btb3N0IGNvb3JkaW5hdGVzIG9mIHRoZSBPYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBzZXRUb3Bcblx0ICogQHBhcmFtIHtmbG9hdH0gdmFsdWUgdGhlIGNvb3JkaW5hdGVzIHRvIHRvcCBvZiB0aGUgb2JqZWN0XG5cdCAqL1xuXHRDaXJjbGUucHJvdG90eXBlLnNldFRvcCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKCB0aGlzLl9zY2FsZSApIHtcblx0XHRcdHRoaXMuc2V0WSh0aGlzLl95ID0gdmFsdWUgKyB0aGlzLl9yYWRpdXMgKiB0aGlzLl9zY2FsZS55KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZXRZKHZhbHVlICsgdGhpcy5fcmFkaXVzKTtcblx0XHR9XG5cdH07XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBib3R0b21tb3N0IGNvb3JkaW5hdGVzIG9mIHRoZSBPYmplY3Rcblx0ICpcblx0ICogQG1ldGhvZCBzZXRCb3R0b21cblx0ICogQHBhcmFtIHtmbG9hdH0gdmFsdWUgdGhlIGNvb3JkaW5hdGVzIHRvIGJvdHRvbSBvZiB0aGUgb2JqZWN0XG5cdCAqL1xuXHRDaXJjbGUucHJvdG90eXBlLnNldEJvdHRvbSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKCB0aGlzLl9zY2FsZSApIHtcblx0XHRcdHRoaXMuc2V0WSh2YWx1ZSAtIHRoaXMuX3JhZGl1cyAqIHRoaXMuX3NjYWxlLnkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldFkodmFsdWUgLSB0aGlzLl9yYWRpdXMpO1xuXHRcdH1cblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGNvbnN0cnVjdG9yJ3MgbmFtZVxuXHQgKlxuXHQgKiBAbWV0aG9kIHRvU3RyaW5nXG5cdCAqL1xuICAgIENpcmNsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gXCJDaXJjbGVcIjtcbiAgICB9O1xuXG4gICAgQ2lyY2xlLm5hbWUgPSBcIkNpcmNsZVwiO1xuXG5cdE0uZXh0ZW5kKENpcmNsZSwgU2hhcGUpO1xuXG5cdG5hbWVzcGFjZS5DaXJjbGUgPSBDaXJjbGU7XG5cbn0pKE1hdGNoLnJlbmRlcml6YWJsZXMsIE1hdGNoLCBNYXRjaC5yZW5kZXJpemFibGVzLlNoYXBlKTsiLCIvKipcbiAqIEBtb2R1bGUgTWF0Y2hcbiAqIEBuYW1lc3BhY2UgcmVuZGVyZXJzXG4gKi9cbihmdW5jdGlvbihuYW1lc3BhY2UsIE0sIFNoYXBlKSB7XG5cblx0dmFyIHRleHRNZWFzdXJpbmdEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdHRleHRNZWFzdXJpbmdEaXYuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJtYXRjaC10ZXh0LW1lYXN1cmluZ1wiKTtcblx0XHR0ZXh0TWVhc3VyaW5nRGl2LnN0eWxlLnNldFByb3BlcnR5KFwidmlzaWJpbGl0eVwiLCBcImhpZGRlblwiKTtcblx0XHR0ZXh0TWVhc3VyaW5nRGl2LnN0eWxlLnNldFByb3BlcnR5KFwiZGlzcGxheVwiLCBcImlubGluZS1ibG9ja1wiKTtcblx0XHR0ZXh0TWVhc3VyaW5nRGl2LnN0eWxlLnNldFByb3BlcnR5KFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiKTtcblxuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0TWVhc3VyaW5nRGl2KTtcblx0fSk7XG5cblxuXHQvKipcblx0ICogQGNsYXNzIFRleHRcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBleHRlbmRzIHJlbmRlcmVycy5TaGFwZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXNdIHByb3BlcnRpZXMgdG8gY29uc3RydWN0IHRoaXMgb2JqZWN0XG5cdCAqL1xuXHRmdW5jdGlvbiBUZXh0KCBwcm9wZXJ0aWVzICkge1xuXG5cdFx0dGhpcy5leHRlbmRzU2hhcGUoKTtcblx0XHQvKipcblx0XHQgKiBGb250IHN0eWxlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX3N0eWxlXG5cdFx0ICogQGRlZmF1bHQgXCJub3JtYWxcIlxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdHRoaXMuX3N0eWxlID0gXCJub3JtYWxcIjtcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHR0aGlzLl9zdHlsZSA9IFwiaXRhbGljXCI7XG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fc3R5bGUgPSBcImJvbGRcIjtcblx0XHQgKi9cblx0XHR0aGlzLl9zdHlsZSA9IFwiXCI7XG5cdFx0LyoqXG5cdFx0ICogRm9udCB2YXJpYW50XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX3ZhcmlhbnRcblx0XHQgKiBAZGVmYXVsdCBcIm5vcm1hbFwiXG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fdmFyaWFudCA9IFwibm9ybWFsXCI7XG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fdmFyaWFudCA9IFwic21hbGwtY2Fwc1wiO1xuXHRcdCAqL1xuXHRcdHRoaXMuX3ZhcmlhbnQgPSBcIlwiO1xuXHRcdC8qKlxuXHRcdCAqIEZvbnQgd2VpZ2h0XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX3dlaWdodFxuXHRcdCAqIEBkZWZhdWx0IFwibm9ybWFsXCJcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHR0aGlzLl93ZWlnaHQgPSBcIm5vcm1hbFwiO1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdHRoaXMuX3dlaWdodCA9IFwiYm9sZFwiO1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdHRoaXMuX3dlaWdodCA9IFwiYm9sZGVyXCI7XG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fd2VpZ2h0ID0gXCJsaWdodGVyXCI7XG5cdFx0ICovXG5cdFx0dGhpcy5fd2VpZ2h0ID0gXCJcIjtcblx0XHQvKipcblx0XHQgKiBGb250IHNpemVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfc2l6ZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdHRoaXMuX3NpemUgPSBcIjEwcHhcIjtcblx0XHQgKi9cblx0XHR0aGlzLl9zaXplID0gXCIxNHB4XCI7XG5cdFx0LyoqXG5cdFx0ICogRm9udCBmYW1pbHlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfZmFtaWx5XG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fZmFtaWx5ID0gXCJNb25vc3BhY2VcIjtcblx0XHQgKi9cblx0XHR0aGlzLl9mYW1pbHkgPSBcIkNhbGlicmksIFZlcmRhbmEsIEFyaWFsLCBNb25vc3BhY2VcIjtcblx0XHQvKipcblx0XHQgKiBUZXh0IGFsaWduXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX3RleHRBbGlnblxuXHRcdCAqIEBkZWZhdWx0IGNlbnRlclxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdHRoaXMuX3RleHRBbGlnbiA9IFwibGVmdFwiO1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdHRoaXMuX3RleHRBbGlnbiA9IFwiY2VudGVyXCI7XG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fdGV4dEFsaWduID0gXCJyaWdodFwiO1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdHRoaXMuX3RleHRBbGlnbiA9IFwianVzdGlmeVwiO1xuXHRcdCAqL1xuXHRcdHRoaXMuX3RleHRBbGlnbiA9IFwibGVmdFwiO1xuXHRcdC8qKlxuXHRcdCAqIFRleHQgYmFzZWxpbmVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwcm9wZXJ0eSBfdGV4dEJhc2VsaW5lXG5cdFx0ICogQGRlZmF1bHQgbWlkZGxlXG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fdGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcblx0XHQgKiBAZXhhbXBsZVxuXHRcdFx0XHR0aGlzLl90ZXh0QmFzZWxpbmUgPSBcImJvdHRvbVwiO1xuXHRcdCAqIEBleGFtcGxlXG5cdFx0XHRcdHRoaXMuX3RleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fdGV4dEJhc2VsaW5lID0gXCJhbHBoYWJldGljXCI7XG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fdGV4dEJhc2VsaW5lID0gXCJoYW5naW5nXCI7XG5cdFx0ICovXG5cdFx0dGhpcy5fdGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcblx0XHQvKipcblx0XHQgKiBUZXh0XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX3RleHRcblx0XHQgKiBAZGVmYXVsdCBcIlwiXG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICogQGV4YW1wbGVcblx0XHRcdFx0dGhpcy5fdGV4dEJhc2VsaW5lID0gXCJIZWxsb3cgV29ybGQhXCI7XG5cdFx0ICovXG5cdFx0dGhpcy5fdGV4dCA9IFwiXCI7XG5cblx0XHR0aGlzLl9jaGFuZ2VkID0gZmFsc2U7XG5cdFx0XG5cdFx0dGhpcy5UWVBFID0gTS5yZW5kZXJpemFibGVzLlRZUEVTLlRFWFQ7XG5cblx0XHR0aGlzLnNldCggcHJvcGVydGllcyApO1xuXG5cdH1cblx0VGV4dC5wcm90b3R5cGUuZ2V0Qm91bmRpbmdIYWxmV2lkdGggPSBmdW5jdGlvbiAoKSB7XG5cdFx0Ly9DYWxjdWxhdGUgYW5kIGNhY2hlIGludGVybmFsIGhhbGZXaWR0aCBhbmQgaGFsZkhlaWdodCB3aGljaCBhcmUgbmVlZGVkIGZvciBib3VuZGluZyBtZXRob2Rcblx0XHR0aGlzLmdldFdpZHRoKCk7XG5cdFx0dGhpcy5nZXRIZWlnaHQoKTtcblx0XHRyZXR1cm4gdGhpcy5zaGFwZUdldEJvdW5kaW5nSGFsZldpZHRoKCk7XG5cdH07XG5cdFRleHQucHJvdG90eXBlLmdldEJvdW5kaW5nSGFsZkhlaWd0aCA9IGZ1bmN0aW9uICgpIHtcblx0XHQvL0NhbGN1bGF0ZSBhbmQgY2FjaGUgaW50ZXJuYWwgaGFsZldpZHRoIGFuZCBoYWxmSGVpZ2h0IHdoaWNoIGFyZSBuZWVkZWQgZm9yIGJvdW5kaW5nIG1ldGhvZFxuXHRcdHRoaXMuZ2V0V2lkdGgoKTtcblx0XHR0aGlzLmdldEhlaWdodCgpO1xuXHRcdHJldHVybiB0aGlzLnNoYXBlR2V0Qm91bmRpbmdIYWxmSGVpZ2h0KCk7XG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBoZWlnaHQgb2YgdGhpcyBvYmplY3Rcblx0ICogQG1ldGhvZCBnZXRIZWlnaHRcblx0ICogQHJldHVybiB7ZmxvYXR9IHRoZSBoZWlnaHRcblx0ICovXG5cdFRleHQucHJvdG90eXBlLmdldEhlaWdodCA9IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdGlmICggdGhpcy5fY2hhbmdlZCApIHtcblxuXHRcdFx0dGV4dE1lYXN1cmluZ0Rpdi5zdHlsZS5zZXRQcm9wZXJ0eShcImZvbnQtc2l6ZVwiLCB0aGlzLl9zaXplKTtcblx0XHRcdHRleHRNZWFzdXJpbmdEaXYuc3R5bGUuc2V0UHJvcGVydHkoXCJmb250LWZhbWlseVwiLCB0aGlzLl9mYW1pbHkpO1xuXHRcdFx0dGV4dE1lYXN1cmluZ0Rpdi5zdHlsZS5zZXRQcm9wZXJ0eShcImZvbnQtdmFyaWFudFwiLCB0aGlzLl92YXJpYW50KTtcblx0XHRcdHRleHRNZWFzdXJpbmdEaXYuc3R5bGUuc2V0UHJvcGVydHkoXCJmb250LXdlaWdodFwiLCB0aGlzLl93ZWlnaHQpO1xuXHRcdFx0dGV4dE1lYXN1cmluZ0Rpdi5zdHlsZS5zZXRQcm9wZXJ0eShcImZvbnQtc3R5bGVcIiwgdGhpcy5fc3R5bGUpO1xuXHRcdFx0dGV4dE1lYXN1cmluZ0Rpdi5pbm5lckhUTUwgPSB0aGlzLl90ZXh0O1xuXG5cdFx0XHR0aGlzLl93aWR0aCA9IHRleHRNZWFzdXJpbmdEaXYub2Zmc2V0V2lkdGg7XG5cdFx0XHR0aGlzLl9oZWlnaHQgPSB0ZXh0TWVhc3VyaW5nRGl2Lm9mZnNldEhlaWdodDtcblx0XHRcdHRoaXMuX2hhbGZXaWR0aCA9IHRoaXMuX3dpZHRoIC8gMjtcblx0XHRcdHRoaXMuX2hhbGZIZWlnaHQgPSB0aGlzLl9oZWlnaHQgLyAyO1xuXHRcdFxuXHRcdFx0dGhpcy5fY2hhbmdlZCA9IGZhbHNlO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2hlaWdodDtcblxuXHR9O1xuXHQvKlxuXHQgKiBBIFRleHQgc2l6ZSBpcyB0b28gZGlmZmljdWx0IHRvIGNhbGN1bGF0ZSBzbyB3ZVxuXHQgKiBqdXN0IGhhbmRsZSBpdCdzIGNvb3JkaW5hdGVzIGFzIHdlIGRvIHdpdGggYm90aFxuXHQgKiBvZiB0aGUgb2JqZWN0cywgeCBhbmQgeSBpcyBhbHdheXMgY2VudGVyLlxuXHQgKiBUaGF0J3Mgd2h5IHRoaXMgbWV0aG9kcyBhcmUgY29tbWVudGVkXG5cdCAqL1xuXHQvKipcblx0ICogQGRlcHJlY2F0ZWRcblx0ICovXG5cdFRleHQucHJvdG90eXBlLnNldEFsaWdubWVudCA9IGZ1bmN0aW9uKCBob3Jpem9udGFsLCB2ZXJ0aWNhbCApIHtcblx0XHR0aGlzLnNldEhvcml6b250YWxBbGlnbihob3Jpem9udGFsKTtcblx0XHR0aGlzLnNldFZlcnRpY2FsQWxpZ24odmVydGljYWwpO1xuXHRcdHRoaXMuX2NoYW5nZWQgPSB0cnVlO1xuXHR9O1xuXHQvKipcblx0ICogQGRlcHJlY2F0ZWRcblx0ICovXG5cdFRleHQucHJvdG90eXBlLnNldEhvcml6b250YWxBbGlnbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5fdGV4dEFsaWduID0gdmFsdWU7XG5cdFx0dGhpcy5fY2hhbmdlZCA9IHRydWU7XG5cdFx0dGhpcy5yYWlzZUV2ZW50KFwiaG9yaXpvbnRhbEFsaWduQ2hhbmdlZFwiLCB2YWx1ZSk7XG5cdH07XG5cdC8qKlxuXHQgKiBAZGVwcmVjYXRlZFxuXHQgKi9cblx0VGV4dC5wcm90b3R5cGUuc2V0VmVydGljYWxBbGlnbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5fdGV4dEJhc2VsaW5lID0gdmFsdWU7XG5cdFx0dGhpcy5fY2hhbmdlZCA9IHRydWU7XG5cdFx0dGhpcy5yYWlzZUV2ZW50KFwidmVydGljYWxBbGlnbkNoYW5nZWRcIiwgdmFsdWUpO1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgd2lkdGggb2YgdGhpcyBvYmplY3Rcblx0ICogQG1ldGhvZCBnZXRXaWR0aFxuXHQgKiBAcmV0dXJuIHtmbG9hdH0gdGhlIHdpZHRoXG5cdCAqL1xuXHRUZXh0LnByb3RvdHlwZS5nZXRXaWR0aCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYgKCB0aGlzLl9jaGFuZ2VkICkge1xuXG5cdFx0XHR0ZXh0TWVhc3VyaW5nRGl2LnN0eWxlLnNldFByb3BlcnR5KFwiZm9udC1zaXplXCIsIHRoaXMuX3NpemUpO1xuXHRcdFx0dGV4dE1lYXN1cmluZ0Rpdi5zdHlsZS5zZXRQcm9wZXJ0eShcImZvbnQtZmFtaWx5XCIsIHRoaXMuX2ZhbWlseSk7XG5cdFx0XHR0ZXh0TWVhc3VyaW5nRGl2LnN0eWxlLnNldFByb3BlcnR5KFwiZm9udC12YXJpYW50XCIsIHRoaXMuX3ZhcmlhbnQpO1xuXHRcdFx0dGV4dE1lYXN1cmluZ0Rpdi5zdHlsZS5zZXRQcm9wZXJ0eShcImZvbnQtd2VpZ2h0XCIsIHRoaXMuX3dlaWdodCk7XG5cdFx0XHR0ZXh0TWVhc3VyaW5nRGl2LnN0eWxlLnNldFByb3BlcnR5KFwiZm9udC1zdHlsZVwiLCB0aGlzLl9zdHlsZSk7XG5cdFx0XHR0ZXh0TWVhc3VyaW5nRGl2LmlubmVySFRNTCA9IHRoaXMuX3RleHQ7XG5cblx0XHRcdHRoaXMuX3dpZHRoID0gdGV4dE1lYXN1cmluZ0Rpdi5vZmZzZXRXaWR0aDtcblx0XHRcdHRoaXMuX2hlaWdodCA9IHRleHRNZWFzdXJpbmdEaXYub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0dGhpcy5faGFsZldpZHRoID0gdGhpcy5fd2lkdGggLyAyO1xuXHRcdFx0dGhpcy5faGFsZkhlaWdodCA9IHRoaXMuX2hlaWdodCAvIDI7XG5cdFx0XG5cdFx0XHR0aGlzLl9jaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fd2lkdGg7XG5cblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGZvbnQgZmFtaWx5XG5cdCAqXG5cdCAqIEBtZXRob2Qgc2V0RmFtaWx5XG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSB0aGUgZm9udCBmYW1pbHlcblx0ICogQGV4YW1wbGVcblx0XHRcdHRoaXMuc2V0RmFtaWx5KFwiTW9ub3NwYWNlXCIpO1xuXHQgKi9cblx0VGV4dC5wcm90b3R5cGUuc2V0RmFtaWx5ID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLl9mYW1pbHkgPSB2YWx1ZTtcblx0XHR0aGlzLl9jaGFuZ2VkID0gdHJ1ZTtcblx0XHR0aGlzLnJhaXNlRXZlbnQoXCJmYW1pbHlDaGFuZ2VkXCIsIHZhbHVlKTtcblx0fTtcblxuXHRUZXh0LnByb3RvdHlwZS5zZXRGb250ID0gVGV4dC5wcm90b3R5cGUuc2V0RmFtaWx5O1xuXG5cdFRleHQucHJvdG90eXBlLmdldEZvbnQgPSBUZXh0LnByb3RvdHlwZS5nZXRGYW1pbHk7XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBmb250IHNpemVcblx0ICpcblx0ICogQG1ldGhvZCBzZXRTaXplXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSB0aGUgZm9udCBzaXplIHdpdGhvdXQgXCJweFwiXG5cdCAqIEBleGFtcGxlXG5cdFx0XHR0aGlzLnNldFNpemUoMTQpO1xuXHQgKi9cblx0VGV4dC5wcm90b3R5cGUuc2V0U2l6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5fc2l6ZSA9IHBhcnNlSW50KHZhbHVlKSArIFwicHggXCI7XG5cdFx0dGhpcy5fY2hhbmdlZCA9IHRydWU7XG5cdFx0dGhpcy5yYWlzZUV2ZW50KFwic2l6ZUNoYW5nZWRcIiwgdmFsdWUpO1xuXHR9O1xuXHQvKipcblx0ICogU2V0cyB0aGUgZm9udCB3ZWlnaHRcblx0ICpcblx0ICogQG1ldGhvZCBzZXRXZWlnaHRcblx0ICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIHRoZSBmb250IHdlaWdodFxuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dGhpcy5zZXRXZWlnaHQoXCJub3JtYWxcIik7XG5cdCAqIEBleGFtcGxlXG5cdFx0XHR0aGlzLnNldFdlaWdodChcImJvbGRcIik7XG5cdCAqIEBleGFtcGxlXG5cdFx0XHR0aGlzLnNldFdlaWdodChcImJvbGRlclwiKTtcblx0ICogQGV4YW1wbGVcblx0XHRcdHRoaXMuc2V0V2VpZ2h0KFwibGlnaHRlclwiKTtcblx0ICovXG5cdFRleHQucHJvdG90eXBlLnNldFdlaWdodCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5fd2VpZ2h0ID0gdmFsdWUgKyBcIiBcIjtcblx0XHR0aGlzLl9jaGFuZ2VkID0gdHJ1ZTtcblx0XHR0aGlzLnJhaXNlRXZlbnQoXCJ3ZWlnaHRDaGFuZ2VkXCIsIHZhbHVlKTtcblx0fTtcblx0LyoqXG5cdCAqIE1ha2VzIHRoZSBmb250IGJvbGQgb3IgcmVndWxhclxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldEJvbGRcblx0ICogQHBhcmFtIHtCb29sZWFufSB2YWx1ZSB0cnVlIG9yIGZhbHNlIHRvIHNldCBmb250IGJvbGRcblx0ICogQGV4YW1wbGVcblx0XHRcdHRoaXMuc2V0Qm9sZCh0cnVlKTtcblx0KiBAZXhhbXBsZVxuXHRcdFx0dGhpcy5zZXRCb2xkKGZhbHNlKTtcblx0ICovXG5cdFRleHQucHJvdG90eXBlLnNldEJvbGQgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmICggdmFsdWUgKSB7XG5cdFx0XHR0aGlzLnNldFdlaWdodChcImJvbGRcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0V2VpZ2h0KFwiXCIpO1xuXHRcdH1cblx0XHR0aGlzLl9jaGFuZ2VkID0gdHJ1ZTtcblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGZvbnQgdmFyaWFudFxuXHQgKlxuXHQgKiBAbWV0aG9kIHNldFZhcmlhbnRcblx0ICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIHRoZSBmb250IHZhcmlhbnRcblx0ICogQGV4YW1wbGVcblx0XHRcdHRoaXMuc2V0VmFyaWFudChcIm5vcm1hbFwiKTtcblx0ICogQGV4YW1wbGVcblx0XHRcdHRoaXMuc2V0VmFyaWFudChcInNtYWxsLWNhcHNcIik7XG5cdCAqL1xuXHRUZXh0LnByb3RvdHlwZS5zZXRWYXJpYW50ID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLl92YXJpYW50ID0gdmFsdWUgKyBcIiBcIjtcblx0XHR0aGlzLl9jaGFuZ2VkID0gdHJ1ZTtcblx0XHR0aGlzLnJhaXNlRXZlbnQoXCJ2YXJpYW50Q2hhbmdlZFwiLCB2YWx1ZSk7XG5cdH07XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBmb250IHN0eWxlXG5cdCAqXG5cdCAqIEBtZXRob2Qgc2V0U3R5bGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIHRoZSBmb250IHN0eWxlXG5cdCAqIEBleGFtcGxlXG5cdFx0XHR0aGlzLnNldFN0eWxlKFwibm9ybWFsXCIpO1xuXHQgKiBAZXhhbXBsZVxuXHRcdFx0dGhpcy5zZXRTdHlsZShcIml0YWxpY1wiKTtcblx0ICogQGV4YW1wbGVcblx0XHRcdHRoaXMuc2V0U3R5bGUoXCJib2xkXCIpO1xuXHQgKi9cblx0VGV4dC5wcm90b3R5cGUuc2V0U3R5bGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHRoaXMuX3N0eWxlID0gdmFsdWUgKyBcIiBcIjtcblx0XHR0aGlzLl9jaGFuZ2VkID0gdHJ1ZTtcblx0XHR0aGlzLnJhaXNlRXZlbnQoXCJzdHlsZUNoYW5nZWRcIiwgdmFsdWUpO1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgZm9udCBzaXplXG5cdCAqIEBtZXRob2QgZ2V0U2l6ZVxuXHQgKiBAcmV0dXJuIHtpbnR9IHRoZSBzaXplXG5cdCAqL1xuXHRUZXh0LnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2l6ZTtcblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIGZvbnQgd2VpZ2h0XG5cdCAqIEBtZXRob2QgZ2V0V2VpZ2h0XG5cdCAqIEByZXR1cm4ge1N0cmluZ30gdGhlIHdlaWdodFxuXHQgKi9cblx0VGV4dC5wcm90b3R5cGUuZ2V0V2VpZ2h0ID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpcy5fd2VpZ2h0O1xuXHR9O1xuXHQvKipcblx0ICogR2V0cyB0aGUgZm9udCB2YXJpYW50XG5cdCAqIEBtZXRob2QgZ2V0VmFyaWFudFxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9IHRoZSB2YXJpYW50XG5cdCAqL1xuXHRUZXh0LnByb3RvdHlwZS5nZXRWYXJpYW50ID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpcy5fdmFyaWFudDtcblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIGZvbnQgc3R5bGVcblx0ICogQG1ldGhvZCBnZXRTdHlsZVxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9IHRoZSBzdHlsZVxuXHQgKi9cblx0VGV4dC5wcm90b3R5cGUuZ2V0U3R5bGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHJldHVybiB0aGlzLl9zdHlsZTtcblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHRleHRcblx0ICogQG1ldGhvZCBzZXRUZXh0XG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSB0aGUgdGV4dFxuXHQgKi9cblx0VGV4dC5wcm90b3R5cGUuc2V0VGV4dCA9IGZ1bmN0aW9uKHZhbHVlLCBtdWx0aUxpbmUpIHtcblx0XHRpZiAoIG11bHRpTGluZSApIHtcblx0XHRcdHRoaXMubXVsdGlMaW5lID0gdmFsdWUuc3BsaXQoXCJcXG5cIik7XG5cdFx0fVxuXHRcdHRoaXMuX3RleHQgPSB2YWx1ZTtcblx0XHR0aGlzLl9jaGFuZ2VkID0gdHJ1ZTtcblx0XHR0aGlzLnJhaXNlRXZlbnQoXCJ0ZXh0Q2hhbmdlZFwiLCB2YWx1ZSk7XG5cdH07XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBmb250IGZhbWlseVxuXHQgKiBAbWV0aG9kIGdldEZhbWlseVxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9IHRoZSBmYW1pbHlcblx0ICovXG5cdFRleHQucHJvdG90eXBlLmdldEZhbWlseSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2ZhbWlseTtcblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIHRleHRcblx0ICogQG1ldGhvZCBnZXRUZXh0XG5cdCAqIEByZXR1cm4ge1N0cmluZ30gdGhlIHRleHRcblx0ICovXG5cdFRleHQucHJvdG90eXBlLmdldFRleHQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fdGV4dDtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGNvbnN0cnVjdG9yJ3MgbmFtZVxuXHQgKlxuXHQgKiBAbWV0aG9kIHRvU3RyaW5nXG5cdCAqL1xuICAgIFRleHQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIFwiVGV4dFwiO1xuICAgIH07XG5cbiAgICBUZXh0Lm5hbWUgPSBcIlRleHRcIjtcbiAgICBcblx0TS5leHRlbmQoIFRleHQsIFNoYXBlICk7XG5cblx0bmFtZXNwYWNlLlRleHQgPSBUZXh0O1xuXG59KShNYXRjaC5yZW5kZXJpemFibGVzLCBNYXRjaCwgTWF0Y2gucmVuZGVyaXphYmxlcy5TaGFwZSk7IiwiLyoqXG4gKiBAbW9kdWxlIE1hdGNoXG4gKiBAbmFtZXNwYWNlIHJlbmRlcmVyc1xuICovXG4oZnVuY3Rpb24obmFtZXNwYWNlLCBNLCBSZW5kZXJpemFibGUsIHNwcml0ZUFzc2V0cykge1xuXG5cdC8qKlxuXHQgKiBDb250YWlucyBhbiBhcnJheSBvZiBpbWFnZXMgdGhhdCBjYW4gYmUgcmVuZGVyZWQgdG8gcGxheSBhbiBhbmltYXRpb25cblx0ICpcblx0ICogQGNsYXNzIEJpdG1hcFRleHRcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBleHRlbmRzIHJlbmRlcmVycy5SZW5kZXJpemFibGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHNwcml0ZSB0aGUga2V5IG9mIHRoZSBpbWFnZSBsb2FkZWQgYnkgTS5zcHJpdGVzXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IHggdGhlIHggY29vcmRpbmF0ZVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSB5IHRoZSB5IGNvb3JkaW5hdGVcblx0ICovXG5cdGZ1bmN0aW9uIEJpdG1hcFRleHQoc3ByaXRlLCB4LCB5KSB7XG5cblx0XHR0aGlzLmV4dGVuZHNSZW5kZXJpemFibGUoKTtcblx0XHRcblx0XHQvKipcblx0XHQgKiBUaGUgaW1hZ2UgdG8gcmVuZGVyXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcHJvcGVydHkgX3Nwcml0ZVxuXHRcdCAqIEB0eXBlIEhUTUxJbWFnZUVsZW1lbnRcblx0XHQgKi9cblx0XHR0aGlzLl9zcHJpdGUgPSBudWxsO1xuXHRcdFxuXHRcdGlmICggc3ByaXRlICkgdGhpcy5zZXRTcHJpdGUoc3ByaXRlKTtcblx0XHRcblx0XHR0aGlzLnNldExvY2F0aW9uKHggfHwgMCwgeSB8fCAwKTtcblx0XHRcblx0XHR0aGlzLlRZUEUgPSBNLnJlbmRlcml6YWJsZXMuVFlQRVMuQklUTUFQX1RFWFQ7XG5cdFx0XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgc3ByaXRlIG9mIHRoaXMgQml0bWFwVGV4dFxuXHQgKiBcblx0ICogQG1ldGhvZCBzZXRTcHJpdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHNwcml0ZSB0aGUga2V5IG9mIHRoZSBzcHJpdGUgbG9hZGVkIGJ5IE0uc3ByaXRlc1xuXHQgKiBAcGFyYW0ge2ludH0gZnJhbWVJbmRleCB0aGUgc3RhcnRpbmcgZnJhbWUgaW5kZXhcblx0ICovXG5cdEJpdG1hcFRleHQucHJvdG90eXBlLnNldFNwcml0ZSA9IGZ1bmN0aW9uKCBzcHJpdGUsIGZyYW1lSW5kZXggKSB7XG5cblx0XHRpZiAoICFzcHJpdGUgKSB0aHJvdyBuZXcgRXJyb3IoXCJJbWFnZSBjYW5ub3QgYmUgbnVsbFwiKTtcblxuXHRcdGlmICggc3ByaXRlIGluc3RhbmNlb2YgSW1hZ2UgKSB7XG5cdFx0XHRpZiAoICFzcHJpdGUuZnJhbWVzICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGJpdG1hcCBmb250IHJlcXVpcmVzIGVhY2ggZm9udCB0byBiZSBzcGVjaWZpZWQgYXMgYSBmcmFtZVwiKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX3Nwcml0ZSA9IHNwcml0ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHNwcnQgPSBzcHJpdGVBc3NldHNbIHNwcml0ZSBdO1xuXHRcdFx0aWYgKCBzcHJ0ICkge1xuXHRcdFx0XHR0aGlzLl9zcHJpdGUgPSBzcHJ0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW1hZ2UgYnkgaWQgXCIgKyBzcHJpdGUgKyBcIiBub3QgbG9hZGVkXCIpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMucmFpc2VFdmVudChcImF0dHJpYnV0ZUNoYW5nZWRcIiwgXCJzcHJpdGVcIik7XG5cdFx0XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblx0LyoqXG5cdCAqIEdldHMgdGhlIHNwcml0ZSBvZiB0aGlzIEJpdG1hcFRleHRcblx0ICogXG5cdCAqIEBtZXRob2QgZ2V0U3ByaXRlXG5cdCAqIEByZXR1cm4ge0ltYWdlfSB0aGUgc3ByaXRlIHVzZWQgYnkgdGhpcyBCaXRtYXBUZXh0XG5cdCAqL1xuXHRCaXRtYXBUZXh0LnByb3RvdHlwZS5nZXRTcHJpdGUgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fc3ByaXRlO1xuXHR9O1xuXHRCaXRtYXBUZXh0LnByb3RvdHlwZS5zZXRGaWxsU3R5bGUgPSBCaXRtYXBUZXh0LnByb3RvdHlwZS5zZXRTcHJpdGU7XG5cdEJpdG1hcFRleHQucHJvdG90eXBlLmdldEZpbGxTdHlsZSA9IEJpdG1hcFRleHQucHJvdG90eXBlLmdldFNwcml0ZTtcblx0Qml0bWFwVGV4dC5wcm90b3R5cGUuc2V0RmlsbCA9IEJpdG1hcFRleHQucHJvdG90eXBlLnNldFNwcml0ZTtcblx0Qml0bWFwVGV4dC5wcm90b3R5cGUuZ2V0RmlsbCA9IEJpdG1hcFRleHQucHJvdG90eXBlLmdldFNwcml0ZTtcblx0Qml0bWFwVGV4dC5wcm90b3R5cGUuc2V0VGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcblxuXHRcdGlmICggdGV4dCAhPSB0aGlzLl90ZXh0ICkge1xuXG5cdFx0XHR0aGlzLl90ZXh0ID0gdGV4dDtcblxuXHRcdFx0dGhpcy5fd2lkdGggPSAwO1xuXHRcdFx0dGhpcy5faGVpZ2h0ID0gMDtcblxuXHRcdFx0dmFyIGkgPSAwLFxuXHRcdFx0XHRqID0gdGV4dC5sZW5ndGgsXG5cdFx0XHRcdGNoYXJhY3RlcjtcblxuXHRcdFx0Zm9yICggdmFyIGkgPSAwLCBqID0gdGV4dC5sZW5ndGg7IGkgPCBqOyBpKysgKSB7XG5cblx0XHRcdFx0Y2hhcmFjdGVyID0gdGhpcy5fc3ByaXRlLmZyYW1lc1t0ZXh0W2ldXTtcblxuXHRcdFx0XHRpZiAoIGNoYXJhY3RlciA9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2hhcmFjdGVyICdcIiArIHRleHRbaV0gKyBcIicgaGFzIG5vdCBiZWVuIGRlZmluZWQgZm9yIHRoaXMgQml0bWFwVGV4dFwiKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuX3dpZHRoICs9IHRoaXMuX3Nwcml0ZS5mcmFtZXNbdGV4dFtpXV0ud2lkdGg7XG5cdFx0XHRcdHRoaXMuX2hlaWdodCA9IE1hdGgubWF4KHRoaXMuX2hlaWdodCwgdGhpcy5fc3ByaXRlLmZyYW1lc1t0ZXh0W2ldXS5oZWlnaHQpO1xuXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2hhbGZXaWR0aCA9IHRoaXMuX3dpZHRoIC8gMjtcblx0XHRcdHRoaXMuX2hhbGZIZWlnaHQgPSB0aGlzLl9oZWlnaHQgLyAyO1xuXG5cdFx0XHR0aGlzLnJhaXNlRXZlbnQoXCJhdHRyaWJ1dGVDaGFuZ2VkXCIsIFwidGV4dFwiKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cdEJpdG1hcFRleHQucHJvdG90eXBlLmdldFRleHQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fdGV4dDtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGNvbnN0cnVjdG9yJ3MgbmFtZVxuXHQgKlxuXHQgKiBAbWV0aG9kIHRvU3RyaW5nXG5cdCAqL1xuICAgIEJpdG1hcFRleHQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIFwiQml0bWFwVGV4dFwiO1xuICAgIH07XG5cdFxuXHRCaXRtYXBUZXh0LkRFRkFVTFRfRk9OVCA9IHtcblx0XHRzb3VyY2U6IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFiOEFBQUpCQ0FZQUFBRFdZN3VHQUFBQUFYTlNSMElBcnM0YzZRQUFBQVppUzBkRUFQOEEvd0Qvb0wybmt3QUFBQWx3U0ZsekFBQUxFd0FBQ3hNQkFKcWNHQUFBQUFkMFNVMUZCOTRCRnhBRUNSWFlUN2tBQUFBZGFWUllkRU52YlcxbGJuUUFBQUFBQUVOeVpXRjBaV1FnZDJsMGFDQkhTVTFRWkM1bEJ3QUFFMzVKUkVGVWVOcnQzVTF1R3pzV2dGRldvRjE1cEVBemVlQU5HWW4zWk0wRTFNandvZ1NqZXBDVTBuSGlGMHVxbjB2ZWMwWUJHZzh0czBoK0tsdEZkY013RlA3VVAzVkRLYVZzdncyZDBjQjhoTGJtNCtiOHI1ZDdGWnhDNitONDk5d1pkL014M1h3MHY1cXpNUVJjdFFsRWlhQk55WHlNL0tZTThjT21JM3FJSU9LSFRVZjBFRUhFRDV1TzZDR0NpQjgySGRGREJCRS82dHQwK3VPaGxITEZSNkpGajBqemtlWjhNUVFBaUI4QWlCOEFpQjhBaUI4QWlCOEFpQjhBeEJIbU9iL3grWnVwYlhmN1ZCZlVPTVlleDJ6TVIvTlIvQmEyZlR6OStNZnJnNnRzSERFZklYYjh2bjR2azV5OE1EeVcxQ2VFR01lSk5sc25nWmlQNW1PVC9NMFBBUEVEQVBFREFQRURBUEVEQVBFREFQRURBUEVEQVBFRGdNV0VPK0ZsZURzTkxvdHhCRWdSdi9PWmZSaEg0UGQxSGV4WXMvNnBHeUsrcmpydi9CeFVheHlCdjN1NTk1dWNpZm1iSHdEaUJ3RGlCd0RpQndCMTJ4Z0NidFVmRHdZQmNPY0hBTzc4YUZyTnovb0E3dnhnY3YxVE40d1B4QUs0ODZNZEhzQUYzUGtCZ1BnQmdQZ0JnUGdCd0lMQ2ZPQmxyZ2VsdDd0OXFndHFITUc2cHFMNFRiNVpqOCtlK1NUaWJlTTRmaitncjBvQ3hHK0JhSEdUcjkvTEpPTTRQQlp2SHNEKzJCeC84d05BL0FCQS9BQkEvQUJBL0FCQS9BQkEvQUJBL0FCQS9BQmdNYjdNdGxIRDI4bkpMSmlQSUg0NW5NL2k1TFp4REhhTVZQL1VEUkZmbC9sb1Bvb2ZNVGlBZWhvT1JEY2Z6Y2VtK1pzZkFPSUhBT0lIQU9JSEFPSUhBT0lIQU9JSEFJRjR6bzlaOU1mREpQLzlkcmMzbUt3K0h4RS91R2lUdWZZRWlQRy9PNThrSVlLc09COFJQMWgwa3hGQlJBL3hJKzBtSTRLSUh1SkgyazFHQkJFOXhJKzBtNHdJSW5wTUVyOVdQdzIxOU0rVjVWTmxVVGFaOXhIRWZEU09mQ3Arclc0YVMvOWNXVGJmcU8rc1JkQjhOSTVjb2hzRzF4YUFYSnp3QW9ENEFZRDRBWUQ0QVlENEFZRDRBWUQ0QVlENEFZRDRBWUQ0QVlENExheC82Z2JuK3JuK1hvOTFaQnpiZk4yL3Z0TG81ZDRFWFVOdDQzNzMzQm1YaW40dTY5cjE1eC94US9RdWVkMUxSUkJBL0VSUEJBSEVUL1JFRUVEOFJFOEVBY1JQOUVRUVFQeEViOGx4NkkrSFVrb3AyMitER0FKaGVNNFBBUEVEQVBFREFQRURBUEVEQVBFREFQRURnRURDUE9jM1BnK0djUVJ3NXdjQXJkNzVqWndFWWh3QjNQa0JnUGdCZ1BnQmdQZ0JnUGdCa0Y3LzFBMzlVemVVNHZ2OEFLalZEZCtmNnM0UGdIVEVEd0R4QXdEeEE0REdoUG5BUzdUanVNWlBCRGttTE9jNHV1NGdmc3U0NFZNN0dIL2pBVnpDcnowQkVEOEFFRDhBRUQ4QUVEOEFFRDhBRUQ4QUVEOEFXSSt2TkFLZ0xoTWNRaUYrQUtTSm52Z0JrQzU2NGdkQXV1aUpId0Rwb2hjdWZ2M3g0SUlISHYvdGJtODhKcEJ0SENGYTlOejU4V09ULy9sOWV4OXUxdVAzMnZtS245dWlaeHdoUlBUQ3hzK1hpQnB2NHdPaTU4NFBZR0hqYjBTOCtXa3ZldUlIMkJ5WjFmbHYzQ3RmejcvOURWLzhBR2p6RHY1ZDlQNy9UbDc4QUVnVFBmRURJRjMweEErQWRORVRQd0RTUlUvOEFFZ1hQZkVEb0dxM1BJY3BmZ0NraVo3NG1SU0FkWlNXK0xYR3lSaGdIV1c1UG5mUFY3OUorV0lVQWFnMmdsZStVUkUvQU5KRlVQd0FTQmRCOFFNZ1hRVEZENEIwRWZScFR3Qm1NWjdFTWo0NmN2NlM0UEY3L3BhTTRMdlhJMzRBTEdMMUNMcnpXK0Nkem9vWE5kSTRnSFZrSFVXTW9QZzEvTTRtd21KMVVnYldrWFVVOFRxTG44VnJzV0lkV1VmcHJyUDRXYndXSzlhUmRaVHVPb3VmeFd1eFloMVpSK211cy9oWnZCWXIxcEYxbE80NmJ6NjZHQ3g3VVd0OS9VdHREcTFZK3VkcWZWMWJSem11L3h6WGVWUHJwTEY0RzEyc2pjN0hwWCt1Yk92YU9zcHgvYWU4enQwd2FCOEF1VGpiRXdEeEF3RHhBd0R4QXdEeEF3RHhBd0R4QXdEeEF3RHhBd0R4QTREbTQ5Yy9kWU56UmdGWXdxK3ZOSHE1RjU0cEdNZDEzRDEzcm12Zzhjc3k3a3VOby9rNFlmeWdoVGNkVVRkeDQ1ZGpjemNQcXhsSDhjT2lJYzc0dFhKSFl4NkdIMGZ4dzZKaC9mRnI5ZGQ0NW1IWWNSUS9MQnJXRzc4c2Z5TTNEOE9Oby9pUmF0SDB4ME1wWmY1djByYnBpSjRJeGg1SDhRT1dleFBoMDlEZWpBVVpSdys1QTVDTytBRWdmZ0FnZmdBZ2ZnQWdmZ0FnZmdBUW1lZjhHak0rN3pLMTdXN2Z4T3R4WFkyamNUU080c2UvSitQNDBHaVFoNU9qdlI3WE5mazRQcDUrL09QMXdXQlVObzdpMS9ybTV2VzRydnpoNi9jeXlUZ09qMlV3am5XT283LzVBWkNPK0FFZ2ZnQWdmZ0FnZmdBZ2ZnQWdmZ0FnZmdBZ2ZnQ3dIaWU4QUhDVjRlMVU3UWszNGdmQVJjNW5jYnJ6QXlDTkJnN3k5amMvQU5JUlB3REVEd0RFRHdERUR3REVEd0RFRHdBaTg1d2ZBRlhxandmeEF5Qm45TGJmaGs3OEFCQTk4UU5BOU1RUGdLVFJFejhBMGtWUC9BQ1lKRTV6bVNONjRnZEFTSE5HVC93QUNCK3B1VGpoQllCMHhBOEE4UU1BOFFNQThRTUE4UU1BOFFNQThRTUE4UU9BOVRqaEJVaG5lRHNOUmtIOFFvaDJURTcvMUEwUlh4ZHd3ejd6ZURJSUJMdnplN24zVGd5WTErdURNYUNVNG05K0FJZ2ZBSWdmQUlnZkFJZ2ZBSWdmQUlnZkFJVGloQmRnTWYzeFVFb3BaYnZiR3dmRUQ4aGhQREhwZklKU3NnaStqNTRUcE1RUEVFSFJRL3dBRVJROXhBOFFRZEZEL0FBUkZEMXVqSjlQSDgweitmMWNiYndlMTNYZENOWWFjZk14Y1B4cW5WemhOcEZHeHpIYXo3WDA2M0ZkUlRCVTlPelhrK21Hd1ZnQ2tJc1RYZ0FRUHdBUVB3QVFQd0FRUHdBUVB3QVFQd0FRUHdBUVB3QVFQd0FRUDBpc2Yrb0c1enJtSGNkb3I3dUYrWGo5VnhxOTNOZjFnOTg5TC9QVklyV05TOVJ4Tk83R3hUajZ1VUxGcjliQkdsOTMxTTNiT0ZxOFFNRDR0YkxKaUdBYjR5aDZ3S3p4YS8xMlh3VHJHa2ZSQTJhTlg1Wk5SZ1RyR0VmUkEyYU5YOVpOUmdSampxUG9BYlBHenliejJ6ajB4ME1wcFpUdHQwRU0xeGhIOHhHWWtlZjhBQkEvQUJBL0FCQS9BQkEvQUJBL0FCQS9BQWhrRStXRmpNK0RUVzI3MjZlNm9NWXg5ampXK25Pc2ZmMWJ1UjZJMyt5Mmo2Y2YvM2g5Y0pXTll6cFRmZGZhK1hBQ2h3NGdmdlA2K3IxTWNxTEs4RmhTTDFiak9GSDhLejNocDlXVGlaeTR4RlQ4elE4QThRTUE4UU1BOFFNQThRTUE4UU1BOFFNQThRTUE4UU9BeFd3TVFadUd0NVBqcUFERUw0ZnpXWnpjTm82TzBRTHhveUlPb0o3RzNBYzUzejJMSzZ6STMveGdyYmo2cGdRUVB4QkJRUHhBQkFIeEF4RUV4QTlFRUxpS1QzdEM5QWlXVXZyam9aVGlFUXh3NXdjQTd2eUlaTHhUdWZXLzMrNzJCaE1RUCtxSzNyVy9waHYvdS82cEcwUVFFRCthanA0SUF1SkgydWlKSUNCK3BJMmVDQUxpUjlyb2lTQWdmcVNOM3I4aUdKMUlnL2hSb2FnUFdVZVA0SG5jbk5vQzRvZm9aWDJkd0xxYzhBS0FPNy9hRFc4bnYxYWF3L2pyT3Q5QURvaGY0T2k5UHJpNklnalFadnhFVHdRQjBzUlA5RVFRSUUzOFJFOEVBZExFVC9SRUVDQk4vRVN2N2dqNkJuSkEvRVFQQVBFVFBRQVN4Kzk4NEsvWUFmeStQL3F6UWZ0M2ZsQktjUUEwV0EremNyWW5BT0lIQU9JSEFPSUhBSFh6Z1pmR3ZIK29mUHhtOC9PbmFRRVF2OWFKSUlENGlhQUlBdnlLMy9uWFpaVnZpbitjSmVuNUdCRnNZRDRUWkY5SnZsNWFtbytiVmpaRm00UUl0cnpKT09IRGVqRWZaNHBmclJmWkptRlIyMlN3WHN6SG0rTlh5MFcyU1ZqVU5obXNGL054OHZoRnZjZzJDWXZhSm9QMVlqN09IcjhvRjlrbVlWR0xIdGFMK2JoNC9ENjZ5R3ROc21zdjZ0S1RxTFZGYlJ6WG5jOVJOa2RpN285WjV1TXE4VnZySWw4Y3ZhVTM2MG9uZTdoTk5zazRWaE05OHpwRkJEUCs1cUViQm5NYmdGd2NiQTJBK0FHQStBR0ErQUdBK0FHQStBR0ErQUdBK0FHQStBR0ErQUZBOC9Icm43b2gwamw0MFY2UGNYUmRqYU54WkxweC9IV3c5Y3Q5bXhkZzZaL0xPTHF1cnF0eE5JN3UvQUJBL0FCQS9BQkEvQUJBL0FCQS9BQkEvQUJBL0FCQS9BQkEvQUFRUHdBUVB3QVFQd0JvdzhZUUFOU2xQeDZhL0xtMnU3MzRBZkF1ZW8xKzk5LzIyOUNWVWhiOXFpYnhBNmd0RXR6TTMvd0FFRDhBRUQ4QUVEOEFFRDhBRUQ4QUVEOEFFRDhBRUQ4QVdJd1RYb0EwbkpDQytJRk5PNThGejQ1RS9BQ2JOdWFQK0FFZ2V1SUhnT2lKSHdDaUozNEFpSjc0d1pMNjQrSEQvMjI3MjZmN21SRTk4WU9Xby9mVTJWd1FQZkdEWEQ3MWZGMmpHNUZuQ3hFL2dML2NFUXNrcTg3REczNDFMMzd3R1JsL3plUlhhMVFTdld2ZWhJa2ZBR21pSjM0QXBJdWUrQUdRTG5yaUIwQzY2SWtmckxDSXA5THFnL1hrbnRkL3pQTVpQMDBzZmxDUjgyYmdrNWhrbU9jekVqOW9aREhYZE1lUS9jNjFsYVBqYXA3WDRnY3N2bG1lSDVKUEZzRWwvcGFGK0FFaUtIb2tpNSsvaVlBSWloNXA0aWQ2SUlLaVI1cjRpUjZJb09pUkpuNmlCeUlvZXFTSm4raUJDSW9lYWVJbmVwQTJnbEgyQWRFVFA5RURSQm54RXowQXhPK3o3NkRHMytXTFhWUHZSTDB6QnZ2TTNNNS9FNzdnZFozajU4eTkzOGVoV3RIZVBIZ3pBKzFwWUYxdjNwZmNtWHZ1V0FCYXQvbm9kdGFaZXdDa2lWK1dDSW9lZ1BpVkxCRVVQUUErL1dsUForNEJrQzUrdFVaUTlBQzRPWDYxUkZEMEFKZzhmbEVqdUhiMFBDOVp4MjhBQVBHYnhOb1JqSEtubC8xNXllalI4eHNBWU5MNHJiWDVSOTNjUkZEMGdFVHhXMnJ6cjJWekUwSFJBeExGYjY3TnY5Yk5UUVJGRDBnVXY2azIvMVkyTnhFVVBTQlIvRDdhL0svOTcydDM2eml3N0x5STltblI3SjllOWZQNzlISjE4YnQyODIvMUhiMElCbzllc091U2ZaNzQrZTBUVSttR3dWZ0NrTXNYUXdDQStBR0ErQUdBK0FHQStBR0ErQUdBK0FHQStBR0ErQUdBK0FIQVREYUdvQzNuYjR2dzdRWmdMZkxoZGJrK2ZpLzNkUjBLZXZjY2N3SkdHY2Zhcm1mVTYyOGN6V0hqMHVpZFg2MERPYjd1S0l2WGhNeDkvWTJqdFVRbDhXdGxncTI5ZUMxVW03ZHh0SmFvSUg2dFRyQ2xGNitGYXZNMmp0WVNGY1F2eXdTYmUvRmFxRFp2NDJndFVVSDhzazZ3cVJldmhXcnpObzZpUndYeE04RitHNGYrZUNpbFhQRXhaZU9ZKy9vejNUaGFTOHpJUSs0QWlCOEFpQjhBaUI4QWlCOEFpQjhBaUI4QUJCTG1LNDNHNTRHbXR0M3RYZVVWeDM5dFMxOS80OWplWExhSHRMa21tdjArdiszajZjYy9YaC9NdnYrYW1EKy8yNnE1Nno4K1ZMM1FnOUxHMFI2Q083K2JmUDFlSmpsUlkzZ3NUb2U0WkhQRE9EYm0xcjNFSHRMMkd2RTNQd0RTRVQ4QXhBOEF4QThBeEE4QXhBOEF4QThBeEE4QXhBOEExck14QkVDTGhyZVRFMW9RUHlDSDg1bWNhNytPaVkvekdzK1ByZTBvdmFpdlYveTRUc0tEam8xTEphSWNSRzB1TERNT2Q4OVh4Vlg4c0tDQit2ZWtDeU1vZm9nZWtDNkM0b2ZvQWVraUtINklIcEF1Z3VLSDZIR1Qvbmd3Q0ZRWFFmRkQ5SUEwZTl6NFprMzhnSnZVOXR3WmlCKzg0MWQ0RTQ5bnBROW1JMzZRTW5vMjZ3djRsVG5pQjZJSGlCK0lIaUIrSUhxQStJSG9BZUtIT00xbjd1aTErbW5SN1c1ZjNaeFk0elZIbkF2bXBQaVIyT3pSKy9tUi9tYkhiY0ZQZE40NmxtdTg1cEJ2S00xSjhVT2t2RzVqbWUzbk1TZi8yeGREQUlENEFZRDRBWUQ0QVlENEFZRDRBWUQ0QVlENEFZRDRBY0JTd3Azd01yeWRmREVtQURuaXQzMDh1UnFKUlR1S2FUd1gwUkZSSUg3emVuMXdOVEpyNVJEaTVJY3BZMDdXd3QvOEFCQS9BQkEvQUJBL0FCQS9BQkEvQUJBL0FBamsvSnhmZnp5VVVrclo3dmFwQjJRY0I4QTZvdDA1ZVk3ZmVKTEYrV1NMWkJGOFB6Qk85Z0RyaUhibjVCOG52R1NMb01VSzFoSDU1dVNIeDV1MUhrR0xGYXdqOHM3SmY1N3QyVm9FTFZhd2pqQW5QMzJ3ZGUwUnRGakJPc0tjdkRoK0gwV3dObk12MWxvLzVlYlRlY1l4MGpweUxZekQzSE55Yyt2L1VTMFJuRDE2bGI0WnFQVjFHMGZSTTZlTnd5MXpzaHNHOHdTQVhKendBb0Q0QVlENEFZRDRBWUQ0QVlENEFZRDRBWUQ0QVlENEFZRDRBWUQ0TGF4LzZnWm5CQnBIb0UxWEgyeGRYdTV0YU1iRnVGL3I3cmt6amcyUEl3M0d6K2FPelhxNjF4MWw4emFPaUovb0lYcHBObS9qaVBpSkhxS1hadk0yam9pZjZDRjZhVFp2NHdnZnhFLzBFTDMyTm0vaktJSjhFRC9SUS9UQ2prTi9QSlJTU3RsK0d6cmp1TUk0MGh6UCtRRWdmZ0FnZmdBZ2ZnQWdmZ0Jjd2RtMzY5a1lBb0IvOEtsWmQzNEE0TTV2cXR2L244L2YxSzZWbitPOTdXNmZhbUhNZFIyTm8zRkUvTnBhNUg1dnozOXQxbytuSC85NGZUQVl4aEh4Kzh2a3J2VGtoZVpQakVqNk40K3YzOHNrMTNWNExLbmZIQmxIb3ZFM1B3RGMrWUU3UGtEOEVEMEE4VVAwQU1RUDBRTVFQMFFQUVB3UVBRRHhRL1FBeEEvUkF4QS9SQytDNGUxay9Jd2o0amVmNW84SEU3MnFuTStReERnUzNuaTI4aVVkaVhQbk4vZG1mZmVjSTY2aU53MEhKeHRIbXQ1M051a3VUcXNSRkQwQThVc1RRZEVERUw4MEVSUTlBUEZMRTBIUkF4Qy9OQkZNRnIzK2VQandmOXZ1OXVsK1prRDhGb25NdUJHdC9naEd0dWo5L01neWVHT0MrR1crRTAyMldYenF6VWFqYndnODYrck5HT0pISTlHem9VKzdDVjg2bnVmZllEVDZxMkp2U0JBLzJvcGV4Zy8yelBBemo5ZmhIRThSQlBIRG5WNjJPeGdSQlBGRDlFUlFCQkUvRUQwUkJQRUQwUk5CRUw4bE45ZkpGcmZGTEhybTQ4VVJEQjl0NnpyRmVuSG5kODNpR0w5SHpGZXFpSjc1MkV3RXovUFFNWDh4OW9tS240TU1GNyt2Mzhza20rendXQ3lPS1RlYnBMTE9SMjkyYUgyZWZISDVBTWhHL0FBUVB3Q1cwVDkxUTZTL20wVjdQWFB5cUFQQXYwVDdnSTBQL0xqekF3RHhBd0R4QXdEeEEwRDhBQ0NYY0ovMkhONU9Qc1dFK1Fqa2lOLzU3RU13SDRFMGQzNE9vQ2FTVnVhajU4SGdyL3pORHdEeEF3RHhBd0R4QXdEeEF3RHhBd0R4QTRCQXpzLzU5Y2RES2FXVTdXNmZla0RHY1NER2RUQWZ6VWZqeUt6eDIzNGJ1bEorZkpOdnhrM24vZUlZeDROMW1JL21vM0Zra2ZobDNYUXNEaEUwSDQwajRwZG0wN0U0Uk5COEZEM0VMODJtWTNHSW9Qa29ldkRwZzYxcjMzUXNEaEUwSDBVUExvN2ZSNXRPclp0bWJZc2E4OUU4TW83Mmh4WGpWK3VtVTAzMEt0M0VSVERZWnAxa0htVWJSL3ZEZFA0SENjN3NhZkhZWnVNQUFBQUFTVVZPUks1Q1lJST1cIixcblx0XHRmcmFtZXM6IHtcblx0XHRcdFwiQVwiOiB7eDogMCwgeTogMCwgd2lkdGg6IDc2LCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiQlwiOiB7eDogODQsIHk6IDAsIHdpZHRoOiA3NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIkNcIjoge3g6IDE2NiwgeTogMCwgd2lkdGg6IDc2LCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiRFwiOiB7eDogMjQ4LCB5OiAwLCB3aWR0aDogNzYsIGhlaWdodDogNzN9LFxuXHRcdFx0XCJFXCI6IHt4OiAzMjgsIHk6IDAsIHdpZHRoOiA3NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIkZcIjoge3g6IDAsIHk6IDg0LCB3aWR0aDogNzYsIGhlaWdodDogNzN9LFxuXHRcdFx0XCJHXCI6IHt4OiA4NCwgeTogODQsIHdpZHRoOiA3NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIkhcIjoge3g6IDE2NCwgeTogODQsIHdpZHRoOiA3NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIklcIjoge3g6IDI0NiwgeTogODQsIHdpZHRoOiA0NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIkpcIjoge3g6IDI5NCwgeTogODQsIHdpZHRoOiA3NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIktcIjoge3g6IDM3NCwgeTogODQsIHdpZHRoOiA3NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIkxcIjoge3g6IDAsIHk6IDE2OCwgd2lkdGg6IDc2LCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiTVwiOiB7eDogODIsIHk6IDE2OCwgd2lkdGg6IDExOCwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIk5cIjoge3g6IDIwMCwgeTogMTY4LCB3aWR0aDogNzYsIGhlaWdodDogNzN9LFxuXHRcdFx0XCJPXCI6IHt4OiAyODQsIHk6IDE2OCwgd2lkdGg6IDc2LCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiUFwiOiB7eDogMzY0LCB5OiAxNjgsIHdpZHRoOiA3NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIiBcIjoge3g6IDQzNiwgeTogMTY4LCB3aWR0aDogMjQsIGhlaWdodDogNzN9LFxuXHRcdFx0XCJRXCI6IHt4OiAwLCB5OiAyNTIsIHdpZHRoOiA3NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIlJcIjoge3g6IDgyLCB5OiAyNTIsIHdpZHRoOiA3NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIlNcIjoge3g6IDE2NCwgeTogMjUyLCB3aWR0aDogNzYsIGhlaWdodDogNzN9LFxuXHRcdFx0XCJUXCI6IHt4OiAyNDYsIHk6IDI1Miwgd2lkdGg6IDc2LCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiVVwiOiB7eDogMzMwLCB5OiAyNTIsIHdpZHRoOiA3NiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIlZcIjoge3g6IDAsIHk6IDMzNiwgd2lkdGg6IDc2LCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiV1wiOiB7eDogODQsIHk6IDMzNiwgd2lkdGg6IDExMywgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIlhcIjoge3g6IDIwMCwgeTogMzM2LCB3aWR0aDogODEsIGhlaWdodDogNzN9LFxuXHRcdFx0XCJZXCI6IHt4OiAyODQsIHk6IDMzNiwgd2lkdGg6IDgwLCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiWlwiOiB7eDogMzY0LCB5OiAzMzYsIHdpZHRoOiA4MSwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIjBcIjoge3g6IDAsIHk6IDQyMSwgd2lkdGg6IDgxLCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiMVwiOiB7eDogODEsIHk6IDQyMSwgd2lkdGg6IDgxLCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiMlwiOiB7eDogMTI4LCB5OiA0MjEsIHdpZHRoOiA4MiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIjNcIjoge3g6IDIxMCwgeTogNDIxLCB3aWR0aDogODMsIGhlaWdodDogNzN9LFxuXHRcdFx0XCI0XCI6IHt4OiAyOTMsIHk6IDQyMSwgd2lkdGg6IDgyLCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiNVwiOiB7eDogMzc0LCB5OiA0MjEsIHdpZHRoOiA4MiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIjZcIjoge3g6IDAsIHk6IDUwNSwgd2lkdGg6IDgyLCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiN1wiOiB7eDogODIsIHk6IDUwNSwgd2lkdGg6IDgyLCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiOFwiOiB7eDogMTY0LCB5OiA1MDUsIHdpZHRoOiA4MiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIjlcIjoge3g6IDI0NiwgeTogNTA1LCB3aWR0aDogODIsIGhlaWdodDogNzN9LFxuXHRcdFx0XCI6XCI6IHt4OiAzMjcsIHk6IDUwNSwgd2lkdGg6IDM3LCBoZWlnaHQ6IDczfSxcblx0XHRcdFwiLlwiOiB7eDogMzY0LCB5OiA1MDUsIHdpZHRoOiAzNiwgaGVpZ2h0OiA3M30sXG5cdFx0XHRcIi1cIjoge3g6IDQwMCwgeTogNTA1LCB3aWR0aDogNDcsIGhlaWdodDogNzN9XG5cdFx0fVxuXHR9XG5cdFxuICAgIEJpdG1hcFRleHQubmFtZSA9IFwiQml0bWFwVGV4dFwiO1xuXG5cdE0uZXh0ZW5kKCBCaXRtYXBUZXh0LCBSZW5kZXJpemFibGUgKTtcblxuXHRuYW1lc3BhY2UuQml0bWFwVGV4dCA9IEJpdG1hcFRleHQ7XG5cbn0pKE1hdGNoLnJlbmRlcml6YWJsZXMsIE1hdGNoLCBNYXRjaC5yZW5kZXJpemFibGVzLlJlbmRlcml6YWJsZSwgTWF0Y2guc3ByaXRlcy5hc3NldHMpOyIsIi8qKlxuICogQG1vZHVsZSBNYXRjaFxuICovXG4oZnVuY3Rpb24oTSkge1xuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyBhIGNhbGxiYWNrIG9uY2UgcGVyIGludGVydmFsXG5cdCAqXG5cdCAqIEBjbGFzcyBUaW1lclxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQGV4dGVuZHMgR2FtZU9iamVjdFxuXHQgKiBAcGFyYW0ge2ludH0gaW50ZXJ2YWwgdGltZSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIGNhbGxpbmcgdGhlIGNhbGxiYWNrXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZFxuXHQgKiBAcGFyYW0ge09iamVjdH0gW293bmVyXSBvYmplY3QgdG8gYXBwbHkgdGhlIGNhbGxiYWNrIHRvXG5cdCAqL1xuXHRmdW5jdGlvbiBUaW1lciggaW50ZXJ2YWwsIGNhbGxiYWNrLCBvd25lciApIHtcblx0XHQvKipcblx0XHQgKiBJbnRlcnZhbCB0aW1lIGluIG1pbGxpc2Vjb25kcyBiZWZvcmUgY2FsbGluZyB0aGUgY2FsbGJhY2tcblx0XHQgKiBAcHJvcGVydHkgaW50ZXJ2YWxcblx0XHQgKiBAdHlwZSBpbnRcblx0XHQgKi9cblx0XHQvKipcblx0XHQgKiBUaW1lIGluIG1pbGxpc2Vjb25kcyB3aGVuIHRoZSBsYXN0IHRpY2sgdG9vayBwbGFjZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHByb3BlcnR5IF9sYXN0VGltZVxuXHRcdCAqIEB0eXBlIGludFxuXHRcdCAqL1xuXHRcdC8qKlxuXHRcdCAqIE9iamVjdCB0byBhcHBseSB0aGUgY2FsbGJhY2sgdG9cblx0XHQgKiBAb3B0aW9uYWxcblx0XHQgKiBAcHJvcGVydHkgb3duZXJcblx0XHQgKiBAdHlwZSBPYmplY3Rcblx0XHQgKi9cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkXG5cdFx0ICogQHByb3BlcnR5IGNhbGxiYWNrXG5cdFx0ICogQHR5cGUgRnVuY3Rpb25cblx0XHQgKi9cblx0XHRcblx0XHR0aGlzLmludGVydmFsID0gaW50ZXJ2YWw7XG5cdFx0dGhpcy5fbGFzdFRpbWUgPSBNLmdldFRpbWUoKTtcblx0XHRpZiAoIG93bmVyICkge1xuXHRcdFx0dGhpcy5vd25lciA9IG93bmVyO1xuXHRcdFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnRpY2sgPSBjYWxsYmFjaztcblx0XHR9XG5cdFx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblx0fVxuXHRcblx0XG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIGludGVydmFsIGhhcyBiZWVuIHJlYWNoZWQgYW5kIGNhbGxzIHRoZSBjYWxsYmFja1xuXHQgKiBAbWV0aG9kIG9uTG9vcFxuXHQgKi9cblx0VGltZXIucHJvdG90eXBlLm9uTG9vcCA9IGZ1bmN0aW9uKHApIHtcblxuXHRcdGlmICggdGhpcy5lbmFibGVkICYmIE0uZWxhcHNlZFRpbWVGcm9tKCB0aGlzLl9sYXN0VGltZSwgdGhpcy5pbnRlcnZhbCApICkge1xuXG5cdFx0XHR0aGlzLnRpY2soKTtcblx0XHRcdHRoaXMuX2xhc3RUaW1lID0gTS5nZXRUaW1lKCk7XG5cblx0XHR9XG5cblx0fTtcblx0LyoqXG5cdCAqIENhbGxzIHRoZSBjYWxsYmFja1xuXHQgKiBAbWV0aG9kIHRpY2tcblx0ICovXG5cdFRpbWVyLnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jYWxsYmFjay5jYWxsKHRoaXMub3duZXIpO1xuXHR9O1xuXHRcblx0TS5UaW1lciA9IFRpbWVyO1xuXG59KSh3aW5kb3cuTWF0Y2gpOyIsIi8qKlxuICogQG1vZHVsZSBNYXRjaFxuICovXG4oZnVuY3Rpb24oTSkge1xuICAgIFxuICAgIC8qKlxuXHQgKiBVc2VkIGZvciBrbm93aW5nIGlmIHRoZSBnaXZlbiBhbW91bnQgb2YgbWlsbGlzZWNvbmRzIGhhdmUgcGFzc2VkIHNpbmNlIGxhc3QgY2hlY2suXG4gICAgICogVGhpcyBjbGFzcyBpcyB1c2VmdWxsIGZvciBvYmplY3RzIGxpa2Ugd2VhcG9ucyBhbmQgZGV0ZXJtaW5pbmcgaWYgaXQgY2FuIGZpcmUgYWdhaW5cbiAgICAgKiBvciBub3QgZ2l2ZW4gaXRzIHJhdGUtb2YtZmlyZVxuXHQgKiBAY2xhc3MgVGltZUNvdW50ZXJcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7dGltZX0gaW50ZWdlciBUaW1lIGluIG1pbGxpc2Vjb25kcyB0aGF0IG5lZWQgdG8gcGFzcyBmcm9tIGxhc3QgY2hlY2tcblx0ICovXG5cdGZ1bmN0aW9uIFRpbWVDb3VudGVyKHRpbWUpIHtcblx0XHQvKipcblx0XHQgKiBMYXN0IHRpbWUgaW4gbWlsbGlzZWNvbmRzIHRoYXQgdXBkYXRlIHdhcyBjYWxsZWRcblx0XHQgKiBAcHJvcGVydHkgX2xhc3RUaW1lXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAdHlwZSBpbnRcblx0XHQgKi9cblx0XHR0aGlzLl9sYXN0VGltZSA9IDA7XG5cdFx0LyoqXG5cdFx0ICogVGltZSBpbiBtaWxsaXNlY29uZHMgdGhhdCBuZWVkIHRvIHBhc3MgZnJvbSBsYXN0IGNoZWNrXG5cdFx0ICogQHByb3BlcnR5IF9sYXN0VGltZVxuXHRcdCAqIEB0eXBlIGludFxuXHRcdCAqL1xuXHRcdHRoaXMudGltZSA9IHRpbWU7XG5cblx0fVxuXHRUaW1lQ291bnRlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX2xhc3RUaW1lID0gTS5nZXRUaW1lKCk7XG5cdFx0dGhpcy5lbGFwc2VkID0gdGhpcy5fcnVuO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblx0LyoqXG5cdCAqIFNldHMgdGhlIHRpbWUgaW50ZXJ2YWxcblx0ICogQG1ldGhvZCBlbGFwc2VkXG5cdCAqIEBwYXJhbSB7aW50ZWdlcn0gdmFsdWUgdGhlIGludGV2YWxcblx0ICovXG5cdFRpbWVDb3VudGVyLnByb3RvdHlwZS5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5lbGFwc2VkID0gdGhpcy5pbml0aWFsaXplO1xuXHRcdHRoaXMudGltZSA9IHZhbHVlO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiB0aW1lIGhhcyBlbGFwc2VkIHNpbmNlIGxhc3QgdXBkYXRlIG9yIGZhbHNlXG5cdCAqIEBtZXRob2QgZWxhcHNlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0VGltZUNvdW50ZXIucHJvdG90eXBlLl9ydW4gPSBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBjdXJyZW50VGltZSA9IE0uZ2V0VGltZSgpO1xuXG5cdFx0aWYgKCBjdXJyZW50VGltZSAtIHRoaXMudGltZSA+PSB0aGlzLl9sYXN0VGltZSApIHtcblx0XHRcdHRoaXMuX2xhc3RUaW1lID0gY3VycmVudFRpbWU7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cblx0fTtcblx0LyoqXG5cdCAqIFJlc2V0cyB0aGUgY291bnRlclxuXHQgKiBAbWV0aG9kIHJlc2V0XG5cdCAqL1xuXHRUaW1lQ291bnRlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVsYXBzZWQgPSB0aGlzLmluaXRpYWxpemU7XG5cdH07XG5cblx0VGltZUNvdW50ZXIucHJvdG90eXBlLmVsYXBzZWQgPSBUaW1lQ291bnRlci5wcm90b3R5cGUuaW5pdGlhbGl6ZTtcblxuXHRNLlRpbWVDb3VudGVyID0gVGltZUNvdW50ZXI7XG5cblx0fSkod2luZG93Lk1hdGNoKTsiLCIoZnVuY3Rpb24gKG5hbWVzcGFjZSwgU2ltcGxlTWFwLCBNKSB7XG5cblx0ZnVuY3Rpb24gU3RvcmVBcyhuYW1lLCBhdHRyaWJ1dGVzKSB7XG5cdFx0dGhpcy5uYW1lID0gbmFtZTtcblx0XHR0aGlzLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuXHR9XG5cdFN0b3JlQXMucHJvdG90eXBlLmFzID0gZnVuY3Rpb24oYWN0dWFsTmFtZSkge1xuXHRcdHZhciB2YWx1ZSA9IE0uZ2FtZS5hdHRyaWJ1dGVzW2FjdHVhbE5hbWVdO1xuXHRcdGlmICggdHlwZW9mIHZhbHVlID09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdHZhbHVlID0gbmV3IHZhbHVlO1xuXHRcdH1cblx0XHR0aGlzLmF0dHJpYnV0ZXMuc2V0KHRoaXMubmFtZSwgdmFsdWUpO1xuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXHRcblx0ZnVuY3Rpb24gU2hvd3NBcyhuYW1lLCB2aWV3cykge1xuXHRcdHRoaXMubmFtZSA9IG5hbWU7XG5cdFx0dGhpcy52aWV3cyA9IHZpZXdzO1xuXHR9XG5cdFNob3dzQXMucHJvdG90eXBlLmFzID0gZnVuY3Rpb24ocmVuZGVyaXphYmxlTmFtZSkge1xuXHRcdHZhciB2YWx1ZSA9IE0ucmVuZGVyaXphYmxlc1tyZW5kZXJpemFibGVOYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcmVuZGVyaXphYmxlTmFtZS5zdWJzdHIoMSldO1xuXHRcdGlmICggdHlwZW9mIHZhbHVlID09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdHZhbHVlID0gbmV3IHZhbHVlO1xuXHRcdH1cblx0XHR0aGlzLnZpZXdzLnNldCh0aGlzLm5hbWUsIHZhbHVlKTtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH07XG5cblx0ZnVuY3Rpb24gRW50aXR5KG5hbWUsIGRlZmluaXRpb24pIHtcblx0XHR0aGlzLmV4dGVuZHNFdmVudEhhbmRsZXIoKTtcblx0XHRcblx0XHRpZiAodHlwZW9mIG5hbWUgIT0gXCJzdHJpbmdcIikge1xuXHRcdFx0ZGVmaW5pdGlvbiA9IG5hbWU7XG5cdFx0XHRuYW1lID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLm5hbWUgPSBuYW1lIHx8IChcIlVubmFtZWQgRW50aXR5XCIgKyBNLl9nYW1lT2JqZWN0cy5sZW5ndGgpO1xuXHRcdHRoaXMuYXR0cmlidXRlcyA9IG5ldyBTaW1wbGVNYXAoKTtcblx0XHR0aGlzLmJlaGF2aW91cnMgPSBuZXcgU2ltcGxlTWFwKCk7XG4gICAgXG4gICAgdGhpcy5jdXN0b21CZWhhdmlvdXJzID0gbmV3IE9iamVjdCgpO1xuICAgIHRoaXMuY3VzdG9tVmlld3MgPSBuZXcgT2JqZWN0KCk7XG4gICAgXG5cdFx0dGhpcy52aWV3cyA9IG5ldyBTaW1wbGVNYXAoKTtcblx0XHRcblx0XHRpZiAoZGVmaW5pdGlvbikge1xuXHRcdFx0XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRcblx0XHRcdGRlZmluaXRpb24uYXR0cmlidXRlcyAmJiBkZWZpbml0aW9uLmF0dHJpYnV0ZXMuZm9yRWFjaChmdW5jdGlvbihhdHRyaWJ1dGUpIHtcblx0XHRcdFx0c2VsZi5oYXMoYXR0cmlidXRlKTtcblx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRkZWZpbml0aW9uLmJlaGF2aW91cnMgJiYgZGVmaW5pdGlvbi5iZWhhdmlvdXJzLmZvckVhY2goZnVuY3Rpb24oYmVoYXZpb3VyKSB7XG5cdFx0XHRcdHNlbGYuZG9lcyhiZWhhdmlvdXIpO1xuXHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdC8vIFRPRE86IERlZmluZSB2aWV3cyBcblx0XHRcdC8vIGRlZmluaXRpb24udmlld3MgJiYgZGVmaW5pdGlvbi52aWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdC8vIFx0c2VsZi5zaG93KHZpZXcpO1xuXHRcdFx0Ly8gfSk7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdH1cblxuXHRFbnRpdHkucHJvdG90eXBlLm9uTG9vcCA9IGZ1bmN0aW9uKHApIHtcblx0XHR2YXIgaSA9IDAsIGEgPSB0aGlzLmF0dHJpYnV0ZXMsIHZpZXdzID0gdGhpcy52aWV3cywgdiA9IHRoaXMuYmVoYXZpb3Vycy5fdmFsdWVzLCBsID0gdi5sZW5ndGg7XG5cdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0aWYgKHZbaV0pIHtcblx0XHRcdFx0dltpXSh0aGlzLCBhLCB2aWV3cywgcCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRcblx0RW50aXR5LnByb3RvdHlwZS5nZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0cmV0dXJuIHRoaXMuYXR0cmlidXRlcy5nZXQobmFtZSk7XG5cdH07XG5cdFxuXHRFbnRpdHkucHJvdG90eXBlLmhhc0F0dHJpYnV0ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRyZXR1cm4gISF0aGlzLmF0dHJpYnV0ZXMuZ2V0KG5hbWUpO1x0XG5cdH07XG5cblx0RW50aXR5LnByb3RvdHlwZS5hdHRyaWJ1dGUgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAyICkge1xuXHRcdFx0dGhpcy5hdHRyaWJ1dGVzLnNldChuYW1lLCB2YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmF0dHJpYnV0ZXMuZ2V0KG5hbWUpO1xuXHRcdH1cblx0fTtcblxuXHRFbnRpdHkucHJvdG90eXBlLmJlaGF2aW91ciA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDIgKSB7XG5cdFx0XHR0aGlzLmJlaGF2aW91cnMuc2V0KG5hbWUsIHZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuYmVoYXZpb3Vycy5nZXQobmFtZSk7XG5cdFx0fVxuXHR9O1xuICBcblx0RW50aXR5LnByb3RvdHlwZS5oYXNCZWhhdmlvdXIgPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0cmV0dXJuICEhdGhpcy5iZWhhdmlvdXJzLmdldChuYW1lKTtcdFxuXHR9O1xuXG5cdEVudGl0eS5wcm90b3R5cGUuZ2V0QmVoYXZpb3VyID0gZnVuY3Rpb24obmFtZSkge1xuXHRcdHJldHVybiB0aGlzLmJlaGF2aW91cnMuZ2V0KG5hbWUpO1xuXHR9O1xuXG5cdEVudGl0eS5wcm90b3R5cGUuYmVoYXZpb3VyID0gRW50aXR5LnByb3RvdHlwZS5nZXRCZWhhdmlvdXI7XG5cdFxuXHRFbnRpdHkucHJvdG90eXBlLmdldFZpZXcgPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0cmV0dXJuIHRoaXMudmlld3MuZ2V0KG5hbWUpO1xuXHR9O1xuXG5cdEVudGl0eS5wcm90b3R5cGUudmlldyA9IEVudGl0eS5wcm90b3R5cGUuZ2V0Vmlldztcblx0LyoqXG4gICAqIEFkZHMgYW4gYXR0cmlidXRlXG4gICAqL1xuXHRFbnRpdHkucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG5cblx0XHQvL1RPRE86IHRoaXMgbWlnaHQgYmUgYSBnb29kIGlkZWEgdG8gcmV2aWV3LiBDb25zaWRlciBwZXJmb3JtYW5jZSBjb3N0cyB2cyB1c2FiaWxpdHksIG1lYW5pbmcsIGlzIHRoaXMgZmVhdHVyZSByZWFsbHkgbmVlZGVkPyBCZXNpZGVzIHJldHJvY29tcGF0XG5cdFx0aWYgKCB2YWx1ZSA9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFxuICAgICAgdmFsdWUgPSBNLmdhbWUuYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgIFxuICAgICAgaWYgKCB0eXBlb2YgdmFsdWUgPT0gXCJmdW5jdGlvblwiICkge1xuICAgICAgICB2YWx1ZSA9IG5ldyB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCB2YWx1ZSA9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3RvcmVBcyhuYW1lLCB0aGlzLmF0dHJpYnV0ZXMpO1xuICAgICAgfVxuXHRcdFx0XG5cdFx0fVxuICAgIFxuXHRcdHRoaXMuYXR0cmlidXRlcy5zZXQobmFtZSwgdmFsdWUpO1xuICAgIFxuXHRcdHJldHVybiB2YWx1ZTtcbiAgICBcblx0fTtcbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gYXR0cmlidXRlIFxuICAgKi9cblx0RW50aXR5LnByb3RvdHlwZS5oYXNudCA9IGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRyZXR1cm4gdGhpcy5hdHRyaWJ1dGVzLnJlbW92ZShuYW1lKTtcblx0fTsgIFxuICAvKipcbiAgICogQWRkcyBhIGJlaGF2aW91clxuICAgKiBJZiB2YWx1ZSBpcyBwcmVzZW50IGFuZCB0aGUgYmVoYXZpb3VyIGRvZXNuJ3QgZXhpc3QgaXQgcmVnaXN0ZXJzIGl0IGFzIGEgY3VzdG9tIG9uZSB0aGVuIGFkZHMgaXQgdG8gdGhlIGVudGl0eS5cbiAgICovXG5cdEVudGl0eS5wcm90b3R5cGUuZG9lcyA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgXG4gICAgaWYgKCB2YWx1ZSAmJiAhTS5nYW1lLmJlaGF2aW91cnNbbmFtZV0gKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyQmVoYXZpb3VyKG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gICAgXG5cdFx0aWYgKCB2YWx1ZSA9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHR2YWx1ZSA9IE0uZ2FtZS5iZWhhdmlvdXJzW25hbWVdIHx8IHRoaXMuY3VzdG9tQmVoYXZpb3Vyc1tuYW1lXTtcblx0XHR9XG4gICAgXG5cdFx0aWYgKCB2YWx1ZSA9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRNLmxvZ2dlci5lcnJvcihcIkNhbm5vdCBhZGQgdW5kZWZpbmVkIGJlaGF2aW91ciBcIiArIG5hbWUgKyBcIiB0byBlbnRpdHlcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYmVoYXZpb3Vycy5zZXQobmFtZSwgdmFsdWUpO1xuXHRcdH1cbiAgICBcblx0XHRyZXR1cm4gdGhpcztcbiAgICBcblx0fTtcbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGN1c3RvbSBiZWhhdmlvdXJcbiAgICovXG4gIEVudGl0eS5wcm90b3R5cGUucmVnaXN0ZXJCZWhhdmlvdXIgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMuY3VzdG9tQmVoYXZpb3Vyc1tuYW1lXSA9IHZhbHVlO1xuICB9O1xuXHQvKipcbiAgICogRm9yY2VzIHRoZSBleGVjdXRpb24gb2YgYSBiZWhhdmlvdXJcbiAgICovXG5cdEVudGl0eS5wcm90b3R5cGUuZG8gPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0dmFyIGJlaGF2aW91ciA9IHRoaXMuYmVoYXZpb3VyLmdldChuYW1lKTtcblx0XHRpZiAoIGJlaGF2aW91ciApIHtcblx0XHRcdGJlaGF2aW91cih0aGlzLCB0aGlzLmF0dHJpYnV0ZXMsIHRoaXMudmlld3MsIE0ub25Mb29wUHJvcGVydGllcylcblx0XHR9XG5cdH07XG5cdC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGVudGl0eSBoYXMgYSBiZWhhdmlvdXIgbWF0Y2hpbmcgbmFtZSBcbiAgICovXG5cdEVudGl0eS5wcm90b3R5cGUuY2FuID0gZnVuY3Rpb24obmFtZSkge1xuXHRcdHJldHVybiAhIXRoaXMuYmVoYXZpb3Vycy5nZXQobmFtZSk7XG5cdH07XG5cdC8qKlxuICAgKiBSZW1vdmVzIGEgYmVoYXZpb3VyXG4gICAqL1xuXHRFbnRpdHkucHJvdG90eXBlLmRvZXNudCA9IGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRyZXR1cm4gdGhpcy5iZWhhdmlvdXJzLnJlbW92ZShuYW1lKTtcblx0fTtcbiAgLyoqXG4gICAqIEFkZHMgYSB2aWV3XG4gICAqL1xuXHRFbnRpdHkucHJvdG90eXBlLnNob3dzID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcblxuXHRcdHZhciBfbmFtZSA9IG5hbWU7XG5cblx0XHRpZiAoIV9uYW1lKSB7XG5cdFx0XHRfbmFtZSA9IE0ucmFuZG9tLnN0cmluZygpO1xuXHRcdH1cblxuXHRcdGlmICggdmFsdWUgPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0cmV0dXJuIG5ldyBTaG93c0FzKF9uYW1lLCB0aGlzLnZpZXdzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy52aWV3cy5zZXQoX25hbWUsIHZhbHVlKTtcblx0XHR9XG5cblx0fTtcblx0LyoqXG4gICAqIFJlbW92ZXMgYSB2aWV3XG4gICAqL1xuXHRFbnRpdHkucHJvdG90eXBlLmRvZXNudFNob3cgPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0cmV0dXJuIHRoaXMudmlld3MucmVtb3ZlKG5hbWUpO1xuXHR9O1xuICBcbiAgRW50aXR5LnByb3RvdHlwZS5yZWdpc3RlclZpZXcgPSBmdW5jdGlvbihuYW1lLCB2aWV3KSB7XG4gICAgdGhpcy5jdXN0b21WaWV3c1tuYW1lXSA9IHZpZXc7XG4gIH07XG4gIFxuICBFbnRpdHkucHJvdG90eXBlLmFkZFZpZXcgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMudmlld3Muc2V0KG5hbWUsIHRoaXMuY3VzdG9tVmlld3NbbmFtZV0pO1xuICB9O1xuICBcbiAgRW50aXR5LnByb3RvdHlwZS5yZW1vdmVWaWV3ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHRoaXMudmlld3MucmVtb3ZlKG5hbWUpO1xuICB9O1xuXG5cdEVudGl0eS5uYW1lID0gXCJFbnRpdHlcIjtcblxuXHRNLmV4dGVuZChFbnRpdHksIEV2ZW50SGFuZGxlcik7XG5cblx0bmFtZXNwYWNlLkVudGl0eSA9IEVudGl0eTtcblxufSkoTSwgU2ltcGxlTWFwLCBNKTsiLCIoZnVuY3Rpb24gKG5hbWVzcGFjZSwgRW50aXR5LCBNKSB7XG5cbiAgZnVuY3Rpb24gVmlld2FibGVFbnRpdHkocHJvcGVydGllcykge1xuICAgIEVudGl0eS5jYWxsKHRoaXMsIHByb3BlcnRpZXMpO1xuICAgIHRoaXMuZG9lcyhcImZpeFZpZXdzVG9FbnRpdHlcIik7XG4gIH1cbiAgXG5cdFZpZXdhYmxlRW50aXR5Lm5hbWUgPSBcIlZpZXdhYmxlRW50aXR5XCI7XG5cblx0TS5leHRlbmQoVmlld2FibGVFbnRpdHksIEVudGl0eSk7XG5cblx0bmFtZXNwYWNlLlZpZXdhYmxlRW50aXR5ID0gVmlld2FibGVFbnRpdHk7XG4gXG4gfSkoTWF0Y2gsIE0uRW50aXR5LCBNKTsiLCIoZnVuY3Rpb24gKE0pIHtcblx0XG5cdGZ1bmN0aW9uIFRyaWdnZXIoKSB7XG5cdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuXHR9XG5cblx0VHJpZ2dlci5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuXHR9O1xuXG5cdFRyaWdnZXIucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcblx0fTtcblxuXHRUcmlnZ2VyLnByb3RvdHlwZS5vbkxvb3AgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuZGlzYWJsZWQgKSByZXR1cm47XG5cdFx0dGhpcy51cGRhdGUoKTtcblx0fTtcblxuXHRUcmlnZ2VyLm5hbWUgPSBcIlRyaWdnZXJcIjtcblxuXHRNLlRyaWdnZXIgPSBUcmlnZ2VyO1xuXG59KShNYXRjaCk7IiwiKGZ1bmN0aW9uIChNLCBTaW1wbGVDb2xsaXNpb25IYW5kbGVyKSB7XG5cdFxuXHRmdW5jdGlvbiBDb2xsaXNpb25UcmlnZ2VyKCkge1xuXHRcdFxuXHRcdHRoaXMuZXh0ZW5kc1RyaWdnZXIoKTtcblxuXHRcdHRoaXMuZW50aXRpZXNBbmRDYWxsYmFja3MgPSBbXTtcblxuXHR9XG5cblx0Q29sbGlzaW9uVHJpZ2dlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgaSA9IDAsXG5cdFx0XHRsID0gdGhpcy5lbnRpdGllc0FuZENhbGxiYWNrcy5sZW5ndGgsXG5cdFx0XHR3cmFwcGVyLFxuXHRcdFx0bWFuaWZvbGQ7XG5cblx0XHRmb3IgKCBpID0gMDsgaSA8IGw7IGkrKykge1xuXG5cdFx0XHR3cmFwcGVyID0gdGhpcy5lbnRpdGllc0FuZENhbGxiYWNrc1tpXTtcblxuXHRcdFx0bWFuaWZvbGQgPSB3cmFwcGVyLmVudGl0eS5hdHRyaWJ1dGUoXCJtYW5pZm9sZFwiKTtcblxuXHRcdFx0aWYgKCBtYW5pZm9sZCApIHtcblxuXHRcdFx0XHR3cmFwcGVyLmNhbGxiYWNrKG1hbmlmb2xkLCB0aGlzKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH07XG5cblx0Q29sbGlzaW9uVHJpZ2dlci5wcm90b3R5cGUub25Db2xsaXNpb24gPSBmdW5jdGlvbiAoZW50aXR5LCBjYWxsYmFjaykge1xuXHRcdHRoaXMuZW50aXRpZXNBbmRDYWxsYmFja3MucHVzaCh7XG5cdFx0XHRlbnRpdHk6IGVudGl0eSxcblx0XHRcdGNhbGxiYWNrOiBjYWxsYmFja1xuXHRcdH0pO1xuXHR9O1xuXG5cdE0uZXh0ZW5kKENvbGxpc2lvblRyaWdnZXIsIE0uVHJpZ2dlcik7XG5cblx0TS5Db2xsaXNpb25UcmlnZ2VyID0gQ29sbGlzaW9uVHJpZ2dlcjtcblxufSkoTWF0Y2gpOyIsIihmdW5jdGlvbiAoTSwgU2ltcGxlQ29sbGlzaW9uSGFuZGxlcikge1xuXHRcblx0ZnVuY3Rpb24gQXJlYVRyaWdnZXIobGVmdCwgdG9wLCB3aWR0aCwgaGVpZ2h0KSB7XG5cdFx0XG5cdFx0dGhpcy5leHRlbmRzVHJpZ2dlcigpO1xuXG5cdFx0dGhpcy5sZWZ0ID0gbGVmdDtcblx0XHR0aGlzLnRvcCA9IHRvcDtcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cblx0XHR0aGlzLmVudGl0aWVzQW5kQ2FsbGJhY2tzID0gW107XG5cblx0fVxuXG5cdEFyZWFUcmlnZ2VyLnByb3RvdHlwZS5nZXRMZWZ0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMubGVmdDtcblx0fTtcblx0QXJlYVRyaWdnZXIucHJvdG90eXBlLmdldFRvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnRvcDtcblx0fTtcblx0QXJlYVRyaWdnZXIucHJvdG90eXBlLmdldFJpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMubGVmdCArIHRoaXMud2lkdGg7XG5cdH07XG5cdEFyZWFUcmlnZ2VyLnByb3RvdHlwZS5nZXRCb3R0b20gPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy50b3AgKyB0aGlzLmhlaWdodDtcblx0fTtcblxuXHRBcmVhVHJpZ2dlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgaSA9IDAsXG5cdFx0XHRsID0gdGhpcy5lbnRpdGllc0FuZENhbGxiYWNrcy5sZW5ndGgsXG5cdFx0XHRzZWxmID0gdGhpcyxcblx0XHRcdHdyYXBwZXI7XG5cblx0XHRmb3IgKCBpID0gMDsgaSA8IGw7IGkrKykge1xuXG5cdFx0XHR3cmFwcGVyID0gdGhpcy5lbnRpdGllc0FuZENhbGxiYWNrc1tpXTtcblxuXHRcdFx0d3JhcHBlci5lbnRpdHkudmlld3MuZWFjaFZhbHVlKGZ1bmN0aW9uICh2aWV3KSB7XG5cblx0XHRcdFx0aWYgKCBTaW1wbGVDb2xsaXNpb25IYW5kbGVyLmhhdmVDb2xsaWRlZCh2aWV3LCBzZWxmKSApIHtcblx0XHRcdFx0XHR3cmFwcGVyLmNhbGxiYWNrKHdyYXBwZXIuZW50aXR5LCBzZWxmKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0fSk7XG5cblx0XHR9XG5cblx0fTtcblxuXHRBcmVhVHJpZ2dlci5wcm90b3R5cGUub25PYmplY3RJbkFyZWEgPSBmdW5jdGlvbihlbnRpdHksIGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5lbnRpdGllc0FuZENhbGxiYWNrcy5wdXNoKHtcblx0XHRcdGVudGl0eTogZW50aXR5LFxuXHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdFx0fSk7XG5cdH07XG5cblx0TS5leHRlbmQoQXJlYVRyaWdnZXIsIE0uVHJpZ2dlcik7XG5cblx0TS5BcmVhVHJpZ2dlciA9IEFyZWFUcmlnZ2VyO1xuXG59KShNYXRjaCwgTWF0Y2guY29sbGlzaW9ucy5TaW1wbGUpOyIsIk0ucmVnaXN0ZXJTY2VuZShcIm1hdGNoTG9nb1wiLCB7XG5cblx0c3ByaXRlczoge1xuXHRcdGZvbnRzOiBNLnJlbmRlcml6YWJsZXMuQml0bWFwVGV4dC5ERUZBVUxUX0ZPTlQsXG5cdH0sXG5cblx0b25Mb2FkOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBvYmplY3QgPSBuZXcgTS5FbnRpdHkoKSxcblx0XHRcdGNlbnRlciA9IE0uZ2V0Q2VudGVyKCk7XG5cblx0XHRvYmplY3Quc2hvd3MoXCJwb3dlcmVkQnlcIikuYXMoXCJiaXRtYXBUZXh0XCIpLnNldCh7XG5cdFx0XHRmaWxsOiBcImZvbnRzXCIsIHg6IGNlbnRlci54LCB5OiBjZW50ZXIueSAtIDQwLCB0ZXh0OiBcIlBPV0VSRUQgQllcIixcblx0XHRcdHNjYWxlWDogMC4xNSxcblx0XHRcdHNjYWxlWTogMC4xNVxuXHRcdH0pO1xuXHRcdG9iamVjdC5zaG93cyhcIm1hdGNoXCIpLmFzKFwiYml0bWFwVGV4dFwiKS5zZXQoe1xuXHRcdFx0ZmlsbDogXCJmb250c1wiLCB4OiBjZW50ZXIueCwgeTogY2VudGVyLnksIHRleHQ6IFwiTUFUQ0hcIixcblx0XHRcdHNjYWxlWDogMC41LFxuXHRcdFx0c2NhbGVZOiAwLjVcblx0XHR9KTtcblxuXHRcdE0ucHVzaChvYmplY3QpLnRvKFwibG9nb1wiKTtcblx0XHRcblx0XHRNLmdldExheWVyKFwibG9nb1wiKS5iYWNrZ3JvdW5kID0gXCIjMDAwXCI7XG5cdFx0XG5cdH1cblxufSk7IiwiTS5yZWdpc3RlclNjZW5lKFwibG9hZGluZ1wiLCB7XG5cblx0c3ByaXRlczoge1xuXHRcdGZvbnRzOiBNLnJlbmRlcml6YWJsZXMuQml0bWFwVGV4dC5ERUZBVUxUX0ZPTlRcblx0fSxcblx0XG5cdG9uTG9hZDogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbG9hZGluZyA9IG5ldyBNLkVudGl0eSgpLFxuXHRcdFx0cHJvZ3Jlc3NCYXIgPSBuZXcgTS5FbnRpdHkoKSxcblx0XHRcdGNlbnRlciA9IE0uZ2V0Q2VudGVyKCksXG5cdFx0XHRiYWNrZ3JvdW5kLFxuXHRcdFx0YmFja2dyb3VuZFdpZHRoO1xuXHRcdFxuXHRcdGxvYWRpbmcuc2hvd3MoXCJsb2FkaW5nXCIpLmFzKFwiYml0bWFwVGV4dFwiKS5zZXQoe1xuXHRcdFx0ZmlsbDogXCJmb250c1wiLCB4OiBjZW50ZXIueCwgeTogY2VudGVyLnksIHRleHQ6IFwiTE9BRElORy4uLlwiLFxuXHRcdFx0c2NhbGVYOiAwLjI1LFxuXHRcdFx0c2NhbGVZOiAwLjI1XG5cdFx0fSk7XG5cdFx0XG5cdFx0cHJvZ3Jlc3NCYXIuc2hvd3MoXCJiYWNrZ3JvdW5kXCIpLmFzKFwicmVjdGFuZ2xlXCIpLnNldCh7XG5cdFx0XHRmaWxsOiBcIiNmYTBcIixcblx0XHRcdHg6IGxvYWRpbmcuZ2V0VmlldyhcImxvYWRpbmdcIikuZ2V0WCgpLFxuXHRcdFx0eTogY2VudGVyLnkgKyAzMCxcblx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0aGVpZ2h0OiAyMFxuXHRcdH0pO1xuXHRcdHByb2dyZXNzQmFyLnNob3dzKFwiYm9yZGVyXCIpLmFzKFwicmVjdGFuZ2xlXCIpLnNldCh7XG5cdFx0XHRmaWxsOiBcInJnYmEoMCwwLDAsMClcIixcblx0XHRcdHg6IGNlbnRlci54LFxuXHRcdFx0eTogY2VudGVyLnkgKyAzMCxcblx0XHRcdHdpZHRoOiAxNTAsXG5cdFx0XHRoZWlnaHQ6IDIwLFxuXHRcdFx0Ym9yZGVyOiBcIiNhNTBcIixcblx0XHRcdGJvcmRlcldpZHRoOiAyXG5cdFx0fSk7XG5cblx0XHRNLnB1c2gobG9hZGluZykudG8oXCJsb2FkaW5nXCIpO1xuXHRcdE0ucHVzaChwcm9ncmVzc0JhcikudG8oXCJsb2FkaW5nXCIpO1xuXHRcdFxuXHRcdE0uZ2V0TGF5ZXIoXCJsb2FkaW5nXCIpLmJhY2tncm91bmQgPSBcIiMwMDBcIjtcblx0XHRcblx0XHRiYWNrZ3JvdW5kID0gcHJvZ3Jlc3NCYXIuZ2V0VmlldyhcImJhY2tncm91bmRcIiksXG5cdFx0YmFja2dyb3VuZFdpZHRoID0gcHJvZ3Jlc3NCYXIuZ2V0VmlldyhcImJvcmRlclwiKS5nZXRXaWR0aCgpO1xuXHRcdFxuXHRcdE0uc3ByaXRlcy5vbkltYWdlTG9hZGVkLmFkZEV2ZW50TGlzdGVuZXIoZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcblx0XHRcdGJhY2tncm91bmQuc2V0V2lkdGgoYmFja2dyb3VuZFdpZHRoIC0gZGF0YS5yZW1haW5pbmcgKiBiYWNrZ3JvdW5kV2lkdGggLyBkYXRhLnRvdGFsKTtcblx0XHRcdGJhY2tncm91bmQuc2V0TGVmdChsb2FkaW5nLmdldFZpZXcoXCJsb2FkaW5nXCIpLmdldExlZnQoKSk7XG5cdFx0XHRcblx0XHRcdGNvbnNvbGUuZGVidWcoXCJsb2FkZWQgc3ByaXRlOiBcIiArIGRhdGEubmFtZSk7XG5cdFx0XG5cdFx0fSk7XG5cdFx0XG5cdH1cblx0XHRcbn0pOyIsIk0ucmVnaXN0ZXJBdHRyaWJ1dGUoXCJsb2NhdGlvblwiLCBNLm1hdGgyZC5WZWN0b3IyZCk7IiwiTS5yZWdpc3RlckF0dHJpYnV0ZShcImRpcmVjdGlvblwiLCBNLm1hdGgyZC5WZWN0b3IyZCk7IiwiTS5yZWdpc3RlckF0dHJpYnV0ZShcImFyZWFUb1N0YXlJblwiLCBmdW5jdGlvbiAodG9wLCByaWdodCwgYm90dG9tLCBsZWZ0KSB7XG5cdHRoaXMubGVmdCA9IGxlZnQ7XG5cdHRoaXMudG9wID0gdG9wO1xuXHR0aGlzLnJpZ2h0ID0gcmlnaHQ7XG5cdHRoaXMuYm90dG9tID0gYm90dG9tO1xufSk7IiwiTS5yZWdpc3RlckF0dHJpYnV0ZShcImNvbGxpc2lvbkdyb3VwXCIsIDApOyIsIk0ucmVnaXN0ZXJCZWhhdmlvdXIoXCJhY2NlbGVyYXRlXCIsIGZ1bmN0aW9uKGUsIGEpIHtcblxuXHRpZiAoIGEuZ2V0KFwiaXNBY2NlbGVyYXRpbmdcIikgKSB7XG5cdFxuXHRcdHZhciBzcGVlZCA9IGEuZ2V0KFwic3BlZWRcIikgKyBhLmdldChcImFjY2VsZXJhdGlvblwiKSxcblx0XHRcdG1heFNwZWVkID0gYS5nZXQoXCJtYXhTcGVlZFwiKTtcblx0XHRcblx0XHRpZiAoIHNwZWVkID4gbWF4U3BlZWQgKSB7XG5cdFx0XHRzcGVlZCA9IG1heFNwZWVkO1xuXHRcdH1cblx0XG5cdFx0YS5zZXQoXCJzcGVlZFwiLCBzcGVlZCk7XG5cdFx0XG5cdH1cblxufSk7IiwiTS5yZWdpc3RlckJlaGF2aW91cihcImJvdW5jZVwiLCBmdW5jdGlvbihlLCBhLCB2LCBwKSB7XG5cdFxuXHR2YXIgZGlyZWN0aW9uID0gYS5nZXQoXCJkaXJlY3Rpb25cIiksXG5cdFx0dmlld3BvcnRXaWR0aCA9IHAubS5yZW5kZXJlci5nZXRXaWR0aCgpLFxuXHRcdHZpZXdwb3J0SGVpZ2h0ID0gcC5tLnJlbmRlcmVyLmdldEhlaWdodCgpO1xuXG5cdHYuZWFjaFZhbHVlKGZ1bmN0aW9uICh2aWV3KSB7XG5cblx0XHR2aWV3Lm9mZnNldChkaXJlY3Rpb24ueCwgZGlyZWN0aW9uLnkpO1xuXHRcblx0XHRpZiAoIHZpZXcuZ2V0UmlnaHQoKSA+IHZpZXdwb3J0V2lkdGggfHwgdmlldy5nZXRMZWZ0KCkgPCAwICkge1xuXHRcdFx0ZGlyZWN0aW9uLnggKj0gLTE7XG5cdFx0fVxuXHRcblx0XHRpZiAoIHZpZXcuZ2V0Qm90dG9tKCkgPiB2aWV3cG9ydEhlaWdodCB8fCB2aWV3LmdldFRvcCgpIDwgMCApIHtcblx0XHRcdGRpcmVjdGlvbi55ICo9IC0xO1xuXHRcdH1cblxuXHR9KTtcblx0XHRcbn0pOyIsIihmdW5jdGlvbiAoTSkge1xuXG5cdGZ1bmN0aW9uIE1hbmlmb2xkKGVudGl0eSwgb3RoZXJFbnRpdHksIHZpZXdGcm9tU2VsZiwgdmlld0Zyb21PdGhlciwgY29sbGlzaW9uSW5YLCBjb2xsaXNpb25JblkpIHtcblx0XHR0aGlzLmVudGl0eSA9IGVudGl0eTtcblx0XHR0aGlzLmNvbGxpZGVkV2l0aCA9IG90aGVyRW50aXR5O1xuXHRcdHRoaXMudmlld0Zyb21TZWxmID0gdmlld0Zyb21TZWxmO1xuXHRcdHRoaXMudmlld0Zyb21PdGhlciA9IHZpZXdGcm9tT3RoZXI7XG5cdFx0dGhpcy5jb2xsaXNpb25JblggPSBjb2xsaXNpb25Jblg7XG5cdFx0dGhpcy5jb2xsaXNpb25JblkgPSBjb2xsaXNpb25Jblk7XG5cdH1cblxuXG5cdE0ucmVnaXN0ZXJCZWhhdmlvdXIoXCJjb2xsaWRlXCIsIGZ1bmN0aW9uKGVudGl0eSwgYXR0cmlidXRlcykge1xuXG5cdFx0dmFyIGxvY2F0aW9uID0gYXR0cmlidXRlcy5nZXQoXCJsb2NhdGlvblwiKSxcblx0XHRcdG90aGVyT2JqZWN0cyA9IE0uX2dhbWVPYmplY3RzLFxuXHRcdFx0aSA9IDAsXG5cdFx0XHRsID0gb3RoZXJPYmplY3RzLmxlbmd0aCxcblx0XHRcdG90aGVyRW50aXR5LFxuXHRcdFx0Y29sbGlzaW9uR3JvdXAgPSBhdHRyaWJ1dGVzLmdldChcImNvbGxpc2lvbkdyb3VwXCIpLFxuXHRcdFx0Ly8gc2ltcGxlQ29sbGlzaW9uSGFuZGxlciA9IE0uY29sbGlzaW9ucy5TaW1wbGUsXG5cdFx0XHRwb2x5Z29uQ29sbGlzaW9uSGFuZGxlciA9IE0uY29sbGlzaW9ucy5Qb2x5Z29uLFxuXHRcdFx0Y29sbGlzaW9uSW5YID0gZmFsc2UsXG5cdFx0XHRjb2xsaXNpb25JblkgPSBmYWxzZSxcblx0XHRcdHZpZXdGcm9tU2VsZixcblx0XHRcdHZpZXdGcm9tT3RoZXIsXG5cdFx0XHRqLFxuXHRcdFx0ayxcblx0XHRcdGN1cnJlbnRZLFxuXHRcdFx0cHJldlk7XG5cdFx0XG5cdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFxuXHRcdFx0b3RoZXJFbnRpdHkgPSBvdGhlck9iamVjdHNbaV07XG5cdFx0XHRcblx0XHRcdGlmICggb3RoZXJFbnRpdHkgIT0gZW50aXR5ICYmIG90aGVyRW50aXR5LmF0dHJpYnV0ZShcImNvbGxpc2lvbkdyb3VwXCIpID09IGNvbGxpc2lvbkdyb3VwICkge1xuXG5cdFx0XHRcdGZvciAoIGsgPSAwOyBrIDwgb3RoZXJFbnRpdHkudmlld3MuX3ZhbHVlcy5sZW5ndGg7IGsrKyApIHtcblxuXHRcdFx0XHRcdHZpZXdGcm9tT3RoZXIgPSBvdGhlckVudGl0eS52aWV3cy5fdmFsdWVzW2tdO1xuXG5cdFx0XHRcdFx0Zm9yICggaiA9IDA7IGogPCBlbnRpdHkudmlld3MuX3ZhbHVlcy5sZW5ndGg7IGorKyApIHtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0dmlld0Zyb21TZWxmID0gZW50aXR5LnZpZXdzLl92YWx1ZXNbal07XG5cblx0XHRcdFx0XHRcdGlmICggcG9seWdvbkNvbGxpc2lvbkhhbmRsZXIuaGF2ZUNvbGxpZGVkKHZpZXdGcm9tU2VsZiwgdmlld0Zyb21PdGhlcikgKSB7XG5cblx0XHRcdFx0XHRcdFx0Y3VycmVudFkgPSB2aWV3RnJvbVNlbGYuX3k7XG5cdFx0XHRcdFx0XHRcdHByZXZZID0gdmlld0Zyb21TZWxmLl9wcmV2WTtcblxuXHRcdFx0XHRcdFx0XHR2aWV3RnJvbVNlbGYuX3kgPSBwcmV2WTtcblxuXG5cdFx0XHRcdFx0XHRcdGlmICggcG9seWdvbkNvbGxpc2lvbkhhbmRsZXIuaGF2ZUNvbGxpZGVkKHZpZXdGcm9tU2VsZiwgdmlld0Zyb21PdGhlcikgKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29sbGlzaW9uSW5YID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRjb2xsaXNpb25JblkgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0dmlld0Zyb21TZWxmLl95ID0gY3VycmVudFk7XG5cblx0XHRcdFx0XHRcdFx0dmFyIG1hbmlmb2xkID0gbmV3IE1hbmlmb2xkKGVudGl0eSwgb3RoZXJFbnRpdHksIHZpZXdGcm9tU2VsZiwgdmlld0Zyb21PdGhlciwgY29sbGlzaW9uSW5YLCBjb2xsaXNpb25JblkpO1xuXG5cdFx0XHRcdFx0XHRcdGF0dHJpYnV0ZXMuc2V0KFwibWFuaWZvbGRcIiwgbWFuaWZvbGQpO1xuXG5cdFx0XHRcdFx0XHRcdGVudGl0eS5yYWlzZUV2ZW50KFwib25Db2xsaXNpb25cIiwgbWFuaWZvbGQpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIGlmICggYXR0cmlidXRlcy5nZXQoXCJwcmV2ZW50TW92ZU9uQ29sbGlzaW9uXCIpICkge1xuXHRcdFx0XHRcdFx0XHQvLyBcdGxvY2F0aW9uLnNldChsb2NhdGlvbi5wcmV2WCwgbG9jYXRpb24ucHJldlkpO1xuXHRcdFx0XHRcdFx0XHQvLyB9XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRhdHRyaWJ1dGVzLnNldChcIm1hbmlmb2xkXCIsIGZhbHNlKTtcblx0XHRcblx0fSk7XG5cbn0pKE1hdGNoKTtcbiIsIk0ucmVnaXN0ZXJCZWhhdmlvdXIoXCJkZWNlbGVyYXRlXCIsIGZ1bmN0aW9uKGUsIGEpIHtcblx0aWYgKCBhLmdldChcImlzRGVjZWxlcmF0aW5nXCIpICkge1xuXHRcblx0XHR2YXIgc3BlZWQgPSBhLmdldChcInNwZWVkXCIpIC0gYS5nZXQoXCJkZWNlbGVyYXRpb25cIiksXG5cdFx0XHRtaW5TcGVlZCA9IGEuZ2V0KFwibWluU3BlZWRcIik7XG5cdFx0XG5cdFx0aWYgKCAhYS5nZXQoXCJjYW5Hb1JldmVyc2VcIikgJiYgc3BlZWQgPCAwICkge1xuXHRcdFx0c3BlZWQgPSAwO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIHNwZWVkIDwgbWluU3BlZWQgKSB7XG5cdFx0XHRzcGVlZCA9IG1pblNwZWVkO1xuXHRcdH1cblx0XHRcblx0XHRhLnNldChcInNwZWVkXCIsIHNwZWVkKTtcblx0XG5cdH1cbn0pOyIsIk0ucmVnaXN0ZXJCZWhhdmlvdXIoXCJmaXhWaWV3c1RvRW50aXR5XCIsIGZ1bmN0aW9uKGUsIGEsIHYpIHtcblxuXHR2YXIgcm90YXRpb24gPSBhLmdldChcInJvdGF0aW9uXCIpLFxuXHRcdGxvY2F0aW9uID0gYS5nZXQoXCJsb2NhdGlvblwiKSxcblx0XHRvZmZzZXRSb3RhdGlvbiA9IDAsXG5cdFx0b2Zmc2V0WCA9IDAsXG5cdFx0b2Zmc2V0WSA9IDA7XG5cblx0aWYgKCB0aGlzLnJvdGF0aW9uID09IHVuZGVmaW5lZCApIHtcblx0XHR0aGlzLnJvdGF0aW9uID0gMDtcblx0fVxuXG5cdGlmICggdGhpcy5sb2NhdGlvbiA9PSB1bmRlZmluZWQgKSB7XG5cdFx0dGhpcy5sb2NhdGlvbiA9IG5ldyBPYmplY3QoKTtcblx0XHR0aGlzLmxvY2F0aW9uLnggPSAwO1xuXHRcdHRoaXMubG9jYXRpb24ueSA9IDA7XG5cdH1cblxuXHRpZiAoIHJvdGF0aW9uICYmIHJvdGF0aW9uICE9IHRoaXMucm90YXRpb24gKSB7XG5cdFx0b2Zmc2V0Um90YXRpb24gPSByb3RhdGlvbiAtIHRoaXMucm90YXRpb247XG5cdFx0dGhpcy5yb3RhdGlvbiA9IHJvdGF0aW9uO1xuXHR9XG5cblx0aWYgKCBsb2NhdGlvbi54ICE9IHRoaXMubG9jYXRpb24ueCApIHtcblx0XHRvZmZzZXRYID0gbG9jYXRpb24ueCAtIHRoaXMubG9jYXRpb24ueDtcblx0XHR0aGlzLmxvY2F0aW9uLnggPSBsb2NhdGlvbi54O1xuXHR9XG5cdGlmICggbG9jYXRpb24ueSAhPSB0aGlzLmxvY2F0aW9uLnkgKSB7XG5cdFx0b2Zmc2V0WSA9IGxvY2F0aW9uLnkgLSB0aGlzLmxvY2F0aW9uLnk7XG5cdFx0dGhpcy5sb2NhdGlvbi55ID0gbG9jYXRpb24ueTtcblx0fVxuXHRcblx0di5lYWNoVmFsdWUoZnVuY3Rpb24odmlldykge1xuXG5cdFx0aWYgKCBvZmZzZXRYICE9IDAgfHwgb2Zmc2V0WSAhPSAwICkge1xuXG5cdFx0XHR2aWV3Lm9mZnNldChvZmZzZXRYLCBvZmZzZXRZKTtcblxuXHRcdH1cblxuXHRcdGlmICggb2Zmc2V0Um90YXRpb24gIT0gMCApIHtcblxuXHRcdFx0dmlldy5vZmZzZXRSb3RhdGlvbihvZmZzZXRSb3RhdGlvbiwgbG9jYXRpb24ueCwgbG9jYXRpb24ueSk7XG5cblx0XHR9XG5cblx0fSk7XG5cbn0pOyIsIk0ucmVnaXN0ZXJCZWhhdmlvdXIoXCJmb2xsb3dDYW1lcmFcIiwgZnVuY3Rpb24oZSwgYSwgdiwgcCkge1xuXG5cdHZhciBsb2NhdGlvbiA9IGEuZ2V0KFwibG9jYXRpb25cIik7XG5cblx0cC5tLnJlbmRlcmVyLmNhbWVyYS5jZW50ZXJBdChsb2NhdGlvbi54LCBsb2NhdGlvbi55KTtcblxufSk7IiwiKGZ1bmN0aW9uIChNKSB7XG5cblx0TS5yZWdpc3RlckJlaGF2aW91cihcIm1vbml0b3JBdHRyaWJ1dGVzXCIsIGZ1bmN0aW9uKGVudGl0eSwgYXR0cmlidXRlcykge1xuXHRcblx0XHR2YXIgbG9jYXRpb24gPSBhdHRyaWJ1dGVzLmdldChcImxvY2F0aW9uXCIpLFxuXHRcdFx0cm90YXRpb24gPSBhdHRyaWJ1dGVzLmdldChcInJvdGF0aW9uXCIpO1xuXHRcdFxuXHRcdGlmICggIXRoaXMuX2NhY2hlZFZhbHVlcyB8fCB0aGlzLl9jYWNoZWRWYWx1ZXMueCAhPSBsb2NhdGlvbi54IHx8IHRoaXMuX2NhY2hlZFZhbHVlcy55ICE9IGxvY2F0aW9uLnkgfHwgdGhpcy5fY2FjaGVkVmFsdWVzLnJvdGF0aW9uICE9IHJvdGF0aW9uICkge1xuXG5cdFx0XHR0aGlzLl9jYWNoZWRWYWx1ZXMgPSB7XG5cdFx0XHRcdHg6IGF0dHJpYnV0ZXMuZ2V0KFwibG9jYXRpb25cIikueCxcblx0XHRcdFx0eTogYXR0cmlidXRlcy5nZXQoXCJsb2NhdGlvblwiKS55LFxuXHRcdFx0XHRyb3RhdGlvbjogYXR0cmlidXRlcy5nZXQoXCJyb3RhdGlvblwiKVxuXHRcdFx0fTtcblxuXHRcdFx0YXR0cmlidXRlcy5wdXNoKFwiYXR0cmlidXRlQ2hhbmdlZFwiLCB0cnVlKTtcblxuXHRcdFx0dGhpcy5hbHJlYWR5VXBkYXRlZCA9IGZhbHNlO1xuXHRcdFx0XG5cdFx0fSBlbHNlIGlmICggIXRoaXMuYWxyZWFkeVVwZGF0ZWQgKSB7XG5cdFx0XHRcblx0XHRcdGF0dHJpYnV0ZXMucHVzaChcImF0dHJpYnV0ZUNoYW5nZWRcIiwgZmFsc2UpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmFscmVhZHlVcGRhdGVkID0gdHJ1ZTtcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0fSk7XG5cbn0pKE0pOyIsIk0ucmVnaXN0ZXJCZWhhdmlvdXIoXCJyb3RhdGVWaWV3c1wiLCBmdW5jdGlvbihlLCBhLCB2KSB7XG5cblx0dmFyIHJvdGF0aW9uID0gYS5nZXQoXCJyb3RhdGlvblwiKSxcblx0XHRvZmZzZXRSb3RhdGlvbiA9IDA7XG5cblx0aWYgKCB0aGlzLnJvdGF0aW9uID09IHVuZGVmaW5lZCApIHtcblx0XHR0aGlzLnJvdGF0aW9uID0gMDtcblx0fVxuXG5cdGlmICggcm90YXRpb24gIT0gdGhpcy5yb3RhdGlvbiApIHtcblx0XHRvZmZzZXRSb3RhdGlvbiA9IHJvdGF0aW9uIC0gdGhpcy5yb3RhdGlvbjtcblx0XHR0aGlzLnJvdGF0aW9uID0gcm90YXRpb247XG5cdH1cblxuXHRpZiAoIG9mZnNldFJvdGF0aW9uICE9IDAgKSB7XG5cblx0XHQvL1JvdGFyIHRvZG9zIGxvcyB2ZXJ0aWNlcyBkZSBsYXMgdmlzdGFzIHVzYW5kbyBlbCBjZW50cm8gXCJsb2NhdGlvblwiIGNvbW8gcGl2b3RlIHkgc3UgcHJvcGlhIHJvdGFjaW9uXG5cdFx0dmFyIGxvY2F0aW9uID0gYS5nZXQoXCJsb2NhdGlvblwiKTtcblx0XHRcblx0XHR2LmVhY2hWYWx1ZShmdW5jdGlvbih2aWV3KSB7XG5cblx0XHRcdHZpZXcub2Zmc2V0Um90YXRpb24ob2Zmc2V0Um90YXRpb24pO1xuXG5cdFx0dmFyIHggPSB2aWV3Ll94IC0gbG9jYXRpb24ueCxcblx0XHRcdHkgPSB2aWV3Ll95IC0gbG9jYXRpb24ueSxcblx0XHRcdHJvdGF0ZWRYID0gTS5tYXRoMmQuZ2V0Um90YXRlZFZlcnRleENvb3Jkc1goeCwgeSwgb2Zmc2V0Um90YXRpb24pLFxuXHRcdFx0cm90YXRlZFkgPSBNLm1hdGgyZC5nZXRSb3RhdGVkVmVydGV4Q29vcmRzWSh4LCB5LCBvZmZzZXRSb3RhdGlvbik7XG5cblx0XHRcdHZpZXcuc2V0TG9jYXRpb24ocm90YXRlZFggKyBsb2NhdGlvbi54LCByb3RhdGVkWSArIGxvY2F0aW9uLnkpO1xuXG5cdFx0fSk7XG5cblx0fVxuXG59KTsiLCJNLnJlZ2lzdGVyQmVoYXZpb3VyKFwic3RheUluQXJlYVwiLCBmdW5jdGlvbihlLCBhLCB2LCBwKSB7XG5cdFxuXHR2YXIgYXJlYSA9IGEuZ2V0KFwiYXJlYVRvU3RheUluXCIpO1xuXHRcblx0di5lYWNoVmFsdWUoZnVuY3Rpb24odmlldykge1xuXHRcdGlmICggdmlldy5nZXRMZWZ0KCkgPCBhcmVhLmxlZnQgKSB7XG5cdFx0XHR2aWV3LnNldExlZnQoYXJlYS5sZWZ0KTtcblx0XHR9XHRcdFxuXHRcdGlmICggdmlldy5nZXRSaWdodCgpID4gYXJlYS5yaWdodCApIHtcblx0XHRcdHZpZXcuc2V0UmlnaHQoYXJlYS5yaWdodCk7XG5cdFx0fVxuXHRcdGlmICggdmlldy5nZXRUb3AoKSA8IGFyZWEudG9wICkge1xuXHRcdFx0dmlldy5zZXRUb3AoYXJlYS50b3ApO1xuXHRcdH1cdFx0XG5cdFx0aWYgKCB2aWV3LmdldEJvdHRvbSgpID4gYXJlYS5ib3R0b20gKSB7XG5cdFx0XHR2aWV3LnNldEJvdHRvbShhcmVhLmJvdHRvbSk7XG5cdFx0fVxuXHR9KTtcblx0XG59KTsiLCJNLnJlZ2lzdGVyQmVoYXZpb3VyKFwic3RpY2tUb0NhbnZhc1wiLCBmdW5jdGlvbihlLCBhLCB2LCBwKSB7XG5cdFxuXHR2YXIgdmlld3BvcnRXaWR0aCA9IHAubS5yZW5kZXJlci5nZXRXaWR0aCgpLFxuXHRcdHZpZXdwb3J0SGVpZ2h0ID0gcC5tLnJlbmRlcmVyLmdldEhlaWdodCgpO1xuXHRcblx0di5lYWNoVmFsdWUoZnVuY3Rpb24odmlldykge1xuXHRcdGlmICggdmlldy5nZXRMZWZ0KCkgPCAwICkge1xuXHRcdFx0dmlldy5zZXRMZWZ0KDApO1xuXHRcdH1cdFx0XG5cdFx0aWYgKCB2aWV3LmdldFJpZ2h0KCkgPiB2aWV3cG9ydFdpZHRoICkge1xuXHRcdFx0dmlldy5zZXRSaWdodCh2aWV3cG9ydFdpZHRoKTtcblx0XHR9XG5cdFx0aWYgKCB2aWV3LmdldFRvcCgpIDwgMCApIHtcblx0XHRcdHZpZXcuc2V0VG9wKDApO1xuXHRcdH1cdFx0XG5cdFx0aWYgKCB2aWV3LmdldEJvdHRvbSgpID4gdmlld3BvcnRIZWlnaHQgKSB7XG5cdFx0XHR2aWV3LnNldEJvdHRvbSh2aWV3cG9ydEhlaWdodCk7XG5cdFx0fVxuXHR9KTtcblx0XG59KTsiLCJNLnJlZ2lzdGVyQmVoYXZpb3VyKFwidHJhbnNsYXRlVmlld3NcIiwgZnVuY3Rpb24oZSwgYSwgdikge1xuXG5cdFx0dmFyIGxvY2F0aW9uID0gYS5nZXQoXCJsb2NhdGlvblwiKSxcblx0XHRcdG9mZnNldFggPSAwLFxuXHRcdFx0b2Zmc2V0WSA9IDA7XG5cblx0XHRpZiAoIHRoaXMubG9jYXRpb24gPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5sb2NhdGlvbiA9IG5ldyBPYmplY3QoKTtcblx0XHRcdHRoaXMubG9jYXRpb24ueCA9IDA7XG5cdFx0XHR0aGlzLmxvY2F0aW9uLnkgPSAwO1xuXHRcdH1cblxuXHRcdGlmICggbG9jYXRpb24ueCAhPSB0aGlzLmxvY2F0aW9uLnggKSB7XG5cdFx0XHRvZmZzZXRYID0gbG9jYXRpb24ueCAtIHRoaXMubG9jYXRpb24ueDtcblx0XHRcdHRoaXMubG9jYXRpb24ueCA9IGxvY2F0aW9uLng7XG5cdFx0fVxuXHRcdGlmICggbG9jYXRpb24ueSAhPSB0aGlzLmxvY2F0aW9uLnkgKSB7XG5cdFx0XHRvZmZzZXRZID0gbG9jYXRpb24ueSAtIHRoaXMubG9jYXRpb24ueTtcblx0XHRcdHRoaXMubG9jYXRpb24ueSA9IGxvY2F0aW9uLnk7XG5cdFx0fVxuXG5cdFx0aWYgKCBvZmZzZXRYICE9IDAgfHwgb2Zmc2V0WSAhPSAwICkge1xuXG5cdFx0XHR2LmVhY2hWYWx1ZShmdW5jdGlvbih2aWV3KSB7XG5cblx0XHRcdFx0dmlldy5vZmZzZXQob2Zmc2V0WCwgb2Zmc2V0WSk7XG5cblx0XHRcdH0pO1xuXG5cdFx0fVxuXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
