// let players = [{
// placement: "1",
// username: "Lucas",
// wins: 50,
// winRatio: "3.0",
// elo: 1400,
// status: true
// },
// {
// placement: "2",
// username: "Jens",
// wins: 50,
// winRatio: "3.0",
// elo: 1400,
// status: true
// },
// {
// placement: "3",
// username: "Oliver",
// wins: 100,
// winRatio: "3.0",
// elo: 1300,
// status: false
// },
// {
// placement: "4",
// username: "Henningsson",
// wins: 60,
// winRatio: "3.0",
// elo: 1200,
// status: true
// },
// {
// placement: "5",
// username: "Felix",
// wins: 40,
// winRatio: "3.0",
// elo: 1200,
// status: false
// },
// {
// placement: "6",
// username: "Hamza",
// wins: 27,
// winRatio: "4.0",
// elo: 1500,
// status: true
// },
// {
// placement: "7",
// username: "Hampus",
// wins: 60,
// winRatio: "3.0",
// elo: 1200,
// status: false
// },
// {
// placement: "8",
// username: "David",
// wins: 60,
// winRatio: "3.0",
// elo: 1200,
// status: false
// },
// {
// placement: "9",
// username: "Martin",
// wins: 60,
// winRatio: "3.0",
// elo: 1200,
// status: true
// },
// {
// placement: "10",
// username: "Jesper",
// wins: 60,
// winRatio: "3.0",
// elo: 1200,
// status: true
// },
// {
// placement: "11",
// username: "Simone",
// wins: 60,
// winRatio: "3.0",
// elo: 1200,
// status: true
// },
// {
// placement: "12",
// username: "Carlos",
// wins: 60,
// winRatio: "3.0",
// elo: 1200,
// status: true
// },
// ];

// fetch('/leaderboard')
//   .then(response => response.json())
//   .then(players => {
//     const ladder = document.getElementById('ladder');
//     ladder.innerHTML = '';

//     players.forEach(player => {
//       const row = document.createElement('tr');
//       row.innerHTML = `
//         <td>${player.placement}</td>
//         <td>${player.username}</td>
//         <td>${player.wins}</td>
//         <td>${player.winRatio}</td>
//         <td>${player.elo}</td>
//         <td><button>Play</button></td>
//       `;
//       ladder.appendChild(row);
//     });
//   });


async function fetchLeaderboardData() {
    try {
      const response = await fetch('/leaderboard', {
        method: 'GET'
      });
      const players = await response.json();
  
      const leaderboardTable = document.getElementById('leaderboard').getElementsByTagName('tbody')[0];
      leaderboardTable.innerHTML = '';
  
      players.forEach(player => {
        const row = leaderboardTable.insertRow();
        const usernameCell = row.insertCell();
        usernameCell.innerHTML = player.username;
        const eloCell = row.insertCell();
        eloCell.innerHTML = player.elo;
        const winsCell = row.insertCell();
        winsCell.innerHTML = player.wins;
        const lossesCell = row.insertCell();
        lossesCell.innerHTML = player.losses;
      });
    } catch (error) {
      console.error(error);
    }
  }
  
  fetchLeaderboardData();
  

  

function ladder(players) {
    var table = "<tbody>";
    for (let i = 0; i < players.length ; i++) {
    
            table += "<tr>";
            table += "<td>" + players[i].placement + "</td>";
            table += "<td>" + players[i].username + "</td>";
            table += "<td>" + players[i].wins + "</td>";
            table += "<td>" + players[i].winRatio + "</td>";
            table += "<td>" + players[i].elo + "</td>";
            if (players[i].status === true) {
                table += "<td>" + '<span id="readyDot" title="Available">' + "</td>";
            }
            else {
                table += "<td>" + '<span id="notReadyDot" title="Away">' + "</td>";
            }
            table += "<td>" + '<span id="playIcon">' + "Play" + "</span>" + "</td>";
            table += "</tr>"
    }
    table += "</tbody>";
    document.getElementById("ladder").innerHTML = table;
    } 

// function ladder(players) {
// var table = "<tbody>";
// for (let i = 0; i < players.length ; i++) {

//         table += "<tr>";
//         table += "<td>" + players[i].placement + "</td>";
//         table += "<td>" + players[i].username + "</td>";
//         table += "<td>" + players[i].wins + "</td>";
//         table += "<td>" + players[i].winRatio + "</td>";
//         table += "<td>" + players[i].elo + "</td>";
//         if (players[i].status === true) {
//             table += "<td>" + '<span id="readyDot" title="Available">' + "</td>";
//         }
//         else {
//             table += "<td>" + '<span id="notReadyDot" title="Away">' + "</td>";
//         }
//         table += "<td>" + '<span id="playIcon">' + "Play" + "</span>" + "</td>";
//         table += "</tr>"
// }
// table += "</tbody>";
// document.getElementById("ladder").innerHTML = table;
// } 

ladder(players);

//Takes in sorted players and displays the new ranking order
function updateLeaderboard(players) {
let tableBody = document.getElementById("ladder");
tableBody.innerHTML = "";

for (let i = 0; i < players.length; i++) {
    let player = players[i];

    let row = document.createElement("tr");
    row.innerHTML = `
    <td>${player.placement}</td>
    <td>${player.username}</td>
    <td>${player.wins}</td>
    <td>${player.winRatio}</td>
    <td>${player.elo}</td>
    <td>${player.status ? '<span id="readyDot" title="Available"></span>' : '<span id="notReadyDot" title="Away"></span>'}</td>
    <td><span id="playIcon">Play</span></td>
    
`;

    tableBody.appendChild(row);
}
}

const winsHeader = document.getElementById("wins");

// sorts players in the leaderboard by wins
function sortPlayersByWins(players) {
players.sort((a, b) => b.wins - a.wins);
updateLeaderboard(players);
}
winsHeader.addEventListener("click", function() {
sortPlayersByWins(players);
})

const eloHeader = document.getElementById("elo");

// sorts players in the leaderboard by elo
function sortPlayerByElo(players) {
players.sort((a, b) => b.elo - a.elo);
updateLeaderboard(players);
}
eloHeader.addEventListener("click", function() {
sortPlayerByElo(players);
})

const placementHeader = document.getElementById("placement");

// sorts players in the leaderboard by elo
function sortPlayerByplacement(players) {
players.sort((a, b) => a.placement - b.placement);
updateLeaderboard(players);
}
placementHeader.addEventListener("click", function() {
sortPlayerByplacement(players);
})

function topPlayers(players) {
for (let i = 0; i < players.length; i++) {
    if (players[i].placement === "1") {
        const div1 = "<img class=crown src=images/Crown.png>" + "<img class=playerProfilePhoto src=images/mightyloaf.png>" + "<p>" + players[i].username + "</p>" + "<p>" + "#" + players[i].placement + "</p>";
        document.getElementById("top1").innerHTML = div1;
    }
    if (players[i].placement === "2") {
        const div2 = "<img class=playerProfilePhoto src=images/akwardcat.jpg>" + "<p>" + players[i].username + "</p>" + "<p>" + "#" + players[i].placement + "</p>";
        document.getElementById("top2").innerHTML = div2;
    }
    if (players[i].placement === "3") {
        const div3 = "<img class=playerProfilePhoto src=images/akwardcat.jpg>" + "<p>" + players[i].username + "</p>" + "<p>" + "#" + players[i].placement + "</p>";
        document.getElementById("top3").innerHTML = div3;
    }
}
}
topPlayers(players);

var myData = Handsontable.helper.createSpreadsheetData(100, 50),
container = document.getElementById('example'), hot;

hot = new Handsontable(container, {
  data: myData,
  rowHeaders: true,
  colHeaders: true,
  fixedRowsBottom: 2
});

