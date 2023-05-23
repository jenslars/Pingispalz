//Scripts for createOrg

//to display chosen filename
let fileInput = document.getElementById("image");
let fileName = document.getElementById("fileName");
fileInput.addEventListener('change', function(event) {
    let uploadedFileName = event.target.files[0].name;
    fileName.textContent = uploadedFileName;
    fileName.style.color = "#FF3366";
});

//file input required alert
document.getElementById("submitButton").addEventListener("click", function() {
    if (!fileInput.value) {
      fileName.textContent = "Please select a file";
      fileName.style.color = "#FF3366";
    }
});
  

//function for creating clubs/ orgs 
function createOrg() {
    var tableName = document.getElementById("tableName").value;
    var tableDescription = document.getElementById("tableDescription").value;
    tableName = tableName.replace(/\s+/g, '_');
    console.log("We are in the createOrg function script");
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
        tableDescription: tableDescription
    }));
}