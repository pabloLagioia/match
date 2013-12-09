(function (namespace) {

	function CollisionMap(rows, columns) {
		if ( rows && columns ) {
			this.createMap(columns, rows);
		}
		this.renderingOptions = {
			tileSize: 114,
			colors: ["white", "black"]
		};
		this.rowCount = rows;
		this.columnCount = columns;
	}

	CollisionMap.prototype.createMap = function(rows, columns) {
		this.map = new Array();
		this.rowCount = rows;
		this.columnCount = columns;
		for ( var column = 0; column < columns; column++ ) {
			var mapColumn = new Array();
			for ( var row = 0; row < rows; row++ ) {
				mapColumn.push(0);
			}
			this.map.push(mapColumn);
		}
	};

	CollisionMap.prototype.fillCell = function(row, column) {
		if ( this.isValidCell(row, column) ) {
			if ( this.map[row][column] == 1 ) {
				return false;
			}
			this.map[row][column] = 1;
		}
		return true;
	};

	CollisionMap.prototype.isValidCell = function(row, column) {
		return row >= 0 && column >= 0 && row < this.rowCount && column < this.columnCount;
	};

	CollisionMap.prototype.clearCell = function(row, column) {
		if ( this.isValidCell(row, column) ) {
			this.map[row][column] = 0;
		}
	};

	CollisionMap.prototype.clear = function() {
		this.createMap(this.getRowCount(), this.getColumnCount());
	};

	CollisionMap.prototype.onRender = function(context) {

		var tileSize = this.renderingOptions.tileSize,
			map = this.map;

		for ( var i = 0, iM = map.length; i < iM; i++ ) {
			for ( var j = 0, jM = map[i].length; j < jM; j++ ) {
				if ( map[i][j] ) {
					context.fillStyle = this.renderingOptions.colors[map[i][j]];
					context.fillRect(j * tileSize, i * tileSize, tileSize, tileSize);
				}
			}
		}

	};

	CollisionMap.prototype.isEmpty = function(row, column) {
		return this.isValidCell(row, column) && this.map[row][column] == 0;
	};

	CollisionMap.prototype.isVisible = function() {
		return true;
	};

	namespace.CollisionMap = CollisionMap;

})(window.Match.collisions || ( window.Match.collisions = {} ) );