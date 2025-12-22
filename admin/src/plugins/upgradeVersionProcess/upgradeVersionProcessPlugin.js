import UpgradeVersionBtn from './component/UpgradeVersionBtn.vue';
import CustomizationModel from './component/CustomizationModel.vue';
import UpgradeProcessModel from './component/UpgradeProcessModel.vue';
import ReleaseNoteModelComponent from './component/ReleaseNoteModelComponent.vue';
import EnvStepForm from './component/EnvStepForm.vue';
import EnvFormModelComponent from './component/EnvFormModelComponent.vue';
import GeneralNotes from './component/GeneralNotes.vue';

export default {
    install(app) {
        // Register a global components
        app.component('CustomizationModel', CustomizationModel);
        app.component('UpgradeVersionBtn', UpgradeVersionBtn);
        app.component('ReleaseNoteModelComponent', ReleaseNoteModelComponent);
        app.component('UpgradeProcessModel', UpgradeProcessModel);
        app.component('EnvStepForm', EnvStepForm);
        app.component('EnvFormModelComponent', EnvFormModelComponent);
        app.component('GeneralNotes', GeneralNotes);
    }
};
