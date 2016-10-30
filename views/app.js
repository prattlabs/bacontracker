var myApp = angular.module('bacontracker', [])
    .controller('ProjectController', ['$scope', '$http', function($scope, $http) {
        $http.get("/api/projects")
            .then(function success(response) {
                $scope.projects = response.data;
            }, function error(response) {
                $scope.projects = "error";
            });
    }]);

