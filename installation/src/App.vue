<template>	
    <div class="overflow-data h-100vh">
        <router-view/>
    </div>
</template>
<script setup>
// PACKAGES
import { defineComponent, provide } from 'vue'
import axios from 'axios'
// COMPONENT
defineComponent({
	name: 'App',

	components: {
	}
})

provide("$axios", axios);
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0px;
}

</style>
