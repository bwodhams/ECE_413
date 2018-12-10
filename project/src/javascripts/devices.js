// If there's no authToekn stored, redirect user to 
// the sign-in page (which is index.html)
if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
} else {
    $("#submitButton").click(registerDevice);
}

function registerDevice() {
    let responseDiv = document.getElementById('serverResponse');
    $.ajax({
        url: '/devices/register',
        type: 'POST',
        headers: {
            'x-auth': window.localStorage.getItem("authToken")
        },
        data: {
            deviceId: $("#deviceId").val(),
            name: $("#nameInput").val()
        },
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            // Add new device to the device list
            $("#addDeviceForm").before("<li class='collection-item'>ID: " +
                $("#deviceId").val() + ", APIKEY: " + data["apikey"] + "</li>");
            responseDiv.innerText = "Your API Key is : " + data["apikey"];
        },
        error: function (jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
            responseDiv.innerText = "Error: " + response.message;
        }
    });
}