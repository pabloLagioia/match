var httpProxy = require('http-proxy'),
	http = require('http'),
	proxy = httpProxy.createProxy(),
	routes = {
		"/match": "http://localhost:8086/match",
		"/attribute": "http://localhost:8081/attribute",
		"/behaviour": "http://localhost:8082/behaviour",
		"/plugin": "http://localhost:8083/plugin"
	};

function getRoute(url) {

	var path,
		pos = -1;

	Object.keys(routes).some(function(key) {
		var pos = url.indexOf(key);
		if ( pos == 0 ) {
			path = routes[key] + url.substr(pos + key.length);
			return true;
		}
	});

	return path;

}

proxy.on("error", function(err, req, res) {
	console.error(err);
	res.end("error", "utf8");
});

http.createServer(function(req, res) {  

	var route = getRoute(req.url);

	if ( route ) {

		console.log("Routing to", route);

		proxy.web(req, res, {
			target: route
		});

	} else {

		console.error(req.url, "not found");

		res.statusCode = 404;
		res.end("not found", "utf8");
	}

}).listen(80);