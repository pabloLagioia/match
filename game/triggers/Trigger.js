(function (M) {
	
	function Trigger() {
		this.disabled = false;
	}

	Trigger.prototype.enable = function() {
		this.disabled = false;
	};

	Trigger.prototype.disable = function() {
		this.disabled = true;
	};

	Trigger.prototype.onLoop = function() {
		if ( this.disabled ) return;
		this.update();
	};

	Trigger.name = "Trigger";

	M.Trigger = Trigger;

})(Match);