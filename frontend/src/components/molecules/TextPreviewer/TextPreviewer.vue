<template>
    <textarea v-model="fileContent" readonly rows="10" ref="textRef" class="previewer_sj style-scroll">
    </textarea>
</template>

<script setup>
import { onMounted, ref, defineProps, defineEmits, watch } from 'vue';
import { apiRequest } from '@/services';

const props = defineProps({
    url: {
        type: String,
        required: false
    }
})

const emits = defineEmits(["load", "error"]);

const fileContent = ref('');
const textRef = ref();

async function fetchFileContent(url) {
  if (url) {
    try {
      fileContent.value = '';
      const response = await apiRequest('get', url, {
        responseType: 'text',
      });

      const val = response.data?.trim?.() || '';
      fileContent.value = val;

      emits('load', val);
    } catch (error) {
      emits('error', error);
      console.error('Error fetching file:', error);
    }
  }
}

watch(() => props.url, (newUrl) => {
    fetchFileContent(newUrl);
});

onMounted(() => {
    fetchFileContent(props.url);
});
</script>

<style lang="css" scoped>
@import url("./style.css");
</style>