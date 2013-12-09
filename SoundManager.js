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

	M.SoundManager = M.sounds = new SoundManager();

})( Match, EventListener );