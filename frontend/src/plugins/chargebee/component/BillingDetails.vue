<template>
    <div id="div-with-loading-billing" :class="isPopUp ? 'billing-address-popup billing-details_popup--main  project__upgradwrapper-popup addon-popup cards-popup' : ''" :style="{'border-radius': isPopUp ? '15px' : ''}">
        <SpinnerComp :is-spinner="isSpinner" />
        <div class="mySettingSection priorityWrapper billing-main-section" :style="!isPopUp ? 'padding: 15px;' : ''"  :class="{'p-15px' : isPopUp && clientWidth <=767 , 'p-30px' : isPopUp && clientWidth > 767 , 'billing__popup-mobile' : !isPopUp && clientWidth <=767 }">
            <div class="row" v-if="isPopUp" >
                <div class="col-md-12" :style="isPopUp ? 'border-bottom: 1px solid #ececec;margin-bottom: 15px;' : ''"> 
                    <div class="d-flex justify-content-between align-items-center">
                    <sapn class="task_priority_wrapper_value payment__text font-size-22 font-weight-700 black pb-20px">{{$t('Billing.billing_details')}}</sapn>
                    <div class="pb-20px" v-if="isPopUp" @click="closeModelFunction">
                        <img :src="cancelIcon" alt="" class="cursor-pointer" />
                    </div>
                </div>
                </div>
            </div>
            
            <div id="div-with-loading-profile" class="row vs-con-loading__container" :class="{'overflow-auto bg-white h-100 address__detail-wrapper' : isPopUp == true && clientWidth <= 767}" :style="{'max-height': isPopUp == true && clientWidth <= 767  ? 'calc(100vh - 390px)' : ''}">
                <div class="col-md-12 settingProfileFormCol">
                    <div class="settingProfileFormSubmission" v-if="formData">
                        <form @submit.prevent="handleSubmit" style="display: block;">
                            <div class="row">
                                <div :class="isDirectPayment ? 'col-md-12 mb-10px' : 'col-md-6 mb-10px'">
                                    <div class="inputFieldDiv">
                                        <label class="font-size-14 black font-weight-400 d-inline-block mb-10px">{{$t('general.company_individual')}} <span class="invalid-feedback red font-size-14">*</span></label>
                                        <InputText 
                                            class="form-control login-input"
                                            v-model.trim="formData.companyName.value"
                                            :placeHolder="$t('general.enter_company_individual')"
                                            type="text"
                                            id="Company Name"
                                            tabindex="1"
                                            @keyup="checkErrors({
                                                'field': formData.companyName,
                                                'name': formData.companyName.name,
                                                'validations': formData.companyName.rules,
                                                'type': formData.companyName.type,
                                                'event': $event.event
                                            })"
                                            inputId="refCompanyName"
                                        />
                                        <div class="invalid-feedback red font-size-11">{{ formData.companyName.error }}</div>
                                    </div>
                                </div>
                                <div :class="isDirectPayment ? 'col-md-12 mb-10px' : 'col-md-6 mb-10px'">
                                    <div class="inputFieldDiv">
                                        <label class="font-size-14 black font-weight-400 d-inline-block mb-10px">{{$t('Billing.address_line')}} 1<span class="invalid-feedback red font-size-14">*</span></label>
                                        <InputText 
                                            class="form-control login-input"
                                            v-model.trim="formData.address1.value"
                                            :placeHolder="$t('PlaceHolder.Enter_Text')" 
                                            type="text"
                                            id="Address1"
                                            tabindex="2"
                                            @keyup="checkErrors({
                                                'field': formData.address1,
                                                'name': formData.address1.name,
                                                'validations': formData.address1.rules,
                                                'type': formData.address1.type,
                                                'event': $event.event
                                            })"
                                            inputId="refAddress1"
                                        />
                                        <div class="invalid-feedback red font-size-11">{{ formData.address1.error }}</div>
                                    </div>
                                </div>
                                <div :class="isDirectPayment ? 'col-md-12 mb-10px' : 'col-md-6 mb-10px'">
                                    <div class="inputFieldDiv">
                                        <label class="font-size-14 black font-weight-400 d-inline-block mb-10px">{{$t('Billing.address_line')}} 2 <span class="invalid-feedback red font-size-14">*</span></label>
                                        <InputText 
                                            class="form-control login-input"
                                            v-model.trim="formData.address2.value"
                                            :placeHolder="$t('PlaceHolder.Enter_Text')"
                                            type="text"
                                            id="Address2"
                                            tabindex="3"
                                            @keyup="checkErrors({
                                                'field': formData.address2,
                                                'name': formData.address2.name,
                                                'validations': formData.address2.rules,
                                                'type': formData.address2.type,
                                                'event': $event.event
                                            })"
                                            inputId="refAddress2"
                                        />
                                        <div class="invalid-feedback red font-size-11">{{ formData.address2.error }}</div>
                                    </div>
                                </div>
                                <div :class="isDirectPayment ? 'col-md-12 mb-10px' : 'col-md-6 mb-10px'">
                                    <div class="inputFieldDiv">
                                        <label class="font-size-14 black font-weight-400 d-inline-block mb-10px">{{$t('Settings.country')}} <span class="invalid-feedback red font-size-14">*</span></label>
                                        <InputText
                                            :readonly="true"
                                            type="text"
                                            class="form-control login-input cursor-pointer"
                                            v-model="formData.country.value"
                                            :placeHolder="$t('Settings.country')"
                                            tabindex="4"
                                            @click="setFocus('country'), visible = !subSidebar"
                                            @focus="setFocus('country')"
                                            @keyup="checkErrors({
                                                'field': formData.country,
                                                'name': formData.country.name,
                                                'validations': formData.country.rules,
                                                'type': formData.country.type,
                                                'event': $event.event
                                            })"
                                        />
                                        <div class="invalid-feedback red font-size-11">{{ formData.country.error }}</div>
                                    </div>
                                </div>
                                <div :class="isDirectPayment ? 'col-md-12 mb-10px' : 'col-md-6 mb-10px'">
                                    <div class="inputFieldDiv">
                                        <label class="font-size-14 black font-weight-400 d-inline-block mb-10px">{{$t('Settings.state')}} <span class="invalid-feedback red font-size-14">*</span></label>
                                        <InputText
                                            :readonly="true"
                                            type="text"
                                            :disabled="locationObj['state'].isStateVal"
                                            class="form-control login-input"
                                            :class="[{'cursor-pointer': locationObj['state'].isStateVal == false}]"
                                            v-model="formData.state.value"
                                            :placeHolder="locationObj['state'].isStateVal == false ? $t('Settings.state') : 'No States'"
                                            inputId="refState"
                                            tabindex="5"
                                            @click="setFocus('state')"
                                            @focus="setFocus('state')"
                                            @keyup="checkErrors({
                                                'field': formData.state,
                                                'name': formData.state.name,
                                                'validations': formData.state.rules,
                                                'type': formData.state.type,
                                                'event': $event.event
                                            })"
                                        />
                                        <div class="invalid-feedback red font-size-11">{{ formData.state.error }}</div>
                                    </div>
                                </div>
                                <div :class="isDirectPayment ? 'col-md-12 mb-10px' : 'col-md-6 mb-10px'">
                                    <div class="inputFieldDiv">
                                        <label class="font-size-14 black font-weight-400 d-inline-block mb-10px">{{$t('Settings.city')}} <span class="invalid-feedback red font-size-14">*</span></label>
                                        <InputText
                                            :readonly="true"
                                            type="text"
                                            class="form-control login-input"
                                            :class="[{'cursor-pointer' : !(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal)}]"
                                            :disabled="(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal)"
                                            v-model="formData.city.value"
                                            :placeHolder="!(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal) ? $t('Settings.city') : 'No Cities'"
                                            inputId="refCity"
                                            tabindex="6"
                                            @click="setFocus('city')"
                                            @focus="setFocus('city')"
                                            @keyup="checkErrors({
                                                'field': formData.city,
                                                'name': formData.city.name,
                                                'validations': formData.city.rules,
                                                'type': formData.city.type,
                                                'event': $event.event
                                            })"
                                        />
                                        <div class="invalid-feedback red font-size-11">{{ formData.city.error }}</div>
                                    </div>
                                </div>
                                <div :class="isDirectPayment ? 'col-md-12 mb-10px' : 'col-md-6 mb-10px'">
                                    <div class="inputFieldDiv">
                                        <label class="font-size-14 black font-weight-400 d-inline-block mb-10px">{{$t('Billing.zip')}} <span class="invalid-feedback red font-size-14">*</span></label>
                                        <InputText 
                                            class="form-control login-input"
                                            v-model.trim="formData.zipCode.value"
                                            :placeHolder="$t('PlaceHolder.Enter_zip')"
                                            type="text"
                                            id="zipcode"
                                            tabindex="7"
                                            @keyup="checkErrors({
                                                'field': formData.zipCode,
                                                'name': formData.zipCode.name,
                                                'validations': formData.zipCode.rules,
                                                'type': formData.zipCode.type,
                                                'event': $event.event
                                            })"
                                            inputId="refZipcode"
                                        />
                                        <div class="invalid-feedback red font-size-11">{{ formData.zipCode.error }}</div>
                                    </div>
                                </div>
                                <div :class="isDirectPayment ? 'col-md-12 mb-10px' : 'col-md-6 mb-10px'" v-if="formData.country.value == 'India'">
                                    <div class="inputFieldDiv">
                                        <label class="font-size-14 black font-weight-400 d-inline-block mb-10px">GST</label>

                                        <InputText 
                                            class="form-control login-input"
                                            v-model.trim="formData.GST.value"
                                            :placeHolder="$t('PlaceHolder.Enter_GST_Number')"
                                            type="text"
                                            id="gst"
                                            tabindex="8"
                                            @keyup="checkErrors({
                                                'field': formData.GST,
                                                'name': formData.GST.name,
                                                'validations': formData.GST.rules,
                                                'type': formData.GST.type,
                                                'event': $event.event
                                            })"
                                            inputId="refGST"
                                        />
                                        <div class="invalid-feedback red font-size-11">{{ formData.GST.error }}</div>
                                    </div>
                                </div>
                            </div>
                            <button v-if="!isDirectPayment" type="submit" id="blue_btn_billing" ref="billing_form" class="blue_btn mt-20px font-size-16 bg-blue cursor-pointer white border-0 border-radius-4-px billing__save" :disabled="isSpinner"  :class="{ 'w-100 d-inline-block border-radius-8-px mb-10px h-auto p-10px' : !isPopUp && clientWidth <=767 }">{{$t('Projects.save')}}</button>
                            <button v-else type="submit" id="blue_btn_billing" ref="billing_form" class="blue_btn save_and_ctn billing__save-continue mt-20px font-size-16 bg-blue cursor-pointer white border-0 border-radius-4-px mt-20px w-100 h-auto" :disabled="isSpinner">{{$t('Billing.Save_&_Continue')}}</button>
                        </form>
                    </div>
                </div>
            </div>
            <Sidebar
                :title="sidebarTitle"
                v-model:visible="subSidebar"
                :enable-search="true"
                :options="dataArray"
                @selected="getSubSidebarData"
                width="337px"
                :listenKeys="true"
            />
        </div>
    </div>
</template>

<script setup>
import { defineComponent, computed, defineProps, inject, onMounted, ref, watch } from "vue";
import { useToast } from "vue-toast-notification";
import { useStore } from "vuex";
import { Country, State, City } from 'country-state-city';
const cancelIcon = require("@/assets/images/closemodal.png");
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import InputText from "@/components/atom/InputText/InputText.vue";
import { useValidation } from "@/composable/Validation.js";
import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
import { useI18n } from "vue-i18n";
import * as env from '@/config/env';
import { apiRequest } from "../../../services";
const {getters,commit} = useStore();
const props = defineProps({
    isPopUp : Boolean,
    isDirectPayment : Boolean,
    doneBillingDetail: Function,
    closeModel: Function
});
const $toast = useToast();
const { t } = useI18n();
const isPopUp = ref(props.isPopUp);
const isDirectPayment = ref(props.isDirectPayment);
const isSpinner = ref(false);
const formData = ref({
    companyName: {
        value: "",
        rules:
            "required | min:3",
        name: "company name",
        error: ""
    },
    address1: {
        value: "",
        rules:
            "required | min:1 | max:60",
        name: "address1",
        error: ""
    },
    address2: {
        value: "",
        rules:
            "required | min:1 | max:60",
        name: "address2",
        error: ""
    },
    country: {
        value: "",
        rules:
            "required",
        name: "country",
        error: ""
    },
    state: {
        value: "",
        rules:
            "required",
        name: "state",
        error: ""
    },
    city: {
        value: "",
        rules:
            "required",
        name: "city",
        error: ""
    },
    zipCode: {
        value: "",
        rules:
            "required | max:6",
        name: "zipcode",
        error: ""
    },
    GST: {
        value: "",
        rules:
            "max:15",
        name: "GST",
        error: ""
    },
    countryCode: {
        value: ""
    },
    stateCode: {
        value: ""
    }
});
const companyId = inject("$companyId");
const clientWidth = inject("$clientWidth");
const { checkErrors, checkAllFields } = useValidation();
const submitted = ref(false);
const contriesArray = ref([]);
const statesArray =  ref([]);
const citiesArray =  ref([]);
const subSidebar =  ref(false);
const sidebarTitle =  ref("");
const fieldType =  ref("");
const text = ref("");
const dataArray =  ref([]);
const locationObj = ref({
    state:{isStateVal: false},
    city:{isCityVal: false}
})
const currentCompany = computed(() => {
    return getters['settings/companies'].find((x) => x._id == companyId.value)
})
onMounted(() => {
    if(currentCompany.value && Object.keys(currentCompany.value).length) {
        init();
    }
    contriesArray.value = Country.getAllCountries();
    statesArray.value = State.getStatesOfCountry(currentCompany.value.billingDetails?.countryCode ? currentCompany.value.billingDetails?.countryCode : 'IN');
    citiesArray.value = City.getCitiesOfState(currentCompany.value?.billingDetails?.countryCode ? currentCompany.value?.billingDetails?.countryCode : 'IN', currentCompany.value?.billingDetails?.stateCode ? currentCompany.value?.billingDetails?.stateCode : 'GJ');
})

const handleDisabled = async (key, val) => {
    const country = val.isoCode;
    const state = val.countryCode;
    const noStates = (await State.getStatesOfCountry(country)).length === 0;
    const noCities = (await City.getCitiesOfState(state, country)).length === 0;
    if (key === 'country') {
        locationObj.value['state'].isStateVal = noStates;
        formData.value.state.rules = noStates ? '' : 'required';
        formData.value.city.rules = noStates ? '' : 'required';
        formData.value.state.error = '';
        formData.value.city.error = '';
    } else if (key === 'state') {
        locationObj.value['city'].isCityVal = noCities;
        formData.value.city.rules = noCities ? '' : 'required';
        formData.value.city.error = '';
    }
};

const init = () => {
    if(currentCompany.value && currentCompany.value.billingDetails) {
        formData.value.country.value = currentCompany.value.billingDetails?.country;
        formData.value.state.value = currentCompany.value.billingDetails?.state;
        formData.value.city.value = currentCompany.value.billingDetails?.city;
        formData.value.address1.value = currentCompany.value.billingDetails?.address1;
        formData.value.address2.value = currentCompany.value.billingDetails?.address2;
        formData.value.companyName.value = currentCompany.value.billingDetails?.companyName;
        formData.value.zipCode.value = currentCompany.value.billingDetails?.zipCode;
        formData.value.GST.value = currentCompany.value.billingDetails?.GST;
        formData.value.countryCode.value = currentCompany.value.billingDetails?.countryCode;
        formData.value.stateCode.value = currentCompany.value.billingDetails?.stateCode;

        if(currentCompany.value.billingDetails.state == '') {
            formData.value.state.rules = ''
            locationObj.value['state'].isStateVal = true;
        }
        if(currentCompany.value.billingDetails.city == '') {
            formData.value.city.rules = ''
            locationObj.value['city'].isCityVal = true;
        }

        let billing = currentCompany.value.billingDetails
        text.value = `${billing.address1},${billing.address2},${billing.city},${billing.state},${billing.country} - ${billing.zipCode}`
    }
};

const doneBillingDetail = (value) => {
    props.doneBillingDetail(value);
}
function closeModelFunction() {
    props.closeModel();
}
const onCloseSidebar = (event) => {
    subSidebar.value = event;
};

const setFocus = (type) => {
    subSidebar.value = true;
    if(type == 'country'){
        dataArray.value = contriesArray.value;
        fieldType.value = (type == 'country') ? type : "";
        sidebarTitle.value = (type == 'country') ? t('PlaceHolder.Select_Country') : "";
        
    }
    if(type == 'state'){
        dataArray.value = statesArray.value;
        fieldType.value = (type == 'state') ? type : "";
        sidebarTitle.value = (type == 'state') ? t('PlaceHolder.Select_State') : "";
    }
    if(type == 'city'){
        dataArray.value = citiesArray.value;
        fieldType.value = (type == 'city') ? type : "";
        sidebarTitle.value = (type == 'city') ? t('PlaceHolder.Select_City') : "";
    }

    dataArray.value.map((x) => {
        x["label"] = x.name;
    })
}

const getSubSidebarData = (val) => {
    if (fieldType.value === "country") {
        handleDisabled('country',val)
        formData.value.country.value = val.name;
        formData.value.state.value = "";
        formData.value.city.value = "";
        formData.value.state.error = '';
        formData.value.city.error = '';
        formData.value.GST.value = "";
        formData.value.countryCode.value = val.isoCode;
        statesArray.value = State.getStatesOfCountry(val.isoCode);
        setTimeout(() => {
            if(statesArray.value.length > 0) {
                const ele = document.getElementById("refState");
                ele.focus();
                fieldType.value = "state"
            }
        }, 500);
    }

    if (fieldType.value === "state") {
        handleDisabled('state',val)
        formData.value.state.value = val.name;
        formData.value.city.value = "";
        formData.value.state.error = '';
        formData.value.stateCode.value = val.isoCode;
        citiesArray.value = City.getCitiesOfState(val.countryCode, val.isoCode);
        setTimeout(() => {
            if(citiesArray.value.length > 0) {
                const refcity = document.getElementById("refCity");
                refcity.focus();
                fieldType.value = "city"
            }
        }, 500);
    }

    if (fieldType.value === "city") {
        formData.value.city.value = val.name;
        formData.value.state.error = ''
        formData.value.city.error = ''
    }
    onCloseSidebar();
}

const handleSubmit = () => {
    submitted.value = true;
    if (formData.value.country.value !== 'India') {
        formData.value.GST.rules = ''
    }
    checkAllFields(formData.value).then(async (valid) => {
        if(valid) {
            isSpinner.value = true;
                const updateObj = {
                    billingDetails: {
                        country:  formData.value.country.value,
                        state:  formData.value.state.value,
                        city: formData.value.city.value,
                        address1:  formData.value.address1.value,
                        address2:  formData.value.address2.value,
                        companyName:  formData.value.companyName.value,
                        zipCode:  formData.value.zipCode.value,
                        GST: formData.value.GST.value,
                        countryCode: formData.value.countryCode.value,
                        stateCode: formData.value.stateCode.value,
                    },
                }
                apiRequest("put",`${env.COMPANYACTIONS}`,{updateObject: updateObj}).then(()=>{
                    apiRequest("post",`${env.UPDATE_CUSTOMER_BILLING}`,{billingDetails: updateObj}).then((ubData)=>{
                        if (ubData.status === 200) {
                            isSpinner.value = false;
                            commit('settings/mutateCompanies',{op:"modified",data: {...currentCompany.value,billingDetails: updateObj.billingDetails}});
                            if(isDirectPayment.value) {
                                doneBillingDetail(true)
                            } else {
                                text.value = `${formData.value.address1.value},${formData.value.address2.value},${formData.value.city.value},${formData.value.state.value},${formData.value.country.value} - ${formData.value.zipCode.value}`
                                $toast.success(t('Toast.Billing_details_has_been_updated_successfully'),{position: 'top-right'});
                                doneBillingDetail(text.value)
                            }
                        } else {
                            $toast.error(t('Toast.Billing_details_not_updated'),{position: 'top-right'});
                            isSpinner.value = false;
                            if(isDirectPayment.value) {
                                doneBillingDetail(false)
                            }
                        }
                    }).catch(() => {
                        $toast.error(t('Toast.Billing_details_not_updated'),{position: 'top-right'});
                        isSpinner.value = false;
                        if(isDirectPayment.value) {
                            doneBillingDetail(false)
                        }
                    })  
                }).catch((error)=>{
                    console.error(error);
                    $toast.error(t('Toast.Billing_details_not_updated'),{position: 'top-right'});
                    isSpinner.value = false;
                    if(isDirectPayment.value) {
                        doneBillingDetail(false)
                    }
                })
        } else {
            if(isDirectPayment.value) {
                doneBillingDetail(false)
            }
        }
    })
}
watch(currentCompany, (newV) => {
    if(Object.keys(newV).length) {
        init()
    }
})
defineComponent({
    name: "BillingDetailsComponent"
})
</script>

<style scoped>
    .billing-address-popup {
        background: #FFFFFF;
       max-width: 607px;
       width: 100%;
    }
    .billing-address-popup .settingProfileFormSubmission form .row {
        flex-wrap: wrap;
    }
    .billing-address-popup .inputFieldDiv input{
        margin-left: 0px;
    }
    .save_and_ctn{
        color: white;
        margin-top: 5px;
    }
    .blue_btn {
        height: 30px;
    }
    .billing__save{
        float: right;
        clear: both;
    }
    .billing__save-continue{
        padding: 10px 14px;
        height: auto;
        margin: 10px auto 0;
    }
    .billing-details_popup--main .settingProfileFormSubmission .row .col-md-12, .billing-details_popup--main .settingProfileFormSubmission .row .col-md-6 {
    width: 50%;
    padding: 0px 15px;
}

.billing-details_popup--main .settingProfileFormSubmission .row {
    margin: 0px -15px;
    display: flex;
}

.billing-details_popup--main .settingProfileFormSubmission .row .col-md-12:first-child {
    width: 100%;
    padding: 0px 15px;
}
.billing-details_popup--main .settingProfileFormSubmission .row .inputFieldDiv {
    margin-bottom: 0px;
    padding-bottom: 0px;
}
.billing-details_popup--main .settingProfileFormSubmission .row .inputFieldDiv .form-control{
max-width: 100%;
}
.billing-details_popup--main .settingProfileFormSubmission form{
    width: 100%;
}
.billing-main-section .vs-con-loading__container {
    display: block;
}
.billing-main-section .col-md-6 {
    width: 100%;
    padding: 0px;
    max-width: 100%;
}
.billing-main-section .inputFieldDiv input {
    width: 100%;
}
.billing-main-section .inputFieldDiv {
    padding: 0px;
}
.billing-main-section {
    box-shadow: none;
}
.billing-main-section .inputFieldDiv label {
    margin-bottom: 10px;
}

@media(max-width:767px){
    .billing-address-popup .inputFieldDiv input{padding: 16px 10px !important;}
    .address__detail-wrapper::-webkit-scrollbar{display: none;}
    .billing__popup-mobile {overflow: auto;max-height: calc(100vh - 46px);}
    .billing__popup-mobile::-webkit-scrollbar{display: none;}
    .billing__popup-mobile .form-control{padding: 10px !important}
    .billing__save{ float: none;height: auto;}}
</style>