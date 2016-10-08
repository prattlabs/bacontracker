// Import the dependencies 
var express = require('express');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/issue.js');
var User = require('../models/project.js');
var User = require('../models/user.js');
var winston = require('winston');
var router = express.Router();

// Setup the login strategy
passport.use(new LocalStrategy(
    {
        usernameField: 'form-username',
        passwordField: 'form-password'
    },
    function(username, password, done) {
        User.find({username: username}, function(err, users){
            if (err){
                return done(err, false);
            }
            else if (!users || users.length !== 1 || !users[0].authenticate(password)) {
                return done(null, false, { message: 'Incorrect username or password'});
            }
            else {
                return done(null, users[0]);
            }
        });
    })
);

// Define how we get the session info
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

// Define how we save the session between requests
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

// Login Route
router.post('/login', passport.authenticate('local'), function(req, res) {
    winston.debug("Username", req.body["form-username"], "Password", req.body["form-password"]);
    res.redirect('/api/whoami'); // TODO: Redirect to the home page
});

// Signup Route
router.post('/signup', function(req, res) {

    // Ensure the data is correct
    if(req.body["form-password"] !== req.body["form-password2"] || !req.body["form-username"]){
        res.send(400, "Passwords must match");
    }

    winston.info("Creating new user: ", req.body["form-username"]);
    
    var usr = new User({
        username: req.body["form-username"],
        password: req.body["form-password"]
    });

    usr.save(function(err){
        if (err){
            res.send(500, err);
        }
        else {
            res.send(200)
        }
    })
});

router.get('/whoami', function(req, res) {
    res.send({ user: req.user });
});

router.get('/logout', function(req, res) {
    req.logout();
    res.send("logged out");
});

module.exports = router;
