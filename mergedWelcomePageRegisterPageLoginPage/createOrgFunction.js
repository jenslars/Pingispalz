const {Client} = require('pg');

const client = new Client({
    host: 'pgserver.mau.se',
    user: 'an7066',
    port: '5432',
    password: 'csodbjar',
    database: 'pingispals'
});

client.connect();

function getValues(){
    console.log("här är vi");
    const tableName = document.getElementById("name").value;
    const isPublic = document.querySelector('input[name="openOrInvite"]:checked').value;
    leaderboardCreated(tableName, isPublic);
    createLeaderboard(tableName, isPublic);
}

function leaderboardCreated(tableName, isPublic){
    //skriver ner att leaderboarden existerar,
    //sparar alla leaderboards på en JSOn fil där de sparas med sina namn & ifall de är public,
    //och kanske vem som har tillgång till leaderboarden ifall den är privat
}


function createLeaderboard(tableName){
    //skapar själva leaderboarden
    const newLeaderboard = `CREATE TABLE ${tableName} (
        user_id INTEGER PRIMARY KEY, 
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        )`;//ändra kanske denna så att den sparar wins, elo osv.


    client.query(newLeaderboard, (err, res)=> {
        if(!err){
            console.log(res.rows);
        } else{
            console.log(err.message);
        }
        client.end();
    })
}
