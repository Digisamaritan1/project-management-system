import * as actions from "./actions.js";
import * as mutations from './mutations.js';
export default {
    namespaced: true,
    state: {
        companies: []
    },
    getters: {
        companies: state => state.companies,
    },
    mutations: mutations,
    actions: actions
}