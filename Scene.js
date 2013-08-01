/**
 * @module Match
 */
(function(M) {

	function Scene() {
	}

	Scene.prototype.addSpriteSheet = function(name) {
	};
	Scene.prototype.removeSpriteSheet = function(name) {
	};

	Scene.prototype.addSound = function(name) {
	};
	Scene.prototype.removeSound = function(name) {
	};

	Scene.prototype.createLayer = function(name) {
	};
	Scene.prototype.addLayer = function(layer) {
	};
	Scene.prototype.removeLayer = function(name) {
	};

	M.Scene = Scene;

})(window.Match);

var game = new M.Game();

game.addSpriteSheet("sky", {
	source: "sky.png", frames: [{x: 0, y: 0, width: 100, height: 100}], animations: {}
});

var level1 = new M.Scene();

level1.addLayer("background");
level1.addLayer("gameArea");

level1.addSprite("sky");
level1.addSprite("ninja");
level1.addSprite("ground");

level1.addSound("music");

level1.onSpriteLoaded(function(spriteName) {
});

level1.onAllSpritesLoaded(function(spriteName) {
});

level1.onLoadResource(function(resourceName) {
});

level1.onLoadComplete(function() {

});

M.setScene(level1);


function Loading(sprites, sounds, callback) {

	var loadingLayer = M.createGameLayer();

	M.removeAllLayers();
	M.pushLayer(loadingLayer);

	function onAssetLoaded() {
		if ( M.sprites.toLoad == 0 && M.sounds.toLoad == 0 ) {
			M.removeAllLayers();
			callback();
		}
	}

	M.sprites.onAllImagesLoaded.addEventListener(onAssetLoaded);
	M.sprites.onAllSoundsLoaded.addEventListener(onAssetLoaded);

	M.sprites.load(sprites);
	M.sounds.load(sounds);

}


function Level1() {

	Loading({
			sky: {
				source: "sky.png", frames: [{x: 0, y: 0, width: 100, height: 100}], animations: {}
			},
			ninja: {
				source: "ninja.png", frames: [{x: 0, y: 0, width: 100, height: 100}], animations: {}
			}
		}, {
			music: "music.mp3"
		}, loadComplete);

	var background = new M.createGameLayer(),
		gameArea = new M.createGameLayer();

	function loadComplete() {
	}

}