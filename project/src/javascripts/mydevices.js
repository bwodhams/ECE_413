if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
} else {
    sendReqForAccountInfo();
}

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
        console.log(data);
        console.log(textStatus);
        console.log(jqXHR);
        let outputHTML = "<table><tr><th>Device Name</th><th>Device ID</th><th>API Key</th></tr>";
        // Add the devices to the list before the list item for the add device button (link)
        let deviceNum = 0;
        for (var device of data.devices) {
            outputHTML += "<tr><td>" + device.name + '<div id="editButtons"><button id="editName' + deviceNum + '" onclick=editDeviceName(' + deviceNum + ')>edit</button>' + '&nbsp;&nbsp;&nbsp;<button id="deleteDevice' + deviceNum + '" onclick=deleteDevice(' + deviceNum + ')>delete</button></div></td><td>' +
                device.deviceId + "</td><td>" + device.apikey + "</td></tr>";
            deviceNum++;
        }
        if (data.data.length != 0) {
            outputHTML += "</table><br><br><table><tr><th>Latitude</th><th>Longitude</th><th>Speed</th><th>UV</th></tr>";

            for (let i = data.data.length - 1; i >= 0; i--) {
                outputHTML += "<tr><td>" + data.data[i].latitude + "</td><td>" + data.data[i].longitude + "</td><td>" + data.data[i].speed + "</td><td>" + data.data[i].uv + "</td></tr>";
            }
        }

        $("#allDevices").html(outputHTML + "</table>");
    } else {
        $("#noDevices").text("You have no registered devices.");
    }

}

function editDeviceName(deviceNumber) {
    window.location.replace("editdevice.html?deviceNum=" + deviceNumber);
}
let apiKey = "";
let deviceNumber = 0;

function deleteDevice(devNumber) {
    deviceNumber = devNumber;
    sendReqForAccountInfo2();
}

function sendReqForAccountInfo2() {
    $.ajax({
        url: '/users/account',
        type: 'GET',
        headers: {
            'x-auth': window.localStorage.getItem("authToken")
        },
        responseType: 'json',
        success: accountInfoSuccess2,
        error: accountInfoError
    });
}

function accountInfoSuccess2(data, textStatus, jqXHR) {
    if (data.devices.length != 0) {
        apiKey = data.devices[deviceNumber].apikey;
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", signUpResponse);
        xhr.responseType = "json";
        xhr.open("POST", '/users/deletedevice');
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("x-auth", window.localStorage.getItem("authToken"));
        xhr.send(JSON.stringify({
            apikey: apiKey
        }));
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
        responseHTML += "Error: " + this.response.error;
        responseHTML += "</span>"
    }

    // Update the response div in the webpage and make it visible
    responseDiv.style.display = "block";
    responseDiv.innerHTML = responseHTML;
}