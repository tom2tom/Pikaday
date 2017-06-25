/*!
 * Pikamonth - derived from Pikaday
 * Copyright © 2014 David Bushell | BSD & MIT license | https://github.com/dbushell/Pikamonth
 */
(function(root, factory) { "nomunge:usestrict";
    'use strict';

    var moment;
    if (typeof exports === 'object') {
        // CommonJS module
        // Load moment.js as an optional dependency
        try {
            moment = require('moment');
        } catch (e) {}
        module.exports = factory(moment);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function(req) {
            // Load moment.js as an optional dependency
            var id = 'moment';
            try {
                moment = req(id);
            } catch (e) {}
            return factory(moment);
        });
    } else {
        root.Pikamonth = factory(root.moment);
    }
}(this, function(moment) { "defaults:nomunge, opts:nomunge, Pikamonth:nomunge, nomunge:usestrict";
    'use strict';
    /**
     * feature detection and helper functions
     */
    var hasMoment = typeof moment === 'function',

        hasEventListeners = !!window.addEventListener,

        document = window.document,

        sto = window.setTimeout,

        addEvent = function(el, e, callback, capture) {
            if (hasEventListeners) {
                el.addEventListener(e, callback, !!capture);
            } else {
                el.attachEvent('on' + e, callback);
            }
        },

        removeEvent = function(el, e, callback, capture) {
            if (hasEventListeners) {
                el.removeEventListener(e, callback, !!capture);
            } else {
                el.detachEvent('on' + e, callback);
            }
        },

        fireEvent = function(el, eventName, data) {
            var e;

            if (document.createEvent) {
                e = document.createEvent('HTMLEvents');
                e.initEvent(eventName, true, false);
                e = extend(e, data);
                el.dispatchEvent(e);
            } else if (document.createEventObject) {
                e = document.createEventObject();
                e = extend(e, data);
                el.fireEvent('on' + eventName, e);
            }
        },

        trim = function(str) {
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
        },

        hasClass = function(el, cn) {
            return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
        },

        addClass = function(el, cn) {
            if (!hasClass(el, cn)) {
                el.className = (el.className === '') ? cn : el.className + ' ' + cn;
            }
        },

        removeClass = function(el, cn) {
            el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
        },

        isArray = function(obj) {
            return (/Array/).test(Object.prototype.toString.call(obj));
        },

        isDate = function(obj) {
            return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
        },

        setToStartOfMonth = function(date) {
            if (isDate(date)) {
                var y = date.getFullYear(),
                    m = date.getMonth();
                date.setFullYear(y, m);
            }
        },

        // to ensure correct result, derive a,b from setToStartOfMonth()
        compareDates = function(a, b) {
            return a.getTime() === b.getTime();
        },

        extend = function(to, from, overwrite) {
            var prop, hasProp;
            for (prop in from) {
                hasProp = to[prop] !== undefined;
                if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
                    if (isDate(from[prop])) {
                        if (overwrite) {
                            to[prop] = new Date(from[prop].getTime());
                        }
                    } else if (isArray(from[prop])) {
                        if (overwrite) {
                            to[prop] = from[prop].slice(0);
                        }
                    } else {
                        to[prop] = extend({}, from[prop], overwrite);
                    }
                } else if (overwrite || !hasProp) {
                    to[prop] = from[prop];
                }
            }
            return to;
        },

        momentGet = function(target,fmt) {
            var str = moment(target,fmt);
            return (str && str.isValid()) ? str.toDate() : null;
        },

        momentFormat = function(target,fmt) {
            return moment(target).format(fmt);
        },

        /**
         * defaults and localisation
         */
        defaults = {
            // bind the picker to a form field
            field: null,

            // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
            bound: undefined,

            // position of the datepicker, relative to the field (default to bottom & left)
            // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
            position: 'bottom left',

            // automatically fit in the viewport even if it means repositioning from the position option
            reposition: true,

            // the default output format for `.toString()` and `field` value
            format: 'YYYY-MM',

            // the default month-names are short-form
            abbr: true,

            // the initial date to view when first opened
            defaultDate: null,

            // make the `defaultDate` the initial selected value
            setDefaultDate: false,

            // the minimum/earliest date that can be selected
            minDate: null,
            // the maximum/latest date that can be selected
            maxDate: null,

            // number of years either side, or array of upper/lower range
            yearRange: 10,

            // used internally (don't config outside)
            minYear: 0,
            maxYear: 9999,

            isRTL: false,

            // Additional text to append to the year in the calendar title
            yearSuffix: '',

            // Specify a DOM element to render the calendar in
            container: undefined,

            // internationalization
            i18n: {
                previousYear: 'Previous Year',
                nextYear: 'Next Year',
                months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },

            // date-processor functions
            getdate: null,
            reformat: null,
            // callback functions
            onSelect: null,
            onOpen: null,
            onClose: null,
            onDraw: null
        },

        /**
         * templating functions to abstract HTML rendering
         */
        renderMonth = function(opts, m, y, isSelected, isCurrent, isDisabled) {
            var arr = [],
                cls,
                name;
            if (isDisabled) {
                arr.push('is-disabled');
            }
            if (isCurrent) {
                arr.push('is-today');
            }
            if (isSelected) {
                arr.push('is-selected');
            }
            cls = (arr.length > 0) ? ' class="' + arr.join(' ') + '"' : ''; 
            name = opts.abbr ? opts.i18n.monthsShort[m] : opts.i18n.months[m];
            return '<td data-month="' + m + '"' + cls + '>' +
                '<button class="pika-button pika-text" ' +
                'data-pika-year="' + y + '" data-pika-month="' + m + '" data-pika-day="1">' +
                name + '</button></td>';
        },

        renderRow = function(days, isRTL) {
            return '<tr>' + (isRTL ? days.reverse() : days).join('') + '</tr>';
        },

        renderBody = function(rows) {
            return '<tbody>' + rows.join('') + '</tbody>';
        },

        renderTitle = function(instance, year) {
            var i, j, arr, txt,
                opts = instance._o,
                isMinYear = year === opts.minYear,
                isMaxYear = year === opts.maxYear,
                html = '<div class="pika-title">';

            txt = opts.i18n.previousYear;
            html += '<button class="pika-prev' + (isMinYear ? ' is-disabled' : '') + '" type="button" title="' + txt + '">' + txt + '</button>';

            if (isArray(opts.yearRange)) {
                i = opts.yearRange[0];
                j = opts.yearRange[1] + 1;
            } else {
                i = year - opts.yearRange;
                j = 1 + year + opts.yearRange;
            }

            for (arr = []; i < j && i <= opts.maxYear; i++) {
                if (i >= opts.minYear) {
                    arr.push('<option value="' + i + '"' + (i === year ? ' selected' : '') + '>' + (i) + '</option>');
                }
            }

            html +='<div class="pika-label"><select class="pika-select pika-select-year">' + arr.join('') + '</select></div>';

            txt = opts.i18n.nextYear;
            html += '<button class="pika-next' + (isMaxYear ? ' is-disabled' : '') + '" type="button" title="' + txt + '">' + txt + '</button>';

            return html + '</div>';
        },

        renderTable = function(opts, data) {
            return '<table class="pika-table">' + renderBody(data) + '</table>';
        },

        /**
         * Pikamonth constructor
         */
        Pikamonth = function(options) {
            var self = this,
                opts = self.config(options);

            self._onMouseDown = function(e) {
                if (!self._v) {
                    return;
                }
                e = e || window.event;
                var target = e.target || e.srcElement;
                if (!target) {
                    return;
                }

                if (!hasClass(target, 'is-disabled')) {
                    if (hasClass(target, 'pika-button') && !hasClass(target, 'is-empty')) {
                        self.setDate(new Date(target.getAttribute('data-pika-year'), target.getAttribute('data-pika-month'), target.getAttribute('data-pika-day')), false);
                        if (opts.bound) {
                            sto(function() {
                                self.hide();
                                if (opts.field) {
                                    opts.field.blur();
                                }
                            }, 100);
                        }
                        return;
                    } else if (hasClass(target, 'pika-prev')) {
                        self.prevYear();
                    } else if (hasClass(target, 'pika-next')) {
                        self.nextYear();
                    }
                }
                if (!hasClass(target, 'pika-select')) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                        return false;
                    }
                } else {
                    self._c = true;
                }
            };

            self._onChange = function(e) {
                e = e || window.event;
                var target = e.target || e.srcElement;
                if (!target) {
                    return;
                }
                if (hasClass(target, 'pika-select-year')) {
                    self.gotoYear(target.value);
                }
            };

            self._onInputChange = function(e) {
                var date;

                if (e.firedBy === self) {
                    return;
                }
                if (typeof opts.getdate === 'function') {
                    date = opts.getdate.call(this,opts.field.value,opts.format);
                } else {
                    date = new Date(Date.parse(opts.field.value));
                }
                self.setDate(isDate(date) ? date : null);
                if (!self._v) {
                    self.show();
                }
            };

            self._onInputFocus = function() {
                self.show();
            };

            self._onInputClick = function() {
                self.show();
            };

            self._onInputBlur = function() {
                // IE allows pika div to gain focus; catch blur the input field
                var pEl = document.activeElement;
                do {
                    if (hasClass(pEl, 'pika-single')) {
                        return;
                    }
                }
                while ((pEl = pEl.parentNode));

                if (!self._c) {
                    self._b = sto(function() {
                        self.hide();
                    }, 50);
                }
                self._c = false;
            };

            self._onClick = function(e) {
                e = e || window.event;
                var target = e.target || e.srcElement,
                    pEl = target;
                if (!target) {
                    return;
                }
                if (!hasEventListeners && hasClass(target, 'pika-select')) {
                    if (!target.onchange) {
                        target.setAttribute('onchange', 'return;');
                        addEvent(target, 'change', self._onChange);
                    }
                }
                do {
                    if (hasClass(pEl, 'pika-single') || pEl === opts.trigger) {
                        return;
                    }
                }
                while ((pEl = pEl.parentNode));
                if (self._v && target !== opts.trigger && pEl !== opts.trigger) {
                    self.hide();
                }
            };

            self.el = document.createElement('div');
            self.el.className = 'pika-single' + (opts.isRTL ? ' is-rtl' : '');

            addEvent(self.el, 'mousedown', self._onMouseDown, true);
            addEvent(self.el, 'change', self._onChange);

            if (opts.field) {
                if (opts.container) {
                    opts.container.appendChild(self.el);
                } else if (opts.bound) {
                    document.body.appendChild(self.el);
                } else {
                    opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
                }
                addEvent(opts.field, 'change', self._onInputChange);

                if (!opts.defaultDate && opts.field.value) {
                    if (typeof opts.getdate === 'function') {
                        opts.defaultDate = opts.getdate.call(this,opts.field.value,opts.format);
                    } else {
                        opts.defaultDate = new Date(Date.parse(opts.field.value));
                    }
                    opts.setDefaultDate = opts.defaultDate == true;
                }
            }

            var defDate = opts.defaultDate;

            if (isDate(defDate)) {
                if (opts.setDefaultDate) {
                    self.setDate(defDate, true);
                } else {
                    self.gotoDate(defDate);
                }
            } else {
                self.gotoDate(new Date());
            }

            if (opts.bound) {
                this.hide();
                self.el.className += ' is-bound';
                addEvent(opts.trigger, 'click', self._onInputClick);
                addEvent(opts.trigger, 'focus', self._onInputFocus);
                addEvent(opts.trigger, 'blur', self._onInputBlur);
            } else {
                this.show();
            }
        };

    /**
     * public Pikamonth API
     */
    Pikamonth.prototype = {

        /**
         * configure functionality
         */
        config: function(options) {
            if (!this._o) {
                this._o = extend({}, defaults, true);
            }

            var subopts = extend(this._o.i18n, options.i18n, true),
                   opts = extend(this._o, options, true);
            opts.i18n = subopts;

            opts.isRTL = !!opts.isRTL;

            opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

            opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

            opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

            opts.disableMonthFn = (typeof opts.disableMonthFn) == "function" ? opts.disableMonthFn : null;

            var noy = parseInt(opts.numberOfYears, 10) || 1;
            opts.numberOfYears = noy > 5 ? 5 : noy;

            if (!isDate(opts.minDate)) {
                opts.minDate = false;
            }
            if (!isDate(opts.maxDate)) {
                opts.maxDate = false;
            }
            if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
                opts.maxDate = opts.minDate = false;
            }
            if (opts.minDate) {
                setToStartOfMonth(opts.minDate);
                opts.minYear = opts.minDate.getFullYear();
            }
            if (opts.maxDate) {
                setToStartOfMonth(opts.maxDate);
                opts.maxYear = opts.maxDate.getFullYear();
            }

            if (isArray(opts.yearRange)) {
                var fallback = new Date().getFullYear() - 10;
                opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
                opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
            } else {
                opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
                if (opts.yearRange > 100) {
                    opts.yearRange = 100;
                }
            }

            if (!opts.getdate && hasMoment) {
                opts.getdate = momentGet;
            }
            if (!opts.reformat && hasMoment) {
                opts.reformat = momentFormat;
            }

            return opts;
        },

        /**
         * return a formatted string of the current selection (using ancillary formatter if available)
         */
        toString: function(format) {
            if (this._d && isDate(this._d)) {
                if (typeof this._o.reformat === 'function') {
                    return this._o.reformat.call(this,this._d,format || this._o.format);
                } else {
                    return this._d.toDateString();
                }
            }
            return '';
        },

        /**
         * DEPRECATED return a Moment.js object of the current selection (if available)
         */
        getMoment: function() {
            return null;
        },

        /**
         * DEPRECATED set the current selection from a Moment.js object (if available)
         */
        setMoment: function(date, preventOnSelect) {
        },

        /**
         * return a Date object of the current selection
         */
        getDate: function() {
            return isDate(this._d) ? new Date(this._d.getTime()) : null;
        },

        /**
         * set the current selection
         */
        setDate: function(date, preventOnSelect) {
            if (!date) {
                this._d = null;

                if (this._o.field) {
                    this._o.field.value = '';
                    if (this._o.field != this._o.trigger) {
                        fireEvent(this._o.field, 'change', {
                            firedBy: this
                        });
                    }
                }

                this.draw();
                return;
            }
            if (typeof date === 'string') {
                date = new Date(Date.parse(date));
            }
            if (!isDate(date)) {
                return;
            }

            var min = this._o.minDate,
                max = this._o.maxDate;

            if (isDate(min) && date < min) {
                date = min;
            } else if (isDate(max) && date > max) {
                date = max;
            }

            var td = new Date(date.getTime());
            setToStartOfMonth(td);
            this.gotoDate(td);

            //preserve recorded time, if any
            var ov = this._o.field.value;
            if (ov) {
                var od;
                if (typeof this._o.getdate === 'function') {
                    od = this._o.getdate.call(this,ov,this._o.format);
                } else {
                    od = new Date(Date.parse(ov));
                }
                if (isDate(od)) {
                    var ot = od.getTime();
                    setToStartOfMonth(od);
                    var mstime = ot - od.getTime();
                    if (mstime) {
                        td.setTime(td.getTime() + mstime);
                    }
                }
            }
            this._d = td;

            this._o.field.value = this.toString();
            if (this._o.field != this._o.trigger) {
                fireEvent(this._o.field, 'change', {
                    firedBy: this
                });
            }

            if (!preventOnSelect && typeof this._o.onSelect === 'function') {
                this._o.onSelect.call(this, this.getDate());
            }
        },

        /**
         * change view to a specific date
         */
        gotoDate: function(date) {
            if (!isDate(date)) {
                return;
            }
            this._year = date.getFullYear();
            this.draw();
        },

        gotoToday: function() {
            this.gotoDate(new Date());
        },

        /**
         * change view to a specific year (no bounds-check)
         */
        gotoYear: function(year) {
            var y = parseInt(year, 10);
            if (!isNaN(y)) {
                this._year = y;
                this.draw();
            }
        },

        nextYear: function() {
            if (!isNaN(this._year)) {
                this._year++;
                this.draw();
            }
        },

        prevYear: function() {
            if (!isNaN(this._year)) {
                this._year--;
                this.draw();
            }
        },

        /**
         * change the minDate
         */
        setMinDate: function(value) {
            this._o.minDate = value;
        },

        /**
         * change the maxDate
         */
        setMaxDate: function(value) {
            this._o.maxDate = value;
        },

        /**
         * refresh the HTML
         */
        draw: function(force) {
            if (!this._v && !force) {
                return;
            }
            var opts = this._o,
                minYear = opts.minYear,
                maxYear = opts.maxYear,
                html;

            if (!isNaN(minYear) && this._y <= minYear) {
                this._y = minYear; //CHECK - for caller feedback?
            }
            if (!isNaN(maxYear) && this._y >= maxYear) {
                this._y = maxYear;
            }

            html = '<div class="pika-pikker">'
               + renderTitle(this, this._year)
               + this.render(this._year) + '</div>';

            this.el.innerHTML = html;

            if (opts.bound) {
                if (opts.field.type !== 'hidden') {
                    sto(function() {
                        opts.trigger.focus();
                    }, 1);
                }
            }

            if (typeof this._o.onDraw === 'function') {
                var self = this;
                sto(function() {
                    self._o.onDraw.call(self);
                }, 0);
            }
        },

        adjustPosition: function() {
            if (this._o.container) return;
            var field = this._o.trigger,
                pEl = field,
                width = this.el.offsetWidth,
                height = this.el.offsetHeight,
                viewportWidth = window.innerWidth || document.documentElement.clientWidth,
                viewportHeight = window.innerHeight || document.documentElement.clientHeight,
                scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop,
                left, top, clientRect;

            if (typeof field.getBoundingClientRect === 'function') {
                clientRect = field.getBoundingClientRect();
                left = clientRect.left + window.pageXOffset;
                top = clientRect.bottom + window.pageYOffset;
            } else {
                left = pEl.offsetLeft;
                top = pEl.offsetTop + pEl.offsetHeight;
                while ((pEl = pEl.offsetParent)) {
                    left += pEl.offsetLeft;
                    top += pEl.offsetTop;
                }
            }

            // default position is bottom & left
            if ((this._o.reposition && left + width > viewportWidth) ||
                (
                    this._o.position.indexOf('right') > -1 &&
                    left - width + field.offsetWidth > 0
                )
            ) {
                left = left - width + field.offsetWidth;
            }
            if ((this._o.reposition && top + height > viewportHeight + scrollTop) ||
                (
                    this._o.position.indexOf('top') > -1 &&
                    top - height - field.offsetHeight > 0
                )
            ) {
                top = top - height - field.offsetHeight;
            }

            this.el.style.cssText = [
                'position: absolute',
                'left: ' + left + 'px',
                'top: ' + top + 'px'
            ].join(';');
        },

        /**
         * render HTML for a particular year
         */
        render: function(year) {
            var opts = this._o,
                now = new Date(),
                data = [],
                row = [],
                month;
            setToStartOfMonth(now); //remains EST +1000
            month = new Date(now.getTime());
            for (var m = 0, r = 0; m < 12; m++) {
                month.setFullYear(year, m);
                var isSelected = isDate(this._d) ? compareDates(month, this._d) : false,
                    isCurrent = compareDates(month, now),
                    isDisabled = (opts.minDate && month < opts.minDate) ||
                    (opts.maxDate && month > opts.maxDate) ||
                    (opts.disableMonthFn && opts.disableMonthFn(month));
                row.push(renderMonth(opts, m, year, isSelected, isCurrent, isDisabled));
                if (++r === 3) {
                    data.push(renderRow(row, opts.isRTL));
                    row = [];
                    r = 0;
                }
            }
            return renderTable(opts, data);
        },

        isVisible: function() {
            return this._v;
        },

        show: function() {
            if (!this._v) {
                removeClass(this.el, 'is-hidden');
                this._v = true;
                this.draw();
                if (this._o.bound) {
                    addEvent(document, 'click', this._onClick);
                    this.adjustPosition();
                }
                if (typeof this._o.onOpen === 'function') {
                    this._o.onOpen.call(this);
                }
            }
        },

        hide: function() {
            var v = this._v;
            if (v !== false) {
                if (this._o.bound) {
                    removeEvent(document, 'click', this._onClick);
                }
                this.el.style.cssText = '';
                addClass(this.el, 'is-hidden');
                this._v = false;
                if (v !== undefined && v !== false && typeof this._o.onClose === 'function') {
                    this._o.onClose.call(this);
                }
            }
        },

        /**
         * GAME OVER
         */
        destroy: function() {
            this.hide();
            removeEvent(this.el, 'mousedown', this._onMouseDown, true);
            removeEvent(this.el, 'change', this._onChange);
            if (this._o.field) {
                removeEvent(this._o.field, 'change', this._onInputChange);
                if (this._o.bound) {
                    removeEvent(this._o.trigger, 'click', this._onInputClick);
                    removeEvent(this._o.trigger, 'focus', this._onInputFocus);
                    removeEvent(this._o.trigger, 'blur', this._onInputBlur);
                }
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }

    };

    return Pikamonth;

}));
