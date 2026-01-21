/**
 * 
 * This file is contains all of the collection name which is used in our 
 * project. If your have required to create any new collection then you must be decalred here
 * and used as globally.
 * 
 */

/** ROOT COLLECTION NAME **/
const dbCollections = {
    COMPANIES: "companies",
    CUSTOM_FIELDS: "customField",
    CURRENCY_LIST: "currency_list",
    SETTINGS: "settings",
    USERS: "users",
    PROJECTS: 'projects',
    TASKS: 'tasks',
    TIMESHEET: "timesheet",
    TIMESHEETS: "timesheets",
    HISTORY: "history",
    COMMENTS: "comments",
    TEAMS_MANAGEMENT: 'teams_management',
    PROJECT_ROLES: "project_roles",
    COMPANY_USERS: "company_users",
    RULES: "rules",
    ESTIMATED_TIME:"estimated_time",
    NOTIFICATIONS: "notifications",
    NOTIFICATIONS_SETTINGS: "notifications_settings",
    TASK_STATUS_TEMPLATES : "task_status_templates",
    TASK_TYPE_TEMPLATES : "task_type_templates",
    PROJECT_TAB_COMPONENTS: "project_tab_components",
    APPS: "apps",
    COLLECTION_INFO: "collection_info",
    INVOICES: 'invoices',
    SUBSCRIPTIONS: 'subscriptions',
    PRICES:"prices",
    PROJECT_TEMPLATES : "project_templates",
    UPDATE_TYPESENCE_REPO:'update_typesence_repo',
    PROJECT_MAIN_TEMPLATES : "ProjectTemplate",
    SPRINTS: "sprints",
    RESTRICTED_EXTENSIONS:"restrictedExtensions",
    FILTERS: "filters",
    MILESTONE: "milestone",
    MAINTAINANCE: "maintainance",
    MAIN_CHATS: "main_chats",
    PROJECT_STATUS_TEMPLATES:"project_status_template",
    GLOBAL: "global",
    SUBSCRIPTIONDATA: 'SubscriptionData',
    MENTIONS: "mentions",
    USER_ID: "userId",
    PROJECT_RULES: 'projectRules',
    SUBSCRIPTIONPLAN: 'subscriptionPlan',
    PLANFEATUREDISPLAY: 'planFeatureDisplay',
    FOLDERS: 'folders',
    TOURS:'tours',
    AICATEGORIES: 'aicategories',
}

/** DOCUMENT ID'S NAME WHICH IS USED IN THE "SETTINGS" COLLECTION NAME **/
const settingsCollectionDocs = {
    PROJECT_CATEGORY : "project_category",
    TASK_TYPE: "task_type",
    TASK_STATUS: "task_status",
    PROJECT_STATUS: "project_status",
    TASK_PRIORITIES: "task_priorities",
    PROJECT_MILESTONE_STATUS: "milestone_status",
    ALLOWED_FILE_EXTENSION: 'file_extension',
    COMMON_DATE_FORMAT:'date_format',
    COMPANY_USER_STATUS:'company_user_status',
    ROLES: 'roles',
    DESIGNATIONS: 'designations',
    HOURLY_MILESTONE_RANGE:'hourly_milestone_range',
    HOURLY_MILESTONE_WEEKLY_RANGE:'hourly_milestone_weekly_range',
    GLOBALFILTER:'global_filter'
}

module.exports = {
    dbCollections,
    settingsCollectionDocs
};