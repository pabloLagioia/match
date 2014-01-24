(function (namespace) {

	function DefaultLogger() {
	}
	
	DefaultLogger.prototype.joinArgs = function(args) {
		var values = [];
		for ( var i in args ) {
			values.push(args[i]);
		}
		return values.join(" ");
	};

	if ( window.console ) {

		if ( window.console.log ) {
			DefaultLogger.prototype.log = function () {
				window.console.log(this.joinArgs(arguments));
			}
		} else {
			DefaultLogger.prototype.log = function (value) {
				alert(this.joinArgs(arguments));
			}
		}
		if ( window.console.warn ) {
			DefaultLogger.prototype.warn = function (value) {
				window.console.warn(this.joinArgs(arguments));
			}
		} else {
			DefaultLogger.prototype.warn = DefaultLogger.prototype.log;
		}
		if ( window.console.error ) {
			DefaultLogger.prototype.error = function (value) {
				window.console.error(this.joinArgs(arguments));
			}
		} else {
			DefaultLogger.prototype.error = DefaultLogger.prototype.log;
		}

	} else {
		
		DefaultLogger.prototype.log = function(value) {
			alert(this.joinArgs(arguments));
		}
		DefaultLogger.prototype.debug = DefaultLogger.prototype.log;
		DefaultLogger.prototype.warn = DefaultLogger.prototype.log;
		DefaultLogger.prototype.error = DefaultLogger.prototype.log;

	}
	
	namespace.DefaultLogger = DefaultLogger;

})(window);