let schema = {
    "name": "",
    "fields": [
        {
            "name":"TicketID",
            "type": "string",
            "facet": false
        },
        {
            "name":"ProjectId",
            "type": "string",
            "facet": false
        },
        {
            "name":"LogStartTime",
            "type": "int32",
            "facet": false
        },
        {
            "name":"startTimeTracker",
            "type": "int32",
            "facet": false
        },
        {
            "name":"LogEndTime",
            "type": "int32",
            "facet": false
        },
        {
            "name":"LogTimeDuration",
            "type": "int32",
            "facet": false
        },
        {
            "name":"LogTimes",
            "type": "auto",
            "facet": false
        },
        {
            "name":"logTimeDate",
            "type": "string",
            "facet": false
        },
        {
            "name":"logTimeDateNumbers",
            "type": "float",
            "facet": true
        },
        {
            "name":"LogDescription",
            "type": "string",
            "facet": false
        },
        {
            "name":"Loggeduser",
            "type": "string",
            "facet": false
        },
        {
            "name":"LoggedUserRole",
            "type": "string",
            "facet": false
        },
        {
            "name":"logTimeYear",
            "type": "string",
            "facet": false
        },
        {
            "name":"logTimeMonth",
            "type": "string",
            "facet": false
        },
        {
            "name":"LogTimes_EndTime",
            "type": "string",
            "facet": false
        },
        {
            "name":"LogTimes_StartTime",
            "type": "string",
            "facet": false
        },
        {
            "name":"CreatedAt",
            "type": "string",
            "facet": false
        },
        {
            "name":"UpdatedAt",
            "type": "string",
            "facet": false
        },
        {
            "name":"id",
            "type": "string",
            "facet": false
        }
    ],
};

module.exports = {
    timesheetSchema: schema
}