<template>
  <div class="trackertab_wrapper position-re">
    <div class="d-flex justify-content-between">
      <BreadCrumb :breadCrumbArray="breadCrumbArray" />
    </div>

    <div class="tracker-section">
      <div class="d-flex align-items-center justify-content-between table_search">
        <div class="form-group">
          <input type="text" class="customfield__form-control" placeholder="Search" v-model="search"
            @input="debouncedSearch" />
        </div>
        <button class="tracker_button" @click="addTracker">+ Add New Tracker</button>
      </div>

      <template v-if="trackers && trackers.length">
        <div v-if="trackers && trackers.length" class="custom-field__table-wrapper">
          <div class="tracker-table style-scroll w-full">
            <table border>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Version</th>
                  <th>Download Url</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in trackers" :key="index" :class="{ disable: !item.isDelete }">
                  <td>
                    <div class="d-flex align-items-center">

                      <span class="field__title text-capitalize cursor-pointer">{{
                        item.title }}</span>
                    </div>
                  </td>
                  <td class="text-ellipsis">
                    <span :title="item.description">
                      {{ item.description }}
                    </span>
                  </td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.version }}</td>
                  <td class="text-ellipsis">
                    <a class="downloadUrl" :title="item.downloadUrl" :href="item.downloadUrl">
                      {{ item.downloadUrl }}
                    </a>
                  </td>
                  <td>
                    <DropDown :id="uId">
                      <template #button>
                        <img :ref="uId" :src="dots" alt="dots" class="ml-20px" />
                      </template>
                      <template #options>
                        <DropDownOption @click="editTracker(item), $refs[uId][index].click()">
                          <div class="d-flex align-items-center justify-content-between">
                            <img :src="editIcon" />
                            <span class="ml-20-px">Edit</span>
                          </div>
                        </DropDownOption>
                        <DropDownOption @click="deleteTracker(item, true)" v-if="!item.isDisable">
                          <div class="d-flex align-items-center">
                            <img :src="loginDisable" />
                            <span class="ml-20-px">Delete</span>
                          </div>
                        </DropDownOption>
                      </template>
                    </DropDown>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="pagination-div">
          <div>
            <img v-if="currentPage !== 1" @click="previousPage()" :src="right_arrow" :disabled="currentPage === 1" />
            <img v-else :src="right_arrow_disable" />
          </div>
          <span v-for="page in visiblePages" :key="page" class="p0x-13px d-flex align-items-center">
            <button @click="goToPage(page)" class="cursor-pointer"
              :class="{ 'pagination-active-page': page === currentPage, 'pagination-page': page !== currentPage }">{{
                page
              }}</button>
          </span>
          <div>
            <img v-if="currentPage !== totalPages" @click="nextPage()" :disabled="currentPage === totalPages"
              :src="left_arrow" />
            <img v-else :disabled="currentPage === totalPages" :src="left_arrow_disable" />
          </div>
        </div>
      </template>

      <template v-else>
        <div v-if="!getSpinner" class="d-flex justify-content-center align-items-center flex-column no-data-found">
          <img :src="nodataFoundIcon" />
          <h3>No Data Found</h3>
        </div>
        <SpinnerComp :is-spinner="getSpinner" v-if="getSpinner" />
      </template>
    </div>

    <Sidebar v-if="isEdit || isAdd" width="1000px" top="0px" headClass="add_plan--header">
      <template #head-left>
        <div class="blue">
          <span class="font-weight-500">{{ `${isEdit ? 'Edit' : 'Add'} Tracker Details` }}</span>
        </div>
      </template>
      <template #head-right>
        <div>
          <button class="close_button mr-20px" @click="closeFunction">Close</button>
          <button v-if="!saveClick" class="save-button" @click="saveClickFun">{{ isEdit ? 'Edit' : 'Add' }}</button>
          <button v-else class="save-button btn-disabled" disabled>{{ isEdit ? 'Edit' : 'Add' }}</button>
        </div>
      </template>
      <template #body>
        <TrackerForm :modelValue="trackerData" @closeSidebar="isEdit = false, isAdd = false, saveClick = false"
          :isAdd="isEdit ? false : true" ref="childRef" @onSpinner="(event) => saveClick = event"
          @updatedData="(event) => updatedData(event)" @addUpdate="addUpdate" />
      </template>
    </Sidebar>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import Sidebar from '@/components/molecules/Sidebar/Sidebar';
import TrackerForm from '@/components/molecules/TrackerForm/TrackerForm.vue';
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';
import DropDown from '@/components/molecules/DropDown/DropDown.vue';
import { useCustomComposable } from "@/composable";
import BreadCrumb from '@/components/atom/BreadCrumb/BreadCrumb.vue';
import Swal from 'sweetalert2';
import * as env from '@/config/env';
import axios from 'axios';

const left_arrow = require('@/assets/images/svg/left_arrow.svg');
const right_arrow_disable = require('@/assets/images/svg/right_arrow_disable.svg');
const right_arrow = require('@/assets/images/svg/right_arrow.svg');
const left_arrow_disable = require('@/assets/images/svg/left_arrow_disable.svg');
const nodataFoundIcon = require("@/assets/images/svg/No-Search-Result.svg");
const dots = require('@/assets/images/svg/three_dots_line.svg');
const { makeUniqueId,debounce } = useCustomComposable();

const uId = `tracker${makeUniqueId(6)}`;
const isAdd = ref(false);
const isEdit = ref(false);
const trackers = ref([]);
const maxVisiblePages = ref(5);
const childRef = ref();
const trackerData = ref({
  title: '',
  description: '',
  type: '',
  version: '',
  downloadUrl: ''
});
const saveClick = ref(false);
const search = ref('');
const getSpinner = ref(false); // Spinner state
const currentPage = ref(1); // Current page number
const batchSize = ref(10); // Number of items per page
const totalPages = ref(0); // Total number of pages

const breadCrumbArray = [
  { name: 'Home', routeObj: { name: 'Home' }, isClickable: true },
  { name: 'Settings', routeObj: { name: '' }, isClickable: false },
  { name: 'Tracker Settings', routeObj: { name: 'Tracker Settings' }, isClickable: false },
]

onMounted(() => {
  getSpinner.value = true;
  fetchTrackerData();
});

const visiblePages = computed(() => {
  const startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages.value / 2));
  const endPage = Math.min(startPage + maxVisiblePages.value - 1, totalPages.value);
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
})


function fetchTrackerData() {


  const queryParams = new URLSearchParams({
    currentPage: currentPage.value,
    batchSize: batchSize.value,
    search: search.value || '', 
  }).toString();


  axios.get(`${env.API_URI + env.GET_TACKER}?${queryParams}`)
    .then(async (response) => {
      if (response.data && response.data.statusText) {
        let arrayData = response.data.data;

        trackers.value = arrayData;

        let metaData = response.data.metadata; 
        let totalRecords = metaData ? metaData.total : 0;
        totalPages.value = Math.ceil(totalRecords / batchSize.value);
        getSpinner.value = false;
      } else {
        console.error("No data found");
        getSpinner.value = false;
      }
    })
    .catch((error) => {
      console.error(`Error fetching tracker data: ${error}`); // Log the error
      getSpinner.value = false;
    });
}

function addTracker() {
  isAdd.value = true;
  trackerData.value = {
    title: '',
    description: '',
    type: '',
    version: '',
    downloadUrl: ''

  };
}

function closeFunction() {
  isEdit.value = false;
  isAdd.value = false;
}

function editTracker(item) {
  isEdit.value = true;
  trackerData.value = { ...item };
}
function saveClickFun() {
  childRef.value.saveTrackerData(isEdit.value);
}
function updatedData(event) {
  let fIndex = trackers.value.findIndex((x) => x._id === event._id);

  if (fIndex !== -1) {
    trackers.value[fIndex] = { ...trackers.value[fIndex], ...event };
  } else {
    console.error('Event not found:', event._id);
  }
}

const addUpdate = (event) => {
  let fIndex = trackers.value.findIndex((x) => x._id === event._id);

  if (fIndex !== -1) {
    trackers.value[fIndex] = { ...trackers.value[fIndex], ...event };
  } else {
    trackers.value.unshift(event);
  }
  
}


function handleSearch() {
  currentPage.value = 1;
  fetchTrackerData(); 
}
const debouncedSearch = debounce(handleSearch, 1000);
function deleteTracker(item) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You won\'t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      axios.delete(`${env.API_URI}${env.DELETE_TACKER}/${item._id}`)
        .then(async () => {
          // Remove the item from the local state (trackers.value)
          const index = trackers.value.findIndex((x) => x._id === item._id);
          if (index !== -1) {
            trackers.value.splice(index, 1); // Remove the item from the array
          }
           // Check if the current page is now empty
          if (trackers.value.length === 0 && currentPage.value > 1) {
            currentPage.value--; // Go back to the previous page
            fetchTrackerData(); 
          }
          Swal.fire(
            'Deleted!',
            'Your item has been deleted.',
            'success'
          );
        })
        .catch((error) => {
          console.error('Delete failed:', error.response ? error.response.data : error.message);
          Swal.fire(
            'Error!',
            'Failed to delete the item.',
            'error'
          );
        });
    }
  });
}


function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchTrackerData();
  }
}
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchTrackerData();
  }
}

function goToPage(page) {
  currentPage.value = page;
  fetchTrackerData();
}
</script>

<style src="./style.css"></style>