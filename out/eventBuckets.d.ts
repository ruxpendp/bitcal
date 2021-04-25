import { CalculatedEventBucket } from './activeView';
import { MenuItem } from './menus';
import { Event } from './calendarApis';
interface EventRenderData {
    buckets: CalculatedEventBucket[];
    events: Event[];
    multiBucketEvents: boolean;
}
export declare const renderEventBuckets: ({ buckets, events, multiBucketEvents }: EventRenderData) => MenuItem[];
export {};
//# sourceMappingURL=eventBuckets.d.ts.map