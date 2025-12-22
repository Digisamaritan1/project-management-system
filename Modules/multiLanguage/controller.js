const axios = require("axios");
const logger = require('../../Config/loggerConfig');
const { myCache } = require("../../Config/config");

/**
 * Get Translation Object Function
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
exports.getTranslationObject = async (req, res) => {
    const { lng } = req.params;
    
    // Validate if the language code is provided
    if (!lng) {
        return res.status(400).json({ error: 'Language code is required' });
    }

    const cacheKey = `translation_${lng}`;
    const cachedTranslation = myCache.get(cacheKey);

    // Step 1: Return cached data if available
    if (cachedTranslation) {
        res.set({
            'FromCache': 'true',
            'cacheExpireTime': myCache.getTtl(cacheKey)
        });
        return res.json(cachedTranslation);
    }

    // Step 2: Fetch the translation from the API if not cached
    try {
        const lanData = await axios.get(`${process.env.CANYONAPIURL}/api/v1/language/${lng}`);

        if (!Object.keys(lanData.data).length) {
            logger.error(`Translation not found for language '${lng}' - API response empty`);
            return res.status(404).json({ error: 'Translation not found for the specified language' });
        }

        // Step 3: Cache the translation data
        myCache.set(cacheKey, lanData.data, 86400);

        // Step 4: Return the fetched translation data
        return res.json(lanData.data);
    } catch (apiError) {
        logger.error(`Error fetching translation from API for '${lng}': ${apiError}`);
        return res.status(500).json({ error: 'Error fetching translation from API' });
    }
};
