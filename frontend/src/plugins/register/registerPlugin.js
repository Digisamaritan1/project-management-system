import RegisterView from './component/RegisterView.vue';

export default {
    install(app) {
        // Register a global component
        app.component('RegisterViewComponent', RegisterView);
    }
};
