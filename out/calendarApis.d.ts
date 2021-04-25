import moment from 'moment';
import { calendar_v3 } from 'googleapis';
interface EventParams {
    calendarIds: string[];
    timeMin: string;
    timeMax: string;
}
export interface Event extends Omit<calendar_v3.Schema$Event, 'start' | 'end'> {
    start?: moment.Moment;
    end?: moment.Moment;
}
export declare const getCalendars: () => Promise<calendar_v3.Schema$CalendarListEntry[]>;
export declare const getEvents: ({ calendarIds, timeMin, timeMax }: EventParams) => Promise<Event[]>;
export {};
//# sourceMappingURL=calendarApis.d.ts.map