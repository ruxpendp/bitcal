const bitbar = require('bitbar');

const iconActive = require('./iconActive');
const iconInactive = require('./iconInactive');
const { getViewsMenu, calendarConfigMenu } = require('./menus');

const getOutput = async () => {
  const output = [];

  output.push({ text: '', templateImage: iconActive }, bitbar.separator);

  output.push(getViewsMenu());
  output.push(calendarConfigMenu);

  bitbar(output);
};

exports.getOutput = getOutput;
