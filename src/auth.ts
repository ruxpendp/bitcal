import { promises } from 'fs';
import readline from 'readline';
import { google, Auth } from 'googleapis';

const { readFile, writeFile } = promises;

const SCOPES: string[] = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH: string = `${__dirname}/../credentials.json`;
const TOKEN_PATH: string = `${__dirname}/../token.json`;

interface GetToken {
  oAuth2Client: Auth.OAuth2Client;
  code: string;
}

interface ParsedCredentials {
  installed: {
    client_secret: string;
    client_id: string;
    redirect_uris: string[];
  }
}

interface Credentials {
  clientSecret: string;
  clientId: string;
  redirectUri?: string;
}


const getToken = async ({ oAuth2Client, code }: GetToken): Promise<Auth.Credentials> => {
  try {
    return (await oAuth2Client.getToken(code)).tokens;
  } catch (error) {
    console.error('Error retrieving access token');
    error.category = 'get_token';
    throw error;
  }
};

const getOAuth2Client = (
  { clientSecret, clientId, redirectUri }: Credentials
): Auth.OAuth2Client => new google.auth.OAuth2(clientId, clientSecret, redirectUri);

const getAccessToken = async (credentials: Credentials): Promise<Auth.OAuth2Client> => {
  const oAuth2Client: Auth.OAuth2Client = getOAuth2Client(credentials);
  const authUrl: string = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl: readline.Interface = readline
    .createInterface({ input: process.stdin, output: process.stdout });
  const question = (prompt: string): Promise<string> => (
    new Promise(resolve => rl.question(prompt, resolve)
  ));
  const code: string = await question('Enter the code from that page here: ');
  rl.close();

  const token: Auth.Credentials = await getToken({ oAuth2Client, code });
  oAuth2Client.setCredentials(token);
  await writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to', TOKEN_PATH);

  return oAuth2Client;
};

const authorize = async (credentials: Credentials): Promise<Auth.OAuth2Client> => {
  const oAuth2Client: Auth.OAuth2Client = getOAuth2Client(credentials);
  try {
    oAuth2Client.setCredentials(JSON.parse((await readFile(TOKEN_PATH)).toString()));
    return oAuth2Client;
  } catch (error) {
    console.error('Error parsing token or setting credentials');
    error.category = 'parse_token';
    throw error;
  }
};

const parseCredentials = async (): Promise<Credentials> => {
  try {
    const {
      installed: {
        client_secret: clientSecret,
        client_id: clientId,
        redirect_uris: [redirectUri]
      }
    }: ParsedCredentials = JSON.parse((await readFile(CREDENTIALS_PATH)).toString());
    return { clientSecret, clientId, redirectUri };
  } catch (error) {
    console.error('Error loading credentials');
    error.category = 'credentials';
    throw error;
  }
};

export const login = async (): Promise<Auth.OAuth2Client> => (
  getAccessToken(await parseCredentials())
);

export const getAuthClient = async (): Promise<Auth.OAuth2Client> => (
  authorize(await parseCredentials())
);
