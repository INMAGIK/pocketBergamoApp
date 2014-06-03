(function(){
    'use strict';

    angular.module('pocketMap')
        .directive('tour', ['$rootScope',function($rootScope){
        return {

            restrict : 'A',
            templateUrl : "templates/tour.html",
            link : function(scope, element, attrs) {
                var el = $(element);

                

                scope.$watch('step', function(nv){
                    console.log("nv-step", nv);
                    var pop = $('.help-popup', element);

                    if(nv.highlight){
                        var hi = $(nv.highlight)[0];
                        console.error("hi", hi)
                        var el=$(hi);
                        var position = el.offset();
                        var width =el.width();
                        var height =el.height();
                        console.error("xx", position, width, height);

                        var w = $(window);
                        var ww = w.width();
                        var wh = w.height();

                        console.error("yy", ww,wh)

                        if(nv.insideTarget){
                            pop.css('top', position.top + 50 + "px")
                            pop.css('bottom', wh - (position.top + height) + 50 + "px")

                        } else {
                            if(position.top + height < wh / 2){
                                pop.css('top', position.top + 20 + "px")    
                            } 
                            if(position.top  > wh / 2){
                                pop.css('bottom', wh - (position.top ) + 20 + "px")    
                            } 
                            

                        }


                    } else {

                        pop.css('top', "10%");
                        pop.css('bottom', "10%")

                    }

                }, true)
                

                


            }



        }


    }]);
    

}());