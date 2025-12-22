
import { computed } from "vue";
import { useStore } from "vuex";
import { settingsCollectionDocs } from '@/utils/Collections';
import { useToast } from 'vue-toast-notification';
import { i18n } from "@/locales/main";
import { apiRequest } from "@/services";
import * as env from '@/config/env';
const t = i18n.global.t;

export function memberData() {

    const { getters } = useStore();
    const companyUsers = computed(() => {
        return getters['settings/companyUsers'];
    });
    const users = computed(() => getters["users/users"]);
    const $toast = useToast();

    function getCompanyUsers(updatedArray = []){
        const companyUsersData = companyUsers.value ? JSON.parse(JSON.stringify(companyUsers.value.filter((x) => x.status !== 3))) : [];
        const usersData = users.value ? JSON.parse(JSON.stringify(users.value)) : [];

        let listingArray = [];
                
        companyUsersData.forEach((data)=>{
            let ind = usersData.findIndex((x) => x._id === data.userId);
            if(ind !== -1) {
                listingArray.push({...data, ...users.value[ind]});
            } else {
                listingArray.push({...data})
            }
        })
        if (updatedArray.length) {
            listingArray = listingArray.map(data => {
                const updatedItem = updatedArray.find(x => x._id === data._id);
                return updatedItem ? {...data, ...updatedItem} : data;
            });
        }
        return listingArray.sort((a,b) => a.Employee_Name?.trim()?.toLowerCase() > b.Employee_Name?.trim()?.toLowerCase() ? 1 : -1);
    }

    function handleDesignationChanges(changeType, designationKey, designationName, designationsData, designationsGetters, ind) {
        return new Promise ((resolve, reject) => {
            try {
                if(designationName === "") {
                    $toast.error(t("Toast.Designation_is_required"), {position: 'top-right'});
                    return;
                }
                let designationInd = designationsData.findIndex(x => x.name.trim().toLowerCase() === designationName.toLowerCase());
                if(designationInd !== -1 && designationInd !== ind) {
                    $toast.error(t("Toast.Designation_already_exists"), {position: 'top-right'});
                    return;
                }

                let queryObj = {};
                let queryFilter;

                if (changeType === 'add') {
                    queryObj.$push = { settings: { key: designationsGetters.length + 1, name: designationName } };
                    queryObj.$set = {
                        name: settingsCollectionDocs.DESIGNATIONS
                    };
                    queryFilter = { name: settingsCollectionDocs.DESIGNATIONS };
                } else {
                    // Update the 'name' of the specific object in the 'settings' array matching the given 'key'
                    queryFilter = { 
                        name: settingsCollectionDocs.DESIGNATIONS,
                        "settings.key": designationKey
                    };
                    queryObj.$set = {
                        "settings.$.name": designationName,
                    };
                }

                apiRequest("put",`${env.SETTING_DESIGNATION}/update`,{queryFilter: queryFilter, queryObj: queryObj})
                .then((response) => {
                    resolve(response);
                    if(changeType === "add") {
                        designationName = '';
                        $toast.success(t("Toast.Designation_added_successfully"), {position: 'top-right'});
                    } else {
                        $toast.success(t("Toast.Designation_updated_successfully"),{position: 'top-right'});
                    }
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    function handleRoleChanges (changeType, roleKey = null, ind,roleName,roleData,rolesGetter) {
        return new Promise((resolve,reject) => {
            try {
                if(roleName === "") {
                    $toast.error(t("Toast.Role_is_required"),{position: 'top-right'});
                    return;
                }
                let roleIndex = roleData.findIndex(x => x.name.trim().toLowerCase() === roleName.toLowerCase());
                if(roleIndex !== -1 && roleIndex !== ind) {
                    $toast.error(t("Toast.Role_already_exists"),{position: 'top-right'});
                    return;
                }
        
                let queryObj = {};
                let queryFilter;
        
                if (changeType === 'add') {
                    queryObj.$push = { settings: { key: rolesGetter.length + 1, name: roleName } };
                    queryObj.$set = {
                        name: settingsCollectionDocs.ROLES
                    };
                    queryFilter = { name: settingsCollectionDocs.ROLES };
                } else {
                    // Update the 'name' of the specific object in the 'settings' array matching the given 'key'
                    queryFilter = { 
                        name: settingsCollectionDocs.ROLES,
                        "settings.key": roleKey
                    };
                    queryObj.$set = {
                        "settings.$.name": roleName,
                    };
                }
                apiRequest("put",`${env.SETTING_ROLES}/update`,{queryFilter:queryFilter, queryObj: queryObj})
                .then((response) => {
                    resolve(response)
                    if(changeType === "add") {
                        roleName = '';
                        $toast.success(t("Toast.Role_added_successfully"),{position: 'top-right'});
                    } else {
                        $toast.success(t("Toast.Role_updated_successfully"),{position: 'top-right'});
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }
    
    return {
        getCompanyUsers,
        handleDesignationChanges,
        handleRoleChanges
    }
}