var myApp = angular.module('bacontracker', [])
    .controller('ProjectController', ['$scope', '$http', function($scope, $http) {
        $scope.myProjects = [
            {
                name: 'TowneScope',
                description: 'Market Your Towne!',
            },
            {
                name: 'eGenuity Installer',
                description: 'Installer for eGenuity.',
            },
            {
                name: 'TowneScope',
                description: 'Market Your Towne!',
            },
            {
                name: 'eGenuity Installer',
                description: 'Installer for eGenuity.',
            },
            {
                name: 'TowneScope',
                description: 'Market Your Towne!',
            },
            {
                name: 'eGenuity Installer',
                description: 'Installer for eGenuity.',
            }
        ];
        $scope.collabProjects = [
            {
                name: 'TowneScope',
                description: 'Market Your Towne!',
            },
            {
                name: 'eGenuity Installer',
                description: 'Installer for eGenuity.',
            },
            {
                name: 'TowneScope',
                description: 'Market Your Towne!',
            },
            {
                name: 'eGenuity Installer',
                description: 'Installer for eGenuity.',
            },
            {
                name: 'TowneScope',
                description: 'Market Your Towne!',
            },
            {
                name: 'eGenuity Installer',
                description: 'Installer for eGenuity.',
            }
        ];
        // $http.get("/api/projects")
        //     .then(function success(response) {
        //         $scope.myProjects = response.data.myProjects;
        //         $scope.collabProjects = response.data.collabProjects;
        //     }, function error(response) {
        //         $scope.projects = "error";
        //     }
        // );
    }])
    .controller('IssueController', ['$scope', '$http', function($scope, $http) {
        $scope.issues = [
            {
                "title": "Issue Title",
                "description": "\<the issue description\>",
                "number": "\<the issue number within the project\>",
                "state": "\<enumerator for resolved, open, closed, etc\>",
                "assignee": "\<the username of the assignee\>"
            },
            {
                "title": "Issue Title2",
                "description": "\<the issue description\>",
                "number": "\<the issue number within the project\>",
                "state": "\<enumerator for resolved, open, closed, etc\>",
                "assignee": "\<the username of the assignee\>"
            },
            {
                "title": "Issue Title3",
                "description": "\<the issue description\>",
                "number": "\<the issue number within the project\>",
                "state": "\<enumerator for resolved, open, closed, etc\>",
                "assignee": "\<the username of the assignee\>"
            },
            {
                "title": "Issue Title4",
                "description": "\<the issue description\>",
                "number": "\<the issue number within the project\>",
                "state": "\<enumerator for resolved, open, closed, etc\>",
                "assignee": "\<the username of the assignee\>"
            },
            {
                "title": "Issue Title5",
                "description": "\<the issue description\>",
                "number": "\<the issue number within the project\>",
                "state": "\<enumerator for resolved, open, closed, etc\>",
                "assignee": "\<the username of the assignee\>"
            },
            {
                "title": "Issue Title6",
                "description": "\<the issue description\>",
                "number": "\<the issue number within the project\>",
                "state": "\<enumerator for resolved, open, closed, etc\>",
                "assignee": "\<the username of the assignee\>"
            },
        ];
        // $http.get("/api/issues")
        //     .then(function success(response) {
        //         $scope.issues = response.data;
        //     }, function error(response) {
        //         $scope.issues = "error";
        //     }
        // );
}]);

