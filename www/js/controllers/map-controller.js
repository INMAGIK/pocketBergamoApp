    (function(){
    'use strict';

    angular.module('starter.controllers')

    .controller('MapCtrl', ['$scope', '$timeout', 'configManager', 'mapConfigService', 'mapsManager','layersManager', 'layersConfigService', 'olGeolocationService', '$ionicModal',
        function($scope, $timeout, configManager, mapConfigService,mapsManager,layersManager, layersConfigService, olGeolocationService, $ionicModal) {

        console.log("xxx map ctrl is alive");

        $scope.appInfo = {
            title : 'PocketMap Bergamo',
            version : "0.1"
        };

        
        $scope.uiStatus = {
            gps:false,
            orientation : false,
            follow : false,
            lastPosition : null
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

        var updatePositionLayer = function(coordsm){
            
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
            var cfg = { name : "geolocation", layer:positionLayer };
            layersManager.addLayer('main-map', cfg);


            olGeolocationService.geolocationControl.on('change', function(evt) {
                var coords = olGeolocationService.geolocationControl.getPosition();
                var coordsm = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
                $timeout(function(){
                    $scope.uiStatus.lastPosition = coordsm;
                })
            });

            $scope.$watch('uiStatus.lastPosition', function(nv){
                if(!nv) return;
                updatePositionLayer(nv);
            }, true);


            var orc =olGeolocationService.deviceOrientationControl;
            orc.on("change", function(evt){

                var head = orc.getHeading();
                var v = $scope.map.getView();
                v.setRotation(-head);
            })

            
        };


        $scope.startDeviceOrientation = function(){
            olGeolocationService.startDeviceOrientation();
            $timeout(function(){
                $scope.uiStatus.orientation = true;
            });

            if($scope.uiStatus.lockRotate){
                $scope.unlockRotation();
            }
        }

        $scope.stopDeviceOrientation = function(){
            olGeolocationService.stopDeviceOrientation();
            var v = $scope.map.getView();
            v.setRotation(0);
            $timeout(function(){
                $scope.uiStatus.orientation = false;
            });
        }


        $scope.toggleOrientation = function(){
            if($scope.uiStatus.orientation){
                $scope.stopDeviceOrientation()
            } else {
                $scope.startDeviceOrientation();
            }
        }


        $scope.startGeolocation = function(){
            positionLayer.setVisible(true)
            olGeolocationService.startGeolocation();
            $timeout(function(){
                $scope.uiStatus.gps = true;
            });
        }

        $scope.stopGeolocation = function(){
            positionLayer.setVisible(false)
            olGeolocationService.stopGeolocation();
            $timeout(function(){
                $scope.uiStatus.gps = false;
            });
            if($scope.uiStatus.follow){
                $scope.stopFollow();
            }
        }

        $scope.toggleGeolocation = function(){
            if($scope.uiStatus.gps){
                $scope.stopGeolocation()
            } else {
                $scope.startGeolocation();
            }
        }

        var followHandler;
        $scope.startFollow = function(){

            followHandler = $scope.$watch(
                'uiStatus.lastPosition',
                function(nv){
                    if(!nv) return;
                    var v = $scope.map.getView();
                    v.setCenter(nv);
                },
                true
            );
            
            $timeout(function(){
                $scope.uiStatus.follow = true;
            });
        }

        $scope.stopFollow = function(){
            
            if(followHandler){
                followHandler();
            }

            $timeout(function(){
                $scope.uiStatus.follow = false;
            });
        }

        $scope.toggleFollow = function(){
            if($scope.uiStatus.follow){
                $scope.stopFollow()
            } else {
                $scope.startFollow();
            }
        }


        $scope.lockRotation = function(){
            $scope.map.removeInteraction(mapConfigService.interactionsByName["ol.interaction.DragRotate"]);
            $scope.map.removeInteraction(mapConfigService.interactionsByName["ol.interaction.PinchRotate"]);
            $scope.map.getView().setRotation(0);
            $timeout(function(){
                $scope.uiStatus.lockRotate = true;
            });
            if($scope.uiStatus.orientation){
                $scope.stopDeviceOrientation();
            }

        };

        $scope.unlockRotation = function(){
            $scope.map.addInteraction(mapConfigService.interactionsByName["ol.interaction.DragRotate"]);
            $scope.map.addInteraction(mapConfigService.interactionsByName["ol.interaction.PinchRotate"]);
            $timeout(function(){
                $scope.uiStatus.lockRotate = false;
            });

        };

        $scope.toggleLockRotation = function(){
            if($scope.uiStatus.lockRotate){
                $scope.unlockRotation()
            } else {
                $scope.lockRotation();
            }
        }





        var initMap = function(data){
                //console.log("xxx1")
                mapConfigService.getMapConfig({target:'main-map', maxResolution:data.maxResolution})
                    .then(function(config){
                        var map = mapsManager.createMap('main-map', config);
                        $scope.map = map;
                        var i = map.getInteractions()
                        console.log("xx", i.getArray())
                        _.each(i.getArray(), function(item){
                            console.log(item.toString())
                        })
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