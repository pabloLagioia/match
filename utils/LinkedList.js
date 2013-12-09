(function(namespace) {

	function LinkedListNode(a) {
		this.next = null;
		this.prev = null;
		this.value = a;
	}

	LinkedListNode.prototype.replace = function(node) {
		this.prev.next = node;
		this.next.prev = node;
	};

	LinkedListNode.prototype.insert = function(node) {
		node.prev = this;
		node.next = this.next;
		this.next = node;
	};

	LinkedListNode.prototype.remove = function() {
		if ( this.prev ) {
			this.prev.next = this.next;
		}
		if ( this.next ) {
			this.next.prev = this.prev;
		}
	};



	function LinkedList() {
		this.first = null;
		this.last = this.first;
		this.current = this.first;
		this.size = 0;
	}

	LinkedList.prototype.toArray = function() {
		var indexed = [];
		while ( this.next() ) {
			indexed.push(this.current);
		}
		return indexed;
	};

	LinkedList.prototype.push = function(node) {
		node.prev = this.last;
		if ( this.first == null ) {
			this.first = node;
		} else {
			this.last.next = node;
		}
		this.last = node;
		node.next = null;
		this.size++;
	};

	LinkedList.prototype.reset = function() {
		this.first = this.current;
	};

	LinkedList.prototype.get = function(index) {
		if ( index < 0 ) return;
		if ( index > this.size ) return;
		this.current = this.first;
		for ( var i = 0; i < index; i++ ) {
			this.next();
		}
		return this.current;
	};

	LinkedList.prototype.remove = function(node) {
		if ( node == this.first ) {
			this.first = node.next;
		}
		node.remove();
		this.size--;
	};

	LinkedList.prototype.next = function() {
		if ( this.current ) {
			return this.current = this.current.next;
		}
		return this.current = this.first;
	};

	namespace.LinkedListNode = LinkedListNode;
	namespace.LinkedList = LinkedList;

})(M);