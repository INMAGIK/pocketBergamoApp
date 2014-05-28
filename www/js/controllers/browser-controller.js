(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('BrowserCtrl', ['$scope', '$timeout', '$rootScope','indexService', '$ionicScrollDelegate',
        function($scope, $timeout, $rootScope, indexService, $ionicScrollDelegate) {

        
            $scope.browserStatus = {
                layer  : null,
                feature : null
            };

            $scope.browserTitle = "Browser";

            $scope.layers = [];

            $scope.$watch(function(){
                return indexService.getLayers({browser:true});
                }, 
                function(nv){
                    if(nv){
                        $scope.layers = nv;    
                    }
                    
                },
                true
            );
            
            $scope.features = [];

            
            $scope.toIndex = function(){
                $timeout(function(){
                    $scope.browserStatus.layer = null;
                    $scope.browserStatus.feature = null;
                    $scope.features = [];
                    $scope.browserTitle = "Browser";

                })
            };
            

            $scope.toLayer = function(layerName){
                $timeout(function(){
                    $scope.browserStatus.layer = layerName;
                    $scope.browserStatus.feature = null;
                    $scope.features = indexService.getFeatures(layerName);
                    $scope.browserTitle = layerName + " (" + $scope.features.length + ")";

                })

            };

            $scope.toFeature = function(feature){
                $timeout(function(){
                    $scope.browserStatus.feature = feature;
                    $scope.browserTitle = $scope.getTitle($scope.browserStatus.layer, $scope.browserStatus.feature) + " ( "+ $scope.browserStatus.layer +" )";
                    $ionicScrollDelegate.scrollTop();
                })

            };

            $scope.getTitle = function(layer, feature){
                return indexService.getFeatureTitle(layer, feature)
            };

            $scope.getLayerIcon = function(layerName){
                return indexService.getConfigForLayer(layerName, "icon");
            };            

            $scope.getTemplateForLayer = function(layerName){
                return indexService.getTemplateForLayer(layerName)
            };

            $scope.back = function(){
                if($scope.browserStatus.feature){
                    $scope.toLayer($scope.browserStatus.layer)
                    return;
                }

                if($scope.browserStatus.layer){
                    $scope.toIndex()
                    return;
                }
            };


            $scope.centerFeature = function(feature){
                $rootScope.$broadcast("centerBrowserFeature", feature);

            }


            



    }]);


}());