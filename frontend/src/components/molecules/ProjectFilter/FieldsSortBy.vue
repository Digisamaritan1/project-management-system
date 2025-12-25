<template>
    <div class="fieldTable">
        <div class="mb-010 custom-filters-table" >
            <div class="d-flex align-items-center custom-filters-detailwrapper">
                <div class="mr-010 custom-filters-col filter-status-fieldwrapper sort-by-field-section">
                    <CustomDropDown :maxWidth="clientWidth > 767 ? '155px' : '100%'" :bodyClass="{'filter-status-dropdpown' : true}">
                        <template #head v-if="clientWidth <= 767">
                            <div class="d-flex align-items-center justify-content-between cancel-title-donewrapper">
                                <a href="#" class="mr-10px"  @click.stop.prevent="$refs.keyRefs.click(), inputName='', isInvalid=false" :class="{'font-size-16' : clientWidth <= 767 }" :style="{color : clientWidth <= 767 ? '#646464' : '#2F3990'}">{{$t('Projects.cancel')}}</a>
                                <h3 class="filter-dropdownmobile-title" :class="{'font-size-20 font-weight-500' : clientWidth <= 767 }" :style="{color : clientWidth <= 767 ? '#090A0A' : ''}">{{$t('Filters.filtering_field')}}</h3>
                                <span class="done" @click="$refs.keyRefs.click()">{{$t('Home.Done')}}</span>
                            </div>
                        </template>
                        <template #button>
                            <div ref="keyRefs" :class="{'font-size-13' : clientWidth > 767 , 'font-size-14' : clientWidth <= 767}" :style="{color : clientWidth > 767 ? '#818181' : '#B3B3B3' }" :title="`${$t('PlaceHolder.Select')}`">
                                {{ Object.keys(sortByField).length > 0 ? `${$t(`Projects.${sortByField.name}`)}` : `${$t('PlaceHolder.Select')}`}}
                            </div>
                        </template>
                        <template #options>
                            <div v-for="(option, i) in sortingField" :key="i" class="cursor-pointer filter-status-field" @click="$refs.keyRefs.click(), $emit('sortField', option)">
                                <span class="font-size-14 font-weight-400">{{ `${$t(`Projects.${option.name}`)}` }}</span>
                            </div>
                        </template>
                    </CustomDropDown>
                </div>
                <div class="mr-010 custom-filters-col filter-operator"  :class="{'show-arrow': comparisonsData.length > 1}">
                    <CustomDropDown :maxWidth="clientWidth <= 767 ? '100%' : '101px'" :bodyClass="{'filter-operation-dropdown' : true}">
                        <template #head v-if="clientWidth <= 767" >
                            <div class="d-flex align-items-center justify-content-between cancel-title-donewrapper">
                                <span class="cancel" @click="$refs.compRef.click()"> {{$t('Projects.save')}} </span>
                                <h3 class="filter-dropdownmobile-title">{{$t('Filters.filter_operator')}}</h3>
                                <span class="done" @click="$refs.compRef.click()">{{$t('Home.Done')}}</span>
                            </div>
                        </template>
                        <template #button>
                            <span ref="compRef" class="text-ellipsis d-block select-compRef" :class="{'font-size-13' : clientWidth > 767 , 'font-size-14' : clientWidth <= 767}" :style="{color : clientWidth > 767 ? '#818181' : '#B3B3B3' }" :title="`${$t('PlaceHolder.Select')}`">
                                {{ Object.keys(sortByOrder).length > 0  ? `${$t(`Filters.${sortByOrder.name}`)}` : `${$t('PlaceHolder.Select')}`}}
                            </span>
                        </template>
                        <template #options>
                            <div v-for="(option, i) in comparisonsData" :key="i" class="cursor-pointer filter-status-field" @click="$refs.compRef.click(), $emit('sortOrder', option)">
                                <span class="font-weight-400" :class="{'font-size-14' : clientWidth > 767 , 'font-size-16' : clientWidth <= 767}">{{ `${$t(`Filters.${option.name}`)}` }}</span>
                            </div>
                        </template>
                    </CustomDropDown>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Packages
import { inject, defineEmits, defineProps } from 'vue';

// Component
import CustomDropDown from '@/components/molecules/DropDown/CustomDropDown.vue';

// Emites
defineEmits(["sortField", "sortOrder"])

// Props
defineProps({
    sortByField: {
        type: Object,
        default: () => {}
    },
    sortByOrder: {
        type: Object,
        default: () => {}
    },
    comparisonsData: {
        type: Array,
        default: () => {}
    }
})

// Variables
const clientWidth = inject("$clientWidth");
const sortingField = [
    { name: 'Running_Time_Tracker', value: 'running_time_tracker'},
    { name: 'Comments_Counts', value: 'comments_count'},
    { name: 'Created_Date', value: 'created_at'},
    { name: 'Name', value: 'name'},
    { name: 'due_date', value: 'due_date'}
]

</script>

<style scoped>
.up-downarrow{
   right: 9px; 
   top: 9px;
}
.select-compRef{
    max-width: 76%;
}
.task__leader-img{
    margin: 1px 5px 0 3px; 
    border-radius: 50%; 
    width: 25px; 
    height: 25px; 
    object-fit: cover;
}
.tags__array{
    padding: 2px 5px;
}
.select__arrow{
   right: 10px;
}
.check__component-wrapper{
    line-height:12px;
}
.user__option-img{
    border-radius: 50%; 
    margin: 0px 5px; 
    width:25px; 
    height: 25px;
}
.tag_filter {
    max-width: 165px;
}
</style>