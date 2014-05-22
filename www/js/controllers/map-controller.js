    (function(){
    'use strict';

    angular.module('starter.controllers')

    .controller('MapCtrl', ['$scope', '$timeout', 'configManager', 'mapConfigService', 'mapsManager','layersManager', 'layersConfigService', 'geolocationService', '$ionicModal',
        function($scope, $timeout, configManager, mapConfigService,mapsManager,layersManager, layersConfigService, geolocationService, $ionicModal) {

        console.log("xxx map ctrl is alive");

        $scope.appInfo = {
            title : 'PocketMap Bergamo'
        };

        
        $scope.uiStatus = {
            gps:false
        };

        
        //modal stuff
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


        /* geoloc stuff -- move away */
        var positionLayer = null;

        var createPositionLayer = function(){
            var vectorSource = new ol.source.Vector({
            });

            /*
            var iconStyle = new ol.style.Style({
                image : new ol.style.Circle({
                    radius: 10,
                    fill: new ol.style.Fill({color: '#666666'}),
                    stroke: new ol.style.Stroke({color: '#bada55', width: 2})
                })
            });
            */

            var iconStyle = new ol.style.Style({
              image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                //opacity: 0.75,
                //size : 10,
                src: 'img/position2.png'
              }))
            });
            

            var out = new ol.layer.Vector({
                source: vectorSource,
                style : iconStyle,
                visible : true
            });

            return out;
        };

        var updatePositionLayer = function(coords){
            var coordsm = ol.proj.transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857')

            var features = positionLayer.getSource().getFeatures()
            
            if(features.length){
                features[0].setGeometry(new ol.geom.Point(coordsm));

            } else {
                var positionFeature = new ol.Feature({
                    geometry: new ol.geom.Point(coordsm),
                    name: 'Your position'
                });
                var s  = positionLayer.getSource();
                s.addFeature(positionFeature);
            
            }
            
        }

        var initGeoloc = function(){
            

            positionLayer = createPositionLayer();
            console.log("xx", positionLayer)
            var cfg = { name : "geolocation", layer:positionLayer };
            layersManager.addLayer('main-map', cfg);

            $scope.$on("updateGeolocation", function(evt, coords){
                //console.log("xxx", coords)
                updatePositionLayer(coords);
                //console.log("xx updateGeolocation", coords)
            })
            
        };


        $scope.startGeolocation = function(){
            positionLayer.setVisible(true)
            geolocationService.startGeolocation();
            $timeout(function(){
                $scope.uiStatus.gps = true;
            })
        }

        $scope.stopGeolocation = function(){
            positionLayer.setVisible(false)
            geolocationService.stopGeolocation();
            $timeout(function(){
                $scope.uiStatus.gps = false;
            })
        }

        $scope.toggleGeolocation = function(){
            if($scope.uiStatus.gps){
                $scope.stopGeolocation()
            } else {
                $scope.startGeolocation();
            }
        }



        var initMap = function(data){
                //console.log("xxx1")
                mapConfigService.getMapConfig({target:'main-map', maxResolution:data.maxResolution})
                    .then(function(config){
                        var map = mapsManager.createMap('main-map', config);
                        $scope.map = map;
                        var v = map.getView();
                        v.fitExtent(mapConfigService.getExtent(), map.getSize() );

                        console.log("xxx-zzz", v.getResolution())
                        
                        //v.set('maxZoom', v.getZoom());
                        

                        //layersManager.addLayer('main-map', layersConfigService.fixedLayers[0]);
                        //map.addLayer(editableVectors.drawTarget);
                        //map.addInteraction(editableVectors.drawInteraction);

                        //adding base layers
                        _.each(data.baseLayers, function(item){
                            var i = layersManager.createLayerConfigFromJson(item);
                            layersManager.addLayer('main-map', i);
                        });

                        initGeoloc();

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