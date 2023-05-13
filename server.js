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
app.use(express.static('profile_images'));

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
  const client = await pool.connect();
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
  client.release();
});

app.post('/login', async (req, res) => {
  //Function to validate users login input
  const { email, password } = req.body;
  const client = await pool.connect();
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
  client.release();
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
  } try { 
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
    res.redirect('/home');
  }
});


app.post('/joinClub', async (req, res) => {
  const { club } = req.body;
  const client = await pool.connect();
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
  client.release();
});

app.get('/clubLinks', async (req, res) => {
  //Function to send users club links
  const client = await pool.connect();
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
  client.release();
});

app.get('/getLoggedInUserInfo', async (req, res) => {
  //Function to send the logged in users data to edit profile
  const client = await pool.connect();
  try {
    const result = await pool.query(
      'SELECT COALESCE(profile_image, \'stockuserimage.png\') as profile_image, username, contact_info, user_bio FROM users WHERE user_id = $1'
      , [loggedInUserId]);
      const profile_image = result.rows[0].profile_image;
      const username = result.rows[0].username;
      const contact_info = result.rows[0].contact_info;
      const user_bio = result.rows[0].user_bio;
      res.status(200).send({ 
        profile_image: profile_image,
        username: username,
        contact_info: contact_info,
        user_bio: user_bio
      });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error: Internal server error' });
  }
  client.release();
});

app.post('/uploadprofilepicture', async (req, res) => {
  const client = await pool.connect();
  const imageFile = req.files.image;
  try {
    await client.query('BEGIN');

    const timestamp = new Date().getTime();
    const filename = `${timestamp}_${imageFile.name}`;

    const savePath = path.join(__dirname, 'profile_images', filename);
    await imageFile.mv(savePath);

    await client.query(`
      UPDATE users
      SET profile_image = $1
      WHERE user_id = $2
    `, [filename, loggedInUserId]);

    await client.query('COMMIT');

    res.status(200).send('Image uploaded successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).send('Error uploading image');
  } finally {
    client.release();
  }
});

app.post('/uploaddiscordform', async (req, res) => {
  const { contact_info } = req.body;
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE users
      SET contact_info = $1
      WHERE user_id = $2
    `, [contact_info, loggedInUserId]);
    res.status(200).send({ message: 'Discord info updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error: Internal server error' });
  }
  client.release();
});

app.post('/uploadUserDescriptionForm', async (req, res) => {
  const { user_description } = req.body;
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE users
      SET user_bio = $1
      WHERE user_id = $2
    `, [user_description, loggedInUserId]);
    res.status(200).send({ message: 'Bio updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error: Internal server error' });
  }
  client.release();
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
})

app.get('/leaderboard', (req, res) => {
  const page = req.params.page;
  fs.readFile('Leaderboard.html', function(error, data) {
    if (error) {
      res.writeHead(404);
      res.write('Error: File Not Found');
    }
    else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
    }
     res.end();
  });
})


app.get('/leaderboard/score', async (req, res) => {
  const client = await pool.connect();
  try {
    const fetchedLeaderboardName = await pool.query('SELECT leaderboard_name FROM leaderboards WHERE id = $1', [GlobalLeaderboardValue]);
    const finalfetchedLeaderboardName = fetchedLeaderboardName.rows[0].leaderboard_name;
    const tableName = `${finalfetchedLeaderboardName}#${GlobalLeaderboardValue}`;
    const result = await pool.query(`SELECT username, elo, wins, losses FROM "${tableName}" JOIN users ON player_id = user_id ORDER BY elo DESC`)
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

let GlobalLeaderboardValue;

app.get('/leaderboards/:page', async (req, res) => {
  GlobalLeaderboardValue = req.params.page;
  console.log(GlobalLeaderboardValue);
  fs.readFile('views/leaderboard.html', function(error, data) {
    if (error) {
      res.writeHead(404);
      res.write('Error: File Not Found');
      res.end();
    }
    else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    }
  });
});




