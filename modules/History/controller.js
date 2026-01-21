// const { dbCollections, } = require('../../Config/collections.js')
const { SCHEMA_TYPE } = require("../../Config/schemaType");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries.js");

exports.getActivityLog = async (req, res) => {
    const { fromProject, projectId, taskId, skip, limit } = req.query; 

    try {
        let queryObj = [
            {
                $match: 
                    fromProject === 'false' ?
                    {
                        $and: [
                            { Type: { $ne: "project" } },
                            { ProjectId: projectId },
                            { TaskId: taskId }
                        ]
                    }  
                    :
                    {
                        $and: [
                            { Type: "project" },
                            { ProjectId: projectId }
                        ]
                    }
            },
            { $sort: { createdAt: -1, _id: 1 } },
            { $skip: parseInt(skip) }, 
            { $limit: parseInt(limit) }
        ];

        const data = {
            type:  SCHEMA_TYPE.HISTORY,
            data: [
                [
                    queryObj
                ]
            ]
        };

        const response = await MongoDbCrudOpration(req.headers['companyid'],data,"aggregate");

        res.status(200).json(
            response
        );
    } catch (error) {
        console.error(`ERROR in getting activity log of ${fromProject ? 'project' : 'task'}`, error);
        res.status(500).json({ message: "An error occurred while fetching the activity log", error: error.message });
    }
};