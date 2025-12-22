import * as actions from "./actions.js";
import * as mutations from './mutations.js';
export default {
    namespaced: true,
    state: {
        chargeBeePrice: [],
        planFeatureDisplay: [],
        planFeature: [],
    },
    getters: {
        chargeBeePrice: state => state.chargeBeePrice,
        planFeatureDisplay: state => state.planFeatureDisplay,
        planFeature: state => state.planFeature
    },
    mutations: mutations,
    actions: actions
}