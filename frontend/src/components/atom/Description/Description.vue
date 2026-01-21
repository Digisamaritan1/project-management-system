<template>
    <div class="description-wrapper">
        <div v-if="noDescription" class="description_componenet">
            <div class="bg-white border-radius-8-px mt-1 p-10px" :class="{'ml-10px mr-5-px': clientWidth < 767}">
                <button @click="noDescription = false" class="add_description_button">
                    {{$t('PlaceHolder.Add_description')}}
                </button>
            </div>
        </div>
        <div class="editor-container description_componenet" v-show="!noDescription">
            <div v-show="contentLoaded" id="editorjs" :class="{'ml-10px mr-10-px': clientWidth < 767, 'show_hide_class': !isShow}" @click="isShow = true"></div>
            <Transition>
                <span v-if="showMessage" class="saved_message">{{$t('Description.saved')}}</span>
            </Transition>
            <Skelaton class="w-100 border-radius-8-px" style="height: 60px;" v-if="!contentLoaded"/>
            <div v-show="false" id="editor-converter"></div>
            <div class="hide_show_wrapper" v-if="contentExceeds" :class="{'ml-10px mr-10-px': clientWidth < 767 }">
                <button v-if="!isShow" @click="isShow = true" class="hide_show">{{$t('Description.show_more')}}</button>
                <button v-else @click="isShow = false" class="hide_show">{{$t('Description.show_less')}}</button>
            </div>
            <div class="d-flex justify-content-start description-action mt-10px mb-15px description-padding">
                <!-- <button class="outline-primary mr-10px" @click="cancelData()">{{$t('Projects.cancel')}}</button> -->
                <button v-if="isChanged" class="btn-primary" @click="saveData()">{{$t('Projects.save')}}</button>
            </div>

            <PromptSidebar v-if="isOpenPromptDeatil" @closePrompt="isOpenPromptDeatil = false, resetAiBlocks()" :selectedPrompt="selectedPrompt" @closeMainSidebar="(e) => {isOpenPromptDeatil = false; e ? resetAiBlocks() : '';}" :project="project" :task="task" />
        </div>
    </div>
</template>

<script setup>
import { computed, defineComponent, inject, onMounted, provide, ref, watch } from 'vue';
import { useStore } from 'vuex';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from "vue-router";
import markdownit from 'markdown-it'
import { useToast } from 'vue-toast-notification';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const mardownInit = markdownit({
    html: true
})

import PromptSidebar from "@/components/molecules/PromptSidebar/PromptSidebar.vue"

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/nested-list';
import Checklist from '@editorjs/checklist';
import Marker from '@editorjs/marker';
import CodeTool from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import writeWithAi from './writeWithAi.js';

import { apiRequest } from '../../../services';
import * as env from '@/config/env';
import { useCustomComposable } from '@/composable';
import Skelaton from '@/components/atom/Skelaton/Skelaton.vue';
import taskClass from '@/utils/TaskOperations';


defineComponent({
    name: "DescriptionComponent"
});
const { getters, commit} = useStore();

const currentCompany = computed(() => getters["settings/selectedCompany"]);
const showMessage = ref(false);
const isOpenPromptDeatil = ref(false);
const selectedPrompt = ref({});
const blockIndex = ref(null)
const router = useRouter();
const route = useRoute();
const isShow = ref(false)
const noDescription = ref(false)
const contentExceeds = ref(false)
const tempBlock = ref([])
const isChanged = ref(false);

const contentLoaded = ref(false)

const { checkPermission,checkApps, debounce } = useCustomComposable();

const props = defineProps({
    description: {
        type: [String, Object],
        default: () => {}
    },
    editPermission: {
        type: [Boolean, Number],
        default: false
    },
    minlength: {
        type: Number,
        default: 0
    },
    isShowAi: {
        type: Boolean,
        default: false
    },
    projectData: {
        type: Object,
        default: () => {}
    },
    from: {
        type: String,
        default:''
    },
    task: {
        type: Object,
        default: () => {}
    },
    isMainSpinner: {
        type: Boolean,
        default: false
    }
});

const companyId = inject('$companyId');
const project = inject("selectedProject");
const clientWidth = inject('$clientWidth');

const checkAiProject = computed(() => checkApps('AI',props.projectData));
const checkAiDescription = props.from === 'project' ? computed(() => checkPermission("project.project_description", props.projectData?.isGlobalPermission, {gettersVal: getters})) : computed(() => checkPermission("task.task_description", props.projectData?.isGlobalPermission, {gettersVal: getters}));

const editorTools = {
    WriteWithAi: {
        class:writeWithAi,
        config: {
            openSidebar : openDescriptionWithAi,
            isShowAi: checkAiProject.value && checkAiDescription.value
        },
    },
    header: {
        class: Header,
        inlineToolbar: true
    },
    list: {
        class: List,
        inlineToolbar: true
    },
    checklist: {
        class: Checklist,
        inlineToolbar: true
    },
    marker: {
        class: Marker,
        inlineToolbar: true
    },
    code: {
        class: CodeTool,
        inlineToolbar: true
    },
    inlineCode: {
        class: InlineCode,
        inlineToolbar: true
    },
    embed: {
        class: Embed,
        inlineToolbar: true
    },
    table: {
        class: Table,
        inlineToolbar: true
    }
}

const editor = ref();

const $toast = useToast();
const converter = ref();

onMounted(() => {
    if(props.isMainSpinner === false){
        initEditor();
    }
})

watch([() => route?.params?.taskId, () => route?.params?.id , () => route?.query?.detailTab], () => {
    if(route?.params?.taskId || route?.query?.detailTab === 'task-detail-tab'){
        return;
    }
    if(!props.description || (typeof props.description !== 'string' && !props.description.blocks?.length)) {
        noDescription.value = true;
    }
    else{
        noDescription.value = false;
    }
    contentLoaded.value = false;
    setTimeout(() => {
        renderDescription();
    },500)
})

watch(() => props.isMainSpinner, (newVal) => {
    if (newVal === false) {
        initEditor();
    }
}, {flush: 'post'});


function initEditor() {
    editor.value = new EditorJS({
        holder: 'editorjs',
        tools: {...editorTools},
        placeholder: t('Description.description_placeholder'),
        readOnly: !props.editPermission,
        onChange: debounce(() => {
            blockIndex.value = editor.value.blocks.getCurrentBlockIndex();
            try {
                editor.value.save().then((res) => {
                    if(JSON.stringify(props.description?.blocks) != JSON.stringify(res?.blocks)){
                        saveData();
                    }
                    if(res !== undefined && res){
                        tempBlock.value = res;
                    }
                    checkContentSize()
                })
            } catch (error) {
                console.error("ERROR in save: ", error);
            }
        }, 500),
        onReady(){
            document.querySelector('.codex-editor__redactor').style.paddingBottom = '10px';
            if(!props.description || (Array.isArray(props.description?.blocks) && !props.description.blocks.length)) {
                noDescription.value = true;
            } else if (typeof props.description === 'string' && props.description !== '') {
                noDescription.value = false;
            }
            setTimeout(() => {
                renderDescription()
            },500);
        }
    });
    converter.value = new EditorJS({
        holder: 'editor-converter',
        tools: {...editorTools},
        onChange() {
            converter.value.save().then((newBlocks) => {
                injectBlocks(newBlocks.blocks?.reverse() || [])
            }).catch((err) => {
                console.error(err,"Error in conver in to blocks");
            })
        },
    });
}

function checkContentSize() {
    contentLoaded.value = true;

    // CHECK IF SIZE EXCEEDS
    const minHeight = 350;
    setTimeout(() => {
        const editorConentHeight = document?.querySelector('.codex-editor')?.clientHeight;
        if(!editorConentHeight) return;
        contentExceeds.value = editorConentHeight > minHeight;

        // ADJUST BOTTOM PADDING DEPENDING ON CONTENT SIZE
        const editorTextArea = document.querySelector('.codex-editor__redactor');
        if(editorTextArea) {
            editorTextArea.style.minHeight= '215px';
            if(contentExceeds.value) {
                editorTextArea.style.paddingBottom = '0px';
            } else {
                editorTextArea.style.paddingBottom = '10px';
            }
        }
    })
}

watch(() => props.editPermission,() => {
    editor.value.readOnly.toggle(!props.editPermission)
})

function blocksToText(response = []) {
    let descText = "";
    response.forEach((x) => {
        switch(x.type) {
            case "paragraph":
                descText += x.data.text;
                break;
            case "header":
                descText += x.data.text;
                break;
            case "quote":
                descText += x.data.text + "\n";
                descText += x.data.caption;
                break;
            case "warning":
                descText += x.data.title + "\n";
                descText += x.data.message;
                break;
            case "code":
                descText += x.data.code;
                break;
            case "linkTool":
                descText += x.data.link;
                break;
            case "list":
                descText += x.data.items.join(", ");
                break;
            case "checklist":
                descText += x.data.items.map((x) => x.text).join(", ");
                break;
        }
        descText += "\n";
    })
    return descText;
}

const saveData = debounce(() => {
    editor.value.saver.save().then((response) => {
        response.blocks = response.blocks.filter((block) => block.type !== "WriteWithAi");
        if(response){
            let val = {blocks: response || {},text : blocksToText(response?.blocks)}

            if(props.from === 'task'){
                taskClass.updateDescription({
                    companyId: companyId.value,
                    task: props.task,
                    text: val
                }).then(() => {
                    highlightDescription()
                })
                .catch((error) => {
                    $toast.error(t('Toast.Description_not_updated'),{position: 'top-right'});
                    console.error("Error in updating Description: ", error);
                })
            }
            else{
                updateProjectDescription(val);
            }
        }
    });
})

function renderDescription(replace = false) {
    try {
        if(props.description){
            if(typeof props.description === 'string'){
                blockIndex.value = 1;
                injectDescription(props.description,replace);
            }else{
                editor.value?.render(props.description)
                .then(() => {
                    checkContentSize()
                });
                if(!Object.keys(tempBlock.value).length){
                    tempBlock.value = props.description;
                }
            }
        }else{
            let obj = {
                blocks: []
            }
            editor.value?.render(obj)
            .then(() => {
                checkContentSize()
            });
        }
    } catch (error) {
        console.error(error,"ERROR:");
    }
}

function openDescriptionWithAi () {
    if(!currentCompany.value?.planFeature?.aiPermission){
        Swal.fire({
            title: t('AI.please_upgrade_plan_to_use_ai'),
            text: t('AI.ai_available_on_paid_plans_upgrade_now'),
            icon: 'info',
            confirmButtonColor: '#28C76F',
            confirmButtonText: t('Header.upgrade_now'),
            showCloseButton:true    
        }).then((result) => {
            if (result.isConfirmed) {
                router.push({name: 'Upgrade', params: {cid: companyId.value}})
            }
        })
        return;
    }
    const data = {
        query: [{title : "Write a Description"}]
    };
    apiRequest("post",env.FINDONEPROMPTS,data).then((result)=>{
        if(result.data.status === true){
            selectedPrompt.value = result.data.statusText;
            isOpenPromptDeatil.value = true;
        }
    })
}

async function injectDescription(description = '') {
    try {
        description = description.replaceAll(/\\n/g, '\n');
        const htmlStr = mardownInit.render(description)
        await converter.value.blocks.renderFromHTML(htmlStr);
    } catch (error) {
        console.error(error,"error");
    }
}

async function injectBlocks (newBlocks) {
    const blocks = [...(tempBlock.value?.blocks || [])]

    newBlocks.forEach((block, index) => {
        blocks.splice(blockIndex.value-1, index === 0 ? 1 : 0, block);
    })
    await editor.value.render({...tempBlock.value, blocks})
    checkContentSize()
}

function resetAiBlocks() {
    document.querySelectorAll("[data-type=WW_AI]").forEach((x) => {
        const blockId = x?.parentElement?.parentElement?.dataset?.id
        const deleteIndex = editor.value.blocks.getBlockIndex(blockId)
        if(deleteIndex >= 0) {
            editor.value.blocks.delete(deleteIndex);
        }
    })
}

function highlightDescription() {
    showMessage.value = true;
    setTimeout(() => {
        showMessage.value = false;
    }, 1000);
}

async function updateProjectDescription (val) {
    let updateObject = {descriptionBlock: val.blocks}
    await apiRequest("put",`/api/v1/${env.PROJECTACTIONS}/${props.projectData._id}`,{updateObject: updateObject});
    highlightDescription();
    commit('projectData/projectLocalUpdate', {itemData:  {...props.projectData,...updateObject},projectId: props.projectData._id,key:'RemoveProject',subKey: '',userId: ''});
}


provide('injectDescription',injectDescription)

defineExpose({
    highlightDescription
})
</script>

<style src="./style.css">

</style>