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
    };

    this.getProject = function() {
        return this.project;
    }
});

app.controller('ProjectController', ['$scope','$http', '$location', 'ProjectService', '$log',
    function($scope, $http, $location, ProjectService, $log) {

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
}]);

app.controller('IssueController', ['$scope', '$http', '$log', 'ProjectService',
    function($scope, $http, $log, ProjectService) {

    $scope.form = {};

    $scope.log = function(message) {
        $log.debug(message);
    };

    $scope.project = ProjectService.getProject();

    $http.get("/api/issues?pname=" + $scope.project.name)
        .then(function success(response) {
            $scope.issues = response.data;
        }, function error(response) {
            $scope.issues = "error: " + response;
        }
    );

    $scope.setIssue = function(issue) {
        $scope.issue = issue;
    };

    $scope.saveIssue = function(issue) {
        // If a new issue, set it up properly.
        if (!issue.state) {
            issue.state = 0;
        }
        // Hide the edit issue dialog manually
        $('#editIssue').modal('hide');
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
                );
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
                        $scope.log($scope.response);
                    }, function error(response) {
                        $scope.response = "error: " + response;
                    }
                );
        }
    }

    $scope.createIssue = function() {
        $scope.issue = {};
    }

}]);
