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
const config = require('../config.json');
const iconActive = require('../iconActive.json');
const iconInactive = require('../iconInactive.json');
const { calendars = [] } = config;
const renderIcon = (icon) => [
    { text: '', templateImage: icon },
    bitbar_1.default.separator
];
const renderMenuBar = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { buckets, multiBucketEvents, timeMin, timeMax } = activeView_1.getActiveView();
        const events = yield calendarApis_1.getEvents({
            calendarIds: calendars.reduce((ids, { active, id }) => active ? [...ids, id] : ids, []),
            timeMin,
            timeMax
        });
        return [
            ...renderIcon(iconActive),
            ...eventBuckets_1.renderEventBuckets({ buckets, events, multiBucketEvents }),
            menus_1.renderViewsMenu(),
            menus_1.renderCalendarConfigMenu()
        ];
    }
    catch (error) {
        return [
            ...renderIcon(iconInactive),
            { text: 'Could Not Fetch Agenda' },
            bitbar_1.default.separator,
            { text: 'Debug', submenu: [{ text: error.stack }] }
        ];
    }
});
exports.renderMenuBar = renderMenuBar;
//# sourceMappingURL=menuBar.js.map