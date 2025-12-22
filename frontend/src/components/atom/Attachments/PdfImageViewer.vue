<template>
    <Modal v-model="showModal" :header="false" :footer="false" @close="$emit('closeModal'), showModal = false" :className="`modal_wrapper`">
        <template #body>
            <div v-if="props.data.type === 'image'">
                <div class="d-flex justify-content-between align-items-center app-header-wrapper">
                    <div class="d-flex justify-content-between align-items-center cursor-pointer">
                        <img src="@/assets/images/svg/arrow_left_wrapper.svg" alt="" @click.stop.prevent="$emit('closeModal'),showModal=false" />
                        <img class="ml-010" src="@/assets/images/image_name.png" alt="" />
                        <span class="ml-010 font-size-18 white">{{props.data.filename}}</span>
                    </div>
                    <div @click.stop.prevent="downloadAttachment(props.data)" class="d-block text-right cursor-pointer">
                        <img
                            src="@/assets/images/svg/download_bottom_wrapper.svg"
                            alt=""
                        />
                    </div>
                </div>
                <div class="d-flex justify-content-center align-items-center h-100vh">
                    <ImageIcon
                        v-if="props.data.url.includes('http')"
                        :src="props.data.url"
                        :alt="props.data.filename"
                        :extension="props.data.extension"
                    />
                    <WasabiIamgeCompp 
                        v-else
                        :data="props.data"
                        @downloadUrl="(eve) => {downloadurl(eve)}"
                        :thumbnail="thumbnail"
                    />
                </div>
            </div>
            <div v-if="props.data.type === 'video'">
                <div class="d-flex justify-content-between align-items-center app-header-wrapper">
                    <div class="d-flex justify-content-between align-items-center cursor-pointer">
                        <img src="@/assets/images/svg/arrow_left_wrapper.svg" alt="" @click.stop.prevent="$emit('closeModal'),showModal=false" />
                        <div class="ml-1 common__height-width">
                            <ImageIcon
                                src=""
                                alt=""
                                :extension="props.data.extension"
                            />
                        </div>
                        <span class="ml-010 font-size-18 white">{{props.data.filename}}</span>
                    </div>
                    <div @click.stop.prevent="downloadAttachment(props.data)" class="d-block text-right cursor-pointer">
                        <img
                            src="@/assets/images/svg/download_bottom_wrapper.svg"
                            alt=""
                        />
                    </div>
                </div>
                <div class="d-flex justify-content-center align-items-center h-100vh">
                    <video v-if="props.data.url.includes('http')" :src="props.data.url" class="w-80" controls></video>
                    <WasabiIamgeCompp 
                        v-else
                        :data="props.data"
                        @downloadUrl="(eve) => {downloadurl(eve)}"
                        :thumbnail="thumbnail"
                    />
                </div>
            </div>
            <div v-else-if="props.data.extension === 'pdf'">
                <div class="app-header-wrapper" :class="[{'d-flex justify-content-center align-items-center':isLoading}]" :style="[{'height': isLoading ? '100vh' : 'auto'}]">
                    <template v-if="isLoading">
                        {{$t('Auth.loading')}}
                    </template>
                    <template v-else>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="zoom_wrapper d-flex align-items-center justify-content-center" v-if="pageCount">
                                <div>
                                    <span class="total_wrapper" v-if="showAllPages">
                                        {{ pageCount }} page(s)
                                    </span>
                                    <span v-else>
                                        <button class="sideArrowWrapper" :class="[{'zoomDisable':page <= 1}]" :disabled="page <= 1" @click="page--">❮</button>
                                        <span class="total_wrapper">{{ page }} / {{ pageCount }}</span>
                                        <button class="sideArrowWrapper" :class="[{'zoomDisable':page >= pageCount}]" :disabled="page >= pageCount" @click="page++">❯</button>
                                    </span>
                                </div>
                                <div v-if="false" class="d-flex align-items-center">
                                    <button class="zoomInOutButton" @click="zoomIn()" :class="[{'zoomDisable':zoomLevel >= 1.4}]" :disabled="zoomLevel >= 1.4">+</button>
                                    <span class="zoomInAfter">/</span>
                                    <button class="zoomInOutButton" @click="zoomOut()" :class="[{'zoomDisable':zoomLevel <= 1}]" :disabled="zoomLevel <= 1">-</button>
                                </div>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="cursor-pointer d-flex justify-content-between align-items-center mr-10px">
                                    <img src="@/assets/images/svg/arrow_left_wrapper.svg" alt="" @click.stop.prevent="$emit('closeModal'),showModal=false" />
                                    <!-- <img class="ml-010" src="@/assets/images/pdf_name.png" alt="" /> -->
                                    <div class="bg-white border-radius-3-px ml-1 p-3px common__height-width">
                                        <ImageIcon
                                            src=""
                                            alt=""
                                            :extension="props.data.extension"
                                        />
                                    </div>
                                    <span class="ml-010 sort_name font-size-18 white">{{props.data.filename}}</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center justify-content-between">
                                <label class="d-flex align-items-center justify-content-between" v-if="clientWidth>480">
                                    <input class="mx-8px"  v-model="showAllPages" type="checkbox">
                                    <span class="d-block white">{{$t('Attachments.show_all_pages')}}</span>
                                </label>
                                <a class="cursor-pointer ml-10px" @click.stop.prevent="downloadAttachment(props.data)">
                                    <img src="@/assets/images/svg/download_bottom_wrapper.svg" alt="" />
                                </a>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="pdfProcess < 100" class="process-bar" :style="[{'width': pdfProcess > 100 ? '100%' : pdfProcess+'%'}]"></div>
                <div class="style-scroll overflow-auto">
                    <vue-pdf-embed ref="pdfRef" :style="zoomStyles" class="style-scroll" :source="props.data.downloadUrl ? props.data.downloadUrl: props.downloadValue" :page="page" @rendered="handleDocumentRender" annotation-layer @progress="handleDocumentProcess" />
                </div>
            </div>
            <div v-else>
                <div class="d-flex">
                    <div class="cursor-pointer d-flex justify-content-between align-items-center app-header-wrapper mr-10px">
                        <img src="@/assets/images/svg/arrow_left_wrapper.svg" alt="" @click.stop.prevent="$emit('closeModal'),showModal=false" />
                        <div class="bg-white border-radius-3-px ml-1 p-3px common__height-width">
                            <ImageIcon
                                src=""
                                alt=""
                                :extension="props.data.extension"
                            />
                        </div>
                        <!-- <img class="ml-010" src="@/assets/images/image_name.png" alt="" /> -->
                        <span class="ml-010 font-size-18 white">{{props.data.filename}}</span>
                    </div>
                </div>
                <div class="no_preview_found">
                    <div class="no_preview_background">
                        <span class="d-block white text-center">{{$t('Attachments.no_preview_found')}}</span>
                        <div>
                            <a class="link_wrapper cursor-pointer" @click.stop.prevent="downloadAttachment(props.data)">
                                <span class="white">{{$t('Billing.download')}}</span>
                                <img
                                src="@/assets/images/svg/download_bottom_wrapper.svg"
                                alt=""
                            />
                            </a>
                            <div v-show="false">
                                <ImageIcon
                                    v-if="props.data.url.includes('http')"
                                    :src="props.data.url"
                                    :alt="props.data.filename"
                                    :extension="props.data.extension"
                                />
                                <WasabiIamgeCompp 
                                    v-else
                                    :data="props.data"
                                    @downloadUrl="(eve) => {downloadurl(eve)}"
                                    :thumbnail="thumbnail"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup>
    import { ref, computed,watch,defineProps,inject,defineEmits, watchEffect, onMounted, onBeforeUnmount } from "vue";
    import { download } from "@/utils/StorageOprations/download";
    import WasabiIamgeCompp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
    import ImageIcon from "@/components/atom/ImageIcon/ImageIcon.vue";
    import Modal from "@/components/atom/Modal/Modal.vue";
    import VuePdfEmbed from 'vue-pdf-embed';
    import { storageHelper } from "@/composable/commonFunction";
    import * as env from '@/config/env';

    const {getStorageImage} = storageHelper();
    const companyId = inject("$companyId");

    // inject
    const clientWidth = inject("$clientWidth");
    const props = defineProps({
        data: {
            type: Object,
            default: () => {}
        },
        openModal:{
            type: Boolean,
            default:false
        },
        downloadValue:{
            type:String,
            default:''
        },
        thumbnail: {
            type:String,
            default:''
        }
    });
    // variable
    const pdfRef = ref();
    const pdfProcess = ref(0);
    const page= ref(null);
    const pageCount= ref(0);
    const zoomLevel = ref(1);
    const isLoading= ref(true);
    const showAllPages = ref(true);
    const showModal = ref(props.openModal);
    const itemData = ref(props.data)
    watchEffect(() => {
        itemData.value = props.data
    });
    watch(showAllPages,(value)=>{
        page.value = value ? null : 1
    });
    const emit = defineEmits(["closeModal"])

    function listenEsc(e) {
        if(e.keyCode === 27) {
            showModal.value = false;
            emit('closeModal')
        }
    }
    onMounted(() => {
        document.addEventListener('keyup', listenEsc)
    })
    onBeforeUnmount(() => {
        document.removeEventListener('keyup', listenEsc)
    })
    
    const zoomStyles = computed(() => {
        return {
            transform: `scaleX(${zoomLevel.value})`,
            maxHeight: `${900 * zoomLevel.value}px`, // Adjust max-height based on zoom level
            overflow: 'auto'
        }
    });
    const zoomIn = () => {
        if(zoomLevel.value <= 1.4){
            zoomLevel.value += 0.1;
        }
    };
    const zoomOut = () => {
        if (zoomLevel.value > 0.1) {
            zoomLevel.value -= 0.1;
        }
    };
    const handleDocumentRender = () => {
        pageCount.value = pdfRef.value.pageCount;
        pdfProcess.value = 0;
    };
    const handleDocumentProcess = (a) => {
        isLoading.value = false;
        pdfProcess.value = (100*a.loaded)/a.total;
    }
    const downloadAttachment = () => {
        if(env.STORAGE_TYPE && env.STORAGE_TYPE == 'server') {
            download(props.downloadValue, props.data.filename).catch((error) => {
                console.error('Error while downloading file.', error);
            });
            return;
        }
        getStorageImage({
            companyId: companyId.value,
            data: {
                url: props.data.url
            }
        })
        .then((res) => {
            download(res, props.data.filename).catch((error) => {
                console.error('Error while downloading file.', error);
            });
        })
        .catch((error) => {
            console.error("ERR: ", error);
        })
        // let url = downloadObj.url.includes('http') ? downloadObj.url : itemData.value.downloadUrl;
        // download(url, props.data.filename).catch((error) => {
        //     console.error('Error while downloading file.', error);
        // });
    };
    function downloadurl (e) {
        itemData.value.downloadUrl = e;
    }
</script>
<style scoped>
.common__height-width{
    width: 24px !important;
    height: 24px !important;
}
.process-bar {
    height: 4px;
    background: white;
}
</style>
