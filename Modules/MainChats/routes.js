const ctrl = require('./controller')

exports.init = (app) => {
    app.get('/api/v1/main-chats',ctrl.getChats)
    app.post('/api/v1/main-chats/find',ctrl.setChats)
}