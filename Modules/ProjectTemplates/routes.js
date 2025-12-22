const ctrl = require('./controller');

exports.init = (app) => {
    app.post('/api/v1/project/template/custom', ctrl.createTemplate);
    app.post('/api/v1/project/template/custom/ai-generate', ctrl.createTemplateWithAI);
    app.delete('/api/v1/project/template/custom/:id', ctrl.deleteTemplate);
    app.get('/api/v1/project/template/custom', ctrl.getTemplates);
}