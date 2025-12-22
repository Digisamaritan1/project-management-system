
const { SCHEMA_TYPE } = require("../../../Config/schemaType");
const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");


exports.getlogDetailTimeSheet = async(req,res) => {
    try {
        const { taskId, startDate,endDate,userArray, projectId, } = req.body;

        let timeQuery = {
            LogStartTime: {
                $gte: startDate,
                $lte: endDate,
            }
        }

        if (userArray && userArray.length > 0) {
            timeQuery.Loggeduser = { $in: userArray };
        }

        if (projectId && projectId !== '') {
            timeQuery.ProjectId = { $in: Array.isArray(projectId) ? projectId : [projectId] };
        }

        if (taskId && taskId !== '') {
            timeQuery.TicketID = taskId;
        }

        const query = [
            {
                $match: {
                    $and: [timeQuery]
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