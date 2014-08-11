(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('BookmarksCtrl', ['$scope', '$timeout', '$rootScope', '$ionicScrollDelegate', 'bookmarksService', 'indexService',
        function($scope, $timeout, $rootScope, $ionicScrollDelegate, bookmarksService, indexService) {

        
            $scope.bookmarks = [];
            $scope.rawBookmarks = [];
            $scope.context = 'index';
            $scope.browserStatus = {
                municipality  : null
                
            };

            $scope.sortMode = $scope.uiStatus.lastPosition ? 'orderDistanceFunction' : '_title';

            
            
            $rootScope.$on('bookmarksLoaded', function(evt, data){
                $timeout(function(){
                  $scope.rawBookmarks = bookmarksService.bookmarks;    
                })
            });
            
            

            $scope.$watchCollection('rawBookmarks', function(nv){
                var bk = [];
                var features = _.pluck(nv, 'feature');
                _.each(features, function(feature){
                    var feat = bookmarksService.getFeature(feature);
                    if(feat){
                        bk.push(feat);
                    }
                    
                });
                $timeout(function(){
                    $scope.bookmarks = bk;
                })


            });

            $scope.toFeature = function(feature, layerName){
                if(layerName){
                        $scope.browserStatus.layer = layerName;
                    }
                $scope.browserStatus.feature = feature;
                $scope.browserTitle = $scope.browserStatus.layer;
                $ionicScrollDelegate.scrollTop();
                $scope.context = 'feature';
                $timeout(function(){
                    $scope.$apply();
                })

            };

            $scope.toIndex = function(){
                $timeout(function(){
                    $scope.context = 'index';
                    $scope.browserStatus.feature = null;
                    $ionicScrollDelegate.scrollTop();

                })
            }

            $scope.getTemplateForLayer = function(layerName){
                return indexService.getTemplateForLayer(layerName)
            };


            $scope.removeBookmark=function(feature){
                bookmarksService.removeBookmark(feature)
                .then(function(){
                    bookmarksService.reload();
                    $scope.toIndex();
                });
            };



    }]);


}());