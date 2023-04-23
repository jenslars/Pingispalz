function getValues() {
    var tableName = document.getElementById("name").value;
    const isPublic = document.querySelector('input[name="openOrInvite"]:checked').value;
    tableName = tableName.replace(/\s+/g, '_');

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/createOrg", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            document.getElementById("error-message").innerHTML = "Organization created successfully";
        } else {
            document.getElementById("error-message").innerHTML = "Looks like you missed something, try again.";
        }
        }
    };
    xhr.send(JSON.stringify({
        tableName: tableName,
        isPublic: isPublic
    }));
}