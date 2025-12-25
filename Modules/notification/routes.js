const ctrl = require('./controller');

exports.init = (app) => {
    /**
     * @swagger
    *  components:
    *    schemas:
    *      insertnotification:
    *        type: object
    *        required:
    *          - uid
    *          - email
    *        properties:
    *         uid:
    *           type: string
    *           required: true
    *           description: The uid of user.
    *         email:
    *           type: string
    *           required: true
    *           description: The email of user.
     */
    /**
     * @swagger
     *  /api/v1/insertnotification:
     *    post: 
     *      description: This API is used for send email verication link.
     *      tags: [Auth APIs]
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/insertnotification'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Send Verification Mail API
     */
    app.post('/api/v1/insertnotification', ctrl.insertnotification);
};