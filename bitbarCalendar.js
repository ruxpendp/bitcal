#!/usr/bin/env /usr/local/bin/node

const { bitbarCalendar } = require('./src/index');

process.removeAllListeners('warning');

bitbarCalendar();
