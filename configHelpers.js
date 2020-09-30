const { promises: { writeFile } } = require('fs');

const { getCalendars } = require('./calendarApis');
const config = require('./config');
const { calendars: configCalendars } = config;

const writeConfig = async newConfig => {
  await writeFile(`${__dirname}/config.json`, JSON.stringify(newConfig, null, 2));
}

const selectTimeRange = () => {

};

const toggleCalendar = async () => {
  const newCalendars = configCalendars.map(({ id, displayName, active }) => ({
    id,
    displayName,
    active: id === process.argv[3] ? !active : active
  }));

  await writeConfig({ ...config, calendars: newCalendars });
};

const refreshCalendars = async () => {
  const fetchedCalendars = await getCalendars();
  const currentCalendars = configCalendars.reduce(
    (calendars, calendar) => ({ ...calendars, [calendar.id]: calendar }),
    {}
  );
  const newCalendars = fetchedCalendars
    .sort((a, b) => {
      if (a.primary) return -1;
      if (b.primary) return 1;
      if (a.summary.toLowerCase() < b.summary.toLowerCase()) return -1;
      if (b.summary.toLowerCase() < a.summary.toLowerCase()) return 1;
      if (a.id < b.id) return -1;
      return 1;
    })
    .map(({ id, summary, primary }) => ({
      id,
      displayName: summary,
      active: currentCalendars[id] ? currentCalendars[id].active : false,
      primary
    }));
  const primaryCalendarId = newCalendars.length && newCalendars[0].primary
    ? newCalendars[0].id
    : null;

  await writeConfig({ ...config, calendars: newCalendars, primaryCalendarId });
};

exports.selectTimeRange = selectTimeRange;
exports.toggleCalendar = toggleCalendar;
exports.refreshCalendars = refreshCalendars;
