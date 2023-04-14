let players = [{
    placement: "1",
    username: "player 1",
    wins: "50",
    winRatio: "3.0",
    elo: "1200",
    status: true
},
{
    placement: "2",
    username: "player 2",
    wins: "50",
    winRatio: "3.0",
    elo: "1200",
    status: true
},
{
    placement: "3",
    username: "player 3",
    wins: "50",
    winRatio: "3.0",
    elo: "1200",
    status: true
},
{
    placement: "4",
    username: "player 4",
    wins: "50",
    winRatio: "3.0",
    elo: "1200",
    status: true
}];
    
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
