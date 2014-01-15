$(document).ready(function() {
	$(".item .name").on("click", function() {
		
		var $this = $(this),
			alreadySelected = $this.hasClass("selected");
		
		$(".item .data").addClass("hidden");
		$(".item").removeClass("selected");
		
		if ( !alreadySelected ) {
			$this.parent().find(".data").removeClass("hidden");
			$this.parent().addClass("selected");
		}
		
	});
});