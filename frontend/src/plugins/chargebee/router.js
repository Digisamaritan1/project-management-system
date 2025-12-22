const billingHistory = [{
    path: '/:cid/billingHistory',
    name: 'Billing History',
    meta: {
        title: "Billing History",
        requiresAuth: true
    },
    component: () => import(/* webpackChunkName: "BillingHistory" */ './views/BillingHistory.vue')
}];

const upgradeRoute = [{
    path: "upgrade",
    name: "Upgrade",
    meta: {
        title: "Upgrade",
        requiresAuth: true
    },
    component: () => import(/* webpackChunkName: Upgrade */ './views/Upgrade.vue')
}];

const upgradeTab = true;

const checkoutRoute = [];

export default {
    billingHistory,
    upgradeRoute,
    upgradeTab,
    checkoutRoute
};
