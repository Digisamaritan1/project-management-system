import * as env from '@/config/env';
import { apiRequest, apiRequestWithoutCompnay } from '@/services';


const addSubscription = (companyIdRoute, response) => {
    apiRequestWithoutCompnay("post", env.ADD_DEFAULT_SUBSCRIPTION, {companyId : companyIdRoute, userId : response.data.statusText._id}).catch((error) => {
        console.error(error,"ERROR");
    });
};

const displayUpgrade = (selectedCompany, chargeBeePriceData, companyOwner) => {
    return new Promise((resolve) => {
        
        if (chargeBeePriceData.length && companyOwner.isCurrentUser)  {
            if (selectedCompany && selectedCompany.SubcriptionId && selectedCompany.SubcriptionId !== '') {
                const removeSalesPlans = chargeBeePriceData.filter((x) => !x.isContactSupport).sort((a, b) => a.sortIndex - b.sortIndex);
                apiRequest('get',`${env.SUBSCRIPTIONS}/${selectedCompany.SubcriptionId}`).then((response)=>{
                    if(response && response?.status === 200 && response?.data){
                        const currentPlanIndex = removeSalesPlans.findIndex((x) => x.planName === response.data.cf_selected_plan);
                        if ((currentPlanIndex + 1) === removeSalesPlans.length) {
                            if (response?.data?.billing_period_unit === "year") {
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        } else {
                            resolve(true);
                        }
                    }else{
                        resolve(false);
                    }
                }).catch((error)=>{
                    console.error(error);
                    resolve(false);
                })
            } else {
                resolve(true);
            }
        } else {
            resolve(false);
        }
    });
}

const paymentInit = () => {
    const script = document.createElement('script');
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js"; // Get the src from plugin options
    script.async = true; // Optional: set the script to load asynchronously
    script.onload = () => {
    }
    // Append the script to the head
    document.head.appendChild(script);
}

const customerUpdate = (key) => {
    return new Promise((resolve) => {
        try {
            apiRequest('post',`${env.CUSTOMERUPDATE}`, {key: key}).then((response)=>{
                if (response && response?.status === 200 && response?.data) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch((error) => {
                console.error(error);
                resolve(false);
            });
        } catch (error) {
            console.error(error);
            resolve(false);
        }
    })
}

export default {
    paymentInit,
    addSubscription,
    displayUpgrade,
    customerUpdate
};
