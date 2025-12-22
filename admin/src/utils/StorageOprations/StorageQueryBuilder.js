import * as env from '@/config/env.js';

/**
 * 
 * @param {Type of request} type 
 * @param {In which bucket file upload} bucketId 
 * @param {FilePath} path 
 * @returns Object with Routes and metadata
 */
export const storageQueryBuilder = (type,bucketId,path) => {
    if(type == 'upload') {
        if(env.STORAGETYPE && env.STORAGETYPE == 'server') {
            return {
                route:env.UPLOAD_FILE,
            };
        } else {
            return {
                // UNUSED IN ADMIN FOR NOW
                route:env.WASABI_UPLOAD_FILE
            };
        }
    } else if(type == 'get') {
        if(env.STORAGETYPE && env.STORAGETYPE == 'server') {
            return {
                route:env.GET_SIGNED_OR_PUBLIC_URL + "/" + bucketId + "?filepath=" + path +  "&domainUrl=" + env.API_URI,
                method: 'get',
            };
        } else {
            return {
                route:env.ADMIN_WASABI_RETRIVE_OBJECT
            };
        }
    }
}