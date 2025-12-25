<template>
    <audio :id="id" v-if="!loading" :src="imgUrl" :style="style" :class="props.class" :controls="controls" @play="$emit('play', $event)"/>
    <audio v-else :controls="controls" disabled />
</template>

<script setup>
    import { onMounted, defineProps, inject, ref, defineEmits, watch } from 'vue';
    import isEqual from "lodash/isEqual"
    import * as env from '@/config/env';
    import { apiRequest } from '../../../services';
    import { storageQueryBuilder } from '@/utils/storageQueryBuild';
    // eslint-disable-next-line
    const companyId = inject('$companyId');
    const props = defineProps({
        data: {
            required: true,
        },
        id: {},
        class: {},
        companyId: {
            type: String,
            default: ""
        },
        style: {},
        controls: {
            type: Boolean,
            default: true
        },
    });

    const emit = defineEmits(["downloadUrl", "play"]);

    const imgUrl = ref("");
    const loading = ref(false);

    onMounted(() => {
        getFile();
    })

    watch(() => props.data, (newVal, oldVal) => {
        if(!isEqual(newVal, oldVal)) {
            getFile();
        }
    })
    function getFileURl(filePath) {
        return new Promise((resolve,reject)=>{
            let bucketId = props.companyId?.length ? props.companyId : companyId.value;
            if(filePath?.startsWith('data:') == false) {
                let axiousObject = storageQueryBuilder('get',bucketId,filePath);
                apiRequest(axiousObject.method,axiousObject.route).then((res)=>{
                    resolve(res);
                }).catch((error) => {
                    reject(error);
                });
            }
        })
    }
    function getFile() {
        loading.value = true;
        if(env.STORAGE_TYPE && env.STORAGE_TYPE == 'server') {
            getFileURl(props.data).then((response)=>{
                emit("downloadUrl",response.data.url + "&download=true")
                imgUrl.value = response.data.url;
                loading.value = false;
            }).catch((err)=>{
                loading.value = false;
                console.error(err,"error in get image data");
            });
            return;
        }
        const cid = props.companyId?.length ? props.companyId : companyId.value;
        let path = props.data
        const formData = {
            companyId: cid,
            path: path
        }
        let url = env.WASABI_RETRIVE_OBJECT;
        apiRequest("post", url, formData).then((response)=>{
            if(response.data.status === true){
                imgUrl.value = response.data.statusText;
                loading.value = false;
                emit("downloadUrl",response.data.statusText)
            } else {
                loading.value = false;
            }
        }).catch((err)=>{
            loading.value = false;
            console.error(err,"error in get image data");
        })
    }
</script> 