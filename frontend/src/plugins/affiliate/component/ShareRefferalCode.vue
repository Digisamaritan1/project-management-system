<template>
    <div class="main-referral-section mb-30px">
        <div class="referral-section-top">
            <img class="referral-section-top-img1" :src="img1">
            <img class="referral-section-top-img2" :src="img2">
            <img class="referral-section-top-img3" :src="img3">
            <div class="referral-section-top-title">{{$t('Affiliate.refer_earn')}} <span>$$ {{$t('Affiliate.unlimited')}}</span></div>
            <div class="referral-section-top-desc">{{$t('Affiliate.invite_start_earning_cash_rewards')}}</div>
        </div>
        <div class="referral-section-bottom">
            <img class="referral-section-top-img4" :src="img4">
            <img class="referral-section-top-img5" :src="img5">
            <div class="referral-section-bottom-title"> {{$t('Affiliate.your_referral_code')}} </div>
            <div class="referral-section-bottom-code">
                <div class="code-box">
                    <span class="code">{{code}}</span>
                    <button class="copy-btn" @click.prevent="copyUrl">
                        <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 21V22.875C15 23.1734 14.8815 23.4595 14.6705 23.6705C14.4595 23.8815 14.1734 24 13.875 24H1.125C0.826631 24 0.540484 23.8815 0.329505 23.6705C0.118527 23.4595 0 23.1734 0 22.875V5.625C0 5.32663 0.118527 5.04049 0.329505 4.82951C0.540484 4.61853 0.826631 4.5 1.125 4.5H4.5V18.375C4.50074 19.071 4.77754 19.7382 5.26967 20.2303C5.76179 20.7225 6.42903 20.9993 7.125 21H15ZM15 4.875V3.38282e-06H7.125C6.82663 3.38282e-06 6.54048 0.11853 6.3295 0.329508C6.11853 0.540487 6 0.826635 6 1.125V18.375C6 18.6734 6.11853 18.9595 6.3295 19.1705C6.54048 19.3815 6.82663 19.5 7.125 19.5H19.875C20.1734 19.5 20.4595 19.3815 20.6705 19.1705C20.8815 18.9595 21 18.6734 21 18.375V6H16.125C15.8269 5.99914 15.5413 5.88033 15.3305 5.66954C15.1197 5.45875 15.0009 5.17311 15 4.875ZM20.6719 3.42188L17.5781 0.328128C17.4734 0.223747 17.3491 0.14104 17.2124 0.0847372C17.0756 0.0284344 16.9291 -0.000359235 16.7812 3.38282e-06H16.5V4.5H21V4.21594C21 3.91827 20.882 3.63273 20.6719 3.42188Z" fill="white"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="referral-section-bottom-desc" v-if="percentage">
                {{ $t('Affiliate.invite_spend_message', {percentage: percentage}) }}
            </div>
        </div>
    </div>
</template>
<script setup>
    import {onMounted, ref} from "vue";
    import { useToast } from 'vue-toast-notification';
    import { useI18n } from "vue-i18n";
    import * as env from '@/config/env';
    import img1 from '@/assets/images/svg/referral_img1.svg';
    import img2 from '@/assets/images/svg/referral_img2.svg';
    import img3 from '@/assets/images/svg/referral_img3.svg';
    import img4 from '@/assets/images/svg/referral_img4.svg';
    import img5 from '@/assets/images/svg/referral_img5.svg';
    import { apiRequestWithoutCompnay, apiRequest } from '../../../services';
    const $toast = useToast();
    const { t } = useI18n();
    const percentage = ref(0);
    const code = ref(null);
    onMounted(() => {
        getreferralpercentage();
        getreferralcode();
    })
    function getreferralpercentage () {
        apiRequestWithoutCompnay("get", env.GETREFERRALPERCENTAGE).then((gData)=>{
            percentage.value = gData?.data?.data?.value || 10;
        }).catch((error)=>{
            console.error(error);
        })
    }
    function getreferralcode () {
        apiRequest("get", env.GETCOMPANYREFFERCODE).then((gData)=>{
            code.value = gData.data.data;
        }).catch((error)=>{
            console.error(error);
        })
    }
    function copyUrl() {
        let url = `${env.DOMAIN_URI}/#/business?code=${code.value}`;
        navigator.clipboard.writeText(url);
        $toast.success(t("Toast.Link_is_Copied_to_clipboard"),{position: 'top-right'});
    }
</script>
<style scoped src="../css/style.css"></style>