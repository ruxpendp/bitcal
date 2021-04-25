"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEventBuckets = void 0;
const moment_1 = __importDefault(require("moment"));
const bitbar_1 = __importDefault(require("bitbar"));
const config = require('../config.json');
const { primaryCalendar } = config;
const formatUrl = (htmlLink) => {
    const url = new URL(htmlLink);
    const pathname = url.pathname.split('/');
    pathname.splice(2, 0, `u/${primaryCalendar || ''}/r`);
    url.pathname = pathname.join('/');
    return url.href;
};
const humanize = ({ timeStamp, delta }) => {
    if (!timeStamp)
        return 'unknown';
    if (Math.abs(delta) >= 60)
        return timeStamp.format('h:mm A');
    if (delta < 0)
        return `${Math.abs(delta)}m ago`;
    if (delta > 0)
        return `in ${delta}m`;
    return 'now';
};
const formatEvent = ({ summary, start, end, htmlLink, now }) => {
    const startDelta = Math.round(moment_1.default.duration(moment_1.default(start).seconds(0).diff(moment_1.default(now).seconds(0))).asMinutes());
    const shortText = humanize({ timeStamp: start, delta: startDelta });
    const startText = start ? start.format('h:mm A') : 'no start time';
    const endText = end ? end.format('h:mm A') : 'no end time';
    return {
        defaultText: `${shortText}  –  ${summary}`,
        alternateText: `${startText} - ${endText}  –  ${summary}`,
        href: htmlLink ? formatUrl(htmlLink) : ''
    };
};
const reduceEvent = ({ outputEvents, event: { summary, start, end, htmlLink }, now }) => {
    const { defaultText, alternateText, href } = formatEvent({ summary, start, end, htmlLink, now });
    return [
        ...outputEvents,
        { text: defaultText, href },
        { text: alternateText, href, alternate: true }
    ];
};
const populateBuckets = ({ buckets, events, multiBucketEvents }) => {
    events.forEach(event => {
        for (const bucket of buckets) {
            if ((!event.start || event.start < bucket.to)
                && (!event.end || event.end > bucket.from)) {
                bucket.events.push(event);
                if (!multiBucketEvents)
                    break;
            }
        }
    });
    return buckets;
};
const renderEventBuckets = ({ buckets, events, multiBucketEvents }) => {
    const now = moment_1.default();
    const eventBuckets = populateBuckets({ buckets, events, multiBucketEvents });
    return eventBuckets.reduce((output, { displayName, events }) => {
        if (events.length === 0)
            return output;
        return [
            ...output,
            { text: displayName },
            ...events.reduce((outputEvents, event) => reduceEvent({ outputEvents, event, now }), []),
            bitbar_1.default.separator
        ];
    }, []);
};
exports.renderEventBuckets = renderEventBuckets;
//# sourceMappingURL=eventBuckets.js.map