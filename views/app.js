var app = angular.module('bacontracker', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "projects.html",
            controller : 'ProjectController'
        })
        .when("/projects", {
            templateUrl : "projects.html",
            controller : 'ProjectController'
        })
        .when("/issues", {
            templateUrl : "issues.html",
            controller: "IssueController"
        })
        .otherwise({
            templateUrl: "projects.html",
            controller : 'ProjectController'
        });
        // use the HTML5 History API
        $locationProvider.html5Mode(true);
});

app.service('ProjectService', function () {
    var project;

    this.setProject = function(project) {
        this.project = project;
    }
    this.getProject = function() {
        return this.project;
    }
});

app.controller('ProjectController', ['$scope','$http', '$location', 'ProjectService', '$log',
    function($scope, $http, $location, ProjectService, $log) {

    $scope.username = "";

    $http.get("/api/projects")
        .then(function success(response) {
            $scope.myProjects = response.data.myProjects;
            $scope.collabProjects = response.data.collabProjects;
        }, function error(response) {
            $scope.projects = "error: " + response;
        }
    );

    $scope.openPage = function (project, page) {
        ProjectService.setProject(project);
        // Go to "page" screen
        $location.path(page);
    }

    $scope.init = function() {
        $http.get("/api/currentUser")
            .then(function success(response) {
                    $scope.username = response.data.username;
                }, function error(response) {
                    $log.error("Couldn't retrieve username: " + response)
                }
            )
    }
    $scope.init();

}]);

app.controller('IssueController', ['$scope', '$http', '$log', '$timeout', 'ProjectService',
    function($scope, $http, $log, $timeout, ProjectService) {

    $scope.log = function(message) {
        $log.debug(message);
    };

    $scope.deleteClicks = 0;
    $scope.deleteTimer = setInterval(function () {
        if ($scope.deleteClicks > 0) {
            $scope.deleteClicks = 0;
        }
    }, 5000)

    $scope.project = ProjectService.getProject();

    $scope.refreshIssues = function() {
        $scope.issues = [];
        $http.get("/api/issues?pname=" + $scope.project.name)
            .then(function success(response) {
                    $scope.issues = response.data;
                }, function error(response) {
                    $scope.issues = "error: " + response;
                }
            );
    }
    $scope.refreshIssues();

    $scope.setIssue = function(issue) {
        $scope.issue = issue;
    };

    $scope.saveIssue = function(issue) {
        // Hide the edit issue dialog manually
        $('#editIssue').modal('hide');
        // If a new issue, set it up properly.
        if (!issue.state) {
            issue.state = 0;
        }
        var url;
        // If the issue is not in the list of issues, add it.  Otherwise, update it.
        if ($scope.issues.filter(function(issue){return issue.number===$scope.issue.number}).length===0) {
            $scope.issues.push($scope.issue);

            url = "/api/issues";
            url += "?pname=" + $scope.project.name;
            url += "&ititle=" + issue.title;
            url += "&idescription=" + issue.description;
            url += "&istate=" + issue.state;
            url += "&iassignee=" + issue.assignee;

            $http.post(url)
                .then(function success(response) {
                        $scope.response = response.data;
                    }, function error(response) {
                        $scope.response = "error: " + response;
                    }
                ).finally(function () {
                    $scope.refreshIssues();
                });
        } else {
            url = "/api/issues";
            url += "?pname=" + $scope.project.name;
            url += "&inum=" + issue.number;
            url += "&ititle=" + issue.title;
            url += "&idescription=" + issue.description;
            url += "&istate=" + issue.state;
            url += "&iassignee=" + issue.assignee;

            $http.put(url)
                .then(function success(response) {
                        $scope.response = response.data;
                    }, function error(response) {
                        $scope.response = "error: " + response;
                    }
                ).finally(function () {
                $scope.refreshIssues();
            });
        }
    }

    $scope.createIssue = function() {
        $scope.issue = {};
        $scope.refreshIssues();
        // Hide the delete notification is case it is still hanging around
        $(".delete-btn").trigger('notify-hide');
    }

    $scope.deleteIssue = function (issue) {
        if ($scope.deleteClicks < 2) {
            $scope.deleteClicks++;
            var remainingClicks = 3 - $scope.deleteClicks;
            $(".delete-btn").notify(
                "Press " + remainingClicks + " more times quickly to delete", {
                    position: "bottom",
                    className: "error"
                });
        } else {
            url = "/api/issues";
            url += "?pname=" + $scope.project.name;
            url += "&inum=" + issue.number;
            $http.delete(url)
                .then(function success(response) {
                        $scope.response = response.data;
                        // Hide the edit issue dialog manually
                        $('#editIssue').modal('hide');
                    }, function error(response) {
                        $scope.response = "error: " + response;
                    }
                ).finally(function () {
                $scope.refreshIssues();
            });;
        }
    }


    $scope.selectClass = function(issue) {
        if (issue) {
            if (issue.state == 0) {
                return 'tag-danger';
            } else if (issue.state == 1) {
                return 'tag-warning';
            } else if (issue.state == 2) {
                return 'tag-success';
            }
        }
    }

    $scope.init = function() {
        $(function () {
            $('[data-toggle="popover"]').popover();
            $(".portlet")
                .addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
                .find(".portlet-header")
                .addClass("ui-widget-header ui-corner-all")
                .prepend("<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>");

            $(".portlet-toggle").on("click", function() {
                var icon = $(this);
                icon.toggleClass("ui-icon-minusthick ui-icon-plusthick");
                icon.closest(".portlet").find(".portlet-content").toggle();
            });
            $(".column").sortable({
                items: '.issue',
                connectWith: ".column",
                handle: ".draggable",
                cancel: ".portlet-toggle",
                placeholder: "portlet-placeholder ui-corner-all",
                update: function (event, ui) {
                    var data = $(this).sortable('serialize');
                    data = "state=" + $(this).attr('id') + "&" + data;

                    $.ajax({
                        data: data,
                        type: 'PUT',
                        url: 'api/issues/updateOrder?pname=' + $('#pname').text(),
                        complete: function () {
                            $scope.refreshIssues();
                        }
                    })
                }
            })
            $("#editclear").click(function() {
                $("#editinput").val('');
            });
        });
    }
    $scope.init();

}]);
