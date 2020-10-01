const { google } = require('googleapis');

const { getAuth } = require('./auth');

const getCalendars = async () => {
  const gcal = google.calendar({ version: 'v3', auth: await getAuth() });
  return (await gcal.calendarList.list()).data.items;
};

const getEvents = async ({ calendarId, timeMin, timeMax }) => {
  const gcal = google.calendar({ version: 'v3', auth: await getAuth() });
  const response = await gcal.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime'
  });
  return response.data.items;
};

exports.getCalendars = getCalendars;
exports.getEvents = getEvents;
