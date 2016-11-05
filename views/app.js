var app = angular.module('bacontracker', []);

app.controller('ProjectController', ['$scope', '$http', function($scope, $http) {
    $http.get("/api/projects")
        .then(function success(response) {
            $scope.myProjects = response.data.myProjects;
            $scope.collabProjects = response.data.collabProjects;
        }, function error(response) {
            $scope.projects = "error: " + response;
        }
    );
}]);

app.controller('IssueController', ['$scope', '$http', '$log', function($scope, $http, $log) {
    $scope.log = function(message) {
        $log.debug(message);
    };
    $http.get("/api/issues?pname=BaconTracker")
        .then(function success(response) {
            $scope.issues = response.data;
        }, function error(response) {
            $scope.issues = "error: " + response;
        }
    );
    $scope.setIssue = function(issue) {
        $scope.issue = issue;
    }
}]);
