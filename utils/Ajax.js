(function( M ) {

	function Ajax() {
	}

	Ajax.prototype._request = function(method, url, callback, owner) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if ( this.readyState == 4 && this.status == 200 ) {
				if ( owner ) {
					callback.call(owner, this.responseText);
				} else {
					callback(this.responseText);
				}
			}
		};
		xmlhttp.open(method, url, true);
		xmlhttp.send();
	};

	Ajax.prototype.post = function(url, callback) {
		this._request("POST", url, callback);
	};

	Ajax.prototype.get = function(url, callback) {
		this._request("GET", url, callback);
	};

	M.Ajax = new Ajax();

})( window.Match );