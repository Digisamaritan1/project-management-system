import { i18n } from "@/locales/main";
const t = i18n.global.t;
import * as env from '@/config/env';
import { apiRequest } from '@/services';
/**
 * This function is used to add new view
 * @param {Object} ids 
 * @param {Object} data 
 * @returns 
 */
export const addView = (ids, data) => {
    return new Promise((resolve, reject) => {
        try {
            let updatedObje =  { ...data, id: data._id ? data._id : data.id, _id: data._id ? data._id : data.id}
            let reqBOdy = {
                updateObject: { ProjectRequiredComponent: updatedObje },
                key: '$addToSet',
            }
            apiRequest("put",`/api/v1/${env.PROJECTACTIONS}/${ids.pid}`,reqBOdy).then(()=>{
                resolve({ statusText:t('Toast.View_added_successfully'), status: true,data: updatedObje});
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}

/**
 * This function is used to update view
 * @param {*} ids 
 * @param {*} data 
 * @param {*} value 
 * @param {*} field 
 * @returns 
 */
export const editView = (ids, data, value, field) => {
    return new Promise((resolve, reject) => {
        try {
            let reqBOdy = {
                updateObject: {[`ProjectRequiredComponent.$[elementIndex].${field}`]: value },
                arrayFilters: [{ "elementIndex._id": data._id }]
            }
            apiRequest("put",`/api/v1/${env.PROJECTACTIONS}/${ids.pid}`,reqBOdy).then(()=>{
                let updatedObje = {
                    elementId: data._id,
                    updateValue: value,
                    field: field
                }                
                resolve({ statusText:t('Toast.View_added_successfully'), status: true,data:updatedObje });
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}

/**
 * This function is used to remove view
 * @param {*} ids 
 * @param {*} data 
 * @returns 
 */
export const deleteView = (ids, data) => {
    return new Promise((resolve, reject) => {
        try {
            let reqBOdy = {
                updateObject: { ProjectRequiredComponent: { _id: data._id } },
                key: '$pull',
            }
            apiRequest("put",`/api/v1/${env.PROJECTACTIONS}/${ids.pid}`,reqBOdy).then(()=>{
                resolve({ statusText:t('Toast.View_Deleted_Successfully'), status: true,data: {_id: data._id} })
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}