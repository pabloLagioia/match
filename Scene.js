/**
 * @module Match
 */
(function (M) {

	/**
	 * @class Scene
	 */
	function Scene() {
		this.onLoad = new EventListener();
		this.onUnload = new EventListener();
		this.layers = [];
		this.objects = [];
		this.sprites = {};
		this.sounds = {};
	}

	Scene.prototype.addLayer = function(layer) {
	}
	Scene.prototype.removeLayer = function(layer) {
	}
	Scene.prototype.addObject = function(layer) {
	}
	Scene.prototype.removeObject = function(layer) {
	}
	Scene.prototype.addSound = function(id, url) {
	}
	Scene.prototype.removeSound = function(id) {
	}
	Scene.prototype.addSprite = function(id, url) {
	}
	Scene.prototype.removeSprite = function(id) {
	}

	M.Scene = Scene;

})(Match);