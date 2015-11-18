var CANVAS_W = 640,
    CANVAS_H = 480,
    tileW = 128,
    tileH = 128;

M.registerScene("track1", {
  
  loadingScene: "loading",
  
  sprites: {
    "car1": "car1_v1.png",
    "car2": "car2_v2.png",
    "grass": "grass_02.png",
    "asphalt": "Dirt_roadstraight_08.png",
    "startingLine": "startingline_02.png",
    "asphaltCurve": "Dirt_90deg_08.png",
    "bridge": "bridgeoverthetrack_02.png",
    "tree": "tree-03.png"
  },

  map: {
    definition: track,
    tile: {
      width: 128,
      height: 128
    },
    references: {
      0: "noPassable",
      1: "grass",
      2: "paviment",
      3: ["paviment", "startingLine"],
      4: ["grass", "curve:left"],
      5: ["paviment:", "bridge"],
      6: ["grass", "curve:right"],
      7: ["grass", "curve:oleft"],
      8: ["grass", "curve:oright"],
      9: ["grass", "tree"]
    },
    cameraBoundingArea: {
      left: 0,
      top: 0,
      right: tileW * track[0].length - CANVAS_W,
      bottom: tileH * track.length - CANVAS_H
    }
  },
  
  onLoad: function() {
    
    //PLAYER 1
    var car = M.createEntity("car", "car1");
      car.attribute("location").set((CANVAS_W / 2 + 160) * 2, (CANVAS_H / 2 + 400) * 2);
      car.does("followCamera");
      M.getCamera().centerAt(car.attribute("location").x, car.attribute("location").y);
      M.add(car).to("track");
    
    //PLAYER 2	
    var car2 = M.createEntity("car", "car2");
      car2.attribute("location").set((CANVAS_W / 2 + 220) * 2, (CANVAS_H / 2 + 400) * 2);
      car2.has("keyboardMapping", {
        up: "w", left: "a", right: "d", down: "s"
      });
      // car2.view("base").setColor("blue");
      M.add(car2).to("track");
  
    window.player1 = car;
    window.player2 = car2;
  
  }

});