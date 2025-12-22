const { dbCollections } = require("./Config/collections");
const { MongoDbCrudOpration } = require("./utils/mongo-handler/mongoQueries");

const fp = `${__dirname}/`;
const {writeFile} = require("fs");

function writeData(fileName, data) {
    writeFile(`${fp}/${fileName}.json`, JSON.stringify(data, null, 4), (err) => {
        if(err) throw err;
    })
}

async function getMongoData(collectionName, query, type) {
    return new Promise((resolve, reject) => {
        try {
            MongoDbCrudOpration(collectionName, query, type)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => reject(err));
        } catch (err) {
            reject(err);
        }
    })
}
function insertUserAuth (uData, cb) {
    try {
        let count = 0;
        let isError = false;
        let errorArray = [];
        const countFunction = (row) => {
            if (count >= uData.length) {
                if (isError) {
                    cb({
                        status: false,
                        error: `userAuth Error: ${JSON.stringify(errorArray)}`
                    });
                    return;
                }
                cb({
                    status: true
                })
                return;
            }

            let userAuthObject = {
                type: dbCollections.USER_AUTH,
                data: [{
                    _id: (row._id).toString()
                }, {
                    $set: {
                        _id: (row._id).toString(),
                        email: row.Employee_Email
                    }
                }, {
                    upsert: true
                }]
            }
            MongoDbCrudOpration(dbCollections.GLOBAL, userAuthObject, "updateOne")
            .then((res) => {
                console.log("Record Update: " + (row._id).toString());
                count += 1;
                countFunction(uData[count]);
            })
            .catch((err) => {
                console.log("Error Record Update: " + (row._id).toString());
                errorArray.push({
                    _id: (row._id).toString(),
                    error: err
                });
                isError = true;
                count += 1;
                countFunction(uData[count]);
            });

        };
        countFunction(uData[count]);
    } catch (error) {
        cb({
            status: false,
            error: error.message || error
        });
    }
}


async function mainFunction () {
    try {
        let userQuery = {
            type: dbCollections.USERS,
            data: [{}, {Employee_Email: true}]
        }
        const userData = await getMongoData(dbCollections.GLOBAL, userQuery, "find")
        if (userData && userData.length) {
            insertUserAuth(userData, (data) => {
                if (data.status) {
                    console.log("All userAuth insert done")
                } else {
                    console.log("Error: " + data.error);
                }
            })
        } else {
            console.log("No User Found");
        }
        console.log("userData", userData);
    } catch (error) {
        console.log("ERR: ", error);
    }
}

mainFunction()