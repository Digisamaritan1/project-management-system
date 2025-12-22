<template>
    <div class="overflow-data h-100vh">
		<template v-if="isSpinner">
			<div class="d-flex align-items-center justify-content-center lds-roller h-100dvh">
				<img :src="logo" alt="logo" class="position-ab z-index-1 company__logo">
				<div class="spinner"></div>
			</div>
		</template>
		<template v-else-if="$route.meta.requiresAuth">
			<HomeTemplate>
				<!-- LEFT SIDEBAR -->
				<template #leftSide>
					<Sidebar
						v-model:visible="showSidebar"
						:left="true"
						:hideHeader="true"
						v-if="clientWidth <= responseWidth"
					>
						<template #body>
							<NavSidebar @toggleSidebar="showSidebar = !showSidebar"/>
						</template>
					</Sidebar>

					<div class="sidebar_wrapper border-right h-100" v-else>
						<NavSidebar/>
					</div>
				</template>

				<!-- RIGHT SIDE -->
				<template #rightSide>
					<div class="h-100 bg-light-gray">
						<div class="header_wrapper border-bottom">
							<HeaderComp @toggleSidebar="showSidebar = !showSidebar"/>
						</div>
						<div class="body_wrapper style-scroll" :style="`${$route.name === 'Home' ? 'height: calc(100% - 78px);' : ''}`">
							<router-view/>
						</div>
					</div>
				</template>
			</HomeTemplate>
			<ReviewPromptModal />
		</template>
		<template v-else>
			<router-view/>
		</template>
    </div>
</template>
<script setup>
// PACKAGES
import { defineComponent, provide,onMounted, ref } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex';
const { getters, dispatch } = useStore();
// COMPONENT
import HomeTemplate from '@/components/templates/Home/HomeTemplate.vue';
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue"
import NavSidebar from "@/components/organisms/NavSidebar/NavSidebar.vue"
import HeaderComp from './components/organisms/Header/HeaderComp.vue';
import * as env from '@/config/env';
import { apiRequestWithoutCompnay, logOut } from './services';
import ReviewPromptModal from "@/components/molecules/common-modals/ReviewPromptModal.vue";

defineComponent({
	name: 'App',

	components: {
	}
})
const clientWidth = ref(document.documentElement.clientWidth);

const defaultImageUser = require("@/assets/images/default_user.png");
const showSidebar = ref(false);

const responseWidth = 1300;
const isSpinner = ref(true)
const logo = env.GET_LOGO + "?key=logo&type=desktop";

onMounted(async()=>{
  window.onresize = (e) => {
		clientWidth.value = e.target.innerWidth;
	}
	let localUserId = localStorage.getItem("userId");
    const app = localUserId ? await apiRequestWithoutCompnay('get',`${env.USER_UPATE}/${localUserId}`) : null;
    if(app && app?.status === 200) {
		let user = app.data
		let data = {
			type: 'users',
			data:[ {
				_id:  user._id
			}]
		}
		const axiosData = {
			dataObj: data.data,
			collection: data.type,
			methodName: 'findOne',
			dbName: 'global',
		};
		axios.post(env.API_URI + env.MONGO_OPRATION, axiosData).then(async (result)=>{
			if(result.data.status === true){
				if(result.data.statusText?.isProductOwner === true){
					isSpinner.value =  false;
					if(getters['companyTab/companies'] && !(getters['companyTab/companies']).length){
						dispatch('companyTab/setCompanies')
						.catch((error) => {
						console.error("ERROR in set companies: ", error)
						return;
					})
					}
					if(getters['planTab/planFeatureDisplay'] && !(getters['planTab/planFeatureDisplay']).length){
						dispatch('planTab/setplanFeatureDisplay').catch((error) =>{
							console.error('ERROR in set Set Chargebee',error)
						})
					}
					if(getters['planTab/planFeature'] && !(getters['planTab/planFeature']).length){
						dispatch('planTab/setplanFeature').catch((error) =>{
							console.error('ERROR in set Set Chargebee',error)
						})
					}
					if(getters['brandSettingTab/brandSettings'] && !(getters['brandSettingTab/brandSettings']).length){
						dispatch('brandSettingTab/setBrandSettings').catch((error) =>{
							console.error('ERROR in set Set Brand Settings',error)
						})
					}
				}else{
					checkCompanyFound();
				}
			}else{
				checkCompanyFound()
			}
		})
    }else{
		isSpinner.value =  false;
	}
	window.onresize = (e) => {	
		clientWidth.value = e.target.innerWidth;
	}
})

function checkCompanyFound() {
	let selectedCompany = localStorage.getItem('selectedCompany');
	if(selectedCompany && selectedCompany !== null){
		window.location.href = window.location.origin;
	}else{
		logOut();
	}
	setTimeout(() => {
		isSpinner.value =  false;
	}, 1000);
}

provide("$axios", axios);
provide("$clientWidth", clientWidth);
provide("$defaultUserAvatar", defaultImageUser);
provide("$clientWidth", clientWidth);
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0px;
}

.sidebar_wrapper{
	width: 272px;
}

.header_wrapper{
	height: 75px;
	padding: 0px 30px;
}

.body_wrapper{
	padding: 30px;
	height: calc(100% - 136px);
	width: 100%;
	overflow: auto;
	box-sizing: border-box;
}
.company__logo{
    width: 150px; 
    height: 150px; 
    border: 2px solid #2F399035;
    border-radius: 50%;
}
.nav-sidebar-wrapper .nav-item-wrapper {
    margin-bottom: 15px;
}
@media(max-width:767px){
	.body_wrapper{
	padding: 15px;
}
}
</style>
