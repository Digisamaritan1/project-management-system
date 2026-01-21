const nodemailer = require("nodemailer");
const config =  require('../Config/config.js');
const awsRef = require('../Config/aws.js');
const logger = require("../Config/loggerConfig.js");
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: config.AWS_SES_KEY,
    secretAccessKey: config.AWS_SES_SECRET,
    region: config.AWS_SES_REGION
});
const ses = new AWS.SES({apiVersion: '2010-12-01',region: config.AWS_SES_REGION });

/**
 * Send email with AWS
 * @param {*} subject 
 * @param {*} html 
 * @param {*} toMail 
 * @param {*} isHtml 
 * @param {*} cb 
 */
exports.SendEmail = async (subject, html, toMail, isHtml, cb) => {
    try {
        const tmpToMail = toMail.toLowerCase().split(",");
        let toArr = [];
        if (tmpToMail.length === 1) {
            toArr = [toMail.toLowerCase()];
        } else {
            toArr = tmpToMail;
        }

        const params = {
            Destination: {
                ToAddresses: toArr
            },
            Message: {
                Body: {
                    ...(isHtml && { Html: { Charset: 'UTF-8',  Data: html } }),
                    ...(!isHtml && { Text: { Charset: 'UTF-8',  Data: html } })
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                }
            },
            ReturnPath: `${config.APP_NAME} <${config.AWS_SES_FROM_DEFAULT}>`,
            Source: `${config.APP_NAME} <${config.AWS_SES_FROM_DEFAULT}>`,
        };
    
        await awsRef.ses.sendEmail(params, (error, data) => {
            if (error) {
                cb({
                    status: false,
                    error: error.message
                });
            } else {
                cb({
                    status: true,
                    data,
                });
            }
        });
    } catch(error) {
        cb({
            status: false,
            error: error.message
        });
    }
};


/**
 * Send notification via AWS email
 * @param {*} subject 
 * @param {*} html 
 * @param {*} toMail 
 * @param {*} isHtml 
 * @param {*} cb 
 */
exports.SendNotificationEmail = async (subject, html, toMail, isHtml, cb) => {
    try {
        let toArr = [];
        toMail.forEach((email) => {
            toArr.push(email.toLowerCase());
        });

        const params = {
            Destination: {
                BccAddresses: toArr,
            },
            Message: {
                Body: {
                    ...(isHtml && { Html: { Charset: 'UTF-8',  Data: html } }),
                    ...(!isHtml && { Text: { Charset: 'UTF-8',  Data: html } })
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                }
            },
            ReturnPath: `${config.APP_NAME} <${config.AWS_SES_FROM_DEFAULT}>`,
            Source: `${config.APP_NAME} <${config.AWS_SES_FROM_DEFAULT}>`,
        };

        await awsRef.ses.sendEmail(params, (error, data) => {
            if (error) {
                cb({
                    status: false,
                    error: error.message
                });
            } else {
                cb({
                    status: true,
                    data,
                });
            }
        });
    } catch(error) {
        logger.error(`Send Verify Email Catch Error: ${error.messge}`);
        cb({
            status: false,
            error: error.message
        });
    }
};


/**
 * Send attachment via AWS email
 * @param {*} subject 
 * @param {*} html 
 * @param {*} toMail 
 * @param {*} attachMents 
 * @param {*} cb 
 */
exports.sendAttachMail = (subject, html, toMail,attachMents, cb) => {
    let transporter = nodemailer.createTransport({
        SES: ses
    });
    transporter.sendMail({
        from: config.AWS_SES_FROM_DEFAULT, // sender address
        to: toMail, // list of receivers
        subject: subject, // Subject line
        html : html,
        attachments: attachMents
    }, (err, res) => {
        if (err) {
            logger.error("sendEmail: ", err);
            cb({
                status: false,
                statusText: err.message ? err.message : err
            });
        } else {
            cb({
                status: true,
                res,
            });
        }
    });
};
