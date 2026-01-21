const ctrl = require("./controller");

exports.init = (app) => {
  app.get("/api/v1/subscriptions/:id", ctrl.getSubscriptions);
  app.post("/api/v1/subscriptions", ctrl.subscriptionTabFetchSubscriptionData);
};
