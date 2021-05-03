"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMenuBar = void 0;
const bitbar_1 = __importDefault(require("bitbar"));
const calendarApis_1 = require("./calendarApis");
const menus_1 = require("./menus");
const activeView_1 = require("./activeView");
const eventBuckets_1 = require("./eventBuckets");
const configHelpers_1 = require("./configHelpers");
let customConfig = require('../config.json');
const defaultConfig = require('../defaultConfig.json');
const iconActive = require('../iconActive.json');
const iconInactive = require('../iconInactive.json');
const CREDENTIAL_LINK = ('https://github.com/ruxpendp/bitcal#get-google-calendar-credentials');
const LOGIN_LINK = 'https://github.com/ruxpendp/bitcal#login';
const ERROR_ROWS = {
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
const renderError = (error) => [
    ...(error.category ? ERROR_ROWS[error.category] : ERROR_ROWS.default),
    bitbar_1.default.separator,
];
const renderIcon = (icon) => [
    { text: '', templateImage: icon },
    bitbar_1.default.separator
];
const renderDebugMenu = (error) => ({
    text: 'Debug',
    submenu: [
        { text: `Error category: ${error.category || 'none'}` },
        bitbar_1.default.separator,
        { text: error.stack || '(no stack)' }
    ]
});
const renderMenuBar = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!customConfig.calendars) {
            customConfig = yield configHelpers_1.refreshCalendars(true);
        }
        let { calendars = [] } = customConfig;
        const { buckets, multiBucketEvents, timeMin, timeMax } = activeView_1.getActiveView();
        const events = yield calendarApis_1.getEvents({
            calendarIds: calendars.reduce((ids, { active, id }) => active ? [...ids, id] : ids, []),
            timeMin,
            timeMax
        });
        return [
            ...renderIcon(iconActive),
            ...eventBuckets_1.renderEventBuckets({ buckets, events, multiBucketEvents }),
            menus_1.renderViewsMenu({ customConfig, defaultConfig }),
            menus_1.renderCalendarConfigMenu(customConfig)
        ];
    }
    catch (error) {
        return [
            ...renderIcon(iconInactive),
            ...renderError(error),
            menus_1.renderViewsMenu({ customConfig, defaultConfig }),
            menus_1.renderCalendarConfigMenu(customConfig),
            bitbar_1.default.separator,
            renderDebugMenu(error)
        ];
    }
});
exports.renderMenuBar = renderMenuBar;
//# sourceMappingURL=menuBar.js.map