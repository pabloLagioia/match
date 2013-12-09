if (typeof require == "function" && typeof module == "object") {
    buster = require("buster");
    require("./strftime");
}

var assert = buster.assert;

buster.testCase("Stretch Canvas", {

    setUp: function () {
		M.frontBuffer = {
			canvas: {
				style: {
				}
			}
		}
    },

	"setCanvasStretch": function () {
	
		M.setCanvasStretch(true);
		assert.equals(M.frontBuffer.canvas.style.width, document.documentElement.clientWidth + "px");
		assert.equals(M.frontBuffer.canvas.style.height, document.documentElement.clientHeight + "px");
		
		M.setCanvasStretch(false);
		assert.equals(M.frontBuffer.canvas.style.width, "auto");
		assert.equals(M.frontBuffer.canvas.style.height, "auto");
		
	},	
	"setCanvasStretchTo": function () {
	
		M.setCanvasStretchTo("100%", "50%");
		assert.equals(M.frontBuffer.canvas.style.width, "100%");
		assert.equals(M.frontBuffer.canvas.style.height, "50%");
		
		M.setCanvasStretchTo(100, 100);
		assert.equals(M.frontBuffer.canvas.style.width, "100px");
		assert.equals(M.frontBuffer.canvas.style.height, "100px");
		
	}
});