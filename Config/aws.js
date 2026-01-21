const AWS = require('aws-sdk');
const SES = require("aws-sdk/clients/ses");

/**
 * AWS mail confurations
 */
AWS.config.update({
    accessKeyId: process.env.AWS_SES_KEY,
    secretAccessKey: process.env.AWS_SES_SECRET,
    region: process.env.AWS_SES_REGION
});

const ses = new AWS.SES({apiVersion: '2010-12-01'});
const sesWithAttachment = new SES();
const sesv2 = new AWS.SESV2({apiVersion: '2019-09-27'});
const ssmClient = new AWS.SSM({apiVersion: '2014-11-06', region: process.env.AWS_SES_REGION});
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const wasabiAccessKey = process.env.WASABI_ACCESS_KEY
const wasabiSecretAccessKey = process.env.WASABI_SECRET_ACCESS_KEY
const wasabiEndPoint = process.env.WASABIENDPOINT
const region = process.env.WASABI_REGION
const iamEndPoint = process.env.IAM_ENDPOINT
const userProfileBucket = process.env.USERPROFILEBUCKET
const wasabiUserId = process.env.WASABI_USERID

module.exports = {
    ses,
    sesWithAttachment,
    sesv2,
    ssmClient,
    s3,
    wasabiEndPoint,
    wasabiAccessKey,
    wasabiSecretAccessKey,
    region,
    iamEndPoint,
    userProfileBucket,
    wasabiUserId
}
