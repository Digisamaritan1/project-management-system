<template>
    <DropDownRouterOption :item="{image: creditCardIcon, to: {name: 'Billing History', params: {cid: companyId}}, label: $t('Header.billing_history')}" @click="props.refs.profile_menu_dd.click()"/>
</template>
<script setup>
    import {defineProps} from "vue";
    import DropDownRouterOption from "@/components/molecules/DropDownRouterOption/DropDownRouterOption.vue";
    const creditCardIcon = require("@/assets/images/svg/credit_card.svg");
    const props = defineProps({
        companyId: {
            type: String,
            default: ""
        },
        refs: {
            type: Object,
        }
    });
</script>