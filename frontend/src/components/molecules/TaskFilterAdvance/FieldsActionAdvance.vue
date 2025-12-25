<template>
    <div class="position-fi wrapper_show_clear_result">
        <div class="section-wrapper-clear-all d-flex align-items-center cursor-pointer justify-content-between">
            <div>
                <a href="#"  class="font-size-16 font-weight-500 blue mr-10px" :class="[{'font-size-18':clientWidth <= 768}]" @click.stop.prevent="$emit('clear', $event)">{{$t('Filters.Clear_All')}}</a>
            </div>
            <div class="d-flex">
                <span class="text">
                    <DropDown :zIndex="props.zIndex" v-if="!isEdit" :bodyClass="{'save-thisfilters-dropdown' : true}">
                        <template #head>
                            <div class="d-flex align-items-center justify-content-between save__filtercancel-wrapper" v-if="clientWidth <= 767">
                                <h3 class="black">{{$t('Filters.save_this_filters')}}</h3>
                                <a href="#" class="mr-10px" @click.stop.prevent="$refs.saveFilterRef.click(), inputName='', isInvalid=false">{{$t('Projects.cancel')}}</a>
                                <!-- <button class="btn-primary" type="button" style="padding: 0px; background: transparent;" @click.stop.prevent="$emit('save', inputName), resetField()">{{$t("Projects.save")}}</button> -->
                            </div>
                        </template>
                        <template #button>
                            <span ref="saveFilterRef" class="font-size-12 font-weight-400" :class="[{'font-size-18':clientWidth <= 768}]">{{ $t('Filters.save_filters') }}</span>
                        </template>
                        <template #options>
                            <div class="savedfilter-input-wrapper">
                                <h5 class="font-weight-500 font-size-15"  v-if="clientWidth > 767">{{$t('Filters.Save_this_Filter')}}</h5>
                                <div class="hr__bottom" v-if="clientWidth > 767"></div>
                                <div class="savefilter-inputserach-wrapper">
                                    <InputText
                                        type="text"
                                        :maxLength="50"
                                        :minLength="3"
                                        v-model.trim="inputName"
                                        :placeHolder="$t('Filters.Enter_Filter_Name')"
                                        :isDirectFocus="true"
                                        :class="{'border-red': isInvalid}"
                                        autocomplete="off"
                                        @enter="$emit('save', inputName), resetField()"
                                    />
                                    <div class="d-flex align-items-center justify-content-end m10px-0px">
                                        <a href="#" class="mr-10px" @click.stop.prevent="$refs.saveFilterRef.click(), inputName='', isInvalid=false" v-if="clientWidth > 767">{{$t('Projects.cancel')}}</a>
                                        <button class="btn-primary save__btn" type="button"  @click.stop.prevent="$emit('save', inputName), resetField()" :style="[{height : clientWidth>767 ? '' : '40px',padding: clientWidth>767 ? '' : '8px 40px'}]">{{$t("Projects.save")}}</button>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </DropDown>
                    <span v-if="isEdit" @click="$emit('update', $event)" class="font-size-12 font-weight-400" :class="[{'font-size-18':clientWidth <= 768}]">Update filter</span>
                </span>
                <span class="drop-icon">
                    <DropDown :zIndex="props.zIndex" :bodyClass="{'update-searchfilter-dropdown' : true}">
                        <template #head>
                            <div class="d-flex align-items-center justify-content-between update__myfiltertitle-div" v-if="clientWidth <= 767">
                                <h3 class="black">{{$t('Filters.my_filter')}}</h3>
                                <a href="#" class="mr-10px blue" @click.stop.prevent="$refs.saveFilterRef.click(), inputName='', isInvalid=false">{{$t('Projects.cancel')}}</a>
                                <!-- <button class="btn-primary" type="button" @click.stop.prevent="$emit('save', inputName), resetField()">{{$t("Projects.save")}}</button> -->
                            </div>
                        </template>
                        <template #button>
                            <img ref="saveFilterRef" src="@/assets/images/svg/save_filter_fdropdown.svg" alt="" class="saveFilterDropArrow saveFilterImageDropDown"/>
                        </template>
                        <template #options>
                            <div class="saved-filters">
                                <div class="savefilter-inputserach-wrapper">
                                <InputText
                                    type="text"
                                    v-model.trim="search"
                                    :placeHolder="$t('PlaceHolder.search')"
                                    :isDirectFocus="true"
                                    autocomplete="off"
                                />
                                </div>
                                <div class="hr-bottom-mobile" v-if="clientWidth > 768">
                                    <h5 class="filter-list-title p0x-10px">{{$t('Filters.my_filter')}}</h5>
                                </div>
                                <div class="saved-filterdropdownlist-wrapper">
                                    <DropDownOption v-for="(item, index) in filteredOptions" :key="index" class="dropdown-item justify-content-between saved-filters-dropdown">
                                        <span class="saved-serach-title text-capitalize w-100" v-if="!item.isEdit"  @click="$emit('apply', {item: item, type: 'saved'})"
                                        >{{ item.name }}</span>
                                        <InputText v-if="item.isEdit" type="text" @enter="updateFilter(item)" v-model.trim="filterName" :isDirectFocus="true" autocomplete="off" :class="[{'border-red': isInvalid}]"/>
                                        <div v-if="item.isEdit" class="edit-delete-erapper">
                                            <img src="@/assets/images/svg/greencheck2.svg" alt="Edit" class="m0px-10px greencheck__img" @click="updateFilter(item)">
                                            <img src="@/assets/images/svg/deletered.svg" alt="Delete" @click="item.isEdit=false,isInvalid=false">
                                        </div>
                                        <div v-if="!item.isEdit" class="hover-action">
                                            <img src="@/assets/images/svg/edit_gray.svg" alt="Edit" class="mr-10px" @click="editFilter(item)">
                                            <img src="@/assets/images/svg/deletered.svg" alt="Delete" @click="$emit('delete', item)">
                                        </div>
                                    </DropDownOption>
                                    <div v-if="!filteredOptions.length" class="gray81 m11px-0px">{{$t('Filters.no_data_found')}}</div>
                                </div>
                            </div>
                        </template>
                    </DropDown>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
// Packages
import { ref, defineProps, defineEmits, computed, inject } from 'vue';

// Component
import InputText from '@/components/atom/InputText/InputText.vue';
import DropDown from '@/components/molecules/DropDown/DropDown.vue';
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';

// Emites
defineEmits(["apply", "save", "update", "delete", "clear"])

// Props
const props = defineProps({
    filters: {
        type: Array,
        default: () => []
    },
    isEdit: {
        type: Boolean,
        default: false
    },
    getFiltersData: {
        type: Function
    },
    handleUpdate: {
        type: Function
    },
    zIndex: {
        type: Number,
        default:7
    }
})

// Variables
const clientWidth = inject("$clientWidth");
const search = ref('');
const inputName = ref('');
const filterName = ref('');
const docId = ref('');
const saveFilterRef = ref('');
const isInvalid = ref(false);

/**
 * This function is used to filter data in already saved filter in the dropdown
 */
const filteredOptions = computed(() => {
    return props.filters.filter((item) => {
        return item.name.toLowerCase().includes(search.value.toLowerCase());
    })
})

/**
 * This function is used to handle edit filter name emit event
 */
const editFilter = (item) => {
    item.isEdit = true;
    filterName.value = item.name;
    docId.value = item._id;
}

/**
 * This function is used to update filter name
 */
const updateFilter = (item) => {
    if(filterName.value === '') {
        isInvalid.value = true;
        return;
    }
    isInvalid.value = false;
    item.isEdit = false;
    item.name = filterName.value;
    const obj = { name: filterName.value, id: docId.value}
    props.handleUpdate(obj).then(() => {
        props.getFiltersData()
    })
}

/**
 * Reset save input value and refs event emits after save
 */
const resetField = () => {
    if(inputName.value === "") {
        isInvalid.value = true;
        return;
    }
    saveFilterRef.value.click();
    inputName.value = "";
    isInvalid.value = false;
}
</script>
<style scoped src="./style.css"></style>