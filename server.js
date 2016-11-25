// Import Dependencies
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var winston = require('winston');
var path = require('path');

// Overwrite mongoose promise library
mongoose.Promise = global.Promise;

// Set the logging level
winston.level = "debug";

// Import routes
var api = require('./routes/api');

// Setup the server
var app = express();

// Setup the configuration
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: '97e5303d0194c1855ff5a508b3fbb7d4',
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Forward all API calls
app.use('/api', api);

// Redirect root to the login page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'index.html'))
    // if (req.cookies["connect.sid"]) {
    //     res.redirect("/login.html");
    // }
    // else {
    //     res.redirect("/signup.html");
    // }
});

// Serve the html and static content
app.use('/', express.static(__dirname + '/views'));
app.use('/assets', express.static(__dirname + '/assets'));
app.get('*', function(req, res) {
    res.redirect("/");
});

// Connect to the database
mongoose.connect('mongodb://app:bacon@ds023435.mlab.com:23435/bacon-tracker', function (err) {
    if (err) {
        winston.error("Cannot connect to the mongo database ", err);
        process.exit(1)
    }
    else {
        app.listen(8080);
        winston.info("App is running on port localhost:8080");
    }
});

// Handle shutdown
process.on('SIGINT', function() {
  process.exit();
});