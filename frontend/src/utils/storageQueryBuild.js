import * as env from '@/config/env';

/**
 * 
 * @param {Type of request} type 
 * @param {In which bucket file upload} bucketId 
 * @param {FilePath} path 
 * @returns Object with Routes and metadata
 */
export const storageQueryBuilder = (type,bucketId,path) => {
    if(type == 'upload') {
        if(env.STORAGE_TYPE && env.STORAGE_TYPE == 'server') {
            return {
                route:env.UPLOAD_FILE,
            };
        } else {
            return {
                route:env.WASABI_UPLOAD_FILE
            };
        }
    } else if(type == 'get') {
        if(env.STORAGE_TYPE && env.STORAGE_TYPE == 'server') {
            return {
                route:env.GET_SIGNED_OR_PUBLIC_URL + "/" + bucketId + "?filepath=" + path + "&domainUrl=" + env.DOMAIN_URI,
                method: 'get',

            };
        } else {
            return {
                route:env.WASABI_RETRIVE_OBJECT
            };
        }
    }  else if(type == 'delete') {
        if(env.STORAGE_TYPE && env.STORAGE_TYPE == 'server') {
            return {
                route:env.REMOVE_FILE + '/' + bucketId + '?filepath=' + path,
                data: {},
                method: 'delete',
            };
        } else {
            return {
                route:env.WASABI_DELETE_FILE,
                data: {
                    companyId: bucketId,
                    path: path
                },
                method: 'post',
            };
        }
    } else if(type == 'upload_64') {
        if(env.STORAGE_TYPE && env.STORAGE_TYPE == 'server') {
            return {
                route:env.UPLOAD_FILE_64,
            };
        } else {
            return {
                route:env.WASABI_UPLOAD64_FILE
            };
        }
    }
}

export const generateFileName = (originalName, storageType) => {
    const randomNumber = parseInt(Date.now() * Math.random());
    let newName = originalName.replaceAll(" ", "_");

    if (storageType && storageType === 'server') {
        newName = newName.replaceAll(/[^a-zA-Z0-9_\-./]/g, '_');
    }

    return `${randomNumber}_${newName}`;
}