var chargebee = require("chargebee");
const config = require("../../Config/config");
const { dbCollections } = require('../../Config/collections');
const logger = require("../../Config/loggerConfig");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries");
const {
    getAllSubscriptionPlansPromise,
    updateSubscriptionPlanPromise,
  } = require("../SubscriptionPlan/controller");
const { removeCache } = require("../../utils/commonFunctions");
chargebee.configure({
    site : config.CHARGEBEE_SITE,
    api_key : config.CHARGEBEE_API_KEY
})

exports.createPaymentPlan = (req,res) => {
    try {
        let fields = ['planName','users','description','monthlyPrice','yearlyPrice','planDescription','project','maxPrivateProject','maxPublicProject',
            'sprintPerProject','maxTaskPerSprint','timeTrackerUser','bucketStorage','maxFileSize','guestUser','maxPublicChannels','maxPrivateChannels','userRoles',
            'userDesignation','team','checkList','listView','boardView','calenderView','tableView','embadeVIew','workloadView','projectDetailsView','actitvityView',
            'commentsView','advanceFilterCtrlK','chat','oneToOneChat','chanels','trackerTimesheet','userTimesheet','projectTimesheet','workloadTimesheet','milestone',
            'milstoneReport','projectProjectApp','tagProjectApp','multipleAssigneeProjectApp','timeEstimateProjectApp','timeTrackingProjectApp','globalPermison',
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
        exports.setupChargbee(finalObj).then(()=>{
            res.status(200).json({message: `Plan Added Successfully`});
        }).catch((error)=>{
            res.status(400).json({message: error})
        })  
    } catch (error) {
        res.status(400).json({message: error});
    }
}


/**
 * Set itemPriceArray Array in SubscriptionPlan collection from priceId
 * @param {String} id - id of price which need to add in db
 * @param {String} planName - planName in for set in db  
 */
exports.setPriceList = (id,planName) => {
    return new Promise((resolve, reject) => {
        try {
            chargebee.item_price.list({
                "item_id[is]": id
              }).request(function(error,result) {
                if(error){
                    reject(error);
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
                      updateSubscriptionPlanPromise(obj)
                      .then(()=>{
                        resolve();
                    }).catch((error)=>{
                        logger.error(`Chargbee Set Price Db Error:${error}`);
                        reject(error);
                    })
                }
            });
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Set addonPriceArray Array in SubscriptionPlan collection from addOnPriceId
 * @param {String} id - id of addon which need to add in db 
 */
exports.setAddonPriceList = (id,planName) => {
    return new Promise((resolve,reject)=>{
        try {
            chargebee.item_price.list({
                "item_id[is]": id
              }).request(function(error,result) {
                if(error){
                    reject(error);
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
                      updateSubscriptionPlanPromise(obj)
                      .then(()=>{
                        resolve();
                      }).catch((error)=>{
                        reject(error);
                      })
                }
            });
        } catch (error) {
            reject(error);
        }
    })
}


/**
 * Set planDetails object in SubscriptionPlan collection from planId
 * @param {String} id - id of plan which need to add in db 
 */
exports.setPlan = (id,planName,statuss,defaultSubscribe,sortIndex, isContactSupport=false, supportLink="") =>{
    return new Promise((resolve, reject) => {
        try {
            chargebee.item.retrieve(id).request(function(error,result) {
                if(error){
                    reject(error);
                }else{
                  var item = result.item;
                  let query = [
                    {
                      planName: planName,
                    },
                    {
                      $set: {
                        planDetails: item,
                        planName: planName,
                        status: statuss,
                        defaultSubscribe: defaultSubscribe,
                        sortIndex: sortIndex,
                        addonPriceArray: [],
                        isContactSupport: isContactSupport ? isContactSupport : false,
                        supportLink: supportLink
                      },
                    },
                    {
                      upsert: true,
                    },
                  ];
                  updateSubscriptionPlanPromise(query)
                  .then(()=>{
                    resolve();
                  }).catch((error)=>{
                    reject(error);
                  })
                }
              });
        } catch (error) {
            reject(error);
        }
    })
}

exports.createProductFamily = () => {
    return new Promise((resolve, reject) => {
        try {
            chargebee.item_family.create({
                id : "Alian-Hub",
                description : "Alian Hub Family",
                name : "Alian Hub"
            }).request(function(error,result) {
                if(error){
                    reject(error);
                }else{
                    resolve(result.item_family);
                }
            });
        } catch (error) {
            reject(error);
        }
    })
}
exports.createPlan = (id,name,type) => {
    return new Promise((resolve, reject) => {
        try {
            let obj = {
                id : id,
                name : name,
                type : type,
                item_family_id: "Alian-Hub"
            }
            if (type === 'PLAN') {
                obj.item_applicability = "ALL";   
            }
            chargebee.item.create(obj).request(function(error,result) {
                if(error){
                    reject(error);
                }else{
                    resolve(result.item);
                }
            });
        } catch (error) {
            reject(error);
        }
    })
}

exports.setPrice = (id,itemId,name,pricingModel,price,externalName,periodUnit) => {
    return new Promise((resolve,reject)=>{
        try {
            chargebee.item_price.create({
                id : id,
                item_id : itemId,
                name : name,
                pricing_model : pricingModel,
                price : price,
                external_name : externalName,
                currency_code: "USD",
                period_unit : periodUnit,
                period : 1
              }).request(function(error,result) {
                if(error){
                    reject(error);
                }else{
                  resolve(result.item_price);
                }
            });
        } catch (error) {
            reject(error);
        }
    })
}

exports.setUpDBForChargbee = (obj) => {
    return new Promise((resolve,reject)=>{
        try {
            let dbQ = [
                { $project: { _id: 0, sortIndex: 1 } },
                { $sort: { sortIndex: -1 } },
                { $limit: 1 },
              ];
              getAllSubscriptionPlansPromise(dbQ)
              .then((resp)=>{
                let sortIndex = resp[0].sortIndex ? (resp[0].sortIndex + 65536): 0
                Promise.allSettled([
                    exports.setPlan(obj.planId,obj.planId,1,false,sortIndex, obj.isContactSupport, obj.supportLink),
                ]).then((response)=>{
                    let errorArr = response.filter((x)=> x.status === 'rejected');
                    if (!errorArr.length) {
                        Promise.allSettled([
                            exports.setPriceList(obj.planId,obj.planId),
                            exports.setAddonPriceList(`${obj.planId}-User`,obj.planId),
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
                    } else {
                        reject(errorArr);
                    }
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
                removeCache('planfeature', false);
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
                removeCache('planfeaturedisplay', false);
                resolve();
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}



exports.setupChargbee = (obj) => {
    return new Promise((resolve, reject) => {
        try {
            let planId = obj.planName.replaceAll(" ","");
            obj.planId = planId;
            Promise.allSettled([exports.createPlan(planId,obj.planName,"PLAN"),exports.createPlan(`${planId}-User`,`${obj.planName}-User`,"ADDON")]).then((result)=>{
                let errorArray = result.filter((x)=> x.status === 'rejected')
                if (!errorArray.length) {
                    Promise.allSettled([
                        exports.setPrice(`${planId}-USD-Monthly`,planId,`${planId}-USD-Monthly`,'FLAT_FEE',Number(obj.monthlyPrice)*100,planId,'MONTH'),
                        exports.setPrice(`${planId}-USD-Yearly`,planId,`${planId}-USD-Yearly`,'FLAT_FEE',Number(obj.yearlyPrice)*100,planId,'YEAR'),
                        exports.setPrice(`${planId}-User-USD-Monthly`,`${planId}-User`,`${planId}-User-USD-Monthly`,'PER_UNIT',Number(obj.monthlyPrice)*100,`${planId}-User`,'MONTH'),
                        exports.setPrice(`${planId}-User-USD-Yearly`,`${planId}-User`,`${planId}-User-USD-Yearly`,'PER_UNIT',Number(obj.yearlyPrice)*100,`${planId}-User`,'YEAR'),
                    ]).then((priceRes)=>{
                        let priceResError = priceRes.filter((x)=> x.status === 'rejected');
                        if (!priceResError.length) {
                            exports.setUpDBForChargbee(obj).then(()=>{
                                resolve();
                            }).catch((error)=>{
                                reject(error);
                            })
                        } else {
                            let errorArrays = priceResError.map((x)=> x.reason)
                            reject(errorArray);
                        }
                    }).catch((error)=>{
                        reject(error);
                    })
                } else {
                    let errorArrays = errorArray.map((x)=> x.reason)
                    reject(errorArrays);
                }
            }).catch((error)=>{
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}




exports.editPaymentPlan = (req,res) => {
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
        if(!req.body.planId) {
            req.body.planId = planId;
        }

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
        Promise.allSettled([exports.changePlanStatusChargbee(req.body.planId,status),exports.changePlanStatusChargbee(`${req.body.planId}-User`,status)]).then((result)=>{
            let errorArray = result.filter((x)=> x.status === 'rejected')
            if (!errorArray.length) {
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
                            { planName: req.body.planId },
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
                    let obj = [{ planName: req.body.planId }, { status: dbStatus }, { returnDocument: 'after' }];
                    updateSubscriptionPlanPromise(obj)
                    .then((response)=>{
                        res.status(200).json({message: 'Plan Status Change Succesfully',planName: response.planName});
                    }).catch((error)=>{
                        res.status(400).json({message: error});
                    })
                }
            } else {
                let errorArrays = errorArray.map((x)=> x.reason)
                res.status(400).json({message: errorArrays});
            }
        })

    } catch (error) {
        res.status(400).json({message: error});
    }
}


exports.changePlanStatusChargbee = (planId,status) => {
    return new Promise((resolve, reject) => {
        try {
            chargebee.item.update(planId,{
                status: status
            }).request(function(error,result) {
                if(error){
                  reject(error);
                }else{
                  resolve("Update Succesfully");
                }
            });
        } catch (error) {
            reject(error);
        }
    })
}