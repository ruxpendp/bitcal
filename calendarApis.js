const { google } = require('googleapis');

const { getAuth } = require('./auth');

const getCalendars = async () => {
  const gcal = google.calendar({ version: 'v3', auth: await getAuth() });
  return (await gcal.calendarList.list()).data.items;
};

const getEvents = async ({ calendarId, timeMin, timeMax }) => {
  const gcal = google.calendar({ version: 'v3', auth: await getAuth() });
  return (
    await gcal.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    })
  ).data.items;
};

exports.getCalendars = getCalendars;
exports.getEvents = getEvents;
