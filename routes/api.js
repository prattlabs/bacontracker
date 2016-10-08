// Import the dependencies 
var passport = require('passport');
var winston = require('winston');
var HTTP = require('http-status-codes');
var router = require('express').Router();
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/issue.js');
var User = require('../models/project.js');
var User = require('../models/user.js');

// ********************
// Configure passportjs
// ********************

// Setup the passport authentication strategy and session serialization
passport.use(new LocalStrategy(
    {
        usernameField: 'form-username',
        passwordField: 'form-password'
    },
    function (username, password, done) {
        User.find({ username: username }, function (err, users) {
            if (err) {
                return done(err, false);
            }
            else if (!users || users.length !== 1 || !users[0].authenticate(password)) {
                return done(null, false);
            }
            else {
                return done(null, users[0]);
            }
        });
    })
);

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.find({ _id: id }, function (err, users) {
        if (err || users.length !== 1) {
            return done(err, false);
        }
        else {
            return done(null, users[0]);
        }
    });
});

// ***************
// Open the routes
// ***************

router.post('/login', login);
router.post('/signup', signup);
router.get('/whoami', whoami);
router.get('/logout', logout);

// ********************
// Define the functions
// ********************

/**
 * This function handles the final stages of the login process.
 * @param req The express request object
 * @param res The express response object
 */
function login(req, res) {
    winston.debug("Inside /api/login");

    // Perform the login. TODO: This is weird, may need to review this...
    passport.authenticate('local', function (err, user) {
        if (err) {
            handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
        }
        else if (!user) {
            handleError(new Error("Incorrect username or password"), HTTP.UNAUTHORIZED, res);
        }
        else {
            // Serialize the user to the cookie
            req.login(user, function (err) {
                if (err) {
                    handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                }

                winston.debug(user.username, "has just logged in.");

                var resData = {
                    username: user.username,
                    projects: user.projects,
                    colabProjects: user.colabProjects
                }

                sendResponse(resData, HTTP.OK, res);
            })
        }
    })(req, res);
};

/**
 * This function triggers a logout.
 * @param req The express request object
 * @param res The express response object
 */
function logout(req, res) {
    winston.debug("Inside /api/logout");
    req.logout();

    sendResponse(null, HTTP.OK, res)
}

/**
 * This function handles a user signup.
 * @param req The express request object
 * @param res The express response object
 */
function signup(req, res) {
    winston.debug("Inside /api/signup");

    // Ensure the data is correct
    if (req.body["form-password"] !== req.body["form-password2"] || !req.body["form-username"]) {
        handleError(new Error("Passwords do not match"), HTTP.BAD_REQUEST, res);
    }

    var user = new User({
        username: req.body["form-username"],
        password: req.body["form-password"]
    });

    // Save the new user
    user.save(function (err) {
        if (err) {
            handleError(err, 500, res);
        }
        else {
            winston.debug("User created", user.username);

            // Serialize the user to the cookie
            req.login(user, function (err) {
                if (err) {
                    handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                }

                winston.debug(user.username, "has just logged in.");
                var resData = {
                    username: user.username,
                    projects: user.projects,
                    colabProjects: user.colabProjects
                };

                sendResponse(resData, HTTP.OK, res)
            });
        }
    })
};

/**
 * This function returns the user's object to the UI.
 * @param req The express request object
 * @param res The express response object
 */
function whoami(req, res) {
    if (!req.user) {
        handleError(new Error("Request not sent by authenticated user"), HTTP.UNAUTHORIZED, res)
    }
    else {
        var resData = {
            username: req.user.username,
            projects: req.user.projects,
            colabProjects: req.user.colabProjects
        }

        sendResponse(resData, HTTP.OK, res)
    }
};

/**
 * This function is a helper for handling errors.
 * @param error The error to be handled
 * @param status The HTTP status to be sent
 * @param res The express response object
 */
function handleError(error, status, res) {
    switch (status) {
        case HTTP.BAD_REQUEST:
            winston.warn("Received a bad request:", error.message);
            break;
        case HTTP.UNAUTHORIZED:
            winston.warn("Unauthorized access attempted:", error.message);
            break;
        case HTTP.INTERNAL_SERVER_ERROR:
            winston.error("Something broke with the server:", error.message);
            break;
        default:
            winston.error("Something unexpected happened:", error.message);
    }

    sendResponse(null, status, res);
}

/**
 * This function is a helper for sending a JSON response.
 * @param data The data to be sent
 * @param status The HTTP status code to be sent
 * @param res The express response object
 */
function sendResponse(data, status, res) {
    winston.info("Sending response with data:", data);
    if (data) {
        res.status(status).send(data);
    }
    else {
        res.status(status).send(HTTP.getStatusText(status));
    }
}

module.exports = router;
