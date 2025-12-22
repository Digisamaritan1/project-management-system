<template lang="">
<div>
    <Sidebar v-if="isSidebar" width="607px" class="sidebar__height"  :closeOnBackDrop="true">
        <template #head>
            <div class="sidebarHeader d-flex justify-content-between">
                <h3 class="primaryColor">{{title}}</h3>
            </div>
</template>
<template #body>
    <div class="createCompanyform">
        <div class="d-flex justify-content-center">
        <!-- cropper -->
        <div class="bordergray-dashed border-radius-8-px d-flex align-items-center justify-content-center" v-if="!showCropper">
            <img :src="cropCloud" alt="cropCloud" style="width: 80px; height: 80px;" @click="fileSelect.click()"/>
        </div>
        <cropperComponent
            v-else
            :image="imageToCrop"
            :change="onChange"
            class="Cropper"
            :stencilSize="stencilSize"
            :stencilProps="stencilProps"
            @getCropper="(val) => cropperVal = val"
        />
    </div>
                <!-- footer section -->
    <div class="d-flex justify-content-between mt-4">
            <span class="d-flex cursor-pointer cloud" @click="changeImage()"><img :src="cropCloud" alt="cropCloud"/> &nbsp; Change Image </span>
            <div class="btn_block d-flex cancel_upload-wrapper justify-content-end">
                <button class="white_btn" type="button" @click="cancelUpload">Cancel</button>
                <button class="blue_btn upload__btn" type="button" @click="getImage">Upload</button>
            </div>
        </div>
    </div>
    </template>
</Sidebar>
<input type="file" id="cropping-input" ref="fileSelect" accept="image/png, image/jpg, image/jpeg"
    @input="(e)=>OnFileSelected(e)" hidden>
</div>
</template>
<script setup>
import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
import { onMounted, watch, ref } from 'vue';
import 'vue-advanced-cropper/dist/style.css';
import { useToast } from 'vue-toast-notification';
import cropperComponent from '../CropperComponent/cropperComponent.vue';

const cropCloud = require("@/assets/images/svg/crop-cloud.svg")
const $toast = useToast();
const fileSelect = ref(null)
const emit = defineEmits(['updateVisible', 'getEditedImage', 'callFunction'])
const imageName = ref('')
const isSidebar = ref(false)
const showCropper = ref(false)
const result = ref({ coordinates: null, image: null });
const imageToCrop = ref()
const fileSize = ref(0)
const cropperVal = ref(null);
const croppedImage = ref(null)

const props = defineProps({
    dropImage: {},
    isVisible: {
        type: Boolean
    },
    title: {
        type: String,
        default: ""
    },
    stencilSize: {
        type: Object
    },
    stencilProps: {
        type: Object,
        default: () => ({
            handlers: {},
            movable: false,
            resizable: false,
            aspectRatio: 1,
        })
    }
})

watch(() => props.isVisible, (newVal) => {

    if(newVal === false) {
        imageToCrop.value = null;
    }

})

const onChange = ({ coordinates, image }) => {
    let res = { coordinates, image };
    result.value = res;
};

const changeImage = () => {
    document.getElementById('cropping-input').click()
}

watch(() => props.dropImage, (newVal, oldVal) => {
    if(newVal != oldVal){
        OnFileSelected(null, newVal)
    }
})

const OnFileSelected = (event, droppedImage) => {
    let file;
    if(droppedImage){
        file = droppedImage;
    }else{
        file = event.target.files[0];
    }

    if(file == null){
        fileSelect.value = null;
        return
    }
    const extArray = ['jpg', 'png', 'jpeg', 'JPEG', 'svg'];
    const fileName = file.name.split(".")[file.name.split(".").length-1]
    imageName.value = file.name
    fileSize.value = file.size

    if(fileSize.value > 500000){
        $toast.error("file size is larger than 500kb!",{position: 'top-right'})
        fileSelect.value = null;
        file = null
        return
    }

    if(extArray.includes(fileName.toLowerCase())){
        showCropper.value = true;
        imageToCrop.value = URL.createObjectURL(file);
        isSidebar.value = true
        fileSelect.value = null;
    }
    else {
        $toast.error('Select image only and image file format should be jpg,jpeg,png,svg', { position: 'top-right' })
        fileSelect.value = null;
    }
    if(event?.target.value){
        event.target.value = null;
    }
    file = null;
};

const getImage = () => {
    const { canvas } = cropperVal.value.getResult();
    croppedImage.value = canvas.toDataURL();
    emit('getEditedImage', { url: croppedImage.value, fileName: imageName.value, base64Image: croppedImage.value });
    emit('updateVisible', true)
    isSidebar.value = false
};

onMounted(()=>{
    result.value ={coordinates: null, image: null}
})

const cancelUpload = () => {
    showCropper.value = false
    isSidebar.value = false;
    emit('updateVisible', isSidebar.value);
}

</script>
<style>
@import './style.css'
</style>