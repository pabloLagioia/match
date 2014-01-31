(function (M) {
	
	function CustomTrigger() {

		this.extendsTrigger();

		this.conditions = [];
		this.effects = [];

	}
	
	CustomTrigger.prototype.update = function() {

		var i, l;

		for ( i = 0, l = this.conditions.length; i++ ) {
			if ( ! this.conditions[i](this) ) {
				return;
			}
		}
		
		for ( i = 0, l = this.effects.length; i++ ) {
			this.effects[i](this);
		}

	};

	CustomTrigger.prototype.addCondition = function(callback) {
		this.conditions.push(callback);
	};

	CustomTrigger.prototype.addEffect = function(callback) {
		this.effects.push(callback);
	};

	CustomTrigger.prototype.removeCondition = function(callback) {
		var index = this.conditions.indexOf(callback);
		if ( index > -1 ) {
			this.conditions.splice(callback, index);
		}
	};

	CustomTrigger.prototype.removeEffect = function(callback) {
		var index = this.effects.indexOf(callback);
		if ( index > -1 ) {
			this.effects.splice(callback, index);
		}
	};

	M.extend(M.CustomTrigger, M.Trigger);

	M.CustomTrigger = CustomTrigger;

})(Match);