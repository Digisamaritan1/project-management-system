<template>
    <div class="upgrade-now cursor-pointer">
        <div @click="$router.push({name: 'Upgrade', params: {cid: props.companyId}})">
            {{$t('Header.upgrade_now')}}
        </div>
    </div>
</template>
<script setup>
    import {defineProps} from "vue";
    const props = defineProps({
        companyId: {
            type: String,
            default: ""
        }
    });
</script>