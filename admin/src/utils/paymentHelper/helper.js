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
                            let planName  = ele.subscription_items[0].item_price_id.split("-")[0];
                            let planPeriod = ele.subscription_items[0].item_price_id.split("-").pop();
                            ele.planName = `${planName}(${planPeriod})`;
                            let price = 0;
                            ele.subscription_items.forEach((dt)=>{
                                price += Number(dt.amount)
                            })
                            ele.price = `$${(Number(price)/100).toFixed(2)}`
                            ele.compnayName = ele.companyData[0]?.Cst_CompanyName || "";
                            ele.userName = `${ele.userData[0]?.Employee_FName}  ${ele.userData[0]?.Employee_LName}` || "";
                            ele.createdAt = moment(ele.created_at * 1000).format('DD MMM, YYYY')
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
                            invoices = arrayData
                            invoices.forEach((ele)=>{
                                let planName  = ele.line_items[0].entity_id.split("-")[0]
                                let planPeriod = ele.line_items[0].entity_id.split("-").pop()
                                ele.noofUser = ele.line_items.reduce((acc, item) => acc + item.quantity, 0)
                                ele.discription = `${planName}-${planPeriod} Plan for ${ele.noofUser} ${ele.noofUser > 1 ? 'users' : 'user'}`,
                                ele.compnayName = ele.companyData[0]?.Cst_CompanyName || "";
                                ele.userName = `${ele.userData[0]?.Employee_FName}  ${ele.userData[0]?.Employee_LName}` || "";
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
                        let totalUnit = 0;
                        let totalPrice = 0;
                        subscriptionData.subscription_items.forEach((element) => {
                            totalUnit += Number(element.quantity)
                            totalPrice += Number(element.amount)
                        });
                        summarryObj = {
                            planName: subscriptionData?.subscription_items[0]?.item_price_id?.split("-")[0],
                            period: subscriptionData?.subscription_items[0]?.item_price_id?.split("-")[2],
                            units: totalUnit,
                            unitPrice: Number(subscriptionData?.subscription_items[0]?.unit_price / 100).toFixed(2),
                            totalPrice: Number(totalPrice/100).toFixed(2)
                        }
                        subscriptionDisplayData = {
                            subscriptionId: subscriptionData.subscriptionId,
                            createdAt: subscriptionData?.created_at ? moment(subscriptionData.created_at*1000).format("DD MMM YYYY, HH:mm A") : "",
                            plan: subscriptionData?.subscription_items ? subscriptionData?.subscription_items[0].item_price_id.split("-")[0] : "",
                            nextRenewalDate: subscriptionData?.next_billing_at ? moment(subscriptionData.next_billing_at*1000).format("DD MMM YYYY, HH:mm A") : "",
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

    function getPaymentSource(subscriptionData) {
        return new Promise((resolve, reject) => {
            try {
                if (subscriptionData.value.payment_source_id) {
                    apiRequestWithoutCompnay("get", `${env.SUBSCRIPTIONPAYMENTRESOURCE}/${subscriptionData.value.payment_source_id}`).then((res)=>{
                        let card = res?.data?.payment_source?.card || {}
                        resolve({cardDetails: card})
                    }).catch((error)=>{
                        reject(error);
                    })     
                } else {
                    resolve({cardDetails: {}})
                }
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
                        invoiceArray = result;
                        invoiceArray.forEach((ele)=>{
                            let planName  = ele.line_items[0].entity_id.split("-")[0]
                            let planPeriod = ele.line_items[0].entity_id.split("-").pop()
                            ele.noofUser = ele.line_items.reduce((acc, item) => acc + item.quantity, 0)
                            ele.discription = `${planName}-${planPeriod} Plan for ${ele.noofUser} ${ele.noofUser > 1 ? 'users' : 'user'}`
                        })
                        resolve({invoices: invoiceArray});
                    }
                    else{
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
                apiRequestWithoutCompnay("get", `${env.SUBSCRIPTIONTRANSECTION}/${subscriptionId}`).then((res)=>{
                    let array = [];
                    res.data?.list.forEach((ele)=>{
                        let pym = JSON.parse(ele.transaction.payment_method_details).card;
                        let paymentMethod;
                        if (pym) {
                            paymentMethod = `${pym.brand} ending ${pym.last4}`
                        } else {
                            paymentMethod = ''
                        }
                        array.push({
                            id: ele.transaction.id,
                            occuredOn: ele.transaction.date,
                            status: ele.transaction.status,
                            type: ele.transaction.type,
                            paymentMethod: paymentMethod,
                            amount: ele.transaction.amount
                        })
                    })
                    resolve({transaction: array});
                }).catch((error)=>{
                    reject(error);
                })
            } catch (error) {
                reject(error);
            }
        }) 
    }

    function subscriptionInvoiceTabDownloadFunction (data) {
        const formData = {
            id: data.invoiceId ? data.invoiceId : data.id,
            key: data.type === 'credit_note' ? 'CreditNotes' : 'Invoice'
        }
        
        apiRequestWithoutCompnay("post", env.GET_INVOICE_AND_CREDITNOTE_URL, formData).then((response)=>{
            if(response.data.status === true){
                download(response.data.url, `${data.invoiceId ? data.invoiceId : data.id}.pdf`, "rename").catch((error) => {
                    console.error('Error while downloading file.', error);
                });
            }
        }).catch((err)=>{
            console.error(err,"error in get data");
        })

        // if (data.type !== 'credit_note' && data.invoiceHtml) {
        //     // REPLACE THE DIRECT STYLING WITH PARENT STYLED
        //     let invoiceHTML = data.invoiceHtml;
        //     if(!invoiceHTML.includes(`.PDF_design_wrapper *`)) {
        //         invoiceHTML = invoiceHTML.replace("*", ".PDF_design_wrapper *")
        //     }
        //     if(!invoiceHTML.includes(".PDF_design_wrapper table")) {
        //         invoiceHTML = invoiceHTML.replace("table", ".PDF_design_wrapper table")
        //     }
        //     if(!invoiceHTML.includes(".PDF_design_wrapper th")) {
        //         invoiceHTML = invoiceHTML.replace("th", ".PDF_design_wrapper th")
        //     }
        //     if(!invoiceHTML.includes(".PDF_design_wrapper th, .PDF_design_wrapper td")) {
        //         invoiceHTML = invoiceHTML.replace("th,td", ".PDF_design_wrapper th, .PDF_design_wrapper td")
        //     }
        //     if(!invoiceHTML.includes(".PDF_design_wrapper th:first-child, .PDF_design_wrapper td:first-child")) {
        //         invoiceHTML = invoiceHTML.replace("th:first-child,td:first-child", ".PDF_design_wrapper th:first-child, .PDF_design_wrapper td:first-child");
        //     }

        //     html2pdf(invoiceHTML, {
        //         margin: 1,
        //         filename: `${data.invoiceId}.pdf`,
		// 	});
        // }
        // if (data.type === 'credit_note') {
        //     let path = `InvoiceAndCreditNotes/${data.type === 'credit_note' ? 'CreditNotes' : 'Invoice'}/${data.companyId}/${data.invoiceId}.pdf`;
        //     const formData = {
        //         companyId: data.companyId,
        //         path: path
        //     }
        //     apiRequestWithoutCompnay("post", env.WASABI_RETRIVE_USER_PROFILE, formData).then((response)=>{
        //         if(response.data.status === true){
        //             download(response.data.statusText, `${data.invoiceId}.pdf`).catch((error) => {
        //                 console.error('Error while downloading file.', error);
        //             });
        //         }
        //     }).catch((err)=>{
        //         console.error(err,"error in get data");
        //     })
        // }
    }

    function companySubscriptionDetailFunction (subscriptionId,chargeBeePriceData) {
        return new Promise((resolve, reject) => {
            try {
                let subscriptionData;
                apiRequest('get',`${env.SUBSCRIPTIONS}/${subscriptionId}`).then((res)=>{
                    if(res && res?.status === 200){
                        subscriptionData = res.data;
                        if (Object.keys(subscriptionData).length) {
                            let curr = subscriptionData.subscription_items.find((x)=> x.item_type == 'plan')?.item_price_id || ''
                            let itemPrice = chargeBeePriceData?.find((x)=> x.itemPriceArray.find((x)=> x.id == curr) || '') || ''
                            let period = itemPrice?.itemPriceArray?.find((x)=> x.id == curr).period_unit || '';
                            let newxtPaybleAmount = `${Number((subscriptionData.subscription_items.reduce((acc, item) => acc + item.amount, 0))/100).toFixed(2)} ${period !== '' ? period === 'month' ? '/ Month' : '/ Year' : ''}`;
                            let currentPlan = itemPrice.planDetails?.name;
                            let nextRenewDate = moment(subscriptionData?.next_billing_at * 1000).format('DD MMM, YYYY')
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
                    if(resp.data.status == true) {
                        let invoices = resp.data.transectionData.invoiceArray
                        let payments = resp.data.transectionData.creditNoteArray
                        resolve({invoices:invoices,payments:payments});
                    } else {
                        reject(resp.data);
                    }
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
            {name:'Plan'},
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
                        }
                    }
                }, {
                    $group: {
                        _id: null,
                        totalIncome: { $sum: "$amount_paid" } // Calculate total income for today
                    }
                }];

                apiRequest('post',env.INVOICE,{findQuery: query})
                .then((resp) => {
                    if(resp.status === 200) {
                        const response = resp.data;
                        let todayInc;
                        if(response.length > 0) {
                            todayInc = response[0].totalIncome/100;
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
                            $eq: [{$year: "$createdAt"}, year]
                        }
                    }
                }, {
                    $group: {
                        _id: {
                            $month: "$createdAt"
                        },
                        totalRecords: {
                            $sum: 1
                        },
                        totalAmount: {
                            $sum: "$amount_paid"
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
                    }else{
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
                        }]
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
                        resolve({resp: response,previousYear: previousYear,year: year});
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
                                    _id: "$cf_selected_plan",
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
                        }else{
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
        customerUpdate,
        companySubscriptionDetailFunction,
        getCompanyDEtailInvoiceTabInvoiceGet,
        getCompanyDetailPaymentTableHeaders,
        getTodaysPaymentIncome,
        getEarningPaymentData,
        getSubscriptionCountHome,
        manageAllPlansHome
    }
}