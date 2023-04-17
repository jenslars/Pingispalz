let players = [{
    placement: "1",
    username: "Lucas",
    wins: "50",
    winRatio: "3.0",
    elo: "1200",
    status: true
},
{
    placement: "2",
    username: "Oliver",
    wins: "50",
    winRatio: "3.0",
    elo: "1200",
    status: true
},
{
    placement: "3",
    username: "Henningsson",
    wins: "50",
    winRatio: "3.0",
    elo: "1200",
    status: true
},
{
    placement: "4",
    username: "Felix",
    wins: "50",
    winRatio: "3.0",
    elo: "1200",
    status: true
}];

function ladder(players) {
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
    } 
    
ladder(players);

function topPlayers(players) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].placement === "1") {
            const div1 = "<p>" + players[i].username + "</p>";
            document.getElementById("top1").innerHTML = div1;
        }
        if (players[i].placement === "2") {
            const div2 = "<p>" + players[i].username + "</p>";
            document.getElementById("top2").innerHTML = div2;
        }
        if (players[i].placement === "3") {
            const div3 = "<p>" + players[i].username + "</p>";
            document.getElementById("top3").innerHTML = div3;
        }
    }
}
topPlayers(players);

