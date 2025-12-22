<template>
    <div v-if="checkPermission('settings.settings_team_list') !== null">
        <div v-if="!currentCompany.planFeature.team">
            <UpgradePlan
                :buttonText="$t('Upgrades.upgrade_your_plan')"
                :lastTitle="$t('Upgrades.to_unlock_team')"
                :secondTitle="$t('Upgrades.unlimited')"
                :firstTitle="$t('Upgrades.upgrade_to')"
                :message="$t('Upgrades.the_feature_not_available')"
            />
        </div>
        <div class="team-management-settings p-1" v-else>
            <div v-if="teams.length === 0" class="errorWrapper position-ab">
                <img src="@/assets/images/svg/No-Search-Result.svg" alt="aliansoftware"/>
                <div class="error-text text-center">
                    <h2>{{ $t('Filters.no_data_found') }}</h2>
                </div>
            </div>
            <div v-if="teams.length > 0">
                <div class="d-flex title-team-user justify-content-between">
                    <span>{{ $t('Filters.teams') }}</span>
                    <span>{{ $t('Filters.user') }}</span>
                </div>
                <div v-for="(row, index) in teams" :key="index" class="team-section d-flex align-items-center justify-content-between bg-white">
                    <div class="d-flex align-items-center team-name-icon position-re" tabindex="0" @blur="row.isPopupOpen = false">
                        <span class="team_icon_span cursor-pointer text-center" :style="[{'color': row?.teamColor?.color,'background-color': row?.teamColor?.bgColor, 'padding':'5px'}]"  @click="row.isPopupOpen = true">{{row.name.charAt(0)}}</span>
                        <ul v-if="row.isPopupOpen && editPermission === true" class="ul-colors ul-color-sidebar-popup d-flex flex-wrap justify-content-start position-ab bg-white">
                            <li v-for="(color, index) in colors" :key="index" @click="(row.teamColor.bgColor = color, handleUpdate(row),row.isPopupOpen = false)" :class="[{'active': color === row.teamColor.bgColor}]" :style="[{'cursor':'pointer', 'background-color': color}]">
                                <span></span>
                            </li>
                        </ul>
                        <div class="team_name dark-gray font-roboto-sans">
                            <span v-if="row.isEdit === false" @click="editPermission === true ? openInput(row) :''">{{row.name}}</span>
                            <span v-if="row.isEdit === true && editPermission === true">
                                <InputText :is-direct-focus="true" @blur="editFocusOut(row)" v-model.trim="existingValue"  @enter="saveTeamName(row)" />
                            </span>
                        </div>
                    </div>
                        <Assignee class="Assignee-component ml-15px assginee__comp-wrappper"
                            :users="row.assigneeUsersArray"
                            :options="users.map((x) => x.userId)"
                            :imageWidth="'30px'" 
                            :showDot="false"
                            :addUser=editPermission
                            @selected="changeAssignee('add', $event,row)"
                            @removed="changeAssignee('remove', $event,row)"
                            :isDisplayTeam="false"
                            :allowGhost="true"
                        />
                </div>
            </div>
        </div>
    </div>
    <div v-else class="text-center">
        <img :src="accesDenied" />
    </div>
</template>

<script setup>
    import { defineComponent, ref, computed} from "vue";
    import { useStore } from 'vuex';
    import InputText from "@/components/atom/InputText/InputText.vue"
    import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';
    import { useCustomComposable } from '@/composable';
    import Assignee from "@/components/molecules/Assignee/Assignee.vue"
    import { useToast } from 'vue-toast-notification';
    const $toast = useToast();
    import { useI18n } from "vue-i18n";
    import { apiRequest } from "../../../services";
    import * as env from '@/config/env';
    const { t } = useI18n();
    defineComponent({
        name: "TeamsComponent"
    })
    const { getters, commit} = useStore();
    const { checkPermission } = useCustomComposable();
    const editPermission= computed(() =>checkPermission('settings.settings_team_list'))
    const existingValue = ref('');
    const colors = ref([
        "#40BC86","#1ABC9C","#27AE60","#00D717","#F31D2F",
        "#EC555C","#FC575E","#FCB410","#B17E22","#F24D16",
        "#FF8600","#EC6F32","#2980B9","#3498DB","#528CCB",
        "#03A2FD","#7B68EE","#BF4ACC","#074354","#34495E",
        "#181D21","#0918EC","#199EC7"
    ])

    const users = computed(() => getters["settings/companyUsers"]);
    const teams = computed(() => getters["settings/teams"]);
    const currentCompany = computed(() => getters["settings/selectedCompany"]);
    const accesDenied = require("@/assets/images/access_denied_img.png");

    const changeAssignee = (type, user,row) => {
        let updateObj = {};

        if(type === "add") {
            updateObj = {assigneeUsersArray: user.id};
        } else {
            updateObj = {assigneeUsersArray: user.id};
        }

        apiRequest("put",`${env.TEAMS}/updateTeam`,{updateObject: updateObj, key : type === 'add' ? '$addToSet' : '$pull', id: row._id})
        .then((res) => {
            if(res.data){
                const team = Object.assign(res.data, {'isEdit': false, 'isPopupOpen': false});
                commit("settings/mutateTeams", { data: team,op: "modified"});
            }
            $toast.success(t('Toast.Updated_successfully'),{position: 'top-right'});
        })
        .catch((error) => {
            console.error("ERROR in update project assignee: ", error);
        })
    }

    const editFocusOut = (row) => {
        row.isEdit = false;
    }

    const openInput = (row) => {
        teams.value.map((x)=>{return x._id === row._id ? x.isEdit = true : x.isEdit = false});
        existingValue.value = row.name;
    }

    const saveTeamName = (data) => {
        if(data.name === existingValue.value){
            data.isEdit = false;
            return;
        }
        const obj = {
            name: existingValue.value,
            updatedAt: new Date(),
            value: existingValue.value.replaceAll(" ", "_").toUpperCase()
        }
        if(obj.value === ''){
            $toast.error(t('Toast.Team_name_is_required'),{position: 'top-right'});
        } else if(obj.value.length < 3){
            $toast.error(t('Toast.Minimum_3_character_required'),{position: 'top-right'});
        } else if(teams.value && teams.value.length > 0 && teams.value.map((x)=>{return x.value}).includes(obj.value)){
            $toast.error(t('Toast.Team_name_already_exist'),{position: 'top-right'});
        }
        else{
            apiRequest("put",`${env.TEAMS}/updateTeam`,{updateObject: obj, key : '$set', id: data._id})
            .then((res) => {
                if(res.data){
                    const team = Object.assign(res.data, {'isEdit': false, 'isPopupOpen': false});
                    commit("settings/mutateTeams", { data: team,op: "modified"});
                }
                data.isEdit = false;
                $toast.success(t('Toast.Updated_successfully'),{position: 'top-right'});
            })
            .catch((error) => {
                console.error("ERROR in update team name: ", error);
            })
        }
    }

    const handleUpdate = (item) => {
        let object = { 
            teamColor: {
                bgColor: item.teamColor.bgColor,
                color: item.teamColor.color
            } 
        } 

        apiRequest("put",`${env.TEAMS}/updateTeam`,{updateObject: object, key : '$set', id: item._id})
        .then((res) => {
            if(res.data){
                const team = Object.assign(res.data, {'isEdit': false, 'isPopupOpen': false});
                commit("settings/mutateTeams", { data: team,op: "modified"});
            }
            $toast.success(t('Toast.Updated_successfully'),{position: 'top-right'});
        })
        .catch((error) => {
            console.error("ERROR in update background color name: ", error);
        })
    }
</script>

<style src="./style.css">
</style>