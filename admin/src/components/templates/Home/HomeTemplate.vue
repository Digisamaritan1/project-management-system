<template>
    <div class="w-100 h-100 d-flex style-scroll">
        <div class="main-left_sidebar">
            <slot name="leftSide">
            </slot>
        </div>
        <div class="w-100 h-100 main-right_body">
            <slot name="rightSide">
            </slot>
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="css" src="./style.css">
</style>