(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('bookmarksService', [ '$rootScope', '$q', '$http', 'indexService', 'layersManager',  function($rootScope, $q, $http, indexService, layersManager){

        
        var svc = {
            bookmarksDb : new PouchDB('bookmarks'),
            loaded : false,
            bookmarks : [],
            bookmarksIds : {}
        };


        
        svc.bookmarksLayerSource = new ol.source.Vector({
                            features:[]
                        });

        svc.bookmarksLayer = new ol.layer.Vector(
                    {
                        source : svc.bookmarksLayerSource
                    });



        svc.getBookmarksLayerCfg = function(){
            var cfg = {
                name : "Bookmarks",
                group : "vectors",
                layer : svc.bookmarksLayer,
                uiOptions : {
                    index : true,
                    popup : true,
                    browser : true,
                    popupTemplate  : "templates/bookmark-feature.html",
                    cardTemplate : "templates/card-example.html",
                    titleField : "display_name",
                    icon : "img/icons/water.png",
                    description : "Your bookmarks"
                }

            };
            return cfg;
        };


        svc.addFeature = function(feature){
            return svc.bookmarksLayerSource.addFeature(feature);
        };

        var generateUid = function () {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return 'I' + Math.random().toString(36).substr(2, 9);
        };

        svc.createFeature = function(coords){

            var feature = new ol.Feature({ 
                geometry: new ol.geom.Point(coords), 
                display_name : "Some bookmark",
                osm_id : generateUid()
            });
                
            return feature;
        };





        svc.loadBookmarks = function(){
            var deferred = $q.defer();
            svc.bookmarksDb.allDocs({include_docs: true}).
            then(function(resp){
                svc.bookmarksIds = {};
                var docs = _.pluck(resp.rows, 'doc');
                _.each(docs, function(item){
                    svc.bookmarksIds[item._id] = true;
                })
                deferred.resolve(docs)
            })
            return deferred.promise;
        }


        svc.loadStreets = function(url){
            var deferred = $q.defer();
            if(svc.streetsLoaded){
                deferred.resolve(svc.streetsLoaded);
            } else {
                $.ajax({url:url, method:'GET', dataType:'json'}).then(function(data){
                    svc.streetsLoaded = true;
                    svc.streetsData = data;
                    deferred.resolve(data);
                });
            }
            

            return deferred.promise;
        };

        svc.generateIdForFeature = function(feat){
            var out = ''
            if(feat.osm_id){
                out += feat.osm_id;
            }
            if(feat.place_id){
                out += feat.place_id;
            }
            return out;
        }

        svc.addBookmark = function(feature){
            var deferred = $q.defer();
            var _id = svc.generateIdForFeature(feature);
            
            var doc = {
                _id : _id,
                feature : {
                    _layerName : feature._layerName,
                    _title : feature._title,
                    osm_id : feature.osm_id,
                    place_id : feature.place_id,
                    geometry  : {
                        flatCoordinates : feature.geometry.flatCoordinates
                    }

                }
            };

            
            svc.bookmarksDb.post(doc, {include_docs:true}).then(function(response){
                svc.bookmarksIds[response.id] = true;
                $rootScope.$broadcast('bookmarksLoaded');
                deferred.resolve(true);
            });

            return deferred.promise;

        };

        svc.getFeature = function(bookmarkFeature){
            if(bookmarkFeature._layerName){
                var f = indexService.getFeatureFromData(
                    bookmarkFeature._layerName, 
                    {osm_id: bookmarkFeature.osm_id}
                );
                return f;
            }
        };


        svc.removeBookmark= function(feature){
            var deferred = $q.defer();
            var _id = svc.generateIdForFeature(feature);
            svc.bookmarksDb.get(_id).then(function(doc) {
                svc.bookmarksDb.remove(doc)
                .then(function(r){
                    deferred.resolve(r)
                })
            }).catch(function(err){
                //errors
            });
            return deferred.promise;
        };

        svc.isBookmark = function(feature){
            var _id = svc.generateIdForFeature(feature);
            return svc.bookmarksIds[_id];
        };


        svc.reload = function(){
            console.log("RELOAD TRIGGERED")
            svc.loadBookmarks().then(function(resp){
                svc.loaded = true;
                svc.bookmarks = resp;
                $rootScope.$broadcast('bookmarksLoaded');

                //updating source
                //#TODO: remove from here
                _.each(svc.bookmarks, function(item){
                    console.log("x", item)
                    var layerName = item.feature._layerName;
                    var feature = indexService.getRawFeature(layerName, {osm_id:item.feature.osm_id})
                    console.log("ii", item, feature)

                    

                    
                    svc.addFeature(feature);
                })

            });

        }





        return svc;
    }]);
    

}());

