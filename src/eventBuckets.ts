import moment, { Moment } from 'moment';
import bitbar, { BitbarOptions } from 'bitbar';

import { CalculatedEventBucket, CustomConfig } from './activeView';
import { MenuItem } from './menus';
import { Event } from './calendarApis';
const config = require('../config.json');

interface HumanDelta {
  timeStamp?: Moment;
  delta: number;
  format: string;
}

interface EventFormatData extends Event {
  eventFormat?: string;
  now: Moment;
}

interface FormattedEvent {
  defaultText: string;
  alternateText: string;
  href: string;
}

interface EventReducer {
  outputEvents: BitbarOptions[];
  event: Event;
  eventFormat?: string;
  now: Moment;
}

interface FormatDisplayNameData {
  from: Moment;
  to: Moment;
  displayName: string;
  displayFormat?: string;
}

interface FormatMap {
  [matched: string]: string;
}

interface EventRenderData {
  buckets: CalculatedEventBucket[];
  events: Event[];
  multiBucketEvents: boolean;
}


const DEFAULT_FORMAT: string = 'h:mm A';
const DEFAULT_SUMMARY: string = '(no summary)';
const DEFAULT_START_TIME: string = '(no start time)';
const DEFAULT_END_TIME: string = '(no end time)';

const { primaryCalendar }: CustomConfig = config;

const formatUrl = (htmlLink: string): string => {
  const url: URL = new URL(htmlLink);
  const pathname: string[] = url.pathname.split('/');
  pathname.splice(2, 0, `u/${primaryCalendar || ''}/r`);
  url.pathname = pathname.join('/');
  return url.href;
};

const humanize = ({ timeStamp, delta, format }: HumanDelta): string => {
  if (!timeStamp) return 'unknown';
  if (Math.abs(delta) >= 60) return timeStamp.format(format);
  if (delta < 0) return `${Math.abs(delta)}m ago`;
  if (delta > 0) return `in ${delta}m`;
  return 'now';
};

const formatEvent = (
  { summary, start, end, htmlLink, eventFormat, now }: EventFormatData
): FormattedEvent => {
  const cleanSummary: string = summary ? summary.replace(/\|/g, '-') : DEFAULT_SUMMARY;
  const format = eventFormat || DEFAULT_FORMAT;
  const startDelta: number = Math.round(
    moment.duration(moment(start).seconds(0).diff(moment(now).seconds(0))).asMinutes()
  );
  const shortTime: string = humanize({ timeStamp: start, delta: startDelta, format });
  const startTime: string = start ? start.format(format) : DEFAULT_START_TIME;
  const endTime: string = end ? end.format(format) : DEFAULT_END_TIME;

  return {
    defaultText: `${shortTime}  –  ${cleanSummary}`,
    alternateText: `${startTime} - ${endTime}  –  ${cleanSummary}`,
    href: htmlLink ? formatUrl(htmlLink) : ''
  }
};

const reduceEvent = (
  { outputEvents, event: { summary, start, end, htmlLink }, eventFormat, now }: EventReducer
): BitbarOptions[] => {
  const { defaultText, alternateText, href }: FormattedEvent = formatEvent(
    { summary, start, end, htmlLink, eventFormat, now }
  );
  return [
    ...outputEvents,
    { text: defaultText, href },
    { text: alternateText, href, alternate: true }
  ]
};

const formatDisplayName = (
  { from, to, displayName, displayFormat = '' }: FormatDisplayNameData
): string => {
  const formatMap: FormatMap = {
    '{from}': from.format(displayFormat),
    '{to}': to.format(displayFormat)
  };

  return displayName.replace(
    new RegExp(Object.keys(formatMap).join('|'), 'g'),
    matched => formatMap[matched]
  );
};

const populateBuckets = (
  { buckets, events, multiBucketEvents }: EventRenderData
): CalculatedEventBucket[] => {
  events.forEach(event => {
    for (const bucket of buckets) {
      if (
        (!event.start || event.start < bucket.to)
        && (!event.end || event.end > bucket.from)
       ) {
        bucket.events.push(event);
        if (!multiBucketEvents) break;
      }
    }
  });

  return buckets;
};

export const renderEventBuckets = (
  { buckets, events, multiBucketEvents }: EventRenderData
): MenuItem[] => {
  const now: Moment = moment();
  const eventBuckets: CalculatedEventBucket[] = populateBuckets(
    { buckets, events, multiBucketEvents }
  );

  return eventBuckets.reduce(
    (
      output: MenuItem[],
      { from, to, displayName, displayFormat, events, eventFormat }: CalculatedEventBucket
    ): MenuItem[] => {
      if (events.length === 0) return output;
      return [
        ...output,
        { text: formatDisplayName({ from, to, displayName, displayFormat }) },
        ...events.reduce(
          (outputEvents: BitbarOptions[], event: Event) => reduceEvent(
            { outputEvents, event, eventFormat, now }
          ),
          []
        ),
        bitbar.separator
      ];
    },
    []
  );
};
