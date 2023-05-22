let playerData;
//Laddar in användare från databas in i leaderboarden
function testLoadLeaderboard() {
    fetch('/leaderboard/score')
    .then(response => response.json())
    .then(data => {

        const tableName = data.tableName;
        document.getElementById('leaderboardName').innerHTML = tableName;

        playerData = data.leaderboardData;
        assignPlacements(playerData);
        console.log("vi är här")
        const ladder = document.getElementById('leaderboard');
        ladder.innerHTML = '';
        console.log(playerData)
        playerData.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.placement}</td>
                <td><a href="/viewProfile/${player.user_id}">${player.username}</a></td>
                <td>${player.wins}</td>
                <td>${player.winratio}</td>
                <td>${player.elo}</td>
                <td>${player.status}</td>
                <td><button class="challengebutton" onclick="openPopup('${player.username}','${player.user_id}')">Challenge</button></td>
            `;
            if (player.losses || player.wins) {
                let winLossRatio;
                if (player.losses) {
                    winLossRatio = ((player.wins / (player.wins + player.losses)) * 100).toFixed(0) + "%";
                } else {
                    winLossRatio = "100%";
                }
                row.children[3].textContent = winLossRatio;
            }
            else {
                row.children[3].textContent = "n/a";
            }
            ladder.appendChild(row);
        });
        topPlayers(playerData);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
testLoadLeaderboard()
//Visar upp top 3 spelare i leaderboarden
function topPlayers(playerData) {
    const top1 = playerData.find(player => player.placement === "1");
    const top2 = playerData.find(player => player.placement === "2");
    const top3 = playerData.find(player => player.placement === "3");

    const top1Div = `
        <img class="crown" src="/Crown.png">
        <img class="playerProfilePhoto" src="/mightyloaf.png">
        <p>${top1.username}</p>
        <p>#${top1.placement}</p>
    `;

    const top2Div = `
        <img class="playerProfilePhoto" src="/akwardcat.jpg">
        <p>${top2.username}</p>
        <p>#${top2.placement}</p>
    `;

    const top3Div = `
        <img class="playerProfilePhoto" src="/akwardcat.jpg">
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
function sortPlayersByWins(players) {
    players.sort((a, b) => b.wins - a.wins);
    updateLeaderboard(players);
}

winsHeader.addEventListener("click", function() {
    sortPlayersByWins(players);
})

//sorts players in the leaderboard by placement
const placement = document.getElementById('placement');
function sortPlayersByPlacement(players) {
    players.sort((a, b) => a.placement - b.placement);
    updateLeaderboard(players);
}

placement.addEventListener("click", function() {
    sortPlayersByPlacement(players);    
})

//sorts players in the leaderboard by winrate funkar inte
const winRateHeader = document.getElementById('winRatio')
function sortPlayersByWinrate(players) {
    players.sort((a, b) => b.winratio - a.winratio);
    updateLeaderboard(players);
}

winRateHeader.addEventListener("click", function() {
    sortPlayersByWinrate(players);
})

//Updates leaderboard with new placements
function updateLeaderboard(players) {
    const ladder = document.getElementById('leaderboard');
    ladder.innerHTML = '';
    players.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${player.placement}</td>
        <td><a href="/player/${player.user_id}">${player.username}</a></td>
        <td>${player.wins}</td>
        <td>${player.winratio}</td>
        <td>${player.elo}</td>
        <td>${player.status}</td>
        <td><button>Play</button></td>
        `;
        if (player.losses || player.wins) {
            let winLossRatio;
            if (player.losses) {
                winLossRatio = ((player.wins / (player.wins + player.losses)) * 100).toFixed(0) + "%";
            } else {
                winLossRatio = "100%";
            }
            row.children[3].textContent = winLossRatio;

        }
        else {
            row.children[3].textContent = "n/a";
        }
        ladder.appendChild(row);
    });
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
                // document.getElementById("error-message").innerHTML = "Good";
                // window.location.href = "/home";
            } else {
                // document.getElementById("error-message").innerHTML = "Bad";
            }
        } else {
            // document.getElementById("error-message").innerHTML = "Something went wrong";
        }
    };
    xhr.send(JSON.stringify({
        recipientId : challengedPlayerId
    }));
}
/*Popup for adding leaderboards*/
function leaderboardpopup() {
    var leaderboardpopupDiv = document.getElementById('leaderboardpopup');
    var gridcontainerLink = document.getElementById('blur');
    leaderboardpopupDiv.classList.add('active');
    gridcontainerLink.classList.add('active');
    }

    function exitpopup() {
    var leaderboardpopupDiv = document.getElementById('leaderboardpopup');
    var gridcontainerLink = document.getElementById('blur');
    leaderboardpopupDiv.classList.remove('active');
    gridcontainerLink.classList.remove('active');   
    }


    /* desktop navbar function */
    var homeLink = document.getElementById('home');
    var searchLink = document.getElementById('search');
    var leaderboardsLink = document.getElementById('leaderboards');
    var challengesLink = document.getElementById('challenges');
    var profileLink = document.getElementById('profile');
    var searchfieldLink = document.getElementById('searchfield');
    var leaderboardoptionsLink = document.getElementById('leaderboardoptions');

    homeLink.addEventListener('click', function() {
    homeLink.classList.add('active');

    searchLink.classList.remove('active');
    searchfieldLink.classList.remove('active');
    leaderboardsLink.classList.remove('active');
    leaderboardoptionsLink.classList.remove('active');
    challengesLink.classList.remove('active');
    profileLink.classList.remove('active');
    });

    searchLink.addEventListener('click', function() {
    searchLink.classList.add('active');
    searchfieldLink.classList.add('active');
    
    homeLink.classList.remove('active');
    leaderboardsLink.classList.remove('active');
    leaderboardoptionsLink.classList.remove('active');
    challengesLink.classList.remove('active');
    profileLink.classList.remove('active');
    });

    leaderboardsLink.addEventListener('click', function() {
    leaderboardsLink.classList.add('active');
    leaderboardoptionsLink.classList.add('active');

    homeLink.classList.remove('active');
    searchLink.classList.remove('active');
    searchfieldLink.classList.remove('active');
    challengesLink.classList.remove('active');
    profileLink.classList.remove('active');
    });

    challengesLink.addEventListener('click', function() {
    challengesLink.classList.add('active');
    
    homeLink.classList.remove('active');
    searchLink.classList.remove('active');
    searchfieldLink.classList.remove('active');
    leaderboardsLink.classList.remove('active');
    leaderboardoptionsLink.classList.remove('active');
    profileLink.classList.remove('active');
    });

    profileLink.addEventListener('click', function() {
    profileLink.classList.add('active');
    homeLink.classList.remove('active');
    searchLink.classList.remove('active');
    searchfieldLink.classList.remove('active');
    leaderboardsLink.classList.remove('active');
    leaderboardoptionsLink.classList.remove('active');
    challengesLink.classList.remove('active');
    });