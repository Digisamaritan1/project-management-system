const config = require("../../Config/config");
const axios = require('axios');
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries");
const { dbCollections } = require("../../Config/collections");
const logger = require("../../Config/loggerConfig");
const { SCHEMA_TYPE } = require("../../Config/schemaType");
const { default: mongoose } = require("mongoose");
const { removeCache } = require("../../utils/commonFunctions");
const { getCompanyDataFun, updateCompanyFun } = require("../Company/controller/updateCompany");
const { getAllSubscriptionPlansPromise } = require("../SubscriptionPlan/controller");
const { updateUserFun, getUserByQueyFun } = require("../usersModule/controller");
const { updateMemberFunction } = require('../settings/Members/controller.js');
const socketEmitter = require('../../event/socketEventEmitter');

exports.setTransectionInDb = (webhookData) => {
    try {
        if (webhookData.custom_data.domainLink == config.WEBURL) {
            let query = {
                customerId: webhookData.customer_id
            }
            getUserByQueyFun(query).then((resp)=>{
                const user = resp[0];
                let obj = {
                    type: dbCollections.INVOICES,
                    data: [
                        {invoiceId: webhookData.id},
                        {
                            ...webhookData,
                            companyId : new mongoose.Types.ObjectId(webhookData.custom_data.companyId),
                            userId : new mongoose.Types.ObjectId(user._id),
                            invoiceId : webhookData.id
                        },
                        {upsert: true}
                    ]
                }
                MongoDbCrudOpration("global",obj,"findOneAndUpdate").catch((error)=>{
                    logger.error(`Paddle Error:::::Error Setting Transection In DB${error}`);
                })
            }).catch((error)=>{
                logger.error(`Paddle Error:::::Error Setting Transection In DB${error}`);
            })
        }
    } catch (error) {
        logger.error(`Paddle Error:::::Error Setting Transection In DB${error}`);
    }
}

// Main Function where tracker users and projects restriction flow handle
exports.updateRestrictProject = (updateObject) => {
    return new Promise((mainRes,mainRej)=>{
        try {
            const {companyId,planFeature} = updateObject;

            getCompanyDataFun([companyId])
            .then(async(response) => {
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
                    await trackerUserHandler(companyId,planFeature).catch((err)=>{logger.error(`trackerUserHandler Error:${err}`);})
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
                            object.data[0].push({$limit: checkUsers.data.count});
                        }
                        //Find users array with limit
                        MongoDbCrudOpration(companyId,object, "aggregate").then((userResponse) => {
                            //Update User in Company User collection
                            const memberObject = [
                                { _id: { $in: userResponse.map((x) => new mongoose.Types.ObjectId(x._id)) } },
                                { $set: { isTrackerUser: false } },
                            ]
                            updateMemberFunction(companyId, memberObject, "updateMany").then(()=>{
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
            return { status: false};
        }
        else{
            let total = maxProject;
            let private = 0;
            let public = 0;
            if(maxPrivateProject === null && maxPublicProject === null) {
                return { status: false};
            }
            else if (typeof maxPrivateProject === 'number' && typeof maxPublicProject === 'number'){
                if(maxPrivateProject === maxPublicProject && maxPrivateProject + maxPublicProject === total){
                    return {status: true, skip: total}
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
                        public = maxPublicProject;
                        private = maxPrivateProject;
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
                    private = maxPublicProject;
                    public = total - maxPublicProject;
                }else{
                    private = total;
                    public = 0;
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
                exports.updateQuery('random',data.skip,companyId).then(() => {
                    resolve(true);
                }).catch((error) => {
                    logger.error(`${error} Error in update project`);
                });
            }else if(data.private || data.public){
                if(data.private !== 0){
                    exports.updateQuery('private',data.private,companyId).then((resData) => {
                        if(data.public !== 0){
                            exports.updateQuery('public',data.public,companyId,{...resData,isPublic:true}).then(() => {
                                resolve(true);
                            }).catch(() => {
                                logger.error(`${error} Error in update project`);
                            });
                        }
                    }).catch(() => {
                        logger.error(`${error} Error in update project`);
                    });
                }else{
                    if(data.public !== 0){
                        exports.updateQuery('public',data.public,companyId,{isPublic:true}).then(() => {
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
                    type: dbCollections.PROJECTS,
                    data: [
                        {_id: { $in: response.map((x) => x._id) } },
                        { $set: { isRestrict: false } },
                    ]
                }
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
                                object.data[0].push({$limit: checkUsers.data.count});
                            }
                            //Find users array with limit
                            MongoDbCrudOpration(companyId,object, "aggregate").then((userResponse) => {
                                let trackerUserCount = userResponse.filter((e)=>{return e.isTrackerUser == true});

                                // Update User in Company User collection
                                const memberObject = [
                                    { _id: { $in: userResponse.map((x) => new mongoose.Types.ObjectId(x._id)) } },
                                    { $set: { isTrackerUser: false,isRestrict:true } },
                                ]
                                updateMemberFunction(companyId, memberObject, "updateMany").then(()=>{

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
                                object1.data[0].push({$limit: checkUsers.data.count});
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

const trackerUserHandler = (companyId,planFeature) => {
    return new Promise((res,rej)=>{
        try {
            getCompanyDataFun([companyId]).then(async(response) => {
                const companyData = response[0];
                let checkUsers = await exports.checkExceedForUser(JSON.parse(JSON.stringify(companyData)),planFeature);
                exports.handleTrackerUserData(checkUsers,companyId).then((fRes)=>{
                    res(fRes);
                })
                .catch((error)=>{
                    logger.error(`${error} error in trackerUserHandler`)
                    rej({status:false,statusText: 'Something went wronge'})
                })
            })
        } catch (error) {
            logger.error(`${error} error in trackerUserHandler`)
            rej({status:false,statusText: 'Something went wronge'})
        }
    })
}


exports.setSubscriptionInDb = (webhookData) => {
    try {
        if (webhookData.custom_data.domainLink == config.WEBURL && webhookData.status == 'active') {

            getCompanyDataFun([webhookData.custom_data.companyId])
            .then((res) => {
                const companyData = res[0];
                let subscriptionId = JSON.parse(JSON.stringify(webhookData.id));
                delete webhookData.id
                let subScriptionObj = {
                    type: dbCollections.SUBSCRIPTIONS,
                    data: [
                        {subscriptionId: subscriptionId},
                        {
                            subscriptionId: subscriptionId,
                            ...webhookData,
                            userId: new mongoose.Types.ObjectId(companyData.userId),
                            companyId: new mongoose.Types.ObjectId(webhookData.custom_data.companyId)
                        },
                        {upsert: true}
                    ]
                }
                MongoDbCrudOpration("global", subScriptionObj, "findOneAndUpdate").then(()=>{
                    let planObj = {
                        type: dbCollections.PLANFEATURE,
                        data: [
                            {
                                planName: webhookData.custom_data.selectedPlan
                            }
                        ]
                    }
                    MongoDbCrudOpration("global", planObj, "findOne").then((planFeature)=>{
                        let companyObj = {
                            type: dbCollections.COMPANIES,
                            data: [
                                {
                                    _id: webhookData.custom_data.companyId
                                },
                                {
                                    SubcriptionId: subscriptionId,
                                    subscriptionRenewalDate: Math.floor(new Date(webhookData.next_billed_at).getTime() / 1000),
                                    customerId: webhookData.customer_id,
                                    isInactive: false,
                                    planFeature: planFeature,
                                    availableUser: 0
                                },
                                {
                                    returnDocument: 'after'
                                }
                            ]
                        }
                        updateCompanyFun(SCHEMA_TYPE.GOLBAL,companyObj,"findOneAndUpdate",webhookData.custom_data.companyId)
                        .then((response)=>{
                            socketEmitter.emit('update', { type: "update", data: response , updatedFields: {
                                SubcriptionId: subscriptionId,
                                subscriptionRenewalDate: Math.floor(new Date(webhookData.next_billed_at).getTime() / 1000),
                                customerId: webhookData.customer_id,
                                isInactive: false,
                                planFeature: planFeature,
                                availableUser: 0
                            }, module: 'companies' });
                            exports.updateRestrictProject({planFeature, companyId: webhookData.custom_data.companyId})
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
        logger.error(`Paddle Error:::::Error Setting Transection In DB${error}`);
    }
}

exports.setSubscriptionCancelInDb = (webhookData) => {
    if (webhookData.custom_data.domainLink == config.WEBURL) {
        let query = [{ $match: { defaultSubscribe: true } }];

        getAllSubscriptionPlansPromise(query)
            .then((resp)=>{
            let plan = resp[0];
            let neObj = {
                type: SCHEMA_TYPE.PLANFEATURE,
                data: [
                    {
                        planName: plan.planName
                    }
                ]
            }
            MongoDbCrudOpration("global",neObj,"findOne").then((ele)=>{
                let upObj = {
                    type: SCHEMA_TYPE.COMPANIES,
                    data: [
                        {
                            _id: webhookData.custom_data.companyId
                        },
                        {
                            planFeature: ele,
                            SubcriptionId: ""
                        },
                        {
                            returnDocument: 'after'
                        }
                    ]
                }
                updateCompanyFun(SCHEMA_TYPE.GOLBAL,upObj,"findOneAndUpdate",webhookData.custom_data.companyId)
                .then((response) => {
                    socketEmitter.emit('update', { type: "update", data: response , updatedFields: {
                        planFeature: ele,
                        SubcriptionId: ""
                    }, module: 'companies' });
                })
                .catch((error)=>{
                    logger.error(`Cancel Subscription Update COMPANY ERROR Error: ${error} `)
                })
            }).catch((error)=>{
                logger.error(`Cancel Subscription Update COMPANY ERROR Error: ${error} `);
            })
        }).catch((error)=>{
            logger.error(`Cancel Subscription Update COMPANY ERROR Error: ${error} `);
        })
    }
}

exports.webhook = (req,res) => {
    let webhookData;
    res.sendStatus(204);
    switch (req.body.event_type) {
        case 'transaction.billed':
            webhookData =  req.body.data;
            exports.setTransectionInDb(webhookData);
            break;
        case 'transaction.canceled':
            webhookData = req.body.data;
            exports.setTransectionInDb(webhookData);
            break;
        case 'transaction.completed':
            webhookData = req.body.data;
            exports.setTransectionInDb(webhookData);
            break;
        case 'transaction.created':
            webhookData = req.body.data;
            exports.setTransectionInDb(webhookData);
            break;
        case 'transaction.paid':
            webhookData = req.body.data;
            exports.setTransectionInDb(webhookData);
            break;
        case 'transaction.past_due':
            webhookData = req.body.data;
            exports.setTransectionInDb(webhookData);
            break;
        case 'transaction.payment_failed':
            webhookData = req.body.data;
            exports.setTransectionInDb(webhookData);
            break;
        case 'transaction.ready':
            webhookData = req.body.data;
            exports.setTransectionInDb(webhookData);
            break;
        case 'transaction.updated':
            webhookData = req.body.data;
            exports.setTransectionInDb(webhookData);
            break;
        case 'subscription.activated':
            webhookData = req.body.data;
            exports.setSubscriptionInDb(webhookData);
            break;
        case 'subscription.canceled':
            webhookData = req.body.data;
            exports.setSubscriptionCancelInDb(webhookData); 
            break;
        case 'subscription.created':
            webhookData = req.body.data;
            exports.setSubscriptionInDb(webhookData);
            break;
        case 'subscription.past_due':
            webhookData = req.body.data;
            exports.setSubscriptionInDb(webhookData);
            break;
        case 'subscription.updated':
            webhookData = req.body.data;
            exports.setSubscriptionInDb(webhookData);
            break;
        default:
            return;
    }
    // res.send();
}


exports.createCustomerInPayment = (userId) => {
    return new Promise((resolve, reject) => {
        try {
            getUserByQueyFun({_id: new mongoose.Types.ObjectId(userId)})
            .then((resp)=>{
                const user = resp[0];
                let customerObj = {
                    email: user.Employee_Email,
                    name: `${user.Employee_FName} ${user.Employee_LName}`,
                    custom_data: {
                        domainLink: config.WEBURL
                    }
                };
            
                let configeration = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${config.PADDLE_URL}/customers`,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${config.PADDLE_API_KEY}`
                    },
                    data : customerObj
                };
            
                axios.request(configeration)
                .then((response) => {
                    var customer = response.data.data.id;
                    let updateObj = {
                        type: dbCollections.USERS,
                        data: [
                            {
                                _id: userId
                            },
                            {
                                customerId: customer,
                            }
                        ]
                    }
                    updateUserFun(dbCollections.GLOBAL, updateObj, "findOneAndUpdate",'',userId)
                    .then(()=>{
                        resolve(customer);
                    }).catch((error)=>{
                        reject(error.message ? error.message : error);
                        return;
                    })
                })
                .catch((error) => {
                    reject(error);
                });
            })
        } catch (error) {
            reject(error);
        }
    })
}


exports.customerAddressPaddle = (req,res) => {
    try {
        let fields = [ 
            'country',
            'state',
            'city',
            'address1',
            'address2',
            'companyName',
            'zipCode',
            'GST',
            'countryCode',
            'stateCode',
            'companyId',
            'customerId',
        ]
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
        getCompanyDataFun([req.body.companyId])
        .then((company)=>{
            const companyData = company[0];
            let url;
            let method;
            if (companyData.billingDetails && companyData.billingDetails.addressId) {
                method = 'patch';
                url = `${config.PADDLE_URL}/customers/${req.body.customerId}/addresses/${companyData.billingDetails.addressId}`
            } else {
                method = 'post';
                url = `${config.PADDLE_URL}/customers/${req.body.customerId}/addresses`;
            }
            let addressObj = {
                description: req.body.companyName,
                first_line: req.body.address1,
                second_line: req.body.address2,
                city: req.body.city,
                region: req.body.stateCode,
                postal_code: req.body.zipCode,
                country_code: req.body.countryCode
            };
        
            let configeration = {
                method: method,
                maxBodyLength: Infinity,
                url: url,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${config.PADDLE_API_KEY}`
                },
                data : addressObj
            };
        
            axios.request(configeration)
            .then((response) => {
                let companyId = req.body.companyId;
                let finalObj = {
                    country:  req.body.country,
                    state:  req.body.state,
                    city: req.body.city,
                    address1:  req.body.address1,
                    address2:  req.body.address2,
                    companyName:  req.body.companyName,
                    zipCode:  req.body.zipCode,
                    GST: req.body.GST,
                    countryCode: req.body.countryCode,
                    stateCode: req.body.stateCode,
                    addressId: response.data.data.id
                }
                // delete finalObj.customerId;
                // delete finalObj.companyId;

                let upObj = {
                    type: dbCollections.COMPANIES,
                    data: [
                        {
                            _id: companyId
                        },
                        {
                            billingDetails: finalObj,
                            // test: "Testing"
                        }
                    ]
                }
                updateCompanyFun(SCHEMA_TYPE.GOLBAL,upObj,"findOneAndUpdate",companyId).then(()=>{
                    res.status(200).json({message: `Address Add Successfully`});
                }).catch((error)=>{
                    res.status(400).json({message: error});
                })
            })
        }).catch((error)=>{
            res.status(404).json({message: error});    
        })
    } catch (error) {
        res.status(404).json({message: error.message});
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
                    $match: {
                    planName: id,
                    },
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

exports.updateSubscriptionPaymentEstimate = (req,res) => {
    try {
        if(!req.body.subscriptionId || req.body.subscriptionId === '') {
            res.status(400).json({message: 'subscriptionId is required'});
            return;
        }

        if (req.body.isPlanChange == undefined || typeof req.body.isPlanChange !== 'boolean') {
            res.status(400).json({message: 'isPlanChange is required'});
            return;            
        }

        if (req.body.isPeriodChange == undefined || typeof req.body.isPeriodChange !== 'boolean') {
            res.status(400).json({message: 'isPeriodChange is required'});
            return;            
        }

        if (!req.body.currentUsers || req.body.currentUsers === undefined) {
            res.status(400).json({message: 'currentUsers is required'});
            return;
        }
        
        if (req.body.isOverWrite == undefined || typeof req.body.isOverWrite !== 'boolean') {
            res.status(400).json({message: 'isOverWrite is required'});
            return;            
        }

        if (req.body.isPlanChange === true) {
            if (!(req.body && req.body.planId)) {
                res.send({
                    status: false,
                    statusText: 'planId is required'
                })
                res.status(400).json({message: 'planId is required'});
                return;            
            }    
        }
        let obj = {
            type: dbCollections.SUBSCRIPTIONS,
            data: [
                {
                    subscriptionId: req.body.subscriptionId
                }
            ]
        }
        MongoDbCrudOpration('global',obj,'findOne').then((sub)=>{
            let priceId = sub.items[0].price.id;
            getPlanDetails(priceId,false).then(async (planDetail)=>{
                if (planDetail && planDetail !== null) {
                    let currentPeriod = planDetail.itemPriceArray.find((x)=> x.id == priceId)?.period_unit;
                    if (currentPeriod) {
                        let reqBody;
                        if (req.body.isPlanChange && req.body.isPeriodChange) {
                            let upgradePeriod;
                            if (currentPeriod == 'month') {
                                upgradePeriod = 'year';
                            } else {
                                upgradePeriod = 'month';
                            }
                            let reqbodyplanDetail = await getPlanDetails(req.body.planId,true);
                            let updatePrice = reqbodyplanDetail.itemPriceArray.find((x)=> x.period_unit == upgradePeriod);
                            reqBody = {
                                items: [
                                    {
                                        price_id: updatePrice.id,
                                        quantity: req.body.currentUsers
                                    },
                                ],
                                "proration_billing_mode": "prorated_immediately",
                                custom_data: {
                                    selectedPlan: reqbodyplanDetail.planName,
                                    companyId: sub.companyId,
                                    domainLink: config.WEBURL,
                                }
                            }
                        } else if (req.body.isPlanChange) {
                            let reqbodyplanDetail = await getPlanDetails(req.body.planId,true);
                            let updatePrice = reqbodyplanDetail.itemPriceArray.find((x)=> x.period_unit == currentPeriod);
                            reqBody = {
                                items: [
                                    {
                                        price_id: updatePrice.id,
                                        quantity: req.body.currentUsers
                                    },
                                ],
                                "proration_billing_mode": "prorated_immediately",
                                custom_data: {
                                    selectedPlan: reqbodyplanDetail.planName,
                                    companyId: sub.companyId,
                                    domainLink: config.WEBURL,
                                }
                            }
                        } else if (req.body.isPeriodChange) {
                            let reqbodyplanDetail = await getPlanDetails(req.body.planId,true);
                            let upgradePeriod;
                            if (currentPeriod == 'month') {
                                upgradePeriod = 'year';
                            } else {
                                upgradePeriod = 'month';
                            }
                            let updatePrice = planDetail.itemPriceArray.find((x)=> x.period_unit == upgradePeriod);
                            reqBody = {
                                items: [
                                    {
                                        price_id: updatePrice.id,
                                        quantity: req.body.currentUsers
                                    },
                                ],
                                "proration_billing_mode": "prorated_immediately",
                                custom_data: {
                                    selectedPlan: reqbodyplanDetail.planName,
                                    companyId: sub.companyId,
                                    domainLink: config.WEBURL,
                                }
                            }
                        }
                        let configeration = {
                            method: 'patch',
                            maxBodyLength: Infinity,
                            url: `${config.PADDLE_URL}/subscriptions/${req.body.subscriptionId}/preview`,
                            headers: { 
                                'Content-Type': 'application/json', 
                                'Authorization': `Bearer ${config.PADDLE_API_KEY}`
                            },
                            data : reqBody
                        };
                    
                        axios.request(configeration)
                        .then((response) => {
                            res.status(200).json({message: response.data.data, updateObj: reqBody});
                        }).catch((error)=>{
                            res.status(400).json({message: error});
                        })
                    } else {
                        res.status(400).json({message: 'No current Plan Found'});
                    }
                } else {
                    res.status(400).json({message: 'No plan Details found in db'});
                }
            })
        }).catch((error)=>{
            res.status(400).json({message: error});
        })
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

exports.updateSubscriptionPayment = (req,res) => {
    try {
        if (req.body.updateObj === undefined) {
            res.status(400).json({message: 'Update Obj Is Required'});
            return;
        }
        if (req.body.subscriptionId === undefined) {
            res.status(400).json({message: 'subscriptionId Is Required'});
            return;
        }
        let configeration = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: `${config.PADDLE_URL}/subscriptions/${req.body.subscriptionId}`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${config.PADDLE_API_KEY}`
            },
            data : req.body.updateObj
        };
    
        axios.request(configeration)
        .then(() => {
            res.status(200).json({message: 'Subscription Update Succesfully'});
        }).catch((error)=>{
            res.status(400).json({message: error});
        })
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}


exports.addAndRemoveUserInPaymentSubscriptionEstimate = (req,res) => {
    try {
        if(!req.body.subscriptionId || req.body.subscriptionId === '') {
            res.status(400).json({message: 'subscription id is required'});
            return;
        }
        if(req.body.addOnId == undefined || req.body.addOnId === '') {
            res.status(400).json({message: 'addOnId is required'});
            return;
        }

        if (req.body.isAddOnAdd == undefined) {
            res.status(400).json({message: 'isAddOnAdd is required'});
            return;
        }

        if (req.body.addOnQuantity == undefined || req.body.addOnQuantity === '') {
            res.status(400).json({message: 'addOnQuantity is required'});
            return;
        }

        if (!req.body.currentUsers || req.body.currentUsers === undefined) {
            res.status(400).json({message: 'currentUsers is required'});
            return;
        }
        let newUser;
        if (req.body.isAddOnAdd === true) {
            newUser = req.body.currentUsers + 1
        } else {
            newUser = req.body.currentUsers - 1
        }
        let reqBody = {
            items: [
                {
                    price_id: req.body.addOnId,
                    quantity: newUser
                },
            ],
            "proration_billing_mode": "prorated_immediately"
        }
        let configeration = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: `${config.PADDLE_URL}/subscriptions/${req.body.subscriptionId}/preview`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${config.PADDLE_API_KEY}`
            },
            data : reqBody
        };
    
        axios.request(configeration)
        .then((response) => {
            res.status(200).json({message: response.data.data, updateObj: reqBody});
        }).catch((error)=>{
            res.status(400).json({message: error});
        })
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}


exports.getSubscriptionDetails = (req, res) => {
    try {
        const {sid} = req.params;

        if(!sid) {
            return res.status(400).json({status: false, error: "No subscription id found"})
        }

        let configeration = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${config.PADDLE_URL}/subscriptions/${sid}`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${config.PADDLE_API_KEY}`
            }
        };
    
        axios.request(configeration)
        .then((response) => {
            res.status(200).json({message: response.data.data});
        }).catch((error)=>{
            res.status(400).json({message: error});
        })
    } catch (error) {
        res.status(400).json({status: false, error: error.message});
    }
}


exports.cancelSubscriptionPaddle = (req,res) => {
    try {
        if (!(req.body && req.body.subscriptionId)) {
            res.status(400).json({message: 'Subscription Id is Required'});
            return;
        }

        let configeration = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${config.PADDLE_URL}/subscriptions/${req.body.subscriptionId}/cancel`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${config.PADDLE_API_KEY}`
            },
            data: {
                "effective_from": "next_billing_period"
            }
        };
    
        axios.request(configeration)
        .then((response) => {
            res.status(200).json({message: response.data.data});
        }).catch((error)=>{
            res.status(400).json({message: error});
        })
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}


exports.getInvoiceAndCreditNotes = (req,res) => {
    try {
        if (!(req.body && req.body.companyId)) {
            res.status(400).json({message: 'companyId is required'});
            return;
        }

        let obj = {
            type: dbCollections.INVOICES,
            data: [
                {companyId:  new mongoose.Types.ObjectId(req.body.companyId)}
            ]
        }
        MongoDbCrudOpration('global',obj,'find').then((resp)=>{
            let invoiceData = [];
            let creditNotes = [];
            resp.forEach((ele)=>{
                if (ele.invoice_number) {      
                    let noofUser = Number(ele.items[0].quantity) < 0 ? Number(ele.items[0].quantity) * -1 : Number(ele.items[0].quantity)
                    let description = `${ele.custom_data.selectedPlan} for ${noofUser} ${noofUser > 1 ? 'users' : 'user'}`;
    
    
                    invoiceData.push({
                        id: ele.invoice_number,
                        date: new Date(ele.created_at).getTime(),
                        createdAt: new Date(ele.created_at).getTime(),
                        description: '',
                        noOfUser: Number(ele.items[0].quantity) < 0 ? Number(ele.items[0].quantity) * -1 : Number(ele.items[0].quantity),
                        // amount: Number(ele.details.totals.grand_total).toFixed(2),
                        amount: Number(ele.items[0].price.unit_price.amount * ele.items[0].quantity).toFixed(2) < 0 ? Number(ele.items[0].price.unit_price.amount * ele.items[0].quantity).toFixed(2) * -1 : Number(ele.items[0].price.unit_price.amount * ele.items[0].quantity).toFixed(2),
                        type: 'invoice',
                        status: ele.status === 'completed' ? 'paid' : ele.status,
                        invoiceHtml: '',
                        discription: description,
                        transectionId: ele.id
                    })
    
                    if (ele.details.totals.credit != '0' || ele.details.totals.credit_to_balance != '0') {
                        let credit;
                        let status;
                        if (ele.details.totals.credit != '0') {
                            credit = ele.details.totals.credit;
                            status = 'credit Used'
                        } else {
                            credit = ele.details.totals.credit_to_balance;
                            status = 'credit Added'
                        }
                        creditNotes.push({
                            id: ele.invoice_number,
                            date: new Date(ele.created_at).getTime(),
                            createdAt: new Date(ele.created_at).getTime(),
                            description: '',
                            noOfUser: Number(ele.items[0].quantity) < 0 ? Number(ele.items[0].quantity) * -1 : Number(ele.items[0].quantity),
                            amount: credit,
                            // type: 'invoice',
                            status: status,
                            discription: description,
                            transectionId: ele.id
                        })
    
                    }
                }
            })
            let invoice = invoiceData.sort((a, b) => a.date > b.date ? -1 : 1);
            let creditNote = creditNotes.sort((a, b) => a.date > b.date ? -1 : 1);


            res.status(200).json({invoiceArray: invoice, creditNoteArray: creditNote});
        }).catch((error)=>{
            res.status(400).json({message: error.message});
        })
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}



exports.getTransectionPDFURL = (req,res) => {
    try {
        if (!(req.body && req.body.transectionId)) {
            res.status(404).json({message: 'transectionId not found'});
            return;
        }

        let configeration = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${config.PADDLE_URL}/transactions/${req.body.transectionId}/invoice`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${config.PADDLE_API_KEY}`
            },
        };
    
        axios.request(configeration)
        .then((response) => {
            res.status(200).json({message: response.data.data.url});
        }).catch((error)=>{
            res.status(400).json({message: error});
        })
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}



exports.getCustomerCredit = (req,res) => {
    try {
        const {cid} = req.params;

        if(!cid) {
            return res.status(400).json({status: false, error: "No customer id found"})
        }

        let configeration = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${config.PADDLE_URL}/customers/${cid}/credit-balances`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${config.PADDLE_API_KEY}`
            },
        };
    
        axios.request(configeration)
        .then((response) => {
            console.log(response.data.data);
            if (response.data.data.length) {
                let credits = Number(response.data.data[0].balance.available / 100).toFixed(2);
                res.status(200).json({message: credits});
            } else {
                res.status(200).json({message: 0});
            }
        }).catch((error)=>{
            res.status(400).json({message: error});
        })
    } catch (error) {
        res.status(400).json({message: error.message});
    }
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
            getUserByQueyFun({_id: new mongoose.Types.ObjectId(userId)})
            .then((resp)=>{
                const user = resp[0];
                if (user.customerId && user.customerId !== '' ) {
                    let query = [{ $match: { defaultSubscribe: true } }];

                    getAllSubscriptionPlansPromise(query)
                    .then((resp)=>{
                        let plan = resp[0];
                        let neObj = {
                            type: SCHEMA_TYPE.PLANFEATURE,
                            data: [
                                {
                                    planName: plan.planName
                                }
                            ]
                        }
                        MongoDbCrudOpration("global",neObj,"findOne").then((ele)=>{
                            let upObj = {
                                type: SCHEMA_TYPE.COMPANIES,
                                data: [
                                    {
                                        _id: companyId
                                    },
                                    {
                                        planFeature: ele
                                    }
                                ]
                            }
                            updateCompanyFun(SCHEMA_TYPE.GOLBAL,upObj,"findOneAndUpdate",companyId)
                            .then(()=>{
                                resolve();
                            }).catch((error)=>{
                                reject(error.message ? error.message : error);
                            })
                        }).catch((error)=>{
                            reject(error.message ? error.message : error);
                        })
                    }).catch((error)=>{
                        reject(error.message ? error.message : error);
                    })
                } else {
                    exports.createCustomerInPayment(userId).then(()=>{
                        let query = [{ $match: { defaultSubscribe: true } }];

                        getAllSubscriptionPlansPromise(query)
                        .then((resp)=>{
                            let plan = resp[0];
                            let neObj = {
                                type: SCHEMA_TYPE.PLANFEATURE,
                                data: [
                                    {
                                        planName: plan.planName
                                    }
                                ]
                            }
                            MongoDbCrudOpration("global",neObj,"findOne").then((ele)=>{
                                let upObj = {
                                    type: SCHEMA_TYPE.COMPANIES,
                                    data: [
                                        {
                                            _id: companyId
                                        },
                                        {
                                            planFeature: ele
                                        }
                                    ]
                                }
                                updateCompanyFun(SCHEMA_TYPE.GOLBAL,upObj,"findOneAndUpdate",companyId)
                                .then(()=>{
                                    resolve();
                                }).catch((error)=>{
                                    reject(error.message ? error.message : error);
                                })
                            }).catch((error)=>{
                                reject(error.message ? error.message : error);
                            })
                        }).catch((error)=>{
                            reject(error.message ? error.message : error);
                        })
                    }).catch((error)=>{
                        reject(error.message ? error.message : error);
                    })
                }
            }).catch((error)=>{
                reject(error.message ? error.message : error);
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