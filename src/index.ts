import bitbar from 'bitbar';

import { selectView, toggleCalendar, refreshCalendars } from './configHelpers';
import { login } from './auth';
import { renderMenuBar } from './menuBar';

interface OptParse {
  'select-view': typeof selectView;
  'toggle-calendar': typeof toggleCalendar;
  'refresh-calendars': typeof refreshCalendars;
  'login': typeof login;
}

const optparse: OptParse = {
  'select-view': selectView,
  'toggle-calendar': toggleCalendar,
  'refresh-calendars': refreshCalendars,
  'login': login
};

const isValidOpt = (opt: string): opt is keyof OptParse => opt in optparse;

export const bitbarCalendar = async (): Promise<void> => {
  if (process.argv.length > 2 && isValidOpt(process.argv[2])) optparse[process.argv[2]]();
  else bitbar(await renderMenuBar());
};

if (require.main === module) {
  bitbarCalendar();
}
