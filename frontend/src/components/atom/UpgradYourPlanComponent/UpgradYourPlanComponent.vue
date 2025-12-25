<template>
    <div class="w-100 position-ab position-center z-index-1 p-5px border-radius-5-px text-center p0x-15px">
        <div v-if="props.isImage" class="mb-30px">
            <img :src="upgradePlan">
        </div>
        <div>
            <h3 class="font-size-22 font-weight-700 text-center line-height-33 black">
                {{firstTitle}} <span class="blue">{{secondTitle}}</span> {{lastTitle}}
            </h3>
            <p class="font-size-16 font-weight-400 text-center line-height-23-68 black gray81 mt-10px mb-20px">
                {{props.message}}
            </p>
            <button @click="router.push({name: 'Upgrade', params: {cid: companyId}})" class="cursor-pointer font-size-16 font-weight-400 text-center line-height-23-68 black white bg-dark-green-light border-0 border-radius-4-px p3x-14px">
                {{buttonText}}
            </button>
        </div>
    </div>
</template>
<script setup>
    import { useRouter } from "vue-router";
    const router = useRouter();
    //upgradePlan
    const upgradePlan = require("@/assets/images/png/upgradePlan.png");
    // props
    const props = defineProps({
        isImage:{
            type:Boolean,
            default:true
        },
        message:{
            type:String,
            default:""
        },
        firstTitle:{
            type:String,
            default:""
        },
        secondTitle:{
            type:String,
            default:""
        },
        lastTitle:{
            type:String,
            default:""
        },
        buttonText:{
            type:String,
            default:""
        }
    });
</script>
