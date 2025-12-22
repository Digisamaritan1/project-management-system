<template>
    <div>
        <div :style="{'opacity': isSpinner ? '0.5' : '1'}">
            <SpinnerComp :is-spinner="isSpinner" />
            <CreateAPlan v-model="planDetails" :isEdit="isEdit"/>
            <PlanLimit v-model="planDetails" :isEdit="isEdit" v-if="!planDetails.isContactSupport" />
            <CreatePlanDescription v-model="planDetails"/>
        </div>
    </div>
</template>
<script setup>
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp'
    import CreateAPlan from '@/components/molecules/CreatePlan/CreateAPlan';
    import PlanLimit from '@/components/molecules/CreatePlan/PlanLimit';
    import CreatePlanDescription from '@/components/molecules/CreatePlan/CreatePlanDescription';
    import { ref, watch, onMounted } from 'vue';
    import { useStore } from 'vuex';
    const { commit } = useStore();
    import { useToast } from 'vue-toast-notification';
    import { useValidation } from '@/composable/Validation.js';
    import { apiRequestWithoutCompnay } from '@/services';
    import * as env from '@/config/env';
    const { checkAllFields } = useValidation();
    const props = defineProps({
        saveClickTrigger: {
            type: Boolean
        },
        isEdit: {
            type: Boolean
        },
        editData: {
            type: Object
        }
    })
    const emits = defineEmits(["closeSidebar","isSpinner"]);
    const $toast = useToast();
    const isSpinner = ref(false);
    emits("isSpinner", isSpinner.value);
    const planDetails = ref({
        planName: {
            value: "",
            rules:"required",
            name: "plan name",
            error: ""
        },
        users: {
            value: "",
            rules:"required",
            name: "users",
            error: "",
            isPlanLimit: true,
        },
        description: {
            value: "",
            rules:"required | min:3",
            name: "features description",
            error: ""
        },
        monthlyPrice: {
            value: "",
            rules:"required | regex:^\\d+(\\.\\d)?\\d*$",
            name: "per User Monthly Price",
            error: ""
        },
        yearlyPrice: {
            value: "",
            rules:"required | regex:^\\d+(\\.\\d)?\\d*$",
            name: "per User Yearly Price",
            error: ""
        },   
        planDescription: {
            value: "",
            rules:"required | min:3",
            name: "description",
            error: ""
        },
        project: {
            value: "",
            rules:"required",
            name: "project",
            error: "",
            isPlanLimit: true
        },
        maxPrivateProject: {
            value: "",
            rules:"required",
            name: "max Private Project",
            error: "",
            isPlanLimit: true
        },
        maxPublicProject: {
            value: "",
            rules:"required",
            name: "max Public Project",
            error: "",
            isPlanLimit: true
        },
        sprintPerProject: {
            value: "",
            rules:"required",
            name: "sprint Per Project",
            error: "",
            isPlanLimit: true
        },
        maxTaskPerSprint: {
            value: "",
            rules:"required",
            name: "max Task Per Sprint",
            error: "",
            isPlanLimit: true
        },
        timeTrackerUser: {
            value: "",
            rules:"required",
            name: "time Tracker User",
            error: "",
            isPlanLimit: true
        },
        bucketStorage: {
            value: "",
            rules:"required",
            name: "Total Company Bucket Size",
            error: "",
            isPlanLimit: true
        },
        maxFileSize: {
            value: "",
            rules:"required",
            name: "max File Size Upload",
            error: "",
            isPlanLimit: true
        },
        guestUser: {
            value: "",
            rules:"required",
            name: "guest User",
            error: "",
            isPlanLimit: true
        },
        maxPublicChannels: {
            value: "",
            rules:"required",
            name: "max Public Channels",
            error: "",
            isPlanLimit: true
        },
        maxPrivateChannels: {
            value: "",
            rules:"required",
            name: "max Private Channels",
            error: "",
            isPlanLimit: true
        },
        aiRequest : {
            value: "",
            rules:"required",
            name: "Daily AI-generated Credit Limit",
            error: "",
            isPlanLimit: true
        },
        supportLink: {
            value: "",
            rules:"required",
            name: "Support Link",
            error: ""
        },
        isContactSupport: false,
        userRoles:true,
        userDesignation:true,
        team:true,
        checkList: true,
        listView:true,
        boardView:true,
        calenderView:true,
        tableView:true,
        embadeVIew:true,
        workloadView:true,
        projectDetailsView:true,
        actitvityView: true,
        commentsView: true,
        advanceFilterCtrlK:true,
        chat:true,
        oneToOneChat:true,
        chanels:true,
        trackerTimesheet:true,
        userTimesheet:true,
        projectTimesheet: true,
        workloadTimesheet: true,
        milestone:true,
        milstoneReport:true,
        projectProjectApp:true,
        tagProjectApp:true,
        multipleAssigneeProjectApp:true,
        timeEstimateProjectApp:true,
        timeTrackingProjectApp:true,
        globalPermison:true,
        projectWisePermisson:true,
        customFields: true,
        pushNotification: true,
        emailNotification:true,
        aiPermission: true,
        taskImportPermission: true,
        taskExportPermission: true
    })

    watch(() => props.saveClickTrigger, (newVal) => {
        if (newVal) {
            submit();
        }
    })

    function submit() {
        if (planDetails.value.isContactSupport) {
            const finalObj = {
                planName: planDetails.value.planName,
                isContactSupport: planDetails.value.isContactSupport,
                planDescription: planDetails.value.planDescription,
                description: planDetails.value.description,
                supportLink: planDetails.value.supportLink
            }
            planDetails.value = finalObj;
        } else {
            delete planDetails.value.supportLink;
            if(planDetails.value.aiPermission === false){
                planDetails.value.aiRequest.rules = "";
                planDetails.value.aiRequest.error = "";
            }else{
                planDetails.value.aiRequest.rules = "required";
            }
            const channels = planDetails.value.chanels;
    
            planDetails.value.maxPrivateChannels.rules = channels ? "required" : "";
            planDetails.value.maxPublicChannels.rules = channels ? "required" : "";
            planDetails.value.maxPublicChannels.error = channels ? planDetails.value.maxPublicChannels.error : "";
            planDetails.value.maxPrivateChannels.error = channels ? planDetails.value.maxPrivateChannels.error : "";
        }

        checkAllFields(planDetails.value).then(async (valid) => {
        if (valid) {
            isSpinner.value = true;
            emits("isSpinner", isSpinner.value);
            let finalObj = {}
            Object.keys(planDetails.value).forEach((ele)=>{
                if (planDetails.value[ele].isPlanLimit) {
                    if (planDetails.value[ele].value == '-1') {
                        finalObj[ele] = null; 
                    }
                    else {
                        finalObj[ele] = Number(planDetails.value[ele].value);
                    }
                }  
                else if (ele === 'description') {
                    let descriptionList = '';
                    let arr = planDetails.value[ele].value.split('\n')
                    arr.forEach((dt)=>{
                        if (dt !== '') {
                            descriptionList = descriptionList + `<li>${dt}</li>`
                        }
                    })
                    let finalDisscription = `<ul>${descriptionList}</ul>`;
                    finalObj[ele] = finalDisscription;
                }
                else {
                    finalObj[ele] = planDetails.value[ele].value ? planDetails.value[ele].value : planDetails.value[ele]
                }
            })
            if (!props.isEdit) {
                apiRequestWithoutCompnay("post", env.CREATE_PAYMENT_PLAN, {...finalObj}).then(()=>{
                    $toast.success(`Plan Added successfully`,{position: 'top-right'})
                    finalObj.planId = finalObj.planName.replaceAll(" ","");
                    emits('closeSidebar', true);
                    window.location.reload();
                }).catch((error)=>{
                    isSpinner.value = false;
                    emits("isSpinner", isSpinner.value);
                    if (error?.response?.data?.message?.length) {
                        const errorCodes = error.response.data.message;
                        if (errorCodes.includes('already exists').length) {
                            planDetails.value.planName.error = `PlanName is already exists.`
                        } else {
                            console.error(error);
                            $toast.error(errorCodes,{position: 'top-right'});
                        }
                    } else {
                        $toast.error(`Something Went Wrong`,{position: 'top-right'});
                        console.error(error);
                    }
                })
            } else {
                apiRequestWithoutCompnay("post", env.CREATE_EDIT_PAYMENT_PLAN, {...finalObj, planId: props.editData.planName}).then(()=>{
                    $toast.success(`Plan Update successfully`,{position: 'top-right'})
                    finalObj.planId = finalObj.planName.replaceAll(" ","");
                    let planFeatureDisplayObj = {
                        planName: finalObj.planId,
                        planDescription: finalObj.planDescription,
                        planFeatureTtitle: "",
                        planFeature: finalObj.description,
                    }
                    commit('planTab/setPlanFeatureDisplayAction', planFeatureDisplayObj);
                    delete finalObj.monthlyPrice
                    delete finalObj.yearlyPrice
                    delete finalObj.planDescription
                    delete finalObj.description
                    let planFeatures = {
                        ...finalObj,
                        planName: finalObj.planId
                    }
                    commit('planTab/setPlanFeatureAction', planFeatures);
                    emits('closeSidebar', true);
                }).catch((error)=>{
                    isSpinner.value = false;
                    emits("isSpinner", isSpinner.value);
                    $toast.error(`Something Went Wrong`,{position: 'top-right'});
                    console.error(error);
                })
            }
        }
        }).catch((error)=>{
            isSpinner.value = false;
            emits("isSpinner", isSpinner.value);
            console.error(error);
        })
    }


    onMounted(()=>{
        if (props.isEdit) {
            let planData = props.editData;
            planDetails.value.planName.value = planData.planDetails.name;
            planDetails.value.monthlyPrice.value = planData.itemPriceArray?.find((x)=> x.period_unit == 'month')?.price / 100;
            planDetails.value.yearlyPrice.value = planData.itemPriceArray?.find((x)=> x.period_unit == 'year')?.price / 100;
            planDetails.value.planDescription.value = planData.planFeatureDisplay.planDescription;
            planDetails.value.isContactSupport = planData.planFeature.isContactSupport ? planData.planFeature.isContactSupport : false;
            planDetails.value.supportLink.value = planData.supportLink;
            let descr = planData.planFeatureDisplay.planFeature.replace("<ul>","").replace("</ul>","").replaceAll("<li>","").replaceAll("</li>","\n");
            planDetails.value.description.value = descr;
            let valueArray = [
                'users','project','maxPrivateProject','maxPublicProject','sprintPerProject',
                'maxTaskPerSprint','timeTrackerUser','bucketStorage','maxFileSize','guestUser','maxPublicChannels',
                'maxPrivateChannels','aiRequest'
            ]
            valueArray.forEach((ele)=>{
                if (planData.planFeature[ele] == null) {
                    planDetails.value[ele].value = '-1'    
                } else {
                    planDetails.value[ele].value = planData.planFeature[ele];
                }
            })
            let withoutValueArray = [
                'userRoles','userDesignation','team','checkList','listView','boardView','calenderView','tableView','embadeVIew','workloadView',
                'projectDetailsView','actitvityView','commentsView','advanceFilterCtrlK','chat','oneToOneChat','chanels','trackerTimesheet',
                'userTimesheet','projectTimesheet','workloadTimesheet','milestone','milstoneReport','projectProjectApp',
                'tagProjectApp','multipleAssigneeProjectApp','timeEstimateProjectApp','timeTrackingProjectApp','globalPermison',
                'projectWisePermisson','customFields','pushNotification','emailNotification','aiPermission', 'taskExportPermission', 'taskImportPermission'
            ]
            withoutValueArray.forEach((ele)=>{
                if(ele === "checkList") {
                    planDetails.value[ele] = planData.planFeature[ele] ?? planData.planFeature['taskCheckList'];
                } else {
                    planDetails.value[ele] = planData.planFeature[ele];
                }
            })
        }
    })
</script>