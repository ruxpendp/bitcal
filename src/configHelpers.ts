import { promises } from 'fs';
import orderBy from 'lodash.orderby';
import { calendar_v3 } from 'googleapis';

import { CustomConfig, Calendar, Calendars } from './activeView';
import { getCalendars } from './calendarApis';
import config from '../config.json';

const { writeFile } = promises;
const { calendars: configCalendars = [] }: CustomConfig = config;

const writeConfig = (newConfig: object): void => {
  writeFile(`${__dirname}/../config.json`, JSON.stringify(newConfig, null, 2));
};

export const selectView = (): void => {
  writeConfig({ ...config, activeView: process.argv[3] });
};

export const toggleCalendar = (): void => {
  const newCalendars: Calendar[] = configCalendars.map(({ id, displayName, active }: Calendar) => ({
    id,
    displayName,
    active: id === process.argv[3] ? !active : active
  }));
  writeConfig({ ...config, calendars: newCalendars });
};

export const refreshCalendars = async (): Promise<void> => {
  const fetchedCalendars: calendar_v3.Schema$CalendarListEntry[] = await getCalendars();
  const currentCalendars: Calendars = configCalendars.reduce(
    (calendars: Calendars, calendar: Calendar) => ({ ...calendars, [calendar.id]: calendar }),
    {}
  );
  const newCalendars: Calendar[] = orderBy(
    fetchedCalendars.map(({ id, summary, primary }: calendar_v3.Schema$CalendarListEntry) => ({
      id: id || `no id ${Math.random()}`,
      displayName: summary || '<Unnamed Calendar>',
      active: (id && currentCalendars[id]) ? currentCalendars[id].active : false,
      primary: primary || undefined
    })),
    [
      ({ primary }: Calendar) => Boolean(primary),
      ({ displayName }: Calendar) => displayName.toLowerCase(),
      'id'
    ],
    ['desc', 'asc', 'asc']
  );
  const primaryCalendarId: string | null = newCalendars.length && newCalendars[0].primary
    ? newCalendars[0].id
    : null;

  writeConfig({ ...config, calendars: newCalendars, primaryCalendar: primaryCalendarId });
};
