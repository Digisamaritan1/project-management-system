const axios = require('axios');
const config = require("../../Config/config");
const { dbCollections } = require("../../Config/collections.js");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries");
const {
    getAllSubscriptionPlansPromise,
    updateSubscriptionPlanPromise,
  } = require("../SubscriptionPlan/controller");

exports.setProductPaddle = (planName) => {
    return new Promise((resolve, reject) => {
        try {
            let data = JSON.stringify({
                "name": planName,
                "tax_category": "standard"
            });
        
            let configeration = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${config.PADDLE_URL}/products`,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${config.PADDLE_API_KEY}`
                },
                data : data
            };
        
            axios.request(configeration)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    })

}

exports.setPricePaddle = (productId,price,interval) => {
    return new Promise((resolve, reject) => {
        try {
            let data = {
                "description": 'price created from the admin',
                "product_id": productId,
                "unit_price": {
                    "amount": price,
                    "currency_code": "USD"
                },
                "billing_cycle": {
                    "interval": interval,
                    "frequency": 1
                }
            };
            let configeration = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${config.PADDLE_URL}/prices`,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${config.PADDLE_API_KEY}`
                },
                data : data
            };
            axios.request(configeration)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    })
}

exports.setPlanFeatures = (obj,isEdit=false) => {
    return new Promise((resolve, reject) => {
        try {
            let finalObj = JSON.parse(JSON.stringify(obj));
            delete finalObj.monthlyPrice
            delete finalObj.yearlyPrice
            delete finalObj.planDescription
            delete finalObj.description
            let planFeatures = {
                ...finalObj,
                planName: finalObj.planId
            }
            let object;
            let method;
            if (!isEdit) {
                object = {
                    type: dbCollections.PLANFEATURE,
                    data: planFeatures
                }
                method = 'save'
            } else {
                object = {
                    type: dbCollections.PLANFEATURE,
                    data: [
                        {
                            planName: planFeatures.planName
                        },
                        {...planFeatures}
                    ]
                }
                method = 'findOneAndUpdate'
            }
            MongoDbCrudOpration("global",object,method).then(()=>{
                resolve();
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}
exports.setPlanFeaturesDisplay = (obj,isEdit=false) => {
    return new Promise((resolve, reject) => {
        try {
            let object;
            let method;
            if (!isEdit) {
                object = {
                    type: dbCollections.PLANFEATUREDISPLAY,
                    data: {
                        planName: obj.planId,
                        planDescription: obj.planDescription,
                        planFeatureTtitle: "",
                        planFeature: obj.description,
                    }
                }
                method = 'save';
            } else {
                object = {
                    type: dbCollections.PLANFEATUREDISPLAY,
                    data: [
                        {
                            planName: obj.planId
                        },
                        {
                            planName: obj.planId,
                            planDescription: obj.planDescription,
                            planFeatureTtitle: "",
                            planFeature: obj.description,
                        }
                    ]
                }
                method = 'findOneAndUpdate'
            }
            MongoDbCrudOpration("global",object,method).then(()=>{
                resolve();
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

exports.setPaddleDb = (obj,productData,priceData, isContactSupport=false, supportLink="") => {
    return new Promise((resolve, reject) => {
        try {
            let dbQ = [
                { $project: { _id: 0, sortIndex: 1 } },
                { $sort: { sortIndex: -1 } },
                { $limit: 1 },
              ];
              getAllSubscriptionPlansPromise(dbQ)
              .then((resp)=>{
                let sortIndex = (resp.length && resp[0].sortIndex) ? (resp[0].sortIndex + 65536): 0
                let object = {
                    addonPriceArray: [],
                    status: 1,
                    planName: obj.planId,
                    itemPriceArray: priceData,
                    planDetails: productData,
                    defaultSubscribe: false,
                    sortIndex: sortIndex,
                    isContactSupport: isContactSupport ? isContactSupport : false,
                    supportLink: supportLink
                }
                let dbObj = [
                    {
                      planName: obj.planId,
                    },
                    {
                      $set: { ...object },
                    },
                    {
                      upsert: true,
                    },
                  ];
                  updateSubscriptionPlanPromise(dbObj)
                  .then(()=>{
                Promise.allSettled([
                    exports.setPlanFeatures(obj),
                    exports.setPlanFeaturesDisplay(obj)
                ]).then((ele)=>{
                    let errAr = ele.filter((x)=> x.status === 'rejected');
                    if (!errAr.length) {
                        resolve();
                    } else {
                        reject(errAr);
                    }
                })
                }).catch((error)=>{
                    reject(error);
                })
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

exports.setupPaddle = (obj) => {
    return new Promise((resolve, reject) => {
        try {
            let planId = obj.planName.replaceAll(" ","");
            obj.planId = planId;
            exports.setProductPaddle(obj.planName).then((productRes)=>{
                Promise.allSettled([exports.setPricePaddle(productRes.data.id,String(Number(obj.monthlyPrice)*100),'month'),exports.setPricePaddle(productRes.data.id,String(Number(obj.yearlyPrice)*100),'year')]).then((pricesREsp)=>{
                    let errorArray = pricesREsp.filter((x)=> x.status === 'rejected');
                    if (!errorArray.length) {
                        let prices = pricesREsp.filter((x)=> x.status === 'fulfilled').map((z)=> {return {...z.value.data,period_unit: z.value.data.billing_cycle.interval,price: z.value.data.unit_price.amount}});
                        exports.setPaddleDb(obj,productRes.data,prices, obj.isContactSupport, obj.supportLink).then(()=>{
                            resolve();
                        }).catch((error)=>{
                            reject(error);
                        })
                    } else {
                        let errorMessage = errorArray.map((x)=> x.reason);
                        reject(errorMessage)
                    }
                })
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

exports.createPaymentPlan = (req,res) => {
    try {
        let fields = ['planName','users','description','monthlyPrice','yearlyPrice','planDescription','project','maxPrivateProject','maxPublicProject',
            'sprintPerProject','maxTaskPerSprint','timeTrackerUser','bucketStorage','maxFileSize','guestUser','maxPublicChannels','maxPrivateChannels',
            'userRoles','userDesignation','team','checkList','listView','boardView','calenderView','tableView','embadeVIew','workloadView','projectDetailsView',
            'actitvityView','commentsView','advanceFilterCtrlK','chat','oneToOneChat','chanels','trackerTimesheet','userTimesheet','projectTimesheet','workloadTimesheet',
            'milestone','milstoneReport','projectProjectApp','tagProjectApp','multipleAssigneeProjectApp','timeEstimateProjectApp','timeTrackingProjectApp','globalPermison',
            'projectWisePermisson','customFields','pushNotification','emailNotification'
        ]
        if (req.body.isContactSupport) {
            fields = ['planName','description','planDescription', 'supportLink'];
        }
        let errorFields = "";
        let count = 0;
        fields.forEach((key)=>{
            if (req.body[key]=== undefined) {
                if (count === 0) {
                    errorFields += key;
                } else {
                    errorFields += `, ${key}`;
                }
                count++;
            }
        })
        if (errorFields.length) {
            errorFields += "fields should not be empty or undefined."
            res.status(400).json({message: errorFields});
            return;
        }
        let finalObj = req.body;
        if (req.body.isContactSupport) {
            finalObj = {
                ...req.body,
                users: null,
                monthlyPrice: 0,
                yearlyPrice: 0,
                project: null,
                maxPrivateProject: null,
                maxPublicProject: null,
                sprintPerProject: null,
                maxTaskPerSprint: null,
                timeTrackerUser: null,
                bucketStorage: null,
                maxFileSize: null,
                guestUser: null,
                maxPublicChannels: null,
                maxPrivateChannels: null,
                aiRequest : null,
                userRoles:true,
                userDesignation:true,
                team:true,
                checkList: true,
                listView:true,
                boardView:true,
                calenderView:true,
                tableView:true,
                embadeVIew:true,
                workloadView:true,
                projectDetailsView:true,
                actitvityView: true,
                commentsView: true,
                advanceFilterCtrlK:true,
                chat:true,
                oneToOneChat:true,
                chanels:true,
                trackerTimesheet:true,
                userTimesheet:true,
                projectTimesheet: true,
                workloadTimesheet: true,
                milestone:true,
                milstoneReport:true,
                projectProjectApp:true,
                tagProjectApp:true,
                multipleAssigneeProjectApp:true,
                timeEstimateProjectApp:true,
                timeTrackingProjectApp:true,
                globalPermison:true,
                projectWisePermisson:true,
                customFields: true,
                pushNotification: true,
                emailNotification:true,
                aiPermission: true
            }
        }
        exports.setupPaddle(finalObj).then(()=>{
            res.status(200).json({message: `Plan Added Successfully`});
        }).catch((error)=>{
            res.status(400).json({message: error})
        })  
    } catch (error) {
        res.status(400).json({message: error});
    }
}


exports.editPaymentPlan = (req,res) => {
    try {
        let fields = ['planName','users','description','monthlyPrice','yearlyPrice','planDescription','project','maxPrivateProject','maxPublicProject','sprint',
            'sprintPerProject','maxPrivateSprintPerProject','maxPublicSprintPerProject','folder','folderPerProject','task','maxTaskPerProject','maxTaskPerSprint',
            'timeTrackerUser','bucketStorage','maxFileSize','guestUser','maxPublicChannels','maxPrivateChannels','userRoles','userDesignation','team','checkList',
            'listView','boardView','calenderView','tableView','embadeVIew','workloadView','projectDetailsView','actitvityView','commentsView','advanceFilterCtrlK',
            'chat','oneToOneChat','chanels','trackerTimesheet','userTimesheet','projectTimesheet','workloadTimesheet','milestone','milstoneReport',
            'projectProjectApp','tagProjectApp','multipleAssigneeProjectApp','timeEstimateProjectApp','timeTrackingProjectApp','globalPermison',
            'projectWisePermisson','customFields','pushNotification','emailNotification'
        ]
        if (req.body.isContactSupport) {
            fields = ['planName','description','planDescription', 'supportLink'];
        }
        let errorFields = "";
        let count = 0;
        fields.forEach((key)=>{
            if (req.body[key]=== undefined) {
                if (count === 0) {
                    errorFields += key;
                } else {
                    errorFields += `,${key}`;
                }
                count++;
            }
        })
        if (errorFields.length) {
            errorFields += "fields should not be empty or undefined."
            res.status(400).json({message: errorFields});
            return;
        }
        let planId = req.body.planName.replaceAll(" ","");
        req.body.planId = planId;
        Promise.allSettled([exports.setPlanFeatures(req.body,true),exports.setPlanFeaturesDisplay(req.body,true)]).then((ele)=>{
            let errAr = ele.filter((x)=> x.status === 'rejected');
            if (!errAr.length) {
                res.status(200).json({message: 'Plan Edit Successfully'});
            } else {
                res.status(400).json({message: errAr});
            }
        }).catch((error)=>{
            res.status(400).json({message: error});
        })
    } catch (error) {
        res.status(400).json({message: error});
    }
}

exports.updatePriceAndProductPaddle = (type,status,id) => {
    return new Promise((resolve, reject) => {
        try {
            let data = {
                "status": status
            }
            let url;
            if (type === 'product') {
                url = `${config.PADDLE_URL}/products/${id}`
            } else {
                url = `${config.PADDLE_URL}/prices/${id}`
            }
            let configration = {
                method: 'patch',
                maxBodyLength: Infinity,
                url: url,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${config.PADDLE_API_KEY}`
                },
                data : data
            };
        
            axios.request(configration)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    })
}

exports.changePlanStatusPaddle = (procutId,status) => {
    return new Promise((resolve, reject) => {
        try {
            if (status === 'active') {
                let configration = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `${config.PADDLE_URL}/products/${procutId}?include=prices`,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${config.PADDLE_API_KEY}`
                    },
                };
    
                axios.request(configration)
                .then((product) => {
                    exports.updatePriceAndProductPaddle('product',status,procutId).then(()=>{
                        let productPrice = product.data.data.prices.map((x)=> x.id)
                        let promises = []
                        productPrice.forEach((priceId)=>{
                            promises.push(exports.updatePriceAndProductPaddle('price','active', priceId));
                        })
                        Promise.allSettled(promises).then((repo)=>{
                            let erArr = repo.filter((x)=> x.status === 'rejected');
                            if (!erArr.length) {
                                exports.updatePriceAndProductPaddle('product',status,procutId).then(()=>{
                                    resolve();
                                }).catch((error)=>{
                                    reject(error)
                                })
                            } else {
                                reject(erArr);
                            }
                        })  
                    }).catch((error)=>{
                        reject(error)
                    })
                })
                .catch((error) => {
                    reject(error);
                });
                // Promise.allSettled()
            } else {
                exports.updatePriceAndProductPaddle('product',status,procutId).then(()=>{
                    resolve();
                }).catch((error)=>{
                    reject(error)
                })
            }

        } catch (error) {
            reject(error);
        }
    })
}

exports.planStatusChange = (req,res) => {
    try {
        if (!(req.body && req.body.planId)) {
            res.status(400).json({message: 'planId is required'});
            return;
        }
        if (req.body.isActive === undefined || typeof req.body.isActive !== 'boolean') {
            res.status(400).json({message: 'isActive is required'});
            return;
        }
        let status = req.body.isActive ? 'active' : 'archived';
        let dbStatus = req.body.isActive ? 1 : 2
        exports.changePlanStatusPaddle(req.body.planId,status).then(()=>{
            if (req.body.isActive) {
                let dbQ = [
                    { $project: { _id: 0, sortIndex: 1 } },
                    { $sort: { sortIndex: -1 } },
                    { $limit: 1 },
                  ];
                  getAllSubscriptionPlansPromise(dbQ)
                  .then((resp)=>{
                    let sortIndex = resp[0].sortIndex ? (resp[0].sortIndex + 65536): 0
                    let obj = [
                        { "planDetails.id": req.body.planId },
                        {
                          $set: {
                            status: dbStatus,
                            sortIndex: sortIndex,
                          },
                        },
                        { returnDocument: 'after' }
                      ];
                      updateSubscriptionPlanPromise(obj)
                      .then((response)=>{
                        res.status(200).json({message: 'Plan Status Change Succesfully',planName: response.planName,sortIndex: sortIndex});
                    }).catch((error)=>{
                        res.status(400).json({message: error});
                    })
                }).catch((err)=>{
                    res.status(400).json({message: err});
                })
            } else {
                let obj = [
                    { "planDetails.id": req.body.planId },
                    { status: dbStatus },
                    { returnDocument: 'after' }
                  ];
                  updateSubscriptionPlanPromise(obj).then((response)=>{
                    res.status(200).json({message: 'Plan Status Change Succesfully',planName: response.planName});
                }).catch((error)=>{
                    res.status(400).json({message: error});
                })
            }
        }).catch((error)=>{
            res.status(400).json({message: error});
        })

    } catch (error) {
        res.status(400).json({message: error});
    }
}

/**
 * Customer Update
 * @param {Object} req 
 * @param {Object} res 
 */
exports.customerUpdate = (req, res) => {
    try {
        res.status(200).send({
            status: true,
            statusText: 'Customer updated.'
        });
    } catch (error) {
        logger.error(`Update Customer try catch Error: ${error?.message || error}`);
        res.status(400).send({
            status: false,
            error: error?.message || error
        });
    }
}