import axios from 'axios';
import * as env from '@/config/env';
const apiHost = env.API_URI;
export const axiosInstance = axios.create({ baseURL: apiHost });
export const axiosInstanceWithFormData = axios.create({ baseURL: apiHost });
export const axiosInstanceWithoutCompany = axios.create({ baseURL: apiHost });
export const axiosInstanceWithoutCompanyWithFormData = axios.create({ baseURL: apiHost });



axiosInstance.interceptors.request.use((req) => {
    const token = localStorage.getItem('token') || "";
    const companyId = localStorage.getItem('selectedCompany') || "";
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'companyId': companyId
    }
    req.headers = headers;
    return req;
}, error => {
    return Promise.reject(error);
});

axiosInstanceWithFormData.interceptors.request.use((req) => {
    const token = localStorage.getItem('token') || "";
    const companyId = localStorage.getItem('selectedCompany') || "";
    const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + token,
        'companyId': companyId
    }
    req.headers = headers;
    return req;
}, error => {
    return Promise.reject(error);
});

axiosInstanceWithoutCompany.interceptors.request.use((req) => {
    const token = localStorage.getItem('token') || "";
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    }
    req.headers = headers;
    return req;
}, error => {
    return Promise.reject(error);
});

axiosInstanceWithoutCompanyWithFormData.interceptors.request.use((req) => {
    const token = localStorage.getItem('token') || "";
    const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + token
    }
    req.headers = headers;
    return req;
}, error => {
    return Promise.reject(error);
});




export const getAuth = async (id,isFirst) => {
    return new Promise((resolve, reject) => {
        let data = {
            uid: id
        };
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        let url = env.GENERATETOKEN;
        axios.post(apiHost + url, data, { headers }).then((result) => {
            localStorage.setItem('token', result.data.token)
            if (isFirst) {
                localStorage.setItem('updateToken', result.data.token)
            }
            resolve(result.data);
        }).catch((error) => {
            console.error('error', error.response.data);
            reject(error.response.data);
        });
    })
};

export const apiRequest = (type, endPoint, data, dataType) => {
    return new Promise((resolve, reject) => {
        try {
            if (type === 'post' || type === 'patch' || type === 'get') {
                let rData;
                if (dataType === 'form') {
                    rData = axiosInstanceWithFormData[type](endPoint, data);
                } else {
                    rData =  axiosInstance[type](endPoint, data);
                }

                rData
                    .then((resData) => {
                        resolve(resData);
                    })
                    .catch(async (err) => {
                    if (err?.response?.data?.isJwtError) {
                        const userId = localStorage.getItem('userId') || "";
                        await getAuth(userId);
                        apiRequest(type, endPoint, data).then((sData)=>{
                            resolve(sData);
                        }).catch((err) => {
                            reject(err);
                        });
                        return;
                    }
                    reject(err);
                });
            } else {
                console.info(type)
            }
        } catch (error) {
            console.error('error', error);
            reject(error);
        }
    })
}


export const apiRequestWithoutCompnay = (type, endPoint, data, dataType) => {
    return new Promise((resolve, reject) => {
        try {
            if (type === 'post' || type === 'patch' || type === 'get') {
                let rData;
                if (dataType === 'form') {
                    rData = axiosInstanceWithoutCompanyWithFormData[type](endPoint, data);
                } else {
                    rData = axiosInstanceWithoutCompany[type](endPoint, data);
                }
                rData
                    .then((resData) => {
                        resolve(resData);
                    })
                    .catch(async (err) => {
                    if (err?.response?.data?.isJwtError) {
                        const userId = localStorage.getItem('userId') || "";
                        await getAuth(userId);
                        apiRequestWithoutCompnay(type, endPoint, data).then((sData)=>{
                            resolve(sData);
                        }).catch((err) => {
                            reject(err);
                        });
                        return;
                    }
                    reject(err);
                });
            } else {
                console.info(type)
            }
        } catch (error) {
            console.error('error', error);
            reject(error);
        }
    })
}