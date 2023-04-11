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

app.use(express.json());

// Handle POST requests to /register
app.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    await pool.query('SELECT insert_user($1, $2, $3)', [email, username, password]); // Call the insert_user function with the client
    res.sendStatus(200); 
  } catch (err) {
    console.error(err);
    res.sendStatus(500); 
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
