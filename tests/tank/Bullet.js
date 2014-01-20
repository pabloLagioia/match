(function (M) {

	M.game.entities.createBullet = function () {
	
		var bullet = new M.Entity();
		
		bullet.has("speed", 1);
		bullet.has("direction");
		bullet.has("location");
		bullet.has("rotation", 0);
		
		bullet.shows("body").as("rectangle").set({
			width: 10,
			height: 20,
			color: "#aaa"
		});
		
		bullet.does("fixViewsToEntity");
		bullet.does("moveWithSpeedAndDirection");
		
		return bullet;
	
	}
	
})(M);