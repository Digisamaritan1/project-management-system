import CustomFieldRender from './component/molecules/customFieldTaskView/customFieldRender.vue';
import CustomFieldSidebar from './component/molecules/customFieldSidebar/customField.vue';
import SettingCustomFieldComponent from './component/molecules/settingCustomField/settingCustomFieldComponent.vue';
import CustomFieldListViewColumn from './component/molecules/customFieldViewColumn/customFieldListViewColumn.vue';
import CustomFieldComp from './component/molecules/customFieldComp/customFieldComp.vue';
import customFieldProjectDetail from './component/molecules/customFieldProjectDetail/customFieldProjectDetail.vue';
import CustomFieldsSidebarComponent from './component/molecules/customFieldSidebar/customFieldsSidebarComponent/customFieldsSidebarComponent.vue';
export default {
    install(app) {
        // Create Company In Side a global component
        app.component('CustomFieldRenderViewComponent', CustomFieldRender);
        app.component('CustomFieldSidebarComponent', CustomFieldSidebar);
        app.component('SettingCustomFieldViewComponent', SettingCustomFieldComponent);
        app.component('CustomFieldListViewColumnComponent', CustomFieldListViewColumn);
        app.component('CustomFieldProjectComponent', CustomFieldComp);
        app.component('CustomFieldProjectDetailView', customFieldProjectDetail);
        app.component('CustomFieldsSidebarComponent', CustomFieldsSidebarComponent);
    }
};
