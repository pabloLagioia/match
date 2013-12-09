(function(M) {

	function Line( properties) {
		this.from = {x: 0, y:0};
		this.to = {x: 100, y: 100};
		this.strokeStyle = "red";
		this._width = 1;
		this._visible = true;
		M.applyProperties( this, properties );
	}

	Line.prototype = {

		isOnCanvas: function(p) {
			// if ( this.from.x > 0 ) return;
			return true;
		},

		isVisible: function() {
			return this._visible;
		},

		onRender: function(context) {

			context.save();

			if ( this.alpha >= 0 && this.alpha <= 1 ) {

				context.globalAlpha = this.alpha;
			
			}

			if ( this._rotation ) {
				context.rotate(this._rotation);
			}

			if ( this._scale ) {
				context.scale(this._scale.x, this._scale.y);
			}

			context.beginPath();
			context.moveTo( this.from.x, this.from.y );
			context.lineTo( this.to.x, this.to.y );

			context.strokeStyle = this._strokeStyle;

			context.width = this._width;

			context.stroke();
			context.closePath();

			if ( this._shadow ) {
				context.shadowColor = this._shadow.color;
				context.shadowBlur = this._shadow.blur;
				context.shadowOffsetX = this._shadow.offsetX;
				context.shadowOffsetY = this._shadow.offsetY;
			}
			context.restore();
			
			this._changed = false;

		}

	};

	M.Line = Line;

})(window.Match);