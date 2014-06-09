(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('indexService', [ '$q', '$http', 'iconsService', function($q, $http, iconsService){

        var layers = [];
        var features = {};
        var config = {};
        
        var svc = {
            
        };

        svc.registerLayer = function(cfg){
            var name=cfg.name, 
                layer = cfg.layer, 
                options=cfg.uiOptions;
            
            options = options || { titleField : 'name'};
            options.layerName = name;
            config[name] = options;
            layers.push(name);
            
            layer.on("change", function(l){
                var lfeatures = this.getSource().getFeatures();    
                features[name] = lfeatures;
            });


            var s = layer.getStyle();

            var s2 = function(item){
                console.log("x1x1x", item);
                return s;
            }

            delete layer.style_;
            /*
            s.image_ = new ol.style.Icon({
                src : "/img/icons/tourism.png",//s.image_.iconImage_.src_,
                radius : 4
            })
            */


            



        };








        svc.getLayers = function(filter){
            if(!filter){
                return layers;    
            }
            
            var cgfs =  _.map(config, function(item){return item});
            var fl = _.where(cgfs, filter);
            return _.pluck(fl, "layerName");

        };

        svc.getLayersWithOptions = function(filter){
            var layersNames = svc.getLayers(filter);
            var out = _.map(layersNames, function(item){
                return { name : item, options : config[item]}
            })
            return out;

        };




        svc.getConfigForLayer = function(layerName, key){
            return config[layerName][key];
        }

        svc.getFeatures = function(layerName){
            var f = features[layerName] || [];
            
            var att = config[layerName]['titleField'];
            var ico = config[layerName]['icon'];
            var cat = config[layerName]['categoryField'];

            f = _.map(f, function(i){ 
                var out =  i.getProperties();
                //out['geometry'] = i.getGeometry();
                
                out._title = out[att];
                out._icon = ico;
                out._layerName = layerName;

                
                if(cat){
                    out._category = out[cat];
                    var icon2 = iconsService.getIcon(out[cat]);
                    if(icon2){
                        out._icon = icon2;
                    }
                }
                
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

        
        var searchLayer = function(layerName, term, field){
            var l = term.toLowerCase()
            var out = svc.getFeatures(layerName);
            return _.reject(out, function(item){
                var fieldName = field || config[layerName]['titleField'];
                var t = item[fieldName];
                t = t || '';
                t = t.toLowerCase();
                
                return (t.indexOf(l) == -1);
            });
        
        };

        svc.searchLayer = searchLayer;

        svc.searchFeatures = function(searchTerm, field){
            var out = [];
            _.each(layers, function(layer){
                var att = config[layer]['titleField'];
                var cat = config[layer]['categoryField'];
                var ico = config[layer]['icon'];

                var icon2 = iconsService.getIconForConfig(config['layerName']);



                var features = searchLayer(layer, searchTerm, field);
                var x = _.map(features, function(item){
                    if(cat){
                        var icon2 = iconsService.getIcon(out[cat]);
                        if(icon2){
                            ico = icon2;
                        }
                    }
                    return {layerName:layer, feature:item, title:item[att], icon:ico, _category: item[cat]};
                })
                out = out.concat(x);
            })

            return out;
        }
        

        return svc;
    }]);
    

}());

