import { nextTick } from "vue";
import { en } from "@/locales/en"
import { useI18n } from 'vue-i18n';
export function useValidation() {
    const { t } = useI18n();

    function checkErrors({ field = {}, name = "", validations = '', type = "string", event = null, checkLanguage = true }) {
        return new Promise((resolve, reject) => {
            try {
                let rules = validations !== '' ? validations.split("|").map((x) => x.trim()) : '';
                let valid = true;
                let typeMsg = type === "number" ? "digits" : "characters";

                if (rules.length) {
                    // REQUIRED
                    if (rules.filter((x) => x.includes("required")).length) {
                        if (event !== null) {
                            if (event.target.value.trim() === "" || event.target.value.trim() === null || event.target.value === false) {
                                valid = false;
                                field.error = !checkLanguage ? `The ${name.toLowerCase()} ${en.generalErrorMessage.fieldIsRequired}` : t('errorPage.The') + " " + t(`errorPage.${name.toLowerCase().replaceAll(" ", "_")?.replaceAll("'", "")}`).toLowerCase() + " " + t('generalErrorMessage.fieldIsRequired');
                            }
                        } else {
                            if (field.value === "" || field.value === null || field.value === false) {
                                valid = false;
                                field.error = !checkLanguage ? `The ${name.toLowerCase()} ${en.generalErrorMessage.fieldIsRequired}` : t('errorPage.The') + " " + t(`errorPage.${name.toLowerCase().replaceAll(" ", "_")?.replaceAll("'", "")}`).toLowerCase() + " " + t('generalErrorMessage.fieldIsRequired');
                            }
                        }
                    }
                    // REGEX
                    if (rules.filter((x) => x.includes("regex")).length && valid) {
                        let ind = rules.findIndex((x) => x.includes("regex"));
                        if (ind !== -1) {
                            let regex = rules[ind].split(":").pop().trim() || "";
                            if (regex.length) {
                                regex = new RegExp(regex);
                                if (event !== null) {
                                    if (!regex.test(event.target.value.trim())) {
                                        valid = false;
                                        field.error =
                                            !checkLanguage ?
                                                `The ${name.toLowerCase()} field must be a valid ${name.toLowerCase()}` :
                                                (name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase()) && field.value.toString().length < 8
                                                    ? name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() ? t('authErrorMessage.passwordValid') : name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() ? t('authErrorMessage.newPasswordValid') : name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase() ? t('authErrorMessage.currentPasswordValid') : ''
                                                    : (name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase()) && field.value.toString().length >= 8
                                                        ? name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() ? t('errorPage.The') + ' ' + t('authErrorMessage.validPassRegex') : name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() ? t('errorPage.The') + ' ' + t('authErrorMessage.newPassword') : name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase() ? t('errorPage.The') + ' ' + t('authErrorMessage.currentPassword') : ''
                                                        : name == en.email
                                                            ? t('authErrorMessage.emailError')
                                                            : name == en.firstName
                                                                ? t('authErrorMessage.validCharactersfirst')
                                                                : name == en.lastName
                                                                    ? t('authErrorMessage.validCharacterslast')
                                                                    : t('errorPage.The') + ' ' + t(`errorPage.${name.toLowerCase().replace(" ", "_")}`) + ' ' + t('errorPage.field_must_be_a_valid') + ' ' + t(`errorPage.${name.toLowerCase().replace(" ", "_")}`);
                                    }
                                } else {
                                    if (!regex.test(field.value)) {
                                        valid = false;
                                        field.error =
                                            !checkLanguage ?
                                                `The ${name.toLowerCase()} field must be a valid ${name.toLowerCase()}` :
                                                (name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase()) && field.value.toString().length < 8
                                                    ? name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() ? t('authErrorMessage.passwordValid') : name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() ? t('authErrorMessage.newPasswordValid') : name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase() ? t('authErrorMessage.currentPasswordValid') : ''
                                                    : (name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase()) && field.value.toString().length >= 8
                                                        ? name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() ? t('errorPage.The') + ' ' + t('authErrorMessage.validPassRegex') : name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() ? t('errorPage.The') + ' ' + t('authErrorMessage.newPassword') : name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase() ? t('errorPage.The') + ' ' + t('authErrorMessage.currentPassword') : ''
                                                        : name == en.email
                                                            ? t('authErrorMessage.emailError')
                                                            : name == en.firstName
                                                                ? t('authErrorMessage.validCharactersfirst')
                                                                : name == en.lastName
                                                                    ? t('authErrorMessage.validCharacterslast')
                                                                    : t('errorPage.The') + ' ' + t(`errorPage.${name.toLowerCase().replace(" ", "_")}`) + ' ' + t('errorPage.field_must_be_a_valid') + ' ' + t(`errorPage.${name.toLowerCase().replace(" ", "_")}`);
                                    }
                                }
                            } else {
                                console.warn("No regex found!");
                            }
                        }
                    }

                    // MIN
                    if (rules.filter((x) => x.includes("min")).length && valid) {
                        let ind = rules.findIndex((x) => x.includes("min"));
                        if (ind !== -1) {
                            let min = Number(rules[ind].split(":").pop());
                            if (event !== null) {
                                if (event.target.value.trim().toString().length < min) {
                                    valid = false;
                                    field.error =
                                        !checkLanguage ?
                                            `The ${name.toLowerCase()} field must be at least ${min} ${typeMsg}` :
                                            name === en.phoneNumber
                                                ? t('companyErrorMessage.phoneNumberValid')
                                                : t('errorPage.The') + ' ' + t(`errorPage.${name.toLowerCase().replace(" ", "_")}`) + ' ' + t('errorPage.field_must_be_at_least') + ' ' + `${min}` + ' ' + t(`errorPage.${typeMsg}`)
                                }
                            } else {
                                if (field.value.toString().length < min) {
                                    valid = false;
                                    field.error =
                                        !checkLanguage ?
                                            `The ${name.toLowerCase()} field must be at least ${min} ${typeMsg}` :
                                            name === en.phoneNumber
                                                ? t('companyErrorMessage.phoneNumberValid')
                                                : t('errorPage.The') + ' ' + t(`errorPage.${name.toLowerCase().replace(" ", "_")}`) + ' ' + t('errorPage.field_must_be_at_least') + ' ' + `${min}` + ' ' + t(`errorPage.${typeMsg}`)
                                }
                            }
                        }
                    }
                    // MAX
                    if (rules.filter((x) => x.includes("max")).length && valid) {
                        let ind = rules.findIndex((x) => x.includes("max"));
                        if (ind !== -1) {
                            let max = Number(rules[ind].split(":").pop());
                            if (event !== null) {
                                if (event.target.value.trim().toString().length > max) {
                                    valid = false;
                                    field.error = !checkLanguage ? `${name} must be less than ${max} ${typeMsg}` : t(`errorPage.${name.toLowerCase().replace(" ", "_")}`) + ' ' + t('errorPage.must_be_less_than') + ' ' + `${max}` + ' ' + t(`errorPage.${typeMsg}`);
                                }
                            } else {
                                if (field.value.toString().length > max) {
                                    valid = false;
                                    field.error = !checkLanguage ? `${name} must be less than ${max} ${typeMsg}` : t(`errorPage.${name.toLowerCase().replace(" ", "_")}`) + ' ' + t('errorPage.must_be_less_than') + ' ' + `${max}` + ' ' + t(`errorPage.${typeMsg}`);
                                }
                            }
                        }
                    }
                    // CONFIRMATION
                    if (rules.filter((x) => x.includes("confirmation")).length && valid) {
                        let ind = rules.findIndex((x) => x.includes("confirmation"));
                        if (ind !== -1) {
                            let confirm = rules[ind].split(":").pop().trim() || "";
                            if (confirm.length) {
                                if (event !== null) {
                                    if (event.target.value.trim() !== confirm) {
                                        valid = false;
                                        field.error = t('authErrorMessage.confirmPasswordValid');
                                    }
                                } else {
                                    if (field.value !== confirm) {
                                        valid = false;
                                        field.error = t('authErrorMessage.confirmPasswordValid');
                                    }
                                }
                            } else {
                                console.warn("No confirmation field found!");
                            }
                        }
                    }

                    // NO ERRORS
                    if (valid) {
                        field.error = "";
                    }
                }
                resolve(valid);
            } catch (error) {
                reject(error)
            }
        })
    }

    function checkAllFields(formData, checkLanguage = true) {
        return new Promise((resolve, reject) => {
            try {
                let valid = true;
                if (!Array.isArray(formData)) {
                    Object.keys(formData).forEach((key) => {
                        checkErrors({ 'field': formData[key], 'name': formData[key]?.name, 'validations': formData[key]?.rules, 'type': formData[key]?.type, 'checkLanguage': checkLanguage }).then((res) => {
                            if (res === false) {
                                valid = false;
                            }
                        })
                            .catch((error) => {
                                console.error("ERROR in check validation: ", error);
                            })
                    });
                } else {
                    formData.forEach((key) => {
                        checkErrors({ 'field': key, 'name': key.title || key.label, 'validations': key.rules, 'type': key.type, 'checkLanguage': checkLanguage }).then((res) => {
                            if (res === false) {
                                valid = false;
                            }
                        })
                            .catch((error) => {
                                console.error("ERROR in check validation: ", error);
                            })
                    })
                }
                nextTick(() => {
                    resolve(valid);
                })
            } catch (error) {
                reject(error);
            }
        });
    }

    return {
        checkAllFields,
        checkErrors
    }
}