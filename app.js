var express = require('express'),
	fileList = require("./match.json"),
	fs = require("fs"),
	path = require("path"),
	app = express(),
	request = require("request"),
	server;

// app.get("/attribute*", function(req, res, next) {
// 	request.get("http://localhost:8081/" + req.originalUrl, function(err, response, body) {
// 		res.contentType(response.contentType).status(response.status).send(body);
// 	});
// });
// app.get("/behaviour*", function(req, res) {
// 	request.get("http://localhost:8082" + req.originalUrl, function(err, response, body) {
// 		res.contentType(response.contentType).status(response.status).send(body);
// 	});
// });
// app.get("/plugin*", function(req, res) {
// 	request.get("http://localhost:8083" + req.originalUrl, function(err, response, body) {
// 		res.contentType(response.contentType).status(response.status).send(body);
// 	});
// });

app.get("/match", function(req, res) {

	var data = "";

	fileList.forEach(function(fileName) {

		if ( fileName.substr(-3) != ".js" ) {
			fileName += ".js";
		}

		data += fs.readFileSync(path.join("./", fileName), "utf8");

	});

	res.contentType("application/json").status(200).send(data);

});

app.use(express.static(__dirname + "/"));

server = app.listen(8086, function() {
    console.log('Listening on port %d', server.address().port);
});