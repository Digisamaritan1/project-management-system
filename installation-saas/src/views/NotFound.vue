<template>
    <div class="d-flex align-items-center justify-content-center flex-column text-center not__found-component">
        <img src="@/assets/images/svg/404img.svg" alt="aliansoftware" class="w-auto mw-100" />
        <div class="error-text">
            <h3>Opps, page not found</h3>
            <p>We are very sorry for the inconvenience. It looks like you’re trying to access a page that has been deleted or never even existed.</p>
        </div>
    </div>
</template>
<script>
export default {
    name: "NotFound",
};
</script>
<style scoped>
.not__found-component{
    height:calc(100% - 50px);
}
</style>