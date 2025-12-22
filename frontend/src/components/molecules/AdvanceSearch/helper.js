import { inject } from "vue";

export function filterFun() {
    const urlRegex = inject("$urlRegex");
    // generateTaskURL
    function generateTaskURL(obj,companyId,action){
        try {
            return new Promise((resolve, reject) => {
                try{
                    let path = null;
                    let navigation = `${window.location.origin}/#`;
                    if(action){
                        if(obj.folderId){
                            path = `${navigation}/${companyId}/project/${obj.ProjectID}/fs/${obj.folderId}/${obj.sprintId}/${obj._id}`
                        } else {
                            path = `${navigation}/${companyId}/project/${obj.ProjectID}/s/${obj.sprintId}/${obj._id}`
                        }
                    }else{
                        if(obj.folderObjId){
                            path = `${navigation}/${companyId}/project/${obj.ProjectID}/fs/${obj.folderObjId}/${obj.sprintId}/${obj._id}`
                        } else {
                            path = `${navigation}/${companyId}/project/${obj.ProjectID}/s/${obj.sprintId}/${obj._id}`
                        }
                    }
                    resolve(path);
                } catch (e) {
                    reject(e)
                    console.error(e);
                }
            });
        }catch (e) {
            console.error(e);
        }
    }
    // linkify
    function linkCheck(str){
        try {
            return new Promise((resolve, reject) => {
                try{
                    let string = str;
                    let result = [];
                    if (str != '' && str != undefined) {
                        result = string.match(urlRegex.value);
                    }
                    resolve([...new Set(result)]);
                } catch (e) {
                    reject(e)
                    console.error(e);
                }
            });
        }catch (e) {
            console.error(e);
        }
    }
    return {
        generateTaskURL,
        linkCheck
    }
}