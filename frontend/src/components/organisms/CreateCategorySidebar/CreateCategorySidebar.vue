<template>
    <div>
        <Sidebar :title="$t('Category.cateory_name')" :visible="visible" @update:visible="inProgress ? '' : $emit('update:visible', $event), resetValues()" width="610px;">
            <template #body>
                <div class="bg-light-gray h-100 p-10px">
                    <div class="position-ab d-flex align-items-center justify-content-center z-index-7 h-100 w-100 bg-dark-gray3" v-if="inProgress">
                        <Spinner :isSpinner="true"/>
                    </div>
                    <div class="bg-white border-radius-8-px p-15px webkit-available">
                        <!-- CHANNEL NAME -->
                        <div class="d-flex align-items-center">
                            <label class="text-nowrap mr-10px">{{$t('Category.cateory_name')}}<span class="red">*</span></label>
                            <div class="position-re w-100">
                                <input type="text" v-model.trim="categoryName.value" :placeholder="$t(`PlaceHolder.enter_category_name`)" class="form-control webkit-available"
                                    @keyup="checkErrors({'field':categoryName,
                                        'name':categoryName.name,
                                        'validations':categoryName.rules,
                                        'type':categoryName.type,
                                        'event':$event.event})"
                                >
                                <div class="red position-ab font-size-11 error__text-category"  v-if="categoryName.error">{{categoryName.error}}</div>
                            </div>
                        </div>

                        <!-- CREATE CHANNEL -->
                        <div class="d-flex justify-content-end mt-2">
                            <button class="btn-primary" @click="createCategory()">{{$t('Category.create_category')}}</button>
                        </div>
                    </div>
                </div>
            </template>
        </Sidebar>
    </div>
</template>

<script setup>
// PACKAGES
import { inject, ref } from "vue";
import { useValidation } from "@/composable/Validation";

// COMPONENTS
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue"
import Spinner from "@/components/atom/SpinnerComp/SpinnerComp.vue"
import { useGetterFunctions } from "@/composable";
import * as env from '@/config/env';
import { useToast } from "vue-toast-notification";
import { apiRequest } from '../../../services';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const {commit} = useStore();
import { useStore } from 'vuex';

// UTILS
const projectData = inject("selectedProject");
const userId = inject("$userId");
const companyId = inject("$companyId");
const {getUser} = useGetterFunctions();
const {checkAllFields, checkErrors} = useValidation()
const $toast = useToast()

// EMITS
const emit = defineEmits(["update:visible", "cancel"]);

// PROPS
defineProps({
    visible: {
        type: Boolean,
        default: false
    },
})

const inProgress = ref(false)
const categoryName = ref({
    error: "",
    value: "",
    rules: "required | min: 3",
    name: "category name"
});

function resetValues() {
    categoryName.value.value = "";
    categoryName.value.error = "";
    emit("update:visible", false);
}

function createCategory() {
    if(inProgress.value) return;
    inProgress.value = true;
    checkAllFields({categoryName: categoryName.value})
    .then((valid) => {
        if(valid) {
            createCategoryFun()
        } else {
            inProgress.value = false;
        }
    })
    .catch((error) => {
        inProgress.value = false;
        console.error("ERROR: ", error);
    })
}

function createCategoryFun() {
    try {
        let user = getUser(userId.value);
        const axiosData = {
            companyId: companyId.value,
            projectId: projectData.value._id,
            folderName: categoryName.value.value,
            userData: {
                id: user.id,
                Employee_Name: user.Employee_Name,
                companyOwnerId: user.companyOwnerId
            },
            projectName: projectData.value.ProjectName,
            mainChat: true
        }

        let endPoint = env.FOLDER;
        apiRequest("post", endPoint, {
            ...axiosData,
            type: "addFolder",
        })
        .then((response) => {
            $toast.success(t(`Toast.Category_created_successfully`), {position: "top-right"})
            commit('mainChat/mutateChatFolders', {op: "added", data: response?.data?.data || {}});
            inProgress.value = false;
            resetValues();
        })
        .catch((err) => {
            $toast.error(t(`Toast.something_went_wrong`), {position: "top-right"})
            emit('cancel');
            inProgress.value = false;
            resetValues();
            console.error("Error: ", err);
        })
    } catch (error) {
        console.error("ERROR: ", error);
    }
}
</script>

<style scoped>
.error__text-category{
    font-size: 11px; 
    bottom: -14px;
    left: 0px;
}
</style>