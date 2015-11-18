var express = require('express'),
	fileList = require("./match.json"),
	fs = require("fs"),
	path = require("path"),
	app = express(),
	matchInternalPath = __dirname.substr(0, __dirname.lastIndexOf("/")),
	server,
	watch = require("node-watch"),
  open = require('open'),
	merged = getMergedFiles();
  
app.use(function(req, res, next) {
	
  if ( req.url.indexOf("/match/server") != -1 ) {
    res.status(403).end("Nothing here");
  }
  
	if ( req.url.indexOf("?") == -1 && req.url.substr(-4) != "html" && req.url.substr(-3) != "htm" && req.url.substr(-1) != "/" && req.url.lastIndexOf(".") == -1 ) {
    res.redirect(req.url + "/");
	} else {
		next();
	}

});

app.get("/behaviour/js", function(req, res) {
	
	var files = req.query.q.split(",");
	
	var sources = files.map(function(file) {
		
		var filePath = file.substr(0, 1).toUpperCase() + file.substr(1) + ".js";
		
		return fs.readFileSync(path.join(matchInternalPath, "game", "behaviours", filePath)).toString();
		
	});
	
  res.set("Content-Type", "text/javascript");
	res.send(sources.join("\n"));
	
});

app.get("/attribute/js", function(req, res) {
	
	var files = req.query.q.split(",");
	
	var sources = files.map(function(file) {
		
		var filePath = file.substr(0, 1).toUpperCase() + file.substr(1) + ".js";
		
		return fs.readFileSync(path.join(matchInternalPath, "game", "attributes", filePath)).toString();
		
	});
  
	res.set("Content-Type", "text/javascript");
	res.send(sources.join("\n"));
	
});

app.get("/match/merged/min", function(req, res) {
	res.status(500).send("Not implemented yet!");
});

app.get("/match/merged", function(req, res) {
	res.contentType("text/javascript").status(200).send(merged);
});

app.get("/match/*", function(req, res) {

	var filePath = path.join(matchInternalPath, req.url.substr("/match/".length));

	if ( fs.existsSync(filePath) ) {

		if ( fs.lstatSync(filePath).isDirectory() ) {

			var indexHtml = path.join(filePath, "index.html");

			if ( fs.existsSync(indexHtml) ) {
				return res.sendfile(indexHtml);
			} else {
				console.error("File not found", indexHtml);
				res.status(400).end();
			}

		} else {

			if ( fs.existsSync(filePath)) {
				return res.sendfile(filePath);
			} else {
				console.error("File not found", filePath);
				res.status(400).end();
			}


		}

	}

	console.error(filePath, "not found");

	res.status(404).end();

});

function getMergedFiles() {

	var merged = "";

	fileList.forEach(function(fileName) {

		if ( fileName.substr(-3) != ".js" ) {
			fileName += ".js";
		}

		merged += fs.readFileSync(path.join(matchInternalPath, fileName), "utf8");

	});

	return merged;
		
}

watch([matchInternalPath, "match.json"], function(filename) {
  if (!/\.js$/.test(filename)) {
    return;
  }
	console.log(filename, "changed, rebuilding");
	merged = getMergedFiles();
});

server = app.listen(8086, function() {
	console.log('Match Service Listening on port %d', server.address().port);
	console.log('You can navigate, for example, to http://localhost:' + server.address().port + "/match/merged to get the sources concatenated");
  console.log("Serving folder", matchInternalPath);
  open('http://localhost:' + server.address().port + "/match/examples");
});