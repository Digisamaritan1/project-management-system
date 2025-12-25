<template>
    <div class="d-flex justify-content-end flex-wrap auth-template-wrapper w-100 h-100" :class="{'flex-column justify-content-center': clientWidth <= 767}">
		<div class="bg-blue white auth-template-left p-4 position-re back__image-wrapper" v-if="clientWidth > 767">
			<div class="d-flex">
				<div>
					<h1 class="auth-title">{{$t('Auth.ltitle')}}</h1>
				</div>
				<img :src="paperPlaneImage" alt="paper_plane" class="paper_plane">
			</div>
			<img :src="circlesImage" alt="circles image" class="auth-image-circle">
			<img :src="projectsImage" alt="projects image" class="auth-image-bg"  v-if="clientWidth <= 1024">
		</div>
		<div class="auth-template-right border-left bg-white d-flex" :class="{'align-items-center': clientWidth > 765, 'flex-column': clientWidth <= 765}">
			<h1 class="auth-title bg-blue" v-if="clientWidth <= 765">{{$t('Auth.ltitle')}}</h1>
			<div class="d-flex flex-column authetication-container w-100">
				<router-link class="light-purple font-weight-500" to="/" v-if="$route.name !== 'Create_Company'">
					<img :src="logoImage" alt="logo image" class="logo-image" :class="{'align-self-center': clientWidth <= 767}">
				</router-link>
				<template v-else>
					<img :src="logoImage" alt="logo image" class="logo-image" :class="{'align-self-center': clientWidth <= 767}">
				</template>
				<slot>
					RIGHT
				</slot>
			</div>
		</div>
	</div>
</template>

<script setup>
// PACKAGES
import { defineComponent, inject } from "vue";

// IMAGES
const paperPlaneImage = require("@/assets/images/svg/auth-arrow.svg");
const projectsImage = require("@/assets/images/login-banner.png");
const circlesImage = require("@/assets/images/svg/bottomimg.svg");
const logoImage = "/api/v1/getlogo?key=logo&type=admin";

const clientWidth = inject("$clientWidth");

defineComponent({
  name: "Authentication-Template"
});
</script>

<style>
@import "./style.css"
</style>