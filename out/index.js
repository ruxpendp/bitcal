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
exports.bitbarCalendar = void 0;
const bitbar_1 = __importDefault(require("bitbar"));
const configHelpers_1 = require("./configHelpers");
const auth_1 = require("./auth");
const menuBar_1 = require("./menuBar");
const optparse = {
    'select-view': configHelpers_1.selectView,
    'toggle-calendar': configHelpers_1.toggleCalendar,
    'refresh-calendars': configHelpers_1.refreshCalendars,
    'login': auth_1.login
};
const isValidOpt = (opt) => opt in optparse;
const bitbarCalendar = () => __awaiter(void 0, void 0, void 0, function* () {
    if (process.argv.length > 2 && isValidOpt(process.argv[2]))
        optparse[process.argv[2]]();
    else
        bitbar_1.default(yield menuBar_1.renderMenuBar());
});
exports.bitbarCalendar = bitbarCalendar;
if (require.main === module) {
    exports.bitbarCalendar();
}
//# sourceMappingURL=index.js.map