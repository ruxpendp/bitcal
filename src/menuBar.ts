import bitbar, { BitbarOptions } from 'bitbar';

import { getEvents, Event } from './calendarApis';
import { renderViewsMenu, renderCalendarConfigMenu, MenuItem } from './menus';
import {
  getActiveView,
  CustomConfig,
  DefaultConfig,
  CalculatedActiveView,
  Calendar
} from './activeView';
import { renderEventBuckets } from './eventBuckets';
import { refreshCalendars } from './configHelpers';
let customConfig: CustomConfig = require('../config.json');
const defaultConfig: DefaultConfig = require('../defaultConfig.json');
const iconActive = require('../iconActive.json');
const iconInactive = require('../iconInactive.json');

interface CustomError extends Error {
  category?: string;
}


const CREDENTIAL_LINK: string = (
  'https://github.com/ruxpendp/bitcal#get-google-calendar-credentials'
);

const LOGIN_LINK: string = 'https://github.com/ruxpendp/bitcal#login';

const ERROR_ROWS: { [category: string]: BitbarOptions[] } = {
  credentials: [
    { text: 'Unable to load credentials' },
    { text: 'Get Credentials', href: CREDENTIAL_LINK }
  ],
  get_token: [{ text: 'Error retrieving access token' }],
  parse_token: [{
    text: 'Login',
    href: LOGIN_LINK
    // bash: process.argv[0],
    // param1: process.argv[1],
    // param2: 'login',
    // terminal: true
  }],
  default: [{ text: 'Unable to retrieve events' }]
};

const renderError = (error: CustomError): MenuItem[] => [
  ...(error.category ? ERROR_ROWS[error.category] : ERROR_ROWS.default),
  bitbar.separator,
];

const renderIcon = (icon: string): MenuItem[] => [
  { text: '', templateImage: icon },
  bitbar.separator
];

const renderDebugMenu = (error: CustomError): MenuItem => ({
  text: 'Debug',
  submenu: [
    { text: `Error category: ${error.category || 'none'}` },
    bitbar.separator,
    { text: error.stack || '(no stack)' }
  ]
});

export const renderMenuBar = async (): Promise<MenuItem[]> => {
  try {
    if (!customConfig.calendars) {
      customConfig = await refreshCalendars(true);
    }

    let { calendars = [] } = customConfig;
    const { buckets, multiBucketEvents, timeMin, timeMax }: CalculatedActiveView = getActiveView();

    const events: Event[] = await getEvents({
      calendarIds: calendars.reduce(
        (ids: string[], { active, id }: Calendar) => active ? [...ids, id] : ids,
        []
      ),
      timeMin,
      timeMax
    });

    return [
      ...renderIcon(iconActive),
      ...renderEventBuckets({ buckets, events, multiBucketEvents }),
      renderViewsMenu({ customConfig, defaultConfig }),
      renderCalendarConfigMenu(customConfig)
    ];
  } catch (error) {
    return [
      ...renderIcon(iconInactive),
      ...renderError(error),
      renderViewsMenu({ customConfig, defaultConfig }),
      renderCalendarConfigMenu(customConfig),
      bitbar.separator,
      renderDebugMenu(error)
    ]
  }
};
