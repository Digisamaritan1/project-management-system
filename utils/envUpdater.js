const fs = require("fs");
const path = require("path");

const VALID_PATHS = ["root", "frontend", "admin"];

/**
 * Update one or multiple variables in a specific .env file.
 * @param {string} pathType - 'root' | 'frontend' | 'admin'
 * @param {Array<{variableName: string, variableValue: string}>} variables
 * @returns {Promise<string>} - Resolves with success message
 */
async function updateEnvVariablesUtil(pathType, variables) {
    return new Promise((resolve, reject) => {
        if (!VALID_PATHS.includes(pathType)) {
            return reject(new Error("Invalid pathType. Use 'root', 'frontend', or 'admin'."));
        }

        if (!Array.isArray(variables) || variables.length === 0) {
            return reject(new Error("variables must be a non-empty array."));
        }

        // Dynamically resolve the .env file path
        const envFilePath =
            pathType === "root"
                ? path.join(__dirname, "../.env")
                : path.join(__dirname, `../${pathType}/.env`);

        fs.readFile(envFilePath, "utf8", (err, data) => {
            if (err) {
                return reject(new Error(`Error reading ${pathType} .env file: ${err.message}`));
            }

            let updatedData = data;

            variables.forEach(({ variableName, variableValue }) => {
                const regex = new RegExp(`^(${variableName}=).*`, "m");
                const replacement = `${variableName}="${variableValue}"`;

                if (regex.test(updatedData)) {
                    updatedData = updatedData.replace(regex, replacement);
                } else {
                    updatedData = updatedData.trim() + `\n${replacement}\n`;
                }
            });

            fs.writeFile(envFilePath, updatedData, "utf8", (err) => {
                if (err) {
                    return reject(new Error(`Error writing ${pathType} .env file: ${err.message}`));
                }
                resolve(`Updated ${variables.length} variable(s) in ${pathType}/.env`);
            });
        });
    });
}

/**
 * Get one or all variables from a specific .env file.
 * @param {string} pathType - 'root' | 'frontend' | 'admin'
 * @param {string} [key] - optional specific variable name to fetch
 * @returns {Promise<Object|string>} - Returns object of all variables, or single value if key provided
 * For all variable - getEnvVariablesUtil("frontend")
 * For example specific variable - getEnvVariablesUtil("frontend", "VUE_APP_GOOGLE_CLIENT_ID")
 */
async function getEnvVariablesUtil(pathType) {
    return new Promise((resolve, reject) => {
        if (!VALID_PATHS.includes(pathType)) {
            return reject(new Error("Invalid pathType. Use 'root', 'frontend', or 'admin'."));
        }

        // Dynamically resolve the .env file path
        const envFilePath =
            pathType === "root"
                ? path.join(__dirname, "../.env")
                : path.join(__dirname, `../${pathType}/.env`);

        fs.readFile(envFilePath, "utf8", (err, data) => {
            if (err) {
                return reject(new Error(`Error reading ${pathType} .env file: ${err.message}`));
            }

            const envVars = {};
            data.split("\n").forEach((line) => {
                line = line.trim();
                if (!line || line.startsWith("#")) return;

                const [key, ...rest] = line.split("=");
                if (!key) return;

                let value = rest.join("=").trim();

                if (
                    (value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))
                ) {
                    value = value.slice(1, -1);
                }

                envVars[key] = value;
            });

            resolve(envVars);
        });
    });
}

module.exports = { updateEnvVariablesUtil, getEnvVariablesUtil };
