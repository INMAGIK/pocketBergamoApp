(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('SearchCtrl', ['$scope', '$timeout', '$rootScope','indexService', '$ionicScrollDelegate',
        function($scope, $timeout, $rootScope, indexService, $ionicScrollDelegate) {

        
            

            $scope.search = function(){
                var w = indexService.searchFeatures($scope.searchStatus.search);
                $timeout(function(){
                    $scope.searchStatus.searchResults = w;
                    $scope.searchStatus.lastSearch = $scope.searchStatus.search;
                });
            };


            $scope.clear = function(){
                $timeout(function(){
                    $scope.searchStatus.searchResults = [];
                    $scope.searchStatus.search = '';
                    $scope.searchStatus.lastSearch = null;
                });

            };


            $scope.centerFeature = function(feature){
                $rootScope.$broadcast("centerSearchFeature", feature);

            }




            



    }]);


}());