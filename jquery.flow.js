jQuery.fn.flow = (function() {
    var $ = jQuery;
    
    var els = [];
    
    var addElement = function (el, params) {
        var $el = $(el);
        var vars = {
            el: $el,
            height: $el.height
        };
        
        if (params === undefined)
            params = {};
        
        /*params = $.extend({
            position: 'top'
        }, params);*/
        
        if ($.inArray(params.position, ['top', 'center', 'bottom']) == -1)
            params.position = 'top';
        
        if (params.parent !== undefined)
            vars.parent = $(params.parent) .first();
        else
            vars.parent = $el .parent();
        
        vars.position = params.position;
        vars.height = $el .height();
        vars.parentTop = vars.parent .offset() .top;
        vars.parentBottom = vars.parentTop + vars.parent .height();
        
        $el .css({
            display: 'block',
            position: 'absolute',
            top: $el .offset() .top
        });
        
        els.push(vars);
    };
    
    var recalcFlow = function() {
        var $window = $(window);
        
        var screen = {
            top:    $window .scrollTop(),
            height: $window .height()
        };
        screen.bottom = screen.top + screen.height;
        
        for (var i=0; i < els.length; ++i) {
            var el = els[i];
            
            var topEdge    = Math.max(screen.top, el.parentTop);
            var bottomEdge = Math.min(screen.bottom, el.parentBottom);
            
            var newTop = topEdge;
            
            switch (el.position) {
                case 'top':
                    newTop = topEdge;
                    break;
                case 'center':
                    newTop = topEdge + ((bottomEdge - topEdge) - el.height)/2;
                    break;
                case 'bottom':
                    newTop = bottomEdge - el.height;
                    break;
            }
            
            newTop = Math.min(newTop, bottomEdge - el.height);
            newTop = Math.max(newTop, el.parentTop);
            
            el.el.css({top: newTop});
        }
    };
    
    $(function($){
        // Init function
        
        $(window)
            .scroll(recalcFlow)
            .resize(recalcFlow);
        
        $('[data-flow]') .each(function(){
            var params = {};
            $.each($(this) .data('flow') .split(','), function(i, param){
                param = param.split('=');
                if (param.length == 2) {
                    params[param[0]] = /^\d+$/.test(param[1]) ? parseInt(param[1], 10) : param[1];
                }
            });
            
            addElement(this, params)
        });
        
        recalcFlow();
    });
    
    return {
        addElement: addElement
    };
})();