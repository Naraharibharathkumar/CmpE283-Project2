/**
 * Created by BharathKumar on 12/3/2016.
 */
var mainRouter = angular.module('mainRouter', ['ngRoute']);

mainRouter.factory('UserService', [function () {
    return {
        isLogged: false,
        emailId: '',
        hostIp: '',
        hostUserName: '',
        hostPassword: ''
    };
}]);

mainRouter.directive('checkUser', ['$rootScope', '$location', 'UserService',
    function ($root, $loc, userSrv) {
        return {
            link: function (scope, elem, attrs, ctrl) {
                $root.$on('$routeChangeStart', function(e, curr, prev){
                    if(!userSrv.isLogged){
                        window.location = '#/'
                    }
                });
            }
        }
    }]);

mainRouter.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'login.html',
        controller: 'loginCtrl'
    }).when('/register', {
        templateUrl: 'register.html',
        controller: 'containerCtrl'
    }).when('/home', {
        templateUrl: 'home.html',
        controller: 'containerCtrl'
    }).when('/manageCluster', {
        templateUrl: 'manageClusters.html',
        controller: 'manageClusterController'
    }).when('/createClusters', {
        templateUrl: 'createCluster.html',
        controller: 'createClusterController'
    }).when('/manageContainer', {
        templateUrl: 'manageContainers.html',
        controller: 'manageContainerController'
    }).when('/createContainer', {
        templateUrl: 'createContainer.html',
        controller: 'createContainerController'
    }).when('/monitorContainer', {
        templateUrl: 'viewUsage.html',
        controller: 'viewUsageController'
    }).when('/viewCharts/:emailid/:containerid',{
        templateUrl: 'charts.html',
        controller: 'viewChartsController'
    }).when('/createImage',{
        templateUrl: 'createImage.html',
        controller: 'imageController'
    }).otherwise({
        redirectTo: '/'
    });
}]);

mainRouter.controller('containerCtrl', function ($scope, $http) {
    $scope.signUpUser = function () {
        $http({
            method: 'POST',
            url: 'http://localhost:3000/crud/register',
            data: {"EmailId" : $scope.email, "Password" : $scope.password, "HostIP" : $scope.hostIp, "HostUserName" : $scope.hostUsername, "HostPassword" : $scope.hostPassword},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, state, headers, config) {
            if(state=='200'){
                window.location = '#/login';
            }
            else{
                window.location.reload();
            }
        }).error(function (data, state, headers, config) {
        });
    }
});

mainRouter.controller('manageClusterController', function ($scope,$http) {
        $http({
            method: 'POST',
            url: 'http://localhost:3000/cluster/getClusters',
            data: {},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, state, headers, config) {
            $scope.clusters = data.ClusterList;
        }).error(function (data, state, headers, config) {
        });

        $scope.editCluster = function (status, clusterName) {
            if (status == 'start') {
                $http({
                    method: 'POST',
                    url: 'http://localhost:3000/cluster/startCluster',
                    data: {"ClusterName": clusterName},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data, state, headers, config) {
                    if (state == '200') {
                        window.location.reload();
                    }
                }).error(function (data, state, headers, config) {
                });
            } else if (status == 'stop') {
                /*TODO: http request to server*/
                $http({
                    method: 'POST',
                    url: 'http://localhost:3000/cluster/stopCluster',
                    data: {"ClusterName": clusterName},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data, state, headers, config) {
                    if (state == '200') {
                        window.location.reload();
                    }
                }).error(function (data, state, headers, config) {
                });
            } else if (status == 'delete') {
                /*TODO: http request to server*/
                $http({
                    method: 'POST',
                    url: 'http://localhost:3000/cluster/deleteCluster',
                    data: {"ClusterName": clusterName},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data, state, headers, config) {
                    if (state == '200') {
                        window.location.reload();
                    }
                }).error(function (data, state, headers, config) {

                });
            }
            else if (status == 'restart') {
                /*TODO: http request to server*/
                $http({
                    method: 'POST',
                    url: 'http://localhost:3000/cluster/restartCluster',
                    data: {"ClusterName": clusterName},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data, state, headers, config) {
                    if (state == '200') {
                        window.location.reload();
                    }
                }).error(function (data, state, headers, config) {
                });
            }
        };
});


mainRouter.controller('createClusterController', function ($scope,$http) {
        $scope.countMap = {};
        $scope.nameMap = {};
        $scope.spinnerIcon = {'visibility': 'hidden'};

        function ContainerInfo(imageName, containerName, count) {
            this.Image = imageName;
            this.Name = containerName;
            this.Count = count;
        }

        // get images
        $http({
            method: 'POST',
            url: 'http://localhost:3000/cluster/listImages',
            data: {},   // TODO: FIX ME
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, state, headers, config) {
            $scope.images = data.ImageList;
        }).error(function (data, state, headers, config) {
        });

        // add container counts
        $scope.numberChanged = function (imageName, count) {
            if (count == 0) {
                delete $scope.countMap[imageName];
            } else {
                $scope.countMap[imageName] = count;
            }
        }

        // store container names
        $scope.containerNameChanged = function (imageName, cName) {
            $scope.nameMap[imageName] = cName;
        }

        // TODO: create the json array from the selectionMap and send it to server
        $scope.createCluster = function () {
            var containerInfoJSONArray = [];
            for (var key in $scope.countMap) {
                var contName = "noname";
                var contNum = 0;
                if ($scope.countMap.hasOwnProperty(key)) {
                    contNum = $scope.countMap[key];
                }

                if ($scope.nameMap.hasOwnProperty(key)) {
                    contName = $scope.nameMap[key];
                }

                var containerInfoJson = new ContainerInfo(key,contName,contNum);
                containerInfoJSONArray.push(containerInfoJson);
            }
            $http({
                method: 'POST',
                url: 'http://localhost:3000/cluster/createCluster',
                data: {"ClusterName" : $scope.clustername, "ContainerList" : containerInfoJSONArray},   // TODO: FIX ME
                headers: {'Content-Type': 'application/json'}
            }).success(function(data, state, headers, config) {
                window.location = '#/manageCluster';
            }).
            error(function(data, state, headers, config) {
            });
        };
});

mainRouter.controller('manageContainerController', function ($scope,$http) {
    $http({
            method: 'POST',
            url: 'http://localhost:3000/crud/listContainers',
            data: {},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, state, headers, config) {
            $scope.containers = data.ContainerList;
        }).error(function (data, state, headers, config) {
        });

        $scope.editContainer = function (status, cId) {
            if (status == 'start') {
                $http({
                    method: 'POST',
                    url: 'http://localhost:3000/crud/startContainer',
                    data: {"ContainerId": cId},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data, state, headers, config) {
                    if (state == '200') {
                        window.location.reload();
                        // $http({
                        //     method: 'POST',
                        //     url: 'http://localhost:3000/crud/listContainers',
                        //     data: {},
                        //     headers: {'Content-Type': 'application/json'}
                        // }).success(function (data, status, headers, config) {
                        //     $scope.containers = data.ContainerList;
                        // }).error(function (data, status, headers, config) {
                        // });
                    }
                }).error(function (data, state, headers, config) {
                });
            } else if (status == 'stop') {
                $http({
                    method: 'POST',
                    url: 'http://localhost:3000/crud/stopContainer',
                    data: {"ContainerId": cId},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data, state, headers, config) {
                    if (state == '200') {
                        window.location.reload();
                        // $http({
                        //     method: 'POST',
                        //     url: 'http://localhost:3000/crud/listContainers',
                        //     data: {},
                        //     headers: {'Content-Type': 'application/json'}
                        // }).success(function (data, status, headers, config) {
                        //     $scope.containers = data.ContainerList;
                        // }).error(function (data, status, headers, config) {
                        // });
                    }
                }).error(function (data, state, headers, config) {
                });
            } else if (status == 'delete') {
                $http({
                    method: 'POST',
                    url: 'http://localhost:3000/crud/removeContainer',
                    data: {"ContainerId": cId},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data, state, headers, config) {
                    if (state == '200') {
                        window.location.reload();
                        // $http({
                        //     method: 'POST',
                        //     url: 'http://localhost:3000/crud/listContainers',
                        //     data: {},
                        //     headers: {'Content-Type': 'application/json'}
                        // }).success(function (data, status, headers, config) {
                        //     $scope.containers = data.ContainerList;
                        // }).error(function (data, status, headers, config) {
                        // });
                    }
                }).error(function (data, state, headers, config) {
                });
            } else if (status == 'restart') {
                $http({
                    method: 'POST',
                    url: 'http://localhost:3000/crud/stopContainer',
                    data: {"ContainerId": cId},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data, state, headers, config) {
                    if (state == '200') {
                        $http({
                            method: 'POST',
                            url: 'http://localhost:3000/crud/startContainer',
                            data: {"ContainerId": cId},
                            headers: {'Content-Type': 'application/json'}
                        }).success(function (data1, state1, headers1, config1) {
                            if (state1 == '200') {
                                window.location.reload();
                                // $http({
                                //     method: 'POST',
                                //     url: 'http://localhost:3000/crud/listContainers',
                                //     data: {},
                                //     headers: {'Content-Type': 'application/json'}
                                // }).success(function (data, status, headers, config) {
                                //     $scope.containers = data.ContainerList;
                                // }).error(function (data, status, headers, config) {
                                // });
                            }
                        }).error(function (data1, state1, headers1, config1) {
                        });
                        // $http({
                        //     method: 'POST',
                        //     url: 'http://localhost:3000/crud/listContainers',
                        //     data: {},
                        //     headers: {'Content-Type': 'application/json'}
                        // }).success(function (data, status, headers, config) {
                        //     $scope.containers = data.ContainerList;
                        // }).error(function (data, status, headers, config) {
                        // });
                    }
                }).error(function (data, state, headers, config) {
                });
            }
        };

    }
);

mainRouter.controller('createContainerController', function ($scope,$http) {
    $scope.isCreating = false;
    $scope.spinnerIcon = {'visibility': 'hidden'};
    $http({
        method: 'POST',
        url: 'http://localhost:3000/crud/listImages',
        data: {},
        headers: {'Content-Type': 'application/json'}
    }).success(function (data, state, headers, config) {
        $scope.images = data.ImageList;
    }).error(function (data, state, headers, config) {
    });


    $scope.createContainer = function (name, tag) {
        $scope.isCreating = true;
        $http({
            method: 'POST',
            url: 'http://localhost:3000/crud/createContainer',
            data: {'ContainerName': name, 'ContainerTag': tag},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, state, headers, config) {
            window.location = '#/manageContainer';
        }).error(function (data, state, headers, config) {
        });
    };
});

mainRouter.controller('viewUsageController', function ($scope,$http) {
    $http({
        method: 'POST',
        url: 'http://localhost:3000/crud/listContainers',
        data: {},
        headers: {'Content-Type': 'application/json'}
    }).success(function (data, state, headers, config) {
        $scope.containers = data.ContainerList;
    }).error(function (data, state, headers, config) {
    });
});

mainRouter.controller('viewChartsController', function($scope,$routeParams,$http){
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
        }).success(function (data, state, headers, config) {
            $scope.images = data;
        }).error(function (data, state, headers, config) {
        });
    };

    $scope.downloadImage = function (name, tag) {
        $http({
            method: 'POST',
            url: 'http://localhost:3000/crud/createImage',
            data: {'ContainerName': name, 'ContainerTag': tag},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, state, headers, config) {
            window.location='#/createContainer';
        }).error(function (data, state, headers, config) {
        });
    }
});

mainRouter.controller('loginCtrl',  ['$scope', '$http', 'UserService', function ($scope, $http, User) {
    $scope.loginUser = function () {
        $http({
            method: 'POST',
            url: 'http://localhost:3000/crud/login',
            data: {"EmailId" : $scope.email, "Password" : $scope.password},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, state, headers, config) {
            if(state=='200'){
                User.isLogged = true;
                User.emailId= data.EmailId;
                User.hostIp = data.HostIP;
                User.hostUserName = data.HostUserName;
                User.hostPassword = data.HostPassword;
                window.location = '#/manageCluster';
            }
            else{
                User.isLogged = false;
                User.emailId= '';
                User.hostIp = '';
                User.hostUserName = '';
                User.hostPassword = '';
                window.location.reload();
            }
        }).error(function (data, state, headers, config) {
                User.isLogged = false;
                User.emailId= '';
                User.hostIp = '';
                User.hostUserName = '';
                User.hostPassword = '';
        });
    }
}]);

mainRouter.controller('registerCtrl', function ($scope, $http) {
    window.location = '#/register';
});

mainRouter.directive('cpuChart', ['$http', '$routeParams',
    function ($http,$routeParams) {
        return {
            restrict: 'E',
            replace: true,

            template: '<div id="chartdiv" style="min-width: 310px; height: 400px; margin: 0 auto"></div>',
            link: function (scope, element, attrs) {
                var chart = false;
                /**
                 * Function that generates data
                 */
                function generateChartData() {
                    var chartData = [];
                    if(typeof ($routeParams.containerid) == 'undefined'){

                    }
                    else{
                        $http({
                            method: 'POST',
                            url: 'http://localhost:3000/crud/getCpuStats',
                            data: {'ContainerId' : $routeParams.containerid },
                            headers: {'Content-Type': 'application/json'}
                        }).success(function (data, status, headers, config) {
                            var newDate = new Date();
                            chartData.push({
                                date : newDate,
                                visits : data.CPU
                            })
                        }).error(function (data, status, headers, config) {
                        });
                    }
                    return chartData;
                }

                var initChart = function () {
                    if (chart) chart.destroy();
                    var config = scope.config || {};
                    /**
                     * Create the chart
                     */
                    var chart = AmCharts.makeChart("chartdiv", {
                        "type": "serial",
                        "theme": "light",
                        "zoomOutButton": {
                            "backgroundColor": '#000000',
                            "backgroundAlpha": 0.15
                        },
                        "dataProvider": generateChartData(),
                        "categoryField": "date",
                        "categoryAxis": {
                            "parseDates": true,
                            "minPeriod": "ss",
                            "dashLength": 1,
                            "gridAlpha": 0.15,
                            "axisColor": "#DADADA"
                        },
                        "graphs": [{
                            "id": "g1",
                            "valueField": "visits",
                            "bullet": "round",
                            "bulletBorderColor": "#FFFFFF",
                            "bulletBorderThickness": 2,
                            "lineThickness": 2,
                            "lineColor": "#24b506",
                            "negativeLineColor": "#0352b5",
                            "hideBulletsCount": 50
                        }],
                        "chartCursor": {
                            "cursorPosition": "mouse"
                        },
                        "chartScrollbar": {
                            "graph": "g1",
                            "scrollbarHeight": 40,
                            "color": "#FFFFFF",
                            "autoGridCount": true
                        }
                    });

                    /**
                     * Set interval to push new data points periodically
                     */
                    // set up the chart to update every second
                    setInterval(function () {
                        // load new datapoints here,
                        if(typeof ($routeParams.containerid) == 'undefined'){

                        }
                        else{
                            $http({
                                method: 'POST',
                                url: 'http://localhost:3000/crud/getCpuStats',
                                data: {'ContainerId' : $routeParams.containerid },
                                headers: {'Content-Type': 'application/json'}
                            }).success(function (data, status, headers, config) {
                                var newDate = new Date();
                                chart.dataProvider.push({
                                    date : newDate,
                                    visits : data.CPU
                                })
                            }).error(function (data, status, headers, config) {
                            });
                            chart.validateData();
                        }
                    }, 1000);
                };
                initChart();
            }
        }
    }]);


mainRouter.directive('memoryChart', ['$http', '$routeParams',
    function ($http,$routeParams) {
        return {
            restrict: 'E',
            replace: true,

            template: '<div id="chartdiv2" style="min-width: 110px; height: 400px; margin: 0 auto"></div>',
            link: function (scope, element, attrs) {
                var chart = false;
                /**
                 * Function that generates data
                 */
                function generateChartData() {
                    var chartData = [];
                    if(typeof ($routeParams.containerid) == 'undefined'){

                    }
                    else{
                        $http({
                            method: 'POST',
                            url: 'http://localhost:3000/crud/getMemoryStats',
                            data: {'ContainerId': $routeParams.containerid},
                            headers: {'Content-Type': 'application/json'}
                        }).success(function (data, status, headers, config) {
                            var newDate = new Date();
                            chartData.push({
                                date: newDate,
                                memory: data.Memory,
                                limit: data.Limit
                            })
                        }).error(function (data, status, headers, config) {
                        });
                    }
                    return chartData;
                }

                var initChart = function () {
                    if (chart) chart.destroy();
                    var config = scope.config || {};
                    /**
                     * Create the chart
                     */

                    var chart = AmCharts.makeChart("chartdiv2", {
                        "type": "serial",
                        "theme": "light",
                        "glueToTheEnd": false,
                        "zoomOutButton": {
                            "backgroundColor": '#000000',
                            "backgroundAlpha": 0.15
                        },
                        "legend": {
                            "useGraphSettings": true,
                            "align": "right"
                        },
                        "titles": [
                            {
                                "text": "Memory Usage (MB)",
                                "size": 15
                            }
                        ],

                        "dataProvider": generateChartData(),
                        "categoryField": "date",
                        "categoryAxis": {
                            "parseDates": true,
                            "minPeriod": "5ss",
                            "dashLength": 1,
                            "gridAlpha": 0.15,
                            "axisColor": "#DADADA"
                        },
                        "graphs": [{
                            "id": "g1",
                            "valueField": "limit",
                            "title"   : "Limit",
                            "type"    : "step",
                            "usePeriod": "ss",
                            "fillAlphas"  : 1
                        }, {
                            "id": "g2",
                            "valueField": "memory",
                            "title"   : "Memory",
                            "type"    : "step",
                            "usePeriod": "ss",
                            "fillAlphas"  : 1
                        }],
                        "chartCursor": {
                            "cursorPosition": "mouse"
                        },
                        "chartScrollbar": {
                            "graph": "g1",
                            "scrollbarHeight": 40,
                            "color": "#FFFFFF",
                            "autoGridCount": true
                        }
                    });

                    /**
                     * Set interval to push new data points periodically
                     */
                    // set up the chart to update every second
                    setInterval(function () {
                        // load new datapoints here,
                        if(typeof ($routeParams.containerid) == 'undefined'){

                        }
                        else{
                            $http({
                                method: 'POST',
                                url: 'http://localhost:3000/crud/getMemoryStats',
                                data: {'ContainerId' : $routeParams.containerid },
                                headers: {'Content-Type': 'application/json'}
                            }).success(function (data, status, headers, config) {
                                var newDate = new Date();
                                chart.dataProvider.push({
                                    date : newDate,
                                    memory : data.Memory,
                                    limit : data.Limit
                                })
                            }).error(function (data, status, headers, config) {
                            });
                        }
                        chart.validateData();
                    }, 1000);
                };
                initChart();

            }
        }
    }]);

mainRouter.directive('networkChart', ['$http', '$routeParams',
    function ($http, $routeParams) {
        return {
            restrict: 'E',
            replace: true,

            template: '<div id="chartdiv3" style="min-width: 110px; height: 400px; margin: 0 auto"></div>',
            link: function (scope, element, attrs) {
                var chart = false;

                /**
                 * Function that generates data
                 */
                function generateChartData() {
                    var chartData = [];
                    if(typeof ($routeParams.containerid) == 'undefined'){

                    }
                    else{
                        $http({
                            method: 'POST',
                            url: 'http://localhost:3000/crud/getNetworkStats',
                            data: {'ContainerId': $routeParams.containerid},
                            headers: {'Content-Type': 'application/json'}
                        }).success(function (data, status, headers, config) {
                            var newDate = new Date();
                            chartData.push({
                                date: newDate,
                                received_bytes: data.rx_bytes,
                                sent_bytes: data.tx_bytes
                            })
                        }).error(function (data, status, headers, config) {
                        });
                    }
                    return chartData;
                }

                var initChart = function () {
                    if (chart) chart.destroy();
                    var config = scope.config || {};
                    /**
                     * Create the chart
                     */

                    var chart = AmCharts.makeChart("chartdiv3", {
                        "type": "serial",
                        "theme": "light",
                        "glueToTheEnd": false,
                        "zoomOutButton": {
                            "backgroundColor": '#000000',
                            "backgroundAlpha": 0.15
                        },
                        "legend": {
                            "useGraphSettings": true,
                            "align": "right"
                        },
                        "titles": [
                            {
                                "text": "Network In/Out (bytes)",
                                "size": 15
                            }
                        ],

                        "dataProvider": generateChartData(),
                        "categoryField": "date",
                        "categoryAxis": {
                            "parseDates": true,
                            "minPeriod": "ss",
                            "dashLength": 1,
                            "gridAlpha": 0.15,
                            "axisColor": "#DADADA"
                        },
                        "graphs": [{
                            "id": "g1",
                            "valueField": "received_bytes",
                            "title": "In",
                            "bulletBorderColor": "#FFFFFF",
                            "bulletBorderThickness": 2,
                            "lineThickness": 2,
                            "lineColor": "#24b506",
                            "hideBulletsCount": 50
                        },
                            {
                                "id": "g2",
                                "valueField": "sent_bytes",
                                "title": "Out",
                                "bulletBorderColor": "#FFFFFF",
                                "bulletBorderThickness": 2,
                                "lineThickness": 2,
                                "lineColor": "#0352b5",
                                "hideBulletsCount": 50
                            }],
                        "chartCursor": {
                            "cursorPosition": "mouse"
                        },
                        "chartScrollbar": {
                            "graph": "g1",
                            "scrollbarHeight": 40,
                            "color": "#FFFFFF",
                            "autoGridCount": true
                        }
                    });

                    /**
                     * Set interval to push new data points periodically
                     */
                    // set up the chart to update every second
                    setInterval(function () {
                        // load new datapoints here,
                        if(typeof ($routeParams.containerid) == 'undefined'){

                        }
                        else{
                            $http({
                                method: 'POST',
                                url: 'http://localhost:3000/crud/getNetworkStats',
                                data: {'ContainerId': $routeParams.containerid},
                                headers: {'Content-Type': 'application/json'}
                            }).success(function (data, status, headers, config) {
                                var newDate = new Date();
                                chart.dataProvider.push({
                                    date: newDate,
                                    received_bytes: data.rx_bytes,
                                    sent_bytes: data.tx_bytes
                                })
                            }).error(function (data, status, headers, config) {
                            });
                        }
                        chart.validateData();
                    }, 1000);
                };
                initChart();

            }
        }
    }]);

mainRouter.directive('ioChart', ['$http', '$routeParams',
    function ($http, $routeParams) {
        return {
            restrict: 'E',
            replace: true,

            template: '<div id="chartdiv4" style="min-width: 110px; height: 400px; margin: 0 auto"></div>',
            link: function (scope, element, attrs) {
                var chart = false;

                /**
                 * Function that generates data
                 */
                function generateChartData() {
                    var chartData = [];
                    if(typeof ($routeParams.containerid) == 'undefined'){

                    }
                    else{
                        $http({
                            method: 'POST',
                            url: 'http://localhost:3000/crud/getIOStats',
                            data: {'ContainerId': $routeParams.containerid},
                            headers: {'Content-Type': 'application/json'}
                        }).success(function (data, status, headers, config) {
                            var newDate = new Date();
                            chartData.push({
                                date: newDate,
                                read: data.read,
                                write: data.write
                            })
                        }).error(function (data, status, headers, config) {
                        });
                    }
                    return chartData;
                }

                var initChart = function () {
                    if (chart) chart.destroy();
                    var config = scope.config || {};
                    /**
                     * Create the chart
                     */

                    var chart = AmCharts.makeChart("chartdiv4", {
                        "type": "serial",
                        "theme": "light",
                        "glueToTheEnd": false,
                        "zoomOutButton": {
                            "backgroundColor": '#000000',
                            "backgroundAlpha": 0.15
                        },
                        "legend": {
                            "useGraphSettings": true,
                            "align": "right"
                        },
                        "titles": [
                            {
                                "text": "IO Read/Write (bytes)",
                                "size": 15
                            }
                        ],

                        "dataProvider": generateChartData(),
                        "categoryField": "date",
                        "categoryAxis": {
                            "parseDates": true,
                            "minPeriod": "ss",
                            "dashLength": 1,
                            "gridAlpha": 0.15,
                            "axisColor": "#DADADA"
                        },
                        "graphs": [{
                            "id": "g1",
                            "valueField": "read",
                            "title": "Read",
                            "bulletBorderColor": "#FFFFFF",
                            "bulletBorderThickness": 2,
                            "lineThickness": 2,
                            "lineColor": "#24b506",
                            "hideBulletsCount": 50
                        },
                            {
                                "id": "g2",
                                "valueField": "write",
                                "title": "Write",
                                "bulletBorderColor": "#FFFFFF",
                                "bulletBorderThickness": 2,
                                "lineThickness": 2,
                                "lineColor": "#0352b5",
                                "hideBulletsCount": 50
                            }],
                        "chartCursor": {
                            "cursorPosition": "mouse"
                        },
                        "chartScrollbar": {
                            "graph": "g1",
                            "scrollbarHeight": 40,
                            "color": "#FFFFFF",
                            "autoGridCount": true
                        }
                    });

                    /**
                     * Set interval to push new data points periodically
                     */
                    // set up the chart to update every second
                    setInterval(function () {
                        // load new datapoints here,
                        if(typeof ($routeParams.containerid) == 'undefined'){

                        }
                        else{
                            $http({
                                method: 'POST',
                                url: 'http://localhost:3000/crud/getIOStats',
                                data: {'ContainerId': $routeParams.containerid},
                                headers: {'Content-Type': 'application/json'}
                            }).success(function (data, status, headers, config) {
                                var newDate = new Date();
                                chart.dataProvider.push({
                                    date: newDate,
                                    read: data.read,
                                    write: data.write
                                })
                            }).error(function (data, status, headers, config) {
                            });
                        }
                        chart.validateData();
                    }, 1000);
                };
                initChart();

            }
        }
    }]);