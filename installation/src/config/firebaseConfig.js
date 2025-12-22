let configs = {};

configs = {
    apiKey: process.env.VUE_APP_APIKEY,
    authDomain:process.env.VUE_APP_AUTHDOMAIN,
    databaseURL:process.env.VUE_APP_DATABASEURL,
    projectId:process.env.VUE_APP_PROJECTID,
    storageBucket:process.env.VUE_APP_STORAGEBUCKET,
    messagingSenderId:process.env.VUE_APP_MESSAGINGSENDERID,
    appId:process.env.VUE_APP_APPID,
    measurementId:process.env.VUE_APP_MEASUREMENTID
};

export default configs;