var app = angular.module('app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        .state('home', {
            views: {
                "landing": {
                    templateUrl: './views/home.html',
                }
            },
            url: '/home',
        })
        .state('about', {
            views: {
                "nav": {
                    templateUrl: './views/nav.html',
                    controller: 'navCtrl',
                },
                "content": {
                    templateUrl: './views/about.html',
                }
            },
            url: '/about',
        })
        .state('labs', {
            views: {
                "nav": {
                    templateUrl: './views/nav.html',
                    controller: 'navCtrl',
                },
                "content": {
                    templateUrl: './views/labs.html',
                }
            },
            url: '/labs',
        })
        .state('contact', {
            views: {
                "nav": {
                    templateUrl: './views/nav.html',
                    controller: 'navCtrl',
                },
                "content": {
                    templateUrl: './views/contact.html',
                }
            },
            url: '/contact',
        });
});

app.controller('navCtrl',['$scope','$location',
    function($scope,$location){
        $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    
}]);

app.controller('mainCtrl',['$scope','$location',
    function($scope,$location){
        $scope.currentState = $location.path();
        $scope.$watch('currentState',function(oldVal,newVal){
            console.log(oldVal);
        });
}]);

