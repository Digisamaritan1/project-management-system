export function customField() {
    // deleteMilestoneHelper
    function tabRouteHelper(){
        return [];
    }
    function projectAlianApp(){
        return ['CustomFields'];
    }
    function setfinalCustomFieldsArray ({commit}) {
        return new Promise((resolve, reject) => {
            try {
                commit("mutateFinalCustomFields", {
                    data: [],
                    op: "inital",
                });
                resolve([])
            } catch (error) {
                reject(error);
            }
        })
    }
    function setCustomFieldsArray ({commit}) {
        return new Promise((resolve, reject) => {
            try {
                commit("mutateCustomFields", [])
                resolve([]); 
            } catch (error) {
                reject(error);
            }
    
        })
    }
    function isCustomFields() {
        return false;
    }
    return {
        tabRouteHelper,
        projectAlianApp,
        setfinalCustomFieldsArray,
        setCustomFieldsArray,
        isCustomFields
    }
}