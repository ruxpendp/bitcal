const moment = require('moment');
const { google } = require('googleapis');
const orderBy = require('lodash.orderby');

const { getAuthClient } = require('./auth');

const getCalendars = async () => {
  const gcal = google.calendar({ version: 'v3', auth: await getAuthClient() });
  return (await gcal.calendarList.list()).data.items;
};

const getEvents = async ({ calendarIds, timeMin, timeMax }) => {
  const gcal = google.calendar({ version: 'v3', auth: await getAuthClient() });

  const events = await calendarIds.reduce(
    async (allEvents, calendarId) => {
      const [allFetchedEvents, { data: { items: newFetchedEvents } }] = await Promise.all([
        allEvents,
        gcal.events.list({
          calendarId,
          timeMin,
          timeMax,
          singleEvents: true
        })
      ]);

      return [
        ...allFetchedEvents,
        ...newFetchedEvents.map(event => ({
          ...event,
          start: moment(event.start.dateTime),
          end: moment(event.end.dateTime)
        }))
      ];
    },
    []
  );

  return orderBy(events, ['start', 'end', ({ summary }) => summary.toLowerCase()]);
};

exports.getCalendars = getCalendars;
exports.getEvents = getEvents;
