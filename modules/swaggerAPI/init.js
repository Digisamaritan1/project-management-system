let swaggerJsdoc = require("swagger-jsdoc");
let swaggerUi = require("swagger-ui-express");


/**
 * Swagger API document configuration
 * @param {*} app 
 */
exports.init = (app, apiUrl) => {
    const swaggerOptions = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "AlianHub APIs",
                version: "v1"
            },
            servers: [
                {
                    url: apiUrl,
                },
            ],
        },
        apis: [
            "./modules/auth/routes.js",
            "./modules/auth/routes2.js",
            "./modules/notification/routes.js",
            "./modules/import_settings1/routes.js",
            "./modules/remove-sprint-operations/routes.js",
            "./modules/log-time/routes.js",
            "./modules/milestone/routes.js",
            "./modules/wasabi/routes.js",
            "./modules/company/routes.js",
            './modules/notification/prepare-notification-data/routes.js',
            "./modules/notification/notification-middleware/routes.js",
            "./modules/projectSetting/routes.js",
            "./modules/trackerDownload/routes.js",
            "./modules/taskIndex/routes.js",
            "./modules/create-project/routes.js",
            "./modules/notification-count/routes.js",
            "./modules/trackerUserPermission/routes.js",
            "./modules/SaasAdmin/routes.js",
        ]
    };

    const specs = swaggerJsdoc(swaggerOptions);
    app.use(
        "/apidocs",
        swaggerUi.serve,
        swaggerUi.setup(specs)
    );
};
