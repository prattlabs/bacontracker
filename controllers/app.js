var app = angular.module('bacontracker', ['ngRoute', 'ngCookies']);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "login.html",
            controller : 'RouteController'
        })
        .when("/projects", {
            templateUrl : "projects.html",
            controller : 'ProjectController'
        })
        .when("/issues", {
            templateUrl : "issues.html",
            controller: "IssueController"
        })
        .when("/login", {
            templateUrl : "login.html",
            controller: "RouteController"
        })
        .when("/signup", {
            templateUrl : "signup.html",
            controller: "RouteController"
        })
        .otherwise({
            // templateUrl: "projects.html",
            // controller : 'ProjectController'
            templateUrl : "login.html",
            controller : 'RouteController'
        });
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
});