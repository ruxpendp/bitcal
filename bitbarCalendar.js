#!/usr/bin/env /usr/local/bin/node

const bitbar = require('bitbar');

const { selectView, toggleCalendar, refreshCalendars } = require('./src/configHelpers');
const { renderMenuBar } = require('./src/menuBar');

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
