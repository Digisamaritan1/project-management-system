<template>
  <div class="no_record_found">
	<template v-if="!isSpinner && (rules && Object.keys(rules).length && companyUserDetail && Object.keys(companyUserDetail).length)">
		<div class="no_record_found">
			<template v-if="checkPermission('task.task_list',true) !== null">
				<ProjectListView :sprints="sprints" :grouped="0" :fromWhich="'support'" />
			</template>
			<div v-else class="d-flex align-items-center justify-content-center w-100 h-100">
				<img :src="accessDenied" alt="accessDenied">
			</div>
			<TaskDetail
			v-if="isTaskDetail"
			:companyId="companyId"
			:projectId="projectId"
			:sprintId="sprintId"
			:taskId="taskId"
			:isTaskDetailSideBar="isTaskDetail"
			top="0px"
			@toggleTaskDetail="toggleTaskDetail"
			:isSupport="isSupport"
			/>
		</div>
	</template>
	<template v-else>
		<SpinnerComp :is-spinner="isSpinner"/>
	</template>
  </div>
</template>

<script setup>
import Cookies from 'js-cookie';
import axios from "axios";
import {defineComponent, nextTick, onMounted, provide, ref, computed } from "vue";
import ProjectListView from "../Support/ListView/ListView.vue";
import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue";
import { apiRequestWithoutCompnay, apiRequestWithoutSecure } from '@/services';
import * as env from "@/config/env";
import { useRoute, useRouter } from "vue-router";
import TaskDetail from "@/views/TaskDetail/TaskDetail.vue";
import { dbCollections } from '@/utils/Collections';
import { useCustomComposable } from "@/composable";

const isShowResend = ref(false);
import { useStore } from 'vuex';
const { getters } = useStore();
const router = useRouter();
const route = useRoute();
defineComponent({
  name: "Support-Comp",
});

const isSupport = ref(true);

provide("isSupport", isSupport);

const selectedProject = ref({});
const sprints = ref([]);
const isSpinner = ref(false);
const isTaskDetail = ref(false);
const taskId = ref("");
const sprintId = ref("");
const projectId = ref("");
const companyId = ref(route.params.cid);
const submitted = ref(false)
const userData = ref();
const logged = ref(false)

provide("selectedProject", selectedProject);
provide("searchedTask", ref(false));
provide("showArchived", ref(false));
provide("taskCollapsed", ref(true));
provide("$companyId", companyId);

const {checkPermission} = useCustomComposable();
const accessDenied = require("@/assets/images/access_denied_img.png");
const companyUserDetail = computed(() => getters['settings/companyUserDetail']);
const rules = computed(() => getters['settings/rules']);

// watch(() => getters['settings/companyUserDetail'], async(val) => {
// 	companyUserDetail.value = val;
// })


const openInNewTab = (task) => {
    projectId.value = task.ProjectID;
    sprintId.value = task.sprintId;
    taskId.value = task._id;
    isTaskDetail.value = true;
};
const toggleTaskDetail = (task, close = false, tab = "task-detail-tab") => {
    isTaskDetail.value = false;
    if (close == true) {
        router.push({ name: "Support", query: {} });
        return;
    }
    projectId.value = "";
    sprintId.value = "";
    taskId.value = "";
    nextTick(() => {
        router.push({ name: "Support", query: { detailTab: tab } });
        openInNewTab(task);
    });
};
provide("toggleTaskDetail", toggleTaskDetail);

onMounted(() => {
	isSpinner.value = true;
	const token = Cookies.get('accessToken') || '';
	if (token) {
		logged.value = true;
		getData();
	}else{
		const object = {
			email:process.env.VUE_APP_USEREMAIL, 
			password:process.env.VUE_APP_USERPASSWORD,
			isLoginType: "support"
		}
		apiRequestWithoutSecure("post",env.LOGIN,object).then(async res => {
			logged.value = true;
			if(res?.status !== 200 || !res?.data){
				return;
			}
			const user = res?.data;
			localStorage.setItem("userId", user.uid);
			apiRequestWithoutCompnay('get',`${env.USER_UPATE}/${user.uid}`)
			.then(async (response)=>{
				if(response.status === 200) {
					userData.value = response.data;
					if (userData.value.isEmailVerified) {
						if (userData.value.AssignCompany && userData.value.AssignCompany.length) {
							// Set all the required data into the localstorage
							localStorage.setItem('selectedCompany', userData.value.AssignCompany[0]);
							localStorage.setItem("userId", user.uid);
							localStorage.setItem('SubmenuScreen', 'project');
							const updateObject = {
								$set: {
									'isOnline': true,
									lastActive: new Date(),
								}
							}
							apiRequestWithoutCompnay("put",env.USER_UPATE,{
								userId: user.uid,
								updateObject:updateObject
							}).then(()=>{
								localStorage.setItem("isLogging", "true");
								if(route.query.redirect_url && route.query.redirect_url !== '/login') {
									router.replace(route.query.redirect_url).then(()=>{
										window.location.reload();
										submitted.value = false;
										getData()
									});
								} else {
									window.location.reload();
									getData()
								}
							}).catch((error)=>{
								isSpinner.value = false;
								localStorage.removeItem("updateToken");
								Cookies.remove('refreshToken');
								Cookies.remove('accessToken');
								console.error(error);
								submitted.value = false;
							});
						} else {
							localStorage.setItem("userId", user.uid);
							localStorage.setItem('SubmenuScreen', 'project');
							const updateObject = {
								$set: {
									'isOnline': true,
									lastActive: new Date(),
								}
							}
							apiRequestWithoutCompnay("put",env.USER_UPATE,{
								userId: user.uid,
								updateObject : updateObject
							}).then(()=>{
								localStorage.setItem("isLogging", "true");
								router.push({ name: "Create_Company"});
								submitted.value = false;
							}).catch((error)=>{
								console.error(error);
								isSpinner.value = false;
								localStorage.removeItem("updateToken");
								Cookies.remove('refreshToken');
								Cookies.remove('accessToken');
								submitted.value = false;
							});
						}
					} else {
						// $toast.error("Verify your email and try again",{position: 'top-right'})
						localStorage.removeItem("userId");
						localStorage.removeItem("isLogging");
						localStorage.removeItem("remember");
						localStorage.removeItem("updateToken");
						Cookies.remove('refreshToken');
						Cookies.remove('accessToken');
						isShowResend.value = true;
						submitted.value = false;
						isSpinner.value = false;
						window.location.reload();
					}
				}
			}).catch((error)=>{
				console.error(error);
				isSpinner.value = false;
				localStorage.removeItem("updateToken");
				Cookies.remove('refreshToken');
				Cookies.remove('accessToken');
				submitted.value = false;
			})
		}).catch((error)=>{
			isSpinner.value = false;
			console.error(error);
			submitted.value = false;
			if (error.error == 'invalid username/password') {
				// $toast.error("Invalid username or password.",{position: 'top-right'})
			} else {
				// $toast.error(`${error.error}`,{position: 'top-right'})
			}
		})
	}
});

const getData = () => {
    let data = {
        type: dbCollections.PROJECTS,
        data: [{ _id: process.env.VUE_APP_SUPPORT_PROJECTID}],
    };
    const axiosData = {
        dataObj: data.data,
        dbName: process.env.VUE_APP_SUPPORT_COMPANYID,
        collection: data.type,
        methodName: "findOne",
    };
    axios.post(env.API_URI + env.MONGO_OPRATION, axiosData).then((response) => {
        selectedProject.value = response.data.statusText;
    });
    let sprintData = {
        type: dbCollections.SPRINTS,
        data: [{ projectId: process.env.VUE_APP_SUPPORT_PROJECTID}],
    };
    const axiosData1 = {
        dataObj: sprintData.data,
        dbName: process.env.VUE_APP_SUPPORT_COMPANYID,
        collection: sprintData.type,
        methodName: "find",
    };
    axios.post(env.API_URI + env.MONGO_OPRATION, axiosData1).then((resp) => {
        isSpinner.value = false;
        sprints.value = resp.data.statusText.map((x) => ({ ...x, id: x._id }));
    })
    .catch(() => {
        isSpinner.value = false;
    });
}
</script>
<style>
.no_record_found{
	height:100%;
	background-color: #f4f5f7;
}
</style>