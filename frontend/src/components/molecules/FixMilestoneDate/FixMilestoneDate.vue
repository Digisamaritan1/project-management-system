<template>
    <div :class="[{'milestone-date':InputDesign}]">
        <CalenderCompo
            v-model:model-value="dateValue"
            :hideExtraLayouts="['time' ,'minutes' , 'hours' , 'seconds']" 
            :highlightDisabledDate="true"
            :isShowDateAndicon="isShowDateAndicon"
            menuClass="calender-menu-class-duedate"
            :minDate="minDate"
            :maxDate="maxDate"
            :calenderImage="calenderImage"
            @update:model-value="($event) => {$emit('SelectedDate', {dateVal:$event, id:id})}"
            :startDateChanges="startDateChanges"
            :inputId="inputIdProps"
            :autoposition="autoposition"
            :position="position"
        >
        </CalenderCompo>
    </div>
</template>

<script setup>
//Import
import { ref, defineComponent, defineProps,defineEmits,watch } from 'vue';
import CalenderCompo from '@/components/atom/CalenderCompo/CalenderCompo.vue';

//Define Emits, Props, & Refs
defineComponent({
    components: { CalenderCompo }
})

defineEmits(['SelectedDate'])
const props = defineProps({
    displyDate: {
        required: true
    },
    id: {
        type: String,
        default: ''
    },
    isShowDateAndicon: {
        type: Boolean,
        default: false
    },
    minDate: {
        type: [Date , String],
        default: ''
    },
    maxDate: {
        type: [Date, String],
        default: ''
    },
    calenderImage: {
        type: Boolean,
        default: true
    },
    InputDesign: {
        type: Boolean,
        default: true
    },
    startDateChanges: {
        type: [Object, String],
        required:false
    },
    inputIdProps: {
        type: String,
        default: 'inputId'
    },
    autoposition: {
        type: Boolean,
        default: true
    },
    position: {
        type: String,
        default: ''
    }
})
const dateValue = ref(props.displyDate && props.displyDate != 0 ? props.displyDate?.seconds ? new Date(props.displyDate.seconds * 1000) : (props.displyDate) : '');
watch(() => props.displyDate, (newVal) => {
    dateValue.value = newVal && newVal != 0 ? newVal?.seconds ? new Date(newVal.seconds * 1000) : new Date(newVal) : '';
});
watch(() => props.startDateChanges, (newVal) => {
    if(newVal){
        dateValue.value = newVal && newVal != 0 ? newVal?.seconds ? new Date(newVal.seconds * 1000) : new Date(newVal) : '';
    }
});
</script>
<style>
</style>