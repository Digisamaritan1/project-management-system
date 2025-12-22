const { myCache } = require("../../Config/config");
const { SCHEMA_TYPE } = require("../../Config/schemaType");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries");

exports.getProjectTabs = async (req,res) => {
    try {
        const companyId = req.headers['companyid'];
        const tabObj = {
            type: SCHEMA_TYPE.PROJECT_TAB_COMPONENTS,
            data: []
        };

        const tabCache = `ProjectTabs:${companyId}`;
        let projectTabs = myCache.get(tabCache);
        let isFromCache = true;
        if(!projectTabs){
            isFromCache  = false;
            projectTabs =  await MongoDbCrudOpration(companyId, tabObj, 'find');
            myCache.set(tabCache, projectTabs, 604800);
        }
        if (isFromCache) {
            res.set({
                'FromCache': 'true',
                'cacheExpireTime': myCache.getTtl(tabCache)
            });
        }
        res.status(200).json(projectTabs);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching the project tab", error: error.message });
    }
}