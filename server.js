const path = require('path');

const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const TextSync = require('textsync-server-node');

// Load the enviromental variables into process.env
require('dotenv').config({ path: 'variables.env' });

const app = express();
app.set('view engine', 'pug');

// Allow access from a different origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// We'll make use of sessions to keep track of logged in Users
app.use(session({
  secret: '--ENTER CUSTOM SESSION SECRET--',
  resave: false,
  saveUninitialized: false
}));

function loggedIn(req, res, next) {
  req.session.user ? next() : res.redirect('/login');
}

app.get('/', loggedIn, (req, res) => {
  res.render('index', {user: req.session.user})
});

app.post('/note', loggedIn, (req, res) => {
  const slug = req.body.slug;
  res.redirect(`/note/${slug}`);
});

app.get('/note/:slug', loggedIn, (req, res) => {
  res.render('editor', {user: req.session.user})
});

const textSync = new TextSync({
  instanceLocator: process.env.INSTANCE_LOCATOR,
  key: process.env.KEY
});

app.post('/textsync/tokens', (req, res) => {
  // certain users can be restricted to either READ or WRITE access on the document
  // to keep this demo simple, all users are granted READ and WRITE access to the document
  const permissionsFn = () => {
    return Promise.resolve([
      TextSync.Permissions.READ,
      TextSync.Permissions.WRITE
    ]);
  };

  // set authentication token to expire in 20 minutes
  const options = { tokenExpiry: 60 * 20 };

  textSync.authorizeDocument(req.body, permissionsFn, options)
    .then(token => {
      res.json(token);
    });
});

// this middleware is required to initialize passport
app.use(passport.initialize());

// as you use sessions in your server this middleware is required
app.use(passport.session());

// middleware that serializes the user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// middleware that deserializes user's info
passport.deserializeUser((user, done) => {
  done(null, user);
});

// passport middleware that initializes the Auth0 strategy
passport.use(new Auth0Strategy({
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {
// profile contains the information of the user
  return done(null, profile);
}));

app.get('/login', passport.authenticate('auth0', {
  //The scope parameter determines the user information the server sends
  scope: 'openid profile',
}));

app.get('/callback', passport.authenticate('auth0'), (req, res) => {
  req.session.user = req.user;
  res.redirect('/');
});

//Listen to connections on port 3000
app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening on port 3000.");
});
