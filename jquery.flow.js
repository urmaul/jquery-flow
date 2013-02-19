jQuery.flow = (function() {
    var $ = jQuery;
    
    var els = [];
    
    var flow = {};
    
    var getInt = function(value, defval, map) {
        if (isNaN(value)) {
            if (map && map[value] !== undefined)
                return map[value];
            
            return 0;
            
        } else
            return parseInt(value);
    };
    
    var addElement = function (el, params) {
        var $el = el instanceof jQuery ? el : $(el);
        
        if ($el.length == 0)
            return;
        
        var vars = {
            el: $el,
            height: $el.height
        };
        
        if (params === undefined)
            params = {};
        
        params = $.extend({
            screenMargin: 0,
            margin: 0
        }, params);
        
        // position
        if ($.inArray(params.position, ['top', 'center', 'bottom']) == -1)
            params.position = 'top';
        vars.position = params.position;
        
        // minTop
        vars.minTop = getInt(params.minTop, 0, {current: $el .offset() .top});
        
        // parent
        var $parent;
        if (params.parent !== undefined)
            $parent = $(params.parent) .first();
        else
            $parent = $el .parent();
        vars.parent = $parent;
        
        // sizes
        var onResizeElement = function() {
            vars.height = $el .height();
        };
        var onResizeParent = function() {
            vars.parentTop = $parent .offset() .top;
            vars.parentBottom = vars.parentTop + $parent .height();
        };
        onResizeElement();
        onResizeParent();
        
        $el     .resize(onResizeElement);
        $parent .resize(onResizeParent);
        
        // margins
        vars.screenMargin = getInt(params.screenMargin, 0);
        vars.margin = getInt(params.margin, 0);
        
        
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
            
            var topEdge    = Math.max(screen.top + el.screenMargin, el.parentTop) + el.margin;
            var bottomEdge = Math.min(screen.bottom - el.screenMargin, el.parentBottom) - el.margin;
            
            var newTop = topEdge;
            
            switch (el.position) {
                case 'top':
                    newTop = topEdge;
                    break;
                case 'center':
                    topEdge    = Math.max(screen.top, el.parentTop) + el.margin;
                    bottomEdge = Math.min(screen.bottom, el.parentBottom) - el.margin;
                    newTop = topEdge + ((bottomEdge - topEdge) - el.height)/2;
                    newTop = Math.max(newTop, screen.top + el.screenMargin);
                    newTop = Math.min(newTop, screen.bottom - el.screenMargin - el.height);
                    break;
                case 'bottom':
                    newTop = bottomEdge - el.height;
                    break;
            }
            
            newTop = Math.min(newTop, bottomEdge - el.height);
            newTop = Math.max(newTop, el.parentTop + el.margin, el.minTop);
            
            el.el.css({top: newTop});
        }
    };
    
    $(function($){
        // Init function
        
        $(window)
            .scroll(recalcFlow)
            .resize(recalcFlow);
        
        $('[data-flow]') .each(function(){
            var $this = $(this);
            var params = {};
            $.each($this .data('flow') .split(','), function(i, param){
                param = param.split('=');
                if (param.length == 2) {
                    params[param[0]] = /^\d+$/.test(param[1]) ? parseInt(param[1], 10) : param[1];
                }
            });
            
            addElement(this, params)
        });
        
        recalcFlow();
    });
    
    $.extend(flow, {
        addElement: addElement
    });
    
    return flow;
})();