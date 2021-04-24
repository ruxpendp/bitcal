import moment from 'moment';
import { google, calendar_v3 } from 'googleapis';
import orderBy from 'lodash.orderby';

import { getAuthClient } from './auth';

interface EventParams {
  calendarIds: string[];
  timeMin: string;
  timeMax: string;
}

export interface Event extends Omit<calendar_v3.Schema$Event, 'start' | 'end'> {
  start?: moment.Moment;
  end?: moment.Moment;
}

interface FetchedEvents {
  data: {
    items?: calendar_v3.Schema$Event[];
  }
}

type ReducedEvents = [Event[], FetchedEvents];


export const getCalendars = async (): Promise<calendar_v3.Schema$CalendarListEntry[]> => {
  const gcal: calendar_v3.Calendar = google
    .calendar({ version: 'v3', auth: await getAuthClient() });
  return (await gcal.calendarList.list()).data.items || [];
};

export const getEvents = async (
  { calendarIds, timeMin, timeMax }: EventParams
): Promise<Event[]> => {
  const gcal: calendar_v3.Calendar = google
    .calendar({ version: 'v3', auth: await getAuthClient() });

  const events: Event[] = await calendarIds.reduce(
    async (allEvents: Promise<Event[]>, calendarId: string) => {
      const [
        allFetchedEvents,
        { data: { items: newFetchedEvents = [] } }
      ]: ReducedEvents = await Promise.all([
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
          start: event.start && moment(event.start.dateTime || event.start.date),
          end: event.end && moment(event.end.dateTime || event.end.date)
        }))
      ];
    },
    Promise.resolve([])
  );

  return orderBy(events, ['start', 'end', ({ summary }) => summary && summary.toLowerCase()]);
};
