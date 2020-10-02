const bitbar = require('bitbar');
const moment = require('moment');

const iconActive = require('./iconActive');
const iconInactive = require('./iconInactive');
const { getEvents } = require('./calendarApis');
const { renderViewsMenu, renderCalendarConfigMenu } = require('./menus');
const { calendars = [], primaryCalendar = null, activeView } = require('./config');
const { activeView: defaultActiveView } = require('./defaultConfig');

const getTimeRange = view => {

};

const renderMenuBar = async () => {
  // const { timeMin, timeMax } = getTimeRange(activeView || defaultActiveView);

  const timeMin = moment().format();
  const timeMax = moment().add(1, 'day').format();
  const calendarIds = calendars.filter(({ active }) => active).map(({ id }) => id);

  const events = await getEvents({ calendarIds, timeMin, timeMax });



  const output = [];

  output.push({ text: '', templateImage: iconActive }, bitbar.separator);

  output.push(...events.map(({ summary }) => ({ text: summary })), bitbar.separator);

  output.push(renderViewsMenu());
  output.push(renderCalendarConfigMenu());

  // console.log(output);

  return output;
};

exports.renderMenuBar = renderMenuBar;
