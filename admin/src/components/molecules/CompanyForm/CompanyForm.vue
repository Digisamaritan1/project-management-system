<template>
    <div class="create_company_wrapper">
        <form class="create_company_form">
            <div class="position-re create_company_row">
                <label class="font-size-14 font-weight-500 shade-black">
                    Company/Individual Name<span class="redmark">*</span>
                </label>
                <div>
                    <InputText 
                    :modelValue="companyObj.companyName.value"
                    @update:modelValue="(val)=>{ companyObj.companyName.value = val.trim() }" 
                    placeHolder="Enter Company Name" width="367px" 
                    @keyup="checkErrors({'field':companyObj.companyName,
                    'name':companyObj.companyName.name,
                    'validations':companyObj.companyName.rules,
                    'event':$event.event})" />
                    <div class="red error" >{{companyObj.companyName.error }}</div>
                </div>
            </div>

            <div class="position-re create_company_row" v-if="isAdd === true">
                <label class="font-size-14 font-weight-500 shade-black">
                   Owner Email<span class="redmark">*</span>
                </label>
                <div>
                    <InputText 
                    :modelValue="companyObj?.ownerEmail?.value"
                    :max-length="254"
                    @update:modelValue="(val)=>{ companyObj.ownerEmail.value = val.trim() }" 
                    placeHolder="Enter Owner Email" width="367px" 
                    @keyup="checkErrors({'field':companyObj?.ownerEmail,
                    'name':companyObj?.ownerEmail?.name,
                    'validations':companyObj?.ownerEmail?.rules,
                    'event':$event.event})" />
                    <div class="red error" >{{companyObj.ownerEmail?.error }}</div>
                </div>
            </div>

            <div class="position-re create_company_row">
                <label class="font-size-14 font-weight-500 shade-black">
                    Country<span class="redmark">*</span>
                </label>
                <div>
                    <InputText i
                    nputId="country_input" 
                    :modelValue="companyObj.companyCountry.value" 
                    :isReadonly="true"
                    @click="countryVisible = true,locationKey='country',HandleSidebar(locationKey)" @update:modelValue="(val)=>{ companyObj.companyCountry.value = val }" 
                    @focus="countryVisible = true,locationKey='country',HandleSidebar(locationKey)"
                    placeHolder="Select Country" 
                    width="367px"/>                                    
                    <div class="red error" >{{ !companyObj.companyCountry.value ? companyObj.companyCountry.error:'' }}</div>
                </div>
            </div>

            <div class="position-re create_company_row">
                <label class="font-size-14 font-weight-500 shade-black">
                    State<span class="redmark">*</span>
                </label>
                <div>
                    <InputText inputId="refState1" :disabled="locationObj['state']?.isStateVal" :modelValue="companyObj.companyState.value" :isReadonly="true" @update:modelValue="(val)=>{ companyObj.companyState.value = val}"  @focus="countryVisible = true,locationKey='state',HandleSidebar(locationKey)" @click="countryVisible = true,locationKey='state',HandleSidebar(locationKey)" :placeHolder="locationObj['state']?.isStateVal == false ? 'Select State' : 'No States'" width="367px"/>
                    <div class="red error" >{{ !companyObj.companyState.value ? companyObj.companyState.error  : ''}}</div>
                </div>
            </div>

            <div class="position-re create_company_row">
                <label class="font-size-14 font-weight-5000 shade-black">
                    City<span class="redmark">*</span>
                </label>
                <div>
                    <InputText 
                    inputId="refCity1"
                    :disabled="(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal)" 
                    :modelValue="companyObj.companyCity.value"  @update:modelValue="(val)=>{ companyObj.companyCity.value = val }" 
                    :placeHolder="!(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal) ? 'Select City' : 'No Cities'" 
                    width="367px" 
                    @keyup="checkErrors({'field':companyObj?.companyCity,
                    'name':companyObj?.companyCity?.name,
                    'validations':companyObj?.companyCity?.rules,
                    'event':$event.event})"
                    />
                    <div class="red error" >{{ !companyObj.companyCity.value ? companyObj.companyCity.error : '' }}</div>
                </div>
            </div>

            <div class="position-re create_company_row">
                <label class="font-size-14 font-weight-500 shade-black">
                    Phone<span class="redmark">*</span>
                </label>
                <div class="teaminput-sidebar">
                    <div class="d-flex">
                        <PhoneCountry 
                            @onSelect="(val)=> {onSelect(val),phoneValidation(String(companyObj.companyPhone.value))}" :preferredCountries="[companyObj?.compnayDialCode?.value?.isoCode || 'IN', 'US']" 
                            :enabledCountryCode="true" 
                            :enabledFlags="true"  
                            class="border-topbottom-left-6-px"
                            :phoneObj="phoneObj"
                        /> 
                        <img class="arrow" :src="arrow">
                        <InputText 
                                :modelValue="String(companyObj.companyPhone.value)" 
                                @keypress="(val)=> isNumber(val.event)" 
                                class="border-leftright-6-px border-left" 
                                @update:modelValue="(val)=>{ companyObj.companyPhone.value = String(val) }" 
                                placeHolder="eg. 000-000-0000" width="251px"
                                @keyup="checkErrors({'field':companyObj.companyPhone,
                                'name':companyObj.companyPhone.name,
                                'validations':companyObj.companyPhone.rules,
                                'type':'string',
                                'event':$event.event}),phoneValidation(String(companyObj.companyPhone.value))"
                        />  
                    </div>
                    <div class="red error" >{{ companyObj.companyPhone.error }}</div>
                    <div v-if="!companyObj.companyPhone.error" class="invalid-feedback red" >{{ phoneError }}</div>
                </div>
            </div>
        </form>
        <Sidebar v-if="countryVisible" 
            :title="locationObj[locationKey].title" 
            :enable-search="true" 
            @selected="(val)=> HandleValues(locationKey,val)" 
            @update:visible="(val)=> countryVisible = val"  
            :closeOnBackDrop="false" 
            :options="locationObj[locationKey].options.map((x)=>{ return {label:x.name , value:{...x}}})"
            /> 
            <Modal v-model="isCompanyProcess" :header="false" :footer="false" >
                <template #body>
                    <div>
                        <div class="pr-2 pl-2 pt-5 pb-5 text-center">
                            {{stepCompanyProcessMessage}}
                            <div class="mt-3">
                                <div class="custom-loader">
                                    <div class="loaderBar bg-blue"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
        </Modal>
    </div>
</template>
<script setup>
    import InputText from '@/components/atom/InputText/InputText';
    import PhoneCountry from "@/components/molecules/CountryPhoneNumberDropdown/PhoneCountry.vue"
    import Sidebar from '@/components/molecules/Sidebar/Sidebar';
    import { paymentHelper } from '@/utils/paymentHelper/helper';
    const {customerUpdate} = paymentHelper();
    import { useValidation } from "@/composable/Validation.js";
    import { computed, onMounted, ref } from 'vue';
    import { Country, State, City } from 'country-state-city';
    import axios from 'axios';
    import { useCustomComposable } from '@/composable';
    import * as env from '@/config/env';
    import { useToast } from 'vue-toast-notification';
    import { apiRequest, apiRequestWithoutCompnay } from '../../../services';
    import Modal from "@/components/atom/Modal/Modal.vue";
    import phone from "phone";
    const $toast = useToast();
    const { checkErrors, checkAllFields } = useValidation();
    const {makeUniqueId} = useCustomComposable();

    const emit = defineEmits([
        'update:modelValue','closeSidebar','onSpinner'
    ]);

    const props = defineProps({
        modelValue:{
            type: Object,
            default: () => {}
        },
        isAdd: {
            type: Boolean,
            default: false
        }
    })

    const companyData = computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emit('update:modelValue', value)
        }
    });

    const companyObj = ref({
        companyName:{
            value: companyData.value.companyName,
            rules:
            `required | min:3`,
            name: "company name",
            error: ""
        },
        companyPhone:{
            value:companyData.value.companyPhone,
            rules:
            "required | regex:^[0-9]+$",
            name: "phone",
            error:""
        },
        companyCountry:{
            value:companyData.value.companyCountry,
            rules:
            "required",
            name: "country",
            error:""
        },
        companyState:{
            value:companyData.value.companyState,
            rules:
            "required",
            name: "state",
            error:""
        },
        companyCity:{
            value:companyData.value.companyCity,
            rules:
            "required",
            name: "city",
            error:""
        },
        compnayDialCode:{
            value: companyData.value.compnayDialCode
        },
        companyStateCode:{
            value: companyData.value.Cst_stateCode
        },
        companyCountryCode:{
            value: companyData.value.Cst_countryCode
        }
    });

    const locationObj = ref({
        country:{options: Country.getAllCountries(),title:'Select Country',key:'country',countryCode:'IN'},
        state:{options:State.getStatesOfCountry('IN'),title:'Select State',key:'State',countryCode:'IN',stateCode:'GJ',isStateVal: false},
        city:{options:City.getCitiesOfState('IN', 'GJ'),title:'Select City',key:'State',isCityVal: false}
    })
    const countryCode = ref("");
    const stateCode = ref("");
    const phoneError = ref("");
    const arrow = require("@/assets/images/svg/drop_down_arrow.svg")
    const countryVisible = ref(false);
    const isSpinner = ref(false);
    const isCompanyProcess = ref(false);
    const stepCompanyProcessMessage = ref("");
    const phoneObj = ref({});

    onMounted(() => {
        companyObj.value.compnayDialCode.value = companyData.value.compnayDialCode
        if(props.isAdd === true){
                let ownerEmail = {
                    value:"",
                    rules:
                    "required | regex: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$",
                    name: "owner email",
                    error:""
                }
            companyObj.value = {...companyObj.value,ownerEmail}
        }
    })

    const handleDisabled = async (key, val) => {
        const country = val.value.isoCode;
        const state = val.value.countryCode;
        const noStates = (await State.getStatesOfCountry(country)).length === 0;
        const noCities = (await City.getCitiesOfState(state, country)).length === 0;

        if (key === 'country') {
            locationObj.value['state'].isStateVal = noStates;
            companyObj.value.companyCity.rules = noStates ? '' : 'required';
            companyObj.value.companyState.rules = noStates ? '' : 'required';
            companyObj.value.companyState.error = '';
            companyObj.value.companyCity.error = '';
        } else if (key === 'state') {
            locationObj.value['city'].isCityVal = noCities;
            companyObj.value.companyCity.rules = noCities ? '' : 'required';
            companyObj.value.companyCity.error = '';
        }
    };

const HandleSidebar = (key) =>{
    switch (key) {
        case 'state':
            locationObj.value[key].options = State.getStatesOfCountry(locationObj.value['country']['countryCode'])            
            break;
        case 'city':
            locationObj.value[key].options = City.getCitiesOfState(locationObj.value['country']['countryCode'],locationObj.value['state']['stateCode'])            
            break;
        default:
            break;
    }
}
const HandleValues = (key,val) => {
    switch (key) {
        case 'country':
            handleDisabled('country',val)
            HandleSidebar('state')
            locationObj.value[key]['countryCode'] = val.value['isoCode']
            countryCode.value = val.value.isoCode;
            companyObj.value.companyCountry.value = val.label;
            companyObj.value.companyCountryCode.value = val.value.isoCode;
            companyObj.value.companyState.value = ""
            phoneObj.value = {
                name : val.value.name,
                isoCode: val.value.isoCode,
                dialCode: val.value.phonecode
            }
            phoneValidation(String(companyObj.value.companyPhone.value))
            setTimeout(() => { 
                const ele = document.getElementById("refState1");
                ele.focus();
            }, 100);
            break;
        case 'state':
            handleDisabled('state',val)
            locationObj.value[key]['countryCode'] = val.value['countryCode'];
            locationObj.value[key]['stateCode'] = val.value['isoCode'];
            companyObj.value.companyState.value = val.label;
            companyObj.value.companyStateCode.value = val.value.isoCode;
            stateCode.value = val.value.isoCode;
            setTimeout(() => { 
                const ele = document.getElementById("refCity1");
                ele.focus();
            }, 100);
            break;
        case 'city':
            companyObj.value.companyCity.value = val.label
            break; 
    }
}
const isNumber = (evt) => {
    const char = String.fromCharCode(evt.keyCode)
    if (!/[0-9]/.test(char)) {
        evt.preventDefault()
    }
}

const saveCompanyData = () => {
    checkAllFields(companyObj.value).then((valid)=>{
        if(valid && phoneError.value === '') {
            emit('onSpinner',true);
            let userEmail = props.isAdd === true ? companyObj.value.ownerEmail.value : '';
            if(props.isAdd === false){
                const obj = {
                    Cst_CompanyName: companyObj.value.companyName.value,
                    Cst_Phone: companyObj.value.companyPhone.value,
                    Cst_Country: companyObj.value.companyCountry.value,
                    Cst_State: companyObj.value.companyState.value,
                    Cst_City: companyObj.value.companyCity.value,
                    Cst_DialCode: companyObj.value.compnayDialCode.value,
                    Cst_stateCode: companyObj.value.companyStateCode.value,
                    Cst_countryCode: companyObj.value.companyCountryCode.value
                }

                const axiosObj = {
                    updateObject: obj,
                    companyId: companyData.value.companyId
                }
                apiRequest("put",`${env.COMPANYACTION}`,axiosObj)
                .then(async (response)=>{
                    if(response.status === 200){
                        $toast.success("Company Edit Successfully",{position: 'top-right'});
                        customerUpdate("companyName", companyData.value.companyId);
                        emit('updatedData',response.data);
                    }else{
                        $toast.error("Something went wrong",{position: 'top-right'});
                    }
                    emit('closeSidebar', false)
                    emit('onSpinner',false);
                }).catch((error)=>{
                    $toast.error("Something went wrong",{position: 'top-right'});
                    console.error(error);
                    emit('closeSidebar', false)
                    emit('onSpinner',false);
                })
            }else {
                let data = {
                    type: 'users',
                    data:[ {
                        Employee_Email:  companyObj.value.ownerEmail.value
                    }]
                }
                const axiosData = {
                    dataObj: data.data,
                    collection: data.type,
                    methodName: 'findOne',
                    dbName: 'global',
                };
                axios.post(env.API_URI + env.MONGO_OPRATION, axiosData).then(async (result)=>{
                    const evId = `ev_${makeUniqueId(12)}`;
                    const source = new EventSource(`${env.API_URI}/company-create/events/${evId}`);

                    source.onmessage = function(event) {
                        // Parse the event data (the progress update)
                        if (!isCompanyProcess.value) {
                            isCompanyProcess.value = true;
                        }
                        const data = JSON.parse(event.data)?.data;

                        if (data?.step === 1) {
                            stepCompanyProcessMessage.value = "Creating Company"
                        } else if (data?.step === 2) {
                            stepCompanyProcessMessage.value = "Your company was created. We have set up the initial steps. Please wait a moment.";
                        } else {
                            source.close(); // Close the connection when the progress reaches 100%
                            if (data?.error) {
                                stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                                setTimeout(() => {
                                    emit('onSpinner',false);
                                    isCompanyProcess.value = false;
                                }, 1500)
                                return;
                            }
                            stepCompanyProcessMessage.value = "Good To Go.";
                            setTimeout(() => {
                                isCompanyProcess.value = false;
                                if (result.data?.statusText !== null) {
                                    window.location.reload();
                                }
                            }, 1500);
                        }
                    };
                    source.onerror = function(error) {
                        console.log('EventSource failed1:', error);
                        setTimeout(() => {
                            isCompanyProcess.value = false;
                        }, 2000);
                        source.close(); // Close the connection in case of error
                    };

                    let subscriptionData = {
                        storage : 0,
                        trackers: 0,
                        users :5
                    }
                    let totalData = {
                        storage: 0,
                        trackers: 0,
                        users:1
                    }
                    const formData = {
                        email: companyObj.value.ownerEmail.value,
                        companyName : companyObj.value.companyName.value,
                        phoneNumber : companyObj.value.companyPhone.value,
                        country : companyObj.value.companyCountry.value,
                        city : companyObj.value.companyCity.value,
                        state : companyObj.value.companyState.value,
                        countryCodeObj : companyObj.value.compnayDialCode.value,
                        logtimeDays : 8,
                        totalProjects : 0,
                        isInactive : false,
                        isFree : true ,
                        subscriptionData : subscriptionData,
                        totalData : totalData,
                        eventId : evId,
                        Cst_countryCode: countryCode.value,
                        Cst_stateCode: stateCode.value
                    }
                    if (result.data?.statusText !== null) {
                        formData.userId = result.data?.statusText._id
                    }
                    try {
                        isSpinner.value = true;
                        apiRequestWithoutCompnay("post", env.CREATE_COMPANY, {bodyData:formData,isUserExist : result.data?.statusText !== null ? true : false}).then((res)=>{
                            if(res.data.status === true){
                                emit('onSpinner',false);
                                $toast.success("Company has been created Successfully.",{position: 'top-right'});

                                // If user not exits in database then send invitation
                                if (result.data?.statusText === null) {
                                    apiRequestWithoutCompnay("post", env.ADMIN_CHECKSENDINVITATION, {
                                        companyId: res.data.companyId,
                                        email: companyObj.value.ownerEmail.value,
                                    }).then((resp) => {
                                        if(resp.data.status == true) {
                                            if (resp.data.furtherProceed) {
                                                axios.post(`${env.API_URI}${env.SEND_INVITATION_EMAIL}`, {
                                                    companyId: res.data.companyId,
                                                    companyName: companyObj.value.companyName.value,
                                                    email: userEmail,
                                                    designation: 0,
                                                    role: 1
                                                }).then(() => {
                                                    window.location.reload();
                                                })
                                            } else {
                                                isSpinner.value = false;
                                                $toast.warning(resp.data.statusText,{position: 'top-right'});
                                            }
                                        } else {
                                            isSpinner.value = false;
                                            $toast.error("Something went wrong. Please try again.",{position: 'top-right'});
                                            console.error('error',resp.data.statusText);
                                        }
                                    }).catch((error) => {
                                        emit('closeSidebar', false)
                                        isSpinner.value = false;
                                        $toast.error("Something went wrong. Please try again.",{position: 'top-right'});
                                        console.error(error);
                                    })
                                }
                                emit('closeSidebar', false)
                            }else{
                                emit('onSpinner',false);
                                source.close(); // Close the connection when the progress reaches 100%
                                stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                                setTimeout(() => {
                                    isCompanyProcess.value = false;
                                }, 1500)
                                $toast.error("Something went wrong",{position: 'top-right'})
                            }
                            isSpinner.value = false
                            cleanUp()
                        }).catch((error) => {
                            emit('onSpinner',false);
                            emit('closeSidebar', false)
                            console.error(`Company Create Error: ${JSON.stringify(error)}`);
                            $toast.error(error,{position: 'top-right'})    
                            source.close(); // Close the connection when the progress reaches 100%
                            stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                            setTimeout(() => {
                                isCompanyProcess.value = false;
                            }, 1500)    
                        })
                    } catch (error) {
                        emit('onSpinner',false);
                        emit('closeSidebar', false)
                        console.error(`Company Create Error: ${JSON.stringify(error)}`);
                        $toast.error(error,{position: 'top-right'})    
                        source.close(); // Close the connection when the progress reaches 100%
                        stepCompanyProcessMessage.value = "Something went wrong. Please contact to admin";
                        setTimeout(() => {
                            isCompanyProcess.value = false;
                        }, 1500)
                    }
                }).catch((err) => {
                    emit('onSpinner',false);
                    console.error(err,"ERR");
                })
            }
        }
    })
}

const cleanUp = () =>{
    for(let key in companyObj.value) {
        companyObj.value[key].error = ''
        companyObj.value[key].value = ''
    }
    companyObj.value.companyCity.rules = 'required';
    companyObj.value.companyState.rules = 'required';
    locationObj.value['state'].isStateVal = false;
    locationObj.value['city'].isCityVal = false;
}

function onSelect(val) {
    if(val && val.isoCode){
        companyObj.value.compnayDialCode.value = val;
        companyObj.value.companyCountryCode.value = val.isoCode;
    }
}

function phoneValidation (number) {
    if(number === ""){
        return;
    }
    let code = companyObj.value.companyCountryCode.value;
    const result = phone(number, { country: code, validateMobilePrefix: false });

    if (result.isValid) {
        phoneError.value = '';
    } else {
        phoneError.value = "Please enter valid number";
    }

    return result.isValid;
}

defineExpose({ saveCompanyData });

</script>
<style scoped src="./style.css"></style>