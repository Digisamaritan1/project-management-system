const crypto = require('crypto');
const { MongoDbCrudOpration } = require('../../utils/mongo-handler/mongoQueries');
const { dbCollections } = require('../../Config/collections');
const { default: mongoose } = require('mongoose');
const logger = require("../../Config/loggerConfig");
const generateReferralCode = (companyId) => {
    return crypto.createHash('sha256').update(companyId + Date.now()).digest('hex').substring(0, 8).toUpperCase();
};

exports.storeRefferalCode = (companyId,userId) => {
    return new Promise((resolve, reject) => {
        try {
            let refferalCode = generateReferralCode(companyId);
            MongoDbCrudOpration('global',{
                type: dbCollections.REFERCODE,
                data: {
                    code: refferalCode,
                    companyId: companyId,
                    ownerId: userId
                }
            },'save').then(()=>{
                resolve();
            }).catch((error)=>{
                reject(error.message);
            })
        } catch (error) {
            reject(error.message);
        }
    })
}

exports.checkAndStoreRefferalCode = (refferalCode,companyId,userId) => {
    return new Promise((resolve, reject) => {
        try {
            MongoDbCrudOpration('global',{
                type: dbCollections.REFERCODE,
                data: [{
                    code: refferalCode,
                    ownerId: {$ne: userId}
                }]
            },'findOne').then((ele)=>{
                if (ele) {
                    MongoDbCrudOpration('global',{
                        type: dbCollections.GLOBALSETTING,
                        data: [
                            {name: {$in: ['inviterRefferalPercentage','inviterRefferalExpiry']}}
                        ]
                    },'find').then((globalSettingData)=> {
                        let percentage = globalSettingData.find((x)=> x.name === 'inviterRefferalPercentage').value || 10;
                        let expiry = globalSettingData.find((x)=> x.name === 'inviterRefferalExpiry').value || -1;
                        let validityTime;
                        if (expiry === -1) {
                            validityTime = new Date(2099,11,31)
                        } else {
                            validityTime = new Date(Date.now() + expiry * 86400000)
                        }
                        MongoDbCrudOpration('global',{
                            type: dbCollections.REFFERALMAPPING,
                            data: {
                                joinedCompanyId: new mongoose.Types.ObjectId(companyId),
                                inviterCompanyId: new mongoose.Types.ObjectId(ele.companyId),
                                transectionPercentage: percentage,
                                validityTime: validityTime
                            }
                        },'save').then(()=>{
                            resolve();
                        }).catch((error)=>{
                            reject(error.message);
                        })
                    })
                } else {
                    resolve();
                }
            }).catch((error)=>{
                reject(error.message);
            })          
        } catch (error) {
            reject(error.message);
        }
    })
}


exports.validateRefferalCode = (req,res) => {
    try {
        if (!(req.body && req.body.refferalCode)) {
            res.status(400).json({message: 'Refferal Code is missing'});
            return;
        }

        MongoDbCrudOpration('global',{
            type: dbCollections.REFERCODE,
            data: [{
                code: req.body.refferalCode,
                ownerId: {$ne: req.body.userId}
            }]
        },'findOne').then((ele)=>{
            if (ele) {
                res.status(200).json({message: 'It is valid'});
            } else {
                res.status(400).json({message: 'It is invalid'});
            }
        }).catch((error)=>{
            res.status(500).json({message: error.message});    
        })

    } catch (error) {
        res.status(500).json({message: error.message});
    }
}


exports.storeRefferalCreditsAfterTransection = (invoice,companyId) => {
    return new Promise((resolve, reject) => {       
        try {
          if (invoice.amount_paid > 0) {
              MongoDbCrudOpration('global',{
                  type: dbCollections.REFFERALMAPPING,
                  data: [{
                     joinedCompanyId: new mongoose.Types.ObjectId(companyId),
                  }]
              },'findOne').then((ele)=>{
                 if (ele) {
                     MongoDbCrudOpration('global',{
                         type: dbCollections.REFFERALMAPPING,
                         data: [
                             [
                                 {
                                     $match: {
                                         joinedCompanyId: new mongoose.Types.ObjectId(companyId),
                                     }
                                 },
                                 {
                                     $lookup: {
                                         from: 'companies',
                                         localField: "inviterCompanyId",
                                         foreignField: "_id",
                                         as: "companyData"
                                     }
                                 },
                                 {
                                     $lookup: {
                                         from: 'companies',
                                         localField: "joinedCompanyId",
                                         foreignField: "_id",
                                         as: "joinCompanyData"
                                     }
                                 },
                                 {
                                     $project: {
                                         _id: 1,
                                         customerId: { $arrayElemAt: ["$companyData.customerId", 0] },
                                         companyName: {$arrayElemAt: ["$joinCompanyData.Cst_CompanyName", 0]},
                                         transectionPercentage: 1,
                                         validityTime:1,
                                         inviterCompanyId:1
                                     }
                                 }
                             ]
                         ]
                     },'aggregate').then((ele)=>{
                         let isValidRefferal = new Date().getTime() < new Date(ele[0].validityTime).getTime();
                         if (isValidRefferal) {
                             let addedAmount = Number(invoice.amount_paid * (ele[0].transectionPercentage/100)).toFixed();
                             let desription = `Company ${ele[0].companyName} made a payment of $${Number(invoice.amount_paid / 100).toFixed(2)}. You've earned $${Number(addedAmount / 100).toFixed(2)} referral credit!`
                            resolve({isAddPromotional: true,addedAmount:addedAmount ,customerId: ele[0].customerId,desription:desription})
                         } else {
                            reject();
                         }
                     }).catch((error)=>{
                        reject();
                         logger.error(`Error while get refferal mapping Aggregate: ${error.message}`);
                     })
                 } else {
                    reject();
                 }
              }).catch((error)=>{
                reject();
                logger.error(`Error while get refferal mapping: ${error.message}`);
              })
          } else {
            reject();
          }  
        } catch (error) {
            reject();
            logger.error(`Error while store promotional credit: ${error}`);
        }
    })
}


/**
 * Get Referral Percentage
 * @param {Object} req 
 * @param {Object} res 
 */
exports.getreferralpercentage = (req, res) => {
    try {
        MongoDbCrudOpration(dbCollections.GLOBAL ,{
            type: dbCollections.GLOBALSETTING,
            data: [{
                name: 'inviterRefferalPercentage'
            }]
        },'findOne').then((resData)=> {
            res.status(200).json({
                status: true,
                data: resData
            });
        }).catch((error) => {
            res.status(400).json({
                status: false,
                error: error
            });
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            error: error?.message || error
        });
    }
};
