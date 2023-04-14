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

