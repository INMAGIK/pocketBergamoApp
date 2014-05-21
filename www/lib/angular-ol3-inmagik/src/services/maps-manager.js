(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('mapsManager', [ function(){
        var maps = {};
        var createMap = function(mapId, config){
            maps[mapId] = new ol.Map(config);
            //fixing map extent
            var v = maps[mapId].getView();
            //var extent = config.extent;
            //v.fitExtent(extent, maps[mapId].getSize() );
            //console.log(extent, maps[mapId].getView().calculateExtent(maps[mapId].getSize()));
            //var res = v.getResolution();
            //console.log("res", res)
            return maps[mapId];
        };

        var svc = {
            maps : maps,
            createMap : createMap
        };
        return svc;
    }]);
    

}());