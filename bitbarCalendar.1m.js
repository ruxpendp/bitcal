#!/usr/bin/env /usr/local/bin/node

const { bitbarCalendar } = require('./out/index');

process.removeAllListeners('warning');

bitbarCalendar();
