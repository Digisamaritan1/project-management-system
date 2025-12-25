const helperCtl = require("./helper").default;

export default {
    install(app) {
        // Register a global function
        app.provide('ExportTaskAsCsv', helperCtl.exportTaskAsCsv)
    }
}