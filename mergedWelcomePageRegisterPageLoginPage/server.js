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

global.user_id = 1;

const hostname = '127.0.0.1';
const port = 3000;

app.use(express.static('images'));
app.use(express.static('public'));

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

// Handle POST requests to /register
app.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    await pool.query('SELECT insert_user($1, $2, $3)', [email, username, password])
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
  const { email, password } = req.body;
  
  try {
    const result = await pool.query('SELECT login($1, $2)', [email, password]);
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
  const { tableName, tableDescription } = req.body;

  
  const newLeaderboard = await pool.query('SELECT insert_leaderboard($, $2, $3 )',[tableName, tableDescription, user_id])
  
  //`INSERT INTO leaderboards (leaderboard_name, leaderboard_description, owner) 
   // VALUES( '${tableName}', '${tableDescription}', ${user_id})`;
    
    //user_id ska ändras till global variable
  const newOrg = `CREATE TABLE ${tableName} (
    server_id INTEGER,
    user_id INTEGER, 
    elo SMALLINT DEFAULT 1000,
    wins SMALLINT,
    losses SMALLINT,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    username varchar(40) REFERENCES users(username),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    )`;
  const newUser = `INSERT INTO ${tableName} (user_id, is_public, is_admin, username) 
    SELECT 1, true, true, users.username
    FROM users
    WHERE users.user_id = 1`;

  try {
    await pool.query(newLeaderboard);
    const result = await pool.query(newOrg);
    await pool.query(newUser);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
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


