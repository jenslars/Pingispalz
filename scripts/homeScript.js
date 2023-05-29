fetch('/getLoggedInUserInfo')
.then(response => response.json())
.then(data => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    if (currentHour >= 5 && currentHour < 12) {
        document.getElementById('welcomeText').innerHTML = `Good morning, ${data.username}!`;
    } else if (currentHour >= 12 && currentHour < 18) {
        document.getElementById('welcomeText').innerHTML = `Good afternoon, ${data.username}!`;
    } else {
        document.getElementById('welcomeText').innerHTML = `Good evening, ${data.username}!`;
    }
});

fetch('/matchFromChallenger')
.then(response => response.json())
.then(data => {
    let matchList = data.matchList;
    let tableHtml = '<table id="invitesTable">';
    if (matchList.length === 0) {
        tableHtml = '<h3 id="noInvites"> ...No invites yet </h3>'
    } else {
    
        // Create table headers
        tableHtml += '<tr>';
        tableHtml += '<th></th>';
        tableHtml += '<th>Opponent</th>';
        tableHtml += '<th>Leaderboard</th>';
        tableHtml += '<th></th>';
        tableHtml += '<th></th>';
        tableHtml += '</tr>';

        // Iterate over matchList and create table rows
        matchList.forEach(match => {
            tableHtml += '<tr>';
            if (match[4] == null) {
            tableHtml += '<td><img src="stockuserimage.png" id="opponentImage"> </td>';
            }
            else { tableHtml += '<td><img src="'  + match[4] + '" id="opponentImage"></td>'; };
            tableHtml += '<td>' + match[0] + '</td>';
            tableHtml += '<td>' + match[2] + '</td>';
            tableHtml += '<td><button id="acceptButton" onclick="acceptedChallenge(' + match[3] + ')"> ACCEPT </button></td>';
            tableHtml += '<td><button id="declineButton" onclick="declineChallenge(' + match[3] + ')"> CANCEL </button></td>';
            tableHtml += '</tr>';
            });

        tableHtml += '</table>'; 
    }
    document.getElementById('MatchInvites').innerHTML = tableHtml; 
})
.catch(error => console.error(error));

function acceptedChallenge(match_id){
    // This sends data to the server that the users wants to accept the match
    const xhr = new XMLHttpRequest();
    xhr.open('POST','/acceptedChallenge');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
    matchId: match_id}))
    fetchMatchesInvites()
};

function declineChallenge(match_id){
    // This sends data to the server that the users wants to decline the match
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/declineMatch');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
    matchId: match_id}))
    fetchMatchesInvites()
};

function fetchMatches() {
    fetch('/fetchMatches')
    .then((response) => response.json())
    .then((data) => {
    const loggedInUserId = data.loggedInUserId; // Get the loggedInUserId from the response
    const matches = data.matchData; // Get the matchData from the response
        console.log("Lucas")
    const matchContainer = document.getElementById('fetchedmatches');
    if (matches.length === 0) {
        matchContainer.textContent("<p> No matches yet </p>");  
    }
    else {
    matches.forEach((match) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';

        const playerDiv = document.createElement('div');
        playerDiv.className = 'matchloggedinuser';

        const playerImage = document.createElement('img');
        playerImage.src = match.playerProfileImage || 'stockuserimage.png';
        playerImage.className = 'matchloggedinuserimg';

        const playerName = document.createElement('p');
        playerName.className = 'matchloggedinusername';
        playerName.textContent = match.playerUsername;

        playerDiv.appendChild(playerImage);
        playerDiv.appendChild(playerName);

        const statusDiv = document.createElement('div');
        statusDiv.className = 'matchstatus';
        if (match.status === 'PENDING') {
        const matchleaderboard = document.createElement('p');
        matchleaderboard.className = 'matchleaderboard';
        matchleaderboard.textContent = match.leaderboard_name;

        const matchcurrentstatus = document.createElement('p');
        matchcurrentstatus.className = 'matchleaderboard';
        matchcurrentstatus.textContent = 'Pending';

        statusDiv.appendChild(matchleaderboard);
        statusDiv.appendChild(matchcurrentstatus);
        } else if (match.status === 'FINISHED') {
        const winText = document.createElement('p');
        winText.className = 'won';

        if (match.winner === loggedInUserId) {
            winText.textContent = 'WIN';
        } else {
            winText.textContent = 'LOST';
            winText.classList.add('lost');
        }

        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'matchresults';

        const playerScore = document.createElement('p');
        playerScore.className = 'loggedinuserresult';
        playerScore.textContent = match.playerPoints;

        const divider = document.createElement('p');
        divider.className = 'divider';
        divider.textContent = '-';

        const opponentScore = document.createElement('p');
        opponentScore.className = 'opponentresult';
        opponentScore.textContent = match.opponentPoints;

        scoreDiv.appendChild(playerScore);
        scoreDiv.appendChild(divider);
        scoreDiv.appendChild(opponentScore);

        statusDiv.appendChild(winText);
        statusDiv.appendChild(scoreDiv);
        } else if (match.status === 'TOBECONFIRMED' && match.to_confirm != loggedInUserId) {
        const matchleaderboard = document.createElement('p');
        matchleaderboard.className = 'matchleaderboard';
        matchleaderboard.textContent = match.leaderboard_name;

        const winText = document.createElement('p');
        winText.className = 'won';

        if (match.winner === loggedInUserId) {
            winText.textContent = 'WIN';
        } else {
            winText.textContent = 'LOST';
            winText.classList.add('lost');
        }

        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'matchresults';

        const playerScore = document.createElement('p');
        playerScore.className = 'loggedinuserresult';
        playerScore.textContent = match.playerPoints;

        const divider = document.createElement('p');
        divider.className = 'divider';
        divider.textContent = '-';

        const opponentScore = document.createElement('p');
        opponentScore.className = 'opponentresult';
        opponentScore.textContent = match.opponentPoints;

        scoreDiv.appendChild(playerScore);
        scoreDiv.appendChild(divider);
        scoreDiv.appendChild(opponentScore);

        statusDiv.appendChild(winText);
        statusDiv.appendChild(scoreDiv);

        } else if (match.status === 'TOBECONFIRMED') {
        const matchleaderboard = document.createElement('p');
        matchleaderboard.className = 'matchleaderboard';
        matchleaderboard.textContent = match.leaderboard_name;

        const winText = document.createElement('p');
        winText.className = 'won';
        if (match.winner === loggedInUserId) {
            winText.textContent = 'WIN';
        } else {
            winText.textContent = 'LOST';
            winText.classList.add('lost');
        }

        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'matchresults';

        const playerScore = document.createElement('p');
        playerScore.className = 'loggedinuserresult';
        playerScore.textContent = match.playerPoints;

        const divider = document.createElement('p');
        divider.className = 'divider';
        divider.textContent = '-';

        const opponentScore = document.createElement('p');
        opponentScore.className = 'opponentresult';
        opponentScore.textContent = match.opponentPoints;

        scoreDiv.appendChild(playerScore);
        scoreDiv.appendChild(divider);
        scoreDiv.appendChild(opponentScore);

        statusDiv.appendChild(winText);
        statusDiv.appendChild(scoreDiv);
        }

        const opponentLink = document.createElement('a');
        opponentLink.href = '/viewProfile/' + match.opponentUserId;
        opponentLink.className = 'opponentuserlink';

        const opponentDiv = document.createElement('div');
        opponentDiv.className = 'matchopponent';

        const opponentImage = document.createElement('img');
        opponentImage.src = match.opponentProfileImage || 'stockuserimage.png';
        opponentImage.className = 'matchopponentimg';

        const opponentName = document.createElement('p');
        opponentName.className = 'matchopponentname';
        opponentName.textContent = match.opponentUsername;

        opponentDiv.appendChild(opponentImage);
        opponentDiv.appendChild(opponentName);

        opponentLink.appendChild(opponentDiv);

        matchDiv.appendChild(playerDiv);
        matchDiv.appendChild(statusDiv);
        matchDiv.appendChild(opponentLink);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'matchactions';

        if (match.status === 'PENDING') {
        const registerButton = document.createElement('button');
        registerButton.className = 'registerresult';
        registerButton.textContent = 'Register result';
        registerButton.setAttribute("onclick", `registerResultPopup('${match.opponentUserId}', '${match.matchId}')`);
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancelmatch';
        cancelButton.textContent = 'Cancel match';
        cancelButton.setAttribute("onclick", `cancelPendingMatch('${match.matchId}')`);

        actionsDiv.appendChild(registerButton);
        actionsDiv.appendChild(cancelButton);
        } else if (match.status === 'FINISHED') {
        const rematchButton = document.createElement('button');
        rematchButton.className = 'rematch';
        rematchButton.textContent = 'Rematch';

        actionsDiv.appendChild(rematchButton);
        } else if (match.status === 'TOBECONFIRMED' && match.to_confirm != loggedInUserId) {
        const rematchButton = document.createElement('button');
        rematchButton.className = 'toBeConfirmed';
        rematchButton.textContent = 'Waiting for confirmation';

        actionsDiv.appendChild(rematchButton);
        } else if (match.status === 'TOBECONFIRMED') {
        const confirmButton = document.createElement('button');
        confirmButton.className = 'confirmresult';
        confirmButton.textContent = 'Confirm result';
        confirmButton.setAttribute("onclick", `confirmResult('${match.matchId}')`);
        const contestButton = document.createElement('button');
        contestButton.className = 'contestresult';
        contestButton.textContent = 'Contest result';
        contestButton.setAttribute("onclick", `contestResultPopup('${match.opponentUserId}', '${match.matchId}')`);

        actionsDiv.appendChild(confirmButton);
        actionsDiv.appendChild(contestButton);
        }

        matchDiv.appendChild(playerDiv);
        matchDiv.appendChild(statusDiv);
        matchDiv.appendChild(opponentLink);
        matchDiv.appendChild(actionsDiv);

        matchContainer.appendChild(matchDiv);
        
    });
    }})
    .catch((error) => {
    console.error(error);
    });
}
