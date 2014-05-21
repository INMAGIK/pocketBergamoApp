(function(){
'use strict';

angular.module('starter.controllers')

.controller('MapCtrl', ['$scope', 'configManager', 'mapConfigService', 'mapsManager','layersManager', 'layersConfigService', 
    function($scope, configManager, mapConfigService,mapsManager,layersManager, layersConfigService) {

    console.log("xxx map ctrl is alive");

    
    var startFromConfig = function(){
        configManager.getConfig('config/config.json')
            .then(function(data){
                mapConfigService.setExtent(data.extent, data.extent_proj);
                console.log("xx", data);
                initMap(data);

            })
    }



    var initMap = function(){

            
            mapConfigService.getMapConfig({target:'main-map'})
                .then(function(config){
                    console.log("sx", config)
                    var map = mapsManager.createMap('main-map', config);
                    $scope.map = map;
                    map.getView().fitExtent(mapConfigService.extent, map.getSize() );
                    layersManager.addLayer('main-map', layersConfigService.fixedLayers[0]);
                    //map.addLayer(editableVectors.drawTarget);
                    //map.addInteraction(editableVectors.drawInteraction);


                    //#todo: remove (raw debug purpose)
                    window.map = map;
                    prepareEvents();

                });
        };

        var prepareEvents  = function(){
            $scope.map.on('moveend',onMove )
        };

        var onMove = function(evt){
            var bounds = $scope.map.getView().calculateExtent($scope.map.getSize());
            var center = $scope.map.getView().getCenter();
            console.log(2, evt)
            /*
            $timeout(function(){
                $scope.mapState.bounds = bounds; 
                $scope.mapState.center = center; 
            });
            */
            
        }


        startFromConfig();

        



}]);


}());