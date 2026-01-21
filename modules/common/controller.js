const { dbCollections } = require("../../Config/collections");
const { updateUserFun } = require("../usersModule/controller");

exports.versionUpdateNotifyToClient = (req, res) => {
    try {
        let obj = {
            type: dbCollections.USERS,
            data: [
                {
                    isProductOwner : true
                },
                {
                    $set: {
                        isVesionUpdate: req.body.flag
                    }
                },
                {
                    returnDocument : 'after'
                }
            ]
        }
        updateUserFun(dbCollections.GLOBAL,obj,"findOneAndUpdate").then(()=>{
            res.json({status: true});
        })
    } catch (error) {
        res.json({
            status: false,
            error: `Version Update Error: ${error.message || error}`
        });
    }
}