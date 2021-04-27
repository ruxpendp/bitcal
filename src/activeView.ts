import moment, { Moment } from 'moment';
import orderBy from 'lodash.orderby';

import { Event } from './calendarApis';
const customConfig = require('../config.json');
const defaultConfig = require('../defaultConfig.json');

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

type ConfigTimeStampEntries = [string, ConfigTimeStamp];

interface TimeStampGen {
  base?: string;
  offsetIds?: string[];
  offsets: ConfigOffsets
}

interface CalculatedTimeStamps {
  [timeStampId: string]: Moment;
}

interface ConfigEventBucket {
  from: string;
  to: string;
  displayName: string;
  displayFormat?: string;
  eventFormat?: string;
}

interface ConfigEventBuckets {
  [bucketId: string]: ConfigEventBucket;
}

type ConfigEventBucketEntries = [string, ConfigEventBucket];

export interface CalculatedEventBucket {
  from: Moment;
  to: Moment;
  displayName: string;
  displayFormat?: string;
  events: Event[];
  eventFormat?: string;
}

interface CalculatedEventBuckets {
  [bucketId: string]: CalculatedEventBucket;
}

interface ActiveBucketParams {
  bucketIds: string[];
  sort: boolean;
}

interface BucketTimeBounds {
  min: Moment;
  max: Moment;
}

export interface ConfigView {
  id: string;
  displayName: string;
  eventBuckets: {
    buckets: string[];
    sort: boolean;
    multiBucketEvents: boolean;
  }
}

export interface CalculatedActiveView {
  buckets: CalculatedEventBucket[]
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


const {
  offsets: customOffsets = {},
  timeStamps: customTimeStamps = {},
  eventBuckets: customBuckets = {},
  views: customViews = [],
  activeView: customActiveViewId = null,
}: CustomConfig = customConfig;

const {
  offsets: defaultOffsets,
  timeStamps: defaultTimeStamps,
  eventBuckets: defaultBuckets,
  views: defaultViews,
  activeView: defaultActiveViewId,
}: DefaultConfig = defaultConfig;

const calculateTimeStamp = ({ base = 'now', offsetIds = [], offsets }: TimeStampGen): Moment => (
  offsetIds.reduce(
    (currentTimeStamp: Moment, offsetId: string) => {
      const { func, args }: ConfigOffset = offsets[offsetId];
      return (currentTimeStamp as any)[func](...args);
    },
    base === 'now' ? moment() : moment(base)
  )
);

const getTimeStamps = (): CalculatedTimeStamps => {
  const offsets: ConfigOffsets = { ...defaultOffsets, ...customOffsets };

  return Object.entries({ ...defaultTimeStamps, ...customTimeStamps }).reduce(
    (
      timeStamps: CalculatedTimeStamps,
      [timeStampId, { base, offsets: offsetIds }]: ConfigTimeStampEntries
    ) => ({
      ...timeStamps,
      [timeStampId]: calculateTimeStamp({ base, offsetIds, offsets })
    }),
    {}
  );
};

const getBuckets = (): CalculatedEventBuckets => {
  const timeStamps: CalculatedTimeStamps = getTimeStamps();

  return Object.entries({ ...defaultBuckets, ...customBuckets }).reduce(
    (
      buckets: CalculatedEventBuckets,
      [
        bucketId,
        { from: fromTimeStampId, to: toTimeStampId, displayName, displayFormat, eventFormat }
      ]: ConfigEventBucketEntries
    ) => ({
      ...buckets,
      [bucketId]: {
        from: timeStamps[fromTimeStampId],
        to: timeStamps[toTimeStampId],
        displayName,
        displayFormat,
        events: [],
        eventFormat,
      }
    }),
    {}
  );
};

const getActiveBuckets = ({ bucketIds, sort }: ActiveBucketParams): CalculatedEventBucket[] => {
  const buckets: CalculatedEventBuckets = getBuckets();
  const activeBuckets: CalculatedEventBucket[] = bucketIds
    .map((bucketId: string) => buckets[bucketId]);
  if (sort) {
    return orderBy(
      activeBuckets,
      ['from', 'to', ({ displayName }) => displayName.toLowerCase()]
    );
  }
  return activeBuckets;
};

export const getActiveView = (): CalculatedActiveView => {
  const activeViewId: string | null = customActiveViewId || defaultActiveViewId;
  const customViewIds: Set<string> = new Set(customViews.map(({ id }) => id));
  const views: ConfigView[] = [
    ...customViews,
    ...defaultViews.filter(({ id }) => !customViewIds.has(id))
  ];
  const {
    eventBuckets: { buckets: bucketIds, sort, multiBucketEvents }
  }: ConfigView = views.find(({ id }) => id === activeViewId) || views[0];

  const activeBuckets: CalculatedEventBucket[] = getActiveBuckets({ bucketIds, sort });
  const { min: timeMin, max: timeMax }: BucketTimeBounds = activeBuckets.reduce(
    ({ min, max }: BucketTimeBounds, { from, to }: CalculatedEventBucket) => (
      { min: moment.min(min, from), max: moment.max(max, to) }
    ),
    { min: activeBuckets[0].from, max: activeBuckets[0].to }
  );

  return {
    buckets: activeBuckets,
    multiBucketEvents,
    timeMin: timeMin.format(),
    timeMax: timeMax.format()
  };
};
