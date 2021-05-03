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
exports.getAuthClient = exports.login = void 0;
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
        error.category = 'get_token';
        throw error;
    }
});
const getOAuth2Client = ({ clientSecret, clientId, redirectUri }) => new googleapis_1.google.auth.OAuth2(clientId, clientSecret, redirectUri);
const getAccessToken = (credentials) => __awaiter(void 0, void 0, void 0, function* () {
    const oAuth2Client = getOAuth2Client(credentials);
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
const authorize = (credentials) => __awaiter(void 0, void 0, void 0, function* () {
    const oAuth2Client = getOAuth2Client(credentials);
    try {
        oAuth2Client.setCredentials(JSON.parse((yield readFile(TOKEN_PATH)).toString()));
        return oAuth2Client;
    }
    catch (error) {
        console.error('Error parsing token or setting credentials');
        error.category = 'parse_token';
        throw error;
    }
});
const parseCredentials = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { installed: { client_secret: clientSecret, client_id: clientId, redirect_uris: [redirectUri] } } = JSON.parse((yield readFile(CREDENTIALS_PATH)).toString());
        return { clientSecret, clientId, redirectUri };
    }
    catch (error) {
        console.error('Error loading credentials');
        error.category = 'credentials';
        throw error;
    }
});
const login = () => __awaiter(void 0, void 0, void 0, function* () {
    return (getAccessToken(yield parseCredentials()));
});
exports.login = login;
const getAuthClient = () => __awaiter(void 0, void 0, void 0, function* () {
    return (authorize(yield parseCredentials()));
});
exports.getAuthClient = getAuthClient;
//# sourceMappingURL=auth.js.map