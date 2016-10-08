// Import Dependencies
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');

// Import routes
var api = require('./routes/api')

// Setup the server
var app = express();

// Setup the configuration
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'Dont Tell Anyone!!!',
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Forward all API calls
app.use('/api', api);

// Redirect root to the login page TODO: Determine which page to show.
app.get('/', function (req, res) {
    if (req.cookies["connect.sid"]) {
        res.redirect("/login.html");
    }
    else {
        res.redirect("/signup.html");
    }
})

// Serve the html and static content
app.use('/', express.static(__dirname + '/views'));
app.use('/assets', express.static(__dirname + '/assets'));

app.listen(8080);
console.log("App is running on port localhost:8080");