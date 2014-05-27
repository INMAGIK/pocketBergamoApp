(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('mapConfigService', ['$q', function($q){

        var extent = [-101335.5239627529,3874446.969545377,3276569.630015756,6298418.010524886] ;
        var center = [1587617.0530265016,5086432.490035132];

        var setExtent = function(e, proj){
            extent = ol.proj.transform(e, proj, 'EPSG:3857');
        };

        var getExtent = function(){
            return extent;
        };

        var getKlassFromString = function(s){
            var keys = s.split(".");
            var o = window;
            for(var i=0,m=keys.length;i<m;i++){
                o = o[keys[i]];
            }
            return o;
        }

        var inames = ["ol.interaction.DragRotate","ol.interaction.DoubleClickZoom","ol.interaction.DragPan","ol.interaction.PinchRotate","ol.interaction.PinchZoom","ol.interaction.KeyboardPan","ol.interaction.KeyboardZoom","ol.interaction.MouseWheelZoom","ol.interaction.DragZoom"];
        var interactions = [];
        var interactionsByName = {};
        _.each(inames, function(item){
            var klass = getKlassFromString(item);
            var inst = new klass({});
            interactions.push(inst);
            interactionsByName[item] = inst;

        });


        var getMapConfig = function(options){
            
            var deferred = $q.defer();
            var config = {
                target: options.target || 'map',
                ol3Logo : false,
                view: new ol.View2D({
                  //center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
                  //zoom: 4,
                  //center : [37.41, 8.82],
                  
                  maxResolution : options.maxResolution || undefined,
                  maxZoom:8,
                  extent : options.extent || extent,
                }),
                interactions : interactions
                //extent : extent,
                //projection : 'EPSG:3857'
            };
            deferred.resolve(config);
            return deferred.promise;
        };

        var svc = {
            
            getMapConfig : getMapConfig,
            //extent : extent,
            setExtent : setExtent,
            getExtent : getExtent,
            interactionsByName : interactionsByName
        };
        return svc;
    }]);
    

}());