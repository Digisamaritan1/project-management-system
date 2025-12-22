import { apiRequest } from "@/services";
import * as env from '@/config/env';

export const setCompanies = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            apiRequest("post",`${env.COMPANYACTION}`,{companyIds: [],fetchAllCompany : true})
            .then((resp) => {
                if(resp.status === 200) {
                    const result = resp.data;
                    resolve(result);
                    result.forEach((x) => {
                        commit("mutateCompanies", {
                            data: {...x, _id: x._id},
                            op: "added",
                        })
                    })
                }
            })
            .catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error);
        }
    });
}