//Scripts for editProfile

//Function to toggle description form
function toggleEditDescription() {
    var fetchedUserDescriptionToggle = document.getElementById('fetchedUserDescription');
    var editButtonToggle = document.getElementById('editButton');
    var editUserDescriptionFormToggle = document.getElementById('editUserDescriptionForm');
    var formbuttonsToggle = document.getElementById('formbuttons');
    editUserDescriptionFormToggle.classList.add('active');
    formbuttonsToggle.classList.add('active');
    editButtonToggle.classList.remove('active');
    fetchedUserDescriptionToggle.classList.remove('active');
}

//Function to detoggle description form
function exitDescriptionForm(){
    var fetchedUserDescriptionToggle = document.getElementById('fetchedUserDescription');
    var editButtonToggle = document.getElementById('editButton');
    var editUserDescriptionFormToggle = document.getElementById('editUserDescriptionForm');
    var formbuttonsToggle = document.getElementById('formbuttons');
    editUserDescriptionFormToggle.classList.remove('active');
    formbuttonsToggle.classList.remove('active');
    editButtonToggle.classList.add('active');
    fetchedUserDescriptionToggle.classList.add('active');
}

//Sends description form to backend
document.getElementById('editUserDescriptionForm').addEventListener('submit', function(event) {
event.preventDefault();
const user_description = document.getElementById('descriptionFormInput').value;

const xhr = new XMLHttpRequest();
xhr.open('POST', '/uploadUserDescriptionForm');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {
    if (xhr.status === 200) {
    document.getElementById('Userbiostatus').innerHTML = 'success';
    window.location.reload();
    } else {
    document.getElementById('Userbiostatus').innerHTML = 'Error';
    }
};

xhr.onerror = function() {
    document.getElementById('Userbiostatus').innerHTML = 'Unable to update user bio';
};

xhr.send(JSON.stringify({ user_description }));
});

//Sends discorddetails form to backend
document.getElementById('discordform').addEventListener('submit', function(event) {
event.preventDefault();
const contact_info = document.getElementById('discordforminput').value;
    
const xhr = new XMLHttpRequest();
xhr.open('POST', '/uploaddiscordform');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {
    if (xhr.status === 200) {
        document.getElementById('discordFormError').innerHTML = 'success';
        location.reload(true);
    } else {
        document.getElementById('discordFormError').innerHTML = 'Error';
    }
    };

xhr.onerror = function() {
    document.getElementById('discordFormError').innerHTML = 'Unable to update Discord info';
};

xhr.send(JSON.stringify({ contact_info }));
});

//Function to detoggle discordform
function exitDiscordForm() {
    var discordformToggle = document.getElementById('discordform');
    var editdiscordToggle = document.getElementById('editdiscord');
    var discordnameToggle = document.getElementById('discordname');
    discordformToggle.classList.remove('active');
    editdiscordToggle.classList.add('active');
    discordnameToggle.classList.add('active');
}

//Function to toggle discordform
function toggleEditDiscord() {
    var discordformToggle = document.getElementById('discordform');
    var editdiscordToggle = document.getElementById('editdiscord');
    var discordnameToggle = document.getElementById('discordname');
    discordformToggle.classList.add('active');
    editdiscordToggle.classList.remove('active');
    discordnameToggle.classList.remove('active');
}

//Function to send profile picture to backend
function addProfilePicture() {
    const formData = new FormData();
    const fileInput = document.getElementById("file-upload");
    formData.append("image", fileInput.files[0]);

    fetch("/uploadprofilepicture", {
        method: "POST",
        body: formData,
    })
    .then(response => {
    console.log(response);
    if (response.status === 200) {
        console.log("Upload successful");
        window.location.reload();
    } else {
        console.log("Upload failed");
    }
    })

.catch(error => {
    console.log(error);
});
}

    
// Fetch user profile data from the server
fetch('/getLoggedInUserInfo')
    .then(response => response.json())
    .then(data => {
        document.getElementById('profile-image').src = data.profile_image;
        document.getElementById('username').textContent = data.username;
        document.getElementById('discordname').textContent = data.contact_info;
        document.getElementById('fetchedUserDescription').textContent = data.user_bio;
        document.getElementById('descriptionFormInput').textContent = data.user_bio;
    });

//Fetches match history
fetch('/matchHistory')
    .then((response) => response.json())
    .then((matches) => {
        const matchContainer = document.getElementById('matchContainer');

        matches.forEach((match) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';

        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';

        const playerImage = document.createElement('img');
        playerImage.src = match.playerProfileImage || 'stockuserimage.png';
        playerImage.className = 'playeruserimage';

        const playerName = document.createElement('p');
        playerName.className = 'playername';
        playerName.textContent = match.playerUsername;

        playerDiv.appendChild(playerImage);
        playerDiv.appendChild(playerName);

        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'results';

        const winText = document.createElement('p');
            winText.className = 'win';
            if (match.playerPoints < match.opponentPoints) {
            winText.textContent = 'WIN';
            } else {
            winText.textContent = 'LOST';
            winText.classList.add('lost');
            }

        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'score';

        const playerScore = document.createElement('p');
        playerScore.className = 'playersscore';
        playerScore.textContent = match.playerPoints;

        const divider = document.createElement('p');
        divider.className = 'divider';
        divider.textContent = '-';

        const opponentScore = document.createElement('p');
        opponentScore.className = 'opponentscore';
        opponentScore.textContent = match.opponentPoints;

        scoreDiv.appendChild(playerScore);
        scoreDiv.appendChild(divider);
        scoreDiv.appendChild(opponentScore);

        resultsDiv.appendChild(winText);
        resultsDiv.appendChild(scoreDiv);

        const opponentLink = document.createElement('a');
        opponentLink.href = '/viewProfile/' + match.opponentUserId;
        opponentLink.className = 'opponentuserlink';
        const opponentDiv = document.createElement('div');
        opponentDiv.className = 'opponent';

        const opponentImage = document.createElement('img');
        opponentImage.src = match.opponentProfileImage || 'stockuserimage.png';
        opponentImage.className = 'opponentuserimage';

        const opponentName = document.createElement('p');
        opponentName.className = 'opponentname';
        opponentName.textContent = match.opponentUsername;

        opponentDiv.appendChild(opponentImage);
        opponentDiv.appendChild(opponentName);

        opponentLink.appendChild(opponentDiv);

        matchDiv.appendChild(playerDiv);
        matchDiv.appendChild(resultsDiv);
        matchDiv.appendChild(opponentLink);

        matchContainer.appendChild(matchDiv);
        });
    })
    .catch((error) => {
        console.error(error);
    });

//Popup for uploading profile picture
function addProfilePicturePopup() {
    var addProfilePicturePopupDiv = document.getElementById('addProfilePicturePopup')
    var gridcontainerLink = document.getElementById('blur');
    addProfilePicturePopupDiv.classList.add('active');
    gridcontainerLink.classList.add('active');
    }

//Exits popup for profile picture
function exitAddProfilePicturePopup() {
    var addProfilePicturePopupDiv = document.getElementById('addProfilePicturePopup');
    var gridcontainerLink = document.getElementById('blur');
    addProfilePicturePopupDiv.classList.remove('active');
    gridcontainerLink.classList.remove('active');
    }