let players = [{
    placement: "2",
    username: "Lucas",
    wins: 50,
    winRatio: "3.0",
    elo: 1400,
    status: true
},
{
    placement: "3",
    username: "Oliver",
    wins: 100,
    winRatio: "3.0",
    elo: 1300,
    status: true
},
{
    placement: "4",
    username: "Henningsson",
    wins: 60,
    winRatio: "3.0",
    elo: 1200,
    status: true
},
{
    placement: "5",
    username: "Felix",
    wins: 40,
    winRatio: "3.0",
    elo: 1000,
    status: true
},
{
    placement: "1",
    username: "Hamza",
    wins: 27,
    winRatio: "4.0",
    elo: 1500,
    status: true
}];

//function ladder(players) {
    var table = "<tbody>"
    for (let i = 0; i < players.length ; i++) {

            table += "<tr>";
            table += "<td>" + players[i].placement + "</td>";
            table += "<td>" + players[i].username + "</td>";
            table += "<td>" + players[i].wins + "</td>";
            table += "<td>" + players[i].winRatio + "</td>";
            table += "<td>" + players[i].elo + "</td>";
            table += "<td>" + players[i].status + "</td>";
            table += "</tr>"
    }
    table += "</tbody>";
    document.getElementById("ladder").innerHTML = table;
    // } ladder();

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
        <td>${player.status}</td>
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





function topPlayers(players) {
    let top3 = 3;
    for (let i = 0; i < top3; i++)
        if (players.placement == "1") {
        let div = '<div id="top1">';
        div;
        div += "<h1>" + players.username + "</h1>";
        div += "</div>";
        document.getElementsById("topPlayers").innerHTML = div;
    }
        if (players.placement == "2")
    {
        let div = '<div id="top2">';
        div;
        div += "<h2>" + players.username + "</h2>";
        div += "</div>";
        document.getElementsById("topPlayers").innerHTML = div;
    }
        if (players.placement == "3")
    {
        let div = '<div id="top3">';
        div;
        div += "<h2>" + players.username + "</h2>";
        div += "</div>";
        document.getElementsById("topPlayers").innerHTML = div;
    }
}


//topPlayers(players);

