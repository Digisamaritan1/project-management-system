<template>
    <div>
        <div class="mainTimeTrackerDetail position-re">
            <div class="d-flex timelogtracker justify-content-between">
                <div class="d-flex align-items-center">
                    <UserProfile
                        :data="{title: timelogDetail.loggedUserName, image: timelogDetail.loggedUserProfile}"
                        width="30px"
                        :showDot="true"
                        class="imageUser"
                        :thumbnail="'30x30'"
                    />
                    <h5 class="timelogText GunPowder font-roboto-sans text-ellipsis m-0">{{timelogDetail.loggedUserName}}</h5>
                </div>
                <div class="d-flex align-items-center">
                    <img :src="timeTrackerIcon"  v-if="timelogDetail.startTimeTracker && !checkDateDiff">
                    <span class="timelogTotal GunPowder font-roboto-sans">
                        {{`${$t("TimeTracker.total")}:-`}}
                    </span>
                    <span class="timelogHours black font-roboto-sans">
                        {{timelogDetail.totalTimeDuration}} hrs
                    </span>
                </div>
            </div>
            <div>
                <div>
                    <div class="mainDetail">
                        <div class="d-flex timelogtimeDetail justify-content-between bg-white">
                            <div class="d-flex align-items-center">
                                <span class="startEndHours black font-weight-500">{{changeTimeFormat(moment(new Date(timelogDetail.LogStartTime * 1000)).format('HH:mm'),moment(new Date(timelogDetail.LogEndTime * 1000)).format('HH:mm'))}}</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <img v-if="timelogDetail.logAddType === 1" src="@/assets/images/svg/green_dot.svg" class="active_inactivedot p0x-15px">
                                <img v-else src="@/assets/images/svg/Purple_dot.svg" class="active_inactivedot p0x-15px">
                                <span class="totalHours font-weight-500 black font-roboto-sans">{{timelogDetail.totalTimeDuration}} hrs</span>
                            </div>
                        </div>
                        <div class="commentMain position-re">
                            <div class="cooment_titledesc-wrapper bg-white">
                            <h4 class="commentTimelog black font-roboto-sans">{{$t('ViewList.Comment')}}</h4>
                            <p class="commentDetail font-roboto-sans GunPowder text-ellipsis">{{timelogDetail.LogDescription}}</p>
                            </div>
                            <div class="d-flex mainImageDiv flex-wrap" v-if="timelogDetail.trackShots !== undefined && timelogDetail.trackShots">
                                <div class="timelogImage bg-white position-re overflow-hidden" v-for="(trackDetail,ind) in timelogDetail.trackShots" v-bind:key="ind">
                                    <div v-if="trackDetail?.deleted">
                                        <img class="innerImageTimelog" src='@/assets/images/svg/deleted-placeholder.svg' @click="previewScreenShot(trackDetail)">
                                    </div>
                                    <div v-else>
                                        <img :src="trackDetail.image" class="innerImageTimelog"  v-if="trackDetail.image.includes('http')" @click="previewScreenShot(trackDetail)" />
                                        <WasabiImage v-else class="border-radius-10-px" :data="{url: trackDetail.image}" @click="previewScreenShot(trackDetail)"/>
                                    </div>
                                    <div class="timecheckbox d-flex align-items-center justify-content-between">
                                        <span class="timedispalyImg font-size-13 GunPowder" v-if="trackDetail.screenShotTime" >{{typeof trackDetail.screenShotTime === 'object' && trackDetail.screenShotTime.seconds ? getDateType(trackDetail.screenShotTime * 1000) : getDateType(parseInt(trackDetail.screenShotTime))}}</span>
                                        <span v-if="trackDetail.strokes!== undefined"><ScreenShotActivityBar :data="trackDetail" :widthData="57" :heightData="3"/></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <PreviewTimelogScreenShot v-if="isScreemnShotOPen === true" :screenShotdetail="screenShotdetail" :isScreemnShotOPen="isScreemnShotOPen" @isSSopen="(val) => {isScreemnShotOPen = val}" />
    </div>
</template>

<script setup>
    import { ref , defineProps ,inject , computed } from 'vue'
    import moment from 'moment'
    import { useGetterFunctions } from "@/composable";
    import { useStore } from 'vuex';
    import PreviewTimelogScreenShot from '@/components/atom/PreviewTimelogScreenShot/PreviewTimelogScreenShot.vue';
    import ScreenShotActivityBar from '@/components/atom/PreviewTimelogScreenShot/ScreenShotActivityBar';
    import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
    import UserProfile from "@/components/atom/UserProfile/UserProfile.vue"
    const props = defineProps({
        timelogDetail: {
            type: Object,
            required: true
        },
        task:{
            type: Object,
        }
    })
    const {getUser} = useGetterFunctions();
    const timeTrackerIcon = require("@/assets/images/svg/time_tracker.svg");
    const userId =  inject('$userId');
    const { getters } = useStore();

    const isScreemnShotOPen = ref(false);
    const screenShotdetail = ref({});

    const project = computed(() => {
        let index = getters["projectData/projects"].data.findIndex((element) => {
            return element._id == props.task.ProjectID;
        });
        if(index > -1) {
            return getters["projectData/projects"].data[index];
        } else {
            return null;
        }
    });

    const getDateType = (seconds) => {
        return moment(new Date(seconds)).format("hh:mm A");
    }

    const changeTimeFormat = (start1,end1) => {
        let tempStartLog = start1;
        let tempEndLog = end1;
        let user = getUser(userId.value);
        if(user.timeFormat == '12'){
            tempStartLog = moment(start1, "HH:mm").format("hh:mm:A");
            tempEndLog = moment(end1, "HH:mm").format("hh:mm:A");
        }
        return tempStartLog  + ' - '  + tempEndLog;
    }

    const previewScreenShot = (track) => {
        isScreemnShotOPen.value = true;
        let obj = {
            projectName : project.value.ProjectName,
            projectKey :project.value.ProjectCode,
            taskName : props.task.TaskName,
            isFolderSprint : props.task.sprintArray.isFolderSprint,
            sprintName : props.task.sprintArray.name,
            folderName : props.task.sprintArray.folderName ? props.task.sprintArray.folderName : '',
            userProfile: props.timelogDetail.loggedUserProfile,
            userName: props.timelogDetail.loggedUserName,
        }
        screenShotdetail.value = {...track , ...obj};
    }

    const checkDateDiff =  computed(() => {
        let date1 = props.timelogDetail.startTimeTracker ? new Date(props.timelogDetail.startTimeTracker * 1000) : ''
        let date2 = new Date();
        const diffMinutes = moment(date2).diff(moment(date1), 'minutes');
        if(diffMinutes >= 10){
           return true;
        }else{
            return false;
        }
    })

</script>

<style src="./style.css"></style>