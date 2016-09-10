/*!
Pikaday jQuery plugin
Derived from code copyright © 2013 David Bushell https://github.com/dbushell/Pikaday
*/
/*
Examples:
<link rel="stylesheet" type="text/css" href="pikaday.css">
<script src="pikaday.js"></script>
<script>
$(document).ready(function() {
 $('#pickdate').Pikaday();
});
</script>

<script src="pikaday.js"></script>
<script>
$(document).ready(function() {
 $('.pickdate').each(function() {
  $(this).Pikaday({
   container: this.parentNode
  });
 });
});
</script>

<script src="pikaday.js"></script>
<script>
 var picker = new Pikaday({ field: $('#pickdate')[0] });
</script>

Options and their default values:
// position of the datepicker, relative to the field (default to bottom & left)
// ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
 position: 'bottom left'
// automatically fit in the viewport even if it means repositioning from the position option
 reposition: true
// the default output format for `.toString()` and `field` value
 format: 'YYYY-MM-DD'
// the initial date to view when first opened
defaultDate: null
// make the `defaultDate` the initial selected value
 setDefaultDate: false
// first day of week (0: Sunday, 1: Monday etc)
 firstDay: 0
// the minimum/earliest date that can be selected
 minDate: null
// the maximum/latest date that can be selected
 maxDate: null,
// number of years either side, or array of upper/lower range
 yearRange: 10
// show week numbers at head of row
 showWeekNumber: false
// Additional text to append to the year in the calendar title
 yearSuffix: ''
// Render the month after year in the calendar title
 showMonthAfterYear: false
// how many months are visible
 numberOfMonths: 1
// when numberOfMonths is used, this will help you to choose where the main calendar will be
//(default `left`, can be set to `right`)
// only used for the first display or when a selected date is not visible
 mainCalendar: 'left'
// Specify a DOM element to render the calendar in
 container: undefined
// internationalization
 i18n: {
  previousMonth : 'Previous Month',
  nextMonth     : 'Next Month',
  months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
  weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
},
// callback functions
 onSelect: null
 onOpen: null
 onClose: null
 onDraw: null

If you'd prefer not to use the default styling, object-classes in the
popup dialog and whose style may be customised are:
 is-bound
 is-disabled
 is-empty
 is-hidden
 is-rtl
 is-selected
 is-today
 pika-button
 pika-day
 pika-label
 pika-lendar
 pika-next
 pika-prev
 pika-select
 pika-select-month
 pika-select-year
 pika-single
 pika-table
 pika-title
 pika-week
 */

(function($) { "$:nomunge";
 $.extend({
  Pikaday: new function () {
   this.construct = function (options) {
    this.each (function () {
     var cfg = $.extend (options || {}, {trigger: this});
     $(this).data('pikaday', new Pikaday(cfg));
    });
    return this;
   };
  }
 });
 $.fn.extend ({ Pikaday : $.Pikaday.construct });
})(jQuery);
