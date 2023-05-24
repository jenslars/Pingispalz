document.addEventListener('DOMContentLoaded', function() {
    testLoadLeaderboard()
    });

let playerData;
//Takes the fetched data from the database and displays it in a leaderboard
function testLoadLeaderboard() {
    fetch('/leaderboard/score')
      .then(response => response.json())
      .then(data => {
        const LoggedInUser = data.loggedInUserId;
        const tableName = data.tableName;
        document.getElementById('leaderboardName').innerHTML = tableName;
        playerData = data.leaderboardData;
        assignPlacements(playerData);
        const ladder = document.getElementById('leaderboard');
        ladder.innerHTML = '';
  
        playerData.forEach(player => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${player.placement}</td>
            <td><a href="/viewProfile/${player.user_id}">${player.username}</a></td>
            <td>${player.wins}</td>
            <td>${player.winratio}</td>
            <td>${player.elo}</td>
            <td>${player.status}</td>
            <td><button id="challengebutton" onclick="openPopup('${player.username}','${player.user_id}')">Challenge</button></td>
            <td><button id="cancelchallengebutton" onclick="cancelChallenge('${player.user_id}')">Unchallenge</button></td>
            <td><button id="loggedinuserbutton">You</button></td>
          `;
          if (player.losses || player.wins) {
            let winLossRatio;
            if (player.losses) {
              winLossRatio = ((player.wins / (player.wins + player.losses)) * 100).toFixed(0) + "%";
            } else {
              winLossRatio = "100%";
            }
            row.children[3].textContent = winLossRatio;
          } else {
            row.children[3].textContent = "n/a";
          }
  
          // Check if the player has a pending match
          const hasPendingMatch = data.pendingMatches.some(match =>
            match.recipient_id === player.user_id && match.status === "PENDING"
          );
  
          if (hasPendingMatch) {
            row.children[7].children[0].classList.add("active");
            row.children[6].children[0].classList.remove("active");
          } else {
            row.children[7].children[0].classList.remove("active");
            row.children[6].children[0].classList.add("active");
          }

           if (LoggedInUser === player.user_id){
            console.log(LoggedInUser, player.user_id);
            row.children[8].children[0].classList.add("theUser");
            row.children[7].children[0].classList.remove("active");
            row.children[6].children[0].classList.remove("active");
          }

          ladder.appendChild(row);
        });
  
        topPlayers(playerData);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
//Displayes the top 3 players in the leaderboard
function topPlayers(playerData) {
    const top1 = playerData.find(player => player.placement === "1");
    const top2 = playerData.find(player => player.placement === "2");
    const top3 = playerData.find(player => player.placement === "3");

    const top1Div = `
        <img class="crown" src="/Crown.png">
        <img class="playerProfilePhoto" src="/${top1.profile_image}">
        <p>${top1.username}</p>
        <p>#${top1.placement}</p>
    `;

    const top2Div = `
        <img class="playerProfilePhoto" src="/${top2.profile_image}">
        <p>${top2.username}</p>
        <p>#${top2.placement}</p>
    `;

    const top3Div = `
        <img class="playerProfilePhoto" src="/${top3.profile_image}">
        <p>${top3.username}</p>
        <p>#${top3.placement}</p>
    `;

    document.getElementById("top1").innerHTML = top1Div;
    document.getElementById("top2").innerHTML = top2Div;
    document.getElementById("top3").innerHTML = top3Div;
}

function assignPlacements(playerData) {
    for (let i = 0; i < playerData.length; i++) {
        if (i === 0) {
            playerData[i].placement = "1";
        } else if (i === 1) {
            playerData[i].placement = "2";
        } else if (i === 2) {
            playerData[i].placement = "3";
        } else {
            playerData[i].placement = (i + 1).toString();
        }
    }
}

// sorts players in the leaderboard by wins
const winsHeader = document.getElementById('wins');
function sortPlayersByWins(playerData) {
    playerData.sort((a, b) => b.wins - a.wins);
    updateLeaderboard(playerData);
}

winsHeader.addEventListener("click", function() {
    sortPlayersByWins(playerData);
})

//sorts players in the leaderboard by placement
const placement = document.getElementById('placement');
function sortPlayersByPlacement(playerData) {
    playerData.sort((a, b) => a.placement - b.placement);
    updateLeaderboard(playerData);
}

placement.addEventListener("click", function() {
    sortPlayersByPlacement(playerData);    
})

//sorts players in the leaderboard by winrate funkar inte
const winRateHeader = document.getElementById('winRatio')
function sortPlayersByWinrate(playerData) {
    playerData.sort((a, b) => b.winratio - a.winratio);
    updateLeaderboard(playerData);
}

winRateHeader.addEventListener("click", function() {
    sortPlayersByWinrate(playerData);
})

//Updates leaderboard with new placements
function updateLeaderboard(playerData, data) {
  const ladder = document.getElementById('leaderboard');
  ladder.innerHTML = '';
  playerData.forEach(player => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${player.placement}</td>
      <td><a href="/viewProfile/${player.user_id}">${player.username}</a></td>
      <td>${player.wins}</td>
      <td>${player.winratio}</td>
      <td>${player.elo}</td>
      <td>${player.status}</td>
      <td><button id="challengebutton" onclick="openPopup('${player.username}','${player.user_id}')">Challenge</button></td>
      <td><button id="cancelchallengebutton" onclick="cancelChallenge('${player.user_id}')">Unchallenge</button></td>
      <td><button id="loggedinuserbutton">You</button></td>
    `;

    if (player.losses || player.wins) {
      let winLossRatio;
      if (player.losses) {
        winLossRatio = ((player.wins / (player.wins + player.losses)) * 100).toFixed(0) + "%";
      } else {
        winLossRatio = "100%";
      }
      row.children[3].textContent = winLossRatio;
    } else {
      row.children[3].textContent = "n/a";
    }
    // const hasPendingMatch = data.pendingMatches.some(match =>
    //   match.recipient_id === player.user_id && match.status === "PENDING"
    // );

    // if (hasPendingMatch) {
    //   row.children[7].children[0].classList.add("active");
    //   row.children[6].children[0].classList.remove("active");
    // } else {
    //   row.children[7].children[0].classList.remove("active");
    //   row.children[6].children[0].classList.add("active");
    // }
    ladder.appendChild(row);
  });
  topPlayers(playerData);
  console.log(playerData);
}

let popup = document.getElementById("challengePopup");
let challengedPlayerId; 

function openPopup(player, playerId){
    fetch('/challenge/player')
        .then(response => response.json())
        .then(data => {
            // Update the HTML elements with the fetched data
            document.getElementById('playerName1').textContent = data.queryUser;
        })
        .catch(error => console.error(error));

    challengePopup.classList.add("show-challengePopup");
    challengedPlayer = player;
    challengedPlayerId = playerId;
    document.getElementById("playerName2").innerHTML = player;
    

}

function closePopup(){
    challengePopup.classList.remove("show-challengePopup");
}

function sendChallenge(){
    console.log(challengedPlayerId);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/sendChallengeFromLeaderboard", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                window.location.reload();
            } else {
            }
        } else {
            // document.getElementById("error-message").innerHTML = "Something went wrong";
        }
    };
    xhr.send(JSON.stringify({
        recipientId : challengedPlayerId
    }));
}

function cancelChallenge(playerId) {
    console.log(playerId)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/cancelChallengeFromLeaderboard", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                testLoadLeaderboard()
            } else {
            }
        } else {
            // document.getElementById("error-message").innerHTML = "Something went wrong";
        }
    };
    xhr.send(JSON.stringify({
        recipientId : playerId
    }));
}

