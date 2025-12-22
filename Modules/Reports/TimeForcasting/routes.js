const ctrl = require('./controller');

exports.init = (app) => {
    app.post('/api/v1/report/time-forcasting', ctrl.getTimeForcastingData);
    app.post('/api/v1/report/time-forcasting/chart-data/monthly', ctrl.getTimeSeriesByMonth);
    app.post('/api/v1/report/time-forcasting/chart-data/yearly', ctrl.getTimeSeriesByYear);
    app.post('/api/v1/report/time-forcasting/chart-data/quarterly', ctrl.getTimeSeriesByQuarter);
}