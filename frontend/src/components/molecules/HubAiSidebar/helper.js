import { useToast } from "vue-toast-notification";
import taskClass from "@/utils/TaskOperations"
import { i18n } from "@/locales/main";
const t = i18n.global.t;

const $toast = useToast();

export const insertDescription = (values,project,userData,task,companyId) => {
    return new Promise((resolve,reject) => {
        try {
            let description = values.description
            if(task.description){
                description = task.description + description
            }
            let obj = {
                text: description,
                html: `<p>${description}</p>`
            }
        
            taskClass.updateDescription({
                companyId: companyId,
                task: task,
                text: obj
            }).then(() => {
                resolve();
                $toast.success(t('Toast.Description_updated_successfully'),{position: 'top-right'});
            })
            .catch((error) => {
                console.error("Error in updating Description: ", error);
                $toast.error(t('Toast.Description_not_updated'),{position: 'top-right'});
            })
        } catch (error) {
            reject();
            console.error("Error in updating Description: ", error);
        }
    })
}