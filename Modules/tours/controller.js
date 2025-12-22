const { SCHEMA_TYPE } = require("../../Config/schemaType");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries");
const { myCache } = require('../../Config/config');

exports.getTours = async (req, res) => {
    try {
        const toursCacheKey = 'tours'; 
        let tours = myCache.get(toursCacheKey);
        let isFromCache = true;
        if (!tours) {
            isFromCache = false;
            const toursObj = {
                type: SCHEMA_TYPE.TOURS,
                data: []
            };

            tours = await MongoDbCrudOpration('global', toursObj, 'find');

            if (!tours || tours.length === 0) {
                return res.status(404).json({ message: 'No tours found' });
            }

            myCache.set(toursCacheKey, tours, 604800);
        }

        if (isFromCache) {
            res.set({
                'FromCache': 'true',
                'cacheExpireTime': myCache.getTtl(toursCacheKey)
            });
        }

        res.status(200).json(tours);
    } catch (error) {
        res.status(404).json({ message: 'An error occurred while fetching the tours', error: error.message });
    }
};