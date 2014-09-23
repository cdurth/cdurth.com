var app = angular.module('app', ['ui.router']);

var options = {};
options.api = {};
options.api.base_url = "http://vps2.plugnpromo.com:3333";

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
                    templateUrl: './views/post.list.html',
                    controller: 'PostListCtrl',
                }
            },
            url: '/labs',
        })
        .state('singlepost', {
            views: {
                "nav": {
                    templateUrl: './views/nav.html',
                    controller: 'navCtrl',
                },
                "content": {
                    templateUrl: './views/post.view.html',
                    controller: 'PostViewCtrl',
                }
            },
            url: '/labs/:id',
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

app.controller('PostListCtrl', ['$scope', '$sce', 'PostService',
    function PostListCtrl($scope, $sce, PostService) {

        $scope.posts = [];

        PostService.findAllPublished().success(function(data) {
            for (var postKey in data) {
                data[postKey].content = $sce.trustAsHtml(data[postKey].content);
            }

            $scope.posts = data;            
        }).error(function(data, status){
            console.log(status);
            console.log(data);
        });
    }
]);

app.controller('PostViewCtrl', ['$scope', '$stateParams', '$location', '$sce', 'PostService', 'LikeService',
    function PostViewCtrl($scope, $stateParams, $location, $sce, PostService, LikeService){

        $scope.post = {};
        var id = $stateParams.id;

        $scope.isAlreadyLiked = LikeService.isAlreadyLiked(id);

        PostService.read(id).success(function(data) {
            data.content = $sce.trustAsHtml(data.content);
            $scope.post = data;
        }).error(function(data, status){
            console.log(status);
            console.log(data);
        });

        //Like a post
        $scope.likePost = function likePost(){
            if (!LikeService.isAlreadyLiked(id)){
                PostService.like(id).success(function(data) {
                    $scope.post.likes++;
                    LikeService.like(id);
                    $scope.isAlreadyLiked = true;
                }).error(function(data, status){
                    console.log(status);
                    console.log(data);
                });
            }
        };

        //Unlike a post
        $scope.unlikePost = function unlikePost(){
            if (LikeService.isAlreadyLiked(id)){
                PostService.unlike(id).success(function(data){
                    $scope.post.likes--;
                    LikeService.unlike(id);
                    $scope.isAlreadyLiked = false;
                }).error(function(data, status){
                    console.log(status);
                    console.log(data);
                });
            }
        }

    }
]);


/*********************************************************************
    SERVICES
*********************************************************************/

app.factory('PostService', function($http) {
    return {
        findAllPublished: function() {
            return $http.get(options.api.base_url + '/post');
        },

        findByTag: function(tag) {
            return $http.get(options.api.base_url + '/tag/' + tag);
        },

        read: function(id) {
            return $http.get(options.api.base_url + '/post/' + id);
        },
        
        findAll: function() {
            return $http.get(options.api.base_url + '/post/all');
        },

        changePublishState: function(id, newPublishState) {
            return $http.put(options.api.base_url + '/post', {'post': {_id: id, is_published: newPublishState}});
        },

        delete: function(id) {
            return $http.delete(options.api.base_url + '/post/' + id);
        },

        create: function(post) {
            return $http.post(options.api.base_url + '/post', {'post': post});
        },

        update: function(post) {
            return $http.put(options.api.base_url + '/post', {'post': post});
        },

        like: function(id) {
            return $http.post(options.api.base_url  + '/post/like', {'id': id});
        },

        unlike: function(id) {
            return $http.post(options.api.base_url  + '/post/unlike', {'id': id});
        }
    };
});


app.factory('LikeService', function ($window) {
    //Contains post ids already liked by the user
    var postLiked = [];

    if ($window.sessionStorage && $window.sessionStorage.postLiked) {
        postLiked.push($window.sessionStorage.postLiked);
    }


    return {
        isAlreadyLiked: function(id) {
            if (id != null) {
                for (var i in postLiked) {
                    if (postLiked[i] == id) {
                        return true;
                    }
                }

                return false;
            }

            return false;
        },

        like: function(id) {
            if (!this.isAlreadyLiked(id)) {
                postLiked.push(id);
                $window.sessionStorage.postLiked = postLiked;
            }
        },

        unlike: function(id) {
            if (this.isAlreadyLiked(id)) {
                for (var i in postLiked) {
                    if (postLiked[i] == id) {
                        postLiked.splice(i, 1);
                        $window.sessionStorage.postLiked = postLiked;
                        
                        break;
                    }
                }
            }
        }
    }
});
