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
		this._gameLayers = new SimpleMap();
		/**
		 * Array of GameObject. Match loops the objects in this array calling the onLoop method of each of them. This operation
		 * involves does not involve rendering. Match loops this list first, updates every object and once that is finished it loops
		 * the game layers
		 * @property _gameObjects
		 * @private
		 * @type Array
		 */
		this._gameObjects = new Array();
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
		/**
		 * Array containing input handlers
		 * @property _inputHandlers
		 * @type Array
		 * @private
		 */
		this._inputHandlers = [];
		
		//Show logo and duration of animation
		this.showLogo = true;
		this.LOGO_DURATION = 2000;
		this.LOGO = new Image();
		this.LOGO.src = 'data:image/png;base64,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';
		
		this.DEFAULT_LAYER_NAME = "world";
		this.DEFAULT_LAYER_BACKGROUND = "#000";

		this.DEFAULT_UPDATES_PER_SECOND = 60;
		this._updatesPerSecond = 0;
		this._msPerUpdate = 0;
		this._previousLoopTime = null;
		this._lag = 0;
		this._maxLag = 50;
		
		this.setUpdatesPerSecond(this.DEFAULT_UPDATES_PER_SECOND);

		this.plugins = {
			html: {
			}
		};
		
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
			}
		};

		var self = this;
		/*
		 * Start game loop when document is loaded
		 */
		document.addEventListener( "DOMContentLoaded", function() {
			document.body.appendChild(debugElement);
			self.setUpGameLoop();
		});

	}
	
	var debugElement = document.createElement("div"),
		updateInfoContainer = document.createElement("div"),
		renderInfoContainer = document.createElement("div"),
		updateInfo = document.createElement("span"),
		renderInfo = document.createElement("span");

		debugElement.setAttribute("id", "debugInfo");
		updateInfo.setAttribute("id", "updateInfo");
		renderInfo.setAttribute("id", "renderInfo");

		updateInfoContainer.innerHTML = "Updates: ";
		updateInfoContainer.appendChild(updateInfo);

		renderInfoContainer.innerHTML = "Renders: ";
		renderInfoContainer.appendChild(renderInfo);

		debugElement.appendChild(updateInfoContainer);
		debugElement.appendChild(renderInfoContainer);

		debugElement.style = "font-family: verdana";

	Match.prototype.getCamera = function() {
		return this.renderer.camera;
	};
	
	Match.prototype.getPluginTemplate = function(id) {
		var div = document.createElement("div");
		div.setAttribute("id", id);
		div.innerHTML = this.plugins.html[id];
		return div;
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
		/*
		 * If there is a main function defined in window, it is called
		 */
		if ( typeof window.main == "function" ) {
			this.start();
			if ( this.showLogo ) {
				this._showLogo();
			} else {
				window.main();
			}
		}

	};
	Match.prototype._showLogo = function() {

		this.setScene("matchLogo");

		setTimeout(function() {
			M.removeScene();
			if ( window.main ) {
				window.main();
			}
		}, this.LOGO_DURATION);

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
	Match.prototype.registerPlugin = function() {
		arguments[0] = "M.plugins." + arguments[0];
		this.registerClass.apply(this, arguments);
	};
	Match.prototype.registerBehaviour = function(name, value, requires, description) {

		if ( this.game.behaviours[name] == undefined ) {
			this.game.behaviours[name] = value;
		} else {
			this.logger.warn("There already is a behaviour named " + name);
		}

	};
	Match.prototype.registerAttribute = function(name, value) {
		if ( this.game.attributes[name] == undefined ) {
			this.game.attributes[name] = value;
		} else {
			this.logger.warn("There already is an attribute named " + name);
		}
	};
	Match.prototype.registerEntity = function(name, value) {
		if ( this.game.entities[name] == undefined ) {
			this.game.entities[name] = value;
		} else {
			this.logger.warn("There already is an entitie named " + name);
		}
	};
	Match.prototype.createEntity = function(name) {
		return this.game.entities[name]();
	};	
	Match.prototype.registerScene = function(name, value) {
		if ( this.game.scenes[name] == undefined ) {
			this.game.scenes[name] = value;
		} else {
			this.logger.warn("There already is a scenes named " + name);
		}
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

			// this._applyInput(p, node);

			if (node.onLoop) {
				node.onLoop(p);
			}

		}

	};
	/**
	 * Calls applyToObject to of each input handler
	 * @method _applyInput
	 * @param {Node} node to apply input handling to
	 */
	Match.prototype._applyInput = function(node) {
		var i = 0,
			l = this._inputHandlers.length;
		for ( ; i < l; i++ ) {
			this._inputHandlers[i].applyToObject(node);
		}
	};
	/**
	 * Updates all input handlers
	 * @method _updateInput
	 */
	Match.prototype._updateInput = function() {
		var i = 0,
			l = this._inputHandlers.length;
		for ( ; i < l; i++ ) {
			this._inputHandlers[i].update();
		}
	};
	Match.prototype._buildInputMapping = function() {

		var p = this.onLoopProperties;

		if ( p.keyboard ) {
			this._inputHandlers.push(p.keyboard);
		}
		if ( p.mouse ) {
			this._inputHandlers.push(p.mouse);
		}
		if ( p.touch ) {
			this._inputHandlers.push(p.touch);
		}
		if ( p.accelerometer ) {
			this._inputHandlers.push(p.accelerometer);
		}
		if ( p.orientation ) {
			this._inputHandlers.push(p.orientation);
		}

	};
	/**
	 * Game loop, loops through the game objects and then loops through the scenes rendering them
	 * @method gameLoop
	 */
	Match.prototype.gameLoop = function() {

		if ( !this._isPlaying ) return;
		
		this.onBeforeLoop.raise();

		var p = this.onLoopProperties,
			current = this.getTime(),
			renderer = this.renderer;

		p.time = this.FpsCounter.timeInMillis;
		
		this._lag += current - this._previousLoopTime;
		this._previousLoopTime = current;

		if ( this._lag > this._maxLag ) {
			this._lag = this._maxLag;
		}
		
		current = new Date().getTime();
		
		while ( this._lag > this._msPerUpdate ) {
		
			this._updateInput(p);
			this.updateGameObjects(this._gameObjects, p);
			this._lag -= this._msPerUpdate;

		}

		updateInfo.innerHTML = new Date().getTime() - current;
		
		current = new Date().getTime();

		this.renderer.renderLayers(this._gameLayers);
		
		renderInfo.innerHTML = new Date().getTime() - current;

		/*
		 * Update FPS count
		 */
		this.FpsCounter.count();

		this.onAfterLoop.raise();

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
			this.pushGameObject(arguments[i]);
		}
	
		return {
		
			objects: arguments,
			
			to: function(layerName) {
			
				if ( !layerName ) {
					return;
				}
			
				var layer = M.layer(layerName);
				
				if ( !layer ) {
					layer = M.createGameLayer(layerName);
				}
				
				if ( layer ) {
					for ( var i = 0; i < this.objects.length; i++ ) {
						M.getLayer(layerName).add(this.objects[i]);
					}
				}
				
			}
		}
		
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
	 * Creates a new game layer, adds it to the game layer list and returns it
	 *
	 * @method createGameLayer
	 * @param name name of the layer
	 * @param zIndex z-index of the layer
	 * @return {GameLayer} the newly created layer
	 */
	Match.prototype.createGameLayer = function(name, zIndex) {
		if ( !name ) {
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
		if ( !gameLayer ) {
			throw new Error("Cannot add null game layer");
		}
		this._gameLayers.set(name, gameLayer);
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
	Match.prototype.setScene = function () {

		var scene;

		if ( typeof arguments[0] == "string" && this.game.scenes[arguments[0]] ) {
			scene = this.game.scenes[arguments[0]];
		} else if ( typeof arguments[0] == "object" ) {
			scene = arguments[0];
		} else {
			this.logger.error("Unable to load logo scene");
			return;
		}

		this.removeScene();

		// var m = this;

		var soundsReady = false,
			spritesReady = false;

		if ( scene.sounds ) {
			this.sounds.load(scene.sounds, function () {

				soundsReady = true;

				if ( spritesReady && scene.onLoad ) {
					scene.onLoad();
				}

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
				
				if ( soundsReady && scene.onLoad ) {
					scene.onLoad();
				}

			});
		} else {
			spritesReady = true;
		}

		if ( scene.onLoad && scene.sounds == undefined && scene.sprites == undefined ) {
			scene.onLoad();
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
	Match.prototype.removeGameLayer = function(name) {
		
		var layer = this._gameLayers.get(name);

		if ( layer ) {

			return this._gameLayers.remove(name);

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
			throw new Error("start is expecting an HTMLCanvasElement as argument");
		}

		canvas.onselectstart = function() { return false; };
		canvas.requestFullScreen = canvas.requestFullScreen || 
								   canvas.webkitRequestFullScreen || 
								   canvas.mozRequestFullScreen || 
								   canvas.msRequestFullScreen;

		this.renderer = this.renderingProvider.getRenderer(canvas, mode);

		this._isPlaying = true;

		if ( !this.gameLoopAlreadySetup ) {
			this.setUpGameLoop();
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
	Match.prototype.extend = function( child, parent ) {

		if ( !child ) throw new Error("child is undefined and cannot be extended");
		if ( !parent ) throw new Error("parent is undefined thus you cannot extend child");
	
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
	Match.prototype.getCenter = function() {
		return this.renderer.getCenter();
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