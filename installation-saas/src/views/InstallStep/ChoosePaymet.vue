<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div class="form-group payment-item-section">
                <div class="payment-item" v-for="(row, indexP) in paymentArray" v-bind:key="indexP">
                    <div :class="{'selected-payment' : row.key === formData.choosePayment.value}" @click="selectPaymentOption(row.key)">
                        <img :src="row.imageSource" />
                        <span>{{ row.name }}</span>
                    </div>
                    <div class="payment-doc-link"><a :href="row.key === 'chargebee' ? 'https://www.chargebee.com': 'https://www.paddle.com/'" target="__blank">More Information</a></div>
                </div>
            </div>
            <div class="form-group">
                <button class="btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer btn-full mt-20" :disabled="!isSubmitSend" :class="{'disabled': !isSubmitSend}" @click="handleSubmit" tabindex="3">Submit</button>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { defineEmits, ref } from "vue";
    import Swal from 'sweetalert2';
    import chargebeePaymentImg from "@/assets/images/svg/chargebee-payment.png";
    import paddlePaymentImg from "@/assets/images/svg/paddle-payment.png";
    const emit = defineEmits(["complete"]);

    const paymentArray = ref([{
        name: "Chargebee",
        key: "chargebee",
        imageSource: chargebeePaymentImg
    }, {
        name: "Paddle",
        key: "paddle",
        imageSource: paddlePaymentImg
    }]);

    const formData = ref({
        choosePayment: {
            value: "chargebee"
        }
    });
    const isSubmitSend = ref(true);
    const stepDesc = ref({
        name: "Choose Payment",
        subStep: 1
    })
    const selectPaymentOption = (val) => {
        formData.value.choosePayment.value = val;
    }
    function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
    }
    const handleSubmit = () => {
        try {
            Swal.fire({
                title: `Are you sure to choose ${capitalize(formData.value.choosePayment.value)} payment?`,
                text: "",
                showCancelButton: true,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
            }).then((result)=>{
                if (result.value) {
                    stepDesc.value.subStep = 2;
                    isSubmitSend.value = false;
                    emit("complete", {choosePayment: formData.value.choosePayment.value});
                } else {
                    stepDesc.value.subStep = 1;
                    isSubmitSend.value = true;
                }
            })
        } catch (error) {
            console.error("error", error);
            stepDesc.value.subStep = 1;
            isSubmitSend.value = true;
        }
    }
</script>
<style scoped>
    .payment-item-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }

    .payment-item-section .payment-item {
        border: 2px solid #ececec;
        border-radius: 5px;
        padding: 10px;
        width: 48%;
        justify-content: center;
        text-align: center;
        cursor: pointer;
        box-sizing: border-box;
    }

    .payment-item-section .payment-item span {
        display: block;
        padding-top: 10px;
    }

    .payment-item-section .payment-item img {
        max-width: 70px;
        border-radius: 5px;
    }

    .payment-item-section .payment-item:hover {
        box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;
    }
    .payment-item-section .payment-item:has(.selected-payment) {
        border: 2px solid #2f3990;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;
    }
    .selected-payment span {
        font-weight: 500;
        color: #2F3990;
    }
    .payment-doc-link {
        top: 40px;
        position: relative;
    }
</style>