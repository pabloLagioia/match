M.registerScene('scene1', {

  sprites: {
    "ship": "ship.png",
    "background": "Nebula1.png"
  },
  
  //sounds: {},
  
  //map: [],
  
  onLoad: function() {  
    
    M.getLayer("world").background = "background";
    
    var ship = M.createEntity("ship");
    
    M.add(ship).to("space");
    
    M.add({
      "onLoop": function(p) {
        
        if (!p.mouse.clicked(p.mouse.LEFT)) {
          return;
        }
        
        if (!ship.view("selected").getVisible()) {
          return;
        }
        
        var destination = ship.attribute("destination");
        
        destination.setX(p.mouse.x);
        destination.setY(p.mouse.y);
        
      }
    });
    
    M.add({
      "onLoop": function(p) {
        if (!p.mouse.selectedObject && p.mouse.clicked(p.mouse.LEFT)) {
          ship.view("selected").setVisible(false);
        }
      }
    });
    
  }

});