<template>
    <div>
        <div class="checkout-container-1"></div>
    </div>
</template>
<script setup>
    /* eslint-disable */
    import {onMounted} from 'vue';
    
    onMounted(()=>{
        if (process.env.VUE_APP_ENVIRONMENT !== "production") {
            Paddle.Environment.set("sandbox"); // Remove When Move To Production
        }
        Paddle.Initialize({
            token: process.env.VUE_APP_PADDLE_CLIENT_TOKEN,
            eventCallback: function(data) {
                if (data.name == 'checkout.closed') {
                    // router.push({name: 'Home',query: {}})
                    window.location.href = window.location.origin
                }
            }
        });
    })
</script>