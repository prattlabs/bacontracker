// Import the dependencies
var passport = require('passport');
var winston = require('winston');
var HTTP = require('http-status-codes');
var router = require('express').Router();
var LocalStrategy = require('passport-local').Strategy;
var Issue = require('../models/issue.js');
var Project = require('../models/project.js');
var User = require('../models/user.js');
var path = require('path');
var bcrypt = require('bcryptjs');

// *****************************************************************
// * Configure passportjs
// *****************************************************************

// Remove this middleware to start enforcing login requirements
// router.use((req, res, next) => {
//     console.log("Faking user as 'user1'");
//     User.find({ username: "user1" }, (err, users) => {
//         User.deepPopulate(users[0], "projects.issues colabProjects.issues", () => {
//             req.user = users[0];
//             next();
//         });
//     });
// });

// Setup the passport authentication strategy and session serialization
passport.use(new LocalStrategy(
    {
        usernameField: 'form-username',
        passwordField: 'form-password'
    },
    (username, password, done) => {
        User.find({ username: username }, (err, users) => {
            if (err) {
                done(err, false);
            }
            else if (!users || users.length !== 1) {
                done(null, false);
            }
            else {
                users[0].authenticate(password, (result) => {
                    if (result != true) {
                        done(null, false);
                    }
                    else {
                        // Populate the projects
                        var usr = users[0];
                        User.deepPopulate(usr, "projects.issues colabProjects.issues", () => {
                            if (err) {
                                done(err, false);
                            }
                            else {
                                done(null, usr);
                            }
                        });
                    }
                });
            }
        });
    })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.find({ _id: id }, (err, users) => {
        if (err || users.length !== 1) {
            return done(err, false);
        }
        else {
            // Populate the projects
            var usr = users[0];
            User.deepPopulate(usr, "projects.issues colabProjects.issues", () => {
                if (err) {
                    done(err, false);
                }
                else {
                    done(null, usr);
                }
            });
        }
    });
});

// *****************************************************************
// * Open the routes
// *****************************************************************

router.post('/login', (req, res) => {
    winston.debug("Inside /api/login");

    // Perform the login. TODO: This is weird, may need to review this...
    passport.authenticate('local', (err, user) => {
        if (err) {
            handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
        }
        else if (!user) {
            handleError(new Error("Incorrect username or password"), HTTP.UNAUTHORIZED, res);
        }
        else {
            // Serialize the user to the cookie
            req.login(user, (err) => {
                if (err) {
                    handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                }

                winston.debug(user.username, "has just logged in.");

                var resData = {
                    username: user.username
                }

                // Save the login cookie
                res.cookie("existingUser", "existingUser", { expires: new Date(4102444800000) }) // Expires Jan 1 2100

                sendResponse(resData, HTTP.OK, res);
            })
        }
    })(req, res);
});

router.get('/logout', (req, res) => {
    winston.debug("Inside /api/logout");
    req.logout();

    sendResponse(null, HTTP.OK, res);
});

router.post('/signup', (req, res) => {
    winston.debug("Inside /api/signup");

    // Ensure the data is correct
    if (req.body["form-password"] !== req.body["form-password2"] || !req.body["form-username"]) {
        handleError(new Error("Passwords do not match"), HTTP.BAD_REQUEST, res);
    }
    else {

        var user = new User({
            username: req.body["form-username"],
            password: req.body["form-password"]
        });

        bcrypt.hash(user.password, 8, (err, hash) => {
            if (err) {
                handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
            }
            else {
                user.password = hash;

                // Save the new user
                user.save((err) => {
                    if (err) {
                        handleError(err, 500, res);
                    }
                    else {
                        winston.debug("User created", user.username);

                        // Serialize the user to the cookie
                        req.login(user, (err) => {
                            if (err) {
                                handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                            }

                            winston.debug(user.username, "has just logged in.");

                            var resData = {
                                username: user.username
                            };

                            // Save the login cookie
                            res.cookie("existingUser", "existingUser", { expires: new Date(4102444800000) }) // Expires Jan 1 2100

                            sendResponse(resData, HTTP.OK, res);
                        });
                    }
                })
            }
        });
    }
});

router.get('/projects', (req, res) => {
    winston.debug("Inside GET /api/projects");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res);
    }
    else if (!req.query) {
        handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
    }
    else if (!req.query.pname) {
        var projects = {};
        projects.myProjects = req.user.projects;
        projects.collabProjects = req.user.colabProjects;
        sendResponse(projects, HTTP.OK, res);
    }
    else {
        // Find the project
        var reqProj = findAssociatedProject(req.user, req.query.pname);

        if (reqProj) {
            sendResponse(reqProj, HTTP.OK, res);
        }
        else {
            sendResponse(null, HTTP.NOT_FOUND, res);
        }
    }
});

router.post('/projects', (req, res) => {
    winston.debug("Inside POST /api/projects");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res);
    }
    else if (!req.body || !req.body.pname || !req.body.pdescription) {
        handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
    }
    else {
        // Make new project
        var newProj = new Project({
            name: req.body.pname,
            description: req.body.pdescription,
            issues: []
        });

        // Save new project
        newProj.save((err) => {
            if (err) {
                handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
            }
            else {
                // Save the new project to the user
                req.user.projects.push(newProj);
                req.user.save((err) => {
                    if (err) {
                        handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                    }
                    else {

                        // Send success
                        sendResponse(newProj, HTTP.OK, res);
                    }
                });
            }
        });
    }
});

router.put('/projects', (req, res) => {
    winston.debug("Inside PUT /api/projects");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res);
    }
    else if (!req.query || !req.query.pname || !req.body) {
        handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
    }
    else {
        // Check if the project is on the user's object
        var reqProj = findOwnedProject(req.user, req.query.pname)
        if (!reqProj) {
            handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
        }
        else {
            reqProj.name = req.body.pname ? req.body.pname : reqProj.name;
            reqProj.description = req.body.pdescription ? req.body.pdescription : reqProj.description;
            if (!req.body.collaborator) {
                // If no collaborators were added, just save the project an move on.
                reqProj.save((err) => {
                    if (err) {
                        handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                    }
                    else {
                        sendResponse(reqProj, HTTP.OK, res);
                    }
                });
            }
            else {
                // If a collaborator was added, find the collaborator before saving
                User.findOne({ username: req.body.collaborator }, (err, user) => {
                    if (err) {
                        handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                    }
                    else if (!user) {
                        handleError(new Error("No user found for username: " + req.body.collaborator), HTTP.BAD_REQUEST, res);
                    }
                    else if(user.colabProjects.includes(reqProj._id)){                                sendResponse(reqProj, HTTP.OK, res);
                        sendResponse(reqProj, HTTP.OK, res);
                    }
                    else {
                        user.colabProjects.push(reqProj);
                        user.save();
                        reqProj.save((err) => {
                            if (err) {
                                handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                            }
                            else {
                                sendResponse(reqProj, HTTP.OK, res);
                            }
                        });
                    }
                });
            }
        }
    }
});

router.delete('/projects', (req, res) => {
    winston.debug("Inside DELETE /api/projects");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res);
    }
    else if (!req.query || !req.query.pname) {
        handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
    }
    else {
        // Check if the project is on the user's object
        var reqProj = findOwnedProject(req.user, req.query.pname)
        if (!reqProj) {
            handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
        }
        else {
            // Delete the project from all users
            User.find({ $or: [{ colabProjects: reqProj }, { projects: reqProj }] }, (err, users) => {
                if (err) {
                    handleError(new Error("Database read error"), HTTP.INTERNAL_SERVER_ERROR, res);
                }
                users.forEach((usr) => {
                    usr.projects.splice(req.user.projects.indexOf(reqProj), 1);
                    usr.colabProjects.splice(req.user.projects.indexOf(reqProj), 1);
                    usr.save();
                });

                // Delete all issues
                reqProj.issues.forEach((iss) => {
                    iss.remove();
                })

                // Delete the project
                reqProj.remove();

                // Send success
                sendResponse(reqProj, HTTP.OK, res);
            });
        }
    }
});

router.get('/issues', (req, res) => {
    winston.debug("Inside GET /api/issues");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res);
    }
    else if (!req.query || !req.query.pname) {
        handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
    }
    else if (!req.query.inum) {
        // Find the project
        var project = findAssociatedProject(req.user, req.query.pname);
        sendResponse(project.issues, HTTP.OK, res);
    }
    else {
        // Find the project
        var reqProj = findAssociatedProject(req.user, req.query.pname);
        if (!reqProj) {
            sendResponse(null, HTTP.NOT_FOUND, res);
        }
        else {
            // Find the issue in the project
            var issue = findIssue(reqProj, req.query.inum);
            if (issue) {
                sendResponse(issue, HTTP.OK, res);
            }
            else {
                sendResponse(null, HTTP.NOT_FOUND, res);
            }
        }
    }
});

router.post('/issues', (req, res) => {
    winston.debug("Inside POST /api/issues");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res);
    }
    else if (!req.query || !req.query.pname || !req.query.ititle || !req.query.idescription) {
        handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
    }
    else {
        // Find the project
        var reqProj = findAssociatedProject(req.user, req.query.pname);
        if (!reqProj) {
            handleError(new Error("Could not find the project to make the issue"), HTTP.BAD_REQUEST, res);
        }
        else {

            // Project found, create an issue.
            var newIssue = new Issue({
                title: req.query.ititle,
                description: req.query.idescription,
                number: reqProj._nextinum
            });

            // Save new issue
            newIssue.save((err) => {
                if (err) {
                    handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                }
                else {
                    // Save the new issue to the project
                    reqProj.issues.push(newIssue);
                    reqProj._nextinum++;
                    reqProj.save((err) => {
                        if (err) {
                            handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                        }
                        else {
                            // Send success
                            sendResponse(newIssue, HTTP.OK, res);
                        }
                    });
                }
            });
        }
    }
});

router.put('/issues', (req, res) => {
    winston.debug("Inside PUT /api/issues");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res);
    }
    else if (!req.query || !req.query.pname || !req.query.inum || !req.body) {
        handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
    }
    else {
        // Find the project
        var reqProj = findAssociatedProject(req.user, req.query.pname);
        if (!reqProj) {
            sendResponse(null, HTTP.NOT_FOUND, res);
        }
        else {
            // Find the issue in the project
            var issue = findIssue(reqProj, req.query.inum);

            // If we found the issue, update it.
            if (!issue) {
                sendResponse(null, HTTP.NOT_FOUND, res);
            }
            else {
                winston.debug(req.query)
                // Update the issue
                if (!issue.title || issue.title != req.query.ititle) {
                    issue.title = req.query.ititle;
                }
                if (!issue.description || issue.description != req.query.idescription) {
                    issue.description = req.query.idescription;
                }
                if (!issue.state || issue.state != req.query.istate) {
                    issue.state = req.query.istate;
                }
                if (issue.assignee != req.query.iassignee || !issue.assignee) {
                    issue.assignee = req.query.iassignee;
                }

                issue.save((err) => {
                    if (err) {
                        handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                    }
                    else {
                        sendResponse(issue, HTTP.OK, res);
                    }
                });
            }
        }
    }
});

router.delete('/issues', (req, res) => {
    winston.debug("Inside DELETE /api/issues");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res);
    }
    else if (!req.query || !req.query.pname || !req.query.inum) {
        handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
    }
    else {
        // Find the project
        var reqProj = findAssociatedProject(req.user, req.query.pname);
        if (!reqProj) {
            sendResponse(null, HTTP.NOT_FOUND, res);
        }
        else {
            // Find the issue in the project
            var issue = findIssue(reqProj, req.query.inum);

            // If we found the issue, update it.
            if (!issue) {
                sendResponse(null, HTTP.NOT_FOUND, res);
            }
            else {
                // Delete the issue
                issue.remove()

                sendResponse(issue, HTTP.OK, res);
            }
        }
    }
});

router.put('/issues/updateOrder', (req, res) => {
    winston.debug("Inside put /api/issues/updateOrder");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res);
    }
    else if (!req.query || !req.query.pname || !req.body || !req.body.state) {
        handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
    }
    else {
        // Find the project
        var reqProj = findAssociatedProject(req.user, req.query.pname);
        if (!reqProj) {
            sendResponse(null, HTTP.NOT_FOUND, res);
        }
        else if (!req.body.issueOrder) {
            winston.debug("No order to update");
            sendResponse(null, HTTP.OK, res);
        }
        else {
            // Convert to a real state
            var state;
            switch (req.body.state) {
                case "issueState_0":
                    state = 0;
                    break;
                case "issueState_1":
                    state = 1;
                    break;
                case "issueState_2":
                    state = 2;
                    break;
            }

            // Generate the new order
            var oldOrder = reqProj.issues;
            var newOrder = [];
            for (var cnt1 = 0; cnt1 < req.body.issueOrder.length; cnt1++) {
                for (var cnt2 = 0; cnt2 < oldOrder.length; cnt2++) {
                    if (req.body.issueOrder[cnt1] == oldOrder[cnt2]._id) {
                        // Update the issue to have the new state
                        oldOrder[cnt2].state = state;
                        oldOrder[cnt2].save();

                        // Save the order
                        newOrder.push(oldOrder[cnt2]);
                        oldOrder.splice(cnt2, 1);
                        break;
                    }
                }
            }

            // Add any remaining issues
            reqProj.issues = newOrder.concat(oldOrder);

            // Save the project
            reqProj.save((err) => {
                if (err) {
                    handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
                }
                else {
                    // Send success
                    sendResponse(reqProj, HTTP.OK, res);
                }
            });
        }
    }
});

router.get('/currentUser', (req, res) => {
    winston.debug("Inside GET /api/currentUser");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res)
    }
    else {
        var resData = {
            username: req.user.username
        }

        sendResponse(resData, HTTP.OK, res)
    }
});

router.put('/currentUser', (req, res) => {
    winston.debug("Inside GET /api/currentUser");

    if (!req.user) {
        handleError(new Error("User unauthenticated"), HTTP.UNAUTHORIZED, res)
    }
    else if (!req.body) {
        handleError(new Error("Bad request"), HTTP.BAD_REQUEST, res);
    }
    else {

        user.username = req.body.uname ? req.body.uname : user.username;

        user.save((err) => {
            if (err) {
                handleError(err, HTTP.INTERNAL_SERVER_ERROR, res);
            }
            else {
                sendResponse(resData, HTTP.OK, res);
            }
        })
    }
});

// *****************************************************************
// * Define helper functions
// *****************************************************************

/**
 * This function checks only a user's projects array to find the specified project.
 * @param user The mongoose user model to be searched
 * @param pname The name of the project
 * @returns The requested project if found, null otherwise
 */
function findOwnedProject(user, pname) {
    // Check if the user owns the project
    var reqProj = user.projects.find((project) => {
        return project.name === pname;
    });
    return reqProj;
}

/**
 * This function checks both a user's projects array and colabProjects array to find
 * the specified project.
 * @param user The mongoose user model to be searched
 * @param pname The name of the project
 * @returns The requested project if found, null otherwise
 */
function findAssociatedProject(user, pname) {
    // Check if the user owns the project
    var reqProj = findOwnedProject(user, pname);

    // If not found, check if it's a colab project
    if (!reqProj) {
        reqProj = user.colabProjects.find((project) => {
            return project.name === pname;
        });
    }

    return reqProj;
}

/**
 * This function searches for an issue in a project.
 * @param proj The mongoose project model to be searched
 * @param inum The issue number
 * @returns The requested issue if found, null otherwise
 */
function findIssue(proj, inum) {
    // Find the issue in the project
    var reqIssue = proj.issues.find((issue) => {
        return issue.number == inum;
    });

    return reqIssue;
}

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
};

/**
 * This function is a helper for sending a JSON response.
 * @param data The data to be sent
 * @param status The HTTP status code to be sent
 * @param res The express response object
 */
function sendResponse(data, status, res) {
    winston.info("Sending response with status:", status);
    if (data) {
        res.status(status).send(data);
    }
    else {
        res.status(status).send(HTTP.getStatusText(status));
    }
};

module.exports = router;
