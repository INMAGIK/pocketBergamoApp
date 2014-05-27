(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('popupManager', [ '$q', '$http', '$compile', '$rootScope', function($q, $http, $compile,$rootScope){

        var cache = {};
        var svc = {
            config : {},
        };
        
        svc.registerLayer = function(uid, templateUrl){
            svc.config[uid] = templateUrl;
        };

        svc.getPopupHtml = function(uid, feature){
            var d = $q.defer()
            
            
            var compileTemplate = function(htmlTemplate){
                var s = $rootScope.$new();
                console.error("c", feature)
                s.feature = feature;
                var html = $compile(htmlTemplate)(s);
                d.resolve(html);
            };

            if(cache[uid]){
                var htmlTemplate = cache[uid];
                compileTemplate(htmlTemplate);

            } else {
                var templateUrl = svc.config[uid];
                $http.get(templateUrl).then(function(data){
                    cache[uid] = data.data;
                    compileTemplate(data.data);
                });
            }
            

            return d.promise;
        }
        

        
        return svc;
    }]);
    

}());

