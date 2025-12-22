const { SCHEMA_TYPE } = require("../../../Config/schemaType");
const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");

/**
 * Builds cumulative data from raw input, handling either a numeric range or a predefined key list.
 * @param {Array} rawData - Array of objects with `name` and `value` keys.
 * @param {number|Array} startOrKeys - Start index (number) or array of keys (e.g., month names).
 * @param {number} [end] - End index (number), only used if startOrKeys is a number.
 * @returns {Array} Cumulative data array with objects { name, value }.
 */
const buildCumulativeData = (rawData, startOrKeys, end) => {
    const dataMap = new Map();
    rawData.forEach(item => {
        dataMap.set(item.name, item.value || 0);
    });

    let cumulative = 0;
    const cumulativeData = [];

    if (Array.isArray(startOrKeys)) {
        // Case: Predefined list of keys like month names
        startOrKeys.forEach(key => {
            const value = dataMap.get(key) || 0;
            cumulative += value;
            cumulativeData.push({ name: key, value: cumulative });
        });
    } else {
        // Case: Numeric range
        for (let i = startOrKeys + 1; i <= end + 1; i++) {
            const key = i.toString();
            const value = dataMap.get(key) || 0;
            cumulative += value;
            cumulativeData.push({ name: key, value: cumulative });
        }
    }

    return cumulativeData;
};

/**
 * This endpoint is used to get total number sum of estimated and logged hours details based on the project id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getTimeForcastingData = async (req, res) => {
    try {
        const { pid } = req.body;
        const companyId = req.headers['companyid'];

        const matchStage = {
            $match: { ProjectId: pid }
        };

        // Estimated Time Pipeline
        const estimatedTimePipeline = [
            matchStage,
            {
                $group: {
                    _id: null,
                    totalEstimatedTime: { $sum: "$EstimatedTime" }
                }
            }
        ];

        // Logged Time Pipeline
        const loggedTimePipeline = [
            matchStage,
            {
                $group: {
                    _id: null,
                    totalLoggedTime: { $sum: "$LogTimeDuration" }
                }
            }
        ];

        // Latest Logged Date Pipeline
        const latestLoggedDatePipeline = [
            matchStage,
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
                $project: {
                    _id: 0,
                    lastLoggedDate: "$createdAt"
                }
            }
        ];

        // Run both aggregations in parallel
        const [estimatedResponse, loggedResponse, latestLogDateResponse] = await Promise.all([
            MongoDbCrudOpration(companyId,
                {
                    type: SCHEMA_TYPE.ESTIMATES_TIME,
                    data: [estimatedTimePipeline]
                }, 'aggregate'),

            MongoDbCrudOpration(companyId,
                {
                    type: SCHEMA_TYPE.TIMESHEET,
                    data: [loggedTimePipeline]
                }, 'aggregate'),

            MongoDbCrudOpration(companyId,
                {
                    type: SCHEMA_TYPE.TIMESHEET,
                    data: [latestLoggedDatePipeline]
                }, 'aggregate')
        ]);

        const result = {
            totalEstimatedTime: estimatedResponse[0]?.totalEstimatedTime || 0,
            totalLoggedTime: loggedResponse[0]?.totalLoggedTime || 0,
            lastLoggedDate: latestLogDateResponse[0]?.lastLoggedDate || null,
        };

        return res.status(200).json({ status: true, data: result });

    } catch (error) {
        return res.status(500).json({
            message: "An error in getTimeForcastingData hook",
            error: error 
        });
    }
}

/**
 * This endpoint is used to generate data series for month and project specific which is render in chart
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getTimeSeriesByMonth = async (req, res) => {
    try {
        const { pid, monthNumber, year } = req.body;

        if (!pid || !monthNumber || !year) {
            return res.status(400).json({
                status: false,
                message: "pid, monthNumber, and year are required",
            });
        }

        const numMonthNumber = parseInt(monthNumber);
        const numYear = parseInt(year);
        const daysInMonth = new Date(numYear, numMonthNumber, 0).getDate();

        // === Log Date Range (Dynamic) ===
        const logStartDate = new Date(numYear, numMonthNumber - 1, 1, 0, 0, 0);
        const logEndDate = new Date(numYear, numMonthNumber - 1, daysInMonth, 23, 59, 59, 999);
        const logStartUnix = Math.floor(logStartDate.getTime() / 1000);
        const logEndUnix = Math.floor(logEndDate.getTime() / 1000);

        // === Estimated Time Aggregation ===
        const estimatePipeline = [
            {
                $addFields: {
                    localDateParts: {
                        $dateToParts: {
                            date: "$Date",
                            timezone: "Asia/Kolkata"
                        }
                    }
                }
            },
            {
                $match: {
                    ProjectId: pid,
                    "localDateParts.year": numYear,
                    "localDateParts.month": numMonthNumber
                }
            },
            {
                $group: {
                    _id: "$localDateParts.day",
                    value: { $sum: "$EstimatedTime" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: { $toString: "$_id" },
                    value: {
                        $add: [
                            { $toDouble: { $floor: { $divide: ["$value", 60] } } },
                            {
                                $divide: [
                                    { $mod: ["$value", 60] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { name: 1 } }
        ];

        const estimateQuery = {
            type: SCHEMA_TYPE.ESTIMATES_TIME,
            data: [estimatePipeline]
        };

        const estimatedDataRaw = await MongoDbCrudOpration(req.headers['companyid'], estimateQuery, 'aggregate');

        // === Logged Time Aggregation ===
        const loggedPipeline = [
            {
                $match: {
                    ProjectId: pid,
                    LogStartTime: { $gte: logStartUnix, $lte: logEndUnix }
                }
            },
            {
                $addFields: {
                    parsedStartTime: { $toDate: { $multiply: ["$LogStartTime", 1000] } }
                }
            },
            {
                $addFields: {
                    localResolvedParts: {
                        $dateToParts: {
                            date: "$parsedStartTime",
                            timezone: "Asia/Kolkata"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$localResolvedParts.day",
                    value: { $sum: "$LogTimeDuration" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: { $toString: "$_id" },
                    value: {
                        $add: [
                            { $toDouble: { $floor: { $divide: ["$value", 60] } } },
                            {
                                $divide: [
                                    { $mod: ["$value", 60] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { name: 1 } }
        ];

        const loggedQuery = {
            type: SCHEMA_TYPE.TIMESHEET,
            data: [loggedPipeline]
        };

        const loggedDataRaw = await MongoDbCrudOpration(req.headers['companyid'], loggedQuery, 'aggregate');

        // Calculate the maximum day from estimated and logged data
        const maxEstimatedDay = estimatedDataRaw.reduce((max, item) => {
            const day = parseInt(item.name, 10);
            return day > max ? day : max;
        }, 0);

        const maxLoggedDay = loggedDataRaw.reduce((max, item) => {
            const day = parseInt(item.name, 10);
            return day > max ? day : max;
        }, 0);

        const totalDays = Math.min(daysInMonth, Math.max(maxEstimatedDay, maxLoggedDay, 0) || daysInMonth);

        // Build cumulative estimatedData
        const estimatedData = buildCumulativeData(estimatedDataRaw, 0, totalDays - 1);

        // Build cumulative loggedData
        const loggedData = buildCumulativeData(loggedDataRaw, 0, totalDays - 1);

        // Send the response
        return res.status(200).json({
            status: true,
            data: {
                estimatedData,
                loggedData
            }
        });

    } catch (error) {
        console.error("Error in getTimeSeriesByMonth:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while processing time series data",
            error: error.message || error
        });
    }
}

/**
 * This endpoint is used to generate data series for year and project specific which is render in chart
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getTimeSeriesByYear = async (req, res) => {
    try {
        const { pid, year } = req.body;

        if (!pid || !year) {
            return res.status(400).json({
                status: false,
                message: "pid and year are required",
            });
        }

        const numYear = parseInt(year);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // === Estimated Time Aggregation ===
        const estimatePipeline = [
            {
                $addFields: {
                    localDateParts: {
                        $dateToParts: {
                            date: "$Date",
                            timezone: "Asia/Kolkata"
                        }
                    }
                }
            },
            {
                $match: {
                    ProjectId: pid,
                    "localDateParts.year": numYear
                }
            },
            {
                $group: {
                    _id: "$localDateParts.month",
                    value: { $sum: "$EstimatedTime" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: {
                        $arrayElemAt: [monthNames, { $subtract: ["$_id", 1] }]
                    },
                    value: {
                        $add: [
                            { $toDouble: { $floor: { $divide: ["$value", 60] } } },
                            {
                                $divide: [
                                    { $mod: ["$value", 60] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { name: 1 } }
        ];

        const estimateQuery = {
            type: SCHEMA_TYPE.ESTIMATES_TIME,
            data: [estimatePipeline]
        };

        const estimatedDataRaw = await MongoDbCrudOpration(req.headers['companyid'], estimateQuery, 'aggregate');

        // === Logged Time Aggregation ===
        const loggedPipeline = [
            {
                $match: {
                    ProjectId: pid,
                    LogStartTime: { $exists: true, $ne: null }
                }
            },
            {
                $addFields: {
                    parsedStartTime: {
                        $convert: {
                            input: { $multiply: ["$LogStartTime", 1000] },
                            to: "date",
                            onError: null,
                            onNull: null
                        }
                    }
                }
            },
            {
                $match: {
                    parsedStartTime: { $ne: null }
                }
            },
            {
                $addFields: {
                    localDateParts: {
                        $dateToParts: {
                            date: "$parsedStartTime",
                            timezone: "Asia/Kolkata"
                        }
                    }
                }
            },
            {
                $match: {
                    "localDateParts.year": numYear
                }
            },
            {
                $group: {
                    _id: "$localDateParts.month",
                    value: { $sum: "$LogTimeDuration" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: {
                        $arrayElemAt: [monthNames, { $subtract: ["$_id", 1] }]
                    },
                    value: {
                        $add: [
                            { $toDouble: { $floor: { $divide: ["$value", 60] } } },
                            {
                                $divide: [
                                    { $mod: ["$value", 60] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { name: 1 } }
        ];

        const loggedQuery = {
            type: SCHEMA_TYPE.TIMESHEET,
            data: [loggedPipeline]
        };

        const loggedDataRaw = await MongoDbCrudOpration(req.headers['companyid'], loggedQuery, 'aggregate');

        // Build cumulative estimatedData
        const estimatedData = buildCumulativeData(estimatedDataRaw, monthNames);

        // Build cumulative loggedData
        const loggedData = buildCumulativeData(loggedDataRaw, monthNames);

        return res.status(200).json({
            status: true,
            data: {
                estimatedData,
                loggedData
            }
        });

    } catch (error) {
        console.error("Error in getTimeSeriesByYear:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while processing yearly time series data",
            error
        });
    }
}

/**
 * This endpoint is used to generate data series for quarterly and project specific which is render in chart
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getTimeSeriesByQuarter = async (req, res) => {
    try {
        const { pid, quarterNumber, year } = req.body;

        if (!pid || !quarterNumber || !year) {
            return res.status(400).json({
                status: false,
                message: "pid, quarterNumber, and year are required",
            });
        }

        const numQuarter = parseInt(quarterNumber);
        const numYear = parseInt(year);

        if (numQuarter < 1 || numQuarter > 4) {
            return res.status(400).json({
                status: false,
                message: "quarterNumber must be between 1 and 4",
            });
        }

        const startMonth = (numQuarter - 1) * 3;
        const endMonth = startMonth + 2;

        const startDate = new Date(numYear, startMonth, 1, 0, 0, 0);
        const endDate = new Date(numYear, endMonth + 1, 0, 23, 59, 59, 999);

        const logStartUnix = Math.floor(startDate.getTime() / 1000);
        const logEndUnix = Math.floor(endDate.getTime() / 1000);

        const MS_IN_A_WEEK = 7 * 24 * 60 * 60 * 1000;

        // === Estimate Aggregation by Week ===
        const estimatePipeline = [
            {
                $match: {
                    ProjectId: pid,
                    Date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $addFields: {
                    weekIndex: {
                        $ceil: {
                            $divide: [
                                { $subtract: [{ $toLong: "$Date" }, startDate.getTime()] },
                                MS_IN_A_WEEK
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$weekIndex",
                    value: { $sum: "$EstimatedTime" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: { $concat: ["Week ", { $toString: "$_id" }] },
                    value: {
                        $add: [
                            { $toDouble: { $floor: { $divide: ["$value", 60] } } },
                            {
                                $divide: [
                                    { $mod: ["$value", 60] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { name: 1 } }
        ];

        const estimateQuery = {
            type: SCHEMA_TYPE.ESTIMATES_TIME,
            data: [estimatePipeline]
        };

        const estimatedDataRaw = await MongoDbCrudOpration(req.headers['companyid'], estimateQuery, 'aggregate');

        // === Logged Aggregation by Week ===
        const loggedPipeline = [
            {
                $match: {
                    ProjectId: pid,
                    LogStartTime: { $gte: logStartUnix, $lte: logEndUnix }
                }
            },
            {
                $addFields: {
                    parsedStartTime: { $toDate: { $multiply: ["$LogStartTime", 1000] } }
                }
            },
            {
                $addFields: {
                    weekIndex: {
                        $ceil: {
                            $divide: [
                                { $subtract: [{ $toLong: "$parsedStartTime" }, startDate.getTime()] },
                                MS_IN_A_WEEK
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$weekIndex",
                    value: { $sum: "$LogTimeDuration" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: { $concat: ["Week ", { $toString: "$_id" }] },
                    value: {
                        $add: [
                            { $toDouble: { $floor: { $divide: ["$value", 60] } } },
                            {
                                $divide: [
                                    { $mod: ["$value", 60] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { name: 1 } }
        ];

        const loggedQuery = {
            type: SCHEMA_TYPE.TIMESHEET,
            data: [loggedPipeline]
        };

        const loggedDataRaw = await MongoDbCrudOpration(req.headers['companyid'], loggedQuery, 'aggregate');

        // === Pad data to full 13 weeks ===
        const buildWeeklyData = (rawData) => {
            const result = [];
            let cumulativeSum = 0;

            for (let i = 1; i <= 13; i++) {
                const weekLabel = `Week ${i}`;
                const found = rawData.find(item => item.name === weekLabel);
                const value = found ? found.value : 0;
                cumulativeSum += value;
                result.push({ name: weekLabel, value: cumulativeSum });
            }

            return result;
        };

        const estimatedData = buildWeeklyData(estimatedDataRaw);
        const loggedData = buildWeeklyData(loggedDataRaw);

        return res.status(200).json({
            status: true,
            data: {
                estimatedData,
                loggedData
            }
        });

    } catch (error) {
        console.error("Error in getTimeSeriesByQuarter:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while processing quarterly time series data",
            error: error.message || error
        });
    }
};