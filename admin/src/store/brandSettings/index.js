import * as actions from "./actions.js";
import * as mutations from './mutations.js';
export default {
    namespaced: true,
    state: {
        brandSettings: {}
    },
    getters: {
        brandSettings: state => state.brandSettings,
    },
    mutations: mutations,
    actions: actions
}