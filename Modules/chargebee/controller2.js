const config = require("../../Config/config");
const logger = require("../../Config/loggerConfig");
var chargebee = require("chargebee");
const axios = require('axios');
const invoiceMailTemplate = require('../Template/emailTemplate/invoiceTemplate');
const { dbCollections } = require("../../Config/collections");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries");
const moment = require("moment");
const { SCHEMA_TYPE } = require("../../Config/schemaType");
const { default: mongoose } = require("mongoose");
const { handleChargeebeCreditNotUpload } = require(`../../common-storage/common-${process.env.STORAGE_TYPE}.js`);
chargebee.configure({
    site : config.CHARGEBEE_SITE,
    api_key : config.CHARGEBEE_API_KEY
})
const { removeCache } = require("../../utils/commonFunctions");
const { getCompanyDataFun, updateCompanyFun } = require("../Company/controller/updateCompany.js");
const {
    getAllSubscriptionPlansPromise,
    updateSubscriptionPlanPromise,
  } = require("../SubscriptionPlan/controller.js");
const { updateUserFun, getUserByQueyFun } = require("../usersModule/controller.js");
const { updateMemberFunction } = require('../settings/Members/controller.js');
const socketEmitter = require('../../event/socketEventEmitter');
const { storeRefferalCreditsAfterTransection } = require("../affiliate/controller.js");

exports.getCompanyData = (companyId, cb) => {
    try {
        let companyQueryObj = {
            type: dbCollections.COMPANIES,
            data: [
                {
                    _id: companyId,
                }
            ]
        }
        MongoDbCrudOpration("global", companyQueryObj, "findOne").then((resp)=>{
            if (!(resp && resp._id)) {
                cb({
                    status: false,
                    statusText: 'company data not found.'
                });
                return;
            }
            cb({
                status: true,
                data: resp
            });
        }).catch((error) => {
            logger.error(`Get Company Error: ${error?.message || error}`);
            cb({
                status: false,
                error: error?.message || error
            });
        })
    } catch (error) {
        logger.error(`Get Company Error: ${error?.message || error}`);
        cb({
            status: false,
            error: error?.message || error
        });
    }
}


/**
 * get A Subscription From SUBSCRIPTION iD
 * @param {String} subscriptionId 
 */
exports.getSubscriptionDetails = (req, res) => {
    try {
        const {sid} = req.params;

        if(!sid) {
            return res.status(400).json({status: false, error: "No subscription id found"})
        }
        chargebee.subscription.retrieve(sid).request((error,result) => {
            if(error){
                res.send({
                    status: false,
                    error: error
                });
                return;
            }else{
                let subscription = result.subscription;

                res.send(subscription);
            }
        });
    } catch (error) {
        res.status(400).json({status: false, error: error.message});
    }
}


/**
 * Cancel Subscription
 * @param {String} subscriptionId 
 */
exports.cancelSubscription = (subscriptionId) => {
    try {
        chargebee.subscription.cancel_for_items(subscriptionId).request(function(error, result) {
            if (error) {
                logger.error(`Subscription Cancel Error: ${JSON.stringify(error, null, 4)}`);
                return;
            }
        });
    } catch (error) {
        logger.error(`Subscription Cancel Try Catch Error: ${error?.message || error}`);
    }
}


/**
 * Create A Subscription From Webhhok Of Chargbee
 * @param {Object} webhookData - WebhhokData Object 
 */
exports.createSubscriptionData = (webhookData) => {
    try {
        if(webhookData.customer.cf_domain_link == config.WEBURL) {
            getCompanyDataFun([webhookData.subscription.cf_company_id])
            .then((res) => {
                const companyData = res[0];
                if (companyData?.SubcriptionId && companyData?.SubcriptionId !== webhookData?.subscription?.id) {
                    exports.cancelSubscription(companyData?.SubcriptionId);
                }
                let subscriptionId = JSON.parse(JSON.stringify(webhookData.subscription.id));
                delete webhookData.subscription.id
                let subScriptionObj = {
                    type: dbCollections.SUBSCRIPTIONS,
                    data: {
                        subscriptionId: subscriptionId,
                        ...webhookData.subscription,
                        userId: new mongoose.Types.ObjectId(companyData.userId),
                        companyId: new mongoose.Types.ObjectId(webhookData.subscription.cf_company_id)
                    }
                }
                MongoDbCrudOpration("global", subScriptionObj, "save").then(()=>{
                    let planObj = {
                        type: dbCollections.PLANFEATURE,
                        data: [
                            {
                                planName: webhookData.subscription.cf_selected_plan
                            }
                        ]
                    }
                    MongoDbCrudOpration("global", planObj, "findOne").then((planFeature)=>{
                        let companyObj = {
                            type: dbCollections.COMPANIES,
                            data: [
                                {
                                    _id: webhookData.subscription.cf_company_id
                                },
                                {
                                    SubcriptionId: subscriptionId,
                                    subscriptionRenewalDate: webhookData.subscription.next_billing_at,
                                    customerId: webhookData.customer.id,
                                    isInactive: false,
                                    planFeature: planFeature,
                                    availableUser: 0
                                },
                                {
                                    returnDocument: 'after'
                                }
                            ]
                        }
                        updateCompanyFun(SCHEMA_TYPE.GOLBAL,companyObj,"findOneAndUpdate",webhookData.subscription.cf_company_id)
                        .then((response) => {
                            socketEmitter.emit('update', { type: "update", data: response , updatedFields: {
                                SubcriptionId: subscriptionId,
                                subscriptionRenewalDate: webhookData.subscription.next_billing_at,
                                customerId: webhookData.customer.id,
                                isInactive: false,
                                planFeature: planFeature,
                                availableUser: 0
                            }, module: 'companies' });
                            exports.updateRestrictProject({planFeature, companyId: webhookData.subscription.cf_company_id})
                        }).catch((err) => {
                            logger.error(`Create Subscription Update COMPANY ERROR Error: ${err} `)
                        })
                    }).catch((error)=>{
                        logger.error(`createSubscriptionData GET PLANFEATURE ERROR ${error.message ? error.message : error}`);
                    })
                }).catch((error)=>{
                    logger.error(`createSubscriptionData SET SUBSCRIPTION ERROR ${error.message ? error.message : error}`);
                })
            })
            .catch((error) => {
                logger.error(`createSubscriptionData GET USER ERROR ${error.message ? error.message : error}`);
            })
        }
    } catch (error) {
      logger.error(`createSubscriptionData error ${error}`);
    }
}


/**
 * Store Invoice after every payment
 * @param {Object} webhookData - WebhhokData Object 
 */
exports.paymentSucessData = (webhookData,isDirectPaymentWebhook=true) => {
    try {
        if(webhookData.customer.cf_domain_link == config.WEBURL) {
            let invoice = webhookData.invoice;
            let invoiceId = JSON.parse(JSON.stringify(invoice.id));
            delete invoice.id;
            if (isDirectPaymentWebhook) {
                if (invoice.amount_paid > 0) {
                    try {
                        storeRefferalCreditsAfterTransection(invoice,webhookData.subscription.cf_company_id).then((ele)=>{
                            if (ele.isAddPromotional) {
                                exports.storePromotionalCredit(ele.addedAmount,ele.customerId,ele.desription);
                            }
                        }).catch((error)=>{
                            logger.error(`Error while storing refferal credits after transection: ${error?.message || error}`);
                        });
                    } catch (error) {
                        logger.error(`Error while processing invoice for refferal ${error?.message || error}`);
                    }
                }
            }
            exports.storeInvoive(invoice,webhookData.subscription.cf_company_id,invoiceId,webhookData.subscription);

            if (webhookData?.invoice?.status === "payment_due") {
                return;
            }

            let compObj = {
                type: dbCollections.COMPANIES,
                data: [
                    {
                        _id: webhookData.subscription.cf_company_id
                    },
                    {
                        isPaymentFailed: false,
                        paymentFailed_error_text: ''
                    },
                    {
                        returnDocument: 'after'
                    }
                ]
            }
            updateCompanyFun(SCHEMA_TYPE.GOLBAL,compObj,"findOneAndUpdate",webhookData.subscription.cf_company_id)
            .then((response) => {
                socketEmitter.emit('update', { type: "update", data: response , updatedFields: {
                    isPaymentFailed: false,
                    paymentFailed_error_text: ''
                }, module: 'companies' });
            })
            .catch((error)=>{
                logger.error(`Error Updating Invoice Failed Field In Company: ${error}`);
            })
        }
    } catch (error) {
        logger.error(`Payment Sucess Catch ${error.message ? error.message : error}`);
    }
}

/**
 * Store Invoice after every payment failed
 * @param {Object} webhookData - WebhhokData Object 
 */
exports.paymentFailedData = (webhookData) => {
    try {
        if(webhookData.customer.cf_domain_link == config.WEBURL) {
            const invoice = webhookData.invoice;
            let invoiceId = JSON.parse(JSON.stringify(invoice.id));
            delete invoice.id;
            exports.storeInvoive(invoice,webhookData.subscription.cf_company_id,invoiceId,webhookData.subscription);
            if (webhookData.subscription && webhookData.subscription.cf_company_id) {
                let compObj = {
                    type: dbCollections.COMPANIES,
                    data: [
                        {
                            _id: webhookData.subscription.cf_company_id
                        },
                        {
                            isPaymentFailed: true,
                            paymentFailed_error_text: webhookData.transaction.error_text
                        },
                        {
                            returnDocument: 'after'
                        }
                    ]
                }
                updateCompanyFun(SCHEMA_TYPE.GOLBAL,compObj,"findOneAndUpdate",webhookData.subscription.cf_company_id)
                .then((response) => {
                    socketEmitter.emit('update', { type: "update", data: response , updatedFields: {
                        isPaymentFailed: true,
                        paymentFailed_error_text: webhookData.transaction.error_text
                    }, module: 'companies' });
                })
                .catch((error)=>{
                    logger.error(`Error Updating Invoice Failed Field In Company: ${error}`);
                })
            } else {
                logger.error(`Error PAyment Failed Data Company Id Not Found for customer  ${webhookData.transaction.customer_id} for transaction ${webhookData.transaction.id}`)
            }
        }
    } catch (error) {
        logger.error(`Payment Failed Catch ${error}`);
    }
};

/**
 * Update Subscription Object In db
 * @param {Object} webhookData - WebhhokData Object 
 */
exports.updateSubscriptionData = (webhookData,isPlanUpdate = true) => {
    try {
        if(webhookData.customer.cf_domain_link == config.WEBURL) {
            let subscription = webhookData.subscription;
            let subscriptionId = JSON.parse(JSON.stringify(subscription.id))
            delete subscription.id;
            let obj = {
                type: dbCollections.SUBSCRIPTIONS,
                data: [
                    {
                        subscriptionId: subscriptionId
                    },
                    {...subscription},
                ]
            }
            MongoDbCrudOpration("global",obj, "findOneAndUpdate").then(()=>{
                if(webhookData.invoice) {
                    exports.paymentSucessData(webhookData,false);
                } else {
                    // if (webhookData.credit_notes) {
                    //     exports.updateCreditNote(webhookData);
                    // }
                }
                if (isPlanUpdate == true) {
                    let planObj = {
                        type: dbCollections.PLANFEATURE,
                        data: [
                            {
                                planName: webhookData.subscription.cf_selected_plan
                            }
                        ]
                    }
                    MongoDbCrudOpration("global", planObj, "findOne").then((planFeature)=>{
                        let companyObj = {
                            type: dbCollections.COMPANIES,
                            data: [
                                {
                                    _id: webhookData.subscription.cf_company_id
                                },
                                {
                                    planFeature: planFeature,
                                    subscriptionRenewalDate: webhookData.subscription.next_billing_at,
                                    availableUser: 0
                                },
                                {
                                    returnDocument: 'after'
                                }
                            ]
                        }
                        updateCompanyFun(SCHEMA_TYPE.GOLBAL,companyObj,"findOneAndUpdate",webhookData.subscription.cf_company_id)
                        .then((response) => {
                            socketEmitter.emit('update', { type: "update", data: response , updatedFields: {
                                planFeature: planFeature,
                                subscriptionRenewalDate: webhookData.subscription.next_billing_at,
                                availableUser: 0
                            }, module: 'companies' });
                            if (webhookData.subscription.status == 'active') {
                                exports.updateRestrictProject({planFeature, companyId: webhookData.subscription.cf_company_id})
                            }
                        })
                        .catch((err) => {
                            logger.error(`Create Subscription Update COMPANY ERROR Error: ${err} `)
                        })
                    }).catch((error)=>{
                        logger.error(`createSubscriptionData GET PLANFEATURE ERROR ${error.message ? error.message : error}`);
                    })
                }
            }).catch((error)=>{
                logger.error(`updateSubscriptionData Error ${error.message ? error.message: error}`)
            })
        }
    } catch (error) {
        logger.error(`Update Subscription Data Catch Error: ${error}`);
    }
};

/**
 * Update Subscription Data in Company collection when subscription is deleted
 * @param {Object} webhookData - WebhhokData Object 
 */
exports.deleteSubcriptionData = (webhookData) => {
    try {
        if(webhookData.customer.cf_domain_link == config.WEBURL) {
            let query = [{ $match: { defaultSubscribe: true } }];

            getAllSubscriptionPlansPromise(query)
            .then((res)=>{
                const planData = res[0];
                if (planData?.planName === webhookData?.subscription?.cf_selected_plan) {
                    return;
                }
                let planObj = {
                    type: dbCollections.PLANFEATURE,
                    data: [
                        {
                            planName: planData.planName
                        }
                    ]
                }
                MongoDbCrudOpration("global", planObj, "findOne").then((planFeature)=>{
                    let obj = {
                        type: dbCollections.COMPANIES,
                        data: [
                            {
                                SubcriptionId: webhookData.subscription.id
                            },
                            {
                                SubcriptionId: '',
                                isInactive: true,
                                planFeature: planFeature,
                                $unset: {
                                    availableUser: ""
                                }
                            },
                            {
                                returnDocument : 'after'
                            }
                        ]
                    }
                    updateCompanyFun(SCHEMA_TYPE.GOLBAL,obj,"findOneAndUpdate")
                    .then((response)=>{
                        socketEmitter.emit('update', { type: "update", data: response , updatedFields: {
                            SubcriptionId: '',
                            isInactive: true,
                            planFeature: planFeature
                        }, module: 'companies' });
                        exports.updateSubscriptionData(webhookData,false);
                        let subscription_items = [
                            {
                                item_price_id : planData.itemPriceArray.find((x)=> x.period_unit == 'month').id
                            }
                        ]
                        exports.createSubscriptionChargebeePromise(webhookData.subscription.customer_id,webhookData.subscription.cf_company_id,subscription_items,planData.planName, webhookData.subscription.payment_source_id).catch((error)=>{
                            logger.error(`Create Default Subscription Error ${error}`);
                        })
                        exports.updateRestrictProject({planFeature, companyId: webhookData.subscription.cf_company_id}).then((response) => {
                        }).catch((err) => {
                            logger.error(`ERROR IN updateRestrictProject ${err}`)
                        });
                        return;
                    }).catch((error)=>{
                        logger.error(`Delete Subscription Error ${error.message ? error.message: error}`)
                    })
                }).catch((error)=>{
                    logger.error(`Delete Subscription PlanFeature Get: ${error}`);
                })
            }).catch((error)=>{
                logger.error(`Delete Subscription Subscriprion Plan Get Error: ${error}`);
            })
        }
    } catch (error) {
        logger.error(`Delete Subscription Catch Error: ${error}`);
    }
}


/**
 * Update Plan Data in Db when webhook is call
 * @param {Object} webhookData - WebhhokData Object 
 */
exports.updatePlanData = (webhookData) => {
    try {
        let query = [
            {
              "planDetails.id": webhookData.item.id,
            },
            {
              planDetails: webhookData.item,
            },
          ];
          updateSubscriptionPlanPromise(query).catch((error)=>{
            logger.error(`updatePlanData update Error: ${error}`);
        })
    } catch (error) {
        logger.error(`updatePlanData Catch Error: ${error}`);
    }
}


/**
 * Add Item Price in Db when webhook is call
 * @param {Object} webhookData - WebhhokData Object 
 */
exports.addItemPrice = (webhookData) => {
    try {
        if(webhookData.item_price) {
            if(webhookData.item_price.item_family_id == 'Alian-Hub') {
                if(webhookData.item_price.item_type == 'plan') {
                    let query = [
                        {
                          "itemPriceArray.item_id": webhookData.item_price.item_id,
                        },
                        {
                          $push: {
                            itemPriceArray: webhookData.item_price,
                          },
                        },
                      ];
                      updateSubscriptionPlanPromise(query).catch((error)=>{
                            logger.error(`addItemPrice Update error ${error}`);
                        })
                } else if(webhookData.item_price.item_type == 'addon') {
                    let query = [
                        {
                          "addonPriceArray.id": webhookData.item_price.id,
                        },
                        {
                          $push: {
                            addonPriceArray: webhookData.item_price,
                          },
                        },
                      ];
                      updateSubscriptionPlanPromise(query).catch((error)=>{
                        logger.error(`addItemPrice Update error ${error}`);
                    })
                }
            }
        }
    } catch (error) {
        logger.error(`addItemPrice Catch error: ${error}`);
    }
}


/**
 * Update Item Price in Db when webhook is call
 * @param {Object} webhookData - WebhhokData Object 
 */
exports.updateItemPrice = (webhookData) => {
    try {
        if(webhookData.item_price) {
            if(webhookData.item_price.item_family_id == 'Alian-Hub') {
                if(webhookData.item_price.item_type == 'plan') {
                    let obj = [
                        {
                          "itemPriceArray.id": webhookData.item_price.id,
                        },
                        {
                          "itemPriceArray.$[elementIndex]": webhookData.item_price,
                        },
                        {
                          arrayFilters: [
                            {
                              "elementIndex.item_id": webhookData.item_price.item_id,
                              "elementIndex.id": webhookData.item_price.id,
                            },
                          ],
                        },
                      ];
                      updateSubscriptionPlanPromise(obj).catch((error)=>{
                        logger.error(`addItemPrice Update error ${error}`);
                    })
                } else if(webhookData.item_price.item_type == 'addon') {
                    let obj = [
                        { "addonPriceArray.id": webhookData.item_price.id },
                        {
                          $set: {
                            "addonPriceArray.$[elementIndex]": webhookData.item_price,
                          },
                        },
                        {
                          arrayFilters: [
                            {
                              "elementIndex.item_id": webhookData.item_price.item_id,
                              "elementIndex.id": webhookData.item_price.id,
                            },
                          ],
                        },
                      ];
                      updateSubscriptionPlanPromise(obj).catch((error)=>{
                        logger.error(`addItemPrice Update error ${error}`);
                    })
                }
            }   
        }
    } catch (error) {
        logger.error(`Update Item Price Catch Error: ${error}`);
    }
};


/**
 * Delete Item Price in Db when webhook is call
 * @param {Object} webhookData - WebhhokData Object 
 */
exports.deleteItemPrice = (webhookData) => {
    try {
        if(webhookData.item_price) {
            if(webhookData.item_price.item_type == 'plan') {
                let obj = [
                    {
                      "itemPriceArray.item_id": webhookData.item_price.item_id,
                    },
                    {
                      $pull: {
                        itemPriceArray: { id: webhookData.item_price.id },
                      },
                    },
                  ];
                  updateSubscriptionPlanPromise(obj).catch((error)=>{
                    logger.error(`addItemPrice Update error ${error}`);
                })
            } else if(webhookData.item_price.item_type == 'addon') {
                let obj = [
                    {
                      "addonPriceArray.id": webhookData.item_price.id,
                    },
                    {
                      $pull: {
                        addonPriceArray: { id: webhookData.item_price },
                      },
                    },
                  ];
                  updateSubscriptionPlanPromise(obj).catch((error)=>{
                    logger.error(`addItemPrice Update error ${error}`);
                })
            }
        }
    } catch (error) {
        logger.error(`deleteItemPrice Catch Error: ${error}`);
    }
}

/**
 * Chargbee Webhook
 * @param {Object} req - Request Object from the chargbee
 * @param {Object} res - Response fObject
 */
exports.webhook2 = (req, res) => {
    let webhookData;
    switch (req.body.event_type) {
        case 'subscription_created':
            webhookData =  req.body.content;
            exports.createSubscriptionData(webhookData);
            break;
        case 'payment_succeeded':
            webhookData = req.body.content;
            exports.paymentSucessData(webhookData);
            break;
        case 'payment_failed':
            webhookData = req.body.content;
            exports.paymentFailedData(webhookData);
            break;
        case 'subscription_changed':
            webhookData = req.body.content;
            exports.updateSubscriptionData(webhookData);
            break;
        case 'subscription_cancelled':
            webhookData = req.body.content;
            exports.deleteSubcriptionData(webhookData);
            break;
        case 'item_updated':
            webhookData = req.body.content;
            exports.updatePlanData(webhookData);
            break;
        case 'subscription_renewed':
            webhookData = req.body.content;
            exports.updateSubscriptionData(webhookData);
            break;
        case 'item_price_created':
            webhookData = req.body.content;
            break;
        case 'item_price_updated':
            webhookData = req.body.content;
            break;
        case 'item_price_deleted':
            webhookData = req.body.content;
            break;
        case 'credit_note_updated':
            webhookData = req.body.content;
            exports.updateCreditNote(webhookData);
            break;
        case 'credit_note_created':
            webhookData = req.body.content;
            exports.updateCreditNote(webhookData);
            break;
        case 'invoice_updated':
            webhookData = req.body.content;
            exports.invoiceUpdateWebHook(webhookData);
            break;
        default:
            logger.info(`Unhandled event type ${req.body.event_type}`);
    }
    res.send();
}

/**
 * Update Subscription in chargebee
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.updateSubscriptionChargebeeEstimate = (req, res) => {
    try {
        if(!req.body.subscriptionId || req.body.subscriptionId === '') {
            res.send({
                status: false,
                statusText: 'subscriptionId is required'
            });
            return;
        }

        if (req.body.isPlanChange == undefined || typeof req.body.isPlanChange !== 'boolean') {
            res.send({
                status: false,
                statusText: 'isPlanChange is required'
            })
            return;            
        }

        if (req.body.isPeriodChange == undefined || typeof req.body.isPeriodChange !== 'boolean') {
            res.send({
                status: false,
                statusText: 'isPeriodChange is required'
            })
            return;            
        }

        if (!req.body.currentUsers || req.body.currentUsers === undefined) {
            res.send({
                status: false,
                statusText: 'currentUsers is required'
            })
            return;
        }
        
        if (req.body.isOverWrite == undefined || typeof req.body.isOverWrite !== 'boolean') {
            res.send({
                status: false,
                statusText: 'isOverWrite is required'
            })
            return;            
        }

        if (req.body.isPlanChange === true) {
            if (!(req.body && req.body.planId)) {
                res.send({
                    status: false,
                    statusText: 'planId is required'
                })
                return;            
            }    
        }
        chargebee.subscription.retrieve(req.body.subscriptionId).request((error,result) => {
            if(error){
                res.send({
                    status: false,
                    error: error
                });
                return;
            }else{
                let subscription = result.subscription;
                let subscriptionItems = []
                let endOfTerm = null;
                getPlanDetails(subscription.subscription_items[0].item_price_id,false).then((planDetail)=>{
                    if (planDetail && planDetail !== null) {
                        let currPriceId = subscription.subscription_items.find((x)=> x.item_type == 'plan')?.item_price_id || '';
                        let currentPeriod = planDetail.itemPriceArray.find((x)=> x.id == currPriceId)?.period_unit;
                        if (currentPeriod) {
                            if (req.body.isPlanChange && req.body.isPeriodChange) {
                                let upgradePeriod;
                                if (currentPeriod == 'month') {
                                    upgradePeriod = 'year';
                                } else {
                                    upgradePeriod = 'month';
                                }
                                let count = 0;
                                let countFunction = async (subItem) => {
                                    let reqbodyplanDetail = await getPlanDetails(req.body.planId,true);
                                    if (count >= subscription.subscription_items.length) {
                                        let updatedobj = {
                                            invoice_immediately: true,
                                            subscription_items: subscriptionItems,
                                            cf_selected_plan: req.body.planId,
                                            subscription : {
                                                id : req.body.subscriptionId
                                            },
                                            replace_items_list: true
                                        }
                                        if (req.body.isOverWrite == true) {
                                            updatedobj.prorate = false;
                                            updatedobj.end_of_term = false;
                                        }
                                        chargebee.estimate.update_subscription_for_items(updatedobj).request((error,result) => {
                                            if(error){
                                                //handle error
                                                res.send({
                                                    status: false,
                                                    error: error
                                                });
                                            }else{
                                                res.send({
                                                    status: true,
                                                    statusText: {estimate: result,updateObj: updatedobj}
                                                });
                                            }
                                            });
                                    } else {
                                        let obj = {};
                                        if(subItem.item_type == 'plan') {
                                            let innerCount = 0;
                                            let innerCountFunction = (priceObj) => {
                                                if (innerCount >= reqbodyplanDetail?.itemPriceArray.length) {
                                                    obj.item_type = subItem.item_type;
                                                    obj.quantity = subItem.quantity;
                                                    subscriptionItems.push(obj);
                                                    count++;
                                                    countFunction(subscription.subscription_items[count]);
                                                    return;
                                                } else {
                                                    if(priceObj.currency_code == subscription.currency_code && priceObj.period_unit === upgradePeriod) {
                                                        obj.item_price_id = priceObj.id;
                                                        innerCount++;
                                                        innerCountFunction(reqbodyplanDetail?.itemPriceArray[innerCount]);
                                                    } else {
                                                        innerCount++;
                                                        innerCountFunction(reqbodyplanDetail?.itemPriceArray[innerCount]);
                                                    }
                                                }
                                            }
                                            innerCountFunction(reqbodyplanDetail?.itemPriceArray[innerCount]);
                                        }
                                        else if(subItem.item_type == 'addon') {
                                            let innerCount = 0;
                                            let innerCountFunction = (addonObj) => {
                                                if (innerCount >= reqbodyplanDetail?.addonPriceArray.length) {
                                                    if (currentPeriod === 'year') {
                                                        obj.quantity = req.body.currentUsers - 1;
                                                    } else {
                                                        obj.quantity = subItem.quantity;
                                                    }
                                                    obj.item_type = subItem.item_type;
                                                    subscriptionItems.push(obj);
                                                    count++;
                                                    countFunction(subscription.subscription_items[count]);
                                                    return;
                                                } else {
                                                    if(addonObj.currency_code == subscription.currency_code && addonObj.period_unit === upgradePeriod) {
                                                        obj.item_price_id = addonObj.id;
                                                        innerCount++;
                                                        innerCountFunction(reqbodyplanDetail?.addonPriceArray[innerCount]);
                                                    } else {
                                                        innerCount++;
                                                        innerCountFunction(reqbodyplanDetail?.addonPriceArray[innerCount]);
                                                    }
                                                }
                                            }
                                            innerCountFunction(reqbodyplanDetail?.addonPriceArray[innerCount]);
                                        }else {
                                            count++;
                                            countFunction(subscription.subscription_items[count]);
                                        }
                                    }
                                }
                                countFunction(subscription.subscription_items[count]);
                            } else if (req.body.isPlanChange) {
                                let count = 0;
                                let countFunction = async (subItem) => {
                                    let reqbodyplanDetail = await getPlanDetails(req.body.planId,true);
                                    if (count >= subscription.subscription_items.length) {
                                        // subscriptionItems.push(obj);
                                        let updatedobj = {
                                            invoice_immediately: true,
                                            subscription_items: subscriptionItems,
                                            cf_selected_plan: req.body.planId,
                                            subscription : {
                                                id : req.body.subscriptionId
                                            },
                                            replace_items_list: true
                                        }
                                        if (req.body.isOverWrite == true) {
                                            updatedobj.prorate = false;
                                            updatedobj.end_of_term = false;
                                        }
                                        chargebee.estimate.update_subscription_for_items(updatedobj).request((error,result) => {
                                            if(error){
                                              //handle error
                                                res.send({
                                                    status: false,
                                                    error: error
                                                });
                                            }else{
                                                res.send({
                                                    status: true,
                                                    statusText: {estimate: result,updateObj: updatedobj}
                                                });
                                            }
                                          });
                                    } else {
                                        let obj = {};
                                        if(subItem.item_type == 'plan') {
                                            let innerCount = 0;
                                            let innerCountFunction = (priceObj) => {
                                                if (innerCount >= reqbodyplanDetail?.itemPriceArray.length) {
                                                    obj.item_type = subItem.item_type;
                                                    obj.quantity = subItem.quantity;
                                                    subscriptionItems.push(obj);
                                                    count++;
                                                    countFunction(subscription.subscription_items[count]);
                                                    return;
                                                } else {
                                                    if(priceObj.currency_code == subscription.currency_code && priceObj.period_unit === currentPeriod) {
                                                        obj.item_price_id = priceObj.id;
                                                        innerCount++;
                                                        innerCountFunction(reqbodyplanDetail?.itemPriceArray[innerCount]);
                                                    } else {
                                                        innerCount++;
                                                        innerCountFunction(reqbodyplanDetail?.itemPriceArray[innerCount]);
                                                    }
                                                }
                                            }
                                            innerCountFunction(reqbodyplanDetail?.itemPriceArray[innerCount]);
                                        }
                                        else if(subItem.item_type == 'addon') {
                                            let innerCount = 0;
                                            let innerCountFunction = (addonObj) => {
                                                if (innerCount >= reqbodyplanDetail?.addonPriceArray.length) {
                                                    obj.item_type = subItem.item_type;
                                                    if (currentPeriod === 'year') {
                                                        obj.quantity = req.body.currentUsers - 1;
                                                    } else {
                                                        obj.quantity = subItem.quantity;
                                                    }
                                                    subscriptionItems.push(obj);
                                                    count++;
                                                    countFunction(subscription.subscription_items[count]);
                                                    return;
                                                } else {
                                                    if(addonObj.currency_code == subscription.currency_code && addonObj.period_unit === currentPeriod) {
                                                        obj.item_price_id = addonObj.id;
                                                        innerCount++;
                                                        innerCountFunction(reqbodyplanDetail?.addonPriceArray[innerCount]);
                                                    } else {
                                                        innerCount++;
                                                        innerCountFunction(reqbodyplanDetail?.addonPriceArray[innerCount]);
                                                    }
                                                }
                                            }
                                            innerCountFunction(reqbodyplanDetail?.addonPriceArray[innerCount]);
                                        }else {
                                            count++;
                                            countFunction(subscription.subscription_items[count]);
                                        }
                                    }
                                }
                                countFunction(subscription.subscription_items[count]);
                            } else if (req.body.isPeriodChange) {
                                let upgradePeriod;
                                if (currentPeriod == 'month') {
                                    upgradePeriod = 'year';
                                } else {
                                    upgradePeriod = 'month';
                                }
                                let count = 0;
                                let countFunction = (subItem) => {
                                    if (count >= subscription.subscription_items.length) {
                                        let updatedobj = {
                                            invoice_immediately: true,
                                            subscription_items: subscriptionItems,
                                            cf_selected_plan: req.body.planId,
                                            subscription : {
                                                id : req.body.subscriptionId
                                            },
                                            replace_items_list: true
                                        }
                                        if (req.body.isOverWrite == true) {
                                            updatedobj.prorate = false;
                                            updatedobj.end_of_term = false;
                                        }
                                        chargebee.estimate.update_subscription_for_items(updatedobj).request((error,result) => {
                                            if(error){
                                              //handle error
                                                res.send({
                                                    status: false,
                                                    error: error
                                                });
                                            }else{
                                                res.send({
                                                    status: true,
                                                    statusText: {estimate: result,updateObj: updatedobj}
                                                });
                                            }
                                          });
                                    } else {
                                        if (subItem.item_type == 'plan') {
                                            let innerCount = 0;
                                            let obj = {};
                                            let innerCountFunction = (priceObj) => {
                                                if (innerCount >= planDetail.itemPriceArray.length) {
                                                    obj.item_type = subItem.item_type;
                                                    subscriptionItems.push(obj);
                                                    count++;
                                                    countFunction(subscription.subscription_items[count]);
                                                    return;
                                                } else {
                                                    if (priceObj.currency_code == subscription.currency_code && priceObj.period_unit == upgradePeriod) {
                                                        obj.item_price_id = priceObj.id;
                                                        innerCount++;
                                                        innerCountFunction(planDetail.itemPriceArray[innerCount]);
                                                    } else {
                                                        innerCount++;
                                                        innerCountFunction(planDetail.itemPriceArray[innerCount]);
                                                    }
                                                }
                                            }
                                            innerCountFunction(planDetail.itemPriceArray[innerCount]);
                                        } else if (subItem.item_type == 'addon') {
                                            let innerCount = 0;
                                            let obj = {};
                                            let indx = planDetail.addonPriceArray.findIndex((addon) => addon.id == subItem.item_price_id);
                                            let innerCountFunction = (addonObj) => {
                                                if (innerCount >= planDetail.addonPriceArray.length) {
                                                    obj.item_type = subItem.item_type;
                                                    obj.quantity = subItem.quantity;
                                                    if (currentPeriod === 'year') {
                                                        obj.quantity = req.body.currentUsers - 1;
                                                    } else {
                                                        obj.quantity = subItem.quantity;
                                                    }
                                                    subscriptionItems.push(obj);
                                                    count++;
                                                    countFunction(subscription.subscription_items[count]);
                                                    return;
                                                } else {
                                                    if (addonObj.item_id == planDetail.addonPriceArray[indx].item_id && addonObj.currency_code == subscription.currency_code && addonObj.period_unit == upgradePeriod) {
                                                        obj.item_price_id = addonObj.id;
                                                        innerCount++;
                                                        innerCountFunction(planDetail.addonPriceArray[innerCount]);
                                                    }
                                                    else {
                                                        innerCount++;
                                                        innerCountFunction(planDetail.addonPriceArray[innerCount]);
                                                    }
                                                }
                                            }
                                            innerCountFunction(planDetail.addonPriceArray[innerCount]);
                                        } else {
                                            count++;
                                            countFunction(subscription.subscription_items[count]);
                                        }
                                    }
                                }
                                countFunction(subscription.subscription_items[count]);
                            }
                        } else {
                            res.send({
                                status: false,
                                statusText: 'No current period found'
                            })
                        }
                    } else {
                        res.send({
                            status: false,
                            statusText: 'No plan detail found in db'
                        });
                        return;
                    }
                }).catch((error)=>{
                    res.send({
                        status: false,
                        statusText: error
                    });
                    return;
                })
            }
        })
    } catch (error) {
        logger.error(`updateSubscriptionChargebee Catch Error: ${error}`);
        res.send({
            status: false,
            statusText: error
        });
    }
};

exports.updateSubscriptionChargebee = (req,res) => {
    try {
        if(!req.body.subscriptionId || req.body.subscriptionId === '') {
            res.send({
                status: false,
                statusText: 'subscriptionId is required'
            });
            return;
        }
        if(!req.body.updateObj || Object.keys(req.body.updateObj).length === 0) {
            res.send({
                status: false,
                statusText: 'updateObj is required'
            });
            return;
        }
        if(!req.body.companyId || req.body.companyId === '') {
            res.send({
                status: false,
                statusText: 'companyId is required'
            });
            return;
        }
        chargebee.subscription.update_for_items(req.body.subscriptionId,req.body.updateObj).request((error,result) => {
            if(error){
                logger.error(`updateSubscriptionChargebee update items Error: ${error}`);
                res.send({
                    status: false,
                    error: error
                });
                return;
            }else{
                    res.send({
                        status: true,
                        statusText: 'Updated successfully'
                    });
            }
        });
    } catch (error) {
        res.send({status: false, error: error});
    }
}


/**
 * Update Addon Quanity in Subscription Estimate
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.addAndRemoveUserInChargebeeSubscriptionEstimate = (req,res) => {
    try {
        if(!req.body.subscriptionId || req.body.subscriptionId === '') {
            res.send({
                status: false,
                statusText: 'subscriptionId is required'
            });
            return;
        }
        if(req.body.addOnId == undefined || req.body.addOnId === '') {
            res.send({
                status: false,
                statusText: 'addOnId is required'
            });
            return;
        }

        if (req.body.isAddOnAdd == undefined) {
            res.send({
                status: false,
                statusText: 'isAddOnAdd is REquired'
            })
            return;
        }

        if (req.body.addOnQuantity == undefined || req.body.addOnQuantity === '') {
            res.send({
                status: false,
                statusText: 'addOnQuantity is required'
            });
            return;
        }


        chargebee.subscription.retrieve(req.body.subscriptionId).request((error,result) => {
            if(error){
                res.send({
                    status: false,
                    error: error
                });
                return;
            }else{
                var subscription = result.subscription;
                let planObj = subscription.subscription_items.find((x)=> x.item_type == 'plan')
                let subscriptionItems = []
                let findIndex = subscription.subscription_items.findIndex(item => {
                    return item.item_price_id == req.body.addOnId
                })
                if(findIndex < 0) {
                    subscriptionItems.push({
                        item_price_id : req.body.addOnId,
                        quantity: req.body.addOnQuantity
                    });
                } else{
                    let newAddOn
                    if (req.body.isAddOnAdd == true) {
                        newAddOn = subscription.subscription_items[findIndex].quantity + req.body.addOnQuantity
                        subscriptionItems.push({
                            item_price_id : req.body.addOnId,
                            quantity: newAddOn
                        });
                    } else {
                        newAddOn = subscription.subscription_items[findIndex].quantity - req.body.addOnQuantity
                        if (newAddOn !== 0) {                
                            subscriptionItems.push({
                                item_price_id : req.body.addOnId,
                                quantity: newAddOn
                            });
                        }
                    }
                }
                let updatedobj = {
                    invoice_immediately : true,
                    subscription_items : subscriptionItems,
                    subscription: {
                        id: req.body.subscriptionId
                    }
                }
                if (updatedobj.subscription_items.length === 0) {
                    updatedobj.subscription_items.push(planObj);
                    updatedobj.replace_items_list = true;
                }
                chargebee.estimate.update_subscription_for_items(updatedobj).request((error,result) => {
                    if(error){
                        res.send({
                            status: false,
                            error: error
                        });
                        return;
                    }else{
                        res.send({
                            status: true,
                            statusText: {estimate:result,updateObj: updatedobj}
                        });
                    }
                });
            }
        })
    } catch (error) {
        res.send({
            status: false,
            statusText: error
        });
    }
}


/**
 * Update Addon Quanity in Subscription
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.addAndRemoveUserInChargebeeSubscription = (req,res) => {
    try {
        if(!req.body.subscriptionId || req.body.subscriptionId === '') {
            res.send({
                status: false,
                statusText: 'subscriptionId is required'
            });
            return;
        }
        if(req.body.updateObj == undefined || req.body.updateObj === '') {
            res.send({
                status: false,
                statusText: 'updateObj is required'
            });
            return;
        }
        chargebee.subscription.update_for_items(req.body.subscriptionId,req.body.updateObj).request((error,result) => {
            if(error){
                res.send({
                    status: false,
                    error: error
                });
                return;
            }else{
                res.send({
                    status: true,
                    statusText: "Subscription updated successfully"
                });
            }
        });
    } catch (error) {
        res.send({
            status: false,
            statusText: error
        });
    }
}

/**
 * Get PlanDetail Object from mongo from planName
 * @param {String} planName - name of the plan which needs to get
 */
function getPlanDetails (id,planName) {
    return new Promise((resolve, reject) => {
        try {
            let query = [];

            if (planName) {
                query = [
                {
                    $match: { planName: id },
                },
                ];
            } else {
                query = [
                {
                    $match: {
                    "itemPriceArray.id": id,
                    },
                },
                ];
            }
            getAllSubscriptionPlansPromise(query)
            .then((resp)=>{
                resolve(resp[0]); 
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}


/**
 * Cancel Subscription in chargebee
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.cancleSubscriptionChargebee = (req, res) => {
    try {
        if(!req.body.subscriptionId || req.body.subscriptionId == '') {
            res.send({
                status: false,
                statusText: 'subscriptionId is required'
            });
            return;
        }

        chargebee.subscription.cancel_for_items(req.body.subscriptionId,{
            end_of_term : true
        }).request((error,result) => {
            if(error){
                logger.error(`Cancle Subscription Chargebee Error: ${error}`);
                res.send({
                    status: false,
                    statusText: 'Subscription not cancelled',
                    error: error
                });
            }else{
                exports.updateSubscriptionData(result);
                res.send({
                    status: true,
                    statusText: 'Subscription cancelled successfully'
                });

            }
        });
    } catch (error) {
        logger.error(`Cancle Subscription Chargebee ${error}`);
        res.send({
            status: false,
            statusText: 'Subscription not cancelled',
            error: error
        });
    }
};


/**
 * Remove scheduled cancellation chargbee
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.removeScheduleCancellationChargebee = (req,res) => {
    try {
        if(!req.body.subscriptionId || req.body.subscriptionId == '') {
            res.send({
                status: false,
                statusText: 'subscriptionId is required'
            });
            return;
        }

        chargebee.subscription.remove_scheduled_cancellation(req.body.subscriptionId).request((error,result) => {
            if(error){
                logger.error(`Remove Schedule Cancellation Chargebee Error: ${error}`);
                res.send({
                    status: false,
                    statusText: 'Subscription not reactivated',
                    error: error
                });
            }else{
                exports.updateSubscriptionData(result);
                res.send({
                    status: true,
                    statusText: 'Subscription reactivated successfully'
                });
                
            }
        });
    } catch (error) {
        logger.error(`remove Schedule Cancellation Chargebee ${error}`);
        res.send({
            status: false,
            error: error
        });
    }
};


/**
 * Update billing Adress for customer in chargebee
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.updateCustomerBilling = (req, res) => {
    const companyId = req.headers['companyid'];
    try {
        if(!req.body) {
            res.status(400).send({
                status: false,
                statusText: 'body is required'
            });
            return;
        }

        if(!req.body.billingDetails || Object.keys(req.body.billingDetails).length === 0) {
            res.status(400).send({
                status: false,
                statusText: 'billingDetail is required'
            });
            return;
        }
        exports.getCompanyData(companyId, (resp) => {
            if (!resp.status) {
                res.status(400).send({
                    status: false,
                    statusText: resp.error
                });
                return;
            }

            let updateObj = {
                billing_address : {
                    first_name: resp?.data?.Cst_CompanyName || "",
                    country: req?.body?.billingDetails?.billingDetails?.countryCode || "",
                    state: req?.body?.billingDetails?.billingDetails?.stateCode || "",
                    city: req?.body?.billingDetails?.billingDetails?.city || "",
                    zip: req?.body?.billingDetails?.billingDetails?.zipCode || "",
                    line1: req?.body?.billingDetails?.billingDetails?.address1 || "",
                    line2: req?.body?.billingDetails?.billingDetails?.address2 || "",
                    company: req?.body?.billingDetails?.billingDetails?.companyName || "",
                }
            }

            if (req?.body?.billingDetails?.billingDetails?.countryCode === "IN" && req?.body?.billingDetails?.billingDetails?.GST) {
                updateObj.vat_number = req?.body?.billingDetails?.billingDetails?.GST;
            }
            
            chargebee.customer.update_billing_info(resp.data.customerId,updateObj).request((error,result) => {
                if(error){
                    logger.error(`Update Customer Billing Update Error : ${JSON.stringify(error, null, 4)}`);
                    let compObj = {
                        type: dbCollections.COMPANIES,
                        data: [
                            { _id: companyId },
                            { $unset: { billingDetails: "" } }
                        ]
                    }
                    updateCompanyFun(SCHEMA_TYPE.GOLBAL,compObj,"findOneAndUpdate",companyId)
                    .catch((error)=>{
                        logger.error(`Error remove billingDetails field: ${error}`);
                    })
                    res.status(400).send({
                        status: false,
                        statusText: `${error?.error_msg ? error?.error_msg + "," : ""} Billing address not updated.`,
                        error: error
                    });
                    return;
                }else{
                    if(companyId && companyId !== '') {
                        chargebee.customer.update(resp.data.customerId,{
                            cf_company_id: companyId
                        }).request((errorComp,resultComp) => {
                            if(errorComp){
                                logger.error(`Update Customer Billing Company Update Error : ${errorComp}`);
                                let compObj = {
                                    type: dbCollections.COMPANIES,
                                    data: [
                                        { _id: companyId },
                                        { $unset: { billingDetails: "" } }
                                    ]
                                }
                                updateCompanyFun(SCHEMA_TYPE.GOLBAL,compObj,"findOneAndUpdate",companyId)
                                .catch((error)=>{
                                    logger.error(`Error remove billingDetails field: ${error}`);
                                })
                                res.status(400).send({
                                    status: false,
                                    statusText: 'Billing address not updated.',
                                    error: errorComp
                                });
                                return;
                            }else{
                                res.status(200).send({
                                    status: true,
                                    statusText: 'Billing address updated.'
                                });
                                return;
                            }
                        });
                    } else {
                        res.status(200).send({
                            status: true,
                            statusText: 'Billing address updated.'
                        });
                        return;
                    }
                }
            });
        })
    } catch (error) {
        logger.error(`Update Customer Billing Catch Error: ${error}`);
        let compObj = {
            type: dbCollections.COMPANIES,
            data: [
                { _id: companyId },
                { $unset: { billingDetails: "" } }
            ]
        }
        updateCompanyFun(SCHEMA_TYPE.GOLBAL,compObj,"findOneAndUpdate",companyId)
        .catch((error)=>{
            logger.error(`Error remove billingDetails field: ${error}`);
        })
        res.status(400).send({
            status: false,
            statusText: 'Not updated.',
            error: error
        });
    }
};



/**
 * Create a new Customer in chargbee and store in mongodb
 * @param {userId} req - Request Object 
 * @returns {Promise<String>} A Promise that resolves when customer is create in chargbee.
 *                            Rejects with an error message if any issues occur during the process.
 */
exports.createCustomerInPayment = (userId, company) => {
    return new Promise((resolve, reject) => {
        try {
            let query = {
                _id: new mongoose.Types.ObjectId(userId)
            }
            getUserByQueyFun(query).then((resp)=>{
                const user = resp[0];
                const customerObj = {
                    email: user.Employee_Email,
                    first_name: user.Employee_FName,
                    last_name: user.Employee_LName,
                    cf_customer_Mongo_id: (userId).toString(),
                    cf_domain_link: config.WEBURL,
                    company: company || ""
                }
                chargebee.customer.create(customerObj)
                .request((error,result) => {
                    if(error){
                        reject(error.message ? error.message : error);
                        return;
                    } else{
                        var customer = result.customer;
                        let updateObj = {
                            type: dbCollections.USERS,
                            data: [
                                {
                                    _id: userId
                                },
                                {
                                    $push: {
                                        customerIds: customer.id
                                    }
                                }
                            ]
                        }
                        updateUserFun(dbCollections.GLOBAL, updateObj, "findOneAndUpdate",'',userId)
                        .then(()=>{
                            resolve(customer.id);
                        }).catch((error)=>{
                            reject(error.message ? error.message : error);
                            return;
                        })
                    }
                });
            })
        } catch (error) {
            reject(error.message ? error.message : error);
        }
    })
}


/**
 * Create a payment source from chargebee for initialization of payment
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.createPaymnetSourceChargebee = (req, res) => {
    try {
        if(!req.body) {
            res.send({
                status: false,
                statusText: 'body required'
            });
            return;
        }

        if(!req.body.tokenId || req.body.tokenId === '') {
            res.send({
                status: false,
                statusText: 'tokenId is required.'
            });
            return;
        }

        exports.getCompanyData(req.headers['companyid'], (resp) => {
            if (!resp.status) {
                res.send({
                    status: false,
                    statusText: 'customerId is required.',
                    error: resp.error
                });
                return;
            }
            chargebee.payment_source.create_using_token({
                customer_id : resp.data.customerId,
                token_id : req.body.tokenId
            }).request((error,result) => {
                if(error){
                    logger.error(`Create Paymnet Source Chargebee Create Error: ${error}`);
                    res.send({
                        status: false,
                        statusText: 'payment source not generated.',
                        error: error
                    });
                } else {
                    res.send({
                        status: true,
                        statusText: 'payment source generated.',
                        payment_source: result.payment_source
                    });
                }
            });
        });
    } catch (error) {
        logger.error(`Create Paymnet Source Chargebee Catch Error : ${error}`);
        res.send({
            status: false,
            statusText: 'Paymnet source not created.',
            error: error
        });
    }
};



/**
 * Create a subscription in chargebee
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.createSubscriptionChargebee = (req, res) => {
    try {
        if(!req.body) {
            res.send({
                status: false,
                statusText: 'body required.'
            });
            return;
        }

        if(!req.body.companyId || req.body.companyId === '') {
            res.send({
                status: false,
                statusText: 'companyId is required.'
            });
            return;
        }

        if(!req.body.subscription_items || Object.keys(req.body.subscription_items).length === 0) {
            res.send({
                status: false,
                statusText: 'subscription_items are required.'
            });
            return;
        }

        exports.getCompanyData(req.body.companyId, (resp) => {
            if (!resp.status) {
                res.send({
                    status: false,
                    statusText: 'customerId is required.',
                    error: resp.error
                });
                return;
            }
            exports.createSubscriptionChargebeePromise(resp.data.customerId,req.body.companyId,req.body.subscription_items,req.body.planId,req.body.payment_source_id).then((response)=>{
                res.send(response);
            }).catch((error)=>{
                res.send(error);
            })
        })
    } catch (error) {
        logger.error(`Create Subscription Chargebee Catch Error : ${error}`);
        res.send({
            status: false,
            statusText: 'Subscription not created',
            error: error
        });
    }
};

/**
 * Create a subscription in chargbee
 * @param {String} customerId 
 * @param {String} companyId 
 * @param {Object} subscription_items 
 * @param {String} planId 
 * @param {String} payment_source_id 
 * @returns {Promise<String>} A Promise that resolves when subscription is create.
 *                            Rejects with an error message if any issues occur during the process.
 */
exports.createSubscriptionChargebeePromise = (customerId,companyId,subscription_items,planId,payment_source_id) => {
    return new Promise((resolve, reject) => {
        try {
            let subscriptionObj = {
                subscription_items : subscription_items,
                cf_company_id: companyId,
                cf_selected_plan: planId
            }
            if(payment_source_id && payment_source_id !== '') {
                subscriptionObj.payment_source_id = payment_source_id;
            }
            let query = [
                {
                  $match: {
                    "itemPriceArray.id": subscription_items[0].item_price_id,
                  },
                },
              ];
              getAllSubscriptionPlansPromise(query)
              .then((result)=>{
                let resp = result[0];
                if (resp.status == 1) {
                    chargebee.subscription.create_with_items(customerId, subscriptionObj)
                        .request(async (error,result) => {
                            if(error){
                                logger.error(`Create Subscription Chargebee Create Error: ${error}`);
                                reject({
                                    status: false,
                                    statusText: 'Subscription not created',
                                    error: error
                                });
                                return;
                            }else{
                                // Cancel Default Subscription
                                await getCompanyDataFun([companyId])
                                .then((cRes) => {
                                    const companyData = cRes[0];
                                    if (companyData?.SubcriptionId && companyData?.SubcriptionId !== result?.subscription?.id) {
                                        exports.cancelSubscription(companyData?.SubcriptionId);
                                    }
                                })
                                .catch((error) => {
                                    logger.error(`createSubscriptionData GET USER ERROR ${error.message ? error.message : error}`);
                                })
                                let obj = {
                                    type: dbCollections.COMPANIES,
                                    data: [
                                        {
                                            _id: companyId
                                        },
                                        {
                                            SubcriptionId: result?.subscription?.id ? result?.subscription?.id : "",
                                            isPaymentFailed: false,
                                            paymentFailed_error_text: ""
                                        },
                                        {
                                            returnDocument: 'after'
                                        }
                                    ]
                                }
                                updateCompanyFun(SCHEMA_TYPE.GOLBAL,obj,"findOneAndUpdate",companyId)
                                .then((response) => {
                                    socketEmitter.emit('update', { type: "update", data: response , updatedFields: {
                                        SubcriptionId: result?.subscription?.id ? result?.subscription?.id : "",
                                        isPaymentFailed: false,
                                        paymentFailed_error_text: ""
                                    }, module: 'companies' });
                                });

                                resolve({
                                    data: result,
                                    status: true,
                                    statusText: 'Subscription created successfully'
                                });
                            }
                        });    
                } else {
                    reject({
                        status: false,
                        statusText: 'Current plan Is not Active'
                    })
                }
            }).catch((error)=>{
                reject({
                    status: false,
                    statusText: error.message ? error.message : error,
                });
                return;
            })   
        } catch (error) {
            reject({
                status: false,
                statusText: error.message ? error.message : error,
            });
        }
    })
}

/**
 * Get Card Details
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.getCardDetails = (req,res) => {
    try {
        exports.getCompanyData(req.headers['companyid'], (resp) => {
            if (!resp.status) {
                res.send({
                    status: false,
                    statusText: 'customerId is required.',
                    error: resp.error
                });
                return;
            }
            chargebee.payment_source.list({
                "type[is]" : "card",
                "customer_id[is]" : resp.data.customerId
            }).request(async (error,result) => {
                if(error){
                    logger.error(`Get Card Details Error ${error}`);
                    res.send({
                        status: false,
                        error: error
                    });
                }else{
                    if(result.list.length == 0) {
                        res.send({
                            status: true,
                            isCards: false
                        });
                        return;
                    } else {
                        let paymentSourceList = [];
                        await result.list.forEach((item) => {
                            paymentSourceList.push(item.payment_source);
                        });
                        res.send({
                            status: true,
                            isCards: true,
                            paymentSourceList: paymentSourceList
                        });
                    }
                }
            });
        });
    } catch (error) {
        logger.error(`Get Card Details Catch Error ${error}`);
        res.send({
            status: false,
            error: error
        });
    }
}

/**
 * Update A Card For Existing Subscription
 * @param {Object} req 
 * @param {Object} res 
 */
exports.updateCardForSubscription = (req,res) => {
    try {
        if (!(req.body && req.body.paymentSourceId)) {
            res.send({
                status: false,
                statusText: `PaymentSourceId is required`
            })
            return;
        }
        if (!(req.body && req.body.subscriptionId)) {
            res.send({
                status: false,
                statusText: `subscriptionId is required`
            })
            return;
        }
        chargebee.subscription.override_billing_profile(req.body.subscriptionId,{
            payment_source_id : req.body.paymentSourceId,
            auto_collection : "ON"
          }).request((error,result) => {
            if(error){
              res.send({
                status: false,
                statusText: error.message ? error.message : error
              })
            }else{
              res.send({
                status: true,
                statusText: "Card Updated Successfully"
              })
            }
        });
    } catch (error) {
        res.send({
            status: false,
            statusText: error.message ? error.message : error
        })
    }
}

/**
 * Api for get Invoice And CreditNotes
 * @param {Object} req 
 * @param {Object} res 
 */
exports.getInvoiceAndCreditNotes = (req,res) => {
    try {
        if (!(req.body && req.body.companyId)) {
            res.send({
                status: false,
                statusText: `companyId is required`
            })
            return;
        }
        let promises = [getCustomerInvoiceData(req.body.companyId),getCustomerCreditNotes(req.body.companyId)]
        Promise.allSettled(promises).then((result)=>{
            let errors = result.filter((x)=> x.status === 'rejected')
            if (errors.length) {
                res.send({
                    status: false,
                    statusText: JSON.stringify(errors)
                })
            } else {
                let sucess = result.filter((x)=> x.status === 'fulfilled').map((y)=> y.value).flat(Infinity)
                let invoiceData = [];
                let creditNotes = [];

                sucess.forEach((ele)=>{
                    let discription;
                    let PlanName;
                    if (ele.object === 'credit_note') {
                        let planName  = ele.line_items[0].entity_id.split("-")[0]
                        let planPeriod = ele.line_items[0].entity_id.split("-").pop()
                        let prorated = ele.line_items[0].description.split(/- (.*)/s)[1]
                        let noofUser = ele.line_items.reduce((acc, item) => acc + item.quantity, 0)
                        discription = `${planName}-${planPeriod} Plan ${prorated} for ${noofUser} ${noofUser > 1 ? 'users' : 'user'}`
                        PlanName = planName;
                    } else {
                        let planName  = ele.line_items[0].entity_id.split("-")[0]
                        let planPeriod = ele.line_items[0].entity_id.split("-").pop()
                        let noofUser = ele.line_items.reduce((acc, item) => acc + item.quantity, 0)
                        discription = `${planName}-${planPeriod} Plan for ${noofUser} ${noofUser > 1 ? 'users' : 'user'}`
                        PlanName = planName;
                    }

                    let adjusted = null;
                    if(ele.status === "payment_due") {
                        const index = sucess.findIndex((x) => x.reference_invoice_id === ele.invoiceId);

                        if(index !== -1) {
                            if(sucess[index]?.creditNoteId) {
                                adjusted = sucess[index]?.creditNoteId;
                            } else {
                                adjusted = sucess[index]?.invoiceId;
                            }
                        }
                    }
                    if (ele.object === 'credit_note') {       
                        creditNotes.push({
                            id: ele.creditNoteId,
                            date: ele.date,
                            createdAt: ele.createdAt,
                            description: '',
                            noOfUser: ele.line_items.reduce((a,b) => a + b.quantity, 0),
                            amount: ele.total,
                            type: ele.object,
                            status: ele.status,
                            invoiceHtml: ele.invoiceHtml,
                            discription: discription,
                            planName: PlanName,
                            ...(adjusted !== null ? {adjusted} : {})
                        })
                    } else {
                        invoiceData.push({
                            id: ele.invoiceId,
                            date: ele.date,
                            createdAt: ele.createdAt,
                            description: '',
                            noOfUser: ele.line_items.reduce((a,b) => a + b.quantity, 0),
                            amount: ele.total,
                            type: ele.object,
                            status: ele.status,
                            invoiceHtml: ele.invoiceHtml,
                            discription: discription,
                            ...(adjusted !== null ? {adjusted} : {})
                        })
                    }
                })
                let invoice = invoiceData.sort((a, b) => a.date > b.date ? -1 : 1);
                let creditNote = creditNotes.sort((a, b) => a.date > b.date ? -1 : 1);

                res.send({
                    status: true,
                    transectionData: {invoiceArray: invoice, creditNoteArray: creditNote}
                })
            }
        }).catch((error)=>{
            res.send({
                status: false,
                statusText: error.message ? error.message : error
            })
        })
    } catch (error) {
        res.send({
            status: false,
            statusText: error.message ? error.message : error
        })
    }
}

/**
 * 
 * @param {String} companyId 
 * @returns {Promise<String>} A Promise that resolves with the list of invoices.
 *                            Rejects with an error message if any issues occur during the process.
 */
function getCustomerInvoiceData  (companyId) {
    return new Promise((resolve, reject) => {
        try {
            // let finalData = [];
            let ob = {
                type: dbCollections.INVOICES,
                data: [
                    {
                        companyId: new mongoose.Types.ObjectId(companyId),
                    }
                ]
            }
            MongoDbCrudOpration("global",ob,"find").then((resp)=>{
                resolve(resp);
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * 
 * @param {String} companyId 
 * @returns {Promise<String>} A Promise that resolves with the list of creditNotes.
 *                            Rejects with an error message if any issues occur during the process.
 */
function getCustomerCreditNotes (companyId) {
    return new Promise((resolve, reject) => {
        try {
            let ob = {
                type: dbCollections.CREDITNOTES,
                data: [
                    {
                        companyId: companyId,
                    }
                ]
            }
            MongoDbCrudOpration("global",ob,"find").then((resp)=>{
                resolve(resp);
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject(error)
        }
    })
}



/**
 * Check if subscription has scheduled changes
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.checkSubscriptionSchedule = (req,res) => {
    try {
        if (!(req.body && req.body.subscriptionId)) {
            res.send({
                status: false,
                statusText: `Subscription Id is required`
            })
            return;
        }
        chargebee.subscription.retrieve(req.body.subscriptionId).request((error,result) => {
            if(error){
                res.send({
                    status: false,
                    error: error
                });
                return;
            }else{
                let subscription = result.subscription;
                if (subscription.status === 'non_renewing') {
                    res.send({
                        status: true,
                        statusText: "Schedule Changes",
                        scheduledChanges: true
                    })
                    return;
                } else {
                    res.send({
                        status: true,
                        statusText: "Schedule Changes",
                        scheduledChanges: false
                    })
                    return;
                }
            }
        })        
    } catch (error) {
        res.send({
            status: false,
            statusText: error
        })
    }
}


/**
 * Remove Subscription scheduled changes
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.removeSubscriptionScheduledChanges = (req,res) => {
    try {
        if (!(req.body && req.body.subscriptionId)) {
            res.send({
                status: false,
                statusText: `Subscription Id is required`
            })
            return;
        }
        if (!(req.body && req.body.companyId)) {
            res.send({
                status: false,
                statusText: `companyId is required`
            })
            return;
        }
        chargebee.subscription.remove_scheduled_cancellation(req.body.subscriptionId).request((error) => {
            if(error){
                res.send({
                    status: false,
                    error: error
                });
                return;
            }else{
                    res.send({
                        status: true,
                        statusText: "Scheduled Changes remove succesfully",
                    })
            }
        })        
    } catch (error) {
        res.send({
            status: false,
            statusText: error
        })
    }
}
exports.updateCreditNote = (webhookData) => {
    try {
        chargebee.customer.retrieve(webhookData.credit_note.customer_id).request((error,result) => {
            if(error){
                logger.error(`Chargbee Get Plan Error:${error.message ? error.message : error}`);
                return;
            }else{
                if (result.customer.cf_domain_link == config.WEBURL) {
                    let object = {
                        type: dbCollections.SUBSCRIPTIONS,
                        data: [
                            {
                                subscriptionId: webhookData.credit_note.subscription_id
                            }
                        ]
                    }
                    MongoDbCrudOpration("global",object, "findOne").then((companyData)=>{
                            let obj = {
                                type: dbCollections.CREDITNOTES,
                                data: [
                                    {
                                        creditNoteId: webhookData.credit_note.id
                                    },
                                    {   
                                        companyId: companyData.cf_company_id,
                                        creditNoteId: webhookData.credit_note.id,
                                        ...webhookData.credit_note
                                    },
                                    {upsert: true}
                                ]
                            }
                            MongoDbCrudOpration("global",obj, "replaceOne").then(()=>{
                                exports.storeCreditNote(webhookData.credit_note.id,companyData.cf_company_id)
                            }).catch((error)=>{
                                logger.error(`Payment Sucess CreditNote Set Error ${error.message ? error.message: error}`)
                            })
                    }).catch((error)=>{
                        logger.error(`Payment Sucess CreditNote GET Error ${error.message ? error.message: error}`)
                    })
                }
            }
        });
    } catch (error) {
        logger.error(`Credit Note Error Set Error ${error.message ? error.message: error}`)
    }
}

exports.invoiceUpdateWebHook = (webhookData) => {
    try {
        chargebee.customer.retrieve(webhookData.invoice.customer_id).request((error,result) => {
            if(error){
                logger.error(`Chargbee Get Plan Error:${error.message ? error.message : error}`);
                return;
            }else{
                if (result.customer.cf_domain_link == config.WEBURL) {
                    let invoice = webhookData.invoice;
                    let invoiceId = JSON.parse(JSON.stringify(invoice.id));
                    delete invoice.id;
                    let ob = {
                        type: dbCollections.INVOICES,
                        data: [
                            {
                                invoiceId: invoiceId,
                            }
                        ]
                    }
                    MongoDbCrudOpration("global",ob,"findOne").then((resp)=>{
                        exports.storeInvoive(invoice,resp.companyId,invoiceId,webhookData.invoice);
                    }).catch((error)=>{
                        logger.error(`Get Invoice Error ${error.message ? error.message: error}`)
                    })
                }
            }
        });
    } catch (error) {
        logger.error(`Credit Note Error Set Error ${error.message ? error.message: error}`)
    }
}
exports.storeCreditNote = (id,companyId) => {
    chargebee.credit_note.pdf(id).request(async (error,result) => {
        if (error) {
            logger.error(`Credit Note Download Error ${error.message ? error.message : error}`);
            return;
        }
        const externalUrl = result.download.download_url;
        const localFilePath = `invoiceAndCreditNotes/${id}.pdf`;
        const {data} = await axios.get(externalUrl, { responseType: 'arraybuffer' });
        await handleChargeebeCreditNotUpload(companyId,localFilePath,data,id);
    })
}


/**
 * Get Invoice And CreditNote URL
 * @param {Object} req 
 * @param {Object} res 
 */
exports.getInvoiceAndCreditNoteURL = (req, res) => {
    if (req.body.key === "CreditNotes") {
        chargebee.credit_note.pdf(req.body.id).request((error,result) => {
            if (error) {
                logger.error(`Credit Note Download Error ${error.message ? error.message : error}`);
                res.json({
                    status: false,
                    statusText: "Something Went to Wrong. Please try again"
                });
                return;
            }
            const externalUrl = result.download.download_url || "";
            if (!externalUrl) {
                res.json({
                    status: false,
                    statusText: "Something Went to Wrong. Please try again"
                });
                return;
            }
            res.json({
                status: true,
                url: externalUrl
            });
        });
   } else {
        chargebee.invoice.pdf(req.body.id).request((error,result) => {
            if (error) {
                logger.error(`Invoice Download Error ${error.message ? error.message : error}`);
                res.json({
                    status: false,
                    statusText: "Something Went to Wrong. Please try again"
                });
                return;
            }
            const externalUrl = result.download.download_url || "";
            if (!externalUrl) {
                res.json({
                    status: false,
                    statusText: "Something Went to Wrong. Please try again"
                });
                return;
            }
            res.json({
                status: true,
                url: externalUrl
            });
        });
   }
}

exports.storeInvoive = (invoice,companyId,invoiceId,subscription) => {
    let adminObj = {
        type: dbCollections.ADMIN_DETAIL,
        data: [{}]
    }
    getCompanyDataFun([companyId]).then((company)=>{
        const companyData = company[0];
        MongoDbCrudOpration("global",adminObj,"findOne").then((adminDetail)=>{
            const billingDetails = JSON.parse(JSON.stringify(companyData)).billingDetails;
            let lineitm = '';
            invoice.line_items.forEach((itm)=>{
                lineitm+= 
                `
                <tr>
                    <td style="font-size: 14px;width:60%;padding: 10px 0px;">${itm.description}</td>
                    <td style="font-size: 14px;width:13.33%;padding: 15px 0px;">${itm.quantity}</td>
                    <td style="font-size: 14px;width:13.33%;padding: 15px 0px;">$${Number((itm.unit_amount/100)).toFixed(2)}</td>
                    <td style="font-size: 14px;width:13.33%;padding: 15px 0px; font-weight:700">$${Number((itm.amount/100)).toFixed(2)}</td>
                </tr>
                `
            })
            let inv = {
                invoiceId: invoiceId,
                invoiceDate: moment(invoice.date * 1000).format("DD-MM-YYYY"),
                invoiceAmount: `${Number(invoice.total / 100).toFixed(2)}`,
                invoiceStatus: invoice.status,
                companyName: `${billingDetails?.companyName}`,
                companyAddress1: `${billingDetails?.address1},${billingDetails?.address2},`,
                companyAddress2: `${billingDetails?.city},${billingDetails?.state},${billingDetails?.country},${billingDetails?.zipCode}`,
                subscriptionId: invoice.subscription_id,
                billingPeriod: `${moment(subscription.current_term_start * 1000).format("MMM DD,YYYY")} to ${moment(subscription.current_term_end * 1000).format("MMM DD,YYYY")}`,
                newxtBillingDate: `${moment(subscription.next_billing_at * 1000).format("MMM DD,YYYY")}`,
                lineItemData: lineitm,
                amountDue: `${Number(invoice.amount_due / 100).toFixed(2)}`,
                paymentAmount: `${Number(invoice.amount_paid / 100).toFixed(2)}`,
                paymentsTitle: (invoice.amount_paid > 0) || (invoice.credits_applied > 0) ? `<p>${invoice.amount_paid > 0 ? 'PAYMENTS' : ''} ${invoice.credits_applied > 0 ? '&CREDITS' : ''}</p>
                <div style="width:90px;height:2px;background-color: #ededed;margin-bottom:15px;"></div>` : '',
                paymentNotes: (invoice.amount_paid > 0) ? `<p><b>$${Number(invoice.amount_paid/100).toFixed(2)}</b> was paid on  ${moment(invoice.paid_at * 1000).format('DD MMM, YYYY HH:MM')}.</p>` : '',
                paymentCreditNotes: (invoice.credits_applied > 0) ? `<p><b>$${Number(invoice.credits_applied/100).toFixed(2)}</b> credits applied on  ${moment(invoice.paid_at * 1000).format('DD MMM, YYYY HH:MM')}.</p>` : '',
                credits: invoice.credits_applied > 0 ? `<p style="font-size:14px;display:flex;justify-content:end;padding:15px 0px;">
                    <b>Credits</b>
                    <span style="padding-left:33px;">($${Number(invoice.credits_applied / 100).toFixed(2)})</span>
                </p>` : '',
                addressFrom: adminDetail?.address1 + (adminDetail?.address2 ? `, ${adminDetail?.address2}` : ""),
                companyNameFrom:  adminDetail?.companyName || "",
                countryFrom:adminDetail?.country || "",
                stateFrom:adminDetail?.state || "",
                cityFrom:adminDetail?.city || "",
                pincodeFrom:adminDetail?.pincode || ""
            }
            getUserByQueyFun({customerIds: { $elemMatch: { $eq: invoice.customer_id } } })
            .then((resp)=>{
                const user = resp[0];
                let htmlContent = invoiceMailTemplate(inv);
                let obj = {
                    type: dbCollections.INVOICES,
                    data: [
                        {
                            invoiceId: invoiceId
                        },
                        {invoiceId: invoiceId,...invoice,invoiceHtml: htmlContent,companyId: new mongoose.Types.ObjectId(companyId),userId: new mongoose.Types.ObjectId(user._id)},
                        {upsert: true}
                    ]
                }
                MongoDbCrudOpration("global",obj, "replaceOne").catch((error)=>{
                    logger.error(`Payment Sucess INVOICE ${invoice.id} Set Error ${error.message ? error.message: error}`)
                })
            }).catch((error)=>{
                logger.error(`Payment Sucess INVOICE ${invoice.id} Set Error ${error.message ? error.message: error}`)
            })
        }).catch((error)=>{
            logger.error(`Error get company ${error?.message ? error.message: error}`)
        })
    }).catch((error)=>{
        logger.error(`Error get company: ${error}`);
    })
}

/**
 * Make an Payment for pending Invoice
 * @param {Object} req - Request Object 
 * @param {Object} res - Response Object
 */
exports.payPendingInvoice = (req,res) => {
    try {
        if (!(req.body && req.body.invoiceId)) {
            res.send({
                status: false,
                statusText: 'Invoice Id is required'
            })
            return;
        }
        if (!(req.body && req.body.paymentSourceId)) {
            res.send({
                status: false,
                statusText: 'paymentSourceId is required'
            })
            return;
        }
        chargebee.invoice.collect_payment(req.body.invoiceId,{
            payment_source_id : req.body.paymentSourceId
          }).request((error) => {
            if(error){
                res.send({
                    status: false,
                    statusText: error
                })
            }else{
                res.send({
                    status: true,
                    statusText: `Pending Invoice Paid Successfully`
                })
            }
        });      
    } catch (error) {
        res.send({
            status: false,
            statusText: error
        })
    }
}

//=============================================================================================================Chargbee Plan Set In Db============================================================================================================//

/**
 * Set itemPriceArray Array in SubscriptionPlan collection from priceId
 * @param {String} id - id of price which need to add in db
 * @param {String} planName - planName in for set in db  
 */
exports.setPriceList = (id,planName) => {
    chargebee.item_price.list({
        "item_id[is]": id
      }).request((error,result) => {
        if(error){
            console.log("CHARGEBEEE<>E,dffmlfgdkl;fg",error);
        }else{
            let itemPriceArray = [];
            for(var i = 0; i < result.list.length;i++){
                var entry=result.list[i]
                var item_price = entry.item_price;
                itemPriceArray.push(item_price);
            }
            let obj = [
                {
                  planName: planName,
                },
                {
                  $set: {
                    itemPriceArray: itemPriceArray,
                  },
                },
                {
                  upsert: true,
                },
              ];
              updateSubscriptionPlanPromise(obj).catch((error)=>{
                logger.error(`Chargbee Set Price Db Error:${error}`);
              })
        }
    });
}

/**
 * Set addonPriceArray Array in SubscriptionPlan collection from addOnPriceId
 * @param {String} id - id of addon which need to add in db 
 */
exports.setAddonPriceList = (id,planName) => {
    chargebee.item_price.list({
        "item_id[is]": id
      }).request((error,result) => {
        if(error){
            console.log(error);
        }else{
            let itemPriceArray = [];
            for(var i = 0; i < result.list.length;i++){
                var entry=result.list[i]
                var item_price = entry.item_price;
                itemPriceArray.push(item_price);
            }
            let obj = [
                {
                  planName: planName,
                },
                {
                  $set: {
                    addonPriceArray: itemPriceArray,
                  },
                },
                {
                  upsert: true,
                },
              ];
              updateSubscriptionPlanPromise(obj).catch((error)=>{
                logger.error(error);
              })
        }
    });
}


/**
 * Set planDetails object in SubscriptionPlan collection from planId
 * @param {String} id - id of plan which need to add in db 
 */
exports.setPlan = (id,planName) =>{
    chargebee.item.retrieve(id).request((error,result) => {
        if(error){
            console.log("CHARGBEE........................",error);
        }else{
          var item = result.item;
          let obj = [
            {
              planName: planName,
            },
            {
              $set: {
                planDetails: item,
              },
            },
            {
              upsert: true,
            },
          ];
          updateSubscriptionPlanPromise(obj).catch((error)=>{
            logger.error(`Chargbee Set Plan Error:${error}`);
          })
        }
      });
}



exports.setPlansInDB = () => {
    console.log('function call............');
    let id = 'Enterprise'
    let addOnId = 'Enterprise-User';
    exports.setAddonPriceList(addOnId,id);
}


// Main Function where tracker users and projects restriction flow handle
exports.updateRestrictProject = (updateObject) => {
    return new Promise((mainRes,mainRej)=>{
        try {
            const {companyId,planFeature} = updateObject;

            getCompanyDataFun([companyId]).then(async(response) => {
                const companyData = response[0];
                let checkExceed = exports.checkExceed(companyData.projectCount,planFeature);
                let checkCompanyUsers = await exports.checkExceedCompanyUsers(JSON.parse(JSON.stringify(companyData)),planFeature);
                // If checkExceed returns true, it means we have to set the 'isRestrict' field to value true and false. In this case, the plan is not allowed to access all project.
                // If checkExceed returns false, it means we have to set the 'isRestrict' field to false. In this case, the plan is allowed to access all projects.

                let promises = [
                    exports.handleProjectData(checkExceed,companyId),
                    exports.handleUserData(checkCompanyUsers, companyId)
                ]
                
                Promise.allSettled(promises)
                .then(async(result)=>{
                    removeCache("UserProjectData:", true);
                    await trackerUserHandler(companyId,planFeature,JSON.parse(JSON.stringify(companyData))).catch((err)=>{logger.error(`trackerUserHandler Error:${err}`);})
                    let errorArray = result.filter((x) => x.status === "rejected")
                    errorArray.forEach((x) => {
                        logger.error(`updateRestrictProject Error:${error} value ${x.value}`);
                    })
                    if(errorArray.length == 0) {
                        mainRes({status:true, statusText:'done'})
                    } else {
                        mainRes({status:false, statusText:'Something went wrong'})
                    }
                })
                .catch((err)=>{
                    logger.error(`updateRestrictProject Error:${err}`);
                    mainRej({status:false, statusText:'Something went wrong'})
                })
    
            })
        } catch (error) {
            logger.error(`updateRestrictProject Error:${err}`);
            mainRej({status:false, statusText:'Something went wrong'})
        }
    })
}

// Main Function where project restriction flow handle
exports.handleProjectData = (checkExceed,companyId) => {
    return new Promise((projectRes,projectRej)=>{
        try {
            if(checkExceed.status === true){
                exports.updateProjects(checkExceed,companyId).then(() => {
                    projectRes({
                        status: true,
                        statusText: "Success"
                    })
                }).catch((error)=> {
                    logger.error(`${error} error in updateProjects`);
                    projectRej({status:false,error:  new Error('Error in updateProjects')})
                });
            }else{
                const obj = {
                    type: SCHEMA_TYPE.PROJECTS,
                    data: [
                        {},
                        { $set: { isRestrict: false } }
                    ]
                }
                MongoDbCrudOpration(companyId,obj,"updateMany").then(()=> {
                    projectRes({
                        status: true,
                        statusText: "Success"
                    })
                }).catch((error)=> {
                    logger.error(`${error} error in updatemany`);
                    projectRej({status:false,error:  new Error('Error in updatemany')})
                })
                let projectQuery = {
                    type: dbCollections.PROJECTS,
                    data: [[
                        {
                            $facet: {
                                countAll: [
                                    { $match: { isRestrict: false } },
                                    { $count: "countAll" }
                                ],
                                countPublic: [
                                    { $match: { isRestrict: false,isPrivateSpace: false } },
                                    { $count: "countPublic" }
                                ],
                                countPrivate: [
                                    { $match: { isRestrict: false, isPrivateSpace: true} },
                                    { $count: "countPrivate" }
                                ],
                            }
                        }
                    ]]
                }
                MongoDbCrudOpration(companyId,projectQuery,"aggregate").then((result)=>{
                    let projectCountObj = {
                        type: SCHEMA_TYPE.COMPANIES,
                        data: [
                            {_id : companyId},
                            {
                                $set: {
                                    'projectCount.publicCount': result[0]?.countPublic[0]?.countPublic || 0,
                                    'projectCount.privateCount': result[0]?.countPrivate[0]?.countPrivate || 0,
                                    'projectCount.projectCount': result[0]?.countAll[0]?.countAll || 0,
                                },
                            }
                        ]
                    }
                    updateCompanyFun(SCHEMA_TYPE.GOLBAL,projectCountObj,"updateOne",companyId)
                    .catch((error)=> {
                        logger.error(`${error} error in projectCountObj`);
                    })
                })
            }
        } catch (error) {
            logger.error(`${error} error in HandleProjectData`);
            projectRej({status:false,error:  new Error('Error in HandleProjectData')})
        }
    })
}
// Main Function where user restriction flow handle
exports.handleTrackerUserData = (checkUsers,companyId) => {
    return new Promise((userRes,userRej)=>{
        try {
            //USR RESTRICTION START
            if(checkUsers.status == true) {
                if(checkUsers.data && Object.keys(checkUsers.data).length !== 0) {
                    if(checkUsers.data.count || checkUsers.data.count==0) {
                        let object = {
                            type: dbCollections.COMPANY_USERS,
                            data:[[
                                {$match: {isTrackerUser : true}},
                                {$sort: { createdAt: -1 }}
                            ]]
                        }
                        if (checkUsers.data.count !== 0) {
                            object.data[0].push({$limit: checkUsers.data.count || 1});
                        }
                        //Find users array with limit
                        MongoDbCrudOpration(companyId,object, "aggregate").then((userResponse) => {
                            //Update User in Company User collection
                            const memberObject = [
                                { _id: { $in: userResponse.map((x) => new mongoose.Types.ObjectId(x._id)) } },
                                { $set: { isTrackerUser: false } },
                            ]
                            updateMemberFunction(companyId, memberObject, "updateMany")
                            .then(()=>{
                                let compObj = {
                                    type: dbCollections.COMPANIES,
                                    data: [
                                        { _id: new mongoose.Types.ObjectId(companyId) },
                                        {
                                            $inc: {
                                                trackerUsers: -(Number(checkUsers.data.count) !== 0 ? Number(checkUsers.data.count) : userResponse.length)
                                            }
                                        }
                                    ]
                                }
                                //Update Tracker User Count in COmpany Global Collection
                                updateCompanyFun(SCHEMA_TYPE.GOLBAL,compObj,"findOneAndUpdate",companyId)
                                .catch((error)=>{
                                    logger.error(`Error Updating Tracker user count: ${error}`);
                                })
                                userRes({
                                    status: true,
                                    statusText: 'Tracker status successfully.'
                                })
                            }).catch((error)=> {
                                userRej({
                                    status: false,
                                    statusText: 'Something went wrong'
                                })
                                logger.error(`${error} error in updatemany`);
                            })
                        })
                        .catch((error)=>{
                            logger.error(`${error} ERROR IN UPDATE RESTRICT TRACKER USERS`);
                            userRej({
                                status: false,
                                statusText: 'Something went wrong'
                            })
                        })
                    } else {
                        userRes({
                            status: true,
                            statusText: 'Tracker status successfully.'
                        })
                    }
                } else {
                    userRes({
                        status: true,
                        statusText: 'Tracker status successfully.'
                    })
                }
            } else {
                userRes({
                    status: true,
                    statusText: 'Tracker status successfully.'
                })
            }
            //USR RESTRICTION END
        } catch (error) {
            logger.error(`${error} error in handleTrackerUserData`);
            userRej({status:false,error:  new Error('Error in handleTrackerUserData')})
        }
    })
}


exports.checkExceed = (projectCount,planFeatureObj) => {
    let maxProject = planFeatureObj?.project; // Upgrade plan max project
    let totalProjectCount = projectCount?.projectCount || 0; // Total Project Count
    let maxPublicProject =planFeatureObj?.maxPublicProject; // Total Project public Count
    let maxPrivateProject =planFeatureObj?.maxPrivateProject; // Total Project private Count
    let totalPublicCount = projectCount?.publicCount; 
    let totalPrivateCount = projectCount?.privateCount;

    if(maxProject === null) {
        if(maxPublicProject === null && maxPrivateProject === null){
            return { status: false};
        }
        else{
            const publicCount = maxPublicProject === null ? totalPublicCount : maxPublicProject;
            const privateCount = maxPrivateProject === null ? totalPrivateCount : maxPrivateProject;
            return { status: true, public: publicCount, private: privateCount };
        }
    }
    else { 
        if(totalProjectCount < maxProject){
            let total = maxProject;
            let private = 0;
            let public = 0;
            if(maxPrivateProject === null && maxPublicProject === null) {
                return {status: true, skip: total}
            }
            if(typeof maxPrivateProject === 'number' && typeof maxPublicProject === 'number'){
                let sum = maxPrivateProject + maxPublicProject;
                if (sum > total) {
                    return {status: true, skip: total}
                }else{
                    private = maxPrivateProject;
                    public = maxPublicProject;
                }
                return { status: true, public : maxPublicProject, private: maxPrivateProject };
            }
            else if (typeof maxPrivateProject === 'number' && maxPublicProject === null){
                if(total > maxPrivateProject) {
                    private = maxPrivateProject;
                    public = total - maxPrivateProject;
                }else{
                    private = maxPrivateProject;
                    public = 0;
                }
                return { status: true, public : public, private :private };
            }
            else if(typeof maxPublicProject === 'number' && maxPrivateProject === null){
                if(total > maxPublicProject) {
                    public = maxPublicProject;
                    private = total - maxPublicProject;
                }else{
                    public = maxPublicProject;
                    private = 0
                }
                return { status: true, public : public, private :private };
            }
        }
        else{
            let total = maxProject;
            let private = 0;
            let public = 0;
            if(maxPrivateProject === null && maxPublicProject === null) {
                return {status: true, skip: total}
            }
            else if (typeof maxPrivateProject === 'number' && typeof maxPublicProject === 'number'){
                if(maxPrivateProject === maxPublicProject && maxPrivateProject + maxPublicProject === total){
                    return {status: true, public: maxPublicProject, private: maxPrivateProject}
                }else{
                    if(maxPublicProject > maxPrivateProject){
                        let count = maxPrivateProject > total ? total : maxPrivateProject
                        private = count;
                        public = total - count;
                    }else if(maxPrivateProject > maxPublicProject){
                        let count = maxPublicProject > total ? total : maxPublicProject
                        private = count;
                        public = total - count;
                    }else{
                        let sum = maxPrivateProject + maxPublicProject;
                        if (sum > total) {
                            return {status: true, skip: total}
                        }else{
                            private = maxPrivateProject;
                            public = maxPublicProject;
                        }
                    }
                    return { status: true, public : public, private :private };
                }
            }
            else if (typeof maxPrivateProject === 'number' && maxPublicProject === null){
                if(total > maxPrivateProject) {
                    private = maxPrivateProject;
                    public = total - maxPrivateProject;
                }else{
                    private = total;
                    public = 0;
                }
                return { status: true, public : public, private :private };
            }
            else if(typeof maxPublicProject === 'number' && maxPrivateProject === null){
                if(total > maxPublicProject) {
                    public = maxPublicProject;
                    private = total - maxPublicProject;
                }else{
                    public = total;
                    private = 0;
                }
                return { status: true, public : public, private:private };
            }
        }
    }
}

exports.updateProjects = (data,companyId) => {
    return new Promise((resolve,reject) => {
        try {
            if(data.skip) {
                exports.updateQuery('random',data.skip || 1,companyId).then(() => {
                    resolve(true);
                }).catch((error) => {
                    logger.error(`${error} Error in update project`);
                });
            }else if(data.private || data.public){
                if(data.private !== 0){
                    exports.updateQuery('private',data.private || 1,companyId).then((resData) => {
                        if(data.public !== 0){
                            exports.updateQuery('public',data.public || 1,companyId,{...resData,isPublic:true}).then(() => {
                                resolve(true);
                            }).catch(() => {
                                logger.error(`${error} Error in update project`);
                            });
                        }
                    }).catch(() => {
                        logger.error(`${error} Error in update project`);
                    });
                }
                else{
                    if(data.public !== 0){
                        exports.updateQuery('public',data.public || 1,companyId,{isPublic:true}).then(() => {
                            resolve(true);
                        }).catch(() => {
                            logger.error(`${error} Error in update project`);
                        });
                    }
                }
            }
        } catch (error) {
            reject(error)
            logger.error(`${error} Error`);
        }
    })
}

exports.updateQuery = (type,number,companyId,datObj = {}) => {
    return new Promise((resolve,reject) => {
        try {
            let object = {
                type: dbCollections.PROJECTS,
            }
            if(type === 'random'){
                object.data = [[
                    { $match: {}},
                    { $sort: { createdAt: -1 } },
                    { $limit: number }
                ]]
            }else if(type === 'public'){
                object.data = [[
                    { $match: {isPrivateSpace : false}},
                    { $sort: { createdAt: -1 } },
                    { $limit: number }
                ]]
            }else{
                object.data = [[
                    { $match: {isPrivateSpace : true}},
                    { $sort: { createdAt: -1 } },
                    { $limit: number }
                ]]
            }
            MongoDbCrudOpration(companyId,object, "aggregate").then((response) => {
                const obj = {
                    type: SCHEMA_TYPE.PROJECTS,
                    data: [
                        {_id: { $in: response.map((x) => x._id) } },
                        { $set: { isRestrict: false } },
                    ]
                }
                let projectCountObj = {};
                if(type === 'private'){
                    projectCountObj = {
                        type: SCHEMA_TYPE.COMPANIES,
                        data: [
                            {_id : companyId},
                            {
                                $set: {
                                    'projectCount.privateCount' : response.length,
                                    'projectCount.projectCount' : response.length,
                                }
                            }
                        ]
                    }
                }
                else if(type == 'public'){
                    projectCountObj = {
                        type: SCHEMA_TYPE.COMPANIES,
                        data: [
                            {_id : companyId},
                            {
                                $set: {
                                    'projectCount.publicCount': response.length,
                                },
                                $inc: { 'projectCount.projectCount': response.length}
                            }
                        ]
                    }
                }
                else{
                    let publicResponseCount = response.filter((x) => x.isPrivateSpace === false);
                    let privateResponseCount = response.filter((x) => x.isPrivateSpace === true);
                    projectCountObj = {
                        type: SCHEMA_TYPE.COMPANIES,
                        data: [
                            {_id : companyId},
                            {
                                $set: {
                                    'projectCount.publicCount': publicResponseCount.length,
                                    'projectCount.privateCount': privateResponseCount.length,
                                    'projectCount.projectCount': privateResponseCount.length + publicResponseCount.length,
                                },
                            }
                        ]
                    }
                }
                updateCompanyFun(SCHEMA_TYPE.GOLBAL,projectCountObj,"updateOne",companyId)
                .catch((error)=> {
                    logger.error(`${error} error in projectCountObj`);
                })
                MongoDbCrudOpration(companyId,obj,"updateMany").catch((error)=> {
                    logger.error(`${error} error in updatemany`);
                })
                if(type === 'random'){
                    // After updating 'isRestrict' to false for some IDs, the remaining ones should be updated to have 'isRestrict' set to true.
                    const updateObj = {
                        type: SCHEMA_TYPE.PROJECTS,
                        data: [
                            { _id: { $nin: response.map((record) => record._id) }},
                            { $set: { isRestrict: true } },
                        ]
                    }
                    MongoDbCrudOpration(companyId,updateObj,"updateMany").catch((error)=> {
                        logger.error(`${error} error in updatemany`);
                    })
                }
                if(datObj && datObj?.isPublic === true){
                    // "Merge the private project IDs and public project IDs, updating those with 'isRestrict' set to false. For the remaining IDs, update them to have 'isRestrict' set to true."
                    let res = response.map((x) => new mongoose.Types.ObjectId(x._id)); 
                    let mergeUnupdateArray = [];
                    if(datObj.data){
                        mergeUnupdateArray = [...res,...datObj.data]; 
                    }else{
                        mergeUnupdateArray = res;
                    }
                    const updateObj = {
                        type: SCHEMA_TYPE.PROJECTS,
                        data: [
                            { _id: { $nin: mergeUnupdateArray }},
                            { $set: { isRestrict: true } },
                        ]
                    }
                    MongoDbCrudOpration(companyId,updateObj,"updateMany").catch((err)=> {
                        logger.error(`${error} error in updatemany`);
                    })
                }
                resolve({status : true,data : response.map((x) => new mongoose.Types.ObjectId(x._id))});
            })
        } catch (error) {
            reject(error);
        }
    })
}

//Helper for updateRestrictTrackerUsers
exports.checkExceedForUser = (oldPlanFeature, planFeatureObj) => {
    return new Promise((resolve, reject) => {
        try {
            if (!planFeatureObj.timeTrackingProjectApp) {
                resolve({ status: true, data: { trackerUsers: false, count: 0 } });
                return;
            }

            const newTrackerUser = planFeatureObj.timeTrackerUser;
            const oldTrackerUser = oldPlanFeature.planFeature.timeTrackerUser;
            const oldTrackerUserCount = oldPlanFeature.trackerUsers;

            if (newTrackerUser === null && oldTrackerUser === null) {
                resolve({ status: true, data: {} });
                return;
            }

            if (typeof newTrackerUser === 'number' && newTrackerUser === 0) {
                resolve({ status: true, data: { trackerUsers: false, count: 0 } });
                return;
            }

            if (typeof oldTrackerUser === 'number' && typeof newTrackerUser === 'number' && oldTrackerUser > newTrackerUser) {
                const count = oldTrackerUserCount > newTrackerUser ? oldTrackerUserCount - newTrackerUser : 0;
                resolve({ status: true, data: { trackerUsers: false, count } });
                return;
            }

            if(oldTrackerUser == null && typeof newTrackerUser === 'number' && newTrackerUser !== 0 && oldTrackerUserCount !== 0 && oldTrackerUserCount > newTrackerUser) {
                const count = oldTrackerUserCount > newTrackerUser ? oldTrackerUserCount - newTrackerUser : 0;
                resolve({ status: true, data: { trackerUsers: false, count } });
                return;
            }

            resolve({ status: true, data: {} });
        } catch (error) {
            reject({ status: false, message: error.message });
            console.log(error);
        }
    });
};

exports.checkExceedCompanyUsers = (companyDetails, planFeatureObj) => {
    return new Promise((resolve, reject) => {
        try {
            const companyUserQuery = {
                type: dbCollections.COMPANY_USERS,
                data:[
                    {
                        isRestrict: { $in: [false, undefined] }
                    }
                ]
            }
            MongoDbCrudOpration(companyDetails._id, companyUserQuery, "find")
            .then((cUser) => {
                const newUser = planFeatureObj.users;
                const oldUser = companyDetails.planFeature.users;
                const oldUsersCount = cUser.length;

                if(newUser === null && oldUser !== null && typeof oldUser == 'number') {
                    resolve({ status: true, data: {revertRestrction: true, count: 0} });
                    return;
                }

                // if(newUser === 0 && oldUser === null) {
                //     resolve({ status: true, data: { revertRestrction: false, count: 0 } });
                // }

                // if (typeof newUser === 'number' && oldUser === 0) {
                //     resolve({ status: true, data: { revertRestrction: false, count: 0 } });
                //     return;
                // }

                if (typeof oldUser === 'number' && typeof newUser === 'number' && oldUsersCount > newUser) {
                    const count = oldUsersCount > newUser ? oldUsersCount - newUser : newUser - oldUsersCount;
                    resolve({ status: true, data: { revertRestrction: oldUsersCount > newUser ? false : true, count } });
                    return;
                }

                if(oldUser == null && typeof newUser === 'number' && newUser !== 0 && oldUsersCount !== 0 && oldUsersCount > newUser) {
                    const count = oldUsersCount > newUser ? oldUsersCount - newUser : 0;
                    resolve({ status: true, data: { revertRestrction: false, count } });
                    return;
                }

                if(newUser > oldUser || oldUsersCount < newUser) {
                    resolve({ status: true, data: { revertRestrction: true, count: oldUsersCount > newUser ? oldUsersCount - newUser : newUser - oldUsersCount } });
                    return;
                }

                if(newUser == null && oldUser == null) {
                    resolve({ status: true, data: {revertRestrction: true, count: 0} });
                    return;
                }

                resolve({ status: true, data: {} });
            })
            .catch((error)=>{
                logger.error(`Error Updating Tracker user count: ${error} checkExceedCompanyUsers`);
                reject({ status: false, message: error.message });
            })
        } catch (error) {
            logger.error(`Error Updating Tracker user count: ${error} checkExceedCompanyUsers`);
            reject({ status: false, message: error.message });
        }
    });
}

// Main Function where user restriction flow handle
exports.handleUserData = (checkUsers,companyId) => {
    return new Promise((cUserRes,cUserRej)=>{
        try {
            //USR RESTRICTION START
            if(checkUsers.status == true) {
                if(checkUsers.data && Object.keys(checkUsers.data).length !== 0) {
                    if(checkUsers.data.revertRestrction == false) {
                        if(checkUsers.data.count || checkUsers.data.count==0) {
                            let object = {
                                type: dbCollections.COMPANY_USERS,
                                data:[[
                                    {$sort: { createdAt: -1 }},
                                    {
                                        $match:{
                                            isRestrict: { $in: [false, undefined] }
                                        }
                                    }
                                ]]
                            }
                            if (checkUsers.data.count !== 0) {
                                object.data[0].push({$limit: checkUsers.data.count || 1});
                            }
                            //Find users array with limit
                            MongoDbCrudOpration(companyId,object, "aggregate").then((userResponse) => {
                                let trackerUserCount = userResponse.filter((e)=>{return e.isTrackerUser == true});

                                // Update User in Company User collection
                                const memberObject = [
                                    { _id: { $in: userResponse.map((x) => new mongoose.Types.ObjectId(x._id)) } },
                                    { $set: { isTrackerUser: false,isRestrict:true } },
                                ]
                                updateMemberFunction(companyId, memberObject, "updateMany")
                                .then(()=>{
                                    let compObj = {
                                        type: dbCollections.COMPANIES,
                                        data: [
                                            { _id: new mongoose.Types.ObjectId(companyId) },
                                            {
                                                $inc: {
                                                    trackerUsers: -(trackerUserCount.length ? trackerUserCount.length : 0)
                                                }
                                            }
                                        ]
                                    }
                                    //Update Tracker User Count in COmpany Global Collection
                                    updateCompanyFun(SCHEMA_TYPE.GOLBAL,compObj,"findOneAndUpdate",companyId)
                                    .catch((error)=>{
                                        logger.error(`Error Updating Tracker user count: ${error}`);
                                    })
                                    cUserRes({
                                        status: true,
                                        statusText: 'Users Updated successfully.'
                                    })
                                }).catch((error)=> {
                                    logger.error(`${error} error in updatemany : handleUserData`);
                                    cUserRej({
                                        status: false,
                                        statusText: 'Something went wrong'
                                    })
                                })
                            })
                            .catch((error)=>{
                                logger.error(`${error} ERROR IN UPDATE RESTRICT USERS : handleUserData`);
                                cUserRej({
                                    status: false,
                                    statusText: 'Something went wrong'
                                })
                            })
                        } else {
                            cUserRes({
                                status: true,
                                statusText: 'Users Updated successfully.'
                            })
                        }
                    } else {
                        if(checkUsers.data.count || checkUsers.data.count==0) {
                            let object1 = {
                                type: dbCollections.COMPANY_USERS,
                                data:[
                                    [
                                        {$sort: { createdAt: 1 }},
                                        {$match:{
                                            isRestrict: true
                                        }}
                                    ]
                                ]
                            }
                            if (checkUsers.data.count !== 0) {
                                object1.data[0].push({$limit: checkUsers.data.count || 1});
                            }
                            //Find users array with limit  which is restricted users
                            MongoDbCrudOpration(companyId,object1, "aggregate")
                            .then((userResponse) => {
                                if(userResponse.length > 0) {
                                    // Update User in Company User collection
                                    const memberObject = [
                                        { _id: { $in: userResponse.map((x) => new mongoose.Types.ObjectId(x._id)) } },
                                        { $set: { isRestrict:false } },
                                    ]
                                    updateMemberFunction(companyId, memberObject, "updateMany")
                                    .then(()=>{
                                        cUserRes({
                                            status: true,
                                            statusText: 'Users Revert successfully.',
                                        })
                                    })
                                    .catch((error)=>{
                                        logger.error(`${error} ERROR IN UPDATE RESTRICT USERS : handleUserData`);
                                        cUserRej({
                                            status: false,
                                            statusText: 'Something went wrong'
                                        })
                                    })
                                } else {
                                    cUserRes({
                                        status: true,
                                        statusText: 'Users Revert successfully.',
                                    })
                                }
                            })
                            .catch((error)=>{
                                logger.error(`${error} ERROR IN UPDATE RESTRICT USERS : handleUserData`);
                                cUserRej({
                                    status: false,
                                    statusText: 'Something went wrong'
                                })
                            })
                        }
                    }
                } else {
                    cUserRes({
                        status: true,
                        statusText: 'Users Updated successfully.'
                    })
                }
            } else {
                cUserRes({
                    status: true,
                    statusText: 'Users Updated successfully.'
                })
            }
            //USR RESTRICTION END
        } catch (error) {
            logger.error(`${error} error in handleUserData`);
            cUserRej({status:false,statusText:  new Error('Error in handleUserData')})
        }
    })
}

const trackerUserHandler = (companyId,planFeature,oldFeatures) => {
    return new Promise((resolve, reject) => {
        exports.checkExceedForUser(JSON.parse(JSON.stringify(oldFeatures)),planFeature)
        .then((checkUsers) => exports.handleTrackerUserData(checkUsers,companyId))
        .then((fRes) => resolve(fRes))
        .catch((error) => {
            logger.error(`${error} error in trackerUserHandler`);
            reject({status:false,statusText: 'Something went wrong'});
        });
    });
};


/**
 * Add Default subscription when company is created
 * @param {String} comapnyId 
 * @param {String} userId 
 * @returns {Promise<String>} A Promise that resolves when subscription is created.
 *                            Rejects with an error message if any issues occur during the process.
 */
function addDefaultSubscription (comapnyId,userId) {
    return new Promise((resolve, reject) => {
        try {
            getCompanyDataFun([comapnyId])
            .then((resp) => {
                if (!resp.length) {
                    reject("company data not fount");
                    return;
                }
                const companyData = resp[0];
                if (companyData.customerId && companyData.customerId !== '' ) {
                    let query = [{ $match: { defaultSubscribe: true } }];

                    getAllSubscriptionPlansPromise(query)
                    .then((sRes)=>{
                        let plan = sRes[0];
                        let subscription_items = [
                            {
                                item_price_id : plan.itemPriceArray.find((x)=> x.period_unit == 'month').id
                            }
                        ]
                        exports.createSubscriptionChargebeePromise(companyData.customerId,comapnyId,subscription_items,plan.planName).then((rData)=>{
                            resolve({
                                status: true,
                                statuText: 'Plan Create successfully.',
                                data: rData.data
                            })
                        }).catch((error)=>{
                            reject(error.message ? error.message : error);
                        })
                    }).catch((error)=>{
                        reject(error.message ? error.message : error);
                    })
                } else {
                    exports.createCustomerInPayment(userId, companyData.Cst_CompanyName).then((customerId)=>{
                        let companyUpdateObj = {
                            type: SCHEMA_TYPE.COMPANIES,
                            data: [
                                {_id : comapnyId},
                                {
                                    $set: {
                                        'customerId': customerId
                                    },
                                }
                            ]
                        }
                        updateCompanyFun(SCHEMA_TYPE.GOLBAL, companyUpdateObj, "updateOne", comapnyId)
                        .then(() => {
                            let query = [{ $match: { defaultSubscribe: true } }];
                            getAllSubscriptionPlansPromise(query)
                            .then((sRes)=>{
                                let plan = sRes[0];
                                let subscription_items = [
                                    {
                                        item_price_id : plan.itemPriceArray.find((x)=> x.period_unit == 'month').id
                                    }
                                ]
                                exports.createSubscriptionChargebeePromise(customerId,comapnyId,subscription_items,plan.planName).then(()=>{
                                    resolve('Plan Create successfully.')
                                }).catch((error)=>{
                                    reject(error.message ? error.message : error);
                                })
                            }).catch((error)=>{
                                reject(error.message ? error.message : error);
                            })
                        })
                        .catch((error)=>{
                            logger.error(`ERROR in COMPANY UPDATE FOR GLOBAL DATABASE: ${error}`)
                            reject(`ERROR in COMPANY UPDATE FOR GLOBAL DATABASE: ${error.message ? error.message : error}`);
                        })

                    }).catch((error)=>{
                        reject(error.message ? error.message : error);
                    })
                }
            }).catch((error)=>{
                reject(error.message ? error.message : error);
            })
        } catch (error) {
            reject(error.message ? error.message : error);
        }
    })
}


/**
 * addDefaultSubscriptionFun
 * @param {String} companyId 
 * @param {String} userId 
 * @returns 
 */
exports.addDefaultSubscriptionFun = (companyId, userId) => {
    return new Promise((resolve, reject) => {
        try {
            addDefaultSubscription(companyId,userId)
            .then((rData) => {
                logger.info(`${companyId} >> DEFAULT SUBSCRIPTION ADDED`);
                resolve({
                    data: rData.data,
                    status: true,
                    statusText: `${companyId} >> DEFAULT SUBSCRIPTION ADDED`
                });
            })
            .catch((error)=>{
                logger.error(`ERROR in create default Subscription: ${error?.message}`);
                reject({
                    status: false,
                    error: error,
                    statusText: `ERROR in create default Subscription: ${error?.message}`
                });
            })
        } catch (error) {
            reject({
                status: false,
                error: error
            });
        }
    })
};


/**
 * Add Default Subscription Request Funcation
 * @param {Object} req 
 * @param {Object} res 
 */
exports.addDefaultSubscriptionRequestFun = (req, res) => {
    try {
        const { companyId, userId } = req.body;
        exports.addDefaultSubscriptionFun(companyId,userId)
        .then(() => {
            logger.info(`${companyId} >> DEFAULT SUBSCRIPTION ADDED`);
            res.send({
                status: true,
                statusText: `${companyId} >> DEFAULT SUBSCRIPTION ADDED`
            });
        })
        .catch((error)=>{
            logger.error(`ERROR in create default Subscription: ${error?.message}`);
            res.send({
                status: false,
                error: error,
                statusText: `ERROR in create default Subscription: ${error?.message}`
            });
        })
    } catch (error) {
        res.send({
            status: false,
            error: error
        });
    }
};


exports.getpaymentCustomer = (req, res) => {
    try {
        const companyId = req.headers['companyid'];
        exports.getCompanyData(companyId, (resp) => {
            if (!resp.status) {
                res.status(400).send({
                    status: false,
                    statusText: resp.error
                });
                return;
            }
            chargebee.customer.retrieve(resp.data.customerId).request((error, result) => {
                if (error) {
                    logger.error(`Get Payment Customer Error: ${error?.message || error}`);
                    res.status(400).send({
                        status: false,
                        error: error?.message || error
                    });
                    return;
                } else {
                    res.status(200).send({
                        status: true,
                        data: result
                    })
                }
            })
        });
    } catch (error) {
        logger.error(`Get Payment Customer try catch Error: ${error?.message || error}`);
        res.status(400).send({
            status: false,
            error: error?.message || error
        });
    }
};


/**
 * Customer Update
 * @param {Object} req 
 * @param {Object} res 
 */
exports.customerUpdate = (req, res) => {
    try {
        let companyId = req.headers['companyid'];
        if (!companyId) {
            companyId = req.body.companyId
        }
        exports.getCompanyData(companyId, (resp) => {
            if (!resp.status) {
                res.status(400).send({
                    status: false,
                    statusText: resp.error
                });
                return;
            }
            let fObj = {};
            if (req.body.key === "companyName") {
                fObj = {
                    company: resp.data.Cst_CompanyName
                };
            }
            chargebee.customer.update(resp.data.customerId, fObj).request((errorComp,resultComp) => {
                if(errorComp){
                    logger.error(`Update Customer Error : ${errorComp}`);
                    res.status(400).send({
                        status: false,
                        statusText: 'Customer not updated.',
                        error: errorComp
                    });
                    return;
                }else{
                    res.status(200).send({
                        status: true,
                        statusText: 'Customer updated.'
                    });
                    return;
                }
            });
        });
    } catch (error) {
        logger.error(`Update Customer try catch Error: ${error?.message || error}`);
        res.status(400).send({
            status: false,
            error: error?.message || error
        });
    }
}

exports.storePromotionalCredit = async (noOfCredit,customerId,description) => {
    try {   
        await chargebee.promotional_credit.add({
            customer_id : customerId,
            amount : noOfCredit,
            description : description,
            credit_type: 'referral_rewards',
            currency_code: 'USD'
        }).request((error) => {
            if(error){
                logger.error(`Error While Add Promotional Credit: ${error}`);
            }
        });
    } catch (error) {
        logger.error(`Error Store Pramotional Credit: ${error}`);
    }
}


async function fetchAllPromotionalCredits(customerId, limit = 100, offset = null, allData = []) {
    try {
        const params = {
            'customer_id[is]': customerId,
            limit: limit
        };
        if (offset) {
            params.offset = offset;
        }
        
        const response = await chargebee.promotional_credit.list(params).request();

        if (response.list.length > 0) {
            allData.push(...response.list);
        }

        if (response.next_offset) {
            return fetchAllPromotionalCredits(customerId, limit, response.next_offset, allData);
        }

        return allData;
    } catch (error) {
        throw error;
    }
}


exports.getPromotionalCredit = async (req, res) => {
    try {
        const data = await fetchAllPromotionalCredits(req.params.id);
        res.status(200).json({ data });
    } catch (error) {
        res.status(400).json({ message: "Failed to fetch promotional credits", error: error.message });
    }
};
