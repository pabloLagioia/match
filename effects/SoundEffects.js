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