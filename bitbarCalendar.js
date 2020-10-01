#!/usr/bin/env /usr/local/bin/node

const { selectView, toggleCalendar, refreshCalendars } = require('./configHelpers');
const { getOutput } = require('./output');

process.removeAllListeners('warning');

const optparse = {
  'select-view': selectView,
  'toggle-calendar': toggleCalendar,
  'refresh-calendars': refreshCalendars
}

// console.log(process.argv);

if (process.argv.length > 2) optparse[process.argv[2]]();
else getOutput();
