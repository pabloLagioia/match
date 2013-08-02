/**
 * @module Match
 */
(function(M) {

	var instance;

	function devicemotion(e) {
		instance.accelerate(e);
	}

	function Accelerometer() {
		window.addEventListener("devicemotion", devicemotion, false);
	}

	Accelerometer.prototype.accelerate = function(event) {
		this._hasEvent = true;
		this.accelerationIncludingGravity = event.accelerationIncludingGravity;
		this.acceleration = event.acceleration;
		this.rotationRate = event.rotationRate;
	};

	Accelerometer.prototype.update = function() {
		this._hasEvent = false;
	};

	Accelerometer.prototype.right = function() {
		return this._hasEvent && (this.acceleration.x > 0 || this.accelerationIncludingGravity.x > 0);
	};
	Accelerometer.prototype.left = function() {
		return this._hasEvent && (this.acceleration.x < 0 || this.accelerationIncludingGravity.y < 0);
	};
	Accelerometer.prototype.up = function() {
		return this._hasEvent && this.acceleration.y > 0;
	};
	Accelerometer.prototype.down = function() {
		return this._hasEvent && this.acceleration.y < 0;
	};

	Accelerometer.prototype.applyToObject = function(node) {
		if ( this._hasEvent ) {
			if ( node.onDeviceAccelerationIncludingGravity ) {
				node.onDeviceAccelerationIncludingGravity(this.accelerationIncludingGravity.x, this.accelerationIncludingGravity.y, this.accelerationIncludingGravity.z, this.rotationRate);
			}
			if ( node.onDeviceAcceleration ) {
				node.onDeviceAcceleration(this.acceleration.x, this.acceleration.y, this.acceleration.z, this.rotationRate);
			}
			if ( node.onDeviceRotation ) {
				/*
				 * alpha
				 *	The rate at which the device is rotating about its Z axis; that is, being twisted about a line perpendicular to the screen.
				 * beta
				 *	The rate at which the device is rotating about its X axis; that is, front to back.
				 * gamma
				 *	The rate at which the device is rotating about its Y axis; that is, side to side.
				 */
				node.onDeviceRotation(this.rotationRate.alpha, this.rotationRate.beta, this.rotationRate.gamma);
			}
		}
	};

	instance = new Accelerometer();

	M.setAccelerometer(instance);

})(window.Match);