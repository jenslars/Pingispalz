fetch('/leaderboard/score')
  .then(response => response.json())
  .then(players => {
    const ladder = document.getElementById('ladder');
    ladder.innerHTML = '';

    players.forEach(player => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${player.placement}</td>
        <td>${player.username}</td>
        <td>${player.wins}</td>
        <td>${player.winRatio}</td>
        <td>${player.elo}</td>
        <td><button>Play</button></td>
      `;
      ladder.appendChild(row);
    });
  });


// function displayLeaderboard() {
//   var table = "<tbody>";
//   for (let i = 0; )
// }

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

