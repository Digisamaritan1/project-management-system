<template>
    <template v-if="activeTab === 'links'">
        <div v-if="props.taskObj?.description">
            <template v-if="linkify(props.taskObj.description,'project') && linkify(props.taskObj.description,'project').length">
                <template v-for="(descriptionLink,descIndex) in linkify(props.taskObj.description,'project')" :key="descIndex">
                    <div class="advancefilter__body--list d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center advancefilter__body--list--left">
                            <div>
                                <img :src="linkImage" alt="link">
                            </div>
                            <div class="advancefilter__body--projectname">
                                <div v-if="findParticularProject(props.taskObj._id)">
                                    <span class="advancefilter__body--taskstatus gray81" v-if="findParticularProject(props.taskObj._id)?.ProjectName">
                                        {{findParticularProject(props.taskObj._id).ProjectName}}
                                    </span>
                                </div>
                                <div>
                                    <a class="advancefilter__body--taskname black text-ellipse d-block advancefilter__body--width" :href="descriptionLink" target="blank">{{descriptionLink}}</a>
                                </div>
                            </div>
                        </div>
                        <div class="advancefilter__body--list--right">
                            <ul class="advancefilter__body--ul">
                                <li class="cursor-pointer advancefilter__body--newtab" @click="openInNewTabProject(props.taskObj)">
                                    <img :src="imgOpenNewTab" alt="Copy Link"/>
                                </li>
                                <li class="cursor-pointer" @click="copyLinkProject(props.taskObj)">
                                    <img :src="imgCopyLink" alt="Copy Link"/>
                                </li>
                            </ul>
                        </div>
                    </div>
                </template>
            </template>
        </div>
        <div v-if="props.taskObj?.taskLink && props.taskObj?.taskLink?.length">
            <template v-for="(obj,index) in Array.from(new Set(props.taskObj?.taskLink))" :key="index">
                <template v-if="linkify(obj.rawDescription) && linkify(obj.rawDescription).length">
                    <template v-for="(descriptionLink,descIndex) in linkify(obj.rawDescription)" :key="descIndex">
                        <div class="advancefilter__body--list d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center advancefilter__body--list--left">
                                <div>
                                    <img :src="linkImage" alt="link">
                                </div>
                                <div class="advancefilter__body--projectname">
                                    <div v-if="findParticularProject(props.taskObj._id)">
                                        <span class="advancefilter__body--taskstatus gray81" v-if="findParticularProject(props.taskObj._id).sprintsfolders && findParticularProject(props.taskObj._id).sprintsfolders[obj.folderId ? obj.folderId : '']?.name">
                                            {{findParticularProject(props.taskObj._id).ProjectName}} /
                                            <img src="@/assets/images/folder.png" /> 
                                            {{findParticularProject(props.taskObj._id).sprintsfolders[obj.folderId ? obj.folderId : '']?.name}}
                                            / {{findParticularProject(props.taskObj._id).sprintsfolders[obj.folderId ? obj.folderId : '']?.sprintsObj[obj.sprintId ? obj.sprintId : '']?.name}}
                                        </span>
                                        <span class="advancefilter__body--taskstatus gray81" v-else-if="findParticularProject(props.taskObj._id).sprintsObj[obj.sprintId]?.name">
                                            {{findParticularProject(props.taskObj._id).ProjectName}} / 
                                            {{findParticularProject(props.taskObj._id).sprintsObj[obj.sprintId ? obj.sprintId : '']?.name}}
                                        </span>
                                    </div>
                                    <div>
                                        <a class="advancefilter__body--taskname black text-ellipse d-block advancefilter__body--width" :href="descriptionLink" target="blank">{{descriptionLink}}</a>
                                    </div>
                                </div>
                            </div>
                            <div class="advancefilter__body--list--right">
                                <ul class="advancefilter__body--ul">
                                    <li class="cursor-pointer advancefilter__body--newtab" @click="openModel(obj,'task')">
                                        <img :src="imgOpenSameTab" alt="Copy Link"/>
                                    </li>
                                    <li class="cursor-pointer advancefilter__body--newtab" @click="openInNewTab(obj)">
                                        <img :src="imgOpenNewTab" alt="Copy Link"/>
                                    </li>
                                    <li class="cursor-pointer" @click="copyLink(obj)">
                                        <img :src="imgCopyLink" alt="Copy Link"/>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </template>
                </template>
            </template>
        </div>
        <div v-if="props.taskObj?.commentsLink && props.taskObj?.commentsLink?.length">
            <template v-for="(obj,index) in Array.from(new Set(props.taskObj?.commentsLink))" :key="index">
                <template v-if="linkify(obj.message) && linkify(obj.message).length">
                    <template v-for="(descriptionLink,descIndex) in linkify(obj.message)" :key="descIndex">
                        <div class="advancefilter__body--list d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center advancefilter__body--list--left">
                                <div>
                                    <img :src="linkImage" alt="link">
                                </div>
                                <div class="advancefilter__body--projectname">
                                    <div v-if="findParticularProject(props.taskObj._id)">
                                        <div v-if="obj?.project === true" class="text-ellipse text-ellipse-responsive">
                                            <span class="advancefilter__body--taskstatus gray81">
                                                {{findParticularProject(props.taskObj._id)?.ProjectName}}
                                            </span>
                                        </div>
                                        <div v-else class="text-ellipse text-ellipse-responsive">
                                            <span class="advancefilter__body--taskstatus gray81" v-if="findParticularProject(props.taskObj._id).sprintsObj[obj.sprintId]?.name">
                                                {{findParticularProject(props.taskObj._id).ProjectName}} / 
                                                {{findParticularProject(props.taskObj._id).sprintsObj[obj.sprintId ? obj.sprintId : '']?.name}}
                                            </span>
                                            <span class="advancefilter__body--taskstatus gray81" v-if="!findParticularProject(props.taskObj._id).sprintsObj[obj.sprintId]?.name">
                                                {{findParticularProject(props.taskObj._id).ProjectName}} /
                                                <template v-for="(folder,folderIndex) in findParticularProject(props.taskObj._id).sprintsfolders" :key="folderIndex">
                                                    <span v-if="folder.sprintsObj[obj.sprintId]?.name">
                                                        <img src="@/assets/images/folder.png" /> {{folder.name}} / 
                                                    </span>
                                                    {{folder.sprintsObj[obj.sprintId]?.name}}
                                                </template>
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <a class="advancefilter__body--taskname black text-ellipse d-block advancefilter__body--width" :href="descriptionLink" target="blank">{{descriptionLink}}</a>
                                    </div>
                                </div>
                            </div>
                            <div class="advancefilter__body--list--right">
                                <ul class="advancefilter__body--ul">
                                    <li class="cursor-pointer advancefilter__body--newtab" v-if="obj.project === false" @click="openModel(obj,'comment')">
                                        <img :src="imgOpenSameTab" alt="Copy Link"/>
                                    </li>
                                    <li class="cursor-pointer advancefilter__body--newtab" @click="openInNewTabComments(obj)">
                                        <img :src="imgOpenNewTab" alt="Copy Link"/>
                                    </li>
                                    <li class="cursor-pointer" @click="copyLinkComments(obj)">
                                        <img :src="imgCopyLink" alt="Copy Link"/>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </template>
                </template>
            </template>
        </div>
        <div v-if="props.searchResultsLength === props.index + 1 && props.activeTab === 'links'">
            <div v-if="!props.searchResults.filter((x) => {return x?.description?.length || x?.taskLink?.length || x?.commentsLink?.length})?.length" class="nodata">{{$t('Filters.no_link_found')}}</div>
        </div>
    </template>
    <TaskDetail
        v-if="isTaskDetail"
        :companyId="companyId"
        :projectId="projectId"
        :sprintId="sprintId"
        :taskId="taskId"
        :isTaskDetailSideBar="isTaskDetail"
        @toggleTaskDetail="toggleTaskDetail"
        :zIndex='9'
    />
</template>

<script setup>
    import { defineProps,inject,nextTick,provide,ref } from 'vue';
    import { useToast } from 'vue-toast-notification';
    import TaskDetail from '@/views/TaskDetail/TaskDetail.vue'
    import {filterFun} from '@/components/molecules/AdvanceSearch/helper';
    import { useRoute, useRouter } from 'vue-router';
    const { generateTaskURL } = filterFun();
    const $toast = useToast();
    import { useI18n } from "vue-i18n";
    const { t } = useI18n();
    // inject
    const companyId = inject("$companyId");
    const urlRegex = inject("$urlRegex");
    const isTaskDetail = ref(false);
    const allLinkResult = ref([]);
    const projectId = ref('');
    const sprintId = ref('');
    const taskId = ref('');
    const router = useRouter();
    const route = useRoute();
    
    // Image
    const imgCopyLink = require('@/assets/images/png/task_copy_link.png');
    const imgOpenNewTab = require('@/assets/images/png/task_open_new_tab.png');
    const linkImage = require('@/assets/images/svg/link_image_svg.svg');
    const imgOpenSameTab = require('@/assets/images/svg/entertoopen.svg');

    // props
    const props = defineProps({
        taskObj : {type:Object,required:true},
        activeTab:{type:String,default:'all'},
        searchResultsLength:{type:Number,default:0},
        index:{type:Number,default:0},
        searchResults:{type:Array,required:true},
        allProjectsArray:{type:Array,required:true},
    });
    const openModel = (task,action) => {
        isTaskDetail.value = true;
        if(action === 'task'){
            projectId.value = task.ProjectID;
            sprintId.value = task.sprintId;
            taskId.value = task._id;
        }else{
            projectId.value = task.projectId;
            sprintId.value = task.sprintId;
            taskId.value = task.taskId;
        }
    };
    // This function is use to copy link of selected task
    const copyLink = (task) => {
        generateTaskURL(task,companyId.value,'links').then((url)=>{
            navigator.clipboard.writeText(url);
            $toast.success(t("Toast.Link_is_Copied_to_clipboard"),{position: 'top-right'});
        });
    };
    const openInNewTabProject = (project) => {
        generateProjectURL(project).then((url)=>{
            window.open(url, '_blank');
        });  
    };
    const copyLinkProject = (project) => {
        generateProjectURL(project).then((url)=>{
            navigator.clipboard.writeText(url);
            $toast.success(t("Toast.Link_is_Copied_to_clipboard"),{position: 'top-right'});
        });
    };
    // Open task in new tab
    const openInNewTab = (task) => {
        generateTaskURL(task,companyId.value,'links').then((url)=>{
            window.open(url, '_blank');
        });  
    };
    // This functions is used for the filter all links from the description or comments
    const linkify = (str,action) => {
        let stringCovert = str
        if(action){
            stringCovert = str.replace(/<[^>]*>/g, "")
        }
        let string = stringCovert;
        let result = [];
        try {
            if (str != '' && str != undefined) {
                //eslint-disable-next-line
                result = string.match(urlRegex.value);
            }
            if(result && result.length){
                allLinkResult.value.push(result);
            }
            return [...new Set(result)];
        } catch (error) {
            console.error(error);
            return result;
        }
    };

    const findParticularProject = (id) => {
        if(props.allProjectsArray && props.allProjectsArray.length && id){
            return props.allProjectsArray.find((xt) => xt._id === id)
        }else{
            return []
        }
    };
    const generateProjectURL = (obj) => {
        try {
            return new Promise((resolve, reject) => {
                try{
                    let path = null;
                    let navigation = `${window.location.origin}/#`;
                    path = `${navigation}/${companyId.value}/project/${obj._id}/p?tab=ProjectDetail`
                    resolve(path);
                } catch (e) {
                    reject(e)
                    console.error(e);
                }
            });
        }catch (e) {
            console.error(e);
        }
    };
    const openInNewTabComments = (task) => {
        let url = generateCommentURL(task);
        window.open(url, '_blank');
    };

    // This function is use to copy link of selected comments
    const copyLinkComments = (task) => {
        let url = generateCommentURL(task);
        navigator.clipboard.writeText(url);
        $toast.success(t("Toast.Link_is_Copied_to_clipboard"),{position: 'top-right'});
    };

    const toggleTaskDetail = (task,close=false) => {
        isTaskDetail.value = false;
        if(close == true) {
            router.push({...route,query: {}})
            return;
        }
        projectId.value = '';
        sprintId.value = '';
        taskId.value = '';
        nextTick(()=>{
            router.push({...route,query: {detailTab: "task-detail-tab"}})
            openModel(task,'task');
        })
    }
    provide('toggleTaskDetail', toggleTaskDetail);
    provide('isSupport', ref(false));
    provide('isRouteRequired', false);
    provide('showArchived', ref(false));

    const generateCommentURL = (obj) => {
        let path = null;
        let navigation = `${window.location.origin}/#`;

        if(obj.project === true){
            path = `${navigation}/${companyId.value}/project/${obj.projectId}/p?tab=Comments`
        }else{
            if(findParticularProject(obj.projectId).sprintsObj[obj.sprintId]?.name){
                path = `${navigation}/${companyId.value}/project/${obj.projectId}/s/${obj.sprintId}/${obj.taskId}?detailTab=comment`
            }else{
                let folderIndexVar = ''
                for (let folder in  findParticularProject(obj.projectId).sprintsfolders) {
                    if(findParticularProject(obj.projectId).sprintsfolders[folder].sprintsObj[obj.sprintId]?.name){
                        folderIndexVar = folder
                        break;
                    }else{
                        folderIndexVar = ''
                    }
                }
                path = `${navigation}/${companyId.value}/project/${obj.projectId}/fs/${folderIndexVar}/${obj.sprintId}/${obj.taskId}?detailTab=comment`;
            }
        }
        return path;
    };
</script>
