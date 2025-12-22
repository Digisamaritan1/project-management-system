

import moment from 'moment';
import { apiRequest, apiRequestWithoutCompnay } from '@/services';
import * as env from '@/config/env';
import { download } from "@/utils/StorageOprations/download";

export function paymentHelper() {
    function subscriptionTabFetchSubscriptionData(currentPage,batchSize,search) {
        return new Promise((resolve, reject) => {
            try {
                let skips = (currentPage.value - 1) * batchSize.value;
        
                let query = 
                [
                    {
                        "$lookup": {
                            "from": "companies",
                            "localField": "companyId",
                            "foreignField": "_id",
                            "pipeline": [
                                { "$project": { "Cst_CompanyName": 1 } }
                            ],
                            "as": "companyData"
                        }
                    },
                    {
                        "$lookup": {
                            "from": "users",
                            "localField": "userId",
                            "foreignField": "_id",
                            "pipeline": [
                                { "$project": { "Employee_FName": 1, "Employee_LName": 1 } }
                            ],
                            "as": "userData"
                        }
                    },
                    {
                        "$match": {
                            "$or": [
                                { "subscriptionId": { "$regex":search.value, "$options": "i" } },
                                { "companyData.Cst_CompanyName": { "$regex":search.value, "$options": "i" } },
                                { "userData.Employee_FName": { "$regex":search.value, "$options": "i" } },
                                { "userData.Employee_LName": { "$regex":search.value, "$options": "i" } }
                            ]
                        }
                    },
                    {
                        "$facet": {
                            "metadata": [{ "$count": "total" }],
                            "data": [{ "$sort": { "createdAt": -1, "_id": 1 } }, { "$skip": skips }, { "$limit": batchSize.value }]
                        }
                    }
                ]
                apiRequest('post',env.SUBSCRIPTIONS,{findQuery:query}).then((response) => {
                    if(response?.status === 200 && response?.data?.length > 0){
                        let arrayData = response.data?.[0]?.data;
                        let subscriptions  = [];
                        subscriptions = arrayData;
                        subscriptions.forEach((ele)=>{
                            ele.planName = `${ele.custom_data.selectedPlan}`;
                            let price = Number(ele.items[0].price.unit_price.amount * ele.items[0].quantity).toFixed(2) < 0 ? Number(ele.items[0].price.unit_price.amount * ele.items[0].quantity).toFixed(2) * -1 : Number(ele.items[0].price.unit_price.amount * ele.items[0].quantity).toFixed(2)
                            ele.price = `$${Number(price/100).toFixed(2)}`
                            ele.compnayName = ele.companyData[0]?.Cst_CompanyName || "";
                            ele.userName = `${ele.userData[0]?.Employee_FName}  ${ele.userData[0]?.Employee_LName}` || "";
                            ele.createdAt = moment(ele.created_at).format('DD MMM, YYYY')
                        })
                        let metaData = response?.data?.[0]?.metadata?.[0];
                        let totalRecords = metaData ? metaData.total : 0;
                        let totalPages = Math.ceil(totalRecords / batchSize.value);
                        resolve({subscriptions: subscriptions, totalPages: totalPages});
                    }else{
                        reject("Empty Response");
                    }
                }).catch((error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    function invoiceTabFetchInvoiceData(currentPage,batchSize,search) {
        return new Promise((resolve, reject) => {
            try {
                let invoices;
                let skips = (currentPage.value - 1) * batchSize.value;
                let query = 
                [
                    {
                        "$lookup": {
                            "from": "companies",
                            "localField": "companyId",
                            "foreignField": "_id",
                            "pipeline": [
                                { "$project": { "Cst_CompanyName": 1 } }
                            ],
                            "as": "companyData"
                        }
                    },
                    {
                        "$lookup": {
                            "from": "users",
                            "localField": "userId",
                            "foreignField": "_id",
                            "pipeline": [
                                { "$project": { "Employee_FName": 1, "Employee_LName": 1 } }
                            ],
                            "as": "userData"
                        }
                    },
                    {
                        "$match": {
                            "$or": [
                                { "invoiceId": { "$regex":search.value, "$options": "i" } },
                                { "companyData.Cst_CompanyName": { "$regex":search.value, "$options": "i" } },
                                { "userData.Employee_FName": { "$regex":search.value, "$options": "i" } },
                                { "userData.Employee_LName": { "$regex":search.value, "$options": "i" } }
                            ],
                            "$and": [
                                {"invoice_number": {"$ne":null}}
                            ]
                        }
                    },
                    {
                        "$facet": {
                            "metadata": [{ "$count": "total" }],
                            "data": [{ "$sort": { "createdAt": -1, "_id": 1 } }, { "$skip": skips }, { "$limit": batchSize.value }]
                        }
                    }
                ]
                apiRequest('post',env.INVOICE,{findQuery: query})
                .then((resp) => {
                    if(resp.status === 200) {
                        const response = resp.data;
                        if(response.length > 0){
                            let arrayData = response[0].data;
                            invoices = arrayData.filter((x)=> x.invoice_number)
                            invoices.forEach((ele)=>{
                                let noofUser = Number(ele.items[0].quantity) < 0 ? Number(ele.items[0].quantity) * -1 : Number(ele.items[0].quantity)
                                let description = `${ele.custom_data.selectedPlan} for ${noofUser} ${noofUser > 1 ? 'users' : 'user'}`;
                                ele.noofUser = noofUser
                                ele.discription = description,
                                ele.date = new Date(ele.created_at)/1000
                                ele.compnayName = ele.companyData[0]?.Cst_CompanyName || "";
                                ele.total =  (ele.items[0].price.unit_price.amount * ele.items[0].quantity) < 0 ? (ele.items[0].price.unit_price.amount * ele.items[0].quantity) * -1 : (ele.items[0].price.unit_price.amount * ele.items[0].quantity),
                                ele.userName = `${ele.userData[0]?.Employee_FName}  ${ele.userData[0]?.Employee_LName}` || "";
                                ele.invoiceId = ele.invoice_number ? ele.invoice_number : '-';
                            })
                            let metaData = response[0].metadata[0];
                            let totalRecords = metaData ? metaData.total : 0;
                            let totalPages = Math.ceil(totalRecords / batchSize.value);
                            resolve({totalPages: totalPages, invoices:invoices});
                            // getSpinner.value = false;
                        }else{
                            reject(`No Invoices Found`);
                            // getSpinner.value = false;
                        }
                    }else{
                        reject();
                    }
                }).catch((error) => {
                    reject(`Error ${error}`);
                    // getSpinner.value = false;
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    function customerUpdate(key, companyId) {
        return new Promise((resolve) => {
            try {
                apiRequest('post',`${env.CUSTOMERUPDATE}`, {key: key, companyId: companyId}).then((response)=>{
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

    function getSubscriptionDataSubscriptionDetailScreen(subscriptionId) {
        return new Promise((resolve, reject) => {
            try {
                let subscriptionData;
                let summarryObj;
                let subscriptionDisplayData;
                apiRequest('get',`${env.SUBSCRIPTIONS}/${subscriptionId}`).then((resp)=>{
                    if(resp && resp.status === 200 && resp.data){
                        subscriptionData = resp.data;
                        let totalUnit = subscriptionData.items[0].quantity;
                        let totalPrice = Number(subscriptionData.items[0].price.unit_price.amount * subscriptionData.items[0].quantity).toFixed(2) < 0 ? Number(subscriptionData.items[0].price.unit_price.amount * subscriptionData.items[0].quantity).toFixed(2) * -1 : Number(subscriptionData.items[0].price.unit_price.amount * subscriptionData.items[0].quantity).toFixed(2);
                        // totalPrice = ``
                        summarryObj = {
                            planName: `${subscriptionData.custom_data.selectedPlan}`,
                            period: '',
                            units: totalUnit,
                            unitPrice: Number(subscriptionData?.items[0]?.price.unit_price.amount / 100).toFixed(2),
                            totalPrice: Number(totalPrice/100).toFixed(2)
                        }
                        subscriptionDisplayData = {
                            subscriptionId: subscriptionData.subscriptionId,
                            createdAt: subscriptionData?.created_at ? moment(subscriptionData.created_at).format("DD MMM YYYY, HH:mm A") : "",
                            plan: subscriptionData.custom_data.selectedPlan,
                            nextRenewalDate: subscriptionData?.next_billed_at ? moment(subscriptionData.next_billed_at).format("DD MMM YYYY, HH:mm A") : "",
                            status: subscriptionData.status
                        }
                        resolve({subscriptionData: subscriptionData,summarryObj: summarryObj,subscriptionDisplayData: subscriptionDisplayData});
                    }else{
                        resolve({subscriptionData: {},summarryObj: {},subscriptionDisplayData: {}});
                    }
                }).catch((error)=>{
                    console.error(error);
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    function getOwnerDetails(subscriptionData) {
        return new Promise((resolve, reject) => {
            try {
                apiRequest('get',`${env.USER}/${subscriptionData.value.customer_id}?query=customerId`).then((resp)=>{
                    if(resp.status === 200){
                        resolve({owner: resp.data})
                    }else{
                        resolve({owner: {}})
                    }
                }).catch((error)=>{
                    reject(error);
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    function getCompanyDetails(subscriptionData) {
            return new Promise((resolve, reject) => {
                try {
                    apiRequest("post",`${env.COMPANYACTION}`,{companyIds: [subscriptionData.value.companyId],fetchAllCompany: false})
                    .then((resp)=>{
                        if(resp.status === 200){
                            const result = resp.data && resp.data[0] || {};
                            resolve({company: result});
                        }
                        else{
                            resolve({company: {}});
                        }
                    }).catch((error)=>{
                        reject(error);
                    })      
                } catch (error) {
                    reject(error);
                }
            })
        }

    function getPaymentSource() {
        return new Promise((resolve, reject) => {
            try {
                resolve({cardDetails: {}})
            } catch (error) {
                reject(error);
            }
        });
    }

    function getInvoices(subscriptionId) {
        return new Promise((resolve, reject) => {
            try {
                let invoiceArray;
                let query = [
                    {
                        $match: {
                            subscription_id : subscriptionId
                        }
                    }
                ];
                apiRequest('post',env.INVOICE,{findQuery: query})
                .then((resp)=>{
                    if(resp.status === 200) {
                        const result = resp.data;
                        invoiceArray = result.filter((x) => x.invoice_number);
                        invoiceArray.forEach((ele)=>{
                            let noofUser = Number(ele.items[0].quantity) < 0 ? Number(ele.items[0].quantity) * -1 : Number(ele.items[0].quantity)
                            let description = `${ele.custom_data.selectedPlan} for ${noofUser} ${noofUser > 1 ? 'users' : 'user'}`;
                            ele.noofUser = noofUser
                            ele.discription = description
                            ele.invoiceId = ele.invoice_number
                            ele.date = new Date(ele.created_at).getTime()/1000;
                            ele.total = Number(ele.items[0].price.unit_price.amount * ele.items[0].quantity).toFixed(2) < 0 ? Number(ele.items[0].price.unit_price.amount * ele.items[0].quantity).toFixed(2) * -1 : Number(ele.items[0].price.unit_price.amount * ele.items[0].quantity).toFixed(2)
                        })
                        resolve({invoices: invoiceArray});
                    }else{
                        reject()
                    }
                }).catch((error)=>{
                    reject(error);
                })      
            } catch (error) {
                reject(error);
            }
        })
    }

    function getSubscriptionTransectionHelper(subscriptionId) {
        return new Promise((resolve, reject) => {
            try {
                let array = [];
                let query = [
                    {
                        $match: {
                            subscription_id : subscriptionId
                        }
                    }
                ];
                apiRequest('post',env.INVOICE,{findQuery: query})
                .then((resp)=>{
                    if(resp.status === 200) {
                        const result = resp.data;
                        array = result
                        array.forEach((ele)=>{
                            ele.occuredOn= new Date(ele.created_at).getTime()/1000,
                            ele.type= '',
                            ele.paymentMethod= ele.payments[0]?.method_details?.type || '',
                            ele.amount= ele.details?.totals.grand_total
                        })
                        resolve({transaction: array});
                    }
                }).catch((error)=>{
                    reject(error);
                }) 
            } catch (error) {
                reject(error);
            }
        }) 
    }

    function subscriptionInvoiceTabDownloadFunction (data) {
        apiRequest("post", env.GETTRANSECTIONPDFURL, {
            transectionId: data.id.includes('txn') ? data.id : data.transectionId,
        }).then((resp) => {
            download(resp.data.message, `${data.id}.pdf`).catch((error) => {
                console.error('Error while downloading file.', error);
            });
        }).catch((error) => {
            console.error(error);
        })
    }

    function companySubscriptionDetailFunction (subscriptionId) {
        return new Promise((resolve, reject) => {
            try {
                let subscriptionData;
                apiRequest('get',`${env.SUBSCRIPTIONS}/${subscriptionId}`).then((res)=>{
                    if(res && res?.status === 200){
                        subscriptionData = res.data;
                        if (Object.keys(subscriptionData).length) {
                            let currentPlan = res.custom_data.selectedPlan;
                            let nextRenewDate = moment(subscriptionData?.next_billed_at).format('DD MMM, YYYY')
                            let price = Number(res.items[0].price.unit_price.amount * res.items[0].quantity).toFixed(2) < 0 ? Number(res.items[0].price.unit_price.amount * res.items[0].quantity).toFixed(2) * -1 : Number(res.items[0].price.unit_price.amount * res.items[0].quantity).toFixed(2)
                            let newxtPaybleAmount = `$${Number(Number(price/100).toFixed(2) * res.items[0].quantity).toFixed(2)}`
                            resolve({subscriptionData: subscriptionData, newxtPaybleAmount: newxtPaybleAmount, currentPlan: currentPlan,nextRenewDate:nextRenewDate})
                        } else {
                            reject("Subscription Data Not Found");
                        }
                    }else {
                        reject("Subscription Data Not Found");
                    }
                }).catch((error)=>{
                    reject(error);
                })      
            } catch (error) {
                reject(error);
            }
        })
    }


    function getCompanyDEtailInvoiceTabInvoiceGet(companyId) {
        return new Promise((resolve, reject) => {
            try {
                apiRequestWithoutCompnay("post", env.ADMIN_GETINVOICEANDCREDITNOTES, {
                    companyId: companyId
                }).then((resp) => {
                    // if(resp.data.status == true) {
                        let invoices = resp.data.invoiceArray
                        let payments = resp.data.creditNoteArray
                        invoices?.forEach((invoice) => {
                            invoice.date = new Date(invoice.date).getTime() /1000;
                        })
                        payments?.forEach((payment) => {
                            payment.date = new Date(payment.date).getTime() /1000;
                        })
                        resolve({invoices:invoices,payments:payments});
                    // } else {
                    //     reject(resp.data);
                    // }
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    function getCompanyDetailPaymentTableHeaders () {
        return [
            {name:'Transaction ID'},
            {name:'Date'},
            {name:''},
            {name:'Amount'},
            {name:'Status   '}
        ]
    }

    function getTodaysPaymentIncome() {
        return new Promise((resolve, reject) => {
            try {
                let query = [{
                    $match: {
                        createdAt: {
                            dbDate: {
                                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                $lte: new Date(new Date().setHours(23, 59, 59))
                            }
                        },
                        invoice_number: { $ne: null }
                    }
                }, {
                    $group: {
                        _id: null,
                        totalIncome: { 
                            $sum: {
                                "$toInt": "$details.totals.grand_total"
                            } } // Calculate total income for today
                    }
                }];
                apiRequest('post',env.INVOICE,{findQuery: query})
                .then((resp) => {
                    if(resp.status === 200) {
                        const response = resp.data;
                        let todayInc;
                        if(response.length > 0) {
                            todayInc = (response[0].totalIncome)/100;
                        } else {
                            todayInc = 0;
                        }
                        resolve({todayIncome: todayInc})
                    }
                }).catch((error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    function getEarningPaymentData(year) {
        return new Promise((resolve, reject) => {
            try {
                let query = [{
                    $match: {
                        $expr: {
                            $eq: [{$year: "$createdAt"}, year],
                        },
                        "$and": [
                            {"invoice_number": {"$ne":null}}
                        ]
                    },
                }, {
                    $group: {
                        _id: {
                            $month: "$createdAt"
                        },
                        totalRecords: {
                            $sum: 1
                        },
                        totalAmount: {
                            $sum: {
                                "$toInt": "$details.totals.grand_total"
                            }
                        }
                    }
                }, {
                    $project: {
                        _id: 0,
                        month: "$_id",
                        totalRecords: 1,
                        totalAmount: 1
                    }
                }, {
                    $sort: {
                        month: 1
                    }
                }];
                apiRequest('post',env.INVOICE,{findQuery: query})
                .then((resp) => {
                    if(resp.status === 200) {
                        const response = resp.data;
                        resolve(response);
                    }
                    else{
                        reject();
                    }
                }).catch((error) => {
                    reject(error);
                }); 
            } catch (error) {
                reject(error);
            }
        })
    }

    function getSubscriptionCountHome(year,selectedSubscriptionsYear) {
        return new Promise((resolve, reject) => {
            try {
                if (!year) {
                    year = Number(selectedSubscriptionsYear.value);
                }
                const previousYear = year - 1;
                let query = [{
                    $match: {
                        $or: [{
                            $expr: {
                                $eq: [{
                                    $year: "$createdAt",
                                },
                                year]
                            }
                        }, {
                            $expr: {
                                $eq: [{
                                    $year: "$createdAt"
                                },
                                previousYear]
                            }
                        }],
                        "$and": [
                            {"invoice_number": {"$ne":null}}
                        ]
                    }
                }, {
                    $group: {
                        _id: {
                            year: {
                                $year: "$createdAt"
                            },
                            month: {
                                $month: "$createdAt"
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                }];
                apiRequest('post',env.INVOICE,{findQuery: query})
                .then((res) => {
                    if(res.status === 200) {
                        const response = res.data;
                        resolve({resp: response,previousYear: previousYear, year: year});
                    }
                }).catch((error) => {
                    reject(error);
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    function manageAllPlansHome() {
        return new Promise((resolve, reject) => {
            try {
                let query = [{
                    $project: {
                        _id: "$_id",
                    }
                }];
                apiRequest("post",`${env.COMPANYACTION}/find`,{findQuery: query})
                .then((resp) => {
                    if(resp.status === 200){
                        const response = resp.data;
                        let companyIds = [];
                        if(response.length > 0) {
                            response.forEach(element => {
                                companyIds.push(element._id);
                            });
                            const planQuery = [{
                                $match: {
                                    companyId: {
                                        objId: {$in: companyIds}
                                    }
                                }
                            }, {
                                $group: {
                                    _id: "$custom_data.selectedPlan",
                                    myCount: {
                                        $sum: 1
                                    }
                                }
                            }, {
                                $lookup: {
                                    from: "subscriptionPlan",
                                    localField: "_id",
                                    foreignField: "planName",
                                    as: "result"
                                }
                            }]
                            apiRequest('post',env.SUBSCRIPTIONS,{findQuery:planQuery}).then((planRes) => {
                                if(planRes?.status === 200 && planRes?.data){
                                    resolve({isResponseLength: true, data: planRes.data});
                                }else{
                                    resolve({isResponseLength: false, data: []});
                                }
                            }).catch((error) => {
                                reject(error);
                            });
                        } else{
                            resolve({isResponseLength: false})
                        }
                    } else {
                        resolve({isResponseLength: false})
                    }
                }).catch((error) => {
                    reject(error);
                }); 
            } catch (error) {
                reject(error);
            }
        })
    }

    return {
        subscriptionTabFetchSubscriptionData,
        getSubscriptionDataSubscriptionDetailScreen,
        getSubscriptionTransectionHelper,
        getOwnerDetails,
        getCompanyDetails,
        getPaymentSource,
        getInvoices,
        subscriptionInvoiceTabDownloadFunction,
        invoiceTabFetchInvoiceData,
        companySubscriptionDetailFunction,
        getCompanyDEtailInvoiceTabInvoiceGet,
        getCompanyDetailPaymentTableHeaders,
        getTodaysPaymentIncome,
        getEarningPaymentData,
        getSubscriptionCountHome,
        manageAllPlansHome,
        customerUpdate
    }
}