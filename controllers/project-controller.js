angular.module('bacontracker')
    .controller('ProjectController', ['$scope', '$http', '$location', 'ProjectService', '$log',
        function ($scope, $http, $location, ProjectService, $log) {

            $scope.project = {};
            $scope.username = "";

            $scope.logout = ProjectService.logout;

            $scope.refreshProjects = function () {
                $http.get("/api/projects")
                    .then(function success(response) {
                        $scope.myProjects = response.data.myProjects;
                        $scope.collabProjects = response.data.collabProjects;
                    }, function error(response) {
                        $location.path("/login")
                        $scope.projects = "error: " + response;
                    }
                    );
            }
            $scope.refreshProjects();

            $scope.openPage = function (project, page) {
                ProjectService.setProject(project);
                // Go to "page" screen
                $location.path(page);
            }

            $scope.initProject = function () {
                $scope.project = {}
            }

            $scope.setProject = function (project) {
                $scope.project = project;
            }

            $scope.saveOldName = function (name) {
                // Save the original name of the project
                if (!$(oldname).text()) {
                    $(oldname).text(name);
                }
            }

            $scope.saveProject = function (pname) {
                pname = $('#oldname').text()
                console.log(pname)
                if (!pname) {
                    $("#edit").notify(
                        "Nothing to save!", {
                            position: "right",
                            className: "error"
                        });
                }
                else {
                    // Hide the edit project dialog manually
                    $('#editProject').modal('hide');
                    var url;
                    // If the project is not in the list of projects, add it.  Otherwise, update it.
                    if ($scope.myProjects.filter(function (project) { return project._id === $scope.project._id }).length === 0) {
                        $scope.myProjects.push($scope.project);

                        url = "/api/projects";
                        var data = {
                            "pname": $scope.project.name,
                            "pdescription": $scope.project.description
                        }
                        $http.post(url, data)
                            .then(function success(response) {
                                $scope.response = response.data;
                            }, function error(response) {
                                $scope.response = "error: " + response;
                            }
                            ).finally(function () {
                                $scope.refreshProjects();
                            });
                    } else {
                        url = "/api/projects";
                        url += "?pname=" + pname;
                        var data = {
                            "pname": $scope.project.name,
                            "pdescription": $scope.project.description
                        }
                        $http.put(url, data)
                            .then(function success(response) {
                                $scope.response = response.data;
                            }, function error(response) {
                                $scope.response = "error: " + response;
                                $("#create").notify(
                                    "The project " + $scope.project.name + " already exists, silly!", {
                                        position: "left",
                                        className: "error"
                                    });
                            }).finally(function () {
                                $scope.refreshProjects();
                            });
                    }
                }
            }

            $scope.deleteProject = function (project) {
                url = "/api/projects";
                url += "?pname=" + $scope.project.name;
                $http.delete(url)
                    .then(function success(response) {
                        $scope.response = response.data;
                        // Hide the edit issue dialog manually
                        $('#deleteProject').modal('hide');
                    }, function error(response) {
                        $scope.response = "error: " + response;
                    }
                    ).finally(function () {
                        $scope.refreshProjects();
                    });
            }

            $scope.addColab = function (project) {
                var colabName = $("#colabUsername").val()
                if (!colabName) {
                    $("#colabUsername").notify(
                        "Need to provide a username.", {
                            position: "bottom",
                            className: "error"
                        });
                }
                else {
                    var url = "/api/projects";
                    url += "?pname=" + $scope.project.name;
                    $http.put(url, { collaborator: colabName })
                        .then(function success(response) {
                            $("#colabUsername").notify(
                                "User has been added to the project.", {
                                    position: "bottom",
                                    className: "success"
                                });
                        }, function error(response) {
                            $("#colabUsername").notify(
                                "Could not find the user.", {
                                    position: "bottom",
                                    className: "error"
                                });
                        }
                        )
                }
            }

            $scope.init = function () {
                // Get the current user to put in the top of the page
                $http.get("/api/currentUser")
                    .then(function success(response) {
                        $scope.username = response.data.username;
                    }, function error(response) {
                        $location.path("/login")
                        $log.error("Couldn't retrieve username: " + response)
                    }
                    )
            }
            $scope.init();

        }]);
