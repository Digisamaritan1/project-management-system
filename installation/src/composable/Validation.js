import { nextTick } from "vue";
import { en } from "@/locales"
export function useValidation() {

    function checkErrors({field = {}, name = "", validations = '', type = "string", event = null}) {
        return new Promise((resolve, reject) => {
            try {
                let rules = validations!== '' ? validations.split("|").map((x) => x.trim()) : '';
                let valid = true;
                let typeMsg = type === "number" ? "digits" : "characters";

                if(rules.length) {
                    // REQUIRED
                    if (rules.filter((x) => x.includes("required")).length) {
                        if(event !== null){
                            if (event.target.value.trim() === "" || event.target.value.trim() === null || event.target.value === false) {
                                valid = false;
                                field.error = `The ${name.toLowerCase()} ${en.generalErrorMessage.fieldIsRequired}`;
                            }
                        } else {
                            if (field.value === "" || field.value === null || field.value === false) {
                                valid = false;
                                field.error = `The ${name.toLowerCase()} ${en.generalErrorMessage.fieldIsRequired}`;
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
                                if(event !== null) {
                                    if (!regex.test(event.target.value.trim())) {
                                        valid = false;
                                        field.error =
                                            (name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase()) && field.value.toString().length < 8
                                            ? name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() ? en.authErrorMessage.passwordValid : name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() ? en.authErrorMessage.newPasswordValid : name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase() ? en.authErrorMessage.currentPasswordValid : ''
                                            : (name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase()) && field.value.toString().length >= 8
                                            ? name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() ? en.authErrorMessage.validPassRegex : name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() ? en.authErrorMessage.newPassword : name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase() ? en.authErrorMessage.currentPassword : ''
                                            : name == en.email
                                            ? en.authErrorMessage.emailError
                                            : name == en.firstName || name == en.lastName
                                            ? en.authErrorMessage.validCharacters
                                            : `The ${name.toLowerCase()} field must be a valid ${name.toLowerCase()}`;
                                    }
                                }else {
                                    if (!regex.test(field.value)) {
                                        valid = false;
                                        field.error =
                                            (name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase()) && field.value.toString().length < 8
                                            ? name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() ? en.authErrorMessage.passwordValid : name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() ? en.authErrorMessage.newPasswordValid : name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase() ? en.authErrorMessage.currentPasswordValid : ''
                                            : (name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() || name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase()) && field.value.toString().length >= 8
                                            ? name?.toLocaleLowerCase() == en?.password?.toLocaleLowerCase() ? en.authErrorMessage.validPassRegex : name?.toLocaleLowerCase() === en?.newPassword?.toLocaleLowerCase() ? en.authErrorMessage.newPassword : name?.toLocaleLowerCase() === en?.currentPassword?.toLocaleLowerCase() ? en.authErrorMessage.currentPassword : ''
                                            : name == en.email
                                            ? en.authErrorMessage.emailError
                                            : name == en.firstName || name == en.lastName
                                            ? en.authErrorMessage.validCharacters
                                            : `The ${name.toLowerCase()} field must be a valid ${name.toLowerCase()}`;
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
                            if(event !== null){
                                if (event.target.value.trim().toString().length < min) {
                                    valid = false;
                                    field.error = 
                                    name === en.phoneNumber
                                    ? en.companyErrorMessage.phoneNumberValid
                                    :`The ${name.toLowerCase()} field must be at least ${min} ${typeMsg}`
                                }
                            }else {
                                if (field.value.toString().length < min) {
                                    valid = false;
                                    field.error = 
                                    name === en.phoneNumber
                                    ? en.companyErrorMessage.phoneNumberValid
                                    :`The ${name.toLowerCase()} field must be at least ${min} ${typeMsg}`
                                }
                            }
                        }
                    }
                    // MAX
                    if (rules.filter((x) => x.includes("max")).length && valid) {
                        let ind = rules.findIndex((x) => x.includes("max"));
                        if (ind !== -1) {
                            let max = Number(rules[ind].split(":").pop());
                            if(event !== null){
                                if (event.target.value.trim().toString().length > max) {
                                    valid = false;
                                    field.error = `${name} must be less than ${max} ${typeMsg}`;
                                }
                            } else {
                                if (field.value.toString().length > max) {
                                    valid = false;
                                    field.error = `${name} must be less than ${max} ${typeMsg}`;
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
                                if(event !== null){
                                    if (event.target.value.trim() !== confirm) {
                                        valid = false;
                                        field.error = `${en.authErrorMessage.confirmPasswordValid}`;
                                    }
                                } else {
                                    if (field.value !== confirm) {
                                        valid = false;
                                        field.error = `${en.authErrorMessage.confirmPasswordValid}`;
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

    function checkAllFields(formData) {
        return new Promise((resolve, reject) => {
            try {
                let valid = true;
                Object.keys(formData).forEach((key) => {
                    checkErrors({'field':formData[key],'name':formData[key].name,'validations':formData[key].rules,'type':formData[key].type}).then((res) => {
                        if(res === false) {
                            valid = false;
                        }
                    })
                    .catch((error) => {
                        console.error("ERROR in check validation: ", error);
                    })
                });
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