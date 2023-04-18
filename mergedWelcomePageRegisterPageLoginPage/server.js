const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const { Pool } = require('pg'); // Import the pg package
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
    res.sendStatus(500); 
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


