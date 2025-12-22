const ctrl = require('./controller');

exports.init = (app) => {
    app.get('/api/v1/estimatedTime/:pid/:tid',ctrl.getEstimatedTime);
    app.put('/api/v1/estimatedTime',ctrl.updateEstimatedTime);
    app.post('/api/v1/estimatedTime', ctrl.getEstimateByAggregate);
}