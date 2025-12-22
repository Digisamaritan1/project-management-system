const ctrl = require('./controller');
const ctrl2 = require('./controller2');

exports.init = (app) => {
    app.post('/api/v1/webhook',ctrl.webhook);
    app.post('/api/v1/customerAddressPaddle', ctrl.customerAddressPaddle);
    app.post('/api/v1/updateSubscriptionPaymentEstimate',ctrl.updateSubscriptionPaymentEstimate)
    app.post('/api/v1/updateSubscriptionPayment',ctrl.updateSubscriptionPayment)
    app.post('/api/v1/addAndRemoveUserInPaymentSubscriptionEstimate',ctrl.addAndRemoveUserInPaymentSubscriptionEstimate)
    app.get('/api/v1/getSubscription/:sid',ctrl.getSubscriptionDetails);
    app.post('/api/v1/cancleSubscriptionPayment',ctrl.cancelSubscriptionPaddle);
    app.post('/api/v1/getInvoiceAndCreditNotes',ctrl.getInvoiceAndCreditNotes);
    app.post('/api/v1/admin/getInvoiceAndCreditNotes',ctrl.getInvoiceAndCreditNotes);
    app.post('/api/v1/getTransectionPDFURL',ctrl.getTransectionPDFURL);
    app.get('/api/v1/getCustomerCredit/:cid',ctrl.getCustomerCredit);
    app.post('/api/v2/addDefaultSubscriptionFun', ctrl.addDefaultSubscriptionRequestFun);
    app.post('/api/v1/createPaymentPlan', ctrl2.createPaymentPlan);
    app.post('/api/v1/editPaymentPlan', ctrl2.editPaymentPlan);
    app.post('/api/v1/planStatusChange', ctrl2.planStatusChange);
    app.post('/api/v1/customer-update', ctrl2.customerUpdate);
};