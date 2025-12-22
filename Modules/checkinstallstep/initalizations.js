const { SCHEMA_TYPE } = require("../../Config/schemaType");
const { importRestrictedExtensions, importCustomFields, importTours } = require("../../utils/data");

exports.startInitialization = () => {
    return new Promise((resolve, reject) => {
        try {
            const promises = [];

            promises.push(
                // ADD RESTRICTED EXTENSIONS
                importRestrictedExtensions(SCHEMA_TYPE.GOLBAL)
            )
            promises.push(
                // ADD customField
                importCustomFields(SCHEMA_TYPE.GOLBAL)
            )
            promises.push(
                // ADD Project Tour
                importTours(SCHEMA_TYPE.GOLBAL)
            )

            Promise.allSettled(promises)
            .then((result) => {
                console.log("result: ", result);
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    });
};
