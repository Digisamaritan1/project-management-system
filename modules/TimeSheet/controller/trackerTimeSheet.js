
const { SCHEMA_TYPE } = require("../../../Config/schemaType");
const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");


exports.getTrackerTimeSheet = async(req,res) => {
    try {
        const { selectedFilter, userArray, isEveryOne,start, end } = req.body;   
        let timeQuery =  {
            LogEndTime: {
                $gte: start,
            },
            LogStartTime: {
                $lte: end
            },
            logAddType: 1
        };
        let filterProject = selectedFilter?.filter((x) => { return x.type == "Projects" });
        let teamsIds = selectedFilter?.filter((x) => { return x.type == 'Teams' });
        let filterIds = selectedFilter?.filter((x) => { return x.type == 'Users' });

        if (userArray.length) {
            timeQuery.Loggeduser = { $in: userArray };
        }

        if (filterProject.length) {
            let projectArray = filterProject.map(element => element.id);
            timeQuery.ProjectId = { $in: projectArray };
        }

        if (isEveryOne && filterIds.length === 0 && teamsIds.length === 0) {
            delete timeQuery.Loggeduser;
        }

        const query = [
            {
                $match: {
                    $and: [timeQuery]
                }
            },
            {
                $group: {
                    _id: {
                        userId: "$Loggeduser"
                    },
                    data: {
                        $push: {
                            ProjectId: "$ProjectId",
                            TicketID: "$TicketID",
                            Loggeduser: "$Loggeduser",
                            trackShots: "$trackShots",
                            LogDescription: "$LogDescription",
                            logAddType: "$logAddType"
                        }
                    }
                }
            }
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
        res.status(500).json({ message: "An error occurred while fetching the Tarcker TimeSheet Data.", error: error.message });
    }
}