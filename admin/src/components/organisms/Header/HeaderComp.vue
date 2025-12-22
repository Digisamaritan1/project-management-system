<template>
    <div class="w-100 h-100 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
            <div @click="$emit('toggleSidebar')" v-if="clientWidth <= responseWidth">
                <img :src="arrow_up" alt="arrow" class="toggle-navbar-arrow">
            </div>
            <div class="header-title">
                {{$route.meta.title}}
            </div>
        </div>
        <div class="d-flex align-items-center">
            <div class="mr-1">
                <UpgradeVersionBtn @clickReleaseNoteModel="(val) => {openReleaseNoteModel = val}"></UpgradeVersionBtn>
            </div>
            <DropDown :title="'Menu'" :bodyClass="clientWidth > 767 ? {'dropDown_logout' : true} : {}">
                <template #button>
                    <div>
                        <img v-if="!Employee_profileImage && !isFetch" :src="ProfileImage" class="profileImg cursor-pointer" />
                        <WasabiIamgeCompp v-if="Employee_profileImage && !isFetch" :thumbnail="'120x120'" :userImage="true" :data="{url:Employee_profileImage}" class="profileImg cursor-pointer"/>
                        <SkelatonVue v-if="isFetch"  :class="'profileImg'"/>
                    </div>
                </template>
                <template #options>
                    <DropDownOption @click="signout()"> 
                        <span>Logout</span>
                    </DropDownOption>
                </template>
            </DropDown>
        </div>
    </div>
    <UpgradeProcessModel v-if="openReleaseNoteModel === true" :openReleaseNoteModel="openReleaseNoteModel" @closeReleaseNoteModel="(val) => {openReleaseNoteModel = val}" ></UpgradeProcessModel>
</template>

<script setup>
// PACKAGES
import { inject, onMounted, ref } from 'vue';

// COMPONENTS
import DropDown from "@/components/molecules/DropDown/DropDown.vue"
import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue"
import WasabiIamgeCompp from '@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue';
import UpgradeVersionBtn from '@/plugins/upgradeVersionProcess/component/UpgradeVersionBtn.vue';
import UpgradeProcessModel from '@/plugins/upgradeVersionProcess/component/UpgradeProcessModel.vue';
import { apiRequest } from '@/services';
import * as env from '@/config/env';
import SkelatonVue from '../../atom/Skelaton/Skelaton.vue';
import { logOut } from '../../../services';

// IMAGES
const ProfileImage = require("@/assets/images/svg/Profile_User_admin_default.svg");
const arrow_up = require("@/assets/images/svg/arrow_up.svg")

defineEmits(["toggleSidebar"])

const clientWidth = inject("$clientWidth");
const responseWidth = 1300;
const Employee_profileImage = ref('')
const isFetch = ref(true)
const openReleaseNoteModel = ref(false);
onMounted(()=>{
    const userId = localStorage.getItem('userId') || "";
    fetchCompanyData(userId)
})
function fetchCompanyData (userID) {    
    apiRequest('get',`${env.USER}/${userID}`).then((response) => {
        if(response.status === 200) {
            const data = response.data;
            Employee_profileImage.value = data?.Employee_profileImage ? data?.Employee_profileImage : ''
            const userObj = {
                "_id": data._id,
                "isProductOwner": data.isProductOwner,
                "isVesionUpdate": data.isVesionUpdate,
                "Employee_Email": data.Employee_Email,
                "Employee_Name": data.Employee_Name,
            }
            localStorage.setItem('userDetails', JSON.stringify(userObj)); 
        }
        isFetch.value = false;
    })
    .catch((error) => {
        isFetch.value = false;
        console.error(`Error ${error}`);
    });
}
function signout() {
    logOut();
}
</script>

<style lang="css" src="./style.css">

</style>