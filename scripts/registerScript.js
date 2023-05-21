//Register script
function register() {
    var email = document.getElementById("email").value;
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
        document.getElementById("error-message").innerHTML = "Passwords do not match";
        return;
    }

     var emailvalidate = /\S+@\S+\.\S+/;
    if (!emailvalidate.test(email)) {
        document.getElementById("error-message").innerHTML = "Invalid email address";
        return;
    }

    if (password.length < 8) {
        document.getElementById("error-message").innerHTML = "Password must be atleast 8 characters long";
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/register", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementById("error-message").innerHTML = "Registration successful";
                window.location.href = "/home";
            } else if (xhr.status === 400) {
                document.getElementById("error-message").innerHTML = "Email already in use";
            } else {
                document.getElementById("error-message").innerHTML = "Registration failed";
            }
        }
    };
    xhr.send(JSON.stringify({
        email: email,
        username: username,
        password: password
    }));
    }