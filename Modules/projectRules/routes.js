const ctrl = require('./controller');

exports.init = (app) => {
    app.get('/api/v1/projectRules/:pid', ctrl.getProjectRules);
    app.put('/api/v1/projectRules/update', ctrl.updateProjectRules);
    app.delete('/api/v1/projectRules/delete/:pid', ctrl.deleteProjectRules);
}