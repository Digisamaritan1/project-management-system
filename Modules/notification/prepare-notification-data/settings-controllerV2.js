const logger = require("../../../Config/loggerConfig")
const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");
const { SCHEMA_TYPE } = require("../../../Config/schemaType")
exports.getNotificationSetttings = (UserIDs, companyId) => {
  return new Promise((resolve, reject) => {
    try {
      let obj = {
        type: SCHEMA_TYPE.NOTIFICATIONS_SETTINGS,
        data: [{
          userId: {
            $in: UserIDs
          },
        }]
      }
      MongoDbCrudOpration(companyId, obj, "find")
        .then((data) => {
          resolve(data)
        })
        .catch(error => {
          reject({ message: "Notification Settings Details not found" })
        })
    } catch (error) {
      reject({ message: "Notification Settings Details not found" })
    }
  })
};