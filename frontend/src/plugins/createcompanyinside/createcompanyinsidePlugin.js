import CreatecompnayinsideView from './component/CreatecompnayinsideView.vue';
import CompanysidebarView from './component/CompanysidebarView.vue';
import ProcessbarmodelView from './component/ProcessbarmodelView.vue';


export default {
    install(app) {
        // Create Company In Side a global component
        app.component('CreatecompnayinsideViewComponent', CreatecompnayinsideView);
        app.component('CompanysidebarViewComponent', CompanysidebarView);
        app.component('ProcessbarmodelViewComponent', ProcessbarmodelView);
    }
};
