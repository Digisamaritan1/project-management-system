const { MongoDbCrudOpration,  tableType, checkType } = require("../../../utils/mongo-handler/mongoQueries");
const { SCHEMA_TYPE } = require("../../../Config/schemaType")
const { dbCollections, } = require('../../../Config/collections');
const logger = require("../../../Config/loggerConfig")
exports.emailCronHandler = (req, res) => {
    try {
        let obj = {
            type: SCHEMA_TYPE.NOTIFICATIONS,
            data: []
        }
        MongoDbCrudOpration(dbCollections.GLOBAL, obj, "find")
            .then(async usersDetails => {
                var data = await this.companiesListData(usersDetails)
                res.send(data)
            })
            .catch(error => {
                res.send(error)
            })
    } catch (error) {
        logger.error(`Push Notification Handler Middleware Catch: ${error.message}`);
        res.send({status:false,message:error?.message||error})

    }
};

exports.companiesListData = (usersDetails) => {
    let data = []
    if (usersDetails.length > 0) {
        const dividedById = {};
        usersDetails.forEach(item => {
            const id = item.companyId;
            if (!dividedById[id]) {
                dividedById[id] = [];
            }
            dividedById[id].push(item);
        });

        let dataKeys = Object.keys(dividedById)
        let dataValue = Object.values(dividedById)
        dataKeys.map(async (item, index) => {
            var temp = await this.usersDetails(dataValue[index])
            data.push({ id: item, data: temp })
        })
    }
    return data
}

exports.usersDetails = (data) => {
    let user = []
    if (data.length > 0) {
        const dividedById = {};
        data.forEach(item => {
            const id = item.receiverID;
            if (!dividedById[id]) {
                dividedById[id] = [];
            }
            dividedById[id].push(item);
        });

        let dataKeys = Object.keys(dividedById)
        let dataValue = Object.values(dividedById)
        dataKeys.map(async(item, index) => {
            var temp = await this.projectDetails(dataValue[index])
            user.push({ id: item, data: temp })
        })
    }
    return user
}


exports.projectDetails = (data) => {
    let project = []
    if (data.length > 0) {
        const dividedById = {};
        data.forEach(item => {
            const id = item.projectId;
            if (!dividedById[id]) {
                dividedById[id] = [];
            }
            dividedById[id].push(item);
        });

        let dataKeys = Object.keys(dividedById)
        let dataValue = Object.values(dividedById)
        dataKeys.map((item, index) => {
            project.push({ id: item, data: dataValue[index] })
        })
    }
    return project
}