const path = require('path');

const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const TextSync = require('textsync-server-node');

// Load the enviromental variables into process.env
require("dotenv").config({ path: "variables.env" });

const app = express();
app.set('view engine', 'pug');

// Allow access from a different origin
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// We'll make use of sessions to keep track of logged in Users
app.use(session({
  secret: "--ENTER CUSTOM SESSION SECRET--",
  resave: false,
  saveUninitialized: false
}));

function loggedIn(req, res, next) {
  req.session.user ? next() : res.redirect("/login");
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
