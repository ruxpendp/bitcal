import { promises } from 'fs';
import orderBy from 'lodash.orderby';
import { calendar_v3 } from 'googleapis';

import { CustomConfig, Calendar, Calendars } from './activeView';
import { getCalendars } from './calendarApis';
const config = require('../config.json');

interface CalendarIsActive {
  activatePrimary: boolean;
  primary: calendar_v3.Schema$CalendarListEntry['primary'];
  id: calendar_v3.Schema$CalendarListEntry['id'];
  currentCalendars: Calendars;
}


const { writeFile } = promises;
const { calendars: configCalendars = [] }: CustomConfig = config;

const writeConfig = async (newConfig: object): Promise<void> => {
  await writeFile(`${__dirname}/../config.json`, JSON.stringify(newConfig, null, 2));
};

export const selectView = (): void => {
  writeConfig({ ...config, activeView: process.argv[3] });
};

export const toggleCalendar = (): void => {
  const newCalendars: Calendar[] = configCalendars.map(
    ({ id, displayName, active, primary }: Calendar) => ({
      id,
      displayName,
      active: id === process.argv[3] ? !active : active,
      primary
    })
  );
  writeConfig({ ...config, calendars: newCalendars });
};

const calendarIsActive = (
  { activatePrimary, primary, id, currentCalendars }: CalendarIsActive
): boolean => {
  if (activatePrimary && primary) return true;
  return (id && currentCalendars[id]) ? currentCalendars[id].active : false;
};

export const refreshCalendars = async (activatePrimary: boolean = false): Promise<CustomConfig> => {
  const fetchedCalendars: calendar_v3.Schema$CalendarListEntry[] = await getCalendars();
  const currentCalendars: Calendars = configCalendars.reduce(
    (calendars: Calendars, calendar: Calendar) => ({ ...calendars, [calendar.id]: calendar }),
    {}
  );
  const newCalendars: Calendar[] = orderBy(
    fetchedCalendars.map(({ id, summary, primary }: calendar_v3.Schema$CalendarListEntry) => ({
      id: id || `no id ${Math.random()}`,
      displayName: summary || '<Unnamed Calendar>',
      active: calendarIsActive({ activatePrimary, primary, id, currentCalendars }),
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

  const newConfig: CustomConfig = {
    ...config,
    calendars: newCalendars,
    primaryCalendar: primaryCalendarId
  };
  await writeConfig(newConfig);

  return newConfig;
};
