#!/usr/bin/env /usr/local/bin/node

const { selectTimeRange, toggleCalendar, refreshCalendars } = require('./configHelpers');
const { getAgenda } = require('./getAgenda');

process.removeAllListeners('warning');

const optparse = {
  'time-range': selectTimeRange,
  'toggle-calendar': toggleCalendar,
  'refresh-calendars': refreshCalendars
}

// console.log(process.argv);

if (process.argv.length > 2) optparse[process.argv[2]]();
else getAgenda();
