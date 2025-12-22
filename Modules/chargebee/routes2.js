const ctrl2 = require('./controller2');
const ctrl = require('./controller');
const subscriptionCtrl = require('./subscription');

exports.init = (app) => {


    /**
    * @swagger
    *  components:
    *    schemas:
    *      updateSubscriptionChargebeeEstimate:
    *        type: object
    *        required:
    *          - subscriptionId
    *          - isPlanChange
    *          - isPeriodChange
    *          - addOnId
    *          - addOnQuantity
    *          - newpriceId
    *          - newAddOnId
    *        properties:
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The chargbee id of subscription.
    *         isPlanChange:
    *           type: boolean
    *           required: true
    *           description: True if plan is change.
    *         isPeriodChange:
    *           type: boolean
    *           required: false
    *           description: True if period change.
    *         planId:
    *           type: string
    *           required: false
    *           description: The id of new plan.
    */           
    /**
     * @swagger
     *  /api/v1/updateSubscriptionPaymentEstimate:
     *    post: 
     *      description: This API is used to update subscription estimate in chargbee.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Get Estimate for Update Subscription
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/updateSubscriptionChargebeeEstimate'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Update Subscription Estimate API
     */
    app.post('/api/v1/updateSubscriptionPaymentEstimate', ctrl2.updateSubscriptionChargebeeEstimate);

      /**
    * @swagger
    *  components:
    *    schemas:
    *      updateSubscriptionChargebee:
    *        type: object
    *        required:
    *          - subscriptionId
    *          - updateObj
    *        properties:
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The chargbee id of subscription.
    *         updateObj:
    *           type: object
    *           required: true
    *           description: chargbee update object.
    */           
    /**
     * @swagger
     *  /api/v1/updateSubscriptionChargebee:
     *    post: 
     *      description: This API is used to update subscription in chargbee.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Update Subscription
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/updateSubscriptionChargebee'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Update Subscription Estimate API
     */
    app.post('/api/v1/updateSubscriptionPayment', ctrl2.updateSubscriptionChargebee);

    /**
    * @swagger
    *  components:
    *    schemas:
    *      cancleSubscriptionChargebee:
    *        type: object
    *        required:
    *          - subscriptionId
    *        properties:
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The chargbee id of subscription.
    */           
    /**
     * @swagger
     *  /api/v1/cancleSubscriptionChargebee:
     *    post: 
     *      description: This API is used to cancel subscription in chargbee.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Cancel subscription in Chargebee
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/cancleSubscriptionChargebee'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Cancle Subscription Chargebee Subscription API
     */
    app.post('/api/v1/cancleSubscriptionPayment', ctrl2.cancleSubscriptionChargebee);



    /**
    * @swagger
    *  components:
    *    schemas:
    *      addAndRemoveUserInChargebeeSubscriptionEstimate:
    *        type: object
    *        required:
    *          - subscriptionId
    *          - addonId
    *          - isAddOnAdd
    *          - addOnQuantity
    *        properties:
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The chargbee id of subscription.
    *         addonId:
    *           type: string
    *           required: true
    *           description: The chargbee id of user addon.
    *         isAddOnAdd:
    *           type: boolean
    *           required: true
    *           description: True if addon is add.
    *         addOnQuantity:
    *           type: number
    *           required: true
    *           description: Number of quantity.
    */           
    /**
     * @swagger
     *  /api/v1/addAndRemoveUserInPaymentSubscriptionEstimate:
     *    post: 
     *      description: This API is used to Get Add and Remove User in Chargbee Subscription Estimate.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Change User Quantity in subscription Estimate
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/addAndRemoveUserInChargebeeSubscription'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Add and Remove User in Chargebee Subscription
     */
    app.post('/api/v1/addAndRemoveUserInPaymentSubscriptionEstimate', ctrl2.addAndRemoveUserInChargebeeSubscriptionEstimate);


       /**
    * @swagger
    *  components:
    *    schemas:
    *      addAndRemoveUserInChargebeeSubscription:
    *        type: object
    *        required:
    *          - subscriptionId
    *          - updateObj
    *        properties:
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The chargbee id of subscription.
    *         updateObj:
    *           type: object
    *           required: true
    *           description: chargbee update object.
    */           
    /**
     * @swagger
     *  /api/v1/addAndRemoveUserInChargebeeSubscription:
     *    post: 
     *      description: This API is used to Add and Remove User in Chargbee Subscription.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Change User Quantity in subscription
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/updateSubscriptionChargebee'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Update Subscription Estimate API
     */
    app.post('/api/v1/addAndRemoveUserInPaymentSubscription', ctrl2.addAndRemoveUserInChargebeeSubscription);

    /**
    * @swagger
    *  components:
    *    schemas:
    *      removeScheduleCancellationChargebee:
    *        type: object
    *        required:
    *          - subscriptionId
    *        properties:
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The chargbee id of subscription.
    */           
    /**
     * @swagger
     *  /api/v1/removeScheduleCancellationChargebee:
     *    post: 
     *      description: This API is used to update subscription in chargbee.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Update subscription in Chargebee
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/removeScheduleCancellationChargebee'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Remove Schedule Cancellation Chargebee Subscription API
     */
    app.post('/api/v2/removeScheduleCancellationChargebee', ctrl2.removeScheduleCancellationChargebee);

    /**
     * webhook of chargebee
     */
    app.post('/api/v2/webhook2', ctrl2.webhook2);

    /**
    * @swagger
    *  components:
    *    schemas:
    *      updateCustomerBilling:
    *        type: object
    *        required:
    *          - customerId
    *          - billingDetails
    *          - vat_number
    *        properties:
    *         customerId:
    *           type: string
    *           required: true
    *           description: The customer id.
    *         billingDetails:
    *           type: object
    *           required: true
    *           description: The billingDetails object to update.
    *         vat_number:
    *           type: string
    *           required: false
    *           description: The vat number if it needs to be updated.
    */           
    /**
     * @swagger
     *  /api/v2/updateCustomerBilling:
     *    post: 
     *      description: This API is used to update customer billing.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Update billing Address of a customer
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/updateCustomerBilling'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Update Customer Billing  API
     */
    app.post('/api/v2/updateCustomerBilling', ctrl2.updateCustomerBilling);


    /**
    * @swagger
    *  components:
    *    schemas:
    *      createSubscriptionChargebee:
    *        type: object
    *        required:
    *          - customerId
    *          - companyId
    *          - planId
    *          - payment_source_id
    *          - subscription_items
    *        properties:
    *         customerId:
    *           type: string
    *           required: true
    *           description: The customer id.
    *         companyId:
    *           type: string
    *           required: true
    *           description: The id of company.
    *         subscription_items:
    *           type: array
    *           required: true
    *           description: Array which containg line_items for subscription.
    *         planId:
    *           type: string
    *           required: false
    *           description: Id of plan.
    *         payment_source_id:
    *           type: string
    *           required: false
    *           description: Id of payment_source_id from which payment need to deduct.
    */           
    /**
     * @swagger
     *  /api/v2/createSubscriptionChargebee:
     *    post: 
     *      description: This API is used for create subscription in chargbee.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Create a subscription
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/createSubscriptionChargebee'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Create Subscription Chargbee
     */
    app.post('/api/v2/createSubscriptionChargebee',ctrl2.createSubscriptionChargebee);


    /**
    * @swagger
    *  components:
    *    schemas:
    *      getCardDetails:
    *        type: object
    *        required:
    *          - customerId
    *        properties:
    *         customerId:
    *           type: string
    *           required: true
    *           description: The customer id of chargbee.
    */           
    /**
     * @swagger
     *  /api/v2/getCardDetails:
     *    post: 
     *      description: This API is used for get card details of customer.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Get Customer Card Details
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/getCardDetails'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Get Customer Card Details
     */
    app.post('/api/v2/getCardDetails',ctrl2.getCardDetails)

    /**
    * @swagger
    *  components:
    *    schemas:
    *      createPaymnetSourceChargebee:
    *        type: object
    *        required:
    *          - customerId
    *          - tokenId
    *        properties:
    *         customerId:
    *           type: string
    *           required: true
    *           description: The customer id of chargbee.
    *         tokenId:
    *           type: string
    *           required: true
    *           description: The token id for create paymentsource.
    */           
    /**
     * @swagger
     *  /api/v2/createPaymnetSourceChargebee:
     *    post: 
     *      description: This API is used for create Create a payment source.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Create a payment source chargbee
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/createPaymnetSourceChargebee'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Create a payment source chargbee
     */
    app.post('/api/v2/createPaymnetSourceChargebee',ctrl2.createPaymnetSourceChargebee)

       /**
    * @swagger
    *  components:
    *    schemas:
    *      updateCardForSubscription:
    *        type: object
    *        required:
    *          - paymentSourceId
    *          - subscriptionId
    *        properties:
    *         paymentSourceId:
    *           type: string
    *           required: true
    *           description: The id of new card which need to be update.
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The id of subscription in which card need to be change.
    */           
    /**
     * @swagger
     *  /api/v1/updateCardForSubscription:
     *    post: 
     *      description: This API is used for update card in subscription.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Update card in subscription
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/updateCardForSubscription'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Update card in subscription
     */
    app.post('/api/v1/updateCardForSubscription',ctrl2.updateCardForSubscription)

    /**
    * @swagger
    *  components:
    *    schemas:
    *      getSubscription:
    *        type: object
    *        required:
    *          - subscriptionId
    *        properties:
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The id of subscription in which card need to be change.
    */
    /**
     * @swagger
     *  /api/v1/getSubscription:
     *    post: 
     *      description: This API is used for update card in subscription.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Update card in subscription
     *      requestParams:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/getSubscription'
     *      responses:
     *          "200":
     *              description: subscription data
     */

    /**
     * GET subscription
     */
    app.get('/api/v1/getSubscription/:sid',ctrl2.getSubscriptionDetails)


      /**
    * @swagger
    *  components:
    *    schemas:
    *      getInvoiceAndCreditNotes:
    *        type: object
    *        required:
    *          - userId
    *          - subscriptionId
    *        properties:
    *         userId:
    *           type: string
    *           required: true
    *           description: The id of user.
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The id of subscription.
    */           
    /**
     * @swagger
     *  /api/v1/getInvoiceAndCreditNotes:
     *    post: 
     *      description: This API is used for get invoice and creditnote array.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Get Invoice and Credit Note
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/getInvoiceAndCreditNotes'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message,transectionData:if status is true then array contains data of invoice and creditnote
     */

    /**
     * Get Invoice and Credit Note
     */
    app.post('/api/v1/getInvoiceAndCreditNotes',ctrl2.getInvoiceAndCreditNotes)
    
    app.post('/api/v1/admin/getInvoiceAndCreditNotes',ctrl2.getInvoiceAndCreditNotes)
  


    /**
    * @swagger
    *  components:
    *    schemas:
    *      checkSubscriptionSchedule:
    *        type: object
    *        required:
    *          - subscriptionId
    *        properties:
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The customer id of chargbee.
    */           
    /**
     * @swagger
     *  /api/v2/checkSubscriptionSchedule:
     *    post: 
     *      description: This API is used for check if subscription has schedule changes.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Check Subscription Schedule Changees
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/checkSubscriptionSchedule'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Check Subscription Schedule
     */
    app.post('/api/v1/checkSubscriptionSchedule',ctrl2.checkSubscriptionSchedule);



     /**
    * @swagger
    *  components:
    *    schemas:
    *      removeSubscriptionScheduledChanges:
    *        type: object
    *        required:
    *          - subscriptionId
    *        properties:
    *         subscriptionId:
    *           type: string
    *           required: true
    *           description: The customer id of chargbee.
    */           
    /**
     * @swagger
     *  /api/v2/removeSubscriptionScheduledChanges:
     *    post: 
     *      description: This API is used for Remove subscription has schedule changes.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Remove Subscription Schedule Changees
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/removeSubscriptionScheduledChanges'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Check Subscription Schedule
     */
    app.post('/api/v1/removeSubscriptionScheduledChanges',ctrl2.removeSubscriptionScheduledChanges);



     /**
    * @swagger
    *  components:
    *    schemas:
    *      payPendingInvoice:
    *        type: object
    *        required:
    *          - invoiceId
    *          - paymentSourceId
    *        properties:
    *         customerId:
    *           type: string
    *           required: true
    *           description: The id of invoice.
    *         paymentSourceId:
    *           type: string
    *           required: true
    *           description: The id of payment resource object.
    */           
    /**
     * @swagger
     *  /api/v1/payPendingInvoice:
     *    post: 
     *      description: This API is used to make an payment for pending invoice.
     *      tags: [Payment Chargeebee APIs]
     *      summary: Invoive Payment
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/payPendingInvoice'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Update Customer Billing  API
     */
    app.post('/api/v1/payPendingInvoice', ctrl2.payPendingInvoice);

    app.post('/api/v1/getInvoiceAndCreditNoteURL', ctrl2.getInvoiceAndCreditNoteURL);
    app.post('/api/v2/addDefaultSubscriptionFun', ctrl2.addDefaultSubscriptionRequestFun);

    app.post('/api/v1/createPaymentPlan', ctrl.createPaymentPlan);
    app.post('/api/v1/editPaymentPlan', ctrl.editPaymentPlan);
    app.post('/api/v1/planStatusChange', ctrl.planStatusChange);

    app.get('/api/v1/getSubscriptionPaymentResource/:id', subscriptionCtrl.getSubscriptionCard)
    app.get('/api/v1/getSubscriptionTransection/:id', subscriptionCtrl.getSubscriptionTransection)
    app.get('/api/v1/getpaymentCustomer', ctrl2.getpaymentCustomer);
    app.post('/api/v1/customer-update', ctrl2.customerUpdate);
    app.get('/api/v1/promotional-credit/:id', ctrl2.getPromotionalCredit)
    

    /**
     * Tracker User Restriction Api Route
     */
};