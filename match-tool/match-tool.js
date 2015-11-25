var fs = require("fs"),
    path = require("path"),
    commandLineArgs = require("command-line-args");

var cli = commandLineArgs([
  { "name": "new", "alias": "n", "type": String },
  { "name": "run", "type": Boolean, "defaultOption": true, defaultValue: true}
]);

var options = cli.parse();

if (options.new) {
  createNewExample(options.new);
  console.log("Example", options.new, "created");
} else {
  runServer();
}

function runServer() {
  var process = require('child_process');
  var ls = process.exec("node ../server/app.js");
  
  ls.stdout.on('data', function (data) {
	  console.log(data);
	});
	
	ls.stderr.on('data', function (data) {
	  console.log(data);
	});
  
}

function createNewExample(name) {
  
  var dirPath = path.join(__dirname, "../examples/", name)
  
  fs.mkdir(dirPath, function() {
    
    fs.readFile(path.join(__dirname, "exampleIndex.html"), function(error, data) {
      if (error) {
        console.error(error);
        return;
      }
      fs.writeFile(path.join(dirPath, "index.html"),  data.toString());
    });

    fs.readFile(path.join(__dirname, "exampleMain.js"), function(error, data) {
      if (error) {
        console.error(error);
        return;
      }
      fs.writeFile(path.join(dirPath, "main.js"),  data.toString());
    });
  
    fs.readFile(path.join(__dirname, "exampleScene.js"), function(error, data) {
      if (error) {
        console.error(error);
        return;
      }
      fs.writeFile(path.join(dirPath, "scene1.js"),  data.toString());
    });
  
    
  });
  
}