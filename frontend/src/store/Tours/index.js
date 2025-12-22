import * as actions from "./actions.js";
import * as mutations from './mutations.js';
export default {
    namespaced: true,
    state: {
        Tours: {}
    },
    getters: {
      Tours: state => state.Tours,
    },
    mutations: mutations,
    actions: actions
}