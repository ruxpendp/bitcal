const { promises: { writeFile } } = require('fs');
const orderBy = require('lodash.orderby');

const { getCalendars } = require('./calendarApis');
const config = require('../config');
const { calendars: configCalendars } = config;

const writeConfig = newConfig => {
  writeFile(`${__dirname}/../config.json`, JSON.stringify(newConfig, null, 2));
};

const selectView = () => {
  writeConfig({ ...config, activeView: process.argv[3] });
};

const toggleCalendar = () => {
  const newCalendars = configCalendars.map(({ id, displayName, active }) => ({
    id,
    displayName,
    active: id === process.argv[3] ? !active : active
  }));
  writeConfig({ ...config, calendars: newCalendars });
};

const refreshCalendars = async () => {
  const fetchedCalendars = await getCalendars();
  const currentCalendars = configCalendars.reduce(
    (calendars, calendar) => ({ ...calendars, [calendar.id]: calendar }),
    {}
  );
  const newCalendars = orderBy(
    fetchedCalendars.map(({ id, summary, primary }) => ({
      id,
      displayName: summary,
      active: currentCalendars[id] ? currentCalendars[id].active : false,
      primary
    })),
    [({ primary }) => Boolean(primary), ({ displayName }) => displayName.toLowerCase(), 'id'],
    ['desc', 'asc', 'asc']
  );
  const primaryCalendarId = newCalendars.length && newCalendars[0].primary
    ? newCalendars[0].id
    : null;

  writeConfig({ ...config, calendars: newCalendars, primaryCalendar: primaryCalendarId });
};

exports.selectView = selectView;
exports.toggleCalendar = toggleCalendar;
exports.refreshCalendars = refreshCalendars;
