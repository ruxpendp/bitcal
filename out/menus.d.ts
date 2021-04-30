import bitbar, { Options } from 'bitbar';
import { CustomConfig, DefaultConfig } from './activeView';
interface Configs {
    customConfig: CustomConfig;
    defaultConfig: DefaultConfig;
}
export declare type MenuItem = string | typeof bitbar.separator | Options;
export declare const renderViewsMenu: ({ customConfig: { views: customViews, activeView }, defaultConfig: { views: defaultViews, activeView: defaultActiveView } }: Configs) => Options;
export declare const renderCalendarConfigMenu: ({ calendars: configCalendars }: CustomConfig) => Options;
export {};
//# sourceMappingURL=menus.d.ts.map