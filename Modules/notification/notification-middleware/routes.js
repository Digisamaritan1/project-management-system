
require("./controllerV2");
const { sendFcmNotificationsHandler } = require("./controllerV2");
const {emailCronHandler}  = require("./cron-controller");
exports.init = (app) => {
    
    /**
    * @swagger
    *  components:
    *    schemas:
    *      email-cron-handler:
    *        type: object
    *        required:
    *          - companyId
    *          - key
    *          - projectId
    *          - message
    *          - userId
    *        properties:
    *         companyId:
    *           type: string
    *           required: false
    *           description: This is the dcoument id of selected company.
    *         key:
    *           type: string
    *           required: false
    *           description: This is the type of notification like project or tasks.
    *         message:
    *           type: string
    *           required: false
    *           description: This is the message for the notification.
    *         projectId:
    *           type: string
    *           required: false
    *           description: This is the project ID of notification.
    *         userId:
    *           type: string
    *           required: false
    *           description: This is the user id of user collections.
    */
      /**
     * @swagger
     *  /api/v2/email-cron-handler:
     *    post: 
     *      description: This API is used to email notification ap per receiver.
     *      tags: [Notifications]
     *      summary: Send Email Notification
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/email-cron-handler'
     *      responses:
     *          "200":
     *              description: status:true/false,message:message
     */

    app.post('/api/v2/email-cron-handler',emailCronHandler);

    /**
 * @swagger
 *  components:
 *    schemas:
 *      send-fcm:
 *        type: object
 *        required:
 *          - userIdArray
 *          - key
 *          - companyId
 *          - message
 *          - type
 *          - senderUserDetail
 *          - actionUrl
 *        properties:
 *          userIdArray:
 *            type: array
 *            items:
 *              type: string
 *            description: Array of user IDs to receive the notification
 *            example: ["user123", "user456"]
 *          key:
 *            type: string
 *            description: Notification key identifier (e.g., "comments_I'm_@mentioned_in")
 *            example: "comments_I'm_@mentioned_in"
 *          companyId:
 *            type: string
 *            description: Company document ID
 *            example: "company123"
 *          message:
 *            type: string
 *            description: Notification message content
 *            example: "You have been mentioned in a comment"
 *          type:
 *            type: string
 *            description: Type of notification (e.g., project, task, comment)
 *            example: "comment"
 *          senderUserDetail:
 *            type: object
 *            description: Details of the user sending the notification
 *            properties:
 *              Employee_Name:
 *                type: string
 *                description: Name of the sender
 *                example: "John Doe"
 *            example: { "Employee_Name": "John Doe" }
 *          actionUrl:
 *            type: string
 *            description: URL path for notification click action
 *            example: "projects/123/tasks/456"
 */

/**
 * @swagger
 *  /api/v1/send-fcm:
 *    post:
 *      description: This API is used to send FCM (Firebase Cloud Messaging) push notifications to eligible users based on their notification settings.
 *      tags: [Notifications]
 *      summary: Send FCM Push Notification
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/send-fcm'
 *      responses:
 *        "200":
 *          description: Notification sent successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *                  message:
 *                    type: string
 *                    example: "Notification sent successfully"
 *                  response:
 *                    type: object
 *                    properties:
 *                      successCount:
 *                        type: integer
 *                        example: 5
 *                      failureCount:
 *                        type: integer
 *                        example: 0
 *        "400":
 *          description: Bad request - validation error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  error:
 *                    type: string
 *                    example: "userIdArray must be a non-empty array"
 *        "500":
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  error:
 *                    type: string
 *                    example: "Failed to send FCM notification"
 */

  app.post('/api/v1/send-fcm',sendFcmNotificationsHandler);

};