(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('StreetsBrowserCtrl', ['$scope', '$timeout', '$rootScope','streetsService', '$ionicScrollDelegate',
        function($scope, $timeout, $rootScope, streetsService, $ionicScrollDelegate) {

        
            $scope.browserStatus = {
                municipality  : null
            };

            var cachedFeatures = {};

            $scope.browserTitle = "Browser";
            $scope.context = 'index';

            $scope.municipalities = [];
            $scope.features = [];
            $scope.loadedFeatures = 0;
            $scope.streetsList = {}

             

            $scope.clearFilter = function(){
                $timeout(function(){
                    $scope.browserStatus.filter=''
                });
            }

            $scope.loadMore = function(){
                console.log("loading;")
            }

            
            $scope.toIndex = function(){
                $scope.browserStatus.municipality = null;
                $scope.features = [];
                $scope.context = 'index';
                $ionicScrollDelegate.scrollTop();
                $timeout(function(){
                    $scope.$apply()
                })
            };
            

            $scope.loadPartial = function(municipality){
                municipality = municipality || $scope.browserStatus.municipality;
                $timeout(function(){
                    var d = indexService.getFeaturesPaginated(layerName , $scope.loadedFeatures);
                    $scope.features = $scope.features.concat(d.features);
                    $scope.loadedFeatures = $scope.features.length;
                    //console.log("xxx", d, $scope.features)
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if(d.num == $scope.loadedFeatures){
                        $scope.stopLoad = true;
                        cachedFeatures[layerName] = $scope.features
                    }
                })

            };


            $scope.stopLoad = false;
            

            $scope.toMunicipality = function(municipality){

                $timeout(function(){
                    
                    $scope.features = $scope.streetsList[municipality];
                    $scope.browserStatus.municipality = municipality;
                    $scope.context = 'municipality';

                });

            };

            $scope.back = function(){
                if($scope.browserStatus.municipality){
                    $scope.toIndex()
                    return;
                }
            };

            $scope.filterFun = function(i){
                if(!$scope.browserStatus.filter) return true;
                var t = i.properties.name.toLowerCase();
                var s = $scope.browserStatus.filter.toLowerCase();
                var out = t.indexOf(s) !== -1;
                return out;
            }

            

            
            $scope.centerFeature = function(feature){
                $rootScope.$broadcast("centerStreet", feature);
            };

            
            
            $scope.$watch('browserStatus.filter', function(nv, ov){
                if(!ov){
                    $ionicScrollDelegate.scrollTop();    
                }
            });

            $scope.$watch('browserStatus.municipality', function(nv, ov){
                if(nv != ov){
                    $timeout(function(){
                        $scope.browserStatus.filter = '';    
                    });
                }
            });



            //init part

            streetsService.loadStreets("config/streets/aggregated_streets.json").then(function(data){
                $scope.municipalities = _.pluck(data, "municipality");
                _.each(data, function(item){
                    $scope.streetsList[item.municipality] = item.streets.features;
                })


            });

            



    }]);


}());