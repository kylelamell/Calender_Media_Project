// this script deals with the user input from the input page

// the event input button
function event(eventString, eventLongString, dateString, onSuccess) {
    $.ajax({
        url: "calender_event",
        data: {
            event_string: eventString,
            event_long_string: eventLongString,
            date_string: dateString,
        },
        dataType: "json",
        type: "GET",
        success: function(response) {
            onSuccess(response);
        }
    });
}
$("#input-button").on("click", function() {
    let eventString = $("#event-input").val();
    let dateString = $("#date-input").val();
    let eventLongString = $("#event-long-input").val();
    event(eventString, eventLongString, dateString, function(working) {
        $("#working").text(working);
    });
});

// the media quote input button
function mediaText(mediaString, onSuccess) {
    $.ajax({
        url: "media_event_string",
        data: {
            media_string: mediaString
        },
        dataType: "json",
        type: "GET",
        success: function(response) {
            onSuccess(response);
        }
    });
}
$("#input-button2").on("click", function() {
    let mediaString = $("#media-text-input").val();
    mediaText(mediaString, function(working) {
        $("#working").text(working);
    });
});

// the media image input button
function mediaImage(form_data, onSuccess) {
    $.ajax({
        url: "media_event_image",
        data: form_data,
        type: "POST",
        contentType: false,
        cache: false,
        processData: false,
        success: function(response) {
            onSuccess(response);
        }
    });
}
$("#input-button3").on("click", function() {
    var form_data = new FormData();
    var file_input = $("#media-image-input")[0].files[0];
    form_data.append("media_image", file_input);
    mediaImage(form_data, function(working) {
        $("#working").text(working);
    });
});
