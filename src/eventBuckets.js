const moment = require('moment');
const bitbar = require('bitbar');

const { primaryCalendar } = require('../config');

const formatUrl = htmlLink => {
  const url = new URL(htmlLink);
  const pathname = url.pathname.split('/');
  pathname.splice(2, 0, `u/${primaryCalendar}/r`);
  url.pathname = pathname.join('/');
  return url.href;
};

const humanize = ({ timeStamp, delta }) => {
  if (Math.abs(delta) >= 60) return timeStamp.format('h:mm A');
  if (delta < 0) return `${Math.abs(delta)}m ago`;
  if (delta > 0) return `in ${delta}m`;
  return 'now';
};

const formatEvent = ({ summary, start, end, htmlLink, now }) => {
  const startDelta = Math.round(
    moment.duration(moment(start).seconds(0).diff(moment(now).seconds(0))).asMinutes()
  );
  const startText = humanize({ timeStamp: start, delta: startDelta });

  return {
    defaultText: `${startText}  –  ${summary}`,
    alternateText: `${start.format('h:mm A')} - ${end.format('h:mm A')}  –  ${summary}`,
    href: formatUrl(htmlLink)
  }
};

const reduceEvent = ({ outputEvents, event: { summary, start, end, htmlLink }, now }) => {
  const { defaultText, alternateText, href } = formatEvent({ summary, start, end, htmlLink, now });
  return [
    ...outputEvents,
    { text: defaultText, href },
    { text: alternateText, href, alternate: true }
  ]
};

const populateBuckets = ({ buckets, events, multiBucketEvents }) => {
  events.forEach(event => {
    for (const bucket of buckets) {
      if (event.start < bucket.to && event.end > bucket.from) {
        bucket.events.push(event);
        if (!multiBucketEvents) break;
      }
    }
  });

  return buckets;
};

const renderEventBuckets = ({ buckets, events, multiBucketEvents }) => {
  const now = moment();
  const eventBuckets = populateBuckets({ buckets, events, multiBucketEvents });

  return eventBuckets.reduce(
    (output, { displayName, events }) => {
      if (events.length === 0) return output;
      return [
        ...output,
        { text: displayName },
        ...events.reduce((outputEvents, event) => reduceEvent({ outputEvents, event, now }), []),
        bitbar.separator
      ];
    },
    []
  );
};

exports.renderEventBuckets = renderEventBuckets;
