const { dbCollections } = require("./Config/collections");
const { MongoDbCrudOpration } = require("./utils/mongo-handler/mongoQueries");

const fp = `${__dirname}/`;
const {writeFile} = require("fs");

function writeData(fileName, data) {
    writeFile(`${fp}/${fileName}.json`, JSON.stringify(data, null, 4), (err) => {
        if(err) throw err;
    })
}

async function getMongoData(cid, query, type) {
    return new Promise((resolve, reject) => {
        try {
            MongoDbCrudOpration(cid, query, type)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => reject(err));
        } catch (err) {
            reject(err);
        }
    })
}

async function batchUpdate(tasksToUpdate, cid,sourceId,categoryId,fieldOptions) {
    return new Promise((resolve, reject) => {
        try {
            // tasks BATCH FUNCTION
            let count = 0;
            let batch = 1;
            const perBatch = 10;
            const next = () => {
                batch++;
                loopFun();
            }

            let results = []
            const loopFun = () => {
                console.log("TOTAL: ", count, "/", tasksToUpdate.length, "==", ((count * 100) / tasksToUpdate.length).toFixed(2));
                if(count >= tasksToUpdate.length) {
                    writeData(`tasksToUpdateSTATUS`, results)
                    resolve(tasksToUpdate)
                    console.log("END");
                    return;
                } else {
                    try {
                        let promises = [];
                        const startIndex = count;
                        const endIndex = count + perBatch;
                        count = endIndex;

                        for (let i = startIndex; i < endIndex; i++) {
                            const data = tasksToUpdate[i];
                            const category = fieldOptions.find((x) => x.label === data?.ProjectCategory) || {};
                            const customFieldDetail = {
                                ...data?.customField || {},
                                [sourceId] : {
                                    fieldValue: data?.ProjectSource,
                                    _id: sourceId
                                },
                                [categoryId] : {
                                    fieldValue: category?.id ? [category.id] : '',
                                    _id: categoryId
                                }
                            }
                            console.log(category,"category");
                            console.log(JSON.stringify(customFieldDetail,null,4),"customFieldDetail");

                            if(data) {
                                promises.push(new Promise((resolve2, reject2) => {
                                    try {
                                        let query = {
                                            type: dbCollections.PROJECTS,
                                            data: [
                                                {
                                                    _id: data._id
                                                },
                                                {
                                                    $set: {
                                                        customField: customFieldDetail
                                                    }
                                                }
                                            ]
                                        };
                                        MongoDbCrudOpration(cid, query, "updateOne")
                                        .then((res) => {
                                            res.query = query;
                                            resolve2(res);
                                        })
                                        .catch((error) => {
                                            reject2(error)
                                        })
                                    } catch (error) {
                                        reject2(error)
                                    }
                                }))
                            }
                        }

                        Promise.allSettled(promises)
                        .then((result) => {
                            result.filter((x) => x.status === "rejected").forEach((x) => {
                                console.log(`UPDATE failed for: ${x.value}`)
                            })
                            results = [...results, ...result]
                            setTimeout(() => {
                                next();
                            }, 200);
                        })
                        .catch((error) => {
                            console.log(`UPDATE failed batch: ${batch} > ${error.message}`);
                            next();
                        })
                    } catch (e) {
                        console.error(`UPDATE failed batch: ${batch}`)
                    }
                }
            }
            loopFun()
        } catch (error) {
            reject(error)
        }
    })
}

async function mainFunction(oldCid, newCid) {
    try {
        let projectQuery = {
            type: dbCollections.PROJECTS,
            data: [
                {
                    deletedStatusKey : {$nin:[1]},
                    ProjectCategory: {$exists : true}
                }
            ]
        }
        let projects = await getMongoData(newCid, projectQuery, "find");
        const option = [ // Dropdown Custom Field Options
            {
              "id": "YJeMX",
              "color": "#34495E",
              "value": "fixed_price",
              "label": "Fixed Price",
              "selected": false
            },
            {
              "id": "lyq03",
              "color": "#34495E",
              "value": "hourly_price",
              "label": "Hourly Price",
              "selected": false
            },
            {
              "id": "I3G29",
              "color": "#34495E",
              "value": "in_house",
              "label": "In House",
              "selected": false
            }
        ]
        await batchUpdate(projects, newCid,"67aaf7b8e77b265ea7a94e13","67aaf2fde77b265ea7a94dfc",option)
    } catch (error) {
        console.log("ERR: ", error);
    }
}

mainFunction("ZoHj8h99fBfNMhw0Dqv9", "67a1d64840659a99bfbe82cc");