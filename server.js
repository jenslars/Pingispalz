const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({
    user: 'an7066',
    host: 'pgserver.mau.se',
    database: 'pingispals',
    password: 'csodbjar',
    port: "5432",
});

const hostname = '127.0.0.1';
const port = 3000;

app.use(express.static('images'));
app.use(express.static('public'));

//Declaring the user logged in globally 
let loggedInUserId;

app.get('/', (req, res) => {
  fs.readFile('index.html', function(error, data) {
    if (error) {
      res.writeHead(404);
      res.write('Error: File Not Found');
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
    }
    res.end();
  });
});

app.get('/createorg', (req, res) => {
  fs.readFile('createOrg.html', function(error, data) {
      if (error) {
          res.writeHead(404);
          res.write('Error: File Not Found');
      } else {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(data);
      }
      res.end();
  });
});

http.createServer(app).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// Starts the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

app.use(express.json());

app.post('/register', async (req, res) => {
  //function to register account
  const { email, username, password } = req.body;

  try {
    await pool.query('SELECT insert_user($1, $2, $3)', [email, username, password])
    loggedInUserId = await pool.query('SELECT user_id from users WHERE email = $1', [email]);
    res.sendStatus(200); 
  } catch (err) {
    console.error(err);
    if (err.code === 'P0001') {
      res.status(400).send({ message: 'Account with this email already exists' });
    } else {
      res.sendStatus(500);
    }
  }
});

app.post('/login', async (req, res) => {
  //Function to validate users login input
  const { email, password } = req.body;
  
  try {
    const result = await pool.query('SELECT login($1, $2)', [email, password]);
    loggedInUserId = await pool.query('SELECT user_id from users WHERE email = $1', [email]);
    const isValidLogin = result.rows[0].login;
    if (isValidLogin) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post('/createOrg', async (req, res) => {
  //Function to insert data into table leaderboards and create new table for said leaderboard
  const { tableName, tableDescription } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const leaderboardInsertResult = await client.query(`
      INSERT INTO leaderboards (leaderboard_name, leaderboard_description, owner)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [tableName, tableDescription, user_id]);

    const leaderboardId = leaderboardInsertResult.rows[0].id;

    await client.query(`
      CREATE TABLE ${tableName} (
        server_id INTEGER REFERENCES leaderboards(id),
        player_id INTEGER REFERENCES users(user_id),
        elo INTEGER,
        wins INTEGER,
        losses INTEGER,
        is_admin BOOLEAN
      )
    `);
    await client.query(`
      INSERT INTO ${tableName} (server_id, player_id, elo, wins, losses, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [leaderboardId, loggedInUserId, 0, 0, 0, true]);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }


});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  fs.readFile(`${page}.html`, function(error, data) {
    if (error) {
      res.writeHead(404);
      res.write('Error: File Not Found');
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
    }
    res.end();
  });
});

