<template>
  <div class="create_tracker_wrapper">
    <form class="create_tracker_form">

      <!-- Title Field -->
      <div class="position-re create_tracker_row">
        <label class="font-size-14 font-weight-500 shade-black">
          Title <span class="redmark">*</span>
        </label>
        <div>
          <InputText v-model="formData.title" placeHolder="Enter Title" width="367px" @keyup="checkErrors({
            'field': trackerObj.trackerName,
            'name': trackerObj.trackerName.name,
            'validations': trackerObj.trackerName.rules,
          })" />
          <div class="red error">{{ trackerObj.trackerName.error }}</div>
        </div>
      </div>

      <!-- Type Field -->
      <div class="position-re create_tracker_row">
        <label class="font-size-14 font-weight-500 shade-black">
          Type <span class="redmark">*</span>
        </label>
        <div>
          <select v-model="formData.type" @change="checkErrors({
            'field': trackerObj.type,
            'name': trackerObj.type.name,
            'validations': trackerObj.type.rules,
          })" class="tempalteSelect form-control cursor-pointer">
            <option disabled value="" hidden>Select Type</option>
            <option value="Windows">Windows</option>
            <option value="Mac">Mac</option>
            <option value="Linux">Linux</option>
          </select>


          <div class="red error">{{ trackerObj.type.error }}</div>
        </div>
      </div>

      <!-- Version Field -->
      <div class="position-re create_tracker_row">
        <label class="font-size-14 font-weight-500 shade-black">
          Version <span class="redmark">*</span>
        </label>
        <div>
          <InputText v-model="formData.version" @keyup="checkErrors({
            'field': trackerObj.version,
            'name': trackerObj.version.name,
            'validations': trackerObj.version.rules,
          })" />
          <div class="red error">{{ trackerObj.version.error }}</div>
        </div>
      </div>

      <!-- Download URL Field -->
      <div class="position-re create_tracker_row">
        <label class="font-size-14 font-weight-500 shade-black">
          Download Url <span class="redmark">*</span>
        </label>
        <div>
          <InputText v-model="formData.downloadUrl" @keyup="checkErrors({
            'field': trackerObj.downloadUrl,
            'name': trackerObj.downloadUrl.name,
            'validations': trackerObj.downloadUrl.rules,
          })" />
          <div class="red error">{{ trackerObj.downloadUrl.error }}</div>
        </div>
      </div>

        <!-- Description Field -->
      <div class="position-re create_tracker_row">
        <label class="font-size-14 font-weight-500 shade-black">
          Description <span class="redmark">*</span>
        </label>
        <div>
          <InputTextarea v-model="formData.description" @keyup="checkErrors({
            'field': trackerObj.description,
            'name': trackerObj.description.name,
            'validations': trackerObj.description.rules,
          })"
          :style="{ height: 'unset' ,width:'unset'}"/>
          <div class="red error">{{ trackerObj.description.error }}</div>
        </div>
      </div>


    </form>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, computed } from 'vue';
import InputText from '@/components/atom/InputText/InputText.vue';
import { useValidation } from "@/composable/Validation.js";
import axios from 'axios';
import * as env from '@/config/env';
import { dbCollections } from "@/utils/collections";
import InputTextarea from '@/components/atom/InputTextarea/InputTextarea.vue';
import { useToast } from 'vue-toast-notification';
const $toast = useToast();
const props = defineProps({
  modelValue: Object,
});

const emit = defineEmits(['update:modelValue', 'save', 'closeSidebar']);
const { checkErrors, checkAllFields } = useValidation();

const formData = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

watch(() => props.modelValue, (newValue) => {
  formData.value = { ...newValue };
}, { deep: true });

watch(formData, (newFormData) => {
  emit('update:modelValue', newFormData);

  trackerObj.value.trackerName.value = newFormData.title;
  trackerObj.value.description.value = newFormData.description;
  trackerObj.value.type.value = newFormData.type;
  trackerObj.value.version.value = newFormData.version;
  trackerObj.value.downloadUrl.value = newFormData.downloadUrl;
}, { deep: true });

const trackerObj = ref({
  trackerName: {
    value: formData.value.title,
    rules: "required | min:3 |",
    name: "Title",
    error: "", // Should start as an empty string
  },
  description: {
    value: formData.value.description,
    rules: "",
    name: "Description",
    error: "",
  },
  type: {
    value: formData.value.type,
    rules: "required",
    name: "Type",
    error: "",
  },
  version: {
    value: formData.value.version,
    rules: "required | regex:v\\d+(\\.\\d+)?",
    name: "Version",
    error: "",
  },
  downloadUrl: {
    value: formData.value.downloadUrl,
    rules: "required|regex:/^https?:\\/\\/.*/",
    name: "Download URL",
    error: "",
  },
});

const saveTrackerData = (isEdit) => {
  checkAllFields(trackerObj.value).then((valid) => {
    if (valid) {
      const apiData = {
        title: formData.value.title,
        description: formData.value.description,
        type: formData.value.type,
        version: formData.value.version,
        downloadUrl: formData.value.downloadUrl,
      };

      let data = {
        type: dbCollections.TIMETRACKER_DOWNLOAD,
        data: isEdit
          ? [
            { _id: formData.value._id },
            { ...apiData },
          ]
          : apiData,
      };

      const axiosData = {
        dataObj: data.data,
      };

      const url = isEdit ? env.API_URI + env.UPDATE_TACKER : env.API_URI + env.SAVE_TACKER;
      const method = isEdit ? 'put' : 'post';

      // Use a single axios request
      axios({
        method: method,
        url: url,
        data: axiosData
      })
        .then(async (res) => {
          try {
            const successMessage = isEdit
              ? 'Tracker has been updated successfully.'
              : 'Tracker has been created successfully.';
            emit('closeSidebar', false); // Close the sidebar when save is successful
            emit('addUpdate', isEdit ? formData.value : res?.data?.data || {});
            $toast.success(successMessage, {
              position: 'top-right',
            });
          } catch (error) {
            console.error('Error in then block:', error);
          }
        })
        .catch((error) => {
          // Handle error here
          console.error(
            'Save failed:',
            error.response ? error.response.data : error.message
          );
          checkErrors(trackerObj.value); // Show errors if save fails
        });



    } else {
      console.error('Form is invalid');
      checkErrors(trackerObj.value); // Show validation errors if form is invalid
    }
  });
};


defineExpose({ saveTrackerData });
</script>

<style scoped src="./style.css"></style>
