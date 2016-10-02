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
app.use(bodyParser());
app.use(session({ secret: 'Dont Tell Anyone!!!'}));
app.use(passport.initialize());
app.use(passport.session());

// Forward all API calls
app.use('/api', api);

// Serve the html and static content
app.use('/', express.static(__dirname + '/views'));
app.use('/assets', express.static(__dirname + '/assets'));

app.listen(8080);