let userEmail = "";
let userName = "";

function sendReqForSignup() {
    var email = document.getElementById("accEmail").value;
    var password = "";
    if (email.length == 0) {
        email = userEmail;
        console.log("in here");
    }
    if(document.getElementById("yesChangePass")){
        password = document.getElementById("accPassword").value;
    }else{
        password = document.getElementById("newPassword").value;
    }
    if(document.getElementById("accName").value.length == 0){
        
    }else{
        userName = document.getElementById("accName").value;
    }
    

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", signUpResponse);
    xhr.responseType = "json";
    xhr.open("PUT", '/users/update');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("x-auth", window.localStorage.getItem("authToken"));
    if(document.getElementById("yesChangePass")){
        xhr.send(JSON.stringify({
            email: email,
            name: userName,
            password: password
        }));
    }else{
        xhr.send(JSON.stringify({
            email: email,
            name: userName,
            password: password
        }));
    }
    
}

function signUpResponse() {
    let responseDiv = document.getElementById("serverResponse");
    // 200 is the response code for a successful GET request
    if (this.status === 201) {
        if (this.response.success) {
            // Change current location to the signin page.
            window.localStorage.removeItem("authToken");
            window.location = "index.html";
            responseHTML += "<ol class='ServerResponse'>";
            for (key in this.response) {
                responseHTML += "<li> " + key + ": " + this.response[key] + "</li>";
            }
            responseHTML += "</ol>";
        } else {
            responseHTML += "<ol class='ServerResponse'>";
            for (key in this.response) {
                responseHTML += "<li> " + key + ": " + this.response[key] + "</li>";
            }
            responseHTML += "</ol>";
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

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signup").addEventListener("click", sendReqForSignup);
});

document.addEventListener("DOMContentLoaded", function () {
    sendReqForAccountInfo();
    document.getElementById("yesChangePass").addEventListener("click", changeDOM);
    document.getElementById("submitButton").addEventListener("click", submit);
});

function testing() {
    console.log("asdf");
}

function changeDOM() {
    let mainDiv = document.getElementById("mainDiv");
    mainDiv.innerHTML = '<input id="newPassword" type="password" name="newPassword" title="Enter new password" placeholder="enter new password" value=""required><br><br><input id="confirmPassword" type="password" name="confirmPassword" title="Confirm your new password" placeholder="confirm new password" value=""required>';
}

function sendReqForAccountInfo() {
    $.ajax({
        url: '/users/account',
        type: 'GET',
        headers: {
            'x-auth': window.localStorage.getItem("authToken")
        },
        responseType: 'json',
        success: showEmail,
    });
}

function showEmail(data, textStatus, jqXHR) {
    let accountEmail = document.getElementById("currentEmail");
    let accountNameLabel = document.getElementById("currentName");
    accountEmail.innerHTML = data.email;
    accountNameLabel.innerHTML = data.fullName;
    userEmail = data.email;
    userName = data.fullName;
}

function errorCheck() {

    let emailInput = document.getElementById("accEmail");
    let currentPassword = document.getElementById("accPassword");
    let passwordInput = document.getElementById("newPassword");
    let confirmPassword = document.getElementById("confirmPassword");

    let emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    let pwdLowerReg = /[a-z]+/;
    let pwdUpperReg = /[A-Z]+/;
    let pwdNumReg = /.*\d.*/;


    let error = false;
    let updateDiv = document.getElementById("formErrors");
    let outputString = '<ul><br>';
    if (currentPassword.value.length == 0) {
        error = true;
        outputString += "<li>You must enter your current password to change your information.</li><br>";
    }
    if (passwordInput) {
        if (passwordInput.value.length >= 10 && passwordInput.value.length <= 20) {
            passwordInput.classList.remove("error");
        } else {
            outputString += "<li>Password must be between 10 and 20 characters.</li><br>";
            passwordInput.classList.add("error");
            error = true;
        }

        if (pwdLowerReg.test(passwordInput.value)) {
            passwordInput.classList.remove("error");
        } else {
            outputString += "<li>Password must contain at least one lowercase character.</li><br>";
            passwordInput.classList.add("error");
            error = true;
        }

        if (pwdUpperReg.test(passwordInput.value)) {
            passwordInput.classList.remove("error");
        } else {
            outputString += "<li>Password must contain at least one uppercase character.</li><br>";
            passwordInput.classList.add("error");
            error = true;
        }

        if (pwdNumReg.test(passwordInput.value)) {
            passwordInput.classList.remove("error");
        } else {
            outputString += "<li>Password must contain at least one digit.</li><br>";
            passwordInput.classList.add("error");
            error = true;
        }

        if (passwordInput.value != confirmPassword.value) {
            outputString += "<li>Password and confirmation password don't match.</li>";
            confirmPassword.classList.add("error");
            error = true;
        } else {
            confirmPassword.classList.remove("error");
        }
    }
    if (emailInput.value == "") {

    } else {
        if (emailReg.test(emailInput.value)) {
            emailInput.classList.remove("error");
        } else {
            emailInput.classList.add("error");
            outputString += "<li>Invalid or missing email address.</li><br>";
            error = true;
        }
    }

    outputString += "</ul><br>";
    updateDiv.innerHTML = outputString;

    if (error) {
        document.getElementById("formErrors").style.display = "block";
    } else {
        document.getElementById("formErrors").style.display = "none";
    }

    return error;

}

function submit() {
    if (!errorCheck()) {
        console.log("ready to adjust account details");
        sendReqForSignup();
    }
}