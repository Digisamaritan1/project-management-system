const express = require("express");
const fs = require("fs");
var cors = require('cors');
const path = require('path');
const bodyParser = require("body-parser");
const config =  require('./Config/config.js');
const awsRef =  require('./Config/aws.js');
const logger = require("./Config/loggerConfig");
const packJOSNData = require("./package.json");
const { makeDefaultBrandSettings } = require("./modules/admin/common/controller.js");

const app = express();
app.use(cors({origin: '*'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.raw({limit: '50mb'}));

// Set Maintenance Mode
app.use(express.static(path.join(__dirname, './frontend/dist')));
app.use(express.static(path.join(__dirname, './installation/dist')));
// RUN FRONTEND SERVER
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
});

// ADD DEFAULT BRAND SETTINGS
makeDefaultBrandSettings()
.catch((error) => {
    console.log("makeDefaultBrandSettings: ", error);
});

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

function initializeControllers() {
    const envFile = fs.readFileSync(__dirname + "/.env");
    const envConfig = require('dotenv').parse(envFile);
    envConfig.PORT = Number(envConfig.PORT);
    envConfig.NOOFPRESETCOMPANY = Number(envConfig.NOOFPRESETCOMPANY);
    const tmpStorage = envConfig.STORAGE_TYPE;
    if (!tmpStorage) {
        envConfig.STORAGE_TYPE = "wasabi";
    }
    for (const key in envConfig) {
        process.env[key] = envConfig[key];
        if (key === "APIKEY" || key === "AUTODOMAIN" || key === "PROJECTID" || key === "STORAGEBUCKET" || key === "MESSAGINGSENDERID" || key === "APPID" || key === "MEASUREMENTID") {
            config["FIREBASE_"+key] = envConfig[key];
        } else {
            config[key] = envConfig[key];
            if (key === "WASABI_ACCESS_KEY") {
                awsRef.wasabiAccessKey = envConfig["WASABI_ACCESS_KEY"];
            } else if (key === "WASABI_SECRET_ACCESS_KEY") {
                awsRef.wasabiSecretAccessKey = envConfig["WASABI_SECRET_ACCESS_KEY"];
            } else if (key === "WASABIENDPOINT") {
                awsRef.wasabiEndPoint = envConfig["WASABIENDPOINT"];
            } else if (key === "WASABI_REGION") {
                awsRef.region = envConfig["WASABI_REGION"];
            } else if (key === "IAM_ENDPOINT") {
                awsRef.iamEndPoint = envConfig["IAM_ENDPOINT"];
            } else if (key === "USERPROFILEBUCKET") {
                awsRef.userProfileBucket = envConfig["USERPROFILEBUCKET"];
            } else if (key === "WASABI_USERID") {
                awsRef.wasabiUserId = envConfig["WASABI_USERID"];
            }
        }
    }
    const { startInterval } = require("./middlewares/mongoConnector/helper.js");
    startInterval();
    const { currentDirectory } = require(`./common-storage/common-${process.env.STORAGE_TYPE}.js`);
    const { preCompanySetup, } = require("./modules/company/controller2.js");
    app.get("/api/v1/setPresetCompany/:id", (req, res) => {
        if (req.params && req.params.id && req.params.id === config.PRECOMPANYKEY) {
            preCompanySetup();
            res.send('Preset Company Process Start Successful');
        } else {
            res.send('Unauthorized');
        }
    })
    //IMPORT CUSTOM FILES
    require('./modules/auth/init').init(app);
    require('./modules/notification/init').init(app);
    require('./modules/import_settings/init').init(app);
    require('./modules/tasks/init.js').init(app);
    require('./modules/sprints/init.js').init(app);
    require('./modules/logTime/init.js').init(app);
    require('./modules/milestone/init.js').init(app);
    require('./modules/company/init.js').init(app);
    require('./modules/trackerDownload/init.js').init(app);
    require('./modules/notification/notification-middleware/init').init(app);
    require('./modules/notification/prepare-notification-data/init').init(app);
    require('./modules/projectSetting/init').init(app);
    require('./modules/taskIndex/init').init(app);
    require('./modules/create-project/init.js').init(app);
    require('./modules/notification-count/init').init(app);
    require('./modules/notification/sendEmail/init').init(app);
    require('./modules/trackerUserPermission/init').init(app);
    require('./modules/check-install-step/init').init(app);
    require('./modules/SaasAdmin/init').init(app);
    if(process.env.NODE_ENV === "production") {
        require('./cron.js')
    }
    require('./modules/admin/admin.js').init(app);
    require('./modules/email-template/init').init(app);
    require('./modules/email-notification/init').init(app);
    require(`./modules/storage/${currentDirectory}/init`).init(app);
    require('./modules/ai/init').init(app);
    require('./modules/usersModule/init').init(app);
    require('./modules/Project/init').init(app);
    require('./modules/Teams/init').init(app);
    require('./modules/tours/init').init(app);
    require('./modules/advance-global-filter/init.js').init(app);
    require('./modules/settings/settingCurrency/init').init(app);
    require('./modules/settings/settingNotifications/init').init(app);
    require('./modules/projectRules/init').init(app);
    require('./modules/estimated-time/init').init(app);
    require('./modules/custom-field/init').init(app);
    require('./modules/ProjectTemplates/init').init(app);
    require('./modules/settings/templates/init').init(app);
    require('./modules/settings/ProjectStatusTemplate/init').init(app);
    require('./modules/settings/securityPermissions/init').init(app);
    require('./modules/settings/restrictedExtensions/init').init(app);
    require('./modules/UserId/init').init(app);
    require('./modules/settings/Members/init').init(app);
    require('./modules/apps/init').init(app)
    require('./modules/projectTabs/init').init(app)
    require('./modules/comments/init').init(app);
    require('./modules/TimeSheet/init').init(app);
    require('./modules/MainChats/init').init(app);
    require('./modules/notification/app-notification/init').init(app);
    require('./modules/History/init').init(app);
    require('./modules/settings/Category/init').init(app);
    require('./modules/settings/Roles/init').init(app);
    require('./modules/settings/Designation/init').init(app);
    require('./modules/settings/CompanyUserStatus/init').init(app);
    require('./modules/settings/fileExtensions/init').init(app);
    require('./modules/settings/commonDateFormate/init').init(app);
    require('./modules/settings/taskPriority/init').init(app);
    require('./modules/settings/settingMilestone/init').init(app);
    require('./modules/MediaFiles/init').init(app);
    require("./modules/SubscriptionPlan/init").init(app);
    require("./modules/subscription/init").init(app);
    require("./modules/PlaneFeature/init").init(app);
    require("./modules/Invoice/init").init(app);
    require("./modules/generate-mongo-id/init").init(app);
    require("./modules/UserDashboard/init.js").init(app);
    require("./modules/affiliate/init").init(app);
    require("./modules/oAuth/init.js").init(app);
    require("./modules/githubOAuth/init.js").init(app);
    require("./modules/googleOAuth/init.js").init(app);
}

// FIRES EVENT WHEN THE ENV IS UPDATED
fs.watchFile(__dirname+'/.env', () => {
    initializeControllers();
})

// SET MIDDLEWARE
require('./Config/setMiddleware.js').setMiddlewareWithCV2(app);
require('./Config/setMiddleware.js').setMiddlewareV2(app);

//CONFIGURE ENV FILE
require('dotenv').config();
if (process.env.MONGODB_URL) {
    initializeControllers();
}

if (!process.env.STORAGE_TYPE) {
    process.env.STORAGE_TYPE = "wasabi";
}

require('./modules/check-install-step/init').init(app);

// SWAGGER CONFIGURATION
require('./modules/swaggerAPI/init').init(app, config.APIURL);

// COMMON CODE 
require('./modules/common/init').init(app);

const { initSocket } = require("./socket/socketinit.js");
//FOR CHECK SERVER RUNNING OR NOT
app.get("/health", (req, res) => {
    res.send("Server is running in "+config.NODE_ENV);
});

fs.watch(__dirname + "/modules/Template/", (event_type, file_name) => {
    try {
        delete require.cache[require.resolve(__dirname + "/modules/Template/" + file_name)];;
    } catch (error) {
        console.error("ERROR in remove cache", error);
    }
});

// SERVER LISTEN PORT
const server = app.listen(config.PORT, () => {
    console.log("Server ready on "+config.PORT)
});
initSocket(server);