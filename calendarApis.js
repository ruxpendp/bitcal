const moment = require('moment');
const { google } = require('googleapis');

const { getAuthClient } = require('./auth');

const getCalendars = async () => {
  const gcal = google.calendar({ version: 'v3', auth: await getAuthClient() });
  return (await gcal.calendarList.list()).data.items;
};

// const getEvents = async ({ calendarId, timeMin, timeMax }) => {
//   const gcal = google.calendar({ version: 'v3', auth: await getAuthClient() });
//   const response = await gcal.events.list({
//     calendarId,
//     timeMin,
//     timeMax,
//     singleEvents: true,
//     orderBy: 'startTime'
//   });
//   return response.data.items;
// };

const getEvents = async ({ calendarIds, timeMin, timeMax }) => {
  const gcal = google.calendar({ version: 'v3', auth: await getAuthClient() });

  const events = await calendarIds.reduce(
    async (allEvents, calendarId) => [
      ...(await allEvents),
      ...(await gcal.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true
      })).data.items
    ],
    []
  );
  events.forEach(event => {
    event.start.dateTime = moment(event.start.dateTime);
    event.end.dateTime = moment(event.end.dateTime);
  });

  return events.sort((a, b) => {
    if (a.start.dateTime < b.start.dateTime) return -1;
    if (b.start.dateTime < a.start.dateTime) return 1;
    if (a.end.dateTime < b.end.dateTime) return -1;
    if (b.end.dateTime < a.end.dateTime) return 1;
    return 0;
  });
};

exports.getCalendars = getCalendars;
exports.getEvents = getEvents;
