import { promises } from 'fs';
import readline from 'readline';
import { google, Auth } from 'googleapis';

const { readFile, writeFile } = promises;

const SCOPES: string[] = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH: string = `${__dirname}/../credentials.json`;
const TOKEN_PATH: string = `${__dirname}/../token.json`;

interface GetTokenArgs {
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


const getToken = async ({ oAuth2Client, code }: GetTokenArgs): Promise<Auth.Credentials> => {
  try {
    return (await oAuth2Client.getToken(code)).tokens;
  } catch (error) {
    console.error('Error retrieving access token');
    error.category = 'access_token';
    throw error;
  }
};

const getAccessToken = async (oAuth2Client: Auth.OAuth2Client): Promise<Auth.OAuth2Client> => {
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

const authorize = async (
  { clientSecret, clientId, redirectUri }: Credentials
): Promise<Auth.OAuth2Client> => {
  const oAuth2Client: Auth.OAuth2Client = new google.auth
    .OAuth2(clientId, clientSecret, redirectUri);
  try {
    oAuth2Client.setCredentials(JSON.parse((await readFile(TOKEN_PATH)).toString()));
    return oAuth2Client;
  } catch (_error) {
    return getAccessToken(oAuth2Client);
  }
};

const parseCredentials = async (path: string): Promise<ParsedCredentials> => {
  try {
    return JSON.parse((await readFile(path)).toString());
  } catch (error) {
    console.error('Error loading credentials');
    error.category = 'credentials';
    throw error;
  }
};

export const getAuthClient = async (): Promise<Auth.OAuth2Client> => {
  const {
    installed: {
      client_secret: clientSecret,
      client_id: clientId,
      redirect_uris: [redirectUri]
    }
  }: ParsedCredentials = await parseCredentials(CREDENTIALS_PATH);
  return authorize({ clientSecret, clientId, redirectUri });
};

if (require.main === module) {
  getAuthClient();
}
