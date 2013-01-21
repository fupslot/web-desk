(function(window, doc, $, undef) {

	$.subscribe("event/my1", function (event) {
		console.log("Event: %s has been trigged", event.type);
	});

	function flush(event) {
		console.log("Person %s just flushed", this.person);
	};


	$("body").on("click.event1", "#event_onclick", function () {
		console.log("Event Click: fired");
	});

	$("body").on("mouseup.event2", "#event_onclick", function () {
		console.log("Event MouseUp: fired");
	});


	$("body").on("click", "#flushing", $.proxy(flush, {"person": "me"}) );

	$("#trigger").click(function(){
		$.publish("event/my1");
		$.unsubscribe("event/my1");
	});
	$("#unstage_event_onclick").click(function() {
		$("body").off(".event1");
	});

})(window, document, jQuery);
