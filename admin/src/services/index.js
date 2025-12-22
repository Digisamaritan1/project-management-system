import axios from 'axios';
import * as env from '@/config/env';
import Cookies from 'js-cookie';
const apiHost = env.API_URI;
export const axiosInstance = axios.create({ baseURL: apiHost });
export const axiosInstanceWithFormData = axios.create({ baseURL: apiHost });
export const axiosInstanceWithoutCompany = axios.create({ baseURL: apiHost });
export const axiosInstanceWithoutCompanyWithFormData = axios.create({ baseURL: apiHost });
export const axiosInstanceWithoutSecure = axios.create({ baseURL: apiHost });
export const axiosInstanceWithoutSecureWithFormData = axios.create({ baseURL: apiHost });



axiosInstance.interceptors.request.use((req) => {
    const token = Cookies.get('accessToken') || '';
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
    const token = Cookies.get('accessToken') || '';
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
    const token = Cookies.get('accessToken') || '';
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
    const token = Cookies.get('accessToken') || '';
    const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + token
    }
    req.headers = headers;
    return req;
}, error => {
    return Promise.reject(error);
});

axiosInstanceWithoutSecure.interceptors.request.use((req) => {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    req.headers = headers;
    return req;
}, error => {
    return Promise.reject(error);
});

axiosInstanceWithoutSecureWithFormData.interceptors.request.use((req) => {
    const headers = {
        'Content-Type': 'multipart/form-data'
    }
    req.headers = headers;
    return req;
}, error => {
    return Promise.reject(error);
});


export const getAuth = async (id,isFirst) => {
    return new Promise((resolve, reject) => {
        const refreshToken = Cookies.get('refreshToken') || '';
        if(refreshToken && id){
            let data = {
                uid: id
            };
            let headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'refresh-token': refreshToken
            };
            let url = env.GENERATETOKEN_V2;
            axios.post(apiHost + url, data, { headers }).then((result) => {
                if (isFirst) {
                    localStorage.setItem('updateToken', result.data.token)
                }
                resolve(result.data);
            }).catch((error) => {
                console.error('error', error.response.data);
                reject(error.response.data);
            });
        } else{
            logOut();
        }
    })
};

export const apiRequest = (type, endPoint, data, dataType) => {
    return new Promise((resolve, reject) => {
        try {
            if (type === 'post' || type === 'patch' || type === 'get' || type === 'put') {
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
                        if (err?.response?.data?.isLogout) {
                            logOut();
                        } else if (err?.response?.data?.isJwtError) {
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
                    if (err?.response?.data?.isLogout) {
                        logOut();
                    } else if (err?.response?.data?.isJwtError) {
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

export const apiRequestWithoutSecure = (type, endPoint, data, dataType) => {
    return new Promise((resolve, reject) => {
        try {
            if (type === 'post' || type === 'patch' || type === 'get' || type === 'delete' || type === 'put') {
                let rData;
                if (dataType === 'form') {
                    rData = axiosInstanceWithoutSecureWithFormData[type](endPoint, data);
                } else {
                    rData = axiosInstanceWithoutSecure[type](endPoint, data);
                }
                rData
                    .then((resData) => {
                        resolve(resData);
                    })
                    .catch(async (err) => {
                        reject(err);
                    });
            } else {
                console.info(type)
                reject("API TYPE NOT FOUND");
            }
        } catch (error) {
            console.error('error', error);
            reject(error);
        }
    })
}

export const logOut = async() => {
    const refreshToken = Cookies.get('refreshToken') || '';
    const userId = localStorage.getItem('userId') || '';

    if (userId && refreshToken) {
        try {
            await apiRequestWithoutCompnay("post", env.LOGOUT, {
                id: userId,
                refreshToken: refreshToken
            });            
        } catch (error) {
            console.error('Error in logout', error);
        }
    }    
    localStorage.removeItem("userId");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("selectedCompany");
    localStorage.removeItem("webTokens");
    window.location.reload();
}