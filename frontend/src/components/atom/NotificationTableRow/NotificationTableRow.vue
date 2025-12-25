<template>
<div class="tr">
        <div class="td"> 
            <div class="d-flex dropdownvalues align-items-center">
                <div :title="t(`Notification.${Title}`)" class="section1-title text-ellipsis">
                     <span class="text-ellipsis">
                        {{ t(`Notification.${Title.replace("'","")}`)}}
                          <!-- {{ Title }} -->
                    </span>
                </div>
                <div class="dropdownvalue">
                    <SelectComp v-if="dropdown1"
                                        :name="AssignedSelectionuiqId"
                                        title=""
                                        displayKey="show"
                                        :modelValue="{show:d1Val ? d1Val['show'] :'' }"
                                        :options="dropdownitems1.map((x)=>({item:x.value,show:x.show}))"
                                        :enableSearch="false"
                                        :disabled="false"
                                        class="assign__selection-component"
                                        @update:modelValue="(e)=>{handleDropDown('notifyFor', e)}"
                                    />
                </div>
                <div class="dropdownvalue"> 
                    <SelectComp v-if="dropdown2"
                                :name="SelectionuiqId"
                                title=""
                                displayKey="show"
                                :modelValue="{show:d2Val ? d2Val['show'] :''}"
                                :options="Dropdownitems.map((x)=>({item:x.value,show:x.show}))"
                                :enableSearch="false"
                                :disabled="false"
                                class="assign__selection-component"
                                @update:modelValue="(e)=>{handleDropDown('duration', e)}"
                            />
                </div>
            </div>
            <div class="section2"><img @click="handlestate('mail')" :src='Email?truetick:falsetick'     alt="" class="cursor-pointer"></div>
            <div class="section3"><img @click="handlestate('browser')" :src='Browser?truetick:falsetick'  alt="" class="cursor-pointer"></div>
            <div class="section4"><img @click="handlestate('mobile')" :src='Mobile?truetick:falsetick'   alt="" class="cursor-pointer"></div>
        </div>
    </div>
</template>

<script setup>
import {ref,watchEffect} from 'vue'
import { useCustomComposable } from '@/composable';
const { makeUniqueId} = useCustomComposable();
const AssignedSelectionuiqId = `AssignedSelection${makeUniqueId(6)}`;
const SelectionuiqId = `AssignedSelection${makeUniqueId(6)}`;
import SelectComp from "@/components/molecules/Select/Select.vue"
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
    Title:
    {
    type: String,
    default:""
    },
    dropdown1:
    {
    type: Boolean,
    default:false
    },
    dropdown2:
    {
    type: Boolean,
    default:false
    },
    dropdown1Value:
    {
    type: String,
    },
    dropdown2Value:
    {
    type: String,
    },    
    Email:
    {
    type: Boolean,
    default:false
    },
    Browser:
    {
    type: Boolean,
    default:false
    },
    Mobile:
    {
    type: Boolean,
    default:false
    },
})
const Dropdownitems = ref([{value:"5_m",show:"5 minutes before"},
                           {value:"10_m",show:"10 minutes before"},
                           {value:"30_m",show:"30 minutes before"},
                           {value:"1_h",show:"1 hour before"},
                           {value:"2_h",show:"2 hour before"},
                           {value:"3_h",show:"3 hour before"},
                           {value:"4_h",show:"4 hour before"},
                           {value:"8_h",show:"8 hour before"},
                           {value:"12_h",show:"12 hour before"},
                           {value:"1_d",show:"1 day before"},
                           {value:"2_d",show:"2 days before"},
                           {value:"3_d",show:"3 days before"}
                        ])
const dropdownitems1=ref([{value:'all',show:'All'},{value:'assigned_to_me',show:'Assigned to me'}])
    const d1Val=ref('')
    const d2Val=ref('')

    watchEffect(()=>{
        d1Val.value =  dropdownitems1.value.filter((x)=> x.value == props.dropdown1Value)
        d2Val.value =  Dropdownitems.value.filter((x)=> x.value == props.dropdown2Value)
        d1Val.value = d1Val.value[0]
        d2Val.value = d2Val.value[0]
        
    })





const truetick = require("@/assets/images/svg/tick-true.svg")
const falsetick = require("@/assets/images/svg/tick-false.svg")

const emit = defineEmits(["mail",'browser','mobile', 'duration', 'notifyFor'])

const handlestate = (value) => {
    
    switch (value) {
        case "mail":
        emit('mail',!props.Email)
        return
        case "browser":
        emit('browser',!props.Browser)
        return
        case "mobile":
        emit('mobile',!props.Mobile)
        return
    }

}

const handleDropDown = (type,value) => {
    switch (type) {
        case 'duration':
            emit('duration',value.item)
            return ;
        case 'notifyFor':
            emit('notifyFor',value.item)
            return ;
    }
}
</script>
<style scoped>
@import "@/views/Settings/Notifications/style.css";

</style>