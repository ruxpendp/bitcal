"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCalendarConfigMenu = exports.renderViewsMenu = void 0;
const bitbar_1 = __importDefault(require("bitbar"));
// const {
//   activeView,
//   views: customViews = [],
//   calendars: configCalendars = []
// }: CustomConfig = customConfig;
// const { activeView: defaultActiveView, views: defaultViews = [] }: DefaultConfig = defaultConfig;
const renderView = ({ id, displayName, activeView }) => ({
    text: `${activeView === id ? '✓ ' : ''}${displayName}`,
    bash: process.argv[0],
    param1: process.argv[1],
    param2: 'select-view',
    param3: id,
    terminal: false,
    refresh: true
});
const renderViewsMenu = ({ customConfig: { views: customViews = [], activeView }, defaultConfig: { views: defaultViews, activeView: defaultActiveView } }) => {
    const customViewIds = new Set(customViews.map(({ id }) => id));
    const views = [
        ...customViews,
        ...defaultViews.filter(({ id }) => !customViewIds.has(id))
    ];
    return {
        text: 'Views',
        submenu: views.map(({ id, displayName }) => renderView({ id, displayName, activeView: activeView || defaultActiveView }))
    };
};
exports.renderViewsMenu = renderViewsMenu;
const renderCalendarConfigMenu = ({ calendars: configCalendars = [] }) => ({
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
        bitbar_1.default.separator,
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
exports.renderCalendarConfigMenu = renderCalendarConfigMenu;
//# sourceMappingURL=menus.js.map