<template>
    <div>
        <div class="scrollable-area-for-card common-scrollbar overflow-auto style-scroll-2-px">
            <div class="form-check" v-for="(item, index) in paymentSorceList" :key="item.id">
                <input type="radio" class="form-check-input" :id="item.id" @input="checked(index+1)" :name="item.id" :value="index+1" v-model="selectedCardNumber">
                <label class="form-check-label font-size-14 gray81 font-weight-500" :for="item.id">{{$t('Card.pay_with')}} {{item.card.masked_number}}</label>
            </div>
        </div>
        <div class="form-check border-0">
            <input type="radio" class="form-check-input" :disabled="billingSpinner" id="radio-new" @input="checked('0')" value="0" v-model="selectedCardNumber"> 
            <label class="form-check-label font-size-14 gray81 font-weight-500 mb-20px" for="radio-new">{{$t('Card.add_new_card')}}</label>
        </div>
        <div class="add__card-fieldset card__detail-wrapper" v-if="selectedCardNumber == '0'">
            <div class="add__card-field">                  
                <input class="add__card-input" :class="{'val': firstName}" type="text" :disabled="billingSpinner" placeholder="Enter name" v-model="firstName">
                <label class="ex1-label">{{$t('Card.name_on_card')}}</label><i class="ex1-bar"></i>
            </div>
            <CardComponent ref="cardRef" class="fieldset field" 
                :styles="styles" 
                :classes="classes" 
                :locale="locale" 
                :placeholder="placeholder" 
                :fonts="fonts"
            >
                <div class="add__card-field">
                    <CardNumber class="add__card-input" />
                    <label class="ex1-label">{{$t('Card.card_number')}}</label><i class="ex1-bar"></i>
                </div>
                <div class="add__card-fields">
                    <div class="add__card-field">
                        <CardExpiry class="add__card-input"/>
                        <label class="ex1-label">{{$t('Card.expiry')}}</label><i class="ex1-bar"></i>
                    </div>
                    <div class="add__card-field">
                        <CardCvv class="add__card-input"/>
                        <label class="ex1-label">{{$t('Card.cvc')}}</label><i class="ex1-bar"></i>
                    </div>
                </div>
            </CardComponent>
        </div>
    </div>
</template>
<script setup>
    import {
        defineProps,
        ref,
        defineEmits,
        watch
    } from 'vue';
    import { CardComponent, CardNumber, CardExpiry, CardCvv } from '@chargebee/chargebee-js-vue-wrapper';
    import { apiRequest } from '@/services';
    import { useToast } from "vue-toast-notification";
    import env from '@/config/env.js'
    import { useI18n } from "vue-i18n";

    const $toast = useToast();
    const { t } = useI18n();
    const cardRef = ref(null)
    const props = defineProps({
        paymentSorceList: {
            type: Array,
            default: () => []
        },
        selectedCard: {
            type: String
        },
        addCardClick: {
            type: Boolean,
        },
        billingSpinner: {
            type: Boolean
        }
    })
    watch(() => props.addCardClick, (val) => {
        if (val) {
            tokenize();
        }
    })
    const styles = ref({
        base: {
            color: '#333',
            fontWeight: '500',
            fontFamily: 'Lato, Segoe UI, Helvetica Neue, sans-serif',
            fontSize: '16px',
            fontSmoothing: 'antialiased',
            ':focus': {
                color: '#424770',
            },
            '::placeholder': {
                color: 'transparent',
            },
            ':focus::placeholder': {
                color: '#7b808c',
            },
        },
        invalid: {
            color: '#e41029',

            ':focus': {
                color: '#e44d5f',
            },
            '::placeholder': {
                color: '#FFCCA5',
            },
        }
    });
    const classes = ({
        focus: 'focus',
        invalid: 'invalid',
        empty: 'empty',
        complete: 'complete',
    });

    // Fonts
    const fonts = ref([
        "https://fonts.googleapis.com/css?family=Lato:400,700"
    ]);

    // Custom placeholders
    const placeholder = ref({
        number: "4111 1111 1111 1111",
        cvv: "CVV",
        expiry: "MM / YY",
    });

    // locale
    const locale = ref("en");
    const firstName = ref("");
    const selectedCardNumber = ref(props.selectedCard)
    const emits = defineEmits(["selectCard","cardTokenize"]);
    function checked(card) {
        emits("selectCard",card.toString());
    }

    function tokenize() {
        cardRef.value.tokenize().then((data) => {
            apiRequest("post",env.CREATE_PAYMENT_SOURCE_CHARGEBEE, {
                tokenId: data.token
            }).then((resp) => {
                if(resp.data.status) {
                    emits("cardTokenize",true,resp.data.payment_source.id,resp.data.payment_source);
                } else {
                    emits("cardTokenize",false);
                    $toast.error(t('Toast.Something_went_wrong_Please_try_again'),{position: 'top-right'});
                }
            })
            .catch((error) => {
                console.error(error);
                emits("cardTokenize",false);
                $toast.error(t('Toast.Something_went_wrong_Please_try_again'),{position: 'top-right'});
            })
        }).catch((error) => {
            console.error(error);
            emits("cardTokenize",false);
            if (error.message == 'Invalid card') {
                $toast.error(t('Toast.Invalid_Card_Details_Please_check_and_try_again'),{position: 'top-right'});
            } else if(error.message == 'Expired card') {
                $toast.error(t('Toast.Expired_Card_Please_check_and_try_again'),{position: 'top-right'});
            } else if (error.message == 'Invalid card verification code (CVC).') {
                $toast.error(t('Toast.Invalid_card_verification_code_(CVC)_Please_check_and_try_again'),{position: 'top-right'});
            }else {
                $toast.error(t('Toast.Something_went_wrong_Please_try_again'),{position: 'top-right'});
            }
        });
    }
</script>
<style scoped>
    *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        outline: none;
    }
    a{
        cursor: pointer;
        color: inherit;  
        text-decoration: none;
        border-bottom: 1px dotted;
    }

    .ex1.container {
        margin: auto;
    }
    .ex1-wrap{
        max-width: 400px;
        margin: auto;
        border-radius: 8px;
        background: #fff;
        padding: 20px 10px;
    }
    .add__card-field{
        position: relative;
        margin-bottom: 30px;
    }
    .add__card-fields{
        display: flex;
        margin-left: -16px;
    }
    .add__card-fields .add__card-field{
        flex: 1;    
        margin-left: 16px;
    }
    .ex1-label{  
        font-size: 12px;
        font-weight: 500;  
        color: #7b808c;
        position: absolute;
        top: 0.25rem;
        pointer-events: none;
        padding-left: 0.125rem;
        z-index: 1;  
        font-weight: normal;
        -webkit-transition: all 0.28s ease;
        transition: all 0.28s ease;
        margin: 0;
    }
    .add__card-input{
        width: 100%;
        display: block;
        background: transparent;
        border-radius: 0;
        border: none;
        padding-bottom: 10px;
        border-width: 0;
        border-color: transparent;
        color: #424772;
        font-size: 14px;
        font-family: inherit;
        font-weight: 200;
        transition: .2s;
        line-height: 21px;
        cursor: text;
        -webkit-transition: all 0.28s ease;
        transition: all 0.28s ease;
        box-shadow: none;
    }
    .add__card-input::placeholder{
        color: transparent;
    }
    .add__card-input:focus::placeholder{
        color: #818181;
        font-weight: 200;
    }
    .add__card-input:focus ~ .ex1-label,
    .add__card-input.focus ~ .ex1-label,
    .add__card-input.val ~ .ex1-label,
    .add__card-input.complete ~ .ex1-label,
    .add__card-input.invalid ~ .ex1-label{
        font-size: 0.8rem;
        color:#7b808c;
        top: -1rem;
        left: 0;
    }
    .ex1-bar{
        position: relative;
        border-bottom: 0.0625rem solid #999;
        display: block;
    }
    .ex1-bar::before {
        content: '';
        height: 0.125rem;
        width: 0;
        left: 50%;
        bottom: -0.0625rem;
        position: absolute;
        background: #2f3990;
        -webkit-transition: left 0.28s ease, width 0.28s ease;
        transition: left 0.28s ease, width 0.28s ease;
        z-index: 2;
    }
    .add__card-input:focus ~ .ex1-bar::before,
    .add__card-input.focus ~ .ex1-bar::before{
        width: 100%;
        left: 0;
    }
    .ex1-button{
        background: #2f3990;
        background: #2f3990;
        color: #fff;
        font-size: 16px;
        font-family: inherit;
        border: none;
        border-radius: 4px;  
        padding: 12px 20px;
        display: block;
        width: 100%;
        letter-spacing: .5px;
        transition: .2s;
        cursor: pointer;
    }
    .ex1-button:hover,
    .ex1-button:focus{
        background: #0641a7;
        background: #0a0b9a;
    }
    .ex1-button.submit {
        background-image: url(data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnLWxvYWRlciIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTUiIGhlaWdodD0iNTUiIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTQwIDcyQzIyLjQgNzIgOCA1Ny42IDggNDBTMjIuNCA4IDQwIDhzMzIgMTQuNCAzMiAzMmMwIDEuMS0uOSAyLTIgMnMtMi0uOS0yLTJjMC0xNS40LTEyLjYtMjgtMjgtMjhTMTIgMjQuNiAxMiA0MHMxMi42IDI4IDI4IDI4YzEuMSAwIDIgLjkgMiAycy0uOSAyLTIgMnoiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZVR5cGU9InhtbCIgYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgNDAgNDAiIHRvPSIzNjAgNDAgNDAiIGR1cj0iMC42cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L3BhdGg+PC9zdmc+);
        background-position: 50%;
        background-repeat: no-repeat;
        background-size: 20px;
        color: transparent!important;
        transition-duration: 0s;
    }
    .token {
        color: #555;
        padding: 10px;
        text-align: center;
        font-weight: 500;
    }
    .error {
        color: #e41029;
        padding: 10px;
        text-align: center;
        font-weight: 500;
    }
</style>