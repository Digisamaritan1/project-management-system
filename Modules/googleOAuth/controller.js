const logger = require("../../Config/loggerConfig");

// GitHub Credentials 
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;

/**
 * Exchange code for access token
 */
exports.getAccessToken = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: "Missing authorization code" });
        }

        const tokenRes = await fetch(GOOGLE_OAUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: "postmessage",
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenRes.json();
        if (tokens.error) {
            return res.status(400).json({ error: tokens.error_description || tokens.error });
        }
        
        return res.json(tokens);
    } catch (error) {
        logger.error("Error in getAccessToken hook:", error);
        return res.send({
            status: false,
            statusText: "Error in getAccessToken hook:",
            error: error.message,
        });
    }
};