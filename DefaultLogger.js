(function (namespace) {

	function DefaultLogger() {
	}

	if ( window.console ) {

		if ( window.console.log ) {
			DefaultLogger.prototype.log = function (value) {
				window.console.log(value);
			}
		} else {
			DefaultLogger.prototype.log = function (value) {
				alert(value);
			}
		}
		if ( window.console.warn ) {
			DefaultLogger.prototype.warn = function (value) {
				window.console.warn(value);
			}
		} else {
			DefaultLogger.prototype.warn = DefaultLogger.prototype.log;
		}
		if ( window.console.error ) {
			DefaultLogger.prototype.error = function (value) {
				window.console.error(value);
			}
		} else {
			DefaultLogger.prototype.error = DefaultLogger.prototype.log;
		}

	} else {
		
		DefaultLogger.prototype.log = function(value) {
			alert(value);
		}
		DefaultLogger.prototype.debug = DefaultLogger.prototype.log;
		DefaultLogger.prototype.warn = DefaultLogger.prototype.log;
		DefaultLogger.prototype.error = DefaultLogger.prototype.log;

	}
	
	namespace.DefaultLogger = DefaultLogger;

})(window);