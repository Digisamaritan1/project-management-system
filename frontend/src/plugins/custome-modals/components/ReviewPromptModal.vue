<template>
    <transition name="fade-scale">
        <ModalComponent v-model="visible" :title="cfg?.name || 'Review Request'" bodyClasses='m-0 p-0' :styles="`border-radius:${cfg?.modalConfig?.borderRadius || '12px'};max-width:${cfg?.modalConfig?.maxWidth || '400px'} !important;width:${cfg?.modalConfig?.width || '400px'} !important`" :cancelButton="false" :acceptButton="false" :header="false"  :footer="false" :closeOnBackdrop="false"
            @close="setLaterCookie(cfg._id, cfg.type);visible = false">
            <template #body>
                <div v-html="cfg?.body" />
            </template>
        </ModalComponent>
    </transition>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import ModalComponent from '@/components/atom/Modal/Modal.vue';
import { apiRequestWithoutCompnay } from '@/services';
import { setLaterCookie, shouldShowModal,removeLaterCookie } from './cookie.js';
import { useToast } from 'vue-toast-notification';
import * as env from '@/config/env';

const $toast = useToast();
const userId = ref(localStorage.getItem('userId'));

const visible = ref(false);
const cfg     = ref(null);
const disableBtn = ref(false);

async function gate (modalRow) {

    const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const { _id: modalId } = modalRow;
    if(!userId.value) return;

    if (!shouldShowModal(modalId,modalRow.type)) return;

    const { data: u } = await apiRequestWithoutCompnay('get', `${env.USER_UPATE}/${userId.value}`);
    if (!u.isProductOwner) return;

    const { data: g } = await apiRequestWithoutCompnay('get', `${env.CUSTOME_MODALS}/checkUserReviewWithModal?modalId=${modalId}`);
    if (!g.showModal) return;

    cfg.value   = modalRow;

    await timeout(5000);
    visible.value = true;
}

watch(visible, async (isVisible) => {
    if (isVisible) {
        await nextTick();
        attachEvent();
    }
});

function attachEvent() {
    if(cfg.value?.modalConfig?.modalId) {
        const modal = document.querySelector(`.${cfg.value.modalConfig.modalId}`);
        if (!modal) return;
        
        modal?.removeEventListener('click', handleModalClick);
        
        modal?.addEventListener('click', handleModalClick);
    }
}

function handleModalClick(event) {
    if(disableBtn.value === true) {
        return;
    }
    const target = event.target;
    const btnConfig = cfg.value?.btnFunctions?.find(btn => btn.id === target.id);

    if (btnConfig) {
        event.preventDefault();
        onBtn(btnConfig);
    }
}

async function onBtn (b) {
    if (b.action === 'submit_review') await submitReview(cfg.value._id, cfg.value.type);
    if (b.action === 'later') setLaterCookie(cfg.value._id,cfg.value.type);
    if (b.emitEvent === 'close') visible.value = false;
    if(cfg.value?.modalConfig?.modalId) {
        const modal = document?.querySelector(`.${cfg.value.modalConfig.modalId}`);
        modal?.removeEventListener('click', handleModalClick);
    }

    if (b.emitEvent === 'accept' && b.action === 'custome_handle' && b.params) {
        //Handle Custom succes event here
        try {
            disableBtn.value = true;
            await apiRequestWithoutCompnay('post', `${env.CUSTOME_MODALS}/submitButtonHandle`, {modalId:cfg.value._id,params: cfg.value.params});
            disableBtn.value = false;
        } catch (error) {
            visible.value = false
            disableBtn.value = false;
        }
    }
}
async function submitReview (modalId, type) {
    try {
        disableBtn.value = true;
        await apiRequestWithoutCompnay('post',`${env.CUSTOME_MODALS}/addReview`,{
            modalId,
            status:'pending',
            review:'User claims review submitted'
        });
        removeLaterCookie(modalId,type);
        if(type === 'Promotional') {
            setLaterCookie(cfg.value._id,cfg.value.type);
        }
        visible.value = false;
        disableBtn.value = false;
    } catch (error) {
        $toast.error("Some thing went wronge",{position: 'top-right'})
        disableBtn.value = false;
        visible.value = false;
    }
}
onMounted(async () => {
    if(!userId.value) return;
    const { data: modalData } = await apiRequestWithoutCompnay('get', `${env.CUSTOME_MODALS}/getReviewModalConfig`);
    if (modalData.result && modalData.result.length) {
        let transactionalArrayModal = modalData.result.filter((e)=>e.type === 'Transactional') ?? [];
        let promotionalArrayModal = modalData.result.filter((e)=>e.type === 'Promotional') ?? [];
        for (const modalRow of [...transactionalArrayModal,...promotionalArrayModal]) {
            await gate(modalRow);
            if (visible.value) break;
        }
    }
});
</script>

<style>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity .5s ease, transform .5s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to   { opacity:0; transform:scale(.9); }
.fade-scale-enter-to,
.fade-scale-leave-from { opacity:1; transform:scale(1); }
</style>