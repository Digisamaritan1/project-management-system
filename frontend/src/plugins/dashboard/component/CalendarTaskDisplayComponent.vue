<template>
    <div class="d-flex align-items-center justify-content-between calendar__taskdisplay--wrapper mb-10px cursor-pointer" :style="[
            {'background':(allTaskStatusArray && allTaskStatusArray.settings.length) ? allTaskStatusArray.settings.find((ut)=> ut.key === taskValue.statusKey)?.bgColor : ''},
            {'borderColor':(allTaskStatusArray && allTaskStatusArray.settings.length) ? allTaskStatusArray.settings.find((ut)=> ut.key === taskValue.statusKey)?.textColor : ''}
        ]" @click.stop.prevent="openInNewTab(taskValue)">
        <div class="calendar__taskdisplay--left w-100">
            <div class="d-flex flex-column text-ellipsis">
                <div v-if="findParticularProject && Object.keys(findParticularProject).length" class="d-flex white align-items-center">
                    <span class="font-size-12 GunPowder text-ellipsis" v-if="taskValue?.folderArray">
                        {{findParticularProject.ProjectName}} /
                        {{taskValue?.folderArray.name}} 
                        / {{taskValue?.sprintArray?.name}}
                    </span>
                    <span class="font-size-12 GunPowder text-ellipsis" v-else-if="taskValue?.sprintArray?.name">
                        {{findParticularProject.ProjectName}} / 
                        {{taskValue?.sprintArray?.name}}
                        {{ taskValue.isParentTask == false ? `/ ${taskValue.parentTaskName}` : '' }}
                    </span>
                </div>
            </div>
            <div class="d-flex align-items-center text-ellipsis pt-6px" :title="taskValue.TaskName">
                <img :src="subtask" v-if="!taskValue.isParentTask" class="mr-10px">
                <span class="font-size-14 black font-weight-500 text-ellipsis">{{ taskValue.TaskName }}</span>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { defineProps, ref, computed,defineEmits } from "vue";
    const TaskStatusArray = computed(() => getters["settings/AllTaskStatus"]);
    import { useStore } from 'vuex';
    const { getters } = useStore();
    // props
    const props = defineProps({
        taskObject : {type:Object,required:true},
        findParticularProject: {type:Object,default: ()=>{}},
    });
    const emit = defineEmits([
        'openTaskDetailSidebar'
    ])
    const taskValue = ref(props.taskObject);
    const subtask = require ('@/assets/images/svg/subtaskicon.svg');
    const allTaskStatusArray = ref(JSON.parse(JSON.stringify(TaskStatusArray.value)));
    const openInNewTab = (task) => {
        emit('openTaskDetailSidebar',task)
    };
</script>
<style scoped src="../css/style.css"></style>