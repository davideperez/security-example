const fs = require('fs');
const path = require('path');
const https = require('https')
const helmet = require('helmet')
const express = require('express');
const passport = require('passport')
const { Strategy } = require( 'passport-google-oauth20')

require('dotenv').config();

//////////////
// APP SETUP
//////////////
const PORT = 3000;

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
};

const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    client_id: config.CLIENT_ID,
    client_secret: config.CLIENT_SECRET
};

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google profile', profile);
    done(null, profile);
}

passport.use(new Strategy({AUTH_OPTIONS, verifyCallback }));

// App Creation
const app = express();

//////////////
// MIDDLEWARE
//////////////

// Calling the Helmet middleware. It is important to call it before any of our routes
////////////////////////////////////////////////////////////////////////////////////////

app.use(helmet())
app.use(passport.initialize());

// This is in case we want to restrict access to all of our application.
/* app.use((req, res, next) => {
    const isLoggedIn = true; //TODO
    if(!isLoggedIn) {
        return res.status(401).json({
            error: 'You must log in!'
        })
    }

    next();
})
 */

function checkLoggedIn (req, res, next) {
    const isLoggedIn = true; //TODO
    if(!isLoggedIn) {
        return res.status(401).json({
            error: 'You must log in!'
        })
    }
    next();
}

/////////////////////////
// Endpoints and Routes
/////////////////////////

app.get('/auth/google', (req, res ) => {})

//this is so google auth server has something to callback, to send the token to our app.

app.get('/auth/google/callback', (req, res ) => {})

app.get('/auth/logout', (req, res ) => {})

app.get('/secret', checkLoggedIn,(req, res) => { //in express you could add the amount of middleware you want on each endpoint/route
    return res.send('Your personal secret value is 42!')
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

///////////////////
// Server creation
///////////////////

// on terminal input the following:
// openssl req -x509 -newkey rsa:4096 -nodes -keyout -key.pem -out cert.pem -days 365  
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})