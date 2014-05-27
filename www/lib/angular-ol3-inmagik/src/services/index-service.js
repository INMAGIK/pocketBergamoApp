(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('indexService', [ '$q', '$http', function($q, $http){

        var layers = [];
        var features = {};
        var config = {

        }
        
        var svc = {
            
        };

        svc.registerLayer = function(name, layer, options){
            options = options || { titleField : 'name'};
            layers.push(name);
            config[name] = options;
            layer.on("change", function(l){
                var lfeatures = this.getSource().getFeatures();    
                features[name] = lfeatures;
            });
        };

        svc.getLayers = function(){
            return layers;
        };

        svc.getFeatures = function(layerName){
            var f = features[layerName] || [];
            f = _.map(f, function(i){ var out =  i.getProperties(); return out; })
            var att = config[layerName]['titleField'];
            return _.reject(f, function(item){
                return (!!!item[att]);
            })

        };


        svc.getFeatureTitle = function(layerName, feature){
            //var props = feature.getProperties()
            return feature[config[layerName]['titleField']];
        }

        svc.getTemplateForLayer = function(layerName){
            return config[layerName].cardTemplate;
        }
        

        return svc;
    }]);
    

}());

