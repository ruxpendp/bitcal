const bitbar = require('bitbar');
const moment = require('moment');

const iconActive = require('./iconActive');
const iconInactive = require('./iconInactive');
const { getEvents } = require('./calendarApis');
const { renderViewsMenu, renderCalendarConfigMenu } = require('./menus');
const {
  offsets: customOffsets = {},
  timeStamps: customTimeStamps = {},
  eventBuckets: customBuckets = {},
  views: customViews = [],
  activeView: customActiveViewId = null,
  calendars = [],
  primaryCalendar = null,
} = require('./config');
const {
  offsets: defaultOffsets,
  timeStamps: defaultTimeStamps,
  eventBuckets: defaultBuckets,
  views: defaultViews,
  activeView: defaultActiveViewId,
} = require('./defaultConfig');

// const getOffsets = () => {
//   return { ...defaultOffsets, ...customOffsets };
// };

const calculateTimeStamp = ({ base = 'now', offsetIds = [], offsets }) => offsetIds.reduce(
  (currentTimeStamp, offsetId) => {
    const { func, args } = offsets[offsetId]
    return currentTimeStamp[func](...args);
  },
  base === 'now' ? moment() : moment(base)
);

const getTimeStamps = offsets => Object.entries({ ...defaultTimeStamps, ...customTimeStamps })
  .reduce(
    (timeStamps, [timeStampId, { base, offsets: offsetIds }]) => ({
      ...timeStamps,
      [timeStampId]: calculateTimeStamp({ base, offsetIds, offsets })
    }),
    {}
  );

const getBuckets = timeStamps => Object.entries({ ...defaultBuckets, ...customBuckets }).reduce(
  (buckets, [bucketId, { displayName, from: fromTimeStampId, to: toTimeStampId }]) => ({
    ...buckets,
    [bucketId]: {
      displayName,
      from: timeStamps[fromTimeStampId],
      to: timeStamps[toTimeStampId]
    }
  }),
  {}
);

const renderMenuBar = async () => {
  const timeStamps = getTimeStamps({ ...defaultOffsets, ...customOffsets });
  const buckets = getBuckets(timeStamps);

  const events = await getEvents({
    calendarIds: calendars.filter(({ active }) => active).map(({ id }) => id),
    timeMin: moment().format(),
    timeMax: moment().add(1, 'day').format()
  });

  const output = [];

  output.push({ text: '', templateImage: iconActive }, bitbar.separator);

  output.push(...events.map(({ summary }) => ({ text: summary })), bitbar.separator);

  output.push(renderViewsMenu());
  output.push(renderCalendarConfigMenu());

  // console.log(output);

  return output;
};

exports.renderMenuBar = renderMenuBar;
