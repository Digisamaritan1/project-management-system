const ctrl = require('./controller');

exports.init = (app) => {
    app.post('/api/v1/google/access-token', ctrl.getAccessToken);
}