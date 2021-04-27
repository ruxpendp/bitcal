"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveView = void 0;
const moment_1 = __importDefault(require("moment"));
const lodash_orderby_1 = __importDefault(require("lodash.orderby"));
const customConfig = require('../config.json');
const defaultConfig = require('../defaultConfig.json');
const { offsets: customOffsets = {}, timeStamps: customTimeStamps = {}, eventBuckets: customBuckets = {}, views: customViews = [], activeView: customActiveViewId = null, } = customConfig;
const { offsets: defaultOffsets, timeStamps: defaultTimeStamps, eventBuckets: defaultBuckets, views: defaultViews, activeView: defaultActiveViewId, } = defaultConfig;
const calculateTimeStamp = ({ base = 'now', offsetIds = [], offsets }) => (offsetIds.reduce((currentTimeStamp, offsetId) => {
    const { func, args } = offsets[offsetId];
    return currentTimeStamp[func](...args);
}, base === 'now' ? moment_1.default() : moment_1.default(base)));
const getTimeStamps = () => {
    const offsets = Object.assign(Object.assign({}, defaultOffsets), customOffsets);
    return Object.entries(Object.assign(Object.assign({}, defaultTimeStamps), customTimeStamps)).reduce((timeStamps, [timeStampId, { base, offsets: offsetIds }]) => (Object.assign(Object.assign({}, timeStamps), { [timeStampId]: calculateTimeStamp({ base, offsetIds, offsets }) })), {});
};
const getBuckets = () => {
    const timeStamps = getTimeStamps();
    return Object.entries(Object.assign(Object.assign({}, defaultBuckets), customBuckets)).reduce((buckets, [bucketId, { from: fromTimeStampId, to: toTimeStampId, displayName, displayFormat, eventFormat }]) => (Object.assign(Object.assign({}, buckets), { [bucketId]: {
            from: timeStamps[fromTimeStampId],
            to: timeStamps[toTimeStampId],
            displayName,
            displayFormat,
            events: [],
            eventFormat,
        } })), {});
};
const getActiveBuckets = ({ bucketIds, sort }) => {
    const buckets = getBuckets();
    const activeBuckets = bucketIds
        .map((bucketId) => buckets[bucketId]);
    if (sort) {
        return lodash_orderby_1.default(activeBuckets, ['from', 'to', ({ displayName }) => displayName.toLowerCase()]);
    }
    return activeBuckets;
};
const getActiveView = () => {
    const activeViewId = customActiveViewId || defaultActiveViewId;
    const customViewIds = new Set(customViews.map(({ id }) => id));
    const views = [
        ...customViews,
        ...defaultViews.filter(({ id }) => !customViewIds.has(id))
    ];
    const { eventBuckets: { buckets: bucketIds, sort, multiBucketEvents } } = views.find(({ id }) => id === activeViewId) || views[0];
    const activeBuckets = getActiveBuckets({ bucketIds, sort });
    const { min: timeMin, max: timeMax } = activeBuckets.reduce(({ min, max }, { from, to }) => ({ min: moment_1.default.min(min, from), max: moment_1.default.max(max, to) }), { min: activeBuckets[0].from, max: activeBuckets[0].to });
    return {
        buckets: activeBuckets,
        multiBucketEvents,
        timeMin: timeMin.format(),
        timeMax: timeMax.format()
    };
};
exports.getActiveView = getActiveView;
//# sourceMappingURL=activeView.js.map