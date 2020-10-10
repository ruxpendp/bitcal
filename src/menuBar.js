const bitbar = require('bitbar');

const iconActive = require('../iconActive');
const iconInactive = require('../iconInactive');
const { getEvents } = require('./calendarApis');
const { renderViewsMenu, renderCalendarConfigMenu } = require('./menus');
const { getActiveView } = require('./activeView');
const { renderEventBuckets } = require('./eventBuckets');
const { calendars = [] } = require('../config');

const renderIcon = icon => [{ text: '', templateImage: icon }, bitbar.separator];

const renderMenuBar = async () => {
  try {
    const { buckets, multiBucketEvents, timeMin, timeMax } = getActiveView();

    const events = await getEvents({
      calendarIds: calendars.reduce((ids, { active, id }) => active ? [...ids, id] : ids, []),
      timeMin,
      timeMax
    });

    return [
      ...renderIcon(iconActive),
      ...renderEventBuckets({ buckets, events, multiBucketEvents }),
      renderViewsMenu(),
      renderCalendarConfigMenu()
    ];
  } catch (error) {
    return [
      ...renderIcon(iconInactive),
      { text: 'Could Not Fetch Agenda' },
      bitbar.separator,
      { text: 'Debug', submenu: [{ text: error.stack }] }
    ];
  }

};

exports.renderMenuBar = renderMenuBar;
