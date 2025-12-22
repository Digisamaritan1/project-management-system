<template>
    <li @click="$emit('visibleClick', true)" v-if="userData.roleType === 1 || (env.CANYON_IS_SINGLE_APP == 'false' && env.CANYONLICENSETYPE === 'Extended License')">
        <div class="uploadImagewrapper imageUplaod cursor-pointer">
            <img :src="plusIcon" alt="company logo" class="plusSignImg">
        </div>
        <span class="blue">{{ $t('Projects.add_new') }}</span>
    </li>
</template>
<script setup>
    import { computed } from "vue";
    import * as env from '@/config/env';
    const plusIcon = require("@/assets/images/svg/plus.svg");
    import { useStore } from "vuex";
    const {getters} = useStore();
    const userData = computed(() => getters["settings/companyUserDetail"]);

    // const props = defineProps({
    //     visible: {
    //         type: Boolean,
    //         default: false
    //     }
    // });
</script>
