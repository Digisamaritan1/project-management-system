<template>
    <div class="position-re mySettingsWrapper p-1">
        <SpinnerComp :is-spinner="isSpinner" />
        <div class="my-settings-main">
            <div class="row flex-row align-items-start">
                <div class="col-md-2 settingprofile" :class="{'d-flex' : clientWidth > 480, 'd-block' : clientWidth <= 480}">
                    <div class="col-md-2 settingprofile">
                        <div class="userimg border-radius-50-per mysettings_profile">
                            <img :src="formData.Employee_profileImageURL" alt="" class="userimg border-radius-50-per"
                            @click="openCropperTool()"
                            v-if="isTempPreview"/>
                            <WasabiImage  v-if="!isTempPreview && formData.Employee_profileImageURL"
                                class="mysettings__wasabi-img"
                                :data="{url: formData.Employee_profileImageURL}"
                                :thumbnail="'120x120'"
                                :userImage="true"
                                @click="openCropperTool()"
                            />
                            <span class="noimg-uploadImage cursor-pointer"  v-if="!isTempPreview && !formData.Employee_profileImageURL" @click="openCropperTool()">
                                {{formData.firsName.value.charAt(0).toUpperCase()}}
                            </span>
                        </div>
                    </div>
                    <div class="col-md-10 settingprofileform">
                        <div class="profileform">
                            <form>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="inputfield position-re">
                                            <label for="fristname">
                                                {{ $t('Auth.firstName') }}
                                            </label>
                                            <input class="logininput" v-model.trim="formData.firsName.value"
                                                placeHolder="eg. Maria" type="text" @keyup="checkErrors({
                                                    'field': formData.firsName,
                                                    'name': formData.firsName.name,
                                                    'validations': formData.firsName.rules,
                                                    'type': formData.firsName.type,
                                                    'event': $event.event
                                                })" id="firstName" tabindex="1" />
                                            <div class="invalid-feedback red position-ab">{{ formData.firsName.error }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="inputfield position-re">
                                            <label for="last name">
                                                {{ $t('Auth.lastName') }}
                                            </label>
                                            <input class="logininput" v-model.trim="formData.lastName.value"
                                                placeHolder="eg. Tailor" type="text"
                                                @keyup="checkErrors({ 'field': formData.lastName, 'name': formData.lastName.name, 'validations': formData.lastName.rules, 'type': formData.lastName.type, 'event': $event.event })"
                                                id="lastName" tabindex="2" />
                                            <div class="invalid-feedback red position-ab">{{ formData.lastName.error }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="inputfield position-re">
                                            <label for="Email">
                                                {{ $t('Auth.email') }}
                                            </label>
                                            <input type="text" class="logininput" disabled="true"
                                                placeHolder="eg. mail@abc.com" v-model.trim="formData.email.value" tabindex="3"
                                                :max-length="254" @keyup="checkErrors({
                                                    'field': formData.email,
                                                    'name': formData.email.name,
                                                    'validations': formData.email.rules,
                                                    'type': formData.email.type,
                                                    'event': $event.event
                                                })" />
                                            <div class="invalid-feedback red position-ab">{{ formData.email.error }}</div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="radioBox">
                                            <label for="Time Format">
                                                {{ $t('Auth.time_format') }}
                                            </label>
                                            <div class="radio_wrapper d-flex">
                                                <div class="radio">
                                                    <input type="radio" name="radio-group-hours"
                                                        v-model="formData.Time_Format" id="12hour" value="24"
                                                        checked="checked">
                                                    <label for="12hour" class="radio-label">24 hours</label>
                                                </div>
                                                <div class="radio">
                                                    <input type="radio" name="radio-group-hours"
                                                        v-model="formData.Time_Format" id="24hour" value="12"
                                                        checked="checked">
                                                    <label for="24hour" class="radio-label">12 hours</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="inputfield">
                                            <label for="Timezone">
                                                {{ $t('Auth.timezone') }}
                                            </label>
                                            <div class="con-select selectExample autocompletex">
                                                <div class="input-select-con">
                                                    <DropDown :id="timeZone">
                                                        <template #button>
                                                            <img src="../../../assets/images/dropdown-arrow.png"
                                                                alt="dropdown-arrow" class="dropdown-arrow">
                                                            <div class=" cursor-pointer text-capitalize" :ref="timeZone">
                                                                {{ formData.Time_Zone }}
                                                            </div>
                                                        </template>
                                                        <template #options>
                                                            <DropDownOption
                                                                @click="formData.Time_Zone = company, $refs[timeZone].click()"
                                                                v-for="(company, index) in timezoneArray" :key="index"
                                                                :item="{ label: company }">
                                                            </DropDownOption>
                                                        </template>
                                                    </DropDown>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="inputfield">
                                            <label for="languages">
                                                <!-- Select Language -->
                                                {{ $t('Auth.selectLanguage') }}
                                            </label>
                                            <div class="con-select selectExample autocompletex">
                                                <div class="input-select-con">
                                                    <DropDown :id="selectedLanguageTitle">
                                                        <template #button>
                                                            <img src="../../../assets/images/dropdown-arrow.png"
                                                                alt="dropdown-arrow" class="dropdown-arrow">
                                                            <div class=" cursor-pointer text-capitalize"
                                                                :ref="selectedLanguageTitle">
                                                                {{ selectedLanguageTitle }}
                                                            </div>
                                                        </template>
                                                        <template #options>
                                                            <DropDownOption
                                                                @click="selectedLanguageCode = data.code, $refs[selectedLanguageTitle].click(), checkLang()"
                                                                v-for="(data) in languageOptions" :key="data.code"
                                                                :item="{ label: data.title }">
                                                            </DropDownOption>
                                                        </template>
                                                    </DropDown>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center justify-content-start mysetiing_save">
                                    <button :disabled="isSpinner" @click.prevent="SaveChangeToDb()"
                                        :class="[{ 'pointer-events-none': isSpinner }]"
                                        class="btn_btn mysetting_save_btn ml-15px">{{ $t('Settings.save_changes')
                                        }}</button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        <CroppingTool :image="{ url: formData.Employee_profileImage, name: fileName }" :isVisible="isCropper"
            title="Company Profile"
            :stencilSize='stencilSize'
            :stencilProps="stencilProps"
            @updateVisible="(val) => isCropper = val"
            @getEditedImage="(val) => { formData.Employee_profileImage = val.url, fileName = val.fileName, base64Image = val.base64Image }" 
            @fileSelect="(val) => {fileInputUser = val}"
        />
</div>
</template>

<script setup>
    import * as env from '@/config/env';
    import timeZoneOption from "./timezoneArray.js";
    import {useToast} from 'vue-toast-notification';
    import { useGetterFunctions } from "@/composable";
    import { useValidation } from "@/composable/Validation.js";
    import { ref, inject, onMounted, defineComponent, nextTick, onUnmounted } from "vue";
    import InputText from "@/components/atom/InputText/InputText.vue";
    import DropDown from "@/components/molecules/DropDown/DropDown.vue";
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
    import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue";
    import { apiRequestWithoutCompnay } from "../../../services";
    import {storageQueryBuilder,generateFileName} from '@/utils/storageQueryBuild.js';
    import CroppingTool from "@/components/atom/CroppingTool/CroppingTool.vue";
    import { useI18n } from 'vue-i18n';
    import { languageTranslateHelper } from '../../../composable/index.js';
    import languageOptions from '@/utils/languagesName.json';
    import { useStore } from "vuex";
    const {commit} = useStore();
    const { selectedLanguageCode, changeLanguage } = languageTranslateHelper();
    const { locale, setLocaleMessage } = useI18n();
    const { t } = useI18n();

    const $toast = useToast();
    const { getUser } = useGetterFunctions();
    const { checkErrors, checkAllFields } = useValidation();
    defineComponent({ InputText,SpinnerComp });
    // variable
    const userId = inject("$userId");
    const clientWidth = inject("$clientWidth");
    const timeZone = ref("");
    const highlightIndex = ref(0);
    const formData = ref({
        firsName: {
            value: "",
            rules:
                "required",
            name: "first name",
            error: "",
        },
        lastName: {
            value: "",
            rules:
                "required",
            name: "last name",
            error: "",
        },
        email: {
            value: "",
            rules:
                "required | regex: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$",
            name: "Email",
            error: "",
        },
        Employee_profileImage: "",
        Time_Zone: '',
        Time_Format: ''
    })
    const timezoneArray = ref(timeZoneOption);
    const fileInputUser = ref();
    const isImgeChange = ref(false);
    const oldFileValue = ref();
    const isSpinner = ref(false);
    const isTempPreview = ref(false);
    const preEmail = ref('');
    const isCropper = ref(false);
    const fileName = ref()
    const base64Image = ref()

    let selectedLanguageTitle = ref('')
    const stencilSize = {
        width: 180,
        height: 180
    }

    const stencilProps = {
        handlers: {},
        movable: false,
        resizable: false,
        aspectRatio: 1
    }

    function init() {
        const user = getUser(userId.value, 1);
        formData.value.firsName.value = user.Employee_FName;
        formData.value.lastName.value = user.Employee_LName;
        formData.value.Employee_profileImage = user.Employee_profileImage == undefined ? '' : user.Employee_profileImage;
        formData.value.Employee_profileImageURL = user.Employee_profileImageURL == undefined ? '' : user.Employee_profileImageURL;
        formData.value.email.value = user.Employee_Email;
        formData.value.Time_Format = user.Time_Format || "12";
        formData.value.Time_Zone = user.Time_Zone || "Asia/Kolkata";
        oldFileValue.value = user.Employee_profileImage;
        preEmail.value = user.Employee_Email;
    }
    const SaveChangeToDb = async () =>{
        isSpinner.value = true;
        const previosLanguage = localStorage.getItem('language');
        const languageData = await changeLanguage(selectedLanguageCode.value);
        if (languageData == null) {
            $toast.error(t('Toast.Language_not_updated!'), { position: 'top-right' });
            selectedLanguageCode.value = previosLanguage;
        } else {
            localStorage.setItem('language', selectedLanguageCode.value);
            locale.value = selectedLanguageCode.value;
            setLocaleMessage(selectedLanguageCode.value, languageData);
        }
        checkAllFields(formData.value).then(async(valid)=>{
            if(valid){
                const user = getUser(userId.value, 1);
                if(formData.value.firsName.value == user.Employee_FName &&
                    formData.value.lastName.value == user.Employee_LName && 
                    formData.value.Employee_profileImage == user.Employee_profileImage &&
                    formData.value.Employee_profileImageURL == user.Employee_profileImageURL &&
                    formData.value.email.value == user.Employee_Email &&
                    formData.value.Time_Format == user.Time_Format &&
                    formData.value.Time_Zone == user.Time_Zone && 
                    selectedLanguageCode.value == previosLanguage) 
                {
                    isSpinner.value = false;
                    return $toast.error(t('Toast.Nothing_to_update'), { position: 'top-right' });
                }
                isSpinner.value = true;
                if(fileName.value && !isImgeChange.value || isImgeChange.value && oldFileValue.value != formData.value.Employee_profileImage){
                    let name = generateFileName(fileName.value,env.STORAGE_TYPE);
                    let filePath = `${name}`;

                    // <!-- Start Remove Section Storage -->
                        if(env.STORAGE_TYPE && env.STORAGE_TYPE === 'server' && oldFileValue.value && oldFileValue.value !== '' && oldFileValue.value?.startsWith('data:') == false) {
                            let axiosConfig = {
                                method : 'delete',
                                url : env.REMOVE_FILE + '/' + "USER_PROFILES" + '?filepath=' + oldFileValue.value + "&thubmkey=userProfile",
                            }
                            await apiRequestWithoutCompnay(axiosConfig.method, axiosConfig.url, axiosConfig.data).catch((e)=>{
                                console.error(e)
                            })
                        }
                    // <!-- End Remove Section Storage -->

                    // Wasbai upload start
                    const apiFormData = {
                        "path": filePath,
                        "key":"userProfile",
                        "base64String": formData.value.Employee_profileImage,
                        "isUserProfile": true
                    }
                    if(env.STORAGE_TYPE && env.STORAGE_TYPE === 'server') {
                        apiFormData.companyId = "USER_PROFILES"
                    }
                await apiRequestWithoutCompnay("post", storageQueryBuilder('upload_64').route, apiFormData).then((res)=>{
                        if(res.data.status){
                            if(env.STORAGE_TYPE && env.STORAGE_TYPE === 'server') {
                                formData.value.Employee_profileImage = res.data.statusText;
                                formData.value.Employee_profileImageURL = res.data.statusText;
                                oldFileValue.value = res.data.statusText
                            } else {
                                formData.value.Employee_profileImage = res.data.statusText[0];
                                formData.value.Employee_profileImageURL = res.data.statusText[0];
                            }
                            isTempPreview.value = false;
                        } else {
                            formData.value.Employee_profileImage = "";
                        }
                    })
                }
                const updateObject =  {
                    $set: {
                        Employee_FName: formData.value.firsName.value,
                        Employee_LName: formData.value.lastName.value,
                        Employee_profileImage: formData.value.Employee_profileImage,
                        Employee_profileImageURL: formData.value.Employee_profileImageURL,
                        Time_Format: formData.value.Time_Format,
                        Time_Zone: formData.value.Time_Zone,
                        Employee_Name: `${formData.value.firsName.value} ${formData.value.lastName.value}` ,
                        updatedAt:new Date(),
                        languageCode: selectedLanguageCode.value
                    }
                }
                const newObj = {
                    returnDocument: 'after'
                }
                /* 
                    - in global collection in that 'user' collection.
                    - we are matching items based on their 'id' and updating the field.
                */
                apiRequestWithoutCompnay("put",env.USER_UPATE,{
                    userId: userId.value,
                    updateObject : updateObject,
                    newObj
                }).then((response)=>{
                    if (response.data.data) {
                        commit("users/mutateUsers", {data:response.data.data,op:"modified"})
                    }
                    formData.value.email.value = preEmail.value;
                    isSpinner.value = false;
                    $toast.success(t("Toast.Profile_updated_successfully"),{position: 'top-right'});
                }).catch((error)=>{
                    isSpinner.value = false;
                    $toast.error(t('Toast.something_went_wrong'),{position: 'top-right'});
                    console.error("ERROR in delete sprint: ", error);
                });
            }
        })
    }
    onMounted(() => {
        timeZone.value = 'user_timezone';
        init();
        startListener();
        checkLang();
    });

    const checkLang = () => {
        languageOptions.find((language) => {
            if (language.code == selectedLanguageCode.value) {
                selectedLanguageTitle.value = language.title;
            }
        });
    };

    function startListener() {
        document.addEventListener("keydown", keyListener)
    }

    function stopListener() {
        document.removeEventListener("keydown", keyListener)
    }

    onUnmounted(() => {
        stopListener();
    })

    function keyListener(event) {
        if(event.keyCode === 13) { // Enter
            formData.value.Time_Zone = timezoneArray.value[highlightIndex.value];
            let timeZoneInput = document.getElementById('item'+highlightIndex.value)
            timeZoneInput.click();
        } else if(event.keyCode === 38){ // UP
            highlightIndex.value = highlightIndex.value > 0 ? highlightIndex.value-1 : 0;
            nextTick(() => {
                document.getElementById('item'+highlightIndex.value)?.scrollIntoView({behavior: "smooth", block: 'end'})
            })
        } else if (event.keyCode === 40){ // DOWN
            highlightIndex.value = highlightIndex.value < timezoneArray.value.length-1 ? highlightIndex.value+1 : timezoneArray.value.length-1;
            nextTick(() => {
                document.getElementById('item'+highlightIndex.value)?.scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start'})
            })
        }
    }

    const openCropperTool = () => {
    setTimeout(() => {
        isCropper.value = true;
        document.getElementById('cropping-input').click()
    })
}
</script>

<style scoped>
@import '@/views/Settings/MySettings/style.css';
</style>
