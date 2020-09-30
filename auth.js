const { promises: { readFile, writeFile } } = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH = `${__dirname}/credentials.json`;
const TOKEN_PATH = `${__dirname}/token.json`;

const getToken = async ({ oAuth2Client, code }) => {
  try {
    return (await oAuth2Client.getToken(code)).tokens;
  } catch (error) {
    console.error('Error retrieving access token');
    throw error;
  }
};

const getAccessToken = async oAuth2Client => {
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = prompt => new Promise(resolve => rl.question(prompt, resolve));
  const code = await question('Enter the code from that page here: ');
  rl.close();

  const token = await getToken({ oAuth2Client, code });
  oAuth2Client.setCredentials(token);
  await writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to', TOKEN_PATH);

  return oAuth2Client;
};

const authorize = async ({ clientSecret, clientId, redirectUri }) => {
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  try {
    oAuth2Client.setCredentials(JSON.parse(await readFile(TOKEN_PATH)));
    return oAuth2Client;
  } catch (_error) {
    return getAccessToken(oAuth2Client);
  }
};

const getCredentials = async path => {
  try {
    return JSON.parse(await readFile(path));
  } catch (error) {
    console.error('Error loading credentials');
    throw error;
  }
};

const getAuth = async () => {
  const {
    installed: {
      client_secret: clientSecret,
      client_id: clientId,
      redirect_uris: [redirectUri]
    }
  } = await getCredentials(CREDENTIALS_PATH);
  return authorize({ clientSecret, clientId, redirectUri });
};

if (require.main === module) {
  getAuth();
}

exports.getAuth = getAuth;
