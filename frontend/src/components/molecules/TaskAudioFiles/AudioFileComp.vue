<template>
    <li class="list-style-none">
        <div class="d-flex flex-column align-items-start webkit-box-align w-100">
            <div v-if="Object.keys(audioObject).length">
                <AudioComp :audioSrc="audioObject" :key="audioObject.id"/>
            </div>
            <div class="d-flex audio_files-wave justify-content-between w-100">
                <span v-if="audioObject.getFrom == 'comments'" class="text-ellipsis" :title="audioObject.fileName"><a :href='audioObject.attached' target=”_blank” class="font-size-14 font-weight-500 text-decoration-none w-100 d-inline-block text-ellipsis black pr-5px">{{audioObject.fileName}}</a></span>
                <span class="text-ellipsis" v-else><a href='javascript:void(0)' :title="audioObject.fileName" class="font-size-14 font-weight-500 text-ellipsis text-decoration-none w-100 d-inline-block black pr-5px">{{audioObject.fileName}}</a></span>
                <span class="font-size-14 font-weight-500 gray81">{{audioObject.size}}</span>
            </div>
            <div class="d-flex align-items-end justify-content-between w-100 pb-2px">
                <h4 class="font-size-14 font-weight-500 m-0 gray81">{{audioObject.userDetail.Employee_Name}}</h4>
                <span class="font-size-13 gray81 font-weight-400">{{getDateAndTime(audioObject.createTime)}}</span>
            </div>
        </div>
    </li>
</template>
<script setup>
import {defineProps} from 'vue';
import AudioComp from "./AudioWasabiComp.vue";
import { useProjects } from '@/composable/projects';
const {getDateAndTime} = useProjects();
defineProps({
    audioObject: {
        type: Object,
        default: () => {}
    },
})
</script>
<style scoped>
.list-style-none{
    list-style: none;
}
</style>