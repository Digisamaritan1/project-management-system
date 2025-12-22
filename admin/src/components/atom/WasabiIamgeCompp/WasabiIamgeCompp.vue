<template>
    <img :src="imgUrl" :title="data.title" :alt="data.filename ? data.filename : ''" :extension="data.extension" v-if="!loading" :style="style" :class="props.class" :userImage="userImage"/>
    <SkelatonVue v-else :style="style" :class="props.class"/>
</template>

<script setup>
    import { onMounted, defineProps, ref, defineEmits, watch } from 'vue';
    import * as env from '@/config/env';
    import isEqual from "lodash/isEqual"
    import SkelatonVue from '../Skelaton/Skelaton.vue';
    import { apiRequestWithoutCompnay } from '../../../services';
    import { storageQueryBuilder } from '@/utils/StorageOprations/StorageQueryBuilder';
    const props = defineProps({
        data: {
            type: Object,
            required: true,
        },
        class: {},
        companyId: {
            type: String,
            default: ""
        },
        style: {},
        thumbnail: {
            type: String,
            default: ""
        },
        userImage: {
            type: Boolean,
            default: false
        }
    });

    const emit = defineEmits(["downloadUrl"]);
    const imageObject = ref();
    const imgUrl = ref("");
    const loading = ref(false);
    const tuhumbnailSize = ref(props.thumbnail);
    onMounted(() => {
        imageObject.value = JSON.parse(JSON.stringify(props.data))
        getImage();
    })

    watch(() => props.data, (newVal, oldVal) => {
        if(!isEqual(newVal, oldVal) && env.STORAGETYPE && env.STORAGETYPE == 'server') {
            imageObject.value = JSON.parse(JSON.stringify(props.data))
            getImage();
        }
    })
    function getFileURl(filePath) {
        return new Promise((resolve,reject)=>{
            let bucketId = props.userImage ? "USER_PROFILES" : props.companyId;
            let path = '';
            if (tuhumbnailSize.value) {
                const lastDotIndex = filePath.lastIndexOf(".");
                const filename = filePath.substring(0, lastDotIndex);
                const extension = filePath.substring(lastDotIndex + 1);
                path = `${filename}-${tuhumbnailSize.value}.${extension}`;
            } else {
                path = filePath
            }

            let axiousObject = storageQueryBuilder('get',bucketId,path);

            apiRequestWithoutCompnay(axiousObject.method, axiousObject.route)
            .then((res)=>{
                resolve(res);
            }).catch((error) => {
                reject(error);
            });
        })
    }
    function getImage() {
        loading.value = true;
        const cid = props.companyId;
        if(env.STORAGETYPE && env.STORAGETYPE == 'server') {
            getFileURl(props.data.url).then((response)=>{
                imageObject.value.downloadUrl = response.data.url;
                emit("downloadUrl",response.data.url + "&download=true");
                imgUrl.value = response.data.url;
                loading.value = false;
            }).catch((err)=>{
                loading.value = false;
                console.error(err,"error in get image data");
            });
            return;
        }
        let path = ''
        if (tuhumbnailSize.value) {
            const [filename, extension] = props.data.url.split(".");
            path = `${filename}-${tuhumbnailSize.value}.${extension}`;
        } else {
            path = props.data.url
        }
        if (path && path.includes("base64")) {
            if(props.userImage){
                imgUrl.value = props.data.url;
                return loading.value = false
            }else{
                return loading.value = false;
            }
        }
        const formData = {
            companyId: cid,
            path: path
        }
        let url = props.userImage ? env.WASABI_RETRIVE_USER_PROFILE : env.ADMIN_WASABI_RETRIVE_OBJECT;
        apiRequestWithoutCompnay("post", url, formData).then((response)=>{
            if(response.data.status === true){
                imageObject.value.downloadUrl = response.data.statusText;
                emit("downloadUrl",response.data.statusText)
                imgUrl.value = response.data.statusText;
                loading.value = false;
            } else {
                loading.value = false;
            }
        }).catch((err)=>{
            loading.value = false;
            console.error(err,"error in get image data");
        })
    }
</script> 