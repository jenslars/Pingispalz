
class Player {
  constructor(name, elo) {
    this.name = name;
    this.elo = elo;
    }
};

let player_1 = new Player("Alice", 100);
let player_2 = new Player("Bob", 200);

document.write(player_1.name, " has:", player_1.elo, " elo, ", player_2.name, " has:", player_2.elo," elo")

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
    document.write(player_1.name, " has:", Math.round(player_1.elo), " elo, ", player_2.name, " has:", Math.round(player_2.elo)," elo")
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
    document.write(player_1.name, " has:", Math.round(player_1.elo), " elo, ", player_2.name, " has:", Math.round(player_2.elo)," elo")
}



