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

app.use(fileUpload());

const hostname = '127.0.0.1';
const port = 3000;

http.createServer(app).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

//Declares logged in user
let loggedInUserId;
//Declares global leaderboard id
let GlobalLeaderboardValue;
//Declares global profile user id  
let globalViewProfileValue;

//Express routes
app.use(express.static('images'));
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('organisation_images'));
app.use(express.static('profile_images'));
app.use(express.static('scripts'));
app.use(express.json());

//Sends user to starting page
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

app.post('/register', async (req, res) => {
  //function to register account
  const { email, username, password } = req.body;
  const client = await pool.connect();
  try {
    await pool.query('SELECT insert_user($1, $2, $3)', [email, username, password])
    userId = await pool.query('SELECT user_id from users WHERE email = $1', [email]);
    loggedInUserId = userId.rows[0].user_id;
    res.sendFile(__dirname + '/views/home.html');
    await pool.query(`UPDATE users
    SET status = 'Online'
    WHERE user_id = $1
  `, [loggedInUserId]);
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
      await pool.query(`UPDATE users
    SET status = 'Online'
    WHERE user_id = $1
  `, [loggedInUserId]);
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
    `, [leaderboardId, loggedInUserId, 1000, 0, 0, true]);

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
  //Function to join club
  const { club } = req.body;
  const client = await pool.connect();
  try {
    const leaderboardId = await pool.query(`SELECT server_id FROM "${club}" ORDER BY server_id ASC LIMIT 1 OFFSET 0`);
    const selectedLeadboardId = leaderboardId.rows[0].server_id;
    await pool.query(`
      INSERT into "${club}" (server_id, player_id, elo, wins, losses, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [selectedLeadboardId, loggedInUserId, 1000, 0, 0, false]);
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
  //Function to fetch and send users club links
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

app.get('/getLoggedInUserInfoForNav', async (req, res) => {
  //Function to send the logged in users data to navbar
  const client = await pool.connect();
  try {
    const result = await pool.query(
      'SELECT COALESCE(profile_image, \'stockuserimage.png\') as profile_image, username, status FROM users WHERE user_id = $1'
      , [loggedInUserId]);
      const profile_image = result.rows[0].profile_image;
      const username = result.rows[0].username;
      const status = result.rows[0].status;
      res.status(200).send({ 
        profile_image: profile_image,
        username: username,
        status: status,
      });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error: Internal server error' });
  }
  client.release();
});

app.post('/uploadprofilepicture', async (req, res) => {
  //Function to upload profile picture in editProfile
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
  //Function to upload contact info in editProfile
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
  //Function to upload bio in editProfile
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

app.post('/findClub', async (req, res) => {
  //Function to fetch list of existing clubs
  const client = await pool.connect();
  try {
    const results = await pool.query(`
    SELECT *, username
    FROM leaderboards
    JOIN users ON owner = user_id
  `)
    res.status(200).send(results.rows)
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
})

app.get('/leaderboard/score', async (req, res) => {
  //Function to fetch leaderboard data
  const client = await pool.connect();
  try {
    const fetchedLeaderboardName = await pool.query('SELECT leaderboard_name FROM leaderboards WHERE id = $1', [GlobalLeaderboardValue]);
    const finalFetchedLeaderboardName = fetchedLeaderboardName.rows[0].leaderboard_name;
    const tableName = `${finalFetchedLeaderboardName}#${GlobalLeaderboardValue}`;

    const pendingMatches = await pool.query(`
      SELECT *
      FROM matches
      WHERE challenger_id = $1
        AND status = 'PENDING'
        AND recipient_id IN (
          SELECT player_id
          FROM "${tableName}"
        )
    `, [loggedInUserId]);

    const leaderboardData = await pool.query(`
      SELECT user_id, username, elo, wins, losses, status, profile_image
      FROM "${tableName}"
      JOIN users ON player_id = user_id
      ORDER BY elo DESC
    `);
    const response = {
      tableName: tableName,
      pendingMatches: pendingMatches.rows,
      leaderboardData: leaderboardData.rows,
      loggedInUserId: loggedInUserId,
      GlobalLeaderboardValue : GlobalLeaderboardValue
      };

    res.status(200).send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
});

app.get('/challenge/player', async (req, res) => {
  //Function to fetch username for logged in user for challenge popup in leaderboard
  const client = await pool.connect();
  try {
    const userNameForLoggedInUser = await pool.query('SELECT username FROM users WHERE user_id = $1', [loggedInUserId]);
    const queryUser = userNameForLoggedInUser.rows[0].username;
    res.status(200).send({ queryUser });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
});

app.get('/leaderboards/:page', async (req, res) => {
  //Dynamic link and function to save leaderboards id
  GlobalLeaderboardValue = req.params.page;
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

app.get('/viewProfile/:page', async (req, res) => {
  //Dynamic link and function to save opponents id
  globalViewProfileValue = req.params.page;
  fs.readFile('views/viewProfile.html', function(error, data) {
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

app.get('/getViewProfile', async (req, res) => {
  //Fetches data for opponents profile
  const client = await pool.connect();
  try {
    const result = await pool.query(
      'SELECT COALESCE(profile_image, \'stockuserimage.png\') as profile_image, username, contact_info, user_bio FROM users WHERE user_id = $1',
      [globalViewProfileValue]
    );
    const profile_image = result.rows[0].profile_image;
    const username = result.rows[0].username;
    const contact_info = result.rows[0].contact_info;
    const user_bio = result.rows[0].user_bio;
    res.json({
      profile_image: profile_image,
      username: username,
      contact_info: contact_info,
      user_bio: user_bio
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error: Internal server error' });
  }
  client.release();
});

app.get('/sendChallenge', async (req, res) => {
  //Sends challenge through viewProfile
  const client = await pool.connect();
  try {
    const status = "PENDING";
    await pool.query( 
      `INSERT into matches (challenger_id, recipient_id, server_id, status)
      VALUES ($1, $2, $3, $4)`,
      [loggedInUserId, globalViewProfileValue, GlobalLeaderboardValue, status ]
    );
    res.status(200).send('Success, challenge sent');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.get('/cancelChallenge', async (req, res) => {
  //Cancels challenge through viewProfile
  const client = await pool.connect();
  try {
    await pool.query( 
      `DELETE from matches WHERE challenger_id = $1 and recipient_id = $2`,
      [loggedInUserId, globalViewProfileValue]
    );
    res.status(200).send('Success, challenge cancelled');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.post('/cancelChallengeFromLeaderboard', async (req, res) => {
  //Cancels challenge through leaderboard
  const client = await pool.connect();
  const { recipientId } = req.body;
  try {
    await pool.query( 
      `DELETE from matches WHERE challenger_id = $1 and recipient_id = $2`,
      [loggedInUserId, recipientId ]
    );
    res.status(200).send('Success, challenge cancelled');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.get('/checkIfUserSentChallenge', async (req, res) => {
  //Checks if user has already been challenges through viewProfile
  const client = await pool.connect();
  try {
    const result = await pool.query( 
      `SELECT match_id from matches WHERE challenger_id = $1 and recipient_id = $2`,
      [loggedInUserId, globalViewProfileValue]
    );
    const matchId = result.rows[0].match_id;
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  } finally {
    client.release();
  }   
});

app.get('/matchHistoryViewProfile', async (req, res) => {
  //Fetches an opponents match history
  const client = await pool.connect();
  try {
    const matchesPlayed = await pool.query(
      `SELECT 
         r.match_id, 
         r.recipientpoints, 
         r.winner, 
         r.challengerpoints, 
         r.status, 
         r.loser, 
         r.recipient_id, 
         r.challenger_id,
         ur.user_id AS recipient_user_id,
         ur.username AS recipient_username,
         ur.profile_image AS recipient_profile_image,
         uc.user_id AS challenger_user_id,
         uc.username AS challenger_username,
         uc.profile_image AS challenger_profile_image
       FROM 
         results AS r
       INNER JOIN 
         users AS ur ON r.recipient_id = ur.user_id
       INNER JOIN 
         users AS uc ON r.challenger_id = uc.user_id
       WHERE 
         (r.challenger_id = $1 OR r.recipient_id = $1) 
         AND r.status = 'FINISHED'`,
      [globalViewProfileValue]
    );

    const matchData = matchesPlayed.rows.map((match) => {
      const player = match.recipient_id === globalViewProfileValue ? 'recipient' : 'challenger';
      const opponent = player === 'recipient' ? 'challenger' : 'recipient';

      return {
        matchId: match.match_id,
        playerUsername: match[player + '_username'],
        playerProfileImage: match[player + '_profile_image'],
        opponentUsername: match[opponent + '_username'],
        opponentProfileImage: match[opponent + '_profile_image'],
        playerPoints: match[player + 'points'],
        opponentPoints: match[opponent + 'points'],
        opponentUserId: match[opponent + '_user_id'],
      };
    });

    res.status(200).send(matchData);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

app.post('/sendChallengeFromLeaderboard', async (req, res) => {
  //Sends challenge through leaderboard
  const { recipientId } = req.body;
  const client = await pool.connect();
  try {
    const status = "PENDING";
    await pool.query( 
      `INSERT into matches (challenger_id, recipient_id, server_id, status)
      VALUES ($1, $2, $3, $4)`,
      [loggedInUserId, recipientId, GlobalLeaderboardValue, status ]
    );
    res.status(200).send('Success, challenge sent');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.get('/matchFromChallenger', async (req, res) => {
  //Fetches game invite
  const client = await pool.connect(); 
  try {
    const list = await pool.query( 
      `SELECT
      m.match_id,
      u1.username AS challenger_username,
      u2.username AS recipient_username,
      lb.leaderboard_name AS server_name,
      u1.profile_image AS challenger_profile_image,
      m.status
      
      FROM
        matches m
      JOIN
        users u1 ON m.challenger_id = u1.user_id
      JOIN
        users u2 ON m.recipient_id = u2.user_id
      JOIN
        leaderboards lb ON m.server_id = lb.id
      WHERE
        m.recipient_id = $1;`, [loggedInUserId]
    );
    let matchList = list.rows.map(row => [
      row.challenger_username,
      row.recipient_username,
      row.server_name,
      row.match_id,
      row.challenger_profile_image
    ]);
    res.status(200).send({
      matchList: matchList,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.post('/declineMatch', async (req, res) => {
  //Declines match invite
  const matchId  = req.body.matchId;
  const client = await pool.connect();
  try {
    await pool.query( 
      `DELETE FROM matches WHERE match_id = $1`, [matchId]
    );
    res.status(200).send('Match was declined');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.post('/acceptedChallenge', async (req, res) => {
   //Function to accept challenge in Challenges
  const matchId  = req.body.matchId;
  const client = await pool.connect();
  try {
    await pool.query( 
      `WITH moved_rows AS (
        DELETE FROM matches
        WHERE match_id = $1
        RETURNING recipient_id, challenger_id, server_id, match_id, status
      )
      INSERT INTO results (recipient_id, challenger_id, server_id, match_id, status)
      SELECT recipient_id, challenger_id, server_id, match_id, status
      FROM moved_rows;
    `,
      [matchId]
    ); 

    res.status(200).send('Success, challenge Accepted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.post('/setstatusonline', async (req, res) => {
  //Sets logged in user status online
  const client = await pool.connect();
  try {
    await pool.query( 
      `UPDATE users
      SET status = 'Online'
      WHERE user_id = $1`, [loggedInUserId]
    );
    res.status(200).send('User logged out succesfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.post('/setstatusaway', async (req, res) => {
  //Sets logged in user status away
  const client = await pool.connect();
  try {
    await pool.query( 
      `UPDATE users
      SET status = 'Away'
      WHERE user_id = $1`, [loggedInUserId]
    );
    res.status(200).send('User logged out succesfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.post('/setstatusmatchready', async (req, res) => {
  //Sets logged in user status match ready
  const client = await pool.connect();
  try {
    await pool.query( 
      `UPDATE users
      SET status = 'Match ready'
      WHERE user_id = $1`, [loggedInUserId]
    );
    res.status(200).send('User logged out succesfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.post('/logout', async (req, res) => {
  //Logs out logged in user
  const client = await pool.connect();
  try {
    await pool.query( 
      `UPDATE users
      SET status = 'Offline'
      WHERE user_id = $1`, [loggedInUserId]
    );
    loggedInUserId = undefined
    res.status(200).send('User logged out succesfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.get('/fetchMatches', async (req, res) => {
  const { opponentUserId } = req.query; // Extract opponentUserId from query parameters
  const client = await pool.connect();
  try {
    const matchesFetched = await pool.query(
      `SELECT 
         r.match_id, 
         r.recipientpoints, 
         r.winner, 
         r.challengerpoints, 
         r.status, 
         r.loser, 
         r.recipient_id, 
         r.challenger_id,
         r.to_confirm,
         r.server_id,
         ur.user_id AS recipient_user_id,
         ur.username AS recipient_username,
         ur.profile_image AS recipient_profile_image,
         uc.user_id AS challenger_user_id,
         uc.username AS challenger_username,
         uc.profile_image AS challenger_profile_image,
         lb.leaderboard_name
       FROM 
         results AS r
       INNER JOIN 
         users AS ur ON r.recipient_id = ur.user_id
       INNER JOIN 
         users AS uc ON r.challenger_id = uc.user_id
       INNER JOIN
         leaderboards AS lb ON r.server_id = lb.id
       WHERE 
         (r.challenger_id = $1 OR r.recipient_id = $1)
       ORDER BY
         r.match_id DESC
       LIMIT 5`, // Select only the latest 5 matches
      [loggedInUserId]
    );

    const matchData = matchesFetched.rows.map((match) => {
      const player = match.recipient_id === loggedInUserId ? 'recipient' : 'challenger';
      const opponent = player === 'recipient' ? 'challenger' : 'recipient';
      return {
        matchId: match.match_id,
        playerUsername: match[player + '_username'],
        playerProfileImage: match[player + '_profile_image'],
        opponentUsername: match[opponent + '_username'],
        opponentProfileImage: match[opponent + '_profile_image'],
        playerPoints: match[player + 'points'],
        opponentPoints: match[opponent + 'points'],
        opponentUserId: match[opponent + '_user_id'],
        leaderboardName: match.leaderboard_name,
        serverId: match.server_id,
        status: match.status,
        to_confirm: match.to_confirm,
        winner: match.winner
      };
    });

    const response = {
      loggedInUserId: loggedInUserId,
      matchData: matchData,
      opponentUserId: opponentUserId // Include opponentUserId in the response
    };

    res.status(200).send(response);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

app.get('/matchHistory', async (req, res) => {
  //Fetches logged in users match history
  const client = await pool.connect();
  try {
    const matchesPlayed = await pool.query(
      `SELECT 
         r.match_id, 
         r.recipientpoints, 
         r.winner, 
         r.challengerpoints, 
         r.status, 
         r.loser, 
         r.recipient_id, 
         r.challenger_id,
         ur.user_id AS recipient_user_id,
         ur.username AS recipient_username,
         ur.profile_image AS recipient_profile_image,
         uc.user_id AS challenger_user_id,
         uc.username AS challenger_username,
         uc.profile_image AS challenger_profile_image
       FROM 
         results AS r
       INNER JOIN 
         users AS ur ON r.recipient_id = ur.user_id
       INNER JOIN 
         users AS uc ON r.challenger_id = uc.user_id
       WHERE 
         (r.challenger_id = $1 OR r.recipient_id = $1) 
         AND r.status = 'FINISHED'`,
      [loggedInUserId]
    );

    const matchData = matchesPlayed.rows.map((match) => {
      const player = match.recipient_id === loggedInUserId ? 'recipient' : 'challenger';
      const opponent = player === 'recipient' ? 'challenger' : 'recipient';

      return {
        matchId: match.match_id,
        playerUsername: match[player + '_username'],
        playerProfileImage: match[player + '_profile_image'],
        opponentUsername: match[opponent + '_username'],
        opponentProfileImage: match[opponent + '_profile_image'],
        playerPoints: match[player + 'points'],
        opponentPoints: match[opponent + 'points'],
        opponentUserId: match[opponent + '_user_id'],
      };
    });

    res.status(200).send(matchData);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

app.post('/contestResult', async (req, res) => {
  const { yourScore, theirScore, matchId, opponentPlayerId } = req.body;
  console.log("Vi är i contestresult");
  const client = await pool.connect();
  try {
    const matchQuery = await client.query(
      `SELECT recipient_id, challenger_id
       FROM results
       WHERE match_id = $1`,
      [matchId]
    );

    const matchData = matchQuery.rows[0];
    if (!matchData) {
      console.log("Match not found");
      return res.status(404).json({ error: 'Match not found' });
    }

    const parsedOpponentPlayerId = parseInt(opponentPlayerId, 10);
    const parsedRecipientId = parseInt(matchData.recipient_id, 10);
    const parsedChallengerId = parseInt(matchData.challenger_id, 10);

    let isOpponentRecipient;
    if (parsedOpponentPlayerId === parsedRecipientId) {
      isOpponentRecipient = true;
    } else if (parsedOpponentPlayerId === parsedChallengerId) {
      isOpponentRecipient = false;
    } else {
      console.log("Invalid opponent player ID");
      return res.status(400).json({ error: 'Invalid opponent player ID' });
    }

    if (isOpponentRecipient) {
      await client.query(
        `UPDATE results SET recipientpoints = $1, challengerpoints = $2, to_confirm = $3 WHERE match_id = $4`,
        [theirScore, yourScore, opponentPlayerId, matchId]
      );
    } else {
      await client.query(
        `UPDATE results SET recipientpoints = $1, challengerpoints = $2, to_confirm = $3 WHERE match_id = $4`,
        [yourScore, theirScore, opponentPlayerId, matchId]
      );
    }
   
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});


app.post('/registerResult', async (req, res) => {
  // Registers result from game
  const { yourScore, theirScore, matchId, opponentPlayerId } = req.body;
  const client = await pool.connect();
  const status = 'TOBECONFIRMED';
  let winner, loser, recipientpoints, challengerpoints, updatedField;

  try {
    const recipientResult = await client.query(`
      UPDATE results
      SET recipientpoints = CASE
        WHEN recipientpoints IS NULL THEN $1
        ELSE recipientpoints
      END,
      challengerpoints = CASE
        WHEN recipientpoints IS NULL THEN $2
        ELSE challengerpoints
      END
      WHERE recipient_id = $3 AND match_id = $4
      RETURNING recipientpoints, challengerpoints
    `, [theirScore, yourScore, opponentPlayerId, matchId]);

    if (recipientResult.rowCount > 0) {
      updatedField = 'recipientpoints';
      recipientpoints = theirScore;
      challengerpoints = yourScore;
    } else {
      const challengerResult = await client.query(`
        UPDATE results
        SET recipientpoints = CASE
          WHEN challengerpoints IS NULL THEN $1
          ELSE recipientpoints
        END,
        challengerpoints = CASE
          WHEN challengerpoints IS NULL THEN $2
          ELSE challengerpoints
        END
        WHERE challenger_id = $3 AND match_id = $4
        RETURNING recipientpoints, challengerpoints
      `, [yourScore, theirScore, opponentPlayerId, matchId]);

      if (challengerResult.rowCount > 0) {
        updatedField = 'challengerpoints';
        recipientpoints = theirScore;
        challengerpoints = yourScore;
      }
    }

    if (parseInt(yourScore) > parseInt(theirScore)) {
      if (opponentPlayerId === loggedInUserId) {
        winner = opponentPlayerId;
        loser = loggedInUserId;
      } else {
        winner = loggedInUserId;
        loser = opponentPlayerId;
      }
    } else {
      if (opponentPlayerId === loggedInUserId) {
        winner = loggedInUserId;
        loser = opponentPlayerId;
      } else {
        winner = opponentPlayerId;
        loser = loggedInUserId;
      }
    }

    await client.query(`
      UPDATE results
      SET winner = $1, loser = $2, status = $3, to_confirm = $4
      WHERE match_id = $5
    `, [winner, loser, status, opponentPlayerId, matchId]);

    res.status(200).send({ message: 'Successfully registered the result' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Unable to register the result' });
  } finally {
    client.release();
  }
});

app.post('/confirmResult', async (req, res) => {
  //Confirms registered result and calculates elo
  const { matchId } = req.body;
  const client = await pool.connect();
  try {
    await pool.query( 
      `UPDATE results
      SET status = 'FINISHED'
      WHERE match_id = $1`, [matchId]
    );
        const query = `
      SELECT r.winner, r.loser, r.server_id, l.leaderboard_name
      FROM results AS r
      JOIN leaderboards AS l ON r.server_id = l.id
      WHERE r.match_id = $1
    `;

  const result = await pool.query(query, [matchId]);
  if (result.rows.length > 0) {
    const { winner, loser, server_id, leaderboard_name } = result.rows[0];
    const TableName = `${leaderboard_name}#${server_id}`;
  
    const query2 = `
    SELECT
      (SELECT elo FROM "${TableName}" WHERE player_id = $1) AS winnerelo,
      (SELECT elo FROM "${TableName}" WHERE player_id = $2) AS loserelo
  `;

    const result2 = await pool.query(query2, [winner, loser]);
    var winnerElo = result2.rows[0].winnerelo;
    var loserElo = result2.rows[0].loserelo;
    
    var highest = Math.max(winnerElo, loserElo);
    var lowest = Math.min(winnerElo, loserElo);
    
    if (highest == lowest){
        var calculate = 10
    } else if (winnerElo == highest){
        var calculate = (highest - lowest)
        if (calculate >= 100){
            calculate = 2
        } else if(calculate <= 10){
            calculate = 8
        } else {
            calculate /= 10
        }
    } else if (winnerElo == lowest) {
        var calculate = (highest - lowest) 
        if (calculate >= 100){
            calculate /= 8
        } else if(calculate <= 10){
            calculate = 10
        } else {
            calculate /= 5
        }
    } 
    winnerElo += calculate
    loserElo -= calculate

    await pool.query(
      `UPDATE "${TableName}"
      SET
        elo = CASE
          WHEN player_id = $1 THEN $2::integer
          WHEN player_id = $3 THEN $4::integer
        END,
        wins = CASE
          WHEN player_id = $1 THEN wins + 1
          ELSE wins
        END,
        losses = CASE
          WHEN player_id = $3 THEN losses + 1
          ELSE losses
        END
      WHERE player_id IN ($1, $3)`,
      [winner, parseInt(winnerElo), loser, parseInt(loserElo)]
    );
    res.status(200).send('Result confirmed');
  }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
});

app.post('/cancelPendingMatch', async (req, res) => {
  const { matchId } = req.body;
  const client = await pool.connect();
  try {
    await pool.query( 
      `DELETE from results
      WHERE match_id = $1`, [matchId]
    );
    res.status(200).send('Match cancelled');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
  }
);

app.post('/sendRematch', async (req, res) => {
  const { serverId, opponentPlayerId } = req.body;
  const client = await pool.connect();
  const status = 'PENDING'
  try {
    await pool.query( 
      `INSERT into MATCHES(challenger_id, recipient_id, server_id, status)
      VALUES($1, $2, $3, $4)`, [loggedInUserId, opponentPlayerId, serverId, status]
    );
    res.status(200).send('Challenge sent');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Internal server error');
  } finally {
    client.release();
  }
  res.end();
  }
);

app.get('/:page', (req, res) => {
  //Function to fetch html document, always keep on bottom of server.js!
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
