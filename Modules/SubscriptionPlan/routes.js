const ctrl = require("./controller");

exports.init = (app) => {
  app.get("/api/v1/subscription", ctrl.getAllSubscriptionPlans);
  app.post("/api/v1/subscription/find", ctrl.getAllSubscriptionPlans);
  app.get("/api/v1/subscription/:id", ctrl.getSubscriptionPlanById);
  app.put("/api/v1/subscription", ctrl.updateSubscriptionPlan);
};
