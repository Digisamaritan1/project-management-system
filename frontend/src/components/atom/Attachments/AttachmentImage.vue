<template>
    <div  @click="handleClick" class="attachment-display" :title="props.data.filename" :style="[{width : clientWidth>767 ? '131px' : '169px'}]" :id="data.id">
        <ul class="d-flex position-ab hover_icon-slider z-index-1">
            <li>
                <a @click.stop.prevent="downloadAttachment(data)">
                    <img
                        src="@/assets/images/download_attchment.png"
                        alt=""
                    />
                </a>
            </li>
            <li v-if="isDelete">
                <a @click.stop.prevent="$emit('delete')">
                    <img
                        src="@/assets/images/delete_attechment.png"
                        alt=""
                    />
                </a>
            </li>
        </ul>
        <ImageIcon
            v-if="props.data.url.includes('http')"
            :src="props.data.url"
            :alt="props.data.filename"
            :extension="props.data.extension"
            class="w-100"
            :style="[{height : clientWidth>767 ? '100px' : '120px',objectFit : 'contain'}]"
        />
        <WasabiIamgeCompp 
            v-else
            :data="data"
            class="attachment__image-height w-100"
            :style="[{height : clientWidth>767 ? '100px' : '120px'}]"
            :thumbnail="showThumbnails ? '130x93' : ''"
            @downloadUrl="(eve) => {downloadurl(eve)}"
        />
    </div>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
</template>

<script setup>
import WasabiIamgeCompp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue"
import { defineComponent, defineProps, defineEmits, ref, inject, onMounted} from "vue";
import { download } from "@/utils/StorageOprations/download";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import ImageIcon from "@/components/atom/ImageIcon/ImageIcon.vue"
import '@/components/atom/Attachments/styleAttachment.css';
import { storageHelper } from "@/composable/commonFunction";


const {handleStorageImageRequest} = storageHelper();
const companyId = inject("$companyId");
// import Pdf from 'vue-pdf';
defineComponent({
    name: "AttchmentSingleComponent"
});

const emit = defineEmits(["delete", "click"]);

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    isSpinner: {
        type: Boolean
    }
});
const clientWidth = inject("$clientWidth");
const itemData = ref(props.data);
const showThumbnails =ref(false)
const downloadValue = ref('');

onMounted(() => {
    const fixedDate = new Date(2024,6,9).getTime();
    const today = new Date().setHours(0,0,0,0);
    showThumbnails.value = props.data.type === 'image' ? today >= fixedDate : false;
})

const downloadAttachment = () => {
    handleStorageImageRequest({
        companyId: companyId.value,
        data: {
            url: props.data.url
        }
    })
    .then((res) => {
        download(res.url, props.data.filename).catch((error) => {
            console.error('Error while downloading file.', error);
        });
    })
    .catch((error) => {
        console.error("ERR: ", error);
    })
}

function downloadurl (e) {
    itemData.value.downloadUrl = e;
    downloadValue.value = e;
}
const handleClick = (event) => {
    event.stopPropagation();
    emit("click", props.data);
};
</script>
<style scoped>
.attachment-display {
    /* background-color: #e1dbdb; */
    margin-right: 10px;
    padding: 5px;
    border-radius: 6px;
    position: relative;
}
.attachment-display ul li {
    list-style: none;
    position: relative;
}
.attachment-display ul li img {
    background-color: #F4F5F7;
    height: 22px;
    border-radius: 2px;
    object-fit: contain;
    cursor: pointer;
}
.hover_icon-slider{
    gap: 5px;
    padding: 0;
    width: auto;
    right: 5px;
    top: 5px;
}
img.attachment__image-height {
    object-fit: contain;
}
@media(max-width: 767px){
    .attachment-display{  margin-right: 10px;padding: 0;width: 66px!important; 
        height: -webkit-fill-available;
    }
    img.attachment__image-height {
    object-fit: cover !important;
    border-radius: 8px;
}
}

</style>