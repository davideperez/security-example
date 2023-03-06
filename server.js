const fs = require('fs');
const path = require('path');
const https = require('https')
const express = require('express');

const PORT = 3000;

const app = express();

app.get('/secret', (req, res) => {
    return res.send('Your personal secret value is 42!')
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

// on terminal input the following:
// openssl req -x509 -newkey rsa:4096 -nodes -keyout -key.pem -out cert.pem -days 365  
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})