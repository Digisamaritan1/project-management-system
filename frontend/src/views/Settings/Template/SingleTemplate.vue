<template>
    <div class="template_project_imgTxt_wrapper">
        <div class="template_project_img">
            <template v-if="!(theModel?.templateImageURL &&  Object.keys(theModel.templateImageURL || {}).length)">
                <img class="cursor-pointer" v-if="!(theModel?.templateImageURL &&  Object.keys(theModel.templateImageURL).length)" :src="demoTemp"/>
            </template>
            <template v-else>
                <img class="cursor-pointer" v-if="typeof theModel.templateImageURL === 'string' && theModel.templateImageURL?.includes('http')" :src="theModel.templateImageURL"/>
                <WasabiIamgeCompp
                    v-else-if="theModel?.templateImageURL &&  Object.keys(theModel.templateImageURL).length"
                    :data="{url:theModel.templateImageURL.data,extension:theModel.templateImageURL.extension || 'jpg'}"
                    class="attachment__image-height w-100 cursor-pointer"
                />
            </template>
        </div>
        <div class="template_project_text">
            <span class="text-capitalize text-ellipse mw-100 d-block" :title="theModel.TemplateName">{{theModel.TemplateName}}</span>
            <p>{{theModel.Description}}</p>
            <div class="templateListIcon d-flex justify-content-between align-items-center">
                <ul class="d-flex align-items-center template__view-icon" v-if="theModel.TemplateRequiredComponent && theModel.TemplateRequiredComponent.length > 0">
                    <template v-for="(appData,ids) in theModel.TemplateRequiredComponent.filter((x) => ((x.keyName !== 'Gantt' || x.keyName !== 'Timeline' || x.keyName !== 'Embed') && x.viewStatus == true))">
                    <li v-bind:key="ids" v-if="appData.viewStatus && ids<=3" class="d-flex align-items-center justify-content-center cursor-pointer mr-5px">
                            <span :title="appData.name">
                                <img class="template_image_wrapper" :src="projectComponentsIcons(appData.keyName).activeIcon" />
                            </span>
                        </li>
                        <span v-bind:key="ids" v-if="ids>=4 && ids == (theModel.TemplateRequiredComponent.filter((ele)=>{return (ele.keyName !== 'Gantt' && ele.keyName !== 'Timeline' && ele.keyName !== 'Embed' && ele.viewStatus == true)}).length) - 1">
                            {{ (theModel.TemplateRequiredComponent.filter((ele)=>{return (ele.keyName !== 'Gantt' && ele.keyName !== 'Timeline' && ele.keyName !== 'Embed' && ele.viewStatus == true)}).length) - 4 !== 0 ? `+${(theModel.TemplateRequiredComponent.filter((ele)=>{return (ele.keyName !== 'Gantt' && ele.keyName !== 'Timeline' && ele.keyName !== 'Embed' && ele.viewStatus == true)}).length) - 4}`: '' }}
                        </span>
                    </template>
                </ul>
                <div class="templateListIcon d-flex justify-content-between align-items-center template-right-listicon">
                    <ul class="d-flex align-items-center" v-if="theModel.projectStatusData && theModel.projectStatusData.length > 0">
                        <template v-for="(status,index) in theModel.projectStatusData">
                            <li class="cursor-pointer border-0 p-0 align-items-baseline" v-bind:key="index" v-if="index<3">
                                <span :title="status.name" class="default-status-squer d-inline-block border-radius-2-px position-re ml-5px status__color" :style="[{'background-color': status.textColor,'cursor': 'pointer'}]"></span>
                            </li>
                        </template>
                        <span class="ml-4px"  v-if="theModel.projectStatusData.length > 3">+{{theModel.projectStatusData.length-3}}</span>
                    </ul>
                    <span></span>
                </div>
            </div>
        </div>  
    </div>
</template>
<script setup>
import { ref, watch } from 'vue';
import WasabiIamgeCompp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue"
import { projectComponentsIcons } from '@/composable/commonFunction';

const demoTemp = require('@/assets/images/demoTemp.png');
const props = defineProps({
    displayDataObject:{
        type: Object,
        default: () => ({}),
    },
});
const theModel = ref(props.displayDataObject)
watch(()=>props.displayDataObject,(newVal,oldVal)=>{
    if(JSON.stringify(newVal) == JSON.stringify(oldVal)) {
        return;
    }
    theModel.value = newVal;
})
</script>
<style>
    .back_arrow_template {
        position: absolute;
        z-index: 9;
        left: 595px;
    }
    .backArrow{
        margin-right: 15px;
        position: absolute;
        top: 16px;
        left: 18px;
    }
</style>
<style scoped>
@import "./style.css";
</style>