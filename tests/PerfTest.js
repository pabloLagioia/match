function perfTest(name, func) {
	
	var d = new Date().getTime();

	func();

	console.debug(name, new Date().getTime() - d);

}

	function ArrayList() {
	    this._list = new Array(10);
	    this.size = 0;
	}

    ArrayList.prototype.push = function (item) {
        //this._list.push(item);
        if ( this.size == this._list.length ) {
        	this._list.length += 10;
        }
        this._list[this.size] = item;
        this.size++;
    };

    ArrayList.prototype.get = function (i) {
        return this._list[i];
    };

    ArrayList.prototype.quickRemove = function (i) {
        this._list[i] = null;
        this._swap(i, this.size - 1);
        this.size--;
    };

    ArrayList.prototype.remove = function (i) {
        /*
        var s = this.size;
        for ( var j = i + 1; j < s; j++, i++ ) {
                this._swap(i, j);
        }
        this[s - 1] = null;
        this.size--;
        */
        // this._list.splice(i, 1);
        this._list[i] = null;
        this.size--;
    };

    ArrayList.prototype.each = function (fnc) {

        var l = this._list,
            s = this.size,
            c;

        for ( var i = 0; i < s; i++ ) {
            c = l[i];
            if ( c ) {
                fnc(l[i], i, this);
            }
        }

    };

    ArrayList.prototype._swap = function (from, to) {

        var f = this._list[from],
                t = this._list[to];

        this._list[from] = t;
        this._list[to] = f;

    };

var al = new ArrayList(),
	arr = [],
	maxItems = 10000;

for ( var i = 0; i < maxItems; i++ ) {
    al.push(i);
    arr.push(i);
}

perfTest("ArrayList Push", function() {

	for ( var i = 0; i < maxItems; i++ ) {
	    al.push(i);
	}

});

perfTest("Array Push", function() {

	for ( var i = 0; i < maxItems; i++ ) {
	    arr.push(i);
	}

});


perfTest("ArrayList Iterate", function() {

	var l = al._list;
	for ( var i = 0; i < al.size; i++ ) {
		var a = l[i] + i;
	}

});


perfTest("Array Iterate", function() {

	for ( var i = 0; i < arr.length; i++ ) {
		var a = arr[i] + i;
	}

});


perfTest("Array Splice", function() {

	for ( var i = 0; i < 1000; i++ ) {
		arr.splice(6, 1);
	}

});


perfTest("ArrayList Remove", function() {

	for ( var i = 0; i < 1000; i++ ) {
		al.remove(6);
	}

});


perfTest("ArrayList QuickRemove", function() {

	al.quickRemove(0);

});


perfTest("ArrayList Each", function() {

	al.each(function (item, index) {
		var a = item + index;
	});

});