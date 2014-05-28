(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('popupManager', [ '$q', '$http', '$compile', '$rootScope', function($q, $http, $compile,$rootScope){

        var cache = {};
        var svc = {
            config : {},
        };
        
        svc.registerLayer = function(cfg){
            var uid = cfg.uid, 
                options = cfg.uiOptions;
                
            svc.config[uid] = options.popupTemplate;
        };

        svc.getPopupHtml = function(uid, feature){
            var d = $q.defer()
            
            
            var compileTemplate = function(htmlTemplate){
                var s = $rootScope.$new();
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

