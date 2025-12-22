<template>
    <div class="plantab_wrapper">
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
            <div>
                <button class="link-button mr-20" @click="cancelUpload">Cancel</button>
                <button class="primary-button" @click="saveUpload">Save</button>
            </div>
        </div>
        <div class="uploadImgWrapper white-box-main">
            <div class="row">
                <div class="col-md-4">
                    <label>Admin Logo</label>
                    <div class="image-contain--wrapper">
                        <img id="logoAdminPreview" class="uploaded_img" />
                        <DragAndDrop
                            :handleClick="true"
                            :extensions="[{name: '.jpg'}, {name: '.jpeg'}, {name: '.png'}, {name: '.svg'}]"
                            @handleDrop="(val) => openCropperTool('logoAdminUpload', val)"
                            :show="isAdminLogoShow"
                            @click="openCropperTool('logoAdminUpload')"
                        />
                            <!-- @handleDrop="(val) => {logoAdminUpload, openCropperTool('logoAdminUpload', val)}" -->
                    </div>
                    <span draggable="false" @dragstart.prevent class="font-size-13 gray">Preferred size: <span class="font-weight-bold black">265 x 50 px (5:1)</span></span>
                </div>
                <div class="col-md-4">
                    <label>Web App Logo</label>
                    <div class="image-contain--wrapper">
                        <img id="logoWebPreview" class="uploaded_img" />
                        <DragAndDrop
                            :handleClick="true"
                            :extensions="[{name: '.jpg'}, {name: '.jpeg'}, {name: '.png'}, {name: '.svg'}]"
                            @handleDrop="(val) => openCropperTool('logoWebPreview', val)"
                            :show="isWebLogoShow"
                            @click="openCropperTool('logoWebPreview')"
                        />
                    </div>
                    <span draggable="false" @dragstart.prevent class="font-size-13 gray">Preferred size: <span class="font-weight-bold black">265 x 50 px (5:1)</span></span>
                </div>
                <div class="col-md-4">
                    <label>Desktop App Logo</label>
                    <div class="image-contain--wrapper">
                        <img id="logoDesktopPreview" class="uploaded_img" />
                        <DragAndDrop
                            :handleClick="true"
                            :extensions="[{name: '.jpg'}, {name: '.jpeg'}, {name: '.png'}, {name: '.svg'}]"
                            @handleDrop="(val) => openCropperTool('logoDesktopPreview', val)"
                            :show="isDesktopLogoShow"
                            @click="openCropperTool('logoDesktopPreview')"
                        />
                    </div>
                    <span draggable="false" @dragstart.prevent class="font-size-13 gray">Preferred size: <span class="font-weight-bold black">1024 x 1024 px (1:1)</span></span>
                </div>
            </div>
            <div class="row mt-20-i">
                <div class="col-md-4">
                    <label>Favicon</label>
                    <div class="image-contain--wrapper">
                        <img id="favicaonPreview" class="uploaded_img" />
                        <DragAndDrop
                            :handleClick="true"
                            :extensions="[{name: '.jpg'}, {name: '.jpeg'}, {name: '.png'}, {name: '.svg'}]"
                            @handleDrop="(val) => openCropperTool('favicaonPreview', val)"
                            :show="isFavicaShow"
                            @click="openCropperTool('favicaonPreview')"
                        />
                    </div>
                    <span draggable="false" @dragstart.prevent class="font-size-13 gray">Preferred size: <span class="font-weight-bold black">16 x 16 px (1:1)</span></span>
                </div>
                <div class="col-md-4">
                    <label>Email Template Logo</label>
                    <div class="image-contain--wrapper">
                        <img id="emailTemplatePreview" class="uploaded_img" />
                        <DragAndDrop
                            :handleClick="true"
                            :extensions="[{name: '.jpg'}, {name: '.jpeg'}, {name: '.png'}]"
                            @handleDrop="(val) => openCropperTool('emailTemplatePreview', val)"
                            :show="isEmailLogoShow"
                            @click="openCropperTool('emailTemplatePreview')"
                        />
                    </div>
                    <span draggable="false" @dragstart.prevent class="font-size-13 gray">Preferred size: <span class="font-weight-bold black">265 x 50 px (5:1)</span></span>
                </div>
                <div class="col-md-4"></div>
            </div>
            <div class="col-md-4"></div>
            <!-- <div class="themeCustomizer">
                <h4>Theme Customizer</h4>
                <div class="themeCustomizer-main">
                    <label>Primary Color Settings</label>
                    <div class="form-group">
                        <div class="input-color-wrapper">
                            <input type="color" ref="color_picker" v-model="colorValue">
                            <span @click="$refs['color_picker'].click()" class="cursor-pointer">{{colorValue}}</span>
                        </div>
                    </div>
                </div>
            </div> -->
        </div>
        <div class="white-box-main mt-20-i">
            <div class="row d-flex">
                <div class="col-md-3">
                    <div class="form-group white-box-main-col">
                        <label for="inputEmailSP" class="control-label">Product Name</label>
                        <InputText 
                            :modelValue="whiteLabledInformation.productName.value"
                            @update:modelValue="(val)=>{ whiteLabledInformation.productName.value = val.trim() }" 
                            type="text" class="form-control" 
                            id="inputEmailSP" 
                            placeholder="Product Name"
                        />
                    </div>
                </div>
            </div>
            <!-- <div class="row d-flex mt-10-i">
                <div class="col-md-12">
                    <div class="form-group white-box-main-col">
                        <label for="inputEmailSP1" class="control-label">Product Description</label>
                        <textarea 
                            style="height:100px;resize:none;"
                            v-model.trim="whiteLabledInformation.productDescription.value"
                            class="form-control" 
                            id="inputEmailSP1" 
                            placeholder="Product Description"
                        />
                    </div>
                </div>
            </div> -->
            <div class="row d-flex mt-10-i flex-wrap">
                <div class="col-md-3">
                    <div class="form-group white-box-main-col">
                        <label for="inputEmailSE" class="control-label">Terms of Service</label>
                        <InputText 
                            :modelValue="whiteLabledInformation.termsOfService.value" 
                            @keyup="validateURL('termsOfService')" 
                            @update:modelValue="(val)=>{ whiteLabledInformation.termsOfService.value = val.trim() }" 
                            type="text" 
                            class="form-control" 
                            id="inputEmailSE" 
                            placeholder="Terms of Service"
                        />
                        <small class="red error" >{{ whiteLabledInformation.termsOfService.error ? whiteLabledInformation.termsOfService.error : '' }}</small>
                    </div>
                </div>
                <div class="col-md-3 mt-10-i-mob">
                    <div class="form-group white-box-main-col">
                        <label for="inputEmailSEP" class="control-label">Privacy Policy</label>
                        <InputText 
                            :modelValue="whiteLabledInformation.privacyPolicy.value" 
                            @keyup="validateURL('privacyPolicy')" 
                            @update:modelValue="(val)=>{ whiteLabledInformation.privacyPolicy.value = val.trim() }" 
                            type="test" 
                            class="form-control" 
                            id="inputEmailSEP" 
                            placeholder="Privacy Policy"
                        />
                        <small class="red error" >{{ whiteLabledInformation.privacyPolicy.error ? whiteLabledInformation.privacyPolicy.error : '' }}</small>
                    </div>
                </div>
                <div class="col-md-3 mt-10-i-mob">
                    <div class="form-group white-box-main-col">
                        <label for="inputEmailSH" class="control-label">Help Link</label>
                        <InputText 
                            :modelValue="whiteLabledInformation.helpLink.value" 
                            @keyup="validateURL('helpLink')" 
                            @update:modelValue="(val)=>{ whiteLabledInformation.helpLink.value = val.trim() }" 
                            type="text" 
                            class="form-control" 
                            id="inputEmailSH" 
                            placeholder="Help Link"
                        />
                        <small class="red error" >{{ whiteLabledInformation.helpLink.value ? whiteLabledInformation.helpLink.error : '' }}</small>
                    </div>
                </div>
                <div class="col-md-3 mt-10-i-mob mt-10-i">
                    <div class="form-group white-box-main-col">
                        <label for="inputEmailSH" class="control-label">Contact Support Link</label>
                        <InputText 
                            :modelValue="whiteLabledInformation.supportLink.value" 
                            @keyup="validateURL('supportLink')" 
                            @update:modelValue="(val)=>{ whiteLabledInformation.supportLink.value = val.trim() }" 
                            type="text" 
                            class="form-control" 
                            id="inputEmailSH" 
                            placeholder="Contact Support Link"
                        />
                        <small class="red error" >{{ whiteLabledInformation.supportLink.value ? whiteLabledInformation.supportLink.error : '' }}</small>
                    </div>
                </div>
            </div>
        </div>
        <CroppingTool :isVisible="isCropper"
            :dropImage="dropImage"
            title="Brand Image"
            :imageType="logoType"
            :stencilSize='stencilSize'
            :stencilProps="stencilProps"
            @updateVisible="(val) => isCropper = val"
            @getEditedImage="(val) => { cropperFunction(val.base64Image), fileName = val.fileName, base64Image = val.base64Image }" 
        />
    </div>
</template>
<script setup>
// PACKAGES
import { onMounted, ref } from 'vue';
import { useToast } from "vue-toast-notification";
import * as env from '@/config/env';
import { apiRequestWithoutCompnay } from "../../../services";
import InputText from '@/components/atom/InputText/InputText.vue';
import { useStore } from 'vuex';

// COMPONENTS
import BreadCrumb from '@/components/atom/BreadCrumb/BreadCrumb';
import DragAndDrop from '@/components/atom/DragAndDropDivCompo/DragAndDropDivCompo.vue';
import CroppingTool from '@/components/atom/CroppingTool/CroppingTool.vue';

const breadCrumbArray = [
    {name: 'Home', routeObj: {name: 'Home'}, isClickable: true},
    {name: 'Settings', routeObj: {name: ''}, isClickable: false},
    {name: 'Brand Settings', routeObj: {name: 'Brand Settings'}, isClickable: false},
]
const { getters,dispatch,commit } = useStore();
const $toast = useToast();
// const colorValue = ref("#2F3990");

const isCropper = ref(false);
const fileName = ref('');
const logoType = ref('')

const stencilSize = {
    width: 0,
    height: 0
}

const stencilProps = {
    handlers: {},
    movable: false,
    resizable: false,
    aspectRatio: 1
}

const dropImage = ref();

// Admin Var
const isAdminLogoChange = ref(false);
const isAdminLogoShow = ref(false);
const adminLogoData = ref({});

// Web Var
const isWebLogoChange = ref(false);
const isWebLogoShow = ref(false);
const webLogoData = ref({});

// Desktop Var
const isDesktopLogoChange = ref(false);
const isDesktopLogoShow = ref(false);
const desktopLogoData = ref({});

// Favicon Var
const isFavicaonChange = ref(false);
const isFavicaShow = ref(false);
const faviconData = ref({});

// Email Template Var
const isEmaillogoChange = ref(false)
const isEmailLogoShow = ref(false)
const emailTemplateData = ref({});

//Handling form data
const whiteLabledInformation = ref({
    termsOfService:{
        value: '',
        rules: "",
        name: "Terms of Service",
        error: ""
    },
    privacyPolicy:{
        value:'',
        rules: "",
        name: "Privacy Policy",
        error:""
    },
    helpLink:{
        value:'',
        rules: "",
        name: "Help Link",
        error:""
    },
    supportLink:{
        value:'',
        rules: "",
        name: "Support Link",
        error:""
    },
    productName:{
        value:'',
        rules:
        "",
        name: "Product Name",
        error:""
    },
    // productDescription:{
    //     value:'',
    //     rules:
    //     "",
    //     name: "Product Description",
    //     error:""
    // }
});

async function cancelUpload() {
    const oFReader = new FileReader();

    // Cancel Admin Logo
    if (isAdminLogoChange.value) {
        const adminLogofileRes = await fetch(env.API_URI + env.GET_LOGO + "?key=logo&type=admin");
        const adminLogoblob = await adminLogofileRes.blob();
        oFReader.readAsDataURL(adminLogoblob);
        oFReader.onload = function (oFREvent) {
            document.getElementById("logoAdminPreview").src = oFREvent.target.result;
        };
    }

    // Cancel Web Logo
    if (isWebLogoChange.value) {
        const webLogofileRes = await fetch(env.API_URI + env.GET_LOGO + "?key=logo&type=web");
        const webLogoblob = await webLogofileRes.blob();
        oFReader.readAsDataURL(webLogoblob);
        oFReader.onload = function (oFREvent) {
            document.getElementById("logoWebPreview").src = oFREvent.target.result;
        };
    }

    // Cancel Desktop Logo
    if (isDesktopLogoChange.value) {
        const desktopLogofileRes = await fetch(env.API_URI + env.GET_LOGO + "?key=logo&type=desktop");
        const desktopLogoblob = await desktopLogofileRes.blob();
        oFReader.readAsDataURL(desktopLogoblob);
        oFReader.onload = function (oFREvent) {
            document.getElementById("logoDesktopPreview").src = oFREvent.target.result;
        };
    }

    // Cancel Favicon Logo
    if (isFavicaonChange.value) {
        const faviconLogofileRes = await fetch(env.API_URI + env.GET_LOGO + "?key=favicon");
        const faviconLogoblob = await faviconLogofileRes.blob();
        oFReader.readAsDataURL(faviconLogoblob);
        oFReader.onload = function (oFREvent) {
            document.getElementById("favicaonPreview").src = oFREvent.target.result;
        };
    }
    
    // Cancel Email Template Logo
    if (isEmaillogoChange.value) {
        const emailTemplateLogofileRes = await fetch(env.API_URI + env.GET_LOGO + "?key=logo&type=emailTemplateLogo");
        const emailTemplateLogoblob = await emailTemplateLogofileRes.blob();
        oFReader.readAsDataURL(emailTemplateLogoblob);
        oFReader.onload = function (oFREvent) {
            document.getElementById("favicaonPreview").src = oFREvent.target.result;
        };
    }
}
function saveUpload() {
    try {
        validateURL('helpLink');
        validateURL('privacyPolicy');
        validateURL('termsOfService');
        validateURL('supportLink');
        let oldGettersVal = getters['brandSettingTab/brandSettings']
        if(whiteLabledInformation.value.helpLink.error 
            || whiteLabledInformation.value.privacyPolicy.error 
            || whiteLabledInformation.value.termsOfService.error 
            || whiteLabledInformation.value.supportLink.error
        ) 
        {
            $toast.error("Please filled allowed value.", {position: 'top-right'});
            return;
        }
        let formData = {
            termsOfService: whiteLabledInformation.value.termsOfService.value,
            privacyPolicy: whiteLabledInformation.value.privacyPolicy.value,
            helpLink: whiteLabledInformation.value.helpLink.value,
            productName: whiteLabledInformation.value.productName.value,
            supportLink: whiteLabledInformation.value.supportLink.value,
            // productDescription: whiteLabledInformation.value.productDescription.value
        }
        if(oldGettersVal && JSON.stringify(oldGettersVal) !== JSON.stringify(formData)) {
            apiRequestWithoutCompnay("post", env.SAVE_BRAND_SETTINGS_INFORMATION, formData).then(()=>{
                commit('brandSettingTab/mutateBrandSettings', {data: formData});
                $toast.success("Billing settings saved successfully.", {position: 'top-right'});
            }).catch((value) => {
                console.error(value);
            })
        }
    } catch (error) {
        console.error(error);
    }
    // Upload Admin Logo
    if (isAdminLogoChange.value) {
        apiRequestWithoutCompnay("post", env.UPLOAD_LOGO_FILE, adminLogoData.value, "form").then((res) => {
            if (res.data.status) {
                $toast.success("Admin Logo Uploaded.", {position: 'top-right'});
            } else {
                $toast.error("Admin Logo Error. Please try again.", {position: 'top-right'});
            }
        })
    }

    // Upload Web Logo
    if (isWebLogoChange.value) {
        apiRequestWithoutCompnay("post", env.UPLOAD_LOGO_FILE, webLogoData.value, "form").then((res) => {
            if (res.data.status) {
                $toast.success("Web Logo Uploaded.", {position: 'top-right'});
            } else {
                $toast.error("Web Logo Error. Please try again.", {position: 'top-right'});
            }
        })
    }

    // Upload Desktop Logo
    if (isDesktopLogoChange.value) {
        apiRequestWithoutCompnay("post", env.UPLOAD_LOGO_FILE, desktopLogoData.value, "form").then((res) => {
            if (res.data.status) {
                $toast.success("Desktop Logo Uploaded.", {position: 'top-right'});
            } else {
                $toast.error("Desktop Logo Error. Please try again.", {position: 'top-right'});
            }
        })
    }

    // Upload Favicon Logo
    if (isFavicaonChange.value) {
        apiRequestWithoutCompnay("post", env.UPLOAD_LOGO_FILE, faviconData.value, "form").then((res) => {
            if (res.data.status) {
                $toast.success("Favicon Uploaded.", {position: 'top-right'});
            } else {
                $toast.error("Favicon Error. Please try again.", {position: 'top-right'});
            }
        })
    }
    // Upload Email Template Logo
    if (isEmaillogoChange.value) {
        apiRequestWithoutCompnay("post", env.UPLOAD_LOGO_FILE, emailTemplateData.value, "form").then((res) => {
            if (res.data.status) {
                $toast.success("Email Template Logo Uploaded.", {position: 'top-right'});
            } else {
                $toast.error("Email Template Logo Error. Please try again.", {position: 'top-right'});
            }
        })
    }
}
function logoAdminUpload(data) {
    isAdminLogoChange.value = true;
    const apiFormData = new FormData();
    const file = base64ToFile(data, "adminLogo.png");
    file.path = data;
    apiFormData.append("key", "logo");
    apiFormData.append("type", "admin");
    apiFormData.append("file", file);
    adminLogoData.value = apiFormData;
    document.getElementById("logoAdminPreview").src = data;    
}
function logoWebUpload(data) {
    isWebLogoChange.value = true;
    const file = base64ToFile(data, "webLogo.png");
    file.path = data;
    const apiFormData = new FormData();
    apiFormData.append("key", "logo");
    apiFormData.append("type", "web");
    apiFormData.append("file", file);
    webLogoData.value = apiFormData;
    document.getElementById("logoWebPreview").src = data;
}
function logoDesktopUpload(data) {
    isDesktopLogoChange.value = true;
    const file = base64ToFile(data, "desktopLogo.png");
    file.path = data;
    const apiFormData = new FormData();
    apiFormData.append("key", "logo");
    apiFormData.append("type", "desktop");
    apiFormData.append("file", file);
    desktopLogoData.value = apiFormData;
    document.getElementById("logoDesktopPreview").src = data;
}
function logoFaviconUpload(data) {
    isFavicaonChange.value = true;
    const file = base64ToFile(data, "favicon.png");
    file.path = data;
    const apiFormData = new FormData();
    apiFormData.append("key", "favicon");
    apiFormData.append("file", file);
    faviconData.value = apiFormData;
    document.getElementById("favicaonPreview").src = data;
}
function emailTemplateUpload(data) {
    isEmaillogoChange.value = true;
    const file = base64ToFile(data, "emailTemplateLogo.png");
    file.path = data;
    const apiFormData = new FormData();
    apiFormData.append("key", "logo");
    apiFormData.append("type", "emailTemplateLogo");
    apiFormData.append("file", file);
    emailTemplateData.value = apiFormData;
    document.getElementById("emailTemplatePreview").src = data;
}
function validateURL(field) {
    const url = whiteLabledInformation.value[field].value;
    if(url.length > 0) {
        const regex = /(https?|ftp):\/\/[^\s/$.?#]+\.[^\s]*/g;
        const isValid = regex.test(url);
    
        if (!isValid) {
            whiteLabledInformation.value[field].error = `The ${whiteLabledInformation.value[field].name.toLowerCase()} field must be a valid link.`;
        } else {
            whiteLabledInformation.value[field].error = '';
        }
    } else {
        whiteLabledInformation.value[field].error = '';
    }
}

onMounted(async () => {
    var oFReader = new FileReader();
    if(getters['brandSettingTab/brandSettings'] && !Object.keys((getters['brandSettingTab/brandSettings']) || {}).length){
        dispatch('brandSettingTab/setBrandSettings').then((value) => {
            const {data} = value;
            whiteLabledInformation.value.termsOfService.value = data?.termsOfService || '';
            whiteLabledInformation.value.privacyPolicy.value = data?.privacyPolicy || '';
            whiteLabledInformation.value.helpLink.value = data?.helpLink || '';
            whiteLabledInformation.value.productName.value = data?.productName || '';
            whiteLabledInformation.value.supportLink.value = data?.supportLink || '';
            // whiteLabledInformation.value.productDescription.value = data?.productDescription || '';
        }).catch((error) =>{
            console.error('ERROR in set Set Brand Settings',error)
        })
    } else {
        whiteLabledInformation.value.termsOfService.value = getters['brandSettingTab/brandSettings']?.termsOfService || '';
        whiteLabledInformation.value.privacyPolicy.value = getters['brandSettingTab/brandSettings']?.privacyPolicy || '';
        whiteLabledInformation.value.helpLink.value = getters['brandSettingTab/brandSettings']?.helpLink || '';
        whiteLabledInformation.value.productName.value = getters['brandSettingTab/brandSettings']?.productName || '';
        whiteLabledInformation.value.supportLink.value = getters['brandSettingTab/brandSettings']?.supportLink || '';
        // whiteLabledInformation.value.productDescription.value = getters['brandSettingTab/brandSettings']?.productDescription || '';
    }

    // Get Admin Logo
    try {
        const adminLogofileRes = await fetch(env.API_URI + env.GET_LOGO + "?key=logo&type=admin");
        if (adminLogofileRes.status === 404) {
            isAdminLogoShow.value = false;
            return;
        }
        const adminLogoblob = await adminLogofileRes.blob();
        oFReader.readAsDataURL(adminLogoblob);
        oFReader.onload = function (oFREvent) {
            document.getElementById("logoAdminPreview").src = oFREvent.target.result;
            isAdminLogoShow.value = true;
        };
    } catch (error) {
        console.error("Error Admin Logo Init", error);
        isAdminLogoShow.value = false;
    }

    // Get Web Logo
    try {
        const webLogofileRes = await fetch(env.API_URI + env.GET_LOGO + "?key=logo&type=web");
        if (webLogofileRes.status === 404) {
            isWebLogoShow.value = false;
            return;
        }
        const webLogoblob = await webLogofileRes.blob();
        oFReader.readAsDataURL(webLogoblob);
        oFReader.onload = function (oFREvent) {
            document.getElementById("logoWebPreview").src = oFREvent.target.result;
            isWebLogoShow.value = true;
        };
    } catch (error) {
        console.error("Error Web Logo Init", error);
        isWebLogoShow.value = false;
    }

    // Get Desktop Logo
    try {
        const desktopLogofileRes = await fetch(env.API_URI + env.GET_LOGO + "?key=logo&type=desktop");
        if (desktopLogofileRes.status === 404) {
            isDesktopLogoShow.value = false;
            return;
        }
        const desktopLogoblob = await desktopLogofileRes.blob();
        oFReader.readAsDataURL(desktopLogoblob);
        oFReader.onload = function (oFREvent) {
            document.getElementById("logoDesktopPreview").src = oFREvent.target.result;
            isDesktopLogoShow.value = true;
        };
    } catch (error) {
        console.error("Error Desktop Logo Init", error);
        isDesktopLogoShow.value = false;
    }
    
    // Get Favicon Logo
    try {
        const faviconLogofileRes = await fetch(env.API_URI + env.GET_LOGO + "?key=favicon");
        if (faviconLogofileRes.status === 404) {
            isFavicaShow.value = false;
            return;
        }
        const faviconLogoblob = await faviconLogofileRes.blob();

        oFReader.readAsDataURL(faviconLogoblob);
        oFReader.onload = function (oFREvent) {
            document.getElementById("favicaonPreview").src = oFREvent.target.result;
            isFavicaShow.value = true;
        };
    } catch (error) {
        console.error("Error Favicon Logo Init", error);
        isFavicaShow.value = false;
    }
    // Get Email Template Logo
    try {
        const emailTemplateLogofileRes = await fetch(env.API_URI + env.GET_LOGO + "?key=logo&type=emailTemplateLogo");
        if (emailTemplateLogofileRes.status === 404) {
            isEmailLogoShow.value = false;
            return;
        }
        const emailTemplateLogoblob = await emailTemplateLogofileRes.blob();
        oFReader.readAsDataURL(emailTemplateLogoblob);
        oFReader.onload = function (oFREvent) {
            document.getElementById("emailTemplatePreview").src = oFREvent.target.result;
            isEmailLogoShow.value = true;
        };
    } catch (error) {
        console.error("Error emailTemplate Logo Init", error);
        isEmailLogoShow.value = false;
    }
})

const openCropperTool = (logo, droppedImage) => {
    if(droppedImage){
        dropImage.value = droppedImage[0];
        isCropper.value = true;
    }
    
    if(logo == 'logoAdminUpload'){
        logoType.value = 'logoAdminUpload';
        stencilSize.width = 200;
        stencilSize.height = 50;
        stencilProps.aspectRatio = 5
    }
    
    if(logo == 'logoWebPreview'){
        logoType.value = 'logoWebPreview';
        stencilSize.width = 200;
        stencilSize.height = 50;
        stencilProps.aspectRatio = 5
    }
    
    if(logo == 'logoDesktopPreview'){
        logoType.value = 'logoDesktopPreview';
        stencilSize.width = 200;
        stencilSize.height = 200;
        stencilProps.aspectRatio = 1
    }
    
    if(logo == 'favicaonPreview'){
        logoType.value = 'favicaonPreview';
        stencilSize.width = 150;
        stencilSize.height = 150;
        stencilProps.aspectRatio = 1
    }
    
    if(logo == 'emailTemplatePreview'){
        logoType.value = 'emailTemplatePreview';
        stencilSize.width = 200;
        stencilSize.height = 50;
        stencilProps.aspectRatio = 5
    }

    if(logo == 'emailTemplatePreview'){
        logoType.value = 'emailTemplatePreview';
        stencilSize.width = 200;
        stencilSize.height = 50;
        stencilProps.aspectRatio = 5
    }

    setTimeout(() => {
        isCropper.value = true;
        if(droppedImage == undefined){
            document.getElementById('cropping-input').click()
        }
    })
}

const cropperFunction = (val) => {
    if (logoType.value == 'logoAdminUpload') {
        logoAdminUpload(val);
    }

    if (logoType.value == 'logoWebPreview') {
        logoWebUpload(val);
    }

    if (logoType.value == 'logoDesktopPreview') {
        logoDesktopUpload(val);
    }

    if (logoType.value == 'favicaonPreview') {
        logoFaviconUpload(val);
    }
    if (logoType.value == 'emailTemplatePreview') {
        emailTemplateUpload(val);
    }
}

function base64ToFile(base64String, fileName) {
    const [header, data] = base64String.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const byteString = atob(data);
    
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }
    return new File([byteArray], fileName, { type: mime });
}

</script>
<style scoped src="./style.css">
</style>