import CalendarComponent from './component/CalendarComponent.vue';
import CalendarTaskDisplayComponent from './component/CalendarTaskDisplayComponent.vue';
import DisplayComponent from './component/DisplayComponent.vue';
import MainLabledComponent from './component/MainLabledComponent.vue';
import QueueListComponent from './component/QueueListComponent.vue';
import SingleQueueListComponent from './component/SingleQueueListComponent.vue';

export default {
    install(app) {
        // Register a global components
        app.component('CalendarComponent', CalendarComponent);
        app.component('CalendarTaskDisplayComponent', CalendarTaskDisplayComponent);
        app.component('DisplayComponent', DisplayComponent);
        app.component('MainLabledComponent', MainLabledComponent);
        app.component('QueueListComponent', QueueListComponent);
        app.component('SingleQueueListComponent', SingleQueueListComponent);
    }
};
