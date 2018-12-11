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
var dataPlots;

function accountInfoSuccess(data, textStatus, jqXHR) {
    if (data.devices.length != 0) {
        console.log(data);
        console.log(textStatus);
        console.log(jqXHR);
        let outputHTML = "<table><tr><th>Device Name</th><th>Device ID</th><th>API Key</th></tr>";
        // Add the devices to the list before the list item for the add device button (link)
        let deviceNum = 0;
        for (var device of data.devices) {
            outputHTML += '<tr><td><button id="' + device.deviceId + '" onclick = updateData("' + device.deviceId + '")>' + device.name + '</button>' + '<div id="editButtons"><button id="editName' + deviceNum + '" onclick=editDeviceName(' + deviceNum + ')>edit</button>' + '&nbsp;&nbsp;&nbsp;<button id="deleteDevice' + deviceNum + '" onclick=deleteDevice(' + deviceNum + ')>delete</button></div></td><td>' +
                device.deviceId + "</td><td>" + device.apikey + "</td></tr>";
            deviceNum++;
        }

        outputHTML += "</table><br><br>";

        dataPlots = data.data;
        console.log(dataPlots);

        $("#allDevices").html(outputHTML);
    } else {
        $("#noDevices").text("You have no registered devices.");
    }

}
let currentDataPoints = [];

function updateData(deviceId) {

    var outputHTML = "";
    var count = 0;

    //data.datas.length != 0
    //console.log(this);
    if (dataPlots.length != 0) {
        outputHTML += '<div class="activity">Select an activity to view a map of the activity!   <button id="biking" onclick=drawMap("biking")>Biking</button><button id="running" onclick=drawMap("running")>Running</button><button id="walking" onclick=drawMap("walking")>Walking</button></div><br><table><tr><th>Latitude</th><th>Longitude</th><th>Speed</th><th>Activity</th><th>UV</th><th>Calories Burned</th></tr>';
        for (let i = dataPlots.length - 1; i >= 0; i--) {
            if (dataPlots[i].deviceId == deviceId) {
                currentDataPoints.push(dataPlots[i]);
                count++;
                outputHTML += "<tr><td>" + dataPlots[i].latitude + "</td><td>" + dataPlots[i].longitude + "</td><td>" + dataPlots[i].speed + "</td><td>" + dataPlots[i].activity + "</td><td>" + dataPlots[i].uv + "</td><td>//calculate calories</tr>";
            }
        }
        if (count > 0) {
            $("#deviceInfo").html(outputHTML + "</table>");
            drawMap(0);
        } else {
            $("#noData").text("You have no data for device : " + deviceId);
        }

    } else {
        $("#noData").text("You have no data for this device." + deviceId);
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

function drawMap(data) {
    if (data == 0) {
        let uluru = {
            lat: 32.2319,
            lng: -110.9501
        };
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: uluru
        });
        var marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
    } else {
        let uluru = {
            lat: 32.2319,
            lng: -110.9501
        };
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: uluru
        });
        for (var location of currentDataPoints) {
            if (location.activity == data) {
                uluru = {
                    lat: location.latitude,
                    lng: location.longitude
                };
                var marker = new google.maps.Marker({
                    position: uluru,
                    map: map
                });
            }
        }


    }


}