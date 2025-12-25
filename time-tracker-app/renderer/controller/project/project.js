import { apiRequest } from "../../utils/services";

export function fetchProject() {
    return new Promise((resolve, reject) => {
        try {
            apiRequest("get", `/api/v1/project`)
            .then((res) => {
            resolve(res?.data.filter((x) => x.statusType !== "close" && !x?.deletedStatusKey) || [])
            })
            .catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error);
        }
    })
}