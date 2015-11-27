M.registerScene('scene1', {

  sprites: {
    "ship": "ship.png",
    "background": "Nebula1.png"
  },
  
  //sounds: {},
  
  //map: [],
  
  onLoad: function() {  
    
    M.getLayer("world").background = "background";
    
    M.add(M.createEntity("ship")).to("space");
    
  }

});