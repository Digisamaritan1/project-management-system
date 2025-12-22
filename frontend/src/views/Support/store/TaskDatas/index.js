import * as actions from "./actions.js";
import * as mutations from './mutations.js';
export default {
    namespaced: true,
    state: {
        allProjects: [],
        tasks: {},
        items: [],
    },
    getters: {
        mongoUpdatedTask: state => state.mongoUpdatedTask,
        tasks: state => state.tasks,
        projectTasks: state => state.items,
    },
    mutations: mutations,
    actions: actions
}