const fs = require('fs');
const path = require('path');
const https = require('https')
const helmet = require('helmet')
const express = require('express');
const passport = require('passport')
const cookieSession = require('cookie-session')
const { Strategy } = require( 'passport-google-oauth20')

require('dotenv').config();

//////////////
// APP SETUP
//////////////
const PORT = 3000;

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET
};

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google profile', profile);
    done(null, profile);
}


passport.use(new Strategy(AUTH_OPTIONS, verifyCallback )); // que hacia???

//Save the user info to the session (the session that it was settled in our cookie) 
passport.serializeUser((user, done) => {
    done(null, user.id) // user have the profile info sent by google. 
})

//Reads the user info from the session  (the session that it was settled in our cookie)  (loading it from it)
passport.deserializeUser((id, done) => {
/*     User.findById(id).then(user => {
        done(null,user)
    }) */
    done(null, id)
})

// App Creation
const app = express();

//////////////
// MIDDLEWARE
//////////////

// Calling the Helmet middleware. It is important to call it before any of our routes

app.use(helmet());

//Saves the cookie to the browser
app.use(cookieSession({
    name:'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [ config.COOKIE_KEY_1, config.COOKIE_KEY_2 ] // the list of secret values
}));
app.use(passport.initialize());

// This is so Passport understand our cookie session, and the req.user object that is set by our
// cookieSession middleware. It authenticates the session that is being sent to our server.
// It uses the keys in cookieSessions to validate that everything is signed as it should be.
// and it sets the value in of the req.user to contain the user's identity. It does it by calling
// deserializeUser() which, in turn, sets req.user to use it in any of our express middleware.
app.use(passport.session())

// This is how it would look if we want to restrict access to all of our application.
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
    console.log('Current user is:', req.user)
    const isLoggedIn = req.isAuthenticated() && req.user; //req.isAuthenticated is a passport function that validates the google OAuth user.
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

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email'],
}));

//this is so google auth server has something to callback, to send the token to our app.

app.get('/auth/google/callback', 
    passport.authenticate('google', {
        failureRedirect: '/failure',
        successRedirect: '/',
        session: true,
    }), 
    (req, res) => {
      console.log('Google called us back!');// res.redirect() could be used here instead of using the passport methods above.
    }
);

app.get('/failure', (req, res) => {
    return res.send('Failed to log in!');
});

app.get('/auth/logout', (req, res ) => {
    req.logout(); // it will clear any logged in session and removes req.user
    return res.redirect('/')
})

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