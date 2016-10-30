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
    }]);

