
	//Using events
	pad.addEventListener("keyDown", function (keys, pad) {
		
		if (keys[keyboardMappings.left]) {
			pad.attributes.set("move", 1);
		}

	});

	//Using native keyboard trigger
	M.createTrigger("keyboard").set(function (keysDown, keysUp) {

		if ( keysDown.left ) {
			pad.attributes.set("move", 1);
		}

	});

	//Using custom trigger to create keyboard
	M.createTrigger("keyboard").addCondition(function (input) {

		return input.keyboard.keysDown.left == true;

	}).addEffect(function () {

		pad.attributes.set("move", 1);

	});

	//Using native keyboard trigger
	M.createTrigger("keyboard").bind(pad).onKeyDown("left", function (pad) {
		
		pad.attributes.set("move", 1);

	});
	M.createTrigger("keyboard").bind(pad).onKeyDown("right", function (pad) {
		
		pad.attributes.set("move", 2);

	});


	//Using native keyboard trigger
	M.createTrigger("keyboard").onKeyDown(function (keysDown) {

		if ( keysDown.left ) {
			pad.attributes.set("move", 1);
		}

	});

	M.createTrigger("timer");
	M.createTrigger("timer");