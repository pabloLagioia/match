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