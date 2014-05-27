(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('indexService', [ '$q', '$http', function($q, $http){

        var layers = [];
        var features = {};
        var config = {};
        
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

        svc.getConfigForLayer = function(layerName, key){
            return config[layerName][key];
        }

        svc.getFeatures = function(layerName){
            var f = features[layerName] || [];
            
            var att = config[layerName]['titleField'];
            var ico = config[layerName]['icon'];

            f = _.map(f, function(i){ 
                var out =  i.getProperties();

                out._title = out[att];
                out._icon = ico;
                
                return out; 
            });
            
            
            
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

        
        var searchLayer = function(layerName, term){
            var out = svc.getFeatures(layerName);
            return _.reject(out, function(item){
                return (item[config[layerName]['titleField']].indexOf(term) == -1);
            })
        
        };

        svc.searchFeatures = function(searchTerm){
            var out = [];
            _.each(layers, function(layer){
                var att = config[layer]['titleField'];
                var ico = config[layer]['icon'];
                var features = searchLayer(layer, searchTerm);
                var x = _.map(features, function(item){
                    return {layerName:layer, feature:item, title:item[att], icon:ico}
                })
                out = out.concat(x);
            })

            return out;
        }
        

        return svc;
    }]);
    

}());

