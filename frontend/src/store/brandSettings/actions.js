import { apiRequestWithoutCompnay } from "@/services";
import * as env from '@/config/env';

export const setBrandSettings = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            apiRequestWithoutCompnay('get',env.GET_BRAND_SETTINGS_INFORMATION).then((response) => {
                if(response.status === 200) {
                    commit('mutateBrandSettings', response);
                    resolve(response);
                } else {
                    commit('mutateBrandSettings', {})
                    resolve({});
                }
            }).catch((err) => {
                commit('mutateBrandSettings', {})
                reject(err);
                console.error(err);
            })
        } catch (error) {
            reject(error);
        }
    });
}