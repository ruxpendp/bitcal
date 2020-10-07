const moment = require('moment');
const orderBy = require('lodash.orderby');

const {
  offsets: customOffsets = {},
  timeStamps: customTimeStamps = {},
  eventBuckets: customBuckets = {},
  views: customViews = [],
  activeView: customActiveViewId = null,
} = require('./config');
const {
  offsets: defaultOffsets,
  timeStamps: defaultTimeStamps,
  eventBuckets: defaultBuckets,
  views: defaultViews,
  activeView: defaultActiveViewId,
} = require('./defaultConfig');

const calculateTimeStamp = ({ base = 'now', offsetIds = [], offsets }) => offsetIds.reduce(
  (currentTimeStamp, offsetId) => {
    const { func, args } = offsets[offsetId]
    return currentTimeStamp[func](...args);
  },
  base === 'now' ? moment() : moment(base)
);

const getTimeStamps = () => {
  const offsets = { ...defaultOffsets, ...customOffsets };

  return Object.entries({ ...defaultTimeStamps, ...customTimeStamps }).reduce(
    (timeStamps, [timeStampId, { base, offsets: offsetIds }]) => ({
      ...timeStamps,
      [timeStampId]: calculateTimeStamp({ base, offsetIds, offsets })
    }),
    {}
  );
};

const getBuckets = () => {
  const timeStamps = getTimeStamps();

  return Object.entries({ ...defaultBuckets, ...customBuckets }).reduce(
    (buckets, [bucketId, { displayName, from: fromTimeStampId, to: toTimeStampId }]) => ({
      ...buckets,
      [bucketId]: {
        displayName,
        from: timeStamps[fromTimeStampId],
        to: timeStamps[toTimeStampId],
        events: []
      }
    }),
    {}
  );
};

const getActiveBuckets = ({ bucketIds, sort }) => {
  const buckets = getBuckets();
  const activeBuckets = bucketIds.map(bucketId => buckets[bucketId]);
  if (sort) {
    return orderBy(
      activeBuckets,
      ['from', 'to', ({ displayName }) => displayName.toLowerCase()]
    );
  }
  return activeBuckets;
};

const getActiveView = () => {
  const activeViewId = customActiveViewId || defaultActiveViewId;
  const customViewIds = new Set(customViews.map(({ id }) => id));
  const views = [...customViews, ...defaultViews.filter(({ id }) => !customViewIds.has(id))];
  const {
    eventBuckets: { buckets: bucketIds, sort, multiBucketEvents }
  } = views.find(({ id }) => id === activeViewId);

  const activeBuckets = getActiveBuckets({ bucketIds, sort });
  const { min: timeMin, max: timeMax } = activeBuckets.reduce(
    ({ min, max }, { from, to }) => ({ min: moment.min(min, from), max: moment.max(max, to) }),
    { min: activeBuckets[0].from, max: activeBuckets[0].to }
  );

  return {
    buckets: activeBuckets,
    multiBucketEvents,
    timeMin: timeMin.format(),
    timeMax: timeMax.format()
  };
};

exports.getActiveView = getActiveView;
