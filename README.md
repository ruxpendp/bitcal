# BitCal
Google Calendar plugin for xbar – see your upcoming events at a glance.

Fully configurable/customizable display. Select from default views or create your own!

## Installation
### Prerequisites
* [xbar](https://xbarapp.com/)
* [Node.js](https://nodejs.org/en/)
### Get Repo
* `git clone` or download the repository
* `cd path/to/repository` and `npm install`

### Get Google Calendar Credentials
* Go to the [Google developer console](https://console.cloud.google.com/)
* Create a new project for BitCal
* On the sidebar under **APIs & Services**, select **Library**
* Search for the **Google Calendar API** and **Enable** it
* On the sidebar under **APIs & Services**, select **OAuth consent screen**
* Follow the prompts.
  * Choose the **External** user type
  * You will be asked to fill in some consent form information, but what you put here is not important. It is just what will show up when BitCal requests initial OAuth access to your calendars. Anything optional can safely be left blank.
* On the sidebar under **APIs & Services**, select **Credentials**
* Select **Create Credentials**, then **OAuth client ID**
* Create a **Desktop app**
* On the **Credentials** page under **OAuth 2.0 Client IDs**, click the icon to download your newly created credentials
* Rename this file to `credentials.json` and drop it in your BitCal repository

### Login
* `cd path/to/repository` then `node .`
* Follow the prompts (follow the url to the OAuth consent screen and paste the code back in your console)

### Running in xbar
* Create a symlink (shortcut) to `bitcal.1m.js` in xbar's plugin folder with `ln -s path/to/repository/bitcal.1m.js path/to/xbar/plugin/folder`
* Make the symlink executable with `chmod +x path/to/symlink`

## Config
_Documentation coming soon! In the meantime check out `defaultConfig.json` to see what is possible. You can create your own `views`, `eventBuckets`, `timeStamps`, and `offsets` in `config.json`._

## Future Plans
* More user-friendly onboarding
  * Menu item button to login
  * Auto refresh calendars on first login
* Config to indicate which calendar an event comes from
* Color coded calendars/events?
* Test coverage
* An actual native macOS app with UI for customizing views!
