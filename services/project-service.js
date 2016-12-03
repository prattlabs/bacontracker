angular.module('bacontracker')
    .service('ProjectService', function ($http, $log, $location) {
    var project;

    this.setProject = function(project) {
        this.project = project;
    }
    this.getProject = function() {
        return this.project;
    }

    this.logout = function () {
        $http.get("/api/logout")
            .then(function success() {
                $location.path("/");
            }, function failure() {
                $log.error("Failed to log out")
            });
    }
});