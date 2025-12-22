<template>
    <div class="map-wrapper">
        <div class="card">
            <div style="margin: 60px;">
                <div>
                    <p v-if="mainStep && mainStep !== 100" class="main-text">Please Hold On. Do not refresh the page as we complete the basic installation step.</p>
                    <div class="image-section" v-if="mainStep && mainStep !== 100 && stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 2 && stepDesc[`step${mainStep}Desc`][0].status === 'inprogress'">
                        <img :src="inProgressImg" />
                    </div>
                    <div class="image-section" v-if="mainStep && mainStep !== 100 && stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 2 && stepDesc[`step${mainStep}Desc`][0].status === 'done'">
                        <img :src="successImg" />
                    </div>
                    <div class="image-section" v-if="mainStep && mainStep !== 100 && stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length === 1 && stepDesc[`step${mainStep}Desc`][0].subStep === 2 && stepDesc[`step${mainStep}Desc`][0].status === 'error'">
                        <img :src="errorImg" />
                    </div>
                    <div v-if="mainStep && mainStep === 100">
                        <!-- <img :src="successImg" /> -->
                        <p class="text-center">Please Wait a moment</p>
                        <h2 class="text-center">All Step is Done</h2>
                    </div>
                    <div v-if="mainStep && mainStep === 1 && mainStep !== 100">
                        <h1 class="blue title text-center">Verification Your Domain</h1>
                        <div v-if="stepDesc[`step${mainStep}Desc`][0].subStep === 1" >
                            <DomainVerify @complete="domainVerifySubmit"></DomainVerify>
                        </div>
                    </div>
                    <div v-if="mainStep && mainStep === 2 && mainStep !== 100">
                        <h1 class="blue title text-center">Verification Your MongoDb</h1>
                        <div v-if="stepDesc[`step${mainStep}Desc`][0].subStep === 1" >
                            <MongoDBVerify @complete="mongoDbVerifySubmit"></MongoDBVerify>
                        </div>
                    </div>
                    <div v-if="mainStep && mainStep === 3 && mainStep !== 100">
                        <h1 class="blue title text-center">Verification Your Storage</h1>
                        <div v-if="stepDesc[`step${mainStep}Desc`][0].subStep === 1" >
                            <StorageVerify @complete="storageVerifySubmit"></StorageVerify>
                        </div>
                    </div>
                    <div v-if="mainStep && mainStep === 4 && mainStep !== 100">
                        <h1 class="blue title text-center">Verification Your Firebase</h1>
                        <div v-if="stepDesc[`step${mainStep}Desc`][0].subStep === 1" >
                            <FirebaseVerify @complete="firebaseVerifySubmit"></FirebaseVerify>
                        </div>
                    </div>
                    <div v-if="mainStep && mainStep === 5 && mainStep !== 100">
                        <h1 class="blue title text-center">Choose Payment</h1>
                        <div v-if="stepDesc[`step${mainStep}Desc`][0].subStep === 1" >
                            <ChoosePayment @complete="choosePaymentSubmit"></ChoosePayment>
                        </div>
                    </div>
                    <div v-if="mainStep && mainStep === 6 && mainStep !== 100 && paymentMethod === 'chargebee'">
                        <h1 class="blue title text-center">Verification Your Chargebee</h1>
                        <div v-if="stepDesc[`step${mainStep}Desc`][0].subStep === 1" >
                            <ChargebeeVerify @complete="chargebeeVerifySubmit"></ChargebeeVerify>
                        </div>
                    </div>
                    <div v-if="mainStep && mainStep === 6 && mainStep !== 100 && paymentMethod === 'paddle'">
                        <h1 class="blue title text-center">Verification Your Paddle</h1>
                        <div v-if="stepDesc[`step${mainStep}Desc`][0].subStep === 1" >
                            <PaddleVerify @complete="paddleVerifySubmit"></PaddleVerify>
                        </div>
                    </div>
                    <div v-if="mainStep && mainStep === 7 && mainStep !== 100">
                        <h1 class="blue title text-center">Artificial Intelligence</h1>
                        <div v-if="stepDesc[`step${mainStep}Desc`][0].subStep === 1" >
                            <ArtificialIntelligenceVerify @complete="artificialIntelligenceSubmit"></ArtificialIntelligenceVerify>
                        </div>
                    </div>
                    <div v-if="mainStep && mainStep === 8 && mainStep !== 100">
                        <h1 class="blue title text-center">Verification Your SMTP</h1>
                        <div v-if="stepDesc[`step${mainStep}Desc`][0].subStep === 1" >
                            <SMTPVerify @complete="smtpVerifySubmit"></SMTPVerify>
                        </div>
                    </div>
                    <div v-if="mainStep && mainStep === 9 && mainStep !== 100">
                        <h1 class="blue title text-center">Initializations Database</h1>
                    </div>
                    <div v-if="mainStep && mainStep === 10 && mainStep !== 100">
                        <h1 class="blue title text-center">Create User</h1>
                        <div v-if="stepDesc[`step${mainStep}Desc`][0].subStep === 1" >
                            <CreateUser @complete="createUserSubmit"></CreateUser>
                        </div>
                    </div>
                    <div v-if="mainStep && mainStep === 11 && mainStep !== 100">
                        <h1 class="blue title text-center">Generating Frontend Build</h1>
                    </div>
                    <div v-if="mainStep && mainStep === 12 && mainStep !== 100">
                        <h1 class="blue title text-center">Generating Admin Build</h1>
                    </div>
                </div>
                <div v-if="mainStep && mainStep !== 100 && stepDesc[`step${mainStep}Desc`] && stepDesc[`step${mainStep}Desc`].length && stepDesc[`step${mainStep}Desc`].length !== 1">
                    <div style="margin: 30px 0px;">
                        <div class="sub-steps d-flex align-items-center mb-20px" v-for="(row, stepIndex) in stepDesc[`step${mainStep}Desc`]" :key="stepIndex" :class="{'opacity-5' : row.status === 'remaining' }">
                            <span class="">{{row.name}}</span>
                            <img
                                v-if="row.status !== 'remaining'"
                                :src="row.status === 'inprogress' ? inProgressImg : row.status === 'done' ? smallsuccessImg :  smallerrorImg"
                                width="25"
                                height="25"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    // PACKAGES
    import { defineComponent, onMounted, ref } from "vue";
    import * as env from '@/config/env';
    import { apiRequest } from "../../services";
    import {useToast} from 'vue-toast-notification';
    import CreateUser from "./CreateUser.vue";
    import DomainVerify from "./DomainVerify.vue";
    import MongoDBVerify from "./MongoDBVerify.vue";
    import StorageVerify from "./StorageVerify.vue";
    import FirebaseVerify from "./FirebaseVerify.vue";
    import ChoosePayment from "./ChoosePaymet.vue";
    import ChargebeeVerify from "./ChargebeeVerify.vue";
    import PaddleVerify from "./PaddleVerify.vue";
    import ArtificialIntelligenceVerify from "./ArtificialIntelligenceVerify.vue";
    import SMTPVerify from "./SMTPVerify.vue";
    import inProgressImg from "@/assets/images/svg/inprogress.gif";
    import successImg from "@/assets/images/svg/sucess.svg";
    import smallsuccessImg from "@/assets/images/svg/smallsucess.svg";
    import errorImg from "@/assets/images/svg/error.svg";
    import smallerrorImg from "@/assets/images/svg/smallerror.svg";
    const $toast = useToast();
    
    defineComponent({
        name: "install-step-page"

    });

    const licenseType = ref("");
    const paymentMethod = ref("");
    const stepData = ref({});
    const mainStep = ref(0);
    const isMainStep = ref(true);
    const stepDesc = ref({
        step1Desc: [{
            step: 1,
            name: "Domain Checking",
            status: "inprogress",
            subStep: 1
        }],
        step2Desc: [{
            step: 1,
            name: "Verification Your Mongodb",
            status: "inprogress",
            subStep: 1
        }],
        step3Desc: [{
            step: 1,
            name: "Verification Your Storage",
            status: "inprogress",
            subStep: 1
        }],
        step4Desc: [{
            step: 1,
            name: "Verification Your Firebase",
            status: "inprogress",
            subStep: 1
        }],
        step5Desc: [{
            step: 1,
            name: "Choose Payment",
            status: "inprogress",
            subStep: 1
        }],
        step6Desc: [{
            step: 1,
            name: "Verification Your Chargebee",
            status: "inprogress",
            subStep: 1
        }],
        step7Desc: [{
            step: 1,
            name: "Artificial Intelligence",
            status: "inprogress",
            subStep: 1
        }],
        step8Desc: [{
            step: 1,
            name: "Verification Your SMTP",
            status: "inprogress",
            subStep: 1
        }],
        step9Desc: [{
            step: 1,
            name: "Initializations Database",
            status: "inprogress",
            subStep: 2
        }],
        step10Desc: [{
            step: 1,
            name: "Create User",
            status: "inprogress",
            subStep: 1
        }],
        step11Desc: [{
            step: 1,
            name: "Generating Front Build",
            status: "inprogress",
            subStep: 2
        }],
        step12Desc: [{
            step: 1,
            name: "Generating Admin Build",
            status: "inprogress",
            subStep: 2
        }]
    })
    function startCallingSteps(bData, bodyData) {
        mainStep.value = bData.step;
        const evId = `ev_${Math.random().toString(16).slice(2)}`;

        if (
            (bData.step === 1 && stepDesc.value.step1Desc[0].subStep === 1) || 
            (bData.step === 2 && stepDesc.value.step2Desc[0].subStep === 1) ||
            (bData.step === 3 && stepDesc.value.step3Desc[0].subStep === 1) ||
            (bData.step === 4 && stepDesc.value.step4Desc[0].subStep === 1) ||
            (bData.step === 5 && stepDesc.value.step5Desc[0].subStep === 1) ||
            (bData.step === 6 && stepDesc.value.step6Desc[0].subStep === 1) ||
            (bData.step === 7 && stepDesc.value.step7Desc[0].subStep === 1) ||
            bData.step === 8 ||
            (bData.step === 10 && stepDesc.value.step10Desc[0].subStep === 1)
            ) {
            return;
        }
        
        const source = new EventSource(`${env.API_URI}/api/v1/checkinstallstep/events/${evId}`);
        let step;
        source.onmessage = function(event) {
            // Parse the event data (the progress update)
            const data = JSON.parse(event.data)?.data;
            if (data?.step && data?.step !== 100) {
                step = data?.step;
                stepDesc.value[`step${bData.step}Desc`][step-1].status = "done";
                if (stepDesc.value[`step${bData.step}Desc`].length > step) {
                    stepDesc.value[`step${bData.step}Desc`][step].status = "inprogress";
                }
            } else {
                source.close();
                if (data?.error) {
                    if (!step) {
                        stepDesc.value[`step${bData.step}Desc`][0].status = "error";
                        setTimeout(() => {
                            if (bData.step === 11 || bData.step === 12) {
                                stepDesc.value[`step${bData.step}Desc`][0].subStep = 2;
                            } else {
                                stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                            }
                        }, 2000)
                    } else {
                        stepDesc.value[`step${bData.step}Desc`][0].status = "error";
                        setTimeout(() => {
                            if (bData.step === 11 || bData.step === 12) {
                                stepDesc.value[`step${bData.step}Desc`][0].subStep = 2;
                            } else {
                                stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                            }
                        }, 2000)
                    }
                    // Error Message
                    return;
                }
                stepDesc.value[`step${bData.step}Desc`][stepDesc.value[`step${bData.step}Desc`].length-1].status = "done";
            }
        };
        source.onerror = function(error) {
            console.error("Event error", error);
            stepDesc.value[`step${bData.step}Desc`][step].status = "done";
            source.close(); // Close the connection in case of error
        };
        try {
            let installStepData = {
                eventId : evId,
                step: bData.step
            };
            if (bodyData) {
                installStepData = {...installStepData, ...bodyData}
            }
            apiRequest("post", env.INSTALL_STEP, installStepData).then((res) => {
                if (res.data.status === true) {
                    if (res?.data?.envVar?.CANYONLICENSETYPE) {
                        licenseType.value = res.data.envVar.CANYONLICENSETYPE || "";
                    }
                    if (res?.data?.envVar?.CANYONLICENSETYPE) {
                        paymentMethod.value = res.data.envVar.PAYMENTMETHOD || "";
                    }
                    if (stepData.value.data[bData.step]) {
                        source.close();
                        mainStep.value = bData.step;
                        // if (licenseType.value === "Regular License" && bData.step === 1) {
                        //     mainStep.value = bData.step+1;
                        //     startCallingSteps(stepData.value.data[bData.step+1]);
                        // }
                        if (licenseType.value === "Regular License" && bData.step === 4) {
                            mainStep.value = bData.step+2;
                            startCallingSteps(stepData.value.data[bData.step+2]);
                        } else if (licenseType.value === "Regular License" && bData.step === 11) {
                            source.close();
                            mainStep.value = 100;
                            setTimeout(() => {
                                const OldUrl =  window.location.origin;
                                window.location.href = OldUrl + "/";
                            }, 5000);
                        } else {
                            startCallingSteps(stepData.value.data[bData.step]);
                        }
                    } else {
                        source.close();
                        mainStep.value = 100;
                        setTimeout(() => {
                            const OldUrl =  window.location.origin;
                            window.location.href = OldUrl + "/admin/";
                        }, 5000);
                    }
                } else {
                    source.close();
                    // Add Error Message
                    $toast.error(`Please check your credentials. ${res.data.error}`,{position: 'top-right'});
                    if (!step) {
                        stepDesc.value[`step${bData.step}Desc`][0].status = "error";
                        setTimeout(() => {
                            if (bData.step === 11 || bData.step === 12) {
                                stepDesc.value[`step${bData.step}Desc`][0].subStep = 2;
                            } else {
                                stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                            }
                        }, 2000)
                    } else {
                        stepDesc.value[`step${bData.step}Desc`][0].status = "error";
                        setTimeout(() => {
                            if (bData.step === 11 || bData.step === 12) {
                                stepDesc.value[`step${bData.step}Desc`][0].subStep = 2;
                            } else {
                                stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                            }
                        }, 2000)
                    }
                }
            }).catch((err) => {
                source.close();
                // Add Error Message
                console.error("ERROR IN INSTALL STEP", err);
                stepDesc.value[`step${bData.step}Desc`][0].status = "error";
                setTimeout(() => {
                    if (bData.step === 11 || bData.step === 12) {
                        stepDesc.value[`step${bData.step}Desc`][0].subStep = 2;
                    } else {
                        stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                    }
                }, 2000)
            })
        } catch (error) {
            source.close();
            // Add Error Message
            stepDesc.value[`step${bData.step}Desc`][0].status = "error";
            setTimeout(() => {
                if (bData.step === 11 || bData.step === 12) {
                    stepDesc.value[`step${bData.step}Desc`][0].subStep = 2;
                } else {
                    stepDesc.value[`step${bData.step}Desc`][0].subStep = 1;
                }
            }, 2000)
        }
    }
    
    function createUserSubmit(data) {
        mainStep.value = 10;
        stepDesc.value.step10Desc[0].subStep = 2;
        stepDesc.value.step10Desc[0].status = "inprogress";
        startCallingSteps(stepData.value.data[9], data);
    }
    function domainVerifySubmit(data) {
        mainStep.value = 1;
        stepDesc.value.step1Desc[0].subStep = 2;
        stepDesc.value.step1Desc[0].status = "inprogress";
        startCallingSteps(stepData.value.data[0], data);
    }
    function mongoDbVerifySubmit(data) {
        mainStep.value = 2;
        stepDesc.value.step2Desc[0].subStep = 2;
        stepDesc.value.step2Desc[0].status = "inprogress";
        startCallingSteps(stepData.value.data[1], data);
    }
    function storageVerifySubmit(data) {
        mainStep.value = 3;
        stepDesc.value.step3Desc[0].subStep = 2;
        stepDesc.value.step3Desc[0].status = "inprogress";
        startCallingSteps(stepData.value.data[2], data);
    }
    function firebaseVerifySubmit(data) {
        mainStep.value = 4;
        stepDesc.value.step4Desc[0].subStep = 2;
        stepDesc.value.step4Desc[0].status = "inprogress";
        startCallingSteps(stepData.value.data[3], data);
    }
    function choosePaymentSubmit(data) {
        mainStep.value = 5;
        stepDesc.value.step5Desc[0].subStep = 2;
        stepDesc.value.step5Desc[0].status = "inprogress";
        startCallingSteps(stepData.value.data[4], data);
    }
    function chargebeeVerifySubmit(data) {
        mainStep.value = 6;
        stepDesc.value.step6Desc[0].subStep = 2;
        stepDesc.value.step6Desc[0].status = "inprogress";
        startCallingSteps(stepData.value.data[5], data);
    }
    function paddleVerifySubmit(data) {
        mainStep.value = 6;
        stepDesc.value.step6Desc[0].subStep = 2;
        stepDesc.value.step6Desc[0].status = "inprogress";
        startCallingSteps(stepData.value.data[5], data);
    }
    function artificialIntelligenceSubmit(data) {
        mainStep.value = 7;
        stepDesc.value.step7Desc[0].subStep = 2;
        stepDesc.value.step7Desc[0].status = "inprogress";
        startCallingSteps(stepData.value.data[6], data);
    }
    function smtpVerifySubmit() {
        mainStep.value = 9;
        stepDesc.value.step9Desc[0].subStep = 2;
        stepDesc.value.step9Desc[0].status = "inprogress";
        startCallingSteps(stepData.value.data[8]);
    }
    
    onMounted(() => {
        isMainStep.value = true;
        try {
            apiRequest("get", env.INSTALL_STEP_GET).then((getStepData) => {
                stepData.value = getStepData.data;
                if (getStepData.data.status === true) {
                    licenseType.value = getStepData?.data?.envVar?.CANYONLICENSETYPE || "";
                    paymentMethod.value = getStepData?.data?.envVar?.PAYMENTMETHOD || "";
                    const getErrorData = (getStepData.data.data || []).filter((x) => x.status === 'error');
                    if (getErrorData && getErrorData.length) {
                        // if (licenseType.value === "Regular License" && getErrorData[0].step === 2) {
                        //     startCallingSteps(getStepData.data.data[2]);
                        // } 
                        if (licenseType.value === "Regular License" && (getErrorData[0].step === 5 || getErrorData[0].step === 6)) {
                            startCallingSteps(getStepData.data.data[7]);
                        } else if (licenseType.value === "Regular License" && getErrorData[0].step === 10) {
                            startCallingSteps(getStepData.data.data[10]);
                        } else {
                            startCallingSteps(getErrorData[0]);
                        }
                        return;
                    }

                    const getInprogressData = (getStepData.data.data || []).filter((x) => x.status === 'inprogress');
                    if (getInprogressData && getInprogressData.length) {
                        // if (licenseType.value === "Regular License" && getInprogressData[0].step === 2) {
                        //     startCallingSteps(getInprogressData.data.data[2]);
                        // }
                        if (licenseType.value === "Regular License" && (getInprogressData[0].step === 5 || getInprogressData[0].step === 6)) {
                            startCallingSteps(getInprogressData.data.data[7]);
                        } else if (licenseType.value === "Regular License" && getInprogressData[0].step === 10) {
                            startCallingSteps(getInprogressData.data.data[10]);
                        } else {
                            startCallingSteps(getInprogressData[0]);
                        }
                        return;
                    }
                    const getDoneData = (getStepData.data.data || []).filter((x) => x.status === 'done');

                    if (getDoneData.length === getStepData.data.data.length) {
                        mainStep.value = 100;
                        console.log("All Step Is Done");
                        setTimeout(() => {
                            window.location.reload();
                        }, 5000);
                        return;
                    }

                    if (!(getDoneData && getDoneData.length) && !(getInprogressData && getInprogressData.length)) {
                        startCallingSteps(getStepData.data.data[0]);
                        return;
                    }
                    if (getDoneData && getDoneData.length && !(getInprogressData && getInprogressData.length)) {
                        startCallingSteps(getStepData.data.data[getDoneData.length]);
                    }
                } else {
                    mainStep.value = 0;
                    isMainStep.value = false;
                }
            }).catch((err) => {
                isMainStep.value = false;
                console.error("ERROR IN INSTALL STEP GET 1: ", err);
            })
        } catch (error) {
            mainStep.value = 0;
            isMainStep.value = false;
            console.error("ERROR IN INSTALL STEP GET 2: ", error);
        }
    })
</script>

<style src="./style.css">
</style>
