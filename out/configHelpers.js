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
exports.refreshCalendars = exports.toggleCalendar = exports.selectView = void 0;
const fs_1 = require("fs");
const lodash_orderby_1 = __importDefault(require("lodash.orderby"));
const calendarApis_1 = require("./calendarApis");
const config = require('../config.json');
const { writeFile } = fs_1.promises;
const { calendars: configCalendars = [] } = config;
const writeConfig = (newConfig) => __awaiter(void 0, void 0, void 0, function* () {
    yield writeFile(`${__dirname}/../config.json`, JSON.stringify(newConfig, null, 2));
});
const selectView = () => {
    writeConfig(Object.assign(Object.assign({}, config), { activeView: process.argv[3] }));
};
exports.selectView = selectView;
const toggleCalendar = () => {
    const newCalendars = configCalendars.map(({ id, displayName, active, primary }) => ({
        id,
        displayName,
        active: id === process.argv[3] ? !active : active,
        primary
    }));
    writeConfig(Object.assign(Object.assign({}, config), { calendars: newCalendars }));
};
exports.toggleCalendar = toggleCalendar;
const calendarIsActive = ({ activatePrimary, primary, id, currentCalendars }) => {
    if (activatePrimary && primary)
        return true;
    return (id && currentCalendars[id]) ? currentCalendars[id].active : false;
};
const refreshCalendars = (activatePrimary = false) => __awaiter(void 0, void 0, void 0, function* () {
    const fetchedCalendars = yield calendarApis_1.getCalendars();
    const currentCalendars = configCalendars.reduce((calendars, calendar) => (Object.assign(Object.assign({}, calendars), { [calendar.id]: calendar })), {});
    const newCalendars = lodash_orderby_1.default(fetchedCalendars.map(({ id, summary, primary }) => ({
        id: id || `no id ${Math.random()}`,
        displayName: summary || '<Unnamed Calendar>',
        active: calendarIsActive({ activatePrimary, primary, id, currentCalendars }),
        primary: primary || undefined
    })), [
        ({ primary }) => Boolean(primary),
        ({ displayName }) => displayName.toLowerCase(),
        'id'
    ], ['desc', 'asc', 'asc']);
    const primaryCalendarId = newCalendars.length && newCalendars[0].primary
        ? newCalendars[0].id
        : null;
    const newConfig = Object.assign(Object.assign({}, config), { calendars: newCalendars, primaryCalendar: primaryCalendarId });
    yield writeConfig(newConfig);
    return newConfig;
});
exports.refreshCalendars = refreshCalendars;
//# sourceMappingURL=configHelpers.js.map