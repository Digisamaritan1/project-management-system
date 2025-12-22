const ctrl = require('./controller');

exports.init = (app) => {
    app.get('/api/v1/customeModals/checkUserReviewWithModal', ctrl.checkUserReviewWithModal);
    app.post('/api/v1/customeModals/addReview', ctrl.submitReview);
    app.get('/api/v1/customeModals/getReviewModalConfig', ctrl.getReviewModalConfig);
    app.post('/api/v1/customeModals/submitButtonHandle', ctrl.submitButtonHandle);
}