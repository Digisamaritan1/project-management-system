<template>
    <Sidebar v-if="props.visible" width="607px" class="sidebar__top47">
        <template #head>
            <div class="sidebarHeader d-flex justify-content-between">
                <h3 class="primaryColor">{{$t('Projects.create_compnay')}}</h3>
            </div>
        </template>
        <template #body>
            <form class="createCompanyform create_company_wrapper">
                <div class="col-md-2 company_img">
                    <div v-show="!Company_profileImage" class="image-input create-workspace-sidebar-image" @click="openCropperTool()">
                        <span class="placeholder" > {{$t('Templates.upload_image')}} </span>
                        <img :src="upload" class="upload_image" :height="12" :width="13">
                    </div>
                    <img v-show="Company_profileImage" @click="openCropperTool()" :src="Company_profileImage" class="create-workspace-sidebar-image">
                </div>
                <div class="form-group d-flex align-items-center frominput-wapeer position-re">
                    <label class="font-size-14 font-weight-500">
                        {{$t('general.company_individual')}}<span class="redmark">*</span>
                    </label>
                    <div class="teaminput-sidebar">
                        <InputText :modelValue="createCompanyObj.Cst_CompanyName.value" @update:modelValue="(val)=>{ createCompanyObj.Cst_CompanyName.value = val.trim() }" :placeHolder="$t('general.enter_company_individual')" width="367px" 
                        @keyup="checkErrors({'field':createCompanyObj.Cst_CompanyName,
                        'name':createCompanyObj.Cst_CompanyName.name,
                        'validations':createCompanyObj.Cst_CompanyName.rules,
                        'event':$event.event})" />
                        <div class="red error" >{{ createCompanyObj.Cst_CompanyName.error }}</div>
                    </div>
                </div>

                <div class="form-group d-flex align-items-center frominput-wapeer position-re">
                    <label class="font-size-14 font-weight-500">
                        {{$t('Settings.country')}}<span class="redmark">*</span>
                    </label>
                    <div class="teaminput-sidebar">
                            <InputText inputId="country_input" :modelValue="createCompanyObj.Cst_Country.value" :isReadonly="true" @click="countryVisible = true,locationKey='country',HandleSidebar(locationKey)" @focus="countryVisible = true,locationKey='country',HandleSidebar(locationKey)" @update:modelValue="(val)=>{ createCompanyObj.Cst_Country.value = val }" :placeHolder="$t('PlaceHolder.Select_Country')" width="367px"/>
                            <div class="red error" >{{ !createCompanyObj.Cst_Country.value ? createCompanyObj.Cst_Country.error:'' }}</div>
                    </div>
                </div>

                <div class="form-group d-flex align-items-center frominput-wapeer position-re">
                    <label class="font-size-14 font-weight-500">
                        {{$t('Settings.state')}}<span class="redmark">*</span>
                    </label>
                    <div class="teaminput-sidebar">
                        <InputText inputId="refState1" :disabled="locationObj['state']?.isStateVal" :modelValue="createCompanyObj.Cst_State.value" :isReadonly="true" @update:modelValue="(val)=>{ createCompanyObj.Cst_State.value = val}" @focus="countryVisible = true,locationKey='state',HandleSidebar(locationKey)" @click="countryVisible = true,locationKey='state',HandleSidebar(locationKey)" :placeHolder="locationObj['state']?.isStateVal == false ? $t('PlaceHolder.Select_State') : $t('PlaceHolder.No_States')" width="367px"/>
                        <div class="red error" >{{ !createCompanyObj.Cst_State.value ? createCompanyObj.Cst_State.error  : ''}}</div>
                    </div>
                </div>

                <div class="form-group d-flex align-items-center frominput-wapeer position-re">
                    <label class="font-size-14 font-weight-500">
                        {{$t('Settings.city')}}<span class="redmark">*</span>
                    </label>
                    <div class="teaminput-sidebar">
                        <InputText 
                            inputId="refCity1" 
                            :disabled="(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal)" 
                            :modelValue="createCompanyObj.Cst_City.value" 
                            @update:modelValue="(val)=>{ createCompanyObj.Cst_City.value = val }" 
                            :placeHolder="!(locationObj['state']?.isStateVal || locationObj['city']?.isCityVal) ? $t('PlaceHolder.Select_City') : $t('PlaceHolder.No_Cities')" 
                            width="367px"
                            @keyup="checkErrors({'field':createCompanyObj.Cst_City,
                            'name':createCompanyObj.Cst_City.name,
                            'validations':createCompanyObj.Cst_City.rules,
                            'event':$event.event})"
                        />
                        <div class="red error" >{{ !createCompanyObj.Cst_City.value ? createCompanyObj.Cst_City.error : '' }}</div>
                    </div>
                </div>

                <div class="form-group d-flex align-items-center frominput-wapeer position-re">
                    <label class="font-size-14 font-weight-500">
                        {{$t('Settings.phone')}}<span class="redmark">*</span>
                    </label>
                    <div class="teaminput-sidebar">
                        <div class="d-flex">
                            <PhoneCountry 
                                @onSelect="(val)=> {createCompanyObj.Cst_DialCode.value = val,phoneValidation(String(createCompanyObj.Cst_Phone.value))} " 
                                :preferredCountries="['IN', 'US']" 
                                :enabledCountryCode="true" 
                                :enabledFlags="true"
                                :phoneObj="phoneObj"
                                class="border-topbottom-left-6-px"
                            /> 
                            <img class="arrow" :src="arrow">
                            <InputText :modelValue="String(createCompanyObj.Cst_Phone.value)" @keypress="(val)=> isNumber(val.event)" class="border-leftright-6-px border-left"  @update:modelValue="(val)=>{ createCompanyObj.Cst_Phone.value = String(val) }" placeHolder="eg. 000-000-0000" width="272px"
                                @keyup="checkErrors({'field':createCompanyObj.Cst_Phone,
                                'name':createCompanyObj.Cst_Phone.name,
                                'validations':createCompanyObj.Cst_Phone.rules,
                                'type':'string',
                                'event':$event.event}),
                                phoneValidation(String(createCompanyObj.Cst_Phone.value))"/>  
                        </div>
                        <div class="red error" >{{ createCompanyObj.Cst_Phone.error }}</div>
                        <div v-if="!createCompanyObj.Cst_Phone.error" class="red error" >{{ error }}</div>
                    </div>
                </div>

                <div class="form-group d-flex align-items-center frominput-wapeer position-re" v-if="env.AFFILITAION_ON == 'true'">
                    <label class="font-size-14 font-weight-500">
                        {{$t('Affiliate.refferal_code_label')}}:
                    </label>
                    <div class="teaminput-sidebar">
                        <InputText :modelValue="createCompanyObj.refferalCode.value" @update:modelValue="(val)=>{ createCompanyObj.refferalCode.value = val.trim() }" :placeHolder="$t('Affiliate.refferal_code_placeholder')" width="367px" 
                        @keyup="checkErrors({'field':createCompanyObj.refferalCode,
                        'name':createCompanyObj.refferalCode.name,
                        'validations':createCompanyObj.refferalCode.rules,
                        'event':$event.event});referalCodeInput();" />
                        <div class="red error" >{{ createCompanyObj.refferalCode.error }}</div>
                    </div>
                </div>

                <div class="btn_block d-flex">
                    <button class="white_btn font-roboto-sans d-flex align-items-center company__btn-cancel" type="button" @click="$emit('visibleClick', false),cleanUp()">{{$t('Projects.cancel')}}</button>
                    <button ref="refButton1" class="blue_btn font-roboto-sans d-flex align-items-center company__btn-save" type="button" @click="HandleSubmit">{{$t('Projects.save')}}</button>
                </div>
            </form>
        </template> 
    </Sidebar>
    <Sidebar v-if="countryVisible" 
        :title="locationObj[locationKey].title" 
        :enable-search="true" 
        @selected="(val)=> HandleValues(locationKey,val)" 
        @update:visible="(val)=> countryVisible = val"  
        :closeOnBackDrop="false"
        :listenKeys="true"
        :value="currentSidebarValue"
        :options="locationObj[locationKey].options.map((x)=>{ return {...x, label: x.name, value: x.name}})"
    />
    <CroppingTool
        :image="{url:Company_profileImage,name:previewImage.name}"
        @updateVisible="(val) => isCropperVisible = val"
        @getEditedImage="(val)=>{Company_profileImage = val.url,file=val.fileName,base64Image=val.base64Image}"
        title="Create Company"
    />
</template>
<script setup>
    import { useCustomComposable } from "@/composable";
    import { defineProps, ref, computed, inject, onMounted } from "vue";
    import { useStore } from "vuex";
    import { Country, State, City } from 'country-state-city';
    import Swal from 'sweetalert2';
    import {useToast} from 'vue-toast-notification';
    import { useI18n } from "vue-i18n";
    import * as env from '@/config/env';
    import { useValidation } from "@/composable/Validation.js";
    import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
    import PhoneCountry from "@/components/molecules/CountryPhoneNumberDropdown/PhoneCountry.vue";
    import InputText from "@/components/atom/InputText/InputText.vue";
    import CroppingTool from '@/components/atom/CroppingTool/CroppingTool.vue';
    import { apiRequestWithoutCompnay } from '../../../services';
    import { useGetterFunctions } from "@/composable/index.js";
    import { phone } from 'phone';
    import Cookies from 'js-cookie';
    const {makeUniqueId,debounce} = useCustomComposable();
    const {getUser} = useGetterFunctions();
    const { t } = useI18n();
    const emit = defineEmits(["visibleClick", "isSpinnerEvent", "companyProcess", "processMessage"]);
    const upload = require("@/assets/images/svg/crop-cloud.svg");
    const arrow = require("@/assets/images/svg/drop_down_arrow.svg");
    const userId = inject("$userId");
    const  { checkErrors,checkAllFields  } = useValidation();
    const $toast = useToast();
    const props = defineProps({
        visible: {
            type: Boolean,
            default: false
        }
    });
    const visible = ref(props.visible);
    const Company_profileImage = ref('');
    const isCropperVisible = ref(false);
    const countryVisible = ref(false);
    const locationKey = ref('country');
    const currentSidebarValue = ref([]);
    const isCompanyProcess = ref(false);
    const stepCompanyProcessMessage = ref("");
    const base64Image = ref('');
    const file = ref();
    const isSpinner = ref(false);
    const refButton1 = ref();
    const previewImage = ref("");
    const countryCode = ref("");
    const stateCode = ref("");
    const error = ref('')
    const phoneObj = ref({})
    const locationObj = ref({
        country:{options: Country.getAllCountries(),title:t('PlaceHolder.Select_Country'),key:'country',countryCode:'IN'},
        state:{options:State.getStatesOfCountry('IN'),title:t('PlaceHolder.Select_State'),key:'State',countryCode:'IN',stateCode:'GJ',isStateVal: false},
        city:{options:City.getCitiesOfState('IN', 'GJ'),title:t('PlaceHolder.Select_City'),key:'State',isCityVal: false}
    });
    const {getters} = useStore();
    const companies = computed(() => {
        return getters["settings/companies"];
    });
    const createCompanyObj = ref({
        Cst_CompanyName:{
            value: "",
            rules:
            `required | min:3`,
            name: "company name",
            error: ""
        },
        Cst_Phone:{
            value:"",
            rules:
            "required | regex:^[0-9]+$",
            name: "phone",
            error:""
        },
        Cst_Country:{
            value:"",
            rules:
            "required",
            name: "country",
            error:""
        },
        Cst_State:{
            value:"",
            rules:
            "required",
            name: "state",
            error:""
        },
        Cst_City:{
            value:"",
            rules:
            "required",
            name: "city",
            error:""
        },
        Cst_DialCode:{
            value:()=>{}
        },
        refferalCode:{
            value:"",
            rules:"",
            name: "refferalCode",
            error:""
        },
    });

    onMounted(() => {
        emit("companyProcess", false);
        emit("processMessage", "");
        if (env.AFFILITAION_ON == 'true' && Cookies.get('refferCode')) {
            createCompanyObj.value.refferalCode.value = Cookies.get('refferCode');
        }
    })
    const openCropperTool = () => {
        isCropperVisible.value = true
        document.getElementById('cropping-input').click()
    }

    const isNumber = (evt) => {
        const char = String.fromCharCode(evt.keyCode)
        if (!/[0-9]/.test(char)) {
            evt.preventDefault()
        }
    }

    const HandleSidebar = (key) =>{
        switch (key) {
            case 'country':
                currentSidebarValue.value = [{ value: createCompanyObj.value.Cst_Country.value }];
                break;
            case 'state':
                locationObj.value[key].options = State.getStatesOfCountry(locationObj.value['country']['countryCode'])            
                currentSidebarValue.value = [{ value: createCompanyObj.value.Cst_State.value }];
                break;
            case 'city':
                locationObj.value[key].options = City.getCitiesOfState(locationObj.value['country']['countryCode'],locationObj.value['state']['stateCode'])            
                currentSidebarValue.value = [{ value: createCompanyObj.value.Cst_City.value }];
                break;
            default:
                break;
        }
    }

    const cleanUp = () =>{
        for(let key in createCompanyObj.value) {
            createCompanyObj.value[key].error = ''
            createCompanyObj.value[key].value = ''
        }
        createCompanyObj.value.Cst_City.rules = 'required';
        createCompanyObj.value.Cst_State.rules = 'required';
        locationObj.value['state'].isStateVal = false;
        locationObj.value['city'].isCityVal = false;
        Company_profileImage.value = ""
        isCropperVisible.value = false;
        error.value = "";
    }

    const HandleSubmit = () =>{
        let duplicationCompany =  companies.value.filter((item)=>{
            return createCompanyObj.value.Cst_CompanyName.value.toLowerCase().trim().replaceAll(" ","") === item.Cst_CompanyName.toLowerCase().trim().replaceAll(" ","")
        })

        if(duplicationCompany.length){
            $toast.error(t("Toast.Company_name_already_exists"),{ position :'top-right' })
            return
        }
        checkAllFields(createCompanyObj.value).then(async(valid)=>{        
            if (valid && error.value === '') {
                let isREfferValid = true;
                if (env.AFFILITAION_ON == 'true') {
                    const valid = isRefferalCodeValidate()
                    if (createCompanyObj.value.refferalCode.error !== '' || !valid) {
                        isREfferValid = false;
                    }
                }
                if (!isREfferValid) {
                    Swal.fire({
                        title: t('Affiliate.invalid_refferal_model_title'),
                        text: t('Affiliate.invalid_refferal_model_text'),
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: t('Affiliate.invalid_refferal_model_confirm_text')
                    }).then((result)=>{
                        if (result.isConfirmed) {
                            createCompanyAPiFun();
                        }
                    }).catch((error)=>{
                        console.error(error,"It is error")
                    })
                } else {
                    createCompanyAPiFun();
                }
                // const formData = new FormData();
            }
        })
    }

    const createCompanyAPiFun = async () => {
        const evId = `ev_${makeUniqueId(12)}`;
        const source = new EventSource(`${env.API_URI}/company-create/events/${evId}`);

        source.onmessage = function(event) {
            // Parse the event data (the progress update)
            if (!isCompanyProcess.value) {
                isCompanyProcess.value = true;
                emit("companyProcess", true);
            }
            const data = JSON.parse(event.data)?.data;

            if (data?.step === 1) {
                stepCompanyProcessMessage.value = "Creating Company";
                emit("processMessage", stepCompanyProcessMessage.value);
            } else if (data?.step === 2) {
                stepCompanyProcessMessage.value = t('Company.company_created');
                emit("processMessage", stepCompanyProcessMessage.value);
            } else {
                source.close(); // Close the connection when the progress reaches 100%
                if (data?.error) {
                    if(data?.freeCompanyLimitReached === true) {
                        stepCompanyProcessMessage.value = t('Toast.free_company_limit_reached');
                    } else {
                        stepCompanyProcessMessage.value = t('companyErrorMessage.Something_went_wrong_Please_contact_to_admin');
                    }
                    emit("processMessage", stepCompanyProcessMessage.value);
                    setTimeout(() => {
                        isCompanyProcess.value = false;
                        emit("companyProcess", false);
                    }, 1500)
                    return;
                }
                stepCompanyProcessMessage.value = "Good To Go.";
                emit("processMessage", stepCompanyProcessMessage.value);
                setTimeout(() => {
                    $toast.success(t("Toast.Company_has_been_created_Successfully"),{position: 'top-right'});
                    isCompanyProcess.value = false;
                    emit("companyProcess", false);
                    window.location.reload();
                }, 1500);
            }
        };
        source.onerror = function(error) {
            console.error('EventSource failed1:', error);
            setTimeout(() => {
                isCompanyProcess.value = false;
                emit("companyProcess", false);
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
        const userDetail = await getUser(userId.value);                
        if(!userDetail){
            $toast.error(t("Toast.something_went_wrong"), { position: 'top-right' });
            return;
        }
        const formData = {
            userId : userId.value,
            email: userDetail?.Employee_Email || "",
            companyName : createCompanyObj.value.Cst_CompanyName.value,
            phoneNumber : createCompanyObj.value.Cst_Phone.value,
            country : createCompanyObj.value.Cst_Country.value,
            city : createCompanyObj.value.Cst_City.value,
            state : createCompanyObj.value.Cst_State.value,
            countryCodeObj : createCompanyObj.value.Cst_DialCode.value,
            refferalCode: createCompanyObj.value.refferalCode.value,
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
        if(Company_profileImage.value){
            formData.file = base64Image.value;
            formData.fileName = file.value;
        }
        try {
            isSpinner.value = true;
            emit("isSpinnerEvent", true);
            visible.value = false;
            emit("visibleClick", false);
            apiRequestWithoutCompnay("post", env.CREATE_COMPANY, formData).then((res)=>{
                if(res.data.status === true){
                    // $toast.success("Company has been created Successfully.",{position: 'top-right'});
                }else{
                    source.close(); // Close the connection when the progress reaches 100%
                    if(res.data?.freeCompanyLimitReached === true) {
                        stepCompanyProcessMessage.value = t('Toast.free_company_limit_reached');
                    } else {
                        stepCompanyProcessMessage.value = t('companyErrorMessage.Something_went_wrong_Please_contact_to_admin');
                    }
                    emit("processMessage", stepCompanyProcessMessage.value);
                    setTimeout(() => {
                        isCompanyProcess.value = false;
                        emit("companyProcess", false);
                    }, 1500)
                    if(res.data?.freeCompanyLimitReached === true) {
                        $toast.warning(t('Toast.free_company_limit_reached'),{position: 'top-right'})
                    } else {
                        $toast.error(t('Toast.something_went_wrong'),{position: 'top-right'})
                    }
                }
                isSpinner.value = false
                emit("isSpinnerEvent", false);
                Cookies.remove('refferCode');
                cleanUp()
            }).catch((error) => {
                console.error(`Company Create Error: ${JSON.stringify(error)}`);
                $toast.error(error,{position: 'top-right'})    
                source.close(); // Close the connection when the progress reaches 100%
                stepCompanyProcessMessage.value = t('companyErrorMessage.Something_went_wrong_Please_contact_to_admin');
                emit("processMessage", stepCompanyProcessMessage.value);
                setTimeout(() => {
                    isCompanyProcess.value = false;
                    emit("companyProcess", false);
                }, 1500)    
            })
        } catch (error) {
            console.error(`Company Create Error: ${JSON.stringify(error)}`);
            $toast.error(error,{position: 'top-right'})    
            source.close(); // Close the connection when the progress reaches 100%
            stepCompanyProcessMessage.value = t('companyErrorMessage.Something_went_wrong_Please_contact_to_admin');
            emit("processMessage", stepCompanyProcessMessage.value);
            setTimeout(() => {
                isCompanyProcess.value = false;
                emit("companyProcess", false);
            }, 1500)
        }
    }

    const handleDisabled = async (key, val) => {
        const country = val.isoCode;
        const state = val.countryCode;
        const noStates = (await State.getStatesOfCountry(country)).length === 0;
        const noCities = (await City.getCitiesOfState(state, country)).length === 0;

        if (key === 'country') {
            locationObj.value['state'].isStateVal = noStates;
            createCompanyObj.value.Cst_City.rules = noStates ? '' : 'required';
            createCompanyObj.value.Cst_State.rules = noStates ? '' : 'required';
            createCompanyObj.value.Cst_State.error = '';
            createCompanyObj.value.Cst_City.error = '';
        } else if (key === 'state') {
            locationObj.value['city'].isCityVal = noCities;
            createCompanyObj.value.Cst_City.rules = noCities ? '' : 'required';
            createCompanyObj.value.Cst_City.error = '';
        }
    };

    const HandleValues = (key,val) => {
        switch (key) {
            case 'country':
                handleDisabled('country',val)
                locationObj.value[key]['countryCode'] = val['isoCode']
                createCompanyObj.value.Cst_Country.value = val.label
                createCompanyObj.value.Cst_DialCode.value = {
                    name : val.name,
                    isoCode: val.isoCode,
                    dialCode: val.phonecode
                }
                phoneObj.value = {
                    name : val.name,
                    isoCode: val.isoCode,
                    dialCode: val.phonecode
                }
                phoneValidation(String(createCompanyObj.value.Cst_Phone.value))
                checkErrors({'field':createCompanyObj.value.Cst_Country,
                'name':createCompanyObj.value.Cst_Country.name,
                'validations':createCompanyObj.value.Cst_Country.rules,
                'type':createCompanyObj.value.Cst_Country.type})
                createCompanyObj.value.Cst_State.value = ""
                countryCode.value = val.isoCode;
                setTimeout(() => { 
                    const ele = document.getElementById("refState1");
                    ele.focus();
                }, 1000);
                break;
            case 'state':
                handleDisabled('state',val)
                locationObj.value[key]['countryCode'] = val['countryCode']
                locationObj.value[key]['stateCode'] = val['isoCode']
                createCompanyObj.value.Cst_State.value = val.label
                checkErrors({'field':createCompanyObj.value.Cst_State,
                'name':createCompanyObj.value.Cst_State.name,
                'validations':createCompanyObj.value.Cst_State.rules,
                'type':createCompanyObj.value.Cst_State.type})
                stateCode.value = val.isoCode;
                setTimeout(() => { 
                    const ele = document.getElementById("refCity1");
                    ele.focus();
                }, 1000);
                break;
            case 'city':
                createCompanyObj.value.Cst_City.value = val.label
                checkErrors({'field':createCompanyObj.value.Cst_City,
                'name':createCompanyObj.value.Cst_City.name,
                'validations':createCompanyObj.value.Cst_City.rules,
                'type':createCompanyObj.value.Cst_City.type})
                setTimeout(() => { refButton1.value.focus() }, 1000);
                break; 
        }
    }

    function phoneValidation (number) {
        if(number === ""){
            return;
        }
        let code = createCompanyObj.value.Cst_DialCode.value.isoCode;
        const result = phone(number, { country: code, validateMobilePrefix: false });

        if (result.isValid) {
            error.value = '';
        } else {
            error.value = "Please enter valid number";
        }

        return result.isValid;
    }

    const isRefferalCodeValidate = () => {
       return apiRequestWithoutCompnay("post", env.VALIDATECOMPANYREFFERCODE, {refferalCode: createCompanyObj.value.refferalCode.value,userId: userId.value}).then(()=>{
                createCompanyObj.value.refferalCode.error = '';
                return true;
            }).catch((error)=>{
                console.error(error);
                createCompanyObj.value.refferalCode.error = t('Affiliate.refferal_code_error');
                return false;
            })
    }

    const referalCodeInput = debounce(async () => {
        if (env.AFFILITAION_ON == 'true' && createCompanyObj.value.refferalCode.value !== '') {
            await isRefferalCodeValidate();
        }
    }, 500)
</script>