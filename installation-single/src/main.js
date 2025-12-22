import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import { VueFire } from 'vuefire'
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';


/**
 * CSS files
 */

import "@/assets/css/index.css";


const app = createApp(App).use(router)
// .use(VueFire, {
//     // imported above but could also just be created here
//     modules: [
//       // we will see other modules later on
//       // VueFireAuth(),
//     ],
// })
app.use(ToastPlugin,{position: 'top-right'});
app.mount('#app');

// MODAL
let element = document.createElement('div');
element.id="my-modal"
document.getElementById("app")?.appendChild(element)