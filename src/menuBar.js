const bitbar = require('bitbar');

const iconActive = require('../iconActive');
const iconInactive = require('../iconInactive');
const { getEvents } = require('./calendarApis');
const { renderViewsMenu, renderCalendarConfigMenu } = require('./menus');
const { getActiveView } = require('./activeView');
const { renderEventBuckets } = require('./eventBuckets');
const { calendars = [] } = require('../config');

const renderMenuBar = async () => {
  const { buckets, multiBucketEvents, timeMin, timeMax } = getActiveView();

  const events = await getEvents({
    calendarIds: calendars.filter(({ active }) => active).map(({ id }) => id),
    timeMin,
    timeMax
  });

  const output = [];

  output.push({ text: '', templateImage: iconActive }, bitbar.separator);

  output.push(...renderEventBuckets({ buckets, events, multiBucketEvents }));

  output.push(renderViewsMenu());
  output.push(renderCalendarConfigMenu());

  return output;
};

exports.renderMenuBar = renderMenuBar;
