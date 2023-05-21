//Script for viewProfile

//Loads DOM functions
document.addEventListener('DOMContentLoaded', function() {
    fetchProfileData();
    checkIfUserSentChallenge ();
    });

// Function to fetch profile data and update HTML elements
function fetchProfileData() {
    fetch('/getViewProfile')
        .then(response => response.json())
        .then(data => {
            document.getElementById('profile-image').src = `/${data.profile_image}`;
            document.getElementById('username').textContent = data.username;
            document.getElementById('discordname').textContent = data.contact_info;
            document.getElementById('fetchedUserDescription').textContent = data.user_bio;
        })
        .catch(error => console.error(error));
    }

//Checks if user sent challenge
function checkIfUserSentChallenge() {
    var challengebutton = document.getElementById('challengebutton');
    var unchallengebutton = document.getElementById('cancelchallengebutton');
    fetch('/checkIfUserSentChallenge')
        .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Error: ' + response.status);
        }
        })
        .then(data => {
        if (data) {
            unchallengebutton.classList.add('active');
            challengebutton.classList.remove('active');
        } else {
            unchallengebutton.classList.remove('active');
            challengebutton.classList.add('active');
        }
        })
        .catch(error => {
        console.error(error);
        });
    }

//Fetches match history
fetch('/matchHistoryViewProfile')
    .then((response) => response.json())
    .then((matches) => {
        const matchContainer = document.getElementById('matchContainer');

        matches.forEach((match) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';

        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';

        const playerImage = document.createElement('img');
        playerImage.src = `/${match.playerProfileImage || 'stockuserimage.png'}`;
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
        opponentLink.className = 'opponentuserlink';
        opponentLink.href = '/viewProfile/' + match.opponentUserId;
        const opponentDiv = document.createElement('div');
        opponentDiv.className = 'opponent';

        const opponentImage = document.createElement('img');
        opponentImage.src = `/${match.opponentProfileImage || 'stockuserimage.png'}`;
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

//Function to send challenge
function sendChallenge() {
    var challengebutton = document.getElementById('challengebutton');
    var unchallengebutton = document.getElementById('cancelchallengebutton');
    challengebutton.classList.remove('active');
    unchallengebutton.classList.add('active');
    
    fetch('/sendChallenge')
        .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Error: ' + response.status);
        }
        })
        .then(data => {
        console.log(data); // Success message from the server
        })
        .catch(error => {
        console.error(error);
        });
    }

//Function to cancel challenge
function cancelChallenge() {
    var challengebutton = document.getElementById('challengebutton');
    var unchallengebutton = document.getElementById('cancelchallengebutton');
    challengebutton.classList.add('active');
    unchallengebutton.classList.remove('active');

    fetch('/cancelChallenge')
        .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Error: ' + response.status);
        }
        })
        .then(data => {
        console.log(data); // Success message from the server
        })
        .catch(error => {
        console.error(error);
        });
    }