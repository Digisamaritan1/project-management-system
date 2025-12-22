const ctrl = require('./controller');

exports.init = (app) => {
    app.post('/api/v1/github/access-token', ctrl.getAccessToken);
}