    (function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('MapCtrl', ['$scope', '$rootScope', '$timeout', 'configManager', 'mapConfigService', 'mapsManager','layersManager', 'layersConfigService', 'olGeolocationService', 
            '$ionicModal', 'popupManager', 'indexService', '$ionicPopup', '$ionicPlatform', 'iconsService', 'bookmarksService',
        function($scope, $rootScope, $timeout, configManager, mapConfigService,mapsManager,layersManager, layersConfigService, olGeolocationService, 
            $ionicModal,popupManager, indexService, $ionicPopup, $ionicPlatform, iconsService, bookmarksService) {

        
        $scope.appInfo = {
            engineVersion : "1.2"
        };
        
        $scope.config = {};

        $rootScope.uiStatus = {
            dataLoaded : true,
            gps:false,
            orientation : false,
            follow : false,
            lastPosition : null,
            lastHeading : null,
            locationInExtent : null,
            lockRotate : false
        };

        $scope.searchStatus = {
            search : '',
            lastSearch : null,
            searchResults : [] ,
            address : true

        };

        $scope.helpShown=false;

        var firstRotation = false;


        //popup stuff
        // An alert dialog
        var showAlert = function(title, msg) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: msg
            });
            //Callback could go here ...
            //alertPopup.then(function(res) {
            //    
            //});
        };
        
        
        //modal stuff
        $scope.modal = null;
        $scope.browser = null;
        $scope.streetsBrowser = null;
        $scope.bookmarksBrowser = null;


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


        //browser modal
        $ionicModal.fromTemplateUrl('templates/browser.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.browser = modal;

        });

        $scope.openBrowser = function() {
            $scope.browser.show();
        };

        $scope.closeBrowser = function() {
            $scope.browser.hide();
        };


        //streetsbrowser modal
        $ionicModal.fromTemplateUrl('templates/streets-browser.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.streetsBrowser = modal;

        });

        $scope.openStreetsBrowser = function() {
            $scope.streetsBrowser.show();
        };

        $scope.closeStreetsBrowser = function() {
            $scope.streetsBrowser.hide();
        };



        //bookmarks modal
        //streetsbrowser modal
        $ionicModal.fromTemplateUrl('templates/bookmarks-browser.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.bookmarksBrowser = modal;

        });

        $scope.openBookmarksBrowser = function() {
            $scope.bookmarksBrowser.show();
        };

        $scope.closeBookmarksBrowser = function() {
            $scope.bookmarksBrowser.hide();
        };


        //Cleanup the modals when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
            $scope.browser.remove();
            $scope.streetsBrowser.remove();
            $scope.bookmarksBrowser.remove();
        });


        $scope.panels = {
            'layers' : false
        };


        $scope.closeAllPanels = function(){
            for(var p in $scope.panels){
                if($scope.panels[p]){
                    $scope.panels[p] = false;
                }
            }
        };


        $scope.togglePanel = function(panelName, closeAll){

            $timeout(function(){
                if(closeAll){
                    for(var p in $scope.panels){
                        if(p==panelName){continue}
                        if($scope.panels[p]){
                            $scope.panels[p] = false;
                        }
                    }
                }
                $scope.panels[panelName] = !$scope.panels[panelName];
            })
        };

        
        var startFromConfig = function(){
            configManager.getConfig('config/config.json')
                .then(function(data){

                    $rootScope.config = data;
                    
                    $scope.appInfo.title = data.app_name;
                    $scope.appInfo.version = data.app_version;

                    mapConfigService.setExtent(data.extent, data.extent_proj);
                    initMap(data);
                    initTour();
                    
                });
        };


        /* geoloc stuff -- move away */
        var positionLayer = null;


        var createPositionLayer = function(){
            var posimg;

            /*
            var setIcon = function(rotation){
                posimg = new ol.style.Icon({
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    //opacity: 0.75,
                    //size : 10,
                    src: 'img/location.png',
                    rotation: rotation,//$scope.map.getView().getRotation(),
                    rotateWithView : false
                });

                var iconStyle = new ol.style.Style({
                  image: posimg
                });
                positionLayer.setStyle(iconStyle);
            }

            $scope.map.getView().on("change:rotation", function(){
                if(!$scope.uiStatus.orientation){
                    setIcon($scope.map.getView().getRotation());
                }
                
            })

            $scope.$watch('uiStatus.lastHeading', function(nv){
                setIcon(nv);
            });

            $scope.$watch('uiStatus.orientation', function(nv){
                if(nv){ return }
                if($scope.uiStatus.lastHeading){
                    setIcon($scope.uiStatus.lastHeading);
                }
            });
            */


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
            posimg = new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                //opacity: 0.75,
                //size : 10,
                src: 'img/location.png',
                rotateWithView:false
            });

            var iconStyle = new ol.style.Style({
              image: posimg
            });            

            var out = new ol.layer.Vector({
                source: vectorSource,
                style : iconStyle,
                visible : true
            });

            return out;
        };


        var openPopup = function(feature){


        };

        var hudOverlay;
        var popupOverlay;



        var createHudOverlay  = function(){

            var element2= document.getElementById('hud');
            hudOverlay = new ol.Overlay({
              element: element2,
              positioning: 'center-center',
              stopEvent: false
            });
            
            $scope.map.addOverlay(hudOverlay);
            hudOverlay.setPosition($scope.map.getView().getCenter())


        };

        var mapClickHandler = null;
        var handlePopup = function(pixel, layerName, props){
            
            var element = document.getElementById('popup');
            
            var candidates = [];
            $scope.map.forEachFeatureAtPixel(pixel,
              function(feature, layer) {
                var uid =  layer.get('uid');
                var name = layer.get('name');
                var condition = (!layerName || (layerName && name==layerName))
                if(popupManager.config[uid] && condition){
                    var out = { feature : feature, layer : layer };
                    candidates.push(out);
                }
            });
          
            if (candidates.length) {
                var configuredFeature;
                if(candidates.length == 1 || props == undefined){
                    configuredFeature = candidates[0];    
                } else {
                    configuredFeature = _.find(candidates, function(item){
                        return item.feature.values_.osm_id == props.osm_id
                    })
                    //last desperate tentative ..
                    if(!configuredFeature){
                        configuredFeature = candidates[0];
                    }
                }
                
                
                
                var feature = configuredFeature.feature;
                var uid = configuredFeature.layer.get('uid');

                var c = $(".popover-content", $(element));
                c.empty();
                $(element).fadeIn()
                
                var geometry = feature.getGeometry();
                var coord = geometry.getCoordinates();
                popupOverlay.setPosition(coord);

                popupManager.getPopupHtml(uid, feature).then(function(html){
                    c.html(html);
                });
                
                $scope.map.unByKey(mapClickHandler);
                mapClickHandler = null;
                
                setTimeout(function(){
                $scope.map.once('click', function(evt) {
                    $(element).fadeOut();
                    evt.preventDefault();
                    mapClickHandler = $scope.map.on('click', function(evt) {
                        handlePopup(evt.pixel);
                    });
                });
                }, 500);
            
            

            
          } else {
            $(element).fadeOut();
          
          }

        };


        var showPopup = function(content, coord, timeout){
            var tm = timeout || 500;
            var element = document.getElementById('popup');
            popupOverlay.setPosition(coord);
             var c = $(".popover-content", $(element));
             c.empty().html(content);
             $(element).fadeIn();

            setTimeout(function(){
                $scope.map.once('click', function(evt) {
                    $(element).fadeOut();
                    evt.preventDefault();
                    
                });
            }, tm);

        };


        var createPopupOverlay  = function(){
            var element = document.getElementById('popup');
            popupOverlay = new ol.Overlay({
                element: element,
                positioning: 'top-center',
                stopEvent: false
            });
            $scope.map.addOverlay(popupOverlay);

            // display popup on click
            mapClickHandler = $scope.map.on('click', function(evt) {
                handlePopup(evt.pixel);
            });
            
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
            
        };
        
        
        var initGeoloc = function(){

            positionLayer = createPositionLayer();
            var cfg = { name : "geolocation", layer:positionLayer };
            layersManager.addLayer('main-map', cfg);


            olGeolocationService.geolocationControl.on('change', 
                function(evt) {
                    var coords = olGeolocationService.geolocationControl.getPosition();
                    var orc =olGeolocationService.deviceOrientationControl;
                    var head = orc.getHeading();

                    var coordsm = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
                    $timeout(function(){
                        $scope.uiStatus.lastPosition = coordsm;
                        $scope.uiStatus.lastHeading = head;

                    })
                }
            );


            olGeolocationService.geolocationControl.on('error', 
                function(error) {
                    $timeout(function(){
                        $scope.stopGeolocation();
                    })
                    showAlert('GPS Error', "Geolocation is disabled! Please enable it if you want to show your position on the map");
                }
            );

            $scope.$watch('uiStatus.lastPosition', function(nv){
                if(!nv) return;

                var ex =mapConfigService.getExtent();
                var contained = ol.extent.containsCoordinate(ex, nv);
                if(!contained){
                    if(contained !== $scope.uiStatus.locationInExtent){
                        $timeout(function(){
                            $scope.uiStatus.locationInExtent = false;
                        });
                        showAlert('Outside map', "Your current location seems to be outside the map.");
                        $scope.stopFollow();
                    }
                } else {
                    if(contained != $scope.uiStatus.locationInExtent){
                        $timeout(function(){
                            $scope.uiStatus.locationInExtent = true;
                        });
                    }
                    
                }
                updatePositionLayer(nv);
            
            }, true);


            var orc =olGeolocationService.deviceOrientationControl;
            orc.on("change", function(evt){
                var head = orc.getHeading();
                if(head == $scope.uiStatus.lastHeading){
                    return
                }

                //var v = $scope.map.getView();
                //v.setRotation(-head);
                if(firstRotation || !$scope.uiStatus.lastHeading){
                    animateRotate(-head);    
                } else {
                    var v = $scope.map.getView();
                    v.setRotation(-head);
                }
                
                firstRotation = false;
                $scope.uiStatus.lastHeading = head;
            });
        };


        $scope.startDeviceOrientation = function(){
            
            firstRotation = true;
            olGeolocationService.startDeviceOrientation();
            $timeout(function(){
                $scope.uiStatus.orientation = true;
            });

            if($scope.uiStatus.lockRotate){
                $scope.unlockRotation();
            }
        };

        $scope.stopDeviceOrientation = function(reset){
            olGeolocationService.stopDeviceOrientation();
            //var v = $scope.map.getView();
            //v.setRotation(0);
            if(reset)animateRotate(0);
            $timeout(function(){
                $scope.uiStatus.orientation = false;
            });
        };


        $scope.toggleOrientation = function(){
            if($scope.uiStatus.orientation){
                $scope.stopDeviceOrientation(true)
            } else {
                $scope.startDeviceOrientation();
            }
        };


        $scope.startGeolocation = function(){
            positionLayer.setVisible(true)
            olGeolocationService.startGeolocation();
            $timeout(function(){
                $scope.uiStatus.gps = true;
            });
        };

        $scope.stopGeolocation = function(){
            positionLayer.setVisible(false)
            olGeolocationService.stopGeolocation();
            $timeout(function(){
                $scope.uiStatus.gps = false;
            });
            if($scope.uiStatus.follow){
                $scope.stopFollow();
            }
        };

        $scope.toggleGeolocation = function(){
            if($scope.uiStatus.gps){
                $scope.stopGeolocation()
            } else {
                $scope.startGeolocation();
            }
        };

        var followHandler;
        $scope.startFollow = function(){

            followHandler = $scope.$watch(
                'uiStatus.lastPosition',
                function(nv){
                    if(!nv) return;
                    var v = $scope.map.getView();
                    animateCenter(nv)
                    //v.setCenter(nv);
                },
                true
            );
            
            $timeout(function(){
                $scope.uiStatus.follow = true;
            });
        };

        $scope.stopFollow = function(){
            
            if(followHandler){
                followHandler();
            }

            $timeout(function(){
                $scope.uiStatus.follow = false;
            });
        };

        $scope.toggleFollow = function(){

            if($scope.uiStatus.follow){
                $scope.stopFollow()
            } else {
                $scope.startFollow();
            }
        };


        var animateRotate = function(targetRotation){

            var v = $scope.map.getView();
            var currentRotation = v.getRotation();
            var totalRotation = Math.abs(currentRotation-targetRotation);
            totalRotation = totalRotation % (2*Math.pi)
            var duration =  500 + totalRotation * 300;

            var rotateAnimation = ol.animation.rotate({
                duration: duration,
                rotation: v.getRotation(),
                easing : ol.easing.linear
            });

            $scope.map.beforeRender(rotateAnimation);
            v.setRotation(targetRotation);
            
        };

        var animateCenter = function(targetCenter){

            var v = $scope.map.getView();
            
            var panAnimation = ol.animation.pan({
                duration: 500,
                source: v.getCenter(),
                easing : ol.easing.linear
            });

            $scope.map.beforeRender(panAnimation);
            v.setCenter(targetCenter);
            
        };

        var animateZoom = function(targetZoom){

            var v = $scope.map.getView();
            
            var zoomAnimation = ol.animation.zoom({
                duration: 500,
                resolution: v.getResolution(),
                easing : ol.easing.linear
            });

            $scope.map.beforeRender(zoomAnimation);
            v.setZoom(targetZoom);
            
        };


        $scope.lockRotation = function(){
            $scope.map.removeInteraction(mapConfigService.interactionsByName["ol.interaction.DragRotate"]);
            $scope.map.removeInteraction(mapConfigService.interactionsByName["ol.interaction.PinchRotate"]);
            
            //$scope.map.getView().setRotation(0);
            animateRotate(0);

            $timeout(function(){
                $scope.uiStatus.lockRotate = true;
            });
            if($scope.uiStatus.orientation){
                $scope.stopDeviceOrientation(false);
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
        };


        var initMap = function(data){
            //console.log("xxx1")
            mapConfigService.getMapConfig({target:'main-map', maxResolution:data.maxResolution, maxZoom:data.maxZoom, minResolution:data.minResolution,})
                .then(function(config){
                    var map = mapsManager.createMap('main-map', config);
                    $scope.map = map;
                    var i = map.getInteractions()
                    var v = map.getView();


                    $scope.lockRotation();
                    
                    v.fitExtent(mapConfigService.getExtent(), map.getSize());

                    //layersManager.addLayer('main-map', layersConfigService.fixedLayers[0]);
                    //map.addLayer(editableVectors.drawTarget);
                    //map.addInteraction(editableVectors.drawInteraction);

                    //adding base layers
                    _.each(data.baseLayers, function(item){
                        var i = layersManager.createLayerConfigFromJson(item);
                        layersManager.addLayer('main-map', i);

                        
                    });

                    //adding vectors
                    _.each(data.vectorLayers, function(item){
                        var cfg = layersManager.createLayerConfigFromJson(item);
                        //var i = layersManager.createObjectFromJson(item);
                        //console.log("adding vector", cfg)
                        if(cfg.uiOptions){
                            if(item.uiOptions.map!=false){
                                layersManager.addLayer('main-map', cfg);
                                if(cfg.uiOptions.popup){
                                    popupManager.registerLayer(cfg)
                                }
                            }
                            if(item.uiOptions.index){
                                indexService.registerLayer(cfg)
                            }
                        }
                    });

                    initGeoloc();
                    createPopupOverlay();
                    //createHudOverlay();
                    createBookmarksLayer();
                    prepareEvents();

                    $timeout(function(){
                        $scope.uiStatus.dataLoaded = true;
                        if(navigator.splashscreen){
                                   setTimeout(function() { 
                                navigator.splashscreen.hide();
                            }, 1000);
                        }
                    });
                });

            };

            var createBookmarksLayer = function(){
                var cfg = bookmarksService.getBookmarksLayerCfg();
                console.log("c", cfg)
                layersManager.addLayer('main-map', cfg);
                indexService.registerLayer(cfg);
                popupManager.registerLayer(cfg);
                bookmarksService.reload()


            };

            var prepareEvents  = function(){
                $scope.map.on('moveend',onMove );

                var timeoutId = -1;
                var startPixel;

                return;
                // #TODO: the following part handles log tap event
                // disabled for now

                var v = $scope.map.getViewport();

                v.addEventListener('touchstart', function(event) {
                    clearTimeout(timeoutId);
                    startPixel = $scope.map.getEventPixel(event);
                    
                    timeoutId = setTimeout(function() {
                        $rootScope.$broadcast('longTapOnMap', startPixel);
                    }, 800, false);
                });
                v.addEventListener('touchend', function(event) {
                    clearTimeout(timeoutId);
                    startPixel = undefined;
                });
                
                v.addEventListener('touchmove', function(event) {
                    if (startPixel) {
                        var pixel = $scope.map.getEventPixel(event);
                        var deltaX = Math.abs(startPixel[0] - pixel[0]);
                        var deltaY = Math.abs(startPixel[1] - pixel[1]);
                        if (deltaX + deltaY > 6) {
                            clearTimeout(timeoutId);
                            startPixel = undefined;
                        }
                    }
                });

            };

            var onMove = function(evt){
                var bounds = $scope.map.getView().calculateExtent($scope.map.getSize());
                var center = $scope.map.getView().getCenter();
                //hudOverlay.setPosition(center)
                //console.log(2, evt)
                /*
                $timeout(function(){
                    $scope.mapState.bounds = bounds; 
                    $scope.mapState.center = center; 
                });
                */
                
            };

            $scope.openBrowserOnFeature = function(layerName, feature){
                $rootScope.$broadcast("browserToFeature", layerName, feature);
            };


            $rootScope.getDistanceFromLastPos = function(geom){
                if($scope.uiStatus.lastPosition){
                    var p = geom.flatCoordinates;
                    var s = ol.sphere.WGS84;
                    
                    var sp = ol.proj.transform(p, 'EPSG:3857', 'EPSG:4326');
                    var ss = ol.proj.transform($scope.uiStatus.lastPosition, 'EPSG:3857', 'EPSG:4326');
                    //console.log("p", $scope.uiStatus.lastPosition, p, sp, ss);
                    return s.haversineDistance(sp, ss) / 1000;
                } 
                return null;
            };


            $scope.orderDistanceFunction = function(feature) {
                 return $rootScope.getDistanceFromLastPos(feature.geometry)
            };


            //listener ... from browser
            $scope.$on('centerBrowserFeature', function(evt,data, layerName){
                var v = $scope.map.getView();
                var pos = data.geometry.getExtent()
                var c = [(pos[2]+pos[0])/2.0, (pos[3] + pos[1])/2.0,  ];
                animateCenter(c);

                var czoom =  v.getZoom();
                if(czoom < 7){
                    animateZoom(7);    
                }
                //close browser
                $scope.closeBrowser();

                if(layerName){
                    var l = layersManager.getLayerByName('main-map', layerName);
                    l.setVisible(true);
                };
                
                setTimeout(function(){
                    var coords = $scope.map.getPixelFromCoordinate(c)
                    handlePopup(coords,layerName, data);
                    $scope.closeAllPanels();
                }, 1000);
            });


            //listener ... from bookmarks
            //#TODO: REFACTOR - copied from abone
            $scope.$on('centerBookmarksFeature', function(evt,data, layerName){
                var v = $scope.map.getView();
                var pos = data.geometry.getExtent()
                var c = [(pos[2]+pos[0])/2.0, (pos[3] + pos[1])/2.0,  ];
                animateCenter(c);

                var czoom =  v.getZoom();
                if(czoom < 7){
                    animateZoom(7);    
                }
                //close browser
                $scope.closeBookmarksBrowser();

                if(layerName){
                    var l = layersManager.getLayerByName('main-map', layerName);
                    l.setVisible(true);
                };
                
                setTimeout(function(){
                    var coords = $scope.map.getPixelFromCoordinate(c)
                    handlePopup(coords,layerName, data);
                    $scope.closeAllPanels();
                }, 1000);
            });


            $scope.$on('centerSearchFeature', function(evt,data, layerName){

                var v = $scope.map.getView();
                var pos = data.geometry.getExtent()
                var c = [(pos[2]+pos[0])/2.0, (pos[3] + pos[1])/2.0,  ];

                if(layerName){
                    var l = layersManager.getLayerByName('main-map', layerName);
                    if(l){
                        l.setVisible(true);    
                    }
                };

                animateCenter(c);
                var czoom =  v.getZoom();
                if(czoom < 7){
                    animateZoom(7);    
                }
                //close browser
                $scope.togglePanel('search')

                setTimeout(function(){
                    var coords = $scope.map.getPixelFromCoordinate(c)
                    handlePopup(coords, layerName);
                    $scope.closeAllPanels();
                },1000);
                

            });


            $scope.$on('centerStreet', function(evt,data){
                $scope.closeStreetsBrowser();
                var fo = new ol.format.GeoJSON()
                var f = fo.readFeature(data); 
                var pos = f.getGeometry().getExtent()
                var c = [(pos[2]+pos[0])/2.0, (pos[3] + pos[1])/2.0,  ];
                animateCenter(c);

                var czoom =  $scope.map.getView().getZoom();
                if(czoom < 7){
                    animateZoom(7);    
                }
                console.log("x", c)
                showPopup("<p class='text-center'><br>"+data.properties.name + "<br>" + 
                    data.properties.municipality + "<br><i>(approximate position)</i></p>" , c);

            });


            $scope.$on('showMeInBrowser', function(evt,feature,options){
                $scope.closeAllPanels();
            });


            $scope.$on('longTapOnMap', function(evt, pixel){
                var coords = $scope.map.getCoordinateFromPixel(pixel);
                var feature = bookmarksService.createFeature(coords);
                bookmarksService.addFeature(feature);


            });


            $scope.showHelp = function(){
                $scope.helpShown = true;
            };


            $scope.toggleHelp = function(){
                $scope.helpShown = !$scope.helpShown;
            };


            var initTour = function(){

                if(!window.localStorage.getItem('has_run')) {
                    //do some stuff if has not loaded before
                    $scope.showHelp();
                    window.localStorage.setItem('has_run', 'true');
                }
                
            };

            //initialization
            $ionicPlatform.ready(function(){
                layersManager.setStyleProviderFunction(iconsService.styleProviderFunction)
                startFromConfig();    
            });



    }]);


}());