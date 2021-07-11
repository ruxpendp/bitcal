"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEventBuckets = void 0;
const moment_1 = __importDefault(require("moment"));
const bitbar_1 = __importDefault(require("bitbar"));
const config = require('../config.json');
const DEFAULT_FORMAT = 'h:mm A';
const DEFAULT_SUMMARY = '(no summary)';
const DEFAULT_START_TIME = '(no start time)';
const DEFAULT_END_TIME = '(no end time)';
const { primaryCalendar } = config;
const formatUrl = (htmlLink) => {
    const url = new URL(htmlLink);
    const pathname = url.pathname.split('/');
    pathname.splice(2, 0, `u/${primaryCalendar || ''}/r`);
    url.pathname = pathname.join('/');
    return url.href;
};
const humanize = ({ timeStamp, delta, format }) => {
    if (!timeStamp)
        return 'unknown';
    if (Math.abs(delta) >= 60)
        return timeStamp.format(format);
    if (delta < 0)
        return `${Math.abs(delta)}m ago`;
    if (delta > 0)
        return `in ${delta}m`;
    return 'now';
};
const formatEvent = ({ summary, start, end, htmlLink, eventFormat, now }) => {
    const cleanSummary = summary ? summary.replace(/\|/g, '-') : DEFAULT_SUMMARY;
    const format = eventFormat || DEFAULT_FORMAT;
    const startDelta = Math.round(moment_1.default.duration(moment_1.default(start).seconds(0).diff(moment_1.default(now).seconds(0))).asMinutes());
    const shortTime = humanize({ timeStamp: start, delta: startDelta, format });
    const startTime = start ? start.format(format) : DEFAULT_START_TIME;
    const endTime = end ? end.format(format) : DEFAULT_END_TIME;
    return {
        defaultText: `${shortTime}  –  ${cleanSummary}`,
        alternateText: `${startTime} - ${endTime}  –  ${cleanSummary}`,
        href: htmlLink ? formatUrl(htmlLink) : ''
    };
};
const reduceEvent = ({ outputEvents, event: { summary, start, end, htmlLink }, eventFormat, now }) => {
    const { defaultText, alternateText, href } = formatEvent({ summary, start, end, htmlLink, eventFormat, now });
    return [
        ...outputEvents,
        { text: defaultText, href },
        { text: alternateText, href, alternate: true }
    ];
};
const formatDisplayName = ({ from, to, displayName, displayFormat = '' }) => {
    const formatMap = {
        '{from}': from.format(displayFormat),
        '{to}': to.format(displayFormat)
    };
    return displayName.replace(new RegExp(Object.keys(formatMap).join('|'), 'g'), matched => formatMap[matched]);
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
    return eventBuckets.reduce((output, { from, to, displayName, displayFormat, events, eventFormat }) => {
        if (events.length === 0)
            return output;
        return [
            ...output,
            { text: formatDisplayName({ from, to, displayName, displayFormat }) },
            ...events.reduce((outputEvents, event) => reduceEvent({ outputEvents, event, eventFormat, now }), []),
            bitbar_1.default.separator
        ];
    }, []);
};
exports.renderEventBuckets = renderEventBuckets;
//# sourceMappingURL=eventBuckets.js.map