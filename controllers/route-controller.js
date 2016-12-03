angular.module('bacontracker')
    .controller('RouteController', ['$scope', '$location', '$log', '$http', '$cookies',
    function($scope, $location, $log, $http, $cookies) {
        $(function () {
            // Set the background
            $.backstretch("../assets/img/backgrounds/tablebw.jpg");

            // Check for cookie and redirect to signup if new user
            if(!$cookies.get("existingUser") && $location.path() === '/') {
                $location.path("/signup");
                $scope.$apply();
            }
            else if($cookies.get("existingUser")) {
                // Check if they are already logged in.
                $http.get("/api/currentUser")
                    .then(function success(response) {
                            // Set the background
                            $.backstretch("../assets/img/backgrounds/table.jpg");

                            // User is logged in, redirect to projects
                            $location.path("/projects");
                        }, function error(response) {

                        }
                    );
            }
        })

        $scope.redirect = function(location){
            $location.path(location);
        }

        $scope.login = function(){
            // Prepare payload
            var data = {
                'form-username': $("#form-username").val(),
                'form-password': $("#form-password").val()
            }

            // Forward with ajax
            $http.post("/api/login", data)
                .then(function success(response) {
                    // Set the background
                    $.backstretch("../assets/img/backgrounds/table.jpg");
                    // Change location to pojects
                    $location.path("/projects");
                }, function failure(response) {
                    // Login failed, notify the user
                    $(".login").notify(
                        "Username or Password is Incorrect", {
                            position: "right",
                            className: "error"
                        });
                    $log.error(response);
                });
        }

        $scope.signup = function(){
            // Prepare payload
            var data = {
                'form-username': $("#form-username").val(),
                'form-password': $("#form-password").val(),
                'form-password2': $("#form-password2").val()
            }

            // Ensure that passwords match.
            if(data['form-password'] != data['form-password2']){
                $("#form-password2").notify(
                    "Please make sure that your passwords match.", {
                        position: "right",
                        className: "error"
                    });
            }
            else {
                // Forward with ajax
                $http.post("/api/signup", data)
                    .then(function success(response) {
                        // Set the background
                        $.backstretch("../assets/img/backgrounds/table.jpg");
                        // Change location to pojects
                        $location.path("/projects");
                    }, function failure(response) {
                        if(response.status === 500){
                            // Duplicate username, notify user
                            $(".signup").notify(
                                "It appears that someone is already using a this username.\nPlease try a different one.", {
                                    position: "right",
                                    className: "error"
                                });
                        }
                        else {
                            $(".signup").notify(
                                "There was a problem making your user.", {
                                    position: "right",
                                    className: "error"
                                });
                        }

                        $log.error(response);
                    });
            }
        }
    }]);
