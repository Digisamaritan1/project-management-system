const ctrl = require('./controller');
exports.init = (app) => {
    app.post('/api/v1/invoice/find', ctrl.getInvoice);
}