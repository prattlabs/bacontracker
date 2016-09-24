// Import the dependencies 
var express = require('express');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./user.js');

// Setup the app
var app = express();

// Setup the configuration
app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: 'Dont Tell Anyone!!!'}));
app.use(passport.initialize());
app.use(passport.session());

// The login strategy
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        User.find({email: email}, function(err, users){
            if (err){
                return done(err, false);
            }
            else if (!users || users.length !== 1 || !users[0].authenticate(password)) {
                return done(null, false, { message: 'Incorrect email or password'});
            }
            else {
                return done(null, users[0]);
            }
        });
    })
);

// How we get the session info
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

// How we save the session between requests
passport.deserializeUser(function(id, done) {
    User.find({_id: id}, function(err, users){
        if (err || users.length !== 1){
            return done(err, false);
        }
        else {
            return done(null, users[0]);
        }
    });
});

// Test Routes
app.get('/', function(req, res, next) {
  res.send('<form method="post" action="/login" role="form"><input type="text" name="email"/><input type="password" name="password"/><button type="submit">Login</button></form>');
});

app.post('/login', passport.authenticate('local'), function(req, res, next) {
    console.log("Email", req.body.email, "Password", req.body.password);
    res.redirect('/whoami');
});

app.get('/whoami', function(req, res, next) {
    res.send({ user: req.user });
});

app.get('/logout', function(req, res, next) {
    req.logout();
    res.send("logged out");
});

app.listen(8080);