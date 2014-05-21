(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('layersManager', ['$rootScope',  'mapsManager', 'mapConfigService',  function($rootScope,mapsManager, mapConfigService){
        var layersForMaps = {};


        var generateUid = function () {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return 'I' + Math.random().toString(36).substr(2, 9);
        };

        var getLayerFromConfig = function(l){
            var lyr = l.layer;
            lyr.set('name', l.name);
            lyr.set('uid', l.uid);
            if(l.group){
                lyr.set('group', l.group);
            }
            lyr.maxExtent = mapConfigService.extent;
            lyr.displayOutsideMaxExtent = false;
            return lyr;
        };

        var getLayerByName = function(mapId, name){
            var layers = layersForMaps[mapId] || [];
            var container  = _.findWhere(layers, {name:name});
            if(container){
                return container.layer;
            }
            return null;
        };

        var getLayerConfigById = function(mapId, id){
            var layers = layersForMaps[mapId] || [];
            var container  = _.findWhere(layers, {id:id});
            if(container){
                return container.layer;
            }
            return null;
        };

        var getLayersByGroup = function(mapId, group){
            var layers = layersForMaps[mapId] || [];
            var containers = _.where(layers, {group:group});
            return _.pluck(containers, 'layer');
        };

        var getGroupComplement = function(mapId, name){
            var layers = layersForMaps[mapId] || [];
            var container  = _.findWhere(layers, {name:name});
            if(container.group){
                var containers = _.where(layers, {group:container.group});
                containers = _.reject(containers, function(item){ return item.name == name});
                return _.pluck(containers, 'layer' );
            }

        };

        var groupLayers = function(mapId){
            var layers = layersForMaps[mapId] || [];
            var doneGroups = [];
            var out = [];
            for(var i=0,n=layers.length;i<n;i++){
                 var l = layers[i];
                 var g = l.group;
                 var pos = doneGroups.indexOf(g)
                 if(pos!=-1){
                    out[pos].layers.push(l);
                 } else {
                    out.push({group:g, layers :[l]});
                    doneGroups.push(g);
                 }

            }

            return out;
        }


        var addLayer = function(mapId, layerConfig){
            layersForMaps[mapId] = layersForMaps[mapId] || [];
            if(!layerConfig.uid){
                layerConfig.uid = generateUid();
            };
            layersForMaps[mapId].push(layerConfig);
            var lyr = getLayerFromConfig(layerConfig);
            mapsManager.maps[mapId].addLayer(lyr);
            var msg = 'layersChange.'+mapId;
            $rootScope.$broadcast(msg);
        };

        var removeLayer = function(mapId, layerConfig){
            var lyr = layerConfig.layer;
            mapsManager.maps[mapId].removeLayer(lyr);
            layersForMaps[mapId] = _.reject(layersForMaps[mapId], function(item){
                return item.name == layerConfig.name;
            })
            var msg = 'layersChange.'+mapId;
            $rootScope.$broadcast(msg);
        };



        var setLayerPosition = function(mapId, oldIndex, newIndex){
            //var uid = layerConfig.uid;
            var layersCollection = mapsManager.maps[mapId].getLayers();
            /*
            var layersArray = layersCollection.getArray();
            position = null;
            for(var i=0,n=layersArray.length;i<n;i++){
                var l = layersArray.getAt(i);
                if (l.get('uid') == uid){
                    position = i;
                    break;
                }
            }

            var lyr = layerConfig.layer;
            //mapsManager.maps[mapId].removeLayer(lyr);
            */
            var lyr = layersCollection.getAt(oldIndex);
            layersCollection.removeAt(oldIndex);
            layersCollection.insertAt(newIndex, lyr);
            //var msg = 'layersChange.'+mapId;
            //$rootScope.$broadcast(msg);

        };


        var svc = {
            layersForMaps : layersForMaps,
            addLayer : addLayer,
            removeLayer : removeLayer,
            getLayerByName : getLayerByName,
            getLayersByGroup : getLayersByGroup,
            groupLayers : groupLayers,
            getGroupComplement : getGroupComplement,
            setLayerPosition : setLayerPosition
        };
        return svc;
    }]);
    

}());