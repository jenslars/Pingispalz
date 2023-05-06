const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const fs = require('fs');
const fileUpload = require('express-fileupload');
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

//Declares logged in user
let loggedInUserId;

app.use(fileUpload());
app.use(express.static('images'));
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('organisation_images'));

app.get('/', (req, res) => {
  fs.readFile('views/index.html', function(error, data) {
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
    userId = await pool.query('SELECT user_id from users WHERE email = $1', [email]);
    loggedInUserId = userId.rows[0].user_id;
    res.sendFile(__dirname + '/views/home.html');
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
    userId = await pool.query('SELECT user_id from users WHERE email = $1', [email]);
    loggedInUserId = userId.rows[0].user_id;
    const isValidLogin = result.rows[0].login;
    if (isValidLogin) {
      res.sendFile(__dirname + '/views/home.html');
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post('/createOrg', async (req, res) => {
  //Function to create organization
  const { tableName, tableDescription } = req.body;
  const client = await pool.connect();
  const imageFile = req.files.image;
  let leaderboardId;
  try {
    await client.query('BEGIN');

    const timestamp = new Date().getTime();
    const filename = `${timestamp}_${imageFile.name}`;

    const savePath = path.join(__dirname, 'organisation_images', filename);
    await imageFile.mv(savePath);

    const leaderboardInsertResult = await client.query(`
      INSERT INTO leaderboards (leaderboard_name, leaderboard_description, owner, leaderboard_image)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [tableName, tableDescription, loggedInUserId, filename]);

    leaderboardId = leaderboardInsertResult.rows[0].id;
    const newTableName = `${tableName}#${leaderboardId}`;

    await client.query(`
      CREATE TABLE "${newTableName}" (
        server_id INTEGER REFERENCES leaderboards(id),
        player_id INTEGER REFERENCES users(user_id),
        elo INTEGER,
        wins INTEGER,
        losses INTEGER,
        is_admin BOOLEAN
      )
    `);

    await client.query(`
      INSERT INTO "${newTableName}" (server_id, player_id, elo, wins, losses, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [leaderboardId, loggedInUserId, 0, 0, 0, true]);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    try { 
      await pool.query(`
          INSERT into users_in_leaderboards (user_id, leaderboard_id)
          VALUES ($1, $2)
        `, [loggedInUserId, leaderboardId]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

});

app.post('/joinClub', async (req, res) => {
  const { club } = req.body;

  try {
    const leaderboardId = await pool.query(`SELECT server_id FROM "${club}" ORDER BY server_id ASC LIMIT 1 OFFSET 0`);
    const selectedLeadboardId = leaderboardId.rows[0].server_id;
    await pool.query(`
      INSERT into "${club}" (server_id, player_id, elo, wins, losses, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [selectedLeadboardId, loggedInUserId, 0, 0, 0, false]);
    await pool.query(`
      INSERT into users_in_leaderboards (user_id, leaderboard_id)
      VALUES ($1, $2)
    `, [loggedInUserId, selectedLeadboardId]);

    res.status(200).send({ message: 'Successfully joined the club' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Unable to join the club' });
  }
});

app.get('/clubLinks', async (req, res) => {
  //Function to send users club links
  try {
    const leaderboardIds = await pool.query('SELECT leaderboard_id FROM users_in_leaderboards WHERE user_id = $1', [loggedInUserId]);
    const leaderboards = await Promise.all(leaderboardIds.rows.map(async ({ leaderboard_id }) => {
      const result = await pool.query('SELECT id, leaderboard_name, COALESCE(leaderboard_image, \'stockclubimage.png\') AS leaderboard_image FROM leaderboards WHERE id = $1', [leaderboard_id]);
      return result.rows[0];
    }));
    
    res.status(200).send(leaderboards);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error: Internal server error' });
  }
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'views', `${page}.html`);
  fs.readFile(filePath, function(error, data) {
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


