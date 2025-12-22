import InvoiceTable from './component/InvoiceTable.vue';
import InvoiceTableComponent from './component/InvoiceTableComponent.vue';
import PendingInvoiceNotification from './component/PendingInvoiceNotification.vue';
import UpdateMemeberSubscription from './component/UpdateMemeberSubscription.vue';
import CardList from './component/CardList.vue';
import BillingDetails from './component/BillingDetails.vue';
import UpdateSubscription from './component/UpdateSubscription.vue';
import BillingHistoryTab from './component/BillingHistoryTab.vue';
import UpgradeBtn from './component/UpgradeBtn.vue';
const helperCtl = require("./helper").default;

export default {
    install(app) {
        // Register a global components
        app.component('InvoiceTable', InvoiceTable);
        app.component('InvoiceTableComponent', InvoiceTableComponent);
        app.component('PendingInvoiceNotification', PendingInvoiceNotification);
        app.component('UpdateMemeberSubscription', UpdateMemeberSubscription);
        app.component('CardList', CardList);
        app.component('BillingDetails', BillingDetails);
        app.component('UpdateSubscription', UpdateSubscription);
        app.component('BillingHistoryTab', BillingHistoryTab);
        app.component('UpgradeBtn', UpgradeBtn);

        // Register a global function
        app.provide("addSubscription", helperCtl.addSubscription);
        app.provide("displayUpgrade", helperCtl.displayUpgrade);
        app.provide("paymentInit", helperCtl.paymentInit);
        app.provide("customerUpdate", helperCtl.customerUpdate);
    }
};
