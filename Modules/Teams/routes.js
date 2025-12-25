const ctrl = require('./controller');
exports.init = (app) => {
    app.get('/api/v1/teams',ctrl.getTeams);
    app.post('/api/v1/teams/addTeam',ctrl.addTeam);
    app.put('/api/v1/teams/updateTeam',ctrl.updateTeam);
}