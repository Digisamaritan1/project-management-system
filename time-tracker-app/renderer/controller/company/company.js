import { setAssignCompany, setCurrentCompany, setCompanyUser, setSettings, setRules } from '../../store/companySlice';
import store from '../../store/store';
import { apiRequest, apiRequestWithoutCompnay } from '../../utils/services';

export const setCompanyRulesToStore = async () => {
    return new Promise(async (resolve, reject) => {        
        try {
            const cUser = await getCompanyUser();
            store.dispatch(setCompanyUser({ ...cUser, id: cUser._id }));
    
            const companySettings = await getCompanySettings();
            store.dispatch(setSettings({ ...companySettings, id: companySettings._id }));
    
            const res = await apiRequest("get", `/api/v1/securityPermissions`);
            const data = res?.data?.map(item => ({ ...item, id: item._id }));
            store.dispatch(setRules(data));
            resolve();
        } catch (error) {
            store.dispatch(setRules([]));
            console.error("Error setting company rules:", error);
            reject();
        }
    })
};

const getCompanyUser = async () => {
    try {
        const userID = store.getState().user.user._id;
        
        const res = await apiRequest("get", `/api/v1/members/${userID}`);
        return res?.data || {};
    } catch (error) {
        console.error("Error fetching company user:", error);
        throw error;
    }
};

const getCompanySettings = async () => {
    try {
        const res = await apiRequest("get", `/api/v1/commonDateFormate`);
        return res?.data[0] || {};
    } catch (error) {
        console.error("Error fetching company settings:", error);
        throw error;
    }
};

export const getAssignCompanyData = () => {
    return new Promise((resolve, reject) => {
        try {
            const user = store.getState().user.user;
            apiRequestWithoutCompnay("post", `/api/v1/admin/company/find`, {
                findQuery: [
                    {
                        $match: {
                            _id: {
                                objId: { $in: user.AssignCompany }
                            }
                        }
                    }
                ]
            })
            .then((res) => {
                if (res?.data?.length > 0) {
                    var compny = res?.data?.map(item => ({ ...item, id: item._id }))
                    store.dispatch(setAssignCompany(compny));
                    if (!localStorage.getItem("companyId")) {
                        store.dispatch(setCurrentCompany(compny[0]));
                        localStorage.setItem("companyId",compny[0].id);
                        // Call the function here
                    } else {
                        store.dispatch(setCurrentCompany(compny[0]));
                    }
                    setCompanyRulesToStore();
                    resolve(compny)
                } else {
                    resolve([])
                }
            }).catch(error => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}