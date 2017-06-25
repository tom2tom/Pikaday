/*!
* Pikamonth jQuery plugin.
* Copyright © 2013 David Bushell | BSD & MIT license | https://github.com/dbushell/Pikamonth
*/

(function (root, factory)
{ "usestrict:nomunge";
    'use strict';

    if (typeof exports === 'object') {
        // CommonJS module
        factory(require('jquery'), require('../pikamonth'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'pikamonth'], factory);
    } else {
        // Browser globals
        factory(root.jQuery, root.Pikamonth);
    }
}(this, function ($, Pikamonth)
{ "$:nomunge,Pikamonth:nomunge,usestrict:nomunge";
    'use strict';

    $.fn.pikamonth = function()
    {
        var args = arguments;

        if (!args || !args.length) {
            args = [{ }];
        }

        return this.each(function()
        {
            var self   = $(this),
                plugin = self.data('pikamonth');

            if (!(plugin instanceof Pikamonth)) {
                if (typeof args[0] === 'object') {
                    var options = $.extend({}, args[0]);
                    if (!('field' in options)) {
                        options.field = self[0];
                    }
                    if (!('trigger' in options)) {
                        options.trigger = self[0];
                    }
                    self.data('pikamonth', new Pikamonth(options));
                }
            } else {
                if (typeof args[0] === 'string' && typeof plugin[args[0]] === 'function') {
                    plugin[args[0]].apply(plugin, Array.prototype.slice.call(args,1));
                }
            }
        });
    };

}));
