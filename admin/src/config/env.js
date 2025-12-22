// API's
module.exports.API_URI = window.location.origin;
module.exports.MONGO_OPRATION = '/api/v1/mongoOpration';
module.exports.GENERATETOKEN = '/api/v1/generateToken';
module.exports.GENERATETOKEN_V2 = '/api/v2/generateToken';
module.exports.WASABI_RETRIVE_USER_PROFILE = "/api/v1/wasabi/retriveUserProfile";
module.exports.ADMIN_WASABI_RETRIVE_OBJECT = "/api/v1/admin/wasabi/retriveObject";
module.exports.ADMIN_GETINVOICEANDCREDITNOTES = '/api/v1/admin/getInvoiceAndCreditNotes';
module.exports.CREATE_PAYMENT_PLAN="/api/v1/createPaymentPlan";
module.exports.DELETE_COMPANY="/api/v2/company/delete";
module.exports.DELETE_TACKER="/api/v1/tracker/delete";
module.exports.SAVE_TACKER="/api/v1/tracker/create";
module.exports.UPDATE_TACKER="/api/v1/tracker/update";
module.exports.GET_TACKER="/api/v1/tracker";
module.exports.CREATE_EDIT_PAYMENT_PLAN="/api/v1/editPaymentPlan";
module.exports.PLANSTATUSCHANGE="/api/v1/planStatusChange";
module.exports.GET_ENV="/api/v1/getEnv";
module.exports.UPLOAD_LOGO_FILE="/api/v1/uploadLogoFile";
module.exports.SUBSCRIPTIONPAYMENTRESOURCE="/api/v1/getSubscriptionPaymentResource";
module.exports.SUBSCRIPTIONTRANSECTION="/api/v1/getSubscriptionTransection";
module.exports.ADMIN_CHECKSENDINVITATION = 'api/v1/admin/checkSendInviatation';
module.exports.SEND_INVITATION_EMAIL = "/api/v2/sendInvitationEmail";
module.exports.GET_INVOICE_AND_CREDITNOTE_URL = '/api/v1/getInvoiceAndCreditNoteURL';
module.exports.SUBSCRIPTIONPLAN = '/api/v1/subscription';
module.exports.PLANFEATURE = '/api/v1/admin/plan-feature';
module.exports.PLANFEATUREDISPLAY = '/api/v1/admin/plan-feature-display';
module.exports.INVOICE = '/api/v1/invoice/find';
module.exports.COMPANYACTION = "/api/v1/admin/company";
module.exports.USER_UPATE = '/api/v1/user';
module.exports.VERSION_UPDATE_NOTIFY = 'api/v1/versionUpdateNotify';
module.exports.SUBMIT_ENV_STEP_FORM = '/api/v1/update-submit';
module.exports.GET_GENERAL_NOTES = '/api/v1/generalNotes';

// Not Set Middleware
module.exports.CREATE_COMPANY = "/api/v2/company/createAdmin";
module.exports.GETTRANSECTIONPDFURL = '/api/v1/getTransectionPDFURL';
module.exports.STORAGETYPE = process.env.VUE_APP_STORAGE_TYPE;
module.exports.GETAIMODELS = '/api/v1/getAiModels';
module.exports.UPDATEAIMODEL = '/api/v1/updateAiModel';
module.exports.FINDONEAIMODEL = '/api/v1/findOneAiModel';
module.exports.SAVE_BRAND_SETTINGS_INFORMATION = '/api/v1/saveBrandSettingsData';
module.exports.GET_BRAND_SETTINGS_INFORMATION = '/api/v1/getBrandSettingsData';

//Storage Routes
module.exports.GET_SIGNED_OR_PUBLIC_URL = '/api/v1/generateSignedUrl';
module.exports.GET_LOGO = "/api/v1/getlogo";
module.exports.UPDATE_EMAIL_TEMPLATE = "/api/v1/updateEmailTemplate";
module.exports.GET_EMAIL_TEMPLATES = "/api/v1/getEmailTemplates";

module.exports.SUBSCRIPTIONS = "/api/v1/subscriptions";
module.exports.USER = "/api/v1/user";

// USER AUTH
module.exports.FORGOTPASSWORD = '/api/v2/auth/forgot-password';
module.exports.TOKEN_VERIFY_FORGOTPASSWORD = '/api/v2/auth/token-verify-forgotpassword';
module.exports.RESETPASSWORD = '/api/v2/auth/reset-password';
module.exports.LOGIN = '/api/v2/auth/login';
module.exports.LOGOUT = '/api/v2/logout';
module.exports.CUSTOMERUPDATE = "/api/v1/customer-update";
module.exports.CUSTOME_MODALS = "/api/v1/customeModals"

// oAuth credentials
module.exports.API_OAUTH = "/api/v1/settings/oauth"