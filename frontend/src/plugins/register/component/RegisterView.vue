<template>
    <div class="create-accountlink text-center">
        <span class="font-roboto-sans font-weight-normal font-weight-400 gray">
            {{$t('Auth.NotR')}}?
            <router-link @click="handleClick" :style="[{'pointer-events' : props.isSpinner ? 'none' : ''}]" to="/signup" class="light-purple font-weight-500">
                {{$t('Auth.createAcc')}}
            </router-link>
        </span>
    </div>
</template>
<script setup>
    import {defineProps,defineEmits} from "vue";
    const props = defineProps({
        isSpinner: {
            type: Boolean,
            default: false
        }
    });
    const emits = defineEmits('handleChange');

    const handleClick = () => {
        emits('handleChange');
    }
</script>