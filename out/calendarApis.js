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
exports.getEvents = exports.getCalendars = void 0;
const moment_1 = __importDefault(require("moment"));
const googleapis_1 = require("googleapis");
const lodash_orderby_1 = __importDefault(require("lodash.orderby"));
const auth_1 = require("./auth");
const getCalendars = () => __awaiter(void 0, void 0, void 0, function* () {
    const gcal = googleapis_1.google
        .calendar({ version: 'v3', auth: yield auth_1.getAuthClient() });
    return (yield gcal.calendarList.list()).data.items || [];
});
exports.getCalendars = getCalendars;
const getEvents = ({ calendarIds, timeMin, timeMax }) => __awaiter(void 0, void 0, void 0, function* () {
    const gcal = googleapis_1.google
        .calendar({ version: 'v3', auth: yield auth_1.getAuthClient() });
    const events = yield calendarIds.reduce((allEvents, calendarId) => __awaiter(void 0, void 0, void 0, function* () {
        const [allFetchedEvents, { data: { items: newFetchedEvents = [] } }] = yield Promise.all([
            allEvents,
            gcal.events.list({
                calendarId,
                timeMin,
                timeMax,
                singleEvents: true
            })
        ]);
        return [
            ...allFetchedEvents,
            ...newFetchedEvents.map(event => (Object.assign(Object.assign({}, event), { start: event.start && moment_1.default(event.start.dateTime || event.start.date), end: event.end && moment_1.default(event.end.dateTime || event.end.date) })))
        ];
    }), Promise.resolve([]));
    return lodash_orderby_1.default(events, ['start', 'end', ({ summary }) => summary && summary.toLowerCase()]);
});
exports.getEvents = getEvents;
//# sourceMappingURL=calendarApis.js.map