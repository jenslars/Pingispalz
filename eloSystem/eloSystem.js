
class Player {
  constructor(name, elo) {
    this.name = name;
    this.elo = elo;
    }
};

let player_1 = new Player("Alice", 100);
let player_2 = new Player("Bob", 200);

document.getElementById("eloDescription").innerHTML = `${player_1.name}  has: ${Math.round(player_1.elo)}  elo,  ${player_2.name} has: ${Math.round(player_2.elo)} elo`

// document.getElementById("player1").innerHTML = `${player_1.name} won`
// document.getElementById("player2").innerHTML = `${player_2.name} won`

function getResults(){
    var player1Result = document.getElementById("player1").value
    var player2Result = document.getElementById("player2").value
    let difference = Math.abs(player1Result - player2Result)

    if (player1Result != 11 && player2Result != 11){
        alert("The winner needs atleast 11 points to win")
        return
    } else if (player1Result == player2Result){
        alert("Both players can not get the same score")
        return
    } else if (difference < 2){
        alert("The winner has to lead by atleast 2 points")
        return
    } else {
        if (player1Result > player2Result){
            player1Victory(player_1, player_2)
        } else {
            player2Victory(player_1, player_2)
        }
    }
}

function player1Victory(player_1, player_2){
    const highest = Math.max(player_1.elo, player_2.elo);
    const lowest = Math.min(player_1.elo, player_2.elo);
    
    if (highest == lowest){
        var calculate = 10
    } else if (player_1.elo == highest){
        var calculate = (highest - lowest) 
        if (calculate >= 100){
            calculate = 2
        } else if(calculate <= 10){
            calculate = 8
        } else {
            calculate /= 8
        }
    } else if (player_1.elo == lowest) {
        var calculate = (highest - lowest) 
        if (calculate >= 100){
            calculate /= 10
        } else if(calculate <= 10){
            calculate = 10
        } else {
            calculate /= 5
        }
    } 
    
    player_1.elo += calculate
    player_2.elo -= calculate
    alert(` ${player_1.name} has: ${Math.round(player_1.elo)} elo,  ${player_2.name},  has: ${Math.round(player_2.elo)} elo. ${player_1.name} won`)
    exitpopup()
}

function checkInput(input) {
    if (input.value > 11) {
      input.value = 11;
    }
  }

function player2Victory(player_1, player_2){
    const highest = Math.max(player_1.elo, player_2.elo);
    const lowest = Math.min(player_1.elo, player_2.elo);
    
    if (highest == lowest){
        var calculate = 10
    } else if (player_2.elo == highest){
        var calculate = (highest - lowest)
        if (calculate >= 100){
            calculate = 2
        } else if(calculate <= 10){
            calculate = 8
        } else {
            calculate /= 10
        }
    } else if (player_2.elo == lowest) {
        var calculate = (highest - lowest) 
        if (calculate >= 100){
            calculate /= 8
        } else if(calculate <= 10){
            calculate = 10
        } else {
            calculate /= 5
        }
    } 
    player_2.elo += calculate
    player_1.elo -= calculate
    alert(` ${player_1.name} has: ${Math.round(player_1.elo)} elo,  ${player_2.name},  has: ${Math.round(player_2.elo)} elo. ${player_2.name} won`)
    exitpopup()
}

function resultsPopup() {
    var resultsPopupDiv = document.getElementById('resultsPopup');
    var gridcontainerLink = document.getElementById('blur');
    resultsPopupDiv.classList.add('active');
    gridcontainerLink.classList.add('active');

}

function exitpopup() { //fixa denna 
    var resultsPopupDiv = document.getElementById('resultsPopup');
    var gridcontainerLink = document.getElementById('blur');
    resultsPopupDiv.classList.remove('active');
    gridcontainerLink.classList.remove('active');   
}