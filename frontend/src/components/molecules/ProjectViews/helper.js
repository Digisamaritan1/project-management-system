import { apiRequest } from '@/services';
import * as env from '@/config/env';

/**
 * This function is used to add new private view
 * @param {Object} ids 
 * @param {Object} data 
 * @returns 
 */
export const addPrivateView = (ids, data) => {
    return new Promise((resolve, reject) => {
        try {
            const params = {
                id: ids.uid,
                data: { ...data, createdAt: new Date() },
                operation: 'push'
            }

            apiRequest("post", `${env.API_MEMBERS}/private-view`, params).then(() => {
                resolve({ statusText: 'View_added_successfully', status: true })
            }).catch((error) => {
                console.error(`Error in addPrivateView hook => ${error}`)
            });

        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}

/**
 * This function is used to remove or delete existing private view
 * @param {Object} ids 
 * @returns 
 */
export const deletePrivateView = (ids) => {
    return new Promise((resolve, reject) => {
        try {
            const params = {
                id: ids.uid,
                data: { id: ids.uniqueId },
                operation: 'delete'
            }

            apiRequest("post", `${env.API_MEMBERS}/private-view`, params).then(() => {
                resolve({ statusText: 'View_Deleted_Successfully', status: true })
            }).catch((error) => {
                console.error(`Error in deletePrivateView hook => ${error}`)
            });

        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}

/**
 * This function is used to update private view name
 * @param {Object} ids 
 * @param {Object} data 
 * @param {String} name 
 * @returns 
 */
export const editPrivateName = (ids, data, name) => {
    return new Promise((resolve, reject) => {
        try {
            const params = {
                id: ids.uid,
                data: { id: data.id, name: name },
                operation: 'update',
                key: 'name'
            }

            apiRequest("post", `${env.API_MEMBERS}/private-view`, params).then(() => {
                resolve({ statusText: 'View_updated_successfully', status: true })
            }).catch((error) => {
                console.error(`Error in editPrivateName hook => ${error}`)
            });

        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}