<template >
    <div class="d-flex align-items-center">
        <ul class="task_detail_navbar_ul">
            <li>
                <span 
                    class="task_detail_navbar cursor-pointer"
                    :title="projectName"
                    @click="$emit('open', 'project')"
                >
                    {{ projectName }}
                </span>
                <!-- <img
                    class="task_detail_navbar_img"
                    src="@/assets/images/svg/breadcrum.svg"
                    alt="breadcrum"
                > -->
                <img :src="crossline" alt="crossline" />
            </li>
            <li v-if="isFolderSprint">
                <div class="task_detail_navbar">
                    <span 
                        class="cursor-pointer"
                        @click="$emit('open', 'folder')"
                    >
                        <img
                            class="task_detail_navbar_folder_img"
                            src="@/assets/images/folder.png"
                        >
                        {{ folderName }}
                    </span>
                </div>
                <!-- <img
                    class="task_detail_navbar_img"
                    src="@/assets/images/svg/breadcrum.svg"
                    alt="breadcrum"
                > -->
                <img :src="crossline" alt="crossline" />
            </li>
            <li>
                <span 
                    class="task_detail_navbar cursor-pointer"
                    :title="sprintName"
                    @click="$emit('open', 'sprint')"
                >
                    {{ sprintName }}
                </span>
                <!-- <img
                    class="task_detail_navbar_img"
                    src="@/assets/images/svg/breadcrum.svg"
                    alt="breadcrum"
                > -->
                <img :src="crossline" alt="crossline" />
            </li>
            <li v-if="isParent">
                <span 
                    class="task_detail_navbar"
                    :title="taskKey"
                >
                    {{ taskKey }}
                </span>
            </li>
            <li v-if="!isParent">
                <span
                    class="task_detail_navbar cursor-pointer"
                    :title="parentKey"
                    @click="$emit('open', 'parent')"
                >
                    {{ parentKey }}
                </span>
                <!-- <img
                    class="task_detail_navbar_img"
                    src="@/assets/images/svg/breadcrum.svg"
                    alt="breadcrum"
                > -->
                <img :src="crossline" alt="crossline" />
                <span
                    class="task_detail_navbar"
                    :title="taskKey"
                >
                    {{ taskKey }}
                </span>
            </li>
        </ul>
    </div>
</template>

<script setup>
    import { defineProps, defineEmits } from 'vue';
    defineEmits(["open"])
// IMAGES
const crossline = require("@/assets/images/svg/crossline.svg");
    defineProps({
        taskKey: {
            type: String,
            required: true
        },
        isParent: {
            type: Boolean,
            required: true
        },
        parentKey: {
            type: String,
            required: false
        },
        sprintName: {
            type: String,
            required: false
        },
        isFolderSprint: {
            type: Boolean,
            required: true
        },
        folderName: {
            type: String,
            required: false
        },
        projectName: {
            type: String,
            default: ''
        }
    });
</script>

<style src="./style.css"></style>