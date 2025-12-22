import { apiRequestWithoutCompnay } from "@/services";
import * as env from '@/config/env';

const getEmailTemplate = () => {
    return new Promise((resolve, reject) => {
        apiRequestWithoutCompnay("get", env.GET_EMAIL_TEMPLATES)
            .then(response => {
                const emailTemplate = [
                    {
                        "id": 1,
                        "name": "User Verify Email",
                        "subject": response.data.verifyEmail.subject,
                        "from": 'Alian Hub',
                        "email_message": response.data.verifyEmail.mail
                    },
                    {
                        "id": 2,
                        "name": "User Reset Password Email",
                        "subject": response.data.resetEmail.subject,
                        "from" : 'Alian Hub',
                        "email_message" : response.data.resetEmail.mail
                    },
                    {
                        "id": 3,
                        "name": "Company Invitation",
                        "subject": response.data.invitationEamil.subject,
                        "from" : 'Alian Hub',
                        "email_message" : response.data.invitationEamil.mail
                    }
                ];
                resolve(emailTemplate);
            })
            .catch(error => {
                reject(error);
            });
    });
};

export default getEmailTemplate;
