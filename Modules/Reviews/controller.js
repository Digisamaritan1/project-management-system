const logger = require("../../Config/loggerConfig");
const { myCache, CANYONAPIURL, CANYONLICENSEKEY } = require('../../Config/config');
const axios =  require('axios');
const PREFIX = 'review_modal_';
const REVIEWMODALCONFIGCACHEKEY = 'reviewModalConfig';

exports.checkUserReviewWithModal = async (req, res) => {
    try {
        const { modalId } = req.query;

        if (!modalId) {
            return res.status(400).json({ message: 'Modal Id  are required' });
        }

        const cacheKey = `${PREFIX}${modalId}_${CANYONLICENSEKEY}`;

        const cached = myCache.get(cacheKey);
        if (cached) {
            return res.status(200).json({ ...cached, fromCache: true });
        }

        const { data: fresh } = await axios.get(`${CANYONAPIURL}/api/v1/checkUserReviewWithModal`,{
                params: { userIdentity:CANYONLICENSEKEY, modalId },
                headers: { 'Content-Type': 'application/json' }
            }
        );

        myCache.set(cacheKey, fresh, 86400);

        res.status(200).json({ ...fresh, fromCache: false });
    } catch (error) {
        logger.error(`Error checking user review with modal: ${JSON.stringify(error)}`);
        res.status(500).json({
            message: 'An error occurred while checking user review with modal',
            error:   error.message
        });
    }
};

exports.submitReview = async (req, res) => {
    try {
        const reviewData = req.body;
        if (!reviewData || !reviewData.modalId) {
            return res.status(400).json({ message: 'User identity and review data are required' });
        }

        const response = await axios.post(`${CANYONAPIURL}/api/v1/addReview`, {
            ...reviewData,
            userIdentity: CANYONLICENSEKEY ?? ''
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const cacheKey = `${PREFIX}${reviewData.modalId}_${CANYONLICENSEKEY}`;

        myCache.del(cacheKey);

        const result = response?.data || {};
        res.status(200).json(result);
    } catch (error) {
        logger.error(`Error submitting review: ${JSON.stringify(error.response.data)}`);
        res.status(500).json({ message: 'An error occurred while submitting the review', error: error.response.data.statusText ?? error.message });
    }
}

exports.getReviewModalConfig = async (req, res) => {
    try {
        const cachedConfig = myCache.get(REVIEWMODALCONFIGCACHEKEY);
        if (cachedConfig) {
            return res.status(200).json(cachedConfig);
        }
        const response = await axios.get(`${CANYONAPIURL}/api/v1/getModalsConfig`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = response?.data || {};
        if (!(!result || Object.keys(result).length === 0)) {
            myCache.set(REVIEWMODALCONFIGCACHEKEY, result, 86400);
        }
        res.status(200).json(result);
    } catch (error) {
        logger.error(`Error fetching review modal config: ${JSON.stringify(error)}`);
        res.status(500).json({ message: 'An error occurred while fetching review modal config', error: error.message });
    }
}

exports.submitButtonHandle = async (req, res) => {
    try {
        const { modalId } = req.body;

        if (!modalId) {
            return res.status(400).json({
                success: false,
                message: "ModalId are required"
            });
        }
        const response = await axios.post(
            `${CANYONAPIURL}/api/v1/handleCustomFunHandler`,
            {...req.body, userIdentity: CANYONLICENSEKEY ?? ''},
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        res.status(200).json(response.data);

    } catch (error) {
        logger.error(`Error submit custom handle: ${JSON.stringify(error)}`);
        res.status(500).json({
            message: "An error occurred while submitting custom handle",
            error: JSON.stringify(error)
        });
    }
};