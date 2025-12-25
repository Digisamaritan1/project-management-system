<template>
    <div :class="`overflow-auto custom_field_content style-scroll ${pageIndex === 1 ? 'custom_field_content_field' : ''}`">
        <template v-if="pageIndex === 0">
            <div v-for="(item,index) in CustomFieldData" :key="index" @click="pageIndex= pageIndex+1,componentDetail=item">
                <CustomFieldComponentStructure
                    :cfTitle="item.cfTitle"
                    :cfDescrption="item.cfDescrption"
                    :cfIcon="item.cfIcon"
                    :cfPrimaryColor="item.cfPrimaryColor"
                />
            </div>
        </template>
        <div v-else-if="pageIndex === 1">
            <div v-if="currentCompany?.planFeature?.customFields">
                <div>
                    <CustomFieldComponentStructure
                        :cfTitle="componentDetail.cfTitle"
                        :cfDescrption="componentDetail.cfDescrption"
                        :cfIcon="componentDetail.cfIcon"
                        :cfPrimaryColor="componentDetail.cfPrimaryColor"
                    />
                </div>
                <div class="ml-20px mr-20px">
                    <CustomFieldsTabComponent
                        :tabIndexComp="tabIndex"
                        :componentDetail="componentDetail"
                        @handleIndex="(val) => tabIndex = val"
                    />
                    <CustomFieldsComponent
                        :tabIndex='tabIndex'
                        :componentDetail="componentDetail"
                        :customFieldObject="props.customFieldObject"
                        @handleFunction="customFieldStore"
                        @tabIndexUpdate="(val) => tabIndex = val"
                        @closeSidebar="(val) => {emit('closeSidebar',val,pageIndex);pageIndex = pageIndex-1;tabIndex = 1;}"
                        :isType="isType"
                    />
                </div>
            </div>
            <div v-else>
                <UpgradePlan
                    :buttonText="$t('Upgrades.upgrade_your_plan')"
                    :lastTitle="$t('Upgrades.to_unlock_custom_field')"
                    :secondTitle="$t('Upgrades.unlimited')"
                    :firstTitle="$t('Upgrades.upgrade_to')"
                    :message="$t('Upgrades.the_feature_not_available')"
                />
            </div>
        </div>
    </div>
</template>
<script setup>
    // import
    import { useStore } from 'vuex';
    import { ref,computed } from "vue";
    
    
    import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';
    import CustomFieldsComponent from "../../molecules/customFieldSidebar/customFieldsComponent/customFieldsComponent.vue";
    import CustomFieldsTabComponent from "../../atom/customFieldSidebar/customFieldsTabComponent/customFieldsTabComponent.vue"
    import CustomFieldComponentStructure from "../../atom/customFieldSidebar/customFieldComponentStructure/customFieldComponentStructure.vue";
    // store
    const {getters} = useStore();
    //props
    const props = defineProps({
        componentDetails:{
            type:Object,
            default:() => {}
        },
        pageInd:{
            type:Number,
            default:0
        },
        customFieldObject:{
            type:Object,
            default:() => {}
        },
        isType:{
            type:Boolean,
            default:false
        }
    });
    // ref
    const tabIndex = ref(1);
    const pageIndex = ref(props.pageInd);
    const componentDetail = ref(props.componentDetails);
    
    // computed
    const CustomFieldData = computed(() => getters["settings/customFields"]);
    const currentCompany = computed(() => getters["settings/selectedCompany"])
    // emit
    const emit = defineEmits(['customFieldStore','closeSidebar']);
    const customFieldStore = (val,isEdit) => {
        val.fieldPrimaryColor = componentDetail.value.cfPrimaryColor;
        val.fieldBackgroundColor = componentDetail.value.cfBackgroundColor;
        val.isDelete = true;
        emit('customFieldStore',val,isEdit);
    }
</script>
<style scoped>
    @import "./style.css";
</style>
