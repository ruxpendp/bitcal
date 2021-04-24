import moment, { Moment } from 'moment';
import bitbar, { BitbarOptions } from 'bitbar';

import { CalculatedEventBucket } from './activeView';
import { MenuItem } from './menus';
import { Event } from './calendarApis';
import { primaryCalendar } from '../config.json';

interface HumanDelta {
  timeStamp?: Moment;
  delta: number;
}

interface EventFormatData extends Event {
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
  now: Moment;
}

interface EventRenderData {
  buckets: CalculatedEventBucket[];
  events: Event[];
  multiBucketEvents: boolean;
}

const formatUrl = (htmlLink: string): string => {
  const url: URL = new URL(htmlLink);
  const pathname: string[] = url.pathname.split('/');
  pathname.splice(2, 0, `u/${primaryCalendar}/r`);
  url.pathname = pathname.join('/');
  return url.href;
};

const humanize = ({ timeStamp, delta }: HumanDelta): string => {
  if (!timeStamp) return 'unknown';
  if (Math.abs(delta) >= 60) return timeStamp.format('h:mm A');
  if (delta < 0) return `${Math.abs(delta)}m ago`;
  if (delta > 0) return `in ${delta}m`;
  return 'now';
};

const formatEvent = ({ summary, start, end, htmlLink, now }: EventFormatData): FormattedEvent => {
  const startDelta: number = Math.round(
    moment.duration(moment(start).seconds(0).diff(moment(now).seconds(0))).asMinutes()
  );
  const shortText: string = humanize({ timeStamp: start, delta: startDelta });
  const startText: string = start ? start.format('h:mm A') : 'no start time';
  const endText: string = end ? end.format('h:mm A'): 'no end time';

  return {
    defaultText: `${shortText}  –  ${summary}`,
    alternateText: `${startText} - ${endText}  –  ${summary}`,
    href: htmlLink ? formatUrl(htmlLink) : ''
  }
};

const reduceEvent = (
  { outputEvents, event: { summary, start, end, htmlLink }, now }: EventReducer
): BitbarOptions[] => {
  const { defaultText, alternateText, href }: FormattedEvent = formatEvent(
    { summary, start, end, htmlLink, now }
  );
  return [
    ...outputEvents,
    { text: defaultText, href },
    { text: alternateText, href, alternate: true }
  ]
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
    (output: MenuItem[], { displayName, events }: CalculatedEventBucket): MenuItem[] => {
      if (events.length === 0) return output;
      return [
        ...output,
        { text: displayName },
        ...events.reduce(
          (outputEvents: BitbarOptions[], event: Event) => reduceEvent(
            { outputEvents, event, now }
          ),
          []
        ),
        bitbar.separator
      ];
    },
    []
  );
};
