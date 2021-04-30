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
exports.getAuthClient = void 0;
const fs_1 = require("fs");
const readline_1 = __importDefault(require("readline"));
const googleapis_1 = require("googleapis");
const { readFile, writeFile } = fs_1.promises;
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH = `${__dirname}/../credentials.json`;
const TOKEN_PATH = `${__dirname}/../token.json`;
const getToken = ({ oAuth2Client, code }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return (yield oAuth2Client.getToken(code)).tokens;
    }
    catch (error) {
        console.error('Error retrieving access token');
        error.category = 'access_token';
        throw error;
    }
});
const getAccessToken = (oAuth2Client) => __awaiter(void 0, void 0, void 0, function* () {
    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline_1.default
        .createInterface({ input: process.stdin, output: process.stdout });
    const question = (prompt) => (new Promise(resolve => rl.question(prompt, resolve)));
    const code = yield question('Enter the code from that page here: ');
    rl.close();
    const token = yield getToken({ oAuth2Client, code });
    oAuth2Client.setCredentials(token);
    yield writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to', TOKEN_PATH);
    return oAuth2Client;
});
const authorize = ({ clientSecret, clientId, redirectUri }) => __awaiter(void 0, void 0, void 0, function* () {
    const oAuth2Client = new googleapis_1.google.auth
        .OAuth2(clientId, clientSecret, redirectUri);
    try {
        oAuth2Client.setCredentials(JSON.parse((yield readFile(TOKEN_PATH)).toString()));
        return oAuth2Client;
    }
    catch (_error) {
        return getAccessToken(oAuth2Client);
    }
});
const parseCredentials = (path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return JSON.parse((yield readFile(path)).toString());
    }
    catch (error) {
        console.error('Error loading credentials');
        error.category = 'credentials';
        throw error;
    }
});
const getAuthClient = () => __awaiter(void 0, void 0, void 0, function* () {
    const { installed: { client_secret: clientSecret, client_id: clientId, redirect_uris: [redirectUri] } } = yield parseCredentials(CREDENTIALS_PATH);
    return authorize({ clientSecret, clientId, redirectUri });
});
exports.getAuthClient = getAuthClient;
if (require.main === module) {
    exports.getAuthClient();
}
//# sourceMappingURL=auth.js.map