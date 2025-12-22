const ctrl = require('./controller');

exports.init = (app) => {
    app.post('/api/v1/app-notification/comment', ctrl.sendMessage);
    app.get('/api/v1/app-notification/mentions', ctrl.getMentionsMessages);
    app.get('/api/v1/app-notification/notification', ctrl.getNotificationMessages);
    app.put('/api/v1/app-notification/mark-read', ctrl.updateMarkRead);
    app.put('/api/v1/push-mark-read', ctrl.updateMarkRead);
    app.put('/api/v1/app-notification/mark-all-read', ctrl.updateMarkAllRead);
    app.delete('/api/v1/app-notification/mark-read/:key/:id', ctrl.deleteMarkReadFromGlobal);
}