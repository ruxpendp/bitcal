import bitbar, { BitbarOptions, Options } from 'bitbar';
import { CustomConfig, DefaultConfig, ConfigView } from './activeView';

interface Configs {
  customConfig: CustomConfig;
  defaultConfig: DefaultConfig;
}

interface RenderView {
  id: ConfigView['id'];
  displayName: ConfigView['displayName'];
  activeView: DefaultConfig['activeView'];
}

export type MenuItem = string | typeof bitbar.separator | Options;

const renderView = ({ id, displayName, activeView }: RenderView): BitbarOptions => ({
  text: `${activeView === id ? '✓ ' : ''}${displayName}`,
  bash: process.argv[0],
  param1: process.argv[1],
  param2: 'select-view',
  param3: id,
  terminal: false,
  refresh: true
});

export const renderViewsMenu = (
  {
    customConfig: { views: customViews = [], activeView },
    defaultConfig: { views: defaultViews, activeView: defaultActiveView }
  }: Configs
): Options => {
  const customViewIds: Set<string> = new Set(customViews.map(({ id }) => id));
  const views: ConfigView[] = [
    ...customViews,
    ...defaultViews.filter(({ id }) => !customViewIds.has(id))
  ];
  return {
    text: 'Views',
    submenu: views.map(({ id, displayName }: ConfigView) => renderView({ id, displayName, activeView: activeView || defaultActiveView }))
  };
};

export const renderCalendarConfigMenu = (
  { calendars: configCalendars = [] }: CustomConfig
): Options => ({
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
