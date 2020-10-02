const bitbar = require('bitbar');

const {
  activeView,
  views: customViews = [],
  calendars: configCalendars = []
} = require('./config');
const { activeView: defaultActiveView, views: defaultViews = [] } = require('./defaultConfig');

const renderView = ({ id, displayName }) => ({
  text: `${(activeView || defaultActiveView) === id ? '✓ ' : ''}${displayName}`,
  bash: process.argv[0],
  param1: process.argv[1],
  param2: 'select-view',
  param3: id,
  terminal: false,
  refresh: true
});

const renderViewsMenu = () => {
  const customViewIds = new Set(customViews.map(({ id }) => id));
  const views = [...customViews, ...defaultViews.filter(({ id }) => !customViewIds.has(id))];
  return {
    text: 'Views',
    submenu: views.map(renderView)
  };
};

const renderCalendarConfigMenu = () => ({
  text: 'Calendars',
  submenu: [
    ...configCalendars.map(({ id, displayName, active, primary }) => ({
      text: `${active ? '✓ ' : ''}${displayName}${primary ? ' (primary)' : ''}`,
      bash: process.argv[0],
      param1: process.argv[1],
      param2: 'toggle-calendar',
      param3: id,
      terminal: false,
      refresh: true
    })),
    bitbar.separator,
    {
      text: 'Refresh Calendars',
      bash: process.argv[0],
      param1: process.argv[1],
      param2: 'refresh-calendars',
      terminal: false,
      refresh: true
    }
  ]
});

exports.renderViewsMenu = renderViewsMenu;
exports.renderCalendarConfigMenu = renderCalendarConfigMenu;
