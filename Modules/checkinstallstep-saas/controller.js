
const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');
const mongoose = require("mongoose");
const path = require('path');
const extract = require('extract-zip')
const chargebee = require("chargebee");
const nodemailer = require("nodemailer");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries");
const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3');
const admin1 = require("firebase-admin");
const axios = require('axios');
const { emitListener } = require("./eventController.js");
const installStepsFilePath = __dirname + "/../../installationSteps.json";
const serviceFun = require("../serviceFunction");
const logger = require('../../Config/loggerConfig');
const { dbCollections } = require("../../Config/collections.js");
const createUserRef = require("../auth/controller/createUser");
const sendMailRef = require("../auth/controller/sendVerificationMail");
const companyRef = require("../Company/controller2");
const pjson = require('../../package.json');
const { requestHandler } = require('../../Config/config.js');
const {
    getAllSubscriptionPlansPromise,
    updateSubscriptionPlanPromise,
  } = require("../SubscriptionPlan/controller.js");
const { getUserByQueyFun } = require('../usersModule/controller.js');

exports.envVar = {
    "JWT_SECRET": require('crypto').randomBytes(16).toString('hex'),
    "PRECOMPANYKEY": require('crypto').randomBytes(4).toString('hex'),
    "WEBURL": `${process.env.APIURL.substring(0, process.env.APIURL.length - 1)}`, // Static discussion
}

exports.tmpInstallSteps = [{
    step: 1,
    status: 'todo',
    subStep: []
}, {
    step: 2,
    status: 'todo',
    subStep: []
}, {
    step: 3,
    status: 'todo',
    subStep: []
}, {
    step: 4,
    status: 'todo',
    subStep: []
}, {
    step: 5,
    status: 'todo',
    subStep: []
}, {
    step: 6,
    status: 'todo',
    subStep: []
}, {
    step: 7,
    status: 'todo',
    subStep: []
}, {
    step: 8,
    status: 'todo',
    subStep: []
}, {
    step: 9,
    status: 'todo',
    subStep: []
}, {
    step: 10,
    status: 'todo',
    subStep: []
}, {
    step: 11,
    status: 'todo',
    subStep: []
}, {
    step: 12,
    status: 'todo',
    subStep: []
}];
exports.installSteps = [];


exports.getInstallationData = () => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(installStepsFilePath)) {
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.tmpInstallSteps, envVar: exports.envVar}, null, 4), () => {
                resolve({
                    installSteps: exports.tmpInstallSteps,
                    envVar: exports.envVar
                });
            });
        } else {
            fs.readFile(installStepsFilePath, (err, data) => {
                if (err) {
                    resolve({
                        installSteps: exports.tmpInstallSteps,
                        envVar: exports.envVar
                    });
                    return;
                } else {
                    const tmpData = JSON.parse(data.toString());
                    let tenvVar = {};
                    let tinstallSteps = [];
                    if (tmpData.envVar) {
                        tenvVar = tmpData.envVar;
                    }
                    if (tmpData.installSteps) {
                        tinstallSteps = tmpData.installSteps;
                    }
                    resolve({
                        installSteps: tinstallSteps,
                        envVar: tenvVar
                    });
                }
            })
        }
    })
}


exports.initDataRoute = async () => {
    const datata =  await exports.getInstallationData();
    exports.installSteps = datata.installSteps;
    exports.envVar = datata.envVar;
}
exports.smtpVerificationCode = "";


// Initalize chargbee first and change json path accordingly for set planFeature and planFeatureDisplay function//

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
                    logger.error(`setPriceList Function Error 1: ${JSON.stringify(error)}`);
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
            logger.error(`setPriceList Function Error 2: ${JSON.stringify(error)}`);
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
                    logger.error(`setAddonPriceList Function Error 1: ${JSON.stringify(error)}`);
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
                        logger.error(`setAddonPriceList Function Error 2: ${JSON.stringify(error)}`);
                        reject(error);
                      })
                }
            });
        } catch (error) {
            logger.error(`setAddonPriceList Function Error 3: ${JSON.stringify(error)}`);
            reject(error);
        }
    })
}


/**
 * Set planDetails object in SubscriptionPlan collection from planId
 * @param {String} id - id of plan which need to add in db 
 */
exports.setPlan = (id,planName,statuss,defaultSubscribe,sortIndex) =>{
    return new Promise((resolve, reject) => {
        try {
            chargebee.item.retrieve(id).request(function(error,result) {
                if(error){
                    logger.error(`setPlan Function Error 1: ${JSON.stringify(error)}`);
                    reject(error);
                }else{
                  var item = result.item;
                  let obj = [
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
                    logger.error(`setPlan Function Error 2: ${JSON.stringify(error)}`);
                    reject(error);
                  })
                }
              });
        } catch (error) {
            logger.error(`setPlan Function Error 3: ${JSON.stringify(error)}`);
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
                    logger.error(`createProductFamily Function Error 1: ${JSON.stringify(error)}`);
                    reject(error);
                }else{
                    resolve(result.item_family);
                }
            });
        } catch (error) {
            logger.error(`createProductFamily Function Error 2: ${JSON.stringify(error)}`);
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
                    logger.error(`createPlan Function Error 1: ${JSON.stringify(error)}`);
                    reject(error);
                }else{
                    resolve(result.item);
                }
            });
        } catch (error) {
            logger.error(`createPlan Function Error 2: ${JSON.stringify(error)}`);
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
                    logger.error(`setPrice Function Error 1: ${JSON.stringify(error)}`);
                    reject(error);
                }else{
                  resolve(result.item_price);
                }
            });
        } catch (error) {
            logger.error(`setPrice Function Error 2: ${JSON.stringify(error)}`);
            reject(error);
        }
    })
}


exports.setUpDBForChargbee = () => {
    return new Promise((resolve,reject)=>{
        try {
            Promise.allSettled([
                exports.setPlan('foreverFree','foreverFree',1,true,0),
                exports.setPlan('Limitless','Limitless',1,false,1)
            ]).then((response)=>{
                let errorArr = response.filter((x)=> x.status === 'rejected');
                if (!errorArr.length) {
                    Promise.allSettled([
                        exports.setPriceList('foreverFree','foreverFree'),
                        exports.setPriceList('Limitless','Limitless'),
                        exports.setAddonPriceList('Limitless-User','Limitless'),
                        exports.insertAffiliateGlobalSetting(),
                        exports.setPlanFeatures(),
                        exports.setPlanFeaturesDisplay()
                    ]).then((ele)=>{
                        let errAr = ele.filter((x)=> x.status === 'rejected');
                        if (!errAr.length) {
                            resolve();
                        } else {
                            logger.error(`setUpDBForChargbee Function Error 1: ${JSON.stringify(errAr)}`);
                            reject(errAr);
                        }
                    })
                } else {
                    logger.error(`setUpDBForChargbee Function Error 2: ${JSON.stringify(errorArr)}`);
                    reject(errorArr);
                }
            }).catch((error)=>{
                logger.error(`setUpDBForChargbee Function Error 3: ${JSON.stringify(error)}`);
                reject(error);
            })
        } catch (error) {
            logger.error(`setUpDBForChargbee Function Error 4: ${JSON.stringify(error)}`);
            reject(error);
        }
    })
}

exports.insertAffiliateGlobalSetting = () => {
    return new Promise((resolve, reject) => {
        try {
            let affiliateGlobalSettings = fs.readFileSync(__dirname + '/affiliate.json', 'utf-8')
            let obj = {
                type: dbCollections.GLOBALSETTING,
                data: [JSON.parse(affiliateGlobalSettings)]
            }
            MongoDbCrudOpration("global",obj,'insertMany').then(()=>{
                resolve();
            }).catch((error)=>{
                logger.error(`affiliateGlobalSettings Function Error 1: ${JSON.stringify(error)}`);
                reject(error);
            })
        } catch (error) {
            logger.error(`affiliateGlobalSettings Function Error 2: ${JSON.stringify(error)}`);
            reject(error);
        }
    })
}
exports.setPlanFeatures = () => {
    return new Promise((resolve, reject) => {
        try {
            let planFeatures = fs.readFileSync(__dirname + '/planFeature.json', 'utf-8')
            let obj = {
                type: dbCollections.PLANFEATURE,
                data: [JSON.parse(planFeatures)]
            }
            MongoDbCrudOpration("global",obj,'insertMany').then(()=>{
                resolve();
            }).catch((error)=>{
                logger.error(`setPlanFeatures Function Error 1: ${JSON.stringify(error)}`);
                reject(error);
            })
        } catch (error) {
            logger.error(`setPlanFeatures Function Error 2: ${JSON.stringify(error)}`);
            reject(error);
        }
    })
}


exports.setPlanFeaturesDisplay = () => {
    return new Promise((resolve, reject) => {
        try {
            let planFeatures = fs.readFileSync(__dirname + '/planFeatureDisplay.json', 'utf-8')
            let obj = {
                type: dbCollections.PLANFEATUREDISPLAY,
                data: [JSON.parse(planFeatures)]
            }
            MongoDbCrudOpration("global",obj,'insertMany').then(()=>{
                resolve();
            }).catch((error)=>{
                logger.error(`setPlanFeaturesDisplay Function Error 1: ${JSON.stringify(error)}`);
                reject(error);
            })
        } catch (error) {
            logger.error(`setPlanFeaturesDisplay Function Error 2: ${JSON.stringify(error)}`);
            reject(error);
        }
    })
}


exports.setupChargbee = () => {
    return new Promise((resolve, reject) => {
        try {
            exports.createProductFamily().then(()=>{
                Promise.allSettled([exports.createPlan('foreverFree','ForeverFree',"PLAN"),exports.createPlan('Limitless','Limitless',"PLAN"),exports.createPlan('Limitless-User','Limitless User',"ADDON")]).then((result)=>{
                    let errorArray = result.filter((x)=> x.status === 'rejected')
                    if (!errorArray.length) {
                        Promise.allSettled([
                            exports.setPrice('foreverFree-USD-Monthly','foreverFree','foreverFree USD Monthly','FLAT_FEE',0,'ForeverFree','MONTH'),
                            exports.setPrice('foreverFree-USD-Yearly','foreverFree','ForeverFree USD Yearly','FLAT_FEE',0,'ForeverFree','YEAR'),
                            exports.setPrice('Limitless-USD-Monthly','Limitless','Limitless USD Monthly','FLAT_FEE',249,'Limitless','MONTH'),
                            exports.setPrice('Limitless-USD-Yearly','Limitless','Limitless USD Yearly','FLAT_FEE',2688,'Limitless','YEAR'),
                            exports.setPrice('Limitless-User-USD-Monthly','Limitless-User','Limitless User USD Monthly','PER_UNIT',249,'Limitless User','MONTH'),
                            exports.setPrice('Limitless-User-USD-Yearly','Limitless-User','Limitless User USD Yearly','PER_UNIT',2688,'Limitless User','YEAR'),
                        ]).then((priceRes)=>{
                            let priceResError = priceRes.filter((x)=> x.status === 'rejected');
                            if (!priceResError.length) {
                                exports.setUpDBForChargbee().then(()=>{
                                    resolve();
                                }).catch((error)=>{
                                    logger.error(`setupChargbee Function Error 1: ${JSON.stringify(error)}`);
                                    reject(error);
                                })
                            } else {
                                logger.error(`setupChargbee Function Error 2: ${JSON.stringify(priceResError)}`);
                                reject(priceResError);
                            }
                        }).catch((error)=>{
                            logger.error(`setupChargbee Function Error 3: ${JSON.stringify(error)}`);
                            reject(error);
                        })
                    } else {
                        logger.error(`setupChargbee Function Error 4: ${JSON.stringify(errorArray)}`);
                        reject(errorArray)
                    }
                }).catch((error)=>{
                    logger.error(`setupChargbee Function Error 5: ${JSON.stringify(error)}`);
                    reject(error);
                })
            }).catch((error)=>{
                logger.error(`setupChargbee Function Error 6: ${JSON.stringify(error)}`);
                reject(error);
            })
        } catch (error) {
            logger.error(`setupChargbee Function Error 7: ${JSON.stringify(error)}`);
            reject(error);
        }
    })
}


/**
 * Install Step Get
 * @param {Object} req 
 * @param {Object} res 
 */
exports.installstepget = (req, res) => {
    try {
        let finalData = [];
        fs.readFile(installStepsFilePath, (err, data) => {
            if (err) {
                finalData = exports.installSteps;
            } else {
                const tmpData = JSON.parse(data.toString());
                finalData = tmpData.installSteps.length ? tmpData.installSteps : exports.installSteps;
                envVar = tmpData.envVar ? tmpData.envVar : exports.envVar;
            }
            res.json({
                status: true,
                data: finalData,
                envVar
            });
        })
    } catch (error) {
        console.error('Install Step Get Error 2: ', error.message);
        logger.error(`Install Step Get Error 2:: ${JSON.stringify(error)}`);
        res.json({
            status: false,
            error: error.message,
            step: 1
        });
    }
};


/**
 * Check Mongo Connection
 * @param {Object} cb 
 * @returns 
 */
exports.checkMongoConnection = (req, cb) => {
    try {
        const bodyData = req.body;
        const mongoURL = bodyData.mongodbUrl;
        if (!mongoURL) {
            cb({
                status: false,
                error: "Please provide a mongo url.",
                step: 2
            });
            return;
        }
        mongoose.connect(mongoURL, {}).then(() => {
            exports.envVar.MONGODB_URL = bodyData.mongodbUrl; // Done
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                cb({
                    status: true,
                    statusText: "MongoDB Connected",
                    step: 2
                });
            });
        }).catch((error) => {
            console.error('Check Mongo Connection Error: 1', error);
            cb({
                status: false,
                error: "Please check your mongodb Url",
                step: 2
            });
        });
    } catch (error) {
        console.error('Check Mongo Connection Error 2: ', error.message);
        cb({
            status: false,
            error: error?.message,
            step: 2
        });
    }
};


/**
 * Check Storage Connection
 * @param {Object} cb 
 */
exports.checkStorageConnection = (req, cb) => {
    try {
        const bodyData = req.body;
        if (bodyData.chooseStorage === "default") {
            exports.envVar.WASABI_SECRET_ACCESS_KEY = bodyData.wasabiSecretAccessKey || "";
            exports.envVar.WASABI_ACCESS_KEY = bodyData.wasabiAccessKey || "";
            exports.envVar.WASABI_USERID = bodyData.wasabiUserId || "";
            exports.envVar.STORAGE_TYPE = "server";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                cb({
                    status: true,
                    statusText: "Server Storage Connected",
                    data: bodyData,
                    step: 3
                });
            });
            return;
        }
        const s3Client = new S3Client({
            region: process.env.WASABI_REGION,
            credentials: {
                accessKeyId: bodyData.wasabiAccessKey,
                secretAccessKey: bodyData.wasabiSecretAccessKey,
            },
            endpoint: process.env.WASABIENDPOINT,
            requestHandler
        });
        const bucketName = process.env.USERPROFILEBUCKET;
        const command = new CreateBucketCommand({ Bucket: bucketName});
        s3Client.send(command).then((data) => {
            exports.envVar.WASABI_SECRET_ACCESS_KEY = bodyData.wasabiSecretAccessKey;
            exports.envVar.WASABI_ACCESS_KEY = bodyData.wasabiAccessKey;
            exports.envVar.WASABI_USERID = bodyData.wasabiUserId;
            exports.envVar.STORAGE_TYPE = "wasabi";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                cb({
                    status: true,
                    statusText: "Wasabi Connected",
                    data,
                    step: 3
                });
            });
        }).catch((error) => {
            console.error('Check Wasabi Connection Error 1: ', error);
            logger.error(`checkStorageConnection Function Error 1 ${JSON.stringify(error)}`);
            cb({
                status: false,
                error: error?.message || error,
                step: 3
            });
        });
    } catch (error) {
        console.error('Check Wasabi Connection Error 2: ', error.message);
        logger.error(`checkStorageConnection Function Error 2 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 3
        });
    }
};


/**
 * Check Firebase Connection
 * @param {Object} cb 
 */
exports.checkFirebaseConnection = async (req, cb) => {
    try {
        const bodyData = req.body;
        const serviceAccount = require("../"+process.env.SERVICE_FILE);
        admin1.initializeApp({
            credential: admin1.credential.cert(serviceAccount)
        }, "install-step-firebase"+ new Date().getTime());
        exports.envVar.APIKEY = bodyData.apiKey;
        exports.envVar.AUTODOMAIN = bodyData.autoDomain;
        exports.envVar.PROJECTID = bodyData.projectId;
        exports.envVar.STORAGEBUCKET = bodyData.storageBucket;
        exports.envVar.MESSAGINGSENDERID = bodyData.messageingSenderId;
        exports.envVar.APPID = bodyData.appId;
        exports.envVar.MEASUREMENTID = bodyData.measurementId;
        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
            cb({
                status: true,
                statusText: "Firebase Connected",
                step: 4
            });
        });
    } catch (error) {
        console.error('Check Firebase Connection Error 2: ', error.message);
        logger.error(`checkFirebaseConnection Function Error 1 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 4
        });
    }
};


exports.createDefaultDataInChargebee = (bodyData, cb) => {
    try {
        chargebee.configure({
            site : bodyData.chargebeeSite,
            api_key : bodyData.chargebeeAPIKey
        });
        exports.setupChargbee().then(() => {
            cb({
                status: true,
                statusText: "Default Data added successfully."
            });
        }).catch((error) => {
            logger.error(`createDefaultDataInChargebee Function Error 1 ${JSON.stringify(error)}`);
            cb({
                status: false,
                error: `Create Default Data In Chargebee Error: ${error?.message || error}`
            });
        })
    } catch(error) {
        logger.error(`Create Default Data In Chargebee Error: ${error.message || error}`);
        logger.error(`createDefaultDataInChargebee Function Error 2 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: `Create Default Data In Chargebee Error: ${error.message || error}`
        });
    }
}


/**
 * Check Chargebee Connection
 * @param {Object} cb 
 */
exports.checkChargebeeConnection = async (req, cb) => {
    try {
        const bodyData = req.body;
        let config = {
            method: 'get',
            url: `https://${bodyData.chargebeeSite}.chargebee.com/api/v2/subscriptions`,
            headers: { 
                'Authorization': `Basic ${Buffer.from(bodyData.chargebeeAPIKey).toString('base64')}`
            }
        };

        axios.request(config).then(() => {
            exports.envVar.CHARGEBEE_SITE = bodyData.chargebeeSite;
            exports.envVar.CHARGEBEE_API_KEY = bodyData.chargebeeAPIKey;
            exports.envVar.CHARGEBEE_PUBLISH_KEY = bodyData.chargebeePublishKey;
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.createDefaultDataInChargebee(bodyData, (cdChrRes) => {
                    cb(cdChrRes);
                });
            });
        }).catch((error) => {
            logger.error(`checkChargebeeConnection Function Error 1 ${JSON.stringify(error)}`);
            cb({
                status: false,
                error: error.response.data.message || error,
                step: 4
            });
        });
    } catch (error) {
        console.error('Check Chargebee Connection Error 2: ', error.message);
        logger.error(`checkChargebeeConnection Function Error 2 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 4
        });
    }
};


exports.setProductPaddle = (planName) => {
    return new Promise((resolve, reject) => {
        try {
            let data = JSON.stringify({
                "name": planName,
                "tax_category": "standard"
            });
        
            let configeration = {
                method: 'post',
                url: `${process.env.PADDLE_URL}/products`,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${exports.envVar.PADDLE_API_KEY}`
                },
                data : data
            };
        
            axios.request(configeration)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                logger.error(`setProductPaddle Function Error 1 ${JSON.stringify(error)}`);
                reject(error);
            });
        } catch (error) {
            logger.error(`setProductPaddle Function Error 2 ${JSON.stringify(error)}`);
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
                url: `${process.env.PADDLE_URL}/prices`,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${exports.envVar.PADDLE_API_KEY}`
                },
                data : data
            };
            axios.request(configeration)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                logger.error(`setPricePaddle Function Error 1 ${JSON.stringify(error)}`);
                reject(error);
            });
        } catch (error) {
            logger.error(`setPricePaddle Function Error 2 ${JSON.stringify(error)}`);
            reject(error);
        }
    })
}


exports.setPaddleDb = (obj,productData,priceData) => {
    return new Promise((resolve, reject) => {
        try {
            let frePriceData = [
                {
                    "price": 0,
                    "period_unit": "month",
                    "channel": "web",
                    "object": "item_price"
                  },
                  {
                    "price": 0,
                    "period_unit": "year",
                    "free_quantity": 0,
                    "object": "item_price",
                  }
            ]
            let freProductData = {
                "id": "foreverFree",
                "name": "ForeverFree",
                "external_name": "ForeverFree",
                "status": "active",
            }
            let freobject = {
                addonPriceArray: [],
                status: 1,
                planName: "foreverFree",
                itemPriceArray: frePriceData,
                planDetails: freProductData,
                defaultSubscribe: true,
                sortIndex: 0,
            }
            let frdbObj = [
                {
                  planName: "foreverFree",
                },
                {
                  $set: { ...freobject },
                },
                {
                  upsert: true,
                },
              ];
              updateSubscriptionPlanPromise(frdbObj)
              .then(()=>{
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
                        planName: "Limitless",
                        itemPriceArray: priceData,
                        planDetails: productData,
                        defaultSubscribe: false,
                        sortIndex: sortIndex,
                    }
                    let dbObj = [
                        {
                          planName: "Limitless",
                        },
                        {
                          $set: { ...object },
                        },
                        {
                          upsert: true,
                        },
                      ];
                      updateSubscriptionPlanPromise(dbObj).then(()=>{
                        Promise.allSettled([
                            exports.insertAffiliateGlobalSetting(),
                            exports.setPlanFeatures(obj),
                            exports.setPlanFeaturesDisplay(obj)
                        ]).then((ele)=>{
                            let errAr = ele.filter((x)=> x.status === 'rejected');
                            if (!errAr.length) {
                                resolve();
                            } else {
                                logger.error(`setPaddleDb Function Error 1 ${JSON.stringify(errAr)}`);
                                reject(errAr);
                            }
                        })
                    }).catch((error)=>{
                        logger.error(`setPaddleDb Function Error 2 ${JSON.stringify(error)}`);
                        reject(error);
                    })
                }).catch((error)=>{
                    logger.error(`setPaddleDb Function Error 3 ${JSON.stringify(error)}`);
                    reject(error);
                })
            }).catch((error)=>{
                logger.error(`setPaddleDb Function Error 4 ${JSON.stringify(error)}`);
                reject(error);
            })
        } catch (error) {
            logger.error(`setPaddleDb Function Error 5 ${JSON.stringify(error)}`);
            reject(error);
        }
    })
}


exports.setupPaddle = () => {
    return new Promise((resolve, reject) => {
        try {
            // let planId = obj.planName.replaceAll(" ","");
            // obj.planId = planId;
            exports.setProductPaddle("Limitless").then((productRes)=>{
                Promise.allSettled([exports.setPricePaddle(productRes.data.id,"249",'month'),exports.setPricePaddle(productRes.data.id,"2688",'year')]).then((pricesREsp)=>{
                    let errorArray = pricesREsp.filter((x)=> x.status === 'rejected');
                    if (!errorArray.length) {
                        let prices = pricesREsp.filter((x)=> x.status === 'fulfilled').map((z)=> {return {...z.value.data,period_unit: z.value.data.billing_cycle.interval,price: z.value.data.unit_price.amount}});
                        exports.setPaddleDb({},productRes.data,prices).then(()=>{
                            resolve({
                                status: true,
                                statusText: "Paddle Payment added successfully."
                            });
                        }).catch((error)=>{
                            logger.error(`setupPaddle Function Error 1 ${JSON.stringify(error)}`);
                            reject({
                                status: false,
                                error
                            });
                        })
                    } else {
                        let errorMessage = errorArray.map((x)=> x.reason);
                        logger.error(`setupPaddle Function Error 2 ${JSON.stringify(errorMessage)}`);
                        reject({
                            status: false,
                            errorMessage
                        })
                    }
                })
            }).catch((error)=>{
                logger.error(`setupPaddle Function Error 3 ${JSON.stringify(error)}`);
                reject({
                    status: false,
                    error
                });
            })
        } catch (error) {
            logger.error(`setupPaddle Function Error 4 ${JSON.stringify(error)}`);
            reject({
                status: false,
                error
            });
        }
    })
}


/**
 * Check Paddle Connection
 * @param {Object} cb 
 */
exports.checkPaddleConnection = async (req, cb) => {
    try {
        const bodyData = req.body;
        const paddleUrl = process.env.PADDLE_URL;
        let config = {
            method: 'get',
            url: paddleUrl + '/event-types',
            headers: { 
                'Authorization': 'Bearer ' + bodyData.paddleAPIKey
            }
        };
        
        axios.request(config).then((response) => {
            if (response.data && response.data.data) {
                exports.envVar.PADDLE_URL = paddleUrl;
                exports.envVar.PADDLE_API_KEY = bodyData.paddleAPIKey;
                exports.envVar.PADDLE_CLIENT_TOKEN = bodyData.paddleClientToken;
                serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                    exports.setupPaddle().then((fData) => {
                        cb(fData);
                    }).catch((error) => {
                        cb(error);
                    })
                });
            } else {
                logger.error(`checkPaddleConnection Function Error 1 ${JSON.stringify(response.data)}`);
                cb({
                    status: false,
                    error: "You API key is invalid. Please check again"
                });
            }
        }).catch((error) => {
            console.log(error.response.data.error.detail);
            logger.error(`checkPaddleConnection Function Error 2 ${JSON.stringify(error?.response?.data || error)}`);
            cb({
                status: false,
                error: error?.response?.data?.error?.detail || error
            });
        });
    } catch (error) {
        console.error('Check Paddle Connection Error 3: ', error.message);
        logger.error(`checkPaddleConnection Function Error 3 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 4
        });
    }
};


/**
 * Check AI Connection
 * @param {Object} cb 
 */
exports.checkAIConnection = (req, cb) => {
    try {
        const bodyData = req.body;
        let config = {
            method: 'get',
            url: 'https://api.openai.com/v1/engines',
            headers: { 
                'Authorization': 'Bearer ' + bodyData.aiToken,
                'Content-Type': 'application/json'
            }
        };
        
        axios.request(config).then((response) => {
            if (response?.status !== 200) {
                console.error('Check AI Connection Error 0: ', response?.status);
                logger.error(`Check AI Connection Error 0: ${response?.status}`);
                cb({
                    status: false,
                    error: "Incorrect API key. Please check your key and try again",
                    step: 8
                });
                return;
            }
            exports.envVar.AI_API_KEY = bodyData.aiToken;
            exports.envVar.AI_MODEL = bodyData.aiModel;
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                cb({
                    status: true,
                    statusText: "AI Connected",
                    step: 8
                });
            });
        })
        .catch((error) => {
            console.error('Check AI Connection Error 1: ', error.response);
            logger.error(`Check AI Connection Error 1: ${error.response}`);
            cb({
                status: false,
                error: "Incorrect API key. Please check your key and try again",
                step: 8
            });
        });
    } catch (error) {
        console.error('Check Firebase Connection Error 2: ', error.message);
        logger.error(`Check AI Connection Error 2: ${error?.message || error}`);
        cb({
            status: false,
            error: error.message,
            step: 8
        });
    }
};


/**
 * Check SMTP Connection
 * @param {Object} cb 
 */
exports.checkSMTPConnection = async (bodyData, cb) => {
    try {
        const code = ("" + Math.random()).substring(2, 8);
        exports.smtpVerificationCode = code;
        let html = "<h1>SMTP Verification Mail</h1>";
        html += `<h2>Your Verification code is <b>${code}</b></h2>`;
        let transporter = nodemailer.createTransport({
            host: bodyData.smtpHost,
            port: bodyData.smtpPort,
            secure: bodyData.smtpPort == 465, // true for 465, false for other ports
            auth: {
                user: bodyData.smtpEmail, // generated ethereal user
                pass: bodyData.smtpEmailPassword, // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        const isHtml = true;
        await transporter.sendMail({
            from: ""+'<'+bodyData.smtpEmail+'>', // sender address
            to: bodyData.toEmail, // list of receivers
            subject: "SMTP Verification Mail", // Subject line
            [isHtml ? "html" : "text"]: html
        },(err, res)=>{
            if (err) {
                logger.error(`checkSMTPConnection Function Error 1 ${JSON.stringify(err)}`);
                cb({
                    status:false,
                    error: err,
                })
            } else {
                exports.envVar.NODEMAILER_EMAIL = bodyData.smtpEmail;
                exports.envVar.NODEMAILER_EMAIL_PASSWORD = bodyData.smtpEmailPassword;
                exports.envVar.NODEMAILER_HOST = bodyData.smtpHost;
                exports.envVar.NODEMAILER_PORT = Number(bodyData.smtpPort);
                serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                    cb({
                        status: true,
                        data: res,
                        statusText: "SMTP Connected"
                    })
                });
            }
        });
    } catch (error) {
        console.error('Check SMTP Connection Error 2: ', error.message);
        logger.error(`checkSMTPConnection Function Error 2 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message
        });
    }
};


exports.extractZip = async (key, cb) => {
    try {

        let sourcePath = __dirname + '/../../chargebee-setup.zip';
        let targetPath = __dirname + '/../../';
        if (key === "admin") {
            sourcePath = __dirname + '/../../admin.zip';
            targetPath = __dirname + '/../../admin';
        }
        if (key === "paddle") {
            sourcePath = __dirname + '/../../paddle-setup.zip';
            targetPath = __dirname + '/../../';
        }

        if (key === "admin-chargebee") {
            sourcePath = __dirname + '/../../admin-chargebee.zip';
            targetPath = __dirname + '/../../admin';
        }
        if (key === "admin-paddle") {
            sourcePath = __dirname + '/../../admin-paddle.zip';
            targetPath = __dirname + '/../../admin'
        }

        await extract(sourcePath, { dir: targetPath })
        console.log('Extraction complete')
        cb({
            status: true
        });
    } catch (error) {
        logger.error(`extractZip Function Error 1 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error?.message || error
        });
    }
}


/**
 * Check Token Connection
 * @param {Object} cb 
 */
exports.checkTokenConnection = (req, cb) => {
    try {
        if (!req.body.canyonlicensekey) {
            cb({
                status: false,
                statusText: "Licensekey is Required",
                error: "Licensekey is Required"
            });
            return;
        }
        const data = {
            licensesKey: req.body.canyonlicensekey,
        };
        axios.post(`${process.env.CANYONAPIURL}/api/v1/validateRequest`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': req.get('Origin')
            }
        })
        .then(response => {
            exports.envVar.CANYONLICENSEKEY = req.body.canyonlicensekey;
            exports.envVar.CANYONLICENSETYPE = response?.data?.data?.productionLicensesType || "Regular License";
            exports.envVar.CANYONLICENSEID = response?.data?.data?._id || "";
            const statusUpdateData = {
                productionUrl: req.get('Origin'),
                licenseId: exports.envVar.CANYONLICENSEID,
                updateStatus: 1,
                version: "v" + pjson.version
            }
            axios.post(`${process.env.CANYONAPIURL}/api/v1/updateProductionStatus`, statusUpdateData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            })
            .then(() => {}).catch(() => {});
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                cb({
                    status: true,
                    statusText: "Token Connected",
                    data: response?.data || response,
                });
            });
        })
        .catch(error => {
            logger.error(`checkTokenConnection Function Error 2 ${JSON.stringify(error)}`);
            cb({
                status: false,
                error: error?.response?.data?.message || ""
            });
        });

    } catch (error) {
        console.error('Check Token Connection Error 2: ', error.message);
        logger.error(`checkTokenConnection Function Error 3 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 5
        });
    }
};


/**
 * Generate Payment Config
 * @param {Object} req 
 * @param {Object} cb 
 * @returns 
 */
exports.generatePaymentConfig = (req, cb) => {
    try {
        if (!req.body.choosePayment) {
            cb({
                status: false,
                statusText: "ChoosePayment is Required",
                error: "ChoosePayment is Required"
            });
            return;
        }
        
        exports.envVar.PAYMENTMETHOD = req.body.choosePayment;
        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
            if (req.body.choosePayment === "chargebee") {
                const fileUrl = process.env.CANYONAPIURL + '/' + pjson.version + '/chargebee-setup.zip';
                const fileName = __dirname + '/../../chargebee-setup.zip';
                const file = fs.createWriteStream(fileName);
    
                https.get(fileUrl, getZipRes => {
                    getZipRes.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        exports.extractZip("chargebee", (data) => {
                            fs.unlinkSync(fileName);
                            if (!data.status) {
                                cb(data);
                                return;
                            }
                            
                            const sourceFolder = __dirname + '/../../chargebee-setup';
                            const targetFolder = __dirname + '/../../';
                            function copyFolderSync(source, target) {
                                if (!fs.existsSync(target)) {
                                    fs.mkdirSync(target);
                                }
    
                                const files = fs.readdirSync(source);
    
                                files.forEach((file) => {
                                    const sourcePath = path.join(source, file);
                                    const targetPath = path.join(target, file);
    
                                    if (fs.statSync(sourcePath).isDirectory()) {
                                        copyFolderSync(sourcePath, targetPath);
                                    } else {
                                        fs.copyFileSync(sourcePath, targetPath);
                                    }
                                });
                            }
                            if (fs.existsSync(sourceFolder)) {
                                copyFolderSync(sourceFolder, targetFolder)
                            }
                            cb({
                                status: true,
                                statusText: "Successfully Added Chargebee Payment Method",
                                data: {
                                    choosePayment: req.body.choosePayment
                                }
                            });
                        });
                    });
                }).on('error', error => {
                    fs.unlinkSync(fileName);
                    logger.error(`generatePaymentConfig Function Error 1 ${JSON.stringify(error)}`);
                    cb({
                        status: false,
                        error: error?.message || error
                    });
                });
            } else if (req.body.choosePayment === "paddle"){
                const fileUrl = process.env.CANYONAPIURL + '/' + pjson.version + '/paddle-setup.zip';
                const fileName = __dirname + '/../../paddle-setup.zip';
                const file = fs.createWriteStream(fileName);
    
                https.get(fileUrl, getZipRes => {
                    getZipRes.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        exports.extractZip("paddle", (data) => {
                            fs.unlinkSync(fileName);
                            if (!data.status) {
                                cb(data);
                                return;
                            }
                            
                            const sourceFolder = __dirname + '/../../paddle-setup';
                            const targetFolder = __dirname + '/../../';
                            function copyFolderSync(source, target) {
                                if (!fs.existsSync(target)) {
                                    fs.mkdirSync(target);
                                }
    
                                const files = fs.readdirSync(source);
    
                                files.forEach((file) => {
                                    const sourcePath = path.join(source, file);
                                    const targetPath = path.join(target, file);
    
                                    if (fs.statSync(sourcePath).isDirectory()) {
                                        copyFolderSync(sourcePath, targetPath);
                                    } else {
                                        fs.copyFileSync(sourcePath, targetPath);
                                    }
                                });
                            }
                            if (fs.existsSync(sourceFolder)) {
                                copyFolderSync(sourceFolder, targetFolder)
                            }
                            cb({
                                status: true,
                                statusText: "Successfully Added Paddle Payment Method",
                                data: {
                                    choosePayment: req.body.choosePayment
                                }
                            });
                        });
                    });
                }).on('error', error => {
                    fs.unlinkSync(fileName);
                    logger.error(`generatePaymentConfig Function Error 1 ${JSON.stringify(error)}`);
                    cb({
                        status: false,
                        error: error?.message || error
                    });
                });
            } else {
                cb({
                    status: true,
                    statusText: "Successfully Added Payment Method",
                    data: {
                        choosePayment: req.body.choosePayment
                    }
                });
            }
        })
    } catch (error) {
        console.error('generatePaymentConfig Function Error 3: ', error.message);
        logger.error(`generatePaymentConfig Function Error 3 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 5
        });
    }
};


/**
 * Generate Build Frontend
 * @param {Object} cb 
 */
exports.generateBuildFrontend = (cb) => {
    try {
        console.log("Start Build");
        const vueProjectDirectory = __dirname + '/../../frontend';
        const writePublicFilePath = __dirname + '/../../frontend/public/firebase-messaging-sw.js';
        const buildCommand = 'npm run build';
        const bdCode = `importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging-compat.js');
let firebaseConfig = {
  apiKey: "${process.env.APIKEY}",
  authDomain: "${process.env.AUTODOMAIN}",
  projectId: "${process.env.PROJECTID}",
  storageBucket: "${process.env.STORAGEBUCKET}",
  messagingSenderId: "${process.env.MESSAGINGSENDERID}",
  appId: "${process.env.APPID}",
  measurementId: "${process.env.MEASUREMENTID}"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ACTIVATION
self.addEventListener('activate', () => {
  console.log('Service worker activated');
});

// CLICK HANDLER
self.addEventListener('notificationclick', function (event) {
  const notificationData = event.notification.data;
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "companyId": notificationData.cId
  };
  const key = notificationData.key;
  const markObj = {
    id: notificationData.nId,
    key: key,
    userId: notificationData.uId,
    isClickPush: true,
    commentsId: notificationData.commentsId || ""
  };
  fetch(notificationData.domainURL + "api/v1/push-mark-read", {
    method: "PUT",
    headers,
    body: JSON.stringify(markObj),
  }).then(() => {
    let mentionCounts = {
      companyId : notificationData.cId,
      key : key === 'notifications' ? 5 : 4,
      userIds: [notificationData.uId],
      readAll: false,
      read: true
    }
    fetch(notificationData.domainURL + "api/v1/pushupdateunreadcommentscount", {
      method: "POST",
      headers,
      body: JSON.stringify(mentionCounts),
    })
    .catch((error) => console.error("Fetch error:", error));
  }).catch((error) => console.error("Fetch error:", error));
  event.notification.close();
  const redirectionUrl = event.notification.data['click_action'];
  if (redirectionUrl !== undefined) {
    event.waitUntil(
      clients.openWindow(redirectionUrl)
    );
  }
});

// NOTIFICATION HANDLER
self.addEventListener('push', event => {
  const data = event.data.json();
  const notificationData = data?.data ? data.data : data.notification
  const title = notificationData?.title || 'Notification';
  const options = {
    body: notificationData.body || 'New notification received',
    icon: notificationData.icon || './logo.png',
    data: notificationData,
    sound: "default"
  };
  if (notificationData.image) {
    options.image = notificationData.image;
  }
  event.waitUntil(self.registration.showNotification(title, options));
})`
        
        // Change the current working directory to the Vue project directory
        process.chdir(vueProjectDirectory);

        const filePathEnv = __dirname + '/../../frontend/.env';
        let data = "# Environment Configrations\n";
        data += `VUE_APP_ENVIRONMENT='${process.env.NODE_ENV}'\n\n`;
        data += "# Firebase Configrations\n";
        data += `VUE_APP_APIKEY='${process.env.APIKEY}'\n`
        data += `VUE_APP_AUTHDOMAIN='${process.env.AUTODOMAIN}'\n`;
        data += `VUE_APP_PROJECTID='${process.env.PROJECTID}'\n`;
        data += `VUE_APP_STORAGEBUCKET='${process.env.STORAGEBUCKET}'\n`;
        data += `VUE_APP_MESSAGINGSENDERID='${process.env.MESSAGINGSENDERID}'\n`;
        data += `VUE_APP_APPID='${process.env.APPID}'\n`;
        data += `VUE_APP_MEASUREMENTID='${process.env.MEASUREMENTID}'\n\n`;
        data += "# Chargbee Configrations\n";
        data += `VUE_APP_CHARGEBEE='${process.env.CHARGEBEE_SITE || ""}'\n`;
        data += `VUE_APP_CHARGEBEE_PUBLISHABLE_KEY='${process.env.CHARGEBEE_PUBLISH_KEY || ""}'\n\n`;
        data += "# Paddle Configrations\n";
        data += `VUE_APP_PADDLE_CLIENT_TOKEN='${process.env.PADDLE_CLIENT_TOKEN || ""}'\n`;
        data += `VUE_APP_CANYONAPIURL='${process.env.CANYONAPIURL}'\n`;
        data += `VUE_APP_CANYONLICENSEKEY='${process.env.CANYONLICENSEKEY}'\n`;
        data += `VUE_APP_CANYONLICENSETYPE='${process.env.CANYONLICENSETYPE}'\n`;
        data += `VUE_APP_CANYON_IS_SINGLE_APP=${process.env.CANYON_IS_SINGLE_APP}\n`;
        data += `VUE_APP_STORAGE_TYPE='${process.env.STORAGE_TYPE}'\n`;
        data += `VUE_APP_PAYMENTMETHOD='${process.env.PAYMENTMETHOD || ""}'\n`;
        if (process.env.CANYONLICENSETYPE === "Extended License" && process.env.CANYON_IS_SINGLE_APP == "false") {
            data += `VUE_APP_AFFILIATEON='true'\n`;
        } else {
            data += `VUE_APP_AFFILIATEON='false'\n`;
        }

        fs.writeFile(filePathEnv, data, (err, data) => {
            if (err) {
                console.log("Error Generate FrontEnd ENV", err);
                logger.error(`generateBuildFrontend Function Error 1 ${JSON.stringify(err)}`);
                cb({
                    status: false,
                    error: `Error Generate FrontEnd ENV: ${err}`
                });
                return;
            }
            console.log("End Generate FrontEnd ENV");
            // Write Public Firebase message
            fs.writeFile(writePublicFilePath, bdCode, (err) => {
                if (err) {
                    logger.error(`generateBuildFrontend Function Error 2 ${JSON.stringify(err)}`);
                    cb({
                        status: false,
                        error: `Error Generate Public File: ${err}`
                    })
                    return
                }
                exec(buildCommand, (buildError, buildStdout, buildStderr) => {
                    if (buildError) {
                        logger.error(`generateBuildFrontend Function Error 3 ${JSON.stringify(buildError)}`);
                        cb({
                            status: false,
                            error: `Error generating Vue build: ${buildError}`
                        })
                        return;
                    }
                    console.log(`Vue build generated: ${buildStdout}`);    
                    if (exports.envVar.CANYONLICENSETYPE === "Regular License") {
                        const removeDist = `${__dirname}/../../installation`;
                        console.log("Start Remove Installation Folder");
                        if (fs.existsSync(removeDist)) {
                            fs.rmdir(removeDist, {recursive: true, force: true}, (error) => { 
                                if (error) { 
                                    logger.error(`generateBuildFrontend Function Error 4 ${JSON.stringify(error)}`);
                                    cb({
                                        status: false,
                                        error: `Error Remove Installation Folder: ${error}`
                                    })
                                } else { 
                                    console.log("Done Remove Installation Folder");
                                    cb({
                                        status: true,
                                        buildStdout: buildStdout,
                                        statusText: `Generated:`
                                    });
                                } 
                            });
                        } else {
                            cb({
                                status: true,
                                buildStdout: buildStdout,
                                statusText: `Generated:`
                            });
                        }
                    } else {
                        cb({
                            status: true,
                            buildStdout: buildStdout,
                            statusText: `Generated:`
                        });
                    }
                });
            });
        })
    } catch (error) {
        logger.error(`generateBuildFrontend Function Error 5 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error
        });
    }
};

/**
 * Generate Build Admin
 * @param {Object} cb 
 */
exports.generateBuildAdmin = (cb) => {
    try {
        console.log("Start Get for Admin Folder");
        let fileUrl = process.env.CANYONAPIURL + '/admin.zip';
        let fileName = __dirname + '/../../admin.zip';
        if (exports.envVar.PAYMENTMETHOD === "chargebee") {
            fileUrl = process.env.CANYONAPIURL + '/' + pjson.version + '/admin-chargebee.zip';
            fileName = __dirname + '/../../admin-chargebee.zip';
        }
        if (exports.envVar.PAYMENTMETHOD === "paddle") {
            fileUrl = process.env.CANYONAPIURL + '/' + pjson.version + '/admin-paddle.zip';
            fileName = __dirname + '/../../admin-paddle.zip';
        }

        const file = fs.createWriteStream(fileName);

        https.get(fileUrl, getZipRes => {
            getZipRes.pipe(file);
            file.on('finish', () => {
                file.close();
                let extractKey = "admin";
                if (exports.envVar.PAYMENTMETHOD === "chargebee") {
                    extractKey = "admin-chargebee";
                } 

                if (exports.envVar.PAYMENTMETHOD === "paddle") {
                    extractKey = "admin-paddle";
                }
                exports.extractZip(extractKey, (data) => {
                    fs.unlinkSync(fileName);
                    if (!data.status) {
                        cb(data);
                        return;
                    }

                    const vueProjectDirectory = __dirname + '/../../admin';
                    console.log("Start NPM Install in Admin");
                    const npmInstallCommand = 'npm install --dev';
                    // Change the current working directory to the Vue project directory
                    process.chdir(vueProjectDirectory);
                
                    // Npm Install
                    exec(npmInstallCommand, (npmInstallError, npmInstallStdout, npmInstallStderr) => {
                        if (npmInstallError) {
                            console.log(`Error NPM Install in Admin: ${npmInstallError}`);
                            logger.error(`generateBuildAdmin Function Error 1 ${JSON.stringify(npmInstallError)}`);
                            cb({
                                status: false,
                                error: "Admin NPM Install Error"
                            });
                            return;
                        }
                        console.log("End NPM Install in Admin");
                        console.log("Start Generate Admin ENV");
                        const buildCommand = 'npm run build';
                        const removeDist = `${__dirname}/../../installation`;
                
                        // Change the current working directory to the Vue project directory
                        // process.chdir(vueProjectDirectory);
                
                        const filePathEnv = __dirname + '/../../admin/.env';
                        
                        let data = "# Mongo Configrations\n";
                        data += `VUE_APP_STORAGE_TYPE='${process.env.STORAGE_TYPE}'\n`;
                        fs.writeFile(filePathEnv, data, (err, data) => {
                            if (err) {
                                console.log("Error Generate Admin ENV", err);
                                logger.error(`generateBuildAdmin Function Error 2 ${JSON.stringify(err)}`);
                                cb({
                                    status: false,
                                    error: `Error Generate Admin ENV: ${err}`
                                });
                                return;
                            }
                            console.log("End Generate Admin ENV");
                            console.log("Start Generate Admin Build");
                            exec(buildCommand, (buildError, buildStdout, buildStderr) => {
                                if (buildError) {
                                    logger.error(`generateBuildAdmin Function Error 3 ${JSON.stringify(buildError)}`);
                                    cb({
                                        status: false,
                                        error: `Error generating Admin Vue build: ${buildError}`
                                    })
                                    return;
                                }
                                console.log("Done Generate Admin Build");
                                console.log(`Vue build Admin generated: ${buildStdout}`);
                                console.log("Start Remove Installation Folder");
                                if (fs.existsSync(removeDist)) {
                                    fs.rmdir(removeDist, {recursive: true, force: true}, (error) => { 
                                        if (error) { 
                                            logger.error(`generateBuildAdmin Function Error 4 ${JSON.stringify(error)}`);
                                            cb({
                                                status: false,
                                                error: `Error Remove Installation Folder: ${error}`
                                            })
                                        } else { 
                                            console.log("Done Remove Installation Folder");
                                            cb({
                                                status: true,
                                                buildStdout: buildStdout,
                                                statusText: `Generated:`
                                            });
                                        } 
                                    });
                                } else {
                                    cb({
                                        status: true,
                                        buildStdout: buildStdout,
                                        statusText: `Generated:`
                                    });
                                }
                            });
                        })
                    });
                });
            });
        }).on('error', error => {
            console.log("Error Get for Admin Folder", error);
            logger.error(`generateBuildAdmin Function Error 5 ${JSON.stringify(error)}`);
            fs.unlinkSync(fileName)
            cb({
                status: false,
                error: error?.message || error
            });
        });
    } catch (error) {
        logger.error(`generateBuildAdmin Function Error 6 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error
        });
    }
};


/**
 * Api for create user
 * @param {Obj} req 
 * @param {Obj} cb 
 */ 
exports.createUser = (req, cb) => {
    try {
        const bodyData = req.body;
        if (!(bodyData && bodyData.email)) {
            cb({status: false, error:  "user email is required"});
            return;
        }
        if (!(bodyData && bodyData.firstName)) {
            cb({status: false, error:  "firstName is required"});
            return;
        }
        if (!(bodyData && bodyData.lastName)) {
            cb({status: false, error:  "lastName is required"});
            return;
        }
        if (!(bodyData && bodyData.password)) {
            cb({status: false, error:  "password is required"});
            return;
        }
        getUserByQueyFun().then((users)=>{
            if (users.length) {
                logger.error(`createUser Function Error 1 ${JSON.stringify(users.length)}`);
                cb({status: false, error: "Already Users"});
            } else {
                let userObj = {
                    firstName: bodyData.firstName,
                    lastName: bodyData.lastName,
                    email: bodyData.email,
                    password: bodyData.password,
                    isInvitation: false,
                    isProductOwner: true
                }
                createUserRef.addUserMongodbV2(userObj).then((respo)=>{
                    sendMailRef.sendVerificationEmailPromise(respo.statusText._id,respo.statusText.Employee_Email).catch((error)=>{
                        logger.error(error.statusText);
                    })
                    cb({
                        status: true,
                        statusText: "User Created Successfull"
                    });
                }).catch((error)=>{
                    logger.error(`createUser Function Error 2 ${JSON.stringify(error)}`);
                    cb({status: false, error: error});
                })
            }
        })
    } catch (error) {
        logger.error(`createUser Function Error 7 ${JSON.stringify(error)}`);
        cb({status: false, error: error});
    }
};



/**
 * Check Install Step
 * @param {Object} req 
 * @param {Object} res 
 */
exports.checkinstallstep = (req, res) => {
    const bodyData = req.body;
    try {
        if (bodyData.step === 1) {
            exports.installSteps[0].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.checkTokenConnection(req, (tokenRes) => {
                    if (tokenRes.status) {
                        exports.installSteps[0].status = "done";
                        // if (exports.envVar.CANYONLICENSETYPE === "Regular License") {
                        //     exports.installSteps[1].status = "done";
                        // }
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: 1});
                            }, 3000);
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: "STOP"});
                                res.json({...tokenRes, envVar: exports.envVar});
                            }, 5000);
                        });
                        return;
                    }
                    exports.installSteps[0].status = "error";
                    serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                        setTimeout(() => {
                            emitListener(bodyData?.eventId, {step: "STOP", error: tokenRes.error || "Something went wrong; please contact the administrator"});
                            res.json({...tokenRes});
                        }, 3000)
                    });
                });
            });
        }

        if (bodyData.step === 2) {
            exports.installSteps[1].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.checkMongoConnection(req, (mongoRes) => {
                    if (mongoRes.status) {
                        exports.installSteps[1].status = "done";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: 1});
                            }, 3000);
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: "STOP"});
                                res.json({...mongoRes});
                            }, 5000);
                        });
                        return;
                    }
                    exports.installSteps[1].status = "error";
                    serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                        emitListener(bodyData?.eventId, {step: "STOP", error: mongoRes.error || "Something went wrong; please contact the administrator"});
                        res.json(mongoRes);
                    });
                });
            });
        }

        if (bodyData.step === 3) {
            exports.installSteps[2].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.checkStorageConnection(req, (wasabiRes) => {
                    if (wasabiRes.status) {
                        exports.installSteps[2].status = "done";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: 1});
                            }, 3000);
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: "STOP"});
                                res.json({...wasabiRes});
                            }, 5000);
                        });
                        return;
                    }
                    exports.installSteps[2].status = "error";
                    serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                        emitListener(bodyData?.eventId, {step: "STOP", error: wasabiRes.error || "Something went wrong; please contact the administrator"});
                        res.json(wasabiRes);
                    });
                });
            });
        }

        if (bodyData.step === 4) {
            exports.installSteps[3].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.checkFirebaseConnection(req, (firebaseRes) => {
                    if (firebaseRes.status) {
                        exports.installSteps[3].status = "done";
                        if (exports.envVar.CANYONLICENSETYPE === "Regular License") {
                            exports.installSteps[4].status = "done";
                            exports.installSteps[5].status = "done";
                        }
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: 1});
                            }, 3000);
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: "STOP"});
                                res.json({...firebaseRes});
                            }, 5000);
                        });
                        return;
                    }
                    exports.installSteps[3].status = "error";
                    serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                        emitListener(bodyData?.eventId, {step: "STOP", error: firebaseRes.error || "Something went wrong; please contact the administrator"});
                        res.json(firebaseRes);
                    });
                });
            });
        }

        if (bodyData.step === 5) {
            exports.installSteps[4].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.generatePaymentConfig(req, (paymentRes) => {
                    if (paymentRes.status) {
                        exports.installSteps[4].status = "done";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: 1});
                            }, 3000);
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: "STOP"});
                                res.json({...paymentRes, envVar: exports.envVar});
                            }, 5000);
                        });
                        return;
                    }
                    exports.installSteps[4].status = "error";
                    serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                        emitListener(bodyData?.eventId, {step: "STOP", error: paymentRes.error || "Something went wrong; please contact the administrator"});
                        res.json(paymentRes);
                    });
                });
            });
        }

        if (bodyData.step === 6) {
            exports.installSteps[5].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                if (exports.envVar.PAYMENTMETHOD === 'chargebee') {
                    exports.checkChargebeeConnection(req, (chargebeeRes) => {
                        if (chargebeeRes.status) {
                            exports.installSteps[5].status = "done";
                            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                                setTimeout(() => {
                                    emitListener(bodyData?.eventId, {step: 1});
                                }, 3000);
                                setTimeout(() => {
                                    emitListener(bodyData?.eventId, {step: "STOP"});
                                    res.json({...chargebeeRes});
                                }, 5000);
                            });
                            return;
                        }
                        exports.installSteps[5].status = "error";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            emitListener(bodyData?.eventId, {step: "STOP", error: chargebeeRes.error || "Something went wrong; please contact the administrator"});
                            res.json(chargebeeRes);
                        });
                    });
                }
                if (exports.envVar.PAYMENTMETHOD === 'paddle') {
                    exports.checkPaddleConnection(req, (paddleRes) => {
                        if (paddleRes.status) {
                            exports.installSteps[5].status = "done";
                            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                                setTimeout(() => {
                                    emitListener(bodyData?.eventId, {step: 1});
                                }, 3000);
                                setTimeout(() => {
                                    emitListener(bodyData?.eventId, {step: "STOP"});
                                    res.json({...paddleRes});
                                }, 5000);
                            });
                            return;
                        }
                        exports.installSteps[5].status = "error";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            emitListener(bodyData?.eventId, {step: "STOP", error: paddleRes.error || "Something went wrong; please contact the administrator"});
                            res.json(paddleRes);
                        });
                    });
                }
            });
        }

        if (bodyData.step === 7) {
            if (bodyData.isDoItLater) {
                exports.installSteps[6].status = "done";
                exports.envVar.AI_API_KEY ="";
                exports.envVar.AI_MODEL = "";
                serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                    setTimeout(() => {
                        emitListener(bodyData?.eventId, {step: 1});
                    }, 1000);
                    setTimeout(() => {
                        emitListener(bodyData?.eventId, {step: "STOP"});
                        res.json({...bodyData, status: true, statusText: "AI Connected", step: 6 });
                    }, 2000);
                });
            } else {
                exports.installSteps[6].status = "inprogress";
                serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                    exports.checkAIConnection(req, (aiRes) => {
                        if (aiRes.status) {
                            exports.installSteps[6].status = "done";
                            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                                setTimeout(() => {
                                    emitListener(bodyData?.eventId, {step: 1});
                                }, 3000);
                                setTimeout(() => {
                                    emitListener(bodyData?.eventId, {step: "STOP"});
                                    res.json({...aiRes});
                                }, 5000);
                            });
                            return;
                        }
                        exports.installSteps[6].status = "error";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            emitListener(bodyData?.eventId, {step: "STOP", error: aiRes.error || "Something went wrong; please contact the administrator"});
                            res.json(aiRes);
                        });
                    });
                });
            }
        }
        
        if (bodyData.step === 8) {
            exports.installSteps[7].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                if (bodyData.key === 1) {
                    if (!(bodyData && bodyData.toEmail)) {
                        res.json({
                            status: false,
                            error: "Email is Required."
                        })
                        return;
                    }
                    if (!(bodyData && bodyData.smtpEmail)) {
                        res.json({
                            status: false,
                            error: "smtpEmail is Required."
                        })
                        return;
                    }
                    if (!(bodyData && bodyData.smtpEmailPassword)) {
                        res.json({
                            status: false,
                            error: "smtpEmailPassword is Required."
                        })
                        return;
                    }
                    if (!(bodyData && bodyData.smtpHost)) {
                        res.json({
                            status: false,
                            error: "smtpHost is Required."
                        })
                        return;
                    }
                    if (!(bodyData && bodyData.smtpPort)) {
                        res.json({
                            status: false,
                            error: "smtpPort is Required."
                        })
                        return;
                    }
                    exports.checkSMTPConnection(bodyData, (smtpRes) => {
                        if (smtpRes.status) {
                            res.json({...smtpRes});
                            return;
                        }
                        exports.installSteps[7].status = "error";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            res.json({...smtpRes});
                        });
                    });
                }
                if (bodyData.key === 2) {
                    if (!(bodyData && bodyData.code)) {
                        res.json({
                            status: false,
                            error: "Verification code is Required."
                        })
                        return;
                    }
    
                    if (exports.smtpVerificationCode === bodyData.code) {
                        exports.installSteps[7].status = "done";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            res.json({
                                status: true,
                                data: bodyData,
                                statusText: "Code verified"
                            });
                        });
                    } else {
                        exports.installSteps[7].status = "error";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            res.json({
                                status: false,
                                error: "Your code is invalid"
                            });
                        });
                    }
                }
            });
        }

        if (bodyData.step === 9) {
            exports.installSteps[8].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                function convertToEnv (object) {
                    let envFile = ''
                    for (const key of Object.keys(object)) {
                        if (typeof object[key] == 'number') {
                            envFile += `${key}=${object[key]}\n`;
                        } else {
                            envFile += `${key}="${object[key]}"\n`;
                        }
                    }
                    return envFile
                }
    
                // Get ENV data
                const filePath = __dirname + "/../../.env";
                const envFile = fs.readFileSync(filePath);
                const envConfig = require('dotenv').parse(envFile);
                envConfig.PORT = Number(envConfig.PORT);
                envConfig.NOOFPRESETCOMPANY = Number(envConfig.NOOFPRESETCOMPANY);
                const envData = {};
                for (const key in envConfig) {
                    envData[key] = envConfig[key];
                };
                for (const key in exports.envVar) {
                    process.env[key] = exports.envVar[key];
                };
    
                const finalEnvData = {...envData, ...exports.envVar};
                console.log("Start Generate API ENV");
                fs.writeFile(filePath, convertToEnv(finalEnvData), (err, data) => {
                    if (err) {
                        console.log("Error Generate API ENV", err);
                        logger.error(`Error Generate API ENV ${JSON.stringify(err)}`);
                        exports.installSteps[8].status = "error";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            emitListener(bodyData?.eventId, {step: "STOP", error: err || "Something went wrong; please contact the administrator"});
                            res.json({
                                status: false,
                                error: err
                            });
                        });
                        return;
                    }
                    console.log("End Generate API ENV");
                    setTimeout(() => {
                        const { startInitialization } = require('./initalizations.js');
                        startInitialization().then(() => {
                            exports.installSteps[8].status = "done";
                            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                                setTimeout(() => {
                                    emitListener(bodyData?.eventId, {step: 1});
                                }, 3000);
                                setTimeout(() => {
                                    emitListener(bodyData?.eventId, {step: "STOP"});
                                    res.json({
                                        status: true
                                    });
                                    companyRef.preCompanySetup(3);
                                }, 5000);
                            });
                        }).catch((error) => {
                            exports.installSteps[8].status = "error";
                            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                                emitListener(bodyData?.eventId, {step: "STOP", error: error || "Something went wrong; please contact the administrator"});
                                logger.error(`startInitialization Function Error ${JSON.stringify(error)}`);
                                res.json({
                                    status: false,
                                    error: error
                                });
                            });
                        });
                    }, 5000);
                })
            });
        }
        
        if (bodyData.step === 10) {
            exports.installSteps[9].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.createUser(req, (createUserRes) => {
                    if (createUserRes.status) {
                        exports.installSteps[9].status = "done";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: 1});
                            }, 3000);
                            setTimeout(() => {
                                emitListener(bodyData?.eventId, {step: "STOP"});
                                res.json({...createUserRes});
                            }, 5000);
                        });
                        return;
                    }
                    exports.installSteps[9].status = "error";
                    serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                        emitListener(bodyData?.eventId, {step: "STOP", error: createUserRes.error || "Something went wrong; please contact the administrator"});
                        res.json(createUserRes);
                    });
                });
            });
        }

        if (bodyData.step === 11) {
            exports.installSteps[10].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.generateBuildFrontend((generateRes) => {
                    exports.installSteps[10].status = "done";
                    if (exports.envVar.CANYONLICENSETYPE === "Regular License") {
                        exports.installSteps[11].status = "done";
                    }
                    serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                        // Remove InstallSteps File
                        if (exports.envVar.CANYONLICENSETYPE === "Regular License") {
                            fs.unlinkSync(installStepsFilePath);
                        }
                        setTimeout(() => {
                            emitListener(bodyData?.eventId, {step: 1});
                        }, 3000);
                        setTimeout(() => {
                            emitListener(bodyData?.eventId, {step: "STOP"});
                            res.json({...generateRes});
                        }, 5000);
                    });
                });
            });
        }

        if (bodyData.step === 12) {
            exports.installSteps[11].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.generateBuildAdmin((generateRes) => {
                    if (!generateRes.status) {
                        exports.installSteps[11].status = "error";
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            emitListener(bodyData?.eventId, {step: "STOP", error: generateRes?.error || "Something went wrong; please contact the administrator"});
                            res.json(generateRes);
                        });
                        return;
                    }

                    exports.installSteps[11].status = "done";
                    serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                        // Remove InstallSteps File
                        const statusUpdateData = {
                            productionUrl: req.get('Origin'),
                            licenseId: exports.envVar.CANYONLICENSEID,
                            updateStatus: 2,
                            version: "v" + pjson.version
                        }
                        axios.post(`${process.env.CANYONAPIURL}/api/v1/updateProductionStatus`, statusUpdateData, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                            }
                        })
                        .then(() => {}).catch(() => {});
                        if (generateRes.status) {
                            fs.unlinkSync(installStepsFilePath);
                        }
                        setTimeout(() => {
                            emitListener(bodyData?.eventId, {step: 1});
                        }, 3000);
                        setTimeout(() => {
                            emitListener(bodyData?.eventId, {step: "STOP"});
                            res.json({...generateRes});
                        }, 5000);
                    });
                });
            });
        }
    } catch (error) {
        console.log("error.message", error.message || error);
        logger.error(`installation step Function Error ${JSON.stringify(error)}`);
        exports.installSteps[bodyData.step-1].status = "error";
        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
            res.json({
                status: false,
                error: error
            });
        });
    }
};


/**
 * Get Ai Models
 * @param {Object} req 
 * @param {Object} res 
 */
exports.getAiModels = (req, res) => {
    try {
        let config = {
            method: 'post',
            url: process.env.CANYONAPIURL + '/api/v1/getAiModels',
            headers: {}
        };

        axios.request(config).then((response) => {
            if (response.data.status && response.data.result && response.data.result.length) {
                res.json({
                    status: true,
                    data: response.data.result
                });
                return;
            }
            res.json({
                status: false,
                statusText: "No Data Found"
            });
        })
        .catch((error) => {
            console.log(error);
            res.json({
                status: false,
                error: error
            });
        });
    } catch (error) {
        console.log("error.message", error.message || error);
        logger.error(`get AI Model Function Error ${JSON.stringify(error)}`);
        res.json({
            status: false,
            error: error?.message || error
        });
    }
};
