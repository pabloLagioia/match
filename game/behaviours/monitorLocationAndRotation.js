(function (M) {

	M.registerBehaviour("monitorAttributes", function(entity, attributes) {
	
		var location = attributes.get("location"),
			rotation = attributes.get("rotation");
		
		if ( !this._cachedValues || this._cachedValues.x != location.x || this._cachedValues.y != location.y || this._cachedValues.rotation != rotation ) {

			this._cachedValues = {
				x: attributes.get("location").x,
				y: attributes.get("location").y,
				rotation: attributes.get("rotation")
			};

			attributes.push("attributeChanged", true);

			this.alreadyUpdated = false;
			
		} else if ( !this.alreadyUpdated ) {
			
			attributes.push("attributeChanged", false);
			
			this.alreadyUpdated = true;
			
		}
		
	});

})(M);