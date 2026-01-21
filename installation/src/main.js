import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';



import "@/assets/css/index.css";


const app = createApp(App).use(router)
app.use(ToastPlugin,{position: 'top-right'});
app.mount('#app');

// MODAL
let element = document.createElement('div');
element.id="my-modal"
document.getElementById("app")?.appendChild(element)