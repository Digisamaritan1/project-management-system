const ctrl = require('./controller');
exports.init = (app) => {
    app.get('/api/v1/mediaFiles',ctrl.getPaginateMediaFiles);
    app.get('/api/v1/groupByUsers',ctrl.getMediaFileUsers);
};