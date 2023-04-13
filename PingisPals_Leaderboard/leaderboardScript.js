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
}]
    

for (let i = 0; i < players.length ; i++) {
    const paragraph = document.createElement("h3");
    const node = document.createTextNode(players.username[i]);
    paragraph.appendChild(node);
    const element = document.getElementById("ladder");
    element.appendChild(paragraph);
}
