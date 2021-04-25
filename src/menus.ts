import bitbar, { BitbarOptions, Options } from 'bitbar';
import { CustomConfig, DefaultConfig, ConfigView } from './activeView';
const customConfig = require('../config.json');
const defaultConfig = require('../defaultConfig.json');

export type MenuItem = string | typeof bitbar.separator | Options;


const {
  activeView,
  views: customViews = [],
  calendars: configCalendars = []
}: CustomConfig = customConfig;

const { activeView: defaultActiveView, views: defaultViews = [] }: DefaultConfig = defaultConfig;

const renderView = ({ id, displayName }: ConfigView): BitbarOptions => ({
  text: `${(activeView || defaultActiveView) === id ? '✓ ' : ''}${displayName}`,
  bash: process.argv[0],
  param1: process.argv[1],
  param2: 'select-view',
  param3: id,
  terminal: false,
  refresh: true
});

export const renderViewsMenu = (): Options => {
  const customViewIds: Set<string> = new Set(customViews.map(({ id }) => id));
  const views: ConfigView[] = [
    ...customViews,
    ...defaultViews.filter(({ id }) => !customViewIds.has(id))
  ];
  return {
    text: 'Views',
    submenu: views.map(renderView)
  };
};

export const renderCalendarConfigMenu = (): Options => ({
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
