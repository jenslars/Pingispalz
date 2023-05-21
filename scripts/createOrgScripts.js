//Scripts for createOrg

//function for creating clubs/ orgs 
function createOrg() {
    var tableName = document.getElementById("tableName").value;
    var tableDescription = document.getElementById("tableDescription").value;
    //const isPublic = document.querySelector('input[name="openOrInvite"]:checked').value;
    tableName = tableName.replace(/\s+/g, '_');
    console.log("We are in the createOrg function script")
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/createOrg", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementById("error-message").innerHTML = "Organization created successfully";
                window.location.href = "/home";
            } else {
                document.getElementById("error-message").innerHTML = "Looks like you missed something, try again.";
            }
        } else {
            document.getElementById("error-message").innerHTML = "Something went wrong while creating the organization";
        }
    };
    xhr.send(JSON.stringify({
        tableName: tableName,
        tableDescription: tableDescription,
        // isPublic: isPublic
    }));
}