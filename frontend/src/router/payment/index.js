import chargebeeRouter from "../../plugins/chargebee/router";
import paddleRouter from "../../plugins/paddle/router";
export default process.env.VUE_APP_PAYMENTMETHOD === "chargebee" ? chargebeeRouter?.billingHistory : process.env.VUE_APP_PAYMENTMETHOD === "paddle" ? paddleRouter?.billingHistory : [];
