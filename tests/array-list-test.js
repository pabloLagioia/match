if (typeof require == "function" && typeof module == "object") {
    buster = require("buster");
    require("./strftime");
}

var assert = buster.assert;

buster.testCase("Array List", {

	"push": function () {
	
		var al = new M.ArrayList();

		for ( var i = 0; i < 10; i++ ) {
			al.push(i);
		}
		
		assert.equals(al.size, 10);
		assert.equals(al.size, al._list.length);

		for ( var i = 0; i < 10; i++ ) {
			assert.equals(al._list[i], i);
		}
		
	},
	"get": function () {
	
		var al = new M.ArrayList();

		for ( var i = 0; i < 10; i++ ) {
			al.push(i);
		}
		
		for ( var i = 0; i < 10; i++ ) {
			assert.equals(al._list[i], i);
			assert.equals(al.get(i), i);
		}
		
	},
	"remove": function () {
	
		var al = new M.ArrayList(),
			indexToRemove = 3,
			maxItems = 10;

		for ( var i = 0; i < maxItems; i++ ) {
			al.push(i);
		}
		
		al.remove(indexToRemove);
		
		assert.equals(al.size, maxItems - 1);
		
		for ( var i = 1; i < al.size; i++ ) {
			if ( i < indexToRemove ) {
				assert.equals(al._list[i], i);
			} else {
				assert.equals(al._list[i], i + 1);
			}
		}
		
	},
	"quickRemove": function () {
	
		var al = new M.ArrayList(),
			indexToRemove = 3,
			totalItems = 10;

		for ( var i = 0; i < totalItems; i++ ) {
			al.push(i);
		}
		
		al.quickRemove(indexToRemove);
		
		assert.equals(al.size, al._list.length - 1);
		assert.isNull(al._list[al._list.length - 1]);
		assert.equals(al._list[indexToRemove], totalItems - 1);

	}


});