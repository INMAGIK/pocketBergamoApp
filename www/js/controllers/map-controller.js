(function(){
'use strict';

angular.module('starter.controllers')

.controller('MapCtrl', ['$scope', 'configManager', 'mapConfigService', 'mapsManager','layersManager', 'layersConfigService', '$ionicModal',
    function($scope, configManager, mapConfigService,mapsManager,layersManager, layersConfigService, $ionicModal) {

    console.log("xxx map ctrl is alive");

    $scope.appInfo = {
        title : 'PocketMap Bergamo'
    };

    
    $ionicModal.fromTemplateUrl('templates/about.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;

    });

    $scope.openModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    
    var startFromConfig = function(){
        configManager.getConfig('config/config.json')
            .then(function(data){
                mapConfigService.setExtent(data.extent, data.extent_proj);
                initMap(data);
            });
    };

    var initMap = function(){
            //console.log("xxx1")
            mapConfigService.getMapConfig({target:'main-map'})
                .then(function(config){
                    var map = mapsManager.createMap('main-map', config);
                    $scope.map = map;
                    map.getView().fitExtent(mapConfigService.getExtent(), map.getSize() );
                    layersManager.addLayer('main-map', layersConfigService.fixedLayers[0]);
                    //map.addLayer(editableVectors.drawTarget);
                    //map.addInteraction(editableVectors.drawInteraction);
                    prepareEvents();

                });

        };

        var prepareEvents  = function(){
            $scope.map.on('moveend',onMove )
        };

        var onMove = function(evt){
            var bounds = $scope.map.getView().calculateExtent($scope.map.getSize());
            var center = $scope.map.getView().getCenter();
            //console.log(2, evt)
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