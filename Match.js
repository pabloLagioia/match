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

		console.warn("This browser does not support audio");

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
		this._gameLayers = [];
		/**
		 * Array of GameObject. Match loops the objects in this array calling the onLoop method of each of them. This operation
		 * involves does not involve rendering. Match loops this list first, updates every object and once that is finished it loops
		 * the game layers
		 * @property _gameObjects
		 * @private
		 * @type Array
		 */
		this._gameObjects = [];
		/**
		 * Cache used for retrieving elements from onLoopList faster
		 * @property offScreenContext
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
			time: 0
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
		this.onBeforeLoop = new EventListener();
		/**
		 * Event listener that will be raised after calling the game loop
		 * @property onAfterLoop
		 * @type EventListener
		 */
		this.onAfterLoop = new EventListener();
		/**
		 * Event listener that will be raised when an object is added
		 * @property onGameObjectPushed
		 * @type EventListener
		 */
		this.onGameObjectPushed = new EventListener();
		/**
		 * Event listener that will be raised when an object is removed
		 * @property onGameObjectRemoved
		 * @type EventListener
		 */
		this.onGameObjectRemoved = new EventListener();
		
		this.setDoubleBuffer(false);

		this.plugins = {
			html: {
			}
		};

		this.game = {
			attributes: {},
			behaviours: {},
			entities: {}
		}

		var self = this;
		/*
		 * Start game loop when document is loaded
		 */
		document.addEventListener( "DOMContentLoaded", function() {
			self.setUpGameLoop();
		});

	}
	
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

	Match.prototype.getPluginTemplate = function(id) {
		var div = document.createElement("div");
		div.setAttribute("id", id);
		div.innerHTML = this.plugins.html[id];
		return div;
	};

	Match.prototype.setUpGameLoop = function() {

		this.gameLoopAlreadySetup = true;

		gameLoop();
		/*
		 * If there is a main function defined in window, it is called
		 */
		if ( typeof window.main == "function" ) {
			this.start();
			window.main();
		}

	};
	/**
	 * Set Keyboard object. This is called by default by the keyboard implementation of this library but it could be changed
	 * @method setKeyboard
	 * @param {input.Keyboard} keyboard the keyboard to bind
	 */
	Match.prototype.setKeyboard = function(keyboard) {
		this.keyboard = keyboard;
		this.onLoopProperties.keyboard = keyboard;
		this._buildInputMapping();
	};
	/**
	 * Set Mouse object. This is called by default by the mouse implementation of this library but it could be changed
	 * @method setMouse
	 * @param {input.Mouse} mouse the mouse to bind
	 */
	Match.prototype.setMouse = function(mouse) {
		this.mouse = mouse;
		this.onLoopProperties.mouse = mouse;
		this._buildInputMapping();
	};
	/**
	 * Set Touch object. This is called by default by the touch implementation of this library but it could be changed
	 * @method setTouch
	 * @param {input.Touch} touch the toucn to bind
	 */
	Match.prototype.setTouch = function(touch) {
		this.touch = touch;
		this.onLoopProperties.touch = touch;
		this._buildInputMapping();
	};
	/**
	 * Set Accelerometer object. This is called by default by the accelerometer implementation of this library but it could be changed
	 * @method setAccelerometer
	 * @param {input.Accelerometer} accelerometer the accelerometer to bind
	 */
	Match.prototype.setAccelerometer = function(accelerometer) {
		this.accelerometer = accelerometer;
		this.onLoopProperties.accelerometer = accelerometer;
		this._buildInputMapping();
	};
	/**
	 * Set Orientation object. This is called by default by the orientation implementation of this library but it could be changed
	 * @method setOrientation
	 * @param {input.Orientation} orientation the accelerometer to bind
	 */
	Match.prototype.setOrientation = function(orientation) {
		this.orientation = orientation;
		this.onLoopProperties.orientation = orientation;
		this._buildInputMapping();
	};
	/**
	 * Renders the contents of the layers to the game canvas without using a middle buffer. This may result in flickering
	 * in some systems and does not allow applying properties to layers
	 * @method renderSingleBuffer
	 * @param {Array} list array of game layers
	 * @param {CanvasRenderingContext2D} fronCanvas the canvas attached to the document where the game takes place
	 * @param {OnLoopProperties} p useful objects for performance increase
	 */
	Match.prototype.renderSingleBuffer = function(list, frontCanvas, p) {

		/**
		 * Cache variables that are used in this function
		 */
		var l = list.length,
			i = 0,
			f = this.frontBuffer;

		f.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		for ( ; i < l; i++ ) {
			f.drawImage( list[i].onLoop(p), 0, 0 );
		}

	};
	/**
	 * Renders the contents of the layers to the game canvas using a middle buffer to avoid flickering. Enables the use of layer properties
	 * @method renderDoubleBuffer
	 * @param {Array} list array of game layers
	 * @param {CanvasRenderingContext2D} fronCanvas the canvas attached to the document where the game takes place
	 * @param {OnLoopProperties} p useful objects for performance increase
	 */
	Match.prototype.renderDoubleBuffer = function(list, frontCanvas, p) {

		/*
		 * Cache variables that are used in this function
		 */
		var l = list.length,
			i = 0,
			currentLayer,
			backBuffer = this.backBuffer;

		backBuffer.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		for ( ; i < l; i++ ) {

			currentLayer = list[i];

			var result = currentLayer.onLoop(p);

			backBuffer.save();

			if ( currentLayer.composite ) {
				backBuffer.globalCompositeOperation = currentLayer.composite;
			}

			if ( currentLayer._alpha != null && currentLayer._alpha >= 0 && currentLayer._alpha <= 1 ) {
				backBuffer.globalAlpha = currentLayer._alpha;
			}

			backBuffer.translate(backBuffer.halfWidth, backBuffer.halfHeight);

			if ( currentLayer.rotation ) {
				backBuffer.rotate(currentLayer.rotation);
			}

			if ( currentLayer.scale ) {
				backBuffer.scale(currentLayer.scale.x, currentLayer.scale.y);
			}

			backBuffer.drawImage( result, -backBuffer.halfWidth, -backBuffer.halfHeight);

			backBuffer.restore();

		}

		this.frontBuffer.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		this.frontBuffer.drawImage( backBuffer.canvas, 0, 0 );

	};
	/**
	 * Calls the onLoop method on all elements in nodes
	 * @method updateGameObjects
	 * @param {Array} nodes list of game objects
	 * @param {Object} p useful objects for performance increase
	 */
	Match.prototype.updateGameObjects = function(nodes, p) {

		for ( var i = 0; i < nodes.length; i++ ) {

			var node = nodes[i];

			if ( this._applyInput ) {
				this._applyInput(p, node);
			}

			if (node.onLoop) {
				node.onLoop(p);
			}

			if ( node.children ) {
				this.updateGameObjects(node.children, p);
			}

		}

	};
	Match.prototype._buildInputMapping = function() {

		var p = this.onLoopProperties,
			applyInput = "",
			updateInput = "";

		if ( p.keyboard ) {
			applyInput += "p.keyboard.applyToObject(node);";
			updateInput += "p.keyboard.update();";
		}
		if ( p.mouse ) {
			applyInput += "p.mouse.applyToObject(node);";
			updateInput += "p.mouse.update();";
		}
		if ( p.touch ) {
			applyInput += "p.touch.applyToObject(node);";
			updateInput += "p.touch.update();";
		}
		if ( p.accelerometer ) {
			applyInput += "p.accelerometer.applyToObject(node);";
			updateInput += "p.accelerometer.update();";
		}
		if ( p.orientation ) {
			applyInput += "p.orientation.applyToObject(node);";
			updateInput += "p.orientation.update();";
		}

		this._applyInput = new Function("p", "node", applyInput);
		this._updateInput = new Function("p", updateInput);

	};
	/**
	 * Game loop, loops through the game objects and then loops through the scenes rendering them
	 * @method gameLoop
	 */
	Match.prototype.gameLoop = function() {

		if ( !this._isPlaying ) return;

		this.onBeforeLoop.raise();

		var p = this.onLoopProperties;

		p.time = this.FpsCounter.timeInMillis;

		this.updateGameObjects(this._gameObjects, p);
		
		this._updateInput(p);

		/*
		 * Render using single buffer or double buffer
		 * @see renderSingleBuffer
		 * @see renderDoubleBuffer
		 */
		this.render(this._gameLayers, this.frontBuffer.canvas, p);

		/*
		 * Update FPS count
		 */
		this.FpsCounter.count();

		this.onAfterLoop.raise();

		if ( this.mouse ) this.mouse.clear();

	};
	/**
	 * Gets the result of all layers as an image in base64
	 * @method getAsBase64Image
	 * @return {String} a string representing an image in base64
	 */
	Match.prototype.getAsBase64Image = function() {
		return this.frontBuffer.canvas.toDataURL();
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
	Match.prototype.push = function(obj) {
		if ( obj instanceof this.Layer ) {
			this.pushLayer(obj);
		} else {
			this.pushObject(obj);
		}
	};
	/**
	 * Pushes a game object, that is an object that implements an onLoop method, to the game object list.
	 * NOTE: If the object does not implement onLoop then this method will throw an Error
	 * @method pushGameObject
	 * @param {GameObject} gameObject the object to push to the game object list
	 */
	Match.prototype.pushGameObject = function(gameObject) {
		if ( !gameObject.onLoop ) throw new Error("Cannot add object " + gameObject.constructor.name + ", it doesn't have an onLoop method");
		this._gameObjects.push(gameObject);
		this.onGameObjectPushed.raise();
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
					
					this.onGameObjectRemoved.raise();

				}

			} else {

				this._gameObjects.splice( object, 1);
				
				this.onGameObjectRemoved.raise();

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
	 * Creates a new canvas rendering context
	 *
	 * NOTE: Using this method may result in some objects not to be updated or rendered and bliking. Please call the remove method from match
	 *
	 * @method createNewContext
	 * @return {CanvasRenderingContext2D} the new context
	 */
	Match.prototype.createNewContext = function() {
		return window.document.createElement("canvas").getContext("2d");
	};
	/**
	 * Sets double buffering on or off
	 *
	 * NOTE: Double buffering enables the use of layer properties such as alpha or rotation
	 *
	 * @method setDoubleBuffer
	 * @param {Boolean} value the value that determines whether to use double buffer or not
	 */
	Match.prototype.setDoubleBuffer = function(value) {
		if ( value ) {
			this.backBuffer = this.createNewContext();
			this.updateBufferSize();
			this.render = this.renderDoubleBuffer;
		} else {
			this.render = this.renderSingleBuffer;
		}
	};
	/**
	 * Returns whether double buffering is enabled or not
	 *
	 * @method isDoubleBuffered
	 * @return {Boolean} true if double buffering is enabled false if not
	 */
	Match.prototype.isDoubleBuffered = function() {
		return this.render == this.renderDoubleBuffer;
	};
	/**
	 * Sets the size of the current canvas
	 *
	 * @method setCanvasSize
	 * @param {float} w width
	 * @param {float} h height
	 */
	Match.prototype.setCanvasSize = function(w, h) {
		if ( this.frontBuffer ) {
			this.frontBuffer.canvas.width = w;
			this.frontBuffer.canvas.height = h;
			this.updateBufferSize();
		}
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
	Match.prototype.setCanvasStretch = function(value) {
		if ( value ) {
			this.setCanvasStretchTo(document.documentElement.clientWidth, document.documentElement.clientHeight);
		} else {
			this.setCanvasStretchTo("auto", "auto");
		}
	};
	/**
	 * Stretches the contents of the canvas to the size of the html document.
	 *
	 * @method setCanvasStretchTo
	 * @param {String} w width in coordinates, as css pixels or percentages
	 * @param {String} h height in coordinates, as css pixels or percentages
	 */
	Match.prototype.setCanvasStretchTo = function(w, h) {
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
	/**
	 * Updates the back buffer size to match the size of the game canvas
	 *
	 * @method updateBufferSize
	 */
	Match.prototype.updateBufferSize = function() {
		if ( this.frontBuffer ) {
			if ( this.backBuffer && this.frontBuffer ) {
				this.backBuffer.canvas.width = this.frontBuffer.canvas.width;
				this.backBuffer.canvas.height = this.frontBuffer.canvas.height;
				this.backBuffer.halfWidth = this.backBuffer.canvas.width / 2;
				this.backBuffer.halfHeight = this.backBuffer.canvas.height / 2;
			}
			this.offScreenCanvas.width = this.frontBuffer.canvas.width;
			this.offScreenCanvas.height = this.frontBuffer.canvas.height;

			if ( this.collisions.PixelPerfect ) {
				this.collisions.PixelPerfect.testContext.canvas.width = this.offScreenCanvas.width;
				this.collisions.PixelPerfect.testContext.canvas.height = this.offScreenCanvas.height;
			}

			this.updateViewport();
		}
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
		var gameLayer = new this.GameLayer(name, zIndex || M._gameLayers.length);
		if ( this.frontBuffer ) {
			gameLayer.setBufferSize(this.frontBuffer.canvas);
		}
		this.pushGameLayer(gameLayer)
		return gameLayer;
	};
	/**
	 * Forces all layers to redraw it's content
	 *
	 * @method createGameLayer
	 * @param name name of the layer
	 * @param zIndex z-index of the layer
	 * @return {GameLayer} the newly created layer
	 */
	Match.prototype.redrawAllLayers = function() {
		for ( var i = 0; i < this._gameLayers.length; i++ ) {
			this._gameLayers[i].needsRedraw = true;
		}
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
	Match.prototype.pushGameLayer = function(gameLayer) {
		if ( !gameLayer ) {
			throw new Error("Cannot add null game layer");
		}
		if ( this.frontBuffer ) {
			gameLayer.setBufferSize(this.frontBuffer.canvas);
		}
		// if ( this._intro._isPlaying ) {
			// this._intro._layers.push(gameLayer);
		// } else {
			this._gameLayers.push(gameLayer);
		// }
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
	Match.prototype.setScene = function (scene, loadingLayer, transition) {

		var m = this;

		this.removeAllGameLayers();
		
		if (loadingLayer ) {
			this.pushLayer(loadingLayer);
		}
		
		this.sprites.onAllImagesLoaded.removeAllEventListeners();
	
		this.sprites.load(scene.resources.sprites, function () {
			
			for ( var i in scene.layers ) {
			
				var layer = new m.Layer,
					layerData = scene.layers[i];
				
				for ( var j in layerData ) {
				
					var object = layerData[j],
						instance = m._getClassInstance(object.className, object.setAttributes);
						
					if ( object.beforePush ) {
						object.beforePush(instance);
					}
					
					layer.push(instance);
					
				}
				
				m.pushLayer(layer);
				
			}
			
			for ( var i in scene.objects ) {
				var object = scene.objects[i],
					instance = m._getClassInstance(object.className, object.setAttributes);
				if ( object.beforePush ) {
					object.beforePush(instance);
				}
				m.pushGameObject(instance);
			}
			
			if (loadingLayer ) {
				m.removeLayer(loadingLayer);
			}
			
		});
		
	};
	/**
	 * TODO: Complete JS Doc
	 */
	Match.prototype.removeScene = function() {
		var layers = this._gameLayers;
		this.removeAllGameLayers();
		return layers;
	};
	/**
	 * Pushes all provided layers into Match list of game layers
	 */
	Match.prototype.pushScene = function(layers) {
		var i = 0, l = layers.length;
		for ( ; i < l; i++ ) {
			this.pushGameLayer(layers[i]);
		}
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
	Match.prototype.removeGameLayer = function(gameLayer) {
		if ( !gameLayer && gameLayer !== 0 ) {
			gameLayer = this._gameLayers[0];
		}
		this.removeElementFromArray( gameLayer, this._gameLayers );
		for ( var i in gameLayer.onRenderList ) {
			this.removeGameObject(gameLayer.onRenderList[i]);
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
		for ( var i = 0; i < this._gameLayers.length; i++ ) {
			var gameLayer = this._gameLayers[i];
			for ( var j in gameLayer.onRenderList ) {
				this.removeGameObject(gameLayer.onRenderList[j]);
			}
		}
		this._gameLayers = new Array();
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
		this._gameLayers.sort(function(a, b) {
			return a._zIndex - b._zIndex;
		});
	};
	/**
	 * Pauses or unpauses the game loop. Also raises the M.onPause or M.onUnPause event provided those are defined
	 * @method pause
	 */
	Match.prototype.pause = function() {
	
		if ( this._isPlaying ) {
			if ( this.onPause ) this.onPause();
		} else {
			if ( this.onUnPause ) this.onUnPause();
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
	 * @param {Boolean} doubleBuffer a boolean determinig whether to use double buffering or not
	 * @method start
	 * @example
			//Use canvas by id gameCanvas and use double buffering
			M.start(document.querySelector("#gameCanvas"), true);
	 */
	Match.prototype.start = function(canvas, doubleBuffer) {

		if ( !canvas ) {
			canvas = M.dom("canvas");
		}

		if ( ! (canvas instanceof HTMLCanvasElement) ) {
			throw new Error("start is expecting an HTMLCanvasElement as argument");
		}

		canvas.onselectstart = function() { return false; };
		canvas.requestFullScreen = canvas.requestFullScreen || 
								   canvas.webkitRequestFullScreen || 
								   canvas.mozRequestFullScreen || 
								   canvas.msRequestFullScreen;

		this.frontBuffer = canvas.getContext("2d");

		this.updateBufferSize();
		this.updateViewport();

		var i = 0, l = this._gameLayers.length;

		for ( ; i < l; i++ ) {
			this._gameLayers[i].setBufferSize(canvas);
		}

		this._isPlaying = true;

		if ( !this.gameLoopAlreadySetup ) {
			this.setUpGameLoop();
		}

		// M._intro.play();

	};
	/**
	 * Updates the camera viewport to match the size of the game canvas
	 * @method updateViewport
	 */
	Match.prototype.updateViewport = function() {
		this.camera.setViewport( this.frontBuffer.canvas.width, this.frontBuffer.canvas.height );
	};
	Match.prototype.getViewportSize = function() {
		return { width: this.camera.viewportWidth, height: this.camera.viewportHeight };
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
	Match.prototype.extend = function( descendant, parent ) {

		for (var m in parent.prototype) {

			if ( !descendant.prototype[m] ) {
				descendant.prototype[m] = parent.prototype[m];
			}

		}

	};
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
	/**
	 * Rounds a number down using the fastest round method in javascript.
	 * @see http://jsperf.com/math-floor-vs-math-round-vs-parseint/33
	 * @method round
	 * @param {double} number the number to round
	 * @return {int}
	 */
	Match.prototype.fastRound = function(number) {
		return number >> 0;
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
		if ( this.frontBuffer && this.frontBuffer.canvas.requestFullScreen ) {
			this.frontBuffer.canvas.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	};
	Match.prototype.getSceneCenter = function() {
		if ( this.frontBuffer ) {
			return this.frontBuffer.canvas.getCenter();
		} else {
			return {
				x: 0, y: 0
			}
		}
	};
	Match.prototype.setLoadingScene = function(scene) {
		this.prevLayers = M.removeScene();
		this.pushScene(scene.getLayers());
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

	/** CES PARADIGM *****************************************************************************************/
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
	/********************************************************************************************************/
	
	/* Save console usage for debugging purposes */
	if ( window.console ) {

		if ( window.console.log ) {
			window.console.debug = window.console.log;
		}
		if ( ! window.console.warn ) {
			window.console.warn = window.console.debug;
		}

	} else {

		window.console = {};
		window.console.log = window.console.debug = window.console.error = window.console.warning = function() {};

	}

	/* Enhance dom elements */
	HTMLElement.prototype.remove = function() {
		this.parentNode.removeChild(this);
	};

	HTMLElement.prototype.setClass = function(cssClass) {
		this.setAttribute("class", cssClass);
	};
	
	HTMLCanvasElement.prototype.getCenter = function() {
		return {x: this.width / 2, y: this.height / 2};
	};

	HTMLCanvasElement.prototype.setSize = function( width, height ) {
		this.width = width;
		this.height = height;
	};

	HTMLCanvasElement.prototype.adjustTo = function( width, height ) {
		this.style.setProperty("width", width + "px", null);
		this.style.setProperty("height", height + "px", null);
	};

	HTMLCanvasElement.prototype.adjustToAvailSize = function() {
		this.adjustTo( window.screen.availWidth + "px", window.screen.availHeight + "px" );
	};

	HTMLCanvasElement.prototype.resizeKeepingAspect = function( times ) {
		this.adjustTo( this.width * times, this.height * times );
	};

	HTMLCanvasElement.prototype.getRight = function() {
		return this.offsetLeft + this.offsetWidth;
	};

	HTMLCanvasElement.prototype.getBottom = function() {
		return this.offsetTop + this.offsetHeight;
	};

	HTMLCanvasElement.prototype.getAvailWidth = function() {
		if ( this.getRight() < window.screen.availWidth ) { 
			return this.offsetWidth;
		} else {
			return window.screen.availWidth - this.offsetLeft;
		}
	};

	HTMLCanvasElement.prototype.getAvailHeight = function() {
		if ( this.getBottom() < window.screen.availHeight ) { 
			return this.offsetHeight;
		} else {
			return window.screen.availHeight - this.offsetTop;
		}
	};

	HTMLCanvasElement.prototype.getViewport = function() {
		var viewport = {};
		if ( this.offsetLeft < 0 ) {
			viewport.left = -this.offsetLeft;
		} else {
			viewport.left = 0;
		}
		if ( this.offsetTop < 0 ) {
			viewport.top = -this.offsetTop;
		} else {
			viewport.top = 0;
		}
		if ( this.offsetLeft + this.offsetWidth > window.screen.availWidth ) {
			viewport.right = window.screen.availWidth - this.offsetLeft;
		} else {
			viewport.right = this.offsetWidth;
		}
		if ( this.offsetTop + this.offsetHeight > window.screen.availHeight ) {
			viewport.bottom = window.screen.availHeight - this.offsetTop;
		} else {
			viewport.bottom = this.offsetHeight;
		}
		return viewport;
	};

	HTMLCanvasElement.prototype.getAspect = function() {
		var aspect = { x: 1, y: 1 };
		if ( this.style.width && this.width != parseInt(this.style.width) ) {
			aspect.x = this.width / parseInt(this.style.width);
		}
		if ( this.style.height && this.height != parseInt(this.style.height) ) {
			aspect.y = this.height / parseInt(this.style.height);
		}
		return aspect;
	};

	CanvasRenderingContext2D.prototype.resetOperation = function() {
		if ( this.operationChanged && this.globalCompositeOperation != "source-over" ) {
			this.globalCompositeOperation = "source-over";
			this.operationChanged = false;
		}
	};
	CanvasRenderingContext2D.prototype.resetAlpha = function() {
		if ( this.alphaChanged && this.globalAlpha != 1 ) {
			this.globalAlpha = 1;
			this.alphaChanged = false;
		}
	};
	CanvasRenderingContext2D.prototype.resetShadow = function() {
		if ( this.shadowChanged ) {
			if ( this.shadowBlur != 0 ) {
				this.shadowBlur = 0;
			}
			if ( this.shadowOffsetX != 0 ) {
				this.shadowOffsetX = 0;
			}
			if ( this.shadowOffsetY != 0 ) {
				this.shadowOffsetY = 0;
			}
			this.shadowChanged = false;
		}
	};

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
		requestAnimationFrame( gameLoop );
		M.gameLoop();
	}

})(window);