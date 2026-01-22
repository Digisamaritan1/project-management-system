
const { SCHEMA_TYPE } = require("../../../Config/schemaType");
const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");


exports.getTimeLogTimeSheet = async(req,res) => {
    try {
        const { taskIds, startDate,endDate,usersFilterIDsArray, facet, addFields, group, sort } = req.body;
        let timeQuery = {TicketID: {$in: taskIds.map(task => task.TicketID)}};

        if(startDate && endDate){
            timeQuery.LogStartTime = {
                $gte: new Date(startDate).getTime() / 1000,
                $lte: new Date(endDate).getTime() / 1000
            }
        }

        if(usersFilterIDsArray && usersFilterIDsArray.length){
            timeQuery.Loggeduser = {
                $in: usersFilterIDsArray
            }
        }

        const query = [
            {
                $match: {
                    $and: [timeQuery]
                }
            },
        ];

        if(sort){
            query.push(sort);
        }

        if(group){
            query.push(group);
        }

        if(addFields){
            query.push(addFields);
        }

        if(facet){
            query.push(facet);
        }
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