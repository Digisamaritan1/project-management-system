const { default: axios } = require("axios");
const config = require('../Config/config');
const {myCache} = require('../Config/config');
const projectTemplates = require('./projectTemplates.json');
const aiPrompts = require('./aiPrompts.json');
const apiCategories = require('./aiCategories.json');
const aiModals = require('./aiModals.json');

exports.getCachedPromptData = async (body) => {
    return new Promise(async (resolve, reject) => {
        try {
            let cachedPromptData = myCache.get(body.query[0].title);
            if (!cachedPromptData) {
                const result = aiPrompts.find((e) => e.title === body.query[0].title);
                if (!result) {
                    return resolve({
                        status: false,
                        statusText: "No Prompt Found",
                    });
                }
                myCache.set(body.query[0].title, result, 3600);
                resolve({ status: true, statusText: result });
            } else {
                resolve({ status: true, statusText: cachedPromptData });
            }
        } catch (error) {
            reject(error);
        }
    });
};

exports.getCachedAllPromptData = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let cachedAllPromptData = myCache.get("getAllPrompt");
            if (!cachedAllPromptData) {
                let result = aiPrompts.map(
                    ({ predefinedPrompt, ...rest }) => rest
                );
                resolve({ status: true, statusText: result });
                myCache.set("getAllPrompt", result, 3600);
            } else {
                resolve({ status: true, statusText: cachedAllPromptData });
            }
        } catch (error) {
            reject(error);
        }
    });
};

exports.getCachedCategoryData = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let cachedCategoryData = myCache.get("getCategory");
            if (!cachedCategoryData) {
                myCache.set("getCategory", apiCategories, 3600);
                resolve({ status: true, statusText: apiCategories });
            } else {
                resolve({ status: true, statusText: cachedCategoryData });
            }
        } catch (error) {
            reject(error);
        }
    });
};

exports.getCachedAiModelData = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let cachedModelData = myCache.get("getModel");
            if (!cachedModelData) {
                myCache.set("getModel", aiModals, 3600);
                resolve({ status: true, statusText: aiModals });
            } else {
                resolve({ status: true, statusText: cachedModelData });
            }
        } catch (error) {
            reject(error);
        }
    });
};

exports.getCachedGlobalTemplateData = async() => {
    return new Promise(async(resolve,reject) => {
        try {
            let cacheglobalTemplateData = myCache.get('getTemplateData');
            if (!cacheglobalTemplateData) {
                myCache.set('getTemplateData', projectTemplates, 3600);
                resolve({ status: true, statusText: projectTemplates })
            } else {
                resolve({status: true, statusText: cacheglobalTemplateData})
            }
        } catch (error) {
            reject(error);
        }
    })
}
