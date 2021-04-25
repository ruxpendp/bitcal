import { Moment } from 'moment';
import { Event } from './calendarApis';
interface ConfigOffset {
    func: string;
    args: (number | string | boolean)[];
}
interface ConfigOffsets {
    [offset: string]: ConfigOffset;
}
interface ConfigTimeStamp {
    base: string;
    offsets?: string[];
}
interface ConfigTimeStamps {
    [timeStampId: string]: ConfigTimeStamp;
}
interface ConfigEventBucket {
    displayName: string;
    from: string;
    to: string;
}
interface ConfigEventBuckets {
    [bucketId: string]: ConfigEventBucket;
}
export interface CalculatedEventBucket {
    displayName: string;
    from: Moment;
    to: Moment;
    events: Event[];
}
export interface ConfigView {
    id: string;
    displayName: string;
    eventBuckets: {
        buckets: string[];
        sort: boolean;
        multiBucketEvents: boolean;
    };
}
export interface CalculatedActiveView {
    buckets: CalculatedEventBucket[];
    multiBucketEvents: boolean;
    timeMin: string;
    timeMax: string;
}
export interface DefaultConfig {
    offsets: ConfigOffsets;
    timeStamps: ConfigTimeStamps;
    eventBuckets: ConfigEventBuckets;
    views: ConfigView[];
    activeView: string | null;
}
export interface Calendar {
    id: string;
    displayName: string;
    active: boolean;
    primary?: boolean;
}
export interface Calendars {
    [calendarId: string]: Calendar;
}
export interface CustomConfig extends Partial<DefaultConfig> {
    calendars?: Calendar[];
    primaryCalendar?: string;
}
export declare const getActiveView: () => CalculatedActiveView;
export {};
//# sourceMappingURL=activeView.d.ts.map