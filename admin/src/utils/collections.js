/**
 * 
 * This file is contains all of the firestore collection name which is used in our 
 * project. If your have required to create any new collection then you must be decalred here
 * and used as globally.
 * 
 */

/** ROOT COLLECTION NAME **/
const dbCollections = {
    SUBSCRIPTIONPLAN: 'subscriptionPlan',
    PLANFEATUREDISPLAY: 'planFeatureDisplay',
    SUBSCRIPTIONDATA: 'SubscriptionData',
    SUBSCRIPTIONS: 'subscriptions',
    GLOBAL: "global",
    COMPANIES: 'companies',
    USERS:'users',
    INVOICES: 'invoices',
    PLANFEATURE: 'planFeature',
    ADMIN_DETAIL: 'adminDetail',
    TIMETRACKER_DOWNLOAD: 'timeTrackerDownload'
}

module.exports = {
    dbCollections,
};