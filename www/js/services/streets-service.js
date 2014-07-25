(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('streetsService', [ '$q', '$http', function($q, $http){

        
        var svc = {
            streetsLoaded : false,
            streetsData : []

        };


        svc.loadStreets = function(url){
            var deferred = $q.defer();
            if(svc.streetsLoaded){
                deferred.resolve(svc.streetsLoaded);
            } else {
                $.get(url).then(function(data){
                    svc.streetsLoaded = true;
                    svc.streetsData = data;
                    deferred.resolve(data);
                });
            }
            

            return deferred.promise;
        }


        return svc;
    }]);
    

}());

