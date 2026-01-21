const axios = require('axios');
const logger = require("../../Config/loggerConfig");

// GitHub Credentials 
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_BASE_OAUTH_URL = process.env.GITHUB_BASE_OAUTH_URL;

/**
 * Exchange code for access token
 */
exports.getAccessToken = async (req, res) => {
    try {
        const { code } = req.body;

        const payload = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
        }

        const tokenResponse = await axios.post(`${GITHUB_BASE_OAUTH_URL}/access_token`, payload,
            { headers: { Accept: "application/json" } }
        );

        const accessToken = tokenResponse.data.access_token;
        
        res.send({ status: true, accessToken })
    } catch (error) {
        logger.error("Error in getAccessToken hook:", error);
        return res.send({
            status: false,
            statusText: "Error in getAccessToken hook:",
            error: error.message,
        });
    }
};