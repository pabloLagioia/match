M.registerScene("tankScene", {

	sprites: {
		tree: "tree.gif",
		grass: "grass.png"
	},
	
	loadingScene: "loading",
  
  map: {
    definition: [
      [0, 0, 0, 0, 0, 0, 0, 0, 3],
      [0, 1, 0, 0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 1, 0, 0, 0, 3],
      [0, 0, 0, 1, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 0, 0, 0, 3],
      [0, 0, 0, 2, 0, 0, 1, 0, 3],
      [0, 0, 0, 0, 0, 0, 0, 0, 3],
      [0, 1, 0, 0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 1, 0, 0, 0, 3],
      [0, 0, 0, 1, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 0, 0, 0, 3]
    ],
    tile: {
      width: 64,
      height: 64
    },
    references: {
      0: "grass",
      1: ["grass", "tree"],
      2: ["grass", "tank"],
      3: function() {
        if (M.random.bool()) {
          return ["grass", "tree"];
        }
        return "grass";
      }
    }
 }

});