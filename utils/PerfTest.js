function perfTest(name, func) {

	var amount = 50,
		avg = 0;

	for ( var i = 0; i < amount; i++ ) {

		var d = new Date().getTime();
		func();
		avg += new Date().getTime() - d;
	
	}
	
	console.debug(name, avg / amount);
	
}