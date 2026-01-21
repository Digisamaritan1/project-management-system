<template>
    <div class="due-date" :id="tourId">
        <CalenderCompo
            v-model="dateValue"
            :hideExtraLayouts="['time' ,'minutes' , 'hours' , 'seconds']" 
            :isShowDateAndicon="isShowDateAndicon"
            menuClass="calender-menu-class-duedate"
            @update:model-value="($event) => {$emit('SelectedDate', {dateVal:$event, id:id})}"
            :autoposition="autoposition"
            :position="position"
            :overdue="overdue"
            :minDate="minDate"
            :maxDate="maxDate"
            :isWithoutBorderImage="isWithoutBorderImage"
            :format="format"
        >
        </CalenderCompo>
    </div>
</template>

<script setup>
//Import
import { ref, defineComponent, defineProps,defineEmits, watch } from 'vue';
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
    disabledDates: {
        type: Array,
        default: () => []
    },
    id: {
        type: String,
        default: ''
    },
    isShowDateAndicon: {
        type: Boolean,
        default: false
    },
    allowTillCurrentDate: {
        type: Boolean,
        default: false
    },
    autoposition: {
        type: Boolean,
        default: true
    },
    position: {
        type: String,
        default: ''
    },
    overdue: {
        type: Boolean,
        default: false
    },
    tourId: {
        type: String,
        default: ''
    },
    minDate: {
        type: [Date , String],
        default: ''
    },
    maxDate: {
        type: [Date, String],
        default: ''
    },
    isWithoutBorderImage: {
        type: Boolean,
        default: false
    },
    format: {
        type: String,
        default: ''
    },
})
const dateValue = ref(props.displyDate && props.displyDate != 0 ? props.displyDate?.seconds ? new Date(props.displyDate.seconds * 1000) : (props.displyDate) : '');

watch(() => props.displyDate, (newVal) => {
    dateValue.value = newVal && newVal != 0 ? newVal?.seconds ? new Date(newVal.seconds * 1000) : new Date(newVal) : '';
})

</script>
<style src="./style.css">
</style>