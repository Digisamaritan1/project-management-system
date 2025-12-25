import DashBoardList from "./views/DashBoardList/DashBoardList.vue"

export default {
    install (app) {
        app.component('DashBoardList', DashBoardList);

        // Provide globally
        app.provide("DashBoardList", DashBoardList);
    }
}