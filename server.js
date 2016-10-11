// Import Dependencies
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var winston = require('winston');

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

// define model =================
var Issue = mongoose.model('Issue', {
    title : String,
    description : String
});

// define route for retrieving issues
app.get('/api/issues', function(req, res) {

    // use mongoose to get all issues in the database
    Issue.find(function(err, issues) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(issues); // return all issues in JSON format
    });
});

// create issue and send back all issues after creation
app.post('/api/issues', function(req, res) {

    // create a issue, information comes from AJAX request from Angular
    Issue.create({
        text : req.body.text,
        done : false
    }, function(err, issue) {
        if (err)
            res.send(err);

        // get and return all the issues after you create another
        Issue.find(function(err, issues) {
            if (err)
                res.send(err)
            res.json(issues);
        });
    });

});

// delete an issue
app.delete('/api/issues/:issue_id', function(req, res) {
    Issue.remove({
        _id : req.params.issue_id
    }, function(err, issue) {
        if (err)
            res.send(err);

        // get and return all the issues after you create another
        Issue.find(function(err, issues) {
            if (err)
                res.send(err)
            res.json(issues);
        });
    });
});