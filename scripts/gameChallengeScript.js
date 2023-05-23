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
                    let inviteSent;
                    let matchList = data.matchList;
                    let tableHtml = '<table>';
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
                        tableHtml += '<td><img src="'+ match[4] +'" id="opponentImage"> </td>';
                        tableHtml += '<td>' + match[0] + '</td>';
                        tableHtml += '<td>' + match[2] + '</td>';
                        tableHtml += '<td><button id="acceptButton" onclick="acceptedChallenge(' + match[3] + ')"> ACCEPT </button></td>';
                        tableHtml += '<td><button id="declineButton" onclick="declineChallenge(' + match[3] + ')"> CANCEL </button></td>';
                        tableHtml += '</tr>';
        });
        
        tableHtml += '</table>'; 
    }
        // Set the generated HTML as the content of the 'MatchInvites' element
        document.getElementById('MatchInvites').innerHTML = tableHtml; 
                })
                .catch(error => console.error(error));
            function acceptedChallenge(match_id){
            const xhr = new XMLHttpRequest();
            xhr.open('POST','/acceptedChallenge');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
            matchId: match_id
            }))};
            function declineChallenge(match_id){
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/declineMatch');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify({
                matchId: match_id
            }))};