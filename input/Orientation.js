/**
 * @module Match
 */
(function(M) {

	var instance;

	function deviceorientation(e) {
		instance.accelerate(e);
	}

	function Orientation() {
	}

	Orientation.prototype.orientate = function(event) {
		//On return, absolute is true if the orientation data in instanceOfDeviceOrientationEvent is
		//provided as the difference between the Earth's coordinate frame and the device's
		//coordinate frame, or false if the orientation data is being provided in reference to some arbitrary,
		//device-determined coordinate frame.
		this.absolute = event.absolute;
		//From -180 to 180 front back motion
		this.x = event.beta;
		//From -90 to 90 left to right
		this.y = event.gamma;
		//From 0 to 360 rotation around z-axis
		this.z = event.alpha;
	};

	Orientation.prototype.update = function() {
		this._hasEvent = false;
		this.absolute = null;
		this.z = null;
		this.x = null;
		this.y = null;
	};

	Orientation.prototype.applyToObject = function(node) {
		if ( this._hasEvent ) {
			if ( node.onDeviceOrientation ) {
				node.onDeviceOrientation(this.x, this.y, this.z);
			}
			if ( node.onFrontToBack ) {
				node.onFrontToBack(this.x, this.z);
			}
			if ( node.onLeftToRight ) {
				node.onLeftToRight(this.y, this.z);
			}
		}
	};

	Orientation.prototype.bind = function() {
		window.addEventListener("deviceorientation", deviceorientation, false);
		M.setOrientation(this);
	};

	Orientation.prototype.unbind = function() {
		window.removeEventListener("deviceorientation", deviceorientation);
		M.setOrientation(null);
	};

	if ( window.DeviceOrientationEvent ) {
		instance = new Orientation();
		instance.bind();
		M.setOrientation(instance);
	} else {
		console.warn("This device does not suport HTML5 orientation");
	}

})(window.Match);