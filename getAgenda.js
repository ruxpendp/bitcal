const bitbar = require('bitbar');

const iconActive = require('./iconActive');
const iconInactive = require('./iconInactive');
const {
  calendars: configCalendars = []
} = require('./config');

const getAgenda = async () => {
  const output = [];

  output.push({ text: '', templateImage: iconActive }, bitbar.separator);

  output.push({
    text: 'Calendars',
    submenu: [
      ...configCalendars.map(({ id, displayName, active, primary }) => ({
        text: `${active ? '✓ ' : ''}${displayName}${primary ? ' (primary)' : ''}`,
        bash: process.argv[0],
        param1: process.argv[1],
        param2: 'toggle-calendar',
        param3: id,
        terminal: false,
        refresh: true
      })),
      bitbar.separator,
      {
        text: 'Refresh Calendars',
        bash: process.argv[0],
        param1: process.argv[1],
        param2: 'refresh-calendars',
        terminal: false,
        refresh: true
      }
    ]
  })

  bitbar(output);
};

exports.getAgenda = getAgenda;
