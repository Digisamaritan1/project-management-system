const ctrl = require('./controller');

exports.init = (app) => {
    /**
     * @swagger
    *  components:
    *    schemas:
    *      manageTrackerUsers:
    *        type: object
    *        required:
    *         - DataObj
    *         - CompanyId
    *        properties:
    *         CompanyId: 
    *           type: string
    *           required: true
    *           description: CompanyId.
    *         DataObj: 
    *           type: object
    *           required: true
    *           description: DataObj.
    */
    /**
     * @swagger
     *  /api/v1/manageTrackerUserPermission:
     *    post: 
     *      description: This API is used for Updating Tracker user count in company collection and also update status in company users.
     *      tags: [Plan Permissions APIs]
     *      summary: Manage Tracker Users API
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/manageTrackerUsers'
     *      responses:
     *          "200":
     *              description: status:true/false,message:message
     */
    app.post('/api/v1/manageTrackerUserPermission', ctrl.handleTrackerUserPermission);
}