(function(){
    'use strict';

    angular.module('pocketMap')
        .directive('featureCat', ['$rootScope','layersManager', function($rootScope, layersManager){
        return {

            restrict : 'A',
            scope : {feature:"="},
            template : "<span ng-if='feature._category'> <b>{{feature._category|human}}</b></span>",
            link : function(scope, element, attrs) {

            }



        }


    }]);
    

}());