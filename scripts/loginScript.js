//Login script
function login() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/login", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            document.getElementById("error-message").innerHTML = "Login successful";
            window.location.href = "/home";
        } else {
            document.getElementById("error-message").innerHTML = "Login failed";
        }
        }
    };
    xhr.send(JSON.stringify({
        email: email,
        password: password
    }));
    }