if (typeof require == "function" && typeof module == "object") {
    buster = require("buster");
    require("./strftime");
}

var assert = buster.assert;

buster.testCase("Linked List", {

	"push": function () {
	
		var ll = new M.LinkedList();

		for ( var i = 0; i < 10; i++ ) {
			ll.push(new M.LinkedListNode(i));
		}
		
		assert.equals(ll.size, 10);
		assert.isNull(ll.current);
				
		for ( var i = 0; i < 10; i++ ) {
			assert.equals(ll.next().value, i);
		}
		
		assert.isFalse(ll.first == null);
		assert.isFalse(ll.last == null);
		
	},	
	"remove": function () {
	
		var ll = new M.LinkedList();

		for ( var i = 0; i < 10; i++ ) {
			ll.push(new M.LinkedListNode(i));
		}
		
		ll.remove(ll.first);
		
		assert.equals(ll.size, 9);
		
		
		for ( var i = 1; i < 10; i++ ) {
			assert.equals(ll.next().value, i);
		}
		
	},
	"next": function () {
	
		var ll = new M.LinkedList();

		for ( var i = 0; i < 10; i++ ) {
			ll.push(new M.LinkedListNode(i));
		}
		
		for ( var i = 0; i < 10; i++ ) {
			ll.next();
		}
		
		assert.isNull(ll.next());
		
	},
	"get": function () {
	
		var ll = new M.LinkedList();

		for ( var i = 0; i < 10; i++ ) {
			ll.push(new M.LinkedListNode(i));
		}
		
		for ( var i = 0; i < 5; i++ ) {
			ll.next();
		}
		
		var node1 = ll.current;
		var node2 = ll.get(4);
		
		assert.equals(node1, node2);
		
	},
	"toArray": function () {

		var ll = new M.LinkedList();

		for ( var i = 0; i < 10; i++ ) {
			ll.push(new M.LinkedListNode(i));
		}

		
		var arr = ll.toArray();
		
		for ( var i = 0; i < 10; i++ ) {
			assert.equals(arr[i], ll.get(i));
		}
		
	},
	"reset": function () {

		var ll = new M.LinkedList();

		for ( var i = 0; i < 10; i++ ) {
			ll.push(new M.LinkedListNode(i));
		}

		
		ll.next();
		ll.next();
		ll.next();
		
		ll.reset();
		
		assert.equals(ll.current, ll.first);
		
	}

});