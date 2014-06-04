(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('BrowserCtrl', ['$scope', '$timeout', '$rootScope','indexService', '$ionicScrollDelegate',
        function($scope, $timeout, $rootScope, indexService, $ionicScrollDelegate) {

        
            $scope.browserStatus = {
                layer  : null,
                feature : null,
                filter : ''
            };

            $scope.browserTitle = "Browser";
            $scope.context = 'index';

            $scope.layers = [];
            $scope.features = [];

            $scope.$watch(function(){
                return indexService.getLayersWithOptions({browser:true});
                }, 
                function(nv){
                    if(nv){
                        $scope.layers = nv;    
                    }
                    
                },
                true
            );

            $scope.clearFilter = function(){
                $timeout(function(){
                    $scope.browserStatus.filter=''
                });
            }

            
            $scope.toIndex = function(){
                $timeout(function(){
                    $scope.browserStatus.layer = null;
                    $scope.browserStatus.feature = null;
                    $scope.features = [];
                    $scope.browserTitle = "Browser";
                    $scope.context = 'index';

                })
            };
            

            $scope.toLayer = function(layerName, options){
                $timeout(function(){
                    
                    
                    $scope.features = indexService.getFeatures(layerName);
                    $scope.browserTitle = layerName + " (" + $scope.features.length + ")";

                    if(options){
                        var f = _.findWhere($scope.features , options);
                        if(f){
                            return $scope.toFeature(f, layerName);
                        } 
                    }

                    $scope.browserStatus.layer = layerName;
                    $scope.browserStatus.feature = null;
                    $scope.context = 'layer';

                })

            };

            $scope.toFeature = function(feature, layerName){
                $timeout(function(){
                    if(layerName){
                        $scope.browserStatus.layer = layerName;
                    }
                    $scope.browserStatus.feature = feature;
                    $scope.browserTitle = $scope.browserStatus.layer;
                    $ionicScrollDelegate.scrollTop();
                    $scope.context = 'feature';
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

            $scope.sortMode = $scope.uiStatus.lastPosition ? 'orderDistanceFunction' : '_title';
            $scope.setSortMode = function(mode){
                $scope.sortMode = mode;
            }

            $scope.filterFun = function(i){
                if(!$scope.browserStatus.filter) return true;
                var t = i._title.toLowerCase();
                var s = $scope.browserStatus.filter.toLowerCase();
                var out = t.indexOf(s) !== -1;
                return out;

            }


            $scope.centerFeature = function(feature){
                $rootScope.$broadcast("centerBrowserFeature", feature, $scope.browserStatus.layer);

            }

            $scope.$watch('sortMode', function(nv){
                if(nv == 'orderDistanceFunction'){
                    $scope.sorter= $scope.orderDistanceFunction;
                } 
                if(nv == '_title'){
                    $scope.sorter= function(f){ return f._title; }
                } 

            }, true)


            
            $scope.$on('showMeInBrowser', function(evt,feature,options){

                $scope.browser.show();
                var place_id = feature.values_.place_id;
                $scope.toLayer(options.layerName, {place_id:place_id});
            
            });






            



    }]);


}());