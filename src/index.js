const bitbar = require('bitbar');

const { selectView, toggleCalendar, refreshCalendars } = require('./configHelpers');
const { renderMenuBar } = require('./menuBar');

const optparse = {
  'select-view': selectView,
  'toggle-calendar': toggleCalendar,
  'refresh-calendars': refreshCalendars
}

const bitbarCalendar = async () => {

  if (process.argv.length > 2) optparse[process.argv[2]]();
  else bitbar(await renderMenuBar());
};

if (require.main === module) {
  bitbarCalendar();
}

exports.bitbarCalendar = bitbarCalendar;