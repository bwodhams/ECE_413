if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
} else {
    sendReqForAccountInfo();
}
let editDeviceNum = location.search.substring(11).split(location.search.length);
let originalDeviceName = "";
let originalDeviceId = 0;
let apiKey = "";

function sendReqForAccountInfo() {
    $.ajax({
        url: '/users/account',
        type: 'GET',
        headers: {
            'x-auth': window.localStorage.getItem("authToken")
        },
        responseType: 'json',
        success: accountInfoSuccess,
        error: accountInfoError
    });
}

function accountInfoSuccess(data, textStatus, jqXHR) {
    if (data.devices.length != 0) {
        originalDeviceName = data.devices[editDeviceNum].name;
        originalDeviceId = data.devices[editDeviceNum].deviceId;
        apiKey = data.devices[editDeviceNum].apikey;
        document.getElementById("originalDevId").innerHTML = originalDeviceId;
        document.getElementById("originalDevName").innerHTML = originalDeviceName
    } else {

    }

}

function accountInfoError(jqXHR, textStatus, errorThrown) {
    // If authentication error, delete the authToken 
    // redirect user to sign-in page (which is index.html)
    if (jqXHR.status === 401) {
        console.log("Invalid auth token");
    } else {

    }
}


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitButton").addEventListener("click", updateDevice);
});

function updateDevice() {
    var devId = document.getElementById("deviceId").value;
    var devName = document.getElementById("nameInput").value;
    if (devId.length == 0) {
        devId = null;
    }
    if (devName.length == 0) {
        devName = originalDeviceName;
    }
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", signUpResponse);
    xhr.responseType = "json";
    xhr.open("PUT", '/users/updatedevice');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("x-auth", window.localStorage.getItem("authToken"));
    xhr.send(JSON.stringify({
        deviceId: devId,
        name: devName,
        apikey: apiKey
    }));


}

function signUpResponse() {
    let responseDiv = document.getElementById("serverResponse");
    let responseHTML = "";
    // 200 is the response code for a successful GET request
    if (this.status === 201) {
        if (this.response.success) {
            window.location.replace("deviceinfo.html");
        } 
    } else {
        // Use a span with dark red text for errors
        responseHTML = "<span class='red-text text-darken-2'>";
        responseHTML += "Error: " + this.response.message;
        responseHTML += "</span>"
    }

    // Update the response div in the webpage and make it visible
    responseDiv.style.display = "block";
    responseDiv.innerHTML = responseHTML;
}