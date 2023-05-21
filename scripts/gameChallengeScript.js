//Scripts for gameChallenge

//Fetches profile-image and username
fetch('/getLoggedInUserInfo')
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('profile-image').src = data.profile_image;
                        document.getElementById('username').textContent = data.username;
                    })
    .catch(error => console.error(error));

//Fetches match invites
fetch('/matchFromChallenger')
    .then(response => response.json())
    .then(data => {
        let matchList = data.matchList;
        let tableHtml = '<table>';

        tableHtml += '<tr>';
        tableHtml += '<th>Challenger Username</th>';
        tableHtml += '<th>Recipient Username</th>';
        tableHtml += '<th>Server Name</th>';
        tableHtml += '<th></th>';
        tableHtml += '<th></th>';
        tableHtml += '</tr>';

        matchList.forEach(match => {
            tableHtml += '<tr>';
            tableHtml += '<td>' + match[0] + '</td>';
            tableHtml += '<td>' + match[1] + '</td>';
            tableHtml += '<td>' + match[2] + '</td>';
            tableHtml += '<td><button onclick="acceptedChallenge(' + match[3] +')"> ACCEPT </button></td>';
            tableHtml += '<td><button onclick="declineChallenge(' + match[3] + ')"> CANCEL </button></td>';
            tableHtml += '</tr>';
});

tableHtml += '</table>';

document.getElementById('MatchInvites').innerHTML = tableHtml;
    })
    .catch(error => console.error(error));
    function acceptedChallenge(match_id) {
        const xhr = new XMLHttpRequest();
    xhr.open('POST', '/acceptedChallenge');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
    matchId: match_id
}))};

//Function to decline match
function declineChallenge(match_id){
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/declineMatch');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
    matchId: match_id
}))};