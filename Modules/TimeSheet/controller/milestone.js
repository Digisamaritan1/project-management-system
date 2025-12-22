
const { SCHEMA_TYPE } = require("../../../Config/schemaType");
const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");


exports.getTimeSheetForMilestone = async(req,res) => {
    try {
        const { startDate,endDate,projectId, } = req.body;

        const query = [
            {
                $match: {
                    $and: [
                        {
                            LogStartTime: 
                            {
                                $lt:new Date(endDate).getTime() / 1000,
                                $gt: new Date(startDate).getTime() / 1000
                            }
                        },
                        {
                            ProjectId: projectId,  
                        }
                    ]
                }
            },
        ];
        const timesheetObj = {
            type: SCHEMA_TYPE.TIMESHEET,
            data: [query]
        };
        const timesheetData = await MongoDbCrudOpration(req.headers['companyid'], timesheetObj, 'aggregate');

        if (!timesheetData) {
            return res.status(404).json({ message: "TimeSheet Data not found" });
        }

        res.status(200).json(timesheetData);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching the TimeSheet Data.", error: error.message });
    }
}