/**
 * Created by BharathKumar on 12/3/2016.
 */
var mainRouter = angular.module('mainRouter', [ 'ngRoute' ]);

mainRouter.config([ '$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'login.html',
        controller: 'loginCtrl'
    }).when('/register',{
        templateUrl: 'register.html',
        controller: 'containerCtrl'
    }).when('/home',{
        templateUrl: 'home.html',
        controller: 'containerCtrl'
    }).when('/manageCluster',{
        templateUrl: 'manageClusters.html',
        controller: 'manageClusterController'
    }).when('/createClusters',{
        templateUrl: 'createCluster.html',
        controller: 'createClusterController'
    }).when('/manageContainer',{
        templateUrl: 'manageContainers.html',
        controller: 'manageContainerController'
    }).when('/createContainer',{
        templateUrl: 'createContainer.html',
        controller: 'createContainerController'
    }).when('/monitorContainer',{
        templateUrl: 'viewUsage.html',
        controller: 'viewUsageController'
    }).when('/createImage',{
        templateUrl: 'createImage.html',
        controller: 'imageController'
    }).otherwise({
        redirectTo : '/'
    });
}
]);

mainRouter.controller('containerCtrl', function($scope, $http){
});

mainRouter.controller('manageClusterController', function($scope,$http){
    $http({
        method: 'POST',
        url: 'http://localhost:3000/cluster/getClusters',
        data: {},
        headers: {'Content-Type': 'application/json'}
    }).success(function (data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available
        $scope.clusters = data.ClusterList;
    }).error(function (data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
    /* TODO
     /*For each cluster check the status {{c.status}} attribute in ng-if and set the right icons*/

    $scope.editCluster = function (status, clusterName) {
        if (status == 'start') {
            /*TODO: http request to server*/
            $http({
                method: 'POST',
                url: 'http://localhost:3000/cluster/startCluster',
                data: {"ClusterName" : clusterName},
                headers: {'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                if(status=='200'){
                    $http({
                        method: 'POST',
                        url: 'http://localhost:3000/cluster/getClusters',
                        data: {},
                        headers: {'Content-Type': 'application/json'}
                    }).success(function (data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.clusters = data.ClusterList;
                    }).error(function (data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
                }
            }).error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        } else if (status == 'stop') {
            /*TODO: http request to server*/
            $http({
                method: 'POST',
                url: 'http://localhost:3000/cluster/stopCluster',
                data: {"ClusterName" : clusterName},
                headers: {'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                if(status=='200'){
                    $http({
                        method: 'POST',
                        url: 'http://localhost:3000/cluster/getClusters',
                        data: {},
                        headers: {'Content-Type': 'application/json'}
                    }).success(function (data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.clusters = data.ClusterList;
                    }).error(function (data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
                }
            }).error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        } else if (status == 'delete') {
            /*TODO: http request to server*/
            $http({
                method: 'POST',
                url: 'http://localhost:3000/cluster/deleteCluster',
                data: {"ClusterName" : clusterName},
                headers: {'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                if(status=='200'){
                    $http({
                        method: 'POST',
                        url: 'http://localhost:3000/cluster/getClusters',
                        data: {},
                        headers: {'Content-Type': 'application/json'}
                    }).success(function (data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.clusters = data.ClusterList;
                    }).error(function (data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
                }
            }).error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        } else if (status == 'restart') {
            /*TODO: http request to server*/
            $http({
                method: 'POST',
                url: 'http://localhost:3000/cluster/restartCluster',
                data: {"ClusterName" : clusterName},
                headers: {'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                if(status=='200'){
                    $http({
                        method: 'POST',
                        url: 'http://localhost:3000/cluster/getClusters',
                        data: {},
                        headers: {'Content-Type': 'application/json'}
                    }).success(function (data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.clusters = data.ClusterList;
                    }).error(function (data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
                }
            }).error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        }
    };
});

mainRouter.controller('createClusterController', function($scope,$http){
    $scope.countMap = {};
    $scope.nameMap = {};
    $scope.spinnerIcon = {'visibility': 'hidden'};

    function ContainerInfo(imageName, count, name) {
        this.ImageName = imageName;
        this.Count = count;
        this.ClusterName = name;
    }

    // get images
    $http({
        method: 'POST',
        url: 'http://localhost:3000/cluster/listImages',
        data: {},   // TODO: FIX ME
        headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available
        //console.log(response.data.ImageList);
        $scope.images = data.ImageList;
    }).
    error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });

    // add container counts
    $scope.numberChanged = function (imageName, count) {
        console.log(imageName + "--- " + count);
        if (count == 0 ) {
            // remove from the map
            delete $scope.countMap[imageName];
        } else {
            // add or modify the map
            $scope.countMap[imageName] = count;
        }
    }

    // store container names
    $scope.containerNameChanged = function (imageName, cName) {
        // add or modify the map
        console.log(imageName + "**** " + cName);
        $scope.nameMap[imageName] = cName;
    }

    // TODO: create the json array from the selectionMap and send it to server
    $scope.createCluster = function() {
        var containerInfoJSONArray= [];
        for (var key in $scope.countMap) {
            var contName= "noname";
            var contNum= 0;
            if ($scope.countMap.hasOwnProperty(key)) {
                console.log(key + " -> " + $scope.countMap[key]);
                contNum = $scope.countMap[key];
            }

            if ($scope.nameMap.hasOwnProperty(key)) {
                console.log(key + " -> " + $scope.nameMap[key]);
                contName = $scope.nameMap[key];
            }

            var containerInfoJson = new ContainerInfo(key, contNum, contName);
            containerInfoJSONArray.push(containerInfoJson);
            console.log("cluster name: " + $scope.clustername);
        }

        console.log(JSON.stringify(containerInfoJSONArray));
        //
        // $http({
        //     method: 'POST',
        //     url: 'http://localhost:3000/crud/createCluster',
        //     data: JSON.stringify(containerInfoJSONArray),   // TODO: FIX ME
        //     headers: {'Content-Type': 'application/json'}
        // }).success(function(data, status, headers, config) {
        //     // this callback will be called asynchronously
        //     // when the response is available
        //     log.console(data);
        // }).
        // error(function(data, status, headers, config) {
        //     // called asynchronously if an error occurs
        //     // or server returns response with an error status.
        // });
    };
});

mainRouter.controller('manageContainerController', function($scope,$http){
    $http({
        method: 'POST',
        url: 'http://localhost:3000/crud/listContainers',
        data: {},
        headers: {'Content-Type': 'application/json'}
    }).success(function (data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available
        $scope.containers = data.ContainerList;
    }).error(function (data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
    /* TODO
     /*For each container check the status {{c.status}} attribute in ng-if and set the right icons*/

    $scope.editContainer = function (status) {
        if (status == 'start') {
            /*TODO: http request to server*/
        } else if (status == 'stop') {
            /*TODO: http request to server*/
        } else if (status == 'delete') {
            /*TODO: http request to server*/
        } else if (status == 'restart') {
            /*TODO: http request to server*/
        }
    };

});

mainRouter.controller('createContainerController', function($scope,$http){
    $scope.isCreating = false;
    $scope.spinnerIcon = {'visibility': 'hidden'};
    $http({
        method: 'POST',
        url: 'http://localhost:3000/crud/listImages',
        data: {},
        headers: {'Content-Type': 'application/json'}
    }).success(function (data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available
        $scope.images = data.ImageList;
    }).error(function (data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });


    $scope.createContainer = function (name, tag) {
        $scope.isCreating = true;
        $http({
            method: 'POST',
            url: 'http://localhost:3000/crud/createContainer',
            data: {'ContainerName' : name, 'ContainerTag' : tag},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            //$scope.images = data.ImageList;
            alert(data.Id);
        }).error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
});

mainRouter.controller('viewUsageController', function($scope, $http){
    $http({
        method: 'POST',
        url: 'http://localhost:3000/crud/listContainers',
        data: {},
        headers: {'Content-Type': 'application/json'}
    }).success(function (data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available
        $scope.containers = data.ContainerList;
    }).error(function (data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
    /* TODO
     /*For each container check the status {{c.status}} attribute in ng-if and set the right icons*/

    $scope.editContainer = function (status) {
        if (status == 'start') {
            /*TODO: http request to server*/
        } else if (status == 'stop') {
            /*TODO: http request to server*/
        } else if (status == 'delete') {
            /*TODO: http request to server*/
        } else if (status == 'restart') {
            /*TODO: http request to server*/
        }
    };
});

mainRouter.controller('imageController', function($scope,$http){
    $scope.showSearchResults = false;
    $scope.downloadSpinnerIcon = {'visibility': 'hidden'};
    $scope.searchSpinnerIcon = {'visibility': 'hidden'};

    $scope.searchImage = function () {
        $scope.showSearchResults = true;
        $http({
            method: 'POST',
            url: 'http://localhost:3000/crud/getContainer',
            data: {'ContainerName': $scope.imagename},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.images = data;
            log.console(data);
        }).error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };

    $scope.downloadImage = function (name, tag) {
        $http({
            method: 'POST',
            url: 'http://localhost:3000/crud/createImage',
            data: {'ContainerName': name, 'ContainerTag' : tag},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            //$scope.images = data;
            //log.console(data);
            alert(data);
        }).error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            alert("ERROR in Creating Image");
        });
    }
});

mainRouter.controller('loginCtrl', function($scope, $http){
    $scope.loginUser = function() {
        var temp = true;
        if(false){
            window.location = '#/manageCluster';
        }
        else{
            //$cookies.put('userId', 'Hello');
            //console.log($cookies.get('userId'));
            window.location = '#/home';
        }
    }
});

mainRouter.controller('registerCtrl', function($scope,$http){
    window.location = '#/register';
});