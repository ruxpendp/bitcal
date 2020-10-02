#!/usr/bin/env /usr/local/bin/node

const bitbar = require('bitbar');

const { selectView, toggleCalendar, refreshCalendars } = require('./configHelpers');
const { renderMenuBar } = require('./menuBar');

process.removeAllListeners('warning');

const optparse = {
  'select-view': selectView,
  'toggle-calendar': toggleCalendar,
  'refresh-calendars': refreshCalendars
}

const bitbarCalendar = async () => {
  // console.log(process.argv);

  if (process.argv.length > 2) optparse[process.argv[2]]();
  else bitbar(await renderMenuBar());
};

bitbarCalendar();
