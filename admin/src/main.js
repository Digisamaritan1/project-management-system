import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import { VueFire } from 'vuefire'
import ToastPlugin from 'vue-toast-notification';
import VueApexCharts from "vue3-apexcharts";
import 'vue-toast-notification/dist/theme-sugar.css';

import upgradeVersionProcessPlugin from './plugins/upgradeVersionProcess/upgradeVersionProcessPlugin';

/**
 * CSS files
 */

import "@/assets/css/index.css";


const app = createApp(App).use(router).use(store)

const pluginArray = [
  upgradeVersionProcessPlugin,
];
for (let index = 0; index < pluginArray.length; index++) {
  app.use(pluginArray[index]);
}
// .use(VueFire, {
//     // imported above but could also just be created here
//     modules: [
//       // we will see other modules later on
//       // VueFireAuth(),
//     ],
// })
app.use(ToastPlugin,{position: 'top-right'});
app.use(VueApexCharts);
app.mount('#app');

// SIDEBAR
let element = document.createElement('div');
element.id="my-sidebar"
document.getElementById("app")?.appendChild(element)
// MODAL
element = document.createElement('div');
element.id="my-modal"
document.getElementById("app")?.appendChild(element)
// DROP DOWN
element = document.createElement('div');
element.id="my-dropdown"
document.getElementById("app")?.appendChild(element)